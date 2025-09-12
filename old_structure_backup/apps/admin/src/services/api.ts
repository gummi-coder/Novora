import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password });
    const data = response.data as { token?: string; [key: string]: any };
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    return token ? JSON.parse(atob(token.split('.')[1])) : null;
  },
};

// Survey endpoints
export const surveys = {
  getAll: async () => {
    const response = await api.get('/surveys');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/surveys', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/surveys/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/surveys/${id}`);
    return response.data;
  },
};

// Response endpoints
export const responses = {
  getAll: async () => {
    const response = await api.get('/responses');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/responses/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/responses', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/responses/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/responses/${id}`);
    return response.data;
  },
};

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  createUser: async (userData: { name: string; email: string; password: string; role: string }) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
};

export const companyService = {
  getCompanies: async () => {
    const response = await api.get('/companies');
    return response.data;
  },
  getCompany: async (id: number) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },
  createCompany: async (companyData: {
    name: string;
    plan: 'Basic' | 'Premium' | 'Enterprise';
    users: number;
    activeUsers: number;
    billingCycle: 'Monthly' | 'Annual';
    status: 'Active' | 'Payment Failed' | 'Inactive';
    nextPayment: Date;
    surveysSent: number;
    responsesCollected: number;
    eNPS: number;
    totalEmployees: number;
    managers: number;
    departments: number;
    industry: string;
    companySize: 'Small' | 'Medium' | 'Large' | 'Enterprise';
    foundedYear?: number;
    headquarters?: string;
    website?: string;
  }) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },
  updateCompany: async (id: number, companyData: Partial<{
    name: string;
    plan: 'Basic' | 'Premium' | 'Enterprise';
    users: number;
    activeUsers: number;
    billingCycle: 'Monthly' | 'Annual';
    status: 'Active' | 'Payment Failed' | 'Inactive';
    nextPayment: Date;
    surveysSent: number;
    responsesCollected: number;
    eNPS: number;
    totalEmployees: number;
    managers: number;
    departments: number;
    industry: string;
    companySize: 'Small' | 'Medium' | 'Large' | 'Enterprise';
    foundedYear?: number;
    headquarters?: string;
    website?: string;
  }>) => {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },
  deleteCompany: async (id: number) => {
    await api.delete(`/companies/${id}`);
  },
};

export default api; 