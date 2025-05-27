import { useState, useEffect } from 'react';
import { dashboardService } from '../lib/services/dashboard';

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  read: boolean;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return { alerts, loading, error, refetch: fetchAlerts, markAsRead };
}; 