import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { AnalyticsService } from '../services/analytics-service';

export function useAnalytics() {
  const { user } = useAuth();
  const analyticsService = AnalyticsService.getInstance();

  const trackEvent = useCallback(
    async (
      type: string,
      action: string,
      properties: Record<string, unknown> = {},
      options: {
        category?: string;
        page?: string;
        duration?: number;
        metadata?: Record<string, unknown>;
      } = {}
    ) => {
      try {
        await analyticsService.trackEvent({
          userId: user?.id,
          type,
          category: options.category || 'general',
          action,
          properties,
          sessionId: window.sessionStorage.getItem('sessionId') || undefined,
          page: options.page || window.location.pathname,
          duration: options.duration,
          metadata: options.metadata,
        });
      } catch (error) {
        console.error('Error tracking event:', error);
      }
    },
    [user]
  );

  const trackPerformance = useCallback(
    async (
      type: 'api' | 'page_load' | 'database' | 'frontend',
      name: string,
      value: number,
      unit: string,
      metadata?: Record<string, unknown>
    ) => {
      try {
        await analyticsService.trackPerformanceMetric({
          type,
          name,
          value,
          unit,
          metadata,
        });
      } catch (error) {
        console.error('Error tracking performance metric:', error);
      }
    },
    []
  );

  const trackPageView = useCallback(
    async (page: string, duration?: number) => {
      await trackEvent('page_view', 'view', { page }, { page, duration });
    },
    [trackEvent]
  );

  const trackApiCall = useCallback(
    async (
      endpoint: string,
      method: string,
      duration: number,
      status: number,
      metadata?: Record<string, unknown>
    ) => {
      await trackPerformance('api', `${method} ${endpoint}`, duration, 'ms', {
        status,
        ...metadata,
      });
    },
    [trackPerformance]
  );

  return {
    trackEvent,
    trackPerformance,
    trackPageView,
    trackApiCall,
  };
} 