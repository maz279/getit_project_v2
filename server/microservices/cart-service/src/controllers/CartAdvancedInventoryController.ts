/**
 * Cart Advanced Inventory Controller - Real-time Inventory Integration
 * Handles Amazon.com/Shopee.sg-level inventory management and reservations
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  carts, 
  cartItems, 
  products, 
  vendors
} from '@shared/schema';
import { eq, and, desc, asc, inArray, gte, lte } from 'drizzle-orm';

interface InventoryReservation {
  productId: string;
  quantity: number;
  reservedUntil: Date;
  cartId: string;
}

export class CartAdvancedInventoryController {
  private reservations: Map<string, InventoryReservation> = new Map();

  /**
   * Validate cart inventory in real-time
   * POST /api/v1/cart/validate-inventory
   */
  async validateInventory(req: Request, res: Response): Promise<void> {
    try {
      const { cartId } = req.body;

      if (!cartId) {
        res.status(400).json({
          success: false,
          message: 'Cart ID is required'
        });
        return;
      }

      // Get all cart items with product and inventory information
      const cartItemsWithInventory = await db
        .select({
          itemId: cartItems.id,
          productId: cartItems.productId,
          vendorId: cartItems.vendorId,
          requestedQuantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          productName: products.name,
          availableStock: products.stockQuantity,
          lowStockThreshold: products.lowStockThreshold,
          isActive: products.isActive,
          vendorName: vendors.businessName,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(vendors, eq(cartItems.vendorId, vendors.id))
        .where(eq(cartItems.cartId, cartId));

      const validationResults = await Promise.all(
        cartItemsWithInventory.map(async (item) => {
          // Check current reservations for this product
          const currentReservations = Array.from(this.reservations.values())
            .filter(r => r.productId === item.productId && r.cartId !== cartId)
            .reduce((sum, r) => sum + r.quantity, 0);

          const effectiveStock = (item.availableStock || 0) - currentReservations;
          const isAvailable = effectiveStock >= item.requestedQuantity;
          const isLowStock = effectiveStock <= (item.lowStockThreshold || 5);

          // Get alternative products if not available
          const alternatives = !isAvailable ? await this.getAlternativeProducts(item.productId, item.vendorId) : [];

          return {
            itemId: item.itemId,
            productId: item.productId,
            productName: item.productName,
            vendorName: item.vendorName,
            requestedQuantity: item.requestedQuantity,
            availableStock: item.availableStock || 0,
            effectiveStock,
            currentReservations,
            isAvailable,
            isLowStock,
            isActive: item.isActive,
            maxAvailable: effectiveStock,
            alternatives: alternatives,
            status: !item.isActive ? 'discontinued' : 
                   !isAvailable ? 'out_of_stock' : 
                   isLowStock ? 'low_stock' : 'available',
            suggestedAction: !item.isActive ? 'remove' :
                           !isAvailable ? 'reduce_quantity_or_replace' :
                           isLowStock ? 'consider_backup' : 'proceed'
          };
        })
      );

      // Calculate overall cart validation status
      const unavailableItems = validationResults.filter(item => !item.isAvailable);
      const lowStockItems = validationResults.filter(item => item.isLowStock && item.isAvailable);
      const discontinuedItems = validationResults.filter(item => !item.isActive);

      const overallStatus = unavailableItems.length > 0 ? 'has_unavailable_items' :
                           discontinuedItems.length > 0 ? 'has_discontinued_items' :
                           lowStockItems.length > 0 ? 'has_low_stock_items' : 'all_available';

      res.json({
        success: true,
        data: {
          cartId,
          overallStatus,
          validationResults,
          summary: {
            totalItems: validationResults.length,
            availableItems: validationResults.filter(item => item.isAvailable).length,
            unavailableItems: unavailableItems.length,
            lowStockItems: lowStockItems.length,
            discontinuedItems: discontinuedItems.length
          },
          recommendations: {
            removeItems: discontinuedItems.map(item => item.itemId),
            reduceQuantities: unavailableItems.map(item => ({
              itemId: item.itemId,
              currentQuantity: item.requestedQuantity,
              maxAvailable: item.maxAvailable
            })),
            considerAlternatives: unavailableItems.filter(item => item.alternatives.length > 0).map(item => ({
              itemId: item.itemId,
              alternativeCount: item.alternatives.length
            }))
          },
          validatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error validating inventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Reserve inventory during checkout
   * POST /api/v1/cart/reserve-inventory
   */
  async reserveInventory(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, reservationDurationMinutes = 15 } = req.body;

      if (!cartId) {
        res.status(400).json({
          success: false,
          message: 'Cart ID is required'
        });
        return;
      }

      // Get cart items
      const cartItemsData = await db
        .select({
          itemId: cartItems.id,
          productId: cartItems.productId,
          quantity: cartItems.quantity,
          productName: products.name,
          availableStock: products.stockQuantity,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cartId));

      const reservationResults = [];
      const reservationErrors = [];
      const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      for (const item of cartItemsData) {
        try {
          // Check if sufficient inventory is available
          const currentReservations = Array.from(this.reservations.values())
            .filter(r => r.productId === item.productId && r.cartId !== cartId)
            .reduce((sum, r) => sum + r.quantity, 0);

          const effectiveStock = (item.availableStock || 0) - currentReservations;

          if (effectiveStock >= item.quantity) {
            // Create reservation
            const reservation: InventoryReservation = {
              productId: item.productId,
              quantity: item.quantity,
              reservedUntil: new Date(Date.now() + reservationDurationMinutes * 60 * 1000),
              cartId
            };

            const reservationKey = `${cartId}_${item.productId}`;
            this.reservations.set(reservationKey, reservation);

            reservationResults.push({
              itemId: item.itemId,
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              reservationId,
              reservedUntil: reservation.reservedUntil.toISOString(),
              status: 'reserved'
            });
          } else {
            reservationErrors.push({
              itemId: item.itemId,
              productId: item.productId,
              productName: item.productName,
              requestedQuantity: item.quantity,
              availableQuantity: effectiveStock,
              status: 'insufficient_stock'
            });
          }
        } catch (error) {
          reservationErrors.push({
            itemId: item.itemId,
            productId: item.productId,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'reservation_failed'
          });
        }
      }

      // Schedule automatic release of reservations
      setTimeout(() => {
        this.releaseCartReservations(cartId);
      }, reservationDurationMinutes * 60 * 1000);

      res.json({
        success: reservationErrors.length === 0,
        data: {
          cartId,
          reservationId,
          reservedItems: reservationResults,
          errors: reservationErrors,
          summary: {
            totalItems: cartItemsData.length,
            successfulReservations: reservationResults.length,
            failedReservations: reservationErrors.length,
            reservationDurationMinutes,
            autoReleaseAt: new Date(Date.now() + reservationDurationMinutes * 60 * 1000).toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error reserving inventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reserve inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Release inventory reservations
   * DELETE /api/v1/cart/release-inventory
   */
  async releaseInventory(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, productId } = req.body;

      if (!cartId) {
        res.status(400).json({
          success: false,
          message: 'Cart ID is required'
        });
        return;
      }

      let releasedCount = 0;
      const releasedItems = [];

      if (productId) {
        // Release specific product reservation
        const reservationKey = `${cartId}_${productId}`;
        const reservation = this.reservations.get(reservationKey);
        
        if (reservation) {
          this.reservations.delete(reservationKey);
          releasedCount = 1;
          releasedItems.push({
            productId,
            quantity: reservation.quantity,
            releasedAt: new Date().toISOString()
          });
        }
      } else {
        // Release all cart reservations
        releasedCount = this.releaseCartReservations(cartId);
      }

      res.json({
        success: true,
        data: {
          cartId,
          productId: productId || 'all',
          releasedCount,
          releasedItems,
          message: `Released ${releasedCount} inventory reservation(s)`
        }
      });
    } catch (error) {
      console.error('Error releasing inventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to release inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get real-time stock alerts
   * GET /api/v1/cart/stock-alerts
   */
  async getStockAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { cartId } = req.query;

      if (!cartId) {
        res.status(400).json({
          success: false,
          message: 'Cart ID is required'
        });
        return;
      }

      // Get cart items with current stock levels
      const cartItemsWithStock = await db
        .select({
          itemId: cartItems.id,
          productId: cartItems.productId,
          vendorId: cartItems.vendorId,
          quantity: cartItems.quantity,
          productName: products.name,
          currentStock: products.stockQuantity,
          lowStockThreshold: products.lowStockThreshold,
          lastStockUpdate: products.updatedAt,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cartId as string));

      const alerts = cartItemsWithStock.map(item => {
        const currentStock = item.currentStock || 0;
        const lowThreshold = item.lowStockThreshold || 5;
        const alertLevel = currentStock === 0 ? 'critical' :
                          currentStock <= lowThreshold ? 'warning' :
                          currentStock <= lowThreshold * 2 ? 'info' : 'normal';

        return {
          itemId: item.itemId,
          productId: item.productId,
          productName: item.productName,
          currentStock,
          requestedQuantity: item.quantity,
          lowStockThreshold: lowThreshold,
          alertLevel,
          message: this.getStockAlertMessage(alertLevel, currentStock, item.quantity),
          recommendation: this.getStockRecommendation(alertLevel, currentStock, item.quantity),
          lastUpdated: item.lastStockUpdate
        };
      }).filter(alert => alert.alertLevel !== 'normal'); // Only return items with alerts

      res.json({
        success: true,
        data: {
          cartId,
          alerts,
          summary: {
            totalAlerts: alerts.length,
            criticalAlerts: alerts.filter(a => a.alertLevel === 'critical').length,
            warningAlerts: alerts.filter(a => a.alertLevel === 'warning').length,
            infoAlerts: alerts.filter(a => a.alertLevel === 'info').length
          },
          lastChecked: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting stock alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get stock alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get alternative products for out-of-stock items
   * GET /api/v1/cart/alternatives/:itemId
   */
  async getAlternatives(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      const { includeVendorAlternatives = true } = req.query;

      // Get the cart item details
      const [cartItem] = await db
        .select({
          itemId: cartItems.id,
          productId: cartItems.productId,
          vendorId: cartItems.vendorId,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          productName: products.name,
          categoryId: products.categoryId,
          currentStock: products.stockQuantity,
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

      // Get alternative products
      const alternatives = await this.getAlternativeProducts(
        cartItem.productId, 
        cartItem.vendorId,
        includeVendorAlternatives === 'true'
      );

      res.json({
        success: true,
        data: {
          originalItem: {
            itemId: cartItem.itemId,
            productId: cartItem.productId,
            productName: cartItem.productName,
            currentStock: cartItem.currentStock,
            requestedQuantity: cartItem.quantity,
            unitPrice: cartItem.unitPrice
          },
          alternatives,
          summary: {
            totalAlternatives: alternatives.length,
            sameVendorAlternatives: alternatives.filter(alt => alt.vendorId === cartItem.vendorId).length,
            otherVendorAlternatives: alternatives.filter(alt => alt.vendorId !== cartItem.vendorId).length,
            averagePriceDifference: this.calculateAveragePriceDifference(alternatives, parseFloat(cartItem.unitPrice))
          }
        }
      });
    } catch (error) {
      console.error('Error getting alternatives:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get alternatives',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Replace out-of-stock item with alternative
   * POST /api/v1/cart/replace-item
   */
  async replaceItem(req: Request, res: Response): Promise<void> {
    try {
      const { itemId, alternativeProductId, newQuantity } = req.body;

      if (!itemId || !alternativeProductId) {
        res.status(400).json({
          success: false,
          message: 'Item ID and alternative product ID are required'
        });
        return;
      }

      // Get original cart item
      const [originalItem] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, itemId));

      if (!originalItem) {
        res.status(404).json({
          success: false,
          message: 'Original cart item not found'
        });
        return;
      }

      // Get alternative product details
      const [alternativeProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, alternativeProductId));

      if (!alternativeProduct) {
        res.status(404).json({
          success: false,
          message: 'Alternative product not found'
        });
        return;
      }

      // Check alternative product availability
      const requestedQty = newQuantity || originalItem.quantity;
      if ((alternativeProduct.stockQuantity || 0) < requestedQty) {
        res.status(400).json({
          success: false,
          message: 'Alternative product does not have sufficient stock',
          data: {
            availableStock: alternativeProduct.stockQuantity,
            requestedQuantity: requestedQty
          }
        });
        return;
      }

      // Update cart item with alternative product
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          productId: alternativeProductId,
          vendorId: alternativeProduct.vendorId,
          quantity: requestedQty,
          unitPrice: alternativeProduct.price.toString(),
          totalPrice: (parseFloat(alternativeProduct.price.toString()) * requestedQty).toString(),
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, itemId))
        .returning();

      res.json({
        success: true,
        message: 'Item replaced successfully',
        data: {
          originalProductId: originalItem.productId,
          alternativeProductId,
          updatedItem: {
            itemId: updatedItem.id,
            productId: updatedItem.productId,
            vendorId: updatedItem.vendorId,
            quantity: updatedItem.quantity,
            unitPrice: updatedItem.unitPrice,
            totalPrice: updatedItem.totalPrice
          },
          replacement: {
            originalPrice: originalItem.unitPrice,
            newPrice: alternativeProduct.price.toString(),
            priceDifference: (parseFloat(alternativeProduct.price.toString()) - parseFloat(originalItem.unitPrice)).toFixed(2),
            stockAvailable: alternativeProduct.stockQuantity
          }
        }
      });
    } catch (error) {
      console.error('Error replacing item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to replace item',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Helper method to get alternative products
   */
  private async getAlternativeProducts(productId: string, vendorId: string, includeOtherVendors = true): Promise<any[]> {
    try {
      // Get original product details
      const [originalProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));

      if (!originalProduct) return [];

      // Build query for alternatives
      let alternativesQuery = db
        .select({
          productId: products.id,
          productName: products.name,
          vendorId: products.vendorId,
          vendorName: vendors.businessName,
          price: products.price,
          stockQuantity: products.stockQuantity,
          rating: products.averageRating,
          imageUrl: products.imageUrl,
          description: products.description,
        })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(and(
          eq(products.categoryId, originalProduct.categoryId),
          eq(products.isActive, true),
          gte(products.stockQuantity, 1)
        ))
        .orderBy(desc(products.averageRating), asc(products.price))
        .limit(10);

      const alternatives = await alternativesQuery;

      return alternatives
        .filter(alt => alt.productId !== productId) // Exclude original product
        .filter(alt => includeOtherVendors || alt.vendorId === vendorId) // Filter by vendor if needed
        .map(alt => ({
          ...alt,
          priceDifference: (parseFloat(alt.price.toString()) - parseFloat(originalProduct.price.toString())).toFixed(2),
          percentageDifference: (((parseFloat(alt.price.toString()) - parseFloat(originalProduct.price.toString())) / parseFloat(originalProduct.price.toString())) * 100).toFixed(1) + '%',
          isExpensive: parseFloat(alt.price.toString()) > parseFloat(originalProduct.price.toString()),
          similarityScore: this.calculateSimilarityScore(originalProduct, alt)
        }))
        .sort((a, b) => parseFloat(b.similarityScore) - parseFloat(a.similarityScore));
    } catch (error) {
      console.error('Error getting alternative products:', error);
      return [];
    }
  }

  /**
   * Helper method to release cart reservations
   */
  private releaseCartReservations(cartId: string): number {
    let releasedCount = 0;
    const keysToDelete = [];

    for (const [key, reservation] of this.reservations) {
      if (reservation.cartId === cartId) {
        keysToDelete.push(key);
        releasedCount++;
      }
    }

    keysToDelete.forEach(key => this.reservations.delete(key));
    return releasedCount;
  }

  /**
   * Helper method to get stock alert message
   */
  private getStockAlertMessage(alertLevel: string, currentStock: number, requestedQuantity: number): string {
    switch (alertLevel) {
      case 'critical':
        return 'This item is currently out of stock';
      case 'warning':
        return `Only ${currentStock} items left in stock (you requested ${requestedQuantity})`;
      case 'info':
        return `Limited stock available (${currentStock} items)`;
      default:
        return 'Stock level normal';
    }
  }

  /**
   * Helper method to get stock recommendation
   */
  private getStockRecommendation(alertLevel: string, currentStock: number, requestedQuantity: number): string {
    switch (alertLevel) {
      case 'critical':
        return 'Consider removing this item or finding an alternative';
      case 'warning':
        return currentStock < requestedQuantity ? 
          `Reduce quantity to ${currentStock} or find alternatives` :
          'Consider ordering soon as stock is low';
      case 'info':
        return 'Stock is limited, consider ordering soon';
      default:
        return 'No action needed';
    }
  }

  /**
   * Helper method to calculate average price difference
   */
  private calculateAveragePriceDifference(alternatives: any[], originalPrice: number): string {
    if (alternatives.length === 0) return '0.00';
    
    const totalDifference = alternatives.reduce((sum, alt) => 
      sum + Math.abs(parseFloat(alt.price.toString()) - originalPrice), 0);
    
    return (totalDifference / alternatives.length).toFixed(2);
  }

  /**
   * Helper method to calculate similarity score between products
   */
  private calculateSimilarityScore(original: any, alternative: any): string {
    let score = 0;
    
    // Price similarity (higher score for closer prices)
    const priceDiff = Math.abs(parseFloat(original.price.toString()) - parseFloat(alternative.price.toString()));
    const priceScore = Math.max(0, 100 - (priceDiff / parseFloat(original.price.toString()) * 100));
    score += priceScore * 0.4;
    
    // Rating similarity
    const originalRating = parseFloat(original.averageRating?.toString() || '0');
    const altRating = parseFloat(alternative.rating?.toString() || '0');
    const ratingScore = Math.max(0, 100 - Math.abs(originalRating - altRating) * 20);
    score += ratingScore * 0.3;
    
    // Vendor similarity (same vendor gets bonus)
    const vendorScore = original.vendorId === alternative.vendorId ? 100 : 0;
    score += vendorScore * 0.3;
    
    return (score / 100).toFixed(2);
  }
}