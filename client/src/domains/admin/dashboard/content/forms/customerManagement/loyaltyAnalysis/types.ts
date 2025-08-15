
export interface LoyaltyProgram {
  id: string;
  name: string;
  type: 'points' | 'tier' | 'cashback' | 'subscription';
  status: 'active' | 'paused' | 'draft';
  enrolledMembers: number;
  totalRewards: number;
  engagementRate: number;
  retentionRate: number;
  conversionRate: number;
  createdAt: string;
  description: string;
}

export interface LoyaltyMember {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  avatar?: string;
  currentTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  totalPoints: number;
  pointsExpiring: number;
  expiryDate: string;
  lifetimeSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  lastActivity: string;
  joinDate: string;
  referrals: number;
  rewardsRedeemed: number;
  engagementScore: number;
  churnRisk: 'low' | 'medium' | 'high';
  preferredCategories: string[];
  communicationPreference: 'email' | 'sms' | 'push' | 'all';
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'earn' | 'redeem' | 'expire' | 'bonus';
  points: number;
  description: string;
  orderId?: string;
  rewardId?: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_shipping' | 'product' | 'voucher' | 'experience';
  pointsCost: number;
  value: number;
  category: string;
  availability: number;
  redeemed: number;
  popularity: number;
  expiryDate?: string;
  eligibleTiers: string[];
  isActive: boolean;
  image?: string;
}

export interface LoyaltyAnalytics {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalPointsExpired: number;
  averageEngagementScore: number;
  programROI: number;
  memberRetentionRate: number;
  rewardRedemptionRate: number;
  averagePointsPerMember: number;
  topPerformingRewards: LoyaltyReward[];
  membershipGrowth: Array<{
    month: string;
    newMembers: number;
    activeMembers: number;
    churnedMembers: number;
  }>;
  tierDistribution: Array<{
    tier: string;
    count: number;
    percentage: number;
    averageSpend: number;
  }>;
  pointsAnalytics: Array<{
    month: string;
    issued: number;
    redeemed: number;
    expired: number;
  }>;
  engagementMetrics: Array<{
    category: string;
    engagementRate: number;
    conversionRate: number;
    revenueImpact: number;
  }>;
}

export interface LoyaltySegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    minPoints?: number;
    maxPoints?: number;
    minOrders?: number;
    minSpend?: number;
    tier?: string[];
    engagementLevel?: string;
    churnRisk?: string;
  };
  memberCount: number;
  averageValue: number;
  campaignPerformance: number;
  automatedActions: string[];
}

export interface LoyaltyCampaign {
  id: string;
  name: string;
  type: 'bonus_points' | 'tier_upgrade' | 'special_reward' | 'referral' | 'birthday';
  status: 'active' | 'scheduled' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
  targetSegment: string;
  participantsCount: number;
  engagementRate: number;
  conversionRate: number;
  totalRevenueGenerated: number;
  costPerAcquisition: number;
  roi: number;
  description: string;
  rules: {
    pointsMultiplier?: number;
    bonusPoints?: number;
    minimumSpend?: number;
    eligibleCategories?: string[];
  };
}

export interface LoyaltySearchFilters {
  memberTier: string[];
  pointsRange: {
    min: number;
    max: number;
  };
  engagementLevel: string[];
  churnRisk: string[];
  joinDateRange: {
    start: string;
    end: string;
  };
  lastActivityRange: {
    start: string;
    end: string;
  };
  spendRange: {
    min: number;
    max: number;
  };
  rewardTypes: string[];
  communicationPreference: string[];
}
