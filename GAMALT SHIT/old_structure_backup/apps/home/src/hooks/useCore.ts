import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { coreService } from '../services/core';
import { Dashboard, Widget } from '../types/enterprise';

export const useCore = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    lastActive: '',
    widgetCount: 0
  });
  const [usageLimits, setUsageLimits] = useState({
    widgetCount: 0,
    maxWidgets: 5
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoreData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const [dashboardData, statsData, limitsData] = await Promise.all([
          coreService.getDashboard(user.id),
          coreService.getBasicStats(user.id),
          coreService.getUsageLimits(user.id)
        ]);

        setDashboard(dashboardData);
        setStats(statsData);
        setUsageLimits(limitsData);

        if (dashboardData.id) {
          const widgetsData = await coreService.getWidgets(dashboardData.id);
          setWidgets(widgetsData);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchCoreData();
  }, [user?.id]);

  const updateDashboard = async (updates: Partial<Dashboard>) => {
    try {
      const updated = await coreService.updateDashboard(updates);
      setDashboard(updated);
    } catch (err) {
      setError('Failed to update dashboard');
    }
  };

  const addWidget = async (widget: Partial<Widget>) => {
    if (usageLimits.widgetCount >= usageLimits.maxWidgets) {
      setError('Widget limit reached');
      return;
    }

    try {
      const newWidget = await coreService.addWidget(widget);
      setWidgets([...widgets, newWidget]);
      setUsageLimits(prev => ({
        ...prev,
        widgetCount: prev.widgetCount + 1
      }));
    } catch (err) {
      setError('Failed to add widget');
    }
  };

  const updateWidget = async (widgetId: string, updates: Partial<Widget>) => {
    try {
      const updated = await coreService.updateWidget(widgetId, updates);
      setWidgets(widgets.map(w => w.id === widgetId ? updated : w));
    } catch (err) {
      setError('Failed to update widget');
    }
  };

  const deleteWidget = async (widgetId: string) => {
    try {
      await coreService.deleteWidget(widgetId);
      setWidgets(widgets.filter(w => w.id !== widgetId));
      setUsageLimits(prev => ({
        ...prev,
        widgetCount: prev.widgetCount - 1
      }));
    } catch (err) {
      setError('Failed to delete widget');
    }
  };

  const updateAccountSettings = async (settings: {
    email?: string;
    name?: string;
    preferences?: Record<string, any>;
  }) => {
    try {
      await coreService.updateAccountSettings(settings);
    } catch (err) {
      setError('Failed to update account settings');
    }
  };

  return {
    dashboard,
    widgets,
    stats,
    usageLimits,
    loading,
    error,
    updateDashboard,
    addWidget,
    updateWidget,
    deleteWidget,
    updateAccountSettings
  };
}; 