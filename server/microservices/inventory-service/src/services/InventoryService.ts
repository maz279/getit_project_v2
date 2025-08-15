/**
 * Inventory Service - Enterprise Inventory Management
 * Amazon.com/Shopee.sg level inventory operations with real-time tracking
 */

import { db } from '../../../../db';
import { products, inventoryMovements } from '@shared/schema';
import { eq, and, desc, sql, lte, gte, count, sum } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService';

export class InventoryService {
  private redisService: RedisService;
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor() {
    this.redisService = new RedisService();
  }

  /**
   * Get product inventory status
   */
  async getProductInventory(productId: string, vendorId?: string): Promise<any> {
    try {
      const cacheKey = `inventory:${productId}${vendorId ? `:${vendorId}` : ''}`;
      
      // Try to get from cache first
      const cached = await this.redisService.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      let query = db.select({
        productId: products.id,
        stockQuantity: products.inventory,
        sku: products.sku,
        name: products.name,
        vendorId: products.vendorId,
        lowStockThreshold: products.lowStockThreshold,
        status: products.status,
        lastUpdated: products.updatedAt
      }).from(products).where(eq(products.id, productId));

      if (vendorId) {
        query = query.where(and(
          eq(products.id, productId),
          eq(products.vendorId, vendorId)
        ));
      }

      const [inventory] = await query;

      if (!inventory) {
        throw new Error('Product not found or access denied');
      }

      // Calculate additional inventory metrics
      const inventoryData = {
        ...inventory,
        isLowStock: inventory.stockQuantity <= (inventory.lowStockThreshold || 10),
        stockStatus: this.getStockStatus(inventory.stockQuantity, inventory.lowStockThreshold),
        lastMovement: await this.getLastMovement(productId)
      };

      // Cache the result
      await this.redisService.cacheData(cacheKey, inventoryData, this.CACHE_TTL);

      return inventoryData;

    } catch (error) {
      console.error('Error getting product inventory:', error);
      throw error;
    }
  }

  /**
   * Update product inventory
   */
  async updateInventory(productId: string, updateData: any, userId?: number): Promise<any> {
    try {
      const { stockQuantity, reason, notes } = updateData;

      // Get current inventory
      const currentInventory = await this.getProductInventory(productId);
      const previousQuantity = currentInventory.stockQuantity;

      // Update inventory
      const [updatedProduct] = await db
        .update(products)
        .set({
          inventory: stockQuantity,
          updatedAt: new Date()
        })
        .where(eq(products.id, productId))
        .returning();

      // Record inventory movement
      await this.recordInventoryMovement({
        productId,
        movementType: stockQuantity > previousQuantity ? 'addition' : 'reduction',
        quantity: Math.abs(stockQuantity - previousQuantity),
        previousQuantity,
        newQuantity: stockQuantity,
        reason: reason || 'manual_update',
        notes,
        performedBy: userId?.toString()
      });

      // Clear cache
      await this.clearInventoryCache(productId);

      return {
        ...updatedProduct,
        previousQuantity,
        quantityChanged: stockQuantity - previousQuantity
      };

    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }

  /**
   * Reserve inventory for order
   */
  async reserveInventory(reservationData: any, userId?: number): Promise<any> {
    try {
      const { orderId, items, expiresAt } = reservationData;

      // Validate inventory availability
      for (const item of items) {
        const inventory = await this.getProductInventory(item.productId);
        if (inventory.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}. Available: ${inventory.stockQuantity}, Required: ${item.quantity}`);
        }
      }

      // Record inventory movements for each item
      const reservationResults = [];
      for (const item of items) {
        await this.recordInventoryMovement({
          productId: item.productId,
          movementType: 'reservation',
          quantity: item.quantity,
          reason: 'order_reservation',
          notes: `Reserved for order ${orderId}`,
          performedBy: userId?.toString(),
          relatedOrderId: orderId
        });

        reservationResults.push({
          productId: item.productId,
          quantity: item.quantity,
          status: 'reserved',
          orderId
        });
      }

      return {
        id: orderId,
        items: reservationResults,
        status: 'active',
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 60 * 1000)
      };

    } catch (error) {
      console.error('Error reserving inventory:', error);
      throw error;
    }
  }



  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(vendorId?: string, threshold?: number, page = 1, limit = 20): Promise<any> {
    try {
      const offset = (page - 1) * limit;

      let query = db.select({
        productId: products.id,
        name: products.name,
        sku: products.sku,
        currentStock: products.inventory,
        lowStockThreshold: products.lowStockThreshold,
        vendorId: products.vendorId,
        status: products.status
      }).from(products);

      // Apply filters
      const conditions = [];

      if (vendorId) {
        conditions.push(eq(products.vendorId, vendorId));
      }

      if (threshold) {
        conditions.push(lte(products.inventory, threshold));
      } else {
        conditions.push(sql`${products.inventory} <= COALESCE(${products.lowStockThreshold}, 10)`);
      }

      conditions.push(eq(products.status, 'active'));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const alerts = await query
        .orderBy(products.inventory)
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(products)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        alerts,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };

    } catch (error) {
      console.error('Error getting low stock alerts:', error);
      throw error;
    }
  }

  /**
   * Get inventory analytics
   */
  async getInventoryAnalytics(vendorId?: string, timeframe = '30d', metrics = ['turnover', 'value', 'alerts']): Promise<any> {
    try {
      const analytics: any = {};

      // Calculate timeframe
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      if (metrics.includes('turnover')) {
        analytics.turnover = await this.calculateInventoryTurnover(vendorId, startDate);
      }

      if (metrics.includes('value')) {
        analytics.inventoryValue = await this.calculateInventoryValue(vendorId);
      }

      if (metrics.includes('alerts')) {
        analytics.lowStockCount = await this.getLowStockCount(vendorId);
      }

      if (metrics.includes('movements')) {
        analytics.recentMovements = await this.getRecentMovements(vendorId, startDate);
      }

      return analytics;

    } catch (error) {
      console.error('Error getting inventory analytics:', error);
      throw error;
    }
  }

  /**
   * Record inventory movement
   */
  private async recordInventoryMovement(movementData: any): Promise<void> {
    try {
      await db.insert(inventoryMovements).values({
        productId: movementData.productId,
        movementType: movementData.movementType,
        quantity: movementData.quantity,
        previousQuantity: movementData.previousQuantity,
        newQuantity: movementData.newQuantity,
        reason: movementData.reason,
        notes: movementData.notes,
        performedBy: movementData.performedBy,
        relatedOrderId: movementData.relatedOrderId
      });
    } catch (error) {
      console.error('Error recording inventory movement:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  /**
   * Get stock status
   */
  private getStockStatus(currentStock: number, threshold?: number): string {
    const lowStockThreshold = threshold || 10;
    
    if (currentStock === 0) return 'out_of_stock';
    if (currentStock <= lowStockThreshold) return 'low_stock';
    if (currentStock <= lowStockThreshold * 2) return 'medium_stock';
    return 'in_stock';
  }

  /**
   * Get last inventory movement
   */
  private async getLastMovement(productId: string): Promise<any> {
    try {
      const [lastMovement] = await db
        .select()
        .from(inventoryMovements)
        .where(eq(inventoryMovements.productId, productId))
        .orderBy(desc(inventoryMovements.createdAt))
        .limit(1);

      return lastMovement || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear inventory cache
   */
  private async clearInventoryCache(productId: string): Promise<void> {
    try {
      const patterns = [
        `inventory:${productId}*`,
        `low_stock:*`,
        `analytics:*`
      ];

      for (const pattern of patterns) {
        await this.redisService.clearCachePattern(pattern);
      }
    } catch (error) {
      console.error('Error clearing inventory cache:', error);
    }
  }

  /**
   * Calculate inventory turnover
   */
  private async calculateInventoryTurnover(vendorId?: string, startDate?: Date): Promise<number> {
    // Placeholder implementation
    return 0;
  }

  /**
   * Calculate inventory value
   */
  private async calculateInventoryValue(vendorId?: string): Promise<number> {
    try {
      let query = db.select({
        value: sql<number>`SUM(CAST(${products.price} AS DECIMAL) * ${products.inventory})`
      }).from(products);

      if (vendorId) {
        query = query.where(eq(products.vendorId, vendorId));
      }

      const [result] = await query;
      return result.value || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get low stock count
   */
  private async getLowStockCount(vendorId?: string): Promise<number> {
    try {
      let query = db.select({ count: count() }).from(products);

      const conditions = [
        sql`${products.inventory} <= COALESCE(${products.lowStockThreshold}, 10)`,
        eq(products.status, 'active')
      ];

      if (vendorId) {
        conditions.push(eq(products.vendorId, vendorId));
      }

      const [result] = await query.where(and(...conditions));
      return result.count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get recent movements
   */
  private async getRecentMovements(vendorId?: string, startDate?: Date): Promise<any[]> {
    // Placeholder implementation
    return [];
  }
}