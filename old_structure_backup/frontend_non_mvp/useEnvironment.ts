import { useMemo } from 'react';
import {
  config,
  apiConfig,
  featureFlags,
  getCurrentEnvironment,
  isDevelopment,
  isStaging,
  isProduction,
  debug,
  log,
} from '@/config/environment';

/**
 * Custom hook for accessing environment configuration and utilities
 */
export const useEnvironment = () => {
  const environment = useMemo(() => getCurrentEnvironment(), []);
  
  const isDev = useMemo(() => isDevelopment(), []);
  const isStagingEnv = useMemo(() => isStaging(), []);
  const isProd = useMemo(() => isProduction(), []);
  
  const api = useMemo(() => apiConfig, []);
  const features = useMemo(() => featureFlags, []);
  const app = useMemo(() => config.app, []);
  const security = useMemo(() => config.security, []);
  
  // Environment-specific utilities
  const utils = useMemo(() => ({
    debug: (message: string, ...args: any[]) => debug(message, ...args),
    log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]) => 
      log(level, message, ...args),
    
    // Environment checks
    isDevelopment: isDev,
    isStaging: isStagingEnv,
    isProduction: isProd,
    
    // Feature checks
    hasFeature: (feature: keyof typeof featureFlags) => features[feature],
    
    // API utilities
    getApiUrl: (endpoint: string) => `${api.fullUrl}${endpoint}`,
    getApiHeaders: () => ({
      'Content-Type': 'application/json',
      'X-App-Version': app.version,
      'X-Environment': environment,
    }),
    
    // Security utilities
    shouldUseHttps: security.enableHttps,
    shouldEnableCors: security.enableCors,
    
    // Development utilities
    getDevInfo: () => isDev ? {
      environment: environment,
      apiUrl: api.fullUrl,
      features: features,
      debug: app.debug,
      logLevel: app.logLevel,
    } : null,
  }), [environment, isDev, isStagingEnv, isProd, features, api, app, security]);
  
  return {
    // Current environment
    environment,
    
    // Environment checks
    isDevelopment: isDev,
    isStaging: isStagingEnv,
    isProduction: isProd,
    
    // Configuration
    config,
    api,
    features,
    app,
    security,
    
    // Utilities
    utils,
    
    // Feature flags
    featureFlags: features,
    
    // API configuration
    apiConfig: api,
  };
};

/**
 * Hook for feature-specific functionality
 */
export const useFeature = (feature: keyof typeof featureFlags) => {
  const { features, isDevelopment } = useEnvironment();
  
  const isEnabled = features[feature];
  const canUse = isEnabled || isDevelopment;
  
  return {
    isEnabled,
    canUse,
    isDevelopment,
    feature,
  };
};

/**
 * Hook for API-specific functionality
 */
export const useApi = () => {
  const { api, utils, isProduction } = useEnvironment();
  
  return {
    baseUrl: api.baseUrl,
    fullUrl: api.fullUrl,
    version: api.version,
    timeout: api.timeout,
    retryAttempts: api.retryAttempts,
    
    // Utilities
    getUrl: utils.getApiUrl,
    getHeaders: utils.getApiHeaders,
    
    // Environment-specific settings
    shouldUseHttps: isProduction,
    enableRetries: true,
    enableLogging: !isProduction,
  };
};

export default useEnvironment;
