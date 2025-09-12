import { z } from 'zod';
import { Logger } from '../monitoring/logger';
import { ErrorService, ErrorCategory, ErrorSeverity } from './error-service';
import { LoggingService } from './logging-service';
import { Redis } from 'ioredis';
import { promisify } from 'util';
import { exec } from 'child_process';

// Server Schema
export const ServerSchema = z.object({
  id: z.string(),
  host: z.string(),
  port: z.number(),
  weight: z.number().optional(),
  health: z.object({
    status: z.enum(['healthy', 'unhealthy', 'degraded']),
    lastCheck: z.date(),
    responseTime: z.number(),
    errorRate: z.number(),
    cpu: z.number(),
    memory: z.number()
  }),
  metadata: z.record(z.unknown()).optional()
});

// Load Balancer Configuration Schema
export const LoadBalancerConfigSchema = z.object({
  algorithm: z.enum(['round-robin', 'least-connections', 'weighted', 'ip-hash']),
  healthCheck: z.object({
    interval: z.number(), // in milliseconds
    timeout: z.number(), // in milliseconds
    unhealthyThreshold: z.number(),
    healthyThreshold: z.number()
  }),
  sessionStickiness: z.object({
    enabled: z.boolean(),
    cookieName: z.string().optional(),
    ttl: z.number().optional() // in seconds
  }),
  failover: z.object({
    enabled: z.boolean(),
    maxRetries: z.number(),
    retryDelay: z.number() // in milliseconds
  }),
  options: z.record(z.unknown()).optional()
});

export type Server = z.infer<typeof ServerSchema>;
export type LoadBalancerConfig = z.infer<typeof LoadBalancerConfigSchema>;

export class LoadBalancerService {
  private readonly logger: Logger;
  private readonly errorService: ErrorService;
  private readonly loggingService: LoggingService;
  private readonly redis: Redis;
  private readonly config: LoadBalancerConfig;
  private readonly servers: Map<string, Server>;
  private currentIndex: number;

  constructor(config: LoadBalancerConfig) {
    this.logger = new Logger();
    this.errorService = new ErrorService();
    this.loggingService = new LoggingService();
    this.config = LoadBalancerConfigSchema.parse(config);
    this.servers = new Map();
    this.currentIndex = 0;

    // Initialize Redis for session storage
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    // Start health checks
    this.startHealthChecks();
  }

  // Server Management
  public async addServer(server: Server): Promise<void> {
    try {
      ServerSchema.parse(server);
      this.servers.set(server.id, server);
      await this.logAudit('add', 'server', server.id, server);
    } catch (error) {
      throw this.errorService.createError(
        'SERVER_ADDITION_FAILED',
        ErrorCategory.LOAD_BALANCER,
        ErrorSeverity.ERROR,
        'Failed to add server',
        { server, error }
      );
    }
  }

  public async removeServer(serverId: string): Promise<void> {
    try {
      if (!this.servers.has(serverId)) {
        throw this.errorService.createError(
          'SERVER_NOT_FOUND',
          ErrorCategory.LOAD_BALANCER,
          ErrorSeverity.ERROR,
          `Server ${serverId} not found`
        );
      }

      this.servers.delete(serverId);
      await this.logAudit('remove', 'server', serverId);
    } catch (error) {
      throw this.errorService.createError(
        'SERVER_REMOVAL_FAILED',
        ErrorCategory.LOAD_BALANCER,
        ErrorSeverity.ERROR,
        'Failed to remove server',
        { serverId, error }
      );
    }
  }

  public async updateServerHealth(
    serverId: string,
    health: Server['health']
  ): Promise<void> {
    try {
      const server = this.servers.get(serverId);
      if (!server) {
        throw this.errorService.createError(
          'SERVER_NOT_FOUND',
          ErrorCategory.LOAD_BALANCER,
          ErrorSeverity.ERROR,
          `Server ${serverId} not found`
        );
      }

      server.health = health;
      this.servers.set(serverId, server);
      await this.logAudit('update', 'server', serverId, { health });
    } catch (error) {
      throw this.errorService.createError(
        'HEALTH_UPDATE_FAILED',
        ErrorCategory.LOAD_BALANCER,
        ErrorSeverity.ERROR,
        'Failed to update server health',
        { serverId, health, error }
      );
    }
  }

  // Load Balancing
  public async getNextServer(sessionId?: string): Promise<Server> {
    try {
      if (this.servers.size === 0) {
        throw this.errorService.createError(
          'NO_SERVERS_AVAILABLE',
          ErrorCategory.LOAD_BALANCER,
          ErrorSeverity.ERROR,
          'No servers available'
        );
      }

      // Check session stickiness
      if (this.config.sessionStickiness.enabled && sessionId) {
        const serverId = await this.getStickyServer(sessionId);
        if (serverId) {
          const server = this.servers.get(serverId);
          if (server && server.health.status === 'healthy') {
            return server;
          }
        }
      }

      // Select server based on algorithm
      let server: Server | undefined;
      switch (this.config.algorithm) {
        case 'round-robin':
          server = this.getNextRoundRobin();
          break;
        case 'least-connections':
          server = this.getLeastConnections();
          break;
        case 'weighted':
          server = this.getWeightedServer();
          break;
        case 'ip-hash':
          server = this.getIpHashServer(sessionId);
          break;
        default:
          server = this.getNextRoundRobin();
      }

      if (!server || server.health.status !== 'healthy') {
        throw this.errorService.createError(
          'NO_HEALTHY_SERVERS',
          ErrorCategory.LOAD_BALANCER,
          ErrorSeverity.ERROR,
          'No healthy servers available'
        );
      }

      // Update session stickiness
      if (this.config.sessionStickiness.enabled && sessionId) {
        await this.setStickyServer(sessionId, server.id);
      }

      return server;
    } catch (error) {
      throw this.errorService.createError(
        'SERVER_SELECTION_FAILED',
        ErrorCategory.LOAD_BALANCER,
        ErrorSeverity.ERROR,
        'Failed to select server',
        { sessionId, error }
      );
    }
  }

  // Health Checks
  private async startHealthChecks(): Promise<void> {
    setInterval(async () => {
      for (const [serverId, server] of this.servers.entries()) {
        try {
          const health = await this.checkServerHealth(server);
          await this.updateServerHealth(serverId, health);
        } catch (error) {
          this.logger.error('Health check failed', {
            serverId,
            error: error.message
          });
        }
      }
    }, this.config.healthCheck.interval);
  }

  private async checkServerHealth(server: Server): Promise<Server['health']> {
    const startTime = Date.now();
    try {
      const response = await fetch(`http://${server.host}:${server.port}/health`);
      const responseTime = Date.now() - startTime;

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        lastCheck: new Date(),
        responseTime,
        errorRate: 0,
        cpu: 0,
        memory: 0
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorRate: 1,
        cpu: 0,
        memory: 0
      };
    }
  }

  // Server Selection Algorithms
  private getNextRoundRobin(): Server | undefined {
    const servers = Array.from(this.servers.values());
    if (servers.length === 0) return undefined;

    this.currentIndex = (this.currentIndex + 1) % servers.length;
    return servers[this.currentIndex];
  }

  private getLeastConnections(): Server | undefined {
    return Array.from(this.servers.values())
      .filter(server => server.health.status === 'healthy')
      .sort((a, b) => a.health.responseTime - b.health.responseTime)[0];
  }

  private getWeightedServer(): Server | undefined {
    const servers = Array.from(this.servers.values())
      .filter(server => server.health.status === 'healthy');

    const totalWeight = servers.reduce(
      (sum, server) => sum + (server.weight || 1),
      0
    );

    let random = Math.random() * totalWeight;
    for (const server of servers) {
      random -= server.weight || 1;
      if (random <= 0) return server;
    }

    return servers[0];
  }

  private getIpHashServer(sessionId?: string): Server | undefined {
    if (!sessionId) return this.getNextRoundRobin();

    const servers = Array.from(this.servers.values())
      .filter(server => server.health.status === 'healthy');

    const hash = require('crypto')
      .createHash('md5')
      .update(sessionId)
      .digest('hex');
    const index = parseInt(hash, 16) % servers.length;
    return servers[index];
  }

  // Session Stickiness
  private async getStickyServer(sessionId: string): Promise<string | null> {
    return this.redis.get(`session:${sessionId}`);
  }

  private async setStickyServer(
    sessionId: string,
    serverId: string
  ): Promise<void> {
    const ttl = this.config.sessionStickiness.ttl || 3600;
    await this.redis.set(
      `session:${sessionId}`,
      serverId,
      'EX',
      ttl
    );
  }

  // Helper methods
  private async logAudit(
    action: string,
    resource: string,
    resourceId: string,
    changes?: Record<string, unknown>
  ): Promise<void> {
    await this.loggingService.info('Load balancer audit log', {
      action,
      resource,
      resourceId,
      changes,
      timestamp: new Date()
    });
  }

  // Cleanup
  public async cleanup(): Promise<void> {
    await this.redis.quit();
  }
} 