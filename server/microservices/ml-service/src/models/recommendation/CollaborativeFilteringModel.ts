/**
 * Amazon.com/Shopee.sg-Level Collaborative Filtering Recommendation Model
 * Advanced user-based and item-based collaborative filtering with Bangladesh market optimization
 */

import { logger } from '../../utils/logger';

interface User {
  id: string;
  preferences: Record<string, number>;
  demographics: Record<string, any>;
  bangladeshProfile: {
    region: string;
    culturalPreferences: string[];
    festivalBehavior: Record<string, number>;
    languagePreference: 'bangla' | 'english' | 'mixed';
  };
}

interface Product {
  id: string;
  features: Record<string, number>;
  category: string;
  bangladeshAttributes: {
    culturalRelevance: number;
    festivalAssociation: string[];
    regionalPopularity: Record<string, number>;
    localBrandStatus: boolean;
  };
}

interface Rating {
  userId: string;
  productId: string;
  rating: number;
  timestamp: Date;
  context: {
    festival?: string;
    season?: string;
    paymentMethod?: string;
  };
}

interface RecommendationResult {
  productId: string;
  score: number;
  confidence: number;
  reason: string;
  bangladeshContext: {
    culturalRelevance: number;
    festivalAlignment: number;
    regionalPreference: number;
  };
}

export class CollaborativeFilteringModel {
  private userSimilarityMatrix: Map<string, Map<string, number>> = new Map();
  private itemSimilarityMatrix: Map<string, Map<string, number>> = new Map();
  private userRatings: Map<string, Map<string, number>> = new Map();
  private itemRatings: Map<string, Map<string, number>> = new Map();
  private bangladeshCulturalWeights: Map<string, number> = new Map();
  
  private readonly minSimilarityThreshold = 0.1;
  private readonly maxRecommendations = 50;
  private readonly bangladeshCulturalBoost = 1.2;

  constructor() {
    this.initializeBangladeshCulturalWeights();
    logger.info('🤖 Collaborative Filtering Model initialized with Bangladesh optimization');
  }

  /**
   * Initialize Bangladesh-specific cultural weights for recommendation boosting
   */
  private initializeBangladeshCulturalWeights(): void {
    // Festival-based weights
    this.bangladeshCulturalWeights.set('eid', 1.5);
    this.bangladeshCulturalWeights.set('durga_puja', 1.4);
    this.bangladeshCulturalWeights.set('pohela_boishakh', 1.3);
    this.bangladeshCulturalWeights.set('victory_day', 1.2);
    
    // Regional weights
    this.bangladeshCulturalWeights.set('dhaka_preference', 1.1);
    this.bangladeshCulturalWeights.set('chittagong_preference', 1.1);
    this.bangladeshCulturalWeights.set('rural_preference', 1.2);
    
    // Cultural category weights
    this.bangladeshCulturalWeights.set('traditional_clothing', 1.3);
    this.bangladeshCulturalWeights.set('religious_items', 1.4);
    this.bangladeshCulturalWeights.set('local_brands', 1.2);
  }

  /**
   * Train the collaborative filtering model with user-item interactions
   */
  async trainModel(ratings: Rating[], users: User[], products: Product[]): Promise<void> {
    try {
      logger.info('🔧 Training Collaborative Filtering Model', { 
        ratingsCount: ratings.length,
        usersCount: users.length,
        productsCount: products.length
      });

      // Build user-item rating matrices
      this.buildRatingMatrices(ratings);
      
      // Calculate user-user similarities
      await this.calculateUserSimilarities(users);
      
      // Calculate item-item similarities
      await this.calculateItemSimilarities(products);
      
      // Apply Bangladesh cultural optimizations
      this.applyBangladeshOptimizations(users, products);

      logger.info('✅ Collaborative Filtering Model training completed successfully');
    } catch (error) {
      logger.error('❌ Error training Collaborative Filtering Model', { error });
      throw error;
    }
  }

  /**
   * Build user-item and item-user rating matrices
   */
  private buildRatingMatrices(ratings: Rating[]): void {
    // Clear existing matrices
    this.userRatings.clear();
    this.itemRatings.clear();

    // Build matrices from ratings
    for (const rating of ratings) {
      // User-item matrix
      if (!this.userRatings.has(rating.userId)) {
        this.userRatings.set(rating.userId, new Map());
      }
      this.userRatings.get(rating.userId)!.set(rating.productId, rating.rating);

      // Item-user matrix
      if (!this.itemRatings.has(rating.productId)) {
        this.itemRatings.set(rating.productId, new Map());
      }
      this.itemRatings.get(rating.productId)!.set(rating.userId, rating.rating);
    }

    logger.info('📊 Rating matrices built', {
      usersWithRatings: this.userRatings.size,
      itemsWithRatings: this.itemRatings.size
    });
  }

  /**
   * Calculate user-user similarities using Pearson correlation with Bangladesh cultural factors
   */
  private async calculateUserSimilarities(users: User[]): Promise<void> {
    this.userSimilarityMatrix.clear();
    const userMap = new Map(users.map(u => [u.id, u]));

    for (const user1 of users) {
      const similarities = new Map<string, number>();
      
      for (const user2 of users) {
        if (user1.id === user2.id) continue;
        
        const similarity = this.calculatePearsonCorrelation(
          user1.id, 
          user2.id,
          userMap.get(user1.id)!,
          userMap.get(user2.id)!
        );
        
        if (similarity > this.minSimilarityThreshold) {
          similarities.set(user2.id, similarity);
        }
      }
      
      this.userSimilarityMatrix.set(user1.id, similarities);
    }

    logger.info('🔗 User similarities calculated', {
      totalUsers: users.length,
      avgSimilaritiesPerUser: Array.from(this.userSimilarityMatrix.values())
        .reduce((sum, similarities) => sum + similarities.size, 0) / users.length
    });
  }

  /**
   * Calculate item-item similarities using cosine similarity
   */
  private async calculateItemSimilarities(products: Product[]): Promise<void> {
    this.itemSimilarityMatrix.clear();

    for (const product1 of products) {
      const similarities = new Map<string, number>();
      
      for (const product2 of products) {
        if (product1.id === product2.id) continue;
        
        const similarity = this.calculateCosineSimilarity(product1.id, product2.id);
        
        if (similarity > this.minSimilarityThreshold) {
          similarities.set(product2.id, similarity);
        }
      }
      
      this.itemSimilarityMatrix.set(product1.id, similarities);
    }

    logger.info('🔗 Item similarities calculated', {
      totalProducts: products.length,
      avgSimilaritiesPerItem: Array.from(this.itemSimilarityMatrix.values())
        .reduce((sum, similarities) => sum + similarities.size, 0) / products.length
    });
  }

  /**
   * Calculate Pearson correlation between two users with Bangladesh cultural factors
   */
  private calculatePearsonCorrelation(
    userId1: string, 
    userId2: string, 
    user1: User, 
    user2: User
  ): number {
    const ratings1 = this.userRatings.get(userId1) || new Map();
    const ratings2 = this.userRatings.get(userId2) || new Map();
    
    // Find common items
    const commonItems = Array.from(ratings1.keys()).filter(item => ratings2.has(item));
    
    if (commonItems.length < 2) return 0;
    
    // Calculate Pearson correlation
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;
    
    for (const item of commonItems) {
      const rating1 = ratings1.get(item)!;
      const rating2 = ratings2.get(item)!;
      
      sum1 += rating1;
      sum2 += rating2;
      sum1Sq += rating1 * rating1;
      sum2Sq += rating2 * rating2;
      pSum += rating1 * rating2;
    }
    
    const num = pSum - (sum1 * sum2 / commonItems.length);
    const den = Math.sqrt(
      (sum1Sq - sum1 * sum1 / commonItems.length) * 
      (sum2Sq - sum2 * sum2 / commonItems.length)
    );
    
    if (den === 0) return 0;
    
    let correlation = num / den;
    
    // Apply Bangladesh cultural similarity boost
    const culturalSimilarity = this.calculateBangladeshCulturalSimilarity(user1, user2);
    correlation *= (1 + culturalSimilarity * 0.1); // 10% boost for cultural similarity
    
    return Math.max(-1, Math.min(1, correlation));
  }

  /**
   * Calculate cosine similarity between two items
   */
  private calculateCosineSimilarity(itemId1: string, itemId2: string): number {
    const ratings1 = this.itemRatings.get(itemId1) || new Map();
    const ratings2 = this.itemRatings.get(itemId2) || new Map();
    
    // Find common users
    const commonUsers = Array.from(ratings1.keys()).filter(user => ratings2.has(user));
    
    if (commonUsers.length === 0) return 0;
    
    // Calculate cosine similarity
    let dotProduct = 0, norm1 = 0, norm2 = 0;
    
    for (const user of commonUsers) {
      const rating1 = ratings1.get(user)!;
      const rating2 = ratings2.get(user)!;
      
      dotProduct += rating1 * rating2;
      norm1 += rating1 * rating1;
      norm2 += rating2 * rating2;
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Calculate cultural similarity between two Bangladesh users
   */
  private calculateBangladeshCulturalSimilarity(user1: User, user2: User): number {
    let similarity = 0;
    let factors = 0;
    
    // Regional similarity
    if (user1.bangladeshProfile.region === user2.bangladeshProfile.region) {
      similarity += 1;
    }
    factors++;
    
    // Language preference similarity
    if (user1.bangladeshProfile.languagePreference === user2.bangladeshProfile.languagePreference) {
      similarity += 1;
    }
    factors++;
    
    // Cultural preferences overlap
    const preferences1 = new Set(user1.bangladeshProfile.culturalPreferences);
    const preferences2 = new Set(user2.bangladeshProfile.culturalPreferences);
    const intersection = new Set([...preferences1].filter(x => preferences2.has(x)));
    const union = new Set([...preferences1, ...preferences2]);
    
    if (union.size > 0) {
      similarity += intersection.size / union.size;
      factors++;
    }
    
    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * Apply Bangladesh-specific optimizations to the model
   */
  private applyBangladeshOptimizations(users: User[], products: Product[]): void {
    // Boost similarities for users with similar cultural profiles
    for (const [userId, similarities] of this.userSimilarityMatrix) {
      const user = users.find(u => u.id === userId);
      if (!user) continue;
      
      for (const [similarUserId, similarity] of similarities) {
        const similarUser = users.find(u => u.id === similarUserId);
        if (!similarUser) continue;
        
        const culturalBoost = this.calculateBangladeshCulturalSimilarity(user, similarUser);
        const boostedSimilarity = similarity * (1 + culturalBoost * 0.2);
        similarities.set(similarUserId, Math.min(1, boostedSimilarity));
      }
    }
    
    logger.info('🇧🇩 Bangladesh cultural optimizations applied to collaborative filtering model');
  }

  /**
   * Generate recommendations for a user using collaborative filtering
   */
  async generateRecommendations(
    userId: string, 
    user: User, 
    products: Product[], 
    excludeRatedItems: boolean = true
  ): Promise<RecommendationResult[]> {
    try {
      const userBasedRecs = this.generateUserBasedRecommendations(userId, user, products);
      const itemBasedRecs = this.generateItemBasedRecommendations(userId, user, products);
      
      // Combine and weight recommendations
      const combinedRecs = this.combineRecommendations(userBasedRecs, itemBasedRecs, user);
      
      // Apply Bangladesh cultural boosts
      const bangladeshOptimizedRecs = this.applyBangladeshRecommendationBoosts(combinedRecs, user, products);
      
      // Filter out already rated items if requested
      let finalRecs = bangladeshOptimizedRecs;
      if (excludeRatedItems) {
        const userRatings = this.userRatings.get(userId) || new Map();
        finalRecs = bangladeshOptimizedRecs.filter(rec => !userRatings.has(rec.productId));
      }
      
      // Sort by score and limit results
      finalRecs.sort((a, b) => b.score - a.score);
      const topRecommendations = finalRecs.slice(0, this.maxRecommendations);
      
      logger.info('🎯 Collaborative filtering recommendations generated', {
        userId,
        userBasedCount: userBasedRecs.length,
        itemBasedCount: itemBasedRecs.length,
        finalCount: topRecommendations.length,
        topScore: topRecommendations[0]?.score || 0
      });
      
      return topRecommendations;
    } catch (error) {
      logger.error('❌ Error generating collaborative filtering recommendations', { error, userId });
      throw error;
    }
  }

  /**
   * Generate user-based recommendations
   */
  private generateUserBasedRecommendations(
    userId: string, 
    user: User, 
    products: Product[]
  ): RecommendationResult[] {
    const recommendations: RecommendationResult[] = [];
    const userSimilarities = this.userSimilarityMatrix.get(userId) || new Map();
    
    if (userSimilarities.size === 0) return recommendations;
    
    // Get products liked by similar users
    const productScores = new Map<string, { totalScore: number; count: number; reasons: string[] }>();
    
    for (const [similarUserId, similarity] of userSimilarities) {
      const similarUserRatings = this.userRatings.get(similarUserId) || new Map();
      
      for (const [productId, rating] of similarUserRatings) {
        if (rating >= 4) { // Only consider high ratings
          if (!productScores.has(productId)) {
            productScores.set(productId, { totalScore: 0, count: 0, reasons: [] });
          }
          
          const productScore = productScores.get(productId)!;
          productScore.totalScore += similarity * rating;
          productScore.count++;
          productScore.reasons.push(`Similar user (${similarity.toFixed(2)} similarity) rated ${rating}/5`);
        }
      }
    }
    
    // Convert to recommendations
    for (const [productId, scoreData] of productScores) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;
      
      const avgScore = scoreData.totalScore / scoreData.count;
      const confidence = Math.min(scoreData.count / 5, 1); // Higher confidence with more similar users
      
      recommendations.push({
        productId,
        score: avgScore,
        confidence,
        reason: `Users similar to you liked this (${scoreData.count} similar users)`,
        bangladeshContext: {
          culturalRelevance: product.bangladeshAttributes.culturalRelevance,
          festivalAlignment: 0,
          regionalPreference: product.bangladeshAttributes.regionalPopularity[user.bangladeshProfile.region] || 0
        }
      });
    }
    
    return recommendations;
  }

  /**
   * Generate item-based recommendations
   */
  private generateItemBasedRecommendations(
    userId: string, 
    user: User, 
    products: Product[]
  ): RecommendationResult[] {
    const recommendations: RecommendationResult[] = [];
    const userRatings = this.userRatings.get(userId) || new Map();
    
    if (userRatings.size === 0) return recommendations;
    
    // Get products similar to ones the user liked
    const productScores = new Map<string, { totalScore: number; count: number; reasons: string[] }>();
    
    for (const [ratedProductId, rating] of userRatings) {
      if (rating < 4) continue; // Only use highly rated items
      
      const similarItems = this.itemSimilarityMatrix.get(ratedProductId) || new Map();
      
      for (const [similarProductId, similarity] of similarItems) {
        if (!productScores.has(similarProductId)) {
          productScores.set(similarProductId, { totalScore: 0, count: 0, reasons: [] });
        }
        
        const productScore = productScores.get(similarProductId)!;
        productScore.totalScore += similarity * rating;
        productScore.count++;
        productScore.reasons.push(`Similar to item you rated ${rating}/5 (${similarity.toFixed(2)} similarity)`);
      }
    }
    
    // Convert to recommendations
    for (const [productId, scoreData] of productScores) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;
      
      const avgScore = scoreData.totalScore / scoreData.count;
      const confidence = Math.min(scoreData.count / 3, 1); // Higher confidence with more similar items
      
      recommendations.push({
        productId,
        score: avgScore,
        confidence,
        reason: `Similar to items you liked (${scoreData.count} similar items)`,
        bangladeshContext: {
          culturalRelevance: product.bangladeshAttributes.culturalRelevance,
          festivalAlignment: 0,
          regionalPreference: product.bangladeshAttributes.regionalPopularity[user.bangladeshProfile.region] || 0
        }
      });
    }
    
    return recommendations;
  }

  /**
   * Combine user-based and item-based recommendations
   */
  private combineRecommendations(
    userBased: RecommendationResult[], 
    itemBased: RecommendationResult[], 
    user: User
  ): RecommendationResult[] {
    const combined = new Map<string, RecommendationResult>();
    
    // Add user-based recommendations with 60% weight
    for (const rec of userBased) {
      combined.set(rec.productId, {
        ...rec,
        score: rec.score * 0.6,
        reason: `User-based: ${rec.reason}`
      });
    }
    
    // Add or combine item-based recommendations with 40% weight
    for (const rec of itemBased) {
      if (combined.has(rec.productId)) {
        const existing = combined.get(rec.productId)!;
        existing.score += rec.score * 0.4;
        existing.confidence = Math.max(existing.confidence, rec.confidence);
        existing.reason += ` + Item-based: ${rec.reason}`;
      } else {
        combined.set(rec.productId, {
          ...rec,
          score: rec.score * 0.4,
          reason: `Item-based: ${rec.reason}`
        });
      }
    }
    
    return Array.from(combined.values());
  }

  /**
   * Apply Bangladesh-specific recommendation boosts
   */
  private applyBangladeshRecommendationBoosts(
    recommendations: RecommendationResult[], 
    user: User, 
    products: Product[]
  ): RecommendationResult[] {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    return recommendations.map(rec => {
      const product = products.find(p => p.id === rec.productId);
      if (!product) return rec;
      
      let boost = 1;
      let festivalAlignment = 0;
      
      // Apply cultural relevance boost
      if (product.bangladeshAttributes.culturalRelevance > 0.7) {
        boost *= this.bangladeshCulturalBoost;
      }
      
      // Apply local brand boost
      if (product.bangladeshAttributes.localBrandStatus) {
        boost *= this.bangladeshCulturalWeights.get('local_brands') || 1;
      }
      
      // Apply regional preference boost
      const regionalPreference = product.bangladeshAttributes.regionalPopularity[user.bangladeshProfile.region];
      if (regionalPreference && regionalPreference > 0.7) {
        boost *= this.bangladeshCulturalWeights.get(`${user.bangladeshProfile.region}_preference`) || 1;
      }
      
      // Apply festival-specific boosts
      for (const festival of product.bangladeshAttributes.festivalAssociation) {
        const festivalWeight = this.bangladeshCulturalWeights.get(festival) || 1;
        if (this.isFestivalSeason(festival, currentDate)) {
          boost *= festivalWeight;
          festivalAlignment = Math.max(festivalAlignment, festivalWeight - 1);
        }
      }
      
      return {
        ...rec,
        score: rec.score * boost,
        bangladeshContext: {
          ...rec.bangladeshContext,
          festivalAlignment
        }
      };
    });
  }

  /**
   * Check if current date is within festival season
   */
  private isFestivalSeason(festival: string, currentDate: Date): boolean {
    const month = currentDate.getMonth();
    
    switch (festival) {
      case 'eid':
        return month === 3 || month === 4 || month === 10; // Approximate Eid months
      case 'durga_puja':
        return month === 8 || month === 9; // September-October
      case 'pohela_boishakh':
        return month === 3; // April
      case 'victory_day':
        return month === 11; // December
      default:
        return false;
    }
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics(): Record<string, any> {
    return {
      userSimilarityCount: this.userSimilarityMatrix.size,
      itemSimilarityCount: this.itemSimilarityMatrix.size,
      totalRatings: Array.from(this.userRatings.values()).reduce((sum, ratings) => sum + ratings.size, 0),
      avgUserSimilarities: Array.from(this.userSimilarityMatrix.values())
        .reduce((sum, similarities) => sum + similarities.size, 0) / this.userSimilarityMatrix.size,
      avgItemSimilarities: Array.from(this.itemSimilarityMatrix.values())
        .reduce((sum, similarities) => sum + similarities.size, 0) / this.itemSimilarityMatrix.size,
      bangladeshOptimizations: {
        culturalWeightsCount: this.bangladeshCulturalWeights.size,
        culturalBoostFactor: this.bangladeshCulturalBoost
      }
    };
  }
}