import { config as dotenvConfig } from 'dotenv';
import { expand } from 'dotenv-expand';
import { z } from 'zod';
import { backendConfigSchema, BackendConfig, Environment } from './types';

// Load environment variables
const loadEnv = (env: Environment) => {
  const baseEnv = dotenvConfig({ path: '.env' });
  const envSpecific = dotenvConfig({ path: `.env.${env}` });
  const localEnv = dotenvConfig({ path: '.env.local' });

  expand(baseEnv);
  expand(envSpecific);
  expand(localEnv);
};

// Validate and transform environment variables
const validateConfig = (): BackendConfig => {
  try {
    // Transform environment variables to match schema
    const envConfig = {
      NODE_ENV: process.env.NODE_ENV,
      API_URL: process.env.API_URL,
      APP_NAME: process.env.APP_NAME,
      APP_VERSION: process.env.APP_VERSION,
      DEBUG: process.env.DEBUG === 'true',
      
      // Database
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_POOL_MIN: Number(process.env.DATABASE_POOL_MIN),
      DATABASE_POOL_MAX: Number(process.env.DATABASE_POOL_MAX),
      
      // Authentication
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
      REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
      
      // External Services
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      
      // Email
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: Number(process.env.SMTP_PORT),
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
      
      // Storage
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      STORAGE_REGION: process.env.STORAGE_REGION,
      STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY,
      STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY,
      
      // Logging
      LOG_LEVEL: process.env.LOG_LEVEL,
      SENTRY_DSN: process.env.SENTRY_DSN,
    };

    return backendConfigSchema.parse(envConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(`Invalid environment configuration: ${missingVars}`);
    }
    throw error;
  }
};

// Initialize configuration
const initConfig = (): BackendConfig => {
  const env = (process.env.NODE_ENV || 'development') as Environment;
  loadEnv(env);
  return validateConfig();
};

// Export singleton instance
export const backendConfig = initConfig();

// Export type
export type Config = BackendConfig; 