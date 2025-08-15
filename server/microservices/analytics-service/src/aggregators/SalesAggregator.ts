/**
 * Sales Data Aggregator
 * Comprehensive sales data aggregation for Amazon.com/Shopee.sg-level analytics
 */

import { db } from '../../../db';
import { orders, orderItems, products, vendors, customers } from '../../../../shared/schema';
import { eq, and, gte, lte, sum, count, avg, desc, sql } from 'drizzle-orm';

export interface SalesAggregationOptions {
  startDate: Date;
  endDate: Date;
  vendorId?: string;
  categoryId?: string;
  regionId?: string;
  paymentMethod?: string;
  includePredictions?: boolean;
  includeComparisons?: boolean;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  conversionRate: number;
  revenueGrowth: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    revenue: number;
    unitsSold: number;
    averagePrice: number;
  }>;
  revenueByPaymentMethod: Array<{
    method: string;
    revenue: number;
    percentage: number;
    orders: number;
  }>;
  revenueByRegion: Array<{
    region: string;
    revenue: number;
    percentage: number;
    orders: number;
  }>;
  salesTrends: Array<{
    date: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  }>;
  vendorPerformance?: Array<{
    vendorId: string;
    vendorName: string;
    revenue: number;
    orders: number;
    commission: number;
    rating: number;
  }>;
}

export class SalesAggregator {
  
  /**
   * Get comprehensive sales metrics
   */
  async getSalesMetrics(options: SalesAggregationOptions): Promise<SalesMetrics> {
    try {
      const { startDate, endDate, vendorId, categoryId, regionId, paymentMethod } = options;

      // Build base query conditions
      const conditions = [
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      ];

      if (vendorId) {
        conditions.push(eq(orders.vendorId, vendorId));
      }

      if (paymentMethod) {
        conditions.push(eq(orders.paymentMethod, paymentMethod));
      }

      // Core metrics calculation
      const [coreMetrics] = await db
        .select({
          totalRevenue: sum(orders.totalAmount),
          totalOrders: count(orders.id),
          averageOrderValue: avg(orders.totalAmount),
          uniqueCustomers: sql`COUNT(DISTINCT ${orders.userId})`
        })
        .from(orders)
        .where(and(...conditions));

      // Items sold calculation
      const [itemsMetrics] = await db
        .select({
          totalItems: sum(orderItems.quantity)
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(...conditions));

      // Calculate growth compared to previous period
      const periodDuration = endDate.getTime() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - periodDuration);
      const previousEndDate = new Date(endDate.getTime() - periodDuration);

      const [previousMetrics] = await db
        .select({
          previousRevenue: sum(orders.totalAmount)
        })
        .from(orders)
        .where(and(
          gte(orders.createdAt, previousStartDate),
          lte(orders.createdAt, previousEndDate),
          ...(vendorId ? [eq(orders.vendorId, vendorId)] : [])
        ));

      const revenueGrowth = previousMetrics?.previousRevenue 
        ? ((Number(coreMetrics.totalRevenue) - Number(previousMetrics.previousRevenue)) / Number(previousMetrics.previousRevenue)) * 100
        : 0;

      // Top products
      const topProducts = await db
        .select({
          productId: products.id,
          productName: products.name,
          revenue: sum(sql`${orderItems.quantity} * ${orderItems.unitPrice}`),
          unitsSold: sum(orderItems.quantity),
          averagePrice: avg(orderItems.unitPrice)
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(and(...conditions))
        .groupBy(products.id, products.name)
        .orderBy(desc(sum(sql`${orderItems.quantity} * ${orderItems.unitPrice}`)))
        .limit(10);

      // Revenue by payment method
      const revenueByPaymentMethod = await db
        .select({
          method: orders.paymentMethod,
          revenue: sum(orders.totalAmount),
          orders: count(orders.id)
        })
        .from(orders)
        .where(and(...conditions))
        .groupBy(orders.paymentMethod)
        .orderBy(desc(sum(orders.totalAmount)));

      const totalRevenueForPercentage = Number(coreMetrics.totalRevenue);
      const paymentMethodsWithPercentage = revenueByPaymentMethod.map(item => ({
        method: item.method,
        revenue: Number(item.revenue),
        percentage: totalRevenueForPercentage ? (Number(item.revenue) / totalRevenueForPercentage) * 100 : 0,
        orders: Number(item.orders)
      }));

      // Sales trends (daily aggregation)
      const salesTrends = await db
        .select({
          date: sql`DATE(${orders.createdAt})`,
          revenue: sum(orders.totalAmount),
          orders: count(orders.id),
          averageOrderValue: avg(orders.totalAmount)
        })
        .from(orders)
        .where(and(...conditions))
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

      // Regional performance (placeholder for now)
      const revenueByRegion = await db
        .select({
          region: sql`COALESCE(${orders.shippingAddress}->>'division', 'Unknown')`,
          revenue: sum(orders.totalAmount),
          orders: count(orders.id)
        })
        .from(orders)
        .where(and(...conditions))
        .groupBy(sql`${orders.shippingAddress}->>'division'`)
        .orderBy(desc(sum(orders.totalAmount)));

      const regionsWithPercentage = revenueByRegion.map(item => ({
        region: String(item.region),
        revenue: Number(item.revenue),
        percentage: totalRevenueForPercentage ? (Number(item.revenue) / totalRevenueForPercentage) * 100 : 0,
        orders: Number(item.orders)
      }));

      // Vendor performance (if not filtering by specific vendor)
      let vendorPerformance;
      if (!vendorId) {
        const vendorData = await db
          .select({
            vendorId: vendors.id,
            vendorName: vendors.businessName,
            revenue: sum(orders.totalAmount),
            orders: count(orders.id),
            commission: sum(sql`${orders.totalAmount} * 0.05`), // 5% commission rate
            rating: avg(sql`COALESCE(${vendors.rating}, 0)`)
          })
          .from(orders)
          .innerJoin(vendors, eq(orders.vendorId, vendors.id))
          .where(and(...conditions))
          .groupBy(vendors.id, vendors.businessName, vendors.rating)
          .orderBy(desc(sum(orders.totalAmount)))
          .limit(20);

        vendorPerformance = vendorData.map(item => ({
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          revenue: Number(item.revenue),
          orders: Number(item.orders),
          commission: Number(item.commission),
          rating: Number(item.rating) || 0
        }));
      }

      // Calculate conversion rate (placeholder - would need traffic data)
      const conversionRate = 2.5; // Average e-commerce conversion rate

      return {
        totalRevenue: Number(coreMetrics.totalRevenue) || 0,
        totalOrders: Number(coreMetrics.totalOrders) || 0,
        totalItems: Number(itemsMetrics.totalItems) || 0,
        averageOrderValue: Number(coreMetrics.averageOrderValue) || 0,
        uniqueCustomers: Number(coreMetrics.uniqueCustomers) || 0,
        conversionRate,
        revenueGrowth,
        topProducts: topProducts.map(item => ({
          productId: item.productId,
          productName: item.productName,
          revenue: Number(item.revenue),
          unitsSold: Number(item.unitsSold),
          averagePrice: Number(item.averagePrice)
        })),
        revenueByPaymentMethod: paymentMethodsWithPercentage,
        revenueByRegion: regionsWithPercentage,
        salesTrends: salesTrends.map(item => ({
          date: String(item.date),
          revenue: Number(item.revenue),
          orders: Number(item.orders),
          averageOrderValue: Number(item.averageOrderValue)
        })),
        vendorPerformance
      };

    } catch (error) {
      console.error('Error in sales aggregation:', error);
      throw new Error(`Sales aggregation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get real-time sales metrics (last 24 hours)
   */
  async getRealTimeSalesMetrics(): Promise<{
    todayRevenue: number;
    todayOrders: number;
    hourlyTrends: Array<{ hour: number; revenue: number; orders: number }>;
    lastOrderTime: Date | null;
  }> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Today's metrics
      const [todayMetrics] = await db
        .select({
          revenue: sum(orders.totalAmount),
          orders: count(orders.id),
          lastOrder: sql`MAX(${orders.createdAt})`
        })
        .from(orders)
        .where(gte(orders.createdAt, startOfDay));

      // Hourly trends for last 24 hours
      const hourlyTrends = await db
        .select({
          hour: sql`EXTRACT(HOUR FROM ${orders.createdAt})`,
          revenue: sum(orders.totalAmount),
          orders: count(orders.id)
        })
        .from(orders)
        .where(gte(orders.createdAt, new Date(now.getTime() - 24 * 60 * 60 * 1000)))
        .groupBy(sql`EXTRACT(HOUR FROM ${orders.createdAt})`)
        .orderBy(sql`EXTRACT(HOUR FROM ${orders.createdAt})`);

      return {
        todayRevenue: Number(todayMetrics?.revenue) || 0,
        todayOrders: Number(todayMetrics?.orders) || 0,
        hourlyTrends: hourlyTrends.map(item => ({
          hour: Number(item.hour),
          revenue: Number(item.revenue),
          orders: Number(item.orders)
        })),
        lastOrderTime: todayMetrics?.lastOrder ? new Date(todayMetrics.lastOrder) : null
      };

    } catch (error) {
      console.error('Error in real-time sales metrics:', error);
      throw new Error(`Real-time sales metrics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Bangladesh-specific sales metrics
   */
  async getBangladeshSalesMetrics(options: SalesAggregationOptions): Promise<{
    revenueByDivision: Array<{ division: string; revenue: number; orders: number; percentage: number }>;
    paymentMethodBreakdown: Array<{ method: string; revenue: number; adoption: number }>;
    festivalImpact: Array<{ festival: string; revenue: number; growth: number }>;
    mobileVsDesktop: { mobile: number; desktop: number };
  }> {
    try {
      const { startDate, endDate } = options;
      const conditions = [
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      ];

      // Revenue by Bangladesh divisions
      const divisionRevenue = await db
        .select({
          division: sql`COALESCE(${orders.shippingAddress}->>'division', 'Unknown')`,
          revenue: sum(orders.totalAmount),
          orders: count(orders.id)
        })
        .from(orders)
        .where(and(...conditions))
        .groupBy(sql`${orders.shippingAddress}->>'division'`)
        .orderBy(desc(sum(orders.totalAmount)));

      const totalRevenue = divisionRevenue.reduce((sum, item) => sum + Number(item.revenue), 0);
      const revenueByDivision = divisionRevenue.map(item => ({
        division: String(item.division),
        revenue: Number(item.revenue),
        orders: Number(item.orders),
        percentage: totalRevenue ? (Number(item.revenue) / totalRevenue) * 100 : 0
      }));

      // Payment method breakdown with adoption rates
      const paymentMethods = await db
        .select({
          method: orders.paymentMethod,
          revenue: sum(orders.totalAmount),
          orders: count(orders.id)
        })
        .from(orders)
        .where(and(...conditions))
        .groupBy(orders.paymentMethod);

      const totalOrders = paymentMethods.reduce((sum, item) => sum + Number(item.orders), 0);
      const paymentMethodBreakdown = paymentMethods.map(item => ({
        method: item.method,
        revenue: Number(item.revenue),
        adoption: totalOrders ? (Number(item.orders) / totalOrders) * 100 : 0
      }));

      // Festival impact analysis (simplified - would need festival calendar integration)
      const festivalImpact = [
        { festival: 'Eid-ul-Fitr', revenue: 0, growth: 0 },
        { festival: 'Eid-ul-Adha', revenue: 0, growth: 0 },
        { festival: 'Pohela Boishakh', revenue: 0, growth: 0 },
        { festival: 'Durga Puja', revenue: 0, growth: 0 }
      ];

      // Mobile vs Desktop (placeholder - would need device detection)
      const mobileVsDesktop = {
        mobile: 75, // 75% mobile usage in Bangladesh
        desktop: 25
      };

      return {
        revenueByDivision,
        paymentMethodBreakdown,
        festivalImpact,
        mobileVsDesktop
      };

    } catch (error) {
      console.error('Error in Bangladesh sales metrics:', error);
      throw new Error(`Bangladesh sales metrics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const salesAggregator = new SalesAggregator();