import axios from 'axios';
import { API_URL } from '../config';

export interface Alert {
  id: number;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  source: string;
  status: 'active' | 'resolved' | 'acknowledged';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface AlertFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface AlertStats {
  total: number;
  active: number;
  resolved: number;
  acknowledged: number;
  byType: Array<{ type: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const alertService = {
  async getAlerts(filters: AlertFilters = {}) {
    const response = await axios.get(`${API_URL}/alerts`, {
      headers: getAuthHeader(),
      params: filters,
    });
    return response.data;
  },

  async getAlert(id: number) {
    const response = await axios.get(`${API_URL}/alerts/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await axios.post(`${API_URL}/alerts`, alert, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateAlert(id: number, alert: Partial<Alert>) {
    const response = await axios.put(`${API_URL}/alerts/${id}`, alert, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async deleteAlert(id: number) {
    await axios.delete(`${API_URL}/alerts/${id}`, {
      headers: getAuthHeader(),
    });
  },

  async acknowledgeAlert(id: number) {
    const response = await axios.post(
      `${API_URL}/alerts/${id}/acknowledge`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  async resolveAlert(id: number) {
    const response = await axios.post(
      `${API_URL}/alerts/${id}/resolve`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  async getAlertStats() {
    const response = await axios.get(`${API_URL}/alerts/stats/summary`, {
      headers: getAuthHeader(),
    });
    return response.data as AlertStats;
  },
}; 