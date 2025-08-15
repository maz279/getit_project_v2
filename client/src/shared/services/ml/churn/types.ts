
export interface ChurnPrediction {
  userId: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timeToChurn: number; // days
  churnFactors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  retentionStrategies: Array<{
    strategy: string;
    priority: number;
    expectedImpact: number;
    description: string;
  }>;
  confidence: number;
}

export interface EngagementPrediction {
  userId: string;
  featureEngagement: {
    wishlist: number;
    reviews: number;
    socialSharing: number;
    referrals: number;
    premiumFeatures: number;
  };
  overallEngagement: number;
  recommendedFeatures: string[];
  engagementTrends: {
    increasing: string[];
    decreasing: string[];
    stable: string[];
  };
}

export interface ChurnAnalytics {
  overallChurnRate: number;
  segmentAnalysis: Array<{
    segment: string;
    churnRate: number;
    primaryFactors: string[];
    retentionOpportunity: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    churnRate: number;
    retainedUsers: number;
  }>;
  recommendations: string[];
}

export interface RetentionCampaignMetrics {
  campaignId: string;
  targetedUsers: number;
  retainedUsers: number;
  retentionRate: number;
  costPerRetention: number;
  roi: number;
  topPerformingStrategies: string[];
}
