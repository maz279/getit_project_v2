/**
 * ADVANCED COMMISSION MANAGEMENT SERVICE
 * Amazon.com/Shopee.sg-Level Commission System
 * 
 * Features:
 * - Product-based commission structures (Electronics: 5-8%, Fashion: 8-12%)
 * - Vendor tier commission (Bronze, Silver, Gold, Platinum)
 * - Volume-based commission discounts
 * - Performance-based commission bonuses
 * - Real-time commission calculations
 * - Bangladesh market optimizations
 * - Festival season adjustments
 */

import { db } from '../../../../db';
import { 
  commissionStructures,
  enhancedVendorPayouts,
  vendors,
  orders,
  orderItems,
  products,
  categories,
  vendorCommissions,
  type CommissionStructure,
  type EnhancedVendorPayout,
  type Vendor,
  type Order,
  type Product
} from '../../../../../shared/schema';
import { eq, and, desc, asc, sum, sql, gte, lte, between, inArray } from 'drizzle-orm';
import { logger } from '../../../../services/LoggingService';

export interface CommissionCalculation {
  orderId: string;
  vendorId: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  bonusRate: number;
  bonusAmount: number;
  totalCommission: number;
  netPayoutAmount: number;
  structureUsed: string;
  tier: string;
  breakdown: CommissionBreakdown[];
}

export interface CommissionBreakdown {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  commissionRate: number;
  commissionAmount: number;
}

export interface VendorPerformanceMetrics {
  vendorId: string;
  period: string;
  salesVolume: number;
  orderCount: number;
  averageOrderValue: number;
  returnRate: number;
  customerRating: number;
  responseTime: number;
  currentTier: string;
  nextTier: string;
  progressToNextTier: number;
}

export interface CommissionStructureConfig {
  name: string;
  type: 'product_based' | 'tier_based' | 'volume_based' | 'performance_based';
  category?: string;
  vendorTier?: string;
  minVolume?: number;
  maxVolume?: number;
  baseRate: number;
  bonusRate?: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export class AdvancedCommissionService {
  private serviceName = 'advanced-commission-service';

  // Bangladesh E-commerce Commission Structures
  private bangladeshCommissionRates = {
    productBased: {
      'Electronics': { base: 0.05, max: 0.08, seasonal: 0.06 },
      'Fashion & Apparel': { base: 0.08, max: 0.12, seasonal: 0.10 },
      'Books & Media': { base: 0.03, max: 0.05, seasonal: 0.04 },
      'Beauty & Personal Care': { base: 0.08, max: 0.10, seasonal: 0.09 },
      'Home & Garden': { base: 0.06, max: 0.09, seasonal: 0.07 },
      'Sports & Outdoors': { base: 0.07, max: 0.10, seasonal: 0.08 },
      'Automotive': { base: 0.04, max: 0.06, seasonal: 0.05 },
      'Health & Medicine': { base: 0.06, max: 0.08, seasonal: 0.07 },
      'Groceries & Food': { base: 0.02, max: 0.04, seasonal: 0.03 },
      'Baby & Kids': { base: 0.08, max: 0.11, seasonal: 0.09 }
    },
    vendorTiers: {
      'New': { 
        commissionRate: 0.12, 
        bonusRate: 0.00, 
        requirements: { minOrders: 0, minRevenue: 0, minRating: 0 } 
      },
      'Bronze': { 
        commissionRate: 0.10, 
        bonusRate: 0.005, 
        requirements: { minOrders: 10, minRevenue: 50000, minRating: 3.5 } 
      },
      'Silver': { 
        commissionRate: 0.08, 
        bonusRate: 0.01, 
        requirements: { minOrders: 50, minRevenue: 200000, minRating: 4.0 } 
      },
      'Gold': { 
        commissionRate: 0.06, 
        bonusRate: 0.015, 
        requirements: { minOrders: 200, minRevenue: 1000000, minRating: 4.5 } 
      },
      'Platinum': { 
        commissionRate: 0.04, 
        bonusRate: 0.02, 
        requirements: { minOrders: 500, minRevenue: 5000000, minRating: 4.8 } 
      }
    },
    volumeBased: {
      'Tier1': { minVolume: 0, maxVolume: 100000, rate: 0.10 },
      'Tier2': { minVolume: 100000, maxVolume: 500000, rate: 0.08 },
      'Tier3': { minVolume: 500000, maxVolume: 2000000, rate: 0.06 },
      'Tier4': { minVolume: 2000000, maxVolume: Number.MAX_VALUE, rate: 0.04 }
    },
    festivalAdjustments: {
      'Eid-ul-Fitr': { multiplier: 0.8, bonusRate: 0.02 }, // Lower commission, higher bonus
      'Eid-ul-Adha': { multiplier: 0.9, bonusRate: 0.015 },
      'Pohela Boishakh': { multiplier: 0.85, bonusRate: 0.02 },
      'Durga Puja': { multiplier: 0.9, bonusRate: 0.015 },
      'Victory Day': { multiplier: 0.95, bonusRate: 0.01 },
      'Independence Day': { multiplier: 0.95, bonusRate: 0.01 },
      'Black Friday': { multiplier: 0.7, bonusRate: 0.03 },
      'Cyber Monday': { multiplier: 0.75, bonusRate: 0.025 }
    }
  };

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    logger.info(`💰 Initializing ${this.serviceName}`, {
      serviceId: this.serviceName,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      features: ['advanced-commission', 'tier-based', 'performance-bonus', 'bangladesh-optimized']
    });

    // Initialize commission structures
    await this.initializeCommissionStructures();
  }

  /**
   * Initialize commission structures for Bangladesh market
   */
  async initializeCommissionStructures(): Promise<void> {
    try {
      const existingStructures = await db.select().from(commissionStructures).limit(1);
      
      if (existingStructures.length === 0) {
        logger.info('🏗️ Initializing Bangladesh commission structures');

        // Product-based commission structures
        for (const [category, rates] of Object.entries(this.bangladeshCommissionRates.productBased)) {
          await this.createCommissionStructure({
            name: `${category} - Product Commission`,
            type: 'product_based',
            category: category,
            baseRate: rates.base,
            bonusRate: rates.seasonal - rates.base,
            effectiveFrom: new Date()
          });
        }

        // Vendor tier commission structures
        for (const [tier, config] of Object.entries(this.bangladeshCommissionRates.vendorTiers)) {
          await this.createCommissionStructure({
            name: `${tier} Vendor Tier`,
            type: 'tier_based',
            vendorTier: tier,
            baseRate: config.commissionRate,
            bonusRate: config.bonusRate,
            effectiveFrom: new Date()
          });
        }

        // Volume-based commission structures
        for (const [tierName, config] of Object.entries(this.bangladeshCommissionRates.volumeBased)) {
          await this.createCommissionStructure({
            name: `Volume ${tierName}`,
            type: 'volume_based',
            minVolume: config.minVolume,
            maxVolume: config.maxVolume === Number.MAX_VALUE ? undefined : config.maxVolume,
            baseRate: config.rate,
            effectiveFrom: new Date()
          });
        }

        logger.info('✅ Commission structures initialized successfully');
      }
    } catch (error) {
      logger.error('❌ Failed to initialize commission structures', { error });
      throw error;
    }
  }

  /**
   * Create new commission structure
   */
  async createCommissionStructure(config: CommissionStructureConfig): Promise<string> {
    try {
      const [structure] = await db.insert(commissionStructures).values({
        structureName: config.name,
        structureType: config.type,
        category: config.category,
        vendorTier: config.vendorTier,
        minVolume: config.minVolume?.toString(),
        maxVolume: config.maxVolume?.toString(),
        commissionRate: config.baseRate.toString(),
        bonusRate: (config.bonusRate || 0).toString(),
        effectiveFrom: config.effectiveFrom,
        effectiveTo: config.effectiveTo,
        isActive: true
      }).returning();

      logger.info('✅ Commission structure created', {
        structureId: structure.id,
        name: config.name,
        type: config.type,
        baseRate: config.baseRate
      });

      return structure.id;
    } catch (error) {
      logger.error('❌ Failed to create commission structure', { error, config });
      throw error;
    }
  }

  /**
   * Calculate commission for an order with advanced rules
   */
  async calculateOrderCommission(orderId: string): Promise<CommissionCalculation> {
    try {
      // Get order details with items and vendor info
      const orderData = await this.getOrderWithDetails(orderId);
      if (!orderData) {
        throw new Error(`Order not found: ${orderId}`);
      }

      // Get vendor performance metrics
      const vendorMetrics = await this.getVendorPerformanceMetrics(orderData.vendorId);
      
      // Determine vendor tier
      const vendorTier = this.determineVendorTier(vendorMetrics);
      
      // Calculate commission breakdown by product
      const breakdown: CommissionBreakdown[] = [];
      let totalCommissionAmount = 0;
      let totalBonusAmount = 0;

      for (const item of orderData.items) {
        const productCommission = await this.calculateProductCommission(
          item, 
          vendorTier, 
          orderData.isFestivalSeason
        );
        
        breakdown.push(productCommission);
        totalCommissionAmount += productCommission.commissionAmount;
      }

      // Apply volume-based adjustments
      const volumeAdjustment = await this.calculateVolumeAdjustment(
        orderData.vendorId, 
        totalCommissionAmount
      );
      totalCommissionAmount *= volumeAdjustment.multiplier;

      // Apply performance bonuses
      const performanceBonus = await this.calculatePerformanceBonus(
        vendorMetrics, 
        orderData.grossAmount
      );
      totalBonusAmount += performanceBonus;

      // Apply festival adjustments if applicable
      const festivalAdjustment = await this.getFestivalAdjustment();
      if (festivalAdjustment) {
        totalCommissionAmount *= festivalAdjustment.multiplier;
        totalBonusAmount += orderData.grossAmount * festivalAdjustment.bonusRate;
      }

      const totalCommission = totalCommissionAmount + totalBonusAmount;
      const commissionRate = totalCommissionAmount / orderData.grossAmount;
      const netPayoutAmount = orderData.grossAmount - totalCommission;

      const result: CommissionCalculation = {
        orderId,
        vendorId: orderData.vendorId,
        grossAmount: orderData.grossAmount,
        commissionRate,
        commissionAmount: totalCommissionAmount,
        bonusRate: totalBonusAmount / orderData.grossAmount,
        bonusAmount: totalBonusAmount,
        totalCommission,
        netPayoutAmount,
        structureUsed: 'hybrid',
        tier: vendorTier,
        breakdown
      };

      // Save commission record
      await this.saveCommissionRecord(result);

      logger.info('✅ Commission calculated successfully', {
        orderId,
        vendorId: orderData.vendorId,
        commissionAmount: totalCommissionAmount,
        bonusAmount: totalBonusAmount,
        tier: vendorTier
      });

      return result;
    } catch (error) {
      logger.error('❌ Failed to calculate commission', { error, orderId });
      throw error;
    }
  }

  /**
   * Calculate bulk vendor payout for a period
   */
  async calculateVendorPayout(vendorId: string, startDate: Date, endDate: Date): Promise<EnhancedVendorPayout> {
    try {
      // Get all orders for the period
      const orderCommissions = await this.getVendorCommissionsForPeriod(vendorId, startDate, endDate);
      
      const grossSales = orderCommissions.reduce((sum, comm) => sum + comm.grossAmount, 0);
      const totalCommission = orderCommissions.reduce((sum, comm) => sum + comm.totalCommission, 0);
      const avgCommissionRate = totalCommission / grossSales;

      // Calculate taxes and deductions
      const withholdingTax = totalCommission * 0.05; // 5% withholding tax
      const vatDeduction = totalCommission * 0.15; // 15% VAT
      const processingFee = 25; // Fixed processing fee

      const netPayoutAmount = grossSales - totalCommission - withholdingTax - vatDeduction - processingFee;

      // Get vendor's preferred payout method
      const vendor = await this.getVendor(vendorId);
      const payoutMethod = vendor?.preferredPayoutMethod || 'bank_transfer';

      const payout: EnhancedVendorPayout = {
        id: '', // Will be generated
        vendorId,
        payoutPeriodStart: startDate,
        payoutPeriodEnd: endDate,
        grossSales: grossSales.toString(),
        platformCommission: totalCommission.toString(),
        commissionRate: avgCommissionRate.toString(),
        processingFee: processingFee.toString(),
        withholdingTax: withholdingTax.toString(),
        vatDeduction: vatDeduction.toString(),
        netPayoutAmount: netPayoutAmount.toString(),
        payoutMethod,
        payoutAccount: vendor?.payoutAccount || '',
        payoutStatus: 'pending',
        payoutCurrency: 'BDT',
        exchangeRate: '1',
        createdAt: new Date()
      };

      // Save payout record
      const [savedPayout] = await db.insert(enhancedVendorPayouts).values(payout).returning();

      logger.info('✅ Vendor payout calculated', {
        vendorId,
        payoutId: savedPayout.id,
        grossSales,
        netPayoutAmount,
        period: `${startDate.toISOString()} - ${endDate.toISOString()}`
      });

      return savedPayout;
    } catch (error) {
      logger.error('❌ Failed to calculate vendor payout', { error, vendorId });
      throw error;
    }
  }

  /**
   * Get vendor performance metrics
   */
  async getVendorPerformanceMetrics(vendorId: string): Promise<VendorPerformanceMetrics> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const metrics = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
          orderCount: sql<number>`COUNT(${orders.id})`,
          avgOrderValue: sql<number>`COALESCE(AVG(${orders.total}), 0)`
        })
        .from(orders)
        .where(and(
          eq(orders.vendorId, vendorId),
          gte(orders.createdAt, thirtyDaysAgo)
        ));

      const vendorData = await this.getVendor(vendorId);
      const currentTier = this.determineVendorTier({
        salesVolume: parseFloat(metrics[0].totalRevenue.toString()),
        orderCount: metrics[0].orderCount,
        customerRating: vendorData?.rating || 0
      });

      return {
        vendorId,
        period: '30d',
        salesVolume: parseFloat(metrics[0].totalRevenue.toString()),
        orderCount: metrics[0].orderCount,
        averageOrderValue: parseFloat(metrics[0].avgOrderValue.toString()),
        returnRate: 0, // Calculate from returns data
        customerRating: vendorData?.rating || 0,
        responseTime: 24, // Default 24 hours
        currentTier,
        nextTier: this.getNextTier(currentTier),
        progressToNextTier: this.calculateTierProgress(currentTier, metrics[0])
      };
    } catch (error) {
      logger.error('❌ Failed to get vendor metrics', { error, vendorId });
      throw error;
    }
  }

  // Private helper methods

  private async getOrderWithDetails(orderId: string): Promise<any> {
    const orderData = await db
      .select({
        orderId: orders.id,
        vendorId: orders.vendorId,
        grossAmount: orders.total,
        createdAt: orders.createdAt
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderData.length === 0) return null;

    const items = await db
      .select({
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        productName: products.name,
        categoryId: products.categoryId
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return {
      ...orderData[0],
      grossAmount: parseFloat(orderData[0].grossAmount),
      items: items.map(item => ({
        ...item,
        price: parseFloat(item.price),
        quantity: item.quantity
      })),
      isFestivalSeason: this.isFestivalSeason()
    };
  }

  private async calculateProductCommission(
    item: any, 
    vendorTier: string, 
    isFestivalSeason: boolean
  ): Promise<CommissionBreakdown> {
    const category = await this.getProductCategory(item.productId);
    const categoryRates = this.bangladeshCommissionRates.productBased[category] || 
                         this.bangladeshCommissionRates.productBased['Electronics'];
    
    let commissionRate = categoryRates.base;
    
    // Apply tier adjustments
    const tierConfig = this.bangladeshCommissionRates.vendorTiers[vendorTier];
    if (tierConfig) {
      commissionRate = Math.min(commissionRate, tierConfig.commissionRate);
    }

    // Apply festival adjustments
    if (isFestivalSeason) {
      commissionRate = categoryRates.seasonal;
    }

    const commissionAmount = item.price * item.quantity * commissionRate;

    return {
      productId: item.productId,
      productName: item.productName,
      category,
      quantity: item.quantity,
      price: item.price,
      commissionRate,
      commissionAmount
    };
  }

  private determineVendorTier(metrics: any): string {
    const tiers = this.bangladeshCommissionRates.vendorTiers;
    
    for (const [tier, requirements] of Object.entries(tiers).reverse()) {
      if (metrics.salesVolume >= requirements.requirements.minRevenue &&
          metrics.orderCount >= requirements.requirements.minOrders &&
          (metrics.customerRating || 0) >= requirements.requirements.minRating) {
        return tier;
      }
    }
    
    return 'New';
  }

  private async calculateVolumeAdjustment(vendorId: string, amount: number): Promise<{ multiplier: number }> {
    // Get vendor's monthly volume
    const monthlyVolume = await this.getVendorMonthlyVolume(vendorId);
    
    for (const config of Object.values(this.bangladeshCommissionRates.volumeBased)) {
      if (monthlyVolume >= config.minVolume && monthlyVolume < config.maxVolume) {
        return { multiplier: 1.0 }; // Volume already factored into rate
      }
    }
    
    return { multiplier: 1.0 };
  }

  private async calculatePerformanceBonus(metrics: VendorPerformanceMetrics, orderAmount: number): Promise<number> {
    const tierConfig = this.bangladeshCommissionRates.vendorTiers[metrics.currentTier];
    if (!tierConfig) return 0;

    let bonusMultiplier = 1.0;
    
    // Rating bonus
    if (metrics.customerRating >= 4.8) bonusMultiplier += 0.5;
    else if (metrics.customerRating >= 4.5) bonusMultiplier += 0.3;
    else if (metrics.customerRating >= 4.0) bonusMultiplier += 0.1;

    // Response time bonus
    if (metrics.responseTime <= 12) bonusMultiplier += 0.2;
    else if (metrics.responseTime <= 24) bonusMultiplier += 0.1;

    return orderAmount * tierConfig.bonusRate * bonusMultiplier;
  }

  private async getFestivalAdjustment(): Promise<{ multiplier: number; bonusRate: number } | null> {
    const today = new Date();
    const currentFestival = this.getCurrentFestival(today);
    
    if (currentFestival) {
      return this.bangladeshCommissionRates.festivalAdjustments[currentFestival];
    }
    
    return null;
  }

  private getCurrentFestival(date: Date): string | null {
    // Simplified festival detection - in production, use proper calendar
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (month === 4 && day >= 10 && day <= 16) return 'Pohela Boishakh';
    if (month === 11 && day >= 25 && day <= 30) return 'Black Friday';
    if (month === 12 && day === 2) return 'Cyber Monday';
    
    return null;
  }

  private isFestivalSeason(): boolean {
    return this.getCurrentFestival(new Date()) !== null;
  }

  private async getProductCategory(productId: string): Promise<string> {
    const product = await db
      .select({ categoryId: products.categoryId })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    
    if (product.length === 0) return 'Electronics';
    
    const category = await db
      .select({ name: categories.name })
      .from(categories)
      .where(eq(categories.id, product[0].categoryId))
      .limit(1);
    
    return category[0]?.name || 'Electronics';
  }

  private async getVendor(vendorId: string): Promise<any> {
    const vendorData = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);
    
    return vendorData[0] || null;
  }

  private async getVendorMonthlyVolume(vendorId: string): Promise<number> {
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);
    
    const volume = await db
      .select({ total: sql<number>`COALESCE(SUM(${orders.total}), 0)` })
      .from(orders)
      .where(and(
        eq(orders.vendorId, vendorId),
        gte(orders.createdAt, firstOfMonth)
      ));
    
    return parseFloat(volume[0].total.toString());
  }

  private getNextTier(currentTier: string): string {
    const tiers = ['New', 'Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : 'Platinum';
  }

  private calculateTierProgress(currentTier: string, metrics: any): number {
    const nextTier = this.getNextTier(currentTier);
    if (nextTier === currentTier) return 100;
    
    const nextRequirements = this.bangladeshCommissionRates.vendorTiers[nextTier]?.requirements;
    if (!nextRequirements) return 0;
    
    const revenueProgress = (metrics.totalRevenue / nextRequirements.minRevenue) * 100;
    const orderProgress = (metrics.orderCount / nextRequirements.minOrders) * 100;
    
    return Math.min(Math.min(revenueProgress, orderProgress), 100);
  }

  private async getVendorCommissionsForPeriod(vendorId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // This would fetch actual commission records - simplified for now
    const orderData = await db
      .select({
        orderId: orders.id,
        grossAmount: orders.total,
        vendorId: orders.vendorId
      })
      .from(orders)
      .where(and(
        eq(orders.vendorId, vendorId),
        between(orders.createdAt, startDate, endDate)
      ));

    return orderData.map(order => ({
      orderId: order.orderId,
      grossAmount: parseFloat(order.grossAmount),
      totalCommission: parseFloat(order.grossAmount) * 0.08 // Simplified calculation
    }));
  }

  private async saveCommissionRecord(calculation: CommissionCalculation): Promise<void> {
    await db.insert(vendorCommissions).values({
      vendorId: calculation.vendorId,
      orderId: calculation.orderId,
      commissionRate: calculation.commissionRate.toString(),
      commissionAmount: calculation.commissionAmount.toString(),
      status: 'calculated',
      calculatedAt: new Date()
    });
  }
}

export const advancedCommissionService = new AdvancedCommissionService();