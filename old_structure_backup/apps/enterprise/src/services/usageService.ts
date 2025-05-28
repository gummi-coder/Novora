import { api, ApiResponse, handleApiError } from './api';

export interface UsageMetrics {
  surveys: {
    total: number;
    limit: number;
    usage: number;
  };
  responses: {
    total: number;
    limit: number;
    usage: number;
  };
  storage: {
    total: number; // in MB
    limit: number;
    usage: number;
  };
  apiCalls: {
    total: number;
    limit: number;
    usage: number;
  };
  teamMembers: {
    total: number;
    limit: number;
    usage: number;
  };
}

export interface UsageHistory {
  date: string;
  metrics: {
    surveys: number;
    responses: number;
    storage: number;
    apiCalls: number;
  };
}

export interface UsageAlert {
  id: string;
  type: 'warning' | 'critical';
  metric: keyof UsageMetrics;
  threshold: number;
  currentValue: number;
  message: string;
  createdAt: Date;
}

class UsageService {
  async getCurrentUsage(): Promise<ApiResponse<UsageMetrics>> {
    try {
      const response = await api.get('/usage/current');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getUsageHistory(startDate: string, endDate: string): Promise<ApiResponse<UsageHistory[]>> {
    try {
      const response = await api.get('/usage/history', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getUsageAlerts(): Promise<ApiResponse<UsageAlert[]>> {
    try {
      const response = await api.get('/usage/alerts');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async checkResourceAvailability(resource: keyof UsageMetrics): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.get(`/usage/check/${resource}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async incrementUsage(resource: keyof UsageMetrics, amount: number = 1): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/usage/increment', {
        resource,
        amount,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async setUsageLimit(resource: keyof UsageMetrics, limit: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/usage/limits', {
        resource,
        limit,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getUsageReport(startDate: string, endDate: string): Promise<Blob> {
    try {
      const response = await api.get('/usage/report', {
        params: { startDate, endDate },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Enterprise-only features
  async getAdvancedUsageAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/usage/analytics/advanced');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async setCustomUsageThresholds(thresholds: Record<keyof UsageMetrics, number>): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/usage/thresholds', thresholds);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getUsagePredictions(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/usage/predictions');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const usageService = new UsageService(); 