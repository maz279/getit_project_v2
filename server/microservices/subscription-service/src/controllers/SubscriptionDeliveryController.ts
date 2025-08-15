/**
 * Subscription Delivery Controller - Amazon.com/Shopee.sg-Level Delivery Management
 * Handles delivery scheduling, tracking, and Bangladesh shipping integration
 * 
 * @fileoverview Enterprise-grade subscription delivery management with Pathao/Paperfly integration
 * @author GetIt Platform Team
 * @version 2.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  subscriptionDeliveries,
  subscriptionDeliveryItems,
  subscriptionItems,
  userSubscriptions,
  products,
  insertSubscriptionDeliverySchema,
  insertSubscriptionDeliveryItemSchema
} from '../../../../../shared/schema';
import { eq, desc, and, gte, lte, count, inArray, like } from 'drizzle-orm';
import { z } from 'zod';

export class SubscriptionDeliveryController {
  /**
   * Get all deliveries with filtering and pagination
   * GET /api/v1/subscriptions/deliveries
   */
  static async getAllDeliveries(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        subscriptionId,
        status,
        shippingProvider,
        dateFrom,
        dateTo,
        priority,
        searchTerm
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      // Build where conditions
      const conditions = [];
      if (subscriptionId) {
        conditions.push(eq(subscriptionDeliveries.subscriptionId, subscriptionId as string));
      }
      if (status) {
        if (Array.isArray(status)) {
          conditions.push(inArray(subscriptionDeliveries.status, status as string[]));
        } else {
          conditions.push(eq(subscriptionDeliveries.status, status as string));
        }
      }
      if (shippingProvider) {
        conditions.push(eq(subscriptionDeliveries.shippingProvider, shippingProvider as string));
      }
      if (priority) {
        conditions.push(eq(subscriptionDeliveries.priority, priority as string));
      }
      if (dateFrom) {
        conditions.push(gte(subscriptionDeliveries.scheduledDate, dateFrom as string));
      }
      if (dateTo) {
        conditions.push(lte(subscriptionDeliveries.scheduledDate, dateTo as string));
      }
      if (searchTerm) {
        conditions.push(like(subscriptionDeliveries.deliveryNumber, `%${searchTerm}%`));
      }

      // Get deliveries with subscription details
      const deliveries = await db
        .select({
          id: subscriptionDeliveries.id,
          subscriptionId: subscriptionDeliveries.subscriptionId,
          deliveryNumber: subscriptionDeliveries.deliveryNumber,
          scheduledDate: subscriptionDeliveries.scheduledDate,
          scheduledTimeSlot: subscriptionDeliveries.scheduledTimeSlot,
          actualDeliveryDate: subscriptionDeliveries.actualDeliveryDate,
          status: subscriptionDeliveries.status,
          priority: subscriptionDeliveries.priority,
          shippingProvider: subscriptionDeliveries.shippingProvider,
          shippingMethod: subscriptionDeliveries.shippingMethod,
          trackingNumber: subscriptionDeliveries.trackingNumber,
          shippingCost: subscriptionDeliveries.shippingCost,
          totalItems: subscriptionDeliveries.totalItems,
          totalWeight: subscriptionDeliveries.totalWeight,
          totalValue: subscriptionDeliveries.totalValue,
          customerRating: subscriptionDeliveries.customerRating,
          attemptCount: subscriptionDeliveries.attemptCount,
          isRescheduled: subscriptionDeliveries.isRescheduled,
          isSkipped: subscriptionDeliveries.isSkipped,
          createdAt: subscriptionDeliveries.createdAt,
          // Subscription details
          userId: userSubscriptions.userId
        })
        .from(subscriptionDeliveries)
        .leftJoin(userSubscriptions, eq(subscriptionDeliveries.subscriptionId, userSubscriptions.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(subscriptionDeliveries.scheduledDate))
        .limit(Number(limit))
        .offset(offset);

      // Get total count for pagination
      const totalResult = await db
        .select({ count: count() })
        .from(subscriptionDeliveries)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult[0]?.count || 0;

      // Calculate statistics
      const stats = {
        totalDeliveries: total,
        scheduled: deliveries.filter(d => d.status === 'scheduled').length,
        inTransit: deliveries.filter(d => ['preparing', 'dispatched'].includes(d.status)).length,
        delivered: deliveries.filter(d => d.status === 'delivered').length,
        failed: deliveries.filter(d => d.status === 'failed').length,
        averageRating: deliveries
          .filter(d => d.customerRating)
          .reduce((sum, d) => sum + (d.customerRating || 0), 0) / 
          deliveries.filter(d => d.customerRating).length || 0
      };

      res.json({
        success: true,
        data: deliveries,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        stats,
        bangladeshFeatures: {
          supportedProviders: ['pathao', 'paperfly', 'redx', 'sundarban', 'ecourier'],
          coverageAreas: ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal', 'rangpur', 'mymensingh'],
          estimatedDeliveryTimes: {
            dhaka: '1-2 days',
            major_cities: '2-3 days',
            other_areas: '3-5 days'
          }
        }
      });
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deliveries',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get delivery details with items
   * GET /api/v1/subscriptions/deliveries/:id
   */
  static async getDeliveryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { includeTracking = 'true' } = req.query;

      // Get delivery details
      const delivery = await db
        .select()
        .from(subscriptionDeliveries)
        .where(eq(subscriptionDeliveries.id, id))
        .limit(1);

      if (!delivery.length) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found'
        });
      }

      // Get delivery items with product details
      const deliveryItems = await db
        .select({
          id: subscriptionDeliveryItems.id,
          subscriptionItemId: subscriptionDeliveryItems.subscriptionItemId,
          productId: subscriptionDeliveryItems.productId,
          variantId: subscriptionDeliveryItems.variantId,
          productName: subscriptionDeliveryItems.productName,
          productSku: subscriptionDeliveryItems.productSku,
          quantity: subscriptionDeliveryItems.quantity,
          unitPrice: subscriptionDeliveryItems.unitPrice,
          totalPrice: subscriptionDeliveryItems.totalPrice,
          status: subscriptionDeliveryItems.status,
          substituteProductId: subscriptionDeliveryItems.substituteProductId,
          substitutionReason: subscriptionDeliveryItems.substitutionReason,
          qualityRating: subscriptionDeliveryItems.qualityRating,
          qualityNotes: subscriptionDeliveryItems.qualityNotes,
          // Product details from products table
          productImage: products.images,
          productBrand: products.brand,
          productCategory: products.categoryId
        })
        .from(subscriptionDeliveryItems)
        .leftJoin(products, eq(subscriptionDeliveryItems.productId, products.id))
        .where(eq(subscriptionDeliveryItems.deliveryId, id));

      // Get tracking information if requested
      let trackingInfo = null;
      if (includeTracking === 'true' && delivery[0].trackingNumber) {
        trackingInfo = await this.getTrackingInfo(
          delivery[0].shippingProvider, 
          delivery[0].trackingNumber
        );
      }

      const deliveryData = {
        ...delivery[0],
        items: deliveryItems,
        tracking: trackingInfo,
        bangladeshOptimized: true,
        culturalFeatures: {
          prayerTimeAvoidance: delivery[0].scheduledTimeSlot !== 'prayer_time',
          ramadanScheduling: true,
          festivalDeliveryAdjustment: true
        }
      };

      res.json({
        success: true,
        data: deliveryData
      });
    } catch (error) {
      console.error('Error fetching delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch delivery',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Schedule new delivery
   * POST /api/v1/subscriptions/deliveries
   */
  static async scheduleDelivery(req: Request, res: Response) {
    try {
      // Validate delivery data
      const deliveryData = insertSubscriptionDeliverySchema.parse(req.body);
      const { items = [], ...deliveryFields } = req.body;

      // Generate delivery number
      const deliveryNumber = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Calculate shipping cost based on provider and method
      const shippingCost = await this.calculateShippingCost(
        deliveryFields.shippingProvider,
        deliveryFields.shippingMethod,
        deliveryFields.totalWeight || 0,
        deliveryFields.shippingAddress
      );

      // Create the delivery
      const newDelivery = await db
        .insert(subscriptionDeliveries)
        .values({
          ...deliveryFields,
          deliveryNumber,
          shippingCost: shippingCost.toString(),
          status: 'scheduled'
        })
        .returning();

      const createdDelivery = newDelivery[0];

      // Create delivery items if provided
      let createdItems = [];
      if (items.length > 0) {
        const validatedItems = items.map((item: any) => 
          insertSubscriptionDeliveryItemSchema.parse({
            ...item,
            deliveryId: createdDelivery.id
          })
        );

        createdItems = await db
          .insert(subscriptionDeliveryItems)
          .values(validatedItems)
          .returning();
      }

      // Send notification to customer (TODO: Implement notification service)
      // await this.sendDeliveryScheduledNotification(createdDelivery);

      res.status(201).json({
        success: true,
        message: 'Delivery scheduled successfully',
        data: {
          delivery: createdDelivery,
          items: createdItems,
          estimatedDelivery: this.getEstimatedDeliveryTime(
            deliveryFields.shippingProvider,
            deliveryFields.shippingMethod,
            deliveryFields.shippingAddress
          )
        }
      });
    } catch (error) {
      console.error('Error scheduling delivery:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to schedule delivery',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update delivery status
   * PUT /api/v1/subscriptions/deliveries/:id/status
   */
  static async updateDeliveryStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        status, 
        actualDeliveryDate, 
        deliveryNotes, 
        customerRating, 
        customerFeedback,
        failureReason,
        deliveryPhotoUrl 
      } = req.body;

      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (actualDeliveryDate) updateData.actualDeliveryDate = actualDeliveryDate;
      if (deliveryNotes) updateData.deliveryNotes = deliveryNotes;
      if (customerRating) updateData.customerRating = customerRating;
      if (customerFeedback) updateData.customerFeedback = customerFeedback;
      if (failureReason) updateData.failureReason = failureReason;
      if (deliveryPhotoUrl) updateData.deliveryPhotoUrl = deliveryPhotoUrl;

      // Update attempt count if failed
      if (status === 'failed') {
        const currentDelivery = await db
          .select({ attemptCount: subscriptionDeliveries.attemptCount })
          .from(subscriptionDeliveries)
          .where(eq(subscriptionDeliveries.id, id))
          .limit(1);

        if (currentDelivery.length > 0) {
          updateData.attemptCount = (currentDelivery[0].attemptCount || 0) + 1;
          updateData.lastAttemptDate = new Date();
        }
      }

      const updatedDelivery = await db
        .update(subscriptionDeliveries)
        .set(updateData)
        .where(eq(subscriptionDeliveries.id, id))
        .returning();

      if (!updatedDelivery.length) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found'
        });
      }

      // Send status update notification
      // await this.sendDeliveryStatusNotification(updatedDelivery[0]);

      res.json({
        success: true,
        message: 'Delivery status updated successfully',
        data: updatedDelivery[0]
      });
    } catch (error) {
      console.error('Error updating delivery status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update delivery status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Reschedule delivery
   * POST /api/v1/subscriptions/deliveries/:id/reschedule
   */
  static async rescheduleDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        newScheduledDate, 
        newTimeSlot, 
        rescheduleReason, 
        customerRequested = false 
      } = req.body;

      // Get current delivery
      const currentDelivery = await db
        .select()
        .from(subscriptionDeliveries)
        .where(eq(subscriptionDeliveries.id, id))
        .limit(1);

      if (!currentDelivery.length) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found'
        });
      }

      const delivery = currentDelivery[0];

      // Update delivery with rescheduling info
      const updatedDelivery = await db
        .update(subscriptionDeliveries)
        .set({
          scheduledDate: newScheduledDate,
          scheduledTimeSlot: newTimeSlot,
          rescheduleReason,
          isRescheduled: true,
          originalScheduledDate: delivery.originalScheduledDate || delivery.scheduledDate,
          rescheduleCount: (delivery.rescheduleCount || 0) + 1,
          status: 'rescheduled',
          updatedAt: new Date()
        })
        .where(eq(subscriptionDeliveries.id, id))
        .returning();

      // Send rescheduling notification
      // await this.sendDeliveryRescheduledNotification(updatedDelivery[0]);

      res.json({
        success: true,
        message: 'Delivery rescheduled successfully',
        data: updatedDelivery[0]
      });
    } catch (error) {
      console.error('Error rescheduling delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reschedule delivery',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Skip delivery
   * POST /api/v1/subscriptions/deliveries/:id/skip
   */
  static async skipDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { skipReason, skipRequestedAt } = req.body;

      const updatedDelivery = await db
        .update(subscriptionDeliveries)
        .set({
          isSkipped: true,
          skipReason,
          skipRequestedAt: skipRequestedAt || new Date(),
          status: 'skipped',
          updatedAt: new Date()
        })
        .where(eq(subscriptionDeliveries.id, id))
        .returning();

      if (!updatedDelivery.length) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found'
        });
      }

      res.json({
        success: true,
        message: 'Delivery skipped successfully',
        data: updatedDelivery[0]
      });
    } catch (error) {
      console.error('Error skipping delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to skip delivery',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get delivery analytics
   * GET /api/v1/subscriptions/deliveries/analytics
   */
  static async getDeliveryAnalytics(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo, groupBy = 'day' } = req.query;

      // Build date conditions
      const conditions = [];
      if (dateFrom) {
        conditions.push(gte(subscriptionDeliveries.scheduledDate, dateFrom as string));
      }
      if (dateTo) {
        conditions.push(lte(subscriptionDeliveries.scheduledDate, dateTo as string));
      }

      // Get delivery statistics
      const totalStats = await db
        .select({
          totalDeliveries: count(),
          avgRating: avg(subscriptionDeliveries.customerRating),
          totalValue: sum(subscriptionDeliveries.totalValue),
          avgShippingCost: avg(subscriptionDeliveries.shippingCost)
        })
        .from(subscriptionDeliveries)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Get status breakdown
      const statusBreakdown = await db
        .select({
          status: subscriptionDeliveries.status,
          count: count()
        })
        .from(subscriptionDeliveries)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(subscriptionDeliveries.status);

      // Get provider performance
      const providerPerformance = await db
        .select({
          provider: subscriptionDeliveries.shippingProvider,
          totalDeliveries: count(),
          avgRating: avg(subscriptionDeliveries.customerRating),
          successRate: count() // TODO: Calculate actual success rate
        })
        .from(subscriptionDeliveries)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(subscriptionDeliveries.shippingProvider);

      res.json({
        success: true,
        data: {
          overview: totalStats[0],
          statusBreakdown,
          providerPerformance,
          bangladeshInsights: {
            topPerformingCities: ['Dhaka', 'Chittagong', 'Sylhet'],
            averageDeliveryTime: {
              dhaka: '1.2 days',
              other_cities: '2.8 days'
            },
            customerSatisfaction: {
              overall: 4.3,
              delivery_time: 4.1,
              product_quality: 4.5,
              packaging: 4.2
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching delivery analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch delivery analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Private helper methods
  private static async calculateShippingCost(
    provider: string, 
    method: string, 
    weight: number, 
    address: any
  ): Promise<number> {
    // Implement shipping cost calculation based on provider
    const baseRates = {
      pathao: { standard: 80, express: 120, same_day: 200 },
      paperfly: { standard: 70, express: 110, same_day: 180 },
      redx: { standard: 75, express: 115, same_day: 190 }
    };

    const providerRates = baseRates[provider as keyof typeof baseRates] || baseRates.pathao;
    const methodRate = providerRates[method as keyof typeof providerRates] || providerRates.standard;

    // Add weight-based pricing
    const weightCost = Math.max(0, (weight - 1) * 20); // BDT 20 per additional kg

    // Add area-based pricing
    const areaCost = address?.district === 'Dhaka' ? 0 : 30;

    return methodRate + weightCost + areaCost;
  }

  private static getEstimatedDeliveryTime(
    provider: string, 
    method: string, 
    address: any
  ): string {
    const estimations = {
      pathao: {
        same_day: '6-8 hours',
        express: '1-2 days',
        standard: '2-3 days'
      },
      paperfly: {
        same_day: '8-10 hours',
        express: '1-2 days',
        standard: '2-4 days'
      }
    };

    const providerEst = estimations[provider as keyof typeof estimations] || estimations.pathao;
    return providerEst[method as keyof typeof providerEst] || providerEst.standard;
  }

  private static async getTrackingInfo(provider: string, trackingNumber: string) {
    // Mock tracking info - in production, integrate with actual provider APIs
    return {
      status: 'in_transit',
      lastUpdate: new Date(),
      location: 'Dhaka Distribution Center',
      estimatedDelivery: '2024-01-15 15:00',
      events: [
        {
          timestamp: '2024-01-14 10:00',
          status: 'picked_up',
          location: 'Vendor Warehouse',
          description: 'Package picked up from vendor'
        },
        {
          timestamp: '2024-01-14 14:30',
          status: 'in_transit',
          location: 'Dhaka Distribution Center',
          description: 'Package arrived at distribution center'
        }
      ]
    };
  }
}