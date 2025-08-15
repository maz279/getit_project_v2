/**
 * Vendor Order Controller - Amazon.com/Shopee.sg-Level Multi-Vendor Order Management
 * Handles vendor-specific order operations with complete Bangladesh integration
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  vendorOrders, 
  orders, 
  orderItems, 
  vendors,
  orderStatusHistory,
  codOrders,
  type Order,
  type OrderStatus
} from '../../../../shared/schema';
import { eq, and, desc, gte, lte, inArray, sql } from 'drizzle-orm';
import { LoggingService } from '../../../services/LoggingService';
import { RedisService } from '../../../services/RedisService';

export class VendorOrderController {
  private loggingService: LoggingService;
  private redisService: RedisService;

  constructor() {
    this.loggingService = new LoggingService();
    this.redisService = new RedisService();
  }

  /**
   * Get vendor orders with advanced filtering and pagination
   */
  async getVendorOrders(req: Request, res: Response): Promise<void> {
    try {
      const vendorId = req.vendor?.id || req.query.vendorId as string;
      if (!vendorId) {
        res.status(401).json({
          success: false,
          message: 'Vendor authentication required'
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        status,
        startDate,
        endDate,
        searchTerm,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter conditions
      let conditions = eq(vendorOrders.vendorId, vendorId);
      
      if (status) {
        conditions = and(conditions, eq(vendorOrders.status, status as string));
      }
      
      if (startDate) {
        conditions = and(conditions, gte(vendorOrders.createdAt, new Date(startDate as string)));
      }
      
      if (endDate) {
        conditions = and(conditions, lte(vendorOrders.createdAt, new Date(endDate as string)));
      }

      // Query vendor orders with complete details
      const vendorOrdersList = await db
        .select({
          // Vendor order details
          vendorOrderId: vendorOrders.id,
          orderId: vendorOrders.orderId,
          subtotal: vendorOrders.subtotal,
          commissionRate: vendorOrders.commissionRate,
          commissionAmount: vendorOrders.commissionAmount,
          vendorEarnings: vendorOrders.vendorEarnings,
          vendorOrderStatus: vendorOrders.status,
          itemCount: vendorOrders.itemCount,
          shippingMethod: vendorOrders.shippingMethod,
          estimatedDelivery: vendorOrders.estimatedDelivery,
          actualDelivery: vendorOrders.actualDelivery,
          vendorNotes: vendorOrders.vendorNotes,
          vendorOrderCreatedAt: vendorOrders.createdAt,
          vendorOrderUpdatedAt: vendorOrders.updatedAt,
          
          // Main order details
          orderNumber: orders.orderNumber,
          mainOrderStatus: orders.status,
          paymentMethod: orders.paymentMethod,
          paymentStatus: orders.paymentStatus,
          total: orders.total,
          currency: orders.currency,
          shippingAddress: orders.shippingAddress,
          customerNotes: orders.customerNotes,
          orderCreatedAt: orders.createdAt,
          
          // Vendor details
          vendorBusinessName: vendors.businessName,
          vendorContactEmail: vendors.contactEmail
        })
        .from(vendorOrders)
        .leftJoin(orders, eq(vendorOrders.orderId, orders.id))
        .leftJoin(vendors, eq(vendorOrders.vendorId, vendors.id))
        .where(conditions)
        .orderBy(sortOrder === 'desc' ? desc(vendorOrders[sortBy as keyof typeof vendorOrders]) : vendorOrders[sortBy as keyof typeof vendorOrders])
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      // Get order items for each vendor order
      const vendorOrdersWithItems = await Promise.all(
        vendorOrdersList.map(async (vendorOrder) => {
          const items = await db
            .select({
              id: orderItems.id,
              productId: orderItems.productId,
              name: orderItems.name,
              quantity: orderItems.quantity,
              unitPrice: orderItems.unitPrice,
              totalPrice: orderItems.totalPrice,
              status: orderItems.status
            })
            .from(orderItems)
            .where(and(
              eq(orderItems.orderId, vendorOrder.orderId),
              eq(orderItems.vendorId, vendorId)
            ));

          // Check if COD order
          const [codOrder] = await db
            .select()
            .from(codOrders)
            .where(eq(codOrders.orderId, vendorOrder.orderId));

          return {
            ...vendorOrder,
            items,
            isCOD: !!codOrder,
            codDetails: codOrder || null
          };
        })
      );

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(vendorOrders)
        .where(conditions);

      // Calculate vendor analytics
      const analytics = await this.getVendorOrderAnalytics(vendorId);

      res.status(200).json({
        success: true,
        data: {
          orders: vendorOrdersWithItems,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalCount: count,
            totalPages: Math.ceil(count / Number(limit)),
            hasNextPage: Number(page) < Math.ceil(count / Number(limit)),
            hasPrevPage: Number(page) > 1
          },
          analytics
        }
      });

    } catch (error) {
      this.loggingService.error('Get vendor orders error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve vendor orders',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get specific vendor order details
   */
  async getVendorOrderDetails(req: Request, res: Response): Promise<void> {
    try {
      const { vendorOrderId } = req.params;
      const vendorId = req.vendor?.id || req.query.vendorId as string;

      // Get vendor order with complete details
      const [vendorOrder] = await db
        .select({
          vendorOrderId: vendorOrders.id,
          orderId: vendorOrders.orderId,
          vendorId: vendorOrders.vendorId,
          subtotal: vendorOrders.subtotal,
          commissionRate: vendorOrders.commissionRate,
          commissionAmount: vendorOrders.commissionAmount,
          vendorEarnings: vendorOrders.vendorEarnings,
          status: vendorOrders.status,
          itemCount: vendorOrders.itemCount,
          shippingMethod: vendorOrders.shippingMethod,
          estimatedDelivery: vendorOrders.estimatedDelivery,
          actualDelivery: vendorOrders.actualDelivery,
          vendorNotes: vendorOrders.vendorNotes,
          platformNotes: vendorOrders.platformNotes,
          createdAt: vendorOrders.createdAt,
          updatedAt: vendorOrders.updatedAt,
          
          // Main order details
          orderNumber: orders.orderNumber,
          mainOrderStatus: orders.status,
          paymentMethod: orders.paymentMethod,
          paymentStatus: orders.paymentStatus,
          total: orders.total,
          currency: orders.currency,
          shippingAddress: orders.shippingAddress,
          billingAddress: orders.billingAddress,
          customerNotes: orders.customerNotes,
          orderCreatedAt: orders.createdAt
        })
        .from(vendorOrders)
        .leftJoin(orders, eq(vendorOrders.orderId, orders.id))
        .where(and(
          eq(vendorOrders.id, vendorOrderId),
          eq(vendorOrders.vendorId, vendorId)
        ));

      if (!vendorOrder) {
        res.status(404).json({
          success: false,
          message: 'Vendor order not found'
        });
        return;
      }

      // Get order items for this vendor
      const items = await db
        .select()
        .from(orderItems)
        .where(and(
          eq(orderItems.orderId, vendorOrder.orderId),
          eq(orderItems.vendorId, vendorId)
        ));

      // Get status history
      const statusHistory = await db
        .select()
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, vendorOrder.orderId))
        .orderBy(desc(orderStatusHistory.createdAt));

      // Check COD details
      const [codOrder] = await db
        .select()
        .from(codOrders)
        .where(eq(codOrders.orderId, vendorOrder.orderId));

      // Get notifications for this vendor order
      const notifications = await db
        .select()
        .from(orderNotifications)
        .where(and(
          eq(orderNotifications.vendorOrderId, vendorOrderId),
          eq(orderNotifications.recipientId, vendorId)
        ))
        .orderBy(desc(orderNotifications.createdAt))
        .limit(10);

      res.status(200).json({
        success: true,
        data: {
          vendorOrder,
          items,
          statusHistory,
          codDetails: codOrder || null,
          notifications,
          fulfillmentActions: this.getAvailableFulfillmentActions(vendorOrder.status),
          bangladeshFeatures: {
            isCOD: !!codOrder,
            vatApplicable: true,
            vatRate: 15,
            specialInstructions: this.getBangladeshSpecialInstructions(vendorOrder.shippingAddress)
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Get vendor order details error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve vendor order details',
        error: (error as Error).message
      });
    }
  }

  /**
   * Update vendor order status with validation
   */
  async updateVendorOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { vendorOrderId } = req.params;
      const { status, notes, trackingNumber, shippingMethod, estimatedDelivery } = req.body;
      const vendorId = req.vendor?.id || req.query.vendorId as string;

      // Validate vendor order exists
      const [vendorOrder] = await db
        .select()
        .from(vendorOrders)
        .where(and(
          eq(vendorOrders.id, vendorOrderId),
          eq(vendorOrders.vendorId, vendorId)
        ));

      if (!vendorOrder) {
        res.status(404).json({
          success: false,
          message: 'Vendor order not found'
        });
        return;
      }

      // Validate status transition
      const validTransitions = this.getValidStatusTransitions(vendorOrder.status);
      if (!validTransitions.includes(status)) {
        res.status(400).json({
          success: false,
          message: `Invalid status transition from ${vendorOrder.status} to ${status}`,
          validTransitions
        });
        return;
      }

      // Update vendor order
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (notes) updateData.vendorNotes = notes;
      if (shippingMethod) updateData.shippingMethod = shippingMethod;
      if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
      
      // Set actual delivery date if delivered
      if (status === 'delivered') {
        updateData.actualDelivery = new Date();
      }

      await db
        .update(vendorOrders)
        .set(updateData)
        .where(eq(vendorOrders.id, vendorOrderId));

      // Update individual order items status
      await db
        .update(orderItems)
        .set({ 
          status: status as OrderStatus,
          updatedAt: new Date()
        })
        .where(and(
          eq(orderItems.orderId, vendorOrder.orderId),
          eq(orderItems.vendorId, vendorId)
        ));

      // Add status history
      await db.insert(orderStatusHistory).values({
        orderId: vendorOrder.orderId,
        status: status as OrderStatus,
        notes: notes || `Vendor order status updated to ${status}`,
        changedBy: vendorId,
        changedAt: new Date(),
        metadata: {
          vendorOrderId,
          trackingNumber,
          shippingMethod
        }
      });

      // Send notifications
      await this.sendVendorOrderNotification(vendorOrder.orderId, vendorId, status, notes);

      // Update main order status if needed
      await this.updateMainOrderStatus(vendorOrder.orderId);

      // Clear cache
      await this.redisService.del(`vendor-order:${vendorOrderId}`);

      this.loggingService.info('Vendor order status updated', {
        vendorOrderId,
        vendorId,
        newStatus: status,
        previousStatus: vendorOrder.status
      });

      res.status(200).json({
        success: true,
        data: {
          vendorOrderId,
          previousStatus: vendorOrder.status,
          newStatus: status,
          updatedAt: new Date(),
          nextActions: this.getAvailableFulfillmentActions(status)
        }
      });

    } catch (error) {
      this.loggingService.error('Update vendor order status error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to update vendor order status',
        error: (error as Error).message
      });
    }
  }

  /**
   * Process vendor order fulfillment
   */
  async processVendorOrderFulfillment(req: Request, res: Response): Promise<void> {
    try {
      const { vendorOrderId } = req.params;
      const { 
        action, // pack, ship, deliver
        trackingNumber,
        shippingMethod,
        courierPartner,
        estimatedDelivery,
        actualWeight,
        dimensions,
        packagePhotos,
        notes
      } = req.body;
      const vendorId = req.vendor?.id || req.query.vendorId as string;

      // Get vendor order
      const [vendorOrder] = await db
        .select()
        .from(vendorOrders)
        .where(and(
          eq(vendorOrders.id, vendorOrderId),
          eq(vendorOrders.vendorId, vendorId)
        ));

      if (!vendorOrder) {
        res.status(404).json({
          success: false,
          message: 'Vendor order not found'
        });
        return;
      }

      let newStatus: string;
      let updateData: any = {
        updatedAt: new Date()
      };

      switch (action) {
        case 'pack':
          newStatus = 'processing';
          updateData.vendorNotes = notes || 'Order packed and ready for shipment';
          break;

        case 'ship':
          newStatus = 'shipped';
          updateData.shippingMethod = shippingMethod;
          updateData.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null;
          updateData.vendorNotes = notes || 'Order shipped to customer';
          break;

        case 'deliver':
          newStatus = 'delivered';
          updateData.actualDelivery = new Date();
          updateData.vendorNotes = notes || 'Order delivered successfully';
          break;

        default:
          res.status(400).json({
            success: false,
            message: 'Invalid fulfillment action'
          });
          return;
      }

      // Update vendor order
      updateData.status = newStatus;
      await db
        .update(vendorOrders)
        .set(updateData)
        .where(eq(vendorOrders.id, vendorOrderId));

      // Add status history with detailed metadata
      await db.insert(orderStatusHistory).values({
        orderId: vendorOrder.orderId,
        status: newStatus as OrderStatus,
        notes: updateData.vendorNotes,
        changedBy: vendorId,
        changedAt: new Date(),
        metadata: {
          vendorOrderId,
          action,
          trackingNumber,
          shippingMethod,
          courierPartner,
          actualWeight,
          dimensions,
          packagePhotos
        }
      });

      // Send notifications
      await this.sendVendorOrderNotification(vendorOrder.orderId, vendorId, newStatus, updateData.vendorNotes);

      // Update main order status
      await this.updateMainOrderStatus(vendorOrder.orderId);

      this.loggingService.info('Vendor order fulfillment processed', {
        vendorOrderId,
        vendorId,
        action,
        newStatus
      });

      res.status(200).json({
        success: true,
        data: {
          vendorOrderId,
          action,
          newStatus,
          trackingNumber,
          estimatedDelivery,
          processedAt: new Date()
        }
      });

    } catch (error) {
      this.loggingService.error('Process vendor order fulfillment error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to process vendor order fulfillment',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get vendor order analytics
   */
  private async getVendorOrderAnalytics(vendorId: string): Promise<any> {
    try {
      // Get today's stats
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const [todayStats] = await db
        .select({
          todayOrders: sql<number>`count(*)`,
          todayRevenue: sql<number>`sum(vendor_earnings)`
        })
        .from(vendorOrders)
        .where(and(
          eq(vendorOrders.vendorId, vendorId),
          gte(vendorOrders.createdAt, todayStart)
        ));

      // Get status distribution
      const statusDistribution = await db
        .select({
          status: vendorOrders.status,
          count: sql<number>`count(*)`
        })
        .from(vendorOrders)
        .where(eq(vendorOrders.vendorId, vendorId))
        .groupBy(vendorOrders.status);

      // Get monthly performance
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const [monthlyStats] = await db
        .select({
          totalOrders: sql<number>`count(*)`,
          totalRevenue: sql<number>`sum(vendor_earnings)`,
          avgOrderValue: sql<number>`avg(vendor_earnings)`
        })
        .from(vendorOrders)
        .where(and(
          eq(vendorOrders.vendorId, vendorId),
          gte(vendorOrders.createdAt, thirtyDaysAgo)
        ));

      return {
        today: {
          orders: todayStats?.todayOrders || 0,
          revenue: Number(todayStats?.todayRevenue || 0)
        },
        monthly: {
          orders: monthlyStats?.totalOrders || 0,
          revenue: Number(monthlyStats?.totalRevenue || 0),
          avgOrderValue: Number(monthlyStats?.avgOrderValue || 0)
        },
        statusDistribution,
        performance: {
          fulfillmentRate: this.calculateFulfillmentRate(statusDistribution),
          avgProcessingTime: await this.calculateAvgProcessingTime(vendorId)
        }
      };

    } catch (error) {
      this.loggingService.error('Get vendor analytics error', { error: (error as Error).message });
      return {};
    }
  }

  /**
   * Helper methods
   */
  private getValidStatusTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'returned'],
      'delivered': ['completed'],
      'cancelled': [],
      'returned': ['refunded'],
      'completed': []
    };

    return transitions[currentStatus] || [];
  }

  private getAvailableFulfillmentActions(status: string): string[] {
    const actions: Record<string, string[]> = {
      'confirmed': ['pack', 'cancel'],
      'processing': ['ship', 'cancel'],
      'shipped': ['deliver', 'track'],
      'delivered': ['complete'],
      'cancelled': [],
      'completed': []
    };

    return actions[status] || [];
  }

  private getBangladeshSpecialInstructions(shippingAddress: any): string[] {
    const instructions: string[] = [];
    
    if (shippingAddress?.district) {
      instructions.push(`Delivery to ${shippingAddress.district} district`);
    }
    
    if (shippingAddress?.area && ['Old Dhaka', 'Rural Area'].includes(shippingAddress.area)) {
      instructions.push('Special care required for delivery address');
    }
    
    instructions.push('COD collection in BDT only');
    instructions.push('Customer phone verification required');
    
    return instructions;
  }

  private async sendVendorOrderNotification(orderId: string, vendorId: string, status: string, notes?: string): Promise<void> {
    try {
      // Implementation would send notifications to customer, admin, etc.
      // This is a placeholder for the notification logic
    } catch (error) {
      this.loggingService.error('Send notification error', { error: (error as Error).message });
    }
  }

  private async updateMainOrderStatus(orderId: string): Promise<void> {
    try {
      // Check all vendor orders for this main order
      const vendorOrderStatuses = await db
        .select({ status: vendorOrders.status })
        .from(vendorOrders)
        .where(eq(vendorOrders.orderId, orderId));

      // Determine main order status based on vendor order statuses
      const allDelivered = vendorOrderStatuses.every(vo => vo.status === 'delivered');
      const allCompleted = vendorOrderStatuses.every(vo => vo.status === 'completed');
      const anyShipped = vendorOrderStatuses.some(vo => vo.status === 'shipped');
      const anyProcessing = vendorOrderStatuses.some(vo => vo.status === 'processing');

      let newMainStatus: OrderStatus;
      if (allCompleted) {
        newMainStatus = 'completed';
      } else if (allDelivered) {
        newMainStatus = 'delivered';
      } else if (anyShipped) {
        newMainStatus = 'shipped';
      } else if (anyProcessing) {
        newMainStatus = 'processing';
      } else {
        newMainStatus = 'confirmed';
      }

      // Update main order status
      await db
        .update(orders)
        .set({
          status: newMainStatus,
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));

    } catch (error) {
      this.loggingService.error('Update main order status error', { error: (error as Error).message });
    }
  }

  private calculateFulfillmentRate(statusDistribution: any[]): number {
    const total = statusDistribution.reduce((sum, item) => sum + item.count, 0);
    const fulfilled = statusDistribution
      .filter(item => ['delivered', 'completed'].includes(item.status))
      .reduce((sum, item) => sum + item.count, 0);
    
    return total > 0 ? Math.round((fulfilled / total) * 100) : 0;
  }

  private async calculateAvgProcessingTime(vendorId: string): Promise<number> {
    try {
      // This would calculate average time from order confirmation to shipment
      // Placeholder implementation
      return 24; // 24 hours average
    } catch (error) {
      return 0;
    }
  }
}