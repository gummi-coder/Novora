import { z } from 'zod';
import { AssetOptimizationConfigSchema } from '../services/asset-optimization-service';

// Default configuration
const defaultConfig = {
  imageOptimization: {
    enabled: true,
    formats: ['webp', 'avif', 'jpeg', 'png'],
    quality: 80,
    maxWidth: 1920,
    responsive: true,
    cdn: {
      enabled: process.env.ASSET_CDN_ENABLED === 'true',
      domain: process.env.ASSET_CDN_DOMAIN,
      path: process.env.ASSET_CDN_PATH
    }
  },
  bundling: {
    enabled: true,
    minify: process.env.NODE_ENV === 'production',
    sourceMaps: process.env.NODE_ENV !== 'production',
    splitChunks: true,
    cache: true
  },
  lazyLoading: {
    enabled: true,
    preload: true,
    prefetch: true,
    threshold: 0.1
  }
};

// Environment-specific configuration
const envConfig = {
  development: {
    imageOptimization: {
      quality: 90,
      responsive: false
    },
    bundling: {
      minify: false,
      sourceMaps: true
    }
  },
  production: {
    imageOptimization: {
      quality: 80,
      responsive: true
    },
    bundling: {
      minify: true,
      sourceMaps: false
    }
  },
  test: {
    imageOptimization: {
      enabled: false
    },
    bundling: {
      enabled: false
    },
    lazyLoading: {
      enabled: false
    }
  }
};

// Validate and merge configuration
export function getAssetOptimizationConfig(): z.infer<typeof AssetOptimizationConfigSchema> {
  const env = process.env.NODE_ENV || 'development';
  const config = {
    ...defaultConfig,
    ...envConfig[env as keyof typeof envConfig]
  };

  return AssetOptimizationConfigSchema.parse(config);
}

// Export configuration
export const assetOptimizationConfig = getAssetOptimizationConfig(); 