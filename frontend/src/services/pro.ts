import axios from 'axios';
import { Team, Dashboard, Widget } from '../types/enterprise';

const API_URL = import.meta.env.VITE_API_URL;

export const proService = {
  // Team Management (Limited to 3 teams)
  async createTeam(team: Partial<Team>): Promise<Team> {
    const response = await axios.post(`${API_URL}/pro/teams`, team);
    return response.data;
  },

  async getTeams(companyId: string): Promise<Team[]> {
    const response = await axios.get(`${API_URL}/pro/teams`, {
      params: { companyId }
    });
    return response.data;
  },

  async updateTeam(id: string, team: Partial<Team>): Promise<Team> {
    const response = await axios.put(`${API_URL}/pro/teams/${id}`, team);
    return response.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await axios.delete(`${API_URL}/pro/teams/${id}`);
  },

  // Dashboard Management (Limited to 5 dashboards per team)
  async createDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await axios.post(`${API_URL}/pro/dashboards`, dashboard);
    return response.data;
  },

  async getDashboards(teamId: string): Promise<Dashboard[]> {
    const response = await axios.get(`${API_URL}/pro/dashboards`, {
      params: { teamId }
    });
    return response.data;
  },

  async updateDashboard(id: string, dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await axios.put(`${API_URL}/pro/dashboards/${id}`, dashboard);
    return response.data;
  },

  async deleteDashboard(id: string): Promise<void> {
    await axios.delete(`${API_URL}/pro/dashboards/${id}`);
  },

  // Widget Management (Limited to basic widgets)
  async addWidget(dashboardId: string, widget: Partial<Widget>): Promise<Widget> {
    const response = await axios.post(`${API_URL}/pro/dashboards/${dashboardId}/widgets`, widget);
    return response.data;
  },

  async updateWidget(dashboardId: string, widgetId: string, widget: Partial<Widget>): Promise<Widget> {
    const response = await axios.put(
      `${API_URL}/pro/dashboards/${dashboardId}/widgets/${widgetId}`,
      widget
    );
    return response.data;
  },

  async deleteWidget(dashboardId: string, widgetId: string): Promise<void> {
    await axios.delete(`${API_URL}/pro/dashboards/${dashboardId}/widgets/${widgetId}`);
  },

  // Basic Analytics
  async getBasicAnalytics(teamId: string): Promise<any> {
    const response = await axios.get(`${API_URL}/pro/analytics/basic`, {
      params: { teamId }
    });
    return response.data;
  },

  // User Management (Limited to team members)
  async getTeamMembers(teamId: string): Promise<any[]> {
    const response = await axios.get(`${API_URL}/pro/teams/${teamId}/members`);
    return response.data;
  },

  async addTeamMember(teamId: string, userId: string): Promise<void> {
    await axios.post(`${API_URL}/pro/teams/${teamId}/members`, { userId });
  },

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await axios.delete(`${API_URL}/pro/teams/${teamId}/members/${userId}`);
  },

  // Usage Limits
  async getUsageLimits(companyId: string): Promise<{
    teamCount: number;
    dashboardCount: number;
    memberCount: number;
    widgetCount: number;
  }> {
    const response = await axios.get(`${API_URL}/pro/usage-limits`, {
      params: { companyId }
    });
    return response.data;
  }
}; 