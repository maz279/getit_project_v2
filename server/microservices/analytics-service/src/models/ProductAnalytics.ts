import { db } from '../../../../db';
import { 
  productAnalytics,
  products,
  orders,
  orderItems,
  categories,
  vendors,
  reviews,
  searchAnalytics,
  userBehaviors,
  type ProductAnalytic,
  type InsertProductAnalytic
} from '../../../../../shared/schema';
import { eq, and, desc, asc, like, sql, gte, lte, inArray, count, sum, avg } from 'drizzle-orm';

/**
 * Product Analytics Model - Amazon.com/Shopee.sg Level
 * Handles all product-related data operations and performance analysis
 * Provides comprehensive product metrics, inventory optimization, and recommendation analytics
 */
export class ProductAnalyticsModel {
  
  /**
   * Get comprehensive product performance metrics
   */
  async getProductPerformanceMetrics(params: {
    productId?: string;
    categoryId?: string;
    vendorId?: string;
    timeRange: { startDate: Date; endDate: Date };
    includeForecasting: boolean;
  }) {
    const { productId, categoryId, vendorId, timeRange, includeForecasting } = params;

    const performanceQuery = db
      .select({
        productId: products.id,
        productName: products.name,
        categoryId: products.categoryId,
        vendorId: products.vendorId,
        currentPrice: products.price,
        inventory: products.inventory,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0)`,
        totalQuantitySold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        averageOrderQuantity: sql<number>`COALESCE(AVG(${orderItems.quantity}), 0)`,
        averageRating: sql<number>`COALESCE(AVG(CAST(${reviews.rating} AS DECIMAL)), 0)`,
        totalReviews: sql<number>`COUNT(DISTINCT ${reviews.id})`,
        conversionRate: sql<number>`
          ROUND(
            (COUNT(DISTINCT ${orders.id})::float / 
             GREATEST(COUNT(DISTINCT ${userBehaviors.sessionId}), 1)::float) * 100, 
            2
          )
        `,
        returnRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${orders.status} = 'returned' THEN 1 END)::float / 
             COUNT(CASE WHEN ${orders.status} = 'delivered' THEN 1 END)::float) * 100, 
            2
          )
        `,
        profitMargin: sql<number>`
          ROUND(
            ((COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0) - 
              COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL) * 0.7), 0)) / 
             GREATEST(COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0), 1)) * 100, 
            2
          )
        `,
        viewToCartRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${userBehaviors.event} = 'add_to_cart' THEN 1 END)::float / 
             COUNT(CASE WHEN ${userBehaviors.event} = 'product_view' THEN 1 END)::float) * 100, 
            2
          )
        `,
        cartToCheckoutRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${userBehaviors.event} = 'checkout_initiated' THEN 1 END)::float / 
             COUNT(CASE WHEN ${userBehaviors.event} = 'add_to_cart' THEN 1 END)::float) * 100, 
            2
          )
        `,
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, and(
        eq(orderItems.orderId, orders.id),
        gte(orders.createdAt, timeRange.startDate.toISOString()),
        lte(orders.createdAt, timeRange.endDate.toISOString())
      ))
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .leftJoin(userBehaviors, and(
        eq(products.id, userBehaviors.productId),
        gte(userBehaviors.timestamp, timeRange.startDate.toISOString()),
        lte(userBehaviors.timestamp, timeRange.endDate.toISOString())
      ))
      .where(
        and(
          productId ? eq(products.id, productId) : undefined,
          categoryId ? eq(products.categoryId, categoryId) : undefined,
          vendorId ? eq(products.vendorId, vendorId) : undefined,
          eq(products.isActive, true)
        )
      )
      .groupBy(
        products.id,
        products.name,
        products.categoryId,
        products.vendorId,
        products.price,
        products.inventory
      );

    const performanceData = await performanceQuery;

    if (!includeForecasting) {
      return { current: performanceData, forecast: null };
    }

    // Generate sales forecast for next 30 days
    const forecastData = await this.generateSalesForecast(performanceData, 30);

    return { current: performanceData, forecast: forecastData };
  }

  /**
   * Get product sales analytics with trends
   */
  async getProductSalesAnalytics(params: {
    productId: string;
    timeRange: { startDate: Date; endDate: Date };
    granularity: 'daily' | 'weekly' | 'monthly';
  }) {
    const { productId, timeRange, granularity } = params;

    let groupByClause: any;
    switch (granularity) {
      case 'weekly':
        groupByClause = sql`DATE_TRUNC('week', ${orders.createdAt})`;
        break;
      case 'monthly':
        groupByClause = sql`DATE_TRUNC('month', ${orders.createdAt})`;
        break;
      default:
        groupByClause = sql`DATE(${orders.createdAt})`;
    }

    return await db
      .select({
        period: groupByClause,
        revenue: sql<number>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0)`,
        quantitySold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
        orders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        averagePrice: sql<number>`COALESCE(AVG(CAST(${orderItems.unitPrice} AS DECIMAL)), 0)`,
        uniqueBuyers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
      })
      .from(orderItems)
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.productId, productId),
          gte(orders.createdAt, timeRange.startDate.toISOString()),
          lte(orders.createdAt, timeRange.endDate.toISOString()),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(groupByClause)
      .orderBy(groupByClause);
  }

  /**
   * Get product inventory analytics and optimization
   */
  async getProductInventoryAnalytics(params: {
    timeRange: { startDate: Date; endDate: Date };
    includeForecasting: boolean;
  }) {
    const { timeRange, includeForecasting } = params;

    const inventoryQuery = db
      .select({
        productId: products.id,
        productName: products.name,
        currentStock: products.inventory,
        safetyStock: sql<number>`GREATEST(${products.inventory} * 0.2, 10)`, // 20% of current stock or min 10
        averageDailySales: sql<number>`
          COALESCE(
            SUM(${orderItems.quantity})::float / 
            GREATEST(EXTRACT(EPOCH FROM ('${timeRange.endDate.toISOString()}'::timestamp - '${timeRange.startDate.toISOString()}'::timestamp)) / 86400, 1), 
            0
          )
        `,
        inventoryTurnover: sql<number>`
          ROUND(
            COALESCE(SUM(${orderItems.quantity}), 0)::float / 
            GREATEST(${products.inventory}::float, 1), 
            2
          )
        `,
        stockoutRisk: sql<string>`
          CASE 
            WHEN ${products.inventory} = 0 THEN 'out_of_stock'
            WHEN ${products.inventory} <= (
              COALESCE(
                SUM(${orderItems.quantity})::float / 
                GREATEST(EXTRACT(EPOCH FROM ('${timeRange.endDate.toISOString()}'::timestamp - '${timeRange.startDate.toISOString()}'::timestamp)) / 86400, 1), 
                0
              ) * 7
            ) THEN 'high_risk'
            WHEN ${products.inventory} <= (
              COALESCE(
                SUM(${orderItems.quantity})::float / 
                GREATEST(EXTRACT(EPOCH FROM ('${timeRange.endDate.toISOString()}'::timestamp - '${timeRange.startDate.toISOString()}'::timestamp)) / 86400, 1), 
                0
              ) * 14
            ) THEN 'medium_risk'
            ELSE 'low_risk'
          END
        `,
        daysOfSupply: sql<number>`
          CASE 
            WHEN COALESCE(
              SUM(${orderItems.quantity})::float / 
              GREATEST(EXTRACT(EPOCH FROM ('${timeRange.endDate.toISOString()}'::timestamp - '${timeRange.startDate.toISOString()}'::timestamp)) / 86400, 1), 
              0
            ) = 0 THEN 999
            ELSE ROUND(
              ${products.inventory}::float / 
              COALESCE(
                SUM(${orderItems.quantity})::float / 
                GREATEST(EXTRACT(EPOCH FROM ('${timeRange.endDate.toISOString()}'::timestamp - '${timeRange.startDate.toISOString()}'::timestamp)) / 86400, 1), 
                0
              ), 
              1
            )
          END
        `,
        reorderPoint: sql<number>`
          ROUND(
            COALESCE(
              SUM(${orderItems.quantity})::float / 
              GREATEST(EXTRACT(EPOCH FROM ('${timeRange.endDate.toISOString()}'::timestamp - '${timeRange.startDate.toISOString()}'::timestamp)) / 86400, 1), 
              0
            ) * 14 + GREATEST(${products.inventory} * 0.2, 10)
          )
        `,
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, and(
        eq(orderItems.orderId, orders.id),
        gte(orders.createdAt, timeRange.startDate.toISOString()),
        lte(orders.createdAt, timeRange.endDate.toISOString()),
        eq(orders.status, 'completed')
      ))
      .where(eq(products.isActive, true))
      .groupBy(products.id, products.name, products.inventory)
      .orderBy(desc(sql`inventoryTurnover`));

    const inventoryData = await inventoryQuery;

    if (!includeForecasting) {
      return { current: inventoryData, forecast: null };
    }

    // Generate demand forecast
    const demandForecast = await this.generateDemandForecast(inventoryData);

    return { current: inventoryData, forecast: demandForecast };
  }

  /**
   * Get product pricing analytics and optimization
   */
  async getProductPricingAnalytics(params: {
    productId: string;
    includeCompetitive: boolean;
    timeRange: { startDate: Date; endDate: Date };
  }) {
    const { productId, includeCompetitive, timeRange } = params;

    const pricingQuery = db
      .select({
        productId: products.id,
        currentPrice: products.price,
        averageSellingPrice: sql<number>`COALESCE(AVG(CAST(${orderItems.unitPrice} AS DECIMAL)), 0)`,
        priceElasticity: sql<number>`
          CASE 
            WHEN COUNT(DISTINCT CAST(${orderItems.unitPrice} AS DECIMAL)) <= 1 THEN 0
            ELSE ROUND(
              (STDDEV(${orderItems.quantity})::float / AVG(${orderItems.quantity})::float) / 
              (STDDEV(CAST(${orderItems.unitPrice} AS DECIMAL))::float / AVG(CAST(${orderItems.unitPrice} AS DECIMAL))::float),
              3
            )
          END
        `,
        optimalPriceRange: sql<string>`
          CONCAT(
            ROUND(AVG(CAST(${orderItems.unitPrice} AS DECIMAL)) * 0.9, 0)::text,
            ' - ',
            ROUND(AVG(CAST(${orderItems.unitPrice} AS DECIMAL)) * 1.1, 0)::text
          )
        `,
        demandAtCurrentPrice: sql<number>`
          COALESCE(SUM(CASE WHEN CAST(${orderItems.unitPrice} AS DECIMAL) = CAST(${products.price} AS DECIMAL) THEN ${orderItems.quantity} END), 0)
        `,
        revenueOptimization: sql<number>`
          ROUND(
            (AVG(CAST(${orderItems.unitPrice} AS DECIMAL)) * SUM(${orderItems.quantity}) - 
             CAST(${products.price} AS DECIMAL) * SUM(${orderItems.quantity})) / 
            GREATEST(CAST(${products.price} AS DECIMAL) * SUM(${orderItems.quantity}), 1) * 100,
            2
          )
        `,
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, and(
        eq(orderItems.orderId, orders.id),
        gte(orders.createdAt, timeRange.startDate.toISOString()),
        lte(orders.createdAt, timeRange.endDate.toISOString()),
        eq(orders.status, 'completed')
      ))
      .where(eq(products.id, productId))
      .groupBy(products.id, products.price);

    const [pricingData] = await pricingQuery;

    if (!includeCompetitive) {
      return { pricing: pricingData, competitive: null };
    }

    // Get competitive pricing (simplified - would integrate with price monitoring services)
    const competitiveData = await this.getCompetitivePricing(productId);

    return { pricing: pricingData, competitive: competitiveData };
  }

  /**
   * Get product category performance analysis
   */
  async getProductCategoryAnalysis(params: {
    categoryLevel: 'category' | 'subcategory';
    timeRange: { startDate: Date; endDate: Date };
    includeGrowthAnalysis: boolean;
  }) {
    const { categoryLevel, timeRange, includeGrowthAnalysis } = params;

    const categoryQuery = db
      .select({
        categoryId: products.categoryId,
        categoryName: categories.name,
        totalProducts: sql<number>`COUNT(DISTINCT ${products.id})`,
        activeProducts: sql<number>`COUNT(DISTINCT CASE WHEN ${products.isActive} = true THEN ${products.id} END)`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0)`,
        totalQuantitySold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
        averagePrice: sql<number>`COALESCE(AVG(CAST(${products.price} AS DECIMAL)), 0)`,
        averageRating: sql<number>`COALESCE(AVG(CAST(${reviews.rating} AS DECIMAL)), 0)`,
        totalReviews: sql<number>`COUNT(DISTINCT ${reviews.id})`,
        conversionRate: sql<number>`
          ROUND(
            (COUNT(DISTINCT ${orders.id})::float / 
             COUNT(DISTINCT ${userBehaviors.sessionId})::float) * 100, 
            2
          )
        `,
        marketShare: sql<number>`
          ROUND(
            COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0) / 
            SUM(COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0)) OVER () * 100,
            2
          )
        `,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, and(
        eq(orderItems.orderId, orders.id),
        gte(orders.createdAt, timeRange.startDate.toISOString()),
        lte(orders.createdAt, timeRange.endDate.toISOString()),
        eq(orders.status, 'completed')
      ))
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .leftJoin(userBehaviors, and(
        eq(products.id, userBehaviors.productId),
        gte(userBehaviors.timestamp, timeRange.startDate.toISOString()),
        lte(userBehaviors.timestamp, timeRange.endDate.toISOString())
      ))
      .groupBy(products.categoryId, categories.name)
      .orderBy(desc(sql`totalRevenue`));

    const categoryData = await categoryQuery;

    if (!includeGrowthAnalysis) {
      return { categories: categoryData, growth: null };
    }

    // Calculate period-over-period growth
    const growthData = await this.calculateCategoryGrowth(categoryData, timeRange);

    return { categories: categoryData, growth: growthData };
  }

  /**
   * Get product search and discovery analytics
   */
  async getProductSearchAnalytics(params: {
    productId?: string;
    timeRange: { startDate: Date; endDate: Date };
  }) {
    const { productId, timeRange } = params;

    return await db
      .select({
        productId: searchAnalytics.productId,
        productName: products.name,
        totalSearches: sql<number>`COUNT(${searchAnalytics.id})`,
        searchTerms: sql<string[]>`ARRAY_AGG(DISTINCT ${searchAnalytics.searchTerm})`,
        searchRank: sql<number>`COALESCE(AVG(${searchAnalytics.position}), 0)`,
        clickThroughRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${searchAnalytics.clicked} = true THEN 1 END)::float / 
             COUNT(*)::float) * 100, 
            2
          )
        `,
        conversionFromSearch: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${searchAnalytics.converted} = true THEN 1 END)::float / 
             COUNT(*)::float) * 100, 
            2
          )
        `,
        searchToCartRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${userBehaviors.event} = 'add_to_cart' THEN 1 END)::float / 
             COUNT(${searchAnalytics.id})::float) * 100, 
            2
          )
        `,
      })
      .from(searchAnalytics)
      .leftJoin(products, eq(searchAnalytics.productId, products.id))
      .leftJoin(userBehaviors, and(
        eq(searchAnalytics.productId, userBehaviors.productId),
        eq(userBehaviors.event, 'add_to_cart')
      ))
      .where(
        and(
          gte(searchAnalytics.timestamp, timeRange.startDate.toISOString()),
          lte(searchAnalytics.timestamp, timeRange.endDate.toISOString()),
          productId ? eq(searchAnalytics.productId, productId) : undefined
        )
      )
      .groupBy(searchAnalytics.productId, products.name)
      .orderBy(desc(sql`totalSearches`));
  }

  /**
   * Store product analytics data
   */
  async storeProductAnalytics(data: InsertProductAnalytic) {
    return await db.insert(productAnalytics).values(data).returning();
  }

  // Helper methods
  private async generateSalesForecast(performanceData: any[], days: number) {
    // Simple linear regression forecast
    const forecasts = performanceData.map(product => {
      const averageDailySales = product.totalQuantitySold / 30; // Assuming 30-day period
      const forecastedSales = averageDailySales * days;
      const forecastedRevenue = forecastedSales * parseFloat(product.currentPrice);

      return {
        productId: product.productId,
        productName: product.productName,
        forecastPeriod: `${days} days`,
        forecastedSales: Math.round(forecastedSales),
        forecastedRevenue: Math.round(forecastedRevenue),
        confidence: this.calculateForecastConfidence(product),
      };
    });

    return forecasts;
  }

  private async generateDemandForecast(inventoryData: any[]) {
    return inventoryData.map(product => {
      const projectedDemand = product.averageDailySales * 30; // 30-day forecast
      const recommendedOrder = Math.max(0, product.reorderPoint - product.currentStock);

      return {
        productId: product.productId,
        productName: product.productName,
        projectedDemand: Math.round(projectedDemand),
        recommendedOrderQuantity: Math.round(recommendedOrder),
        urgency: product.stockoutRisk,
        expectedStockoutDate: this.calculateStockoutDate(product),
      };
    });
  }

  private async getCompetitivePricing(productId: string) {
    // Simplified competitive pricing - would integrate with external services
    const [product] = await db
      .select({
        currentPrice: products.price,
        productName: products.name,
      })
      .from(products)
      .where(eq(products.id, productId));

    if (!product) return null;

    const currentPrice = parseFloat(product.currentPrice);
    
    return {
      currentPrice,
      marketAverage: currentPrice * (0.95 + Math.random() * 0.1), // Simulated
      lowestCompetitor: currentPrice * (0.85 + Math.random() * 0.1),
      highestCompetitor: currentPrice * (1.05 + Math.random() * 0.1),
      pricePosition: 'competitive', // Would be calculated based on actual data
      recommendedPrice: this.calculateOptimalPrice(currentPrice),
    };
  }

  private async calculateCategoryGrowth(categoryData: any[], timeRange: { startDate: Date; endDate: Date }) {
    // Calculate previous period for comparison
    const periodDiff = timeRange.endDate.getTime() - timeRange.startDate.getTime();
    const previousStartDate = new Date(timeRange.startDate.getTime() - periodDiff);
    const previousEndDate = new Date(timeRange.endDate.getTime() - periodDiff);

    // This would involve querying previous period data and calculating growth rates
    // Simplified for demonstration
    return categoryData.map(category => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      revenueGrowth: Math.round((Math.random() - 0.5) * 100), // Simulated growth rate
      volumeGrowth: Math.round((Math.random() - 0.5) * 80),
      marketShareChange: Math.round((Math.random() - 0.5) * 20),
      trend: Math.random() > 0.5 ? 'growing' : 'declining',
    }));
  }

  private calculateForecastConfidence(product: any): number {
    // Base confidence on historical data consistency
    const salesVolume = product.totalQuantitySold;
    const orderCount = product.totalOrders;
    
    if (salesVolume === 0) return 0;
    if (orderCount >= 50) return 90;
    if (orderCount >= 20) return 75;
    if (orderCount >= 10) return 60;
    return 45;
  }

  private calculateStockoutDate(product: any): string | null {
    if (product.averageDailySales === 0) return null;
    
    const daysUntilStockout = product.currentStock / product.averageDailySales;
    const stockoutDate = new Date();
    stockoutDate.setDate(stockoutDate.getDate() + Math.ceil(daysUntilStockout));
    
    return stockoutDate.toISOString().split('T')[0];
  }

  private calculateOptimalPrice(currentPrice: number): number {
    // Simplified optimal pricing calculation
    const elasticity = -1.2; // Assumed price elasticity
    const optimalMarkup = 1 / (1 + elasticity);
    return Math.round(currentPrice * optimalMarkup);
  }
}