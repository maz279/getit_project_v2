/**
 * Order Calculation Service - Amazon.com/Shopee.sg-Level Dynamic Pricing Engine
 * Handles complex pricing calculations with real-time updates
 */

import { db } from '../../../db';
import { products, vendors, coupons, shippingZones } from '@shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { RedisService } from '../../../services/RedisService';
import { LoggingService } from '../../../services/LoggingService';

export interface OrderCalculationInput {
  items: OrderItemInput[];
  userId?: number;
  shippingAddress: ShippingAddress;
  couponCode?: string;
  loyaltyPoints?: number;
  membershipTier?: string;
  paymentMethod?: string;
}

export interface OrderItemInput {
  productId: string;
  vendorId: string;
  quantity: number;
  selectedVariants?: any;
}

export interface ShippingAddress {
  region: string;
  district: string;
  upazila: string;
  postalCode: string;
  fullAddress: string;
}

export interface OrderCalculationResult {
  itemCalculations: ItemCalculation[];
  subtotal: number;
  discounts: DiscountCalculation[];
  totalDiscount: number;
  shipping: ShippingCalculation;
  taxes: TaxCalculation;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  paymentMethodDiscount: number;
  membershipDiscount: number;
  total: number;
  currency: string;
  breakdown: CalculationBreakdown;
}

export interface ItemCalculation {
  productId: string;
  vendorId: string;
  productName: string;
  basePrice: number;
  salePrice: number;
  quantity: number;
  itemTotal: number;
  appliedDiscounts: string[];
  weight: number;
  dimensions: any;
  category: string;
}

export interface DiscountCalculation {
  type: 'coupon' | 'bulk' | 'membership' | 'loyalty' | 'payment' | 'vendor' | 'seasonal';
  code?: string;
  name: string;
  amount: number;
  percentage?: number;
  applicableItems: string[];
  maxDiscount?: number;
}

export interface ShippingCalculation {
  baseShipping: number;
  weightCharge: number;
  distanceCharge: number;
  expressCharge: number;
  packagingCharge: number;
  insuranceCharge: number;
  vendorShippingFees: VendorShipping[];
  consolidationDiscount: number;
  freeShippingThreshold: number;
  total: number;
  estimatedDelivery: Date;
}

export interface VendorShipping {
  vendorId: string;
  vendorName: string;
  shippingCost: number;
  estimatedDays: number;
}

export interface TaxCalculation {
  vat: number;
  vatRate: number;
  supplementaryDuty: number;
  supplementaryDutyRate: number;
  serviceTax: number;
  serviceTaxRate: number;
  total: number;
}

export interface CalculationBreakdown {
  itemsSubtotal: number;
  vendorBreakdown: VendorBreakdown[];
  discountBreakdown: DiscountBreakdown;
  shippingBreakdown: ShippingBreakdown;
  taxBreakdown: TaxBreakdown;
  finalTotal: number;
}

export interface VendorBreakdown {
  vendorId: string;
  vendorName: string;
  itemsTotal: number;
  commission: number;
  vendorPayout: number;
  shippingCost: number;
}

export interface DiscountBreakdown {
  couponDiscount: number;
  membershipDiscount: number;
  loyaltyDiscount: number;
  paymentDiscount: number;
  bulkDiscount: number;
  vendorDiscount: number;
  totalDiscount: number;
}

export interface ShippingBreakdown {
  baseShipping: number;
  weightCharge: number;
  distanceCharge: number;
  vendorShipping: number;
  consolidationDiscount: number;
  finalShipping: number;
}

export interface TaxBreakdown {
  vat: number;
  supplementaryDuty: number;
  serviceTax: number;
  totalTax: number;
}

export class OrderCalculationService {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Calculate comprehensive order totals
   */
  async calculateOrder(input: OrderCalculationInput): Promise<OrderCalculationResult> {
    try {
      this.loggingService.info('Starting order calculation', { itemCount: input.items.length });

      // Get product and pricing information
      const itemCalculations = await this.calculateItems(input.items);
      
      // Calculate subtotal
      const subtotal = itemCalculations.reduce((sum, item) => sum + item.itemTotal, 0);

      // Apply discounts
      const discounts = await this.calculateDiscounts(input, itemCalculations, subtotal);
      const totalDiscount = discounts.reduce((sum, discount) => sum + discount.amount, 0);

      // Calculate shipping
      const shipping = await this.calculateShipping(input, itemCalculations);

      // Calculate taxes
      const taxes = await this.calculateTaxes(subtotal - totalDiscount, shipping.total);

      // Calculate loyalty points
      const loyaltyCalculation = await this.calculateLoyaltyPoints(input, subtotal);

      // Apply payment method discount
      const paymentMethodDiscount = await this.calculatePaymentMethodDiscount(input.paymentMethod, subtotal);

      // Apply membership discount
      const membershipDiscount = await this.calculateMembershipDiscount(input.membershipTier, subtotal);

      // Calculate final total
      const total = subtotal - totalDiscount - loyaltyCalculation.pointsUsed - 
                   paymentMethodDiscount - membershipDiscount + shipping.total + taxes.total;

      // Create detailed breakdown
      const breakdown = await this.createCalculationBreakdown(
        itemCalculations, discounts, shipping, taxes, input
      );

      const result: OrderCalculationResult = {
        itemCalculations,
        subtotal,
        discounts,
        totalDiscount,
        shipping,
        taxes,
        loyaltyPointsUsed: loyaltyCalculation.pointsUsed,
        loyaltyPointsEarned: loyaltyCalculation.pointsEarned,
        paymentMethodDiscount,
        membershipDiscount,
        total: Math.max(0, total), // Ensure total is never negative
        currency: 'BDT',
        breakdown
      };

      // Cache calculation for potential reuse
      await this.cacheCalculation(input, result);

      return result;
    } catch (error) {
      this.loggingService.error('Order calculation failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Calculate individual item prices
   */
  private async calculateItems(items: OrderItemInput[]): Promise<ItemCalculation[]> {
    const calculations: ItemCalculation[] = [];

    for (const item of items) {
      // Get product information
      const [product] = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          salePrice: products.salePrice,
          weight: products.weight,
          dimensions: products.dimensions,
          category: products.category
        })
        .from(products)
        .where(eq(products.id, item.productId));

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Calculate pricing
      const basePrice = parseFloat(product.price);
      const salePrice = product.salePrice ? parseFloat(product.salePrice) : basePrice;
      const effectivePrice = Math.min(basePrice, salePrice);
      const itemTotal = effectivePrice * item.quantity;

      // Apply item-level discounts
      const appliedDiscounts = await this.getItemDiscounts(item);

      calculations.push({
        productId: item.productId,
        vendorId: item.vendorId,
        productName: product.name,
        basePrice,
        salePrice: effectivePrice,
        quantity: item.quantity,
        itemTotal,
        appliedDiscounts,
        weight: product.weight || 0,
        dimensions: product.dimensions || {},
        category: product.category || 'general'
      });
    }

    return calculations;
  }

  /**
   * Get item-specific discounts
   */
  private async getItemDiscounts(item: OrderItemInput): Promise<string[]> {
    const discounts: string[] = [];
    
    // Check for bulk discounts
    if (item.quantity >= 5) {
      discounts.push('bulk-discount');
    }

    // Check for category-specific discounts
    // This would involve checking current promotions
    
    return discounts;
  }

  /**
   * Calculate all applicable discounts
   */
  private async calculateDiscounts(
    input: OrderCalculationInput, 
    items: ItemCalculation[], 
    subtotal: number
  ): Promise<DiscountCalculation[]> {
    const discounts: DiscountCalculation[] = [];

    // Coupon discount
    if (input.couponCode) {
      const couponDiscount = await this.calculateCouponDiscount(input.couponCode, items, subtotal);
      if (couponDiscount) {
        discounts.push(couponDiscount);
      }
    }

    // Bulk order discount
    const bulkDiscount = await this.calculateBulkDiscount(items);
    if (bulkDiscount.amount > 0) {
      discounts.push(bulkDiscount);
    }

    // Vendor-specific discounts
    const vendorDiscounts = await this.calculateVendorDiscounts(items);
    discounts.push(...vendorDiscounts);

    // Seasonal discounts
    const seasonalDiscount = await this.calculateSeasonalDiscount(items, subtotal);
    if (seasonalDiscount.amount > 0) {
      discounts.push(seasonalDiscount);
    }

    return discounts;
  }

  /**
   * Calculate coupon discount
   */
  private async calculateCouponDiscount(
    couponCode: string, 
    items: ItemCalculation[], 
    subtotal: number
  ): Promise<DiscountCalculation | null> {
    try {
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(and(
          eq(coupons.code, couponCode),
          eq(coupons.isActive, true),
          gte(coupons.expiresAt, new Date())
        ));

      if (!coupon) return null;

      // Check minimum order amount
      if (coupon.minimumAmount && subtotal < parseFloat(coupon.minimumAmount)) {
        return null;
      }

      let discountAmount = 0;
      const applicableItems: string[] = [];

      if (coupon.discountType === 'percentage') {
        discountAmount = subtotal * (parseFloat(coupon.discountValue) / 100);
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscountAmount));
        }
        applicableItems.push(...items.map(item => item.productId));
      } else if (coupon.discountType === 'fixed') {
        discountAmount = parseFloat(coupon.discountValue);
        applicableItems.push(...items.map(item => item.productId));
      }

      return {
        type: 'coupon',
        code: couponCode,
        name: coupon.name,
        amount: discountAmount,
        percentage: coupon.discountType === 'percentage' ? parseFloat(coupon.discountValue) : undefined,
        applicableItems,
        maxDiscount: coupon.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount) : undefined
      };
    } catch (error) {
      this.loggingService.error('Coupon calculation failed', { error: (error as Error).message });
      return null;
    }
  }

  /**
   * Calculate bulk discount
   */
  private async calculateBulkDiscount(items: ItemCalculation[]): Promise<DiscountCalculation> {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    let discountPercentage = 0;

    if (totalQuantity >= 20) {
      discountPercentage = 15;
    } else if (totalQuantity >= 10) {
      discountPercentage = 10;
    } else if (totalQuantity >= 5) {
      discountPercentage = 5;
    }

    const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
    const discountAmount = subtotal * (discountPercentage / 100);

    return {
      type: 'bulk',
      name: `Bulk Order Discount (${totalQuantity} items)`,
      amount: discountAmount,
      percentage: discountPercentage,
      applicableItems: items.map(item => item.productId)
    };
  }

  /**
   * Calculate vendor-specific discounts
   */
  private async calculateVendorDiscounts(items: ItemCalculation[]): Promise<DiscountCalculation[]> {
    const discounts: DiscountCalculation[] = [];
    const vendorGroups = new Map<string, ItemCalculation[]>();

    // Group items by vendor
    items.forEach(item => {
      if (!vendorGroups.has(item.vendorId)) {
        vendorGroups.set(item.vendorId, []);
      }
      vendorGroups.get(item.vendorId)!.push(item);
    });

    // Calculate vendor-specific discounts
    for (const [vendorId, vendorItems] of vendorGroups) {
      const vendorSubtotal = vendorItems.reduce((sum, item) => sum + item.itemTotal, 0);
      
      // Example: 5% discount for orders above 2000 BDT from same vendor
      if (vendorSubtotal >= 2000) {
        const discountAmount = vendorSubtotal * 0.05;
        discounts.push({
          type: 'vendor',
          name: 'Same Vendor Discount',
          amount: discountAmount,
          percentage: 5,
          applicableItems: vendorItems.map(item => item.productId)
        });
      }
    }

    return discounts;
  }

  /**
   * Calculate seasonal discount
   */
  private async calculateSeasonalDiscount(items: ItemCalculation[], subtotal: number): Promise<DiscountCalculation> {
    // Implement seasonal discount logic based on current date/events
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    
    let discountPercentage = 0;
    let seasonalName = '';

    // Example seasonal discounts
    if (month === 12) { // December - Winter Sale
      discountPercentage = 10;
      seasonalName = 'Winter Sale';
    } else if (month === 4) { // April - Pohela Boishakh
      discountPercentage = 15;
      seasonalName = 'Pohela Boishakh Special';
    } else if (month === 8) { // August - Eid Sale
      discountPercentage = 12;
      seasonalName = 'Eid Special Discount';
    }

    const discountAmount = subtotal * (discountPercentage / 100);

    return {
      type: 'seasonal',
      name: seasonalName || 'Seasonal Discount',
      amount: discountAmount,
      percentage: discountPercentage,
      applicableItems: items.map(item => item.productId)
    };
  }

  /**
   * Calculate shipping costs
   */
  private async calculateShipping(
    input: OrderCalculationInput, 
    items: ItemCalculation[]
  ): Promise<ShippingCalculation> {
    const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
    
    // Base shipping calculation
    const baseShipping = 60; // Base shipping in BDT
    const weightCharge = totalWeight * 15; // 15 BDT per kg
    const distanceCharge = await this.calculateDistanceCharge(input.shippingAddress);
    
    // Packaging and insurance
    const packagingCharge = Math.ceil(items.length / 5) * 20; // 20 BDT per package
    const insuranceCharge = subtotal > 5000 ? subtotal * 0.005 : 0; // 0.5% insurance for orders > 5000 BDT

    // Express charges (if selected)
    const expressCharge = 0; // Would be set based on delivery options

    // Vendor-specific shipping
    const vendorShippingFees = await this.calculateVendorShipping(items);
    const vendorShippingTotal = vendorShippingFees.reduce((sum, vendor) => sum + vendor.shippingCost, 0);

    // Consolidation discount for multiple vendors
    const consolidationDiscount = vendorShippingFees.length > 1 ? vendorShippingTotal * 0.15 : 0;

    // Free shipping threshold
    const freeShippingThreshold = 1500; // 1500 BDT free shipping
    const shippingTotal = subtotal >= freeShippingThreshold ? 0 : 
      baseShipping + weightCharge + distanceCharge + packagingCharge + 
      insuranceCharge + expressCharge + vendorShippingTotal - consolidationDiscount;

    return {
      baseShipping,
      weightCharge,
      distanceCharge,
      expressCharge,
      packagingCharge,
      insuranceCharge,
      vendorShippingFees,
      consolidationDiscount,
      freeShippingThreshold,
      total: Math.max(0, shippingTotal),
      estimatedDelivery: this.calculateEstimatedDelivery(input.shippingAddress)
    };
  }

  /**
   * Calculate distance-based shipping charge
   */
  private async calculateDistanceCharge(address: ShippingAddress): Promise<number> {
    // Implement distance calculation based on shipping zones
    const distanceMultipliers: { [key: string]: number } = {
      'Dhaka': 1.0,
      'Chittagong': 1.5,
      'Sylhet': 1.8,
      'Rajshahi': 1.6,
      'Khulna': 1.4,
      'Barisal': 1.7,
      'Rangpur': 1.9,
      'Mymensingh': 1.3
    };

    const multiplier = distanceMultipliers[address.region] || 2.0;
    return 40 * multiplier; // Base distance charge 40 BDT
  }

  /**
   * Calculate vendor-specific shipping fees
   */
  private async calculateVendorShipping(items: ItemCalculation[]): Promise<VendorShipping[]> {
    const vendorGroups = new Map<string, ItemCalculation[]>();
    
    // Group items by vendor
    items.forEach(item => {
      if (!vendorGroups.has(item.vendorId)) {
        vendorGroups.set(item.vendorId, []);
      }
      vendorGroups.get(item.vendorId)!.push(item);
    });

    const vendorShipping: VendorShipping[] = [];

    for (const [vendorId, vendorItems] of vendorGroups) {
      const vendorWeight = vendorItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      const vendorValue = vendorItems.reduce((sum, item) => sum + item.itemTotal, 0);
      
      // Get vendor information
      const [vendor] = await db
        .select({ businessName: vendors.businessName, shippingRate: vendors.shippingRate })
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      const shippingRate = vendor?.shippingRate || 0.02; // Default 2%
      const shippingCost = Math.max(30, vendorValue * shippingRate); // Minimum 30 BDT
      
      vendorShipping.push({
        vendorId,
        vendorName: vendor?.businessName || 'Unknown Vendor',
        shippingCost,
        estimatedDays: vendorWeight > 10 ? 5 : 3 // Heavier items take longer
      });
    }

    return vendorShipping;
  }

  /**
   * Calculate taxes
   */
  private async calculateTaxes(taxableAmount: number, shippingCost: number): Promise<TaxCalculation> {
    // Bangladesh tax structure
    const vatRate = 0.15; // 15% VAT
    const supplementaryDutyRate = 0.0; // No supplementary duty for most items
    const serviceTaxRate = 0.0; // No service tax

    const vat = taxableAmount * vatRate;
    const supplementaryDuty = taxableAmount * supplementaryDutyRate;
    const serviceTax = shippingCost * serviceTaxRate;

    return {
      vat,
      vatRate,
      supplementaryDuty,
      supplementaryDutyRate,
      serviceTax,
      serviceTaxRate,
      total: vat + supplementaryDuty + serviceTax
    };
  }

  /**
   * Calculate loyalty points
   */
  private async calculateLoyaltyPoints(input: OrderCalculationInput, subtotal: number): Promise<{ pointsUsed: number; pointsEarned: number }> {
    const pointsUsed = Math.min(input.loyaltyPoints || 0, subtotal * 0.1); // Max 10% of order value
    const pointsEarned = Math.floor(subtotal / 100); // 1 point per 100 BDT

    return { pointsUsed, pointsEarned };
  }

  /**
   * Calculate payment method discount
   */
  private async calculatePaymentMethodDiscount(paymentMethod: string | undefined, subtotal: number): Promise<number> {
    const discounts: { [key: string]: number } = {
      'bkash': 0.02, // 2% discount for bKash
      'nagad': 0.015, // 1.5% discount for Nagad
      'rocket': 0.01, // 1% discount for Rocket
      'card': 0.005 // 0.5% discount for card payments
    };

    const discountRate = discounts[paymentMethod || ''] || 0;
    return subtotal * discountRate;
  }

  /**
   * Calculate membership discount
   */
  private async calculateMembershipDiscount(membershipTier: string | undefined, subtotal: number): Promise<number> {
    const discounts: { [key: string]: number } = {
      'bronze': 0.02, // 2% discount
      'silver': 0.05, // 5% discount
      'gold': 0.08, // 8% discount
      'platinum': 0.12 // 12% discount
    };

    const discountRate = discounts[membershipTier || ''] || 0;
    return subtotal * discountRate;
  }

  /**
   * Calculate estimated delivery date
   */
  private calculateEstimatedDelivery(address: ShippingAddress): Date {
    const deliveryDays: { [key: string]: number } = {
      'Dhaka': 1,
      'Chittagong': 3,
      'Sylhet': 4,
      'Rajshahi': 3,
      'Khulna': 2,
      'Barisal': 4,
      'Rangpur': 5,
      'Mymensingh': 2
    };

    const days = deliveryDays[address.region] || 5;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + days);
    
    return estimatedDate;
  }

  /**
   * Create detailed calculation breakdown
   */
  private async createCalculationBreakdown(
    items: ItemCalculation[],
    discounts: DiscountCalculation[],
    shipping: ShippingCalculation,
    taxes: TaxCalculation,
    input: OrderCalculationInput
  ): Promise<CalculationBreakdown> {
    const itemsSubtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
    
    // Vendor breakdown
    const vendorMap = new Map<string, ItemCalculation[]>();
    items.forEach(item => {
      if (!vendorMap.has(item.vendorId)) {
        vendorMap.set(item.vendorId, []);
      }
      vendorMap.get(item.vendorId)!.push(item);
    });

    const vendorBreakdown: VendorBreakdown[] = [];
    for (const [vendorId, vendorItems] of vendorMap) {
      const itemsTotal = vendorItems.reduce((sum, item) => sum + item.itemTotal, 0);
      const commission = itemsTotal * 0.05; // 5% commission
      const vendorShipping = shipping.vendorShippingFees.find(v => v.vendorId === vendorId)?.shippingCost || 0;
      
      vendorBreakdown.push({
        vendorId,
        vendorName: vendorItems[0]?.productName || 'Unknown Vendor', // Would get actual vendor name
        itemsTotal,
        commission,
        vendorPayout: itemsTotal - commission,
        shippingCost: vendorShipping
      });
    }

    // Discount breakdown
    const discountBreakdown: DiscountBreakdown = {
      couponDiscount: discounts.filter(d => d.type === 'coupon').reduce((sum, d) => sum + d.amount, 0),
      membershipDiscount: await this.calculateMembershipDiscount(input.membershipTier, itemsSubtotal),
      loyaltyDiscount: await this.calculateLoyaltyPoints(input, itemsSubtotal).then(r => r.pointsUsed),
      paymentDiscount: await this.calculatePaymentMethodDiscount(input.paymentMethod, itemsSubtotal),
      bulkDiscount: discounts.filter(d => d.type === 'bulk').reduce((sum, d) => sum + d.amount, 0),
      vendorDiscount: discounts.filter(d => d.type === 'vendor').reduce((sum, d) => sum + d.amount, 0),
      totalDiscount: discounts.reduce((sum, d) => sum + d.amount, 0)
    };

    // Shipping breakdown
    const shippingBreakdown: ShippingBreakdown = {
      baseShipping: shipping.baseShipping,
      weightCharge: shipping.weightCharge,
      distanceCharge: shipping.distanceCharge,
      vendorShipping: shipping.vendorShippingFees.reduce((sum, v) => sum + v.shippingCost, 0),
      consolidationDiscount: shipping.consolidationDiscount,
      finalShipping: shipping.total
    };

    // Tax breakdown
    const taxBreakdown: TaxBreakdown = {
      vat: taxes.vat,
      supplementaryDuty: taxes.supplementaryDuty,
      serviceTax: taxes.serviceTax,
      totalTax: taxes.total
    };

    const finalTotal = itemsSubtotal - discountBreakdown.totalDiscount + shipping.total + taxes.total;

    return {
      itemsSubtotal,
      vendorBreakdown,
      discountBreakdown,
      shippingBreakdown,
      taxBreakdown,
      finalTotal
    };
  }

  /**
   * Cache calculation result
   */
  private async cacheCalculation(input: OrderCalculationInput, result: OrderCalculationResult): Promise<void> {
    const cacheKey = `order-calculation:${JSON.stringify(input)}`;
    await this.redisService.setex(cacheKey, 300, JSON.stringify(result)); // 5 minutes cache
  }

  /**
   * Get cached calculation
   */
  async getCachedCalculation(input: OrderCalculationInput): Promise<OrderCalculationResult | null> {
    try {
      const cacheKey = `order-calculation:${JSON.stringify(input)}`;
      const cached = await this.redisService.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      return null;
    }
  }
}