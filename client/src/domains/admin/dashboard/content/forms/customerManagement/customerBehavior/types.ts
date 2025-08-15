
export interface CustomerBehaviorData {
  customerId: string;
  name: string;
  email: string;
  avatar?: string;
  totalSessions: number;
  totalPageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  lastActive: string;
  lifetimeValue: number;
  totalOrders: number;
  averageOrderValue: number;
  favoriteCategories: string[];
  devicePreference: 'mobile' | 'desktop' | 'tablet';
  behaviorScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  customerStage: 'prospect' | 'new' | 'active' | 'at_risk' | 'dormant' | 'loyal';
  engagementLevel: 'low' | 'medium' | 'high';
  predictedChurnRisk: number;
  nextPurchaseProbability: number;
  recommendationClickRate: number;
  searchBehavior: {
    totalSearches: number;
    topSearchTerms: string[];
    searchToConversionRate: number;
  };
  socialEngagement: {
    reviewsWritten: number;
    averageRating: number;
    socialShares: number;
  };
  touchpoints: BehaviorTouchpoint[];
}

export interface BehaviorTouchpoint {
  id: string;
  timestamp: string;
  type: 'page_view' | 'product_view' | 'cart_add' | 'purchase' | 'search' | 'review' | 'support_contact';
  details: {
    page?: string;
    product?: string;
    category?: string;
    searchTerm?: string;
    deviceType: string;
    sessionId: string;
    duration?: number;
    value?: number;
  };
}

export interface BehaviorSegment {
  id: string;
  name: string;
  description: string;
  customerCount: number;
  characteristics: string[];
  avgLifetimeValue: number;
  conversionRate: number;
  retentionRate: number;
  color: string;
}

export interface BehaviorMetrics {
  totalActiveCustomers: number;
  averageSessionDuration: number;
  overallConversionRate: number;
  customerRetentionRate: number;
  averageEngagementScore: number;
  churnRiskCustomers: number;
  topPerformingSegments: string[];
  behaviorTrends: Array<{
    date: string;
    sessions: number;
    conversions: number;
    revenue: number;
  }>;
}

export interface PersonalizationInsight {
  customerId: string;
  recommendationType: string;
  clickThroughRate: number;
  conversionRate: number;
  revenue: number;
  effectiveness: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export interface BehaviorAlert {
  id: string;
  type: 'churn_risk' | 'high_value_opportunity' | 'engagement_drop' | 'unusual_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  customerId: string;
  customerName: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
  suggestedActions: string[];
}
