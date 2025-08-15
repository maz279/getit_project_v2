/**
 * Finance Service - Enterprise Financial Management
 * Amazon.com/Shopee.sg level financial operations and analytics
 */

import { db } from '../../../../db';
import { 
  orders, 
  orderItems, 
  vendors, 
  products, 
  paymentTransactions,
  vendorPayouts,
  vendorCommissions
} from '@shared/schema';
import { eq, and, desc, sql, gte, lte, count, sum, avg, between } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService';

export class FinanceService {
  private redisService: RedisService;
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor() {
    this.redisService = new RedisService();
  }

  /**
   * Get financial overview dashboard
   */
  async getFinancialOverview(timeframe: string, vendorId?: string): Promise<any> {
    try {
      const cacheKey = `finance:overview:${timeframe}${vendorId ? `:${vendorId}` : ''}`;
      
      // Try cache first
      const cached = await this.redisService.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      // Calculate timeframe
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const overview: any = {};

      // Total revenue
      let revenueQuery = db.select({
        totalRevenue: sql<number>`SUM(CAST(${orders.total} AS DECIMAL))`,
        orderCount: count(orders.id)
      }).from(orders).where(gte(orders.createdAt, startDate));

      if (vendorId) {
        revenueQuery = revenueQuery.where(and(
          gte(orders.createdAt, startDate),
          eq(orders.vendorId, vendorId)
        ));
      }

      const [revenueData] = await revenueQuery;
      overview.revenue = revenueData;

      // Commission calculations
      if (vendorId) {
        overview.commissions = await this.calculateVendorCommissions(vendorId, startDate);
      } else {
        overview.platformCommissions = await this.calculatePlatformCommissions(startDate);
      }

      // Payment method breakdown
      overview.paymentMethods = await this.getPaymentMethodBreakdown(startDate, vendorId);

      // Monthly trends
      overview.trends = await this.getRevenueTrends(timeframe, vendorId);

      // Pending payouts
      if (vendorId) {
        overview.pendingPayouts = await this.getPendingPayouts(vendorId);
      }

      // Cache the result
      await this.redisService.cacheData(cacheKey, overview, this.CACHE_TTL);

      return overview;

    } catch (error) {
      console.error('Error getting financial overview:', error);
      throw error;
    }
  }

  /**
   * Get vendor commission details
   */
  async getVendorCommissions(vendorId: string, options: any): Promise<any> {
    try {
      const { startDate, endDate, status, page = 1, limit = 50 } = options;
      const offset = (page - 1) * limit;

      let query = db.select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productName: orderItems.name,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        totalPrice: orderItems.totalPrice,
        commissionRate: sql<number>`COALESCE(${commissionSettings.rate}, 15.0)`,
        commissionAmount: sql<number>`(CAST(${orderItems.totalPrice} AS DECIMAL) * COALESCE(${commissionSettings.rate}, 15.0) / 100)`,
        status: orderItems.status,
        createdAt: orderItems.createdAt
      })
      .from(orderItems)
      .leftJoin(commissionSettings, eq(commissionSettings.vendorId, vendorId))
      .where(eq(orderItems.vendorId, vendorId));

      // Apply date filters
      if (startDate) {
        query = query.where(and(
          eq(orderItems.vendorId, vendorId),
          gte(orderItems.createdAt, startDate)
        ));
      }

      if (endDate) {
        query = query.where(and(
          eq(orderItems.vendorId, vendorId),
          lte(orderItems.createdAt, endDate)
        ));
      }

      // Apply status filter
      if (status && status !== 'all') {
        query = query.where(and(
          eq(orderItems.vendorId, vendorId),
          eq(orderItems.status, status)
        ));
      }

      const commissions = await query
        .orderBy(desc(orderItems.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(orderItems)
        .where(eq(orderItems.vendorId, vendorId));

      // Calculate summary
      const [summary] = await db
        .select({
          totalCommission: sql<number>`SUM(CAST(${orderItems.totalPrice} AS DECIMAL) * COALESCE(${commissionSettings.rate}, 15.0) / 100)`,
          totalOrders: count(orderItems.id),
          totalRevenue: sql<number>`SUM(CAST(${orderItems.totalPrice} AS DECIMAL))`
        })
        .from(orderItems)
        .leftJoin(commissionSettings, eq(commissionSettings.vendorId, vendorId))
        .where(eq(orderItems.vendorId, vendorId));

      return {
        commissions,
        summary,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };

    } catch (error) {
      console.error('Error getting vendor commissions:', error);
      throw error;
    }
  }

  /**
   * Process vendor payout
   */
  async processVendorPayout(vendorId: string, payoutData: any, processedBy?: number): Promise<any> {
    try {
      const { amount, paymentMethod, bankDetails, notes } = payoutData;

      // Validate vendor exists and has sufficient balance
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      if (!vendor) {
        throw new Error('Vendor not found');
      }

      // Calculate available balance
      const availableBalance = await this.calculateVendorBalance(vendorId);
      
      if (amount > availableBalance) {
        throw new Error(`Insufficient balance. Available: ${availableBalance}, Requested: ${amount}`);
      }

      // Create payout record
      const [payout] = await db
        .insert(vendorPayouts)
        .values({
          vendorId,
          amount: amount.toString(),
          paymentMethod,
          bankDetails,
          notes,
          status: 'processing',
          processedBy: processedBy?.toString(),
          createdAt: new Date()
        })
        .returning();

      // Update commission statuses to 'paid'
      await this.markCommissionsAsPaid(vendorId, amount);

      return payout;

    } catch (error) {
      console.error('Error processing vendor payout:', error);
      throw error;
    }
  }

  /**
   * Get platform revenue analytics
   */
  async getPlatformRevenue(timeframe: string, granularity: string, breakdown: string): Promise<any> {
    try {
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const revenue: any = {};

      // Total platform revenue
      const [totalRevenue] = await db
        .select({
          totalRevenue: sql<number>`SUM(CAST(${orders.total} AS DECIMAL))`,
          totalOrders: count(orders.id),
          averageOrderValue: sql<number>`AVG(CAST(${orders.total} AS DECIMAL))`
        })
        .from(orders)
        .where(gte(orders.createdAt, startDate));

      revenue.overview = totalRevenue;

      // Revenue breakdown by category/vendor/payment method
      if (breakdown === 'category') {
        revenue.categoryBreakdown = await this.getRevenueByCategoryBreakdown(startDate);
      } else if (breakdown === 'vendor') {
        revenue.vendorBreakdown = await this.getRevenueByVendorBreakdown(startDate);
      } else if (breakdown === 'payment') {
        revenue.paymentBreakdown = await this.getPaymentMethodBreakdown(startDate);
      }

      // Time series data based on granularity
      revenue.timeSeries = await this.getRevenueTimeSeries(startDate, granularity);

      return revenue;

    } catch (error) {
      console.error('Error getting platform revenue:', error);
      throw error;
    }
  }

  /**
   * Generate financial report
   */
  async generateFinancialReport(reportType: string, timeframe: string, format: string, vendorId?: string): Promise<any> {
    try {
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let report: any = {};

      switch (reportType) {
        case 'summary':
          report = await this.generateSummaryReport(startDate, vendorId);
          break;
        case 'detailed':
          report = await this.generateDetailedReport(startDate, vendorId);
          break;
        case 'commission':
          report = await this.generateCommissionReport(startDate, vendorId);
          break;
        case 'tax':
          report = await this.generateTaxReportData(startDate, vendorId);
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Format the report
      if (format === 'csv') {
        return this.formatReportAsCsv(report);
      } else if (format === 'pdf') {
        return this.formatReportAsPdf(report);
      }

      return report;

    } catch (error) {
      console.error('Error generating financial report:', error);
      throw error;
    }
  }

  /**
   * Get commission settings
   */
  async getCommissionSettings(vendorId?: string, categoryId?: string): Promise<any> {
    try {
      let query = db.select().from(commissionSettings);

      if (vendorId) {
        query = query.where(eq(commissionSettings.vendorId, vendorId));
      }

      if (categoryId) {
        query = query.where(eq(commissionSettings.categoryId, categoryId));
      }

      const settings = await query;

      return {
        settings,
        defaultRate: 15.0 // Default commission rate
      };

    } catch (error) {
      console.error('Error getting commission settings:', error);
      throw error;
    }
  }

  /**
   * Update commission settings
   */
  async updateCommissionSettings(settingsData: any, updatedBy?: number): Promise<any> {
    try {
      const { vendorId, categoryId, rate, effectiveFrom } = settingsData;

      const [updatedSetting] = await db
        .insert(commissionSettings)
        .values({
          vendorId,
          categoryId,
          rate: rate.toString(),
          effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
          updatedBy: updatedBy?.toString(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: [commissionSettings.vendorId, commissionSettings.categoryId],
          set: {
            rate: rate.toString(),
            effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
            updatedBy: updatedBy?.toString(),
            updatedAt: new Date()
          }
        })
        .returning();

      return updatedSetting;

    } catch (error) {
      console.error('Error updating commission settings:', error);
      throw error;
    }
  }

  /**
   * Generate tax report
   */
  async generateTaxReport(fiscalYear: number, vendorId?: string, reportType: string = 'summary'): Promise<any> {
    try {
      const startDate = new Date(fiscalYear, 6, 1); // Bangladesh fiscal year starts July 1
      const endDate = new Date(fiscalYear + 1, 5, 30); // Ends June 30

      const taxData: any = {};

      // Get revenue data for tax calculation
      let revenueQuery = db.select({
        totalRevenue: sql<number>`SUM(CAST(${orders.total} AS DECIMAL))`,
        taxableRevenue: sql<number>`SUM(CAST(${orders.total} AS DECIMAL) * 0.85)`, // Assuming 15% commission
        vatCollected: sql<number>`SUM(CAST(${orders.total} AS DECIMAL) * 0.15)` // 15% VAT
      }).from(orders).where(between(orders.createdAt, startDate, endDate));

      if (vendorId) {
        revenueQuery = revenueQuery.where(eq(orders.vendorId, vendorId));
      }

      const [revenue] = await revenueQuery;
      taxData.revenue = revenue;

      // Calculate tax obligations (Bangladesh specific)
      taxData.taxes = {
        vatRate: 15, // 15% VAT in Bangladesh
        incomeTaxRate: vendorId ? this.calculateIncomeTaxRate(revenue.taxableRevenue) : 25,
        vatPayable: revenue.vatCollected,
        incomeTaxPayable: revenue.taxableRevenue * (vendorId ? this.calculateIncomeTaxRate(revenue.taxableRevenue) : 25) / 100
      };

      // Get monthly breakdown
      if (reportType === 'detailed') {
        taxData.monthlyBreakdown = await this.getMonthlyTaxBreakdown(startDate, endDate, vendorId);
      }

      return taxData;

    } catch (error) {
      console.error('Error generating tax report:', error);
      throw error;
    }
  }

  /**
   * Calculate order commission
   */
  async calculateOrderCommission(orderId: string): Promise<any> {
    try {
      const orderItemsData = await db
        .select({
          id: orderItems.id,
          vendorId: orderItems.vendorId,
          totalPrice: orderItems.totalPrice,
          commissionRate: sql<number>`COALESCE(${commissionSettings.rate}, 15.0)`
        })
        .from(orderItems)
        .leftJoin(commissionSettings, eq(commissionSettings.vendorId, orderItems.vendorId))
        .where(eq(orderItems.orderId, orderId));

      const commissions = orderItemsData.map(item => ({
        ...item,
        commissionAmount: parseFloat(item.totalPrice) * item.commissionRate / 100
      }));

      const totalCommission = commissions.reduce((sum, item) => sum + item.commissionAmount, 0);

      return {
        orderId,
        commissions,
        totalCommission,
        calculatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error calculating order commission:', error);
      throw error;
    }
  }

  // Private helper methods

  private async calculateVendorCommissions(vendorId: string, startDate: Date): Promise<any> {
    const [commissions] = await db
      .select({
        totalCommission: sql<number>`SUM(CAST(${orderItems.totalPrice} AS DECIMAL) * COALESCE(${commissionSettings.rate}, 15.0) / 100)`,
        paidCommission: sql<number>`SUM(CASE WHEN ${orderItems.status} = 'paid' THEN CAST(${orderItems.totalPrice} AS DECIMAL) * COALESCE(${commissionSettings.rate}, 15.0) / 100 ELSE 0 END)`,
        pendingCommission: sql<number>`SUM(CASE WHEN ${orderItems.status} = 'pending' THEN CAST(${orderItems.totalPrice} AS DECIMAL) * COALESCE(${commissionSettings.rate}, 15.0) / 100 ELSE 0 END)`
      })
      .from(orderItems)
      .leftJoin(commissionSettings, eq(commissionSettings.vendorId, vendorId))
      .where(and(
        eq(orderItems.vendorId, vendorId),
        gte(orderItems.createdAt, startDate)
      ));

    return commissions;
  }

  private async calculatePlatformCommissions(startDate: Date): Promise<any> {
    const [commissions] = await db
      .select({
        totalCommission: sql<number>`SUM(CAST(${orderItems.totalPrice} AS DECIMAL) * COALESCE(${commissionSettings.rate}, 15.0) / 100)`,
        commissionCount: count(orderItems.id)
      })
      .from(orderItems)
      .leftJoin(commissionSettings, eq(commissionSettings.vendorId, orderItems.vendorId))
      .where(gte(orderItems.createdAt, startDate));

    return commissions;
  }

  private async getPaymentMethodBreakdown(startDate: Date, vendorId?: string): Promise<any[]> {
    let query = db.select({
      paymentMethod: orders.paymentMethod,
      totalRevenue: sql<number>`SUM(CAST(${orders.total} AS DECIMAL))`,
      orderCount: count(orders.id)
    }).from(orders).where(gte(orders.createdAt, startDate));

    if (vendorId) {
      query = query.where(and(
        gte(orders.createdAt, startDate),
        eq(orders.vendorId, vendorId)
      ));
    }

    return await query.groupBy(orders.paymentMethod);
  }

  private async getRevenueTrends(timeframe: string, vendorId?: string): Promise<any[]> {
    // Implementation for revenue trends calculation
    return [];
  }

  private async getPendingPayouts(vendorId: string): Promise<any> {
    const [pendingPayout] = await db
      .select({
        amount: vendorPayouts.amount,
        status: vendorPayouts.status,
        createdAt: vendorPayouts.createdAt
      })
      .from(vendorPayouts)
      .where(and(
        eq(vendorPayouts.vendorId, vendorId),
        eq(vendorPayouts.status, 'pending')
      ))
      .orderBy(desc(vendorPayouts.createdAt))
      .limit(1);

    return pendingPayout;
  }

  private async calculateVendorBalance(vendorId: string): Promise<number> {
    // Calculate available balance for vendor
    return 0; // Placeholder implementation
  }

  private async markCommissionsAsPaid(vendorId: string, amount: number): Promise<void> {
    // Mark commissions as paid up to the payout amount
    // Placeholder implementation
  }

  private calculateIncomeTaxRate(income: number): number {
    // Bangladesh income tax rates for businesses
    if (income <= 300000) return 0;
    if (income <= 900000) return 10;
    if (income <= 1500000) return 15;
    if (income <= 3000000) return 20;
    return 25;
  }

  // Additional private methods for report generation
  private async getRevenueByCategoryBreakdown(startDate: Date): Promise<any[]> { return []; }
  private async getRevenueByVendorBreakdown(startDate: Date): Promise<any[]> { return []; }
  private async getRevenueTimeSeries(startDate: Date, granularity: string): Promise<any[]> { return []; }
  private async generateSummaryReport(startDate: Date, vendorId?: string): Promise<any> { return {}; }
  private async generateDetailedReport(startDate: Date, vendorId?: string): Promise<any> { return {}; }
  private async generateCommissionReport(startDate: Date, vendorId?: string): Promise<any> { return {}; }
  private async generateTaxReportData(startDate: Date, vendorId?: string): Promise<any> { return {}; }
  private async getMonthlyTaxBreakdown(startDate: Date, endDate: Date, vendorId?: string): Promise<any[]> { return []; }
  private formatReportAsCsv(report: any): string { return ''; }
  private formatReportAsPdf(report: any): any { return {}; }
}