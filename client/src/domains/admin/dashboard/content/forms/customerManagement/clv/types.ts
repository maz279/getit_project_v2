
export interface CLVCustomer {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  avatar?: string;
  registrationDate: string;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  currentCLV: number;
  predictedCLV: number;
  clvTrend: 'increasing' | 'stable' | 'decreasing';
  customerSegment: 'high_value' | 'medium_value' | 'low_value' | 'at_risk' | 'new_customer';
  churnProbability: number;
  monthsActive: number;
  loyaltyScore: number;
  preferredCategories: string[];
  lastEngagementDate: string;
  marketingChannelSource: string;
  retentionRate: number;
  crossSellPotential: number;
  upSellPotential: number;
}

export interface CLVMetrics {
  totalCustomers: number;
  averageCLV: number;
  totalCLV: number;
  highValueCustomers: number;
  atRiskCustomers: number;
  newCustomersCLV: number;
  customerGrowthRate: number;
  retentionRate: number;
  churnRate: number;
  averageCustomerLifespan: number;
}

export interface CLVTrendData {
  month: string;
  averageCLV: number;
  totalCLV: number;
  newCustomerCLV: number;
  retainedCustomerCLV: number;
}

export interface CLVSegmentData {
  segment: string;
  count: number;
  percentage: number;
  averageCLV: number;
  totalValue: number;
  color: string;
}

export interface CLVPrediction {
  customerId: string;
  currentCLV: number;
  predictedCLV3Months: number;
  predictedCLV6Months: number;
  predictedCLV12Months: number;
  confidenceScore: number;
  keyFactors: string[];
  recommendations: string[];
}

export interface CLVCampaign {
  id: string;
  name: string;
  type: 'retention' | 'winback' | 'upsell' | 'cross_sell' | 'loyalty';
  targetSegment: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'completed' | 'paused';
  targetedCustomers: number;
  expectedCLVIncrease: number;
  actualCLVIncrease: number;
  budget: number;
  roi: number;
  description: string;
}

export interface CLVAnalytics {
  clvByChannel: Array<{
    channel: string;
    averageCLV: number;
    customerCount: number;
    totalValue: number;
  }>;
  clvByCategory: Array<{
    category: string;
    averageCLV: number;
    contribution: number;
  }>;
  cohortAnalysis: Array<{
    cohort: string;
    month0: number;
    month1: number;
    month3: number;
    month6: number;
    month12: number;
  }>;
  seasonalTrends: Array<{
    month: string;
    clvGrowth: number;
    customerAcquisition: number;
  }>;
}

export interface CLVFilter {
  segmentType: string[];
  clvRange: {
    min: number;
    max: number;
  };
  churnRisk: string[];
  registrationDateRange: {
    start: string;
    end: string;
  };
  lastPurchaseRange: {
    start: string;
    end: string;
  };
  orderCountRange: {
    min: number;
    max: number;
  };
  categories: string[];
  marketingChannels: string[];
}
