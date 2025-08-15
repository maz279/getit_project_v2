/**
 * Simple Storage Fallback
 * Provides a direct storage interface without complex database routing
 */

import { storage } from "./storage";
import { db } from "./db";
import { 
  users, 
  products,
  categories,
  vendors,
  cartItems,
  orders,
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct
} from "@shared/schema";
import { eq, desc, ilike } from "drizzle-orm";

export class SimpleStorageFallback {
  private static instance: SimpleStorageFallback;

  private constructor() {}

  public static getInstance(): SimpleStorageFallback {
    if (!SimpleStorageFallback.instance) {
      SimpleStorageFallback.instance = new SimpleStorageFallback();
    }
    return SimpleStorageFallback.instance;
  }

  // Simple health check that doesn't rely on complex database routing
  public async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      // Use a simple SQL query instead of drizzle's select to avoid schema mismatches
      const result = await db.execute('SELECT 1 as test');
      console.log('✅ Health check successful - database connection working');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('⚠️ Health check failed:', error.message);
      return {
        status: 'degraded',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Simple user operations
  public async getUser(id: number): Promise<User | undefined> {
    try {
      return await storage.getUser(id);
    } catch (error) {
      console.warn('Storage operation failed:', error.message);
      return undefined;
    }
  }

  public async createUser(user: InsertUser): Promise<User | null> {
    try {
      return await storage.createUser(user);
    } catch (error) {
      console.warn('Storage operation failed:', error.message);
      return null;
    }
  }

  // Simple product operations
  public async getProducts(limit = 10, offset = 0): Promise<Product[]> {
    try {
      return await storage.getProducts(limit, offset);
    } catch (error) {
      console.warn('Storage operation failed:', error.message);
      return [];
    }
  }

  public async getProduct(id: string): Promise<Product | undefined> {
    try {
      return await storage.getProduct(id);
    } catch (error) {
      console.warn('Storage operation failed:', error.message);
      return undefined;
    }
  }

  public async createProduct(product: InsertProduct): Promise<Product | null> {
    try {
      return await storage.createProduct(product);
    } catch (error) {
      console.warn('Storage operation failed:', error.message);
      return null;
    }
  }

  // Simple search operations
  public async searchProducts(query: string): Promise<Product[]> {
    try {
      return await storage.searchProducts(query);
    } catch (error) {
      console.warn('Storage operation failed:', error.message);
      return [];
    }
  }
}

// Export singleton instance
export const simpleStorageFallback = SimpleStorageFallback.getInstance();