/**
 * Order Controller - Enterprise Order Management Controller
 * Handles all order-related HTTP requests with comprehensive validation
 */

import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { validationResult } from 'express-validator';
import { LoggingService } from '../../../services/LoggingService';

export class OrderController {
  private orderService: OrderService;
  private loggingService: LoggingService;

  constructor() {
    this.orderService = new OrderService();
    this.loggingService = new LoggingService();
  }

  /**
   * Create new order
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const orderData = req.body;
      const result = await this.orderService.createOrder(orderData);

      this.loggingService.info('Order created successfully', {
        orderId: result.orderId,
        userId: orderData.userId,
        total: orderData.total
      });

      res.status(201).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.loggingService.error('Create order error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;

      const order = await this.orderService.getOrderById(orderId, userId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order
      });

    } catch (error) {
      this.loggingService.error('Get order error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve order',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get user orders with pagination
   */
  async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        status: req.query.status as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const result = await this.orderService.getUserOrders(userId, options);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.loggingService.error('Get user orders error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: (error as Error).message
      });
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { orderId } = req.params;
      const { newStatus, notes } = req.body;
      const updatedBy = req.user?.id?.toString();

      const result = await this.orderService.updateOrderStatus(orderId, newStatus, notes, updatedBy);

      this.loggingService.info('Order status updated', {
        orderId,
        newStatus,
        updatedBy
      });

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.loggingService.error('Update order status error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: (error as Error).message
      });
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { orderId } = req.params;
      const { reason } = req.body;
      const cancelledBy = req.user?.id;

      const result = await this.orderService.cancelOrder(orderId, reason, cancelledBy);

      this.loggingService.info('Order cancelled', {
        orderId,
        reason,
        cancelledBy
      });

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.loggingService.error('Cancel order error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        vendorId: req.query.vendorId as string,
        status: req.query.status as string
      };

      const analytics = await this.orderService.getOrderAnalytics(filters);

      res.status(200).json({
        success: true,
        data: analytics
      });

    } catch (error) {
      this.loggingService.error('Get order analytics error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics',
        error: (error as Error).message
      });
    }
  }

  /**
   * Search orders
   */
  async searchOrders(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const filters = {
        status: req.query.status as string,
        vendorId: req.query.vendorId as string,
        dateRange: req.query.startDate && req.query.endDate ? {
          start: new Date(req.query.startDate as string),
          end: new Date(req.query.endDate as string)
        } : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await this.orderService.searchOrders(query, filters);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.loggingService.error('Search orders error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to search orders',
        error: (error as Error).message
      });
    }
  }
}