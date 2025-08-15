/**
 * Cart Calculation Controller - Pricing, Tax, and Shipping Calculations
 * Amazon.com/Shopee.sg-level pricing engine with Bangladesh optimization
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  carts,
  cartItems,
  products,
  vendors,
  coupons,
  taxRates,
  shippingRates
} from '@shared/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class CartCalculationController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get comprehensive cart totals
   */
  async getCartTotals(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, shippingAddress } = req.query;

      const cart = await this.getActiveCart(userId, guestId as string);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Get cart items with product details
      const items = await db
        .select({
          id: cartItems.id,
          productId: cartItems.productId,
          vendorId: cartItems.vendorId,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          totalPrice: cartItems.totalPrice,
          discountAmount: cartItems.discountAmount,
          taxAmount: cartItems.taxAmount,
          // Product details
          productWeight: products.weight,
          productDimensions: products.dimensions,
          productCategory: products.categoryId,
          vendorLocation: vendors.address
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(vendors, eq(cartItems.vendorId, vendors.id))
        .where(eq(cartItems.cartId, cart.id));

      // Calculate base totals
      const baseTotals = this.calculateBaseTotals(items);

      // Calculate shipping if address provided
      let shippingCalculation = null;
      if (shippingAddress) {
        shippingCalculation = await this.calculateShippingCosts(items, shippingAddress as string);
      }

      // Calculate taxes based on location
      const taxCalculation = await this.calculateTaxes(items, shippingAddress as string || 'Dhaka');

      // Apply any active coupons
      const couponDiscounts = await this.calculateCouponDiscounts(cart.appliedCoupons, baseTotals);

      const finalTotals = {
        ...baseTotals,
        ...taxCalculation,
        shippingAmount: shippingCalculation?.totalShipping || 0,
        couponDiscounts,
        totalDiscountAmount: baseTotals.totalDiscountAmount + couponDiscounts.totalDiscount,
        finalAmount: baseTotals.subtotal + 
                     (taxCalculation.totalTaxAmount || 0) + 
                     (shippingCalculation?.totalShipping || 0) - 
                     (baseTotals.totalDiscountAmount + couponDiscounts.totalDiscount)
      };

      // Update cart with calculated totals
      await this.updateCartTotals(cart.id, finalTotals);

      this.loggingService.logInfo('Cart totals calculated', {
        cartId: cart.id,
        totalItems: finalTotals.totalItems,
        finalAmount: finalTotals.finalAmount,
        userId,
        guestId
      });

      res.json({
        success: true,
        data: {
          cartId: cart.id,
          totals: finalTotals,
          breakdown: {
            items: baseTotals,
            taxes: taxCalculation,
            shipping: shippingCalculation,
            coupons: couponDiscounts
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to calculate cart totals', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate cart totals',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Calculate shipping costs
   */
  async calculateShipping(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, shippingAddress, expedited = false } = req.body;

      const cart = await this.getActiveCart(userId, guestId);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Get cart items with shipping details
      const items = await db
        .select({
          id: cartItems.id,
          productId: cartItems.productId,
          vendorId: cartItems.vendorId,
          quantity: cartItems.quantity,
          totalPrice: cartItems.totalPrice,
          productWeight: products.weight,
          productDimensions: products.dimensions,
          vendorLocation: vendors.address,
          vendorShippingPolicy: vendors.shippingPolicy
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(vendors, eq(cartItems.vendorId, vendors.id))
        .where(eq(cartItems.cartId, cart.id));

      // Calculate shipping by vendor and consolidate
      const shippingCalculation = await this.calculateShippingCosts(items, shippingAddress, expedited);

      // Update cart shipping amount
      await db
        .update(carts)
        .set({
          shippingAmount: shippingCalculation.totalShipping,
          updatedAt: new Date()
        })
        .where(eq(carts.id, cart.id));

      this.loggingService.logInfo('Shipping calculated', {
        cartId: cart.id,
        shippingAddress,
        totalShipping: shippingCalculation.totalShipping,
        expedited,
        userId,
        guestId
      });

      res.json({
        success: true,
        data: shippingCalculation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to calculate shipping', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate shipping',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, couponCode } = req.body;

      const cart = await this.getActiveCart(userId, guestId);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Validate coupon
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(and(
          eq(coupons.code, couponCode),
          eq(coupons.isActive, true),
          gte(coupons.expiresAt, new Date()),
          lte(coupons.startsAt, new Date())
        ));

      if (!coupon) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired coupon code'
        });
        return;
      }

      // Check if coupon already applied
      const appliedCoupons = Array.isArray(cart.appliedCoupons) ? cart.appliedCoupons : [];
      if (appliedCoupons.some((c: any) => c.code === couponCode)) {
        res.status(400).json({
          success: false,
          message: 'Coupon already applied'
        });
        return;
      }

      // Validate minimum order amount
      if (coupon.minimumOrderAmount && cart.subtotal < coupon.minimumOrderAmount) {
        res.status(400).json({
          success: false,
          message: `Minimum order amount of ৳${coupon.minimumOrderAmount} required`,
          minimumAmount: coupon.minimumOrderAmount,
          currentAmount: cart.subtotal
        });
        return;
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (cart.subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      } else if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue;
      }

      // Apply coupon to cart
      const updatedAppliedCoupons = [
        ...appliedCoupons,
        {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount,
          appliedAt: new Date().toISOString()
        }
      ];

      const newDiscountAmount = cart.discountAmount + discountAmount;
      const newTotalAmount = cart.subtotal + cart.taxAmount + cart.shippingAmount - newDiscountAmount;

      await db
        .update(carts)
        .set({
          appliedCoupons: updatedAppliedCoupons,
          discountAmount: newDiscountAmount,
          totalAmount: newTotalAmount,
          updatedAt: new Date()
        })
        .where(eq(carts.id, cart.id));

      // Clear cache
      await this.clearCartCache(userId, guestId);

      this.loggingService.logInfo('Coupon applied to cart', {
        cartId: cart.id,
        couponCode,
        discountAmount,
        newTotalAmount,
        userId,
        guestId
      });

      res.json({
        success: true,
        message: 'Coupon applied successfully',
        data: {
          coupon: {
            code: coupon.code,
            name: coupon.name,
            discountAmount
          },
          newTotals: {
            discountAmount: newDiscountAmount,
            totalAmount: newTotalAmount
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to apply coupon', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply coupon',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, couponCode } = req.body;

      const cart = await this.getActiveCart(userId, guestId);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      const appliedCoupons = Array.isArray(cart.appliedCoupons) ? cart.appliedCoupons : [];
      const couponToRemove = appliedCoupons.find((c: any) => c.code === couponCode);

      if (!couponToRemove) {
        res.status(400).json({
          success: false,
          message: 'Coupon not found in cart'
        });
        return;
      }

      // Remove coupon and recalculate
      const updatedAppliedCoupons = appliedCoupons.filter((c: any) => c.code !== couponCode);
      const newDiscountAmount = cart.discountAmount - couponToRemove.discountAmount;
      const newTotalAmount = cart.subtotal + cart.taxAmount + cart.shippingAmount - newDiscountAmount;

      await db
        .update(carts)
        .set({
          appliedCoupons: updatedAppliedCoupons,
          discountAmount: newDiscountAmount,
          totalAmount: newTotalAmount,
          updatedAt: new Date()
        })
        .where(eq(carts.id, cart.id));

      // Clear cache
      await this.clearCartCache(userId, guestId);

      this.loggingService.logInfo('Coupon removed from cart', {
        cartId: cart.id,
        couponCode,
        removedDiscount: couponToRemove.discountAmount,
        newTotalAmount,
        userId,
        guestId
      });

      res.json({
        success: true,
        message: 'Coupon removed successfully',
        data: {
          removedCoupon: couponToRemove,
          newTotals: {
            discountAmount: newDiscountAmount,
            totalAmount: newTotalAmount
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to remove coupon', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove coupon',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Calculate tax for cart
   */
  async calculateTax(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, location = 'Dhaka' } = req.query;

      const cart = await this.getActiveCart(userId, guestId as string);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      const items = await db
        .select({
          id: cartItems.id,
          productId: cartItems.productId,
          totalPrice: cartItems.totalPrice,
          productCategory: products.categoryId,
          taxCategory: products.taxCategory
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cart.id));

      const taxCalculation = await this.calculateTaxes(items, location as string);

      // Update cart tax amount
      await db
        .update(carts)
        .set({
          taxAmount: taxCalculation.totalTaxAmount,
          updatedAt: new Date()
        })
        .where(eq(carts.id, cart.id));

      res.json({
        success: true,
        data: taxCalculation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to calculate tax', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate tax',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cart pricing in different currency
   */
  async getCartPricing(req: Request, res: Response): Promise<void> {
    try {
      const { currency } = req.params;
      const userId = req.user?.userId;
      const { guestId } = req.query;

      const cart = await this.getActiveCart(userId, guestId as string);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Get exchange rates (simplified - in production, use real-time rates)
      const exchangeRates: { [key: string]: number } = {
        'BDT': 1,
        'USD': 0.0093,
        'EUR': 0.0085,
        'GBP': 0.0073,
        'INR': 0.77
      };

      const rate = exchangeRates[currency.toUpperCase()] || 1;

      const convertedPricing = {
        currency: currency.toUpperCase(),
        exchangeRate: rate,
        originalCurrency: cart.currency,
        totals: {
          subtotal: Math.round(cart.subtotal * rate * 100) / 100,
          taxAmount: Math.round(cart.taxAmount * rate * 100) / 100,
          shippingAmount: Math.round(cart.shippingAmount * rate * 100) / 100,
          discountAmount: Math.round(cart.discountAmount * rate * 100) / 100,
          totalAmount: Math.round(cart.totalAmount * rate * 100) / 100
        }
      };

      res.json({
        success: true,
        data: convertedPricing,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get cart pricing', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cart pricing',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Convert cart currency
   */
  async convertCurrency(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, targetCurrency } = req.body;

      const cart = await this.getActiveCart(userId, guestId);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Update cart currency
      await db
        .update(carts)
        .set({
          currency: targetCurrency,
          updatedAt: new Date()
        })
        .where(eq(carts.id, cart.id));

      // Clear cache
      await this.clearCartCache(userId, guestId);

      res.json({
        success: true,
        message: 'Cart currency updated successfully',
        data: {
          cartId: cart.id,
          oldCurrency: cart.currency,
          newCurrency: targetCurrency
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to convert currency', error);
      res.status(500).json({
        success: false,
        message: 'Failed to convert currency',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get available payment methods for cart
   */
  async getPaymentMethods(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId } = req.query;

      const cart = await this.getActiveCart(userId, guestId as string);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Get available payment methods based on cart total and location
      const paymentMethods = [
        {
          id: 'bkash',
          name: 'bKash',
          type: 'mobile_banking',
          icon: '/assets/icons/bkash-icon.svg',
          available: cart.totalAmount >= 10 && cart.totalAmount <= 25000,
          processingFee: cart.totalAmount * 0.018, // 1.8% fee
          description: 'Pay securely with bKash mobile banking'
        },
        {
          id: 'nagad',
          name: 'Nagad',
          type: 'mobile_banking',
          icon: '/assets/icons/nagad-icon.svg',
          available: cart.totalAmount >= 10 && cart.totalAmount <= 25000,
          processingFee: cart.totalAmount * 0.015, // 1.5% fee
          description: 'Fast and secure payment with Nagad'
        },
        {
          id: 'rocket',
          name: 'Rocket',
          type: 'mobile_banking',
          icon: '/assets/icons/rocket-icon.svg',
          available: cart.totalAmount >= 10 && cart.totalAmount <= 25000,
          processingFee: cart.totalAmount * 0.016, // 1.6% fee
          description: 'Quick payment with Rocket mobile banking'
        },
        {
          id: 'cod',
          name: 'Cash on Delivery',
          type: 'cash',
          icon: '/assets/icons/cod-icon.svg',
          available: cart.totalAmount >= 50 && cart.totalAmount <= 5000,
          processingFee: 0,
          description: 'Pay when you receive your order'
        },
        {
          id: 'card',
          name: 'Credit/Debit Card',
          type: 'card',
          icon: '/assets/icons/card-icon.svg',
          available: true,
          processingFee: cart.totalAmount * 0.029, // 2.9% fee
          description: 'Pay with Visa, Mastercard, or local bank cards'
        }
      ];

      const availablePaymentMethods = paymentMethods.filter(method => method.available);

      res.json({
        success: true,
        data: {
          cartId: cart.id,
          cartTotal: cart.totalAmount,
          currency: cart.currency,
          paymentMethods: availablePaymentMethods
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get payment methods', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment methods',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate payment method for cart
   */
  async validatePayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, paymentMethodId, paymentDetails } = req.body;

      const cart = await this.getActiveCart(userId, guestId);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Validate payment method
      const validationResult = await this.validatePaymentMethod(paymentMethodId, cart.totalAmount, paymentDetails);

      if (validationResult.valid) {
        // Update cart with payment method
        await db
          .update(carts)
          .set({
            paymentMethod: {
              id: paymentMethodId,
              details: paymentDetails,
              validatedAt: new Date().toISOString()
            },
            updatedAt: new Date()
          })
          .where(eq(carts.id, cart.id));
      }

      res.json({
        success: true,
        data: validationResult,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to validate payment', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods

  private async getActiveCart(userId?: string, guestId?: string) {
    if (userId) {
      const [cart] = await db
        .select()
        .from(carts)
        .where(and(
          eq(carts.userId, userId),
          eq(carts.status, 'active')
        ));
      return cart;
    } else if (guestId) {
      const [cart] = await db
        .select()
        .from(carts)
        .where(and(
          eq(carts.guestId, guestId),
          eq(carts.status, 'active')
        ));
      return cart;
    }
    return null;
  }

  private calculateBaseTotals(items: any[]) {
    return items.reduce((acc, item) => ({
      totalItems: acc.totalItems + item.quantity,
      subtotal: acc.subtotal + item.totalPrice,
      totalDiscountAmount: acc.totalDiscountAmount + (item.discountAmount || 0),
      totalTaxAmount: acc.totalTaxAmount + (item.taxAmount || 0)
    }), {
      totalItems: 0,
      subtotal: 0,
      totalDiscountAmount: 0,
      totalTaxAmount: 0
    });
  }

  private async calculateShippingCosts(items: any[], address: string, expedited = false) {
    // Bangladesh shipping calculation
    const baseShippingRate = expedited ? 120 : 60; // BDT
    const weightRate = 10; // BDT per kg
    const locationMultiplier = this.getLocationMultiplier(address);
    
    const vendorGroups = items.reduce((acc, item) => {
      if (!acc[item.vendorId]) {
        acc[item.vendorId] = {
          items: [],
          totalWeight: 0,
          baseShipping: baseShippingRate
        };
      }
      acc[item.vendorId].items.push(item);
      acc[item.vendorId].totalWeight += (item.productWeight || 0.5) * item.quantity;
      return acc;
    }, {} as any);

    let totalShipping = 0;
    const vendorShipping = [];

    for (const [vendorId, group] of Object.entries(vendorGroups) as any) {
      const weightCost = group.totalWeight * weightRate;
      const vendorShippingCost = Math.round((group.baseShipping + weightCost) * locationMultiplier);
      
      vendorShipping.push({
        vendorId,
        shippingCost: vendorShippingCost,
        weight: group.totalWeight,
        itemCount: group.items.length
      });
      
      totalShipping += vendorShippingCost;
    }

    return {
      totalShipping,
      vendorShipping,
      expedited,
      estimatedDelivery: expedited ? '1-2 days' : '3-7 days'
    };
  }

  private async calculateTaxes(items: any[], location: string) {
    // Bangladesh VAT calculation
    const standardVATRate = 0.15; // 15% VAT
    const reducedVATRate = 0.075; // 7.5% for essential items
    
    let totalTaxAmount = 0;
    const taxBreakdown = [];

    for (const item of items) {
      let taxRate = standardVATRate;
      
      // Apply reduced rate for essential items
      if (item.taxCategory === 'essential' || item.productCategory === 'food') {
        taxRate = reducedVATRate;
      }
      
      const itemTax = item.totalPrice * taxRate;
      totalTaxAmount += itemTax;
      
      taxBreakdown.push({
        productId: item.productId,
        taxableAmount: item.totalPrice,
        taxRate,
        taxAmount: itemTax
      });
    }

    return {
      totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
      taxBreakdown,
      location
    };
  }

  private async calculateCouponDiscounts(appliedCoupons: any[], totals: any) {
    if (!Array.isArray(appliedCoupons) || appliedCoupons.length === 0) {
      return {
        totalDiscount: 0,
        appliedCoupons: []
      };
    }

    const totalDiscount = appliedCoupons.reduce((sum, coupon) => sum + (coupon.discountAmount || 0), 0);

    return {
      totalDiscount,
      appliedCoupons: appliedCoupons.map(coupon => ({
        code: coupon.code,
        name: coupon.name,
        discountAmount: coupon.discountAmount
      }))
    };
  }

  private getLocationMultiplier(address: string): number {
    const locationMultipliers: { [key: string]: number } = {
      'Dhaka': 1.0,
      'Chittagong': 1.2,
      'Sylhet': 1.3,
      'Rajshahi': 1.25,
      'Khulna': 1.25,
      'Barisal': 1.4,
      'Rangpur': 1.35,
      'Mymensingh': 1.3
    };

    const division = Object.keys(locationMultipliers).find(div => 
      address.toLowerCase().includes(div.toLowerCase())
    );

    return locationMultipliers[division || 'Dhaka'];
  }

  private async validatePaymentMethod(methodId: string, amount: number, details: any) {
    const validations: { [key: string]: any } = {
      'bkash': {
        minAmount: 10,
        maxAmount: 25000,
        requiredFields: ['phoneNumber']
      },
      'nagad': {
        minAmount: 10,
        maxAmount: 25000,
        requiredFields: ['phoneNumber']
      },
      'rocket': {
        minAmount: 10,
        maxAmount: 25000,
        requiredFields: ['phoneNumber']
      },
      'cod': {
        minAmount: 50,
        maxAmount: 5000,
        requiredFields: []
      },
      'card': {
        minAmount: 1,
        maxAmount: 100000,
        requiredFields: ['cardNumber', 'expiryDate', 'cvv']
      }
    };

    const validation = validations[methodId];
    if (!validation) {
      return { valid: false, error: 'Invalid payment method' };
    }

    if (amount < validation.minAmount || amount > validation.maxAmount) {
      return { 
        valid: false, 
        error: `Amount must be between ৳${validation.minAmount} and ৳${validation.maxAmount}` 
      };
    }

    for (const field of validation.requiredFields) {
      if (!details[field]) {
        return { 
          valid: false, 
          error: `${field} is required for ${methodId}` 
        };
      }
    }

    return { valid: true };
  }

  private async updateCartTotals(cartId: string, totals: any) {
    await db
      .update(carts)
      .set({
        totalItems: totals.totalItems,
        subtotal: totals.subtotal,
        taxAmount: totals.totalTaxAmount || totals.taxAmount,
        shippingAmount: totals.shippingAmount,
        discountAmount: totals.totalDiscountAmount,
        totalAmount: totals.finalAmount || totals.totalAmount,
        updatedAt: new Date()
      })
      .where(eq(carts.id, cartId));
  }

  private async clearCartCache(userId?: string, guestId?: string) {
    if (userId) {
      await this.redisService.del(`cart:${userId}`);
    }
    if (guestId) {
      await this.redisService.del(`cart:guest:${guestId}`);
    }
  }
}