import { z } from 'zod';
import { Logger } from '../monitoring/logger';
import { ErrorService, ErrorCategory, ErrorSeverity } from './error-service';
import { Pool, PoolConfig } from 'pg';
import { LoggingService } from './logging-service';
import { promisify } from 'util';
import { exec } from 'child_process';

// Database Configuration Schema
export const DatabaseConfigSchema = z.object({
  host: z.string(),
  port: z.number(),
  database: z.string(),
  user: z.string(),
  password: z.string(),
  ssl: z.boolean().optional(),
  maxConnections: z.number().optional(),
  idleTimeoutMillis: z.number().optional(),
  connectionTimeoutMillis: z.number().optional(),
  statementTimeout: z.number().optional(), // in milliseconds
  queryTimeout: z.number().optional(), // in milliseconds
  options: z.record(z.unknown()).optional()
});

// Query Performance Schema
export const QueryPerformanceSchema = z.object({
  queryId: z.string(),
  query: z.string(),
  params: z.array(z.unknown()).optional(),
  executionTime: z.number(),
  rowsAffected: z.number().optional(),
  timestamp: z.date(),
  metadata: z.object({
    explain: z.record(z.unknown()).optional(),
    plan: z.record(z.unknown()).optional(),
    warnings: z.array(z.string()).optional()
  }).optional()
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type QueryPerformance = z.infer<typeof QueryPerformanceSchema>;

export class DatabaseService {
  private readonly logger: Logger;
  private readonly errorService: ErrorService;
  private readonly loggingService: LoggingService;
  private readonly pool: Pool;
  private readonly config: DatabaseConfig;
  private readonly queryStats: Map<string, QueryPerformance[]>;

  constructor(config: DatabaseConfig) {
    this.logger = new Logger();
    this.errorService = new ErrorService();
    this.loggingService = new LoggingService();
    this.config = DatabaseConfigSchema.parse(config);
    this.queryStats = new Map();

    // Configure connection pool
    const poolConfig: PoolConfig = {
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      ssl: this.config.ssl,
      max: this.config.maxConnections || 20,
      idleTimeoutMillis: this.config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: this.config.connectionTimeoutMillis || 2000,
      statement_timeout: this.config.statementTimeout,
      query_timeout: this.config.queryTimeout
    };

    this.pool = new Pool(poolConfig);

    // Handle pool errors
    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle client', {
        error: err.message,
        stack: err.stack
      });
    });
  }

  // Query Execution
  public async query<T>(
    query: string,
    params?: unknown[],
    options?: {
      timeout?: number;
      explain?: boolean;
    }
  ): Promise<T[]> {
    const startTime = Date.now();
    const queryId = this.generateQueryId(query, params);

    try {
      const client = await this.pool.connect();
      try {
        // Set statement timeout if provided
        if (options?.timeout) {
          await client.query(`SET statement_timeout = ${options.timeout}`);
        }

        // Get query plan if explain is enabled
        let explain: Record<string, unknown> | undefined;
        if (options?.explain) {
          const explainResult = await client.query(`EXPLAIN (FORMAT JSON) ${query}`, params);
          explain = explainResult.rows[0];
        }

        // Execute query
        const result = await client.query(query, params);
        const executionTime = Date.now() - startTime;

        // Record query performance
        const performance: QueryPerformance = {
          queryId,
          query,
          params,
          executionTime,
          rowsAffected: result.rowCount,
          timestamp: new Date(),
          metadata: {
            explain,
            warnings: this.extractWarnings(result)
          }
        };

        this.recordQueryPerformance(performance);

        return result.rows as T[];
      } finally {
        client.release();
      }
    } catch (error) {
      throw this.errorService.createError(
        'QUERY_EXECUTION_FAILED',
        ErrorCategory.DATABASE,
        ErrorSeverity.ERROR,
        'Failed to execute query',
        { query, params, error }
      );
    }
  }

  // Index Management
  public async createIndex(
    table: string,
    columns: string[],
    options?: {
      unique?: boolean;
      concurrent?: boolean;
      where?: string;
    }
  ): Promise<void> {
    try {
      const indexName = this.generateIndexName(table, columns);
      const unique = options?.unique ? 'UNIQUE' : '';
      const concurrent = options?.concurrent ? 'CONCURRENTLY' : '';
      const where = options?.where ? `WHERE ${options.where}` : '';

      const query = `
        CREATE ${unique} INDEX ${concurrent} ${indexName}
        ON ${table} (${columns.join(', ')})
        ${where}
      `;

      await this.query(query);
      await this.logAudit('create', 'index', indexName, {
        table,
        columns,
        options
      });
    } catch (error) {
      throw this.errorService.createError(
        'INDEX_CREATION_FAILED',
        ErrorCategory.DATABASE,
        ErrorSeverity.ERROR,
        'Failed to create index',
        { table, columns, error }
      );
    }
  }

  public async analyzeTable(table: string): Promise<Record<string, unknown>> {
    try {
      const query = `ANALYZE ${table}`;
      await this.query(query);

      const statsQuery = `
        SELECT
          schemaname,
          relname,
          n_live_tup,
          n_dead_tup,
          last_vacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        WHERE relname = $1
      `;

      const stats = await this.query(statsQuery, [table]);
      return stats[0];
    } catch (error) {
      throw this.errorService.createError(
        'TABLE_ANALYSIS_FAILED',
        ErrorCategory.DATABASE,
        ErrorSeverity.ERROR,
        'Failed to analyze table',
        { table, error }
      );
    }
  }

  // Performance Monitoring
  public async getQueryStats(): Promise<Record<string, unknown>> {
    try {
      const stats: Record<string, unknown> = {
        pool: {
          totalCount: this.pool.totalCount,
          idleCount: this.pool.idleCount,
          waitingCount: this.pool.waitingCount
        },
        queries: Array.from(this.queryStats.entries()).map(([queryId, performances]) => ({
          queryId,
          count: performances.length,
          avgExecutionTime: this.calculateAverageExecutionTime(performances),
          slowestQuery: this.findSlowestQuery(performances)
        }))
      };

      return stats;
    } catch (error) {
      throw this.errorService.createError(
        'STATS_RETRIEVAL_FAILED',
        ErrorCategory.DATABASE,
        ErrorSeverity.ERROR,
        'Failed to get query statistics',
        { error }
      );
    }
  }

  // Helper methods
  private generateQueryId(query: string, params?: unknown[]): string {
    const queryHash = require('crypto')
      .createHash('md5')
      .update(query + JSON.stringify(params))
      .digest('hex');
    return `query_${queryHash}`;
  }

  private generateIndexName(table: string, columns: string[]): string {
    return `idx_${table}_${columns.join('_')}`;
  }

  private extractWarnings(result: any): string[] {
    const warnings: string[] = [];
    if (result.notices) {
      result.notices.forEach((notice: any) => {
        warnings.push(notice.message);
      });
    }
    return warnings;
  }

  private recordQueryPerformance(performance: QueryPerformance): void {
    const performances = this.queryStats.get(performance.queryId) || [];
    performances.push(performance);
    this.queryStats.set(performance.queryId, performances);
  }

  private calculateAverageExecutionTime(
    performances: QueryPerformance[]
  ): number {
    const total = performances.reduce(
      (sum, p) => sum + p.executionTime,
      0
    );
    return total / performances.length;
  }

  private findSlowestQuery(
    performances: QueryPerformance[]
  ): QueryPerformance {
    return performances.reduce((slowest, current) =>
      current.executionTime > slowest.executionTime ? current : slowest
    );
  }

  private async logAudit(
    action: string,
    resource: string,
    resourceId: string,
    changes?: Record<string, unknown>
  ): Promise<void> {
    await this.loggingService.info('Database audit log', {
      action,
      resource,
      resourceId,
      changes,
      timestamp: new Date()
    });
  }

  // Cleanup
  public async cleanup(): Promise<void> {
    await this.pool.end();
  }
} 