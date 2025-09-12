import { api, ApiResponse, handleApiError } from './api';

export interface SSOConfig {
  id: string;
  provider: 'saml' | 'oidc';
  enabled: boolean;
  config: {
    idpUrl: string;
    entityId: string;
    certificate?: string;
    metadata?: string;
  };
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  permissions: string[];
}

export interface ImportJob {
  id: string;
  type: 'survey' | 'user' | 'response';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file: string;
  progress: number;
  errors?: string[];
  createdAt: Date;
  completedAt?: Date;
}

class IntegrationService {
  // SSO Configuration (Enterprise only)
  async getSSOConfig(): Promise<ApiResponse<SSOConfig>> {
    try {
      const response = await api.get('/integrations/sso');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateSSOConfig(config: Partial<SSOConfig>): Promise<ApiResponse<SSOConfig>> {
    try {
      const response = await api.patch('/integrations/sso', config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // API Key Management (Enterprise/Pro)
  async getApiKeys(): Promise<ApiResponse<ApiKey[]>> {
    try {
      const response = await api.get('/integrations/api-keys');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async createApiKey(name: string, permissions: string[]): Promise<ApiResponse<ApiKey>> {
    try {
      const response = await api.post('/integrations/api-keys', { name, permissions });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async revokeApiKey(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/integrations/api-keys/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Data Import/Export
  async importData(file: File, type: ImportJob['type']): Promise<ApiResponse<ImportJob>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await api.post('/integrations/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getImportJobs(): Promise<ApiResponse<ImportJob[]>> {
    try {
      const response = await api.get('/integrations/import');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async exportData(type: string, format: 'csv' | 'excel' | 'json', filters: Record<string, any>): Promise<Blob> {
    try {
      const response = await api.get('/integrations/export', {
        params: { type, format, ...filters },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Enterprise-only features
  async getWebhookConfig(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/integrations/webhooks');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateWebhookConfig(config: any): Promise<ApiResponse<any>> {
    try {
      const response = await api.patch('/integrations/webhooks', config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getCustomIntegrations(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/integrations/custom');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const integrationService = new IntegrationService(); 