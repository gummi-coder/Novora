import { Request, Response, NextFunction } from 'express';
import { IntegrationAuthService } from '../services/integration-auth-service';
import { WebhookService } from '../services/webhook-service';
import { ErrorService, ErrorCategory, ErrorSeverity } from '../services/error-service';
import crypto from 'crypto';

const integrationAuthService = new IntegrationAuthService();
const webhookService = new WebhookService();
const errorService = new ErrorService();

// Middleware to authenticate API key
export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || typeof apiKey !== 'string') {
      throw errorService.createError(
        'MISSING_API_KEY',
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.ERROR,
        'API key is required'
      );
    }

    const keyInfo = await integrationAuthService.validateApiKey(apiKey);
    req.tenantId = keyInfo.tenantId;
    req.apiKey = keyInfo;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to verify webhook signature
export const verifyWebhookSignature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    if (!signature || typeof signature !== 'string') {
      throw errorService.createError(
        'MISSING_WEBHOOK_SIGNATURE',
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.ERROR,
        'Webhook signature is required'
      );
    }

    const webhookId = req.headers['x-webhook-delivery'];
    if (!webhookId || typeof webhookId !== 'string') {
      throw errorService.createError(
        'MISSING_WEBHOOK_ID',
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.ERROR,
        'Webhook ID is required'
      );
    }

    const webhook = await webhookService.getWebhook(webhookId);
    const expectedSignature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw errorService.createError(
        'INVALID_WEBHOOK_SIGNATURE',
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.ERROR,
        'Invalid webhook signature'
      );
    }

    req.webhook = webhook;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check API key scopes
export const checkApiKeyScopes = (requiredScopes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.apiKey) {
        throw errorService.createError(
          'UNAUTHORIZED',
          ErrorCategory.AUTHENTICATION,
          ErrorSeverity.ERROR,
          'API key not found'
        );
      }

      const hasRequiredScopes = requiredScopes.every(scope =>
        req.apiKey.scopes.includes(scope)
      );

      if (!hasRequiredScopes) {
        throw errorService.createError(
          'INSUFFICIENT_SCOPES',
          ErrorCategory.AUTHORIZATION,
          ErrorSeverity.ERROR,
          'Insufficient API key scopes'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to handle webhook events
export const handleWebhookEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = req.headers['x-webhook-event'];
    if (!event || typeof event !== 'string') {
      throw errorService.createError(
        'MISSING_WEBHOOK_EVENT',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        'Webhook event is required'
      );
    }

    if (!req.webhook) {
      throw errorService.createError(
        'WEBHOOK_NOT_FOUND',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        'Webhook not found'
      );
    }

    if (!req.webhook.events.includes(event)) {
      throw errorService.createError(
        'INVALID_WEBHOOK_EVENT',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        `Event ${event} is not supported by this webhook`
      );
    }

    req.webhookEvent = event;
    next();
  } catch (error) {
    next(error);
  }
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      apiKey?: any;
      webhook?: any;
      webhookEvent?: string;
    }
  }
} 