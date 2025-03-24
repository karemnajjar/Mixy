import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { RateLimitError } from './errors';

interface RateLimitConfig {
  limit: number;
  window: string; // e.g., '1m', '1h', '1d'
  keyPrefix?: string;
}

export class RateLimiter {
  private redis: Redis;
  private limit: number;
  private window: number;
  private keyPrefix: string;

  constructor(config: RateLimitConfig) {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    });
    this.limit = config.limit;
    this.window = this.parseWindow(config.window);
    this.keyPrefix = config.keyPrefix || 'ratelimit';
  }

  private parseWindow(window: string): number {
    const value = parseInt(window);
    const unit = window.slice(-1);
    const multiplier = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    }[unit] || 1;
    return value * multiplier;
  }

  private getKey(identifier: string): string {
    return `${this.keyPrefix}:${identifier}`;
  }

  async check(identifier: string): Promise<{
    success: boolean;
    remaining: number;
    reset: number;
  }> {
    const key = this.getKey(identifier);
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - this.window;

    // Clean old requests and add new request
    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, { score: now, member: now });
    pipeline.zcard(key);
    pipeline.expire(key, this.window);
    const [, , count] = await pipeline.exec();

    const remaining = Math.max(0, this.limit - (count as number));
    const reset = now + this.window;

    return {
      success: remaining > 0,
      remaining,
      reset,
    };
  }
}

// Middleware factory for rate limiting
export function createRateLimiter(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  return async function rateLimitMiddleware(
    req: NextRequest,
    next: () => Promise<Response>
  ) {
    const identifier = req.ip || 'anonymous';
    const { success, remaining, reset } = await limiter.check(identifier);

    if (!success) {
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(
          reset - Date.now() / 1000
        )} seconds`
      );
    }

    const response = await next();
    response.headers.set('X-RateLimit-Limit', config.limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    return response;
  };
} 