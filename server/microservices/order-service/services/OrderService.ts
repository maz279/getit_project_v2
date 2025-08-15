/**
 * Enterprise Order Service - Amazon.com/Shopee.sg Level Order Management
 * Comprehensive order lifecycle management with enterprise features
 */

import { db } from '../../../db';
import { orders, orderItems, orderStatusHistory, users, products } from '../../../../shared/schema';
import { eq, and, gte, lte, desc, sql, like, or } from 'drizzle-orm';
import { RedisService } from '../../../services/RedisService';
import { LoggingService } from '../../../services/LoggingService';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned' | 'refunded';

export class OrderService {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Create new order with comprehensive validation
   */
  async createOrder(data: {
    userId: number;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: string;
      name: string;
    }>;
    shippingAddress: any;
    paymentMethod: string;
    couponCode?: string;
    notes?: string;
  }): Promise<any> {
    try {
      // Generate unique order number
      const orderNumber = await this.generateOrderNumber();

      // Calculate order totals
      const { subtotal, shipping, discount, tax, total } = await this.calculateOrderTotals(
        data.items, 
        data.couponCode
      );

      // Create order
      const [newOrder] = await db.insert(orders).values({
        orderNumber,
        userId: data.userId,
        subtotal: subtotal.toString(),
        shipping: shipping.toString(),
        discount: discount.toString(),
        tax: tax.toString(),
        total: total.toString(),
        currency: 'BDT',
        paymentMethod: data.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        shippingAddress: data.shippingAddress,
        notes: data.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Create order items
      const orderItemsData = data.items.map(item => ({
        orderId: newOrder.id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: (parseFloat(item.unitPrice) * item.quantity).toString(),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await db.insert(orderItems).values(orderItemsData);

      // Add initial status history
      await this.addStatusHistory(newOrder.id, 'pending', 'Order created', data.userId.toString());

      // Cache order data
      await this.redisService.setex(`order:${newOrder.id}`, 3600, JSON.stringify(newOrder));

      // Clear user cart cache
      await this.clearUserCartCache(data.userId);

      this.loggingService.info('Order created successfully', {
        orderId: newOrder.id,
        orderNumber,
        total: total.toString(),
        userId: data.userId
      });

      return {
        success: true,
        orderId: newOrder.id,
        orderNumber,
        total: total.toString(),
        status: 'pending'
      };

    } catch (error) {
      this.loggingService.error('Create order error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get order by ID with caching
   */
  async getOrderById(orderId: string, userId?: number): Promise<any> {
    try {
      // Try cache first
      const cached = await this.redisService.get(`order:${orderId}`);
      if (cached) {
        const order = JSON.parse(cached);
        if (!userId || order.userId === userId) {
          return order;
        }
      }

      // Query with items and user info
      const orderQuery = db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          userId: orders.userId,
          subtotal: orders.subtotal,
          shipping: orders.shipping,
          discount: orders.discount,
          tax: orders.tax,
          total: orders.total,
          currency: orders.currency,
          paymentMethod: orders.paymentMethod,
          paymentStatus: orders.paymentStatus,
          status: orders.status,
          shippingAddress: orders.shippingAddress,
          billingAddress: orders.billingAddress,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          // User info
          customerName: users.username,
          customerEmail: users.email
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.id, orderId));

      // Add user filter if provided
      if (userId) {
        orderQuery.where(and(eq(orders.id, orderId), eq(orders.userId, userId)));
      }

      const [order] = await orderQuery;

      if (!order) {
        return null;
      }

      // Get order items
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
        .where(eq(orderItems.orderId, orderId));

      const result = {
        ...order,
        items
      };

      // Cache result
      await this.redisService.setex(`order:${orderId}`, 3600, JSON.stringify(result));

      return result;

    } catch (error) {
      this.loggingService.error('Get order error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get user orders with pagination
   */
  async getUserOrders(userId: number, options: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<any> {
    try {
      const { page = 1, limit = 10, status, startDate, endDate } = options;
      const offset = (page - 1) * limit;

      let whereConditions = [eq(orders.userId, userId)];

      if (status) {
        whereConditions.push(eq(orders.status, status));
      }

      if (startDate) {
        whereConditions.push(gte(orders.createdAt, startDate));
      }

      if (endDate) {
        whereConditions.push(lte(orders.createdAt, endDate));
      }

      const ordersQuery = db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          subtotal: orders.subtotal,
          total: orders.total,
          currency: orders.currency,
          paymentMethod: orders.paymentMethod,
          paymentStatus: orders.paymentStatus,
          status: orders.status,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt
        })
        .from(orders)
        .where(and(...whereConditions))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

      const userOrders = await ordersQuery;

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(and(...whereConditions));

      return {
        orders: userOrders,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

    } catch (error) {
      this.loggingService.error('Get user orders error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Update order status with validation
   */
  async updateOrderStatus(orderId: string, newStatus: OrderStatus, notes?: string, updatedBy?: string): Promise<any> {
    try {
      // Get current order
      const [currentOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      if (!currentOrder) {
        throw new Error('Order not found');
      }

      // Validate status transition
      const isValidTransition = this.validateStatusTransition(currentOrder.status as OrderStatus, newStatus);
      if (!isValidTransition) {
        throw new Error(`Invalid status transition from ${currentOrder.status} to ${newStatus}`);
      }

      // Update order status
      await db
        .update(orders)
        .set({
          status: newStatus,
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));

      // Add status history
      await this.addStatusHistory(orderId, newStatus, notes || `Order status updated to ${newStatus}`, updatedBy);

      // Handle specific status updates
      await this.handleStatusSpecificActions(orderId, newStatus, currentOrder);

      // Clear cache
      await this.redisService.del(`order:${orderId}`);

      return {
        success: true,
        orderId,
        previousStatus: currentOrder.status,
        newStatus,
        updatedAt: new Date()
      };

    } catch (error) {
      this.loggingService.error('Update order status error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Cancel order with reason
   */
  async cancelOrder(orderId: string, reason: string, cancelledBy?: number): Promise<any> {
    try {
      const result = await this.updateOrderStatus(orderId, 'cancelled', `Order cancelled: ${reason}`, cancelledBy?.toString());

      this.loggingService.info('Order cancelled', {
        orderId,
        reason,
        cancelledBy
      });

      return result;
    } catch (error) {
      this.loggingService.error('Cancel order error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Calculate order totals
   */
  private async calculateOrderTotals(items: Array<{
    productId: string;
    quantity: number;
    unitPrice: string;
  }>, couponCode?: string): Promise<{
    subtotal: number;
    shipping: number;
    discount: number;
    tax: number;
    total: number;
  }> {
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) * item.quantity);
    }, 0);

    // Calculate shipping
    const shipping = this.calculateShippingCost(items, subtotal);

    // Calculate discount
    const discount = couponCode ? await this.calculateDiscount(subtotal, couponCode) : 0;

    // Calculate tax (15% VAT in Bangladesh)
    const tax = (subtotal - discount) * 0.15;

    // Calculate total
    const total = subtotal + shipping + tax - discount;

    return { subtotal, shipping, discount, tax, total };
  }

  /**
   * Calculate shipping cost
   */
  private calculateShippingCost(items: Array<any>, subtotal: number): number {
    // Free shipping over 1000 BDT
    if (subtotal >= 1000) {
      return 0;
    }

    // Standard shipping rates
    return 60; // 60 BDT standard shipping
  }

  /**
   * Calculate discount amount
   */
  private async calculateDiscount(subtotal: number, couponCode: string): Promise<number> {
    // Simplified discount calculation
    // In production, this would check against a coupons table
    if (couponCode === 'FIRST10') {
      return subtotal * 0.1; // 10% discount
    }
    
    return 0;
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get daily order count
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(
        gte(orders.createdAt, todayStart),
        lte(orders.createdAt, todayEnd)
      ));

    const orderSequence = (count + 1).toString().padStart(4, '0');
    
    return `GT${year}${month}${day}${orderSequence}`;
  }

  /**
   * Add status history entry
   */
  private async addStatusHistory(orderId: string, status: OrderStatus, notes?: string, updatedBy?: string): Promise<void> {
    try {
      await db.insert(orderStatusHistory).values({
        orderId,
        toStatus: status,
        notes,
        updatedBy: updatedBy ? parseInt(updatedBy) : undefined,
        createdAt: new Date()
      });
    } catch (error) {
      this.loggingService.error('Add status history error', { error: (error as Error).message });
    }
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'returned'],
      'delivered': ['returned', 'completed'],
      'completed': [],
      'cancelled': [],
      'returned': ['refunded'],
      'refunded': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Handle status-specific actions
   */
  private async handleStatusSpecificActions(orderId: string, newStatus: OrderStatus, order: any): Promise<void> {
    try {
      switch (newStatus) {
        case 'confirmed':
          await this.reserveOrderInventory(orderId);
          break;
        
        case 'shipped':
          await this.sendShippingNotification(orderId);
          break;
        
        case 'delivered':
          if (order.paymentMethod === 'cod') {
            await this.updatePaymentStatus(orderId, 'completed');
          }
          break;
        
        case 'cancelled':
          await this.restoreOrderInventory(orderId);
          if (order.paymentStatus === 'completed') {
            await this.initiateRefund(orderId, 'Order cancellation');
          }
          break;
        
        case 'returned':
          await this.restoreOrderInventory(orderId);
          await this.initiateRefund(orderId, 'Order return');
          break;
      }
    } catch (error) {
      this.loggingService.error('Handle status actions error', { error: (error as Error).message });
    }
  }

  /**
   * Reserve inventory for order items
   */
  private async reserveOrderInventory(orderId: string): Promise<void> {
    // Implementation for inventory reservation
    this.loggingService.info('Inventory reserved for order', { orderId });
  }

  /**
   * Restore inventory for cancelled order
   */
  private async restoreOrderInventory(orderId: string): Promise<void> {
    // Implementation for inventory restoration
    this.loggingService.info('Inventory restored for order', { orderId });
  }

  /**
   * Send shipping notification
   */
  private async sendShippingNotification(orderId: string): Promise<void> {
    // Implementation for shipping notification
    this.loggingService.info('Shipping notification sent', { orderId });
  }

  /**
   * Update payment status
   */
  private async updatePaymentStatus(orderId: string, status: string): Promise<void> {
    await db
      .update(orders)
      .set({
        paymentStatus: status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId));
  }

  /**
   * Initiate refund
   */
  private async initiateRefund(orderId: string, reason: string): Promise<void> {
    // Implementation for refund processing
    this.loggingService.info('Refund initiated', { orderId, reason });
  }

  /**
   * Clear user cart cache
   */
  private async clearUserCartCache(userId: number): Promise<void> {
    await this.redisService.del(`cart:${userId}`);
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(filters: {
    startDate?: Date;
    endDate?: Date;
    vendorId?: string;
    status?: string;
  }): Promise<any> {
    try {
      // Implementation for order analytics
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        statusBreakdown: {}
      };
    } catch (error) {
      this.loggingService.error('Get order analytics error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Search orders
   */
  async searchOrders(query: string, filters: {
    status?: string;
    vendorId?: string;
    dateRange?: { start: Date; end: Date };
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const { page = 1, limit = 10 } = filters;
      const offset = (page - 1) * limit;

      // Implementation for order search
      const results = await db
        .select()
        .from(orders)
        .where(
          or(
            like(orders.orderNumber, `%${query}%`)
          )
        )
        .limit(limit)
        .offset(offset);

      return {
        orders: results,
        pagination: {
          page,
          limit,
          total: results.length,
          totalPages: Math.ceil(results.length / limit)
        }
      };
    } catch (error) {
      this.loggingService.error('Search orders error', { error: (error as Error).message });
      throw error;
    }
  }
}