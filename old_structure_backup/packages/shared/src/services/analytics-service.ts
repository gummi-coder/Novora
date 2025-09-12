import { PrismaClient } from '@prisma/client';
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { z } from 'zod';

export const AnalyticsEventSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  type: z.string(),
  category: z.string(),
  action: z.string(),
  properties: z.record(z.unknown()),
  timestamp: z.date(),
  sessionId: z.string().optional(),
  page: z.string().optional(),
  duration: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

export const PerformanceMetricSchema = z.object({
  id: z.string(),
  type: z.enum(['api', 'page_load', 'database', 'frontend']),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export type PerformanceMetric = z.infer<typeof PerformanceMetricSchema>;

export class AnalyticsService {
  private static instance: AnalyticsService;
  private prisma: PrismaClient;
  private redis: Redis;
  private queue: Queue;

  private constructor() {
    this.prisma = new PrismaClient();
    this.redis = new Redis(process.env.REDIS_URL);
    this.queue = new Queue('analytics', {
      connection: this.redis,
    });

    this.setupWorker();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private setupWorker() {
    const worker = new Worker(
      'analytics',
      async (job) => {
        const event = job.data as AnalyticsEvent;
        await this.processEvent(event);
      },
      { connection: this.redis }
    );

    worker.on('completed', (job) => {
      logger.info(`Processed analytics event ${job.id}`);
    });

    worker.on('failed', (job, error) => {
      logger.error(`Failed to process analytics event ${job?.id}:`, error);
    });
  }

  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        ...event,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };

      // Store event in Redis for real-time analytics
      await this.redis.lpush('analytics:events', JSON.stringify(analyticsEvent));

      // Queue event for processing
      await this.queue.add('process', analyticsEvent);

      // Update real-time counters
      await this.updateRealTimeMetrics(analyticsEvent);
    } catch (error) {
      logger.error('Error tracking analytics event:', error);
    }
  }

  async trackPerformanceMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void> {
    try {
      const performanceMetric: PerformanceMetric = {
        ...metric,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };

      // Store metric in Redis for real-time monitoring
      await this.redis.lpush('analytics:metrics', JSON.stringify(performanceMetric));

      // Queue metric for processing
      await this.queue.add('process_metric', performanceMetric);

      // Update real-time performance dashboards
      await this.updatePerformanceDashboards(performanceMetric);
    } catch (error) {
      logger.error('Error tracking performance metric:', error);
    }
  }

  private async processEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Store event in database
      await this.prisma.analyticsEvent.create({
        data: {
          id: event.id,
          userId: event.userId,
          type: event.type,
          category: event.category,
          action: event.action,
          properties: event.properties,
          timestamp: event.timestamp,
          sessionId: event.sessionId,
          page: event.page,
          duration: event.duration,
          metadata: event.metadata,
        },
      });

      // Update aggregated metrics
      await this.updateAggregatedMetrics(event);
    } catch (error) {
      logger.error('Error processing analytics event:', error);
    }
  }

  private async updateRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
    const pipeline = this.redis.pipeline();

    // Update active users
    pipeline.sadd('analytics:active_users', event.userId);
    pipeline.expire('analytics:active_users', 3600); // 1 hour

    // Update page views
    if (event.page) {
      pipeline.hincrby('analytics:page_views', event.page, 1);
    }

    // Update event counts
    pipeline.hincrby('analytics:event_counts', event.type, 1);

    await pipeline.exec();
  }

  private async updatePerformanceDashboards(metric: PerformanceMetric): Promise<void> {
    const pipeline = this.redis.pipeline();

    // Update performance averages
    pipeline.zadd(`analytics:performance:${metric.type}`, {
      [metric.timestamp.getTime()]: metric.value,
    });

    // Update performance percentiles
    pipeline.zremrangebyrank(`analytics:performance:${metric.type}`, 0, -1000); // Keep last 1000 metrics

    await pipeline.exec();
  }

  private async updateAggregatedMetrics(event: AnalyticsEvent): Promise<void> {
    // Update daily metrics
    await this.prisma.analyticsDailyMetrics.upsert({
      where: {
        date_type: {
          date: new Date(event.timestamp).toISOString().split('T')[0],
          type: event.type,
        },
      },
      create: {
        date: new Date(event.timestamp).toISOString().split('T')[0],
        type: event.type,
        count: 1,
        uniqueUsers: event.userId ? 1 : 0,
      },
      update: {
        count: { increment: 1 },
        uniqueUsers: event.userId ? { increment: 1 } : undefined,
      },
    });
  }

  async generateReport(options: {
    startDate: Date;
    endDate: Date;
    metrics: string[];
    dimensions: string[];
    filters?: Record<string, unknown>;
  }): Promise<{
    data: Record<string, unknown>[];
    metadata: {
      total: number;
      startDate: Date;
      endDate: Date;
      generatedAt: Date;
    };
  }> {
    try {
      const { startDate, endDate, metrics, dimensions, filters } = options;

      // Build query based on metrics and dimensions
      const query = this.buildReportQuery(metrics, dimensions, filters);

      // Execute query
      const data = await this.prisma.$queryRaw(query);

      return {
        data,
        metadata: {
          total: data.length,
          startDate,
          endDate,
          generatedAt: new Date(),
        },
      };
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  private buildReportQuery(
    metrics: string[],
    dimensions: string[],
    filters?: Record<string, unknown>
  ): string {
    // Implement query builder based on metrics and dimensions
    // This is a simplified example
    return `
      SELECT
        ${dimensions.join(', ')},
        ${metrics.map(metric => `COUNT(${metric}) as ${metric}_count`).join(', ')}
      FROM analytics_events
      WHERE timestamp BETWEEN :startDate AND :endDate
      ${filters ? `AND ${Object.entries(filters).map(([key, value]) => `${key} = ${value}`).join(' AND ')}` : ''}
      GROUP BY ${dimensions.join(', ')}
    `;
  }

  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    pageViews: Record<string, number>;
    eventCounts: Record<string, number>;
  }> {
    const pipeline = this.redis.pipeline();

    pipeline.scard('analytics:active_users');
    pipeline.hgetall('analytics:page_views');
    pipeline.hgetall('analytics:event_counts');

    const [activeUsers, pageViews, eventCounts] = await pipeline.exec();

    return {
      activeUsers: activeUsers[1] as number,
      pageViews: pageViews[1] as Record<string, number>,
      eventCounts: eventCounts[1] as Record<string, number>,
    };
  }

  async getPerformanceMetrics(
    type: string,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    average: number;
    p95: number;
    p99: number;
    metrics: PerformanceMetric[];
  }> {
    const metrics = await this.redis.zrangebyscore(
      `analytics:performance:${type}`,
      timeRange.start.getTime(),
      timeRange.end.getTime()
    );

    const values = metrics.map(m => JSON.parse(m) as PerformanceMetric);
    const sortedValues = values.map(m => m.value).sort((a, b) => a - b);

    return {
      average: sortedValues.reduce((a, b) => a + b, 0) / sortedValues.length,
      p95: sortedValues[Math.floor(sortedValues.length * 0.95)],
      p99: sortedValues[Math.floor(sortedValues.length * 0.99)],
      metrics: values,
    };
  }
} 