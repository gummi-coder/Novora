import { useState, useEffect } from 'react';
import { dashboardService, Metric } from '../lib/services/dashboard';

export const useMetrics = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, loading, error, refetch: fetchMetrics };
}; 