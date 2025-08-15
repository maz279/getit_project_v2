/**
 * Cart Advanced Pricing Controller - Multi-Currency & Dynamic Pricing
 * Handles Amazon.com/Shopee.sg-level advanced pricing calculations
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  carts, 
  cartItems, 
  cartVendorBreakdown, 
  products,
  vendors 
} from '@shared/schema';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';

export class CartAdvancedPricingController {
  /**
   * Multi-currency price calculation
   * GET /api/v1/cart/pricing/:currency
   */
  async calculateCurrencyPricing(req: Request, res: Response): Promise<void> {
    try {
      const { currency } = req.params;
      const { cartId } = req.query;

      if (!cartId) {
        res.status(400).json({
          success: false,
          message: 'Cart ID is required'
        });
        return;
      }

      // Exchange rates (in real implementation, fetch from external API)
      const exchangeRates = {
        'BDT': 1.0,
        'USD': 0.0091,
        'EUR': 0.0083,
        'GBP': 0.0071,
        'INR': 0.76,
        'MYR': 0.041,
        'SGD': 0.012
      };

      const rate = exchangeRates[currency as keyof typeof exchangeRates];
      if (!rate) {
        res.status(400).json({
          success: false,
          message: 'Unsupported currency'
        });
        return;
      }

      // Get cart vendor breakdowns
      const vendorBreakdowns = await db
        .select()
        .from(cartVendorBreakdown)
        .where(eq(cartVendorBreakdown.cartId, cartId as string));

      // Convert all prices to target currency
      const convertedBreakdowns = vendorBreakdowns.map(breakdown => ({
        ...breakdown,
        subtotal: (parseFloat(breakdown.subtotal) * rate).toFixed(2),
        shippingCost: (parseFloat(breakdown.shippingCost || '0') * rate).toFixed(2),
        taxAmount: (parseFloat(breakdown.taxAmount || '0') * rate).toFixed(2),
        discountAmount: (parseFloat(breakdown.discountAmount || '0') * rate).toFixed(2),
        total: (parseFloat(breakdown.total) * rate).toFixed(2),
      }));

      // Calculate totals in target currency
      const totals = convertedBreakdowns.reduce((acc, vendor) => ({
        subtotal: acc.subtotal + parseFloat(vendor.subtotal),
        totalShipping: acc.totalShipping + parseFloat(vendor.shippingCost),
        totalTax: acc.totalTax + parseFloat(vendor.taxAmount),
        totalDiscount: acc.totalDiscount + parseFloat(vendor.discountAmount),
        grandTotal: acc.grandTotal + parseFloat(vendor.total)
      }), {
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
          originalCurrency: 'BDT',
          targetCurrency: currency,
          exchangeRate: rate,
          vendorBreakdowns: convertedBreakdowns,
          totals: {
            subtotal: totals.subtotal.toFixed(2),
            totalShipping: totals.totalShipping.toFixed(2),
            totalTax: totals.totalTax.toFixed(2),
            totalDiscount: totals.totalDiscount.toFixed(2),
            grandTotal: totals.grandTotal.toFixed(2)
          },
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error calculating currency pricing:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate currency pricing',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Dynamic pricing based on user/time/demand
   * POST /api/v1/cart/dynamic-pricing
   */
  async calculateDynamicPricing(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, userId, factors } = req.body;

      if (!cartId) {
        res.status(400).json({
          success: false,
          message: 'Cart ID is required'
        });
        return;
      }

      // Get cart items with product details
      const cartItemsWithProducts = await db
        .select({
          itemId: cartItems.id,
          productId: cartItems.productId,
          vendorId: cartItems.vendorId,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          productName: products.name,
          basePrice: products.price,
          categoryId: products.categoryId,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cartId));

      // Dynamic pricing factors
      const currentHour = new Date().getHours();
      const isWeekend = [0, 6].includes(new Date().getDay());
      const isFestivalSeason = this.isFestivalSeason();
      
      const dynamicAdjustments = cartItemsWithProducts.map(item => {
        let adjustmentFactor = 1.0;
        let adjustmentReasons = [];

        // Time-based pricing
        if (currentHour >= 22 || currentHour <= 6) {
          adjustmentFactor *= 0.95; // 5% discount for late night orders
          adjustmentReasons.push('Late night discount');
        }

        // Weekend pricing
        if (isWeekend) {
          adjustmentFactor *= 1.02; // 2% increase for weekend orders
          adjustmentReasons.push('Weekend pricing');
        }

        // Festival season pricing
        if (isFestivalSeason) {
          adjustmentFactor *= 1.05; // 5% increase during festivals
          adjustmentReasons.push('Festival season pricing');
        }

        // Quantity-based pricing
        if (item.quantity >= 5) {
          adjustmentFactor *= 0.93; // 7% bulk discount
          adjustmentReasons.push('Bulk quantity discount');
        }

        // User loyalty pricing (mock implementation)
        if (userId && factors?.isLoyalCustomer) {
          adjustmentFactor *= 0.95; // 5% loyalty discount
          adjustmentReasons.push('Loyalty customer discount');
        }

        // Demand-based pricing (mock implementation)
        if (factors?.highDemandProduct) {
          adjustmentFactor *= 1.03; // 3% increase for high demand
          adjustmentReasons.push('High demand pricing');
        }

        const originalPrice = parseFloat(item.unitPrice);
        const adjustedPrice = originalPrice * adjustmentFactor;
        const totalPrice = adjustedPrice * item.quantity;

        return {
          itemId: item.itemId,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          originalPrice: originalPrice.toFixed(2),
          adjustedPrice: adjustedPrice.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
          adjustmentFactor: adjustmentFactor.toFixed(3),
          adjustmentReasons,
          savings: originalPrice > adjustedPrice ? 
            ((originalPrice - adjustedPrice) * item.quantity).toFixed(2) : null,
          surcharge: adjustedPrice > originalPrice ? 
            ((adjustedPrice - originalPrice) * item.quantity).toFixed(2) : null,
        };
      });

      // Calculate dynamic totals
      const originalTotal = dynamicAdjustments.reduce((sum, item) => 
        sum + (parseFloat(item.originalPrice) * item.quantity), 0);
      const adjustedTotal = dynamicAdjustments.reduce((sum, item) => 
        sum + parseFloat(item.totalPrice), 0);
      const totalSavings = Math.max(0, originalTotal - adjustedTotal);
      const totalSurcharge = Math.max(0, adjustedTotal - originalTotal);

      res.json({
        success: true,
        data: {
          cartId,
          items: dynamicAdjustments,
          summary: {
            originalTotal: originalTotal.toFixed(2),
            adjustedTotal: adjustedTotal.toFixed(2),
            totalSavings: totalSavings.toFixed(2),
            totalSurcharge: totalSurcharge.toFixed(2),
            effectiveDiscount: totalSavings > 0 ? 
              ((totalSavings / originalTotal) * 100).toFixed(1) + '%' : '0%'
          },
          pricingFactors: {
            timeOfDay: currentHour,
            isWeekend,
            isFestivalSeason,
            isLoyalCustomer: factors?.isLoyalCustomer || false,
            highDemandProducts: factors?.highDemandProduct || false
          },
          validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          currency: 'BDT'
        }
      });
    } catch (error) {
      console.error('Error calculating dynamic pricing:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate dynamic pricing',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Bulk pricing for large quantities
   * POST /api/v1/cart/bulk-pricing
   */
  async calculateBulkPricing(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, bulkThresholds } = req.body;

      if (!cartId) {
        res.status(400).json({
          success: false,
          message: 'Cart ID is required'
        });
        return;
      }

      // Default bulk pricing tiers
      const defaultTiers = bulkThresholds || [
        { minQuantity: 5, discount: 5 },    // 5% off for 5+ items
        { minQuantity: 10, discount: 10 },  // 10% off for 10+ items
        { minQuantity: 20, discount: 15 },  // 15% off for 20+ items
        { minQuantity: 50, discount: 20 },  // 20% off for 50+ items
      ];

      // Get cart items grouped by product
      const cartItemsWithProducts = await db
        .select({
          itemId: cartItems.id,
          productId: cartItems.productId,
          vendorId: cartItems.vendorId,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          productName: products.name,
          categoryId: products.categoryId,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cartId));

      const bulkPricingItems = cartItemsWithProducts.map(item => {
        // Find applicable bulk tier
        const applicableTier = defaultTiers
          .filter(tier => item.quantity >= tier.minQuantity)
          .sort((a, b) => b.discount - a.discount)[0]; // Get highest discount

        const originalPrice = parseFloat(item.unitPrice);
        let bulkPrice = originalPrice;
        let discount = 0;
        let savings = 0;

        if (applicableTier) {
          discount = applicableTier.discount;
          bulkPrice = originalPrice * (1 - discount / 100);
          savings = (originalPrice - bulkPrice) * item.quantity;
        }

        // Calculate next tier benefits
        const nextTier = defaultTiers.find(tier => tier.minQuantity > item.quantity);
        const nextTierInfo = nextTier ? {
          quantityNeeded: nextTier.minQuantity - item.quantity,
          additionalDiscount: nextTier.discount - discount,
          potentialSavings: originalPrice * item.quantity * (nextTier.discount / 100) - savings
        } : null;

        return {
          itemId: item.itemId,
          productId: item.productId,
          productName: item.productName,
          vendorId: item.vendorId,
          quantity: item.quantity,
          originalPrice: originalPrice.toFixed(2),
          bulkPrice: bulkPrice.toFixed(2),
          totalPrice: (bulkPrice * item.quantity).toFixed(2),
          discountPercentage: discount,
          savings: savings.toFixed(2),
          tier: applicableTier || null,
          nextTier: nextTierInfo
        };
      });

      // Calculate bulk pricing summary
      const originalTotal = bulkPricingItems.reduce((sum, item) => 
        sum + (parseFloat(item.originalPrice) * item.quantity), 0);
      const bulkTotal = bulkPricingItems.reduce((sum, item) => 
        sum + parseFloat(item.totalPrice), 0);
      const totalSavings = originalTotal - bulkTotal;

      res.json({
        success: true,
        data: {
          cartId,
          items: bulkPricingItems,
          bulkTiers: defaultTiers,
          summary: {
            originalTotal: originalTotal.toFixed(2),
            bulkTotal: bulkTotal.toFixed(2),
            totalSavings: totalSavings.toFixed(2),
            savingsPercentage: ((totalSavings / originalTotal) * 100).toFixed(1) + '%'
          },
          recommendations: bulkPricingItems
            .filter(item => item.nextTier)
            .map(item => ({
              productName: item.productName,
              addQuantity: item.nextTier?.quantityNeeded,
              additionalSavings: item.nextTier?.potentialSavings
            })),
          currency: 'BDT'
        }
      });
    } catch (error) {
      console.error('Error calculating bulk pricing:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate bulk pricing',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Tax calculation by location/product type
   * GET /api/v1/cart/tax-calculation
   */
  async calculateTaxes(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, deliveryAddress, customerType } = req.query;

      if (!cartId || !deliveryAddress) {
        res.status(400).json({
          success: false,
          message: 'Cart ID and delivery address are required'
        });
        return;
      }

      const address = JSON.parse(deliveryAddress as string);
      
      // Get cart items with product details
      const cartItemsWithProducts = await db
        .select({
          itemId: cartItems.id,
          productId: cartItems.productId,
          vendorId: cartItems.vendorId,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          totalPrice: cartItems.totalPrice,
          productName: products.name,
          categoryId: products.categoryId,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cartId as string));

      // Bangladesh tax rates
      const taxRates = {
        'electronics': 15,     // Standard VAT
        'clothing': 12,        // Reduced VAT
        'books': 0,           // VAT exempt
        'food': 5,            // Essential goods
        'cosmetics': 20,      // Luxury items
        'default': 15         // Standard VAT
      };

      // Calculate taxes for each item
      const taxCalculations = cartItemsWithProducts.map(item => {
        const categoryTaxRate = taxRates[item.categoryId as keyof typeof taxRates] || taxRates.default;
        let applicableTaxRate = categoryTaxRate;

        // Business customers may have different rates
        if (customerType === 'business') {
          applicableTaxRate = Math.max(0, categoryTaxRate - 2); // 2% reduction for business
        }

        // Location-based adjustments
        if (address.district !== 'Dhaka') {
          applicableTaxRate = Math.max(0, applicableTaxRate - 1); // 1% reduction outside Dhaka
        }

        const itemTotal = parseFloat(item.totalPrice || '0');
        const taxAmount = (itemTotal * applicableTaxRate) / 100;

        return {
          itemId: item.itemId,
          productName: item.productName,
          categoryId: item.categoryId,
          itemTotal: itemTotal.toFixed(2),
          taxRate: applicableTaxRate,
          taxAmount: taxAmount.toFixed(2),
          totalWithTax: (itemTotal + taxAmount).toFixed(2)
        };
      });

      // Calculate overall tax summary
      const subtotal = taxCalculations.reduce((sum, item) => sum + parseFloat(item.itemTotal), 0);
      const totalTax = taxCalculations.reduce((sum, item) => sum + parseFloat(item.taxAmount), 0);
      const grandTotal = subtotal + totalTax;

      // Update vendor breakdowns with tax calculations
      const vendorBreakdowns = await db
        .select()
        .from(cartVendorBreakdown)
        .where(eq(cartVendorBreakdown.cartId, cartId as string));

      for (const breakdown of vendorBreakdowns) {
        const vendorTax = taxCalculations
          .filter(item => cartItemsWithProducts.find(ci => 
            ci.itemId === item.itemId && ci.vendorId === breakdown.vendorId))
          .reduce((sum, item) => sum + parseFloat(item.taxAmount), 0);

        const newTotal = parseFloat(breakdown.subtotal) + 
                        parseFloat(breakdown.shippingCost || '0') + 
                        vendorTax - 
                        parseFloat(breakdown.discountAmount || '0');

        await db
          .update(cartVendorBreakdown)
          .set({
            taxAmount: vendorTax.toFixed(2),
            total: newTotal.toFixed(2),
            lastUpdated: new Date()
          })
          .where(and(
            eq(cartVendorBreakdown.cartId, cartId as string),
            eq(cartVendorBreakdown.vendorId, breakdown.vendorId)
          ));
      }

      res.json({
        success: true,
        data: {
          cartId,
          deliveryAddress: address,
          customerType: customerType || 'individual',
          items: taxCalculations,
          summary: {
            subtotal: subtotal.toFixed(2),
            totalTax: totalTax.toFixed(2),
            grandTotal: grandTotal.toFixed(2),
            averageTaxRate: ((totalTax / subtotal) * 100).toFixed(1) + '%'
          },
          taxBreakdown: {
            standardVAT: totalTax.toFixed(2),
            locationDiscount: address.district !== 'Dhaka' ? 'Applied' : 'Not applicable',
            businessDiscount: customerType === 'business' ? 'Applied' : 'Not applicable'
          },
          currency: 'BDT'
        }
      });
    } catch (error) {
      console.error('Error calculating taxes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate taxes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate payment methods for cart
   * POST /api/v1/cart/validate-payment
   */
  async validatePaymentMethods(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, paymentMethod, customerInfo } = req.body;

      if (!cartId || !paymentMethod) {
        res.status(400).json({
          success: false,
          message: 'Cart ID and payment method are required'
        });
        return;
      }

      // Get cart total
      const vendorBreakdowns = await db
        .select()
        .from(cartVendorBreakdown)
        .where(eq(cartVendorBreakdown.cartId, cartId));

      const cartTotal = vendorBreakdowns.reduce((sum, v) => sum + parseFloat(v.total), 0);

      // Payment method validation rules
      const paymentValidation = {
        'bkash': {
          minAmount: 10,
          maxAmount: 25000,
          requiresVerification: true,
          processingFee: cartTotal > 1000 ? 0 : 15,
          supportsCOD: false,
          estimatedProcessingTime: '5-10 minutes'
        },
        'nagad': {
          minAmount: 10,
          maxAmount: 20000,
          requiresVerification: true,
          processingFee: cartTotal > 500 ? 0 : 10,
          supportsCOD: false,
          estimatedProcessingTime: '5-10 minutes'
        },
        'rocket': {
          minAmount: 10,
          maxAmount: 15000,
          requiresVerification: true,
          processingFee: cartTotal > 800 ? 0 : 12,
          supportsCOD: false,
          estimatedProcessingTime: '5-15 minutes'
        },
        'card': {
          minAmount: 50,
          maxAmount: 100000,
          requiresVerification: false,
          processingFee: 0,
          supportsCOD: false,
          estimatedProcessingTime: '2-5 minutes'
        },
        'cod': {
          minAmount: 100,
          maxAmount: 5000,
          requiresVerification: false,
          processingFee: 30, // COD handling charge
          supportsCOD: true,
          estimatedProcessingTime: 'On delivery'
        }
      };

      const methodConfig = paymentValidation[paymentMethod as keyof typeof paymentValidation];
      if (!methodConfig) {
        res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
        return;
      }

      // Validate amount limits
      const validationResults = {
        isValid: true,
        errors: [] as string[],
        warnings: [] as string[],
        requirements: [] as string[]
      };

      if (cartTotal < methodConfig.minAmount) {
        validationResults.isValid = false;
        validationResults.errors.push(`Minimum amount ৳${methodConfig.minAmount} required for ${paymentMethod}`);
      }

      if (cartTotal > methodConfig.maxAmount) {
        validationResults.isValid = false;
        validationResults.errors.push(`Maximum amount ৳${methodConfig.maxAmount} exceeded for ${paymentMethod}`);
      }

      // Check verification requirements
      if (methodConfig.requiresVerification && !customerInfo?.phoneVerified) {
        validationResults.requirements.push('Phone number verification required');
      }

      // COD availability check (mock implementation)
      if (paymentMethod === 'cod') {
        const codAvailable = await this.checkCODAvailability(cartId, customerInfo?.deliveryAddress);
        if (!codAvailable) {
          validationResults.isValid = false;
          validationResults.errors.push('Cash on Delivery not available for your location');
        }
      }

      // Processing fee calculation
      const processingFee = methodConfig.processingFee;
      const finalAmount = cartTotal + processingFee;

      res.json({
        success: true,
        data: {
          cartId,
          paymentMethod,
          validation: validationResults,
          paymentDetails: {
            cartTotal: cartTotal.toFixed(2),
            processingFee: processingFee.toFixed(2),
            finalAmount: finalAmount.toFixed(2),
            estimatedProcessingTime: methodConfig.estimatedProcessingTime
          },
          alternativePaymentMethods: validationResults.isValid ? [] : 
            Object.keys(paymentValidation).filter(method => 
              method !== paymentMethod &&
              cartTotal >= paymentValidation[method as keyof typeof paymentValidation].minAmount &&
              cartTotal <= paymentValidation[method as keyof typeof paymentValidation].maxAmount
            ),
          currency: 'BDT'
        }
      });
    } catch (error) {
      console.error('Error validating payment method:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate payment method',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Helper method to check if it's festival season
   */
  private isFestivalSeason(): boolean {
    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Eid seasons (approximate - varies yearly)
    if (month >= 4 && month <= 6) return true; // Eid ul-Fitr season
    if (month >= 8 && month <= 10) return true; // Eid ul-Adha season
    
    // Pohela Boishakh (April)
    if (month === 4) return true;
    
    // Victory Day (December)
    if (month === 12) return true;
    
    return false;
  }

  /**
   * Helper method to check COD availability
   */
  private async checkCODAvailability(cartId: string, deliveryAddress: any): Promise<boolean> {
    // Mock implementation - in reality, check with courier partners
    if (!deliveryAddress) return false;
    
    const address = typeof deliveryAddress === 'string' ? 
      JSON.parse(deliveryAddress) : deliveryAddress;
    
    // COD available in major cities
    const codAvailableCities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal'];
    return codAvailableCities.includes(address.district);
  }
}