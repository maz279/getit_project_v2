/**
 * Order Management Service - Consolidated Enterprise Service
 * Consolidates: order/, api/OrderService.js, shipping/, payment/
 * 
 * Amazon.com/Shopee.sg-Level Order Management
 * Phase 2: Service Consolidation Implementation
 */

import { IStorage } from '../../storage';
import { BaseService } from '../base/BaseService';
import { ServiceLogger } from '../utils/ServiceLogger';
import { ErrorHandler } from '../utils/ErrorHandler';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  vendorId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  tracking: OrderTracking;
  timeline: OrderTimeline[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: string;
  vendorId: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_banking' | 'cash_on_delivery' | 'bank_transfer';
  provider: string;
  details: { [key: string]: string };
  isDefault: boolean;
}

export interface ShippingMethod {
  id: string;
  name: string;
  provider: string;
  cost: number;
  estimatedDays: number;
  type: 'standard' | 'express' | 'overnight' | 'pickup';
}

export interface OrderTracking {
  trackingNumber: string;
  courier: string;
  estimatedDelivery: Date;
  currentLocation: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: Date;
  status: string;
  location: string;
  description: string;
}

export interface OrderTimeline {
  timestamp: Date;
  event: string;
  description: string;
  actor: string;
  metadata?: { [key: string]: any };
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'returned';

export type PaymentStatus = 
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type ShippingStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'exception'
  | 'returned';

export interface OrderFilters {
  customerId?: string;
  vendorId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
  dateRange?: { start: Date; end: Date };
  amountRange?: { min: number; max: number };
  search?: string;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: { [key in OrderStatus]: number };
  paymentMethodDistribution: { [key: string]: number };
  topProducts: { productId: string; quantity: number; revenue: number }[];
  recentOrders: Order[];
}

export interface CreateOrderRequest {
  customerId: string;
  items: Omit<OrderItem, 'id' | 'totalPrice'>[];
  shippingAddress: Omit<Address, 'id'>;
  billingAddress: Omit<Address, 'id'>;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  couponCode?: string;
  notes?: string;
}

/**
 * Consolidated Order Management Service
 * Replaces multiple scattered order services with single enterprise service
 */
export class OrderManagementService extends BaseService {
  private storage: IStorage;
  private logger: ServiceLogger;
  private errorHandler: ErrorHandler;

  constructor(storage: IStorage) {
    super('OrderManagementService');
    this.storage = storage;
    this.logger = new ServiceLogger('OrderManagementService');
    this.errorHandler = new ErrorHandler('OrderManagementService');
  }

  /**
   * Order Creation Operations
   */
  async createOrder(orderRequest: CreateOrderRequest): Promise<Order | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Creating new order', { customerId: orderRequest.customerId });
      
      // Validate order request
      await this.validateOrderRequest(orderRequest);

      // Calculate order totals
      const calculations = await this.calculateOrderTotals(orderRequest);

      // Create order object
      const order: Order = {
        id: this.generateOrderId(),
        orderNumber: this.generateOrderNumber(),
        customerId: orderRequest.customerId,
        vendorId: orderRequest.items[0].vendorId, // Primary vendor
        items: orderRequest.items.map(item => ({
          ...item,
          id: this.generateOrderItemId(),
          totalPrice: item.quantity * item.unitPrice
        })),
        subtotal: calculations.subtotal,
        tax: calculations.tax,
        shippingCost: calculations.shippingCost,
        discountAmount: calculations.discountAmount,
        totalAmount: calculations.totalAmount,
        currency: 'BDT',
        status: 'pending',
        paymentStatus: 'pending',
        shippingStatus: 'pending',
        shippingAddress: {
          ...orderRequest.shippingAddress,
          id: this.generateAddressId()
        },
        billingAddress: {
          ...orderRequest.billingAddress,
          id: this.generateAddressId()
        },
        paymentMethod: orderRequest.paymentMethod,
        shippingMethod: orderRequest.shippingMethod,
        tracking: {
          trackingNumber: '',
          courier: '',
          estimatedDelivery: new Date(),
          currentLocation: '',
          events: []
        },
        timeline: [{
          timestamp: new Date(),
          event: 'order_created',
          description: 'Order has been created',
          actor: 'system'
        }],
        notes: orderRequest.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Reserve inventory
      await this.reserveInventory(order.items);

      // Store order in database
      await this.storage.createOrder(order);

      // Process payment
      await this.processPayment(order);

      return order;
    }, 'createOrder');
  }

  /**
   * Order Management Operations
   */
  async getOrder(orderId: string): Promise<Order | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching order', { orderId });
      
      const order = await this.storage.getOrderById(orderId);
      return order;
    }, 'getOrder');
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<Order | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Updating order status', { orderId, status });
      
      const order = await this.storage.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Validate status transition
      if (!this.isValidStatusTransition(order.status, status)) {
        throw new Error(`Invalid status transition from ${order.status} to ${status}`);
      }

      // Update order status
      const updatedOrder = {
        ...order,
        status,
        updatedAt: new Date(),
        timeline: [
          ...order.timeline,
          {
            timestamp: new Date(),
            event: 'status_updated',
            description: `Order status changed to ${status}`,
            actor: 'system',
            metadata: { previousStatus: order.status, newStatus: status }
          }
        ]
      };

      if (notes) {
        updatedOrder.notes = notes;
      }

      // Handle status-specific operations
      await this.handleStatusChange(updatedOrder, status);

      // Update order in database
      await this.storage.updateOrder(orderId, updatedOrder);

      return updatedOrder;
    }, 'updateOrderStatus');
  }

  async cancelOrder(orderId: string, reason: string): Promise<Order | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Cancelling order', { orderId, reason });
      
      const order = await this.storage.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled
      if (!this.canCancelOrder(order)) {
        throw new Error('Order cannot be cancelled');
      }

      // Release inventory
      await this.releaseInventory(order.items);

      // Process refund if payment was captured
      if (order.paymentStatus === 'captured') {
        await this.processRefund(order);
      }

      // Update order status
      const updatedOrder = {
        ...order,
        status: 'cancelled' as OrderStatus,
        updatedAt: new Date(),
        timeline: [
          ...order.timeline,
          {
            timestamp: new Date(),
            event: 'order_cancelled',
            description: `Order cancelled: ${reason}`,
            actor: 'system',
            metadata: { reason }
          }
        ]
      };

      await this.storage.updateOrder(orderId, updatedOrder);

      return updatedOrder;
    }, 'cancelOrder');
  }

  /**
   * Order Search Operations
   */
  async searchOrders(
    filters: OrderFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ orders: Order[]; total: number }> {
    return await this.executeOperation(async () => {
      this.logger.info('Searching orders', { filters, page, limit });
      
      const offset = (page - 1) * limit;
      const orders = await this.storage.searchOrders(filters, offset, limit);
      const total = await this.storage.countOrders(filters);

      return { orders, total };
    }, 'searchOrders');
  }

  async getOrdersByCustomer(customerId: string, page: number = 1, limit: number = 10): Promise<{ orders: Order[]; total: number }> {
    return await this.searchOrders({ customerId }, page, limit);
  }

  async getOrdersByVendor(vendorId: string, page: number = 1, limit: number = 20): Promise<{ orders: Order[]; total: number }> {
    return await this.searchOrders({ vendorId }, page, limit);
  }

  /**
   * Order Tracking Operations
   */
  async updateOrderTracking(orderId: string, tracking: Partial<OrderTracking>): Promise<Order | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Updating order tracking', { orderId, tracking });
      
      const order = await this.storage.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = {
        ...order,
        tracking: {
          ...order.tracking,
          ...tracking
        },
        updatedAt: new Date(),
        timeline: [
          ...order.timeline,
          {
            timestamp: new Date(),
            event: 'tracking_updated',
            description: 'Order tracking information updated',
            actor: 'system',
            metadata: { tracking }
          }
        ]
      };

      await this.storage.updateOrder(orderId, updatedOrder);

      return updatedOrder;
    }, 'updateOrderTracking');
  }

  async addTrackingEvent(orderId: string, event: TrackingEvent): Promise<Order | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Adding tracking event', { orderId, event });
      
      const order = await this.storage.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = {
        ...order,
        tracking: {
          ...order.tracking,
          events: [...order.tracking.events, event]
        },
        updatedAt: new Date()
      };

      await this.storage.updateOrder(orderId, updatedOrder);

      return updatedOrder;
    }, 'addTrackingEvent');
  }

  /**
   * Analytics Operations
   */
  async getOrderAnalytics(dateRange?: { start: Date; end: Date }): Promise<OrderAnalytics> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching order analytics', { dateRange });
      
      const filters: OrderFilters = {};
      if (dateRange) {
        filters.dateRange = dateRange;
      }

      const totalOrders = await this.storage.countOrders(filters);
      const totalRevenue = await this.storage.getTotalRevenue(filters);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const ordersByStatus = await this.storage.getOrdersByStatus(filters);
      const paymentMethodDistribution = await this.storage.getPaymentMethodDistribution(filters);
      const topProducts = await this.storage.getTopProducts(filters);
      const recentOrders = await this.storage.getRecentOrders(10);

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus,
        paymentMethodDistribution,
        topProducts,
        recentOrders
      };
    }, 'getOrderAnalytics');
  }

  /**
   * Bangladesh-Specific Operations
   */
  async getBangladeshOrders(): Promise<Order[]> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching Bangladesh-specific orders');
      
      const filters: OrderFilters = {
        // Add Bangladesh-specific filters
      };

      const result = await this.searchOrders(filters);
      return result.orders;
    }, 'getBangladeshOrders');
  }

  /**
   * Private Helper Methods
   */
  private generateOrderId(): string {
    return `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now().toString().slice(-8)}`;
  }

  private generateOrderItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAddressId(): string {
    return `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async validateOrderRequest(orderRequest: CreateOrderRequest): Promise<void> {
    if (!orderRequest.customerId) {
      throw new Error('Customer ID is required');
    }

    if (!orderRequest.items || orderRequest.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    if (!orderRequest.shippingAddress) {
      throw new Error('Shipping address is required');
    }

    if (!orderRequest.paymentMethod) {
      throw new Error('Payment method is required');
    }

    // Validate each item
    for (const item of orderRequest.items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new Error('Invalid order item');
      }
    }
  }

  private async calculateOrderTotals(orderRequest: CreateOrderRequest): Promise<{
    subtotal: number;
    tax: number;
    shippingCost: number;
    discountAmount: number;
    totalAmount: number;
  }> {
    // Calculate subtotal
    const subtotal = orderRequest.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice),
      0
    );

    // Calculate tax (simplified - would be more complex in real implementation)
    const tax = subtotal * 0.15; // 15% tax

    // Get shipping cost
    const shippingCost = orderRequest.shippingMethod.cost;

    // Calculate discount (if coupon applied)
    const discountAmount = 0; // Would calculate based on coupon

    // Calculate total
    const totalAmount = subtotal + tax + shippingCost - discountAmount;

    return {
      subtotal,
      tax,
      shippingCost,
      discountAmount,
      totalAmount
    };
  }

  private async reserveInventory(items: OrderItem[]): Promise<void> {
    // Reserve inventory for each item
    for (const item of items) {
      // Would call inventory service to reserve items
      this.logger.info('Reserving inventory', { 
        productId: item.productId, 
        quantity: item.quantity 
      });
    }
  }

  private async releaseInventory(items: OrderItem[]): Promise<void> {
    // Release inventory for each item
    for (const item of items) {
      // Would call inventory service to release items
      this.logger.info('Releasing inventory', { 
        productId: item.productId, 
        quantity: item.quantity 
      });
    }
  }

  private async processPayment(order: Order): Promise<void> {
    // Process payment through payment service
    this.logger.info('Processing payment', { orderId: order.id });
  }

  private async processRefund(order: Order): Promise<void> {
    // Process refund through payment service
    this.logger.info('Processing refund', { orderId: order.id });
  }

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: { [key in OrderStatus]: OrderStatus[] } = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'returned'],
      'delivered': ['returned'],
      'cancelled': [],
      'refunded': [],
      'returned': ['refunded']
    };

    return validTransitions[currentStatus].includes(newStatus);
  }

  private canCancelOrder(order: Order): boolean {
    return ['pending', 'confirmed'].includes(order.status);
  }

  private async handleStatusChange(order: Order, newStatus: OrderStatus): Promise<void> {
    // Handle status-specific operations
    switch (newStatus) {
      case 'confirmed':
        await this.processPayment(order);
        break;
      case 'shipped':
        await this.generateTrackingNumber(order);
        break;
      case 'delivered':
        await this.completeOrder(order);
        break;
      case 'cancelled':
        await this.handleCancellation(order);
        break;
    }
  }

  private async generateTrackingNumber(order: Order): Promise<void> {
    // Generate tracking number
    const trackingNumber = `TRK${Date.now().toString().slice(-8)}`;
    this.logger.info('Generated tracking number', { 
      orderId: order.id, 
      trackingNumber 
    });
  }

  private async completeOrder(order: Order): Promise<void> {
    // Complete order operations
    this.logger.info('Completing order', { orderId: order.id });
  }

  private async handleCancellation(order: Order): Promise<void> {
    // Handle cancellation operations
    this.logger.info('Handling cancellation', { orderId: order.id });
  }
}