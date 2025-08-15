
import { mlManager } from '../ml';
import { nlpManager } from '../nlp';

interface PersonalizationProfile {
  userId: string;
  preferences: {
    categories: string[];
    brands: string[];
    priceRange: { min: number; max: number };
    colors: string[];
    styles: string[];
  };
  behavior: {
    browsingPatterns: string[];
    purchaseHistory: any[];
    searchHistory: string[];
    timePreferences: string[];
    devicePreferences: string[];
  };
  demographics: {
    ageGroup: string;
    location: string;
    interests: string[];
  };
  aiInsights: {
    predictedInterests: string[];
    churnRisk: number;
    lifetimeValue: number;
    nextBestAction: string;
  };
}

export class AdvancedPersonalizationEngine {
  private static instance: AdvancedPersonalizationEngine;
  private userProfiles: Map<string, PersonalizationProfile> = new Map();
  private globalInsights: any = {};

  public static getInstance(): AdvancedPersonalizationEngine {
    if (!AdvancedPersonalizationEngine.instance) {
      AdvancedPersonalizationEngine.instance = new AdvancedPersonalizationEngine();
    }
    return AdvancedPersonalizationEngine.instance;
  }

  async createOrUpdateProfile(userId: string, data: {
    action: string;
    productId?: string;
    category?: string;
    searchQuery?: string;
    metadata?: any;
  }): Promise<PersonalizationProfile> {
    console.log('Advanced Personalization: Updating profile for user:', userId);

    let profile = this.userProfiles.get(userId) || this.initializeProfile(userId);

    // Update based on action
    switch (data.action) {
      case 'product_view':
        await this.updateViewingBehavior(profile, data);
        break;
      case 'purchase':
        await this.updatePurchaseBehavior(profile, data);
        break;
      case 'search':
        await this.updateSearchBehavior(profile, data);
        break;
      case 'cart_add':
        await this.updateCartBehavior(profile, data);
        break;
    }

    // Generate AI insights
    profile.aiInsights = await this.generateAIInsights(profile);

    this.userProfiles.set(userId, profile);
    return profile;
  }

  private initializeProfile(userId: string): PersonalizationProfile {
    return {
      userId,
      preferences: {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 1000000 },
        colors: [],
        styles: []
      },
      behavior: {
        browsingPatterns: [],
        purchaseHistory: [],
        searchHistory: [],
        timePreferences: [],
        devicePreferences: []
      },
      demographics: {
        ageGroup: 'unknown',
        location: 'BD',
        interests: []
      },
      aiInsights: {
        predictedInterests: [],
        churnRisk: 0.5,
        lifetimeValue: 0,
        nextBestAction: 'explore_preferences'
      }
    };
  }

  private async updateViewingBehavior(profile: PersonalizationProfile, data: any): Promise<void> {
    // Update category preferences
    if (data.category && !profile.preferences.categories.includes(data.category)) {
      profile.preferences.categories.push(data.category);
      profile.preferences.categories = profile.preferences.categories.slice(-10); // Keep recent 10
    }

    // Update browsing patterns
    const currentHour = new Date().getHours();
    const timeSlot = this.getTimeSlot(currentHour);
    if (!profile.behavior.timePreferences.includes(timeSlot)) {
      profile.behavior.timePreferences.push(timeSlot);
    }

    // Analyze product attributes if available
    if (data.metadata?.attributes) {
      this.updateAttributePreferences(profile, data.metadata.attributes);
    }
  }

  private async updatePurchaseBehavior(profile: PersonalizationProfile, data: any): Promise<void> {
    profile.behavior.purchaseHistory.push({
      productId: data.productId,
      category: data.category,
      amount: data.metadata?.amount || 0,
      timestamp: Date.now()
    });

    // Update price range preferences
    if (data.metadata?.amount) {
      const amount = data.metadata.amount;
      if (profile.preferences.priceRange.min === 0 || amount < profile.preferences.priceRange.min) {
        profile.preferences.priceRange.min = amount * 0.8;
      }
      if (amount > profile.preferences.priceRange.max * 0.8) {
        profile.preferences.priceRange.max = amount * 1.2;
      }
    }

    // Update brand preferences
    if (data.metadata?.brand && !profile.preferences.brands.includes(data.metadata.brand)) {
      profile.preferences.brands.push(data.metadata.brand);
      profile.preferences.brands = profile.preferences.brands.slice(-5); // Keep recent 5
    }
  }

  private async updateSearchBehavior(profile: PersonalizationProfile, data: any): Promise<void> {
    if (data.searchQuery) {
      profile.behavior.searchHistory.push(data.searchQuery);
      profile.behavior.searchHistory = profile.behavior.searchHistory.slice(-20); // Keep recent 20

      // Analyze search intent
      try {
        const nlpAnalysis = await nlpManager.analyzeText(data.searchQuery, {
          includeIntent: true,
          includeEntities: true
        });

        // Extract interests from entities
        if (nlpAnalysis.entities?.products) {
          nlpAnalysis.entities.products.forEach((product: string) => {
            if (!profile.demographics.interests.includes(product)) {
              profile.demographics.interests.push(product);
            }
          });
        }
      } catch (error) {
        console.error('NLP analysis failed:', error);
      }
    }
  }

  private async updateCartBehavior(profile: PersonalizationProfile, data: any): Promise<void> {
    // Track items added to cart for better recommendation
    if (data.metadata?.cartItems) {
      data.metadata.cartItems.forEach((item: any) => {
        if (item.category && !profile.preferences.categories.includes(item.category)) {
          profile.preferences.categories.push(item.category);
        }
      });
    }
  }

  private updateAttributePreferences(profile: PersonalizationProfile, attributes: any): void {
    if (attributes.color && !profile.preferences.colors.includes(attributes.color)) {
      profile.preferences.colors.push(attributes.color);
      profile.preferences.colors = profile.preferences.colors.slice(-5);
    }

    if (attributes.style && !profile.preferences.styles.includes(attributes.style)) {
      profile.preferences.styles.push(attributes.style);
      profile.preferences.styles = profile.preferences.styles.slice(-5);
    }
  }

  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  private async generateAIInsights(profile: PersonalizationProfile): Promise<any> {
    try {
      // Calculate CLV based on purchase history
      const totalSpent = profile.behavior.purchaseHistory
        .reduce((sum, purchase) => sum + purchase.amount, 0);
      const lifetimeValue = totalSpent * 1.5; // Predictive multiplier

      // Calculate churn risk
      const daysSinceLastPurchase = profile.behavior.purchaseHistory.length > 0 ?
        Math.floor((Date.now() - Math.max(...profile.behavior.purchaseHistory.map(p => p.timestamp))) / (24 * 60 * 60 * 1000)) : 30;
      const churnRisk = Math.min(daysSinceLastPurchase / 30, 1);

      // Predict interests using ML
      const predictedInterests = await this.predictInterests(profile);

      // Determine next best action
      const nextBestAction = this.determineNextBestAction(profile, churnRisk);

      return {
        predictedInterests,
        churnRisk,
        lifetimeValue,
        nextBestAction
      };
    } catch (error) {
      console.error('AI insights generation failed:', error);
      return profile.aiInsights; // Return existing insights
    }
  }

  private async predictInterests(profile: PersonalizationProfile): Promise<string[]> {
    // Use ML to predict interests based on behavior patterns
    const interests = [];

    // Category-based predictions
    const topCategories = profile.preferences.categories.slice(-3);
    topCategories.forEach(category => {
      const relatedCategories = this.getRelatedCategories(category);
      interests.push(...relatedCategories);
    });

    // Search-based predictions
    const recentSearches = profile.behavior.searchHistory.slice(-5);
    for (const search of recentSearches) {
      try {
        const nlpResult = await nlpManager.analyzeText(search, { includeKeywords: true });
        if (nlpResult.keywords?.keywords) {
          nlpResult.keywords.keywords.slice(0, 2).forEach((kw: any) => {
            interests.push(kw.word);
          });
        }
      } catch (error) {
        console.error('Search analysis failed:', error);
      }
    }

    return [...new Set(interests)].slice(0, 10); // Remove duplicates and limit
  }

  private getRelatedCategories(category: string): string[] {
    const categoryMap: Record<string, string[]> = {
      'Electronics': ['Smart Home', 'Gaming', 'Mobile Accessories'],
      'Fashion': ['Footwear', 'Accessories', 'Beauty'],
      'Home & Garden': ['Kitchen', 'Furniture', 'Decor'],
      'Sports': ['Fitness', 'Outdoor', 'Athletic Wear'],
      'Books': ['Educational', 'Fiction', 'Self-Help']
    };

    return categoryMap[category] || [];
  }

  private determineNextBestAction(profile: PersonalizationProfile, churnRisk: number): string {
    if (churnRisk > 0.7) return 'retention_campaign';
    if (profile.behavior.purchaseHistory.length === 0) return 'first_purchase_incentive';
    if (profile.behavior.purchaseHistory.length >= 5) return 'loyalty_program';
    if (profile.preferences.categories.length > 3) return 'cross_category_recommendation';
    return 'personalized_offers';
  }

  async getPersonalizedRecommendations(userId: string, context?: {
    page?: string;
    category?: string;
    intent?: string;
  }): Promise<{
    products: any[];
    content: any[];
    offers: any[];
    experience: any;
  }> {
    console.log('Advanced Personalization: Generating recommendations for:', userId);

    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return this.getDefaultRecommendations();
    }

    // Get ML-powered product recommendations
    const productRecommendations = await mlManager.getRecommendationEngine()
      .generateRecommendations(userId, { context, profile });

    // Generate personalized content
    const contentRecommendations = await this.generateContentRecommendations(profile, context);

    // Generate personalized offers
    const offerRecommendations = await this.generateOfferRecommendations(profile);

    // Customize experience
    const experienceCustomization = await this.customizeExperience(profile, context);

    return {
      products: productRecommendations,
      content: contentRecommendations,
      offers: offerRecommendations,
      experience: experienceCustomization
    };
  }

  private async generateContentRecommendations(profile: PersonalizationProfile, context?: any): Promise<any[]> {
    const content = [];

    // Recommend based on interests
    profile.aiInsights.predictedInterests.slice(0, 3).forEach(interest => {
      content.push({
        type: 'article',
        title: `Latest Trends in ${interest}`,
        category: interest,
        relevanceScore: 0.9
      });
    });

    // Recommend based on browsing time
    const preferredTime = profile.behavior.timePreferences[0];
    if (preferredTime) {
      content.push({
        type: 'promotion',
        title: `${preferredTime} Special Deals`,
        timing: preferredTime,
        relevanceScore: 0.8
      });
    }

    return content;
  }

  private async generateOfferRecommendations(profile: PersonalizationProfile): Promise<any[]> {
    const offers = [];

    // Churn prevention offers
    if (profile.aiInsights.churnRisk > 0.6) {
      offers.push({
        type: 'retention',
        title: 'Welcome Back - 15% Off',
        discount: 0.15,
        urgency: 'high'
      });
    }

    // Category-based offers
    profile.preferences.categories.slice(0, 2).forEach(category => {
      offers.push({
        type: 'category',
        title: `${category} Special - 10% Off`,
        category,
        discount: 0.10
      });
    });

    // Price-range specific offers
    if (profile.preferences.priceRange.max > 50000) {
      offers.push({
        type: 'premium',
        title: 'Exclusive Premium Collection',
        minAmount: 50000,
        benefit: 'Free delivery + Extended warranty'
      });
    }

    return offers;
  }

  private async customizeExperience(profile: PersonalizationProfile, context?: any): Promise<any> {
    return {
      theme: profile.preferences.colors[0] ? 
        this.getThemeFromColor(profile.preferences.colors[0]) : 'default',
      layout: profile.behavior.devicePreferences[0] === 'mobile' ? 'mobile-first' : 'responsive',
      navigation: {
        priorityCategories: profile.preferences.categories.slice(0, 5),
        quickActions: this.getQuickActions(profile.aiInsights.nextBestAction)
      },
      messaging: {
        tone: profile.demographics.ageGroup === 'young' ? 'casual' : 'professional',
        language: 'bn' // Can be dynamic based on user preference
      }
    };
  }

  private getDefaultRecommendations(): any {
    return {
      products: [],
      content: [
        { type: 'article', title: 'Welcome to Smart Shopping', relevanceScore: 0.5 }
      ],
      offers: [
        { type: 'welcome', title: 'New User - 10% Off', discount: 0.10 }
      ],
      experience: {
        theme: 'default',
        layout: 'responsive',
        navigation: { priorityCategories: ['Electronics', 'Fashion'] },
        messaging: { tone: 'friendly', language: 'bn' }
      }
    };
  }

  private getThemeFromColor(color: string): string {
    const colorThemeMap: Record<string, string> = {
      'blue': 'ocean',
      'green': 'nature',
      'red': 'energy',
      'purple': 'luxury',
      'black': 'elegant'
    };
    return colorThemeMap[color.toLowerCase()] || 'default';
  }

  private getQuickActions(nextBestAction: string): string[] {
    const actionMap: Record<string, string[]> = {
      'retention_campaign': ['View Offers', 'Check Wishlist', 'Customer Support'],
      'first_purchase_incentive': ['Browse Categories', 'View Deals', 'Get Help'],
      'loyalty_program': ['Loyalty Status', 'Exclusive Deals', 'Refer Friends'],
      'cross_category_recommendation': ['Explore New', 'Similar Items', 'Bundle Deals']
    };
    return actionMap[nextBestAction] || ['Browse', 'Search', 'Account'];
  }

  public getProfile(userId: string): PersonalizationProfile | undefined {
    return this.userProfiles.get(userId);
  }

  public getGlobalInsights(): any {
    // Aggregate insights across all users
    const totalUsers = this.userProfiles.size;
    const avgChurnRisk = Array.from(this.userProfiles.values())
      .reduce((sum, profile) => sum + profile.aiInsights.churnRisk, 0) / totalUsers;

    const popularCategories = Array.from(this.userProfiles.values())
      .flatMap(profile => profile.preferences.categories)
      .reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalUsers,
      avgChurnRisk,
      popularCategories: Object.entries(popularCategories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }
}

export const advancedPersonalizationEngine = AdvancedPersonalizationEngine.getInstance();
