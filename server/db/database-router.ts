import { Pool, Client } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as userSchema from '@shared/schemas/user-service-schema';
import * as productSchema from '@shared/schemas/product-service-schema';
import * as orderSchema from '@shared/schemas/order-service-schema';

// Database configuration per service
interface ServiceDatabase {
  name: string;
  pool: Pool;
  drizzle: NodePgDatabase<any>;
  schema: any;
}

export class DatabaseRouter {
  private databases: Map<string, ServiceDatabase> = new Map();
  private initialized = false;

  constructor() {
    // Initialize will be called asynchronously
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // User Service Database
      const userPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 100,
        min: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.databases.set('users', {
        name: 'users',
        pool: userPool,
        drizzle: drizzle(userPool, { schema: userSchema }),
        schema: userSchema
      });

      // Product Service Database (using same PostgreSQL instance but logically separated)
      const productPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 150,
        min: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.databases.set('products', {
        name: 'products',
        pool: productPool,
        drizzle: drizzle(productPool, { schema: productSchema }),
        schema: productSchema
      });

      // Order Service Database
      const orderPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 200,
        min: 30,
        idleTimeoutMillis: 20000,
        connectionTimeoutMillis: 1000,
      });

      this.databases.set('orders', {
        name: 'orders',
        pool: orderPool,
        drizzle: drizzle(orderPool, { schema: orderSchema }),
        schema: orderSchema
      });

      // Analytics Service (ClickHouse simulation - using PostgreSQL for now)
      const analyticsPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 50,
        min: 5,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 5000,
      });

      this.databases.set('analytics', {
        name: 'analytics',
        pool: analyticsPool,
        drizzle: drizzle(analyticsPool),
        schema: {} // Analytics schema will be different
      });

      // Notification Service (MongoDB simulation - using PostgreSQL for now)
      const notificationPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 30,
        min: 5,
        idleTimeoutMillis: 45000,
        connectionTimeoutMillis: 3000,
      });

      this.databases.set('notifications', {
        name: 'notifications',
        pool: notificationPool,
        drizzle: drizzle(notificationPool),
        schema: {} // Notification schema will be different
      });

      this.initialized = true;
      console.log('🚀 Database Router initialized with service-specific databases');
    } catch (error) {
      console.error('Failed to initialize Database Router:', error);
      throw error;
    }
  }

  // Get database connection for a specific service
  async getDatabase(service: string): Promise<NodePgDatabase<any>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const db = this.databases.get(service);
    if (!db) {
      throw new Error(`No database configured for service: ${service}`);
    }

    return db.drizzle;
  }

  // Get schema for a specific service
  getSchema(service: string) {
    const db = this.databases.get(service);
    if (!db) {
      throw new Error(`No schema found for service: ${service}`);
    }
    return db.schema;
  }

  // Get pool for direct queries
  getPool(service: string): Pool {
    const db = this.databases.get(service);
    if (!db) {
      throw new Error(`No pool found for service: ${service}`);
    }
    return db.pool;
  }

  // Execute a query with automatic routing
  async execute(service: string, query: any) {
    const db = await this.getDatabase(service);
    return await query(db);
  }

  // Health check for all databases
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [service, db] of this.databases) {
      try {
        await db.pool.query('SELECT 1');
        results[service] = true;
      } catch (error) {
        results[service] = false;
        console.error(`Health check failed for ${service}:`, error);
      }
    }

    return results;
  }

  // Graceful shutdown
  async shutdown() {
    console.log('Shutting down database connections...');
    for (const [service, db] of this.databases) {
      try {
        await db.pool.end();
        console.log(`Closed connection pool for ${service}`);
      } catch (error) {
        console.error(`Error closing pool for ${service}:`, error);
      }
    }
    this.initialized = false;
  }
}

// Singleton instance
export const databaseRouter = new DatabaseRouter();

// Helper functions for common operations
export async function getUserDb() {
  return databaseRouter.getDatabase('users');
}

export async function getProductDb() {
  return databaseRouter.getDatabase('products');
}

export async function getOrderDb() {
  return databaseRouter.getDatabase('orders');
}

export async function getAnalyticsDb() {
  return databaseRouter.getDatabase('analytics');
}

export async function getNotificationDb() {
  return databaseRouter.getDatabase('notifications');
}