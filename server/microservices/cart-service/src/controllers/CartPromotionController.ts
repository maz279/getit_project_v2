/**
 * Cart Promotion Controller - Cart Promotions and Discount Management
 * Amazon.com/Shopee.sg-level promotional features with Bangladesh market optimization
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  carts,
  cartItems,
  cartPromotions,
  coupons,
  products,
  users
} from '@shared/schema';
import { eq, and, desc, sql, gte, lte, inArray } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';
import { v4 as uuidv4 } from 'uuid';

export class CartPromotionController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get available promotions for cart
   */
  async getAvailablePromotions(req: Request, res: Response): Promise<void> {
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

      // Get cart items to analyze promotion eligibility
      const cartItemsList = await db
        .select({
          productId: cartItems.productId,
          vendorId: cartItems.vendorId,
          categoryId: products.categoryId,
          quantity: cartItems.quantity,
          totalPrice: cartItems.totalPrice
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cart.id));

      const cartProductIds = cartItemsList.map(item => item.productId);
      const cartVendorIds = [...new Set(cartItemsList.map(item => item.vendorId))];
      const cartCategoryIds = [...new Set(cartItemsList.map(item => item.categoryId))];

      // Get available coupons
      const availableCoupons = await db
        .select({
          id: coupons.id,
          code: coupons.code,
          name: coupons.name,
          description: coupons.description,
          discountType: coupons.discountType,
          discountValue: coupons.discountValue,
          maxDiscountAmount: coupons.maxDiscountAmount,
          minimumOrderAmount: coupons.minimumOrderAmount,
          validForProducts: coupons.validForProducts,
          validForCategories: coupons.validForCategories,
          validForVendors: coupons.validForVendors,
          maxUses: coupons.maxUses,
          usedCount: coupons.usedCount,
          userLimit: coupons.userLimit,
          isActive: coupons.isActive,
          startsAt: coupons.startsAt,
          expiresAt: coupons.expiresAt
        })
        .from(coupons)
        .where(and(
          eq(coupons.isActive, true),
          lte(coupons.startsAt, new Date()),
          gte(coupons.expiresAt, new Date())
        ));

      // Filter and calculate applicable promotions
      const applicablePromotions = [];
      
      for (const coupon of availableCoupons) {
        const eligibility = await this.checkCouponEligibility(
          coupon, 
          cart, 
          cartItemsList, 
          userId
        );

        if (eligibility.eligible) {
          applicablePromotions.push({
            ...coupon,
            calculatedDiscount: eligibility.calculatedDiscount,
            savings: eligibility.savings,
            eligibilityReason: eligibility.reason,
            priority: this.calculatePromotionPriority(coupon, eligibility.savings),
            tags: this.generatePromotionTags(coupon, cart)
          });
        }
      }

      // Sort by priority and savings
      applicablePromotions.sort((a, b) => b.priority - a.priority);

      // Get Bangladesh-specific promotions
      const bangladeshPromotions = this.getBangladeshSpecificPromotions(cart, cartItemsList);

      // Get cart-based automatic promotions
      const automaticPromotions = await this.getAutomaticPromotions(cart, cartItemsList);

      this.loggingService.logInfo('Available promotions retrieved', {
        cartId: cart.id,
        applicableCount: applicablePromotions.length,
        cartValue: cart.totalAmount,
        userId,
        guestId
      });

      res.json({
        success: true,
        data: {
          cartId: cart.id,
          applicablePromotions: applicablePromotions.slice(0, 10), // Top 10
          bangladeshPromotions,
          automaticPromotions,
          cartSummary: {
            totalAmount: cart.totalAmount,
            totalItems: cart.totalItems,
            currency: cart.currency
          },
          promotionStats: {
            totalAvailable: applicablePromotions.length,
            maxSavings: Math.max(...applicablePromotions.map(p => p.savings), 0),
            bestPromotion: applicablePromotions[0] || null
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get available promotions', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available promotions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Apply promotion to cart
   */
  async applyPromotion(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, promotionCode, promotionType = 'coupon' } = req.body;

      const cart = await this.getActiveCart(userId, guestId);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      let appliedPromotion;
      
      if (promotionType === 'coupon') {
        appliedPromotion = await this.applyCouponPromotion(promotionCode, cart, userId);
      } else if (promotionType === 'automatic') {
        appliedPromotion = await this.applyAutomaticPromotion(promotionCode, cart);
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid promotion type'
        });
        return;
      }

      if (!appliedPromotion.success) {
        res.status(400).json({
          success: false,
          message: appliedPromotion.message,
          details: appliedPromotion.details
        });
        return;
      }

      // Create promotion record
      const [promotionRecord] = await db
        .insert(cartPromotions)
        .values({
          id: uuidv4(),
          cartId: cart.id,
          promotionCode,
          promotionType,
          discountAmount: appliedPromotion.discountAmount,
          promotionData: JSON.stringify(appliedPromotion.promotionData),
          appliedAt: new Date(),
          isActive: true
        })
        .returning();

      // Update cart totals
      const newDiscountAmount = cart.discountAmount + appliedPromotion.discountAmount;
      const newTotalAmount = cart.subtotal + cart.taxAmount + cart.shippingAmount - newDiscountAmount;

      await db
        .update(carts)
        .set({
          discountAmount: newDiscountAmount,
          totalAmount: newTotalAmount,
          updatedAt: new Date()
        })
        .where(eq(carts.id, cart.id));

      // Clear cart cache
      await this.clearCartCache(userId, guestId);

      this.loggingService.logInfo('Promotion applied successfully', {
        cartId: cart.id,
        promotionCode,
        promotionType,
        discountAmount: appliedPromotion.discountAmount,
        userId,
        guestId
      });

      res.json({
        success: true,
        message: 'Promotion applied successfully',
        data: {
          promotionId: promotionRecord.id,
          promotionCode,
          discountAmount: appliedPromotion.discountAmount,
          newCartTotal: newTotalAmount,
          savings: appliedPromotion.discountAmount,
          promotionDetails: appliedPromotion.promotionData
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to apply promotion', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply promotion',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Remove promotion from cart
   */
  async removePromotion(req: Request, res: Response): Promise<void> {
    try {
      const { promotionId } = req.params;
      const userId = req.user?.userId;

      // Get promotion record
      const [promotion] = await db
        .select()
        .from(cartPromotions)
        .where(eq(cartPromotions.id, promotionId));

      if (!promotion) {
        res.status(404).json({
          success: false,
          message: 'Promotion not found'
        });
        return;
      }

      // Get cart
      const [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.id, promotion.cartId));

      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Remove promotion
      await db
        .update(cartPromotions)
        .set({
          isActive: false,
          removedAt: new Date()
        })
        .where(eq(cartPromotions.id, promotionId));

      // Update cart totals
      const newDiscountAmount = Math.max(0, cart.discountAmount - promotion.discountAmount);
      const newTotalAmount = cart.subtotal + cart.taxAmount + cart.shippingAmount - newDiscountAmount;

      await db
        .update(carts)
        .set({
          discountAmount: newDiscountAmount,
          totalAmount: newTotalAmount,
          updatedAt: new Date()
        })
        .where(eq(carts.id, cart.id));

      // Clear cart cache
      await this.clearCartCache(cart.userId || undefined, cart.guestId || undefined);

      this.loggingService.logInfo('Promotion removed successfully', {
        promotionId,
        cartId: cart.id,
        promotionCode: promotion.promotionCode,
        discountRemoved: promotion.discountAmount,
        userId
      });

      res.json({
        success: true,
        message: 'Promotion removed successfully',
        data: {
          promotionId,
          promotionCode: promotion.promotionCode,
          discountRemoved: promotion.discountAmount,
          newCartTotal: newTotalAmount
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to remove promotion', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove promotion',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Check promotion eligibility
   */
  async checkPromotionEligibility(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, promotionCode } = req.query;

      const cart = await this.getActiveCart(userId, guestId as string);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Get promotion details
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, promotionCode as string));

      if (!coupon) {
        res.status(404).json({
          success: false,
          message: 'Promotion code not found'
        });
        return;
      }

      // Get cart items
      const cartItemsList = await db
        .select({
          productId: cartItems.productId,
          vendorId: cartItems.vendorId,
          categoryId: products.categoryId,
          quantity: cartItems.quantity,
          totalPrice: cartItems.totalPrice
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cart.id));

      // Check eligibility
      const eligibility = await this.checkCouponEligibility(coupon, cart, cartItemsList, userId);

      res.json({
        success: true,
        data: {
          promotionCode,
          eligible: eligibility.eligible,
          reason: eligibility.reason,
          calculatedDiscount: eligibility.calculatedDiscount,
          savings: eligibility.savings,
          requirements: eligibility.requirements,
          restrictions: eligibility.restrictions
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to check promotion eligibility', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check promotion eligibility',
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

  private async checkCouponEligibility(coupon: any, cart: any, cartItems: any[], userId?: string) {
    const result = {
      eligible: false,
      reason: '',
      calculatedDiscount: 0,
      savings: 0,
      requirements: [] as string[],
      restrictions: [] as string[]
    };

    // Check if coupon is active and within date range
    if (!coupon.isActive) {
      result.reason = 'Promotion is no longer active';
      return result;
    }

    if (coupon.startsAt > new Date()) {
      result.reason = 'Promotion has not started yet';
      return result;
    }

    if (coupon.expiresAt < new Date()) {
      result.reason = 'Promotion has expired';
      return result;
    }

    // Check minimum order amount
    if (coupon.minimumOrderAmount && cart.subtotal < coupon.minimumOrderAmount) {
      result.reason = `Minimum order amount of ৳${coupon.minimumOrderAmount} required`;
      result.requirements.push(`Add ৳${coupon.minimumOrderAmount - cart.subtotal} more to qualify`);
      return result;
    }

    // Check usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      result.reason = 'Promotion usage limit reached';
      return result;
    }

    // Check user-specific limits
    if (userId && coupon.userLimit) {
      // This would require tracking user-specific usage - simplified for now
      result.restrictions.push(`Limited to ${coupon.userLimit} uses per customer`);
    }

    // Check product/category/vendor restrictions
    if (coupon.validForProducts && coupon.validForProducts.length > 0) {
      const applicableItems = cartItems.filter(item => 
        coupon.validForProducts.includes(item.productId)
      );
      if (applicableItems.length === 0) {
        result.reason = 'No applicable products in cart';
        return result;
      }
    }

    if (coupon.validForCategories && coupon.validForCategories.length > 0) {
      const applicableItems = cartItems.filter(item => 
        coupon.validForCategories.includes(item.categoryId)
      );
      if (applicableItems.length === 0) {
        result.reason = 'No applicable product categories in cart';
        return result;
      }
    }

    if (coupon.validForVendors && coupon.validForVendors.length > 0) {
      const applicableItems = cartItems.filter(item => 
        coupon.validForVendors.includes(item.vendorId)
      );
      if (applicableItems.length === 0) {
        result.reason = 'No applicable vendors in cart';
        return result;
      }
    }

    // Calculate discount
    let applicableAmount = cart.subtotal;
    
    // If restricted to specific products/categories/vendors, calculate applicable amount
    if (coupon.validForProducts || coupon.validForCategories || coupon.validForVendors) {
      const applicableItems = cartItems.filter(item => {
        if (coupon.validForProducts && coupon.validForProducts.includes(item.productId)) return true;
        if (coupon.validForCategories && coupon.validForCategories.includes(item.categoryId)) return true;
        if (coupon.validForVendors && coupon.validForVendors.includes(item.vendorId)) return true;
        return false;
      });
      applicableAmount = applicableItems.reduce((sum, item) => sum + item.totalPrice, 0);
    }

    if (coupon.discountType === 'percentage') {
      result.calculatedDiscount = (applicableAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        result.calculatedDiscount = Math.min(result.calculatedDiscount, coupon.maxDiscountAmount);
      }
    } else if (coupon.discountType === 'fixed') {
      result.calculatedDiscount = Math.min(coupon.discountValue, applicableAmount);
    }

    result.savings = result.calculatedDiscount;
    result.eligible = true;
    result.reason = 'Promotion is applicable';

    return result;
  }

  private calculatePromotionPriority(coupon: any, savings: number): number {
    let priority = savings; // Base priority on savings amount
    
    // Boost priority for high-value discounts
    if (savings > 1000) priority += 100;
    if (savings > 500) priority += 50;
    
    // Boost priority for percentage discounts (often better deals)
    if (coupon.discountType === 'percentage') priority += 25;
    
    // Boost priority for expiring soon
    const daysUntilExpiry = Math.floor((coupon.expiresAt - new Date()) / (24 * 60 * 60 * 1000));
    if (daysUntilExpiry <= 1) priority += 75;
    if (daysUntilExpiry <= 7) priority += 25;
    
    return priority;
  }

  private generatePromotionTags(coupon: any, cart: any): string[] {
    const tags = [];
    
    if (coupon.discountType === 'percentage') {
      tags.push(`${coupon.discountValue}% OFF`);
    } else {
      tags.push(`৳${coupon.discountValue} OFF`);
    }
    
    if (coupon.validForCategories && coupon.validForCategories.length > 0) {
      tags.push('Category Specific');
    }
    
    if (coupon.validForVendors && coupon.validForVendors.length > 0) {
      tags.push('Vendor Specific');
    }
    
    const daysUntilExpiry = Math.floor((coupon.expiresAt - new Date()) / (24 * 60 * 60 * 1000));
    if (daysUntilExpiry <= 1) {
      tags.push('Expires Today');
    } else if (daysUntilExpiry <= 7) {
      tags.push('Limited Time');
    }
    
    return tags;
  }

  private getBangladeshSpecificPromotions(cart: any, cartItems: any[]) {
    const promotions = [];
    
    // Free shipping promotion for Bangladesh
    if (cart.subtotal >= 1000 && cart.shippingAmount > 0) {
      promotions.push({
        type: 'free_shipping',
        title: 'Free Shipping Available',
        description: 'Your order qualifies for free shipping across Bangladesh',
        savings: cart.shippingAmount,
        code: 'FREESHIP',
        icon: '🚚'
      });
    }
    
    // Bangladesh festival promotions
    const now = new Date();
    const isEidSeason = (now.getMonth() === 4 || now.getMonth() === 7); // Approximate Eid months
    if (isEidSeason && cart.subtotal >= 2000) {
      promotions.push({
        type: 'festival',
        title: 'Eid Special Offer',
        description: 'Extra 15% off for Eid celebrations',
        savings: cart.subtotal * 0.15,
        code: 'EID15',
        icon: '🌙'
      });
    }
    
    return promotions;
  }

  private async getAutomaticPromotions(cart: any, cartItems: any[]) {
    const promotions = [];
    
    // Bulk purchase discount
    if (cart.totalItems >= 5) {
      promotions.push({
        type: 'bulk_discount',
        title: 'Bulk Purchase Discount',
        description: '5% off for buying 5+ items',
        discountAmount: cart.subtotal * 0.05,
        autoApply: true
      });
    }
    
    // First-time buyer discount (simplified check)
    if (cart.userId) {
      const [userOrderCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(carts)
        .where(and(
          eq(carts.userId, cart.userId),
          eq(carts.status, 'completed')
        ));
      
      if (userOrderCount.count === 0) {
        promotions.push({
          type: 'first_time_buyer',
          title: 'Welcome Discount',
          description: '10% off your first order',
          discountAmount: Math.min(cart.subtotal * 0.1, 500),
          autoApply: true
        });
      }
    }
    
    return promotions;
  }

  private async applyCouponPromotion(couponCode: string, cart: any, userId?: string) {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, couponCode));

    if (!coupon) {
      return {
        success: false,
        message: 'Invalid coupon code'
      };
    }

    // Get cart items for validation
    const cartItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id));

    const eligibility = await this.checkCouponEligibility(coupon, cart, cartItems, userId);

    if (!eligibility.eligible) {
      return {
        success: false,
        message: eligibility.reason,
        details: eligibility
      };
    }

    return {
      success: true,
      discountAmount: eligibility.calculatedDiscount,
      promotionData: {
        couponId: coupon.id,
        couponCode: coupon.code,
        couponName: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        appliedAmount: eligibility.calculatedDiscount
      }
    };
  }

  private async applyAutomaticPromotion(promotionCode: string, cart: any) {
    // Handle automatic promotions
    if (promotionCode === 'BULK_DISCOUNT' && cart.totalItems >= 5) {
      return {
        success: true,
        discountAmount: cart.subtotal * 0.05,
        promotionData: {
          type: 'bulk_discount',
          discountPercentage: 5,
          minItems: 5
        }
      };
    }

    return {
      success: false,
      message: 'Automatic promotion not applicable'
    };
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