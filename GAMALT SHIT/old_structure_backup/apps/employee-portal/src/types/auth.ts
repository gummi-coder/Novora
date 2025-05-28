export type UserRole = 'user' | 'admin' | 'tenant' | 'dashboard_admin';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

export interface Role {
  id: string;
  name: UserRole;
  permissions: Permission[];
  description: string;
}

export interface MFASettings {
  enabled: boolean;
  type: 'totp' | 'sms' | null;
  secret?: string;
  phoneNumber?: string;
  verified: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  mfa: MFASettings;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  emailVerificationToken?: string;
  emailVerificationExpires?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  mfaRequired: boolean;
  mfaVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
} 