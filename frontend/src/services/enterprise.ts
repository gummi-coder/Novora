import axios from 'axios';
import { Team, Dashboard, Widget, Note, Integration } from '../types/enterprise';

const API_URL = import.meta.env.VITE_API_URL;

export const enterpriseService = {
  // Team Management
  async createTeam(team: Partial<Team>): Promise<Team> {
    const response = await axios.post(`${API_URL}/enterprise/teams`, team);
    return response.data;
  },

  async getTeams(companyId: string): Promise<Team[]> {
    const response = await axios.get(`${API_URL}/enterprise/teams`, {
      params: { companyId }
    });
    return response.data;
  },

  async updateTeam(id: string, team: Partial<Team>): Promise<Team> {
    const response = await axios.put(`${API_URL}/enterprise/teams/${id}`, team);
    return response.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await axios.delete(`${API_URL}/enterprise/teams/${id}`);
  },

  // Team Member Management
  async addTeamMember(teamId: string, userId: string, role: string): Promise<void> {
    await axios.post(`${API_URL}/enterprise/teams/${teamId}/members`, {
      userId,
      role
    });
  },

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await axios.delete(`${API_URL}/enterprise/teams/${teamId}/members/${userId}`);
  },

  // Dashboard Management
  async createDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await axios.post(`${API_URL}/enterprise/dashboards`, dashboard);
    return response.data;
  },

  async getDashboards(teamId: string): Promise<Dashboard[]> {
    const response = await axios.get(`${API_URL}/enterprise/dashboards`, {
      params: { teamId }
    });
    return response.data;
  },

  async updateDashboard(id: string, dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await axios.put(`${API_URL}/enterprise/dashboards/${id}`, dashboard);
    return response.data;
  },

  async deleteDashboard(id: string): Promise<void> {
    await axios.delete(`${API_URL}/enterprise/dashboards/${id}`);
  },

  // Widget Management
  async addWidget(dashboardId: string, widget: Partial<Widget>): Promise<Widget> {
    const response = await axios.post(`${API_URL}/enterprise/dashboards/${dashboardId}/widgets`, widget);
    return response.data;
  },

  async updateWidget(dashboardId: string, widgetId: string, widget: Partial<Widget>): Promise<Widget> {
    const response = await axios.put(
      `${API_URL}/enterprise/dashboards/${dashboardId}/widgets/${widgetId}`,
      widget
    );
    return response.data;
  },

  async deleteWidget(dashboardId: string, widgetId: string): Promise<void> {
    await axios.delete(`${API_URL}/enterprise/dashboards/${dashboardId}/widgets/${widgetId}`);
  },

  // Notes Management
  async createNote(note: Partial<Note>): Promise<Note> {
    const response = await axios.post(`${API_URL}/enterprise/notes`, note);
    return response.data;
  },

  async getNotes(teamId: string): Promise<Note[]> {
    const response = await axios.get(`${API_URL}/enterprise/notes`, {
      params: { teamId }
    });
    return response.data;
  },

  async updateNote(id: string, note: Partial<Note>): Promise<Note> {
    const response = await axios.put(`${API_URL}/enterprise/notes/${id}`, note);
    return response.data;
  },

  async deleteNote(id: string): Promise<void> {
    await axios.delete(`${API_URL}/enterprise/notes/${id}`);
  },

  // Integration Management
  async createIntegration(integration: Partial<Integration>): Promise<Integration> {
    const response = await axios.post(`${API_URL}/enterprise/integrations`, integration);
    return response.data;
  },

  async getIntegrations(companyId: string): Promise<Integration[]> {
    const response = await axios.get(`${API_URL}/enterprise/integrations`, {
      params: { companyId }
    });
    return response.data;
  },

  async updateIntegration(id: string, integration: Partial<Integration>): Promise<Integration> {
    const response = await axios.put(`${API_URL}/enterprise/integrations/${id}`, integration);
    return response.data;
  },

  async deleteIntegration(id: string): Promise<void> {
    await axios.delete(`${API_URL}/enterprise/integrations/${id}`);
  },

  // Feature Flags
  async getFeatureFlags(): Promise<Record<string, boolean>> {
    const response = await axios.get(`${API_URL}/enterprise/feature-flags`);
    return response.data;
  }
}; 