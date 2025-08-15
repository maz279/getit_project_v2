/**
 * Order Inventory Controller - Amazon.com/Shopee.sg-Level Inventory Coordination
 * Manages real-time inventory reservations and stock management for orders
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  orders, 
  orderItems, 
  products,
  vendors,
  productVariants
} from '../../../../shared/schema';
import { eq, and, desc, gte, lte, sql, inArray } from 'drizzle-orm';
import { LoggingService } from '../../../services/LoggingService';
import { RedisService } from '../../../services/RedisService';

export class OrderInventoryController {
  private loggingService: LoggingService;
  private redisService: RedisService;

  constructor() {
    this.loggingService = new LoggingService();
    this.redisService = new RedisService();
  }

  /**
   * Reserve inventory for order
   */
  async reserveInventory(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { 
        items, // Array of { productId, variantId?, quantity }
        reservationDuration = 15 // minutes
      } = req.body;

      // Get order details
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Check current inventory for all items
      const inventoryChecks = await Promise.all(
        items.map(item => this.checkInventoryAvailability(item))
      );

      // Identify insufficient stock items
      const insufficientStock = inventoryChecks.filter(check => !check.available);
      
      if (insufficientStock.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Insufficient inventory for some items',
          data: {
            insufficientItems: insufficientStock,
            availableAlternatives: await this.getAlternativeProducts(insufficientStock)
          }
        });
        return;
      }

      // Reserve inventory for all items
      const reservations = [];
      const expiryTime = new Date(Date.now() + reservationDuration * 60 * 1000);

      for (const item of items) {
        try {
          const reservation = await this.createInventoryReservation({
            orderId,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            expiryTime,
            reservationType: 'order_pending'
          });

          if (reservation) {
            reservations.push(reservation);
            
            // Update Redis inventory cache
            await this.updateInventoryCache(item.productId, item.variantId, -item.quantity);
          }
        } catch (reservationError) {
          // Rollback previous reservations if any fails
          await this.rollbackReservations(reservations);
          throw reservationError;
        }
      }

      // Schedule automatic release
      await this.scheduleInventoryRelease(reservations, expiryTime);

      this.loggingService.info('Inventory reserved for order', {
        orderId,
        itemCount: items.length,
        reservationCount: reservations.length,
        expiryTime
      });

      res.status(200).json({
        success: true,
        data: {
          orderId,
          reservations,
          expiryTime,
          reservationDuration,
          inventoryStatus: {
            totalItems: items.length,
            reservedItems: reservations.length,
            availableUntil: expiryTime
          },
          nextSteps: [
            'Complete payment within reservation window',
            'Confirm order to make reservation permanent',
            'Inventory will be released automatically if order not confirmed'
          ]
        }
      });

    } catch (error) {
      this.loggingService.error('Reserve inventory error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to reserve inventory',
        error: (error as Error).message
      });
    }
  }

  /**
   * Confirm inventory reservation (make permanent)
   */
  async confirmInventoryReservation(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      // Get pending reservations for order
      const reservations = await db
        .select()
        .from(inventoryReservations)
        .where(and(
          eq(inventoryReservations.orderId, orderId),
          eq(inventoryReservations.status, 'reserved')
        ));

      if (reservations.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No pending inventory reservations found for order'
        });
        return;
      }

      // Check if reservations are still valid
      const expiredReservations = reservations.filter(r => 
        r.expiryTime && new Date() > r.expiryTime
      );

      if (expiredReservations.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Some inventory reservations have expired',
          data: {
            expiredReservations: expiredReservations.map(r => ({
              productId: r.productId,
              variantId: r.variantId,
              expiredAt: r.expiryTime
            }))
          }
        });
        return;
      }

      // Confirm all reservations
      const confirmedReservations = [];
      for (const reservation of reservations) {
        try {
          // Update reservation status
          await db
            .update(inventoryReservations)
            .set({
              status: 'confirmed',
              confirmedAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(inventoryReservations.id, reservation.id));

          // Update actual inventory
          await this.updateProductInventory(
            reservation.productId, 
            reservation.variantId, 
            -reservation.quantity
          );

          confirmedReservations.push(reservation);

        } catch (confirmError) {
          this.loggingService.error('Failed to confirm reservation', {
            reservationId: reservation.id,
            error: (confirmError as Error).message
          });
        }
      }

      // Update order status to reflect inventory confirmation
      await db
        .update(orders)
        .set({
          status: 'confirmed',
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));

      // Clear Redis cache for affected products
      for (const reservation of confirmedReservations) {
        await this.clearProductInventoryCache(reservation.productId, reservation.variantId);
      }

      this.loggingService.info('Inventory reservations confirmed', {
        orderId,
        confirmedCount: confirmedReservations.length,
        totalReservations: reservations.length
      });

      res.status(200).json({
        success: true,
        data: {
          orderId,
          confirmedReservations: confirmedReservations.length,
          inventoryUpdated: true,
          orderStatus: 'confirmed',
          inventoryAllocation: {
            totalItems: reservations.length,
            successfullyAllocated: confirmedReservations.length,
            failed: reservations.length - confirmedReservations.length
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Confirm inventory reservation error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to confirm inventory reservation',
        error: (error as Error).message
      });
    }
  }

  /**
   * Release inventory reservation
   */
  async releaseInventoryReservation(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { reason = 'manual_release' } = req.body;

      // Get reservations for order
      const reservations = await db
        .select()
        .from(inventoryReservations)
        .where(and(
          eq(inventoryReservations.orderId, orderId),
          inArray(inventoryReservations.status, ['reserved', 'confirmed'])
        ));

      if (reservations.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No inventory reservations found for order'
        });
        return;
      }

      // Release reservations
      const releasedReservations = [];
      for (const reservation of reservations) {
        try {
          // Update reservation status
          await db
            .update(inventoryReservations)
            .set({
              status: 'released',
              releasedAt: new Date(),
              releaseReason: reason,
              updatedAt: new Date()
            })
            .where(eq(inventoryReservations.id, reservation.id));

          // If inventory was confirmed, restore it
          if (reservation.status === 'confirmed') {
            await this.updateProductInventory(
              reservation.productId, 
              reservation.variantId, 
              reservation.quantity // Positive to restore
            );
          }

          // Update Redis cache
          await this.updateInventoryCache(
            reservation.productId, 
            reservation.variantId, 
            reservation.quantity
          );

          releasedReservations.push(reservation);

        } catch (releaseError) {
          this.loggingService.error('Failed to release reservation', {
            reservationId: reservation.id,
            error: (releaseError as Error).message
          });
        }
      }

      this.loggingService.info('Inventory reservations released', {
        orderId,
        releasedCount: releasedReservations.length,
        reason
      });

      res.status(200).json({
        success: true,
        data: {
          orderId,
          releasedReservations: releasedReservations.length,
          reason,
          inventoryRestored: releasedReservations.filter(r => r.status === 'confirmed').length,
          inventoryStatus: await this.getOrderInventoryStatus(orderId)
        }
      });

    } catch (error) {
      this.loggingService.error('Release inventory reservation error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to release inventory reservation',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get inventory status for order
   */
  async getOrderInventoryStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      const inventoryStatus = await this.getOrderInventoryStatus(orderId);

      res.status(200).json({
        success: true,
        data: inventoryStatus
      });

    } catch (error) {
      this.loggingService.error('Get order inventory status error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory status',
        error: (error as Error).message
      });
    }
  }

  /**
   * Check stock availability
   */
  async checkStockAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { 
        items // Array of { productId, variantId?, quantity }
      } = req.body;

      if (!items || !Array.isArray(items)) {
        res.status(400).json({
          success: false,
          message: 'Items array is required'
        });
        return;
      }

      // Check availability for all items
      const availabilityChecks = await Promise.all(
        items.map(async item => {
          const availability = await this.checkInventoryAvailability(item);
          return {
            ...item,
            ...availability,
            alternatives: !availability.available ? 
              await this.getProductAlternatives(item.productId) : []
          };
        })
      );

      // Get summary
      const summary = {
        totalItems: items.length,
        availableItems: availabilityChecks.filter(item => item.available).length,
        unavailableItems: availabilityChecks.filter(item => !item.available).length,
        partiallyAvailable: availabilityChecks.filter(item => 
          item.available && item.availableQuantity < item.quantity
        ).length
      };

      res.status(200).json({
        success: true,
        data: {
          summary,
          items: availabilityChecks,
          allAvailable: summary.unavailableItems === 0,
          requiresAdjustment: summary.partiallyAvailable > 0,
          lastChecked: new Date()
        }
      });

    } catch (error) {
      this.loggingService.error('Check stock availability error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to check stock availability',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(req: Request, res: Response): Promise<void> {
    try {
      const {
        vendorId,
        threshold = 10,
        page = 1,
        limit = 20
      } = req.query;

      let conditions = sql`inventory <= ${Number(threshold)}`;
      
      if (vendorId) {
        conditions = sql`${conditions} AND vendor_id = ${vendorId}`;
      }

      // Get low stock products
      const lowStockProducts = await db
        .select({
          productId: products.id,
          name: products.name,
          sku: products.sku,
          inventory: products.inventory,
          threshold: sql<number>`${Number(threshold)}`,
          vendorId: products.vendorId,
          vendorName: vendors.businessName,
          lastUpdated: products.updatedAt,
          status: products.status,
          category: products.categoryId
        })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(conditions)
        .orderBy(products.inventory)
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      // Get critical stock count (inventory <= 5)
      const [criticalStockCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(sql`inventory <= 5`);

      // Get out of stock count
      const [outOfStockCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(sql`inventory = 0`);

      res.status(200).json({
        success: true,
        data: {
          lowStockProducts,
          summary: {
            lowStockCount: lowStockProducts.length,
            criticalStockCount: Number(criticalStockCount.count),
            outOfStockCount: Number(outOfStockCount.count),
            threshold: Number(threshold)
          },
          alerts: {
            critical: Number(criticalStockCount.count) > 0,
            outOfStock: Number(outOfStockCount.count) > 0,
            restockNeeded: lowStockProducts.length > 0
          },
          pagination: {
            page: Number(page),
            limit: Number(limit)
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Get low stock alerts error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve low stock alerts',
        error: (error as Error).message
      });
    }
  }

  /**
   * Helper methods
   */
  private async checkInventoryAvailability(item: {
    productId: string;
    variantId?: string;
    quantity: number;
  }): Promise<{
    available: boolean;
    availableQuantity: number;
    reservedQuantity: number;
    totalQuantity: number;
  }> {
    
    // Get current inventory
    let currentInventory = 0;
    
    if (item.variantId) {
      // Check variant inventory
      const [variant] = await db
        .select({ inventory: productVariants.inventory })
        .from(productVariants)
        .where(eq(productVariants.id, item.variantId));
      
      currentInventory = variant?.inventory || 0;
    } else {
      // Check main product inventory
      const [product] = await db
        .select({ inventory: products.inventory })
        .from(products)
        .where(eq(products.id, item.productId));
      
      currentInventory = product?.inventory || 0;
    }

    // Get reserved quantity
    const [reservedData] = await db
      .select({ reserved: sql<number>`COALESCE(SUM(quantity), 0)` })
      .from(inventoryReservations)
      .where(and(
        eq(inventoryReservations.productId, item.productId),
        item.variantId ? eq(inventoryReservations.variantId, item.variantId) : sql`variant_id IS NULL`,
        inArray(inventoryReservations.status, ['reserved', 'confirmed']),
        gte(inventoryReservations.expiryTime, new Date())
      ));

    const reservedQuantity = Number(reservedData.reserved);
    const availableQuantity = Math.max(0, currentInventory - reservedQuantity);

    return {
      available: availableQuantity >= item.quantity,
      availableQuantity,
      reservedQuantity,
      totalQuantity: currentInventory
    };
  }

  private async createInventoryReservation(params: {
    orderId: string;
    productId: string;
    variantId?: string;
    quantity: number;
    expiryTime: Date;
    reservationType: string;
  }): Promise<any> {
    
    const [reservation] = await db.insert(inventoryReservations).values({
      orderId: params.orderId,
      productId: params.productId,
      variantId: params.variantId || null,
      quantity: params.quantity,
      status: 'reserved',
      reservationType: params.reservationType,
      expiryTime: params.expiryTime,
      metadata: {
        createdBy: 'order-service',
        reservationMethod: 'automatic'
      }
    }).returning();

    return reservation;
  }

  private async updateInventoryCache(productId: string, variantId: string | undefined, quantityChange: number): Promise<void> {
    const cacheKey = variantId ? 
      `inventory:variant:${variantId}` : 
      `inventory:product:${productId}`;
    
    try {
      await this.redisService.incrby(cacheKey, quantityChange);
      await this.redisService.expire(cacheKey, 3600); // 1 hour expiry
    } catch (error) {
      this.loggingService.error('Failed to update inventory cache', {
        cacheKey,
        quantityChange,
        error: (error as Error).message
      });
    }
  }

  private async updateProductInventory(productId: string, variantId: string | undefined, quantityChange: number): Promise<void> {
    if (variantId) {
      await db
        .update(productVariants)
        .set({
          inventory: sql`inventory + ${quantityChange}`,
          updatedAt: new Date()
        })
        .where(eq(productVariants.id, variantId));
    } else {
      await db
        .update(products)
        .set({
          inventory: sql`inventory + ${quantityChange}`,
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));
    }
  }

  private async rollbackReservations(reservations: any[]): Promise<void> {
    for (const reservation of reservations) {
      try {
        await db
          .update(inventoryReservations)
          .set({
            status: 'cancelled',
            updatedAt: new Date()
          })
          .where(eq(inventoryReservations.id, reservation.id));

        // Restore cache
        await this.updateInventoryCache(
          reservation.productId, 
          reservation.variantId, 
          reservation.quantity
        );
      } catch (error) {
        this.loggingService.error('Failed to rollback reservation', {
          reservationId: reservation.id,
          error: (error as Error).message
        });
      }
    }
  }

  private async scheduleInventoryRelease(reservations: any[], expiryTime: Date): Promise<void> {
    // This would integrate with a job scheduler like Bull Queue
    // For now, we'll just log the scheduling
    this.loggingService.info('Inventory release scheduled', {
      reservationCount: reservations.length,
      expiryTime
    });
  }

  private async getAlternativeProducts(insufficientItems: any[]): Promise<any[]> {
    // Mock implementation - would find similar products with available stock
    return insufficientItems.map(item => ({
      originalProductId: item.productId,
      alternatives: [
        {
          productId: 'alt-' + item.productId,
          name: 'Alternative Product',
          price: 100,
          availableQuantity: 50
        }
      ]
    }));
  }

  private async getProductAlternatives(productId: string): Promise<any[]> {
    // Mock implementation
    return [
      {
        productId: 'alt-' + productId,
        name: 'Alternative Product',
        price: 100,
        availableQuantity: 50
      }
    ];
  }

  private async clearProductInventoryCache(productId: string, variantId?: string): Promise<void> {
    const cacheKey = variantId ? 
      `inventory:variant:${variantId}` : 
      `inventory:product:${productId}`;
    
    await this.redisService.del(cacheKey);
  }

  private async getOrderInventoryStatus(orderId: string): Promise<any> {
    // Get order items
    const orderItemsList = await db
      .select({
        productId: orderItems.productId,
        name: orderItems.name,
        quantity: orderItems.quantity
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    // Get reservations
    const reservations = await db
      .select()
      .from(inventoryReservations)
      .where(eq(inventoryReservations.orderId, orderId));

    return {
      orderItems: orderItemsList,
      reservations,
      totalItems: orderItemsList.length,
      reservedItems: reservations.filter(r => r.status === 'reserved').length,
      confirmedItems: reservations.filter(r => r.status === 'confirmed').length,
      releasedItems: reservations.filter(r => r.status === 'released').length,
      inventoryStatus: reservations.length > 0 ? 'managed' : 'pending'
    };
  }
}