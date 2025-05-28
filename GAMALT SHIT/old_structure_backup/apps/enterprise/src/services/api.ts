import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      message: error.response.data.message || 'An error occurred',
      code: error.response.data.code || 'UNKNOWN_ERROR',
      status: error.response.status,
    };
  }
  return {
    message: 'Network error occurred',
    code: 'NETWORK_ERROR',
    status: 0,
  };
}; 