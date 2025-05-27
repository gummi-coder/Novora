import { useState, useEffect } from 'react';
import { dashboardService, ChartData } from '../lib/services/dashboard';

export const useCharts = (period: string = 'week') => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getChartData(period);
      setChartData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch chart data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [period]);

  return { chartData, loading, error, refetch: fetchChartData };
}; 