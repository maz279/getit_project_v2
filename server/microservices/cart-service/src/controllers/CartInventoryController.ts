/**
 * Cart Inventory Controller - Real-time Inventory Integration
 * Amazon.com/Shopee.sg-level inventory management with stock validation
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  cartItems,
  carts,
  products,
  inventory,
  productRecommendations,
  vendors
} from '@shared/schema';
import { eq, and, desc, sql, inArray, lt, gte } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class CartInventoryController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Check availability of all cart items
   */
  async checkAvailability(req: Request, res: Response): Promise<void> {
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

      // Get cart items with inventory data
      const itemsAvailability = await db
        .select({
          itemId: cartItems.id,
          productId: cartItems.productId,
          variantId: cartItems.variantId,
          requestedQuantity: cartItems.quantity,
          productName: products.name,
          productSku: products.sku,
          availableQuantity: inventory.availableQuantity,
          reservedQuantity: inventory.reservedQuantity,
          totalQuantity: inventory.quantity,
          isInStock: sql<boolean>`${inventory.availableQuantity} >= ${cartItems.quantity}`,
          stockStatus: sql<string>`CASE 
            WHEN ${inventory.availableQuantity} >= ${cartItems.quantity} THEN 'available'
            WHEN ${inventory.availableQuantity} > 0 THEN 'partial'
            ELSE 'out_of_stock'
          END`
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(inventory, eq(cartItems.productId, inventory.productId))
        .where(eq(cartItems.cartId, cart.id));

      // Categorize items by availability
      const availableItems = itemsAvailability.filter(item => item.stockStatus === 'available');
      const partialItems = itemsAvailability.filter(item => item.stockStatus === 'partial');
      const outOfStockItems = itemsAvailability.filter(item => item.stockStatus === 'out_of_stock');

      // Calculate availability summary
      const summary = {
        totalItems: itemsAvailability.length,
        availableItems: availableItems.length,
        partialItems: partialItems.length,
        outOfStockItems: outOfStockItems.length,
        fullyAvailable: outOfStockItems.length === 0 && partialItems.length === 0
      };

      this.loggingService.logInfo('Cart availability checked', {
        cartId: cart.id,
        summary,
        userId,
        guestId
      });

      res.json({
        success: true,
        data: {
          cartId: cart.id,
          availability: itemsAvailability,
          summary,
          categories: {
            available: availableItems,
            partial: partialItems,
            outOfStock: outOfStockItems
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to check cart availability', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check cart availability',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate cart inventory and update quantities
   */
  async validateInventory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, autoUpdate = false } = req.body;

      const cart = await this.getActiveCart(userId, guestId);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      const validationResults = [];
      const updateActions = [];

      // Get cart items
      const cartItemsList = await db
        .select({
          id: cartItems.id,
          productId: cartItems.productId,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice
        })
        .from(cartItems)
        .where(eq(cartItems.cartId, cart.id));

      for (const item of cartItemsList) {
        // Check current inventory
        const [inventoryData] = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, item.productId));

        const validation = {
          itemId: item.id,
          productId: item.productId,
          requestedQuantity: item.quantity,
          availableQuantity: inventoryData?.availableQuantity || 0,
          valid: false,
          action: 'none' as string,
          newQuantity: item.quantity
        };

        if (!inventoryData) {
          validation.action = 'remove';
          validation.valid = false;
        } else if (inventoryData.availableQuantity >= item.quantity) {
          validation.valid = true;
          validation.action = 'none';
        } else if (inventoryData.availableQuantity > 0) {
          validation.valid = false;
          validation.action = 'reduce';
          validation.newQuantity = inventoryData.availableQuantity;
        } else {
          validation.valid = false;
          validation.action = 'remove';
        }

        validationResults.push(validation);

        // Auto-update if requested
        if (autoUpdate && !validation.valid) {
          if (validation.action === 'remove') {
            await db
              .delete(cartItems)
              .where(eq(cartItems.id, item.id));
            updateActions.push({ type: 'removed', itemId: item.id });
          } else if (validation.action === 'reduce') {
            const newTotalPrice = item.unitPrice * validation.newQuantity;
            await db
              .update(cartItems)
              .set({
                quantity: validation.newQuantity,
                totalPrice: newTotalPrice,
                taxAmount: newTotalPrice * 0.15,
                updatedAt: new Date()
              })
              .where(eq(cartItems.id, item.id));
            updateActions.push({ 
              type: 'updated', 
              itemId: item.id, 
              oldQuantity: item.quantity,
              newQuantity: validation.newQuantity 
            });
          }
        }
      }

      // Update cart totals if auto-updated
      if (autoUpdate && updateActions.length > 0) {
        await this.updateCartTotals(cart.id);
        await this.clearCartCache(userId, guestId);
      }

      const summary = {
        totalItems: validationResults.length,
        validItems: validationResults.filter(v => v.valid).length,
        invalidItems: validationResults.filter(v => !v.valid).length,
        itemsToRemove: validationResults.filter(v => v.action === 'remove').length,
        itemsToReduce: validationResults.filter(v => v.action === 'reduce').length,
        autoUpdated: autoUpdate
      };

      this.loggingService.logInfo('Cart inventory validated', {
        cartId: cart.id,
        summary,
        updateActions: updateActions.length,
        userId,
        guestId
      });

      res.json({
        success: true,
        data: {
          cartId: cart.id,
          validationResults,
          summary,
          updateActions: autoUpdate ? updateActions : undefined
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to validate inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get stock alerts for cart items
   */
  async getStockAlerts(req: Request, res: Response): Promise<void> {
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

      // Get items with low stock alerts
      const stockAlerts = await db
        .select({
          itemId: cartItems.id,
          productId: cartItems.productId,
          productName: products.name,
          productSku: products.sku,
          requestedQuantity: cartItems.quantity,
          availableQuantity: inventory.availableQuantity,
          totalQuantity: inventory.quantity,
          alertLevel: sql<string>`CASE 
            WHEN ${inventory.availableQuantity} = 0 THEN 'critical'
            WHEN ${inventory.availableQuantity} < ${cartItems.quantity} THEN 'warning'
            WHEN ${inventory.availableQuantity} <= 5 THEN 'low'
            ELSE 'normal'
          END`,
          message: sql<string>`CASE 
            WHEN ${inventory.availableQuantity} = 0 THEN 'Out of stock'
            WHEN ${inventory.availableQuantity} < ${cartItems.quantity} THEN 'Insufficient stock available'
            WHEN ${inventory.availableQuantity} <= 5 THEN 'Low stock remaining'
            ELSE 'Stock available'
          END`
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(inventory, eq(cartItems.productId, inventory.productId))
        .where(eq(cartItems.cartId, cart.id));

      // Filter only items with alerts
      const alertItems = stockAlerts.filter(item => item.alertLevel !== 'normal');

      res.json({
        success: true,
        data: {
          cartId: cart.id,
          alerts: alertItems,
          summary: {
            totalAlerts: alertItems.length,
            critical: alertItems.filter(a => a.alertLevel === 'critical').length,
            warning: alertItems.filter(a => a.alertLevel === 'warning').length,
            low: alertItems.filter(a => a.alertLevel === 'low').length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get stock alerts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get stock alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Reserve inventory for cart items
   */
  async reserveInventory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, reservationMinutes = 15 } = req.body;

      const cart = await this.getActiveCart(userId, guestId);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      const cartItemsList = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, cart.id));

      const reservationResults = [];
      const errors = [];

      for (const item of cartItemsList) {
        try {
          // Check and reserve inventory
          const [inventoryData] = await db
            .select()
            .from(inventory)
            .where(eq(inventory.productId, item.productId));

          if (!inventoryData || inventoryData.availableQuantity < item.quantity) {
            errors.push({
              productId: item.productId,
              error: 'Insufficient stock for reservation',
              available: inventoryData?.availableQuantity || 0,
              requested: item.quantity
            });
            continue;
          }

          // Update inventory with reservation
          await db
            .update(inventory)
            .set({
              availableQuantity: inventoryData.availableQuantity - item.quantity,
              reservedQuantity: inventoryData.reservedQuantity + item.quantity,
              updatedAt: new Date()
            })
            .where(eq(inventory.productId, item.productId));

          reservationResults.push({
            productId: item.productId,
            quantity: item.quantity,
            reservedUntil: new Date(Date.now() + reservationMinutes * 60 * 1000),
            success: true
          });

          // Store reservation in Redis with TTL
          await this.redisService.set(
            `reservation:${cart.id}:${item.productId}`,
            JSON.stringify({
              cartId: cart.id,
              productId: item.productId,
              quantity: item.quantity,
              reservedAt: new Date(),
              expiresAt: new Date(Date.now() + reservationMinutes * 60 * 1000)
            }),
            reservationMinutes * 60
          );

        } catch (error) {
          errors.push({
            productId: item.productId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      this.loggingService.logInfo('Inventory reservation completed', {
        cartId: cart.id,
        reservedItems: reservationResults.length,
        errors: errors.length,
        reservationMinutes,
        userId,
        guestId
      });

      res.json({
        success: true,
        data: {
          cartId: cart.id,
          reservations: reservationResults,
          errors,
          summary: {
            totalItems: cartItemsList.length,
            reserved: reservationResults.length,
            failed: errors.length,
            reservationDuration: `${reservationMinutes} minutes`
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to reserve inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reserve inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Release inventory reservations
   */
  async releaseInventory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, productIds } = req.body;

      const cart = await this.getActiveCart(userId, guestId);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      const releaseResults = [];
      
      // Get products to release (or all if not specified)
      const productsToRelease = productIds || await db
        .select({ productId: cartItems.productId, quantity: cartItems.quantity })
        .from(cartItems)
        .where(eq(cartItems.cartId, cart.id));

      for (const product of productsToRelease) {
        const productId = product.productId || product;
        
        // Get reservation data
        const reservationKey = `reservation:${cart.id}:${productId}`;
        const reservationData = await this.redisService.get(reservationKey);

        if (reservationData) {
          const reservation = JSON.parse(reservationData);
          
          // Release inventory
          const [inventoryData] = await db
            .select()
            .from(inventory)
            .where(eq(inventory.productId, productId));

          if (inventoryData) {
            await db
              .update(inventory)
              .set({
                availableQuantity: inventoryData.availableQuantity + reservation.quantity,
                reservedQuantity: Math.max(0, inventoryData.reservedQuantity - reservation.quantity),
                updatedAt: new Date()
              })
              .where(eq(inventory.productId, productId));

            // Remove reservation from Redis
            await this.redisService.del(reservationKey);

            releaseResults.push({
              productId,
              quantity: reservation.quantity,
              released: true
            });
          }
        }
      }

      this.loggingService.logInfo('Inventory reservations released', {
        cartId: cart.id,
        releasedItems: releaseResults.length,
        userId,
        guestId
      });

      res.json({
        success: true,
        data: {
          cartId: cart.id,
          releases: releaseResults,
          summary: {
            releasedItems: releaseResults.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to release inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to release inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get alternative products for out-of-stock items
   */
  async getAlternatives(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      const { limit = 5 } = req.query;

      // Get cart item details
      const [cartItem] = await db
        .select({
          id: cartItems.id,
          productId: cartItems.productId,
          quantity: cartItems.quantity,
          categoryId: products.categoryId,
          vendorId: products.vendorId,
          priceRange: sql<number>`${products.price} * 0.8`,
          maxPrice: sql<number>`${products.price} * 1.2`
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.id, itemId));

      if (!cartItem) {
        res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
        return;
      }

      // Find alternative products
      const alternatives = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          salePrice: products.salePrice,
          images: products.images,
          rating: products.rating,
          reviewCount: products.reviewCount,
          vendorId: products.vendorId,
          vendorName: vendors.businessName,
          availableQuantity: inventory.availableQuantity,
          similarity: sql<number>`
            CASE 
              WHEN ${products.categoryId} = ${cartItem.categoryId} THEN 0.9
              WHEN ${products.vendorId} = ${cartItem.vendorId} THEN 0.7
              ELSE 0.5
            END
          `
        })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .leftJoin(inventory, eq(products.id, inventory.productId))
        .where(and(
          eq(products.isActive, true),
          eq(products.status, 'active'),
          gte(inventory.availableQuantity, cartItem.quantity),
          gte(products.price, cartItem.priceRange),
          sql`${products.price} <= ${cartItem.maxPrice}`
        ))
        .orderBy(desc(sql`similarity`), products.rating)
        .limit(parseInt(limit as string));

      this.loggingService.logInfo('Alternative products retrieved', {
        itemId,
        originalProductId: cartItem.productId,
        alternativesFound: alternatives.length
      });

      res.json({
        success: true,
        data: {
          originalItem: cartItem,
          alternatives,
          metadata: {
            totalAlternatives: alternatives.length,
            searchCriteria: {
              category: cartItem.categoryId,
              vendor: cartItem.vendorId,
              priceRange: [cartItem.priceRange, cartItem.maxPrice],
              minimumQuantity: cartItem.quantity
            }
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get alternatives', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get alternative products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Replace cart item with alternative
   */
  async replaceItem(req: Request, res: Response): Promise<void> {
    try {
      const { originalItemId, newProductId, newQuantity } = req.body;
      const userId = req.user?.userId;

      // Get original cart item
      const [originalItem] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, originalItemId));

      if (!originalItem) {
        res.status(404).json({
          success: false,
          message: 'Original cart item not found'
        });
        return;
      }

      // Get new product details
      const [newProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, newProductId));

      if (!newProduct || !newProduct.isActive) {
        res.status(400).json({
          success: false,
          message: 'New product is not available'
        });
        return;
      }

      // Check inventory for new product
      const [inventoryData] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.productId, newProductId));

      if (!inventoryData || inventoryData.availableQuantity < newQuantity) {
        res.status(400).json({
          success: false,
          message: 'Insufficient stock for new product',
          availableQuantity: inventoryData?.availableQuantity || 0
        });
        return;
      }

      // Update cart item with new product
      const unitPrice = newProduct.salePrice || newProduct.price;
      const totalPrice = unitPrice * newQuantity;

      const [updatedItem] = await db
        .update(cartItems)
        .set({
          productId: newProductId,
          vendorId: newProduct.vendorId,
          quantity: newQuantity,
          unitPrice,
          totalPrice,
          taxAmount: totalPrice * 0.15,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, originalItemId))
        .returning();

      // Update cart totals
      await this.updateCartTotals(originalItem.cartId);
      await this.clearCartCacheForCart(originalItem.cartId);

      this.loggingService.logInfo('Cart item replaced', {
        itemId: originalItemId,
        originalProductId: originalItem.productId,
        newProductId,
        cartId: originalItem.cartId,
        userId
      });

      res.json({
        success: true,
        message: 'Cart item replaced successfully',
        data: {
          updatedItem,
          replacement: {
            from: {
              productId: originalItem.productId,
              quantity: originalItem.quantity
            },
            to: {
              productId: newProductId,
              quantity: newQuantity
            }
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to replace item', error);
      res.status(500).json({
        success: false,
        message: 'Failed to replace cart item',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get recommendations for cart
   */
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, type = 'complementary', limit = 10 } = req.query;

      const cart = await this.getActiveCart(userId, guestId as string);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Get cart product categories
      const cartProducts = await db
        .select({
          productId: cartItems.productId,
          categoryId: products.categoryId,
          vendorId: products.vendorId
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cart.id));

      const categoryIds = [...new Set(cartProducts.map(p => p.categoryId))];
      const vendorIds = [...new Set(cartProducts.map(p => p.vendorId))];
      const productIds = cartProducts.map(p => p.productId);

      let recommendations = [];

      if (type === 'complementary') {
        // Get complementary products
        recommendations = await this.getComplementaryProducts(categoryIds, productIds, limit as string);
      } else if (type === 'similar') {
        // Get similar products
        recommendations = await this.getSimilarProducts(categoryIds, productIds, limit as string);
      } else if (type === 'vendor') {
        // Get other products from same vendors
        recommendations = await this.getVendorProducts(vendorIds, productIds, limit as string);
      }

      res.json({
        success: true,
        data: {
          cartId: cart.id,
          recommendationType: type,
          recommendations,
          metadata: {
            cartProducts: cartProducts.length,
            categories: categoryIds.length,
            vendors: vendorIds.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get recommendations', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get bulk alternatives for multiple items
   */
  async getBulkAlternatives(req: Request, res: Response): Promise<void> {
    try {
      const { itemIds, limit = 3 } = req.body;

      if (!Array.isArray(itemIds) || itemIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Item IDs array is required'
        });
        return;
      }

      const bulkAlternatives = [];

      for (const itemId of itemIds) {
        try {
          // Get item details
          const [cartItem] = await db
            .select({
              id: cartItems.id,
              productId: cartItems.productId,
              quantity: cartItems.quantity,
              categoryId: products.categoryId,
              priceRange: sql<number>`${products.price} * 0.8`,
              maxPrice: sql<number>`${products.price} * 1.2`
            })
            .from(cartItems)
            .leftJoin(products, eq(cartItems.productId, products.id))
            .where(eq(cartItems.id, itemId));

          if (cartItem) {
            // Get alternatives for this item
            const alternatives = await db
              .select({
                id: products.id,
                name: products.name,
                price: products.price,
                salePrice: products.salePrice,
                images: products.images,
                rating: products.rating,
                availableQuantity: inventory.availableQuantity
              })
              .from(products)
              .leftJoin(inventory, eq(products.id, inventory.productId))
              .where(and(
                eq(products.isActive, true),
                eq(products.categoryId, cartItem.categoryId),
                gte(inventory.availableQuantity, cartItem.quantity),
                gte(products.price, cartItem.priceRange),
                sql`${products.price} <= ${cartItem.maxPrice}`
              ))
              .limit(limit);

            bulkAlternatives.push({
              itemId,
              originalProductId: cartItem.productId,
              alternatives
            });
          }
        } catch (error) {
          bulkAlternatives.push({
            itemId,
            error: error instanceof Error ? error.message : 'Unknown error',
            alternatives: []
          });
        }
      }

      res.json({
        success: true,
        data: {
          bulkAlternatives,
          summary: {
            totalItems: itemIds.length,
            itemsWithAlternatives: bulkAlternatives.filter(item => item.alternatives && item.alternatives.length > 0).length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get bulk alternatives', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bulk alternatives',
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

  private async getComplementaryProducts(categoryIds: string[], excludeProductIds: string[], limit: string) {
    return await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        salePrice: products.salePrice,
        images: products.images,
        rating: products.rating,
        reviewCount: products.reviewCount,
        availableQuantity: inventory.availableQuantity
      })
      .from(products)
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .where(and(
        eq(products.isActive, true),
        inArray(products.categoryId, categoryIds),
        sql`${products.id} NOT IN (${excludeProductIds.map(id => `'${id}'`).join(',') || "''"})`,
        gte(inventory.availableQuantity, 1)
      ))
      .orderBy(desc(products.rating))
      .limit(parseInt(limit));
  }

  private async getSimilarProducts(categoryIds: string[], excludeProductIds: string[], limit: string) {
    return await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        salePrice: products.salePrice,
        images: products.images,
        rating: products.rating,
        availableQuantity: inventory.availableQuantity
      })
      .from(products)
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .where(and(
        eq(products.isActive, true),
        inArray(products.categoryId, categoryIds),
        sql`${products.id} NOT IN (${excludeProductIds.map(id => `'${id}'`).join(',') || "''"})`,
        gte(inventory.availableQuantity, 1)
      ))
      .orderBy(desc(products.salesCount))
      .limit(parseInt(limit));
  }

  private async getVendorProducts(vendorIds: string[], excludeProductIds: string[], limit: string) {
    return await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        salePrice: products.salePrice,
        images: products.images,
        rating: products.rating,
        vendorName: vendors.businessName,
        availableQuantity: inventory.availableQuantity
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.id))
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .where(and(
        eq(products.isActive, true),
        inArray(products.vendorId, vendorIds),
        sql`${products.id} NOT IN (${excludeProductIds.map(id => `'${id}'`).join(',') || "''"})`,
        gte(inventory.availableQuantity, 1)
      ))
      .orderBy(desc(products.rating))
      .limit(parseInt(limit));
  }

  private async updateCartTotals(cartId: string) {
    const items = await db
      .select({
        quantity: cartItems.quantity,
        totalPrice: cartItems.totalPrice,
        taxAmount: cartItems.taxAmount,
        discountAmount: cartItems.discountAmount
      })
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId));

    const totals = items.reduce((acc, item) => ({
      totalItems: acc.totalItems + item.quantity,
      subtotal: acc.subtotal + item.totalPrice,
      taxAmount: acc.taxAmount + item.taxAmount,
      discountAmount: acc.discountAmount + item.discountAmount
    }), {
      totalItems: 0,
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0
    });

    const totalAmount = totals.subtotal + totals.taxAmount - totals.discountAmount;

    await db
      .update(carts)
      .set({
        ...totals,
        totalAmount,
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

  private async clearCartCacheForCart(cartId: string) {
    const [cart] = await db
      .select({ userId: carts.userId, guestId: carts.guestId })
      .from(carts)
      .where(eq(carts.id, cartId));

    if (cart) {
      await this.clearCartCache(cart.userId || undefined, cart.guestId || undefined);
    }
  }
}