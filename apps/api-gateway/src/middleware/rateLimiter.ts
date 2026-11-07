/**
 * VectraBase AI — Redis Sliding-Window Rate Limiter (Lua Script)
 * Author: Karthik Kathari
 *
 * Implements a Redis ZSET-based sliding window per tenant+IP combination.
 * Returns 429 Too Many Requests with standard rate limit headers when exceeded.
 */

import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';

// Lua script: sliding-window rate limiter using sorted sets
const SLIDING_WINDOW_LUA = `
local key        = KEYS[1]
local limit      = tonumber(ARGV[1])
local window     = tonumber(ARGV[2])
local now        = tonumber(ARGV[3])
local clearBefore = now - window

-- Remove all entries outside the sliding window
redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)

local count = redis.call('ZCARD', key)

if count < limit then
  -- Add current request with a unique member (now + random suffix)
  redis.call('ZADD', key, now, now .. ':' .. math.random(1, 1000000))
  redis.call('EXPIRE', key, math.ceil(window / 1000))
  return {1, limit - count - 1, 0}
else
  -- Return the timestamp of oldest entry to calculate reset time
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local resetAt = tonumber(oldest[2]) + window
  return {0, 0, resetAt}
end
`.trim();

export interface RateLimiterOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Key prefix (default: 'rl') */
  keyPrefix?: string;
}

/**
 * Creates a Redis sliding-window rate limiter middleware.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { limit, windowMs, keyPrefix = 'rl' } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Build a composite key: prefix:tenantId:ip
    const tenantId = req.user?.tenantId ?? 'anon';
    const ip = (req.ip ?? req.socket.remoteAddress ?? 'unknown').replace(/::ffff:/, '');
    const key = `${keyPrefix}:${tenantId}:${ip}`;
    const now = Date.now();

    try {
      const result = (await redis.eval(
        SLIDING_WINDOW_LUA,
        1,
        key,
        String(limit),
        String(windowMs),
        String(now),
      )) as [number, number, number];

      const [allowed, remaining, resetAt] = result;

      // Set standard rate limit response headers
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
      res.setHeader('X-RateLimit-Reset', resetAt > 0 ? Math.ceil(resetAt / 1000) : Math.ceil((now + windowMs) / 1000));
      res.setHeader('X-RateLimit-Policy', `${limit};w=${windowMs / 1000}`);

      if (allowed === 1) {
        next();
      } else {
        const retryAfterMs = resetAt - now;
        const retryAfterSec = Math.ceil(retryAfterMs / 1000);

        res.setHeader('Retry-After', retryAfterSec);
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please slow down.',
            retryAfterSeconds: retryAfterSec,
          },
        });
      }
    } catch (err) {
      // Fail open: if Redis is unavailable, allow the request
      console.error('[RateLimiter] Redis eval failed — failing open:', err);
      next();
    }
  };
}

// ─── Pre-built Limiters ───────────────────────────────────────────────────────

/** Default API rate limiter: 100 req/min */
export const defaultRateLimiter = createRateLimiter({
  limit: 100,
  windowMs: 60_000,
  keyPrefix: 'rl:api',
});

/** Auth endpoint limiter: 10 req/min (brute-force protection) */
export const authRateLimiter = createRateLimiter({
  limit: 10,
  windowMs: 60_000,
  keyPrefix: 'rl:auth',
});

/** Query/RAG limiter: 30 req/min */
export const queryRateLimiter = createRateLimiter({
  limit: 30,
  windowMs: 60_000,
  keyPrefix: 'rl:query',
});

export const rateLimiter = queryRateLimiter;
