/**
 * Mock Vendor Service
 * Temporary solution to provide Amazon.com/Shopee.sg-level demo data
 * for vendor dashboard until API routing is resolved
 */

export class MockVendorService {
  // Mock delay to simulate API calls
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Get executive dashboard
   */
  async getExecutiveDashboard(vendorId: string, period = '30d') {
    await this.delay(100);
    return {
      overview: {
        totalRevenue: 125000,
        monthlyRevenue: 45000,
        revenueGrowth: 18.5,
        totalOrders: 1250,
        orderGrowth: 12.3,
        customerCount: 890,
        customerGrowth: 8.7,
        conversionRate: 4.2,
        conversionGrowth: 2.1
      },
      salesTrends: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
        customers: Math.floor(Math.random() * 30) + 5
      })),
      topProducts: [
        { id: 'p1', name: 'Premium Wireless Headphones', sales: 15000, orders: 125, growth: 25.3 },
        { id: 'p2', name: 'Smart Home Security Camera', sales: 12000, orders: 98, growth: 18.7 },
        { id: 'p3', name: 'Ergonomic Office Chair', sales: 8500, orders: 42, growth: 15.2 },
        { id: 'p4', name: 'Bluetooth Speaker Set', sales: 6200, orders: 78, growth: 12.1 },
        { id: 'p5', name: 'Gaming Mechanical Keyboard', sales: 4800, orders: 65, growth: 9.8 }
      ],
      performanceMetrics: {
        averageOrderValue: 145.50,
        orderFulfillmentRate: 96.5,
        customerSatisfactionScore: 4.6,
        returnRate: 2.3,
        responseTime: 0.8
      }
    };
  }

  /**
   * Get product dashboard
   */
  async getProductDashboard(vendorId: string, period = '30d') {
    await this.delay(120);
    return {
      summary: {
        totalProducts: 245,
        activeProducts: 198,
        draftProducts: 12,
        outOfStock: 8,
        lowStock: 15,
        topPerforming: 25
      },
      recentProducts: [
        { id: 'p1', name: 'Premium Wireless Headphones', status: 'active', stock: 45, sales: 125, rating: 4.8 },
        { id: 'p2', name: 'Smart Home Security Camera', status: 'active', stock: 23, sales: 98, rating: 4.6 },
        { id: 'p3', name: 'Ergonomic Office Chair', status: 'low_stock', stock: 3, sales: 42, rating: 4.7 },
        { id: 'p4', name: 'Bluetooth Speaker Set', status: 'active', stock: 67, sales: 78, rating: 4.5 },
        { id: 'p5', name: 'Gaming Mechanical Keyboard', status: 'active', stock: 34, sales: 65, rating: 4.9 }
      ],
      categories: [
        { name: 'Electronics', products: 78, sales: 45000, growth: 15.2 },
        { name: 'Home & Garden', products: 45, sales: 28000, growth: 12.8 },
        { name: 'Sports & Outdoors', products: 34, sales: 22000, growth: 8.9 },
        { name: 'Fashion', products: 56, sales: 18000, growth: 6.7 },
        { name: 'Books & Media', products: 32, sales: 12000, growth: 4.3 }
      ]
    };
  }

  /**
   * Get sales analytics
   */
  async getSalesAnalytics(vendorId: string, period = '30d', granularity = 'daily') {
    await this.delay(90);
    return {
      totalSales: 125000,
      totalOrders: 1250,
      averageOrderValue: 100,
      salesGrowth: 18.5,
      orderGrowth: 12.3,
      salesByDay: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10
      })),
      topSalesHours: [
        { hour: '14:00', sales: 8500, orders: 85 },
        { hour: '20:00', sales: 7200, orders: 72 },
        { hour: '11:00', sales: 6800, orders: 68 },
        { hour: '16:00', sales: 6400, orders: 64 },
        { hour: '19:00', sales: 5900, orders: 59 }
      ]
    };
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(vendorId: string, period = '30d') {
    await this.delay(110);
    return {
      totalCustomers: 890,
      newCustomers: 125,
      returningCustomers: 765,
      customerGrowth: 8.7,
      averageLifetimeValue: 285.50,
      customerSegments: [
        { segment: 'VIP Customers', count: 45, percentage: 5.1, avgOrderValue: 450 },
        { segment: 'Regular Customers', count: 234, percentage: 26.3, avgOrderValue: 180 },
        { segment: 'Occasional Buyers', count: 456, percentage: 51.2, avgOrderValue: 95 },
        { segment: 'New Customers', count: 155, percentage: 17.4, avgOrderValue: 75 }
      ],
      topCustomerLocations: [
        { city: 'Dhaka', customers: 345, percentage: 38.8 },
        { city: 'Chittagong', customers: 156, percentage: 17.5 },
        { city: 'Sylhet', customers: 89, percentage: 10.0 },
        { city: 'Khulna', customers: 67, percentage: 7.5 },
        { city: 'Rajshahi', customers: 45, percentage: 5.1 }
      ]
    };
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(vendorId: string, limit = 10) {
    await this.delay(80);
    return {
      orders: [
        { id: 'ORD-001', customer: 'আহমেদ হাসান', total: 2450, status: 'processing', date: '2025-07-11' },
        { id: 'ORD-002', customer: 'ফাতেমা খাতুন', total: 1850, status: 'shipped', date: '2025-07-11' },
        { id: 'ORD-003', customer: 'মোহাম্মদ রহিম', total: 3200, status: 'delivered', date: '2025-07-10' },
        { id: 'ORD-004', customer: 'সালমা বেগম', total: 1650, status: 'processing', date: '2025-07-10' },
        { id: 'ORD-005', customer: 'করিম উদ্দিন', total: 2100, status: 'pending', date: '2025-07-10' }
      ],
      totalOrders: 1250,
      pendingOrders: 45,
      processingOrders: 78,
      shippedOrders: 156,
      deliveredOrders: 971
    };
  }

  /**
   * Get marketing dashboard
   */
  async getMarketingDashboard(vendorId: string, period = '30d') {
    await this.delay(95);
    return {
      activeCampaigns: 12,
      totalROAS: 3.8,
      totalSpend: 15000,
      totalRevenue: 57000,
      impressions: 125000,
      clicks: 5200,
      conversions: 218,
      campaigns: [
        { id: 'camp-1', name: 'Electronics Flash Sale', status: 'active', budget: 5000, roas: 4.2, conversions: 85 },
        { id: 'camp-2', name: 'Home Appliances Promotion', status: 'active', budget: 3500, roas: 3.8, conversions: 62 },
        { id: 'camp-3', name: 'Fashion Week Special', status: 'paused', budget: 2000, roas: 2.9, conversions: 41 },
        { id: 'camp-4', name: 'Back to School Campaign', status: 'active', budget: 4500, roas: 4.5, conversions: 95 }
      ]
    };
  }

  /**
   * Get inventory dashboard
   */
  async getInventoryDashboard(vendorId: string) {
    await this.delay(75);
    return {
      summary: {
        totalProducts: 245,
        totalStock: 8950,
        lowStockAlerts: 15,
        outOfStockItems: 8,
        overStockItems: 12,
        totalValue: 445000
      },
      lowStockProducts: [
        { id: 'p1', name: 'Ergonomic Office Chair', currentStock: 3, reorderLevel: 10, unitCost: 150 },
        { id: 'p2', name: 'Premium Coffee Maker', currentStock: 5, reorderLevel: 15, unitCost: 89 },
        { id: 'p3', name: 'Smart Watch Series 5', currentStock: 2, reorderLevel: 8, unitCost: 199 }
      ],
      topMovingProducts: [
        { id: 'p1', name: 'Wireless Headphones', dailySales: 8, stock: 45, velocity: 0.18 },
        { id: 'p2', name: 'Bluetooth Speaker', dailySales: 6, stock: 67, velocity: 0.09 },
        { id: 'p3', name: 'Gaming Keyboard', dailySales: 4, stock: 34, velocity: 0.12 }
      ]
    };
  }

  /**
   * Get financial analytics
   */
  async getFinancialAnalytics(vendorId: string, period = '30d') {
    await this.delay(105);
    return {
      revenue: {
        total: 125000,
        growth: 18.5,
        forecast: 145000
      },
      expenses: {
        total: 45000,
        breakdown: {
          shipping: 15000,
          marketing: 12000,
          operations: 8000,
          fees: 6000,
          other: 4000
        }
      },
      profit: {
        total: 80000,
        margin: 64.0,
        growth: 22.3
      },
      payouts: {
        pending: 25000,
        processed: 100000,
        nextPayout: '2025-07-15'
      }
    };
  }
}

// Create and export a singleton instance
export const mockVendorService = new MockVendorService();