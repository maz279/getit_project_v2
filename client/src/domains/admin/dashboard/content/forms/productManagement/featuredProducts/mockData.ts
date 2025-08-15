/**
 * Mock Data for Featured Products Management
 * Amazon.com/Shopee.sg-Level Featured Products System
 */

import { 
  FeaturedProduct, 
  FeaturedCampaign, 
  FeaturedStats, 
  FeaturedAnalytics, 
  FeaturedSettings 
} from './types';

export const mockFeaturedProductsData = {
  // Featured Products
  featuredProducts: [
    {
      id: 'FEAT-001',
      name: 'Samsung Galaxy S24 Ultra',
      sku: 'SAMSUNG-S24-ULTRA-256',
      category: 'Electronics > Smartphones',
      vendor: 'TechStore BD',
      price: 125000,
      originalPrice: 140000,
      images: ['/api/placeholder/300/300'],
      rating: 4.8,
      reviews: 1247,
      stock: 45,
      sold: 892,
      isFeatured: true,
      featuredPosition: 1,
      featuredStartDate: new Date('2025-07-10'),
      featuredEndDate: new Date('2025-07-25'),
      featuredType: 'homepage' as const,
      clicks: 5420,
      impressions: 45230,
      conversionRate: 12.8,
      revenue: 2450000
    },
    {
      id: 'FEAT-002',
      name: 'iPhone 15 Pro Max',
      sku: 'APPLE-IP15-PRO-MAX-256',
      category: 'Electronics > Smartphones',
      vendor: 'Apple Store BD',
      price: 155000,
      originalPrice: 165000,
      images: ['/api/placeholder/300/300'],
      rating: 4.9,
      reviews: 892,
      stock: 23,
      sold: 567,
      isFeatured: true,
      featuredPosition: 2,
      featuredStartDate: new Date('2025-07-12'),
      featuredEndDate: new Date('2025-07-27'),
      featuredType: 'homepage' as const,
      clicks: 4892,
      impressions: 38750,
      conversionRate: 11.4,
      revenue: 1890000
    },
    {
      id: 'FEAT-003',
      name: 'Nike Air Max Running Shoes',
      sku: 'NIKE-AM-90-BLK-42',
      category: 'Sports > Footwear > Running',
      vendor: 'Sports Arena BD',
      price: 12500,
      originalPrice: 14500,
      images: ['/api/placeholder/300/300'],
      rating: 4.6,
      reviews: 234,
      stock: 78,
      sold: 123,
      isFeatured: true,
      featuredPosition: 3,
      featuredStartDate: new Date('2025-07-08'),
      featuredEndDate: new Date('2025-07-23'),
      featuredType: 'category' as const,
      clicks: 2340,
      impressions: 18900,
      conversionRate: 8.9,
      revenue: 456000
    },
    {
      id: 'FEAT-004',
      name: 'Sony WH-1000XM5 Headphones',
      sku: 'SONY-WH1000XM5-BLK',
      category: 'Electronics > Audio',
      vendor: 'Audio World BD',
      price: 28500,
      originalPrice: 32000,
      images: ['/api/placeholder/300/300'],
      rating: 4.7,
      reviews: 456,
      stock: 34,
      sold: 89,
      isFeatured: true,
      featuredPosition: 4,
      featuredStartDate: new Date('2025-07-14'),
      featuredEndDate: new Date('2025-07-29'),
      featuredType: 'search' as const,
      clicks: 1890,
      impressions: 12340,
      conversionRate: 7.3,
      revenue: 234000
    },
    {
      id: 'FEAT-005',
      name: 'Adidas Ultraboost 22',
      sku: 'ADIDAS-UB22-WHT-41',
      category: 'Sports > Footwear > Running',
      vendor: 'Sports Central BD',
      price: 16800,
      originalPrice: 19500,
      images: ['/api/placeholder/300/300'],
      rating: 4.5,
      reviews: 178,
      stock: 56,
      sold: 67,
      isFeatured: false,
      featuredPosition: 0,
      featuredStartDate: new Date('2025-07-01'),
      featuredEndDate: new Date('2025-07-16'),
      featuredType: 'banner' as const,
      clicks: 1234,
      impressions: 8900,
      conversionRate: 5.8,
      revenue: 145000
    }
  ] as FeaturedProduct[],

  // Featured Campaigns
  campaigns: [
    {
      id: 'CAMP-001',
      name: 'Summer Electronics Sale',
      type: 'seasonal' as const,
      status: 'active' as const,
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-07-31'),
      productCount: 45,
      totalViews: 234000,
      totalClicks: 18900,
      totalRevenue: 4500000,
      conversionRate: 8.9,
      priority: 1,
      targetAudience: ['tech-enthusiasts', 'young-professionals'],
      description: 'Exclusive summer discounts on premium electronics'
    },
    {
      id: 'CAMP-002',
      name: 'Flash Sale Friday',
      type: 'flash-sale' as const,
      status: 'scheduled' as const,
      startDate: new Date('2025-07-19'),
      endDate: new Date('2025-07-19'),
      productCount: 12,
      totalViews: 45000,
      totalClicks: 8900,
      totalRevenue: 890000,
      conversionRate: 12.4,
      priority: 2,
      targetAudience: ['bargain-hunters', 'mobile-users'],
      description: 'Limited time flash sale on selected items'
    },
    {
      id: 'CAMP-003',
      name: 'New Arrivals Showcase',
      type: 'new-arrival' as const,
      status: 'active' as const,
      startDate: new Date('2025-07-10'),
      endDate: new Date('2025-07-25'),
      productCount: 28,
      totalViews: 67000,
      totalClicks: 5600,
      totalRevenue: 1200000,
      conversionRate: 6.8,
      priority: 3,
      targetAudience: ['trend-followers', 'early-adopters'],
      description: 'Latest products from top brands'
    }
  ] as FeaturedCampaign[],

  // Statistics
  stats: {
    totalFeatured: 34,
    activeCampaigns: 8,
    totalImpressions: 234567,
    totalClicks: 18945,
    avgConversionRate: 9.2,
    totalRevenue: 5678000,
    topPerformer: 'Samsung Galaxy S24 Ultra',
    clickThroughRate: 8.1
  } as FeaturedStats,

  // Analytics
  analytics: {
    performanceOverTime: [
      {
        date: '2025-07-01',
        impressions: 15000,
        clicks: 1200,
        conversions: 108,
        revenue: 245000
      },
      {
        date: '2025-07-02',
        impressions: 18000,
        clicks: 1440,
        conversions: 130,
        revenue: 290000
      },
      {
        date: '2025-07-03',
        impressions: 22000,
        clicks: 1760,
        conversions: 158,
        revenue: 356000
      },
      {
        date: '2025-07-04',
        impressions: 19000,
        clicks: 1520,
        conversions: 137,
        revenue: 312000
      },
      {
        date: '2025-07-05',
        impressions: 25000,
        clicks: 2000,
        conversions: 180,
        revenue: 410000
      }
    ],
    topPerforming: [
      {
        productName: 'Samsung Galaxy S24 Ultra',
        clicks: 5420,
        conversions: 694,
        revenue: 2450000,
        conversionRate: 12.8
      },
      {
        productName: 'iPhone 15 Pro Max',
        clicks: 4892,
        conversions: 558,
        revenue: 1890000,
        conversionRate: 11.4
      },
      {
        productName: 'Nike Air Max Running Shoes',
        clicks: 2340,
        conversions: 208,
        revenue: 456000,
        conversionRate: 8.9
      }
    ],
    categoryBreakdown: [
      {
        category: 'Electronics',
        count: 18,
        clicks: 12450,
        revenue: 3890000
      },
      {
        category: 'Sports',
        count: 8,
        clicks: 4560,
        revenue: 890000
      },
      {
        category: 'Fashion',
        count: 6,
        clicks: 2890,
        revenue: 567000
      },
      {
        category: 'Home & Garden',
        count: 2,
        clicks: 1200,
        revenue: 234000
      }
    ],
    placementPerformance: [
      {
        placement: 'Homepage Hero',
        impressions: 89000,
        clicks: 7120,
        ctr: 8.0,
        revenue: 1890000
      },
      {
        placement: 'Category Pages',
        impressions: 67000,
        clicks: 5360,
        ctr: 8.0,
        revenue: 1234000
      },
      {
        placement: 'Search Results',
        impressions: 45000,
        clicks: 3600,
        ctr: 8.0,
        revenue: 890000
      },
      {
        placement: 'Product Pages',
        impressions: 34000,
        clicks: 2720,
        ctr: 8.0,
        revenue: 567000
      }
    ]
  } as FeaturedAnalytics,

  // Settings
  settings: {
    maxFeaturedProducts: 50,
    autoRotation: true,
    rotationInterval: 24, // hours
    requireApproval: true,
    allowVendorNomination: true,
    defaultFeaturedDuration: 14, // days
    placementRules: {
      homepage: 8,
      categoryPages: 12,
      searchResults: 6
    },
    qualityThresholds: {
      minRating: 4.0,
      minReviews: 10,
      minStock: 5
    }
  } as FeaturedSettings
};