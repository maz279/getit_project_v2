/**
 * Cart Controller - Enterprise Shopping Cart Management
 * Amazon.com/Shopee.sg-Level Cart Functionality with Bangladesh Integration
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { cartItems, products, vendors } from '../../../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { validationResult } from 'express-validator';
import { LoggingService } from '../../../services/LoggingService';
import { RedisService } from '../../../services/RedisService';

export class CartController {
  private loggingService: LoggingService;
  private redisService: RedisService;

  constructor() {
    this.loggingService = new LoggingService();
    this.redisService = new RedisService();
  }

  /**
   * Add item to cart
   */
  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { userId, productId, quantity, vendorId } = req.body;

      // Check if product exists and get details
      const [product] = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          inventory: products.inventory,
          vendorId: products.vendorId
        })
        .from(products)
        .where(eq(products.id, productId));

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      // Check inventory availability
      if (product.inventory < quantity) {
        res.status(400).json({
          success: false,
          message: 'Insufficient inventory',
          availableQuantity: product.inventory
        });
        return;
      }

      // Check if item already exists in cart
      const [existingItem] = await db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.userId, userId),
            eq(cartItems.productId, productId),
            eq(cartItems.vendorId, vendorId || product.vendorId)
          )
        );

      let result;
      if (existingItem) {
        // Update existing cart item
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.inventory) {
          res.status(400).json({
            success: false,
            message: 'Total quantity exceeds available inventory',
            currentQuantity: existingItem.quantity,
            availableQuantity: product.inventory
          });
          return;
        }

        [result] = await db
          .update(cartItems)
          .set({
            quantity: newQuantity,
            updatedAt: new Date()
          })
          .where(eq(cartItems.id, existingItem.id))
          .returning();
      } else {
        // Add new cart item
        [result] = await db
          .insert(cartItems)
          .values({
            userId,
            productId,
            vendorId: vendorId || product.vendorId,
            name: product.name,
            quantity,
            unitPrice: product.price,
            totalPrice: (parseFloat(product.price) * quantity).toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
      }

      // Clear cart cache
      await this.clearCartCache(userId);

      // Update cart statistics
      await this.updateCartStatistics(userId);

      this.loggingService.info('Item added to cart', {
        userId,
        productId,
        quantity,
        itemId: result.id
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Item added to cart successfully'
      });

    } catch (error) {
      this.loggingService.error('Add to cart error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to add item to cart',
        error: (error as Error).message
      });
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;
      const userId = req.body.userId || req.user?.id;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await this.removeFromCart(req, res);
        return;
      }

      // Get cart item details
      const [cartItem] = await db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.id, itemId),
            eq(cartItems.userId, userId)
          )
        );

      if (!cartItem) {
        res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
        return;
      }

      // Check product inventory
      const [product] = await db
        .select({ inventory: products.inventory, price: products.price })
        .from(products)
        .where(eq(products.id, cartItem.productId));

      if (!product || product.inventory < quantity) {
        res.status(400).json({
          success: false,
          message: 'Insufficient inventory',
          availableQuantity: product?.inventory || 0
        });
        return;
      }

      // Update cart item
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity,
          totalPrice: (parseFloat(cartItem.unitPrice) * quantity).toString(),
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, itemId))
        .returning();

      // Clear cart cache
      await this.clearCartCache(userId);

      this.loggingService.info('Cart item updated', {
        userId,
        itemId,
        quantity
      });

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Cart item updated successfully'
      });

    } catch (error) {
      this.loggingService.error('Update cart item error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to update cart item',
        error: (error as Error).message
      });
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      const userId = req.body.userId || req.user?.id;

      const [deletedItem] = await db
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.id, itemId),
            eq(cartItems.userId, userId)
          )
        )
        .returning();

      if (!deletedItem) {
        res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
        return;
      }

      // Clear cart cache
      await this.clearCartCache(userId);

      this.loggingService.info('Item removed from cart', {
        userId,
        itemId,
        productId: deletedItem.productId
      });

      res.status(200).json({
        success: true,
        message: 'Item removed from cart successfully'
      });

    } catch (error) {
      this.loggingService.error('Remove from cart error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to remove item from cart',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get cart items for user
   */
  async getCartItems(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Try to get from cache first
      const cachedCart = await this.getCartFromCache(userId);
      if (cachedCart) {
        res.status(200).json({
          success: true,
          data: cachedCart.items,
          summary: cachedCart.summary,
          cached: true
        });
        return;
      }

      // Get cart items with product and vendor details
      const items = await db
        .select({
          id: cartItems.id,
          productId: cartItems.productId,
          vendorId: cartItems.vendorId,
          name: cartItems.name,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          totalPrice: cartItems.totalPrice,
          productName: products.name,
          productImage: products.images,
          productInventory: products.inventory,
          vendorName: vendors.storeName,
          createdAt: cartItems.createdAt,
          updatedAt: cartItems.updatedAt
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(vendors, eq(cartItems.vendorId, vendors.id))
        .where(eq(cartItems.userId, parseInt(userId)))
        .orderBy(desc(cartItems.createdAt));

      // Calculate cart summary
      const summary = this.calculateCartSummary(items);

      // Cache the cart data
      await this.cacheCartData(userId, { items, summary });

      res.status(200).json({
        success: true,
        data: items,
        summary,
        cached: false
      });

    } catch (error) {
      this.loggingService.error('Get cart items error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to get cart items',
        error: (error as Error).message
      });
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const deletedItems = await db
        .delete(cartItems)
        .where(eq(cartItems.userId, parseInt(userId)))
        .returning();

      // Clear cart cache
      await this.clearCartCache(userId);

      this.loggingService.info('Cart cleared', {
        userId,
        itemsRemoved: deletedItems.length
      });

      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        itemsRemoved: deletedItems.length
      });

    } catch (error) {
      this.loggingService.error('Clear cart error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get cart summary (totals, counts, etc.)
   */
  async getCartSummary(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const items = await db
        .select({
          quantity: cartItems.quantity,
          totalPrice: cartItems.totalPrice,
          vendorId: cartItems.vendorId
        })
        .from(cartItems)
        .where(eq(cartItems.userId, parseInt(userId)));

      const summary = this.calculateCartSummary(items);

      res.status(200).json({
        success: true,
        data: summary
      });

    } catch (error) {
      this.loggingService.error('Get cart summary error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to get cart summary',
        error: (error as Error).message
      });
    }
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { userId, couponCode } = req.body;

      // Validate coupon (placeholder - implement actual coupon validation)
      const discount = await this.validateAndCalculateCouponDiscount(couponCode, userId);

      if (!discount.valid) {
        res.status(400).json({
          success: false,
          message: discount.message || 'Invalid coupon code'
        });
        return;
      }

      // Update cart cache with discount
      const cartData = await this.getCartFromCache(userId);
      if (cartData) {
        cartData.summary.couponCode = couponCode;
        cartData.summary.discount = discount.amount;
        cartData.summary.finalTotal = cartData.summary.subtotal - discount.amount;
        await this.cacheCartData(userId, cartData);
      }

      res.status(200).json({
        success: true,
        data: discount,
        message: 'Coupon applied successfully'
      });

    } catch (error) {
      this.loggingService.error('Apply coupon error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to apply coupon',
        error: (error as Error).message
      });
    }
  }

  // Private helper methods

  private calculateCartSummary(items: any[]): any {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice || '0'), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueVendors = new Set(items.map(item => item.vendorId)).size;

    // Calculate shipping (Bangladesh-specific logic)
    const shipping = this.calculateShipping(items, subtotal);
    
    // Calculate VAT (15% for Bangladesh)
    const vat = subtotal * 0.15;
    
    const total = subtotal + shipping + vat;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      vat: parseFloat(vat.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalItems,
      uniqueVendors,
      currency: 'BDT'
    };
  }

  private calculateShipping(items: any[], subtotal: number): number {
    // Free shipping for orders over 1000 BDT
    if (subtotal >= 1000) return 0;
    
    // Base shipping rate
    let shipping = 60; // Base rate for Dhaka
    
    // Additional charges for multiple vendors
    const uniqueVendors = new Set(items.map(item => item.vendorId)).size;
    if (uniqueVendors > 1) {
      shipping += (uniqueVendors - 1) * 30;
    }
    
    return shipping;
  }

  private async clearCartCache(userId: string): Promise<void> {
    try {
      await this.redisService.del(`cart:${userId}`);
      await this.redisService.del(`cart:summary:${userId}`);
    } catch (error) {
      this.loggingService.warn('Failed to clear cart cache', { userId, error });
    }
  }

  private async getCartFromCache(userId: string): Promise<any> {
    try {
      const cached = await this.redisService.get(`cart:${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.loggingService.warn('Failed to get cart from cache', { userId, error });
      return null;
    }
  }

  private async cacheCartData(userId: string, data: any): Promise<void> {
    try {
      await this.redisService.setex(`cart:${userId}`, 3600, JSON.stringify(data)); // 1 hour cache
    } catch (error) {
      this.loggingService.warn('Failed to cache cart data', { userId, error });
    }
  }

  private async updateCartStatistics(userId: string): Promise<void> {
    try {
      // Update cart statistics for analytics
      const now = new Date();
      await this.redisService.incr(`cart:stats:${now.toISOString().split('T')[0]}`);
    } catch (error) {
      this.loggingService.warn('Failed to update cart statistics', { userId, error });
    }
  }

  private async validateAndCalculateCouponDiscount(couponCode: string, userId: string): Promise<any> {
    // Placeholder for coupon validation logic
    // In production, this would check coupon validity, expiry, user eligibility, etc.
    
    const validCoupons: { [key: string]: any } = {
      'WELCOME10': { type: 'percentage', value: 10, minOrder: 500 },
      'FLAT50': { type: 'fixed', value: 50, minOrder: 200 },
      'NEWUSER': { type: 'percentage', value: 15, minOrder: 1000 }
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    // Calculate discount amount based on cart
    // This is a simplified implementation
    return {
      valid: true,
      amount: coupon.type === 'percentage' ? 100 : coupon.value, // Placeholder calculation
      type: coupon.type,
      code: couponCode
    };
  }
}