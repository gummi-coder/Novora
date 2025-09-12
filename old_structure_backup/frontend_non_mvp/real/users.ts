// Real users service
import { apiClient } from '../apiClient';

export const realUserService = {
  getUsers: async () => {
    const response = await apiClient.get('/api/v1/users');
    return response.data;
  },
  
  getEmployees: async () => {
    const response = await apiClient.get('/api/v1/employees');
    return response.data;
  }
};
