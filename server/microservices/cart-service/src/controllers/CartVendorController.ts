/**
 * Cart Vendor Controller - Multi-Vendor Cart Coordination
 * Handles Amazon.com/Shopee.sg-level multi-vendor cart management
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  carts, 
  cartItems, 
  cartVendorBreakdown, 
  vendors, 
  products 
} from '@shared/schema';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';

export class CartVendorController {
  /**
   * Get vendor-specific cart section
   * GET /api/v1/cart/vendors/:vendorId
   */
  async getVendorCart(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { cartId } = req.query;

      if (!cartId || !vendorId) {
        res.status(400).json({
          success: false,
          message: 'Cart ID and Vendor ID are required'
        });
        return;
      }

      // Get vendor cart breakdown
      const [vendorBreakdown] = await db
        .select()
        .from(cartVendorBreakdown)
        .where(and(
          eq(cartVendorBreakdown.cartId, cartId as string),
          eq(cartVendorBreakdown.vendorId, vendorId)
        ));

      // Get vendor-specific cart items
      const vendorItems = await db
        .select({
          id: cartItems.id,
          productId: cartItems.productId,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          totalPrice: cartItems.totalPrice,
          productName: products.name,
          productImage: products.imageUrl,
          vendorName: vendors.businessName,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(vendors, eq(cartItems.vendorId, vendors.id))
        .where(and(
          eq(cartItems.cartId, cartId as string),
          eq(cartItems.vendorId, vendorId)
        ));

      res.json({
        success: true,
        data: {
          vendorId,
          breakdown: vendorBreakdown,
          items: vendorItems,
          summary: {
            itemCount: vendorBreakdown?.itemCount || 0,
            subtotal: vendorBreakdown?.subtotal || '0.00',
            shippingCost: vendorBreakdown?.shippingCost || '0.00',
            taxAmount: vendorBreakdown?.taxAmount || '0.00',
            discountAmount: vendorBreakdown?.discountAmount || '0.00',
            total: vendorBreakdown?.total || '0.00'
          }
        }
      });
    } catch (error) {
      console.error('Error fetching vendor cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vendor cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get comprehensive cart summary with vendor breakdown
   * GET /api/v1/cart/summary
   */
  async getCartSummary(req: Request, res: Response): Promise<void> {
    try {
      const { cartId } = req.query;

      if (!cartId) {
        res.status(400).json({
          success: false,
          message: 'Cart ID is required'
        });
        return;
      }

      // Get all vendor breakdowns for the cart
      const vendorBreakdowns = await db
        .select({
          vendorId: cartVendorBreakdown.vendorId,
          vendorName: vendors.businessName,
          itemCount: cartVendorBreakdown.itemCount,
          subtotal: cartVendorBreakdown.subtotal,
          shippingCost: cartVendorBreakdown.shippingCost,
          taxAmount: cartVendorBreakdown.taxAmount,
          discountAmount: cartVendorBreakdown.discountAmount,
          total: cartVendorBreakdown.total,
          estimatedDelivery: cartVendorBreakdown.estimatedDelivery,
          shippingOptions: cartVendorBreakdown.shippingOptions,
        })
        .from(cartVendorBreakdown)
        .leftJoin(vendors, eq(cartVendorBreakdown.vendorId, vendors.id))
        .where(eq(cartVendorBreakdown.cartId, cartId as string));

      // Calculate cart totals
      const totals = vendorBreakdowns.reduce((acc, vendor) => ({
        totalItems: acc.totalItems + (vendor.itemCount || 0),
        subtotal: acc.subtotal + parseFloat(vendor.subtotal || '0'),
        totalShipping: acc.totalShipping + parseFloat(vendor.shippingCost || '0'),
        totalTax: acc.totalTax + parseFloat(vendor.taxAmount || '0'),
        totalDiscount: acc.totalDiscount + parseFloat(vendor.discountAmount || '0'),
        grandTotal: acc.grandTotal + parseFloat(vendor.total || '0')
      }), {
        totalItems: 0,
        subtotal: 0,
        totalShipping: 0,
        totalTax: 0,
        totalDiscount: 0,
        grandTotal: 0
      });

      res.json({
        success: true,
        data: {
          cartId,
          vendors: vendorBreakdowns,
          totals: {
            totalItems: totals.totalItems,
            subtotal: totals.subtotal.toFixed(2),
            totalShipping: totals.totalShipping.toFixed(2),
            totalTax: totals.totalTax.toFixed(2),
            totalDiscount: totals.totalDiscount.toFixed(2),
            grandTotal: totals.grandTotal.toFixed(2)
          },
          vendorCount: vendorBreakdowns.length,
          eligibleForFreeShipping: totals.subtotal >= 2000, // 2000 BDT threshold
          currency: 'BDT'
        }
      });
    } catch (error) {
      console.error('Error fetching cart summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cart summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Calculate vendor-specific shipping options
   * GET /api/v1/cart/vendors/:vendorId/shipping
   */
  async calculateVendorShipping(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { cartId, deliveryAddress } = req.query;

      if (!cartId || !vendorId || !deliveryAddress) {
        res.status(400).json({
          success: false,
          message: 'Cart ID, Vendor ID, and delivery address are required'
        });
        return;
      }

      // Get vendor information
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      if (!vendor) {
        res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
        return;
      }

      // Get vendor cart breakdown
      const [vendorBreakdown] = await db
        .select()
        .from(cartVendorBreakdown)
        .where(and(
          eq(cartVendorBreakdown.cartId, cartId as string),
          eq(cartVendorBreakdown.vendorId, vendorId)
        ));

      if (!vendorBreakdown) {
        res.status(404).json({
          success: false,
          message: 'No items from this vendor in cart'
        });
        return;
      }

      // Calculate shipping options based on Bangladesh districts
      const address = JSON.parse(deliveryAddress as string);
      const subtotal = parseFloat(vendorBreakdown.subtotal);
      
      const shippingOptions = [
        {
          id: 'standard',
          name: 'Standard Delivery',
          estimatedDays: '3-5 business days',
          cost: subtotal >= 1500 ? 0 : 60, // Free shipping over 1500 BDT
          provider: 'Pathao',
          description: 'Regular delivery within Dhaka'
        },
        {
          id: 'express',
          name: 'Express Delivery',
          estimatedDays: '1-2 business days',
          cost: subtotal >= 2500 ? 80 : 120, // Discounted express over 2500 BDT
          provider: 'Pathao Express',
          description: 'Priority delivery within Dhaka'
        },
        {
          id: 'same-day',
          name: 'Same Day Delivery',
          estimatedDays: 'Same day',
          cost: 200,
          provider: 'Paperfly',
          description: 'Same day delivery (order before 2 PM)',
          available: address.district === 'Dhaka'
        }
      ].filter(option => address.district !== 'Dhaka' ? option.id !== 'same-day' : true);

      // Update vendor breakdown with shipping options
      await db
        .update(cartVendorBreakdown)
        .set({
          shippingOptions: JSON.stringify(shippingOptions),
          lastUpdated: new Date()
        })
        .where(and(
          eq(cartVendorBreakdown.cartId, cartId as string),
          eq(cartVendorBreakdown.vendorId, vendorId)
        ));

      res.json({
        success: true,
        data: {
          vendorId,
          vendorName: vendor.businessName,
          shippingOptions,
          deliveryAddress: address,
          subtotal: subtotal.toFixed(2),
          currency: 'BDT'
        }
      });
    } catch (error) {
      console.error('Error calculating vendor shipping:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate vendor shipping',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Apply vendor-specific promotions
   * POST /api/v1/cart/vendors/:vendorId/promotions
   */
  async applyVendorPromotions(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { cartId, promotionCode } = req.body;

      if (!cartId || !vendorId || !promotionCode) {
        res.status(400).json({
          success: false,
          message: 'Cart ID, Vendor ID, and promotion code are required'
        });
        return;
      }

      // Get vendor breakdown
      const [vendorBreakdown] = await db
        .select()
        .from(cartVendorBreakdown)
        .where(and(
          eq(cartVendorBreakdown.cartId, cartId),
          eq(cartVendorBreakdown.vendorId, vendorId)
        ));

      if (!vendorBreakdown) {
        res.status(404).json({
          success: false,
          message: 'No items from this vendor in cart'
        });
        return;
      }

      // Mock promotion validation (in real implementation, check against promotions table)
      const promotions = {
        'VENDOR10': { type: 'percentage', value: 10, minAmount: 500 },
        'NEWUSER': { type: 'fixed', value: 100, minAmount: 1000 },
        'BULK50': { type: 'percentage', value: 15, minAmount: 2000 }
      };

      const promotion = promotions[promotionCode as keyof typeof promotions];
      if (!promotion) {
        res.status(400).json({
          success: false,
          message: 'Invalid promotion code'
        });
        return;
      }

      const subtotal = parseFloat(vendorBreakdown.subtotal);
      if (subtotal < promotion.minAmount) {
        res.status(400).json({
          success: false,
          message: `Minimum order amount ৳${promotion.minAmount} required for this promotion`
        });
        return;
      }

      // Calculate discount
      const discountAmount = promotion.type === 'percentage' 
        ? (subtotal * promotion.value) / 100
        : promotion.value;

      const maxDiscount = subtotal * 0.5; // Maximum 50% discount
      const finalDiscount = Math.min(discountAmount, maxDiscount);
      const newTotal = subtotal + parseFloat(vendorBreakdown.shippingCost || '0') + 
                      parseFloat(vendorBreakdown.taxAmount || '0') - finalDiscount;

      // Update vendor breakdown
      await db
        .update(cartVendorBreakdown)
        .set({
          discountAmount: finalDiscount.toFixed(2),
          total: newTotal.toFixed(2),
          vendorPromotions: JSON.stringify([{
            code: promotionCode,
            type: promotion.type,
            value: promotion.value,
            discountAmount: finalDiscount,
            appliedAt: new Date().toISOString()
          }]),
          lastUpdated: new Date()
        })
        .where(and(
          eq(cartVendorBreakdown.cartId, cartId),
          eq(cartVendorBreakdown.vendorId, vendorId)
        ));

      res.json({
        success: true,
        message: 'Promotion applied successfully',
        data: {
          promotionCode,
          discountAmount: finalDiscount.toFixed(2),
          newTotal: newTotal.toFixed(2),
          savings: finalDiscount.toFixed(2)
        }
      });
    } catch (error) {
      console.error('Error applying vendor promotion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply promotion',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Prepare split checkout for multi-vendor orders
   * POST /api/v1/cart/split-checkout
   */
  async splitCheckout(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, paymentMethod, deliveryAddress } = req.body;

      if (!cartId || !paymentMethod || !deliveryAddress) {
        res.status(400).json({
          success: false,
          message: 'Cart ID, payment method, and delivery address are required'
        });
        return;
      }

      // Get all vendor breakdowns
      const vendorBreakdowns = await db
        .select({
          vendorId: cartVendorBreakdown.vendorId,
          vendorName: vendors.businessName,
          vendorEmail: vendors.email,
          itemCount: cartVendorBreakdown.itemCount,
          subtotal: cartVendorBreakdown.subtotal,
          shippingCost: cartVendorBreakdown.shippingCost,
          taxAmount: cartVendorBreakdown.taxAmount,
          discountAmount: cartVendorBreakdown.discountAmount,
          total: cartVendorBreakdown.total,
          shippingOptions: cartVendorBreakdown.shippingOptions,
          vendorPromotions: cartVendorBreakdown.vendorPromotions,
        })
        .from(cartVendorBreakdown)
        .leftJoin(vendors, eq(cartVendorBreakdown.vendorId, vendors.id))
        .where(eq(cartVendorBreakdown.cartId, cartId));

      if (vendorBreakdowns.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No vendors found for this cart'
        });
        return;
      }

      // Create checkout preparation for each vendor
      const vendorCheckouts = vendorBreakdowns.map(vendor => ({
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        orderTotal: vendor.total,
        itemCount: vendor.itemCount,
        paymentMethod,
        deliveryAddress,
        shippingOption: vendor.shippingOptions ? JSON.parse(vendor.shippingOptions as string)[0] : null,
        promotions: vendor.vendorPromotions ? JSON.parse(vendor.vendorPromotions as string) : [],
        estimatedProcessingTime: '1-2 business days',
        requiresVendorConfirmation: parseFloat(vendor.total) > 5000 // Orders over 5000 BDT need confirmation
      }));

      // Calculate overall checkout summary
      const checkoutSummary = {
        totalVendors: vendorBreakdowns.length,
        totalAmount: vendorBreakdowns.reduce((sum, v) => sum + parseFloat(v.total), 0).toFixed(2),
        totalItems: vendorBreakdowns.reduce((sum, v) => sum + v.itemCount, 0),
        estimatedDelivery: '3-7 business days',
        paymentMethod,
        currency: 'BDT'
      };

      res.json({
        success: true,
        message: 'Split checkout prepared successfully',
        data: {
          checkoutId: `checkout_${Date.now()}`,
          cartId,
          vendorCheckouts,
          summary: checkoutSummary,
          nextStep: 'Proceed to payment for each vendor order'
        }
      });
    } catch (error) {
      console.error('Error preparing split checkout:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to prepare split checkout',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get available shipping options for cart
   * GET /api/v1/cart/shipping-options
   */
  async getShippingOptions(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, deliveryAddress } = req.query;

      if (!cartId || !deliveryAddress) {
        res.status(400).json({
          success: false,
          message: 'Cart ID and delivery address are required'
        });
        return;
      }

      const address = JSON.parse(deliveryAddress as string);
      
      // Get all vendor breakdowns to calculate consolidated shipping
      const vendorBreakdowns = await db
        .select()
        .from(cartVendorBreakdown)
        .where(eq(cartVendorBreakdown.cartId, cartId as string));

      const totalSubtotal = vendorBreakdowns.reduce((sum, v) => sum + parseFloat(v.subtotal), 0);

      // Calculate consolidated shipping options
      const shippingOptions = [
        {
          id: 'consolidated-standard',
          name: 'Consolidated Standard Delivery',
          description: 'All items delivered together when ready',
          estimatedDays: '5-7 business days',
          cost: totalSubtotal >= 2000 ? 0 : 80,
          provider: 'Multiple Couriers',
          savings: vendorBreakdowns.length > 1 ? 'Save on shipping by consolidating orders' : null
        },
        {
          id: 'individual-express',
          name: 'Individual Express Delivery',
          description: 'Each vendor ships separately for faster delivery',
          estimatedDays: '2-3 business days',
          cost: vendorBreakdowns.length * 120,
          provider: 'Multiple Couriers',
          note: 'Items may arrive at different times'
        }
      ];

      // Add same-day option for Dhaka
      if (address.district === 'Dhaka' && totalSubtotal >= 1000) {
        shippingOptions.push({
          id: 'same-day-available',
          name: 'Same Day Delivery (Available Items)',
          description: 'Items in stock delivered same day, others follow regular schedule',
          estimatedDays: 'Same day + 3-5 days',
          cost: 250,
          provider: 'Paperfly + Others',
          note: 'Order before 2 PM for same day delivery'
        });
      }

      res.json({
        success: true,
        data: {
          cartId,
          deliveryAddress: address,
          shippingOptions,
          vendorCount: vendorBreakdowns.length,
          totalSubtotal: totalSubtotal.toFixed(2),
          currency: 'BDT'
        }
      });
    } catch (error) {
      console.error('Error fetching shipping options:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shipping options',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}