import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

interface ChartConfig {
  type: 'line' | 'bar' | 'pie';
  data: ChartData;
  options?: any;
}

export const useCharts = (chartId: string) => {
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/charts/${chartId}`);
      setChartConfig(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch chart data');
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [chartId]);

  const updateChartData = async (newData: Partial<ChartData>) => {
    try {
      const response = await api.put(`/dashboard/charts/${chartId}`, newData);
      setChartConfig(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to update chart data');
      console.error('Error updating chart data:', err);
    }
  };

  return {
    chartConfig,
    loading,
    error,
    refetch: fetchChartData,
    updateData: updateChartData,
  };
}; 