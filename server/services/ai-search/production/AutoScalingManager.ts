/**
 * ResilienceManager - Phase 4 Error Recovery & Resilience
 * Enterprise-grade resilience with circuit breakers and fallback strategies
 */

interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
  nextAttemptTime: number;
}

interface FallbackStrategy {
  name: string;
  enabled: boolean;
  triggers: string[];
  action: 'cache' | 'simplified' | 'default' | 'retry';
  config: Record<string, any>;
}

export class ResilienceManager {
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private fallbackStrategies: FallbackStrategy[] = [];
  private retryPolicies: Map<string, any> = new Map();
  
  private readonly FAILURE_THRESHOLD = 5;
  private readonly RECOVERY_TIMEOUT = 30000; // 30 seconds
  private readonly HALF_OPEN_MAX_CALLS = 3;

  constructor() {
    this.initializeFallbackStrategies();
    console.log('🛡️ ResilienceManager initialized with circuit breakers and fallback strategies');
  }

  /**
   * Execute with Circuit Breaker Protection
   */
  async executeWithCircuitBreaker<T>(
    name: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(name);
    
    if (circuitBreaker.state === 'open') {
      if (Date.now() < circuitBreaker.nextAttemptTime) {
        console.log(`🚫 Circuit breaker '${name}' is OPEN - using fallback`);
        if (fallback) {
          return await fallback();
        }
        throw new Error(`Circuit breaker '${name}' is open`);
      } else {
        // Transition to half-open
        circuitBreaker.state = 'half-open';
        circuitBreaker.successCount = 0;
        console.log(`🔄 Circuit breaker '${name}' transitioned to HALF-OPEN`);
      }
    }

    try {
      const result = await operation();
      this.recordSuccess(name);
      return result;
    } catch (error) {
      this.recordFailure(name);
      
      if (fallback) {
        console.log(`🔄 Circuit breaker '${name}' executing fallback`);
        return await fallback();
      }
      
      throw error;
    }
  }

  /**
   * Execute with Retry Logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delay?: number;
      backoffMultiplier?: number;
      maxDelay?: number;
      jitter?: boolean;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoffMultiplier = 2,
      maxDelay = 10000,
      jitter = true
    } = options;

    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          console.error(`💥 Operation failed after ${maxAttempts} attempts:`, error);
          break;
        }

        const baseDelay = Math.min(delay * Math.pow(backoffMultiplier, attempt - 1), maxDelay);
        const actualDelay = jitter ? baseDelay * (0.5 + Math.random() * 0.5) : baseDelay;
        
        console.log(`🔄 Retry attempt ${attempt + 1}/${maxAttempts} in ${Math.round(actualDelay)}ms`);
        await new Promise(resolve => setTimeout(resolve, actualDelay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Get Circuit Breaker Status
   */
  getCircuitBreakerStatus(): Record<string, {
    state: string;
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
  }> {
    const status: Record<string, any> = {};
    
    for (const [name, breaker] of this.circuitBreakers) {
      status[name] = {
        state: breaker.state,
        failureCount: breaker.failureCount,
        successCount: breaker.successCount,
        lastFailureTime: breaker.lastFailureTime
      };
    }
    
    return status;
  }

  /**
   * Private Methods
   */
  private getOrCreateCircuitBreaker(name: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(name)) {
      this.circuitBreakers.set(name, {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: 0,
        successCount: 0,
        nextAttemptTime: 0
      });
    }
    return this.circuitBreakers.get(name)!;
  }

  private recordSuccess(name: string): void {
    const breaker = this.getOrCreateCircuitBreaker(name);
    breaker.successCount++;
    
    if (breaker.state === 'half-open' && breaker.successCount >= this.HALF_OPEN_MAX_CALLS) {
      breaker.state = 'closed';
      breaker.failureCount = 0;
      console.log(`✅ Circuit breaker '${name}' transitioned to CLOSED`);
    }
  }

  private recordFailure(name: string): void {
    const breaker = this.getOrCreateCircuitBreaker(name);
    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();
    
    if (breaker.failureCount >= this.FAILURE_THRESHOLD) {
      breaker.state = 'open';
      breaker.nextAttemptTime = Date.now() + this.RECOVERY_TIMEOUT;
      console.log(`❌ Circuit breaker '${name}' transitioned to OPEN`);
    }
  }

  private initializeFallbackStrategies(): void {
    this.fallbackStrategies.push(
      {
        name: 'search-cache-fallback',
        enabled: true,
        triggers: ['database-timeout', 'api-error'],
        action: 'cache',
        config: { maxAge: 300000 } // 5 minutes
      },
      {
        name: 'simplified-search',
        enabled: true,
        triggers: ['ml-service-error', 'ai-timeout'],
        action: 'simplified',
        config: { basicResults: true }
      }
    );
  }

  destroy(): void {
    this.circuitBreakers.clear();
    console.log('🛡️ ResilienceManager destroyed');
  }
}