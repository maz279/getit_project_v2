/**
 * Collaborative Filtering Service
 * Provides enhanced recommendation algorithms using user behavior patterns
 */

interface UserRating {
  userId: string;
  productId: string;
  rating: number;
  timestamp: number;
  category?: string;
}

interface RecommendationRequest {
  userId: string;
  count?: number;
  category?: string;
  excludeOwned?: boolean;
}

interface RecommendationResult {
  productId: string;
  score: number;
  reason: string;
  category: string;
  confidence: number;
}

interface UserSimilarity {
  userId: string;
  similarity: number;
  sharedProducts: number;
}

export class CollaborativeFilteringService {
  private userRatings: Map<string, UserRating[]> = new Map();
  private productRatings: Map<string, UserRating[]> = new Map();
  private userSimilarities: Map<string, UserSimilarity[]> = new Map();
  private isInitialized = false;

  // Algorithm parameters
  private readonly MIN_RATINGS = 3;
  private readonly MIN_SIMILARITY = 0.3;
  private readonly MAX_RECOMMENDATIONS = 20;

  constructor() {}

  public async initialize(): Promise<void> {
    try {
      console.log('🤝 Initializing Collaborative Filtering Service...');

      // Load historical rating data
      await this.loadHistoricalData();

      // Precompute user similarities
      await this.computeUserSimilarities();

      this.isInitialized = true;
      console.log('✅ Collaborative Filtering Service initialized successfully');
    } catch (error) {
      console.error('❌ Collaborative Filtering Service initialization failed:', error);
      throw error;
    }
  }

  public async getRecommendations(request: RecommendationRequest): Promise<{
    recommendations: RecommendationResult[];
    algorithm: 'collaborative' | 'popularity' | 'content';
    processingTime: number;
  }> {
    const startTime = performance.now();

    if (!this.isInitialized) {
      console.warn('Collaborative Filtering Service not fully initialized, using fallback recommendations');
      return {
        recommendations: await this.generateFallbackRecommendations(request),
        algorithm: 'popularity',
        processingTime: performance.now() - startTime
      };
    }

    const { userId, count = 10, category, excludeOwned = true } = request;

    // Check if user has enough ratings for collaborative filtering
    const userRatings = this.userRatings.get(userId) || [];
    
    let recommendations: RecommendationResult[];
    let algorithm: 'collaborative' | 'popularity' | 'content';

    if (userRatings.length >= this.MIN_RATINGS) {
      // Use collaborative filtering for users with sufficient data
      recommendations = await this.collaborativeFiltering(userId, count, category, excludeOwned);
      algorithm = 'collaborative';
    } else {
      // Use popularity-based recommendations for new users
      recommendations = await this.popularityBasedRecommendations(count, category);
      algorithm = 'popularity';
    }

    const processingTime = performance.now() - startTime;

    return {
      recommendations,
      algorithm,
      processingTime
    };
  }

  public async addRating(rating: UserRating): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Collaborative Filtering Service not fully initialized, skipping rating storage');
      return;
    }

    // Add to user ratings
    if (!this.userRatings.has(rating.userId)) {
      this.userRatings.set(rating.userId, []);
    }
    this.userRatings.get(rating.userId)!.push(rating);

    // Add to product ratings
    if (!this.productRatings.has(rating.productId)) {
      this.productRatings.set(rating.productId, []);
    }
    this.productRatings.get(rating.productId)!.push(rating);

    // Recompute similarities for affected user (async)
    this.updateUserSimilarities(rating.userId);
  }

  public async getSimilarUsers(userId: string, count: number = 10): Promise<UserSimilarity[]> {
    if (!this.isInitialized) {
      throw new Error('Collaborative Filtering Service not initialized');
    }

    const similarities = this.userSimilarities.get(userId) || [];
    return similarities
      .filter(sim => sim.similarity >= this.MIN_SIMILARITY)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count);
  }

  public async getProductSimilarity(productId1: string, productId2: string): Promise<number> {
    if (!this.isInitialized) {
      return 0;
    }

    const ratings1 = this.productRatings.get(productId1) || [];
    const ratings2 = this.productRatings.get(productId2) || [];

    // Find common users
    const users1 = new Set(ratings1.map(r => r.userId));
    const users2 = new Set(ratings2.map(r => r.userId));
    const commonUsers = Array.from(users1).filter(user => users2.has(user));

    if (commonUsers.length < 2) {
      return 0;
    }

    // Calculate Pearson correlation
    const pairs = commonUsers.map(userId => {
      const rating1 = ratings1.find(r => r.userId === userId)!.rating;
      const rating2 = ratings2.find(r => r.userId === userId)!.rating;
      return [rating1, rating2];
    });

    return this.calculatePearsonCorrelation(pairs);
  }

  public async getAnalytics(): Promise<{
    totalUsers: number;
    totalProducts: number;
    totalRatings: number;
    averageRating: number;
    coverageRate: number;
    sparsityRate: number;
  }> {
    const totalUsers = this.userRatings.size;
    const totalProducts = this.productRatings.size;
    const totalRatings = Array.from(this.userRatings.values())
      .reduce((sum, ratings) => sum + ratings.length, 0);

    const allRatings = Array.from(this.userRatings.values()).flat();
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : 0;

    const possibleRatings = totalUsers * totalProducts;
    const coverageRate = possibleRatings > 0 ? (totalRatings / possibleRatings) * 100 : 0;
    const sparsityRate = 100 - coverageRate;

    return {
      totalUsers,
      totalProducts,
      totalRatings,
      averageRating: Math.round(averageRating * 100) / 100,
      coverageRate: Math.round(coverageRate * 1000) / 1000,
      sparsityRate: Math.round(sparsityRate * 1000) / 1000
    };
  }

  private async collaborativeFiltering(
    userId: string, 
    count: number, 
    category?: string, 
    excludeOwned: boolean = true
  ): Promise<RecommendationResult[]> {
    const similarUsers = await this.getSimilarUsers(userId, 20);
    const userRatings = this.userRatings.get(userId) || [];
    const ownedProducts = new Set(userRatings.map(r => r.productId));

    const productScores: Map<string, { score: number; votes: number; reasons: string[] }> = new Map();

    // Collect recommendations from similar users
    for (const similarUser of similarUsers) {
      const theirRatings = this.userRatings.get(similarUser.userId) || [];
      
      for (const rating of theirRatings) {
        // Skip if user already owns the product and excludeOwned is true
        if (excludeOwned && ownedProducts.has(rating.productId)) {
          continue;
        }

        // Skip if category filter doesn't match
        if (category && rating.category !== category) {
          continue;
        }

        // Only recommend products with good ratings (>= 3.5)
        if (rating.rating >= 3.5) {
          const weightedScore = rating.rating * similarUser.similarity;
          
          if (!productScores.has(rating.productId)) {
            productScores.set(rating.productId, { score: 0, votes: 0, reasons: [] });
          }

          const current = productScores.get(rating.productId)!;
          current.score += weightedScore;
          current.votes += 1;
          current.reasons.push(`Similar user rated ${rating.rating}/5`);
        }
      }
    }

    // Convert to recommendations
    const recommendations: RecommendationResult[] = [];
    for (const [productId, data] of productScores.entries()) {
      if (data.votes >= 2) { // Require at least 2 votes
        const averageScore = data.score / data.votes;
        const confidence = Math.min(1, data.votes / 5); // Higher confidence with more votes

        recommendations.push({
          productId,
          score: averageScore,
          reason: `Recommended by ${data.votes} similar users`,
          category: category || 'general',
          confidence
        });
      }
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  private async popularityBasedRecommendations(
    count: number, 
    category?: string
  ): Promise<RecommendationResult[]> {
    const productPopularity: Map<string, { totalRating: number; ratingCount: number; avgRating: number }> = new Map();

    // Calculate popularity scores
    for (const [productId, ratings] of this.productRatings.entries()) {
      // Filter by category if specified
      const filteredRatings = category 
        ? ratings.filter(r => r.category === category)
        : ratings;

      if (filteredRatings.length > 0) {
        const totalRating = filteredRatings.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / filteredRatings.length;

        productPopularity.set(productId, {
          totalRating,
          ratingCount: filteredRatings.length,
          avgRating
        });
      }
    }

    // Calculate Wilson score for robust popularity ranking
    const recommendations: RecommendationResult[] = [];
    for (const [productId, data] of productPopularity.entries()) {
      if (data.ratingCount >= 3 && data.avgRating >= 3.5) {
        const wilsonScore = this.calculateWilsonScore(data.avgRating, data.ratingCount);
        
        recommendations.push({
          productId,
          score: wilsonScore,
          reason: `Popular item (${data.avgRating.toFixed(1)}/5 from ${data.ratingCount} users)`,
          category: category || 'general',
          confidence: Math.min(1, data.ratingCount / 10)
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  private async computeUserSimilarities(): Promise<void> {
    const userIds = Array.from(this.userRatings.keys());

    for (const userId1 of userIds) {
      const similarities: UserSimilarity[] = [];

      for (const userId2 of userIds) {
        if (userId1 !== userId2) {
          const similarity = this.calculateUserSimilarity(userId1, userId2);
          if (similarity.similarity >= this.MIN_SIMILARITY) {
            similarities.push(similarity);
          }
        }
      }

      // Sort by similarity and keep top 50
      similarities.sort((a, b) => b.similarity - a.similarity);
      this.userSimilarities.set(userId1, similarities.slice(0, 50));
    }
  }

  private calculateUserSimilarity(userId1: string, userId2: string): UserSimilarity {
    const ratings1 = this.userRatings.get(userId1) || [];
    const ratings2 = this.userRatings.get(userId2) || [];

    // Create product rating maps
    const products1 = new Map(ratings1.map(r => [r.productId, r.rating]));
    const products2 = new Map(ratings2.map(r => [r.productId, r.rating]));

    // Find common products
    const commonProducts = Array.from(products1.keys()).filter(pid => products2.has(pid));

    if (commonProducts.length < 2) {
      return { userId: userId2, similarity: 0, sharedProducts: commonProducts.length };
    }

    // Calculate Pearson correlation
    const pairs = commonProducts.map(pid => [products1.get(pid)!, products2.get(pid)!]);
    const correlation = this.calculatePearsonCorrelation(pairs);

    return {
      userId: userId2,
      similarity: Math.max(0, correlation), // Ensure non-negative
      sharedProducts: commonProducts.length
    };
  }

  private calculatePearsonCorrelation(pairs: number[][]): number {
    const n = pairs.length;
    if (n < 2) return 0;

    const sum1 = pairs.reduce((sum, pair) => sum + pair[0], 0);
    const sum2 = pairs.reduce((sum, pair) => sum + pair[1], 0);
    const sum1Sq = pairs.reduce((sum, pair) => sum + pair[0] * pair[0], 0);
    const sum2Sq = pairs.reduce((sum, pair) => sum + pair[1] * pair[1], 0);
    const pSum = pairs.reduce((sum, pair) => sum + pair[0] * pair[1], 0);

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

    return den === 0 ? 0 : num / den;
  }

  private calculateWilsonScore(avgRating: number, ratingCount: number): number {
    // Convert 5-star rating to proportion of positive ratings
    const positiveRatio = (avgRating - 1) / 4; // Normalize to 0-1
    const n = ratingCount;
    const z = 1.96; // 95% confidence

    const left = positiveRatio + z * z / (2 * n);
    const right = z * Math.sqrt(positiveRatio * (1 - positiveRatio) / n + z * z / (4 * n * n));
    const under = 1 + z * z / n;

    return (left - right) / under;
  }

  private async updateUserSimilarities(userId: string): Promise<void> {
    // Recompute similarities for this user asynchronously
    setTimeout(() => {
      const userIds = Array.from(this.userRatings.keys());
      const similarities: UserSimilarity[] = [];

      for (const otherUserId of userIds) {
        if (userId !== otherUserId) {
          const similarity = this.calculateUserSimilarity(userId, otherUserId);
          if (similarity.similarity >= this.MIN_SIMILARITY) {
            similarities.push(similarity);
          }
        }
      }

      similarities.sort((a, b) => b.similarity - a.similarity);
      this.userSimilarities.set(userId, similarities.slice(0, 50));
    }, 0);
  }

  private async loadHistoricalData(): Promise<void> {
    // In a real implementation, this would load from database
    // For demo purposes, create some sample data
    const sampleRatings: UserRating[] = [
      { userId: 'user1', productId: 'prod1', rating: 4.5, timestamp: Date.now(), category: 'electronics' },
      { userId: 'user1', productId: 'prod2', rating: 3.8, timestamp: Date.now(), category: 'clothing' },
      { userId: 'user2', productId: 'prod1', rating: 4.2, timestamp: Date.now(), category: 'electronics' },
      { userId: 'user2', productId: 'prod3', rating: 4.7, timestamp: Date.now(), category: 'books' },
      { userId: 'user3', productId: 'prod2', rating: 3.5, timestamp: Date.now(), category: 'clothing' },
      { userId: 'user3', productId: 'prod3', rating: 4.1, timestamp: Date.now(), category: 'books' }
    ];

    for (const rating of sampleRatings) {
      await this.addRating(rating);
    }

    console.log(`Loaded ${sampleRatings.length} sample ratings`);
  }

  private async generateFallbackRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
    // Generate basic recommendations when service is not fully initialized
    const { count = 10, category } = request;
    
    const fallbackRecommendations: RecommendationResult[] = [
      {
        productId: 'samsung-galaxy-a54',
        score: 0.9,
        reason: 'Popular smartphone in Bangladesh',
        category: category || 'Electronics',
        confidence: 0.7
      },
      {
        productId: 'iphone-14-pro',
        score: 0.85,
        reason: 'High-rated premium device',
        category: category || 'Electronics',
        confidence: 0.7
      },
      {
        productId: 'oneplus-nord-ce3',
        score: 0.8,
        reason: 'Best value for money',
        category: category || 'Electronics',
        confidence: 0.7
      }
    ];

    return fallbackRecommendations.slice(0, count);
  }
}

export default CollaborativeFilteringService;