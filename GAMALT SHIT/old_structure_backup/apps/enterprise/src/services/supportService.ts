import { api, ApiResponse, handleApiError } from './api';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: 'user' | 'support' | 'admin';
  };
  createdAt: Date;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
  };
}

export interface TrainingMaterial {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'guide';
  url: string;
  duration?: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

class SupportService {
  // Support Tickets
  async createTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<ApiResponse<SupportTicket>> {
    try {
      const response = await api.post('/support/tickets', ticket);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getTickets(): Promise<ApiResponse<SupportTicket[]>> {
    try {
      const response = await api.get('/support/tickets');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getTicket(id: string): Promise<ApiResponse<SupportTicket>> {
    try {
      const response = await api.get(`/support/tickets/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateTicket(id: string, updates: Partial<SupportTicket>): Promise<ApiResponse<SupportTicket>> {
    try {
      const response = await api.patch(`/support/tickets/${id}`, updates);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async addTicketMessage(ticketId: string, content: string): Promise<ApiResponse<TicketMessage>> {
    try {
      const response = await api.post(`/support/tickets/${ticketId}/messages`, { content });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Knowledge Base
  async getArticles(category?: string, tags?: string[]): Promise<ApiResponse<KnowledgeArticle[]>> {
    try {
      const response = await api.get('/support/knowledge', {
        params: { category, tags },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getArticle(id: string): Promise<ApiResponse<KnowledgeArticle>> {
    try {
      const response = await api.get(`/support/knowledge/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async searchArticles(query: string): Promise<ApiResponse<KnowledgeArticle[]>> {
    try {
      const response = await api.get('/support/knowledge/search', {
        params: { query },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Training Materials
  async getTrainingMaterials(category?: string): Promise<ApiResponse<TrainingMaterial[]>> {
    try {
      const response = await api.get('/support/training', {
        params: { category },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getTrainingMaterial(id: string): Promise<ApiResponse<TrainingMaterial>> {
    try {
      const response = await api.get(`/support/training/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Enterprise-only features
  async getPrioritySupport(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/support/priority');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async scheduleTrainingSession(session: any): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/support/training/sessions', session);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getCustomTrainingMaterials(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/support/training/custom');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const supportService = new SupportService(); 