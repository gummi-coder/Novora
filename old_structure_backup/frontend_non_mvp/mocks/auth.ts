// Mock authentication service
export const mockAuthService = {
  login: async (credentials: any) => {
    return {
      access_token: 'mock-token',
      user: {
        id: 1,
        email: credentials.email,
        role: 'admin',
        company_name: 'Mock Company'
      }
    };
  },
  
  logout: async () => {
    return { success: true };
  },
  
  getCurrentUser: async () => {
    return {
      id: 1,
      email: 'admin@novora.com',
      role: 'admin',
      company_name: 'Mock Company'
    };
  }
};
