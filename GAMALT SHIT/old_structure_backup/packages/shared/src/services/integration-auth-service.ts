import { z } from 'zod';
import { Logger } from '../monitoring/logger';
import { ErrorService, ErrorCategory, ErrorSeverity } from './error-service';
import { Redis } from 'ioredis';
import { LoggingService } from './logging-service';
import crypto from 'crypto';

// API Key Schema
export const ApiKeySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  key: z.string(),
  scopes: z.array(z.string()),
  status: z.enum(['active', 'revoked']),
  createdAt: z.date(),
  expiresAt: z.date().optional(),
  lastUsedAt: z.date().optional(),
  metadata: z.record(z.unknown()).optional()
});

// Integration Schema
export const IntegrationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  type: z.string(),
  config: z.record(z.unknown()),
  status: z.enum(['active', 'inactive', 'error']),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.unknown()).optional()
});

export type ApiKey = z.infer<typeof ApiKeySchema>;
export type Integration = z.infer<typeof IntegrationSchema>;

export class IntegrationAuthService {
  private readonly logger: Logger;
  private readonly errorService: ErrorService;
  private readonly loggingService: LoggingService;
  private readonly redis: Redis;

  constructor() {
    this.logger = new Logger();
    this.errorService = new ErrorService();
    this.loggingService = new LoggingService();
    this.redis = new Redis(process.env.REDIS_URL);
  }

  // API Key Management
  public async generateApiKey(
    tenantId: string,
    name: string,
    scopes: string[],
    expiresAt?: Date
  ): Promise<ApiKey> {
    try {
      const key = crypto.randomBytes(32).toString('hex');
      const apiKey: ApiKey = {
        id: crypto.randomUUID(),
        tenantId,
        name,
        key,
        scopes,
        status: 'active',
        createdAt: new Date(),
        expiresAt,
        metadata: {
          generatedBy: 'system'
        }
      };

      ApiKeySchema.parse(apiKey);
      await this.redis.set(
        `api_key:${apiKey.id}`,
        JSON.stringify(apiKey)
      );
      await this.redis.set(
        `api_key:${key}`,
        apiKey.id
      );

      await this.logAudit('create', 'api_key', apiKey.id, {
        tenantId,
        name,
        scopes
      });

      return apiKey;
    } catch (error) {
      throw this.errorService.createError(
        'API_KEY_GENERATION_FAILED',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        'Failed to generate API key',
        { tenantId, name, scopes, error }
      );
    }
  }

  public async validateApiKey(key: string): Promise<ApiKey> {
    try {
      const keyId = await this.redis.get(`api_key:${key}`);
      if (!keyId) {
        throw this.errorService.createError(
          'INVALID_API_KEY',
          ErrorCategory.AUTHENTICATION,
          ErrorSeverity.ERROR,
          'Invalid API key'
        );
      }

      const apiKey = await this.getApiKey(keyId);
      if (apiKey.status !== 'active') {
        throw this.errorService.createError(
          'API_KEY_REVOKED',
          ErrorCategory.AUTHENTICATION,
          ErrorSeverity.ERROR,
          'API key has been revoked'
        );
      }

      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        throw this.errorService.createError(
          'API_KEY_EXPIRED',
          ErrorCategory.AUTHENTICATION,
          ErrorSeverity.ERROR,
          'API key has expired'
        );
      }

      // Update last used timestamp
      apiKey.lastUsedAt = new Date();
      await this.redis.set(
        `api_key:${keyId}`,
        JSON.stringify(apiKey)
      );

      return apiKey;
    } catch (error) {
      throw this.errorService.createError(
        'API_KEY_VALIDATION_FAILED',
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.ERROR,
        'Failed to validate API key',
        { error }
      );
    }
  }

  public async revokeApiKey(keyId: string): Promise<void> {
    try {
      const apiKey = await this.getApiKey(keyId);
      apiKey.status = 'revoked';
      await this.redis.set(
        `api_key:${keyId}`,
        JSON.stringify(apiKey)
      );
      await this.logAudit('revoke', 'api_key', keyId);
    } catch (error) {
      throw this.errorService.createError(
        'API_KEY_REVOCATION_FAILED',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        'Failed to revoke API key',
        { keyId, error }
      );
    }
  }

  // Integration Management
  public async createIntegration(
    tenantId: string,
    name: string,
    type: string,
    config: Record<string, unknown>
  ): Promise<Integration> {
    try {
      const integration: Integration = {
        id: crypto.randomUUID(),
        tenantId,
        name,
        type,
        config,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          createdBy: 'system'
        }
      };

      IntegrationSchema.parse(integration);
      await this.redis.set(
        `integration:${integration.id}`,
        JSON.stringify(integration)
      );

      await this.logAudit('create', 'integration', integration.id, {
        tenantId,
        name,
        type
      });

      return integration;
    } catch (error) {
      throw this.errorService.createError(
        'INTEGRATION_CREATION_FAILED',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        'Failed to create integration',
        { tenantId, name, type, error }
      );
    }
  }

  public async updateIntegration(
    id: string,
    updates: Partial<Integration>
  ): Promise<Integration> {
    try {
      const integration = await this.getIntegration(id);
      const updatedIntegration = {
        ...integration,
        ...updates,
        updatedAt: new Date()
      };

      IntegrationSchema.parse(updatedIntegration);
      await this.redis.set(
        `integration:${id}`,
        JSON.stringify(updatedIntegration)
      );

      await this.logAudit('update', 'integration', id, updates);
      return updatedIntegration;
    } catch (error) {
      throw this.errorService.createError(
        'INTEGRATION_UPDATE_FAILED',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        'Failed to update integration',
        { id, updates, error }
      );
    }
  }

  // Helper methods
  private async getApiKey(keyId: string): Promise<ApiKey> {
    const apiKey = await this.redis.get(`api_key:${keyId}`);
    if (!apiKey) {
      throw this.errorService.createError(
        'API_KEY_NOT_FOUND',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        `API key ${keyId} not found`
      );
    }
    return JSON.parse(apiKey);
  }

  private async getIntegration(id: string): Promise<Integration> {
    const integration = await this.redis.get(`integration:${id}`);
    if (!integration) {
      throw this.errorService.createError(
        'INTEGRATION_NOT_FOUND',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        `Integration ${id} not found`
      );
    }
    return JSON.parse(integration);
  }

  private async logAudit(
    action: string,
    resource: string,
    resourceId: string,
    changes?: Record<string, unknown>
  ): Promise<void> {
    await this.loggingService.info('Integration audit log', {
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