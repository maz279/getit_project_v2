
export interface PricingRecommendation {
  productId: string;
  currentPrice: number;
  recommendedPrice: number;
  priceChange: number;
  priceChangePercent: number;
  reasoning: string[];
  confidence: number;
  expectedImpact: {
    demandChange: number;
    revenueChange: number;
    competitivePosition: string;
  };
}

export class PricingOptimizer {
  private static instance: PricingOptimizer;
  private priceHistory: Map<string, any[]> = new Map();
  private competitorPrices: Map<string, any> = new Map();
  private demandElasticity: Map<string, number> = new Map();

  public static getInstance(): PricingOptimizer {
    if (!PricingOptimizer.instance) {
      PricingOptimizer.instance = new PricingOptimizer();
    }
    return PricingOptimizer.instance;
  }

  async initialize(): Promise<void> {
    console.log('💰 Initializing Pricing Optimizer...');
    await this.loadMarketData();
  }

  async optimizePrice(productId: string, context: {
    currentInventory?: number;
    competitorPrices?: number[];
    targetMargin?: number;
    demandForecast?: number;
  } = {}): Promise<PricingRecommendation> {
    console.log(`💰 Optimizing price for product: ${productId}`);

    const currentPrice = await this.getCurrentPrice(productId);
    const marketAnalysis = await this.analyzeMarketConditions(productId, context);
    const demandAnalysis = await this.analyzeDemandElasticity(productId);
    const inventoryPressure = this.calculateInventoryPressure(context.currentInventory);
    
    let recommendedPrice = currentPrice;
    const reasoning: string[] = [];

    // Market-based adjustments
    if (marketAnalysis.competitivePosition === 'above_market') {
      recommendedPrice *= 0.95;
      reasoning.push('Price above market average - suggesting decrease');
    } else if (marketAnalysis.competitivePosition === 'below_market') {
      recommendedPrice *= 1.05;
      reasoning.push('Price below market average - opportunity to increase');
    }

    // Demand-based adjustments
    if (demandAnalysis.elasticity < 0.5) {
      recommendedPrice *= 1.1; // Inelastic demand - can increase price
      reasoning.push('Low price sensitivity detected - increasing price');
    } else if (demandAnalysis.elasticity > 1.5) {
      recommendedPrice *= 0.95; // Elastic demand - decrease price to boost volume
      reasoning.push('High price sensitivity - decreasing price to boost sales');
    }

    // Inventory-based adjustments
    if (inventoryPressure.level === 'high') {
      recommendedPrice *= 0.9; // Clear excess inventory
      reasoning.push('High inventory levels - promoting price reduction');
    } else if (inventoryPressure.level === 'low') {
      recommendedPrice *= 1.05; // Scarcity pricing
      reasoning.push('Low inventory levels - premium pricing');
    }

    // Seasonal adjustments
    const seasonalFactor = this.getSeasonalPricingFactor(productId);
    recommendedPrice *= seasonalFactor.multiplier;
    if (seasonalFactor.multiplier !== 1) {
      reasoning.push(`Seasonal adjustment: ${seasonalFactor.reason}`);
    }

    // Target margin consideration
    if (context.targetMargin) {
      const marginAdjustment = this.calculateMarginBasedPrice(productId, context.targetMargin);
      if (marginAdjustment.needsAdjustment) {
        recommendedPrice = marginAdjustment.recommendedPrice;
        reasoning.push(`Adjusted for target margin of ${context.targetMargin}%`);
      }
    }

    const priceChange = recommendedPrice - currentPrice;
    const priceChangePercent = (priceChange / currentPrice) * 100;

    // Calculate expected impact
    const expectedImpact = this.calculateExpectedImpact(
      currentPrice, 
      recommendedPrice, 
      demandAnalysis.elasticity
    );

    return {
      productId,
      currentPrice,
      recommendedPrice: Math.round(recommendedPrice),
      priceChange,
      priceChangePercent,
      reasoning,
      confidence: this.calculateConfidence(marketAnalysis, demandAnalysis),
      expectedImpact
    };
  }

  async getPersonalizedPricing(userId: string, productIds: string[]): Promise<{
    userId: string;
    personalizedPrices: Array<{
      productId: string;
      basePrice: number;
      personalizedPrice: number;
      discountReason?: string;
      discountPercent?: number;
    }>;
  }> {
    console.log(`🎯 Generating personalized pricing for user: ${userId}`);

    const userProfile = await this.getUserPricingProfile(userId);
    
    const personalizedPrices = await Promise.all(
      productIds.map(async (productId) => {
        const basePrice = await this.getCurrentPrice(productId);
        const personalizedPrice = this.calculatePersonalizedPrice(basePrice, userProfile, productId);
        
        const discount = basePrice - personalizedPrice;
        const discountPercent = discount > 0 ? (discount / basePrice) * 100 : 0;

        return {
          productId,
          basePrice,
          personalizedPrice,
          discountReason: discount > 0 ? this.getDiscountReason(userProfile) : undefined,
          discountPercent: discountPercent > 0 ? discountPercent : undefined
        };
      })
    );

    return {
      userId,
      personalizedPrices
    };
  }

  async analyzePriceElasticity(productId: string): Promise<{
    elasticity: number;
    pricePoints: Array<{ price: number; expectedDemand: number }>;
    optimalPricePoint: { price: number; revenue: number };
  }> {
    const currentPrice = await this.getCurrentPrice(productId);
    const elasticity = this.demandElasticity.get(productId) || 1.0;
    
    // Generate price points for analysis
    const pricePoints = [];
    for (let priceMultiplier = 0.7; priceMultiplier <= 1.3; priceMultiplier += 0.1) {
      const price = currentPrice * priceMultiplier;
      const expectedDemand = this.calculateDemandAtPrice(productId, price, elasticity);
      pricePoints.push({ price: Math.round(price), expectedDemand });
    }

    // Find optimal price point (maximum revenue)
    const optimalPricePoint = pricePoints.reduce((best, current) => {
      const currentRevenue = current.price * current.expectedDemand;
      const bestRevenue = best.price * best.expectedDemand;
      return currentRevenue > bestRevenue ? current : best;
    });

    return {
      elasticity,
      pricePoints,
      optimalPricePoint: {
        price: optimalPricePoint.price,
        revenue: optimalPricePoint.price * optimalPricePoint.expectedDemand
      }
    };
  }

  private async getCurrentPrice(productId: string): Promise<number> {
    // Mock current price - would fetch from database
    return Math.floor(Math.random() * 50000) + 10000; // 10k-60k range
  }

  private async analyzeMarketConditions(productId: string, context: any): Promise<{
    averageMarketPrice: number;
    competitivePosition: 'below_market' | 'at_market' | 'above_market';
    marketTrend: 'increasing' | 'decreasing' | 'stable';
  }> {
    const currentPrice = await this.getCurrentPrice(productId);
    const competitorPrices = context.competitorPrices || this.getCompetitorPrices(productId);
    
    const averageMarketPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
    
    let competitivePosition: 'below_market' | 'at_market' | 'above_market';
    if (currentPrice < averageMarketPrice * 0.95) {
      competitivePosition = 'below_market';
    } else if (currentPrice > averageMarketPrice * 1.05) {
      competitivePosition = 'above_market';
    } else {
      competitivePosition = 'at_market';
    }

    return {
      averageMarketPrice,
      competitivePosition,
      marketTrend: 'stable' // Simplified
    };
  }

  private async analyzeDemandElasticity(productId: string): Promise<{
    elasticity: number;
    confidence: number;
  }> {
    const elasticity = this.demandElasticity.get(productId) || 1.0;
    return {
      elasticity,
      confidence: 0.75
    };
  }

  private calculateInventoryPressure(currentInventory?: number): {
    level: 'low' | 'normal' | 'high';
    daysOfSupply: number;
  } {
    if (!currentInventory) {
      return { level: 'normal', daysOfSupply: 30 };
    }

    const dailySales = 5; // Mock daily sales rate
    const daysOfSupply = currentInventory / dailySales;

    let level: 'low' | 'normal' | 'high';
    if (daysOfSupply < 15) level = 'low';
    else if (daysOfSupply > 60) level = 'high';
    else level = 'normal';

    return { level, daysOfSupply };
  }

  private getSeasonalPricingFactor(productId: string): {
    multiplier: number;
    reason: string;
  } {
    const currentMonth = new Date().getMonth();
    
    // Festival season pricing
    if ([9, 10, 11].includes(currentMonth)) {
      return { multiplier: 1.1, reason: 'Festival season premium' };
    }
    
    // End of year clearance
    if (currentMonth === 11) {
      return { multiplier: 0.9, reason: 'Year-end clearance' };
    }
    
    return { multiplier: 1.0, reason: 'No seasonal adjustment' };
  }

  private calculateMarginBasedPrice(productId: string, targetMargin: number): {
    needsAdjustment: boolean;
    recommendedPrice: number;
  } {
    const cost = Math.random() * 20000 + 5000; // Mock cost
    const recommendedPrice = cost / (1 - targetMargin / 100);
    
    return {
      needsAdjustment: true,
      recommendedPrice
    };
  }

  private calculateExpectedImpact(currentPrice: number, newPrice: number, elasticity: number): {
    demandChange: number;
    revenueChange: number;
    competitivePosition: string;
  } {
    const priceChange = (newPrice - currentPrice) / currentPrice;
    const demandChange = -elasticity * priceChange; // Negative because of inverse relationship
    const revenueChange = (1 + priceChange) * (1 + demandChange) - 1;

    return {
      demandChange,
      revenueChange,
      competitivePosition: newPrice > currentPrice ? 'premium' : 'competitive'
    };
  }

  private calculateConfidence(marketAnalysis: any, demandAnalysis: any): number {
    return Math.min(0.95, Math.max(0.3, 
      0.6 + 
      (demandAnalysis.confidence * 0.2) + 
      (marketAnalysis.competitivePosition === 'at_market' ? 0.15 : 0)
    ));
  }

  private async getUserPricingProfile(userId: string): Promise<{
    segment: string;
    pricesensitivity: number;
    loyaltyLevel: string;
    spendingPower: 'low' | 'medium' | 'high';
  }> {
    // Mock user pricing profile
    return {
      segment: 'premium_customer',
      pricesensitivity: Math.random(),
      loyaltyLevel: 'gold',
      spendingPower: 'high'
    };
  }

  private calculatePersonalizedPrice(basePrice: number, userProfile: any, productId: string): number {
    let personalizedPrice = basePrice;

    // Loyalty discounts
    if (userProfile.loyaltyLevel === 'gold') {
      personalizedPrice *= 0.95;
    } else if (userProfile.loyaltyLevel === 'silver') {
      personalizedPrice *= 0.97;
    }

    // Segment-based pricing
    if (userProfile.segment === 'price_sensitive') {
      personalizedPrice *= 0.92;
    } else if (userProfile.segment === 'premium_customer') {
      personalizedPrice *= 1.02; // Slight premium for premium customers
    }

    return Math.round(personalizedPrice);
  }

  private getDiscountReason(userProfile: any): string {
    if (userProfile.loyaltyLevel === 'gold') return 'Gold member discount';
    if (userProfile.loyaltyLevel === 'silver') return 'Silver member discount';
    if (userProfile.segment === 'price_sensitive') return 'Special offer for you';
    return 'Personalized discount';
  }

  private getCompetitorPrices(productId: string): number[] {
    // Mock competitor prices
    const basePrice = Math.random() * 50000 + 10000;
    return [
      basePrice * 0.95,
      basePrice * 1.05,
      basePrice * 0.98,
      basePrice * 1.02
    ];
  }

  private calculateDemandAtPrice(productId: string, price: number, elasticity: number): number {
    const basePrice = 25000; // Mock base price
    const baseDemand = 100; // Mock base demand
    
    const priceRatio = price / basePrice;
    const demand = baseDemand * Math.pow(priceRatio, -elasticity);
    
    return Math.max(0, Math.round(demand));
  }

  private async loadMarketData(): Promise<void> {
    // Load competitor pricing data and demand elasticity data
    console.log('📊 Loading market data and pricing models...');
  }
}

export const pricingOptimizer = PricingOptimizer.getInstance();
