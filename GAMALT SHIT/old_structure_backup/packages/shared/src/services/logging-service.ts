import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { Logtail } from '@logtail/node';
import { z } from 'zod';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Log schema
export const LogSchema = z.object({
  level: z.nativeEnum(LogLevel),
  message: z.string(),
  timestamp: z.date(),
  context: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  userId: z.string().optional(),
  requestId: z.string().optional(),
  service: z.string(),
  environment: z.string()
});

export type LogData = z.infer<typeof LogSchema>;

// Logging service class
export class LoggingService {
  private readonly logger: WinstonLogger;
  private readonly logtail: Logtail;
  private readonly service: string;
  private readonly environment: string;

  constructor() {
    this.service = process.env.SERVICE_NAME || 'unknown';
    this.environment = process.env.NODE_ENV || 'development';
    this.logtail = new Logtail(process.env.LOGTAIL_TOKEN || '');

    // Initialize Winston logger
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      defaultMeta: {
        service: this.service,
        environment: this.environment
      },
      transports: [
        // Console transport
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        }),
        // File transport
        new transports.File({
          filename: 'logs/error.log',
          level: 'error'
        }),
        new transports.File({
          filename: 'logs/combined.log'
        })
      ]
    });

    // Add Elasticsearch transport if configured
    if (process.env.ELASTICSEARCH_URL) {
      this.logger.add(new ElasticsearchTransport({
        level: 'info',
        index: `logs-${this.service}-${this.environment}`,
        clientOpts: {
          node: process.env.ELASTICSEARCH_URL,
          auth: {
            username: process.env.ELASTICSEARCH_USERNAME,
            password: process.env.ELASTICSEARCH_PASSWORD
          }
        }
      }));
    }
  }

  // Log error
  public async error(message: string, context?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.ERROR, message, context);
  }

  // Log warning
  public async warn(message: string, context?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.WARN, message, context);
  }

  // Log info
  public async info(message: string, context?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.INFO, message, context);
  }

  // Log debug
  public async debug(message: string, context?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.DEBUG, message, context);
  }

  // Log with level
  private async log(level: LogLevel, message: string, context?: Record<string, unknown>): Promise<void> {
    const logData: LogData = {
      level,
      message,
      timestamp: new Date(),
      context,
      service: this.service,
      environment: this.environment
    };

    // Validate log data
    LogSchema.parse(logData);

    // Log to Winston
    this.logger.log(level, message, {
      ...context,
      service: this.service,
      environment: this.environment
    });

    // Log to Logtail
    if (process.env.LOGTAIL_TOKEN) {
      await this.logtail.log(message, {
        level,
        ...context,
        service: this.service,
        environment: this.environment
      });
    }
  }

  // Create child logger with additional context
  public child(context: Record<string, unknown>): LoggingService {
    const childLogger = new LoggingService();
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }

  // Clean up resources
  public async cleanup(): Promise<void> {
    await this.logtail.flush();
  }
} 