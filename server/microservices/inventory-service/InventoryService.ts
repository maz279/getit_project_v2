import { db } from '../../db.js';
import { 
  productVariants, 
  inventoryMovements, 
  products, 
  vendors, 
  orders, 
  orderItems
} from '@shared/schema';
import { eq, and, desc, gte, lte, count, sum, sql } from 'drizzle-orm';
import { RedisService } from '../../services/RedisService';

/**
 * Inventory Service - Complete stock management and tracking
 * Implements Amazon.com/Shopee.sg level inventory operations
 */
export class InventoryService {
  private redisService: RedisService;

  constructor() {
    this.redisService = new RedisService();
  }

  /**
   * Get product inventory
   */
  async getProductInventory(productId: string): Promise<any> {
    try {
      // Try cache first
      const cacheKey = `inventory:${productId}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get product variants with inventory
      const inventoryRecords = await db
        .select({
          variantId: productVariants.id,
          productId: productVariants.productId,
          sku: productVariants.sku,
          name: productVariants.name,
          price: productVariants.price,
          costPrice: productVariants.costPrice,
          inventory: productVariants.inventory,
          weight: productVariants.weight,
          barcode: productVariants.barcode,
          isDefault: productVariants.isDefault,
          isActive: productVariants.isActive,
          updatedAt: productVariants.updatedAt,
          productName: products.name,
          productPrice: products.price,
          vendorId: products.vendorId,
          vendorName: vendors.businessName
        })
        .from(productVariants)
        .leftJoin(products, eq(productVariants.productId, products.id))
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(eq(productVariants.productId, productId));

      if (!inventoryRecords || inventoryRecords.length === 0) {
        throw new Error('Product inventory not found');
      }

      // Get recent movements for this product
      const recentMovements = await db
        .select({
          id: inventoryMovements.id,
          type: inventoryMovements.type,
          quantity: inventoryMovements.quantity,
          reason: inventoryMovements.reason,
          notes: inventoryMovements.notes,
          createdAt: inventoryMovements.createdAt,
          userId: inventoryMovements.userId
        })
        .from(inventoryMovements)
        .where(eq(inventoryMovements.productId, productId))
        .orderBy(desc(inventoryMovements.createdAt))
        .limit(10);

      // Calculate total inventory
      const totalInventory = inventoryRecords.reduce((sum, variant) => sum + (variant.inventory || 0), 0);
      const reorderLevel = Math.ceil(totalInventory * 0.2); // 20% of total as reorder level

      const inventoryData = {
        productId,
        totalInventory,
        reorderLevel,
        variants: inventoryRecords,
        recentMovements,
        status: this.getInventoryStatus(totalInventory, reorderLevel),
        lowStockAlert: totalInventory <= reorderLevel
      };

      // Cache for 5 minutes
      await this.redisService.setex(cacheKey, 300, JSON.stringify(inventoryData));

      return inventoryData;

    } catch (error) {
      console.error('Get product inventory error:', error);
      throw error;
    }
  }

  /**
   * Update inventory quantity
   */
  async updateInventory(productId: string, data: {
    variantId?: string;
    quantity?: number;
    adjustmentType: 'restock' | 'sale' | 'return' | 'damage' | 'adjustment';
    adjustmentQuantity: number;
    reason: string;
    notes?: string;
    updatedBy: string;
    costPrice?: number;
  }): Promise<any> {
    try {
      // Get current product variant inventory
      let currentVariant;
      if (data.variantId) {
        [currentVariant] = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.id, data.variantId));
      } else {
        // Get default variant for the product
        [currentVariant] = await db
          .select()
          .from(productVariants)
          .where(and(
            eq(productVariants.productId, productId),
            eq(productVariants.isDefault, true)
          ));
      }

      if (!currentVariant) {
        throw new Error('Product variant not found');
      }

      let newQuantity = currentVariant.inventory || 0;
      let movementType: 'in' | 'out' = 'in';

      // Calculate new quantity based on adjustment type
      switch (data.adjustmentType) {
        case 'restock':
        case 'return':
          newQuantity += data.adjustmentQuantity;
          movementType = 'in';
          break;
        case 'sale':
        case 'damage':
          newQuantity -= data.adjustmentQuantity;
          movementType = 'out';
          break;
        case 'adjustment':
          if (data.quantity !== undefined) {
            newQuantity = data.quantity;
            movementType = data.quantity > (currentVariant.inventory || 0) ? 'in' : 'out';
          }
          break;
      }

      // Validate new quantity
      if (newQuantity < 0) {
        throw new Error('Insufficient inventory quantity');
      }

      // Update variant inventory
      const updateData: any = {
        inventory: newQuantity,
        updatedAt: new Date()
      };

      if (data.costPrice !== undefined) {
        updateData.costPrice = data.costPrice.toString();
      }

      const [updatedVariant] = await db
        .update(productVariants)
        .set(updateData)
        .where(eq(productVariants.id, currentVariant.id))
        .returning();

      // Create inventory movement record
      await db.insert(inventoryMovements).values({
        productId,
        type: movementType,
        quantity: Math.abs(data.adjustmentQuantity),
        reason: data.reason,
        notes: data.notes,
        userId: parseInt(data.updatedBy) || 1
      });

      // Clear cache
      await this.clearInventoryCache(productId);

      // Check for low stock alerts (using 20% of current quantity as reorder level)
      const reorderLevel = Math.ceil(newQuantity * 0.2);
      if (newQuantity <= reorderLevel) {
        await this.createLowStockAlert(productId, newQuantity, reorderLevel);
      }

      return {
        success: true,
        variant: updatedVariant,
        previousQuantity: currentVariant.inventory || 0,
        newQuantity,
        adjustmentQuantity: data.adjustmentQuantity,
        adjustmentType: data.adjustmentType,
        message: 'Inventory updated successfully'
      };

    } catch (error) {
      console.error('Update inventory error:', error);
      throw error;
    }
  }

  /**
   * Reserve inventory for order
   */
  async reserveInventory(items: Array<{
    productId: string;
    quantity: number;
  }>, orderId: string): Promise<any> {
    try {
      const reservationResults = [];

      for (const item of items) {
        const [currentInventory] = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, item.productId));

        if (!currentInventory) {
          throw new Error(`Product inventory not found: ${item.productId}`);
        }

        const availableQuantity = currentInventory.quantity - currentInventory.reservedQuantity;
        
        if (availableQuantity < item.quantity) {
          throw new Error(`Insufficient inventory for product ${item.productId}. Available: ${availableQuantity}, Requested: ${item.quantity}`);
        }

        // Update reserved quantity
        const [updatedInventory] = await db
          .update(inventory)
          .set({
            reservedQuantity: currentInventory.reservedQuantity + item.quantity,
            updatedAt: new Date()
          })
          .where(eq(inventory.productId, item.productId))
          .returning();

        // Create inventory movement record
        await db.insert(inventoryMovements).values({
          productId: item.productId,
          vendorId: currentInventory.vendorId,
          type: 'out',
          quantity: item.quantity,
          previousQuantity: currentInventory.quantity,
          newQuantity: currentInventory.quantity,
          reason: 'Order reservation',
          notes: `Reserved for order: ${orderId}`,
          adjustmentType: 'sale',
          orderId,
          createdBy: 'system',
          createdAt: new Date()
        });

        reservationResults.push({
          productId: item.productId,
          reservedQuantity: item.quantity,
          remainingAvailable: updatedInventory.quantity - updatedInventory.reservedQuantity
        });

        // Clear cache
        await this.clearInventoryCache(item.productId);
      }

      return {
        success: true,
        orderId,
        reservations: reservationResults,
        message: 'Inventory reserved successfully'
      };

    } catch (error) {
      console.error('Reserve inventory error:', error);
      // Rollback any successful reservations
      await this.rollbackReservations(items, orderId);
      throw error;
    }
  }

  /**
   * Release inventory reservation
   */
  async releaseReservation(items: Array<{
    productId: string;
    quantity: number;
  }>, orderId: string, reason: string = 'Order cancelled'): Promise<any> {
    try {
      const releaseResults = [];

      for (const item of items) {
        const [currentInventory] = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, item.productId));

        if (!currentInventory) {
          console.warn(`Product inventory not found during release: ${item.productId}`);
          continue;
        }

        // Release reserved quantity
        const newReservedQuantity = Math.max(0, currentInventory.reservedQuantity - item.quantity);
        
        const [updatedInventory] = await db
          .update(inventory)
          .set({
            reservedQuantity: newReservedQuantity,
            updatedAt: new Date()
          })
          .where(eq(inventory.productId, item.productId))
          .returning();

        // Create inventory movement record
        await db.insert(inventoryMovements).values({
          productId: item.productId,
          vendorId: currentInventory.vendorId,
          type: 'in',
          quantity: item.quantity,
          previousQuantity: currentInventory.quantity,
          newQuantity: currentInventory.quantity,
          reason: `Reservation release: ${reason}`,
          notes: `Released reservation for order: ${orderId}`,
          adjustmentType: 'return',
          orderId,
          createdBy: 'system',
          createdAt: new Date()
        });

        releaseResults.push({
          productId: item.productId,
          releasedQuantity: item.quantity,
          newAvailable: updatedInventory.quantity - updatedInventory.reservedQuantity
        });

        // Clear cache
        await this.clearInventoryCache(item.productId);
      }

      return {
        success: true,
        orderId,
        releases: releaseResults,
        message: 'Reservations released successfully'
      };

    } catch (error) {
      console.error('Release reservation error:', error);
      throw error;
    }
  }

  /**
   * Confirm inventory sale (reduce actual quantity)
   */
  async confirmSale(items: Array<{
    productId: string;
    quantity: number;
  }>, orderId: string): Promise<any> {
    try {
      const saleResults = [];

      for (const item of items) {
        const [currentInventory] = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, item.productId));

        if (!currentInventory) {
          throw new Error(`Product inventory not found: ${item.productId}`);
        }

        // Reduce both actual and reserved quantity
        const newQuantity = currentInventory.quantity - item.quantity;
        const newReservedQuantity = Math.max(0, currentInventory.reservedQuantity - item.quantity);

        if (newQuantity < 0) {
          throw new Error(`Insufficient inventory for sale confirmation: ${item.productId}`);
        }

        const [updatedInventory] = await db
          .update(inventory)
          .set({
            quantity: newQuantity,
            reservedQuantity: newReservedQuantity,
            updatedAt: new Date()
          })
          .where(eq(inventory.productId, item.productId))
          .returning();

        // Create inventory movement record
        await db.insert(inventoryMovements).values({
          productId: item.productId,
          vendorId: currentInventory.vendorId,
          type: 'out',
          quantity: item.quantity,
          previousQuantity: currentInventory.quantity,
          newQuantity,
          reason: 'Sale confirmed',
          notes: `Sale confirmed for order: ${orderId}`,
          adjustmentType: 'sale',
          orderId,
          createdBy: 'system',
          createdAt: new Date()
        });

        saleResults.push({
          productId: item.productId,
          soldQuantity: item.quantity,
          remainingQuantity: newQuantity,
          availableQuantity: newQuantity - newReservedQuantity
        });

        // Clear cache
        await this.clearInventoryCache(item.productId);

        // Check for low stock alerts
        if (newQuantity <= currentInventory.reorderLevel) {
          await this.createLowStockAlert(item.productId, newQuantity, currentInventory.reorderLevel);
        }
      }

      return {
        success: true,
        orderId,
        sales: saleResults,
        message: 'Sales confirmed successfully'
      };

    } catch (error) {
      console.error('Confirm sale error:', error);
      throw error;
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(vendorId?: string, limit: number = 50): Promise<any> {
    try {
      let conditions = sql`${inventory.quantity} <= ${inventory.reorderLevel}`;
      
      if (vendorId) {
        conditions = sql`${conditions} AND ${inventory.vendorId} = ${vendorId}`;
      }

      const lowStockProducts = await db
        .select({
          productId: inventory.productId,
          vendorId: inventory.vendorId,
          quantity: inventory.quantity,
          reservedQuantity: inventory.reservedQuantity,
          availableQuantity: sql<number>`${inventory.quantity} - ${inventory.reservedQuantity}`,
          reorderLevel: inventory.reorderLevel,
          sku: inventory.sku,
          location: inventory.location,
          lastRestocked: inventory.lastRestocked,
          productName: products.name,
          productPrice: products.price,
          vendorName: vendors.businessName,
          urgencyLevel: sql<string>`
            CASE 
              WHEN ${inventory.quantity} = 0 THEN 'critical'
              WHEN ${inventory.quantity} <= ${inventory.reorderLevel} / 2 THEN 'high'
              ELSE 'medium'
            END
          `
        })
        .from(inventory)
        .leftJoin(products, eq(inventory.productId, products.id))
        .leftJoin(vendors, eq(inventory.vendorId, vendors.id))
        .where(conditions)
        .orderBy(sql`${inventory.quantity} ASC, ${inventory.reorderLevel} DESC`)
        .limit(limit);

      return {
        products: lowStockProducts,
        totalCount: lowStockProducts.length,
        criticalCount: lowStockProducts.filter(p => p.urgencyLevel === 'critical').length,
        highUrgencyCount: lowStockProducts.filter(p => p.urgencyLevel === 'high').length
      };

    } catch (error) {
      console.error('Get low stock products error:', error);
      throw error;
    }
  }

  /**
   * Get inventory analytics
   */
  async getInventoryAnalytics(vendorId?: string, dateRange?: {
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    try {
      let baseConditions = sql`1=1`;
      
      if (vendorId) {
        baseConditions = sql`${baseConditions} AND ${inventory.vendorId} = ${vendorId}`;
      }

      // Overall inventory statistics
      const [overallStats] = await db
        .select({
          totalProducts: count(inventory.productId),
          totalValue: sum(sql<number>`${inventory.quantity} * CAST(${inventory.costPrice} AS DECIMAL)`),
          lowStockCount: sum(sql<number>`CASE WHEN ${inventory.quantity} <= ${inventory.reorderLevel} THEN 1 ELSE 0 END`),
          outOfStockCount: sum(sql<number>`CASE WHEN ${inventory.quantity} = 0 THEN 1 ELSE 0 END`),
          reservedValue: sum(sql<number>`${inventory.reservedQuantity} * CAST(${inventory.costPrice} AS DECIMAL)`)
        })
        .from(inventory)
        .where(baseConditions);

      // Movement analytics
      let movementConditions = baseConditions;
      if (dateRange) {
        movementConditions = sql`${movementConditions} 
          AND ${inventoryMovements.createdAt} >= ${dateRange.startDate}
          AND ${inventoryMovements.createdAt} <= ${dateRange.endDate}`;
      }

      const movementStats = await db
        .select({
          type: inventoryMovements.type,
          adjustmentType: inventoryMovements.adjustmentType,
          totalQuantity: sum(inventoryMovements.quantity),
          movementCount: count(inventoryMovements.id)
        })
        .from(inventoryMovements)
        .leftJoin(inventory, eq(inventoryMovements.productId, inventory.productId))
        .where(movementConditions)
        .groupBy(inventoryMovements.type, inventoryMovements.adjustmentType);

      // Top products by movement
      const topMovingProducts = await db
        .select({
          productId: inventoryMovements.productId,
          productName: products.name,
          totalMovements: sum(inventoryMovements.quantity),
          movementCount: count(inventoryMovements.id),
          currentQuantity: inventory.quantity
        })
        .from(inventoryMovements)
        .leftJoin(inventory, eq(inventoryMovements.productId, inventory.productId))
        .leftJoin(products, eq(inventoryMovements.productId, products.id))
        .where(movementConditions)
        .groupBy(inventoryMovements.productId, products.name, inventory.quantity)
        .orderBy(desc(sum(inventoryMovements.quantity)))
        .limit(10);

      return {
        overall: overallStats,
        movements: {
          byType: movementStats,
          topProducts: topMovingProducts
        },
        alerts: {
          lowStock: overallStats.lowStockCount,
          outOfStock: overallStats.outOfStockCount
        },
        dateRange
      };

    } catch (error) {
      console.error('Get inventory analytics error:', error);
      throw error;
    }
  }

  /**
   * Get inventory movement history
   */
  async getMovementHistory(productId?: string, options: {
    page?: number;
    limit?: number;
    type?: 'in' | 'out';
    startDate?: Date;
    endDate?: Date;
    vendorId?: string;
  } = {}): Promise<any> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 50;
      const offset = (page - 1) * limit;

      let conditions = sql`1=1`;

      if (productId) {
        conditions = sql`${conditions} AND ${inventoryMovements.productId} = ${productId}`;
      }

      if (options.type) {
        conditions = sql`${conditions} AND ${inventoryMovements.type} = ${options.type}`;
      }

      if (options.startDate) {
        conditions = sql`${conditions} AND ${inventoryMovements.createdAt} >= ${options.startDate}`;
      }

      if (options.endDate) {
        conditions = sql`${conditions} AND ${inventoryMovements.createdAt} <= ${options.endDate}`;
      }

      if (options.vendorId) {
        conditions = sql`${conditions} AND ${inventoryMovements.vendorId} = ${options.vendorId}`;
      }

      const movements = await db
        .select({
          id: inventoryMovements.id,
          productId: inventoryMovements.productId,
          vendorId: inventoryMovements.vendorId,
          type: inventoryMovements.type,
          quantity: inventoryMovements.quantity,
          previousQuantity: inventoryMovements.previousQuantity,
          newQuantity: inventoryMovements.newQuantity,
          reason: inventoryMovements.reason,
          notes: inventoryMovements.notes,
          adjustmentType: inventoryMovements.adjustmentType,
          orderId: inventoryMovements.orderId,
          createdBy: inventoryMovements.createdBy,
          createdAt: inventoryMovements.createdAt,
          productName: products.name,
          vendorName: vendors.businessName
        })
        .from(inventoryMovements)
        .leftJoin(products, eq(inventoryMovements.productId, products.id))
        .leftJoin(vendors, eq(inventoryMovements.vendorId, vendors.id))
        .where(conditions)
        .orderBy(desc(inventoryMovements.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ totalCount }] = await db
        .select({ totalCount: count() })
        .from(inventoryMovements)
        .where(conditions);

      return {
        movements,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      };

    } catch (error) {
      console.error('Get movement history error:', error);
      throw error;
    }
  }

  /**
   * Create initial inventory record
   */
  async createInventoryRecord(data: {
    productId: string;
    vendorId: string;
    quantity: number;
    reorderLevel: number;
    maxLevel?: number;
    costPrice: number;
    location?: string;
    sku?: string;
  }): Promise<any> {
    try {
      // Check if inventory record already exists
      const [existingInventory] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.productId, data.productId));

      if (existingInventory) {
        throw new Error('Inventory record already exists for this product');
      }

      const [newInventory] = await db.insert(inventory).values({
        productId: data.productId,
        vendorId: data.vendorId,
        quantity: data.quantity,
        reservedQuantity: 0,
        reorderLevel: data.reorderLevel,
        maxLevel: data.maxLevel || data.reorderLevel * 5,
        costPrice: data.costPrice.toString(),
        location: data.location || 'Default',
        sku: data.sku,
        lastRestocked: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Create initial inventory movement record
      await db.insert(inventoryMovements).values({
        productId: data.productId,
        vendorId: data.vendorId,
        type: 'in',
        quantity: data.quantity,
        previousQuantity: 0,
        newQuantity: data.quantity,
        reason: 'Initial stock',
        notes: 'Initial inventory setup',
        adjustmentType: 'restock',
        createdBy: 'system',
        createdAt: new Date()
      });

      return {
        success: true,
        inventory: newInventory,
        message: 'Inventory record created successfully'
      };

    } catch (error) {
      console.error('Create inventory record error:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */

  private getInventoryStatus(availableQuantity: number, reorderLevel: number): string {
    if (availableQuantity === 0) {
      return 'out_of_stock';
    } else if (availableQuantity <= reorderLevel) {
      return 'low_stock';
    } else if (availableQuantity > reorderLevel * 2) {
      return 'in_stock';
    } else {
      return 'adequate';
    }
  }

  private async createLowStockAlert(productId: string, currentQuantity: number, reorderLevel: number): Promise<void> {
    // Implementation would integrate with notification service
    console.log(`Low stock alert: Product ${productId}, Current: ${currentQuantity}, Reorder: ${reorderLevel}`);
  }

  private async clearInventoryCache(productId: string): Promise<void> {
    try {
      await this.redisService.del(`inventory:${productId}`);
    } catch (error) {
      console.error('Clear inventory cache error:', error);
    }
  }

  private async rollbackReservations(items: Array<{ productId: string; quantity: number }>, orderId: string): Promise<void> {
    try {
      // This would implement rollback logic for failed reservations
      console.log(`Rolling back reservations for order: ${orderId}`);
    } catch (error) {
      console.error('Rollback reservations error:', error);
    }
  }
}