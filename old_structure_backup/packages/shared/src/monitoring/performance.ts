import { v4 as uuidv4 } from 'uuid';
import { PerformanceMetric, performanceMetricSchema } from './types';
import { backendConfig } from '../config/backend';

// Metric collector interface
interface MetricCollector {
  record(metric: Omit<PerformanceMetric, 'timestamp' | 'metadata'>): Promise<void>;
}

// Prometheus transport
class PrometheusCollector implements MetricCollector {
  private readonly metrics: Map<string, number> = new Map();

  async record(metric: Omit<PerformanceMetric, 'timestamp' | 'metadata'>): Promise<void> {
    const { name, value, unit, tags } = metric;
    const metricKey = this.getMetricKey(name, tags);
    
    // In a real implementation, you would use a Prometheus client
    // to record the metric with proper labels
    this.metrics.set(metricKey, value);
    
    console.log(`[PrometheusCollector] Recording metric ${metricKey}: ${value}${unit}`);
  }

  private getMetricKey(name: string, tags: Record<string, string>): string {
    const tagString = Object.entries(tags)
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');
    return `${name}{${tagString}}`;
  }
}

// StatsD transport
class StatsDCollector implements MetricCollector {
  private readonly host: string;
  private readonly port: number;

  constructor(host: string = 'localhost', port: number = 8125) {
    this.host = host;
    this.port = port;
  }

  async record(metric: Omit<PerformanceMetric, 'timestamp' | 'metadata'>): Promise<void> {
    const { name, value, unit, tags } = metric;
    
    // In a real implementation, you would use a StatsD client
    // to send the metric over UDP
    console.log(
      `[StatsDCollector] Sending to ${this.host}:${this.port}: ` +
      `${name}:${value}${unit}|${Object.entries(tags).map(([k, v]) => `${k}=${v}`).join(',')}`
    );
  }
}

// Performance monitoring manager
export class PerformanceMonitor {
  private readonly collectors: MetricCollector[];

  constructor(collectors: MetricCollector[]) {
    this.collectors = collectors;
  }

  async recordMetric(
    name: string,
    value: number,
    unit: string,
    tags: Record<string, string> = {}
  ): Promise<void> {
    const metric: Omit<PerformanceMetric, 'timestamp' | 'metadata'> = {
      name,
      value,
      unit,
      tags: {
        ...tags,
        environment: backendConfig.NODE_ENV,
        service: backendConfig.APP_NAME,
      },
    };

    await Promise.all(
      this.collectors.map(collector => collector.record(metric))
    );
  }

  // Helper methods for common metrics
  async recordResponseTime(
    path: string,
    method: string,
    duration: number,
    statusCode: number
  ): Promise<void> {
    await this.recordMetric('http_response_time', duration, 'ms', {
      path,
      method,
      status_code: statusCode.toString(),
    });
  }

  async recordDatabaseQueryTime(
    query: string,
    duration: number,
    success: boolean
  ): Promise<void> {
    await this.recordMetric('db_query_time', duration, 'ms', {
      query,
      success: success.toString(),
    });
  }

  async recordMemoryUsage(usage: number): Promise<void> {
    await this.recordMetric('memory_usage', usage, 'bytes');
  }

  async recordCPUUsage(usage: number): Promise<void> {
    await this.recordMetric('cpu_usage', usage, 'percent');
  }
}

// Create default performance monitor instance
export const performanceMonitor = new PerformanceMonitor([
  new PrometheusCollector(),
  new StatsDCollector(),
]); 