
export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number;
  monthlyGrowth: number;
  avgOrderValue: number;
  conversionRate: number;
  customerLifetimeValue: number;
  returnOnInvestment: number;
}

export interface RevenueByChannel {
  channel: string;
  revenue: number;
  orders: number;
  growthRate: number;
  marketShare: number;
  avgOrderValue: number;
}

export interface RevenueByCategory {
  category: string;
  revenue: number;
  orders: number;
  growthRate: number;
  profitMargin: number;
  topProducts: string[];
}

export interface RevenueByRegion {
  region: string;
  country: string;
  revenue: number;
  orders: number;
  customers: number;
  growthRate: number;
  avgOrderValue: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  conversionRate: number;
}

export interface RevenueForecasting {
  period: string;
  predictedRevenue: number;
  predictedOrders: number;
  confidence: number;
  factors: string[];
}

export interface RevenueAnalyticsData {
  metrics: RevenueMetrics;
  channelData: RevenueByChannel[];
  categoryData: RevenueByCategory[];
  regionData: RevenueByRegion[];
  trendData: RevenueTrend[];
  forecastingData: RevenueForecasting[];
}
