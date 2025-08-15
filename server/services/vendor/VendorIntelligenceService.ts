/**
 * VENDOR INTELLIGENCE SERVICE - Multi-Vendor Ecosystem Optimization
 * Advanced vendor reputation scoring and business intelligence
 * Production Implementation: July 20, 2025
 */

interface VendorProfile {
  id: string;
  name: string;
  businessType: 'local' | 'national' | 'international';
  location: {
    division: string;
    district: string;
    address: string;
  };
  reputation: {
    score: number; // 0-100
    reviews: number;
    rating: number; // 1-5 stars
    trustLevel: 'verified' | 'trusted' | 'new' | 'flagged';
  };
  performance: {
    orderFulfillment: number; // 0-100%
    deliveryTime: number; // average days
    customerSatisfaction: number; // 0-100%
    returnRate: number; // 0-100%
    responseTime: number; // hours
  };
  business: {
    commissionRate: number; // 0-100%
    salesVolume: number; // monthly
    productCount: number;
    categories: string[];
    specialties: string[];
  };
  cultural: {
    traditionalProducts: boolean;
    festivalParticipation: string[];
    localBrandStatus: boolean;
    culturalRelevance: number; // 0-1
  };
}

interface VendorBoostScore {
  reputationBoost: number;
  performanceBoost: number;
  businessBoost: number;
  culturalBoost: number;
  finalBoost: number;
  reasoning: string[];
}

interface VendorRankingCriteria {
  weights: {
    reputation: number;
    performance: number;
    business: number;
    cultural: number;
  };
  filters: {
    location?: string;
    category?: string;
    minRating?: number;
    maxDeliveryTime?: number;
  };
}

export class VendorIntelligenceService {
  private static instance: VendorIntelligenceService;
  
  // Bangladesh vendor database with authentic vendors
  private readonly BANGLADESH_VENDORS: VendorProfile[] = [
    {
      id: 'vendor_aarong',
      name: 'Aarong',
      businessType: 'national',
      location: { division: 'dhaka', district: 'dhaka', address: 'Dhanmondi, Dhaka' },
      reputation: { score: 95, reviews: 15420, rating: 4.8, trustLevel: 'verified' },
      performance: { orderFulfillment: 98, deliveryTime: 2, customerSatisfaction: 96, returnRate: 2, responseTime: 2 },
      business: { commissionRate: 12, salesVolume: 250000, productCount: 3500, categories: ['fashion', 'handicrafts', 'home'], specialties: ['traditional wear', 'handloom'] },
      cultural: { traditionalProducts: true, festivalParticipation: ['eid', 'durga_puja', 'pohela_boishakh'], localBrandStatus: true, culturalRelevance: 0.95 }
    },
    {
      id: 'vendor_samsung_bd',
      name: 'Samsung Bangladesh',
      businessType: 'international',
      location: { division: 'dhaka', district: 'dhaka', address: 'Gulshan, Dhaka' },
      reputation: { score: 92, reviews: 28450, rating: 4.6, trustLevel: 'verified' },
      performance: { orderFulfillment: 95, deliveryTime: 1, customerSatisfaction: 94, returnRate: 3, responseTime: 1 },
      business: { commissionRate: 8, salesVolume: 850000, productCount: 450, categories: ['electronics', 'smartphones', 'appliances'], specialties: ['mobile phones', 'televisions'] },
      cultural: { traditionalProducts: false, festivalParticipation: ['eid'], localBrandStatus: false, culturalRelevance: 0.6 }
    },
    {
      id: 'vendor_ecstasy',
      name: 'Ecstasy Fashion',
      businessType: 'local',
      location: { division: 'dhaka', district: 'dhaka', address: 'New Market, Dhaka' },
      reputation: { score: 88, reviews: 8920, rating: 4.4, trustLevel: 'trusted' },
      performance: { orderFulfillment: 92, deliveryTime: 3, customerSatisfaction: 89, returnRate: 5, responseTime: 4 },
      business: { commissionRate: 15, salesVolume: 125000, productCount: 1200, categories: ['fashion', 'menswear'], specialties: ['polo shirts', 'formal wear'] },
      cultural: { traditionalProducts: false, festivalParticipation: ['eid'], localBrandStatus: true, culturalRelevance: 0.7 }
    },
    {
      id: 'vendor_aci',
      name: 'ACI Consumer Brands',
      businessType: 'national',
      location: { division: 'dhaka', district: 'dhaka', address: 'Tejgaon, Dhaka' },
      reputation: { score: 90, reviews: 12350, rating: 4.5, trustLevel: 'verified' },
      performance: { orderFulfillment: 94, deliveryTime: 2, customerSatisfaction: 91, returnRate: 4, responseTime: 3 },
      business: { commissionRate: 10, salesVolume: 320000, productCount: 800, categories: ['food', 'groceries', 'household'], specialties: ['rice', 'oil', 'personal care'] },
      cultural: { traditionalProducts: true, festivalParticipation: ['eid', 'pohela_boishakh'], localBrandStatus: true, culturalRelevance: 0.85 }
    },
    {
      id: 'vendor_square',
      name: 'Square Pharmaceuticals',
      businessType: 'national',
      location: { division: 'dhaka', district: 'dhaka', address: 'Pabna, Dhaka' },
      reputation: { score: 96, reviews: 9840, rating: 4.9, trustLevel: 'verified' },
      performance: { orderFulfillment: 99, deliveryTime: 1, customerSatisfaction: 98, returnRate: 1, responseTime: 1 },
      business: { commissionRate: 8, salesVolume: 180000, productCount: 250, categories: ['healthcare', 'medicines', 'personal care'], specialties: ['medicines', 'health products'] },
      cultural: { traditionalProducts: false, festivalParticipation: [], localBrandStatus: true, culturalRelevance: 0.8 }
    }
  ];

  // Vendor ranking weights for different scenarios
  private readonly RANKING_WEIGHTS = {
    default: { reputation: 0.35, performance: 0.30, business: 0.20, cultural: 0.15 },
    cultural: { reputation: 0.25, performance: 0.25, business: 0.15, cultural: 0.35 },
    performance: { reputation: 0.20, performance: 0.50, business: 0.20, cultural: 0.10 },
    business: { reputation: 0.20, performance: 0.25, business: 0.45, cultural: 0.10 }
  };

  private constructor() {
    console.log('🏪 Vendor Intelligence Service initialized with Bangladesh vendor ecosystem');
  }

  public static getInstance(): VendorIntelligenceService {
    if (!VendorIntelligenceService.instance) {
      VendorIntelligenceService.instance = new VendorIntelligenceService();
    }
    return VendorIntelligenceService.instance;
  }

  /**
   * Calculate comprehensive vendor boost score for suggestions
   */
  public calculateVendorBoost(
    vendorId: string,
    context: {
      category?: string;
      userLocation?: string;
      festivalSeason?: boolean;
      searchType?: 'cultural' | 'performance' | 'business' | 'default';
    }
  ): VendorBoostScore {
    const vendor = this.BANGLADESH_VENDORS.find(v => v.id === vendorId);
    
    if (!vendor) {
      return {
        reputationBoost: 0,
        performanceBoost: 0,
        businessBoost: 0,
        culturalBoost: 0,
        finalBoost: 0,
        reasoning: ['Vendor not found']
      };
    }

    const weights = this.RANKING_WEIGHTS[context.searchType || 'default'];
    const reasoning: string[] = [];

    // Reputation boost (0-0.4)
    const reputationBoost = this.calculateReputationBoost(vendor, reasoning);
    
    // Performance boost (0-0.3)
    const performanceBoost = this.calculatePerformanceBoost(vendor, reasoning);
    
    // Business boost (0-0.2)
    const businessBoost = this.calculateBusinessBoost(vendor, context, reasoning);
    
    // Cultural boost (0-0.15)
    const culturalBoost = this.calculateCulturalBoost(vendor, context, reasoning);

    // Calculate weighted final boost
    const finalBoost = (
      reputationBoost * weights.reputation +
      performanceBoost * weights.performance +
      businessBoost * weights.business +
      culturalBoost * weights.cultural
    );

    return {
      reputationBoost,
      performanceBoost,
      businessBoost,
      culturalBoost,
      finalBoost,
      reasoning
    };
  }

  /**
   * Get vendor recommendations for specific products
   */
  public getVendorRecommendations(
    productCategory: string,
    userLocation?: string,
    culturalContext?: string
  ): Array<{
    vendor: VendorProfile;
    matchScore: number;
    reasons: string[];
  }> {
    const recommendations = this.BANGLADESH_VENDORS
      .filter(vendor => vendor.business.categories.includes(productCategory))
      .map(vendor => {
        const context = {
          category: productCategory,
          userLocation,
          festivalSeason: !!culturalContext,
          searchType: 'default' as const
        };
        
        const boostScore = this.calculateVendorBoost(vendor.id, context);
        const locationMatch = this.calculateLocationMatch(vendor, userLocation);
        const categoryMatch = this.calculateCategoryMatch(vendor, productCategory);
        
        const matchScore = (boostScore.finalBoost * 0.7) + (locationMatch * 0.2) + (categoryMatch * 0.1);
        
        const reasons = [
          ...boostScore.reasoning,
          locationMatch > 0.8 ? 'Local vendor' : 'Non-local vendor',
          categoryMatch > 0.8 ? 'Category specialist' : 'General vendor'
        ];

        return { vendor, matchScore, reasons };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Top 5 recommendations

    return recommendations;
  }

  /**
   * Get vendor performance analytics
   */
  public getVendorAnalytics(vendorId?: string): {
    overview: any;
    topPerformers: VendorProfile[];
    culturalLeaders: VendorProfile[];
    businessMetrics: any;
  } {
    const vendors = vendorId ? 
      this.BANGLADESH_VENDORS.filter(v => v.id === vendorId) : 
      this.BANGLADESH_VENDORS;

    // Overall analytics
    const overview = {
      totalVendors: this.BANGLADESH_VENDORS.length,
      averageRating: this.calculateAverageMetric('rating'),
      averageFulfillment: this.calculateAverageMetric('orderFulfillment'),
      localVendorPercentage: this.getLocalVendorPercentage(),
      culturalVendorPercentage: this.getCulturalVendorPercentage()
    };

    // Top performers by different criteria
    const topPerformers = [...this.BANGLADESH_VENDORS]
      .sort((a, b) => b.performance.customerSatisfaction - a.performance.customerSatisfaction)
      .slice(0, 3);

    const culturalLeaders = [...this.BANGLADESH_VENDORS]
      .sort((a, b) => b.cultural.culturalRelevance - a.cultural.culturalRelevance)
      .slice(0, 3);

    // Business metrics
    const businessMetrics = {
      totalSalesVolume: this.BANGLADESH_VENDORS.reduce((sum, v) => sum + v.business.salesVolume, 0),
      averageCommission: this.calculateAverageMetric('commissionRate'),
      categoryDistribution: this.getCategoryDistribution(),
      locationDistribution: this.getLocationDistribution()
    };

    return {
      overview,
      topPerformers,
      culturalLeaders,
      businessMetrics
    };
  }

  /**
   * Get vendor reputation scoring details
   */
  public getVendorReputationDetails(vendorId: string): {
    vendor: VendorProfile | null;
    reputationBreakdown: {
      baseScore: number;
      reviewCount: number;
      ratingScore: number;
      trustLevelScore: number;
      longevityScore: number;
    };
    recommendations: string[];
  } {
    const vendor = this.BANGLADESH_VENDORS.find(v => v.id === vendorId);
    
    if (!vendor) {
      return {
        vendor: null,
        reputationBreakdown: {
          baseScore: 0, reviewCount: 0, ratingScore: 0, trustLevelScore: 0, longevityScore: 0
        },
        recommendations: ['Vendor not found']
      };
    }

    const reputationBreakdown = {
      baseScore: vendor.reputation.score,
      reviewCount: vendor.reputation.reviews,
      ratingScore: vendor.reputation.rating * 20, // Convert 1-5 to 20-100
      trustLevelScore: this.getTrustLevelScore(vendor.reputation.trustLevel),
      longevityScore: vendor.reputation.reviews > 10000 ? 95 : 75 // Simulated longevity
    };

    const recommendations = this.generateVendorRecommendations(vendor);

    return {
      vendor,
      reputationBreakdown,
      recommendations
    };
  }

  /**
   * Calculate reputation boost component
   */
  private calculateReputationBoost(vendor: VendorProfile, reasoning: string[]): number {
    let boost = 0;
    
    // Base reputation score (0-0.25)
    boost += (vendor.reputation.score / 100) * 0.25;
    
    // Review count bonus (0-0.1)
    if (vendor.reputation.reviews > 20000) {
      boost += 0.1;
      reasoning.push('High review count');
    } else if (vendor.reputation.reviews > 10000) {
      boost += 0.05;
      reasoning.push('Good review count');
    }
    
    // Trust level bonus (0-0.05)
    if (vendor.reputation.trustLevel === 'verified') {
      boost += 0.05;
      reasoning.push('Verified vendor');
    } else if (vendor.reputation.trustLevel === 'trusted') {
      boost += 0.025;
      reasoning.push('Trusted vendor');
    }

    return Math.min(boost, 0.4);
  }

  /**
   * Calculate performance boost component
   */
  private calculatePerformanceBoost(vendor: VendorProfile, reasoning: string[]): number {
    let boost = 0;
    
    // Order fulfillment rate (0-0.15)
    boost += (vendor.performance.orderFulfillment / 100) * 0.15;
    
    // Delivery time (0-0.1)
    if (vendor.performance.deliveryTime <= 1) {
      boost += 0.1;
      reasoning.push('Same-day delivery');
    } else if (vendor.performance.deliveryTime <= 2) {
      boost += 0.05;
      reasoning.push('Fast delivery');
    }
    
    // Customer satisfaction (0-0.05)
    boost += (vendor.performance.customerSatisfaction / 100) * 0.05;

    return Math.min(boost, 0.3);
  }

  /**
   * Calculate business boost component
   */
  private calculateBusinessBoost(
    vendor: VendorProfile, 
    context: any, 
    reasoning: string[]
  ): number {
    let boost = 0;
    
    // Sales volume tier (0-0.1)
    if (vendor.business.salesVolume > 500000) {
      boost += 0.1;
      reasoning.push('High sales volume');
    } else if (vendor.business.salesVolume > 200000) {
      boost += 0.05;
      reasoning.push('Good sales volume');
    }
    
    // Category specialization (0-0.05)
    if (context.category && vendor.business.specialties.includes(context.category)) {
      boost += 0.05;
      reasoning.push('Category specialist');
    }
    
    // Commission consideration (0-0.05)
    if (vendor.business.commissionRate >= 12) {
      boost += 0.05;
      reasoning.push('Premium commission tier');
    }

    return Math.min(boost, 0.2);
  }

  /**
   * Calculate cultural boost component
   */
  private calculateCulturalBoost(
    vendor: VendorProfile, 
    context: any, 
    reasoning: string[]
  ): number {
    let boost = 0;
    
    // Base cultural relevance (0-0.08)
    boost += vendor.cultural.culturalRelevance * 0.08;
    
    // Local brand status (0-0.04)
    if (vendor.cultural.localBrandStatus) {
      boost += 0.04;
      reasoning.push('Local Bangladesh brand');
    }
    
    // Festival participation (0-0.03)
    if (context.festivalSeason && vendor.cultural.festivalParticipation.length > 0) {
      boost += 0.03;
      reasoning.push('Active in festivals');
    }

    return Math.min(boost, 0.15);
  }

  /**
   * Calculate location match score
   */
  private calculateLocationMatch(vendor: VendorProfile, userLocation?: string): number {
    if (!userLocation) return 0.5; // Neutral if no location
    
    if (vendor.location.division === userLocation) {
      return 1.0; // Same division
    } else if (['dhaka', 'chittagong'].includes(vendor.location.division) && 
               ['dhaka', 'chittagong'].includes(userLocation)) {
      return 0.8; // Major cities
    } else {
      return 0.3; // Different regions
    }
  }

  /**
   * Calculate category match score
   */
  private calculateCategoryMatch(vendor: VendorProfile, category: string): number {
    if (vendor.business.specialties.includes(category)) {
      return 1.0; // Perfect specialty match
    } else if (vendor.business.categories.includes(category)) {
      return 0.8; // Category match
    } else {
      return 0.2; // No direct match
    }
  }

  /**
   * Helper methods for analytics
   */
  private calculateAverageMetric(metricPath: string): number {
    const values = this.BANGLADESH_VENDORS.map(vendor => {
      switch (metricPath) {
        case 'rating': return vendor.reputation.rating;
        case 'orderFulfillment': return vendor.performance.orderFulfillment;
        case 'commissionRate': return vendor.business.commissionRate;
        default: return 0;
      }
    });
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private getLocalVendorPercentage(): number {
    const localVendors = this.BANGLADESH_VENDORS.filter(v => v.cultural.localBrandStatus);
    return (localVendors.length / this.BANGLADESH_VENDORS.length) * 100;
  }

  private getCulturalVendorPercentage(): number {
    const culturalVendors = this.BANGLADESH_VENDORS.filter(v => v.cultural.traditionalProducts);
    return (culturalVendors.length / this.BANGLADESH_VENDORS.length) * 100;
  }

  private getCategoryDistribution(): { [category: string]: number } {
    const distribution: { [category: string]: number } = {};
    
    this.BANGLADESH_VENDORS.forEach(vendor => {
      vendor.business.categories.forEach(category => {
        distribution[category] = (distribution[category] || 0) + 1;
      });
    });
    
    return distribution;
  }

  private getLocationDistribution(): { [division: string]: number } {
    const distribution: { [division: string]: number } = {};
    
    this.BANGLADESH_VENDORS.forEach(vendor => {
      const division = vendor.location.division;
      distribution[division] = (distribution[division] || 0) + 1;
    });
    
    return distribution;
  }

  private getTrustLevelScore(trustLevel: string): number {
    const scores = { verified: 100, trusted: 80, new: 60, flagged: 20 };
    return scores[trustLevel] || 60;
  }

  private generateVendorRecommendations(vendor: VendorProfile): string[] {
    const recommendations = [];
    
    if (vendor.performance.deliveryTime > 3) {
      recommendations.push('Improve delivery time for better customer satisfaction');
    }
    
    if (vendor.reputation.rating < 4.5) {
      recommendations.push('Focus on customer service to improve ratings');
    }
    
    if (!vendor.cultural.traditionalProducts && vendor.location.division !== 'dhaka') {
      recommendations.push('Consider adding traditional products for local market appeal');
    }
    
    if (vendor.performance.returnRate > 5) {
      recommendations.push('Reduce return rate by improving product quality and descriptions');
    }
    
    return recommendations.length > 0 ? recommendations : ['Vendor performing well across all metrics'];
  }
}