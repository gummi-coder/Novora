import { v4 as uuidv4 } from 'uuid';
import { LogEntry, LogLevel, logEntrySchema } from './types';
import { backendConfig } from '../config/backend';

// Transport interface
interface Transport {
  log(entry: LogEntry): Promise<void>;
}

// Console transport
class ConsoleTransport implements Transport {
  async log(entry: LogEntry): Promise<void> {
    const { level, message, context, error, metadata } = entry;
    const timestamp = new Date(entry.timestamp).toISOString();
    
    const logMessage = {
      timestamp,
      level,
      message,
      ...(context && { context }),
      ...(error && { error }),
      ...metadata,
    };

    switch (level) {
      case 'error':
        console.error(JSON.stringify(logMessage, null, 2));
        break;
      case 'warn':
        console.warn(JSON.stringify(logMessage, null, 2));
        break;
      case 'info':
        console.info(JSON.stringify(logMessage, null, 2));
        break;
      case 'debug':
        console.debug(JSON.stringify(logMessage, null, 2));
        break;
    }
  }
}

// File transport
class FileTransport implements Transport {
  private readonly logDir: string;
  private readonly logFile: string;

  constructor(logDir: string, logFile: string) {
    this.logDir = logDir;
    this.logFile = logFile;
  }

  async log(entry: LogEntry): Promise<void> {
    const logPath = `${this.logDir}/${this.logFile}`;
    const logLine = JSON.stringify(entry) + '\n';
    
    // In a real implementation, you would use a proper file system library
    // and implement rotation, compression, etc.
    console.log(`[FileTransport] Writing to ${logPath}: ${logLine}`);
  }
}

// Logger class
export class Logger {
  private readonly transports: Transport[];
  private readonly service: string;
  private readonly version: string;
  private readonly environment: string;

  constructor(options: {
    transports?: Transport[];
    service: string;
    version: string;
    environment?: string;
  }) {
    this.transports = options.transports || [new ConsoleTransport()];
    this.service = options.service;
    this.version = options.version;
    this.environment = options.environment || backendConfig.NODE_ENV;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
        },
      }),
      metadata: {
        environment: this.environment,
        service: this.service,
        version: this.version,
        requestId: (global as any).requestId || uuidv4(),
        userId: (global as any).userId,
        sessionId: (global as any).sessionId,
      },
    };

    return logEntrySchema.parse(entry);
  }

  async log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): Promise<void> {
    const entry = this.createLogEntry(level, message, context, error);
    
    await Promise.all(
      this.transports.map(transport => transport.log(entry))
    );
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): Promise<void> {
    return this.log('error', message, context, error);
  }

  warn(message: string, context?: Record<string, unknown>): Promise<void> {
    return this.log('warn', message, context);
  }

  info(message: string, context?: Record<string, unknown>): Promise<void> {
    return this.log('info', message, context);
  }

  debug(message: string, context?: Record<string, unknown>): Promise<void> {
    return this.log('debug', message, context);
  }
}

// Create default logger instance
export const logger = new Logger({
  service: backendConfig.APP_NAME,
  version: backendConfig.APP_VERSION,
}); 