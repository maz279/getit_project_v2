
export interface DemandForecast {
  productId: string;
  predictedDemand: number;
  confidence: number;
  seasonalFactor: number;
  trendFactor: number;
  timeHorizon: '7d' | '30d' | '90d';
  factors: string[];
}

export interface StockOptimization {
  productId: string;
  currentStock: number;
  recommendedReorder: number;
  reorderPoint: number;
  maxStock: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  costImpact: number;
}

export interface VendorPerformance {
  vendorId: string;
  performanceScore: number;
  deliveryReliability: number;
  qualityScore: number;
  responseTime: number;
  riskLevel: 'low' | 'medium' | 'high';
  predictedIssues: string[];
  recommendations: string[];
}

export class InventoryManager {
  private static instance: InventoryManager;
  private demandHistory: Map<string, any[]> = new Map();
  private vendorMetrics: Map<string, any> = new Map();
  private seasonalPatterns: Map<string, any> = new Map();

  public static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }
    return InventoryManager.instance;
  }

  // Demand Forecasting
  async forecastDemand(productId: string, timeHorizon: '7d' | '30d' | '90d' = '30d'): Promise<DemandForecast> {
    console.log('Inventory ML: Forecasting demand for product:', productId);

    const historicalData = this.demandHistory.get(productId) || this.generateMockHistory(productId);
    
    // Calculate base demand from historical data
    const baseDemand = historicalData.reduce((sum, entry) => sum + entry.sales, 0) / historicalData.length;
    
    // Apply seasonal factors
    const seasonalFactor = this.calculateSeasonalFactor(productId, timeHorizon);
    
    // Apply trend analysis
    const trendFactor = this.calculateTrendFactor(historicalData);
    
    // External factors (market conditions, promotions, etc.)
    const externalFactors = await this.analyzeExternalFactors(productId);
    
    const predictedDemand = Math.round(
      baseDemand * seasonalFactor * trendFactor * externalFactors.multiplier
    );

    const confidence = this.calculateForecastConfidence(historicalData, seasonalFactor, trendFactor);
    
    return {
      productId,
      predictedDemand,
      confidence,
      seasonalFactor,
      trendFactor,
      timeHorizon,
      factors: [
        `Historical average: ${baseDemand}`,
        `Seasonal adjustment: ${((seasonalFactor - 1) * 100).toFixed(1)}%`,
        `Trend factor: ${((trendFactor - 1) * 100).toFixed(1)}%`,
        ...externalFactors.factors
      ]
    };
  }

  // Stock Optimization
  async optimizeStock(productId: string, currentStock: number): Promise<StockOptimization> {
    console.log('Inventory ML: Optimizing stock for product:', productId);

    const forecast = await this.forecastDemand(productId, '30d');
    const leadTime = await this.getVendorLeadTime(productId);
    const safetyStock = this.calculateSafetyStock(forecast, leadTime);
    
    const reorderPoint = (forecast.predictedDemand * leadTime / 30) + safetyStock;
    const recommendedReorder = Math.max(0, reorderPoint - currentStock);
    const maxStock = forecast.predictedDemand * 2; // 2 months max stock
    
    const urgency = this.calculateStockUrgency(currentStock, reorderPoint, forecast.predictedDemand);
    const costImpact = this.calculateCostImpact(recommendedReorder, forecast.predictedDemand);

    return {
      productId,
      currentStock,
      recommendedReorder,
      reorderPoint: Math.round(reorderPoint),
      maxStock: Math.round(maxStock),
      urgency,
      costImpact
    };
  }

  // Vendor Performance Prediction
  async predictVendorPerformance(vendorId: string): Promise<VendorPerformance> {
    console.log('Inventory ML: Analyzing vendor performance:', vendorId);

    const metrics = this.vendorMetrics.get(vendorId) || this.generateMockVendorMetrics(vendorId);
    
    // Calculate performance metrics
    const deliveryReliability = this.calculateDeliveryReliability(metrics.deliveryHistory);
    const qualityScore = this.calculateQualityScore(metrics.qualityReports);
    const responseTime = this.calculateResponseTime(metrics.communicationHistory);
    
    const performanceScore = (deliveryReliability * 0.4 + qualityScore * 0.4 + responseTime * 0.2);
    
    const riskLevel = performanceScore >= 0.8 ? 'low' : 
                     performanceScore >= 0.6 ? 'medium' : 'high';
    
    const predictedIssues = this.predictVendorIssues(metrics, performanceScore);
    const recommendations = this.generateVendorRecommendations(metrics, riskLevel);

    return {
      vendorId,
      performanceScore,
      deliveryReliability,
      qualityScore,
      responseTime,
      riskLevel,
      predictedIssues,
      recommendations
    };
  }

  // Bulk demand forecasting for all products
  async bulkForecastDemand(productIds: string[]): Promise<DemandForecast[]> {
    const forecasts = await Promise.all(
      productIds.map(id => this.forecastDemand(id))
    );
    return forecasts.sort((a, b) => b.predictedDemand - a.predictedDemand);
  }

  // Get inventory alerts
  async getInventoryAlerts(): Promise<Array<{
    type: 'low_stock' | 'overstock' | 'vendor_risk' | 'demand_spike';
    productId?: string;
    vendorId?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendedAction: string;
  }>> {
    const alerts = [];
    
    // Mock some alerts based on analysis
    alerts.push({
      type: 'low_stock',
      productId: 'prod_123',
      severity: 'high',
      message: 'Stock level below reorder point',
      recommendedAction: 'Reorder 500 units immediately'
    });

    alerts.push({
      type: 'demand_spike',
      productId: 'prod_456',
      severity: 'medium',
      message: 'Demand forecasted to increase by 40%',
      recommendedAction: 'Increase stock levels for next month'
    });

    return alerts;
  }

  // Private helper methods
  private generateMockHistory(productId: string): any[] {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      sales: Math.floor(Math.random() * 20) + 10,
      stock: Math.floor(Math.random() * 100) + 50
    }));
  }

  private generateMockVendorMetrics(vendorId: string): any {
    return {
      deliveryHistory: Array.from({ length: 20 }, () => ({
        expected: new Date(),
        actual: new Date(),
        onTime: Math.random() > 0.2
      })),
      qualityReports: Array.from({ length: 15 }, () => ({
        rating: Math.random() * 2 + 3, // 3-5 rating
        defectRate: Math.random() * 0.05 // 0-5% defect rate
      })),
      communicationHistory: Array.from({ length: 10 }, () => ({
        responseTime: Math.random() * 24 + 1 // 1-24 hours
      }))
    };
  }

  private calculateSeasonalFactor(productId: string, timeHorizon: string): number {
    const currentMonth = new Date().getMonth();
    const seasonalPatterns = {
      electronics: [0.8, 0.9, 1.0, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.2, 1.5, 1.8],
      fashion: [0.7, 0.8, 1.0, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.3, 1.6, 1.4]
    };
    
    // Mock seasonal factor based on current month
    return seasonalPatterns.electronics[currentMonth] || 1.0;
  }

  private calculateTrendFactor(historicalData: any[]): number {
    if (historicalData.length < 2) return 1.0;
    
    const recentSales = historicalData.slice(0, 10).reduce((sum, entry) => sum + entry.sales, 0) / 10;
    const olderSales = historicalData.slice(-10).reduce((sum, entry) => sum + entry.sales, 0) / 10;
    
    return recentSales / olderSales;
  }

  private async analyzeExternalFactors(productId: string): Promise<{
    multiplier: number;
    factors: string[];
  }> {
    // Mock external factors analysis
    return {
      multiplier: 1.1,
      factors: [
        'Market growth trend: +10%',
        'Competition impact: neutral',
        'Economic factors: positive'
      ]
    };
  }

  private calculateForecastConfidence(historicalData: any[], seasonalFactor: number, trendFactor: number): number {
    const dataQuality = Math.min(historicalData.length / 30, 1); // More data = higher confidence
    const volatility = this.calculateVolatility(historicalData);
    const factorStability = 1 - Math.abs(seasonalFactor - 1) - Math.abs(trendFactor - 1);
    
    return Math.max(0.5, Math.min(0.95, dataQuality * (1 - volatility) * factorStability));
  }

  private calculateVolatility(historicalData: any[]): number {
    if (historicalData.length < 2) return 0.5;
    
    const sales = historicalData.map(entry => entry.sales);
    const mean = sales.reduce((sum, val) => sum + val, 0) / sales.length;
    const variance = sales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sales.length;
    
    return Math.min(Math.sqrt(variance) / mean, 1);
  }

  private async getVendorLeadTime(productId: string): Promise<number> {
    // Mock lead time calculation
    return Math.floor(Math.random() * 14) + 7; // 7-21 days
  }

  private calculateSafetyStock(forecast: DemandForecast, leadTime: number): number {
    const demandVariability = forecast.predictedDemand * (1 - forecast.confidence);
    return Math.ceil(demandVariability * Math.sqrt(leadTime / 30));
  }

  private calculateStockUrgency(currentStock: number, reorderPoint: number, predictedDemand: number): 'low' | 'medium' | 'high' | 'critical' {
    const stockRatio = currentStock / reorderPoint;
    const daysOfStock = currentStock / (predictedDemand / 30);
    
    if (stockRatio < 0.5 || daysOfStock < 7) return 'critical';
    if (stockRatio < 0.8 || daysOfStock < 14) return 'high';
    if (stockRatio < 1.2 || daysOfStock < 21) return 'medium';
    return 'low';
  }

  private calculateCostImpact(recommendedReorder: number, predictedDemand: number): number {
    // Mock cost impact calculation
    const unitCost = 1000; // Mock unit cost
    const holdingCost = unitCost * 0.02; // 2% monthly holding cost
    const stockoutCost = predictedDemand * unitCost * 0.1; // 10% stockout penalty
    
    return recommendedReorder * (unitCost + holdingCost);
  }

  private calculateDeliveryReliability(deliveryHistory: any[]): number {
    const onTimeDeliveries = deliveryHistory.filter(delivery => delivery.onTime).length;
    return onTimeDeliveries / deliveryHistory.length;
  }

  private calculateQualityScore(qualityReports: any[]): number {
    const avgRating = qualityReports.reduce((sum, report) => sum + report.rating, 0) / qualityReports.length;
    const avgDefectRate = qualityReports.reduce((sum, report) => sum + report.defectRate, 0) / qualityReports.length;
    
    return (avgRating / 5) * (1 - avgDefectRate);
  }

  private calculateResponseTime(communicationHistory: any[]): number {
    const avgResponseTime = communicationHistory.reduce((sum, comm) => sum + comm.responseTime, 0) / communicationHistory.length;
    return Math.max(0, 1 - avgResponseTime / 24); // Normalize to 0-1 scale
  }

  private predictVendorIssues(metrics: any, performanceScore: number): string[] {
    const issues = [];
    
    if (performanceScore < 0.7) {
      issues.push('Potential delivery delays');
    }
    
    if (performanceScore < 0.6) {
      issues.push('Quality control concerns');
      issues.push('Communication responsiveness issues');
    }
    
    return issues;
  }

  private generateVendorRecommendations(metrics: any, riskLevel: string): string[] {
    const recommendations = [];
    
    if (riskLevel === 'high') {
      recommendations.push('Consider diversifying suppliers');
      recommendations.push('Implement stricter quality controls');
    } else if (riskLevel === 'medium') {
      recommendations.push('Monitor performance closely');
      recommendations.push('Provide feedback on improvement areas');
    } else {
      recommendations.push('Maintain current partnership');
      recommendations.push('Consider expanding product range');
    }
    
    return recommendations;
  }
}

export const inventoryManager = InventoryManager.getInstance();
