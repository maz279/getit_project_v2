
export interface DemandForecast {
  productId: string;
  forecastedDemand: number;
  confidence: number;
  seasonalFactors: string[];
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  recommendedStockLevel: number;
  reorderPoint: number;
}

export class DemandForecastingEngine {
  private static instance: DemandForecastingEngine;
  private salesHistory: Map<string, any[]> = new Map();
  private seasonalPatterns: Map<string, any> = new Map();

  public static getInstance(): DemandForecastingEngine {
    if (!DemandForecastingEngine.instance) {
      DemandForecastingEngine.instance = new DemandForecastingEngine();
    }
    return DemandForecastingEngine.instance;
  }

  async initialize(): Promise<void> {
    console.log('📈 Initializing Demand Forecasting Engine...');
    await this.loadSeasonalPatterns();
  }

  async forecastDemand(productId: string, timeframe: 'weekly' | 'monthly' | 'quarterly' = 'monthly'): Promise<DemandForecast> {
    console.log(`📊 Forecasting demand for product ${productId} - ${timeframe}`);

    const historicalData = this.getSalesHistory(productId);
    const seasonalFactors = this.getSeasonalFactors(productId);
    
    // Base demand calculation using moving average
    const baseDemand = this.calculateBaseDemand(historicalData, timeframe);
    
    // Apply seasonal adjustments
    const seasonalAdjustment = this.calculateSeasonalAdjustment(seasonalFactors);
    
    // Apply trend analysis
    const trendMultiplier = this.calculateTrendMultiplier(historicalData);
    const trendDirection = this.determineTrendDirection(historicalData);
    
    // Calculate final forecast
    const forecastedDemand = Math.round(baseDemand * seasonalAdjustment * trendMultiplier);
    
    // Calculate confidence based on data quality and variability
    const confidence = this.calculateConfidence(historicalData);
    
    // Calculate recommended stock levels
    const { recommendedStockLevel, reorderPoint } = this.calculateStockRecommendations(
      forecastedDemand, 
      confidence,
      this.getLeadTime(productId)
    );

    return {
      productId,
      forecastedDemand,
      confidence,
      seasonalFactors: seasonalFactors.factors,
      trendDirection,
      recommendedStockLevel,
      reorderPoint
    };
  }

  async bulkForecast(productIds: string[], timeframe: 'weekly' | 'monthly' | 'quarterly' = 'monthly'): Promise<DemandForecast[]> {
    console.log(`📊 Bulk forecasting for ${productIds.length} products`);
    
    return Promise.all(
      productIds.map(productId => this.forecastDemand(productId, timeframe))
    );
  }

  async getInventoryRecommendations(vendorId?: string): Promise<{
    lowStockAlerts: any[];
    overStockAlerts: any[];
    reorderRecommendations: any[];
    demandTrends: any[];
  }> {
    // Mock implementation - would integrate with actual inventory data
    const products = this.getMockProductsForVendor(vendorId);
    
    const forecasts = await this.bulkForecast(products.map(p => p.id));
    
    const lowStockAlerts = forecasts
      .filter(f => f.confidence > 0.7 && f.forecastedDemand > 50)
      .map(f => ({
        productId: f.productId,
        currentStock: Math.floor(Math.random() * 20),
        forecastedDemand: f.forecastedDemand,
        daysUntilStockOut: Math.floor(Math.random() * 10) + 1,
        urgency: 'high'
      }));

    const overStockAlerts = forecasts
      .filter(f => f.trendDirection === 'decreasing')
      .map(f => ({
        productId: f.productId,
        currentStock: Math.floor(Math.random() * 500) + 200,
        forecastedDemand: f.forecastedDemand,
        excessDays: Math.floor(Math.random() * 60) + 30,
        recommendation: 'discount_campaign'
      }));

    const reorderRecommendations = forecasts
      .filter(f => f.confidence > 0.6)
      .map(f => ({
        productId: f.productId,
        recommendedQuantity: f.recommendedStockLevel,
        urgency: this.calculateUrgency(f),
        estimatedCost: f.recommendedStockLevel * (Math.random() * 1000 + 100)
      }));

    const demandTrends = forecasts.map(f => ({
      productId: f.productId,
      trend: f.trendDirection,
      growthRate: this.calculateGrowthRate(f),
      seasonality: f.seasonalFactors
    }));

    return {
      lowStockAlerts,
      overStockAlerts,
      reorderRecommendations,
      demandTrends
    };
  }

  private getSalesHistory(productId: string): any[] {
    if (!this.salesHistory.has(productId)) {
      // Generate mock historical data
      const data = [];
      for (let i = 0; i < 52; i++) { // 52 weeks of data
        data.push({
          week: i,
          sales: Math.floor(Math.random() * 100) + 20,
          timestamp: Date.now() - (i * 7 * 24 * 60 * 60 * 1000)
        });
      }
      this.salesHistory.set(productId, data);
    }
    return this.salesHistory.get(productId) || [];
  }

  private getSeasonalFactors(productId: string): { factors: string[]; multiplier: number } {
    const currentMonth = new Date().getMonth();
    const patterns = this.seasonalPatterns.get(productId) || {};
    
    // Determine seasonal factors based on product category
    const factors = [];
    let multiplier = 1;

    // Festival seasons (Eid, Durga Puja, etc.)
    if ([9, 10, 11].includes(currentMonth)) {
      factors.push('festival_season');
      multiplier *= 1.3;
    }

    // Winter season for clothing
    if ([11, 0, 1].includes(currentMonth)) {
      factors.push('winter_demand');
      multiplier *= 1.2;
    }

    // Back to school season
    if ([0, 1].includes(currentMonth)) {
      factors.push('back_to_school');
      multiplier *= 1.15;
    }

    return { factors, multiplier };
  }

  private calculateBaseDemand(historicalData: any[], timeframe: string): number {
    if (historicalData.length === 0) return 50; // Default fallback

    const recentPeriods = timeframe === 'weekly' ? 4 : timeframe === 'monthly' ? 12 : 52;
    const relevantData = historicalData.slice(0, recentPeriods);
    
    const totalSales = relevantData.reduce((sum, period) => sum + period.sales, 0);
    return totalSales / relevantData.length;
  }

  private calculateSeasonalAdjustment(seasonalFactors: { factors: string[]; multiplier: number }): number {
    return seasonalFactors.multiplier;
  }

  private calculateTrendMultiplier(historicalData: any[]): number {
    if (historicalData.length < 8) return 1;

    const recent = historicalData.slice(0, 4);
    const older = historicalData.slice(4, 8);

    const recentAvg = recent.reduce((sum, p) => sum + p.sales, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.sales, 0) / older.length;

    return recentAvg / olderAvg;
  }

  private determineTrendDirection(historicalData: any[]): 'increasing' | 'decreasing' | 'stable' {
    const trendMultiplier = this.calculateTrendMultiplier(historicalData);
    
    if (trendMultiplier > 1.1) return 'increasing';
    if (trendMultiplier < 0.9) return 'decreasing';
    return 'stable';
  }

  private calculateConfidence(historicalData: any[]): number {
    if (historicalData.length < 4) return 0.3;
    if (historicalData.length < 12) return 0.6;
    
    // Calculate coefficient of variation
    const values = historicalData.map(d => d.sales);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coeffVar = stdDev / mean;

    // Lower coefficient of variation = higher confidence
    return Math.max(0.3, Math.min(0.95, 1 - coeffVar));
  }

  private calculateStockRecommendations(forecastedDemand: number, confidence: number, leadTime: number): {
    recommendedStockLevel: number;
    reorderPoint: number;
  } {
    // Safety stock based on confidence level
    const safetyStockMultiplier = confidence > 0.8 ? 1.2 : confidence > 0.6 ? 1.5 : 2.0;
    
    const recommendedStockLevel = Math.round(forecastedDemand * safetyStockMultiplier);
    const reorderPoint = Math.round((forecastedDemand * leadTime / 30) * 1.2); // Assuming monthly forecast

    return { recommendedStockLevel, reorderPoint };
  }

  private getLeadTime(productId: string): number {
    // Mock lead time in days
    return Math.floor(Math.random() * 10) + 5; // 5-15 days
  }

  private getMockProductsForVendor(vendorId?: string): any[] {
    return [
      { id: 'prod_1', name: 'Smartphone', category: 'Electronics' },
      { id: 'prod_2', name: 'T-Shirt', category: 'Fashion' },
      { id: 'prod_3', name: 'Kitchen Appliance', category: 'Home' }
    ];
  }

  private calculateUrgency(forecast: DemandForecast): 'low' | 'medium' | 'high' {
    if (forecast.confidence > 0.8 && forecast.forecastedDemand > 100) return 'high';
    if (forecast.confidence > 0.6 && forecast.forecastedDemand > 50) return 'medium';
    return 'low';
  }

  private calculateGrowthRate(forecast: DemandForecast): number {
    // Mock growth rate calculation
    return forecast.trendDirection === 'increasing' ? Math.random() * 0.3 + 0.05 :
           forecast.trendDirection === 'decreasing' ? -(Math.random() * 0.2 + 0.05) : 0;
  }

  private async loadSeasonalPatterns(): Promise<void> {
    // Load seasonal patterns for different product categories
    // This would typically come from historical data analysis
    console.log('📊 Loading seasonal patterns...');
  }
}

export const demandForecastingEngine = DemandForecastingEngine.getInstance();
