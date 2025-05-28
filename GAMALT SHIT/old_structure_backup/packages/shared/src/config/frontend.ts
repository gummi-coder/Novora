import { z } from 'zod';
import { frontendConfigSchema, FrontendConfig } from './types';

// Validate and transform environment variables
const validateConfig = (): FrontendConfig => {
  try {
    // Transform environment variables to match schema
    const envConfig = {
      NODE_ENV: import.meta.env.MODE,
      API_URL: import.meta.env.VITE_API_URL,
      APP_NAME: import.meta.env.VITE_APP_NAME,
      APP_VERSION: import.meta.env.VITE_APP_VERSION,
      DEBUG: import.meta.env.VITE_DEBUG === 'true',
      
      // Public API endpoints
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      
      // Feature flags
      ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      ENABLE_FEATURE_X: import.meta.env.VITE_ENABLE_FEATURE_X === 'true',
      
      // External services (public keys only)
      STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
      
      // App settings
      DEFAULT_LOCALE: import.meta.env.VITE_DEFAULT_LOCALE,
      SUPPORTED_LOCALES: import.meta.env.VITE_SUPPORTED_LOCALES?.split(',') || ['en'],
      DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME,
    };

    return frontendConfigSchema.parse(envConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(`Invalid environment configuration: ${missingVars}`);
    }
    throw error;
  }
};

// Export singleton instance
export const frontendConfig = validateConfig();

// Export type
export type Config = FrontendConfig; 