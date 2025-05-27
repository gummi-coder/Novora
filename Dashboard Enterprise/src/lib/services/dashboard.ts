import api from '../api';

export interface Metric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  description?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

export const dashboardService = {
  getMetrics: async (): Promise<Metric[]> => {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  },

  getChartData: async (period: string): Promise<ChartData> => {
    const response = await api.get(`/dashboard/charts?period=${period}`);
    return response.data;
  },

  getTeamMembers: async (): Promise<TeamMember[]> => {
    const response = await api.get('/dashboard/team');
    return response.data;
  },

  getAlerts: async (): Promise<any[]> => {
    const response = await api.get('/dashboard/alerts');
    return response.data;
  },
}; 