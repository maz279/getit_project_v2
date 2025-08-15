/**
 * Cart Controller - Core Cart Management Operations
 * Amazon.com/Shopee.sg-level cart management with Bangladesh optimization
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  carts,
  cartItems,
  cartSessions,
  users,
  products,
  vendors
} from '@shared/schema';
import { eq, and, desc, sql, isNull, isNotNull, lt, gt } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';
import { v4 as uuidv4 } from 'uuid';

export class CartController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get user's active cart
   */
  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { includeItems = true, includeTotals = true } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check Redis cache first
      const cacheKey = `cart:${userId}`;
      let cartData = await this.redisService.get(cacheKey);

      if (!cartData) {
        // Get cart from database
        const [userCart] = await db
          .select({
            id: carts.id,
            userId: carts.userId,
            guestId: carts.guestId,
            sessionId: carts.sessionId,
            status: carts.status,
            currency: carts.currency,
            totalItems: carts.totalItems,
            subtotal: carts.subtotal,
            taxAmount: carts.taxAmount,
            shippingAmount: carts.shippingAmount,
            discountAmount: carts.discountAmount,
            totalAmount: carts.totalAmount,
            appliedCoupons: carts.appliedCoupons,
            shippingAddress: carts.shippingAddress,
            billingAddress: carts.billingAddress,
            paymentMethod: carts.paymentMethod,
            notes: carts.notes,
            isGift: carts.isGift,
            giftMessage: carts.giftMessage,
            estimatedDeliveryDate: carts.estimatedDeliveryDate,
            createdAt: carts.createdAt,
            updatedAt: carts.updatedAt,
            expiresAt: carts.expiresAt
          })
          .from(carts)
          .where(and(
            eq(carts.userId, userId),
            eq(carts.status, 'active')
          ));

        if (!userCart) {
          // Create new cart for user
          const newCart = await this.createNewCart(userId);
          cartData = newCart;
        } else {
          cartData = userCart;
        }

        // Cache cart data for 1 hour
        await this.redisService.set(cacheKey, JSON.stringify(cartData), 3600);
      } else {
        cartData = JSON.parse(cartData);
      }

      // Get cart items if requested
      let items = [];
      if (includeItems === 'true') {
        items = await this.getCartItems(cartData.id);
      }

      // Calculate totals if requested
      let totals = {};
      if (includeTotals === 'true') {
        totals = await this.calculateCartTotals(cartData.id);
      }

      this.loggingService.logInfo('Cart retrieved successfully', {
        userId,
        cartId: cartData.id,
        itemCount: items.length
      });

      res.json({
        success: true,
        data: {
          cart: cartData,
          items: includeItems === 'true' ? items : undefined,
          totals: includeTotals === 'true' ? totals : undefined
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new cart for user
   */
  async createCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { currency = 'BDT', guestId } = req.body;

      // Create new cart
      const cartId = uuidv4();
      const sessionId = req.sessionID || uuidv4();

      const [newCart] = await db
        .insert(carts)
        .values({
          id: cartId,
          userId: userId || null,
          guestId: guestId || null,
          sessionId,
          status: 'active',
          currency,
          totalItems: 0,
          subtotal: 0,
          taxAmount: 0,
          shippingAmount: 0,
          discountAmount: 0,
          totalAmount: 0,
          appliedCoupons: [],
          expiresAt: userId ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 days for users
            new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours for guests
        })
        .returning();

      // Cache new cart
      const cacheKey = userId ? `cart:${userId}` : `cart:guest:${guestId}`;
      await this.redisService.set(cacheKey, JSON.stringify(newCart), 3600);

      this.loggingService.logInfo('New cart created', {
        cartId,
        userId,
        guestId,
        currency
      });

      res.status(201).json({
        success: true,
        message: 'Cart created successfully',
        data: newCart,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to create cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clear cart contents
   */
  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { keepSavedItems = false } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Get user's active cart
      const [userCart] = await db
        .select()
        .from(carts)
        .where(and(
          eq(carts.userId, userId),
          eq(carts.status, 'active')
        ));

      if (!userCart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Delete all cart items
      await db
        .delete(cartItems)
        .where(eq(cartItems.cartId, userCart.id));

      // Reset cart totals
      await db
        .update(carts)
        .set({
          totalItems: 0,
          subtotal: 0,
          taxAmount: 0,
          shippingAmount: 0,
          discountAmount: 0,
          totalAmount: 0,
          appliedCoupons: [],
          updatedAt: new Date()
        })
        .where(eq(carts.id, userCart.id));

      // Clear cache
      await this.clearCartCache(userId);

      this.loggingService.logInfo('Cart cleared successfully', {
        userId,
        cartId: userCart.id,
        keepSavedItems
      });

      res.json({
        success: true,
        message: 'Cart cleared successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to clear cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Merge guest cart with user cart
   */
  async mergeCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestCartId, mergeStrategy = 'combine' } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Get guest cart
      const [guestCart] = await db
        .select()
        .from(carts)
        .where(eq(carts.id, guestCartId));

      if (!guestCart) {
        res.status(404).json({
          success: false,
          message: 'Guest cart not found'
        });
        return;
      }

      // Get or create user cart
      let [userCart] = await db
        .select()
        .from(carts)
        .where(and(
          eq(carts.userId, userId),
          eq(carts.status, 'active')
        ));

      if (!userCart) {
        userCart = await this.createNewCart(userId);
      }

      // Get guest cart items
      const guestItems = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, guestCartId));

      // Merge items based on strategy
      for (const item of guestItems) {
        // Check if item already exists in user cart
        const [existingItem] = await db
          .select()
          .from(cartItems)
          .where(and(
            eq(cartItems.cartId, userCart.id),
            eq(cartItems.productId, item.productId),
            eq(cartItems.variantId, item.variantId || '')
          ));

        if (existingItem) {
          if (mergeStrategy === 'combine') {
            // Add quantities
            await db
              .update(cartItems)
              .set({
                quantity: existingItem.quantity + item.quantity,
                updatedAt: new Date()
              })
              .where(eq(cartItems.id, existingItem.id));
          } else if (mergeStrategy === 'replace') {
            // Replace with guest cart item
            await db
              .update(cartItems)
              .set({
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                updatedAt: new Date()
              })
              .where(eq(cartItems.id, existingItem.id));
          }
        } else {
          // Add new item to user cart
          await db
            .insert(cartItems)
            .values({
              ...item,
              id: uuidv4(),
              cartId: userCart.id,
              createdAt: new Date(),
              updatedAt: new Date()
            });
        }
      }

      // Delete guest cart
      await db.delete(cartItems).where(eq(cartItems.cartId, guestCartId));
      await db.delete(carts).where(eq(carts.id, guestCartId));

      // Recalculate user cart totals
      await this.recalculateCartTotals(userCart.id);

      // Clear cache
      await this.clearCartCache(userId);

      this.loggingService.logInfo('Carts merged successfully', {
        userId,
        guestCartId,
        userCartId: userCart.id,
        mergeStrategy,
        mergedItems: guestItems.length
      });

      res.json({
        success: true,
        message: 'Carts merged successfully',
        data: {
          cartId: userCart.id,
          mergedItemsCount: guestItems.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to merge carts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to merge carts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Sync cart across devices
   */
  async syncCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { deviceId, lastSync } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Get user's cart with items modified after lastSync
      const syncDate = lastSync ? new Date(lastSync) : new Date(0);
      
      const [userCart] = await db
        .select()
        .from(carts)
        .where(and(
          eq(carts.userId, userId),
          eq(carts.status, 'active')
        ));

      if (!userCart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Get items modified after sync date
      const updatedItems = await db
        .select()
        .from(cartItems)
        .where(and(
          eq(cartItems.cartId, userCart.id),
          gt(cartItems.updatedAt, syncDate)
        ));

      // Update device sync record
      await db
        .insert(cartSessions)
        .values({
          id: uuidv4(),
          cartId: userCart.id,
          deviceId,
          lastSyncAt: new Date(),
          isActive: true
        })
        .onConflictDoUpdate({
          target: [cartSessions.cartId, cartSessions.deviceId],
          set: {
            lastSyncAt: new Date(),
            isActive: true
          }
        });

      this.loggingService.logInfo('Cart synced successfully', {
        userId,
        cartId: userCart.id,
        deviceId,
        updatedItemsCount: updatedItems.length
      });

      res.json({
        success: true,
        message: 'Cart synced successfully',
        data: {
          cart: userCart,
          updatedItems,
          syncTimestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to sync cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create guest cart
   */
  async createGuestCart(req: Request, res: Response): Promise<void> {
    try {
      const { guestId = uuidv4(), currency = 'BDT' } = req.body;
      const sessionId = req.sessionID || uuidv4();

      const cartId = uuidv4();

      const [newCart] = await db
        .insert(carts)
        .values({
          id: cartId,
          userId: null,
          guestId,
          sessionId,
          status: 'active',
          currency,
          totalItems: 0,
          subtotal: 0,
          taxAmount: 0,
          shippingAmount: 0,
          discountAmount: 0,
          totalAmount: 0,
          appliedCoupons: [],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        })
        .returning();

      // Cache guest cart
      await this.redisService.set(`cart:guest:${guestId}`, JSON.stringify(newCart), 24 * 3600);

      this.loggingService.logInfo('Guest cart created', {
        cartId,
        guestId,
        currency
      });

      res.status(201).json({
        success: true,
        message: 'Guest cart created successfully',
        data: newCart,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to create guest cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create guest cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get guest cart
   */
  async getGuestCart(req: Request, res: Response): Promise<void> {
    try {
      const { guestId } = req.params;
      const { includeItems = true } = req.query;

      // Check cache first
      const cacheKey = `cart:guest:${guestId}`;
      let cartData = await this.redisService.get(cacheKey);

      if (!cartData) {
        const [guestCart] = await db
          .select()
          .from(carts)
          .where(and(
            eq(carts.guestId, guestId),
            eq(carts.status, 'active')
          ));

        if (!guestCart) {
          res.status(404).json({
            success: false,
            message: 'Guest cart not found'
          });
          return;
        }

        cartData = guestCart;
        await this.redisService.set(cacheKey, JSON.stringify(cartData), 24 * 3600);
      } else {
        cartData = JSON.parse(cartData);
      }

      let items = [];
      if (includeItems === 'true') {
        items = await this.getCartItems(cartData.id);
      }

      res.json({
        success: true,
        data: {
          cart: cartData,
          items: includeItems === 'true' ? items : undefined
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get guest cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve guest cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Convert guest cart to user cart
   */
  async convertGuestCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Get guest cart
      const [guestCart] = await db
        .select()
        .from(carts)
        .where(and(
          eq(carts.guestId, guestId),
          eq(carts.status, 'active')
        ));

      if (!guestCart) {
        res.status(404).json({
          success: false,
          message: 'Guest cart not found'
        });
        return;
      }

      // Convert guest cart to user cart
      await db
        .update(carts)
        .set({
          userId,
          guestId: null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          updatedAt: new Date()
        })
        .where(eq(carts.id, guestCart.id));

      // Clear guest cache and create user cache
      await this.redisService.del(`cart:guest:${guestId}`);
      await this.redisService.set(`cart:${userId}`, JSON.stringify({
        ...guestCart,
        userId,
        guestId: null
      }), 3600);

      this.loggingService.logInfo('Guest cart converted to user cart', {
        cartId: guestCart.id,
        guestId,
        userId
      });

      res.json({
        success: true,
        message: 'Guest cart converted successfully',
        data: {
          cartId: guestCart.id,
          userId
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to convert guest cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to convert guest cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Extend guest cart expiration
   */
  async extendGuestCart(req: Request, res: Response): Promise<void> {
    try {
      const { guestId, hours = 24 } = req.body;

      const [guestCart] = await db
        .select()
        .from(carts)
        .where(and(
          eq(carts.guestId, guestId),
          eq(carts.status, 'active')
        ));

      if (!guestCart) {
        res.status(404).json({
          success: false,
          message: 'Guest cart not found'
        });
        return;
      }

      const newExpirationDate = new Date(Date.now() + hours * 60 * 60 * 1000);

      await db
        .update(carts)
        .set({
          expiresAt: newExpirationDate,
          updatedAt: new Date()
        })
        .where(eq(carts.id, guestCart.id));

      // Update cache with new expiration
      await this.redisService.set(`cart:guest:${guestId}`, JSON.stringify({
        ...guestCart,
        expiresAt: newExpirationDate
      }), hours * 3600);

      res.json({
        success: true,
        message: 'Guest cart expiration extended',
        data: {
          cartId: guestCart.id,
          newExpirationDate
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to extend guest cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extend guest cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods

  private async createNewCart(userId: string) {
    const cartId = uuidv4();
    const [newCart] = await db
      .insert(carts)
      .values({
        id: cartId,
        userId,
        sessionId: uuidv4(),
        status: 'active',
        currency: 'BDT',
        totalItems: 0,
        subtotal: 0,
        taxAmount: 0,
        shippingAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        appliedCoupons: [],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      .returning();

    return newCart;
  }

  private async getCartItems(cartId: string) {
    return await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        variantId: cartItems.variantId,
        vendorId: cartItems.vendorId,
        quantity: cartItems.quantity,
        unitPrice: cartItems.unitPrice,
        totalPrice: cartItems.totalPrice,
        discountAmount: cartItems.discountAmount,
        taxAmount: cartItems.taxAmount,
        addedAt: cartItems.addedAt,
        updatedAt: cartItems.updatedAt,
        // Product details
        productName: products.name,
        productImage: products.images,
        productSku: products.sku,
        // Vendor details
        vendorName: vendors.businessName
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(vendors, eq(cartItems.vendorId, vendors.id))
      .where(eq(cartItems.cartId, cartId));
  }

  private async calculateCartTotals(cartId: string) {
    const items = await this.getCartItems(cartId);
    
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const taxAmount = subtotal * 0.15; // 15% VAT for Bangladesh
    
    return {
      totalItems,
      subtotal,
      taxAmount,
      totalAmount: subtotal + taxAmount
    };
  }

  private async recalculateCartTotals(cartId: string) {
    const totals = await this.calculateCartTotals(cartId);
    
    await db
      .update(carts)
      .set({
        ...totals,
        updatedAt: new Date()
      })
      .where(eq(carts.id, cartId));
  }

  private async clearCartCache(userId: string) {
    await this.redisService.del(`cart:${userId}`);
  }
}