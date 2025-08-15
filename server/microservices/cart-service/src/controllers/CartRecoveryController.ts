/**
 * Cart Recovery Controller - Abandoned Cart Recovery System
 * Amazon.com/Shopee.sg-level abandoned cart recovery with email campaigns
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  carts,
  cartItems,
  abandonedCarts,
  cartRecoveryCampaigns,
  users,
  products
} from '@shared/schema';
import { eq, and, desc, sql, lt, gte, isNull } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';
import { v4 as uuidv4 } from 'uuid';

export class CartRecoveryController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get abandoned carts for recovery
   */
  async getAbandonedCarts(req: Request, res: Response): Promise<void> {
    try {
      const { 
        hours = 24, 
        minAmount = 100, 
        limit = 50,
        status = 'abandoned' 
      } = req.query;

      const cutoffTime = new Date(Date.now() - parseInt(hours as string) * 60 * 60 * 1000);

      // Get abandoned carts
      const abandonedCartsList = await db
        .select({
          cartId: carts.id,
          userId: carts.userId,
          guestId: carts.guestId,
          totalAmount: carts.totalAmount,
          totalItems: carts.totalItems,
          currency: carts.currency,
          lastActivity: carts.updatedAt,
          userEmail: users.email,
          userName: users.firstName,
          itemCount: sql<number>`COUNT(${cartItems.id})`,
          topProducts: sql<string>`STRING_AGG(${products.name}, ', ' ORDER BY ${cartItems.totalPrice} DESC)`
        })
        .from(carts)
        .leftJoin(users, eq(carts.userId, users.id))
        .leftJoin(cartItems, eq(carts.id, cartItems.cartId))
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(and(
          eq(carts.status, 'active'),
          lt(carts.updatedAt, cutoffTime),
          gte(carts.totalAmount, parseInt(minAmount as string)),
          sql`${carts.totalItems} > 0`
        ))
        .groupBy(carts.id, users.id)
        .orderBy(desc(carts.totalAmount))
        .limit(parseInt(limit as string));

      // Check for existing recovery campaigns
      const cartsWithRecovery = await Promise.all(
        abandonedCartsList.map(async (cart) => {
          const [existingCampaign] = await db
            .select()
            .from(cartRecoveryCampaigns)
            .where(eq(cartRecoveryCampaigns.cartId, cart.cartId))
            .orderBy(desc(cartRecoveryCampaigns.createdAt))
            .limit(1);

          return {
            ...cart,
            hasRecoveryCampaign: !!existingCampaign,
            lastRecoveryAttempt: existingCampaign?.createdAt,
            recoveryStatus: existingCampaign?.status
          };
        })
      );

      // Calculate recovery stats
      const stats = {
        totalAbandonedCarts: abandonedCartsList.length,
        totalValue: abandonedCartsList.reduce((sum, cart) => sum + cart.totalAmount, 0),
        averageValue: abandonedCartsList.length > 0 ? 
          abandonedCartsList.reduce((sum, cart) => sum + cart.totalAmount, 0) / abandonedCartsList.length : 0,
        cartsWithEmail: abandonedCartsList.filter(cart => cart.userEmail).length,
        cartsWithoutEmail: abandonedCartsList.filter(cart => !cart.userEmail).length
      };

      this.loggingService.logInfo('Abandoned carts retrieved', {
        count: abandonedCartsList.length,
        totalValue: stats.totalValue,
        hours
      });

      res.json({
        success: true,
        data: {
          abandonedCarts: cartsWithRecovery,
          stats,
          filters: {
            hours: parseInt(hours as string),
            minAmount: parseInt(minAmount as string),
            status
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get abandoned carts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve abandoned carts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send recovery email for abandoned cart
   */
  async sendRecoveryEmail(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, emailTemplate = 'standard', incentive } = req.body;

      // Get cart details
      const [cart] = await db
        .select({
          id: carts.id,
          userId: carts.userId,
          guestId: carts.guestId,
          totalAmount: carts.totalAmount,
          totalItems: carts.totalItems,
          currency: carts.currency,
          userEmail: users.email,
          userName: users.firstName
        })
        .from(carts)
        .leftJoin(users, eq(carts.userId, users.id))
        .where(eq(carts.id, cartId));

      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      if (!cart.userEmail) {
        res.status(400).json({
          success: false,
          message: 'No email address available for this cart'
        });
        return;
      }

      // Get cart items for email content
      const cartItemsList = await db
        .select({
          productName: products.name,
          productImage: products.images,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          totalPrice: cartItems.totalPrice
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cartId))
        .limit(5); // Show top 5 items in email

      // Generate recovery token
      const recoveryToken = uuidv4();
      const recoveryLink = `${process.env.FRONTEND_URL}/cart/recovery/${recoveryToken}`;

      // Create recovery campaign record
      const [campaign] = await db
        .insert(cartRecoveryCampaigns)
        .values({
          id: uuidv4(),
          cartId,
          userId: cart.userId,
          emailAddress: cart.userEmail,
          emailTemplate,
          recoveryToken,
          incentiveOffered: incentive ? JSON.stringify(incentive) : null,
          status: 'sent',
          sentAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        })
        .returning();

      // Store recovery token in Redis for quick lookup
      await this.redisService.set(
        `recovery:${recoveryToken}`,
        JSON.stringify({
          cartId,
          userId: cart.userId,
          campaignId: campaign.id,
          expiresAt: campaign.expiresAt
        }),
        7 * 24 * 60 * 60 // 7 days
      );

      // Send email (simplified - integrate with actual email service)
      const emailData = {
        to: cart.userEmail,
        subject: `${cart.userName || 'Valued Customer'}, you left something in your cart!`,
        template: emailTemplate,
        data: {
          customerName: cart.userName || 'Valued Customer',
          cartItems: cartItemsList,
          totalAmount: cart.totalAmount,
          totalItems: cart.totalItems,
          currency: cart.currency,
          recoveryLink,
          incentive: incentive || null,
          expiresAt: campaign.expiresAt
        }
      };

      // TODO: Integrate with notification service for actual email sending
      console.log('Recovery email would be sent:', emailData);

      this.loggingService.logInfo('Recovery email sent', {
        cartId,
        userId: cart.userId,
        email: cart.userEmail,
        template: emailTemplate,
        incentive: !!incentive,
        campaignId: campaign.id
      });

      res.json({
        success: true,
        message: 'Recovery email sent successfully',
        data: {
          cartId,
          campaignId: campaign.id,
          recoveryToken,
          emailAddress: cart.userEmail,
          expiresAt: campaign.expiresAt
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to send recovery email', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send recovery email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get recovery cart by token
   */
  async getRecoveryCart(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      // Get recovery data from Redis
      const recoveryData = await this.redisService.get(`recovery:${token}`);
      if (!recoveryData) {
        res.status(404).json({
          success: false,
          message: 'Invalid or expired recovery link'
        });
        return;
      }

      const recovery = JSON.parse(recoveryData);

      // Get cart details
      const [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.id, recovery.cartId));

      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Get cart items
      const cartItemsList = await db
        .select({
          id: cartItems.id,
          productId: cartItems.productId,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          totalPrice: cartItems.totalPrice,
          productName: products.name,
          productImage: products.images,
          productSku: products.sku,
          availableQuantity: sql<number>`COALESCE((SELECT available_quantity FROM inventory WHERE product_id = ${cartItems.productId}), 0)`
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, recovery.cartId));

      // Check item availability
      const itemsWithAvailability = cartItemsList.map(item => ({
        ...item,
        isAvailable: item.availableQuantity >= item.quantity,
        stockStatus: item.availableQuantity >= item.quantity ? 'available' : 
                    item.availableQuantity > 0 ? 'partial' : 'out_of_stock'
      }));

      // Update campaign with click tracking
      await db
        .update(cartRecoveryCampaigns)
        .set({
          clickedAt: new Date(),
          status: 'clicked'
        })
        .where(eq(cartRecoveryCampaigns.id, recovery.campaignId));

      this.loggingService.logInfo('Recovery cart accessed', {
        token,
        cartId: recovery.cartId,
        userId: recovery.userId,
        campaignId: recovery.campaignId
      });

      res.json({
        success: true,
        data: {
          cart,
          items: itemsWithAvailability,
          recovery: {
            campaignId: recovery.campaignId,
            expiresAt: recovery.expiresAt
          },
          availability: {
            totalItems: itemsWithAvailability.length,
            availableItems: itemsWithAvailability.filter(item => item.isAvailable).length,
            partialItems: itemsWithAvailability.filter(item => item.stockStatus === 'partial').length,
            outOfStockItems: itemsWithAvailability.filter(item => item.stockStatus === 'out_of_stock').length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get recovery cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recovery cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Restore abandoned cart
   */
  async restoreCart(req: Request, res: Response): Promise<void> {
    try {
      const { token, updateInventory = true } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Get recovery data
      const recoveryData = await this.redisService.get(`recovery:${token}`);
      if (!recoveryData) {
        res.status(404).json({
          success: false,
          message: 'Invalid or expired recovery link'
        });
        return;
      }

      const recovery = JSON.parse(recoveryData);

      // Get abandoned cart
      const [abandonedCart] = await db
        .select()
        .from(carts)
        .where(eq(carts.id, recovery.cartId));

      if (!abandonedCart) {
        res.status(404).json({
          success: false,
          message: 'Abandoned cart not found'
        });
        return;
      }

      // Get or create user's active cart
      let [userCart] = await db
        .select()
        .from(carts)
        .where(and(
          eq(carts.userId, userId),
          eq(carts.status, 'active')
        ));

      if (!userCart) {
        // Create new cart
        [userCart] = await db
          .insert(carts)
          .values({
            id: uuidv4(),
            userId,
            sessionId: uuidv4(),
            status: 'active',
            currency: abandonedCart.currency,
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
      }

      // Get abandoned cart items
      const abandonedItems = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, recovery.cartId));

      const restoredItems = [];
      const errors = [];

      for (const item of abandonedItems) {
        try {
          // Check inventory if requested
          if (updateInventory) {
            const [inventoryData] = await db
              .select()
              .from(sql`inventory`)
              .where(sql`product_id = ${item.productId}`);

            if (!inventoryData || inventoryData.availableQuantity < item.quantity) {
              errors.push({
                productId: item.productId,
                error: 'Insufficient stock',
                requested: item.quantity,
                available: inventoryData?.availableQuantity || 0
              });
              continue;
            }
          }

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
            // Update quantity
            const newQuantity = existingItem.quantity + item.quantity;
            const newTotalPrice = existingItem.unitPrice * newQuantity;

            await db
              .update(cartItems)
              .set({
                quantity: newQuantity,
                totalPrice: newTotalPrice,
                taxAmount: newTotalPrice * 0.15,
                updatedAt: new Date()
              })
              .where(eq(cartItems.id, existingItem.id));

            restoredItems.push({
              ...existingItem,
              quantity: newQuantity,
              action: 'merged'
            });
          } else {
            // Add new item
            const [newItem] = await db
              .insert(cartItems)
              .values({
                ...item,
                id: uuidv4(),
                cartId: userCart.id,
                addedAt: new Date(),
                updatedAt: new Date()
              })
              .returning();

            restoredItems.push({
              ...newItem,
              action: 'added'
            });
          }
        } catch (error) {
          errors.push({
            productId: item.productId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Update cart totals
      const totals = restoredItems.reduce((acc, item) => ({
        totalItems: acc.totalItems + item.quantity,
        subtotal: acc.subtotal + item.totalPrice,
        taxAmount: acc.taxAmount + (item.taxAmount || 0)
      }), { totalItems: 0, subtotal: 0, taxAmount: 0 });

      await db
        .update(carts)
        .set({
          ...totals,
          totalAmount: totals.subtotal + totals.taxAmount,
          updatedAt: new Date()
        })
        .where(eq(carts.id, userCart.id));

      // Update recovery campaign
      await db
        .update(cartRecoveryCampaigns)
        .set({
          status: 'restored',
          restoredAt: new Date()
        })
        .where(eq(cartRecoveryCampaigns.id, recovery.campaignId));

      // Clear recovery token
      await this.redisService.del(`recovery:${token}`);

      // Clear user cart cache
      await this.redisService.del(`cart:${userId}`);

      this.loggingService.logInfo('Cart restored successfully', {
        token,
        abandonedCartId: recovery.cartId,
        userCartId: userCart.id,
        userId,
        restoredItems: restoredItems.length,
        errors: errors.length
      });

      res.json({
        success: true,
        message: 'Cart restored successfully',
        data: {
          cartId: userCart.id,
          restoredItems,
          errors,
          summary: {
            totalItems: abandonedItems.length,
            restored: restoredItems.length,
            failed: errors.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to restore cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restore cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get recovery analytics
   */
  async getRecoveryAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { days = 30 } = req.query;
      const startDate = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);

      // Get recovery campaign stats
      const campaigns = await db
        .select({
          id: cartRecoveryCampaigns.id,
          status: cartRecoveryCampaigns.status,
          sentAt: cartRecoveryCampaigns.sentAt,
          clickedAt: cartRecoveryCampaigns.clickedAt,
          restoredAt: cartRecoveryCampaigns.restoredAt,
          cartValue: sql<number>`(SELECT total_amount FROM carts WHERE id = ${cartRecoveryCampaigns.cartId})`
        })
        .from(cartRecoveryCampaigns)
        .where(gte(cartRecoveryCampaigns.createdAt, startDate));

      // Calculate analytics
      const analytics = {
        totalCampaigns: campaigns.length,
        emailsSent: campaigns.filter(c => c.status !== 'draft').length,
        emailsClicked: campaigns.filter(c => c.clickedAt).length,
        cartsRestored: campaigns.filter(c => c.restoredAt).length,
        totalRecoveredValue: campaigns
          .filter(c => c.restoredAt)
          .reduce((sum, c) => sum + (c.cartValue || 0), 0),
        clickThroughRate: 0,
        recoveryRate: 0,
        averageRecoveredValue: 0
      };

      // Calculate rates
      if (analytics.emailsSent > 0) {
        analytics.clickThroughRate = (analytics.emailsClicked / analytics.emailsSent) * 100;
        analytics.recoveryRate = (analytics.cartsRestored / analytics.emailsSent) * 100;
      }

      if (analytics.cartsRestored > 0) {
        analytics.averageRecoveredValue = analytics.totalRecoveredValue / analytics.cartsRestored;
      }

      // Get daily stats
      const dailyStats = await db
        .select({
          date: sql<string>`DATE(${cartRecoveryCampaigns.sentAt})`,
          campaignsSent: sql<number>`COUNT(*)`,
          campaignsClicked: sql<number>`SUM(CASE WHEN ${cartRecoveryCampaigns.clickedAt} IS NOT NULL THEN 1 ELSE 0 END)`,
          cartsRestored: sql<number>`SUM(CASE WHEN ${cartRecoveryCampaigns.restoredAt} IS NOT NULL THEN 1 ELSE 0 END)`
        })
        .from(cartRecoveryCampaigns)
        .where(gte(cartRecoveryCampaigns.sentAt, startDate))
        .groupBy(sql`DATE(${cartRecoveryCampaigns.sentAt})`)
        .orderBy(sql`DATE(${cartRecoveryCampaigns.sentAt})`);

      res.json({
        success: true,
        data: {
          analytics,
          dailyStats,
          period: {
            days: parseInt(days as string),
            startDate,
            endDate: new Date()
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get recovery analytics', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recovery analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}