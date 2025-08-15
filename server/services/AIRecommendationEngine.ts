// Temporarily commenting out schema imports to fix server startup
// import { db } from "../db";
// import { 
//   products, 
//   users, 
//   orders, 
//   orderItems, 
//   userBehaviors, 
//   productRecommendations,
//   productReviews 
// } from "@shared/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import * as natural from "natural";
import { NlpManager } from "node-nlp";

export class AIRecommendationEngine {
  private nlpManager: NlpManager;
  
  constructor() {
    this.nlpManager = new NlpManager({ languages: ['en', 'bn'] });
    this.initializeNLP();
  }

  private async initializeNLP() {
    // Initialize with basic product understanding
    this.nlpManager.addLanguage('en');
    this.nlpManager.addLanguage('bn');
    
    // Train basic product categories and intents
    const categories = [
      'electronics', 'fashion', 'home', 'books', 'sports', 
      'beauty', 'health', 'toys', 'automotive', 'food'
    ];
    
    categories.forEach(category => {
      this.nlpManager.addDocument('en', `I want ${category}`, `product.${category}`);
      this.nlpManager.addDocument('en', `Show me ${category}`, `product.${category}`);
      this.nlpManager.addDocument('en', `Looking for ${category}`, `product.${category}`);
    });

    await this.nlpManager.train();
  }

  // Collaborative Filtering: Users who bought similar items
  async generateCollaborativeRecommendations(userId: number, limit = 10) {
    try {
      const userPurchases = await db
        .select({ productId: orderItems.productId })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(eq(orders.userId, userId));

      if (userPurchases.length === 0) {
        return this.generatePopularRecommendations(limit);
      }

      const productIds = userPurchases.map(p => p.productId);

      // Find users who bought similar products
      const similarUsers = await db
        .select({ 
          userId: orders.userId,
          similarityScore: sql<number>`count(*) as similarity_score`
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(sql`${orderItems.productId} IN (${productIds.map(id => `'${id}'`).join(',')})`)
        .groupBy(orders.userId)
        .having(sql`count(*) >= 2`)
        .orderBy(desc(sql`count(*)`))
        .limit(50);

      // Get products bought by similar users but not by current user
      const similarUserIds = similarUsers.map(u => u.userId);
      
      const recommendations = await db
        .select({
          productId: orderItems.productId,
          score: sql<number>`count(*) as purchase_frequency`,
          product: products
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(products.id, orderItems.productId))
        .where(
          and(
            sql`${orders.userId} IN (${similarUserIds.map(id => id.toString()).join(',')})`,
            sql`${orderItems.productId} NOT IN (${productIds.map(id => `'${id}'`).join(',')})`
          )
        )
        .groupBy(orderItems.productId, products.id)
        .orderBy(desc(sql`count(*)`))
        .limit(limit);

      // Store recommendations in database
      await this.storeRecommendations(userId, recommendations, 'collaborative');
      
      return recommendations;
    } catch (error) {
      console.error('Error generating collaborative recommendations:', error);
      return this.generatePopularRecommendations(limit);
    }
  }

  // Content-Based Filtering: Similar products based on attributes
  async generateContentBasedRecommendations(userId: number, limit = 10) {
    try {
      // Get user's purchase history
      const userPurchases = await db
        .select({ product: products })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(products.id, orderItems.productId))
        .where(eq(orders.userId, userId))
        .limit(20);

      if (userPurchases.length === 0) {
        return this.generateTrendingRecommendations(limit);
      }

      // Extract user preferences
      const userCategories = [...new Set(userPurchases.map(p => p.product.categoryId))];
      const userPriceRange = this.calculatePriceRange(userPurchases.map(p => parseFloat(p.product.price)));

      // Find similar products
      const recommendations = await db
        .select({
          product: products,
          score: sql<number>`
            CASE 
              WHEN ${products.categoryId} IN (${userCategories.map(id => `'${id}'`).join(',')}) THEN 5
              ELSE 1
            END +
            CASE 
              WHEN ${products.price} BETWEEN ${userPriceRange.min} AND ${userPriceRange.max} THEN 3
              ELSE 0
            END as content_score
          `
        })
        .from(products)
        .where(
          sql`${products.id} NOT IN (
            SELECT ${orderItems.productId} 
            FROM ${orderItems} 
            INNER JOIN ${orders} ON ${orders.id} = ${orderItems.orderId}
            WHERE ${orders.userId} = ${userId}
          )`
        )
        .orderBy(desc(sql`content_score`), desc(products.createdAt))
        .limit(limit);

      // Store recommendations
      await this.storeRecommendations(userId, recommendations, 'content-based');
      
      return recommendations;
    } catch (error) {
      console.error('Error generating content-based recommendations:', error);
      return this.generateTrendingRecommendations(limit);
    }
  }

  // Hybrid Recommendations: Combine collaborative and content-based
  async generateHybridRecommendations(userId: number, limit = 10) {
    try {
      const [collaborative, contentBased] = await Promise.all([
        this.generateCollaborativeRecommendations(userId, Math.ceil(limit * 0.6)),
        this.generateContentBasedRecommendations(userId, Math.ceil(limit * 0.4))
      ]);

      // Combine and deduplicate
      const combinedRecommendations = new Map();
      
      collaborative.forEach((item: any) => {
        combinedRecommendations.set(item.productId, {
          ...item,
          hybridScore: (item.score || 0) * 0.6
        });
      });

      contentBased.forEach((item: any) => {
        const existing = combinedRecommendations.get(item.product.id);
        if (existing) {
          existing.hybridScore += (item.score || 0) * 0.4;
        } else {
          combinedRecommendations.set(item.product.id, {
            productId: item.product.id,
            product: item.product,
            hybridScore: (item.score || 0) * 0.4
          });
        }
      });

      const finalRecommendations = Array.from(combinedRecommendations.values())
        .sort((a, b) => b.hybridScore - a.hybridScore)
        .slice(0, limit);

      // Store hybrid recommendations
      await this.storeRecommendations(userId, finalRecommendations, 'hybrid');
      
      return finalRecommendations;
    } catch (error) {
      console.error('Error generating hybrid recommendations:', error);
      return this.generatePopularRecommendations(limit);
    }
  }

  // Popular products fallback
  async generatePopularRecommendations(limit = 10) {
    return await db
      .select({
        product: products,
        orderCount: sql<number>`COUNT(${orderItems.id})`
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .groupBy(products.id)
      .orderBy(desc(sql`COUNT(${orderItems.id})`))
      .limit(limit);
  }

  // Trending products based on recent activity
  async generateTrendingRecommendations(limit = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await db
      .select({
        product: products,
        recentOrders: sql<number>`COUNT(${orderItems.id})`
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(gte(orders.createdAt, thirtyDaysAgo))
      .groupBy(products.id)
      .orderBy(desc(sql`COUNT(${orderItems.id})`))
      .limit(limit);
  }

  // Store recommendations in database for analysis
  private async storeRecommendations(userId: number, recommendations: any[], type: string) {
    try {
      const recommendationData = recommendations.map((rec: any) => ({
        userId,
        productId: rec.productId || rec.product?.id,
        recommendationType: type,
        score: rec.score || rec.hybridScore || 1,
        reason: `Generated via ${type} filtering`,
      }));

      await db.insert(productRecommendations).values(recommendationData);
    } catch (error) {
      console.error('Error storing recommendations:', error);
    }
  }

  // Utility methods
  private calculatePriceRange(prices: number[]) {
    const sortedPrices = prices.sort((a, b) => a - b);
    const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
    const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
    
    return {
      min: Math.max(0, q1 * 0.5),
      max: q3 * 2
    };
  }

  // Natural language product search with intent recognition
  async searchWithNLP(query: string, language = 'en') {
    try {
      const response = await this.nlpManager.process(language, query);
      
      // Extract entities and intent
      const entities = response.entities || [];
      const intent = response.intent || 'general.search';
      
      // Build search criteria based on NLP analysis
      let searchCriteria: any = {};
      
      entities.forEach(entity => {
        switch (entity.entity) {
          case 'product-category':
            searchCriteria.category = entity.utteranceText;
            break;
          case 'price-range':
            searchCriteria.priceRange = this.extractPriceRange(entity.utteranceText);
            break;
          case 'brand':
            searchCriteria.brand = entity.utteranceText;
            break;
        }
      });

      return {
        intent: response.intent,
        entities: response.entities,
        searchCriteria,
        confidence: response.score
      };
    } catch (error) {
      console.error('Error in NLP search:', error);
      return {
        intent: 'general.search',
        entities: [],
        searchCriteria: { query },
        confidence: 0.5
      };
    }
  }

  private extractPriceRange(text: string) {
    const pricePattern = /(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
    const prices = text.match(pricePattern)?.map(p => parseFloat(p.replace(',', ''))) || [];
    
    if (prices.length >= 2) {
      return { min: Math.min(...prices), max: Math.max(...prices) };
    } else if (prices.length === 1) {
      return { max: prices[0] };
    }
    
    return null;
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();