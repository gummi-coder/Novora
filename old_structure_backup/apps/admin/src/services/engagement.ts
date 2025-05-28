import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface EngagementMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  sparkline: number[];
}

export interface FeatureUsage {
  name: string;
  usage: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CohortData {
  cohort: string;
  size: number;
  retention: number[];
}

export interface UserActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

export const engagementService = {
  async getMetrics(timeRange: string = '7d'): Promise<EngagementMetric[]> {
    const response = await axios.get(`${API_URL}/engagement/metrics`, {
      params: { timeRange },
    });
    return response.data;
  },

  async getFeatureUsage(): Promise<FeatureUsage[]> {
    const response = await axios.get(`${API_URL}/engagement/feature-usage`);
    return response.data;
  },

  async getCohortAnalysis(): Promise<CohortData[]> {
    const response = await axios.get(`${API_URL}/engagement/cohort-analysis`);
    return response.data;
  },

  async getRecentActivity(): Promise<UserActivity[]> {
    const response = await axios.get(`${API_URL}/engagement/recent-activity`);
    return response.data;
  },
}; 