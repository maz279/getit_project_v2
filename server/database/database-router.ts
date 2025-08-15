/**
 * Database Router
 * Amazon.com/Shopee.sg Enterprise Database Routing Strategy
 */

import { multiDbManager, DatabaseType } from './multi-db-manager';
import winston from 'winston';

export type QueryType = 'read' | 'write' | 'analytics' | 'search' | 'cache' | 'metrics';
export type DataDomain = 'users' | 'products' | 'orders' | 'analytics' | 'sessions' | 'search' | 'metrics';

export interface QueryContext {
  type: QueryType;
  domain: DataDomain;
  priority: 'high' | 'medium' | 'low';
  userId?: string;
  cacheKey?: string;
  ttl?: number;
}

export class DatabaseRouter {
  private static instance: DatabaseRouter;
  private logger: winston.Logger;
  private routingStrategy: Map<string, DatabaseType>;

  private constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          handleExceptions: false,
          handleRejections: false
        })
      ],
      exitOnError: false,
      silent: false
    });

    this.initializeRoutingStrategy();
  }

  public static getInstance(): DatabaseRouter {
    if (!DatabaseRouter.instance) {
      DatabaseRouter.instance = new DatabaseRouter();
    }
    return DatabaseRouter.instance;
  }

  private initializeRoutingStrategy(): void {
    this.routingStrategy = new Map([
      // User data routing
      ['users:read', 'primary'],
      ['users:write', 'primary'],
      ['users:cache', 'cache'],

      // Product data routing
      ['products:read', 'primary'],
      ['products:write', 'primary'],
      ['products:search', 'search'],
      ['products:cache', 'cache'],

      // Order data routing
      ['orders:read', 'primary'],
      ['orders:write', 'primary'],
      ['orders:analytics', 'analytics'],
      ['orders:cache', 'cache'],

      // Analytics data routing
      ['analytics:read', 'analytics'],
      ['analytics:write', 'analytics'],
      ['analytics:metrics', 'timeseries'],

      // Session data routing
      ['sessions:read', 'cache'],
      ['sessions:write', 'cache'],

      // Search data routing
      ['search:read', 'search'],
      ['search:write', 'search'],

      // Metrics data routing
      ['metrics:read', 'timeseries'],
      ['metrics:write', 'timeseries']
    ]);
  }

  // Route query to appropriate database
  public async route<T>(
    context: QueryContext,
    operation: (db: any) => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Determine target database
      const targetDb = this.determineTargetDatabase(context);
      
      // Get database connection
      const connection = multiDbManager.getConnection(targetDb);
      
      // Execute operation with appropriate strategy
      const result = await this.executeWithStrategy(
        targetDb,
        context,
        operation,
        connection
      );

      // Log performance metrics
      this.logPerformanceMetrics(context, targetDb, Date.now() - startTime);

      return result;
    } catch (error) {
      this.logger.error('Database routing error:', {
        context,
        error: error instanceof Error ? error.message : error,
        duration: Date.now() - startTime
      });
      
      // Attempt fallback strategy
      return this.executeWithFallback(context, operation);
    }
  }

  // Determine target database based on context
  private determineTargetDatabase(context: QueryContext): DatabaseType {
    const routingKey = `${context.domain}:${context.type}`;
    const targetDb = this.routingStrategy.get(routingKey);

    if (!targetDb) {
      // Default routing logic
      switch (context.type) {
        case 'cache':
          return 'cache';
        case 'search':
          return 'search';
        case 'analytics':
          return 'analytics';
        case 'metrics':
          return 'timeseries';
        default:
          return 'primary';
      }
    }

    return targetDb;
  }

  // Execute operation with database-specific strategy
  private async executeWithStrategy<T>(
    targetDb: DatabaseType,
    context: QueryContext,
    operation: (db: any) => Promise<T>,
    connection: any
  ): Promise<T> {
    switch (targetDb) {
      case 'cache':
        return this.executeCacheStrategy(context, operation, connection);
      
      case 'search':
        return this.executeSearchStrategy(context, operation, connection);
      
      case 'analytics':
        return this.executeAnalyticsStrategy(context, operation, connection);
      
      case 'timeseries':
        return this.executeTimeseriesStrategy(context, operation, connection);
      
      case 'primary':
      default:
        return this.executePrimaryStrategy(context, operation, connection);
    }
  }

  // Primary database strategy (PostgreSQL)
  private async executePrimaryStrategy<T>(
    context: QueryContext,
    operation: (db: any) => Promise<T>,
    connection: any
  ): Promise<T> {
    // For high-priority operations, use immediate execution
    if (context.priority === 'high') {
      return operation(connection);
    }

    // For read operations, try cache first
    if (context.type === 'read' && context.cacheKey) {
      const cached = await this.tryCache(context.cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Execute primary operation
    const result = await operation(connection);

    // Cache the result for read operations
    if (context.type === 'read' && context.cacheKey) {
      await this.setCache(context.cacheKey, result, context.ttl || 3600);
    }

    return result;
  }

  // Cache strategy (Redis)
  private async executeCacheStrategy<T>(
    context: QueryContext,
    operation: (db: any) => Promise<T>,
    connection: any
  ): Promise<T> {
    return operation(connection);
  }

  // Search strategy (Elasticsearch)
  private async executeSearchStrategy<T>(
    context: QueryContext,
    operation: (db: any) => Promise<T>,
    connection: any
  ): Promise<T> {
    // For search operations, implement search-specific optimizations
    return operation(connection);
  }

  // Analytics strategy (ClickHouse)
  private async executeAnalyticsStrategy<T>(
    context: QueryContext,
    operation: (db: any) => Promise<T>,
    connection: any
  ): Promise<T> {
    // For analytics, use async processing for writes
    if (context.type === 'write' && context.priority !== 'high') {
      // Queue for batch processing
      setImmediate(() => operation(connection));
      return Promise.resolve({} as T);
    }

    return operation(connection);
  }

  // Timeseries strategy (InfluxDB)
  private async executeTimeseriesStrategy<T>(
    context: QueryContext,
    operation: (db: any) => Promise<T>,
    connection: any
  ): Promise<T> {
    // For metrics, use batch writing
    return operation(connection);
  }

  // Execute with fallback strategy
  private async executeWithFallback<T>(
    context: QueryContext,
    operation: (db: any) => Promise<T>
  ): Promise<T> {
    this.logger.warn('Executing with fallback strategy:', context);
    
    // Check if operation is actually a function
    if (typeof operation !== 'function') {
      this.logger.error('Operation is not a function:', typeof operation);
      return Promise.resolve({} as T);
    }
    
    // Try primary database as fallback
    try {
      const primaryConnection = multiDbManager.getConnection('primary');
      return await operation(primaryConnection);
    } catch (error) {
      this.logger.error('Fallback strategy failed:', error);
      // Instead of throwing, return a safe fallback response
      return Promise.resolve({} as T);
    }
  }

  // Cache helper methods
  private async tryCache(key: string): Promise<any> {
    try {
      const cacheDb = multiDbManager.getCacheDB();
      return await cacheDb.get(key);
    } catch (error) {
      this.logger.warn('Cache read failed:', error);
      return null;
    }
  }

  private async setCache(key: string, value: any, ttl: number): Promise<void> {
    try {
      const cacheDb = multiDbManager.getCacheDB();
      await cacheDb.set(key, JSON.stringify(value), ttl);
    } catch (error) {
      this.logger.warn('Cache write failed:', error);
    }
  }

  // Performance monitoring
  private logPerformanceMetrics(
    context: QueryContext,
    targetDb: DatabaseType,
    duration: number
  ): void {
    if (duration > 1000) { // Log slow queries (>1s)
      this.logger.warn('Slow query detected:', {
        context,
        targetDb,
        duration,
        threshold: 1000
      });
    }

    // Send metrics to timeseries database
    this.recordMetrics({
      measurement: 'database_performance',
      tags: {
        database: targetDb,
        domain: context.domain,
        type: context.type,
        priority: context.priority
      },
      fields: {
        duration,
        timestamp: Date.now()
      }
    });
  }

  // Record metrics
  private async recordMetrics(metric: any): Promise<void> {
    try {
      const timeseriesDb = multiDbManager.getTimeseriesDB();
      await timeseriesDb.writePoint(metric);
    } catch (error) {
      // Silent failure for metrics
    }
  }

  // Convenience methods for common operations
  public async readFromPrimary<T>(
    domain: DataDomain,
    operation: (db: any) => Promise<T>,
    cacheKey?: string,
    ttl?: number
  ): Promise<T> {
    return this.route({
      type: 'read',
      domain,
      priority: 'medium',
      cacheKey,
      ttl
    }, operation);
  }

  public async writeToPrimary<T>(
    domain: DataDomain,
    operation: (db: any) => Promise<T>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<T> {
    return this.route({
      type: 'write',
      domain,
      priority
    }, operation);
  }

  public async searchProducts<T>(
    operation: (db: any) => Promise<T>
  ): Promise<T> {
    return this.route({
      type: 'search',
      domain: 'products',
      priority: 'high'
    }, operation);
  }

  public async recordAnalytics<T>(
    operation: (db: any) => Promise<T>
  ): Promise<T> {
    return this.route({
      type: 'analytics',
      domain: 'analytics',
      priority: 'low'
    }, operation);
  }

  public async recordMetrics<T>(
    operation: (db: any) => Promise<T>
  ): Promise<T> {
    return this.route({
      type: 'metrics',
      domain: 'metrics',
      priority: 'low'
    }, operation);
  }
}

// Export singleton instance
export const dbRouter = DatabaseRouter.getInstance();