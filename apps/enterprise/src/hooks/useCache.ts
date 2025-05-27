import { useState, useEffect, useCallback } from 'react';
import { CacheService, CacheConfig } from '@/services/CacheService';

interface UseCacheOptions<T> {
  key: string;
  fetchFn: () => Promise<T>;
  ttl?: number;
  strategy?: CacheConfig['strategy'];
  dependencies?: any[];
}

const defaultConfig: CacheConfig = {
  ttl: 3600000, // 1 hour
  maxSize: 100 * 1024 * 1024, // 100MB
  strategy: 'memory',
};

export function useCache<T>({
  key,
  fetchFn,
  ttl,
  strategy = 'memory',
  dependencies = [],
}: UseCacheOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get data from cache
      const cacheService = CacheService.getInstance({
        ...defaultConfig,
        strategy,
        ttl: ttl || defaultConfig.ttl,
      });
      const cachedData = await cacheService.get<T>(key);

      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      // If not in cache, fetch from API
      const freshData = await fetchFn();
      
      // Store in cache
      await cacheService.set(key, freshData, ttl);
      
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, ttl, strategy]);

  useEffect(() => {
    fetchData();
  }, [...dependencies, fetchData]);

  const invalidate = useCallback(async () => {
    const cacheService = CacheService.getInstance({
      ...defaultConfig,
      strategy,
    });
    await cacheService.delete(key);
    await fetchData();
  }, [key, fetchData, strategy]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidate,
  };
} 