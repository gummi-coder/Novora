import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Alert {
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
      const response = await api.get('/alerts');
      setAlerts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Set up WebSocket connection for real-time alerts
    const ws = new WebSocket('ws://localhost:3000/ws/alerts');
    
    ws.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      setAlerts(prev => [newAlert, ...prev]);
    };

    return () => {
      ws.close();
    };
  }, []);

  const markAsRead = async (alertId: string) => {
    try {
      await api.patch(`/alerts/${alertId}/read`);
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );
    } catch (err) {
      setError('Failed to mark alert as read');
      console.error('Error marking alert as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/alerts/read-all');
      setAlerts(prev =>
        prev.map(alert => ({ ...alert, read: true }))
      );
    } catch (err) {
      setError('Failed to mark all alerts as read');
      console.error('Error marking all alerts as read:', err);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      setAlerts(prev =>
        prev.filter(alert => alert.id !== alertId)
      );
    } catch (err) {
      setError('Failed to delete alert');
      console.error('Error deleting alert:', err);
    }
  };

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
    markAsRead,
    markAllAsRead,
    deleteAlert,
  };
}; 