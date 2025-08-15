import { db } from '../../../db';
import { 
  products, 
  users, 
  orders, 
  orderItems, 
  userBehaviors, 
  categories, 
  vendors,
  cartItems
} from '@shared/schema';
import { eq, and, desc, asc, sql, inArray, gte, lte, isNotNull, count, avg } from 'drizzle-orm';

/**
 * Advanced ML-powered Recommendation Engine
 * Implements multiple algorithms for Amazon/Shopee-level personalization
 */
export class RecommendationEngine {
  private readonly WEIGHTS = {
    purchase: 10,
    cart: 7,
    view: 3,
    search: 2,
    click: 1
  };

  private readonly TIME_DECAY_DAYS = 30;

  /**
   * Get hybrid recommendations combining multiple algorithms
   */
  async getHybridRecommendations(userId: number, limit: number = 10): Promise<any[]> {
    try {
      // Get recommendations from different algorithms
      const [collaborative, contentBased, popular] = await Promise.all([
        this.getCollaborativeRecommendations(userId, Math.ceil(limit * 0.4)),
        this.getContentBasedRecommendations(userId, Math.ceil(limit * 0.4)),
        this.getPopularRecommendations(Math.ceil(limit * 0.2))
      ]);

      // Combine and score recommendations
      const combined = this.combineAndScoreRecommendations([
        { recommendations: collaborative, weight: 0.4, algorithm: 'collaborative' },
        { recommendations: contentBased, weight: 0.4, algorithm: 'content' },
        { recommendations: popular, weight: 0.2, algorithm: 'popular' }
      ]);

      // Remove duplicates and return top recommendations
      const unique = this.removeDuplicateProducts(combined);
      return unique.slice(0, limit);

    } catch (error) {
      console.error('Hybrid recommendations error:', error);
      // Fallback to popular recommendations
      return this.getPopularRecommendations(limit);
    }
  }

  /**
   * Collaborative filtering based on user behavior similarity
   */
  async getCollaborativeRecommendations(userId: number, limit: number = 10): Promise<any[]> {
    try {
      // Find users with similar purchase patterns
      const similarUsers = await this.findSimilarUsers(userId);
      
      if (similarUsers.length === 0) {
        return this.getPopularRecommendations(limit);
      }

      // Get products purchased by similar users but not by target user
      const userProducts = await this.getUserPurchasedProducts(userId);
      const userProductIds = userProducts.map(p => p.id);

      const recommendations = await db
        .select({
          id: products.id,
          name: products.name,
          nameBn: products.nameBn,
          price: products.price,
          imageUrl: products.imageUrl,
          categoryId: products.categoryId,
          vendorId: products.vendorId,
          rating: sql<number>`COALESCE(AVG(CAST(${products.tags}->>'rating' AS DECIMAL)), 0)`,
          score: sql<number>`COUNT(*) * AVG(CASE 
            WHEN ${orderItems.createdAt} > NOW() - INTERVAL '7 days' THEN 3
            WHEN ${orderItems.createdAt} > NOW() - INTERVAL '30 days' THEN 2
            ELSE 1
          END)`,
          algorithm: sql<string>`'collaborative'`
        })
        .from(products)
        .innerJoin(orderItems, eq(products.id, orderItems.productId))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            inArray(orders.userId, similarUsers.map(u => u.userId)),
            userProductIds.length > 0 ? sql`${products.id} NOT IN (${userProductIds.join(',')})` : undefined,
            eq(products.isActive, true)
          )
        )
        .groupBy(products.id, products.name, products.nameBn, products.price, products.imageUrl, products.categoryId, products.vendorId)
        .orderBy(desc(sql`score`))
        .limit(limit);

      return recommendations;

    } catch (error) {
      console.error('Collaborative filtering error:', error);
      return [];
    }
  }

  /**
   * Content-based recommendations using product attributes
   */
  async getContentBasedRecommendations(userId: number, limit: number = 10): Promise<any[]> {
    try {
      // Get user's purchase history and preferences
      const userPreferences = await this.getUserPreferences(userId);
      
      if (!userPreferences.categories.length && !userPreferences.brands.length) {
        return this.getPopularRecommendations(limit);
      }

      // Find products similar to user's preferences
      const recommendations = await db
        .select({
          id: products.id,
          name: products.name,
          nameBn: products.nameBn,
          price: products.price,
          imageUrl: products.imageUrl,
          categoryId: products.categoryId,
          vendorId: products.vendorId,
          rating: sql<number>`COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0)`,
          score: sql<number>`
            (CASE WHEN ${products.categoryId} = ANY(${userPreferences.categories}) THEN 5 ELSE 0 END) +
            (CASE WHEN ${products.brand} = ANY(${userPreferences.brands}) THEN 3 ELSE 0 END) +
            (CASE WHEN ${products.price}::DECIMAL BETWEEN ${userPreferences.priceRange.min} AND ${userPreferences.priceRange.max} THEN 2 ELSE 0 END) +
            COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0)
          `,
          algorithm: sql<string>`'content'`
        })
        .from(products)
        .where(
          and(
            eq(products.isActive, true),
            sql`(
              ${products.categoryId} = ANY(${userPreferences.categories}) OR
              ${products.brand} = ANY(${userPreferences.brands}) OR
              ${products.price}::DECIMAL BETWEEN ${userPreferences.priceRange.min} AND ${userPreferences.priceRange.max}
            )`
          )
        )
        .orderBy(desc(sql`score`), desc(products.createdAt))
        .limit(limit);

      return recommendations;

    } catch (error) {
      console.error('Content-based recommendations error:', error);
      return [];
    }
  }

  /**
   * Get popular products based on sales and ratings
   */
  async getPopularRecommendations(limit: number = 10): Promise<any[]> {
    try {
      const recommendations = await db
        .select({
          id: products.id,
          name: products.name,
          nameBn: products.nameBn,
          price: products.price,
          imageUrl: products.imageUrl,
          categoryId: products.categoryId,
          vendorId: products.vendorId,
          rating: sql<number>`COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0)`,
          salesCount: sql<number>`COALESCE(CAST(${products.metadata}->>'salesCount' AS INTEGER), 0)`,
          score: sql<number>`
            (COALESCE(CAST(${products.metadata}->>'salesCount' AS INTEGER), 0) * 0.7) +
            (COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0) * 20) +
            (CASE WHEN ${products.createdAt} > NOW() - INTERVAL '30 days' THEN 10 ELSE 0 END)
          `,
          algorithm: sql<string>`'popular'`
        })
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(desc(sql`score`), desc(products.createdAt))
        .limit(limit);

      return recommendations;

    } catch (error) {
      console.error('Popular recommendations error:', error);
      return [];
    }
  }

  /**
   * Get trending products based on recent activity
   */
  async getTrendingRecommendations(limit: number = 10): Promise<any[]> {
    try {
      const recommendations = await db
        .select({
          id: products.id,
          name: products.name,
          nameBn: products.nameBn,
          price: products.price,
          imageUrl: products.imageUrl,
          categoryId: products.categoryId,
          vendorId: products.vendorId,
          rating: sql<number>`COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0)`,
          recentViews: sql<number>`COUNT(DISTINCT ${userBehaviors.userId})`,
          score: sql<number>`
            COUNT(DISTINCT ${userBehaviors.userId}) * 2 +
            COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0) * 10
          `,
          algorithm: sql<string>`'trending'`
        })
        .from(products)
        .leftJoin(userBehaviors, and(
          eq(userBehaviors.targetId, products.id),
          eq(userBehaviors.targetType, 'product'),
          gte(userBehaviors.createdAt, sql`NOW() - INTERVAL '7 days'`)
        ))
        .where(eq(products.isActive, true))
        .groupBy(products.id, products.name, products.nameBn, products.price, products.imageUrl, products.categoryId, products.vendorId)
        .orderBy(desc(sql`score`))
        .limit(limit);

      return recommendations;

    } catch (error) {
      console.error('Trending recommendations error:', error);
      return [];
    }
  }

  /**
   * Get similar products based on attributes and categories
   */
  async getSimilarProducts(productId: string, limit: number = 8): Promise<any[]> {
    try {
      // Get the base product
      const [baseProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));

      if (!baseProduct) {
        return [];
      }

      // Find similar products in same category or with similar attributes
      const similarProducts = await db
        .select({
          id: products.id,
          name: products.name,
          nameBn: products.nameBn,
          price: products.price,
          imageUrl: products.imageUrl,
          categoryId: products.categoryId,
          vendorId: products.vendorId,
          rating: sql<number>`COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0)`,
          similarity: sql<number>`
            (CASE WHEN ${products.categoryId} = ${baseProduct.categoryId} THEN 10 ELSE 0 END) +
            (CASE WHEN ${products.brand} = ${baseProduct.brand} THEN 5 ELSE 0 END) +
            (CASE WHEN ABS(${products.price}::DECIMAL - ${baseProduct.price}::DECIMAL) / ${baseProduct.price}::DECIMAL < 0.5 THEN 3 ELSE 0 END) +
            COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0)
          `
        })
        .from(products)
        .where(
          and(
            eq(products.isActive, true),
            sql`${products.id} != ${productId}`
          )
        )
        .orderBy(desc(sql`similarity`), desc(products.createdAt))
        .limit(limit);

      return similarProducts;

    } catch (error) {
      console.error('Similar products error:', error);
      return [];
    }
  }

  /**
   * Get frequently bought together products
   */
  async getFrequentlyBoughtTogether(productId: string, limit: number = 5): Promise<any[]> {
    try {
      const bundleProducts = await db
        .select({
          id: products.id,
          name: products.name,
          nameBn: products.nameBn,
          price: products.price,
          imageUrl: products.imageUrl,
          categoryId: products.categoryId,
          vendorId: products.vendorId,
          rating: sql<number>`COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0)`,
          frequency: sql<number>`COUNT(*)`,
          confidence: sql<number>`COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${orderItems} WHERE product_id = ${productId})`
        })
        .from(products)
        .innerJoin(orderItems, eq(products.id, orderItems.productId))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(products.isActive, true),
            sql`${products.id} != ${productId}`,
            sql`${orders.id} IN (
              SELECT DISTINCT order_id 
              FROM ${orderItems} 
              WHERE product_id = ${productId}
            )`
          )
        )
        .groupBy(products.id, products.name, products.nameBn, products.price, products.imageUrl, products.categoryId, products.vendorId)
        .having(sql`COUNT(*) >= 2`) // Minimum frequency threshold
        .orderBy(desc(sql`frequency`), desc(sql`confidence`))
        .limit(limit);

      return bundleProducts;

    } catch (error) {
      console.error('Frequently bought together error:', error);
      return [];
    }
  }

  /**
   * Get category-based recommendations
   */
  async getCategoryRecommendations(categoryId: string, limit: number = 12, sortBy: string = 'popularity'): Promise<any[]> {
    try {
      let orderByClause;
      
      switch (sortBy) {
        case 'rating':
          orderByClause = desc(sql`COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0)`);
          break;
        case 'price_low':
          orderByClause = asc(sql`${products.price}::DECIMAL`);
          break;
        case 'price_high':
          orderByClause = desc(sql`${products.price}::DECIMAL`);
          break;
        case 'newest':
          orderByClause = desc(products.createdAt);
          break;
        case 'popularity':
        default:
          orderByClause = desc(sql`COALESCE(CAST(${products.metadata}->>'salesCount' AS INTEGER), 0)`);
          break;
      }

      const categoryProducts = await db
        .select({
          id: products.id,
          name: products.name,
          nameBn: products.nameBn,
          price: products.price,
          imageUrl: products.imageUrl,
          categoryId: products.categoryId,
          vendorId: products.vendorId,
          rating: sql<number>`COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0)`,
          salesCount: sql<number>`COALESCE(CAST(${products.metadata}->>'salesCount' AS INTEGER), 0)`
        })
        .from(products)
        .where(
          and(
            eq(products.categoryId, categoryId),
            eq(products.isActive, true)
          )
        )
        .orderBy(orderByClause)
        .limit(limit);

      return categoryProducts;

    } catch (error) {
      console.error('Category recommendations error:', error);
      return [];
    }
  }

  /**
   * Get popular products by timeframe
   */
  async getPopularProductsByTimeframe(timeframe: string, limit: number = 20, categoryId?: string): Promise<any[]> {
    try {
      let dateFilter;
      
      switch (timeframe) {
        case 'daily':
          dateFilter = sql`${orderItems.createdAt} > NOW() - INTERVAL '1 day'`;
          break;
        case 'weekly':
          dateFilter = sql`${orderItems.createdAt} > NOW() - INTERVAL '7 days'`;
          break;
        case 'monthly':
          dateFilter = sql`${orderItems.createdAt} > NOW() - INTERVAL '30 days'`;
          break;
        default:
          dateFilter = sql`${orderItems.createdAt} > NOW() - INTERVAL '7 days'`;
      }

      const popularProducts = await db
        .select({
          id: products.id,
          name: products.name,
          nameBn: products.nameBn,
          price: products.price,
          imageUrl: products.imageUrl,
          categoryId: products.categoryId,
          vendorId: products.vendorId,
          rating: sql<number>`COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0)`,
          salesCount: sql<number>`COUNT(*)`,
          revenue: sql<number>`SUM(${orderItems.totalPrice}::DECIMAL)`
        })
        .from(products)
        .innerJoin(orderItems, eq(products.id, orderItems.productId))
        .where(
          and(
            eq(products.isActive, true),
            dateFilter,
            categoryId ? eq(products.categoryId, categoryId) : undefined
          )
        )
        .groupBy(products.id, products.name, products.nameBn, products.price, products.imageUrl, products.categoryId, products.vendorId)
        .orderBy(desc(sql`COUNT(*)`), desc(sql`SUM(${orderItems.totalPrice}::DECIMAL)`))
        .limit(limit);

      return popularProducts;

    } catch (error) {
      console.error('Popular products by timeframe error:', error);
      return [];
    }
  }

  /**
   * Record user feedback on recommendations
   */
  async recordFeedback(userId: number, productId: string, action: string, rating?: number): Promise<void> {
    try {
      await db.insert(userBehaviors).values({
        userId,
        behaviorType: 'recommendation_feedback',
        targetType: 'product',
        targetId: productId,
        action,
        metadata: {
          rating,
          timestamp: new Date().toISOString(),
          source: 'recommendation_engine'
        }
      });

      // Update recommendation weights based on feedback
      await this.updateRecommendationWeights(userId, productId, action, rating);

    } catch (error) {
      console.error('Record feedback error:', error);
    }
  }

  /**
   * Get user recommendation analytics
   */
  async getUserRecommendationAnalytics(userId: number): Promise<any> {
    try {
      const analytics = await db
        .select({
          totalRecommendations: count(),
          positiveActions: sql<number>`COUNT(CASE WHEN ${userBehaviors.action} IN ('click', 'purchase', 'add_to_cart') THEN 1 END)`,
          conversionRate: sql<number>`COUNT(CASE WHEN ${userBehaviors.action} = 'purchase' THEN 1 END) * 100.0 / COUNT(*)`,
          avgRating: sql<number>`AVG(CASE WHEN ${userBehaviors.metadata}->>'rating' IS NOT NULL THEN CAST(${userBehaviors.metadata}->>'rating' AS DECIMAL) END)`
        })
        .from(userBehaviors)
        .where(
          and(
            eq(userBehaviors.userId, userId),
            eq(userBehaviors.behaviorType, 'recommendation_feedback')
          )
        );

      return analytics[0] || {
        totalRecommendations: 0,
        positiveActions: 0,
        conversionRate: 0,
        avgRating: 0
      };

    } catch (error) {
      console.error('User recommendation analytics error:', error);
      return {
        totalRecommendations: 0,
        positiveActions: 0,
        conversionRate: 0,
        avgRating: 0
      };
    }
  }

  // Private helper methods

  private async findSimilarUsers(userId: number): Promise<{userId: number, similarity: number}[]> {
    try {
      // Find users with similar purchase patterns using Jaccard similarity
      const similarUsers = await db
        .select({
          userId: sql<number>`u2.user_id`,
          similarity: sql<number>`
            (COUNT(CASE WHEN u1.product_id = u2.product_id THEN 1 END) * 1.0) /
            (COUNT(DISTINCT u1.product_id) + COUNT(DISTINCT u2.product_id) - COUNT(CASE WHEN u1.product_id = u2.product_id THEN 1 END))
          `
        })
        .from(sql`(
          SELECT DISTINCT ${orders.userId} as user_id, ${orderItems.productId} as product_id
          FROM ${orders}
          JOIN ${orderItems} ON ${orders.id} = ${orderItems.orderId}
          WHERE ${orders.userId} = ${userId}
        ) u1`)
        .crossJoin(sql`(
          SELECT DISTINCT ${orders.userId} as user_id, ${orderItems.productId} as product_id
          FROM ${orders}
          JOIN ${orderItems} ON ${orders.id} = ${orderItems.orderId}
          WHERE ${orders.userId} != ${userId}
        ) u2`)
        .groupBy(sql`u2.user_id`)
        .having(sql`similarity > 0.1`) // Minimum similarity threshold
        .orderBy(desc(sql`similarity`))
        .limit(10);

      return similarUsers;

    } catch (error) {
      console.error('Find similar users error:', error);
      return [];
    }
  }

  private async getUserPurchasedProducts(userId: number): Promise<{id: string}[]> {
    try {
      return await db
        .select({ id: products.id })
        .from(products)
        .innerJoin(orderItems, eq(products.id, orderItems.productId))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(eq(orders.userId, userId))
        .groupBy(products.id);

    } catch (error) {
      console.error('Get user purchased products error:', error);
      return [];
    }
  }

  private async getUserPreferences(userId: number): Promise<{
    categories: string[],
    brands: string[],
    priceRange: {min: number, max: number}
  }> {
    try {
      const purchases = await db
        .select({
          categoryId: products.categoryId,
          brand: products.brand,
          price: sql<number>`${products.price}::DECIMAL`
        })
        .from(products)
        .innerJoin(orderItems, eq(products.id, orderItems.productId))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(eq(orders.userId, userId));

      const categories = [...new Set(purchases.map(p => p.categoryId).filter(Boolean))];
      const brands = [...new Set(purchases.map(p => p.brand).filter(Boolean))];
      const prices = purchases.map(p => p.price).filter(Boolean);
      
      const priceRange = prices.length > 0 ? {
        min: Math.min(...prices) * 0.5,
        max: Math.max(...prices) * 1.5
      } : { min: 0, max: 1000000 };

      return { categories, brands, priceRange };

    } catch (error) {
      console.error('Get user preferences error:', error);
      return { categories: [], brands: [], priceRange: { min: 0, max: 1000000 } };
    }
  }

  private combineAndScoreRecommendations(algorithmResults: {
    recommendations: any[], 
    weight: number, 
    algorithm: string
  }[]): any[] {
    const productScores = new Map<string, any>();

    for (const { recommendations, weight, algorithm } of algorithmResults) {
      recommendations.forEach((product, index) => {
        const rankScore = (recommendations.length - index) / recommendations.length;
        const algorithmScore = (product.score || 1) * weight * rankScore;

        if (productScores.has(product.id)) {
          const existing = productScores.get(product.id);
          existing.totalScore += algorithmScore;
          existing.algorithms.push(algorithm);
        } else {
          productScores.set(product.id, {
            ...product,
            totalScore: algorithmScore,
            algorithms: [algorithm]
          });
        }
      });
    }

    return Array.from(productScores.values())
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  private removeDuplicateProducts(products: any[]): any[] {
    const seen = new Set<string>();
    return products.filter(product => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  }

  private async updateRecommendationWeights(
    userId: number, 
    productId: string, 
    action: string, 
    rating?: number
  ): Promise<void> {
    // Implementation for updating ML model weights based on feedback
    // This would typically involve updating a machine learning model
    // For now, we'll log the feedback for future model training
    console.log(`Recommendation feedback: User ${userId}, Product ${productId}, Action ${action}, Rating ${rating}`);
  }
}