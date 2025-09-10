/**
 * Environment configuration for Novora Survey Platform
 * Supports development, staging, and production environments
 */

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  // API Configuration
  api: {
    baseUrl: string;
    version: string;
    timeout: number;
    retryAttempts: number;
  };
  
  // App Configuration
  app: {
    name: string;
    version: string;
    environment: Environment;
    debug: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  
  // Feature Flags
  features: {
    autoPilot: boolean;
    advancedAnalytics: boolean;
    sso: boolean;
    apiKeys: boolean;
    webhooks: boolean;
    realTimeUpdates: boolean;
  };
  
  // External Services
  services: {
    analytics: string | null;
    monitoring: string | null;
    support: string | null;
  };
  
  // Security
  security: {
    enableHttps: boolean;
    enableCors: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
}

// Default configuration
const defaultConfig: EnvironmentConfig = {
  api: {
    baseUrl: 'http://127.0.0.1:8001',
    version: 'v1',
    timeout: 30000,
    retryAttempts: 3,
  },
  app: {
    name: 'Novora Survey Platform',
    version: '1.0.0',
    environment: 'development',
    debug: true,
    logLevel: 'debug',
  },
  features: {
    autoPilot: true,
    advancedAnalytics: true,
    sso: false,
    apiKeys: false,
    webhooks: false,
    realTimeUpdates: false,
  },
  services: {
    analytics: null,
    monitoring: null,
    support: null,
  },
  security: {
    enableHttps: false,
    enableCors: true,
    sessionTimeout: 3600000, // 1 hour
    maxLoginAttempts: 5,
  },
};

// Environment-specific configurations
const environmentConfigs: Record<Environment, Partial<EnvironmentConfig>> = {
  development: {
    api: {
      baseUrl: 'http://127.0.0.1:8001',
      timeout: 60000, // Longer timeout for development
    },
    app: {
      debug: true,
      logLevel: 'debug',
    },
    features: {
      autoPilot: true,
      advancedAnalytics: true,
      sso: false,
      apiKeys: false,
      webhooks: false,
      realTimeUpdates: false,
    },
    security: {
      enableHttps: false,
      enableCors: true,
    },
  },
  
  staging: {
    api: {
      baseUrl: 'https://staging-api.novora.com',
      timeout: 30000,
    },
    app: {
      debug: false,
      logLevel: 'info',
    },
    features: {
      autoPilot: true,
      advancedAnalytics: true,
      sso: true,
      apiKeys: true,
      webhooks: true,
      realTimeUpdates: true,
    },
    security: {
      enableHttps: true,
      enableCors: true,
    },
  },
  
  production: {
    api: {
      baseUrl: 'https://api.novora.com',
      timeout: 30000,
    },
    app: {
      debug: false,
      logLevel: 'warn',
    },
    features: {
      autoPilot: true,
      advancedAnalytics: true,
      sso: true,
      apiKeys: true,
      webhooks: true,
      realTimeUpdates: true,
    },
    security: {
      enableHttps: true,
      enableCors: false, // Restrict CORS in production
    },
  },
};

// Get current environment
export const getCurrentEnvironment = (): Environment => {
  // Check Vite environment variable first
  const viteMode = import.meta.env.MODE as Environment;
  if (viteMode && ['development', 'staging', 'production'].includes(viteMode)) {
    return viteMode;
  }
  
  // Check custom environment variable
  const customEnv = import.meta.env.VITE_APP_ENVIRONMENT as Environment;
  if (customEnv && ['development', 'staging', 'production'].includes(customEnv)) {
    return customEnv;
  }
  
  // Check NODE_ENV
  const nodeEnv = import.meta.env.NODE_ENV as Environment;
  if (nodeEnv === 'production') {
    return 'production';
  }
  
  // Default to development
  return 'development';
};

// Get environment configuration
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const currentEnv = getCurrentEnvironment();
  const envConfig = environmentConfigs[currentEnv] || {};
  
  // Merge configurations
  const config: EnvironmentConfig = {
    ...defaultConfig,
    ...envConfig,
    app: {
      ...defaultConfig.app,
      ...envConfig.app,
      environment: currentEnv,
    },
    api: {
      ...defaultConfig.api,
      ...envConfig.api,
    },
    features: {
      ...defaultConfig.features,
      ...envConfig.features,
    },
    services: {
      ...defaultConfig.services,
      ...envConfig.services,
    },
    security: {
      ...defaultConfig.security,
      ...envConfig.security,
    },
  };
  
  // Override with environment variables if present
  if (import.meta.env.VITE_API_BASE_URL) {
    config.api.baseUrl = import.meta.env.VITE_API_BASE_URL;
  }
  
  if (import.meta.env.VITE_APP_DEBUG !== undefined) {
    config.app.debug = import.meta.env.VITE_APP_DEBUG === 'true';
  }
  
  if (import.meta.env.VITE_LOG_LEVEL) {
    config.app.logLevel = import.meta.env.VITE_LOG_LEVEL as any;
  }
  
  return config;
};

// Get API configuration
export const getApiConfig = () => {
  const config = getEnvironmentConfig();
  return {
    baseUrl: config.api.baseUrl,
    version: config.api.version,
    fullUrl: `${config.api.baseUrl}/api/${config.api.version}`,
    timeout: config.api.timeout,
    retryAttempts: config.api.retryAttempts,
  };
};

// Get feature flags
export const getFeatureFlags = () => {
  return getEnvironmentConfig().features;
};

// Check if feature is enabled
export const isFeatureEnabled = (feature: keyof EnvironmentConfig['features']): boolean => {
  const features = getFeatureFlags();
  return features[feature] || false;
};

// Environment utilities
export const isDevelopment = (): boolean => getCurrentEnvironment() === 'development';
export const isStaging = (): boolean => getCurrentEnvironment() === 'staging';
export const isProduction = (): boolean => getCurrentEnvironment() === 'production';

// Debug utilities
export const debug = (message: string, ...args: any[]) => {
  const config = getEnvironmentConfig();
  if (config.app.debug) {
    console.log(`[${config.app.name}] ${message}`, ...args);
  }
};

export const log = (level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]) => {
  const config = getEnvironmentConfig();
  const currentLevel = config.app.logLevel;
  
  const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };
  
  if (levels[level] >= levels[currentLevel]) {
    const logMethod = console[level] || console.log;
    logMethod(`[${config.app.name}] [${level.toUpperCase()}] ${message}`, ...args);
  }
};

// Export current configuration
export const config = getEnvironmentConfig();
export const apiConfig = getApiConfig();
export const featureFlags = getFeatureFlags();
