
export interface OrderReportsStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  totalCustomers: number;
  returnRate: number;
  fulfillmentTime: number;
  customerSatisfaction: number;
}

export interface SalesReport {
  period: string;
  orders: number;
  revenue: number;
  growth: number;
  averageOrderValue: number;
  topProducts: string[];
  topCategories: string[];
}

export interface OrderAnalytics {
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  ordersByTimeOfDay: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
  fulfillmentMetrics: {
    averageProcessingTime: number;
    averageShippingTime: number;
    onTimeDeliveryRate: number;
    cancellationRate: number;
  };
}

export interface CustomerInsights {
  newVsReturning: {
    newCustomers: number;
    returningCustomers: number;
    repeatPurchaseRate: number;
  };
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
    averageOrderValue: number;
    lifetime_value: number;
  }>;
  customerBehavior: {
    averageSessionDuration: number;
    averagePageViews: number;
    cartAbandonmentRate: number;
    averageTimeBetweenOrders: number;
  };
}

export interface ProductPerformance {
  topSellingProducts: Array<{
    id: string;
    name: string;
    category: string;
    unitsSold: number;
    revenue: number;
    growth: number;
    stockLevel: number;
    rating: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    orders: number;
    revenue: number;
    growth: number;
    margin: number;
  }>;
  inventoryAnalysis: {
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
    fastMovingItems: number;
    slowMovingItems: number;
  };
}

export interface GeographicAnalysis {
  regionalSales: Array<{
    region: string;
    country: string;
    state: string;
    orders: number;
    revenue: number;
    customers: number;
    growth: number;
    averageOrderValue: number;
  }>;
  shippingAnalysis: {
    domesticOrders: number;
    internationalOrders: number;
    averageShippingCost: number;
    popularDestinations: string[];
  };
}

export interface TrendAnalysis {
  salesTrends: Array<{
    date: string;
    orders: number;
    revenue: number;
    customers: number;
  }>;
  seasonalPatterns: Array<{
    month: string;
    orders: number;
    revenue: number;
    growth: number;
  }>;
  forecastData: Array<{
    period: string;
    predictedOrders: number;
    predictedRevenue: number;
    confidence: number;
  }>;
}

export interface OrderReportsData {
  stats: OrderReportsStats;
  salesReports: SalesReport[];
  orderAnalytics: OrderAnalytics;
  customerInsights: CustomerInsights;
  productPerformance: ProductPerformance;
  geographicAnalysis: GeographicAnalysis;
  trendAnalysis: TrendAnalysis;
}
