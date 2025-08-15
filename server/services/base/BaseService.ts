/**
 * Base Service - Service Abstraction Layer
 * Phase 2: Service Consolidation Implementation
 * 
 * Common functionality for all consolidated services
 */

import { ServiceLogger } from '../utils/ServiceLogger';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ServiceMetrics } from '../utils/ServiceMetrics';

export interface ServiceConfig {
  name: string;
  version: string;
  timeout: number;
  retryAttempts: number;
  cacheTTL: number;
  enableMetrics: boolean;
  enableLogging: boolean;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastCheck: Date;
  dependencies: DependencyHealth[];
  metrics?: ServiceMetrics;
}

export interface DependencyHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: Date;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  duration: number;
  requestId: string;
}

/**
 * Base Service Class
 * Provides common functionality for all consolidated services
 */
export abstract class BaseService {
  protected config: ServiceConfig;
  protected logger: ServiceLogger;
  protected errorHandler: ErrorHandler;
  protected metrics: ServiceMetrics;
  protected startTime: Date;
  protected dependencies: Map<string, any>;

  constructor(serviceName: string, config?: Partial<ServiceConfig>) {
    this.config = {
      name: serviceName,
      version: '1.0.0',
      timeout: 5000,
      retryAttempts: 3,
      cacheTTL: 300,
      enableMetrics: true,
      enableLogging: true,
      ...config
    };

    this.logger = new ServiceLogger(serviceName);
    this.errorHandler = new ErrorHandler(serviceName);
    this.metrics = new ServiceMetrics(serviceName);
    this.startTime = new Date();
    this.dependencies = new Map();

    this.initialize();
  }

  /**
   * Service Initialization
   */
  private initialize(): void {
    if (this.config.enableLogging) {
      this.logger.info('Service initializing', { 
        service: this.config.name,
        version: this.config.version
      });
    }

    if (this.config.enableMetrics) {
      this.metrics.initialize();
    }

    // Register service health check
    this.registerHealthCheck();
  }

  /**
   * Execute service operation with common functionality
   */
  protected async executeOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: any
  ): Promise<ServiceResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      this.logger.info(`Starting ${operationName}`, { 
        requestId, 
        context,
        service: this.config.name
      });

      if (this.config.enableMetrics) {
        this.metrics.incrementRequestCount(operationName);
      }

      const result = await Promise.race([
        operation(),
        this.createTimeoutPromise<T>(this.config.timeout)
      ]);

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.recordResponseTime(operationName, duration);
        this.metrics.incrementSuccessCount(operationName);
      }

      this.logger.info(`Completed ${operationName}`, { 
        requestId, 
        duration,
        success: true
      });

      return {
        success: true,
        data: result,
        timestamp: new Date(),
        duration,
        requestId
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementErrorCount(operationName);
      }

      this.logger.error(`Failed ${operationName}`, { 
        requestId, 
        error,
        duration
      });

      const handledError = this.errorHandler.handleError(error, operationName);

      return {
        success: false,
        error: handledError.message,
        timestamp: new Date(),
        duration,
        requestId
      };
    }
  }

  /**
   * Execute operation with retry logic
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    attempts: number = this.config.retryAttempts
  ): Promise<ServiceResponse<T>> {
    let lastError: Error | null = null;

    for (let i = 0; i < attempts; i++) {
      try {
        return await this.executeOperation(operation, operationName);
      } catch (error) {
        lastError = error as Error;
        
        if (i < attempts - 1) {
          const delay = Math.pow(2, i) * 1000; // Exponential backoff
          await this.delay(delay);
          
          this.logger.warn(`Retrying ${operationName}`, { 
            attempt: i + 1,
            totalAttempts: attempts,
            delay
          });
        }
      }
    }

    throw lastError;
  }

  /**
   * Health Check
   */
  async getHealthStatus(): Promise<ServiceHealth> {
    const uptime = Date.now() - this.startTime.getTime();
    const dependencies = await this.checkDependencies();

    const overallStatus = dependencies.every(dep => dep.status === 'healthy') 
      ? 'healthy' 
      : dependencies.some(dep => dep.status === 'unhealthy') 
        ? 'unhealthy' 
        : 'degraded';

    return {
      service: this.config.name,
      status: overallStatus,
      uptime,
      lastCheck: new Date(),
      dependencies,
      metrics: this.config.enableMetrics ? this.metrics.getMetrics() : undefined
    };
  }

  /**
   * Add Service Dependency
   */
  protected addDependency(name: string, service: any): void {
    this.dependencies.set(name, service);
  }

  /**
   * Check Dependencies Health
   */
  private async checkDependencies(): Promise<DependencyHealth[]> {
    const dependencyChecks: DependencyHealth[] = [];

    for (const [name, service] of this.dependencies) {
      const startTime = Date.now();
      
      try {
        if (service.getHealthStatus) {
          const health = await service.getHealthStatus();
          dependencyChecks.push({
            name,
            status: health.status,
            responseTime: Date.now() - startTime,
            lastCheck: new Date()
          });
        } else {
          dependencyChecks.push({
            name,
            status: 'healthy',
            responseTime: Date.now() - startTime,
            lastCheck: new Date()
          });
        }
      } catch (error) {
        dependencyChecks.push({
          name,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          lastCheck: new Date()
        });
      }
    }

    return dependencyChecks;
  }

  /**
   * Register Health Check Endpoint
   */
  private registerHealthCheck(): void {
    // Register health check endpoint with service registry
    this.logger.info('Health check registered', { 
      service: this.config.name,
      endpoint: `/health/${this.config.name}`
    });
  }

  /**
   * Utility Methods
   */
  private generateRequestId(): string {
    return `${this.config.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createTimeoutPromise<T>(timeout: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Service Shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Service shutting down', { 
      service: this.config.name,
      uptime: Date.now() - this.startTime.getTime()
    });

    if (this.config.enableMetrics) {
      await this.metrics.shutdown();
    }

    // Close any open connections
    for (const [name, service] of this.dependencies) {
      if (service.shutdown) {
        await service.shutdown();
      }
    }
  }
}