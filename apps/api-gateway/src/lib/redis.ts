/**
 * VectraBase AI — ioredis Singleton Client
 * Author: Karthik Kathari
 */

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number): number | null {
    if (times > 10) {
      console.error('❌ Redis: exceeded max reconnection attempts');
      return null; // stop retrying
    }
    const delay = Math.min(times * 100, 3000);
    console.warn(`⚠️  Redis: reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('connect', () => {
  console.log('🔄 Redis: connecting...');
});

redis.on('ready', () => {
  console.log('✅ Redis: connected and ready');
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis error:', err.message);
});

redis.on('close', () => {
  console.warn('⚠️  Redis: connection closed');
});

redis.on('reconnecting', () => {
  console.warn('🔄 Redis: reconnecting...');
});

redis.on('end', () => {
  console.warn('🔌 Redis: connection ended');
});
