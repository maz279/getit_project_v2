import { aiOrchestrator } from './AIOrchestrator';

export class PersonalizationEngine {
  private static instance: PersonalizationEngine;
  private userProfiles: Map<string, any> = new Map();
  private behaviorPatterns: Map<string, any[]> = new Map();

  private constructor() {}

  public static getInstance(): PersonalizationEngine {
    if (!PersonalizationEngine.instance) {
      PersonalizationEngine.instance = new PersonalizationEngine();
    }
    return PersonalizationEngine.instance;
  }

  async personalizeExperience(userId: string, context: {
    page?: string;
    products?: any[];
    searchQuery?: string;
    language?: 'en' | 'bn';
  }): Promise<{
    personalizedContent: any;
    recommendations: any[];
    uiOptimizations: any;
    dynamicPricing: any;
    contentStrategy: any;
  }> {
    console.log('Personalization: Creating personalized experience');

    const userProfile = await this.getUserProfile(userId);
    const behaviorHistory = this.behaviorPatterns.get(userId) || [];

    // AI-powered content personalization
    const personalizedContent = await this.generatePersonalizedContent(userProfile, context);
    
    // Dynamic recommendations
    const recommendations = await this.generateDynamicRecommendations(userId, userProfile, context);
    
    // UI/UX optimizations
    const uiOptimizations = await this.optimizeUI(userProfile, behaviorHistory);
    
    // Dynamic pricing
    const dynamicPricing = await this.calculateDynamicPricing(userId, context.products || []);
    
    // Content strategy
    const contentStrategy = await this.optimizeContentStrategy(userProfile, context);

    return {
      personalizedContent,
      recommendations,
      uiOptimizations,
      dynamicPricing,
      contentStrategy
    };
  }

  async trackBehavior(userId: string, behavior: {
    action: string;
    target: string;
    context: any;
    timestamp: number;
  }): Promise<void> {
    if (!this.behaviorPatterns.has(userId)) {
      this.behaviorPatterns.set(userId, []);
    }

    const behaviors = this.behaviorPatterns.get(userId)!;
    behaviors.push(behavior);

    // Keep only last 100 behaviors
    if (behaviors.length > 100) {
      behaviors.shift();
    }

    // Analyze behavior with AI
    await aiOrchestrator.analyzeUserBehavior(userId, {
      type: behavior.action,
      data: { ...behavior.context, target: behavior.target },
      timestamp: behavior.timestamp
    });

    // Update user profile
    await this.updateUserProfile(userId, behavior);
  }

  private async getUserProfile(userId: string): Promise<any> {
    if (!this.userProfiles.has(userId)) {
      // Create default profile
      this.userProfiles.set(userId, {
        segments: ['new_user'],
        preferences: [],
        priceRange: { min: 0, max: 100000 },
        categories: [],
        brands: [],
        language: 'en',
        deviceType: 'desktop',
        timeZone: 'Asia/Dhaka',
        lastActivity: Date.now()
      });
    }

    return this.userProfiles.get(userId);
  }

  private async updateUserProfile(userId: string, behavior: any): Promise<void> {
    const profile = await this.getUserProfile(userId);
    
    // Update based on behavior
    if (behavior.action === 'product_view' && behavior.context.category) {
      profile.categories = [...new Set([...profile.categories, behavior.context.category])];
    }
    
    if (behavior.action === 'search' && behavior.context.query) {
      // Extract preferences from search patterns
      const searchTerms = behavior.context.query.toLowerCase().split(' ');
      profile.searchPatterns = [...(profile.searchPatterns || []), ...searchTerms];
    }

    profile.lastActivity = Date.now();
    this.userProfiles.set(userId, profile);
  }

  private async generatePersonalizedContent(userProfile: any, context: any): Promise<any> {
    return {
      headlines: this.personalizeHeadlines(userProfile, context),
      descriptions: this.personalizeDescriptions(userProfile, context),
      images: this.personalizeImages(userProfile, context),
      messaging: this.personalizeMessaging(userProfile, context),
      offers: this.personalizeOffers(userProfile, context)
    };
  }

  private personalizeHeadlines(userProfile: any, context: any): string[] {
    const baseHeadlines = [
      'Discover Amazing Products',
      'Best Deals of the Day',
      'Trending Now'
    ];

    // Personalize based on user segment
    if (userProfile.segments?.includes('tech_enthusiast')) {
      return [
        'Latest Tech Innovations',
        'Cutting-Edge Electronics',
        'Tech Deals You\'ll Love'
      ];
    }

    if (userProfile.segments?.includes('budget_conscious')) {
      return [
        'Best Value Products',
        'Unbeatable Prices',
        'Save More Today'
      ];
    }

    return baseHeadlines;
  }

  private personalizeDescriptions(userProfile: any, context: any): any {
    return {
      focusAreas: userProfile.categories?.slice(0, 3) || ['Electronics', 'Fashion'],
      tone: userProfile.segments?.includes('premium') ? 'luxury' : 'friendly',
      language: userProfile.language || 'en',
      keyBenefits: this.extractKeyBenefits(userProfile)
    };
  }

  private personalizeImages(userProfile: any, context: any): any {
    return {
      style: userProfile.segments?.includes('premium') ? 'high_end' : 'lifestyle',
      colorScheme: userProfile.preferences?.includes('dark_mode') ? 'dark' : 'light',
      demographics: this.inferDemographics(userProfile)
    };
  }

  private personalizeMessaging(userProfile: any, context: any): any {
    return {
      urgency: userProfile.segments?.includes('impulse_buyer') ? 'high' : 'medium',
      socialProof: userProfile.segments?.includes('social_influenced') ? 'prominent' : 'subtle',
      trustSignals: userProfile.segments?.includes('security_conscious') ? 'emphasized' : 'standard'
    };
  }

  private personalizeOffers(userProfile: any, context: any): any[] {
    const offers = [];

    if (userProfile.segments?.includes('price_sensitive')) {
      offers.push({
        type: 'discount',
        value: '20% OFF',
        condition: 'Limited time'
      });
    }

    if (userProfile.segments?.includes('premium')) {
      offers.push({
        type: 'premium_service',
        value: 'Free Premium Delivery',
        condition: 'Exclusive for you'
      });
    }

    return offers;
  }

  private async generateDynamicRecommendations(userId: string, userProfile: any, context: any): Promise<any[]> {
    // This would integrate with ML recommendation engine
    return [
      {
        type: 'trending',
        products: await this.getTrendingForUser(userProfile),
        reason: 'Based on your interests'
      },
      {
        type: 'complementary',
        products: await this.getComplementaryProducts(context.products || []),
        reason: 'Complete your purchase'
      },
      {
        type: 'similar_users',
        products: await this.getSimilarUserPurchases(userProfile),
        reason: 'Others like you bought'
      }
    ];
  }

  private async optimizeUI(userProfile: any, behaviorHistory: any[]): Promise<any> {
    return {
      layout: this.optimizeLayout(userProfile, behaviorHistory),
      colors: this.optimizeColors(userProfile),
      navigation: this.optimizeNavigation(behaviorHistory),
      searchInterface: this.optimizeSearch(userProfile, behaviorHistory)
    };
  }

  private optimizeLayout(userProfile: any, behaviorHistory: any[]): any {
    // Analyze click patterns to optimize layout
    const clickAreas = behaviorHistory
      .filter(b => b.action === 'click')
      .map(b => b.context.area || 'unknown');

    return {
      priorityAreas: ['header', 'main_content', 'recommendations'],
      gridStyle: userProfile.deviceType === 'mobile' ? 'single_column' : 'multi_column',
      spacing: 'comfortable'
    };
  }

  private optimizeColors(userProfile: any): any {
    return {
      theme: userProfile.preferences?.includes('dark_mode') ? 'dark' : 'light',
      accent: userProfile.segments?.includes('premium') ? 'gold' : 'blue',
      contrast: 'high' // For accessibility
    };
  }

  private optimizeNavigation(behaviorHistory: any[]): any {
    // Analyze navigation patterns
    const navigationPatterns = behaviorHistory
      .filter(b => b.action === 'navigate')
      .map(b => b.target);

    return {
      quickAccess: this.getMostUsedPages(navigationPatterns),
      menuStyle: 'horizontal',
      searchProminence: 'high'
    };
  }

  private optimizeSearch(userProfile: any, behaviorHistory: any[]): any {
    const searchBehaviors = behaviorHistory.filter(b => b.action === 'search');
    
    return {
      suggestions: searchBehaviors.length > 5 ? 'personalized' : 'popular',
      filters: this.getPreferredFilters(userProfile),
      autoComplete: true,
      voiceSearch: userProfile.language === 'bn' ? 'enabled' : 'optional'
    };
  }

  private async calculateDynamicPricing(userId: string, products: any[]): Promise<any> {
    const userProfile = await this.getUserProfile(userId);
    
    return products.map(product => ({
      productId: product.id,
      originalPrice: product.price,
      personalizedPrice: this.calculatePersonalizedPrice(product, userProfile),
      priceStrategy: this.determinePricingStrategy(product, userProfile),
      discountReason: this.generateDiscountReason(userProfile)
    }));
  }

  private calculatePersonalizedPrice(product: any, userProfile: any): number {
    let price = product.price;
    
    // Apply segment-based pricing
    if (userProfile.segments?.includes('premium')) {
      price *= 1.05; // Slight premium pricing
    } else if (userProfile.segments?.includes('budget_conscious')) {
      price *= 0.95; // Slight discount
    }
    
    // Apply loyalty discount
    if (userProfile.loyaltyLevel === 'gold') {
      price *= 0.9;
    }
    
    return Math.round(price);
  }

  private determinePricingStrategy(product: any, userProfile: any): string {
    if (userProfile.segments?.includes('premium')) return 'value_based';
    if (userProfile.segments?.includes('price_sensitive')) return 'competitive';
    return 'standard';
  }

  private generateDiscountReason(userProfile: any): string {
    if (userProfile.segments?.includes('new_customer')) return 'Welcome discount';
    if (userProfile.loyaltyLevel === 'gold') return 'Loyalty reward';
    return 'Special offer';
  }

  private async optimizeContentStrategy(userProfile: any, context: any): Promise<any> {
    return {
      contentTypes: this.selectContentTypes(userProfile),
      frequency: this.optimizeFrequency(userProfile),
      channels: this.selectChannels(userProfile),
      timing: this.optimizeTiming(userProfile)
    };
  }

  // Helper methods
  private extractKeyBenefits(userProfile: any): string[] {
    const benefits = ['Quality', 'Value', 'Service'];
    
    if (userProfile.segments?.includes('eco_conscious')) {
      benefits.unshift('Sustainable');
    }
    
    if (userProfile.segments?.includes('tech_enthusiast')) {
      benefits.unshift('Innovation');
    }
    
    return benefits.slice(0, 3);
  }

  private inferDemographics(userProfile: any): any {
    return {
      ageGroup: userProfile.segments?.includes('tech_enthusiast') ? 'young_professional' : 'general',
      interests: userProfile.categories || [],
      lifestyle: userProfile.segments?.includes('premium') ? 'luxury' : 'everyday'
    };
  }

  private async getTrendingForUser(userProfile: any): Promise<any[]> {
    // Mock trending products based on user profile
    return [
      { id: 'trend_1', title: 'Trending Product 1', relevance: 0.9 },
      { id: 'trend_2', title: 'Trending Product 2', relevance: 0.8 }
    ];
  }

  private async getComplementaryProducts(products: any[]): Promise<any[]> {
    // Mock complementary products
    return products.map(p => ({
      id: `comp_${p.id}`,
      title: `Accessory for ${p.title}`,
      relevance: 0.7
    }));
  }

  private async getSimilarUserPurchases(userProfile: any): Promise<any[]> {
    // Mock similar user purchases
    return [
      { id: 'similar_1', title: 'Popular Choice', relevance: 0.8 },
      { id: 'similar_2', title: 'Recommended Item', relevance: 0.75 }
    ];
  }

  private getMostUsedPages(navigationPatterns: string[]): string[] {
    const pageCount: { [key: string]: number } = {};
    navigationPatterns.forEach(page => {
      pageCount[page] = (pageCount[page] || 0) + 1;
    });
    
    return Object.entries(pageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([page]) => page);
  }

  private getPreferredFilters(userProfile: any): string[] {
    const filters = ['Price', 'Brand', 'Rating'];
    
    if (userProfile.categories?.includes('Electronics')) {
      filters.push('Features', 'Warranty');
    }
    
    if (userProfile.segments?.includes('eco_conscious')) {
      filters.push('Eco-Friendly');
    }
    
    return filters;
  }

  private selectContentTypes(userProfile: any): string[] {
    const types = ['product_recommendations', 'deals'];
    
    if (userProfile.segments?.includes('tech_enthusiast')) {
      types.push('tech_news', 'product_reviews');
    }
    
    return types;
  }

  private optimizeFrequency(userProfile: any): string {
    if (userProfile.segments?.includes('frequent_buyer')) return 'daily';
    if (userProfile.segments?.includes('occasional_buyer')) return 'weekly';
    return 'bi_weekly';
  }

  private selectChannels(userProfile: any): string[] {
    const channels = ['website', 'email'];
    
    if (userProfile.preferences?.includes('mobile_first')) {
      channels.unshift('mobile_app', 'sms');
    }
    
    return channels;
  }

  private optimizeTiming(userProfile: any): any {
    return {
      preferredHours: userProfile.timeZone ? this.getOptimalHours(userProfile.timeZone) : [10, 14, 18],
      frequency: this.optimizeFrequency(userProfile),
      timezone: userProfile.timeZone || 'Asia/Dhaka'
    };
  }

  private getOptimalHours(timeZone: string): number[] {
    // Optimize based on timezone - return hours in 24h format
    return [9, 13, 17, 20]; // 9 AM, 1 PM, 5 PM, 8 PM
  }
}

export const personalizationEngine = PersonalizationEngine.getInstance();
