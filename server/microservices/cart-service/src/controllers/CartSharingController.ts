/**
 * Cart Sharing Controller - Cart Sharing and Collaboration Features
 * Amazon.com/Shopee.sg-level cart sharing with social commerce integration
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  carts,
  cartItems,
  cartSharing,
  users,
  products
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';
import { v4 as uuidv4 } from 'uuid';

export class CartSharingController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Share cart with others
   */
  async shareCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { 
        cartId, 
        shareType = 'view_only', 
        expiresIn = 24, 
        allowedEmails,
        message,
        requireAuth = false 
      } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Verify cart ownership
      const [cart] = await db
        .select()
        .from(carts)
        .where(and(
          eq(carts.id, cartId),
          eq(carts.userId, userId)
        ));

      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found or access denied'
        });
        return;
      }

      // Generate share token
      const shareToken = uuidv4();
      const shareUrl = `${process.env.FRONTEND_URL}/cart/shared/${shareToken}`;

      // Create sharing record
      const [shareRecord] = await db
        .insert(cartSharing)
        .values({
          id: uuidv4(),
          cartId,
          sharedBy: userId,
          shareToken,
          shareType,
          shareUrl,
          allowedEmails: allowedEmails || [],
          message: message || '',
          requireAuth,
          isActive: true,
          viewCount: 0,
          expiresAt: new Date(Date.now() + expiresIn * 60 * 60 * 1000)
        })
        .returning();

      // Cache share data for quick access
      await this.redisService.set(
        `cart_share:${shareToken}`,
        JSON.stringify({
          cartId,
          sharedBy: userId,
          shareType,
          expiresAt: shareRecord.expiresAt,
          requireAuth,
          allowedEmails
        }),
        expiresIn * 60 * 60
      );

      this.loggingService.logInfo('Cart shared successfully', {
        cartId,
        shareId: shareRecord.id,
        shareType,
        sharedBy: userId,
        expiresIn
      });

      res.json({
        success: true,
        message: 'Cart shared successfully',
        data: {
          shareId: shareRecord.id,
          shareToken,
          shareUrl,
          shareType,
          expiresAt: shareRecord.expiresAt,
          permissions: {
            canView: true,
            canEdit: shareType === 'collaborative',
            canCheckout: shareType === 'collaborative' || shareType === 'checkout_allowed'
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to share cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get shared cart details
   */
  async getSharedCart(req: Request, res: Response): Promise<void> {
    try {
      const { shareId } = req.params;
      const userId = req.user?.userId;
      const visitorIp = req.ip;

      // Get share data from cache or database
      let shareData = await this.redisService.get(`cart_share:${shareId}`);
      
      if (!shareData) {
        const [shareRecord] = await db
          .select()
          .from(cartSharing)
          .where(eq(cartSharing.shareToken, shareId));

        if (!shareRecord || !shareRecord.isActive || shareRecord.expiresAt < new Date()) {
          res.status(404).json({
            success: false,
            message: 'Shared cart not found or expired'
          });
          return;
        }

        shareData = JSON.stringify({
          cartId: shareRecord.cartId,
          sharedBy: shareRecord.sharedBy,
          shareType: shareRecord.shareType,
          expiresAt: shareRecord.expiresAt,
          requireAuth: shareRecord.requireAuth,
          allowedEmails: shareRecord.allowedEmails
        });
      } else {
        shareData = JSON.parse(shareData);
      }

      const share = typeof shareData === 'string' ? JSON.parse(shareData) : shareData;

      // Check authentication requirement
      if (share.requireAuth && !userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required to view this shared cart'
        });
        return;
      }

      // Check email permissions
      if (share.allowedEmails && share.allowedEmails.length > 0 && userId) {
        const [user] = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, userId));

        if (!user || !share.allowedEmails.includes(user.email)) {
          res.status(403).json({
            success: false,
            message: 'Access denied - email not authorized'
          });
          return;
        }
      }

      // Get cart details
      const [cart] = await db
        .select({
          id: carts.id,
          totalItems: carts.totalItems,
          subtotal: carts.subtotal,
          taxAmount: carts.taxAmount,
          shippingAmount: carts.shippingAmount,
          discountAmount: carts.discountAmount,
          totalAmount: carts.totalAmount,
          currency: carts.currency,
          createdAt: carts.createdAt,
          updatedAt: carts.updatedAt,
          ownerName: users.firstName
        })
        .from(carts)
        .leftJoin(users, eq(carts.userId, users.id))
        .where(eq(carts.id, share.cartId));

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
          productImages: products.images,
          productSku: products.sku
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, share.cartId));

      // Update view count
      await db
        .update(cartSharing)
        .set({
          viewCount: sql`${cartSharing.viewCount} + 1`,
          lastViewedAt: new Date()
        })
        .where(eq(cartSharing.shareToken, shareId));

      const permissions = {
        canView: true,
        canEdit: share.shareType === 'collaborative',
        canCheckout: share.shareType === 'collaborative' || share.shareType === 'checkout_allowed',
        canComment: share.shareType === 'collaborative',
        isOwner: userId === share.sharedBy
      };

      this.loggingService.logInfo('Shared cart accessed', {
        shareId,
        cartId: share.cartId,
        viewerUserId: userId,
        visitorIp,
        shareType: share.shareType
      });

      res.json({
        success: true,
        data: {
          cart,
          items: cartItemsList,
          share: {
            shareType: share.shareType,
            sharedBy: share.sharedBy,
            expiresAt: share.expiresAt,
            ownerName: cart.ownerName
          },
          permissions
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get shared cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve shared cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Join collaborative cart
   */
  async joinCollaborativeCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { shareToken, joinAsCollaborator = true } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Get share details
      const [shareRecord] = await db
        .select()
        .from(cartSharing)
        .where(and(
          eq(cartSharing.shareToken, shareToken),
          eq(cartSharing.isActive, true)
        ));

      if (!shareRecord || shareRecord.expiresAt < new Date()) {
        res.status(404).json({
          success: false,
          message: 'Shared cart not found or expired'
        });
        return;
      }

      if (shareRecord.shareType !== 'collaborative') {
        res.status(400).json({
          success: false,
          message: 'This cart is not set up for collaboration'
        });
        return;
      }

      // Check if user already has access
      const currentCollaborators = Array.isArray(shareRecord.collaborators) ? shareRecord.collaborators : [];
      
      if (currentCollaborators.some((c: any) => c.userId === userId)) {
        res.status(400).json({
          success: false,
          message: 'You are already a collaborator on this cart'
        });
        return;
      }

      // Add user as collaborator
      const newCollaborator = {
        userId,
        joinedAt: new Date().toISOString(),
        permissions: {
          canEdit: joinAsCollaborator,
          canCheckout: joinAsCollaborator,
          canComment: true
        }
      };

      await db
        .update(cartSharing)
        .set({
          collaborators: [...currentCollaborators, newCollaborator],
          updatedAt: new Date()
        })
        .where(eq(cartSharing.id, shareRecord.id));

      // Get user details
      const [user] = await db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        })
        .from(users)
        .where(eq(users.id, userId));

      this.loggingService.logInfo('User joined collaborative cart', {
        shareId: shareRecord.id,
        cartId: shareRecord.cartId,
        userId,
        userName: `${user?.firstName} ${user?.lastName}`
      });

      res.json({
        success: true,
        message: 'Successfully joined collaborative cart',
        data: {
          shareId: shareRecord.id,
          cartId: shareRecord.cartId,
          permissions: newCollaborator.permissions,
          collaboratorCount: currentCollaborators.length + 1
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to join collaborative cart', error);
      res.status(500).json({
        success: false,
        message: 'Failed to join collaborative cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update collaborator permissions
   */
  async updatePermissions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { shareId, collaboratorUserId, permissions } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Get share record
      const [shareRecord] = await db
        .select()
        .from(cartSharing)
        .where(eq(cartSharing.id, shareId));

      if (!shareRecord) {
        res.status(404).json({
          success: false,
          message: 'Shared cart not found'
        });
        return;
      }

      // Check if user is the owner
      if (shareRecord.sharedBy !== userId) {
        res.status(403).json({
          success: false,
          message: 'Only the cart owner can update permissions'
        });
        return;
      }

      // Update collaborator permissions
      const collaborators = Array.isArray(shareRecord.collaborators) ? shareRecord.collaborators : [];
      const updatedCollaborators = collaborators.map((c: any) => {
        if (c.userId === collaboratorUserId) {
          return {
            ...c,
            permissions: {
              ...c.permissions,
              ...permissions
            },
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });

      await db
        .update(cartSharing)
        .set({
          collaborators: updatedCollaborators,
          updatedAt: new Date()
        })
        .where(eq(cartSharing.id, shareId));

      this.loggingService.logInfo('Collaborator permissions updated', {
        shareId,
        collaboratorUserId,
        updatedBy: userId,
        newPermissions: permissions
      });

      res.json({
        success: true,
        message: 'Permissions updated successfully',
        data: {
          collaboratorUserId,
          newPermissions: permissions
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update permissions', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user's shared carts
   */
  async getUserSharedCarts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { type = 'all' } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      let whereConditions = [eq(cartSharing.sharedBy, userId)];

      if (type === 'active') {
        whereConditions.push(eq(cartSharing.isActive, true));
      }

      // Get shared carts
      const sharedCarts = await db
        .select({
          id: cartSharing.id,
          cartId: cartSharing.cartId,
          shareToken: cartSharing.shareToken,
          shareType: cartSharing.shareType,
          shareUrl: cartSharing.shareUrl,
          message: cartSharing.message,
          isActive: cartSharing.isActive,
          viewCount: cartSharing.viewCount,
          lastViewedAt: cartSharing.lastViewedAt,
          expiresAt: cartSharing.expiresAt,
          createdAt: cartSharing.createdAt,
          // Cart details
          cartTotalItems: carts.totalItems,
          cartTotalAmount: carts.totalAmount,
          cartCurrency: carts.currency,
          // Collaborator count
          collaboratorCount: sql<number>`COALESCE(array_length(${cartSharing.collaborators}, 1), 0)`
        })
        .from(cartSharing)
        .leftJoin(carts, eq(cartSharing.cartId, carts.id))
        .where(and(...whereConditions))
        .orderBy(desc(cartSharing.createdAt));

      // Get collaborator details for each cart
      const enrichedCarts = await Promise.all(
        sharedCarts.map(async (cart) => {
          const collaborators = Array.isArray(cart.collaboratorCount) ? cart.collaboratorCount : [];
          
          const collaboratorDetails = await Promise.all(
            collaborators.slice(0, 5).map(async (c: any) => {
              const [user] = await db
                .select({
                  firstName: users.firstName,
                  lastName: users.lastName,
                  email: users.email
                })
                .from(users)
                .where(eq(users.id, c.userId));
              
              return {
                userId: c.userId,
                name: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
                email: user?.email,
                joinedAt: c.joinedAt,
                permissions: c.permissions
              };
            })
          );

          return {
            ...cart,
            collaborators: collaboratorDetails,
            isExpired: cart.expiresAt < new Date()
          };
        })
      );

      const summary = {
        totalShared: sharedCarts.length,
        activeShares: sharedCarts.filter(c => c.isActive).length,
        expiredShares: sharedCarts.filter(c => c.expiresAt < new Date()).length,
        totalViews: sharedCarts.reduce((sum, c) => sum + c.viewCount, 0),
        collaborativeShares: sharedCarts.filter(c => c.shareType === 'collaborative').length
      };

      res.json({
        success: true,
        data: {
          sharedCarts: enrichedCarts,
          summary
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get user shared carts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve shared carts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Revoke cart sharing
   */
  async revokeSharing(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { shareId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Get share record
      const [shareRecord] = await db
        .select()
        .from(cartSharing)
        .where(eq(cartSharing.id, shareId));

      if (!shareRecord) {
        res.status(404).json({
          success: false,
          message: 'Shared cart not found'
        });
        return;
      }

      // Check ownership
      if (shareRecord.sharedBy !== userId) {
        res.status(403).json({
          success: false,
          message: 'Only the cart owner can revoke sharing'
        });
        return;
      }

      // Deactivate sharing
      await db
        .update(cartSharing)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(cartSharing.id, shareId));

      // Remove from cache
      await this.redisService.del(`cart_share:${shareRecord.shareToken}`);

      this.loggingService.logInfo('Cart sharing revoked', {
        shareId,
        cartId: shareRecord.cartId,
        revokedBy: userId
      });

      res.json({
        success: true,
        message: 'Cart sharing revoked successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to revoke sharing', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke cart sharing',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}