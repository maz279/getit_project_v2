import { OrderReportsData } from './types';

export const mockOrderReportsData: OrderReportsData = {
  stats: {
    totalOrders: 12456,
    totalRevenue: 2834567,
    averageOrderValue: 227.45,
    conversionRate: 3.2,
    totalCustomers: 8932,
    returnRate: 4.7,
    fulfillmentTime: 2.3,
    customerSatisfaction: 4.6
  },
  salesReports: [
    {
      period: '2024-01',
      orders: 1234,
      revenue: 234567,
      growth: 12.5,
      averageOrderValue: 189.99,
      topProducts: ['iPhone 15', 'Samsung Galaxy S24', 'MacBook Pro'],
      topCategories: ['Electronics', 'Fashion', 'Home & Garden']
    },
    {
      period: '2024-02',
      orders: 1456,
      revenue: 267890,
      growth: 14.2,
      averageOrderValue: 184.12,
      topProducts: ['Samsung TV', 'Nike Air Max', 'Kitchen Appliances'],
      topCategories: ['Electronics', 'Sports', 'Home & Garden']
    }
  ],
  orderAnalytics: {
    ordersByStatus: [
      { status: 'completed', count: 8234, percentage: 66.1, trend: 'up' },
      { status: 'processing', count: 1567, percentage: 12.6, trend: 'stable' },
      { status: 'shipped', count: 1890, percentage: 15.2, trend: 'up' },
      { status: 'cancelled', count: 456, percentage: 3.7, trend: 'down' },
      { status: 'refunded', count: 309, percentage: 2.5, trend: 'stable' }
    ],
    ordersByTimeOfDay: [
      { hour: 9, orders: 234, revenue: 45678 },
      { hour: 14, orders: 456, revenue: 89012 },
      { hour: 20, orders: 678, revenue: 123456 }
    ],
    fulfillmentMetrics: {
      averageProcessingTime: 2.3,
      averageShippingTime: 3.7,
      onTimeDeliveryRate: 94.5,
      cancellationRate: 3.2
    }
  },
  customerInsights: {
    newVsReturning: {
      newCustomers: 5423,
      returningCustomers: 3509,
      repeatPurchaseRate: 39.3
    },
    customerSegments: [
      {
        segment: 'VIP',
        count: 234,
        revenue: 567890,
        averageOrderValue: 456.78,
        lifetime_value: 2345.67
      },
      {
        segment: 'Regular',
        count: 5678,
        revenue: 1234567,
        averageOrderValue: 234.56,
        lifetime_value: 678.90
      }
    ],
    customerBehavior: {
      averageSessionDuration: 8.5,
      averagePageViews: 12.3,
      cartAbandonmentRate: 68.7,
      averageTimeBetweenOrders: 45.2
    }
  },
  productPerformance: {
    topSellingProducts: [
      {
        id: 'prod-1',
        name: 'iPhone 15 Pro',
        category: 'Electronics',
        unitsSold: 1234,
        revenue: 1234567,
        growth: 15.6,
        stockLevel: 456,
        rating: 4.8
      },
      {
        id: 'prod-2',
        name: 'Samsung Galaxy S24',
        category: 'Electronics',
        unitsSold: 987,
        revenue: 987654,
        growth: 12.3,
        stockLevel: 234,
        rating: 4.6
      }
    ],
    categoryPerformance: [
      {
        category: 'Electronics',
        orders: 5678,
        revenue: 2345678,
        growth: 18.9,
        margin: 23.4
      },
      {
        category: 'Fashion',
        orders: 3456,
        revenue: 1234567,
        growth: 14.2,
        margin: 45.6
      }
    ],
    inventoryAnalysis: {
      totalProducts: 15678,
      outOfStock: 234,
      lowStock: 567,
      fastMovingItems: 890,
      slowMovingItems: 123
    }
  },
  geographicAnalysis: {
    regionalSales: [
      {
        region: 'Asia',
        country: 'Bangladesh',
        state: 'Dhaka',
        orders: 4567,
        revenue: 1234567,
        customers: 2345,
        growth: 23.4,
        averageOrderValue: 270.32
      },
      {
        region: 'Asia',
        country: 'Bangladesh',
        state: 'Chittagong',
        orders: 2345,
        revenue: 678901,
        customers: 1234,
        growth: 19.8,
        averageOrderValue: 289.45
      }
    ],
    shippingAnalysis: {
      domesticOrders: 11234,
      internationalOrders: 1222,
      averageShippingCost: 45.67,
      popularDestinations: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi']
    }
  },
  trendAnalysis: {
    salesTrends: [
      { date: '2024-01-01', orders: 234, revenue: 45678, customers: 123 },
      { date: '2024-01-02', orders: 345, revenue: 67890, customers: 145 },
      { date: '2024-01-03', orders: 456, revenue: 89012, customers: 167 }
    ],
    seasonalPatterns: [
      { month: 'January', orders: 8234, revenue: 1234567, growth: 12.3 },
      { month: 'February', orders: 9456, revenue: 1456789, growth: 14.8 },
      { month: 'March', orders: 10678, revenue: 1678901, growth: 12.9 }
    ],
    forecastData: [
      { period: '2024-Q2', predictedOrders: 15000, predictedRevenue: 3500000, confidence: 85.2 },
      { period: '2024-Q3', predictedOrders: 18000, predictedRevenue: 4200000, confidence: 78.9 },
      { period: '2024-Q4', predictedOrders: 22000, predictedRevenue: 5100000, confidence: 72.6 }
    ]
  }
};