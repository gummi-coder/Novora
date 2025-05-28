import { Redis } from 'ioredis';
import { performance } from 'perf_hooks';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean; // Whether to serve stale data while revalidating
  tags?: string[]; // Cache tags for invalidation
}

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memoryUsage: number;
}

class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, { value: any; timestamp: number; tags?: string[] }>;
  private redisClient: Redis | null;
  private stats: CacheStats;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.memoryCache = new Map();
    this.stats = { hits: 0, misses: 0, keys: 0, memoryUsage: 0 };
    
    // Initialize Redis if REDIS_URL is available
    if (process.env.REDIS_URL) {
      this.redisClient = new Redis(process.env.REDIS_URL);
    } else {
      this.redisClient = null;
    }
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      // Try memory cache first
      const memoryData = this.memoryCache.get(key);
      if (memoryData && !this.isExpired(memoryData.timestamp, memoryData.ttl)) {
        this.stats.hits++;
        return memoryData.value;
      }

      // Try Redis if available
      if (this.redisClient) {
        const redisData = await this.redisClient.get(key);
        if (redisData) {
          const parsedData = JSON.parse(redisData);
          // Update memory cache
          this.memoryCache.set(key, {
            value: parsedData.value,
            timestamp: parsedData.timestamp,
            tags: parsedData.tags
          });
          this.stats.hits++;
          return parsedData.value;
        }
      }

      this.stats.misses++;
      return null;
    } finally {
      const duration = performance.now() - startTime;
      if (duration > 100) { // Log slow cache operations
        console.warn(`Slow cache operation: get(${key}) took ${duration.toFixed(2)}ms`);
      }
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const timestamp = Date.now();
    const ttl = options.ttl || this.DEFAULT_TTL;
    const data = { value, timestamp, tags: options.tags };

    // Set in memory cache
    this.memoryCache.set(key, { ...data, ttl });
    this.stats.keys = this.memoryCache.size;

    // Set in Redis if available
    if (this.redisClient) {
      await this.redisClient.set(
        key,
        JSON.stringify(data),
        'PX',
        ttl
      );

      // Store tags if provided
      if (options.tags?.length) {
        await Promise.all(
          options.tags.map(tag =>
            this.redisClient?.sadd(`tag:${tag}`, key)
          )
        );
      }
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    if (this.redisClient) {
      // Get all keys for the tags
      const keys = await Promise.all(
        tags.map(tag => this.redisClient?.smembers(`tag:${tag}`))
      );
      
      // Flatten and deduplicate keys
      const uniqueKeys = [...new Set(keys.flat().filter(Boolean))];
      
      // Delete from Redis
      if (uniqueKeys.length) {
        await this.redisClient.del(...uniqueKeys);
        // Delete tag sets
        await Promise.all(
          tags.map(tag => this.redisClient?.del(`tag:${tag}`))
        );
      }
    }

    // Invalidate from memory cache
    for (const [key, data] of this.memoryCache.entries()) {
      if (data.tags?.some(tag => tags.includes(tag))) {
        this.memoryCache.delete(key);
      }
    }
    
    this.stats.keys = this.memoryCache.size;
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (this.redisClient) {
      await this.redisClient.del(key);
    }
    this.stats.keys = this.memoryCache.size;
  }

  private isExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    if (this.redisClient) {
      await this.redisClient.flushall();
    }
    this.stats = { hits: 0, misses: 0, keys: 0, memoryUsage: 0 };
  }
}

export const cacheService = CacheService.getInstance(); 