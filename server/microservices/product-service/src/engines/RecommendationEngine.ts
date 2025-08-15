/**
 * Recommendation Engine - Amazon.com/Shopee.sg Level Implementation
 * AI-powered product recommendations with multiple algorithms
 */

import { db } from '../../../../db';
import { 
  products, 
  orders,
  orderItems,
  productReviews,
  users,
  categories,
  type Product
} from '@shared/schema';
import { eq, and, desc, sql, count, gte, inArray, ne } from 'drizzle-orm';
import { 
  ProductRecommendation,
  NotFoundError
} from '../types';

export class RecommendationEngine {
  private serviceName = 'product-recommendation-engine';

  constructor() {
    this.initializeEngine();
  }

  private async initializeEngine() {
    console.log(`🚀 Initializing ${this.serviceName}`, {
      engine: this.serviceName,
      version: '2.0.0',
      algorithms: ['collaborative-filtering', 'content-based', 'popular-items', 'similar-products'],
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string, 
    limit: number = 10,
    excludeProductIds: string[] = []
  ): Promise<Product[]> {
    try {
      // Combine multiple recommendation algorithms
      const [
        collaborativeRecs,
        contentBasedRecs,
        popularRecs,
        trendingRecs
      ] = await Promise.all([
        this.getCollaborativeFilteringRecommendations(userId, Math.ceil(limit * 0.4)),
        this.getContentBasedRecommendations(userId, Math.ceil(limit * 0.3)),
        this.getPopularRecommendations(Math.ceil(limit * 0.2), excludeProductIds),
        this.getTrendingRecommendations(Math.ceil(limit * 0.1), excludeProductIds)
      ]);

      // Merge and deduplicate recommendations
      const allRecommendations = new Map<string, Product>();
      
      // Add recommendations with preference weighting
      [...collaborativeRecs, ...contentBasedRecs, ...popularRecs, ...trendingRecs]
        .forEach(product => {
          if (!excludeProductIds.includes(product.id) && !allRecommendations.has(product.id)) {
            allRecommendations.set(product.id, product);
          }
        });

      return Array.from(allRecommendations.values()).slice(0, limit);
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      // Fallback to popular products
      return this.getPopularRecommendations(limit, excludeProductIds);
    }
  }

  /**
   * Collaborative filtering recommendations (users who bought this also bought)
   */
  async getCollaborativeFilteringRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<Product[]> {
    try {
      // Get user's purchase history
      const userPurchases = await db
        .select({ productId: orderItems.productId })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(and(
          eq(orders.userId, parseInt(userId)),
          eq(orders.status, 'delivered')
        ));

      if (userPurchases.length === 0) {
        return [];
      }

      const purchasedProductIds = userPurchases.map(p => p.productId);

      // Find users who bought similar products
      const similarUsers = await db
        .select({
          userId: orders.userId,
          commonProducts: count()
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(and(
          inArray(orderItems.productId, purchasedProductIds),
          ne(orders.userId, parseInt(userId)),
          eq(orders.status, 'delivered')
        ))
        .groupBy(orders.userId)
        .having(gte(count(), 2)) // At least 2 common products
        .orderBy(desc(count()))
        .limit(50);

      if (similarUsers.length === 0) {
        return [];
      }

      const similarUserIds = similarUsers.map(u => u.userId);

      // Get products purchased by similar users but not by current user
      const recommendations = await db
        .select({
          product: products,
          purchaseCount: count(),
          averageRating: sql<number>`
            COALESCE((
              SELECT ROUND(AVG(rating), 2) 
              FROM ${productReviews} 
              WHERE product_id = ${products.id}
            ), 0)
          `
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(and(
          inArray(orders.userId, similarUserIds),
          sql`${products.id} NOT IN (${sql.join(purchasedProductIds.map(id => sql`${id}`), sql`, `)})`,
          eq(products.isActive, true),
          gte(products.stockQuantity, 1)
        ))
        .groupBy(products.id)
        .orderBy(desc(count()), desc(sql`average_rating`))
        .limit(limit);

      return recommendations.map(r => r.product);
    } catch (error) {
      console.error('Failed to get collaborative filtering recommendations:', error);
      return [];
    }
  }

  /**
   * Content-based recommendations (similar products based on attributes)
   */
  async getContentBasedRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<Product[]> {
    try {
      // Get user's purchase history and preferences
      const userPreferences = await db
        .select({
          categoryId: products.categoryId,
          brand: products.brand,
          priceRange: sql<string>`
            CASE 
              WHEN CAST(${products.price} AS DECIMAL) < 100 THEN 'low'
              WHEN CAST(${products.price} AS DECIMAL) < 500 THEN 'medium'
              ELSE 'high'
            END
          `,
          count: count()
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(and(
          eq(orders.userId, parseInt(userId)),
          eq(orders.status, 'delivered')
        ))
        .groupBy(products.categoryId, products.brand, sql`price_range`)
        .orderBy(desc(count()));

      if (userPreferences.length === 0) {
        return [];
      }

      // Get products in preferred categories and price ranges
      const preferredCategories = [...new Set(userPreferences.map(p => p.categoryId))];
      const preferredBrands = [...new Set(userPreferences.map(p => p.brand).filter(Boolean))];

      let recommendationQuery = db
        .select({
          product: products,
          relevanceScore: sql<number>`
            (
              CASE WHEN ${products.categoryId} IN (${sql.join(preferredCategories.map(id => sql`${id}`), sql`, `)}) THEN 3 ELSE 0 END +
              ${preferredBrands.length > 0 ? 
                sql`CASE WHEN ${products.brand} IN (${sql.join(preferredBrands.map(brand => sql`${brand}`), sql`, `)}) THEN 2 ELSE 0 END` : 
                sql`0`} +
              CASE WHEN ${products.averageRating} >= 4.0 THEN 1 ELSE 0 END
            )
          `
        })
        .from(products)
        .where(and(
          eq(products.isActive, true),
          gte(products.stockQuantity, 1)
        ))
        .orderBy(desc(sql`relevance_score`), desc(products.averageRating))
        .limit(limit);

      const recommendations = await recommendationQuery;
      return recommendations
        .filter(r => r.relevanceScore > 0)
        .map(r => r.product);
    } catch (error) {
      console.error('Failed to get content-based recommendations:', error);
      return [];
    }
  }

  /**
   * Popular products recommendations
   */
  async getPopularRecommendations(
    limit: number = 10,
    excludeProductIds: string[] = []
  ): Promise<Product[]> {
    try {
      let query = db
        .select({
          product: products,
          totalSales: sql<number>`
            COALESCE((
              SELECT SUM(quantity) 
              FROM ${orderItems} 
              WHERE product_id = ${products.id}
            ), 0)
          `,
          averageRating: products.averageRating
        })
        .from(products)
        .where(and(
          eq(products.isActive, true),
          gte(products.stockQuantity, 1),
          excludeProductIds.length > 0 ? 
            sql`${products.id} NOT IN (${sql.join(excludeProductIds.map(id => sql`${id}`), sql`, `)})` :
            sql`1=1`
        ))
        .orderBy(desc(sql`total_sales`), desc(products.averageRating))
        .limit(limit);

      const popularProducts = await query;
      return popularProducts.map(p => p.product);
    } catch (error) {
      console.error('Failed to get popular recommendations:', error);
      return [];
    }
  }

  /**
   * Trending products recommendations
   */
  async getTrendingRecommendations(
    limit: number = 10,
    excludeProductIds: string[] = []
  ): Promise<Product[]> {
    try {
      // Get products with high recent sales velocity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let query = db
        .select({
          product: products,
          recentSales: sql<number>`
            COALESCE((
              SELECT SUM(${orderItems.quantity}) 
              FROM ${orderItems} 
              INNER JOIN ${orders} ON ${orderItems.orderId} = ${orders.id}
              WHERE ${orderItems.productId} = ${products.id} 
              AND ${orders.createdAt} >= ${thirtyDaysAgo}
            ), 0)
          `,
          growthRate: sql<number>`
            CASE 
              WHEN COALESCE((
                SELECT SUM(${orderItems.quantity}) 
                FROM ${orderItems} 
                INNER JOIN ${orders} ON ${orderItems.orderId} = ${orders.id}
                WHERE ${orderItems.productId} = ${products.id} 
                AND ${orders.createdAt} < ${thirtyDaysAgo}
              ), 0) = 0 THEN 100
              ELSE ROUND(
                (COALESCE((
                  SELECT SUM(${orderItems.quantity}) 
                  FROM ${orderItems} 
                  INNER JOIN ${orders} ON ${orderItems.orderId} = ${orders.id}
                  WHERE ${orderItems.productId} = ${products.id} 
                  AND ${orders.createdAt} >= ${thirtyDaysAgo}
                ), 0) * 100.0) / COALESCE((
                  SELECT SUM(${orderItems.quantity}) 
                  FROM ${orderItems} 
                  INNER JOIN ${orders} ON ${orderItems.orderId} = ${orders.id}
                  WHERE ${orderItems.productId} = ${products.id} 
                  AND ${orders.createdAt} < ${thirtyDaysAgo}
                ), 1), 2)
            END
          `
        })
        .from(products)
        .where(and(
          eq(products.isActive, true),
          gte(products.stockQuantity, 1),
          excludeProductIds.length > 0 ? 
            sql`${products.id} NOT IN (${sql.join(excludeProductIds.map(id => sql`${id}`), sql`, `)})` :
            sql`1=1`
        ))
        .orderBy(desc(sql`growth_rate`), desc(sql`recent_sales`))
        .limit(limit);

      const trendingProducts = await query;
      return trendingProducts.map(p => p.product);
    } catch (error) {
      console.error('Failed to get trending recommendations:', error);
      return [];
    }
  }

  /**
   * "Frequently bought together" recommendations
   */
  async getFrequentlyBoughtTogether(
    productId: string, 
    limit: number = 5
  ): Promise<Product[]> {
    try {
      // Find products frequently bought with the given product
      const frequentlyBought = await db
        .select({
          product: products,
          frequency: count()
        })
        .from(orderItems)
        .innerJoin(
          sql`${orderItems} AS oi2`, 
          sql`${orderItems.orderId} = oi2.order_id AND ${orderItems.productId} != oi2.product_id`
        )
        .innerJoin(products, eq(sql`oi2.product_id`, products.id))
        .where(and(
          eq(orderItems.productId, productId),
          eq(products.isActive, true),
          gte(products.stockQuantity, 1)
        ))
        .groupBy(products.id)
        .orderBy(desc(count()))
        .limit(limit);

      return frequentlyBought.map(item => item.product);
    } catch (error) {
      console.error('Failed to get frequently bought together:', error);
      return [];
    }
  }

  /**
   * Cross-category recommendations
   */
  async getCrossCategoryRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<Product[]> {
    try {
      // Get user's purchase categories
      const userCategories = await db
        .select({ categoryId: products.categoryId })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(and(
          eq(orders.userId, parseInt(userId)),
          eq(orders.status, 'delivered')
        ))
        .groupBy(products.categoryId);

      const purchasedCategoryIds = userCategories.map(c => c.categoryId);

      if (purchasedCategoryIds.length === 0) {
        return [];
      }

      // Get popular products from categories user hasn't explored
      const crossCategoryProducts = await db
        .select({
          product: products,
          salesCount: sql<number>`
            COALESCE((
              SELECT SUM(${orderItems.quantity}) 
              FROM ${orderItems} 
              WHERE product_id = ${products.id}
            ), 0)
          `
        })
        .from(products)
        .where(and(
          sql`${products.categoryId} NOT IN (${sql.join(purchasedCategoryIds.map(id => sql`${id}`), sql`, `)})`,
          eq(products.isActive, true),
          gte(products.stockQuantity, 1),
          gte(products.averageRating, 4.0)
        ))
        .orderBy(desc(sql`sales_count`), desc(products.averageRating))
        .limit(limit);

      return crossCategoryProducts.map(p => p.product);
    } catch (error) {
      console.error('Failed to get cross-category recommendations:', error);
      return [];
    }
  }

  /**
   * Seasonal/contextual recommendations
   */
  async getSeasonalRecommendations(
    limit: number = 10,
    season?: string
  ): Promise<Product[]> {
    try {
      // In a full implementation, this would consider:
      // - Current season/weather
      // - Upcoming holidays/festivals
      // - Regional preferences
      // - Historical seasonal trends

      // For now, return popular products with seasonal tags
      const seasonalKeywords = season ? [season] : ['summer', 'winter', 'festival', 'eid'];
      
      const seasonalProducts = await db
        .select({ product: products })
        .from(products)
        .where(and(
          eq(products.isActive, true),
          gte(products.stockQuantity, 1),
          sql`(
            ${products.name} ILIKE ANY(${seasonalKeywords.map(k => `%${k}%`)}) OR
            ${products.tags} ILIKE ANY(${seasonalKeywords.map(k => `%${k}%`)})
          )`
        ))
        .orderBy(desc(products.averageRating), desc(products.salesCount))
        .limit(limit);

      return seasonalProducts.map(p => p.product);
    } catch (error) {
      console.error('Failed to get seasonal recommendations:', error);
      return [];
    }
  }

  /**
   * Price-based recommendations (products in user's price range)
   */
  async getPriceBasedRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<Product[]> {
    try {
      // Calculate user's average spending
      const [userSpending] = await db
        .select({
          averagePrice: sql<number>`
            AVG(CAST(${products.price} AS DECIMAL))
          `,
          minPrice: sql<number>`
            MIN(CAST(${products.price} AS DECIMAL))
          `,
          maxPrice: sql<number>`
            MAX(CAST(${products.price} AS DECIMAL))
          `
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(and(
          eq(orders.userId, parseInt(userId)),
          eq(orders.status, 'delivered')
        ));

      if (!userSpending?.averagePrice) {
        return [];
      }

      // Define price range (±30% of average)
      const priceRange = {
        min: userSpending.averagePrice * 0.7,
        max: userSpending.averagePrice * 1.3
      };

      const priceBasedProducts = await db
        .select({ product: products })
        .from(products)
        .where(and(
          eq(products.isActive, true),
          gte(products.stockQuantity, 1),
          gte(sql`CAST(${products.price} AS DECIMAL)`, priceRange.min),
          sql`CAST(${products.price} AS DECIMAL) <= ${priceRange.max}`
        ))
        .orderBy(desc(products.averageRating), desc(products.salesCount))
        .limit(limit);

      return priceBasedProducts.map(p => p.product);
    } catch (error) {
      console.error('Failed to get price-based recommendations:', error);
      return [];
    }
  }

  /**
   * Get recommendation analytics and performance metrics
   */
  async getRecommendationAnalytics(timeRange: string = '30d'): Promise<{
    totalRecommendations: number;
    clickThroughRate: number;
    conversionRate: number;
    algorithmPerformance: Array<{
      algorithm: string;
      impressions: number;
      clicks: number;
      conversions: number;
      ctr: number;
      cvr: number;
    }>;
  }> {
    try {
      // This would require recommendation tracking tables in a real implementation
      // For now, returning mock analytics structure
      return {
        totalRecommendations: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        algorithmPerformance: []
      };
    } catch (error) {
      console.error('Failed to get recommendation analytics:', error);
      throw error;
    }
  }
}