// Circuit breaker states
export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

// Circuit breaker configuration
export interface CircuitBreakerConfig {
  threshold: number;
  timeout: number;
}

// Circuit breaker class
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  // Execute operation with circuit breaker
  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  // Check if circuit breaker is open
  private isOpen(): boolean {
    if (this.state === CircuitBreakerState.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.config.timeout) {
        this.state = CircuitBreakerState.HALF_OPEN;
        return false;
      }
      return true;
    }
    return false;
  }

  // Handle successful operation
  private onSuccess(): void {
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.reset();
    }
  }

  // Handle failed operation
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.threshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }

  // Reset circuit breaker
  private reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  // Get current state
  public getState(): CircuitBreakerState {
    return this.state;
  }

  // Get failure count
  public getFailureCount(): number {
    return this.failureCount;
  }

  // Get last failure time
  public getLastFailureTime(): number {
    return this.lastFailureTime;
  }
} 