import { z } from 'zod';
import { Logger } from '../monitoring/logger';
import { ErrorService, ErrorCategory, ErrorSeverity } from './error-service';
import { Redis } from 'ioredis';
import { LoggingService } from './logging-service';
import NodeCache from 'node-cache';
import { createClient } from 'redis';

// Cache Configuration Schema
export const CacheConfigSchema = z.object({
  type: z.enum(['memory', 'redis', 'cdn']),
  ttl: z.number(), // in seconds
  maxSize: z.number().optional(), // in bytes
  compression: z.boolean().optional(),
  namespace: z.string().optional(),
  options: z.record(z.unknown()).optional()
});

// Cache Entry Schema
export const CacheEntrySchema = z.object({
  key: z.string(),
  value: z.unknown(),
  ttl: z.number().optional(),
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    hits: z.number(),
    size: z.number().optional(),
    tags: z.array(z.string()).optional()
  }).optional()
});

export type CacheConfig = z.infer<typeof CacheConfigSchema>;
export type CacheEntry = z.infer<typeof CacheEntrySchema>;

export class CacheService {
  private readonly logger: Logger;
  private readonly errorService: ErrorService;
  private readonly loggingService: LoggingService;
  private readonly memoryCache: NodeCache;
  private readonly redis: Redis;
  private readonly config: CacheConfig;

  constructor(config: CacheConfig) {
    this.logger = new Logger();
    this.errorService = new ErrorService();
    this.loggingService = new LoggingService();
    this.config = CacheConfigSchema.parse(config);

    // Initialize memory cache
    this.memoryCache = new NodeCache({
      stdTTL: this.config.ttl,
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false
    });

    // Initialize Redis cache
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
  }

  // Cache Operations
  public async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(key);

      // Try memory cache first
      if (this.config.type === 'memory') {
        const value = this.memoryCache.get<T>(cacheKey);
        if (value) {
          await this.updateMetadata(key, 'hit');
          return value;
        }
      }

      // Try Redis cache
      if (this.config.type === 'redis') {
        const value = await this.redis.get(cacheKey);
        if (value) {
          const parsedValue = JSON.parse(value);
          await this.updateMetadata(key, 'hit');
          return parsedValue as T;
        }
      }

      await this.updateMetadata(key, 'miss');
      return null;
    } catch (error) {
      throw this.errorService.createError(
        'CACHE_GET_FAILED',
        ErrorCategory.CACHE,
        ErrorSeverity.ERROR,
        'Failed to get value from cache',
        { key, error }
      );
    }
  }

  public async set<T>(
    key: string,
    value: T,
    options?: Partial<CacheEntry>
  ): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);
      const entry: CacheEntry = {
        key: cacheKey,
        value,
        ttl: options?.ttl || this.config.ttl,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          hits: 0,
          size: this.calculateSize(value),
          tags: options?.metadata?.tags
        }
      };

      CacheEntrySchema.parse(entry);

      // Store in memory cache
      if (this.config.type === 'memory') {
        this.memoryCache.set(cacheKey, value, entry.ttl);
      }

      // Store in Redis cache
      if (this.config.type === 'redis') {
        await this.redis.set(
          cacheKey,
          JSON.stringify(entry),
          'EX',
          entry.ttl
        );
      }

      await this.logAudit('set', 'cache', key, {
        type: this.config.type,
        ttl: entry.ttl
      });
    } catch (error) {
      throw this.errorService.createError(
        'CACHE_SET_FAILED',
        ErrorCategory.CACHE,
        ErrorSeverity.ERROR,
        'Failed to set value in cache',
        { key, error }
      );
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);

      // Delete from memory cache
      if (this.config.type === 'memory') {
        this.memoryCache.del(cacheKey);
      }

      // Delete from Redis cache
      if (this.config.type === 'redis') {
        await this.redis.del(cacheKey);
      }

      await this.logAudit('delete', 'cache', key);
    } catch (error) {
      throw this.errorService.createError(
        'CACHE_DELETE_FAILED',
        ErrorCategory.CACHE,
        ErrorSeverity.ERROR,
        'Failed to delete value from cache',
        { key, error }
      );
    }
  }

  public async invalidateByTag(tag: string): Promise<void> {
    try {
      if (this.config.type === 'redis') {
        const keys = await this.redis.keys(`*:${tag}:*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      await this.logAudit('invalidate', 'cache', tag, {
        type: 'tag',
        count: keys?.length
      });
    } catch (error) {
      throw this.errorService.createError(
        'CACHE_INVALIDATE_FAILED',
        ErrorCategory.CACHE,
        ErrorSeverity.ERROR,
        'Failed to invalidate cache by tag',
        { tag, error }
      );
    }
  }

  // Cache Statistics
  public async getStats(): Promise<Record<string, unknown>> {
    try {
      const stats: Record<string, unknown> = {
        type: this.config.type,
        ttl: this.config.ttl
      };

      if (this.config.type === 'memory') {
        stats.memory = this.memoryCache.getStats();
      }

      if (this.config.type === 'redis') {
        stats.redis = {
          connected: this.redis.status === 'ready',
          keys: await this.redis.dbsize(),
          memory: await this.redis.info('memory')
        };
      }

      return stats;
    } catch (error) {
      throw this.errorService.createError(
        'CACHE_STATS_FAILED',
        ErrorCategory.CACHE,
        ErrorSeverity.ERROR,
        'Failed to get cache statistics',
        { error }
      );
    }
  }

  // Helper methods
  private getCacheKey(key: string): string {
    const namespace = this.config.namespace || 'default';
    return `${namespace}:${key}`;
  }

  private calculateSize(value: unknown): number {
    return Buffer.from(JSON.stringify(value)).length;
  }

  private async updateMetadata(
    key: string,
    type: 'hit' | 'miss'
  ): Promise<void> {
    try {
      if (this.config.type === 'redis') {
        const cacheKey = this.getCacheKey(key);
        const entry = await this.redis.get(cacheKey);
        if (entry) {
          const parsedEntry = JSON.parse(entry) as CacheEntry;
          parsedEntry.metadata = {
            ...parsedEntry.metadata,
            hits: (parsedEntry.metadata?.hits || 0) + 1,
            updatedAt: new Date()
          };
          await this.redis.set(
            cacheKey,
            JSON.stringify(parsedEntry),
            'EX',
            parsedEntry.ttl
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to update cache metadata', {
        key,
        type,
        error
      });
    }
  }

  private async logAudit(
    action: string,
    resource: string,
    resourceId: string,
    changes?: Record<string, unknown>
  ): Promise<void> {
    await this.loggingService.info('Cache audit log', {
      action,
      resource,
      resourceId,
      changes,
      timestamp: new Date()
    });
  }

  // Cleanup
  public async cleanup(): Promise<void> {
    this.memoryCache.flushAll();
    await this.redis.quit();
  }
} 