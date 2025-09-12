import { v4 as uuidv4 } from 'uuid';
import { AuditLogEntry, auditLogEntrySchema } from './types';
import { backendConfig } from '../config/backend';

// Audit logger interface
interface AuditLogger {
  log(entry: Omit<AuditLogEntry, 'timestamp' | 'metadata'>): Promise<void>;
}

// Database transport for audit logs
class DatabaseAuditLogger implements AuditLogger {
  private readonly tableName: string;

  constructor(tableName: string = 'audit_logs') {
    this.tableName = tableName;
  }

  async log(entry: Omit<AuditLogEntry, 'timestamp' | 'metadata'>): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      metadata: {
        environment: backendConfig.NODE_ENV,
        service: backendConfig.APP_NAME,
        version: backendConfig.APP_VERSION,
        requestId: (global as any).requestId || uuidv4(),
        userId: (global as any).userId,
        sessionId: (global as any).sessionId,
      },
    };

    const validatedEntry = auditLogEntrySchema.parse(fullEntry);

    // In a real implementation, you would insert this into your database
    // For example, using Prisma:
    // await prisma.auditLog.create({ data: validatedEntry });
    
    console.log(`[DatabaseAuditLogger] Writing to ${this.tableName}:`, validatedEntry);
  }
}

// File transport for audit logs
class FileAuditLogger implements AuditLogger {
  private readonly logDir: string;
  private readonly logFile: string;

  constructor(logDir: string, logFile: string = 'audit.log') {
    this.logDir = logDir;
    this.logFile = logFile;
  }

  async log(entry: Omit<AuditLogEntry, 'timestamp' | 'metadata'>): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      metadata: {
        environment: backendConfig.NODE_ENV,
        service: backendConfig.APP_NAME,
        version: backendConfig.APP_VERSION,
        requestId: (global as any).requestId || uuidv4(),
        userId: (global as any).userId,
        sessionId: (global as any).sessionId,
      },
    };

    const validatedEntry = auditLogEntrySchema.parse(fullEntry);
    const logPath = `${this.logDir}/${this.logFile}`;
    const logLine = JSON.stringify(validatedEntry) + '\n';
    
    // In a real implementation, you would use a proper file system library
    // and implement rotation, compression, etc.
    console.log(`[FileAuditLogger] Writing to ${logPath}: ${logLine}`);
  }
}

// Composite audit logger
export class AuditLogManager implements AuditLogger {
  private readonly loggers: AuditLogger[];

  constructor(loggers: AuditLogger[]) {
    this.loggers = loggers;
  }

  async log(entry: Omit<AuditLogEntry, 'timestamp' | 'metadata'>): Promise<void> {
    await Promise.all(
      this.loggers.map(logger => logger.log(entry))
    );
  }
}

// Create default audit logger instance
export const auditLogger = new AuditLogManager([
  new DatabaseAuditLogger(),
  new FileAuditLogger('logs'),
]); 