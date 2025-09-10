export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
  companyId: string;
  company_name?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName: string;
  plan: 'enterprise' | 'pro' | 'core';
} 