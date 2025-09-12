import axios from 'axios';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    await axios.post(`${API_URL}/auth/logout`);
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/refresh-token`);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await axios.post(`${API_URL}/auth/forgot-password`, { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await axios.post(`${API_URL}/auth/reset-password`, { token, password });
  },

  async verifyEmail(token: string): Promise<void> {
    await axios.get(`${API_URL}/auth/verify-email/${token}`);
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}; 