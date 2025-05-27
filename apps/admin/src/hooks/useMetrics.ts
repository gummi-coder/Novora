import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Metric {
  id: string;
  title: string;
  value: number;
  change: number;
  type: string;
}

export const useMetrics = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/metrics');
      setMetrics(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}; 