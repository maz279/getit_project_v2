
export interface FeaturedProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  vendor: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviews: number;
  stock: number;
  sold: number;
  isFeatured: boolean;
  featuredPosition: number;
  featuredStartDate: Date;
  featuredEndDate: Date;
  featuredType: 'homepage' | 'category' | 'search' | 'banner';
  clicks: number;
  impressions: number;
  conversionRate: number;
  revenue: number;
}

export interface FeaturedCampaign {
  id: string;
  name: string;
  type: 'seasonal' | 'flash-sale' | 'new-arrival' | 'best-seller' | 'clearance';
  status: 'active' | 'scheduled' | 'paused' | 'completed';
  startDate: Date;
  endDate: Date;
  productCount: number;
  totalViews: number;
  totalClicks: number;
  totalRevenue: number;
  conversionRate: number;
  priority: number;
  targetAudience: string[];
  description: string;
}

export interface FeaturedStats {
  totalFeatured: number;
  activeCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  avgConversionRate: number;
  totalRevenue: number;
  topPerformer: string;
  clickThroughRate: number;
}

export interface FeaturedAnalytics {
  performanceOverTime: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  topPerforming: Array<{
    productName: string;
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    clicks: number;
    revenue: number;
  }>;
  placementPerformance: Array<{
    placement: string;
    impressions: number;
    clicks: number;
    ctr: number;
    revenue: number;
  }>;
}

export interface FeaturedSettings {
  maxFeaturedProducts: number;
  autoRotation: boolean;
  rotationInterval: number; // in hours
  requireApproval: boolean;
  allowVendorNomination: boolean;
  defaultFeaturedDuration: number; // in days
  placementRules: {
    homepage: number;
    categoryPages: number;
    searchResults: number;
  };
  qualityThresholds: {
    minRating: number;
    minReviews: number;
    minStock: number;
  };
}
