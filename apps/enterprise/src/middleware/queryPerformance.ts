import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: string;
}

class QueryPerformanceMonitor {
  private static metrics: QueryMetrics[] = [];
  private static readonly MAX_METRICS = 1000;

  static addMetric(metric: QueryMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }

  static getMetrics() {
    return this.metrics;
  }

  static getAverageDuration() {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.length;
  }

  static getSlowestQueries(limit: number = 10) {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}

export function queryPerformanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = performance.now();

  // Capture response finish
  res.on('finish', () => {
    const duration = performance.now() - start;
    
    QueryPerformanceMonitor.addMetric({
      query: `${req.method} ${req.url}`,
      duration,
      timestamp: new Date().toISOString()
    });

    // Log slow queries
    if (duration > 1000) { // Log queries taking more than 1 second
      console.warn(`Slow query detected: ${req.method} ${req.url} - ${duration.toFixed(2)}ms`);
    }
  });

  next();
}

export function getQueryMetrics() {
  return {
    averageDuration: QueryPerformanceMonitor.getAverageDuration(),
    slowestQueries: QueryPerformanceMonitor.getSlowestQueries(),
    totalQueries: QueryPerformanceMonitor.getMetrics().length
  };
} 