/**
 * Analytics Service - Amazon.com/Shopee.sg Level Analytics
 * Enterprise-grade vendor analytics and business intelligence
 */

import { db } from '../../../db';
import { vendorAnalytics, orders, orderItems, products, vendors } from '@shared/schema';
import { eq, and, desc, sum, count, avg, sql, gte, lte } from 'drizzle-orm';
import { AnalyticsQueryOptions, VendorAnalytics, VendorDashboardAnalytics } from '../types/vendor.types';

export class AnalyticsService {
  /**
   * Get vendor analytics for specific period
   */
  async getVendorAnalytics(vendorId: string, options: AnalyticsQueryOptions): Promise<VendorAnalytics[]> {
    try {
      const { period, startDate, endDate } = options;
      
      const conditions = [eq(vendorAnalytics.vendorId, vendorId)];
      
      if (startDate) {
        conditions.push(gte(vendorAnalytics.periodStart, startDate));
      }
      
      if (endDate) {
        conditions.push(lte(vendorAnalytics.periodEnd, endDate));
      }

      return await db.select()
        .from(vendorAnalytics)
        .where(and(...conditions))
        .orderBy(desc(vendorAnalytics.periodStart));
    } catch (error) {
      throw new Error(`Failed to fetch vendor analytics: ${error.message}`);
    }
  }

  /**
   * Get comprehensive dashboard analytics
   */
  async getVendorDashboardAnalytics(vendorId: string): Promise<VendorDashboardAnalytics> {
    try {
      // Get basic sales metrics
      const salesMetrics = await this.getSalesMetrics(vendorId);
      
      // Get top products
      const topProducts = await this.getTopProducts(vendorId, 5);
      
      // Get sales by period (last 12 months)
      const salesByPeriod = await this.getSalesByPeriod(vendorId, 12);
      
      // Get customer metrics
      const customerMetrics = await this.getCustomerMetrics(vendorId);
      
      // Get performance metrics
      const performanceMetrics = await this.getPerformanceMetrics(vendorId);

      return {
        totalSales: salesMetrics.totalSales,
        totalOrders: salesMetrics.totalOrders,
        totalCustomers: salesMetrics.totalCustomers,
        averageOrderValue: salesMetrics.averageOrderValue,
        conversionRate: salesMetrics.conversionRate,
        recentSalesGrowth: salesMetrics.recentSalesGrowth,
        topProducts,
        salesByPeriod,
        customerMetrics,
        performanceMetrics
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard analytics: ${error.message}`);
    }
  }

  /**
   * Generate analytics for a specific period
   */
  async generateAnalytics(vendorId: string, startDate: Date, endDate: Date): Promise<VendorAnalytics> {
    try {
      // Calculate metrics for the period
      const metrics = await this.calculatePeriodMetrics(vendorId, startDate, endDate);
      
      // Determine period type
      const period = this.determinePeriodType(startDate, endDate);

      const [analytics] = await db.insert(vendorAnalytics)
        .values({
          vendorId,
          period,
          periodStart: startDate,
          periodEnd: endDate,
          salesCount: metrics.salesCount,
          salesValue: metrics.salesValue.toString(),
          orderCount: metrics.orderCount,
          customerCount: metrics.customerCount,
          productViews: metrics.productViews,
          storeViews: metrics.storeViews,
          conversionRate: metrics.conversionRate.toString(),
          averageOrderValue: metrics.averageOrderValue.toString(),
          returnRate: metrics.returnRate.toString(),
          metrics: metrics.additionalMetrics,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return analytics;
    } catch (error) {
      throw new Error(`Failed to generate analytics: ${error.message}`);
    }
  }

  /**
   * Get sales metrics for vendor
   */
  private async getSalesMetrics(vendorId: string): Promise<any> {
    try {
      const result = await db.select({
        totalSales: sum(orderItems.totalPrice).mapWith(Number),
        totalOrders: count(sql`DISTINCT ${orderItems.orderId}`),
        totalCustomers: count(sql`DISTINCT ${orders.userId}`),
        averageOrderValue: avg(orders.total).mapWith(Number)
      })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(eq(orderItems.vendorId, vendorId));

      const totalSales = result[0]?.totalSales || 0;
      const totalOrders = result[0]?.totalOrders || 0;
      const totalCustomers = result[0]?.totalCustomers || 0;
      const averageOrderValue = result[0]?.averageOrderValue || 0;

      // Calculate conversion rate (simplified)
      const conversionRate = totalOrders > 0 ? (totalCustomers / totalOrders) * 100 : 0;

      // Calculate recent sales growth (last 30 days vs previous 30 days)
      const recentSalesGrowth = await this.calculateSalesGrowth(vendorId);

      return {
        totalSales,
        totalOrders,
        totalCustomers,
        averageOrderValue,
        conversionRate,
        recentSalesGrowth
      };
    } catch (error) {
      throw new Error(`Failed to get sales metrics: ${error.message}`);
    }
  }

  /**
   * Get top performing products
   */
  private async getTopProducts(vendorId: string, limit: number): Promise<any[]> {
    try {
      const topProducts = await db.select({
        id: products.id,
        name: products.name,
        sales: count(orderItems.id),
        revenue: sum(orderItems.totalPrice).mapWith(Number)
      })
        .from(products)
        .innerJoin(orderItems, eq(products.id, orderItems.productId))
        .where(eq(orderItems.vendorId, vendorId))
        .groupBy(products.id, products.name)
        .orderBy(desc(sum(orderItems.totalPrice)))
        .limit(limit);

      return topProducts.map(product => ({
        id: product.id,
        name: product.name,
        sales: Number(product.sales),
        revenue: product.revenue || 0
      }));
    } catch (error) {
      throw new Error(`Failed to get top products: ${error.message}`);
    }
  }

  /**
   * Get sales by period (monthly)
   */
  private async getSalesByPeriod(vendorId: string, months: number): Promise<any[]> {
    try {
      const salesByPeriod = await db.select({
        month: sql`DATE_TRUNC('month', ${orders.createdAt})`,
        sales: sum(orderItems.totalPrice).mapWith(Number),
        orders: count(sql`DISTINCT ${orderItems.orderId}`)
      })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            gte(orders.createdAt, sql`NOW() - INTERVAL '${months} months'`)
          )
        )
        .groupBy(sql`DATE_TRUNC('month', ${orders.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${orders.createdAt})`);

      return salesByPeriod.map(period => ({
        period: period.month,
        sales: period.sales || 0,
        orders: Number(period.orders)
      }));
    } catch (error) {
      throw new Error(`Failed to get sales by period: ${error.message}`);
    }
  }

  /**
   * Get customer metrics
   */
  private async getCustomerMetrics(vendorId: string): Promise<any> {
    try {
      // Get new customers (first order in last 30 days)
      const newCustomersResult = await db.select({
        count: count()
      })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            gte(orders.createdAt, sql`NOW() - INTERVAL '30 days'`)
          )
        );

      // Get returning customers (multiple orders)
      const returningCustomersResult = await db.select({
        count: count()
      })
        .from(sql`(
          SELECT ${orders.userId}, COUNT(*) as order_count
          FROM ${orders} o
          INNER JOIN ${orderItems} oi ON o.id = oi.order_id
          WHERE oi.vendor_id = ${vendorId}
          GROUP BY ${orders.userId}
          HAVING COUNT(*) > 1
        ) as returning_customers`);

      const newCustomers = Number(newCustomersResult[0]?.count || 0);
      const returningCustomers = Number(returningCustomersResult[0]?.count || 0);
      const totalCustomers = newCustomers + returningCustomers;
      const customerRetentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

      return {
        newCustomers,
        returningCustomers,
        customerRetentionRate
      };
    } catch (error) {
      return {
        newCustomers: 0,
        returningCustomers: 0,
        customerRetentionRate: 0
      };
    }
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(vendorId: string): Promise<any> {
    try {
      // Calculate order fulfillment rate
      const fulfillmentResult = await db.select({
        total: count(),
        fulfilled: count(sql`CASE WHEN ${orders.status} = 'delivered' THEN 1 END`)
      })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(eq(orderItems.vendorId, vendorId));

      const totalOrders = Number(fulfillmentResult[0]?.total || 0);
      const fulfilledOrders = Number(fulfillmentResult[0]?.fulfilled || 0);
      const orderFulfillmentRate = totalOrders > 0 ? (fulfilledOrders / totalOrders) * 100 : 0;

      // Calculate average shipping time (simplified)
      const avgShippingResult = await db.select({
        avgDays: avg(sql`EXTRACT(DAY FROM (${orders.deliveredAt} - ${orders.shippedAt}))`)
      })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            sql`${orders.shippedAt} IS NOT NULL`,
            sql`${orders.deliveredAt} IS NOT NULL`
          )
        );

      const averageShippingTime = Number(avgShippingResult[0]?.avgDays || 0);

      // Calculate customer satisfaction (placeholder - would come from reviews)
      const customerSatisfactionScore = 4.2; // This would be calculated from actual reviews

      // Calculate return rate
      const returnResult = await db.select({
        total: count(),
        returned: count(sql`CASE WHEN ${orders.status} = 'returned' THEN 1 END`)
      })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(eq(orderItems.vendorId, vendorId));

      const totalOrdersForReturn = Number(returnResult[0]?.total || 0);
      const returnedOrders = Number(returnResult[0]?.returned || 0);
      const returnRate = totalOrdersForReturn > 0 ? (returnedOrders / totalOrdersForReturn) * 100 : 0;

      return {
        orderFulfillmentRate,
        averageShippingTime,
        customerSatisfactionScore,
        returnRate
      };
    } catch (error) {
      return {
        orderFulfillmentRate: 0,
        averageShippingTime: 0,
        customerSatisfactionScore: 0,
        returnRate: 0
      };
    }
  }

  /**
   * Calculate sales growth
   */
  private async calculateSalesGrowth(vendorId: string): Promise<number> {
    try {
      // Get sales for last 30 days
      const recentSalesResult = await db.select({
        sales: sum(orderItems.totalPrice).mapWith(Number)
      })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            gte(orders.createdAt, sql`NOW() - INTERVAL '30 days'`)
          )
        );

      // Get sales for previous 30 days
      const previousSalesResult = await db.select({
        sales: sum(orderItems.totalPrice).mapWith(Number)
      })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            gte(orders.createdAt, sql`NOW() - INTERVAL '60 days'`),
            sql`${orders.createdAt} < NOW() - INTERVAL '30 days'`
          )
        );

      const recentSales = recentSalesResult[0]?.sales || 0;
      const previousSales = previousSalesResult[0]?.sales || 0;

      if (previousSales === 0) return recentSales > 0 ? 100 : 0;

      return ((recentSales - previousSales) / previousSales) * 100;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate metrics for a specific period
   */
  private async calculatePeriodMetrics(vendorId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const result = await db.select({
        salesCount: count(sql`DISTINCT ${orderItems.id}`),
        salesValue: sum(orderItems.totalPrice).mapWith(Number),
        orderCount: count(sql`DISTINCT ${orderItems.orderId}`),
        customerCount: count(sql`DISTINCT ${orders.userId}`)
      })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            gte(orders.createdAt, startDate),
            lte(orders.createdAt, endDate)
          )
        );

      const metrics = result[0] || {};
      const salesCount = Number(metrics.salesCount || 0);
      const salesValue = metrics.salesValue || 0;
      const orderCount = Number(metrics.orderCount || 0);
      const customerCount = Number(metrics.customerCount || 0);

      const conversionRate = orderCount > 0 ? (customerCount / orderCount) * 100 : 0;
      const averageOrderValue = orderCount > 0 ? salesValue / orderCount : 0;

      return {
        salesCount,
        salesValue,
        orderCount,
        customerCount,
        productViews: 0, // Would come from view tracking
        storeViews: 0,   // Would come from view tracking
        conversionRate,
        averageOrderValue,
        returnRate: 0,   // Would be calculated from returns
        additionalMetrics: {
          period: 'calculated',
          startDate,
          endDate
        }
      };
    } catch (error) {
      throw new Error(`Failed to calculate period metrics: ${error.message}`);
    }
  }

  /**
   * Determine period type based on date range
   */
  private determinePeriodType(startDate: Date, endDate: Date): string {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'daily';
    if (diffDays <= 7) return 'weekly';
    if (diffDays <= 31) return 'monthly';
    if (diffDays <= 365) return 'yearly';
    
    return 'custom';
  }
}