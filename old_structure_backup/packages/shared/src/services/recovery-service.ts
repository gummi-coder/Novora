import { Logger } from '../monitoring/logger';
import { ErrorService, ErrorSeverity, ErrorCategory } from './error-service';
import { Redis } from 'ioredis';
import { CircuitBreaker } from './circuit-breaker';

// Recovery strategies
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  CIRCUIT_BREAKER = 'circuit_breaker',
  FAILOVER = 'failover'
}

// Recovery configuration
interface RecoveryConfig {
  maxRetries: number;
  retryDelay: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  fallbackEnabled: boolean;
  failoverEnabled: boolean;
}

// Default recovery configuration
const defaultConfig: RecoveryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 30000,
  fallbackEnabled: true,
  failoverEnabled: false
};

// Recovery service class
export class RecoveryService {
  private readonly logger: Logger;
  private readonly errorService: ErrorService;
  private readonly redis: Redis;
  private readonly circuitBreakers: Map<string, CircuitBreaker>;
  private readonly config: RecoveryConfig;

  constructor(config: Partial<RecoveryConfig> = {}) {
    this.logger = new Logger();
    this.errorService = new ErrorService();
    this.redis = new Redis(process.env.REDIS_URL);
    this.circuitBreakers = new Map();
    this.config = { ...defaultConfig, ...config };
  }

  // Retry operation with exponential backoff
  public async retry<T>(
    operation: () => Promise<T>,
    context: string,
    options: { maxRetries?: number; retryDelay?: number } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? this.config.maxRetries;
    const retryDelay = options.retryDelay ?? this.config.retryDelay;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(`Retry attempt ${attempt}/${maxRetries} failed for ${context}`, {
          error,
          attempt,
          context
        });

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1)));
        }
      }
    }

    throw this.errorService.createError(
      'RETRY_FAILED',
      ErrorCategory.INTERNAL,
      ErrorSeverity.ERROR,
      `Operation failed after ${maxRetries} retries`,
      { context, lastError }
    );
  }

  // Execute operation with circuit breaker
  public async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    context: string,
    options: { threshold?: number; timeout?: number } = {}
  ): Promise<T> {
    const breaker = this.getCircuitBreaker(context, options);

    try {
      return await breaker.execute(operation);
    } catch (error) {
      throw this.errorService.createError(
        'CIRCUIT_BREAKER_TRIPPED',
        ErrorCategory.INTERNAL,
        ErrorSeverity.ERROR,
        `Circuit breaker tripped for ${context}`,
        { context, error }
      );
    }
  }

  // Execute operation with fallback
  public async withFallback<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.warn(`Primary operation failed, using fallback for ${context}`, {
        error,
        context
      });

      try {
        return await fallback();
      } catch (fallbackError) {
        throw this.errorService.createError(
          'FALLBACK_FAILED',
          ErrorCategory.INTERNAL,
          ErrorSeverity.ERROR,
          `Both primary and fallback operations failed for ${context}`,
          { context, error, fallbackError }
        );
      }
    }
  }

  // Execute operation with failover
  public async withFailover<T>(
    operation: () => Promise<T>,
    failover: () => Promise<T>,
    context: string
  ): Promise<T> {
    if (!this.config.failoverEnabled) {
      return operation();
    }

    try {
      return await operation();
    } catch (error) {
      this.logger.error(`Primary operation failed, initiating failover for ${context}`, {
        error,
        context
      });

      try {
        const result = await failover();
        this.logger.info(`Failover successful for ${context}`);
        return result;
      } catch (failoverError) {
        throw this.errorService.createError(
          'FAILOVER_FAILED',
          ErrorCategory.INTERNAL,
          ErrorSeverity.CRITICAL,
          `Both primary and failover operations failed for ${context}`,
          { context, error, failoverError }
        );
      }
    }
  }

  // Get or create circuit breaker
  private getCircuitBreaker(
    context: string,
    options: { threshold?: number; timeout?: number } = {}
  ): CircuitBreaker {
    if (!this.circuitBreakers.has(context)) {
      const breaker = new CircuitBreaker({
        threshold: options.threshold ?? this.config.circuitBreakerThreshold,
        timeout: options.timeout ?? this.config.circuitBreakerTimeout
      });
      this.circuitBreakers.set(context, breaker);
    }
    return this.circuitBreakers.get(context)!;
  }

  // Clean up resources
  public async cleanup(): Promise<void> {
    await this.redis.quit();
    this.circuitBreakers.clear();
  }
} 