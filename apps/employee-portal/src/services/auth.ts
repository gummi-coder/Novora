import api from './api';
import { 
  LoginCredentials, 
  RegisterData, 
  PasswordResetRequest, 
  PasswordResetConfirm,
  EmailVerificationRequest,
  MFASetupResponse,
  User
} from '../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mfaVerified');
    window.location.href = '/login';
  },

  // MFA Methods
  setupMFA: async (type: 'totp' | 'sms'): Promise<MFASetupResponse> => {
    const response = await api.post('/auth/mfa/setup', { type });
    return response.data;
  },

  verifyMFA: async (code: string) => {
    const response = await api.post('/auth/mfa/verify', { code });
    return response.data;
  },

  disableMFA: async () => {
    const response = await api.post('/auth/mfa/disable');
    return response.data;
  },

  // Password Reset Methods
  requestPasswordReset: async (data: PasswordResetRequest) => {
    const response = await api.post('/auth/password/reset-request', data);
    return response.data;
  },

  resetPassword: async (data: PasswordResetConfirm) => {
    const response = await api.post('/auth/password/reset', data);
    return response.data;
  },

  // Email Verification Methods
  requestEmailVerification: async (data: EmailVerificationRequest) => {
    const response = await api.post('/auth/email/verify-request', data);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/email/verify', { token });
    return response.data;
  },

  // User Profile Methods
  updateProfile: async (data: Partial<User>) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/password/change', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Session Management
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },

  // Role and Permission Methods
  getUserRoles: async () => {
    const response = await api.get('/auth/roles');
    return response.data;
  },

  getUserPermissions: async () => {
    const response = await api.get('/auth/permissions');
    return response.data;
  },
}; 