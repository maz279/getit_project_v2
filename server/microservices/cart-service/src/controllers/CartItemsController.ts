/**
 * Cart Items Controller - Cart Item Management Operations
 * Amazon.com/Shopee.sg-level cart item management with real-time inventory integration
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  cartItems,
  carts,
  products,
  vendors,
  inventory,
  productVariants
} from '@shared/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';
import { v4 as uuidv4 } from 'uuid';

export class CartItemsController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Add item to cart
   */
  async addItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { 
        productId, 
        variantId, 
        quantity = 1, 
        guestId 
      } = req.body;

      // Get cart
      const cart = await this.getActiveCart(userId, guestId);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      // Validate product and get details
      const [product] = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          salePrice: products.salePrice,
          sku: products.sku,
          vendorId: products.vendorId,
          images: products.images,
          status: products.status,
          isActive: products.isActive
        })
        .from(products)
        .where(eq(products.id, productId));

      if (!product || !product.isActive || product.status !== 'active') {
        res.status(400).json({
          success: false,
          message: 'Product is not available'
        });
        return;
      }

      // Check inventory availability
      const [inventoryData] = await db
        .select({
          quantity: inventory.quantity,
          availableQuantity: inventory.availableQuantity,
          reservedQuantity: inventory.reservedQuantity
        })
        .from(inventory)
        .where(eq(inventory.productId, productId));

      if (!inventoryData || inventoryData.availableQuantity < quantity) {
        res.status(400).json({
          success: false,
          message: 'Insufficient stock available',
          availableQuantity: inventoryData?.availableQuantity || 0
        });
        return;
      }

      // Check if item already exists in cart
      const [existingItem] = await db
        .select()
        .from(cartItems)
        .where(and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
          variantId ? eq(cartItems.variantId, variantId) : sql`variant_id IS NULL`
        ));

      const unitPrice = product.salePrice || product.price;
      const totalPrice = unitPrice * quantity;

      let updatedItem;

      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;
        const newTotalPrice = unitPrice * newQuantity;

        [updatedItem] = await db
          .update(cartItems)
          .set({
            quantity: newQuantity,
            unitPrice,
            totalPrice: newTotalPrice,
            updatedAt: new Date()
          })
          .where(eq(cartItems.id, existingItem.id))
          .returning();
      } else {
        // Add new item to cart
        [updatedItem] = await db
          .insert(cartItems)
          .values({
            id: uuidv4(),
            cartId: cart.id,
            productId,
            variantId: variantId || null,
            vendorId: product.vendorId,
            quantity,
            unitPrice,
            totalPrice,
            discountAmount: 0,
            taxAmount: totalPrice * 0.15, // 15% VAT
            addedAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
      }

      // Update cart totals
      await this.updateCartTotals(cart.id);

      // Clear cache
      await this.clearCartCache(userId, guestId);

      // Get updated item with product details
      const itemWithDetails = await this.getCartItemWithDetails(updatedItem.id);

      this.loggingService.logInfo('Item added to cart', {
        cartId: cart.id,
        productId,
        quantity,
        unitPrice,
        userId,
        guestId
      });

      res.json({
        success: true,
        message: 'Item added to cart successfully',
        data: itemWithDetails,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to add item to cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add item to cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cart items
   */
  async getItems(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { guestId, groupByVendor = false } = req.query;

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
          productPrice: products.price,
          productSalePrice: products.salePrice,
          productImages: products.images,
          productSku: products.sku,
          productStatus: products.status,
          // Vendor details
          vendorName: vendors.businessName,
          vendorEmail: vendors.email,
          // Inventory details
          availableQuantity: inventory.availableQuantity
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(vendors, eq(cartItems.vendorId, vendors.id))
        .leftJoin(inventory, eq(cartItems.productId, inventory.productId))
        .where(eq(cartItems.cartId, cart.id))
        .orderBy(desc(cartItems.addedAt));

      let responseData;
      if (groupByVendor === 'true') {
        // Group items by vendor
        const groupedItems = items.reduce((acc, item) => {
          if (!acc[item.vendorId]) {
            acc[item.vendorId] = {
              vendorId: item.vendorId,
              vendorName: item.vendorName,
              vendorEmail: item.vendorEmail,
              items: [],
              subtotal: 0,
              totalItems: 0
            };
          }
          acc[item.vendorId].items.push(item);
          acc[item.vendorId].subtotal += item.totalPrice;
          acc[item.vendorId].totalItems += item.quantity;
          return acc;
        }, {} as any);

        responseData = Object.values(groupedItems);
      } else {
        responseData = items;
      }

      this.loggingService.logInfo('Cart items retrieved', {
        cartId: cart.id,
        itemCount: items.length,
        userId,
        guestId
      });

      res.json({
        success: true,
        data: responseData,
        metadata: {
          totalItems: items.length,
          cartId: cart.id,
          groupedByVendor: groupByVendor === 'true'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get cart items', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cart items',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update cart item
   */
  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      const { quantity, variantId } = req.body;
      const userId = req.user?.userId;

      // Get cart item
      const [item] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, itemId));

      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
        return;
      }

      // Validate quantity
      if (quantity && quantity <= 0) {
        res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
        return;
      }

      // Check inventory if quantity is being updated
      if (quantity && quantity !== item.quantity) {
        const [inventoryData] = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, item.productId));

        if (!inventoryData || inventoryData.availableQuantity < quantity) {
          res.status(400).json({
            success: false,
            message: 'Insufficient stock available',
            availableQuantity: inventoryData?.availableQuantity || 0
          });
          return;
        }
      }

      const updates: any = {
        updatedAt: new Date()
      };

      if (quantity) {
        updates.quantity = quantity;
        updates.totalPrice = item.unitPrice * quantity;
        updates.taxAmount = updates.totalPrice * 0.15;
      }

      if (variantId !== undefined) {
        updates.variantId = variantId;
      }

      // Update item
      const [updatedItem] = await db
        .update(cartItems)
        .set(updates)
        .where(eq(cartItems.id, itemId))
        .returning();

      // Update cart totals
      await this.updateCartTotals(item.cartId);

      // Clear cache
      await this.clearCartCacheForCart(item.cartId);

      // Get updated item with details
      const itemWithDetails = await this.getCartItemWithDetails(updatedItem.id);

      this.loggingService.logInfo('Cart item updated', {
        itemId,
        cartId: item.cartId,
        updates,
        userId
      });

      res.json({
        success: true,
        message: 'Cart item updated successfully',
        data: itemWithDetails,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update cart item', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update cart item',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      const userId = req.user?.userId;

      // Get cart item
      const [item] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, itemId));

      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
        return;
      }

      // Delete item
      await db
        .delete(cartItems)
        .where(eq(cartItems.id, itemId));

      // Update cart totals
      await this.updateCartTotals(item.cartId);

      // Clear cache
      await this.clearCartCacheForCart(item.cartId);

      this.loggingService.logInfo('Item removed from cart', {
        itemId,
        cartId: item.cartId,
        productId: item.productId,
        userId
      });

      res.json({
        success: true,
        message: 'Item removed from cart successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to remove cart item', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove cart item',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update item quantity
   */
  async updateQuantity(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;
      const userId = req.user?.userId;

      if (!quantity || quantity <= 0) {
        res.status(400).json({
          success: false,
          message: 'Valid quantity is required'
        });
        return;
      }

      // Get cart item
      const [item] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, itemId));

      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
        return;
      }

      // Check inventory
      const [inventoryData] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.productId, item.productId));

      if (!inventoryData || inventoryData.availableQuantity < quantity) {
        res.status(400).json({
          success: false,
          message: 'Insufficient stock available',
          availableQuantity: inventoryData?.availableQuantity || 0
        });
        return;
      }

      const totalPrice = item.unitPrice * quantity;
      const taxAmount = totalPrice * 0.15;

      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity,
          totalPrice,
          taxAmount,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, itemId))
        .returning();

      // Update cart totals
      await this.updateCartTotals(item.cartId);

      // Clear cache
      await this.clearCartCacheForCart(item.cartId);

      this.loggingService.logInfo('Cart item quantity updated', {
        itemId,
        cartId: item.cartId,
        oldQuantity: item.quantity,
        newQuantity: quantity,
        userId
      });

      res.json({
        success: true,
        message: 'Item quantity updated successfully',
        data: updatedItem,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update item quantity', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update item quantity',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Bulk add items to cart
   */
  async bulkAddItems(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { items, guestId } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Items array is required'
        });
        return;
      }

      const cart = await this.getActiveCart(userId, guestId);
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      const addedItems = [];
      const errors = [];

      for (const itemData of items) {
        try {
          const { productId, variantId, quantity = 1 } = itemData;

          // Validate product
          const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, productId));

          if (!product || !product.isActive) {
            errors.push({ productId, error: 'Product not available' });
            continue;
          }

          // Check inventory
          const [inventoryData] = await db
            .select()
            .from(inventory)
            .where(eq(inventory.productId, productId));

          if (!inventoryData || inventoryData.availableQuantity < quantity) {
            errors.push({ 
              productId, 
              error: 'Insufficient stock',
              availableQuantity: inventoryData?.availableQuantity || 0 
            });
            continue;
          }

          const unitPrice = product.salePrice || product.price;
          const totalPrice = unitPrice * quantity;

          // Check if item exists
          const [existingItem] = await db
            .select()
            .from(cartItems)
            .where(and(
              eq(cartItems.cartId, cart.id),
              eq(cartItems.productId, productId),
              variantId ? eq(cartItems.variantId, variantId) : sql`variant_id IS NULL`
            ));

          if (existingItem) {
            // Update existing item
            const newQuantity = existingItem.quantity + quantity;
            const [updatedItem] = await db
              .update(cartItems)
              .set({
                quantity: newQuantity,
                totalPrice: unitPrice * newQuantity,
                updatedAt: new Date()
              })
              .where(eq(cartItems.id, existingItem.id))
              .returning();
            
            addedItems.push(updatedItem);
          } else {
            // Add new item
            const [newItem] = await db
              .insert(cartItems)
              .values({
                id: uuidv4(),
                cartId: cart.id,
                productId,
                variantId: variantId || null,
                vendorId: product.vendorId,
                quantity,
                unitPrice,
                totalPrice,
                discountAmount: 0,
                taxAmount: totalPrice * 0.15,
                addedAt: new Date(),
                updatedAt: new Date()
              })
              .returning();
            
            addedItems.push(newItem);
          }
        } catch (error) {
          errors.push({ 
            productId: itemData.productId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      // Update cart totals
      await this.updateCartTotals(cart.id);

      // Clear cache
      await this.clearCartCache(userId, guestId);

      this.loggingService.logInfo('Bulk items added to cart', {
        cartId: cart.id,
        totalItems: items.length,
        successfulItems: addedItems.length,
        errors: errors.length,
        userId,
        guestId
      });

      res.json({
        success: true,
        message: 'Bulk items processed',
        data: {
          addedItems,
          errors,
          summary: {
            total: items.length,
            successful: addedItems.length,
            failed: errors.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to bulk add items', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk add items',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Bulk remove items from cart
   */
  async bulkRemoveItems(req: Request, res: Response): Promise<void> {
    try {
      const { itemIds } = req.body;
      const userId = req.user?.userId;

      if (!Array.isArray(itemIds) || itemIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Item IDs array is required'
        });
        return;
      }

      // Get items to get cart ID for cache clearing
      const items = await db
        .select({ id: cartItems.id, cartId: cartItems.cartId })
        .from(cartItems)
        .where(inArray(cartItems.id, itemIds));

      const cartId = items[0]?.cartId;

      // Delete items
      const deletedItems = await db
        .delete(cartItems)
        .where(inArray(cartItems.id, itemIds))
        .returning();

      if (cartId) {
        // Update cart totals
        await this.updateCartTotals(cartId);
        
        // Clear cache
        await this.clearCartCacheForCart(cartId);
      }

      this.loggingService.logInfo('Bulk items removed from cart', {
        removedCount: deletedItems.length,
        cartId,
        userId
      });

      res.json({
        success: true,
        message: 'Items removed successfully',
        data: {
          removedCount: deletedItems.length,
          removedItems: deletedItems
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to bulk remove items', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk remove items',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Bulk update items in cart
   */
  async bulkUpdateItems(req: Request, res: Response): Promise<void> {
    try {
      const { updates } = req.body;
      const userId = req.user?.userId;

      if (!Array.isArray(updates) || updates.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Updates array is required'
        });
        return;
      }

      const updatedItems = [];
      const errors = [];

      for (const update of updates) {
        try {
          const { itemId, quantity } = update;

          if (!quantity || quantity <= 0) {
            errors.push({ itemId, error: 'Invalid quantity' });
            continue;
          }

          // Get item
          const [item] = await db
            .select()
            .from(cartItems)
            .where(eq(cartItems.id, itemId));

          if (!item) {
            errors.push({ itemId, error: 'Item not found' });
            continue;
          }

          // Check inventory
          const [inventoryData] = await db
            .select()
            .from(inventory)
            .where(eq(inventory.productId, item.productId));

          if (!inventoryData || inventoryData.availableQuantity < quantity) {
            errors.push({ 
              itemId, 
              error: 'Insufficient stock',
              availableQuantity: inventoryData?.availableQuantity || 0 
            });
            continue;
          }

          const totalPrice = item.unitPrice * quantity;
          
          const [updatedItem] = await db
            .update(cartItems)
            .set({
              quantity,
              totalPrice,
              taxAmount: totalPrice * 0.15,
              updatedAt: new Date()
            })
            .where(eq(cartItems.id, itemId))
            .returning();

          updatedItems.push(updatedItem);
        } catch (error) {
          errors.push({ 
            itemId: update.itemId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      // Update cart totals for all affected carts
      const cartIds = [...new Set(updatedItems.map(item => item.cartId))];
      for (const cartId of cartIds) {
        await this.updateCartTotals(cartId);
        await this.clearCartCacheForCart(cartId);
      }

      this.loggingService.logInfo('Bulk items updated in cart', {
        totalUpdates: updates.length,
        successfulUpdates: updatedItems.length,
        errors: errors.length,
        userId
      });

      res.json({
        success: true,
        message: 'Bulk updates processed',
        data: {
          updatedItems,
          errors,
          summary: {
            total: updates.length,
            successful: updatedItems.length,
            failed: errors.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to bulk update items', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update items',
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

  private async getCartItemWithDetails(itemId: string) {
    const [item] = await db
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
        productImages: products.images,
        productSku: products.sku,
        // Vendor details
        vendorName: vendors.businessName
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(vendors, eq(cartItems.vendorId, vendors.id))
      .where(eq(cartItems.id, itemId));

    return item;
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
    // Get cart to determine cache keys
    const [cart] = await db
      .select({ userId: carts.userId, guestId: carts.guestId })
      .from(carts)
      .where(eq(carts.id, cartId));

    if (cart) {
      await this.clearCartCache(cart.userId || undefined, cart.guestId || undefined);
    }
  }
}