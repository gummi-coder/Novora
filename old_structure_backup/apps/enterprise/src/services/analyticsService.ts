import { api, ApiResponse, handleApiError } from './api';

export interface AnalyticsData {
  responseRates: {
    date: string;
    rate: number;
  }[];
  engagementMetrics: {
    date: string;
    score: number;
  }[];
  usageStats: {
    surveys: number;
    responses: number;
    activeUsers: number;
    completionRate: number;
  };
}

export interface CustomReport {
  id: string;
  name: string;
  type: 'survey' | 'engagement' | 'usage';
  parameters: Record<string, any>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

class AnalyticsService {
  async getAnalyticsData(startDate: string, endDate: string): Promise<ApiResponse<AnalyticsData>> {
    try {
      const response = await api.get('/analytics', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getCustomReports(): Promise<ApiResponse<CustomReport[]>> {
    try {
      const response = await api.get('/analytics/reports');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async createCustomReport(report: Omit<CustomReport, 'id'>): Promise<ApiResponse<CustomReport>> {
    try {
      const response = await api.post('/analytics/reports', report);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateCustomReport(id: string, report: Partial<CustomReport>): Promise<ApiResponse<CustomReport>> {
    try {
      const response = await api.patch(`/analytics/reports/${id}`, report);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async deleteCustomReport(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/analytics/reports/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async exportAnalyticsData(format: 'csv' | 'excel' | 'json', filters: Record<string, any>): Promise<Blob> {
    try {
      const response = await api.get('/analytics/export', {
        params: { format, ...filters },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Enterprise-only features
  async getAdvancedAnalytics(startDate: string, endDate: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/analytics/advanced', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getPredictiveAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/analytics/predictive');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getCustomSegments(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/analytics/segments');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const analyticsService = new AnalyticsService(); 