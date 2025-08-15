
import { mlService } from './MLService';

export interface PriceOptimization {
  originalPrice: number;
  optimizedPrice: number;
  confidence: number;
  factors: string[];
  expectedImpact: {
    demandChange: number;
    revenueChange: number;
    profitChange: number;
  };
}

export interface DemandForecast {
  productId: string;
  predictedSales: number;
  confidence: number;
  timeFrame: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactors: string[];
}

export class PricingEngine {
  private priceHistory: Map<string, number[]> = new Map();
  private demandData: Map<string, any[]> = new Map();

  async optimizePrice(productData: {
    id: string;
    currentPrice: number;
    category: string;
    competition: number[];
    historicalSales: number[];
    seasonality: string[];
  }): Promise<PriceOptimization> {
    console.log('ML Pricing: Optimizing price for product:', productData.id);
    
    await mlService.initialize();
    
    // Analyze market conditions
    const marketAnalysis = await this.analyzeMarketConditions(productData);
    
    // Predict optimal price using ML
    const optimizedPrice = await mlService.predictOptimalPrice(productData);
    
    // Calculate expected impact
    const expectedImpact = await this.calculatePriceImpact(
      productData.currentPrice, 
      optimizedPrice, 
      productData
    );
    
    return {
      originalPrice: productData.currentPrice,
      optimizedPrice,
      confidence: 0.85,
      factors: [
        'competitor_pricing',
        'demand_elasticity',
        'seasonal_trends',
        'inventory_levels'
      ],
      expectedImpact
    };
  }

  async forecastDemand(productId: string, timeFrame: string = '30d'): Promise<DemandForecast> {
    console.log('ML Demand: Forecasting for product:', productId);
    
    const forecast = await mlService.forecastDemand(productId, timeFrame);
    
    return {
      productId,
      predictedSales: forecast.predictedSales,
      confidence: forecast.confidence,
      timeFrame,
      trend: forecast.trendDirection,
      seasonalFactors: forecast.seasonalFactors
    };
  }

  async dynamicPricing(productId: string, context: {
    timeOfDay: number;
    userSegment: string;
    inventory: number;
    competition: number[];
  }): Promise<number> {
    console.log('ML: Calculating dynamic price for product:', productId);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Base price from stored data
    const basePrice = this.getBasePrice(productId);
    
    // Apply ML-based adjustments
    let adjustmentFactor = 1.0;
    
    // Time-based pricing
    if (context.timeOfDay >= 18 && context.timeOfDay <= 22) {
      adjustmentFactor *= 1.05; // Peak hours
    }
    
    // Inventory-based pricing
    if (context.inventory < 10) {
      adjustmentFactor *= 1.08; // Low inventory
    } else if (context.inventory > 100) {
      adjustmentFactor *= 0.95; // High inventory
    }
    
    // Competition-based pricing
    const avgCompetitorPrice = context.competition.reduce((a, b) => a + b, 0) / context.competition.length;
    if (basePrice > avgCompetitorPrice * 1.1) {
      adjustmentFactor *= 0.97; // Competitive adjustment
    }
    
    // User segment pricing
    if (context.userSegment === 'premium') {
      adjustmentFactor *= 1.03;
    } else if (context.userSegment === 'budget') {
      adjustmentFactor *= 0.98;
    }
    
    return Math.round(basePrice * adjustmentFactor);
  }

  private async analyzeMarketConditions(productData: any): Promise<any> {
    // Simulate market analysis
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return {
      competitivePosition: 'strong',
      marketTrend: 'growing',
      demandElasticity: 0.7,
      seasonalScore: 0.8
    };
  }

  private async calculatePriceImpact(
    currentPrice: number, 
    newPrice: number, 
    productData: any
  ): Promise<any> {
    const priceChange = (newPrice - currentPrice) / currentPrice;
    
    // ML-based impact prediction
    const demandElasticity = -1.2; // Price elasticity
    const demandChange = demandElasticity * priceChange;
    
    return {
      demandChange: Math.round(demandChange * 100),
      revenueChange: Math.round((priceChange + demandChange) * 100),
      profitChange: Math.round((priceChange * 1.3 + demandChange) * 100)
    };
  }

  private getBasePrice(productId: string): number {
    // Mock base prices
    const basePrices: { [key: string]: number } = {
      'electronics': 25000,
      'fashion': 2500,
      'home': 5000
    };
    
    return basePrices[productId] || 10000;
  }

  // Track price performance for ML learning
  trackPricePerformance(productId: string, price: number, sales: number, date: Date) {
    const history = this.priceHistory.get(productId) || [];
    history.push(price);
    this.priceHistory.set(productId, history);
    
    const demand = this.demandData.get(productId) || [];
    demand.push({ price, sales, date: date.getTime() });
    this.demandData.set(productId, demand);
    
    console.log('ML: Tracked price performance for product:', productId);
  }
}

export const pricingEngine = new PricingEngine();
