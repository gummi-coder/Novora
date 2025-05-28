import { z } from 'zod';

// Log levels
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Log entry schema
export const logEntrySchema = z.object({
  timestamp: z.string(),
  level: z.enum(['error', 'warn', 'info', 'debug']),
  message: z.string(),
  context: z.record(z.unknown()).optional(),
  error: z.object({
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
    code: z.string().optional(),
  }).optional(),
  metadata: z.object({
    environment: z.string(),
    service: z.string(),
    version: z.string(),
    requestId: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
  }),
});

// Audit log entry schema
export const auditLogEntrySchema = logEntrySchema.extend({
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  changes: z.record(z.unknown()).optional(),
  actor: z.object({
    id: z.string(),
    type: z.enum(['user', 'system', 'service']),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
  }),
});

// Performance metric schema
export const performanceMetricSchema = z.object({
  timestamp: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  tags: z.record(z.string()),
  metadata: z.object({
    environment: z.string(),
    service: z.string(),
    version: z.string(),
  }),
});

// Analytics event schema
export const analyticsEventSchema = z.object({
  timestamp: z.string(),
  event: z.string(),
  properties: z.record(z.unknown()),
  user: z.object({
    id: z.string().optional(),
    anonymousId: z.string().optional(),
    traits: z.record(z.unknown()).optional(),
  }),
  context: z.object({
    page: z.object({
      url: z.string(),
      referrer: z.string().optional(),
      title: z.string().optional(),
    }),
    userAgent: z.string().optional(),
    locale: z.string().optional(),
  }),
});

// Type inference
export type LogEntry = z.infer<typeof logEntrySchema>;
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
export type PerformanceMetric = z.infer<typeof performanceMetricSchema>;
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>; 