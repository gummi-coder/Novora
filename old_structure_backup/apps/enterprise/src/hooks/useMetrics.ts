import { useQuery } from '@tanstack/react-query';
import { fetchMetrics } from '@/lib/services/dashboard';
import type { Metric } from '@/lib/api';

export function useMetrics() {
  return useQuery<Metric[]>({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useMetricById(id: string) {
  const { data: metrics, ...rest } = useMetrics();
  const metric = metrics?.find(m => m.id === id);
  
  return {
    data: metric,
    ...rest,
  };
} 