import api from './api';
import {
  Dashboard,
  DashboardLayout,
  DashboardShare,
  DashboardTemplate,
  WidgetConfig,
  DashboardShareLink,
  DashboardAccessLevel,
} from '../types/dashboard';
import { handleResponse } from './api';

export const dashboardService = {
  // Dashboard Management
  async getDashboards(): Promise<Dashboard[]> {
    const response = await api.get<Dashboard[]>('/dashboards');
    return handleResponse(response);
  },

  async getDashboard(id: string): Promise<Dashboard> {
    const response = await api.get<Dashboard>(`/dashboards/${id}`);
    return handleResponse(response);
  },

  async createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    const response = await api.post<Dashboard>('/dashboards', dashboard);
    return handleResponse(response);
  },

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    const response = await api.patch<Dashboard>(`/dashboards/${id}`, updates);
    return handleResponse(response);
  },

  async deleteDashboard(id: string): Promise<void> {
    await api.delete(`/dashboards/${id}`);
  },

  // Layout Management
  async updateLayout(id: string, layout: DashboardLayout): Promise<Dashboard> {
    const response = await api.patch<Dashboard>(`/dashboards/${id}/layout`, layout);
    return handleResponse(response);
  },

  // Widget Management
  async addWidget(id: string, widget: WidgetConfig): Promise<Dashboard> {
    const response = await api.post<Dashboard>(`/dashboards/${id}/widgets`, widget);
    return handleResponse(response);
  },

  async updateWidget(id: string, widgetId: string, updates: Partial<WidgetConfig>): Promise<Dashboard> {
    const response = await api.patch<Dashboard>(`/dashboards/${id}/widgets/${widgetId}`, updates);
    return handleResponse(response);
  },

  async removeWidget(id: string, widgetId: string): Promise<Dashboard> {
    const response = await api.delete<Dashboard>(`/dashboards/${id}/widgets/${widgetId}`);
    return handleResponse(response);
  },

  // Sharing Management
  async shareDashboard(
    dashboardId: string,
    userId: string,
    accessLevel: DashboardAccessLevel
  ): Promise<DashboardShare> {
    const response = await api.post<DashboardShare>(`/dashboards/${dashboardId}/shares`, {
      userId,
      accessLevel,
    });
    return handleResponse(response);
  },

  async updateShare(
    dashboardId: string,
    shareId: string,
    accessLevel: DashboardAccessLevel
  ): Promise<DashboardShare> {
    const response = await api.put<DashboardShare>(`/dashboards/${dashboardId}/shares/${shareId}`, {
      accessLevel,
    });
    return handleResponse(response);
  },

  async removeShare(dashboardId: string, shareId: string): Promise<void> {
    await api.delete(`/dashboards/${dashboardId}/shares/${shareId}`);
  },

  // Share Link Management
  async createShareLink(
    dashboardId: string,
    options: {
      accessLevel: DashboardAccessLevel;
      expiresAt?: Date;
      maxUses?: number;
    }
  ): Promise<DashboardShareLink> {
    const response = await api.post<DashboardShareLink>(`/dashboards/${dashboardId}/share-links`, options);
    return handleResponse(response);
  },

  async revokeShareLink(dashboardId: string, linkId: string): Promise<void> {
    await api.delete(`/dashboards/${dashboardId}/share-links/${linkId}`);
  },

  // Templates
  async getTemplates(): Promise<DashboardTemplate[]> {
    const response = await api.get<DashboardTemplate[]>('/dashboard-templates');
    return handleResponse(response);
  },

  async createTemplate(dashboardId: string, data: Partial<DashboardTemplate>): Promise<DashboardTemplate> {
    const response = await api.post<DashboardTemplate>(`/dashboards/${dashboardId}/templates`, data);
    return handleResponse(response);
  },

  // Data Refresh
  async refreshWidgetData(id: string, widgetId: string): Promise<void> {
    await api.post(`/dashboards/${id}/widgets/${widgetId}/refresh`);
  },

  // Collaboration
  async getCollaborators(dashboardId: string): Promise<DashboardShare[]> {
    const response = await api.get<DashboardShare[]>(`/dashboards/${dashboardId}/collaborators`);
    return handleResponse(response);
  },

  // Export/Import
  async exportDashboard(dashboardId: string): Promise<Blob> {
    const response = await api.get<Blob>(`/dashboards/${dashboardId}/export`, {
      responseType: 'blob',
    });
    return handleResponse(response);
  },

  async importDashboard(file: File): Promise<Dashboard> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<Dashboard>('/dashboards/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return handleResponse(response);
  },
}; 