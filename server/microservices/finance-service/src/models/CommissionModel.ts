/**
 * Commission Model - Commission Calculations Data Layer
 * Enterprise-grade commission processing and analytics computation
 */

import { db } from '../../../db';
import { vendorCommissions, orders, orderItems, products, vendors, productCategories } from '@shared/schema';
import { eq, and, gte, lte, sum, count, desc, asc, avg } from 'drizzle-orm';

export interface CommissionStructure {
  id: string;
  vendorId?: string;
  categoryId?: string;
  commissionType: 'percentage' | 'fixed' | 'tiered';
  commissionRate: number;
  minimumOrderValue?: number;
  maximumCommission?: number;
  tierStructure?: CommissionTier[];
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
}

export interface CommissionTier {
  minSalesVolume: number;
  maxSalesVolume?: number;
  commissionRate: number;
  bonusRate?: number;
  tierName: string;
}

export interface CommissionCalculation {
  orderId: string;
  vendorId: string;
  orderAmount: number;
  baseCommissionRate: number;
  finalCommissionRate: number;
  commissionAmount: number;
  platformFee: number;
  vendorEarnings: number;
  calculationMethod: string;
  bonusDetails?: any;
  deductions?: any;
  calculatedAt: Date;
}

export interface CommissionAnalytics {
  period: { startDate: Date; endDate: Date };
  vendorId?: string;
  categoryId?: string;
  totalOrders: number;
  totalCommissionPaid: number;
  averageCommissionRate: number;
  topPerformingVendors: Array<{
    vendorId: string;
    vendorName: string;
    totalCommission: number;
    orderCount: number;
    averageOrderValue: number;
  }>;
  commissionTrends: Array<{
    period: string;
    totalCommission: number;
    orderCount: number;
    averageRate: number;
  }>;
}

export interface PerformanceBonus {
  vendorId: string;
  evaluationPeriod: string;
  performanceScore: number;
  bonusRate: number;
  bonusAmount: number;
  metrics: {
    customerRating: number;
    orderFulfillmentRate: number;
    returnRate: number;
    responseTime: number;
    salesGrowth: number;
  };
  tier: string;
  calculatedAt: Date;
}

export class CommissionModel {
  
  /**
   * Calculate commission for orders
   */
  async calculateOrderCommissions(orderIds: string[]) {
    try {
      const commissions = [];
      
      for (const orderId of orderIds) {
        // Get order details with items
        const orderDetails = await this.getOrderWithItems(orderId);
        
        if (!orderDetails) {
          throw new Error(`Order ${orderId} not found`);
        }

        // Calculate commission for each item
        let totalCommission = 0;
        const itemCommissions = [];

        for (const item of orderDetails.items) {
          const itemCommission = await this.calculateItemCommission(item, orderDetails.vendorId);
          itemCommissions.push(itemCommission);
          totalCommission += itemCommission.commissionAmount;
        }

        // Apply vendor-level bonuses or deductions
        const vendorAdjustments = await this.calculateVendorAdjustments(orderDetails.vendorId, totalCommission);
        
        const finalCommissionAmount = totalCommission + vendorAdjustments.bonusAmount - vendorAdjustments.deductionAmount;
        
        // Calculate platform fee (typically 20-30% of commission)
        const platformFee = finalCommissionAmount * 0.25; // 25% platform fee
        const vendorEarnings = finalCommissionAmount - platformFee;

        const commission: CommissionCalculation = {
          orderId,
          vendorId: orderDetails.vendorId,
          orderAmount: orderDetails.totalAmount,
          baseCommissionRate: this.calculateAverageRate(itemCommissions),
          finalCommissionRate: (finalCommissionAmount / orderDetails.totalAmount) * 100,
          commissionAmount: finalCommissionAmount,
          platformFee,
          vendorEarnings,
          calculationMethod: 'item_based_calculation',
          bonusDetails: vendorAdjustments.bonusDetails,
          deductions: vendorAdjustments.deductions,
          calculatedAt: new Date()
        };

        commissions.push(commission);
      }

      return commissions;
    } catch (error) {
      throw new Error(`Failed to calculate order commissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get commission structures with filtering
   */
  async getCommissionStructures(filters: {
    vendorId?: string;
    categoryId?: string;
    commissionType?: string;
    isActive?: boolean;
    effectiveDate?: Date;
  }) {
    try {
      let query = db.select().from(vendorCommissions);
      
      const conditions = [];
      
      if (filters.vendorId) {
        conditions.push(eq(vendorCommissions.vendorId, filters.vendorId));
      }
      
      if (filters.isActive !== undefined) {
        conditions.push(eq(vendorCommissions.isActive, filters.isActive));
      }
      
      if (filters.effectiveDate) {
        conditions.push(
          and(
            lte(vendorCommissions.createdAt, filters.effectiveDate),
            // Add logic for validUntil check
          )
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const structures = await query.orderBy(desc(vendorCommissions.createdAt));
      
      return structures.map(structure => this.mapToCommissionStructure(structure));
    } catch (error) {
      throw new Error(`Failed to get commission structures: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate tiered commissions based on sales volume
   */
  async calculateTieredCommissions(params: {
    vendorId: string;
    evaluationPeriod: string;
    salesVolume?: number;
  }) {
    try {
      // Get or calculate sales volume
      const salesVolume = params.salesVolume || await this.getVendorSalesVolume(params.vendorId, params.evaluationPeriod);
      
      // Define commission tiers
      const commissionTiers: CommissionTier[] = [
        { minSalesVolume: 0, maxSalesVolume: 50000, commissionRate: 0.03, tierName: 'Bronze' },
        { minSalesVolume: 50000, maxSalesVolume: 100000, commissionRate: 0.04, tierName: 'Silver' },
        { minSalesVolume: 100000, maxSalesVolume: 250000, commissionRate: 0.05, tierName: 'Gold' },
        { minSalesVolume: 250000, maxSalesVolume: 500000, commissionRate: 0.06, tierName: 'Platinum' },
        { minSalesVolume: 500000, commissionRate: 0.07, tierName: 'Diamond' }
      ];

      // Determine current tier
      const currentTier = this.determineTier(salesVolume, commissionTiers);
      
      // Calculate next tier progress
      const nextTier = this.getNextTier(salesVolume, commissionTiers);
      
      // Calculate projected earnings at current tier
      const projectedAnnualEarnings = salesVolume * currentTier.commissionRate;
      
      // Calculate potential earnings at next tier
      const potentialEarnings = nextTier ? 
        (nextTier.minSalesVolume * nextTier.commissionRate) : 
        projectedAnnualEarnings;

      return {
        vendorId: params.vendorId,
        evaluationPeriod: params.evaluationPeriod,
        salesVolume,
        currentTier: {
          ...currentTier,
          projectedEarnings: projectedAnnualEarnings
        },
        nextTier: nextTier ? {
          ...nextTier,
          requiredAdditionalSales: Math.max(0, nextTier.minSalesVolume - salesVolume),
          potentialEarnings
        } : null,
        allTiers: commissionTiers,
        tierUpgradeIncentive: nextTier ? 
          potentialEarnings - projectedAnnualEarnings : 0
      };
    } catch (error) {
      throw new Error(`Failed to calculate tiered commissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate performance-based bonuses
   */
  async calculatePerformanceBonuses(params: {
    vendorIds?: string[];
    evaluationPeriod: string;
    includeMetrics: boolean;
  }) {
    try {
      const vendorIds = params.vendorIds || await this.getAllActiveVendorIds();
      const bonuses = [];

      for (const vendorId of vendorIds) {
        // Get performance metrics
        const metrics = await this.getVendorPerformanceMetrics(vendorId, params.evaluationPeriod);
        
        // Calculate performance score (0-100)
        const performanceScore = this.calculatePerformanceScore(metrics);
        
        // Determine bonus rate based on score
        const bonusRate = this.getBonusRate(performanceScore);
        
        // Calculate bonus amount
        const salesVolume = await this.getVendorSalesVolume(vendorId, params.evaluationPeriod);
        const bonusAmount = salesVolume * bonusRate;
        
        // Determine performance tier
        const tier = this.getPerformanceTier(performanceScore);

        const bonus: PerformanceBonus = {
          vendorId,
          evaluationPeriod: params.evaluationPeriod,
          performanceScore,
          bonusRate,
          bonusAmount,
          metrics: params.includeMetrics ? metrics : {} as any,
          tier,
          calculatedAt: new Date()
        };

        bonuses.push(bonus);
      }

      return bonuses.sort((a, b) => b.bonusAmount - a.bonusAmount);
    } catch (error) {
      throw new Error(`Failed to calculate performance bonuses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate commission analytics
   */
  async generateCommissionAnalytics(params: {
    startDate: Date;
    endDate: Date;
    vendorId?: string;
    categoryId?: string;
    groupBy: 'daily' | 'weekly' | 'monthly';
    includeComparisons: boolean;
  }): Promise<CommissionAnalytics> {
    try {
      // Get base commission data
      const commissionData = await this.getCommissionDataForPeriod(params);
      
      // Calculate summary metrics
      const totalOrders = commissionData.length;
      const totalCommissionPaid = commissionData.reduce((sum, c) => sum + c.commissionAmount, 0);
      const averageCommissionRate = totalOrders > 0 ? 
        commissionData.reduce((sum, c) => sum + c.commissionRate, 0) / totalOrders : 0;

      // Get top performing vendors
      const topPerformingVendors = await this.getTopPerformingVendors(params);
      
      // Generate trend data
      const commissionTrends = await this.generateCommissionTrends(params);

      const analytics: CommissionAnalytics = {
        period: { startDate: params.startDate, endDate: params.endDate },
        vendorId: params.vendorId,
        categoryId: params.categoryId,
        totalOrders,
        totalCommissionPaid,
        averageCommissionRate,
        topPerformingVendors,
        commissionTrends
      };

      return analytics;
    } catch (error) {
      throw new Error(`Failed to generate commission analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate category-wise commission rates
   */
  async calculateCategoryCommissionRates(categoryIds?: string[]) {
    try {
      const categories = categoryIds || await this.getAllCategoryIds();
      const categoryRates = [];

      for (const categoryId of categories) {
        // Get category commission data
        const commissionData = await this.getCategoryCommissionData(categoryId);
        
        const averageRate = commissionData.length > 0 ? 
          commissionData.reduce((sum, c) => sum + c.commissionRate, 0) / commissionData.length : 0;
        
        const totalVolume = commissionData.reduce((sum, c) => sum + c.orderAmount, 0);
        const totalCommission = commissionData.reduce((sum, c) => sum + c.commissionAmount, 0);

        // Get category details
        const categoryDetails = await this.getCategoryDetails(categoryId);

        categoryRates.push({
          categoryId,
          categoryName: categoryDetails?.name || 'Unknown',
          averageCommissionRate: averageRate,
          totalOrders: commissionData.length,
          totalVolume,
          totalCommission,
          topVendors: await this.getTopVendorsInCategory(categoryId, 5)
        });
      }

      return categoryRates.sort((a, b) => b.totalCommission - a.totalCommission);
    } catch (error) {
      throw new Error(`Failed to calculate category commission rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Forecast commission earnings
   */
  async forecastCommissionEarnings(params: {
    vendorId?: string;
    forecastPeriod: number; // months
    confidenceLevel: number;
    includeSeasonality: boolean;
  }) {
    try {
      // Get historical commission data
      const historicalData = await this.getHistoricalCommissionData(params.vendorId, 12); // 12 months
      
      if (historicalData.length === 0) {
        throw new Error('Insufficient historical data for forecasting');
      }

      // Calculate trend and seasonality
      const trend = this.calculateTrend(historicalData);
      const seasonality = params.includeSeasonality ? 
        this.calculateSeasonality(historicalData) : null;

      // Generate forecast
      const forecast = [];
      const baseEarnings = historicalData[historicalData.length - 1].totalCommission;

      for (let month = 1; month <= params.forecastPeriod; month++) {
        let forecastedAmount = baseEarnings * (1 + trend * month);
        
        // Apply seasonality if requested
        if (seasonality) {
          const seasonalIndex = seasonality[(month - 1) % 12];
          forecastedAmount *= seasonalIndex;
        }

        // Calculate confidence interval
        const standardDeviation = this.calculateStandardDeviation(historicalData);
        const confidenceMultiplier = this.getConfidenceMultiplier(params.confidenceLevel);
        
        const lowerBound = forecastedAmount - (standardDeviation * confidenceMultiplier);
        const upperBound = forecastedAmount + (standardDeviation * confidenceMultiplier);

        forecast.push({
          month,
          forecastedAmount,
          lowerBound: Math.max(0, lowerBound),
          upperBound,
          confidence: params.confidenceLevel,
          trend: trend * 100, // Convert to percentage
          seasonalFactor: seasonality ? seasonality[(month - 1) % 12] : 1
        });
      }

      return {
        vendorId: params.vendorId,
        forecastPeriod: params.forecastPeriod,
        confidenceLevel: params.confidenceLevel,
        historicalAverage: historicalData.reduce((sum, d) => sum + d.totalCommission, 0) / historicalData.length,
        trend: trend * 100,
        forecast,
        generatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to forecast commission earnings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private async getOrderWithItems(orderId: string) {
    // Get order with items from database
    return {
      orderId,
      vendorId: 'vendor123',
      totalAmount: 1000,
      items: [
        { id: 'item1', productId: 'prod1', quantity: 1, unitPrice: 500, totalPrice: 500 },
        { id: 'item2', productId: 'prod2', quantity: 2, unitPrice: 250, totalPrice: 500 }
      ]
    };
  }

  private async calculateItemCommission(item: any, vendorId: string) {
    // Calculate commission for individual item
    const commissionRate = await this.getProductCommissionRate(item.productId, vendorId);
    const commissionAmount = item.totalPrice * commissionRate;
    
    return {
      itemId: item.id,
      productId: item.productId,
      itemAmount: item.totalPrice,
      commissionRate,
      commissionAmount
    };
  }

  private async getProductCommissionRate(productId: string, vendorId: string): Promise<number> {
    // Get commission rate for product/vendor combination
    return 0.05; // Default 5%
  }

  private async calculateVendorAdjustments(vendorId: string, baseCommission: number) {
    // Calculate vendor-specific bonuses and deductions
    return {
      bonusAmount: 0,
      deductionAmount: 0,
      bonusDetails: null,
      deductions: null
    };
  }

  private calculateAverageRate(itemCommissions: any[]): number {
    if (itemCommissions.length === 0) return 0;
    
    const totalAmount = itemCommissions.reduce((sum, item) => sum + item.itemAmount, 0);
    const totalCommission = itemCommissions.reduce((sum, item) => sum + item.commissionAmount, 0);
    
    return totalAmount > 0 ? (totalCommission / totalAmount) * 100 : 0;
  }

  private mapToCommissionStructure(record: any): CommissionStructure {
    return {
      id: record.id,
      vendorId: record.vendorId,
      categoryId: record.categoryId,
      commissionType: 'percentage',
      commissionRate: record.commissionRate,
      minimumOrderValue: record.minimumOrderValue,
      maximumCommission: record.maximumCommission,
      validFrom: record.createdAt,
      isActive: record.isActive
    };
  }

  private async getVendorSalesVolume(vendorId: string, period: string): Promise<number> {
    // Calculate vendor sales volume for period
    return 150000; // Mock value
  }

  private determineTier(salesVolume: number, tiers: CommissionTier[]): CommissionTier {
    for (let i = tiers.length - 1; i >= 0; i--) {
      const tier = tiers[i];
      if (salesVolume >= tier.minSalesVolume && 
          (!tier.maxSalesVolume || salesVolume <= tier.maxSalesVolume)) {
        return tier;
      }
    }
    return tiers[0]; // Return lowest tier if no match
  }

  private getNextTier(salesVolume: number, tiers: CommissionTier[]): CommissionTier | null {
    for (const tier of tiers) {
      if (salesVolume < tier.minSalesVolume) {
        return tier;
      }
    }
    return null; // Already at highest tier
  }

  private async getAllActiveVendorIds(): Promise<string[]> {
    const vendors = await db.select({ id: vendorCommissions.vendorId })
      .from(vendorCommissions)
      .where(eq(vendorCommissions.isActive, true));
    
    return vendors.map(v => v.id).filter(Boolean);
  }

  private async getVendorPerformanceMetrics(vendorId: string, period: string) {
    // Get performance metrics for vendor
    return {
      customerRating: 4.5,
      orderFulfillmentRate: 0.95,
      returnRate: 0.05,
      responseTime: 12,
      salesGrowth: 0.15
    };
  }

  private calculatePerformanceScore(metrics: any): number {
    // Calculate weighted performance score
    let score = 0;
    
    // Customer rating (40% weight)
    score += (metrics.customerRating / 5) * 40;
    
    // Order fulfillment rate (30% weight)
    score += metrics.orderFulfillmentRate * 30;
    
    // Low return rate bonus (15% weight)
    score += (1 - Math.min(metrics.returnRate, 0.2)) * 15;
    
    // Fast response time bonus (15% weight)
    score += Math.max(0, (48 - metrics.responseTime) / 48) * 15;

    return Math.min(100, Math.max(0, score));
  }

  private getBonusRate(performanceScore: number): number {
    if (performanceScore >= 90) return 0.02; // 2% bonus
    if (performanceScore >= 80) return 0.015; // 1.5% bonus
    if (performanceScore >= 70) return 0.01; // 1% bonus
    return 0; // No bonus
  }

  private getPerformanceTier(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  }

  private async getCommissionDataForPeriod(params: any) {
    // Get commission data for analytics period
    return [];
  }

  private async getTopPerformingVendors(params: any) {
    // Get top performing vendors
    return [];
  }

  private async generateCommissionTrends(params: any) {
    // Generate trend data
    return [];
  }

  private async getAllCategoryIds(): Promise<string[]> {
    return [];
  }

  private async getCategoryCommissionData(categoryId: string) {
    return [];
  }

  private async getCategoryDetails(categoryId: string) {
    return { name: 'Category Name' };
  }

  private async getTopVendorsInCategory(categoryId: string, limit: number) {
    return [];
  }

  private async getHistoricalCommissionData(vendorId: string | undefined, months: number) {
    return [];
  }

  private calculateTrend(data: any[]): number {
    // Calculate trend coefficient
    return 0.05; // 5% growth trend
  }

  private calculateSeasonality(data: any[]): number[] | null {
    // Calculate seasonal indices for each month
    return [1.0, 0.9, 1.1, 1.2, 1.0, 0.8, 0.7, 0.9, 1.1, 1.3, 1.4, 1.2];
  }

  private calculateStandardDeviation(data: any[]): number {
    return 1000; // Mock standard deviation
  }

  private getConfidenceMultiplier(confidenceLevel: number): number {
    // Z-score for confidence levels
    const multipliers: Record<number, number> = {
      90: 1.645,
      95: 1.96,
      99: 2.576
    };
    return multipliers[confidenceLevel] || 1.96;
  }
}