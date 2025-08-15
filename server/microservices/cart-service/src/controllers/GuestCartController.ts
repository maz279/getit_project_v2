/**
 * Guest Cart Controller - Amazon.com/Shopee.sg Level Guest Experience
 * Critical missing component - handles 60%+ of e-commerce traffic
 */
import { Request, Response } from 'express';
import { cartRedisService } from '../../../../services/CartRedisService';
import { cartWebSocketService } from '../../../../services/CartWebSocketService';

interface CreateGuestCartRequest {
  deviceInfo?: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    fingerprint: string;
  };
  location?: {
    country: string;
    district?: string;
  };
  preferences?: {
    currency?: string;
    language?: string;
  };
}

interface ConvertGuestCartRequest {
  guestId: string;
  userId: string;
}

export class GuestCartController {
  /**
   * Create new guest cart
   * POST /api/v1/cart/guest/create
   */
  async createGuestCart(req: Request, res: Response): Promise<void> {
    try {
      const { deviceInfo, location, preferences }: CreateGuestCartRequest = req.body;
      
      // Generate unique guest ID
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get client info from request
      const metadata = {
        source: this.detectSource(req.headers['user-agent'] || ''),
        sessionId: req.sessionID || '',
        ipAddress: req.ip || req.connection.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
        location: location || { country: 'BD' }, // Default to Bangladesh
        preferences: {
          currency: 'BDT',
          language: 'bn', // Bengali default
          ...preferences
        }
      };

      // Create cart in Redis
      const cartId = await cartRedisService.createCart(undefined, guestId, metadata);
      
      res.status(201).json({
        success: true,
        data: {
          cartId,
          guestId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          metadata
        },
        message: 'Guest cart created successfully'
      });

    } catch (error) {
      console.error('Error creating guest cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create guest cart',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get guest cart
   * GET /api/v1/cart/guest/:guestId
   */
  async getGuestCart(req: Request, res: Response): Promise<void> {
    try {
      const { guestId } = req.params;

      if (!guestId) {
        res.status(400).json({
          success: false,
          message: 'Guest ID is required'
        });
        return;
      }

      const cart = await cartRedisService.getCartByGuestId(guestId);
      
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Guest cart not found or expired'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Guest cart retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting guest cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get guest cart',
        error: (error as Error).message
      });
    }
  }

  /**
   * Convert guest cart to user cart (when user registers/logs in)
   * POST /api/v1/cart/guest/convert
   */
  async convertGuestCart(req: Request, res: Response): Promise<void> {
    try {
      const { guestId, userId }: ConvertGuestCartRequest = req.body;

      if (!guestId || !userId) {
        res.status(400).json({
          success: false,
          message: 'Guest ID and User ID are required'
        });
        return;
      }

      const convertedCart = await cartRedisService.convertGuestToUserCart(guestId, userId);
      
      if (!convertedCart) {
        res.status(404).json({
          success: false,
          message: 'Guest cart not found or already converted'
        });
        return;
      }

      // Broadcast cart update via WebSocket
      await cartWebSocketService.broadcastCartUpdate({
        type: 'CART_UPDATED',
        cartId: convertedCart.cartId,
        userId,
        data: { convertedFromGuest: true },
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        data: convertedCart,
        message: 'Guest cart converted to user cart successfully'
      });

    } catch (error) {
      console.error('Error converting guest cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to convert guest cart',
        error: (error as Error).message
      });
    }
  }

  /**
   * Extend guest cart session
   * PUT /api/v1/cart/guest/extend
   */
  async extendGuestSession(req: Request, res: Response): Promise<void> {
    try {
      const { guestId, hours = 24 } = req.body;

      if (!guestId) {
        res.status(400).json({
          success: false,
          message: 'Guest ID is required'
        });
        return;
      }

      const cart = await cartRedisService.getCartByGuestId(guestId);
      
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Guest cart not found'
        });
        return;
      }

      await cartRedisService.extendSession(cart.cartId, hours);

      res.status(200).json({
        success: true,
        data: {
          cartId: cart.cartId,
          guestId,
          expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000)
        },
        message: 'Guest cart session extended successfully'
      });

    } catch (error) {
      console.error('Error extending guest session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extend guest session',
        error: (error as Error).message
      });
    }
  }

  /**
   * Add item to guest cart
   * POST /api/v1/cart/guest/:guestId/items
   */
  async addItemToGuestCart(req: Request, res: Response): Promise<void> {
    try {
      const { guestId } = req.params;
      const { productId, vendorId, quantity, unitPrice, variantId, customizations } = req.body;

      if (!guestId || !productId || !vendorId || !quantity || !unitPrice) {
        res.status(400).json({
          success: false,
          message: 'Guest ID, product ID, vendor ID, quantity, and unit price are required'
        });
        return;
      }

      const cart = await cartRedisService.getCartByGuestId(guestId);
      
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Guest cart not found'
        });
        return;
      }

      const updatedCart = await cartRedisService.addItem(cart.cartId, {
        productId,
        vendorId,
        quantity,
        unitPrice,
        variantId,
        customizations
      });

      if (!updatedCart) {
        res.status(500).json({
          success: false,
          message: 'Failed to add item to guest cart'
        });
        return;
      }

      // Broadcast update via WebSocket
      await cartWebSocketService.broadcastCartUpdate({
        type: 'ITEM_ADDED',
        cartId: cart.cartId,
        guestId,
        data: { productId, quantity },
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        data: updatedCart,
        message: 'Item added to guest cart successfully'
      });

    } catch (error) {
      console.error('Error adding item to guest cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add item to guest cart',
        error: (error as Error).message
      });
    }
  }

  /**
   * Update item quantity in guest cart
   * PUT /api/v1/cart/guest/:guestId/items/:productId
   */
  async updateGuestCartItemQuantity(req: Request, res: Response): Promise<void> {
    try {
      const { guestId, productId } = req.params;
      const { quantity, variantId } = req.body;

      if (!guestId || !productId || quantity === undefined) {
        res.status(400).json({
          success: false,
          message: 'Guest ID, product ID, and quantity are required'
        });
        return;
      }

      const cart = await cartRedisService.getCartByGuestId(guestId);
      
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Guest cart not found'
        });
        return;
      }

      const updatedCart = await cartRedisService.updateItemQuantity(cart.cartId, productId, quantity, variantId);

      if (!updatedCart) {
        res.status(500).json({
          success: false,
          message: 'Failed to update item quantity in guest cart'
        });
        return;
      }

      // Broadcast update via WebSocket
      await cartWebSocketService.broadcastCartUpdate({
        type: 'ITEM_QUANTITY_CHANGED',
        cartId: cart.cartId,
        guestId,
        data: { productId, quantity, variantId },
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        data: updatedCart,
        message: 'Guest cart item quantity updated successfully'
      });

    } catch (error) {
      console.error('Error updating guest cart item quantity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update guest cart item quantity',
        error: (error as Error).message
      });
    }
  }

  /**
   * Remove item from guest cart
   * DELETE /api/v1/cart/guest/:guestId/items/:productId
   */
  async removeItemFromGuestCart(req: Request, res: Response): Promise<void> {
    try {
      const { guestId, productId } = req.params;
      const { variantId } = req.query;

      if (!guestId || !productId) {
        res.status(400).json({
          success: false,
          message: 'Guest ID and product ID are required'
        });
        return;
      }

      const cart = await cartRedisService.getCartByGuestId(guestId);
      
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Guest cart not found'
        });
        return;
      }

      const updatedCart = await cartRedisService.removeItem(cart.cartId, productId, variantId as string);

      if (!updatedCart) {
        res.status(500).json({
          success: false,
          message: 'Failed to remove item from guest cart'
        });
        return;
      }

      // Broadcast update via WebSocket
      await cartWebSocketService.broadcastCartUpdate({
        type: 'ITEM_REMOVED',
        cartId: cart.cartId,
        guestId,
        data: { productId, variantId },
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        data: updatedCart,
        message: 'Item removed from guest cart successfully'
      });

    } catch (error) {
      console.error('Error removing item from guest cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove item from guest cart',
        error: (error as Error).message
      });
    }
  }

  /**
   * Clear guest cart
   * DELETE /api/v1/cart/guest/:guestId/clear
   */
  async clearGuestCart(req: Request, res: Response): Promise<void> {
    try {
      const { guestId } = req.params;

      if (!guestId) {
        res.status(400).json({
          success: false,
          message: 'Guest ID is required'
        });
        return;
      }

      const cart = await cartRedisService.getCartByGuestId(guestId);
      
      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Guest cart not found'
        });
        return;
      }

      await cartRedisService.clearCart(cart.cartId);

      // Broadcast update via WebSocket
      await cartWebSocketService.broadcastCartUpdate({
        type: 'CART_CLEARED',
        cartId: cart.cartId,
        guestId,
        data: {},
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Guest cart cleared successfully'
      });

    } catch (error) {
      console.error('Error clearing guest cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear guest cart',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get guest cart statistics (for analytics)
   * GET /api/v1/admin/cart/guest-analytics
   */
  async getGuestCartAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await cartRedisService.getCartStatistics();
      
      res.status(200).json({
        success: true,
        data: stats,
        message: 'Guest cart analytics retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting guest cart analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get guest cart analytics',
        error: (error as Error).message
      });
    }
  }

  /**
   * Private helper methods
   */
  private detectSource(userAgent: string): 'web' | 'mobile' | 'app' {
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    if (userAgent.includes('GetItApp')) {
      return 'app';
    } else if (mobileRegex.test(userAgent)) {
      return 'mobile';
    } else {
      return 'web';
    }
  }
}