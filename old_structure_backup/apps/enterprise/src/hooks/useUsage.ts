import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface UsageData {
  activeUsers: number;
  storage: number;
  apiCalls: number;
  customReports: number;
}

export const useUsage = () => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<UsageData>('/usage');
        setUsage(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch usage data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, []);

  return { usage, isLoading, error };
}; 