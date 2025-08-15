
export interface CustomerSegment {
  segmentId: string;
  segmentName: string;
  description: string;
  characteristics: string[];
  size: number;
  value: 'high' | 'medium' | 'low';
  marketingStrategy: string[];
}

export interface UserSegmentation {
  userId: string;
  primarySegment: CustomerSegment;
  secondarySegments: CustomerSegment[];
  segmentConfidence: number;
  segmentationDate: Date;
}

export class CustomerSegmentationEngine {
  private static instance: CustomerSegmentationEngine;
  private predefinedSegments: Map<string, CustomerSegment> = new Map();
  private userSegmentations: Map<string, UserSegmentation> = new Map();

  public static getInstance(): CustomerSegmentationEngine {
    if (!CustomerSegmentationEngine.instance) {
      CustomerSegmentationEngine.instance = new CustomerSegmentationEngine();
    }
    return CustomerSegmentationEngine.instance;
  }

  async initialize(): Promise<void> {
    console.log('👥 Initializing Customer Segmentation Engine...');
    this.initializePredefinedSegments();
  }

  async segmentUser(userId: string): Promise<UserSegmentation> {
    console.log(`👤 Segmenting user: ${userId}`);

    const userProfile = await this.getUserProfile(userId);
    const behaviorData = await this.getUserBehaviorData(userId);
    const transactionData = await this.getUserTransactionData(userId);

    // Behavioral segmentation
    const behavioralSegment = this.performBehavioralSegmentation(behaviorData);
    
    // Demographic segmentation
    const demographicSegment = this.performDemographicSegmentation(userProfile);
    
    // Value-based segmentation
    const valueSegment = this.performValueBasedSegmentation(transactionData);
    
    // Predictive segmentation
    const predictiveSegment = await this.performPredictiveSegmentation(userId, {
      profile: userProfile,
      behavior: behaviorData,
      transactions: transactionData
    });

    // Combine segmentations to determine primary segment
    const primarySegment = this.determinePrimarySegment([
      behavioralSegment,
      demographicSegment,
      valueSegment,
      predictiveSegment
    ]);

    const secondarySegments = [behavioralSegment, demographicSegment, valueSegment, predictiveSegment]
      .filter(segment => segment.segmentId !== primarySegment.segmentId)
      .slice(0, 2); // Top 2 secondary segments

    const segmentation: UserSegmentation = {
      userId,
      primarySegment,
      secondarySegments,
      segmentConfidence: this.calculateSegmentationConfidence(primarySegment, secondarySegments),
      segmentationDate: new Date()
    };

    this.userSegmentations.set(userId, segmentation);
    return segmentation;
  }

  async getSegmentAnalytics(): Promise<{
    segmentDistribution: Array<{ segment: string; count: number; percentage: number }>;
    segmentValue: Array<{ segment: string; totalValue: number; averageValue: number }>;
    segmentGrowth: Array<{ segment: string; growthRate: number; trend: string }>;
    conversionRates: Array<{ segment: string; conversionRate: number }>;
  }> {
    console.log('📊 Generating segment analytics...');

    // Mock analytics data
    const segments = Array.from(this.predefinedSegments.values());
    
    const segmentDistribution = segments.map(segment => ({
      segment: segment.segmentName,
      count: Math.floor(Math.random() * 1000) + 100,
      percentage: Math.random() * 30 + 5
    }));

    const segmentValue = segments.map(segment => ({
      segment: segment.segmentName,
      totalValue: Math.floor(Math.random() * 1000000) + 100000,
      averageValue: Math.floor(Math.random() * 50000) + 10000
    }));

    const segmentGrowth = segments.map(segment => ({
      segment: segment.segmentName,
      growthRate: (Math.random() - 0.5) * 0.4, // -20% to +20%
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
    }));

    const conversionRates = segments.map(segment => ({
      segment: segment.segmentName,
      conversionRate: Math.random() * 0.15 + 0.02 // 2% to 17%
    }));

    return {
      segmentDistribution,
      segmentValue,
      segmentGrowth,
      conversionRates
    };
  }

  async getTargetingRecommendations(campaignType: 'email' | 'sms' | 'push' | 'discount'): Promise<{
    recommendedSegments: string[];
    campaignStrategy: {
      messaging: string;
      timing: string;
      channels: string[];
      expectedResponse: number;
    };
  }> {
    console.log(`🎯 Generating targeting recommendations for ${campaignType} campaign`);

    let recommendedSegments: string[] = [];
    let campaignStrategy;

    switch (campaignType) {
      case 'email':
        recommendedSegments = ['tech_enthusiasts', 'loyal_customers', 'high_value'];
        campaignStrategy = {
          messaging: 'Product-focused with detailed specifications',
          timing: 'Tuesday-Thursday, 10 AM - 2 PM',
          channels: ['email', 'in_app'],
          expectedResponse: 0.08
        };
        break;

      case 'discount':
        recommendedSegments = ['price_sensitive', 'bargain_hunters', 'cart_abandoners'];
        campaignStrategy = {
          messaging: 'Price-focused with urgency',
          timing: 'Weekend evenings, 6 PM - 9 PM',
          channels: ['sms', 'push', 'email'],
          expectedResponse: 0.15
        };
        break;

      case 'push':
        recommendedSegments = ['mobile_users', 'frequent_browsers', 'young_professionals'];
        campaignStrategy = {
          messaging: 'Short, action-oriented messages',
          timing: 'Real-time based on user activity',
          channels: ['push', 'in_app'],
          expectedResponse: 0.05
        };
        break;

      default:
        recommendedSegments = ['general_users'];
        campaignStrategy = {
          messaging: 'Broad appeal messaging',
          timing: 'Business hours',
          channels: ['email'],
          expectedResponse: 0.03
        };
    }

    return {
      recommendedSegments,
      campaignStrategy
    };
  }

  private initializePredefinedSegments(): void {
    const segments: CustomerSegment[] = [
      {
        segmentId: 'tech_enthusiasts',
        segmentName: 'Tech Enthusiasts',
        description: 'Early adopters who love the latest technology',
        characteristics: ['High engagement with tech products', 'Price insensitive for innovation', 'Shares reviews and opinions'],
        size: 0,
        value: 'high',
        marketingStrategy: ['Product launch campaigns', 'Beta testing invitations', 'Technical content marketing']
      },
      {
        segmentId: 'price_sensitive',
        segmentName: 'Price-Sensitive Shoppers',
        description: 'Budget-conscious customers who seek value',
        characteristics: ['Compares prices extensively', 'Uses coupons and discounts', 'Buys during sales'],
        size: 0,
        value: 'medium',
        marketingStrategy: ['Discount campaigns', 'Value proposition messaging', 'Loyalty programs']
      },
      {
        segmentId: 'loyal_customers',
        segmentName: 'Loyal Customers',
        description: 'Repeat customers with high lifetime value',
        characteristics: ['Multiple purchases', 'Brand advocates', 'High retention rate'],
        size: 0,
        value: 'high',
        marketingStrategy: ['Exclusive offers', 'VIP programs', 'Referral incentives']
      },
      {
        segmentId: 'cart_abandoners',
        segmentName: 'Cart Abandoners',
        description: 'Users who add items to cart but don\'t complete purchase',
        characteristics: ['High browse-to-cart ratio', 'Low conversion rate', 'Price comparison behavior'],
        size: 0,
        value: 'medium',
        marketingStrategy: ['Retargeting campaigns', 'Urgency messaging', 'Discount incentives']
      },
      {
        segmentId: 'first_time_visitors',
        segmentName: 'First-Time Visitors',
        description: 'New users exploring the platform',
        characteristics: ['Single session users', 'High bounce potential', 'Information seekers'],
        size: 0,
        value: 'low',
        marketingStrategy: ['Welcome campaigns', 'Trust building', 'Easy onboarding']
      },
      {
        segmentId: 'high_value',
        segmentName: 'High-Value Customers',
        description: 'Customers with high spending capacity',
        characteristics: ['Large order values', 'Premium product preference', 'Quick decision making'],
        size: 0,
        value: 'high',
        marketingStrategy: ['Premium product focus', 'Concierge service', 'Luxury positioning']
      },
      {
        segmentId: 'mobile_users',
        segmentName: 'Mobile-First Users',
        description: 'Primarily shop using mobile devices',
        characteristics: ['Mobile app usage', 'Short session times', 'Impulse purchases'],
        size: 0,
        value: 'medium',
        marketingStrategy: ['Mobile-optimized campaigns', 'App notifications', 'Quick checkout']
      },
      {
        segmentId: 'bargain_hunters',
        segmentName: 'Bargain Hunters',
        description: 'Active deal seekers and discount users',
        characteristics: ['Searches for deals', 'Uses multiple coupons', 'Seasonal shopping'],
        size: 0,
        value: 'medium',
        marketingStrategy: ['Flash sales', 'Limited time offers', 'Deal newsletters']
      }
    ];

    segments.forEach(segment => {
      this.predefinedSegments.set(segment.segmentId, segment);
    });
  }

  private async getUserProfile(userId: string): Promise<any> {
    // Mock user profile data
    return {
      age: Math.floor(Math.random() * 40) + 20,
      location: 'Dhaka',
      gender: Math.random() > 0.5 ? 'male' : 'female',
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      deviceType: Math.random() > 0.6 ? 'mobile' : 'desktop'
    };
  }

  private async getUserBehaviorData(userId: string): Promise<any> {
    return {
      totalSessions: Math.floor(Math.random() * 50) + 1,
      avgSessionDuration: Math.random() * 1800 + 300, // 5-35 minutes
      pagesPerSession: Math.random() * 10 + 1,
      bounceRate: Math.random() * 0.8,
      lastActivityDate: new Date(),
      preferredCategories: ['Electronics', 'Fashion'],
      searchQueries: ['smartphone', 'laptop', 'headphones']
    };
  }

  private async getUserTransactionData(userId: string): Promise<any> {
    const orderCount = Math.floor(Math.random() * 20);
    const totalSpent = orderCount * (Math.random() * 20000 + 5000);
    
    return {
      orderCount,
      totalSpent,
      averageOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
      lastOrderDate: orderCount > 0 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) : null,
      preferredPaymentMethod: 'card',
      returnRate: Math.random() * 0.1
    };
  }

  private performBehavioralSegmentation(behaviorData: any): CustomerSegment {
    if (behaviorData.totalSessions > 20 && behaviorData.avgSessionDuration > 1200) {
      return this.predefinedSegments.get('loyal_customers')!;
    } else if (behaviorData.bounceRate > 0.7) {
      return this.predefinedSegments.get('first_time_visitors')!;
    } else if (behaviorData.searchQueries.some((q: string) => q.includes('deal') || q.includes('discount'))) {
      return this.predefinedSegments.get('bargain_hunters')!;
    } else {
      return this.predefinedSegments.get('price_sensitive')!;
    }
  }

  private performDemographicSegmentation(userProfile: any): CustomerSegment {
    if (userProfile.age < 35 && userProfile.deviceType === 'mobile') {
      return this.predefinedSegments.get('mobile_users')!;
    } else if (userProfile.age < 40) {
      return this.predefinedSegments.get('tech_enthusiasts')!;
    } else {
      return this.predefinedSegments.get('price_sensitive')!;
    }
  }

  private performValueBasedSegmentation(transactionData: any): CustomerSegment {
    if (transactionData.averageOrderValue > 30000) {
      return this.predefinedSegments.get('high_value')!;
    } else if (transactionData.orderCount > 5) {
      return this.predefinedSegments.get('loyal_customers')!;
    } else if (transactionData.orderCount === 0) {
      return this.predefinedSegments.get('cart_abandoners')!;
    } else {
      return this.predefinedSegments.get('first_time_visitors')!;
    }
  }

  private async performPredictiveSegmentation(userId: string, data: any): Promise<CustomerSegment> {
    // Predict future behavior based on current patterns
    const conversionProbability = this.calculateConversionProbability(data);
    const churnProbability = this.calculateChurnProbability(data);

    if (churnProbability > 0.7) {
      return this.predefinedSegments.get('cart_abandoners')!;
    } else if (conversionProbability > 0.8) {
      return this.predefinedSegments.get('loyal_customers')!;
    } else {
      return this.predefinedSegments.get('price_sensitive')!;
    }
  }

  private determinePrimarySegment(segments: CustomerSegment[]): CustomerSegment {
    // Weight segments by value and confidence
    const valueWeights = { high: 3, medium: 2, low: 1 };
    
    return segments.reduce((best, current) => {
      const currentWeight = valueWeights[current.value];
      const bestWeight = valueWeights[best.value];
      return currentWeight > bestWeight ? current : best;
    });
  }

  private calculateSegmentationConfidence(primary: CustomerSegment, secondary: CustomerSegment[]): number {
    // Higher confidence if multiple segments agree
    const agreementScore = secondary.filter(s => s.value === primary.value).length / secondary.length;
    return Math.min(0.95, 0.6 + (agreementScore * 0.3));
  }

  private calculateConversionProbability(data: any): number {
    let probability = 0.5; // Base probability
    
    if (data.transactions.orderCount > 0) probability += 0.3;
    if (data.behavior.avgSessionDuration > 600) probability += 0.2;
    if (data.behavior.pagesPerSession > 5) probability += 0.1;
    
    return Math.min(1, probability);
  }

  private calculateChurnProbability(data: any): number {
    let probability = 0.1; // Base churn probability
    
    const daysSinceLastOrder = data.transactions.lastOrderDate ? 
      (Date.now() - data.transactions.lastOrderDate.getTime()) / (24 * 60 * 60 * 1000) : 365;
    
    if (daysSinceLastOrder > 90) probability += 0.4;
    if (data.behavior.bounceRate > 0.8) probability += 0.3;
    if (data.transactions.returnRate > 0.1) probability += 0.2;
    
    return Math.min(1, probability);
  }
}

export const customerSegmentationEngine = CustomerSegmentationEngine.getInstance();
