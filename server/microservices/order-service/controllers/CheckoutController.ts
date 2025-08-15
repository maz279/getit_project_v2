/**
 * Checkout Controller - Enterprise Multi-Step Checkout Management
 * Amazon.com/Shopee.sg-Level Checkout with Bangladesh Payment Integration
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  orders, 
  orderItems, 
  cartItems, 
  orderStatusHistory,
  paymentTransactions,
  vendorOrders 
} from '../../../../shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { validationResult } from 'express-validator';
import { LoggingService } from '../../../services/LoggingService';
import { RedisService } from '../../../services/RedisService';

interface CheckoutStep {
  step: number;
  name: string;
  completed: boolean;
  data?: any;
}

interface CheckoutSession {
  sessionId: string;
  userId: number;
  steps: CheckoutStep[];
  orderData: any;
  createdAt: Date;
  expiresAt: Date;
}

export class CheckoutController {
  private loggingService: LoggingService;
  private redisService: RedisService;

  constructor() {
    this.loggingService = new LoggingService();
    this.redisService = new RedisService();
  }

  /**
   * Initialize checkout session
   */
  async initializeCheckout(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      
      // Get cart items
      const cartItemsList = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.userId, userId));

      if (cartItemsList.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
        return;
      }

      // Create checkout session
      const sessionId = await this.generateCheckoutSessionId();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      const checkoutSession: CheckoutSession = {
        sessionId,
        userId,
        steps: [
          { step: 1, name: 'Cart Review', completed: true },
          { step: 2, name: 'Shipping Address', completed: false },
          { step: 3, name: 'Payment Method', completed: false },
          { step: 4, name: 'Order Review', completed: false },
          { step: 5, name: 'Confirmation', completed: false }
        ],
        orderData: {
          items: cartItemsList,
          subtotal: this.calculateSubtotal(cartItemsList),
          shipping: 0,
          tax: 0,
          total: 0,
          vendorSplit: this.splitItemsByVendor(cartItemsList)
        },
        createdAt: new Date(),
        expiresAt
      };

      // Cache checkout session
      await this.cacheCheckoutSession(sessionId, checkoutSession);

      this.loggingService.info('Checkout session initialized', {
        sessionId,
        userId,
        itemCount: cartItemsList.length
      });

      res.status(200).json({
        success: true,
        data: {
          sessionId,
          steps: checkoutSession.steps,
          orderData: checkoutSession.orderData,
          expiresAt
        }
      });

    } catch (error) {
      this.loggingService.error('Initialize checkout error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to initialize checkout',
        error: (error as Error).message
      });
    }
  }

  /**
   * Update shipping address
   */
  async updateShippingAddress(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { shippingAddress, billingAddress, sameBillingAddress } = req.body;

      const session = await this.getCheckoutSession(sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Checkout session not found or expired'
        });
        return;
      }

      // Validate address (Bangladesh-specific validation)
      const validationResult = await this.validateBangladeshAddress(shippingAddress);
      if (!validationResult.valid) {
        res.status(400).json({
          success: false,
          message: 'Invalid address',
          errors: validationResult.errors
        });
        return;
      }

      // Calculate shipping costs based on address
      const shippingCosts = await this.calculateShippingCosts(
        session.orderData.vendorSplit,
        shippingAddress
      );

      // Update session
      session.orderData.shippingAddress = shippingAddress;
      session.orderData.billingAddress = sameBillingAddress ? shippingAddress : billingAddress;
      session.orderData.shipping = shippingCosts.total;
      session.orderData.tax = this.calculateTax(session.orderData.subtotal);
      session.orderData.total = session.orderData.subtotal + session.orderData.shipping + session.orderData.tax;
      
      // Mark step as completed
      session.steps[1].completed = true;
      session.steps[1].data = { shippingAddress, billingAddress };

      await this.cacheCheckoutSession(sessionId, session);

      res.status(200).json({
        success: true,
        data: {
          shippingCosts,
          orderData: session.orderData,
          nextStep: 3
        }
      });

    } catch (error) {
      this.loggingService.error('Update shipping address error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to update shipping address',
        error: (error as Error).message
      });
    }
  }

  /**
   * Select payment method
   */
  async selectPaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { paymentMethod, paymentDetails } = req.body;

      const session = await this.getCheckoutSession(sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Checkout session not found or expired'
        });
        return;
      }

      if (!session.steps[1].completed) {
        res.status(400).json({
          success: false,
          message: 'Please complete shipping address first'
        });
        return;
      }

      // Validate payment method
      const validPaymentMethods = ['bkash', 'nagad', 'rocket', 'cod', 'card', 'bank_transfer'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
        return;
      }

      // Bangladesh-specific payment validation
      const paymentValidation = await this.validateBangladeshPayment(
        paymentMethod, 
        paymentDetails, 
        session.orderData.total
      );

      if (!paymentValidation.valid) {
        res.status(400).json({
          success: false,
          message: paymentValidation.message,
          errors: paymentValidation.errors
        });
        return;
      }

      // Calculate payment fees
      const paymentFees = this.calculatePaymentFees(paymentMethod, session.orderData.total);
      
      // Update session
      session.orderData.paymentMethod = paymentMethod;
      session.orderData.paymentDetails = paymentDetails;
      session.orderData.paymentFees = paymentFees;
      session.orderData.total += paymentFees;

      // Mark step as completed
      session.steps[2].completed = true;
      session.steps[2].data = { paymentMethod, paymentDetails };

      await this.cacheCheckoutSession(sessionId, session);

      res.status(200).json({
        success: true,
        data: {
          paymentFees,
          orderData: session.orderData,
          nextStep: 4
        }
      });

    } catch (error) {
      this.loggingService.error('Select payment method error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to select payment method',
        error: (error as Error).message
      });
    }
  }

  /**
   * Review order before confirmation
   */
  async reviewOrder(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { couponCode, giftMessage, deliveryInstructions } = req.body;

      const session = await this.getCheckoutSession(sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Checkout session not found or expired'
        });
        return;
      }

      if (!session.steps[2].completed) {
        res.status(400).json({
          success: false,
          message: 'Please complete payment method selection first'
        });
        return;
      }

      // Apply coupon if provided
      let discount = 0;
      if (couponCode) {
        const couponResult = await this.validateAndApplyCoupon(couponCode, session.orderData);
        if (couponResult.valid) {
          discount = couponResult.discount;
          session.orderData.couponCode = couponCode;
          session.orderData.discount = discount;
          session.orderData.total -= discount;
        }
      }

      // Add additional details
      if (giftMessage) session.orderData.giftMessage = giftMessage;
      if (deliveryInstructions) session.orderData.deliveryInstructions = deliveryInstructions;

      // Generate order summary
      const orderSummary = {
        subtotal: session.orderData.subtotal,
        shipping: session.orderData.shipping,
        tax: session.orderData.tax,
        paymentFees: session.orderData.paymentFees || 0,
        discount: discount,
        total: session.orderData.total,
        itemCount: session.orderData.items.length,
        vendorCount: Object.keys(session.orderData.vendorSplit).length,
        estimatedDelivery: await this.calculateEstimatedDelivery(
          session.orderData.shippingAddress,
          session.orderData.vendorSplit
        )
      };

      // Mark step as completed
      session.steps[3].completed = true;
      session.steps[3].data = { orderSummary, couponCode, giftMessage, deliveryInstructions };

      await this.cacheCheckoutSession(sessionId, session);

      res.status(200).json({
        success: true,
        data: {
          orderSummary,
          orderData: session.orderData,
          nextStep: 5
        }
      });

    } catch (error) {
      this.loggingService.error('Review order error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to review order',
        error: (error as Error).message
      });
    }
  }

  /**
   * Confirm and place order
   */
  async confirmOrder(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { agreesToTerms } = req.body;

      if (!agreesToTerms) {
        res.status(400).json({
          success: false,
          message: 'Must agree to terms and conditions'
        });
        return;
      }

      const session = await this.getCheckoutSession(sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Checkout session not found or expired'
        });
        return;
      }

      if (!session.steps[3].completed) {
        res.status(400).json({
          success: false,
          message: 'Please complete order review first'
        });
        return;
      }

      // Create order transaction
      const orderResult = await db.transaction(async (tx) => {
        // Generate order number
        const orderNumber = await this.generateOrderNumber();

        // Create main order
        const [newOrder] = await tx.insert(orders).values({
          orderNumber,
          userId: session.userId,
          subtotal: session.orderData.subtotal.toString(),
          shipping: session.orderData.shipping.toString(),
          tax: session.orderData.tax.toString(),
          discount: (session.orderData.discount || 0).toString(),
          total: session.orderData.total.toString(),
          currency: 'BDT',
          paymentMethod: session.orderData.paymentMethod,
          paymentStatus: 'pending',
          status: 'pending',
          shippingAddress: session.orderData.shippingAddress,
          billingAddress: session.orderData.billingAddress,
          customerNotes: session.orderData.deliveryInstructions,
          giftMessage: session.orderData.giftMessage,
          couponCode: session.orderData.couponCode,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();

        // Create order items
        const orderItemsData = session.orderData.items.map((item: any) => ({
          orderId: newOrder.id,
          productId: item.productId,
          vendorId: item.vendorId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        const createdOrderItems = await tx.insert(orderItems).values(orderItemsData).returning();

        // Create vendor orders (multi-vendor splitting)
        const vendorOrdersData = await this.createVendorOrders(
          newOrder.id,
          session.orderData.vendorSplit,
          session.orderData
        );

        if (vendorOrdersData.length > 0) {
          await tx.insert(vendorOrders).values(vendorOrdersData);
        }

        // Create initial status history
        await tx.insert(orderStatusHistory).values({
          orderId: newOrder.id,
          fromStatus: null,
          toStatus: 'pending',
          notes: 'Order created and awaiting payment confirmation',
          updatedBy: session.userId,
          metadata: { checkoutSessionId: sessionId },
          createdAt: new Date()
        });

        // Create payment transaction record
        await tx.insert(paymentTransactions).values({
          orderId: newOrder.id,
          paymentMethod: session.orderData.paymentMethod,
          amount: session.orderData.total.toString(),
          currency: 'BDT',
          status: 'pending',
          transactionId: await this.generateTransactionId(),
          gatewayResponse: {},
          createdAt: new Date(),
          updatedAt: new Date()
        });

        return {
          order: newOrder,
          orderItems: createdOrderItems,
          vendorOrders: vendorOrdersData
        };
      });

      // Clear cart after successful order creation
      await db.delete(cartItems).where(eq(cartItems.userId, session.userId));

      // Clear checkout session
      await this.clearCheckoutSession(sessionId);

      // Clear cart cache
      await this.redisService.del(`cart:${session.userId}`);

      // Mark final step as completed
      session.steps[4].completed = true;

      this.loggingService.info('Order confirmed successfully', {
        orderId: orderResult.order.id,
        orderNumber: orderResult.order.orderNumber,
        userId: session.userId,
        total: session.orderData.total,
        vendorCount: Object.keys(session.orderData.vendorSplit).length
      });

      res.status(201).json({
        success: true,
        data: {
          order: orderResult.order,
          orderItems: orderResult.orderItems,
          message: 'Order placed successfully'
        }
      });

    } catch (error) {
      this.loggingService.error('Confirm order error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to confirm order',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get checkout session status
   */
  async getCheckoutStatus(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const session = await this.getCheckoutSession(sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Checkout session not found or expired'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          steps: session.steps,
          orderData: session.orderData,
          expiresAt: session.expiresAt
        }
      });

    } catch (error) {
      this.loggingService.error('Get checkout status error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to get checkout status',
        error: (error as Error).message
      });
    }
  }

  // Private helper methods

  private async generateCheckoutSessionId(): Promise<string> {
    return `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.getTime().toString().slice(-6);
    return `GO${dateStr}${timeStr}`;
  }

  private async generateTransactionId(): Promise<string> {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSubtotal(items: any[]): number {
    return items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
  }

  private splitItemsByVendor(items: any[]): { [vendorId: string]: any[] } {
    return items.reduce((groups, item) => {
      const vendorId = item.vendorId;
      if (!groups[vendorId]) groups[vendorId] = [];
      groups[vendorId].push(item);
      return groups;
    }, {});
  }

  private async calculateShippingCosts(vendorSplit: any, address: any): Promise<any> {
    // Bangladesh-specific shipping calculation
    const baseShippingRate = address.division === 'Dhaka' ? 60 : 80;
    const vendorCount = Object.keys(vendorSplit).length;
    
    const total = baseShippingRate + ((vendorCount - 1) * 30); // Additional charge for multiple vendors
    
    return {
      base: baseShippingRate,
      additional: (vendorCount - 1) * 30,
      total,
      estimatedDays: address.division === 'Dhaka' ? '1-2' : '2-4'
    };
  }

  private calculateTax(subtotal: number): number {
    // Bangladesh VAT: 15%
    return subtotal * 0.15;
  }

  private calculatePaymentFees(paymentMethod: string, amount: number): number {
    const feeRates: { [key: string]: number } = {
      'bkash': 0.018, // 1.8%
      'nagad': 0.015, // 1.5%
      'rocket': 0.018, // 1.8%
      'cod': 30, // Flat fee
      'card': 0.025, // 2.5%
      'bank_transfer': 0
    };

    const rate = feeRates[paymentMethod] || 0;
    return paymentMethod === 'cod' ? rate : amount * rate;
  }

  private async validateBangladeshAddress(address: any): Promise<any> {
    // Bangladesh address validation logic
    const requiredFields = ['fullName', 'phone', 'address', 'area', 'city', 'division'];
    const errors = [];

    for (const field of requiredFields) {
      if (!address[field]) {
        errors.push(`${field} is required`);
      }
    }

    // Validate Bangladesh phone number
    if (address.phone && !/^(\+88)?01[3-9]\d{8}$/.test(address.phone)) {
      errors.push('Invalid Bangladesh phone number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async validateBangladeshPayment(method: string, details: any, amount: number): Promise<any> {
    const validations: { [key: string]: any } = {
      'cod': {
        maxAmount: 50000, // Max COD amount
        message: 'COD not available for orders above 50,000 BDT'
      },
      'bkash': {
        requiredFields: ['mobileNumber'],
        message: 'bKash mobile number is required'
      },
      'nagad': {
        requiredFields: ['mobileNumber'],
        message: 'Nagad mobile number is required'
      },
      'rocket': {
        requiredFields: ['mobileNumber'],
        message: 'Rocket mobile number is required'
      }
    };

    const validation = validations[method];
    if (!validation) return { valid: true };

    if (validation.maxAmount && amount > validation.maxAmount) {
      return { valid: false, message: validation.message };
    }

    if (validation.requiredFields) {
      for (const field of validation.requiredFields) {
        if (!details[field]) {
          return { valid: false, message: validation.message };
        }
      }
    }

    return { valid: true };
  }

  private async validateAndApplyCoupon(couponCode: string, orderData: any): Promise<any> {
    // Placeholder coupon validation
    const validCoupons: { [key: string]: any } = {
      'WELCOME10': { type: 'percentage', value: 10, minOrder: 500 },
      'FLAT100': { type: 'fixed', value: 100, minOrder: 1000 }
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    if (orderData.subtotal < coupon.minOrder) {
      return { 
        valid: false, 
        message: `Minimum order amount of ${coupon.minOrder} BDT required` 
      };
    }

    const discount = coupon.type === 'percentage' 
      ? orderData.subtotal * (coupon.value / 100)
      : coupon.value;

    return { valid: true, discount: Math.min(discount, orderData.subtotal) };
  }

  private async calculateEstimatedDelivery(address: any, vendorSplit: any): Promise<string> {
    const baseDays = address.division === 'Dhaka' ? 1 : 3;
    const vendorCount = Object.keys(vendorSplit).length;
    const additionalDays = vendorCount > 1 ? 1 : 0;
    
    const totalDays = baseDays + additionalDays;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + totalDays);
    
    return deliveryDate.toISOString().split('T')[0];
  }

  private async createVendorOrders(orderId: string, vendorSplit: any, orderData: any): Promise<any[]> {
    const vendorOrdersData = [];
    
    for (const [vendorId, items] of Object.entries(vendorSplit) as [string, any][]) {
      const vendorSubtotal = items.reduce((sum: number, item: any) => sum + parseFloat(item.totalPrice), 0);
      const commissionRate = 0.15; // 15% platform commission
      const commissionAmount = vendorSubtotal * commissionRate;
      
      vendorOrdersData.push({
        orderId,
        vendorId,
        subtotal: vendorSubtotal.toString(),
        commissionRate: commissionRate.toString(),
        commissionAmount: commissionAmount.toString(),
        status: 'pending',
        itemCount: items.length,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return vendorOrdersData;
  }

  private async cacheCheckoutSession(sessionId: string, session: CheckoutSession): Promise<void> {
    try {
      const ttl = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
      await this.redisService.setex(`checkout:${sessionId}`, ttl, JSON.stringify(session));
    } catch (error) {
      this.loggingService.warn('Failed to cache checkout session', { sessionId, error });
    }
  }

  private async getCheckoutSession(sessionId: string): Promise<CheckoutSession | null> {
    try {
      const cached = await this.redisService.get(`checkout:${sessionId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.loggingService.warn('Failed to get checkout session from cache', { sessionId, error });
      return null;
    }
  }

  private async clearCheckoutSession(sessionId: string): Promise<void> {
    try {
      await this.redisService.del(`checkout:${sessionId}`);
    } catch (error) {
      this.loggingService.warn('Failed to clear checkout session', { sessionId, error });
    }
  }
}