import * as Sentry from '@sentry/node';
import { Logger } from '../monitoring/logger';
import { z } from 'zod';

// Error severity levels
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  NETWORK = 'network',
  EXTERNAL_SERVICE = 'external_service',
  INTERNAL = 'internal',
  TESTING = 'testing',
  UNKNOWN = 'unknown'
}

// Error schema
export const ErrorSchema = z.object({
  message: z.string(),
  code: z.string(),
  category: z.nativeEnum(ErrorCategory),
  severity: z.nativeEnum(ErrorSeverity),
  timestamp: z.date(),
  context: z.record(z.unknown()).optional(),
  stack: z.string().optional(),
  userId: z.string().optional(),
  requestId: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export type ErrorData = z.infer<typeof ErrorSchema>;

// Custom error class
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly category: ErrorCategory,
    public readonly severity: ErrorSeverity,
    message: string,
    public readonly context?: Record<string, unknown>,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error service class
export class ErrorService {
  private readonly logger: Logger;
  private readonly sentry: typeof Sentry;

  constructor() {
    this.logger = new Logger({
      service: process.env.SERVICE_NAME || 'error-service',
      version: process.env.APP_VERSION || '1.0.0'
    });
    this.sentry = Sentry;
    this.initializeSentry();
  }

  private initializeSentry(): void {
    this.sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      integrations: [
        this.sentry.httpIntegration(),
        this.sentry.expressIntegration(),
        this.sentry.prismaIntegration()
      ]
    });
  }

  // Handle and log errors
  public async handleError(error: unknown, context?: Record<string, unknown>): Promise<void> {
    const errorData = this.normalizeError(error);
    
    // Log error
    await this.logger.error(errorData.message, {
      ...errorData,
      ...context
    });

    // Report to Sentry
    this.sentry.withScope((scope: Sentry.Scope) => {
      if (errorData.userId) {
        scope.setUser({ id: errorData.userId });
      }
      if (errorData.requestId) {
        scope.setTag('requestId', errorData.requestId);
      }
      if (errorData.context) {
        scope.setExtras(errorData.context);
      }
      this.sentry.captureException(error);
    });

    // Handle critical errors
    if (errorData.severity === ErrorSeverity.CRITICAL) {
      await this.handleCriticalError(errorData);
    }
  }

  // Normalize different error types into a standard format
  private normalizeError(error: unknown): ErrorData {
    if (error instanceof AppError) {
      return {
        message: error.message,
        code: error.code,
        category: error.category,
        severity: error.severity,
        timestamp: new Date(),
        context: error.context,
        stack: error.stack,
        metadata: error.metadata
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.ERROR,
        timestamp: new Date(),
        stack: error.stack
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      timestamp: new Date()
    };
  }

  // Handle critical errors (e.g., alerting, recovery procedures)
  private async handleCriticalError(errorData: ErrorData): Promise<void> {
    // Implement critical error handling (e.g., alerting, recovery)
    // This could include:
    // - Sending alerts to monitoring systems
    // - Triggering automatic recovery procedures
    // - Notifying on-call engineers
    // - Initiating failover procedures
  }

  // Create error with specific category and severity
  public createError(
    code: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    message: string,
    context?: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): AppError {
    return new AppError(code, category, severity, message, context, metadata);
  }

  // Validation error helper
  public createValidationError(message: string, context?: Record<string, unknown>): AppError {
    return this.createError(
      'VALIDATION_ERROR',
      ErrorCategory.VALIDATION,
      ErrorSeverity.WARNING,
      message,
      context
    );
  }

  // Authentication error helper
  public createAuthError(message: string, context?: Record<string, unknown>): AppError {
    return this.createError(
      'AUTHENTICATION_ERROR',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.WARNING,
      message,
      context
    );
  }

  // Database error helper
  public createDatabaseError(message: string, context?: Record<string, unknown>): AppError {
    return this.createError(
      'DATABASE_ERROR',
      ErrorCategory.DATABASE,
      ErrorSeverity.ERROR,
      message,
      context
    );
  }

  // Network error helper
  public createNetworkError(message: string, context?: Record<string, unknown>): AppError {
    return this.createError(
      'NETWORK_ERROR',
      ErrorCategory.NETWORK,
      ErrorSeverity.ERROR,
      message,
      context
    );
  }
} 