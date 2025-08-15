/**
 * PersonalizationEngineService - Amazon.com/Shopee.sg-Level ML-Powered Personalization
 * Real-time user behavior analysis and preference-based result optimization
 */

import { Injectable } from '@nestjs/common';
import { SearchResult, UserContext, PersonalizedResult, UserInteraction } from '../models/SearchModels';

export interface PersonalizationModel {
  predict(features: {
    userFeatures: any;
    realtimeFeatures: any;
    contextFeatures: any;
    itemFeatures: any[];
  }): Promise<number[]>;
}

export interface UserBehaviorAnalyzer {
  analyzeClickPatterns(userId: string): Promise<any>;
  analyzePurchaseHistory(userId: string): Promise<any>;
  analyzeSearchHistory(userId: string): Promise<any>;
  getRealtimeSignals(userId: string): Promise<any>;
}

@Injectable()
export class PersonalizationEngineService {
  private mlModel: PersonalizationModel;
  private behaviorAnalyzer: UserBehaviorAnalyzer;
  private userProfileCache: Map<string, any> = new Map();
  private realtimeSignalsCache: Map<string, any> = new Map();
  
  constructor() {
    this.initializeMLModel();
    this.initializeBehaviorAnalyzer();
  }
  
  private async initializeMLModel(): Promise<void> {
    // Initialize machine learning model for personalization
    this.mlModel = {
      async predict(features) {
        // Mock implementation - would use actual ML model (TensorFlow/PyTorch)
        const userPrefs = features.userFeatures;
        const items = features.itemFeatures;
        
        // Generate personalized scores based on user preferences
        return items.map((item: any, index: number) => {
          let score = 0.5; // base score
          
          // Category preference boost
          if (userPrefs.favoriteCategories?.includes(item.category)) {
            score += 0.3;
          }
          
          // Brand preference boost
          if (userPrefs.favoriteBrands?.includes(item.brand)) {
            score += 0.2;
          }
          
          // Price range preference
          if (item.price >= userPrefs.minPrice && item.price <= userPrefs.maxPrice) {
            score += 0.1;
          }
          
          // Time-based preferences
          if (features.contextFeatures.timeOfDay === userPrefs.preferredShoppingTime) {
            score += 0.1;
          }
          
          // Realtime signals boost
          if (features.realtimeFeatures.recentViewedCategories?.includes(item.category)) {
            score += 0.15;
          }
          
          return Math.min(score, 1.0);
        });
      }
    };
  }
  
  private async initializeBehaviorAnalyzer(): Promise<void> {
    this.behaviorAnalyzer = {
      async analyzeClickPatterns(userId: string) {
        // Mock implementation - would analyze actual click data
        return {
          mostClickedCategories: ['Electronics', 'Fashion', 'Books'],
          clickTimes: ['morning', 'evening'],
          averageSessionDuration: 15, // minutes
          bounceRate: 0.3,
          conversionRate: 0.12
        };
      },
      
      async analyzePurchaseHistory(userId: string) {
        return {
          totalPurchases: 25,
          averageOrderValue: 2500, // BDT
          favoriteCategories: ['Electronics', 'Fashion'],
          favoriteBrands: ['Samsung', 'Xiaomi', 'Uniqlo'],
          priceRange: { min: 500, max: 5000 },
          seasonalPatterns: {
            eid: 'high_spending',
            winter: 'fashion_focus',
            summer: 'electronics_focus'
          }
        };
      },
      
      async analyzeSearchHistory(userId: string) {
        return {
          totalSearches: 150,
          popularQueries: ['wireless headphones', 'smartphones', 'books'],
          searchLanguages: ['en', 'bn'],
          searchTimes: ['9-11am', '7-9pm'],
          refinementPatterns: ['price_filter', 'brand_filter'],
          zeroResultQueries: ['specific model searches'],
          intentPatterns: {
            informational: 0.4,
            transactional: 0.6
          }
        };
      },
      
      async getRealtimeSignals(userId: string) {
        return {
          currentSessionDuration: 8, // minutes
          pagesViewedInSession: 12,
          recentViewedCategories: ['Electronics', 'Accessories'],
          recentViewedProducts: [101, 205, 308],
          cartItems: [
            { productId: 101, addedAt: new Date() }
          ],
          wishlistItems: [205, 308],
          currentDevice: 'mobile',
          currentLocation: 'Dhaka',
          timeOfDay: 'evening'
        };
      }
    };
  }
  
  /**
   * Personalize Search Results - Amazon.com-level personalization
   */
  async personalizeResults(
    results: SearchResult[],
    userId: string,
    context: UserContext
  ): Promise<PersonalizedResult[]> {
    try {
      if (!userId || results.length === 0) {
        return this.addDefaultPersonalization(results);
      }
      
      // Get user profile and realtime signals
      const userProfile = await this.getUserProfile(userId);
      const realtimeSignals = await this.getRealtimeSignals(userId);
      
      // Prepare features for ML model
      const features = {
        userFeatures: userProfile,
        realtimeFeatures: realtimeSignals,
        contextFeatures: context,
        itemFeatures: results.map(r => this.extractItemFeatures(r))
      };
      
      // Get personalized scores from ML model
      const personalizedScores = await this.mlModel.predict(features);
      
      // Apply personalization and rerank results
      const personalizedResults = this.applyPersonalization(
        results,
        personalizedScores,
        userProfile,
        realtimeSignals,
        context
      );
      
      // Track personalization performance
      await this.trackPersonalizationMetrics(userId, personalizedResults);
      
      return personalizedResults;
      
    } catch (error) {
      console.error('Error personalizing results:', error);
      return this.addDefaultPersonalization(results);
    }
  }
  
  /**
   * Update User Behavior - Real-time learning
   */
  async updateUserBehavior(
    userId: string,
    interaction: UserInteraction
  ): Promise<void> {
    try {
      // Update realtime signals cache
      const currentSignals = this.realtimeSignalsCache.get(userId) || {};
      const updatedSignals = this.updateRealtimeSignals(currentSignals, interaction);
      this.realtimeSignalsCache.set(userId, updatedSignals);
      
      // Store interaction in database for long-term learning
      await this.storeUserInteraction(userId, interaction);
      
      // Trigger incremental model update
      if (this.shouldTriggerModelUpdate(interaction)) {
        await this.triggerIncrementalModelUpdate(userId, interaction);
      }
      
    } catch (error) {
      console.error('Error updating user behavior:', error);
    }
  }
  
  /**
   * Generate Personalized Recommendations
   */
  async generatePersonalizedRecommendations(
    userId: string,
    context: UserContext,
    count: number = 10
  ): Promise<PersonalizedResult[]> {
    try {
      const userProfile = await this.getUserProfile(userId);
      const realtimeSignals = await this.getRealtimeSignals(userId);
      
      // Get candidate products based on user preferences
      const candidates = await this.getCandidateProducts(userProfile, realtimeSignals);
      
      // Apply ML scoring
      const features = {
        userFeatures: userProfile,
        realtimeFeatures: realtimeSignals,
        contextFeatures: context,
        itemFeatures: candidates.map(c => this.extractItemFeatures(c))
      };
      
      const scores = await this.mlModel.predict(features);
      
      // Create personalized recommendations
      const recommendations = candidates
        .map((product, index) => ({
          ...product,
          personalizedScore: scores[index],
          recommendationReason: this.generateRecommendationReason(
            product,
            userProfile,
            realtimeSignals
          ),
          confidence: this.calculateRecommendationConfidence(scores[index])
        }))
        .sort((a, b) => b.personalizedScore - a.personalizedScore)
        .slice(0, count);
      
      return recommendations;
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }
  
  /**
   * Bangladesh-Specific Personalization
   */
  async applyBangladeshPersonalization(
    results: PersonalizedResult[],
    userId: string,
    context: UserContext
  ): Promise<PersonalizedResult[]> {
    try {
      const culturalProfile = await this.getBangladeshCulturalProfile(userId);
      const festivalContext = await this.getCurrentFestivalContext();
      const prayerTimeContext = await this.getPrayerTimeContext();
      
      return results.map(result => {
        let culturalBoost = 0;
        
        // Festival season personalization
        if (festivalContext.isActive) {
          if (this.isRelevantForFestival(result, festivalContext.festival)) {
            culturalBoost += 0.2;
            result.festivalRelevance = festivalContext.festival;
          }
        }
        
        // Prayer time considerations
        if (prayerTimeContext.nearPrayerTime) {
          if (this.isHalalProduct(result)) {
            culturalBoost += 0.1;
          }
        }
        
        // Language preference boost
        if (culturalProfile.preferredLanguage === 'bn' && result.hasBengaliSupport) {
          culturalBoost += 0.05;
        }
        
        // Local brand preference
        if (culturalProfile.preferLocalBrands && this.isBangladeshBrand(result)) {
          culturalBoost += 0.15;
        }
        
        return {
          ...result,
          personalizedScore: result.personalizedScore * (1 + culturalBoost),
          culturalRelevance: culturalBoost,
          bangladeshOptimized: true
        };
      });
      
    } catch (error) {
      console.error('Error applying Bangladesh personalization:', error);
      return results;
    }
  }
  
  /**
   * A/B Testing for Personalization
   */
  async applyPersonalizationExperiment(
    results: PersonalizedResult[],
    userId: string,
    experimentId: string
  ): Promise<PersonalizedResult[]> {
    try {
      const userSegment = await this.getUserExperimentSegment(userId, experimentId);
      
      switch (userSegment) {
        case 'control':
          return results; // No personalization
          
        case 'ml_personalization':
          return this.applyMLPersonalization(results, userId);
          
        case 'cultural_personalization':
          return this.applyCulturalPersonalization(results, userId);
          
        case 'hybrid_personalization':
          const mlResults = await this.applyMLPersonalization(results, userId);
          return this.applyCulturalPersonalization(mlResults, userId);
          
        default:
          return results;
      }
      
    } catch (error) {
      console.error('Error applying personalization experiment:', error);
      return results;
    }
  }
  
  // ===== PRIVATE HELPER METHODS =====
  
  private async getUserProfile(userId: string): Promise<any> {
    // Check cache first
    if (this.userProfileCache.has(userId)) {
      return this.userProfileCache.get(userId);
    }
    
    // Analyze user behavior to build profile
    const clickPatterns = await this.behaviorAnalyzer.analyzeClickPatterns(userId);
    const purchaseHistory = await this.behaviorAnalyzer.analyzePurchaseHistory(userId);
    const searchHistory = await this.behaviorAnalyzer.analyzeSearchHistory(userId);
    
    const profile = {
      userId,
      favoriteCategories: purchaseHistory.favoriteCategories,
      favoriteBrands: purchaseHistory.favoriteBrands,
      priceRange: purchaseHistory.priceRange,
      preferredShoppingTime: clickPatterns.clickTimes[0],
      avgSessionDuration: clickPatterns.averageSessionDuration,
      conversionRate: clickPatterns.conversionRate,
      searchLanguages: searchHistory.searchLanguages,
      intentPatterns: searchHistory.intentPatterns,
      lastUpdated: new Date()
    };
    
    // Cache profile
    this.userProfileCache.set(userId, profile);
    
    return profile;
  }
  
  private async getRealtimeSignals(userId: string): Promise<any> {
    // Check cache first
    if (this.realtimeSignalsCache.has(userId)) {
      return this.realtimeSignalsCache.get(userId);
    }
    
    const signals = await this.behaviorAnalyzer.getRealtimeSignals(userId);
    this.realtimeSignalsCache.set(userId, signals);
    
    return signals;
  }
  
  private extractItemFeatures(item: any): any {
    return {
      id: item.id || item.productId,
      category: item.category,
      brand: item.brand,
      price: item.price,
      rating: item.rating,
      popularity: item.popularity || 0.5,
      availability: item.inStock ? 1 : 0,
      imageCount: item.images?.length || 0,
      descriptionLength: item.description?.length || 0,
      hasDiscount: item.discount > 0 ? 1 : 0
    };
  }
  
  private applyPersonalization(
    results: SearchResult[],
    scores: number[],
    userProfile: any,
    realtimeSignals: any,
    context: UserContext
  ): PersonalizedResult[] {
    return results
      .map((result, index) => ({
        ...result,
        personalizedScore: scores[index],
        originalScore: result.score,
        personalizationBoost: scores[index] - (result.score || 0.5),
        personalizationReason: this.generatePersonalizationReason(
          result,
          userProfile,
          realtimeSignals
        ),
        userRelevance: this.calculateUserRelevance(result, userProfile),
        contextRelevance: this.calculateContextRelevance(result, context),
        confidence: this.calculatePersonalizationConfidence(scores[index])
      }))
      .sort((a, b) => b.personalizedScore - a.personalizedScore);
  }
  
  private addDefaultPersonalization(results: SearchResult[]): PersonalizedResult[] {
    return results.map(result => ({
      ...result,
      personalizedScore: result.score || 0.5,
      originalScore: result.score || 0.5,
      personalizationBoost: 0,
      personalizationReason: 'Default ranking',
      userRelevance: 0.5,
      contextRelevance: 0.5,
      confidence: 0.5
    }));
  }
  
  private updateRealtimeSignals(currentSignals: any, interaction: UserInteraction): any {
    const updated = { ...currentSignals };
    
    switch (interaction.type) {
      case 'view':
        updated.recentViewedProducts = [
          interaction.productId,
          ...(updated.recentViewedProducts || []).slice(0, 9)
        ];
        break;
        
      case 'click':
        updated.clickCount = (updated.clickCount || 0) + 1;
        break;
        
      case 'add_to_cart':
        updated.cartItems = [
          ...(updated.cartItems || []),
          { productId: interaction.productId, addedAt: new Date() }
        ];
        break;
        
      case 'purchase':
        updated.lastPurchase = {
          productId: interaction.productId,
          timestamp: new Date(),
          amount: interaction.amount
        };
        break;
    }
    
    updated.lastActivity = new Date();
    return updated;
  }
  
  private async storeUserInteraction(userId: string, interaction: UserInteraction): Promise<void> {
    // Store in database for long-term learning
    console.log(`Storing interaction for user ${userId}:`, interaction);
  }
  
  private shouldTriggerModelUpdate(interaction: UserInteraction): boolean {
    // Trigger model update for high-value interactions
    return ['purchase', 'add_to_cart'].includes(interaction.type);
  }
  
  private async triggerIncrementalModelUpdate(
    userId: string,
    interaction: UserInteraction
  ): Promise<void> {
    // Trigger incremental model update
    console.log(`Triggering model update for user ${userId}:`, interaction);
  }
  
  private async trackPersonalizationMetrics(
    userId: string,
    results: PersonalizedResult[]
  ): Promise<void> {
    const metrics = {
      userId,
      timestamp: new Date(),
      totalResults: results.length,
      avgPersonalizationBoost: results.reduce((sum, r) => sum + r.personalizationBoost, 0) / results.length,
      avgConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
      topPersonalizedCategories: this.getTopCategories(results, 3)
    };
    
    console.log('Personalization metrics:', metrics);
  }
  
  private async getCandidateProducts(userProfile: any, realtimeSignals: any): Promise<any[]> {
    // Mock implementation - would fetch from product catalog
    return [
      {
        id: 1,
        title: 'Wireless Headphones',
        category: 'Electronics',
        brand: 'Sony',
        price: 3500,
        rating: 4.5,
        inStock: true
      },
      {
        id: 2,
        title: 'Cotton T-Shirt',
        category: 'Fashion',
        brand: 'Uniqlo',
        price: 1200,
        rating: 4.2,
        inStock: true
      }
    ];
  }
  
  private generateRecommendationReason(
    product: any,
    userProfile: any,
    realtimeSignals: any
  ): string {
    const reasons: string[] = [];
    
    if (userProfile.favoriteCategories?.includes(product.category)) {
      reasons.push(`Popular in ${product.category}`);
    }
    
    if (userProfile.favoriteBrands?.includes(product.brand)) {
      reasons.push(`Your favorite brand: ${product.brand}`);
    }
    
    if (realtimeSignals.recentViewedCategories?.includes(product.category)) {
      reasons.push('Based on recent browsing');
    }
    
    return reasons.join(', ') || 'Recommended for you';
  }
  
  private calculateRecommendationConfidence(score: number): number {
    if (score > 0.8) return 0.95;
    if (score > 0.7) return 0.85;
    if (score > 0.6) return 0.75;
    return 0.65;
  }
  
  private async getBangladeshCulturalProfile(userId: string): Promise<any> {
    // Mock implementation
    return {
      preferredLanguage: 'bn',
      preferLocalBrands: true,
      festivalShoppingPattern: 'high_during_eid',
      prayerTimeAware: true,
      mobilePaymentPreference: 'bkash'
    };
  }
  
  private async getCurrentFestivalContext(): Promise<any> {
    const now = new Date();
    const month = now.getMonth() + 1;
    
    // Check for major Bangladesh festivals
    if (month === 4 || month === 5) { // Eid season
      return {
        isActive: true,
        festival: 'eid',
        daysUntil: 10,
        shoppingIntensity: 'high'
      };
    }
    
    return { isActive: false };
  }
  
  private async getPrayerTimeContext(): Promise<any> {
    // Mock implementation
    return {
      nearPrayerTime: false,
      nextPrayer: 'Maghrib',
      timeToNext: 45 // minutes
    };
  }
  
  private isRelevantForFestival(result: any, festival: string): boolean {
    const festivalCategories = {
      eid: ['Fashion', 'Jewelry', 'Food', 'Gifts'],
      durga_puja: ['Fashion', 'Jewelry', 'Decorations'],
      pohela_boishakh: ['Fashion', 'Traditional', 'Food']
    };
    
    return festivalCategories[festival]?.includes(result.category) || false;
  }
  
  private isHalalProduct(result: any): boolean {
    // Check if product is halal (for Islamic considerations)
    const halalCategories = ['Food', 'Cosmetics', 'Medicine'];
    return halalCategories.includes(result.category) && 
           !result.title?.toLowerCase().includes('alcohol');
  }
  
  private isBangladeshBrand(result: any): boolean {
    const bangladeshBrands = ['Walton', 'Square', 'ACI', 'Beximco', 'PRAN'];
    return bangladeshBrands.includes(result.brand);
  }
  
  private generatePersonalizationReason(
    result: any,
    userProfile: any,
    realtimeSignals: any
  ): string {
    const reasons: string[] = [];
    
    if (userProfile.favoriteCategories?.includes(result.category)) {
      reasons.push('Favorite category');
    }
    
    if (userProfile.favoriteBrands?.includes(result.brand)) {
      reasons.push('Preferred brand');
    }
    
    if (realtimeSignals.recentViewedProducts?.includes(result.id)) {
      reasons.push('Recently viewed');
    }
    
    return reasons.join(', ') || 'Personalized for you';
  }
  
  private calculateUserRelevance(result: any, userProfile: any): number {
    let relevance = 0.5;
    
    if (userProfile.favoriteCategories?.includes(result.category)) {
      relevance += 0.3;
    }
    
    if (userProfile.favoriteBrands?.includes(result.brand)) {
      relevance += 0.2;
    }
    
    return Math.min(relevance, 1.0);
  }
  
  private calculateContextRelevance(result: any, context: UserContext): number {
    let relevance = 0.5;
    
    if (context.timeOfDay === 'evening' && result.category === 'Electronics') {
      relevance += 0.1;
    }
    
    if (context.device === 'mobile' && result.mobileOptimized) {
      relevance += 0.1;
    }
    
    return Math.min(relevance, 1.0);
  }
  
  private calculatePersonalizationConfidence(score: number): number {
    if (score > 0.9) return 0.95;
    if (score > 0.8) return 0.85;
    if (score > 0.7) return 0.75;
    if (score > 0.6) return 0.65;
    return 0.55;
  }
  
  private getTopCategories(results: PersonalizedResult[], count: number): string[] {
    const categoryCount = new Map<string, number>();
    
    results.forEach(result => {
      if (result.category) {
        categoryCount.set(result.category, (categoryCount.get(result.category) || 0) + 1);
      }
    });
    
    return Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(entry => entry[0]);
  }
  
  private async getUserExperimentSegment(userId: string, experimentId: string): Promise<string> {
    // Hash-based deterministic assignment
    const hash = this.hashString(`${userId}-${experimentId}`);
    const segment = hash % 4;
    
    switch (segment) {
      case 0: return 'control';
      case 1: return 'ml_personalization';
      case 2: return 'cultural_personalization';
      case 3: return 'hybrid_personalization';
      default: return 'control';
    }
  }
  
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  private async applyMLPersonalization(
    results: PersonalizedResult[],
    userId: string
  ): Promise<PersonalizedResult[]> {
    // Apply ML-based personalization
    return results.map(result => ({
      ...result,
      personalizedScore: result.personalizedScore * 1.2,
      experimentSegment: 'ml_personalization'
    }));
  }
  
  private async applyCulturalPersonalization(
    results: PersonalizedResult[],
    userId: string
  ): Promise<PersonalizedResult[]> {
    // Apply cultural personalization
    return results.map(result => ({
      ...result,
      personalizedScore: result.personalizedScore * 1.1,
      experimentSegment: 'cultural_personalization'
    }));
  }
}