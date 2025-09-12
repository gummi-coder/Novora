import { z } from 'zod';
import { TestingConfigSchema } from '../services/testing-service';

// Default configuration
const defaultConfig = {
  unit: {
    enabled: true,
    framework: 'vitest',
    coverage: true,
    timeout: 5000,
    retries: 2
  },
  integration: {
    enabled: true,
    framework: 'supertest',
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
    retries: 1
  },
  performance: {
    enabled: true,
    framework: 'k6',
    scenarios: [
      'tests/performance/api-load.js',
      'tests/performance/db-throughput.js'
    ],
    thresholds: {
      'http_req_duration': 2000, // 2 seconds
      'http_req_failed': 0.01, // 1% error rate
      'db_query_duration': 1000 // 1 second
    },
    duration: 300 // 5 minutes
  },
  reporting: {
    enabled: true,
    format: 'json',
    output: process.env.TEST_REPORT_DIR || 'reports',
    retention: 30 // 30 days
  }
};

// Environment-specific configuration
const envConfig = {
  development: {
    unit: {
      timeout: 10000
    },
    integration: {
      timeout: 20000
    },
    performance: {
      enabled: false
    }
  },
  production: {
    unit: {
      timeout: 5000
    },
    integration: {
      timeout: 10000
    },
    performance: {
      enabled: true,
      duration: 600 // 10 minutes
    }
  },
  test: {
    unit: {
      enabled: true
    },
    integration: {
      enabled: false
    },
    performance: {
      enabled: false
    },
    reporting: {
      enabled: false
    }
  }
};

// Validate and merge configuration
export function getTestingConfig(): z.infer<typeof TestingConfigSchema> {
  const env = process.env.NODE_ENV || 'development';
  const config = {
    ...defaultConfig,
    ...envConfig[env as keyof typeof envConfig]
  };

  return TestingConfigSchema.parse(config);
}

// Export configuration
export const testingConfig = getTestingConfig(); 