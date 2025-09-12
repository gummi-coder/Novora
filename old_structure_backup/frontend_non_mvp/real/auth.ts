// Real authentication service
import { apiClient } from '../apiClient';

export const realAuthService = {
  login: async (credentials: any) => {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/v1/auth/me');
    return response.data;
  }
};
