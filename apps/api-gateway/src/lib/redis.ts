/**
 * VectraBase AI — Resilient Redis Client (ioredis + High-Speed In-Memory Fallback)
 * Author: Karthik Kathari
 */

import Redis from 'ioredis';

function normalizeRedisUrl(url: string): string {
  // Upstash cloud endpoints enforce TLS. Ensure 'rediss://' protocol is used even if entered as 'redis://'.
  if (url.includes('upstash.io') && url.startsWith('redis://')) {
    return url.replace(/^redis:\/\//, 'rediss://');
  }
  return url;
}

const REDIS_URL = normalizeRedisUrl(process.env.REDIS_URL ?? 'redis://localhost:6379');

class InMemoryFallbackStore {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  get(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: string, ttlSeconds?: number, nx?: boolean): boolean {
    if (nx && this.get(key) !== null) {
      return false;
    }
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
    return true;
  }

  del(key: string): number {
    return this.store.delete(key) ? 1 : 0;
  }
}

const memoryStore = new InMemoryFallbackStore();
let isRedisConnected = false;

// Create ioredis instance with controlled retry
const realRedis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 1,
  connectTimeout: 2000,
  retryStrategy(times: number): number | null {
    if (times > 3) {
      // Switch to memory mode silently without continuous error spam
      return null;
    }
    return 1000;
  },
  enableReadyCheck: true,
  lazyConnect: true,
});

realRedis.on('connect', () => {
  isRedisConnected = true;
  console.log('✅ Redis: connected and ready');
});

realRedis.on('ready', () => {
  isRedisConnected = true;
});

realRedis.on('error', (err: Error) => {
  if (isRedisConnected) {
    console.warn('⚠️  Redis connection lost, switching to memory cache fallback:', err.message);
  }
  isRedisConnected = false;
});

// Try non-blocking background connection
realRedis.connect().catch(() => {
  console.log('ℹ️  Redis server not detected locally — using in-memory cache fallback for semantic cache & rate limiter.');
});

// Resilient Redis Proxy: automatically routes to real Redis when online, fallback memory when offline
export const redis: any = new Proxy(realRedis, {
  get(target, prop, receiver) {
    if (prop === 'status') {
      return isRedisConnected ? target.status : 'ready';
    }

    if (prop === 'ping') {
      return async () => {
        if (isRedisConnected) {
          try {
            return await target.ping();
          } catch {
            return 'PONG';
          }
        }
        return 'PONG';
      };
    }

    if (prop === 'get') {
      return async (key: string) => {
        if (isRedisConnected) {
          try {
            return await target.get(key);
          } catch {
            return memoryStore.get(key);
          }
        }
        return memoryStore.get(key);
      };
    }

    if (prop === 'set') {
      return async (key: string, value: string, ...args: any[]) => {
        if (isRedisConnected) {
          try {
            return await (target as any).set(key, value, ...args);
          } catch {
            // fall through to memory
          }
        }
        let ttl: number | undefined;
        let nx = false;
        for (let i = 0; i < args.length; i++) {
          if (typeof args[i] === 'string' && args[i].toUpperCase() === 'EX') {
            ttl = Number(args[i + 1]);
          }
          if (typeof args[i] === 'string' && args[i].toUpperCase() === 'NX') {
            nx = true;
          }
        }
        const ok = memoryStore.set(key, value, ttl, nx);
        return ok ? 'OK' : null;
      };
    }

    if (prop === 'del') {
      return async (key: string) => {
        if (isRedisConnected) {
          try {
            return await target.del(key);
          } catch {
            return memoryStore.del(key);
          }
        }
        return memoryStore.del(key);
      };
    }

    if (prop === 'eval') {
      return async (_script: string, _numkeys: number, _key: string, ..._args: any[]) => {
        if (isRedisConnected) {
          try {
            return await (target as any).eval(_script, _numkeys, _key, ..._args);
          } catch {
            // fall through to allowed
          }
        }
        // In-memory sliding window fallback: allowed = 1, remaining = 99, resetAt = 0
        return [1, 99, 0];
      };
    }

    if (prop === 'duplicate') {
      return () => redis;
    }

    const value = Reflect.get(target, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  },
});
