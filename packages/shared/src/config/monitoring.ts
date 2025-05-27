import { z } from 'zod';
import { MonitoringConfigSchema } from '../services/monitoring-service';

// Default configuration
const defaultConfig = {
  prometheus: {
    enabled: true,
    port: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
    path: process.env.PROMETHEUS_PATH || '/metrics',
    defaultLabels: {
      environment: process.env.NODE_ENV || 'development',
      application: process.env.APP_NAME || 'novora'
    }
  },
  metrics: {
    enabled: true,
    collectInterval: parseInt(process.env.METRICS_COLLECT_INTERVAL || '15000', 10),
    retentionPeriod: parseInt(process.env.METRICS_RETENTION_PERIOD || '604800', 10) // 7 days
  },
  alerts: {
    enabled: true,
    thresholds: {
      http_request_duration_seconds: 2, // 2 seconds
      db_query_duration_seconds: 1, // 1 second
      process_cpu_usage: 80, // 80%
      process_memory_usage: 80, // 80%
      cache_hit_ratio: 0.5 // 50%
    },
    notificationChannels: (process.env.ALERT_CHANNELS || 'email,slack').split(',')
  },
  dashboards: {
    enabled: true,
    refreshInterval: parseInt(process.env.DASHBOARD_REFRESH_INTERVAL || '30000', 10),
    defaultTimezone: process.env.DASHBOARD_TIMEZONE || 'UTC'
  }
};

// Environment-specific configuration
const envConfig = {
  development: {
    prometheus: {
      enabled: true
    },
    metrics: {
      collectInterval: 30000 // 30 seconds
    },
    alerts: {
      enabled: false
    }
  },
  production: {
    prometheus: {
      enabled: true
    },
    metrics: {
      collectInterval: 15000 // 15 seconds
    },
    alerts: {
      enabled: true,
      thresholds: {
        http_request_duration_seconds: 1, // 1 second
        db_query_duration_seconds: 0.5, // 0.5 seconds
        process_cpu_usage: 70, // 70%
        process_memory_usage: 70, // 70%
        cache_hit_ratio: 0.7 // 70%
      }
    }
  },
  test: {
    prometheus: {
      enabled: false
    },
    metrics: {
      enabled: false
    },
    alerts: {
      enabled: false
    },
    dashboards: {
      enabled: false
    }
  }
};

// Validate and merge configuration
export function getMonitoringConfig(): z.infer<typeof MonitoringConfigSchema> {
  const env = process.env.NODE_ENV || 'development';
  const config = {
    ...defaultConfig,
    ...envConfig[env as keyof typeof envConfig]
  };

  return MonitoringConfigSchema.parse(config);
}

// Export configuration
export const monitoringConfig = getMonitoringConfig(); 