import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';
import { cacheService } from '@/services/CacheService';

const prisma = new PrismaClient();

interface QueryOptions {
  select?: Record<string, any>;
  where?: Record<string, any>;
  take?: number;
  skip?: number;
  orderBy?: Record<string, any>;
  include?: Record<string, any>;
  cache?: boolean;
  cacheTTL?: number;
  cacheTags?: string[];
}

export class QueryOptimizer {
  static async executeQuery<T>(
    queryFn: () => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const startTime = performance.now();

    try {
      // Generate cache key
      const cacheKey = `query:${JSON.stringify({ queryFn: queryFn.toString(), options })}`;

      // Check cache if enabled
      if (options.cache) {
        const cached = await cacheService.get<T>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Execute query
      const result = await queryFn();
      
      // Cache result if enabled
      if (options.cache) {
        await cacheService.set(cacheKey, result, {
          ttl: options.cacheTTL,
          tags: options.cacheTags
        });
      }

      const endTime = performance.now();
      console.log(`Query executed in ${(endTime - startTime).toFixed(2)}ms`);

      return result;
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  static async findMany<T>(
    model: keyof PrismaClient,
    options: QueryOptions = {}
  ): Promise<T[]> {
    return this.executeQuery(async () => {
      const query = {
        ...(options.select && { select: options.select }),
        ...(options.include && { include: options.include }),
        ...(options.take && { take: options.take }),
        ...(options.skip && { skip: options.skip }),
        ...(options.orderBy && { orderBy: options.orderBy }),
        ...(options.where && { where: options.where })
      };

      return (prisma[model] as any).findMany(query);
    }, {
      ...options,
      cacheTags: [...(options.cacheTags || []), `model:${String(model)}`, 'list']
    });
  }

  static async findUnique<T>(
    model: keyof PrismaClient,
    where: Record<string, any>,
    options: QueryOptions = {}
  ): Promise<T | null> {
    return this.executeQuery(async () => {
      const query = {
        where,
        ...(options.select && { select: options.select }),
        ...(options.include && { include: options.include })
      };

      return (prisma[model] as any).findUnique(query);
    }, {
      ...options,
      cacheTags: [...(options.cacheTags || []), `model:${String(model)}`, 'detail']
    });
  }

  static async invalidateCache(model: string, type: 'list' | 'detail'): Promise<void> {
    await cacheService.invalidateByTags([`model:${model}`, type]);
  }
} 