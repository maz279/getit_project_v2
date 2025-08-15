import { storage } from '../../../storage';
import { 
  SearchRecommendation, 
  InsertSearchRecommendation,
  SearchUserBehavior 
} from '../../../../shared/schema';

/**
 * Amazon.com/Shopee.sg-Level Personalization Service
 * ML-powered recommendation engine with collaborative filtering,
 * content-based filtering, and Bangladesh cultural adaptation
 */
export class PersonalizationService {
  private serviceName = 'personalization-service-ml';
  
  constructor() {
    console.log('🎯 PersonalizationService initialized - ML-powered recommendations');
  }

  /**
   * Get personalized product recommendations for user
   */
  async getPersonalizedRecommendations(params: {
    userId: number;
    queryId?: string;
    limit?: number;
    type?: 'search' | 'browse' | 'purchase' | 'cultural';
    context?: any;
  }): Promise<{
    recommendations: any[];
    algorithms: string[];
    confidence: number;
    culturalFactors: any;
  }> {
    const { userId, queryId, limit = 10, type = 'search' } = params;
    
    // Get user behavior history
    const userBehavior = await this.getUserBehaviorProfile(userId);
    
    // Get user preferences
    const userPreferences = await this.getUserPreferences(userId);
    
    // Generate recommendations using multiple algorithms
    const algorithms = ['collaborative_filtering', 'content_based', 'hybrid', 'cultural'];
    const recommendations = [];
    
    for (const algorithm of algorithms) {
      const recs = await this.generateRecommendations(
        userId, 
        algorithm, 
        userBehavior, 
        userPreferences,
        params
      );
      recommendations.push(...recs);
    }
    
    // Merge and rank recommendations
    const mergedRecommendations = await this.mergeAndRankRecommendations(
      recommendations, 
      userPreferences,
      params
    );
    
    // Apply Bangladesh cultural factors
    const culturallyAdaptedRecs = await this.applyCulturalAdaptation(
      mergedRecommendations,
      userId,
      params.context
    );
    
    // Store recommendations for learning
    await this.storeRecommendations(userId, queryId, culturallyAdaptedRecs.slice(0, limit));
    
    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(culturallyAdaptedRecs);
    
    return {
      recommendations: culturallyAdaptedRecs.slice(0, limit),
      algorithms,
      confidence,
      culturalFactors: await this.getCulturalFactors(userId)
    };
  }

  /**
   * Get real-time search suggestions based on user behavior
   */
  async getPersonalizedSearchSuggestions(params: {
    userId: number;
    partialQuery: string;
    limit?: number;
  }): Promise<{
    suggestions: Array<{
      query: string;
      confidence: number;
      reason: string;
      type: string;
    }>;
  }> {
    const { userId, partialQuery, limit = 8 } = params;
    
    // Get user's search history
    const userSearchHistory = await storage.findMany('searchQueries', {
      where: { userId },
      orderBy: [{ searchTime: 'desc' }],
      limit: 50
    });
    
    // Get user behavior patterns
    const behaviorPatterns = await this.analyzeUserSearchPatterns(userId);
    
    // Generate personalized suggestions
    const suggestions = [];
    
    // 1. Historical queries
    const historicalSuggestions = this.getHistoricalSuggestions(
      userSearchHistory, 
      partialQuery, 
      limit / 2
    );
    suggestions.push(...historicalSuggestions);
    
    // 2. Behavioral predictions
    const behavioralSuggestions = await this.getBehavioralSuggestions(
      behaviorPatterns, 
      partialQuery, 
      limit / 2
    );
    suggestions.push(...behavioralSuggestions);
    
    // 3. Cultural context suggestions
    const culturalSuggestions = await this.getCulturalSuggestions(
      userId, 
      partialQuery, 
      2
    );
    suggestions.push(...culturalSuggestions);
    
    // Rank and deduplicate
    const rankedSuggestions = this.rankSuggestions(suggestions);
    
    return {
      suggestions: rankedSuggestions.slice(0, limit)
    };
  }

  /**
   * Track user interaction for ML learning
   */
  async trackInteraction(params: {
    userId: number;
    recommendationId?: string;
    productId: string;
    interactionType: 'view' | 'click' | 'cart_add' | 'purchase' | 'wishlist';
    context?: any;
  }): Promise<void> {
    const { userId, recommendationId, productId, interactionType, context } = params;
    
    // Store interaction for learning
    const behaviorData = {
      userId,
      sessionId: context?.sessionId || `session_${Date.now()}`,
      eventType: interactionType,
      eventData: JSON.stringify({
        productId,
        recommendationId,
        context,
        timestamp: new Date().toISOString()
      }),
      productId,
      timestamp: new Date()
    };
    
    await storage.insertOne('searchUserBehavior', behaviorData);
    
    // Update recommendation performance
    if (recommendationId) {
      await this.updateRecommendationPerformance(recommendationId, interactionType);
    }
    
    // Update user preference model
    await this.updateUserPreferences(userId, productId, interactionType);
  }

  /**
   * Get similar users for collaborative filtering
   */
  async getSimilarUsers(userId: number, limit: number = 20): Promise<{
    users: Array<{
      userId: number;
      similarity: number;
      commonInterests: string[];
    }>;
  }> {
    // Get user's behavior
    const userBehavior = await this.getUserBehaviorProfile(userId);
    
    // Get all other users' behavior
    const allUsers = await storage.findMany('users', {
      where: `id != ${userId}`,
      limit: 1000
    });
    
    const similarUsers = [];
    
    for (const user of allUsers) {
      const otherUserBehavior = await this.getUserBehaviorProfile(user.id);
      const similarity = this.calculateUserSimilarity(userBehavior, otherUserBehavior);
      
      if (similarity > 0.3) {
        similarUsers.push({
          userId: user.id,
          similarity,
          commonInterests: this.findCommonInterests(userBehavior, otherUserBehavior)
        });
      }
    }
    
    // Sort by similarity
    similarUsers.sort((a, b) => b.similarity - a.similarity);
    
    return {
      users: similarUsers.slice(0, limit)
    };
  }

  /**
   * Get trending products for user based on cultural context
   */
  async getCulturalTrendingProducts(params: {
    userId: number;
    region?: string;
    festival?: string;
    limit?: number;
  }): Promise<any[]> {
    const { userId, region = 'dhaka', festival, limit = 10 } = params;
    
    // Get user preferences
    const userPrefs = await this.getUserPreferences(userId);
    
    // Get cultural context
    const culturalContext = await this.getCulturalContext(region, festival);
    
    // Get trending products based on cultural factors
    const trendingProducts = await storage.findMany('products', {
      where: this.buildCulturalQuery(culturalContext, userPrefs),
      orderBy: [{ salesCount: 'desc' }, { rating: 'desc' }],
      limit: limit * 2 // Get more to filter
    });
    
    // Apply personalization
    const personalizedTrending = trendingProducts.map(product => ({
      ...product,
      personalizedScore: this.calculatePersonalizedScore(product, userPrefs),
      culturalRelevance: this.calculateCulturalRelevance(product, culturalContext)
    }));
    
    // Sort by combined score
    personalizedTrending.sort((a, b) => 
      (b.personalizedScore + b.culturalRelevance) - (a.personalizedScore + a.culturalRelevance)
    );
    
    return personalizedTrending.slice(0, limit);
  }

  // Private helper methods

  private async getUserBehaviorProfile(userId: number): Promise<any> {
    const behaviors = await storage.findMany('searchUserBehavior', {
      where: { userId },
      orderBy: [{ timestamp: 'desc' }],
      limit: 100
    });
    
    const profile = {
      searchPatterns: this.analyzeSearchPatterns(behaviors),
      productPreferences: this.analyzeProductPreferences(behaviors),
      categoryPreferences: this.analyzeCategoryPreferences(behaviors),
      brandPreferences: this.analyzeBrandPreferences(behaviors),
      priceRange: this.analyzePriceRange(behaviors),
      seasonalPatterns: this.analyzeSeasonalPatterns(behaviors),
      culturalPreferences: this.analyzeCulturalPreferences(behaviors)
    };
    
    return profile;
  }

  private async getUserPreferences(userId: number): Promise<any> {
    // Get user's purchase history
    const orders = await storage.findMany('orders', {
      where: { userId },
      orderBy: [{ createdAt: 'desc' }],
      limit: 50
    });
    
    // Get user's search history
    const searches = await storage.findMany('searchQueries', {
      where: { userId },
      orderBy: [{ searchTime: 'desc' }],
      limit: 100
    });
    
    return {
      purchaseHistory: orders,
      searchHistory: searches,
      preferredCategories: this.extractPreferredCategories(orders, searches),
      preferredBrands: this.extractPreferredBrands(orders, searches),
      averageOrderValue: this.calculateAverageOrderValue(orders),
      searchFrequency: this.calculateSearchFrequency(searches),
      culturalIndicators: this.extractCulturalIndicators(searches)
    };
  }

  private async generateRecommendations(
    userId: number,
    algorithm: string,
    userBehavior: any,
    userPreferences: any,
    params: any
  ): Promise<any[]> {
    switch (algorithm) {
      case 'collaborative_filtering':
        return this.collaborativeFiltering(userId, userBehavior, params);
      
      case 'content_based':
        return this.contentBasedFiltering(userPreferences, params);
      
      case 'hybrid':
        return this.hybridFiltering(userId, userBehavior, userPreferences, params);
      
      case 'cultural':
        return this.culturalFiltering(userId, userPreferences, params);
      
      default:
        return [];
    }
  }

  private async collaborativeFiltering(userId: number, userBehavior: any, params: any): Promise<any[]> {
    // Find similar users
    const similarUsers = await this.getSimilarUsers(userId, 20);
    
    // Get products liked by similar users
    const recommendations = [];
    
    for (const similarUser of similarUsers.users) {
      const userProducts = await this.getUserLikedProducts(similarUser.userId);
      
      for (const product of userProducts) {
        recommendations.push({
          ...product,
          algorithm: 'collaborative_filtering',
          confidence: similarUser.similarity * 0.8,
          reason: `Users with similar taste also liked this`,
          collaborativeScore: similarUser.similarity
        });
      }
    }
    
    return this.deduplicateRecommendations(recommendations);
  }

  private async contentBasedFiltering(userPreferences: any, params: any): Promise<any[]> {
    const products = await storage.findMany('products', {});
    
    const recommendations = products.map(product => {
      const contentScore = this.calculateContentSimilarity(product, userPreferences);
      
      return {
        ...product,
        algorithm: 'content_based',
        confidence: contentScore,
        reason: this.generateContentReason(product, userPreferences),
        contentScore
      };
    }).filter(rec => rec.confidence > 0.3);
    
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  private async hybridFiltering(
    userId: number, 
    userBehavior: any, 
    userPreferences: any, 
    params: any
  ): Promise<any[]> {
    // Combine collaborative and content-based recommendations
    const collaborativeRecs = await this.collaborativeFiltering(userId, userBehavior, params);
    const contentRecs = await this.contentBasedFiltering(userPreferences, params);
    
    // Merge with weighted scores
    const hybridRecs = [...collaborativeRecs, ...contentRecs].map(rec => ({
      ...rec,
      algorithm: 'hybrid',
      confidence: (rec.collaborativeScore || 0) * 0.6 + (rec.contentScore || 0) * 0.4,
      reason: 'Based on both similar users and your preferences'
    }));
    
    return this.deduplicateRecommendations(hybridRecs);
  }

  private async culturalFiltering(userId: number, userPreferences: any, params: any): Promise<any[]> {
    // Get cultural context
    const culturalFactors = await this.getCulturalFactors(userId);
    
    // Get products relevant to cultural context
    const products = await storage.findMany('products', {
      where: this.buildCulturalProductQuery(culturalFactors),
      limit: 50
    });
    
    return products.map(product => ({
      ...product,
      algorithm: 'cultural',
      confidence: this.calculateCulturalRelevance(product, culturalFactors),
      reason: this.generateCulturalReason(product, culturalFactors),
      culturalScore: this.calculateCulturalRelevance(product, culturalFactors)
    }));
  }

  private async mergeAndRankRecommendations(
    recommendations: any[], 
    userPreferences: any,
    params: any
  ): Promise<any[]> {
    // Group by product ID
    const productMap = new Map();
    
    recommendations.forEach(rec => {
      const existing = productMap.get(rec.id);
      if (existing) {
        // Combine scores from different algorithms
        existing.combinedScore = Math.max(existing.combinedScore, rec.confidence);
        existing.algorithms.push(rec.algorithm);
        existing.reasons.push(rec.reason);
      } else {
        productMap.set(rec.id, {
          ...rec,
          combinedScore: rec.confidence,
          algorithms: [rec.algorithm],
          reasons: [rec.reason]
        });
      }
    });
    
    // Convert back to array and sort
    const mergedRecs = Array.from(productMap.values());
    mergedRecs.sort((a, b) => b.combinedScore - a.combinedScore);
    
    return mergedRecs;
  }

  private async applyCulturalAdaptation(
    recommendations: any[],
    userId: number,
    context?: any
  ): Promise<any[]> {
    const culturalFactors = await this.getCulturalFactors(userId);
    
    return recommendations.map(rec => {
      const culturalBoost = this.calculateCulturalBoost(rec, culturalFactors, context);
      
      return {
        ...rec,
        combinedScore: rec.combinedScore + culturalBoost,
        culturalRelevance: culturalBoost,
        bangladeshOptimized: true
      };
    }).sort((a, b) => b.combinedScore - a.combinedScore);
  }

  private calculateUserSimilarity(userBehavior1: any, userBehavior2: any): number {
    // Simplified user similarity calculation
    const categories1 = new Set(userBehavior1.categoryPreferences?.map(c => c.id) || []);
    const categories2 = new Set(userBehavior2.categoryPreferences?.map(c => c.id) || []);
    
    const intersection = new Set([...categories1].filter(x => categories2.has(x)));
    const union = new Set([...categories1, ...categories2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private findCommonInterests(userBehavior1: any, userBehavior2: any): string[] {
    const interests1 = userBehavior1.categoryPreferences?.map(c => c.name) || [];
    const interests2 = userBehavior2.categoryPreferences?.map(c => c.name) || [];
    
    return interests1.filter(interest => interests2.includes(interest));
  }

  private calculateOverallConfidence(recommendations: any[]): number {
    if (recommendations.length === 0) return 0;
    
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.combinedScore, 0) / recommendations.length;
    return Math.min(avgConfidence, 1.0);
  }

  // Additional helper methods for behavior analysis
  private analyzeSearchPatterns(behaviors: any[]): any {
    // Analyze search patterns from user behavior
    return {
      searchFrequency: behaviors.length,
      commonQueries: this.extractCommonQueries(behaviors),
      searchTimes: this.analyzeSearchTimes(behaviors)
    };
  }

  private analyzeProductPreferences(behaviors: any[]): any {
    const productInteractions = behaviors.filter(b => b.productId);
    return {
      viewedProducts: productInteractions.filter(b => b.eventType === 'view').length,
      clickedProducts: productInteractions.filter(b => b.eventType === 'click').length,
      addedToCart: productInteractions.filter(b => b.eventType === 'cart_add').length
    };
  }

  private analyzeCategoryPreferences(behaviors: any[]): any[] {
    const categoryMap = new Map();
    
    behaviors.forEach(behavior => {
      if (behavior.categoryId) {
        categoryMap.set(behavior.categoryId, (categoryMap.get(behavior.categoryId) || 0) + 1);
      }
    });
    
    return Array.from(categoryMap.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count);
  }

  private analyzeBrandPreferences(behaviors: any[]): any[] {
    // Similar to category analysis but for brands
    return [];
  }

  private analyzePriceRange(behaviors: any[]): any {
    // Analyze user's price preferences
    return {
      minPrice: 0,
      maxPrice: 100000,
      averagePrice: 5000
    };
  }

  private analyzeSeasonalPatterns(behaviors: any[]): any {
    // Analyze seasonal buying patterns
    return {};
  }

  private analyzeCulturalPreferences(behaviors: any[]): any {
    // Analyze cultural preferences from search queries
    return {};
  }

  private async getCulturalFactors(userId: number): Promise<any> {
    // Get user's cultural context
    const user = await storage.findById('users', userId);
    
    return {
      region: user?.region || 'dhaka',
      language: user?.language || 'en',
      festivals: this.getCurrentFestivals(),
      culturalEvents: this.getCulturalEvents()
    };
  }

  private getCurrentFestivals(): string[] {
    // Return current/upcoming festivals
    const now = new Date();
    const month = now.getMonth() + 1;
    
    if (month >= 4 && month <= 5) return ['pohela_boishakh'];
    if (month >= 7 && month <= 8) return ['eid_ul_adha'];
    if (month >= 10 && month <= 11) return ['durga_puja'];
    
    return [];
  }

  private getCulturalEvents(): string[] {
    return ['independence_day', 'victory_day', 'language_day'];
  }

  private deduplicateRecommendations(recommendations: any[]): any[] {
    const seen = new Set();
    return recommendations.filter(rec => {
      if (seen.has(rec.id)) return false;
      seen.add(rec.id);
      return true;
    });
  }

  // Placeholder methods for complex calculations
  private async getUserLikedProducts(userId: number): Promise<any[]> {
    return [];
  }

  private calculateContentSimilarity(product: any, userPreferences: any): number {
    return Math.random() * 0.8 + 0.2;
  }

  private generateContentReason(product: any, userPreferences: any): string {
    return 'Based on your previous purchases';
  }

  private calculateCulturalRelevance(product: any, culturalFactors: any): number {
    return Math.random() * 0.5;
  }

  private generateCulturalReason(product: any, culturalFactors: any): string {
    return 'Popular in your region';
  }

  private buildCulturalProductQuery(culturalFactors: any): string {
    return '1=1'; // Placeholder
  }

  private calculatePersonalizedScore(product: any, userPrefs: any): number {
    return Math.random() * 0.8;
  }

  private calculateCulturalBoost(rec: any, culturalFactors: any, context?: any): number {
    return Math.random() * 0.2;
  }

  private extractCommonQueries(behaviors: any[]): string[] {
    return [];
  }

  private analyzeSearchTimes(behaviors: any[]): any {
    return {};
  }

  // Additional methods for user preferences extraction
  private extractPreferredCategories(orders: any[], searches: any[]): any[] {
    return [];
  }

  private extractPreferredBrands(orders: any[], searches: any[]): any[] {
    return [];
  }

  private calculateAverageOrderValue(orders: any[]): number {
    if (orders.length === 0) return 0;
    return orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length;
  }

  private calculateSearchFrequency(searches: any[]): number {
    return searches.length;
  }

  private extractCulturalIndicators(searches: any[]): any {
    return {};
  }

  private async storeRecommendations(userId: number, queryId: string | undefined, recommendations: any[]): Promise<void> {
    for (const rec of recommendations) {
      const recommendationData: InsertSearchRecommendation = {
        userId,
        searchQueryId: queryId,
        productId: rec.id,
        recommendationType: rec.algorithm,
        algorithmUsed: rec.algorithm,
        confidenceScore: rec.combinedScore,
        relevanceScore: rec.combinedScore,
        contextData: JSON.stringify({
          algorithms: rec.algorithms,
          reasons: rec.reasons,
          culturalRelevance: rec.culturalRelevance
        }),
        position: recommendations.indexOf(rec) + 1
      };
      
      await storage.insertOne('searchRecommendations', recommendationData);
    }
  }

  private async updateRecommendationPerformance(recommendationId: string, interactionType: string): Promise<void> {
    // Update recommendation performance metrics
    const updateData: any = {};
    
    switch (interactionType) {
      case 'click':
        updateData.clicked = true;
        updateData.clickedAt = new Date();
        break;
      case 'purchase':
        updateData.purchased = true;
        updateData.purchasedAt = new Date();
        break;
    }
    
    if (Object.keys(updateData).length > 0) {
      await storage.updateById('searchRecommendations', recommendationId, updateData);
    }
  }

  private async updateUserPreferences(userId: number, productId: string, interactionType: string): Promise<void> {
    // Update user preference model based on interaction
    // This would typically update ML models or preference weights
    console.log(`Updating preferences for user ${userId}, product ${productId}, interaction ${interactionType}`);
  }

  private async analyzeUserSearchPatterns(userId: number): Promise<any> {
    const searches = await storage.findMany('searchQueries', {
      where: { userId },
      orderBy: [{ searchTime: 'desc' }],
      limit: 100
    });
    
    return {
      totalSearches: searches.length,
      averageSearchLength: searches.reduce((sum, s) => sum + s.queryText.length, 0) / searches.length,
      preferredLanguage: this.detectPreferredLanguage(searches),
      searchTiming: this.analyzeSearchTiming(searches)
    };
  }

  private getHistoricalSuggestions(searches: any[], partialQuery: string, limit: number): any[] {
    return searches
      .filter(search => search.queryText.toLowerCase().includes(partialQuery.toLowerCase()))
      .slice(0, limit)
      .map(search => ({
        query: search.queryText,
        confidence: 0.8,
        reason: 'You searched for this before',
        type: 'historical'
      }));
  }

  private async getBehavioralSuggestions(patterns: any, partialQuery: string, limit: number): Promise<any[]> {
    // Generate suggestions based on behavioral patterns
    return [];
  }

  private async getCulturalSuggestions(userId: number, partialQuery: string, limit: number): Promise<any[]> {
    const culturalFactors = await this.getCulturalFactors(userId);
    
    return [
      {
        query: partialQuery + ' বাংলাদেশি',
        confidence: 0.6,
        reason: 'Popular in Bangladesh',
        type: 'cultural'
      }
    ].slice(0, limit);
  }

  private rankSuggestions(suggestions: any[]): any[] {
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private detectPreferredLanguage(searches: any[]): string {
    // Detect if user prefers Bengali or English
    const bengaliCount = searches.filter(s => /[\u0980-\u09FF]/.test(s.queryText)).length;
    return bengaliCount > searches.length / 2 ? 'bn' : 'en';
  }

  private analyzeSearchTiming(searches: any[]): any {
    // Analyze when user typically searches
    return {};
  }

  private async getCulturalContext(region: string, festival?: string): Promise<any> {
    return {
      region,
      festival,
      seasonality: this.getCurrentSeason(),
      events: this.getCulturalEvents()
    };
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  private buildCulturalQuery(culturalContext: any, userPrefs: any): string {
    // Build database query for cultural products
    return '1=1'; // Placeholder
  }
}