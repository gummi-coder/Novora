import axios from 'axios';
import { Dashboard, Widget } from '../types/enterprise';

const API_URL = import.meta.env.VITE_API_URL;

export const coreService = {
  // Basic Dashboard Management (Limited to 1 dashboard)
  async getDashboard(userId: string): Promise<Dashboard> {
    const response = await axios.get(`${API_URL}/core/dashboard`, {
      params: { userId }
    });
    return response.data;
  },

  async updateDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await axios.put(`${API_URL}/core/dashboard`, dashboard);
    return response.data;
  },

  // Basic Widget Management (Limited to 5 widgets)
  async getWidgets(dashboardId: string): Promise<Widget[]> {
    const response = await axios.get(`${API_URL}/core/widgets`, {
      params: { dashboardId }
    });
    return response.data;
  },

  async addWidget(widget: Partial<Widget>): Promise<Widget> {
    const response = await axios.post(`${API_URL}/core/widgets`, widget);
    return response.data;
  },

  async updateWidget(widgetId: string, widget: Partial<Widget>): Promise<Widget> {
    const response = await axios.put(`${API_URL}/core/widgets/${widgetId}`, widget);
    return response.data;
  },

  async deleteWidget(widgetId: string): Promise<void> {
    await axios.delete(`${API_URL}/core/widgets/${widgetId}`);
  },

  // Basic Analytics
  async getBasicStats(userId: string): Promise<{
    totalViews: number;
    lastActive: string;
    widgetCount: number;
  }> {
    const response = await axios.get(`${API_URL}/core/stats`, {
      params: { userId }
    });
    return response.data;
  },

  // Account Settings
  async updateAccountSettings(settings: {
    email?: string;
    name?: string;
    preferences?: Record<string, any>;
  }): Promise<void> {
    await axios.put(`${API_URL}/core/account/settings`, settings);
  },

  async requestPasswordReset(email: string): Promise<void> {
    await axios.post(`${API_URL}/core/account/reset-password`, { email });
  },

  // Usage Limits
  async getUsageLimits(userId: string): Promise<{
    widgetCount: number;
    maxWidgets: number;
  }> {
    const response = await axios.get(`${API_URL}/core/usage-limits`, {
      params: { userId }
    });
    return response.data;
  }
}; 