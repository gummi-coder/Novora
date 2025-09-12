import { z } from 'zod';
import { Logger } from '../monitoring/logger';
import { ErrorService, ErrorCategory, ErrorSeverity } from './error-service';
import { LoggingService } from './logging-service';
import { Counter, Gauge, Histogram, Registry } from 'prom-client';
import { createServer } from 'http';
import { promisify } from 'util';
import { exec } from 'child_process';

// Monitoring Configuration Schema
export const MonitoringConfigSchema = z.object({
  prometheus: z.object({
    enabled: z.boolean(),
    port: z.number(),
    path: z.string(),
    defaultLabels: z.record(z.string()).optional()
  }),
  metrics: z.object({
    enabled: z.boolean(),
    collectInterval: z.number(),
    retentionPeriod: z.number()
  }),
  alerts: z.object({
    enabled: z.boolean(),
    thresholds: z.record(z.number()),
    notificationChannels: z.array(z.string())
  }),
  dashboards: z.object({
    enabled: z.boolean(),
    refreshInterval: z.number(),
    defaultTimezone: z.string()
  }),
  options: z.record(z.unknown()).optional()
});

// Metric Schema
export const MetricSchema = z.object({
  name: z.string(),
  type: z.enum(['counter', 'gauge', 'histogram']),
  help: z.string(),
  labels: z.array(z.string()).optional(),
  buckets: z.array(z.number()).optional()
});

export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;
export type Metric = z.infer<typeof MetricSchema>;

export class MonitoringService {
  private readonly logger: Logger;
  private readonly errorService: ErrorService;
  private readonly loggingService: LoggingService;
  private readonly config: MonitoringConfig;
  private readonly registry: Registry;
  private readonly metrics: Map<string, Counter | Gauge | Histogram>;
  private readonly server: any;

  constructor(config: MonitoringConfig) {
    this.logger = new Logger();
    this.errorService = new ErrorService();
    this.loggingService = new LoggingService();
    this.config = MonitoringConfigSchema.parse(config);
    this.registry = new Registry();
    this.metrics = new Map();

    // Initialize Prometheus server
    if (this.config.prometheus.enabled) {
      this.server = createServer(async (req, res) => {
        if (req.url === this.config.prometheus.path) {
          res.setHeader('Content-Type', this.registry.contentType);
          res.end(await this.registry.metrics());
        } else {
          res.statusCode = 404;
          res.end();
        }
      });

      this.server.listen(this.config.prometheus.port);
    }

    // Initialize default metrics
    this.initializeDefaultMetrics();
  }

  // Metric Management
  public registerMetric(metric: Metric): void {
    try {
      MetricSchema.parse(metric);

      let promMetric: Counter | Gauge | Histogram;
      switch (metric.type) {
        case 'counter':
          promMetric = new Counter({
            name: metric.name,
            help: metric.help,
            labelNames: metric.labels,
            registers: [this.registry]
          });
          break;
        case 'gauge':
          promMetric = new Gauge({
            name: metric.name,
            help: metric.help,
            labelNames: metric.labels,
            registers: [this.registry]
          });
          break;
        case 'histogram':
          promMetric = new Histogram({
            name: metric.name,
            help: metric.help,
            labelNames: metric.labels,
            buckets: metric.buckets,
            registers: [this.registry]
          });
          break;
        default:
          throw new Error(`Unsupported metric type: ${metric.type}`);
      }

      this.metrics.set(metric.name, promMetric);
      await this.logAudit('register', 'metric', metric.name, metric);
    } catch (error) {
      throw this.errorService.createError(
        'METRIC_REGISTRATION_FAILED',
        ErrorCategory.MONITORING,
        ErrorSeverity.ERROR,
        'Failed to register metric',
        { metric, error }
      );
    }
  }

  public recordMetric(
    name: string,
    value: number,
    labels?: Record<string, string>
  ): void {
    try {
      const metric = this.metrics.get(name);
      if (!metric) {
        throw new Error(`Metric ${name} not found`);
      }

      if (metric instanceof Counter) {
        metric.inc(labels, value);
      } else if (metric instanceof Gauge) {
        metric.set(labels, value);
      } else if (metric instanceof Histogram) {
        metric.observe(labels, value);
      }

      await this.logAudit('record', 'metric', name, {
        value,
        labels
      });
    } catch (error) {
      throw this.errorService.createError(
        'METRIC_RECORDING_FAILED',
        ErrorCategory.MONITORING,
        ErrorSeverity.ERROR,
        'Failed to record metric',
        { name, value, labels, error }
      );
    }
  }

  // Performance Monitoring
  public async monitorPerformance(
    operation: string,
    fn: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      await fn();
      const duration = Date.now() - startTime;
      this.recordMetric('operation_duration_seconds', duration / 1000, {
        operation,
        status: 'success'
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetric('operation_duration_seconds', duration / 1000, {
        operation,
        status: 'error'
      });
      throw error;
    }
  }

  // Resource Monitoring
  public async monitorResources(): Promise<void> {
    try {
      const { stdout } = await promisify(exec)('ps -o %cpu,%mem,command');
      const lines = stdout.split('\n').slice(1);
      
      for (const line of lines) {
        const [cpu, mem, command] = line.trim().split(/\s+/);
        this.recordMetric('process_cpu_usage', parseFloat(cpu), { command });
        this.recordMetric('process_memory_usage', parseFloat(mem), { command });
      }
    } catch (error) {
      throw this.errorService.createError(
        'RESOURCE_MONITORING_FAILED',
        ErrorCategory.MONITORING,
        ErrorSeverity.ERROR,
        'Failed to monitor resources',
        { error }
      );
    }
  }

  // Alert Management
  public async checkAlerts(): Promise<void> {
    try {
      for (const [metricName, threshold] of Object.entries(
        this.config.alerts.thresholds
      )) {
        const metric = this.metrics.get(metricName);
        if (!metric) continue;

        const value = await this.getMetricValue(metricName);
        if (value > threshold) {
          await this.triggerAlert(metricName, value, threshold);
        }
      }
    } catch (error) {
      throw this.errorService.createError(
        'ALERT_CHECK_FAILED',
        ErrorCategory.MONITORING,
        ErrorSeverity.ERROR,
        'Failed to check alerts',
        { error }
      );
    }
  }

  // Helper methods
  private initializeDefaultMetrics(): void {
    // API Metrics
    this.registerMetric({
      name: 'http_requests_total',
      type: 'counter',
      help: 'Total number of HTTP requests',
      labels: ['method', 'path', 'status']
    });

    this.registerMetric({
      name: 'http_request_duration_seconds',
      type: 'histogram',
      help: 'HTTP request duration in seconds',
      labels: ['method', 'path'],
      buckets: [0.1, 0.5, 1, 2, 5]
    });

    // Database Metrics
    this.registerMetric({
      name: 'db_queries_total',
      type: 'counter',
      help: 'Total number of database queries',
      labels: ['operation', 'table']
    });

    this.registerMetric({
      name: 'db_query_duration_seconds',
      type: 'histogram',
      help: 'Database query duration in seconds',
      labels: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1]
    });

    // Cache Metrics
    this.registerMetric({
      name: 'cache_operations_total',
      type: 'counter',
      help: 'Total number of cache operations',
      labels: ['operation', 'status']
    });

    this.registerMetric({
      name: 'cache_hit_ratio',
      type: 'gauge',
      help: 'Cache hit ratio',
      labels: ['cache']
    });

    // Resource Metrics
    this.registerMetric({
      name: 'process_cpu_usage',
      type: 'gauge',
      help: 'Process CPU usage percentage',
      labels: ['command']
    });

    this.registerMetric({
      name: 'process_memory_usage',
      type: 'gauge',
      help: 'Process memory usage percentage',
      labels: ['command']
    });
  }

  private async getMetricValue(name: string): Promise<number> {
    const metric = this.metrics.get(name);
    if (!metric) return 0;

    if (metric instanceof Counter || metric instanceof Gauge) {
      return metric.get();
    }

    if (metric instanceof Histogram) {
      const { sum, count } = await metric.get();
      return count > 0 ? sum / count : 0;
    }

    return 0;
  }

  private async triggerAlert(
    metricName: string,
    value: number,
    threshold: number
  ): Promise<void> {
    const alert = {
      metric: metricName,
      value,
      threshold,
      timestamp: new Date()
    };

    // Send alert to notification channels
    for (const channel of this.config.alerts.notificationChannels) {
      await this.sendAlert(channel, alert);
    }

    await this.logAudit('alert', 'metric', metricName, alert);
  }

  private async sendAlert(
    channel: string,
    alert: Record<string, unknown>
  ): Promise<void> {
    // Implement alert sending logic for different channels
    // (e.g., email, Slack, PagerDuty)
  }

  private async logAudit(
    action: string,
    resource: string,
    resourceId: string,
    changes?: Record<string, unknown>
  ): Promise<void> {
    await this.loggingService.info('Monitoring audit log', {
      action,
      resource,
      resourceId,
      changes,
      timestamp: new Date()
    });
  }

  // Cleanup
  public async cleanup(): Promise<void> {
    if (this.server) {
      await new Promise((resolve) => this.server.close(resolve));
    }
    this.metrics.clear();
  }
} 