import { Redis } from 'ioredis';
import { subscriptionService } from './subscriptionService';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const planLimits: Record<string, RateLimitConfig> = {
  basic: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  pro: {
    windowMs: 60 * 1000,
    maxRequests: 120, // 120 requests per minute
  },
  enterprise: {
    windowMs: 60 * 1000,
    maxRequests: 300, // 300 requests per minute
  },
};

export class RateLimitService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  private getKey(userId: string, endpoint: string): string {
    return `ratelimit:${userId}:${endpoint}`;
  }

  async checkRateLimit(userId: string, endpoint: string): Promise<{
    isAllowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    try {
      const subscriptionResponse = await subscriptionService.getCurrentSubscription(userId);
      const subscription = subscriptionResponse.data;
      const limit = planLimits[subscription.tier] || planLimits.basic;
      const key = this.getKey(userId, endpoint);

      const now = Date.now();
      const windowStart = now - limit.windowMs;

      // Get current count and remove expired entries
      const multi = this.redis.multi();
      multi.zremrangebyscore(key, 0, windowStart);
      multi.zcard(key);
      multi.zadd(key, now, `${now}`);
      multi.expire(key, Math.ceil(limit.windowMs / 1000));

      const [, count] = await multi.exec() as [any, number];

      const remaining = Math.max(0, limit.maxRequests - count);
      const resetTime = now + limit.windowMs;

      return {
        isAllowed: count < limit.maxRequests,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request if rate limiting fails
      return {
        isAllowed: true,
        remaining: 0,
        resetTime: Date.now() + 60000,
      };
    }
  }

  async getRateLimitInfo(userId: string, endpoint: string): Promise<{
    limit: number;
    remaining: number;
    resetTime: number;
  }> {
    try {
      const subscriptionResponse = await subscriptionService.getCurrentSubscription(userId);
      const subscription = subscriptionResponse.data;
      const limit = planLimits[subscription.tier] || planLimits.basic;
      const key = this.getKey(userId, endpoint);

      const now = Date.now();
      const windowStart = now - limit.windowMs;

      const count = await this.redis.zcount(key, windowStart, '+inf');
      const remaining = Math.max(0, limit.maxRequests - count);
      const resetTime = now + limit.windowMs;

      return {
        limit: limit.maxRequests,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error('Rate limit info check failed:', error);
      return {
        limit: planLimits.basic.maxRequests,
        remaining: 0,
        resetTime: Date.now() + 60000,
      };
    }
  }
}

export const rateLimitService = new RateLimitService(); 