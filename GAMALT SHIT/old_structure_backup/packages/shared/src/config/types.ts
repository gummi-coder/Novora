import { z } from 'zod';

// Environment type
export type Environment = 'development' | 'staging' | 'production';

// Base configuration schema (shared between frontend and backend)
export const baseConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  API_URL: z.string().url(),
  APP_NAME: z.string(),
  APP_VERSION: z.string(),
  DEBUG: z.boolean().default(false),
});

// Backend-specific configuration schema
export const backendConfigSchema = baseConfigSchema.extend({
  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.number().int().min(1).default(2),
  DATABASE_POOL_MAX: z.number().int().min(1).default(10),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1d'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  
  // External Services
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.number().int(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string().email(),
  
  // Storage
  STORAGE_BUCKET: z.string(),
  STORAGE_REGION: z.string(),
  STORAGE_ACCESS_KEY: z.string(),
  STORAGE_SECRET_KEY: z.string(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  SENTRY_DSN: z.string().url().optional(),
});

// Frontend-specific configuration schema
export const frontendConfigSchema = baseConfigSchema.extend({
  // Public API endpoints
  API_BASE_URL: z.string().url(),
  
  // Feature flags
  ENABLE_ANALYTICS: z.boolean().default(false),
  ENABLE_FEATURE_X: z.boolean().default(false),
  
  // External services (public keys only)
  STRIPE_PUBLISHABLE_KEY: z.string(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  
  // App settings
  DEFAULT_LOCALE: z.string().default('en'),
  SUPPORTED_LOCALES: z.array(z.string()).default(['en']),
  DEFAULT_THEME: z.enum(['light', 'dark', 'system']).default('system'),
});

// Type inference
export type BaseConfig = z.infer<typeof baseConfigSchema>;
export type BackendConfig = z.infer<typeof backendConfigSchema>;
export type FrontendConfig = z.infer<typeof frontendConfigSchema>; 