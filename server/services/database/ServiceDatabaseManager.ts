/**
 * Service Database Manager - Phase 1 Week 2
 * Manages database separation and distributed transactions
 * 
 * @fileoverview Service database manager with saga pattern implementation
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { z } from 'zod';

// Import service schemas
import * as UserSchema from '../../database/schemas/user-service-schema';
import * as ProductSchema from '../../database/schemas/product-service-schema';
import * as OrderSchema from '../../database/schemas/order-service-schema';
import * as AnalyticsSchema from '../../database/schemas/analytics-service-schema';
import * as NotificationSchema from '../../database/schemas/notification-service-schema';

// ================================
// SERVICE DATABASE CONFIGURATION
// ================================

interface ServiceDatabaseConfig {
  name: string;
  connectionString: string;
  maxConnections: number;
  readReplicas?: string[];
  schema: any;
  healthCheck: string;
}

export class ServiceDatabaseManager {
  private databases: Map<string, any> = new Map();
  private connections: Map<string, postgres.Sql> = new Map();
  private config: Map<string, ServiceDatabaseConfig> = new Map();
  private transactionSagas: Map<string, SagaTransaction> = new Map();

  constructor() {
    this.initializeServiceDatabases();
  }

  // ================================
  // DATABASE INITIALIZATION
  // ================================

  private initializeServiceDatabases(): void {
    // User Service Database
    this.config.set('user-service', {
      name: 'user-service',
      connectionString: process.env.USER_SERVICE_DATABASE_URL || 
        process.env.DATABASE_URL || 
        'postgresql://localhost:5432/getit_user_service',
      maxConnections: 50,
      readReplicas: [
        process.env.USER_SERVICE_READ_REPLICA_1_URL,
        process.env.USER_SERVICE_READ_REPLICA_2_URL,
      ].filter(Boolean),
      schema: UserSchema,
      healthCheck: 'SELECT 1 FROM users LIMIT 1',
    });

    // Product Service Database
    this.config.set('product-service', {
      name: 'product-service',
      connectionString: process.env.PRODUCT_SERVICE_DATABASE_URL || 
        process.env.DATABASE_URL || 
        'postgresql://localhost:5432/getit_product_service',
      maxConnections: 75,
      readReplicas: [
        process.env.PRODUCT_SERVICE_READ_REPLICA_1_URL,
        process.env.PRODUCT_SERVICE_READ_REPLICA_2_URL,
      ].filter(Boolean),
      schema: ProductSchema,
      healthCheck: 'SELECT 1 FROM products LIMIT 1',
    });

    // Order Service Database
    this.config.set('order-service', {
      name: 'order-service',
      connectionString: process.env.ORDER_SERVICE_DATABASE_URL || 
        process.env.DATABASE_URL || 
        'postgresql://localhost:5432/getit_order_service',
      maxConnections: 100,
      readReplicas: [
        process.env.ORDER_SERVICE_READ_REPLICA_1_URL,
        process.env.ORDER_SERVICE_READ_REPLICA_2_URL,
      ].filter(Boolean),
      schema: OrderSchema,
      healthCheck: 'SELECT 1 FROM orders LIMIT 1',
    });

    // Analytics Service Database (ClickHouse-style)
    this.config.set('analytics-service', {
      name: 'analytics-service',
      connectionString: process.env.ANALYTICS_SERVICE_DATABASE_URL || 
        process.env.DATABASE_URL || 
        'postgresql://localhost:5432/getit_analytics_service',
      maxConnections: 25,
      readReplicas: [
        process.env.ANALYTICS_SERVICE_READ_REPLICA_1_URL,
      ].filter(Boolean),
      schema: AnalyticsSchema,
      healthCheck: 'SELECT 1 FROM events LIMIT 1',
    });

    // Notification Service Database (MongoDB-style)
    this.config.set('notification-service', {
      name: 'notification-service',
      connectionString: process.env.NOTIFICATION_SERVICE_DATABASE_URL || 
        process.env.DATABASE_URL || 
        'postgresql://localhost:5432/getit_notification_service',
      maxConnections: 30,
      readReplicas: [
        process.env.NOTIFICATION_SERVICE_READ_REPLICA_1_URL,
      ].filter(Boolean),
      schema: NotificationSchema,
      healthCheck: 'SELECT 1 FROM notifications LIMIT 1',
    });

    // Initialize connections
    this.initializeConnections();
  }

  // ================================
  // CONNECTION MANAGEMENT
  // ================================

  private initializeConnections(): void {
    for (const [serviceName, config] of this.config.entries()) {
      try {
        // Primary connection
        const connection = postgres(config.connectionString, {
          max: config.maxConnections,
          idle_timeout: 20,
          connect_timeout: 10,
        });

        this.connections.set(serviceName, connection);
        
        // Initialize Drizzle ORM
        const db = drizzle(connection, { schema: config.schema });
        this.databases.set(serviceName, db);

        // Initialize read replicas if available
        if (config.readReplicas && config.readReplicas.length > 0) {
          config.readReplicas.forEach((replicaUrl, index) => {
            const replicaConnection = postgres(replicaUrl, {
              max: Math.floor(config.maxConnections / 2),
              idle_timeout: 20,
              connect_timeout: 10,
            });

            const replicaKey = `${serviceName}-replica-${index}`;
            this.connections.set(replicaKey, replicaConnection);
            
            const replicaDb = drizzle(replicaConnection, { schema: config.schema });
            this.databases.set(replicaKey, replicaDb);
          });
        }

        console.log(`✅ Initialized database connection for ${serviceName}`);
      } catch (error) {
        console.error(`❌ Failed to initialize database for ${serviceName}:`, error);
      }
    }
  }

  // ================================
  // DATABASE ACCESS METHODS
  // ================================

  public getDatabase(serviceName: string, readOnly: boolean = false): any {
    if (readOnly) {
      // Try to get read replica first
      const replicaKey = `${serviceName}-replica-0`;
      if (this.databases.has(replicaKey)) {
        return this.databases.get(replicaKey);
      }
    }

    return this.databases.get(serviceName);
  }

  public getConnection(serviceName: string): postgres.Sql | undefined {
    return this.connections.get(serviceName);
  }

  public async closeConnections(): Promise<void> {
    for (const [serviceName, connection] of this.connections.entries()) {
      try {
        await connection.end();
        console.log(`✅ Closed database connection for ${serviceName}`);
      } catch (error) {
        console.error(`❌ Failed to close connection for ${serviceName}:`, error);
      }
    }
  }

  // ================================
  // HEALTH CHECK METHODS
  // ================================

  public async healthCheck(serviceName?: string): Promise<ServiceHealthStatus> {
    const results: ServiceHealthStatus = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      services: {}
    };

    const servicesToCheck = serviceName ? [serviceName] : Array.from(this.config.keys());

    for (const service of servicesToCheck) {
      const config = this.config.get(service);
      if (!config) continue;

      try {
        const db = this.getDatabase(service);
        if (!db) {
          results.services[service] = {
            status: 'unhealthy',
            error: 'Database connection not found',
            responseTime: 0
          };
          continue;
        }

        const startTime = Date.now();
        await db.execute(config.healthCheck);
        const responseTime = Date.now() - startTime;

        results.services[service] = {
          status: 'healthy',
          responseTime,
          connectionCount: this.connections.get(service)?.options.max || 0
        };

      } catch (error) {
        results.services[service] = {
          status: 'unhealthy',
          error: error.message,
          responseTime: 0
        };
        results.overall = 'unhealthy';
      }
    }

    return results;
  }

  // ================================
  // DISTRIBUTED TRANSACTION MANAGEMENT
  // ================================

  public async beginSagaTransaction(transactionId: string): Promise<SagaTransaction> {
    const saga = new SagaTransaction(transactionId, this);
    this.transactionSagas.set(transactionId, saga);
    return saga;
  }

  public async commitSagaTransaction(transactionId: string): Promise<boolean> {
    const saga = this.transactionSagas.get(transactionId);
    if (!saga) return false;

    try {
      await saga.commit();
      this.transactionSagas.delete(transactionId);
      return true;
    } catch (error) {
      await saga.rollback();
      this.transactionSagas.delete(transactionId);
      throw error;
    }
  }

  public async rollbackSagaTransaction(transactionId: string): Promise<boolean> {
    const saga = this.transactionSagas.get(transactionId);
    if (!saga) return false;

    try {
      await saga.rollback();
      this.transactionSagas.delete(transactionId);
      return true;
    } catch (error) {
      console.error(`Failed to rollback saga transaction ${transactionId}:`, error);
      return false;
    }
  }

  // ================================
  // MIGRATION SUPPORT
  // ================================

  public async executeMigration(serviceName: string, migrationSql: string): Promise<void> {
    const connection = this.getConnection(serviceName);
    if (!connection) {
      throw new Error(`No connection found for service: ${serviceName}`);
    }

    try {
      await connection.begin(async (tx) => {
        await tx.unsafe(migrationSql);
      });
      console.log(`✅ Migration executed successfully for ${serviceName}`);
    } catch (error) {
      console.error(`❌ Migration failed for ${serviceName}:`, error);
      throw error;
    }
  }

  // ================================
  // PERFORMANCE MONITORING
  // ================================

  public async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      services: {}
    };

    for (const [serviceName, connection] of this.connections.entries()) {
      try {
        const startTime = Date.now();
        await connection`SELECT 1`;
        const responseTime = Date.now() - startTime;

        metrics.services[serviceName] = {
          responseTime,
          activeConnections: connection.options.max || 0,
          idleConnections: 0, // Would need to implement actual tracking
          queriesPerSecond: 0, // Would need to implement actual tracking
          errorRate: 0 // Would need to implement actual tracking
        };
      } catch (error) {
        metrics.services[serviceName] = {
          responseTime: -1,
          activeConnections: 0,
          idleConnections: 0,
          queriesPerSecond: 0,
          errorRate: 100
        };
      }
    }

    return metrics;
  }
}

// ================================
// SAGA TRANSACTION IMPLEMENTATION
// ================================

class SagaTransaction {
  private transactionId: string;
  private databaseManager: ServiceDatabaseManager;
  private steps: SagaStep[] = [];
  private committed: boolean = false;
  private rolledBack: boolean = false;

  constructor(transactionId: string, databaseManager: ServiceDatabaseManager) {
    this.transactionId = transactionId;
    this.databaseManager = databaseManager;
  }

  public addStep(step: SagaStep): void {
    if (this.committed || this.rolledBack) {
      throw new Error('Cannot add steps to completed transaction');
    }
    this.steps.push(step);
  }

  public async commit(): Promise<void> {
    if (this.committed || this.rolledBack) {
      throw new Error('Transaction already completed');
    }

    try {
      // Execute all steps
      for (const step of this.steps) {
        await step.execute();
      }
      
      this.committed = true;
      console.log(`✅ Saga transaction ${this.transactionId} committed successfully`);
    } catch (error) {
      console.error(`❌ Saga transaction ${this.transactionId} failed:`, error);
      await this.rollback();
      throw error;
    }
  }

  public async rollback(): Promise<void> {
    if (this.rolledBack) {
      throw new Error('Transaction already rolled back');
    }

    try {
      // Execute compensation actions in reverse order
      for (let i = this.steps.length - 1; i >= 0; i--) {
        const step = this.steps[i];
        if (step.compensate) {
          await step.compensate();
        }
      }

      this.rolledBack = true;
      console.log(`✅ Saga transaction ${this.transactionId} rolled back successfully`);
    } catch (error) {
      console.error(`❌ Failed to rollback saga transaction ${this.transactionId}:`, error);
      throw error;
    }
  }
}

// ================================
// TYPE DEFINITIONS
// ================================

interface ServiceHealthStatus {
  timestamp: string;
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: {
    [serviceName: string]: {
      status: 'healthy' | 'unhealthy' | 'degraded';
      responseTime: number;
      connectionCount?: number;
      error?: string;
    };
  };
}

interface PerformanceMetrics {
  timestamp: string;
  services: {
    [serviceName: string]: {
      responseTime: number;
      activeConnections: number;
      idleConnections: number;
      queriesPerSecond: number;
      errorRate: number;
    };
  };
}

interface SagaStep {
  execute: () => Promise<void>;
  compensate?: () => Promise<void>;
}

// ================================
// EXPORT SINGLETON INSTANCE
// ================================

export const serviceDatabaseManager = new ServiceDatabaseManager();
export default serviceDatabaseManager;