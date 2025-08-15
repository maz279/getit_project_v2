/**
 * Vendor Performance Aggregator
 * Comprehensive vendor analytics for Amazon.com/Shopee.sg-level marketplace
 */

import { db } from '../../../db';
import { vendors, orders, orderItems, products, categories, reviews } from '../../../../shared/schema';
import { eq, and, gte, lte, sum, count, avg, desc, sql } from 'drizzle-orm';

export interface VendorAggregationOptions {
  startDate: Date;
  endDate: Date;
  vendorId?: string;
  categoryId?: string;
  includeFinancials?: boolean;
  includeProductMetrics?: boolean;
  includeCustomerMetrics?: boolean;
}

export interface VendorPerformanceMetrics {
  vendorSummary: {
    totalVendors: number;
    activeVendors: number;
    newVendors: number;
    averageRating: number;
    totalRevenue: number;
    totalCommission: number;
  };
  topPerformers: Array<{
    vendorId: string;
    vendorName: string;
    businessName: string;
    revenue: number;
    orders: number;
    products: number;
    rating: number;
    commission: number;
    growthRate: number;
    status: string;
  }>;
  categoryPerformance: Array<{
    categoryId: string;
    categoryName: string;
    vendorCount: number;
    totalRevenue: number;
    averageRating: number;
    topVendor: string;
  }>;
  financialMetrics: {
    totalPayouts: number;
    pendingPayouts: number;
    averageCommissionRate: number;
    revenueByPaymentMethod: Array<{
      method: string;
      revenue: number;
      vendorCount: number;
    }>;
  };
  performanceTrends: Array<{
    period: string;
    newVendors: number;
    activeVendors: number;
    totalRevenue: number;
    averageOrderValue: number;
  }>;
  riskAnalysis: {
    lowPerformingVendors: Array<{
      vendorId: string;
      vendorName: string;
      issues: string[];
      riskScore: number;
    }>;
    complianceIssues: Array<{
      vendorId: string;
      issueType: string;
      severity: string;
      reportedAt: Date;
    }>;
  };
}

export class VendorAggregator {

  /**
   * Get comprehensive vendor performance metrics
   */
  async getVendorPerformanceMetrics(options: VendorAggregationOptions): Promise<VendorPerformanceMetrics> {
    try {
      const { startDate, endDate, vendorId, categoryId } = options;

      // Build base conditions
      const orderConditions = [
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      ];

      if (vendorId) {
        orderConditions.push(eq(orders.vendorId, vendorId));
      }

      // Vendor summary metrics
      const [vendorSummaryData] = await db
        .select({
          totalVendors: sql`COUNT(DISTINCT ${vendors.id})`,
          activeVendors: sql`COUNT(DISTINCT CASE WHEN ${vendors.status} = 'active' THEN ${vendors.id} END)`,
          newVendors: sql`COUNT(DISTINCT CASE WHEN ${vendors.createdAt} >= ${startDate} THEN ${vendors.id} END)`,
          averageRating: avg(vendors.rating),
          totalRevenue: sum(orders.totalAmount),
          totalCommission: sum(sql`${orders.totalAmount} * 0.05`)
        })
        .from(vendors)
        .leftJoin(orders, and(
          eq(orders.vendorId, vendors.id),
          ...orderConditions
        ));

      const vendorSummary = {
        totalVendors: Number(vendorSummaryData.totalVendors) || 0,
        activeVendors: Number(vendorSummaryData.activeVendors) || 0,
        newVendors: Number(vendorSummaryData.newVendors) || 0,
        averageRating: Number(vendorSummaryData.averageRating) || 0,
        totalRevenue: Number(vendorSummaryData.totalRevenue) || 0,
        totalCommission: Number(vendorSummaryData.totalCommission) || 0
      };

      // Top performing vendors
      const topPerformersData = await db
        .select({
          vendorId: vendors.id,
          vendorName: vendors.contactName,
          businessName: vendors.businessName,
          revenue: sum(orders.totalAmount),
          orders: count(orders.id),
          products: sql`COUNT(DISTINCT ${products.id})`,
          rating: avg(vendors.rating),
          commission: sum(sql`${orders.totalAmount} * 0.05`),
          status: vendors.status,
          vendorCreatedAt: vendors.createdAt
        })
        .from(vendors)
        .leftJoin(orders, and(eq(orders.vendorId, vendors.id), ...orderConditions))
        .leftJoin(products, eq(products.vendorId, vendors.id))
        .where(eq(vendors.status, 'active'))
        .groupBy(vendors.id, vendors.contactName, vendors.businessName, vendors.rating, vendors.status, vendors.createdAt)
        .orderBy(desc(sum(orders.totalAmount)))
        .limit(20);

      // Calculate growth rates for top performers
      const topPerformers = await Promise.all(
        topPerformersData.map(async (vendor) => {
          // Calculate growth rate compared to previous period
          const periodDuration = endDate.getTime() - startDate.getTime();
          const previousStartDate = new Date(startDate.getTime() - periodDuration);
          const previousEndDate = new Date(endDate.getTime() - periodDuration);

          const [previousRevenue] = await db
            .select({
              revenue: sum(orders.totalAmount)
            })
            .from(orders)
            .where(and(
              eq(orders.vendorId, vendor.vendorId),
              gte(orders.createdAt, previousStartDate),
              lte(orders.createdAt, previousEndDate)
            ));

          const currentRevenue = Number(vendor.revenue) || 0;
          const prevRevenue = Number(previousRevenue?.revenue) || 0;
          const growthRate = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

          return {
            vendorId: vendor.vendorId,
            vendorName: vendor.vendorName || '',
            businessName: vendor.businessName || '',
            revenue: currentRevenue,
            orders: Number(vendor.orders) || 0,
            products: Number(vendor.products) || 0,
            rating: Number(vendor.rating) || 0,
            commission: Number(vendor.commission) || 0,
            growthRate,
            status: vendor.status || 'active'
          };
        })
      );

      // Category performance analysis
      const categoryPerformanceData = await db
        .select({
          categoryId: categories.id,
          categoryName: categories.name,
          vendorCount: sql`COUNT(DISTINCT ${vendors.id})`,
          totalRevenue: sum(orders.totalAmount),
          averageRating: avg(vendors.rating)
        })
        .from(categories)
        .leftJoin(products, eq(products.categoryId, categories.id))
        .leftJoin(vendors, eq(vendors.id, products.vendorId))
        .leftJoin(orders, and(eq(orders.vendorId, vendors.id), ...orderConditions))
        .groupBy(categories.id, categories.name)
        .orderBy(desc(sum(orders.totalAmount)))
        .limit(15);

      // Get top vendor for each category
      const categoryPerformance = await Promise.all(
        categoryPerformanceData.map(async (category) => {
          const [topVendorData] = await db
            .select({
              vendorName: vendors.businessName
            })
            .from(vendors)
            .leftJoin(products, eq(products.vendorId, vendors.id))
            .leftJoin(orders, and(eq(orders.vendorId, vendors.id), ...orderConditions))
            .where(eq(products.categoryId, category.categoryId))
            .groupBy(vendors.id, vendors.businessName)
            .orderBy(desc(sum(orders.totalAmount)))
            .limit(1);

          return {
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            vendorCount: Number(category.vendorCount) || 0,
            totalRevenue: Number(category.totalRevenue) || 0,
            averageRating: Number(category.averageRating) || 0,
            topVendor: topVendorData?.vendorName || 'N/A'
          };
        })
      );

      // Financial metrics
      const payoutData = await db
        .select({
          totalPayouts: sum(sql`${orders.totalAmount} * 0.95`), // 95% to vendor, 5% commission
          pendingPayouts: sum(sql`CASE WHEN ${orders.status} = 'completed' AND ${orders.payoutStatus} != 'paid' THEN ${orders.totalAmount} * 0.95 ELSE 0 END`),
          averageCommissionRate: sql`AVG(0.05)`
        })
        .from(orders)
        .where(and(...orderConditions));

      const revenueByPaymentMethodData = await db
        .select({
          method: orders.paymentMethod,
          revenue: sum(orders.totalAmount),
          vendorCount: sql`COUNT(DISTINCT ${orders.vendorId})`
        })
        .from(orders)
        .where(and(...orderConditions))
        .groupBy(orders.paymentMethod)
        .orderBy(desc(sum(orders.totalAmount)));

      const financialMetrics = {
        totalPayouts: Number(payoutData[0]?.totalPayouts) || 0,
        pendingPayouts: Number(payoutData[0]?.pendingPayouts) || 0,
        averageCommissionRate: Number(payoutData[0]?.averageCommissionRate) || 5.0,
        revenueByPaymentMethod: revenueByPaymentMethodData.map(item => ({
          method: item.method,
          revenue: Number(item.revenue),
          vendorCount: Number(item.vendorCount)
        }))
      };

      // Performance trends (weekly aggregation)
      const performanceTrendsData = await db
        .select({
          week: sql`DATE_TRUNC('week', ${orders.createdAt})`,
          newVendors: sql`COUNT(DISTINCT CASE WHEN ${vendors.createdAt} >= DATE_TRUNC('week', ${orders.createdAt}) THEN ${vendors.id} END)`,
          activeVendors: sql`COUNT(DISTINCT ${orders.vendorId})`,
          totalRevenue: sum(orders.totalAmount),
          averageOrderValue: avg(orders.totalAmount)
        })
        .from(orders)
        .leftJoin(vendors, eq(vendors.id, orders.vendorId))
        .where(and(...orderConditions))
        .groupBy(sql`DATE_TRUNC('week', ${orders.createdAt})`)
        .orderBy(sql`DATE_TRUNC('week', ${orders.createdAt})`);

      const performanceTrends = performanceTrendsData.map(item => ({
        period: String(item.week),
        newVendors: Number(item.newVendors),
        activeVendors: Number(item.activeVendors),
        totalRevenue: Number(item.totalRevenue),
        averageOrderValue: Number(item.averageOrderValue)
      }));

      // Risk analysis - Low performing vendors
      const lowPerformingVendorsData = await db
        .select({
          vendorId: vendors.id,
          vendorName: vendors.businessName,
          revenue: sum(orders.totalAmount),
          orders: count(orders.id),
          rating: avg(vendors.rating),
          lastOrderDate: sql`MAX(${orders.createdAt})`
        })
        .from(vendors)
        .leftJoin(orders, and(eq(orders.vendorId, vendors.id), ...orderConditions))
        .where(eq(vendors.status, 'active'))
        .groupBy(vendors.id, vendors.businessName, vendors.rating)
        .having(sql`(${sum(orders.totalAmount)} < 10000 OR ${avg(vendors.rating)} < 3.0 OR ${sql`MAX(${orders.createdAt})`} < NOW() - INTERVAL '30 days')`)
        .limit(20);

      const lowPerformingVendors = lowPerformingVendorsData.map(vendor => {
        const issues: string[] = [];
        const revenue = Number(vendor.revenue) || 0;
        const rating = Number(vendor.rating) || 0;
        const lastOrder = vendor.lastOrderDate ? new Date(vendor.lastOrderDate) : null;
        const daysSinceLastOrder = lastOrder ? (Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24) : Infinity;

        if (revenue < 10000) issues.push('Low revenue');
        if (rating < 3.0) issues.push('Poor rating');
        if (daysSinceLastOrder > 30) issues.push('Inactive');

        let riskScore = 0;
        if (revenue < 5000) riskScore += 30;
        else if (revenue < 10000) riskScore += 15;
        if (rating < 2.0) riskScore += 40;
        else if (rating < 3.0) riskScore += 20;
        if (daysSinceLastOrder > 60) riskScore += 30;
        else if (daysSinceLastOrder > 30) riskScore += 15;

        return {
          vendorId: vendor.vendorId,
          vendorName: vendor.vendorName || '',
          issues,
          riskScore: Math.min(riskScore, 100)
        };
      });

      // Compliance issues (placeholder - would integrate with compliance system)
      const complianceIssues = [
        {
          vendorId: 'vendor-123',
          issueType: 'Missing tax documentation',
          severity: 'medium',
          reportedAt: new Date()
        }
      ];

      const riskAnalysis = {
        lowPerformingVendors,
        complianceIssues
      };

      return {
        vendorSummary,
        topPerformers,
        categoryPerformance,
        financialMetrics,
        performanceTrends,
        riskAnalysis
      };

    } catch (error) {
      console.error('Error in vendor performance aggregation:', error);
      throw new Error(`Vendor aggregation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get vendor onboarding analytics
   */
  async getVendorOnboardingMetrics(options: { startDate: Date; endDate: Date }): Promise<{
    totalApplications: number;
    approvedVendors: number;
    rejectedVendors: number;
    pendingApplications: number;
    averageApprovalTime: number;
    onboardingFunnel: Array<{
      stage: string;
      count: number;
      conversionRate: number;
    }>;
    kycCompletionRate: number;
  }> {
    try {
      const { startDate, endDate } = options;

      // Vendor application metrics
      const [applicationMetrics] = await db
        .select({
          total: count(vendors.id),
          approved: sql`COUNT(CASE WHEN ${vendors.status} = 'active' THEN 1 END)`,
          rejected: sql`COUNT(CASE WHEN ${vendors.status} = 'rejected' THEN 1 END)`,
          pending: sql`COUNT(CASE WHEN ${vendors.status} = 'pending' THEN 1 END)`,
          averageApprovalTime: sql`AVG(EXTRACT(EPOCH FROM (${vendors.updatedAt} - ${vendors.createdAt})) / 86400)`
        })
        .from(vendors)
        .where(and(
          gte(vendors.createdAt, startDate),
          lte(vendors.createdAt, endDate)
        ));

      // Onboarding funnel analysis
      const onboardingFunnel = [
        {
          stage: 'Application Started',
          count: Number(applicationMetrics?.total) || 0,
          conversionRate: 100
        },
        {
          stage: 'KYC Completed',
          count: Number(applicationMetrics?.approved) + Number(applicationMetrics?.rejected) || 0,
          conversionRate: 0
        },
        {
          stage: 'Approved',
          count: Number(applicationMetrics?.approved) || 0,
          conversionRate: 0
        },
        {
          stage: 'First Sale',
          count: 0, // Would need integration with sales data
          conversionRate: 0
        }
      ];

      // Calculate conversion rates
      const totalApplications = onboardingFunnel[0].count;
      onboardingFunnel.forEach((stage, index) => {
        if (index > 0 && totalApplications > 0) {
          stage.conversionRate = (stage.count / totalApplications) * 100;
        }
      });

      return {
        totalApplications: Number(applicationMetrics?.total) || 0,
        approvedVendors: Number(applicationMetrics?.approved) || 0,
        rejectedVendors: Number(applicationMetrics?.rejected) || 0,
        pendingApplications: Number(applicationMetrics?.pending) || 0,
        averageApprovalTime: Number(applicationMetrics?.averageApprovalTime) || 0,
        onboardingFunnel,
        kycCompletionRate: totalApplications > 0 ? 
          ((Number(applicationMetrics?.approved) + Number(applicationMetrics?.rejected)) / totalApplications) * 100 : 0
      };

    } catch (error) {
      console.error('Error in vendor onboarding metrics:', error);
      throw new Error(`Vendor onboarding metrics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Bangladesh-specific vendor metrics
   */
  async getBangladeshVendorMetrics(options: VendorAggregationOptions): Promise<{
    vendorsByDivision: Array<{ division: string; count: number; revenue: number }>;
    businessTypes: Array<{ type: string; count: number; averageRevenue: number }>;
    paymentMethodPreferences: Array<{ method: string; vendorCount: number; preference: number }>;
    complianceStatus: {
      tradeLicenseCompliant: number;
      taxCompliant: number;
      bankDetailsVerified: number;
    };
  }> {
    try {
      const { startDate, endDate } = options;

      // Vendors by Bangladesh division
      const vendorsByDivisionData = await db
        .select({
          division: sql`COALESCE(${vendors.address}->>'division', 'Unknown')`,
          count: count(vendors.id),
          revenue: sum(orders.totalAmount)
        })
        .from(vendors)
        .leftJoin(orders, and(
          eq(orders.vendorId, vendors.id),
          gte(orders.createdAt, startDate),
          lte(orders.createdAt, endDate)
        ))
        .groupBy(sql`${vendors.address}->>'division'`)
        .orderBy(desc(count(vendors.id)));

      const vendorsByDivision = vendorsByDivisionData.map(item => ({
        division: String(item.division),
        count: Number(item.count),
        revenue: Number(item.revenue) || 0
      }));

      // Business types analysis
      const businessTypesData = await db
        .select({
          type: vendors.businessType,
          count: count(vendors.id),
          averageRevenue: avg(orders.totalAmount)
        })
        .from(vendors)
        .leftJoin(orders, and(
          eq(orders.vendorId, vendors.id),
          gte(orders.createdAt, startDate),
          lte(orders.createdAt, endDate)
        ))
        .groupBy(vendors.businessType)
        .orderBy(desc(count(vendors.id)));

      const businessTypes = businessTypesData.map(item => ({
        type: item.type || 'Unknown',
        count: Number(item.count),
        averageRevenue: Number(item.averageRevenue) || 0
      }));

      // Payment method preferences
      const paymentPreferencesData = await db
        .select({
          method: orders.paymentMethod,
          vendorCount: sql`COUNT(DISTINCT ${orders.vendorId})`,
          totalOrders: count(orders.id)
        })
        .from(orders)
        .where(and(
          gte(orders.createdAt, startDate),
          lte(orders.createdAt, endDate)
        ))
        .groupBy(orders.paymentMethod);

      const totalVendorsWithOrders = await db
        .select({
          count: sql`COUNT(DISTINCT ${orders.vendorId})`
        })
        .from(orders)
        .where(and(
          gte(orders.createdAt, startDate),
          lte(orders.createdAt, endDate)
        ));

      const totalVendors = Number(totalVendorsWithOrders[0]?.count) || 1;
      const paymentMethodPreferences = paymentPreferencesData.map(item => ({
        method: item.method,
        vendorCount: Number(item.vendorCount),
        preference: (Number(item.vendorCount) / totalVendors) * 100
      }));

      // Compliance status (placeholder - would integrate with KYC system)
      const [complianceData] = await db
        .select({
          tradeLicenseCompliant: sql`COUNT(CASE WHEN ${vendors.tradeLicenseNumber} IS NOT NULL THEN 1 END)`,
          taxCompliant: sql`COUNT(CASE WHEN ${vendors.tinNumber} IS NOT NULL THEN 1 END)`,
          bankDetailsVerified: sql`COUNT(CASE WHEN ${vendors.bankAccountNumber} IS NOT NULL THEN 1 END)`
        })
        .from(vendors)
        .where(eq(vendors.status, 'active'));

      const complianceStatus = {
        tradeLicenseCompliant: Number(complianceData?.tradeLicenseCompliant) || 0,
        taxCompliant: Number(complianceData?.taxCompliant) || 0,
        bankDetailsVerified: Number(complianceData?.bankDetailsVerified) || 0
      };

      return {
        vendorsByDivision,
        businessTypes,
        paymentMethodPreferences,
        complianceStatus
      };

    } catch (error) {
      console.error('Error in Bangladesh vendor metrics:', error);
      throw new Error(`Bangladesh vendor metrics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const vendorAggregator = new VendorAggregator();