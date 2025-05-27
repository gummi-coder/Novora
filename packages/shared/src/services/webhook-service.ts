import { z } from 'zod';
import { Logger } from '../monitoring/logger';
import { ErrorService, ErrorCategory, ErrorSeverity } from './error-service';
import { Redis } from 'ioredis';
import { LoggingService } from './logging-service';
import axios from 'axios';
import crypto from 'crypto';

// Webhook Schema
export const WebhookSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string(),
  status: z.enum(['active', 'inactive']),
  retryConfig: z.object({
    maxRetries: z.number(),
    retryDelay: z.number(), // in milliseconds
    backoffFactor: z.number()
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.unknown()).optional()
});

// Webhook Delivery Schema
export const WebhookDeliverySchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  event: z.string(),
  payload: z.record(z.unknown()),
  status: z.enum(['pending', 'delivered', 'failed']),
  attempts: z.number(),
  lastAttemptAt: z.date().optional(),
  nextAttemptAt: z.date().optional(),
  response: z.object({
    statusCode: z.number().optional(),
    body: z.string().optional(),
    headers: z.record(z.string()).optional()
  }).optional(),
  createdAt: z.date(),
  metadata: z.record(z.unknown()).optional()
});

export type Webhook = z.infer<typeof WebhookSchema>;
export type WebhookDelivery = z.infer<typeof WebhookDeliverySchema>;

export class WebhookService {
  private readonly logger: Logger;
  private readonly errorService: ErrorService;
  private readonly loggingService: LoggingService;
  private readonly redis: Redis;

  constructor() {
    this.logger = new Logger();
    this.errorService = new ErrorService();
    this.loggingService = new LoggingService();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  // Webhook Management
  public async createWebhook(
    tenantId: string,
    name: string,
    url: string,
    events: string[],
    retryConfig?: Partial<Webhook['retryConfig']>
  ): Promise<Webhook> {
    try {
      const webhook: Webhook = {
        id: crypto.randomUUID(),
        tenantId,
        name,
        url,
        events,
        secret: crypto.randomBytes(32).toString('hex'),
        status: 'active',
        retryConfig: {
          maxRetries: retryConfig?.maxRetries || 3,
          retryDelay: retryConfig?.retryDelay || 1000,
          backoffFactor: retryConfig?.backoffFactor || 2
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          createdBy: 'system'
        }
      };

      WebhookSchema.parse(webhook);
      await this.redis.set(
        `webhook:${webhook.id}`,
        JSON.stringify(webhook)
      );

      await this.logAudit('create', 'webhook', webhook.id, {
        tenantId,
        name,
        url,
        events
      });

      return webhook;
    } catch (error) {
      throw this.errorService.createError(
        'WEBHOOK_CREATION_FAILED',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        'Failed to create webhook',
        { tenantId, name, url, events, error }
      );
    }
  }

  public async triggerWebhook(
    webhookId: string,
    event: string,
    payload: Record<string, unknown>
  ): Promise<WebhookDelivery> {
    try {
      const webhook = await this.getWebhook(webhookId);
      if (webhook.status !== 'active') {
        throw this.errorService.createError(
          'WEBHOOK_INACTIVE',
          ErrorCategory.VALIDATION,
          ErrorSeverity.ERROR,
          'Webhook is inactive'
        );
      }

      if (!webhook.events.includes(event)) {
        throw this.errorService.createError(
          'INVALID_WEBHOOK_EVENT',
          ErrorCategory.VALIDATION,
          ErrorSeverity.ERROR,
          `Event ${event} is not supported by this webhook`
        );
      }

      const delivery: WebhookDelivery = {
        id: crypto.randomUUID(),
        webhookId,
        event,
        payload,
        status: 'pending',
        attempts: 0,
        createdAt: new Date(),
        metadata: {
          triggeredBy: 'system'
        }
      };

      WebhookDeliverySchema.parse(delivery);
      await this.redis.set(
        `webhook_delivery:${delivery.id}`,
        JSON.stringify(delivery)
      );

      // Queue the delivery
      await this.queueWebhookDelivery(delivery);

      return delivery;
    } catch (error) {
      throw this.errorService.createError(
        'WEBHOOK_TRIGGER_FAILED',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        'Failed to trigger webhook',
        { webhookId, event, error }
      );
    }
  }

  // Webhook Delivery
  private async queueWebhookDelivery(delivery: WebhookDelivery): Promise<void> {
    await this.redis.lpush(
      'webhook_delivery_queue',
      JSON.stringify(delivery)
    );
  }

  public async processWebhookDelivery(delivery: WebhookDelivery): Promise<void> {
    try {
      const webhook = await this.getWebhook(delivery.webhookId);
      const signature = this.generateWebhookSignature(
        webhook.secret,
        delivery.payload
      );

      const response = await axios.post(webhook.url, delivery.payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': delivery.event,
          'X-Webhook-Delivery': delivery.id
        },
        timeout: 10000 // 10 seconds
      });

      delivery.status = 'delivered';
      delivery.attempts += 1;
      delivery.lastAttemptAt = new Date();
      delivery.response = {
        statusCode: response.status,
        body: response.data,
        headers: response.headers
      };

      await this.redis.set(
        `webhook_delivery:${delivery.id}`,
        JSON.stringify(delivery)
      );

      await this.logAudit('deliver', 'webhook', delivery.webhookId, {
        deliveryId: delivery.id,
        status: 'success'
      });
    } catch (error) {
      delivery.status = 'failed';
      delivery.attempts += 1;
      delivery.lastAttemptAt = new Date();

      if (delivery.attempts < webhook.retryConfig.maxRetries) {
        const delay = webhook.retryConfig.retryDelay *
          Math.pow(webhook.retryConfig.backoffFactor, delivery.attempts - 1);
        delivery.nextAttemptAt = new Date(Date.now() + delay);
        await this.queueWebhookDelivery(delivery);
      }

      delivery.response = {
        statusCode: error.response?.status,
        body: error.response?.data,
        headers: error.response?.headers
      };

      await this.redis.set(
        `webhook_delivery:${delivery.id}`,
        JSON.stringify(delivery)
      );

      await this.logAudit('deliver', 'webhook', delivery.webhookId, {
        deliveryId: delivery.id,
        status: 'failed',
        error: error.message
      });
    }
  }

  // Helper methods
  private async getWebhook(webhookId: string): Promise<Webhook> {
    const webhook = await this.redis.get(`webhook:${webhookId}`);
    if (!webhook) {
      throw this.errorService.createError(
        'WEBHOOK_NOT_FOUND',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        `Webhook ${webhookId} not found`
      );
    }
    return JSON.parse(webhook);
  }

  private generateWebhookSignature(
    secret: string,
    payload: Record<string, unknown>
  ): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  private async logAudit(
    action: string,
    resource: string,
    resourceId: string,
    changes?: Record<string, unknown>
  ): Promise<void> {
    await this.loggingService.info('Webhook audit log', {
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