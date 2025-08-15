/**
 * Reservation Controller - Advanced Inventory Reservation Management
 * Amazon.com/Shopee.sg-level reservation system with Bangladesh optimization
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  inventoryReservations,
  inventory,
  products,
  vendors,
  users,
  orders
} from '@shared/schema';
import { eq, and, desc, sql, lte, gte, count, sum, isNull, isNotNull } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class ReservationController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Create new inventory reservation
   */
  async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const { 
        productId,
        variantId,
        quantity,
        reservationType = 'cart',
        expirationMinutes = 30,
        orderId,
        deliveryDistrict,
        urgencyLevel = 'standard',
        notes
      } = req.body;
      
      const customerId = req.user?.userId;
      const vendorId = req.body.vendorId;

      // Validate inventory availability
      const [currentInventory] = await db
        .select({
          id: inventory.id,
          quantity: inventory.quantity,
          reservedQuantity: inventory.reservedQuantity,
          availableQuantity: inventory.availableQuantity,
          vendorId: inventory.vendorId
        })
        .from(inventory)
        .where(eq(inventory.productId, productId));

      if (!currentInventory) {
        res.status(404).json({
          success: false,
          message: 'Product inventory not found'
        });
        return;
      }

      const availableQuantity = currentInventory.quantity - currentInventory.reservedQuantity;
      
      if (availableQuantity < quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient inventory. Available: ${availableQuantity}, Requested: ${quantity}`,
          availableQuantity
        });
        return;
      }

      // Calculate expiration time
      const expiresAt = new Date(Date.now() + (expirationMinutes * 60 * 1000));

      // Create reservation
      const [reservation] = await db
        .insert(inventoryReservations)
        .values({
          productId,
          variantId,
          orderId,
          vendorId: vendorId || currentInventory.vendorId,
          quantityReserved: quantity,
          reservationType,
          expiresAt,
          customerId,
          deliveryDistrict,
          urgencyLevel,
          notes,
          reservedBy: customerId
        })
        .returning();

      // Update inventory reserved quantity
      await db
        .update(inventory)
        .set({
          reservedQuantity: currentInventory.reservedQuantity + quantity,
          availableQuantity: availableQuantity - quantity,
          updatedAt: new Date()
        })
        .where(eq(inventory.id, currentInventory.id));

      // Clear cache
      await this.clearReservationCache(productId);

      this.loggingService.logInfo('Inventory reservation created', {
        reservationId: reservation.id,
        productId,
        quantity,
        customerId,
        urgencyLevel
      });

      res.json({
        success: true,
        message: 'Reservation created successfully',
        data: {
          ...reservation,
          availableQuantity: availableQuantity - quantity,
          expiresInMinutes: expirationMinutes
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to create reservation', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Confirm reservation (convert to confirmed order)
   */
  async confirmReservation(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId } = req.params;
      const { orderId, notes } = req.body;
      const userId = req.user?.userId;

      // Get reservation details
      const [reservation] = await db
        .select()
        .from(inventoryReservations)
        .where(eq(inventoryReservations.id, reservationId));

      if (!reservation) {
        res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
        return;
      }

      if (reservation.status !== 'active') {
        res.status(400).json({
          success: false,
          message: `Cannot confirm reservation with status: ${reservation.status}`
        });
        return;
      }

      // Check if expired
      if (new Date() > new Date(reservation.expiresAt)) {
        res.status(400).json({
          success: false,
          message: 'Reservation has expired'
        });
        return;
      }

      // Update reservation status
      const [updatedReservation] = await db
        .update(inventoryReservations)
        .set({
          status: 'confirmed',
          confirmedAt: new Date(),
          orderId,
          notes: notes || reservation.notes,
          updatedAt: new Date()
        })
        .where(eq(inventoryReservations.id, reservationId))
        .returning();

      // Clear cache
      await this.clearReservationCache(reservation.productId);

      this.loggingService.logInfo('Reservation confirmed', {
        reservationId,
        orderId,
        userId,
        productId: reservation.productId
      });

      res.json({
        success: true,
        message: 'Reservation confirmed successfully',
        data: updatedReservation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to confirm reservation', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Release reservation (free up inventory)
   */
  async releaseReservation(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId } = req.params;
      const { reason = 'Manual release' } = req.body;
      const userId = req.user?.userId;

      // Get reservation details
      const [reservation] = await db
        .select()
        .from(inventoryReservations)
        .where(eq(inventoryReservations.id, reservationId));

      if (!reservation) {
        res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
        return;
      }

      if (reservation.status === 'released') {
        res.status(400).json({
          success: false,
          message: 'Reservation already released'
        });
        return;
      }

      // Get current inventory
      const [currentInventory] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.productId, reservation.productId));

      if (currentInventory) {
        // Update inventory quantities
        await db
          .update(inventory)
          .set({
            reservedQuantity: Math.max(0, currentInventory.reservedQuantity - reservation.quantityReserved),
            availableQuantity: currentInventory.availableQuantity + reservation.quantityReserved,
            updatedAt: new Date()
          })
          .where(eq(inventory.productId, reservation.productId));
      }

      // Update reservation status
      const [updatedReservation] = await db
        .update(inventoryReservations)
        .set({
          status: 'released',
          releasedAt: new Date(),
          notes: `${reservation.notes || ''}\nReleased: ${reason}`,
          updatedAt: new Date()
        })
        .where(eq(inventoryReservations.id, reservationId))
        .returning();

      // Clear cache
      await this.clearReservationCache(reservation.productId);

      this.loggingService.logInfo('Reservation released', {
        reservationId,
        reason,
        userId,
        productId: reservation.productId
      });

      res.json({
        success: true,
        message: 'Reservation released successfully',
        data: {
          ...updatedReservation,
          releasedQuantity: reservation.quantityReserved
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to release reservation', error);
      res.status(500).json({
        success: false,
        message: 'Failed to release reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Extend reservation expiration time
   */
  async extendReservation(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId } = req.params;
      const { additionalMinutes = 30 } = req.body;
      const userId = req.user?.userId;

      // Get reservation details
      const [reservation] = await db
        .select()
        .from(inventoryReservations)
        .where(eq(inventoryReservations.id, reservationId));

      if (!reservation) {
        res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
        return;
      }

      if (reservation.status !== 'active') {
        res.status(400).json({
          success: false,
          message: `Cannot extend reservation with status: ${reservation.status}`
        });
        return;
      }

      // Calculate new expiration time
      const currentExpiry = new Date(reservation.expiresAt);
      const newExpiry = new Date(currentExpiry.getTime() + (additionalMinutes * 60 * 1000));

      // Update reservation
      const [updatedReservation] = await db
        .update(inventoryReservations)
        .set({
          expiresAt: newExpiry,
          updatedAt: new Date()
        })
        .where(eq(inventoryReservations.id, reservationId))
        .returning();

      this.loggingService.logInfo('Reservation extended', {
        reservationId,
        additionalMinutes,
        newExpiry,
        userId
      });

      res.json({
        success: true,
        message: 'Reservation extended successfully',
        data: {
          ...updatedReservation,
          additionalMinutes,
          totalMinutesRemaining: Math.round((newExpiry.getTime() - Date.now()) / (60 * 1000))
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to extend reservation', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extend reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get active reservations
   */
  async getActiveReservations(req: Request, res: Response): Promise<void> {
    try {
      const { 
        customerId, 
        vendorId, 
        reservationType,
        page = 1, 
        limit = 20 
      } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let query = db
        .select({
          id: inventoryReservations.id,
          productId: inventoryReservations.productId,
          quantityReserved: inventoryReservations.quantityReserved,
          reservationType: inventoryReservations.reservationType,
          expiresAt: inventoryReservations.expiresAt,
          deliveryDistrict: inventoryReservations.deliveryDistrict,
          urgencyLevel: inventoryReservations.urgencyLevel,
          customerId: inventoryReservations.customerId,
          vendorId: inventoryReservations.vendorId,
          orderId: inventoryReservations.orderId,
          createdAt: inventoryReservations.createdAt,
          productName: products.name,
          vendorName: vendors.businessName,
          customerName: users.fullName
        })
        .from(inventoryReservations)
        .leftJoin(products, eq(inventoryReservations.productId, products.id))
        .leftJoin(vendors, eq(inventoryReservations.vendorId, vendors.id))
        .leftJoin(users, eq(inventoryReservations.customerId, users.id))
        .where(eq(inventoryReservations.status, 'active'));

      // Apply filters
      if (userRole === 'vendor') {
        query = query.where(eq(inventoryReservations.vendorId, userId?.toString()));
      } else if (userRole === 'customer') {
        query = query.where(eq(inventoryReservations.customerId, userId));
      } else {
        // Admin can filter by customer or vendor
        if (customerId) {
          query = query.where(eq(inventoryReservations.customerId, parseInt(customerId as string)));
        }
        if (vendorId) {
          query = query.where(eq(inventoryReservations.vendorId, vendorId as string));
        }
      }

      if (reservationType) {
        query = query.where(eq(inventoryReservations.reservationType, reservationType as string));
      }

      const reservations = await query
        .orderBy(desc(inventoryReservations.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      // Get total count
      const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(inventoryReservations)
        .where(eq(inventoryReservations.status, 'active'));

      res.json({
        success: true,
        data: {
          reservations,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit as string))
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get active reservations', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve active reservations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get expired reservations
   */
  async getExpiredReservations(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const expiredReservations = await db
        .select({
          id: inventoryReservations.id,
          productId: inventoryReservations.productId,
          quantityReserved: inventoryReservations.quantityReserved,
          expiresAt: inventoryReservations.expiresAt,
          customerId: inventoryReservations.customerId,
          productName: products.name,
          customerName: users.fullName,
          minutesExpired: sql<number>`EXTRACT(EPOCH FROM (NOW() - ${inventoryReservations.expiresAt}))/60`
        })
        .from(inventoryReservations)
        .leftJoin(products, eq(inventoryReservations.productId, products.id))
        .leftJoin(users, eq(inventoryReservations.customerId, users.id))
        .where(
          and(
            eq(inventoryReservations.status, 'active'),
            lte(inventoryReservations.expiresAt, new Date())
          )
        )
        .orderBy(inventoryReservations.expiresAt)
        .limit(parseInt(limit as string))
        .offset(offset);

      res.json({
        success: true,
        data: {
          expiredReservations,
          count: expiredReservations.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get expired reservations', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve expired reservations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get reservations for specific order
   */
  async getOrderReservations(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      const orderReservations = await db
        .select({
          id: inventoryReservations.id,
          productId: inventoryReservations.productId,
          quantityReserved: inventoryReservations.quantityReserved,
          status: inventoryReservations.status,
          expiresAt: inventoryReservations.expiresAt,
          confirmedAt: inventoryReservations.confirmedAt,
          productName: products.name,
          productSku: products.sku
        })
        .from(inventoryReservations)
        .leftJoin(products, eq(inventoryReservations.productId, products.id))
        .where(eq(inventoryReservations.orderId, orderId))
        .orderBy(desc(inventoryReservations.createdAt));

      res.json({
        success: true,
        data: {
          orderId,
          reservations: orderReservations,
          totalItems: orderReservations.length,
          totalQuantity: orderReservations.reduce((sum, r) => sum + r.quantityReserved, 0)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get order reservations', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve order reservations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Bulk release reservations
   */
  async bulkReleaseReservations(req: Request, res: Response): Promise<void> {
    try {
      const { reservationIds, reason = 'Bulk release' } = req.body;
      const userId = req.user?.userId;

      if (!Array.isArray(reservationIds) || reservationIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid reservation IDs provided'
        });
        return;
      }

      const results = [];
      
      for (const reservationId of reservationIds) {
        try {
          // Get reservation details
          const [reservation] = await db
            .select()
            .from(inventoryReservations)
            .where(eq(inventoryReservations.id, reservationId));

          if (reservation && reservation.status === 'active') {
            // Release reservation
            await db
              .update(inventoryReservations)
              .set({
                status: 'released',
                releasedAt: new Date(),
                notes: `${reservation.notes || ''}\nBulk release: ${reason}`,
                updatedAt: new Date()
              })
              .where(eq(inventoryReservations.id, reservationId));

            // Update inventory
            const [currentInventory] = await db
              .select()
              .from(inventory)
              .where(eq(inventory.productId, reservation.productId));

            if (currentInventory) {
              await db
                .update(inventory)
                .set({
                  reservedQuantity: Math.max(0, currentInventory.reservedQuantity - reservation.quantityReserved),
                  availableQuantity: currentInventory.availableQuantity + reservation.quantityReserved,
                  updatedAt: new Date()
                })
                .where(eq(inventory.productId, reservation.productId));
            }

            results.push({
              reservationId,
              status: 'success',
              quantityReleased: reservation.quantityReserved
            });

            // Clear cache
            await this.clearReservationCache(reservation.productId);
          } else {
            results.push({
              reservationId,
              status: 'skipped',
              reason: 'Not found or not active'
            });
          }
        } catch (error) {
          results.push({
            reservationId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      this.loggingService.logInfo('Bulk release reservations completed', {
        userId,
        reason,
        totalRequested: reservationIds.length,
        successCount: results.filter(r => r.status === 'success').length
      });

      res.json({
        success: true,
        message: 'Bulk release operation completed',
        data: {
          results,
          summary: {
            total: reservationIds.length,
            successful: results.filter(r => r.status === 'success').length,
            skipped: results.filter(r => r.status === 'skipped').length,
            errors: results.filter(r => r.status === 'error').length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to bulk release reservations', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk release reservations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Cleanup expired reservations
   */
  async cleanupExpiredReservations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      // Find expired active reservations
      const expiredReservations = await db
        .select()
        .from(inventoryReservations)
        .where(
          and(
            eq(inventoryReservations.status, 'active'),
            lte(inventoryReservations.expiresAt, new Date())
          )
        );

      const cleanupResults = [];
      
      for (const reservation of expiredReservations) {
        try {
          // Update reservation status to expired
          await db
            .update(inventoryReservations)
            .set({
              status: 'expired',
              releasedAt: new Date(),
              notes: `${reservation.notes || ''}\nAuto-expired by cleanup`,
              updatedAt: new Date()
            })
            .where(eq(inventoryReservations.id, reservation.id));

          // Update inventory quantities
          const [currentInventory] = await db
            .select()
            .from(inventory)
            .where(eq(inventory.productId, reservation.productId));

          if (currentInventory) {
            await db
              .update(inventory)
              .set({
                reservedQuantity: Math.max(0, currentInventory.reservedQuantity - reservation.quantityReserved),
                availableQuantity: currentInventory.availableQuantity + reservation.quantityReserved,
                updatedAt: new Date()
              })
              .where(eq(inventory.productId, reservation.productId));
          }

          cleanupResults.push({
            reservationId: reservation.id,
            productId: reservation.productId,
            quantityReleased: reservation.quantityReserved,
            status: 'cleaned'
          });

          // Clear cache
          await this.clearReservationCache(reservation.productId);

        } catch (error) {
          cleanupResults.push({
            reservationId: reservation.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      this.loggingService.logInfo('Expired reservations cleanup completed', {
        userId,
        totalExpired: expiredReservations.length,
        successfulCleanup: cleanupResults.filter(r => r.status === 'cleaned').length
      });

      res.json({
        success: true,
        message: 'Expired reservations cleanup completed',
        data: {
          cleanupResults,
          summary: {
            totalExpired: expiredReservations.length,
            cleaned: cleanupResults.filter(r => r.status === 'cleaned').length,
            errors: cleanupResults.filter(r => r.status === 'error').length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to cleanup expired reservations', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup expired reservations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clear reservation cache
   */
  private async clearReservationCache(productId: string): Promise<void> {
    try {
      const patterns = [
        `inventory:${productId}*`,
        `reservations:*`,
        `availability:*`
      ];

      for (const pattern of patterns) {
        await this.redisService.del(pattern);
      }
    } catch (error) {
      this.loggingService.logError('Failed to clear reservation cache', error);
    }
  }
}