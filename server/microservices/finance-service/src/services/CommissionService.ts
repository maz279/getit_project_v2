/**
 * Commission Service - Platform Commission Management
 * Enterprise-grade commission structures and calculations business logic
 */

import { db } from '../../../db';
import { vendorCommissions, orders, orderItems, vendors, productCategories } from '@shared/schema';
import { eq, and, gte, lte, sum, desc, asc, avg } from 'drizzle-orm';

export class CommissionService {
  
  // Default commission rates
  private readonly DEFAULT_COMMISSION_RATE = 0.05; // 5%
  private readonly PERFORMANCE_BONUS_THRESHOLD = 100000; // 1 lakh BDT monthly sales
  
  /**
   * Get commission structures with filtering
   */
  async getCommissionStructures(filters: {
    vendorId?: string;
    categoryId?: string;
    commissionType?: string;
    isActive?: boolean;
    page: number;
    limit: number;
  }) {
    try {
      let query = db.select().from(vendorCommissions);
      
      const conditions = [];
      
      if (filters.vendorId) {
        conditions.push(eq(vendorCommissions.vendorId, filters.vendorId));
      }
      
      if (filters.categoryId) {
        conditions.push(eq(vendorCommissions.categoryId, filters.categoryId));
      }
      
      if (filters.commissionType) {
        conditions.push(eq(vendorCommissions.commissionType, filters.commissionType));
      }
      
      if (filters.isActive !== undefined) {
        conditions.push(eq(vendorCommissions.isActive, filters.isActive));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const structures = await query
        .orderBy(desc(vendorCommissions.createdAt))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit);
      
      return structures;
    } catch (error) {
      throw new Error(`Failed to get commission structures: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create new commission structure
   */
  async createCommissionStructure(structureData: {
    vendorId?: string;
    categoryId?: string;
    commissionType: 'percentage' | 'fixed' | 'tiered';
    commissionRate: number;
    minimumOrderValue?: number;
    maximumCommission?: number;
    tierStructure?: any;
    validFrom: Date;
    validUntil?: Date;
    isActive?: boolean;
  }, createdBy: string) {
    try {
      const [structure] = await db.insert(vendorCommissions)
        .values({
          vendorId: structureData.vendorId || null,
          categoryId: structureData.categoryId || null,
          commissionType: structureData.commissionType,
          commissionRate: structureData.commissionRate,
          minimumOrderValue: structureData.minimumOrderValue || 0,
          maximumCommission: structureData.maximumCommission || null,
          tierStructure: structureData.tierStructure ? JSON.stringify(structureData.tierStructure) : null,
          validFrom: structureData.validFrom,
          validUntil: structureData.validUntil || null,
          isActive: structureData.isActive ?? true,
          createdBy,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return structure;
    } catch (error) {
      throw new Error(`Failed to create commission structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update commission structure
   */
  async updateCommissionStructure(structureId: string, updateData: any, updatedBy: string) {
    try {
      const [updatedStructure] = await db.update(vendorCommissions)
        .set({
          ...updateData,
          updatedBy,
          updatedAt: new Date()
        })
        .where(eq(vendorCommissions.id, structureId))
        .returning();

      if (!updatedStructure) {
        throw new Error('Commission structure not found');
      }

      return updatedStructure;
    } catch (error) {
      throw new Error(`Failed to update commission structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate commission for specific order
   */
  async calculateOrderCommission(orderId: string, includeBreakdown: boolean = true) {
    try {
      // Get order details
      const [order] = await db.select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) {
        throw new Error('Order not found');
      }

      // Get order items
      const items = await db.select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      let totalCommission = 0;
      let platformCommission = 0;
      const itemBreakdown = [];

      for (const item of items) {
        const itemCommission = await this.calculateItemCommission(item);
        totalCommission += itemCommission.totalCommission;
        platformCommission += itemCommission.platformCommission;
        
        if (includeBreakdown) {
          itemBreakdown.push({
            itemId: item.id,
            productId: item.productId,
            itemTotal: item.totalPrice,
            commissionRate: itemCommission.commissionRate,
            commissionAmount: itemCommission.totalCommission,
            calculationMethod: itemCommission.calculationMethod
          });
        }
      }

      const commission = {
        orderId,
        orderTotal: order.totalAmount,
        totalCommission,
        platformCommission,
        vendorCommission: totalCommission - platformCommission,
        effectiveRate: order.totalAmount > 0 ? (totalCommission / order.totalAmount) * 100 : 0,
        calculationMethod: 'item_based',
        breakdown: includeBreakdown ? itemBreakdown : undefined,
        calculatedAt: new Date()
      };

      // Save commission record
      await this.saveCommissionRecord(commission);

      return commission;
    } catch (error) {
      throw new Error(`Failed to calculate order commission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get commission analytics and reports
   */
  async getCommissionAnalytics(params: {
    startDate?: Date;
    endDate?: Date;
    vendorId?: string;
    categoryId?: string;
    analyticsType: string;
    groupBy: string;
  }) {
    try {
      const startDate = params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = params.endDate || new Date();

      let query = db.select({
        vendorId: vendorCommissions.vendorId,
        categoryId: vendorCommissions.categoryId,
        totalCommission: sum(vendorCommissions.commissionAmount),
        totalOrders: sum(vendorCommissions.orderId),
        averageCommissionRate: avg(vendorCommissions.commissionRate),
        period: vendorCommissions.createdAt
      })
      .from(vendorCommissions);

      const conditions = [
        gte(vendorCommissions.createdAt, startDate),
        lte(vendorCommissions.createdAt, endDate)
      ];

      if (params.vendorId) {
        conditions.push(eq(vendorCommissions.vendorId, params.vendorId));
      }

      if (params.categoryId) {
        conditions.push(eq(vendorCommissions.categoryId, params.categoryId));
      }

      query = query.where(and(...conditions));

      const analytics = await query;

      // Process analytics based on type and grouping
      const processedAnalytics = await this.processCommissionAnalytics(
        analytics,
        params.analyticsType,
        params.groupBy
      );

      return {
        period: { startDate, endDate },
        analyticsType: params.analyticsType,
        groupBy: params.groupBy,
        data: processedAnalytics,
        summary: {
          totalCommission: analytics.reduce((sum, item) => sum + Number(item.totalCommission || 0), 0),
          totalOrders: analytics.reduce((sum, item) => sum + Number(item.totalOrders || 0), 0),
          averageRate: analytics.length > 0 ? 
            analytics.reduce((sum, item) => sum + Number(item.averageCommissionRate || 0), 0) / analytics.length : 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get commission analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get tiered commission calculations
   */
  async getTieredCommissions(params: {
    vendorId?: string;
    salesVolume?: number;
    performanceMetrics?: any;
    evaluationPeriod: string;
  }) {
    try {
      const vendor = params.vendorId ? await this.getVendorDetails(params.vendorId) : null;
      const salesVolume = params.salesVolume || await this.calculateVendorSalesVolume(params.vendorId, params.evaluationPeriod);
      
      // Define commission tiers
      const commissionTiers = [
        { threshold: 0, rate: 0.03, name: 'Bronze' },        // 3% for 0-50k
        { threshold: 50000, rate: 0.04, name: 'Silver' },    // 4% for 50k-100k
        { threshold: 100000, rate: 0.05, name: 'Gold' },     // 5% for 100k-250k
        { threshold: 250000, rate: 0.06, name: 'Platinum' }, // 6% for 250k-500k
        { threshold: 500000, rate: 0.07, name: 'Diamond' },  // 7% for 500k+
      ];

      // Determine current tier
      const currentTier = this.determineCommissionTier(salesVolume, commissionTiers);
      
      // Calculate performance bonus
      const performanceBonus = await this.calculatePerformanceBonus({
        vendorId: params.vendorId,
        evaluationPeriod: params.evaluationPeriod,
        performanceMetrics: params.performanceMetrics || {},
        bonusType: 'percentage',
        calculatedBy: 'system'
      });

      return {
        vendorId: params.vendorId,
        evaluationPeriod: params.evaluationPeriod,
        salesVolume,
        currentTier,
        allTiers: commissionTiers,
        nextTierThreshold: this.getNextTierThreshold(salesVolume, commissionTiers),
        performanceBonus,
        effectiveCommissionRate: currentTier.rate + (performanceBonus.bonusRate || 0),
        projectedEarnings: this.calculateProjectedEarnings(salesVolume, currentTier.rate, performanceBonus.bonusRate || 0)
      };
    } catch (error) {
      throw new Error(`Failed to get tiered commissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate performance-based bonuses
   */
  async calculatePerformanceBonus(params: {
    vendorId?: string;
    evaluationPeriod: string;
    performanceMetrics: any;
    bonusType: string;
    calculatedBy: string;
  }) {
    try {
      const metrics = params.performanceMetrics || {};
      
      // Default performance metrics
      const defaultMetrics = {
        customerRating: 4.5,
        orderFulfillmentRate: 0.95,
        returnRate: 0.05,
        responseTime: 12, // hours
        salesGrowth: 0.15 // 15% growth
      };

      const finalMetrics = { ...defaultMetrics, ...metrics };

      // Calculate performance score (0-100)
      let performanceScore = 0;
      
      // Customer rating (40% weight)
      performanceScore += (finalMetrics.customerRating / 5) * 40;
      
      // Order fulfillment rate (30% weight)
      performanceScore += finalMetrics.orderFulfillmentRate * 30;
      
      // Low return rate bonus (15% weight)
      performanceScore += (1 - Math.min(finalMetrics.returnRate, 0.2)) * 15;
      
      // Fast response time bonus (15% weight)
      const responseBonus = Math.max(0, (48 - finalMetrics.responseTime) / 48) * 15;
      performanceScore += responseBonus;

      // Determine bonus rate based on performance score
      let bonusRate = 0;
      if (performanceScore >= 90) {
        bonusRate = 0.02; // 2% bonus
      } else if (performanceScore >= 80) {
        bonusRate = 0.015; // 1.5% bonus
      } else if (performanceScore >= 70) {
        bonusRate = 0.01; // 1% bonus
      }

      // Calculate bonus amount if sales volume provided
      const salesVolume = await this.calculateVendorSalesVolume(params.vendorId, params.evaluationPeriod);
      const bonusAmount = salesVolume * bonusRate;

      return {
        vendorId: params.vendorId,
        evaluationPeriod: params.evaluationPeriod,
        performanceScore,
        bonusRate,
        bonusAmount,
        bonusType: params.bonusType,
        metrics: finalMetrics,
        tier: this.getPerformanceTier(performanceScore),
        calculatedBy: params.calculatedBy,
        calculatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to calculate performance bonus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get commission rates by product category
   */
  async getCommissionRatesByCategory(params: {
    vendorId?: string;
    includeInactive?: boolean;
  }) {
    try {
      let query = db.select({
        categoryId: vendorCommissions.categoryId,
        categoryName: productCategories.name,
        commissionRate: vendorCommissions.commissionRate,
        commissionType: vendorCommissions.commissionType,
        minimumOrderValue: vendorCommissions.minimumOrderValue,
        maximumCommission: vendorCommissions.maximumCommission,
        validFrom: vendorCommissions.validFrom,
        validUntil: vendorCommissions.validUntil,
        isActive: vendorCommissions.isActive
      })
      .from(vendorCommissions)
      .leftJoin(productCategories, eq(vendorCommissions.categoryId, productCategories.id));

      const conditions = [];

      if (params.vendorId) {
        conditions.push(eq(vendorCommissions.vendorId, params.vendorId));
      }

      if (!params.includeInactive) {
        conditions.push(eq(vendorCommissions.isActive, true));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const rates = await query.orderBy(asc(productCategories.name));

      return rates;
    } catch (error) {
      throw new Error(`Failed to get commission rates by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply promotional commission rates
   */
  async applyPromotionalRates(params: {
    vendorIds?: string[];
    categoryIds?: string[];
    promotionalRate: number;
    validFrom: Date;
    validUntil: Date;
    description?: string;
    appliedBy: string;
  }) {
    try {
      const promotionalCommissions = [];

      // Apply to specific vendors
      if (params.vendorIds?.length) {
        for (const vendorId of params.vendorIds) {
          const commission = await this.createCommissionStructure({
            vendorId,
            commissionType: 'percentage',
            commissionRate: params.promotionalRate,
            validFrom: params.validFrom,
            validUntil: params.validUntil,
            isActive: true
          }, params.appliedBy);
          
          promotionalCommissions.push(commission);
        }
      }

      // Apply to specific categories
      if (params.categoryIds?.length) {
        for (const categoryId of params.categoryIds) {
          const commission = await this.createCommissionStructure({
            categoryId,
            commissionType: 'percentage',
            commissionRate: params.promotionalRate,
            validFrom: params.validFrom,
            validUntil: params.validUntil,
            isActive: true
          }, params.appliedBy);
          
          promotionalCommissions.push(commission);
        }
      }

      return {
        appliedCommissions: promotionalCommissions,
        totalApplied: promotionalCommissions.length,
        promotionalRate: params.promotionalRate,
        validPeriod: {
          from: params.validFrom,
          until: params.validUntil
        },
        description: params.description,
        appliedBy: params.appliedBy,
        appliedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to apply promotional rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate commission settlement report
   */
  async generateCommissionSettlement(params: {
    vendorId?: string;
    settlementPeriod: string;
    includeDetails: boolean;
    format: string;
    generatedBy: string;
  }) {
    try {
      const period = this.parseSettlementPeriod(params.settlementPeriod);
      
      // Get all commissions for the period
      const commissions = await this.getCommissionRecords({
        vendorId: params.vendorId,
        startDate: period.startDate,
        endDate: period.endDate
      });

      const totalCommission = commissions.reduce((sum, comm) => sum + comm.commissionAmount, 0);
      const totalOrders = commissions.length;
      const averageCommissionRate = totalOrders > 0 ? 
        commissions.reduce((sum, comm) => sum + comm.commissionRate, 0) / totalOrders : 0;

      const settlement = {
        vendorId: params.vendorId,
        settlementPeriod: params.settlementPeriod,
        period,
        summary: {
          totalCommission,
          totalOrders,
          averageCommissionRate,
          settlementStatus: 'pending'
        },
        details: params.includeDetails ? commissions : undefined,
        generatedBy: params.generatedBy,
        generatedAt: new Date()
      };

      return settlement;
    } catch (error) {
      throw new Error(`Failed to generate commission settlement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Bulk update commission rates
   */
  async bulkUpdateCommissionRates(params: {
    updates: Array<{
      id: string;
      commissionRate?: number;
      validFrom?: Date;
      validUntil?: Date;
      isActive?: boolean;
    }>;
    effectiveDate: Date;
    reason?: string;
    updatedBy: string;
  }) {
    try {
      const results = {
        successCount: 0,
        failureCount: 0,
        results: [] as any[]
      };

      for (const update of params.updates) {
        try {
          const updatedCommission = await this.updateCommissionStructure(
            update.id,
            {
              commissionRate: update.commissionRate,
              validFrom: update.validFrom || params.effectiveDate,
              validUntil: update.validUntil,
              isActive: update.isActive
            },
            params.updatedBy
          );

          results.successCount++;
          results.results.push({
            id: update.id,
            status: 'success',
            updatedCommission
          });
        } catch (error) {
          results.failureCount++;
          results.results.push({
            id: update.id,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return {
        ...results,
        effectiveDate: params.effectiveDate,
        reason: params.reason,
        updatedBy: params.updatedBy,
        updatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to bulk update commission rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get commission history for vendor
   */
  async getCommissionHistory(params: {
    vendorId?: string;
    startDate?: Date;
    endDate?: Date;
    includeSettled?: boolean;
    page: number;
    limit: number;
  }) {
    try {
      const history = await this.getCommissionRecords({
        vendorId: params.vendorId,
        startDate: params.startDate,
        endDate: params.endDate,
        includeSettled: params.includeSettled,
        page: params.page,
        limit: params.limit
      });

      return {
        history,
        summary: {
          totalRecords: history.length,
          totalCommission: history.reduce((sum, item) => sum + item.commissionAmount, 0),
          period: {
            startDate: params.startDate,
            endDate: params.endDate
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get commission history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private async calculateItemCommission(item: any) {
    const commissionRate = await this.getItemCommissionRate(item);
    const totalCommission = item.totalPrice * commissionRate;
    const platformCommission = totalCommission * 0.3; // Platform takes 30%
    
    return {
      totalCommission,
      platformCommission,
      commissionRate,
      calculationMethod: 'percentage'
    };
  }

  private async getItemCommissionRate(item: any): Promise<number> {
    // Get commission rate for this item's product/category
    // This would check the commission structures table
    return this.DEFAULT_COMMISSION_RATE;
  }

  private async saveCommissionRecord(commission: any) {
    // Save commission record to database
    // Implementation would depend on the commission records table schema
  }

  private async processCommissionAnalytics(analytics: any[], analyticsType: string, groupBy: string) {
    // Process analytics data based on type and grouping requirements
    return analytics;
  }

  private async getVendorDetails(vendorId: string) {
    const [vendor] = await db.select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);
    
    return vendor;
  }

  private async calculateVendorSalesVolume(vendorId?: string, period?: string): Promise<number> {
    if (!vendorId) return 0;
    
    // Calculate sales volume for the period
    // This would query the orders/sales data
    return 150000; // Mock value
  }

  private determineCommissionTier(salesVolume: number, tiers: any[]) {
    let currentTier = tiers[0];
    
    for (const tier of tiers) {
      if (salesVolume >= tier.threshold) {
        currentTier = tier;
      } else {
        break;
      }
    }
    
    return currentTier;
  }

  private getNextTierThreshold(salesVolume: number, tiers: any[]) {
    for (const tier of tiers) {
      if (salesVolume < tier.threshold) {
        return {
          threshold: tier.threshold,
          name: tier.name,
          rate: tier.rate,
          remainingAmount: tier.threshold - salesVolume
        };
      }
    }
    
    return null; // Already at highest tier
  }

  private calculateProjectedEarnings(salesVolume: number, baseRate: number, bonusRate: number): number {
    return salesVolume * (baseRate + bonusRate);
  }

  private getPerformanceTier(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  }

  private parseSettlementPeriod(period: string) {
    // Parse settlement period (e.g., "2024-01", "2024-Q1")
    const [year, periodSpec] = period.split('-');
    const yearNum = parseInt(year);
    
    if (periodSpec.startsWith('Q')) {
      const quarter = parseInt(periodSpec.substring(1));
      const startMonth = (quarter - 1) * 3;
      return {
        startDate: new Date(yearNum, startMonth, 1),
        endDate: new Date(yearNum, startMonth + 3, 0)
      };
    } else {
      const month = parseInt(periodSpec) - 1;
      return {
        startDate: new Date(yearNum, month, 1),
        endDate: new Date(yearNum, month + 1, 0)
      };
    }
  }

  private async getCommissionRecords(filters: {
    vendorId?: string;
    startDate?: Date;
    endDate?: Date;
    includeSettled?: boolean;
    page?: number;
    limit?: number;
  }) {
    // Get commission records from database
    // This is a simplified implementation
    return [];
  }
}