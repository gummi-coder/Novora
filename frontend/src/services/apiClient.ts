export const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'mock';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Import mock and real services
import * as mock from './mocks';
import * as real from './real';

// Export the service based on API mode
export const svc = API_MODE === 'connected' ? real : mock;

// API client configuration
export const apiClient = {
  baseURL: API_BASE_URL,
  mode: API_MODE,
  
  // Helper to check if we're in mock mode
  isMock: () => API_MODE === 'mock',
  
  // Helper to check if we're connected to real API
  isConnected: () => API_MODE === 'connected',
  
  // Get the appropriate service
  getService: () => svc
};

export default apiClient;
