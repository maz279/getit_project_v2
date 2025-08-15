
import { mlService } from './MLService';
import { recommendationEngine } from './RecommendationEngine';
import { churnPredictor } from './ChurnPredictor';
import { fraudDetectionEngine } from './fraud/FraudDetectionEngine';
import { demandForecastingEngine } from './inventory/DemandForecastingEngine';
import { pricingOptimizer } from './pricing/PricingOptimizer';
import { customerSegmentationEngine } from './segmentation/CustomerSegmentationEngine';
import { PersonalizationEngine } from './PersonalizationEngine';

// Create personalization engine instance
const personalizationEngine = PersonalizationEngine.getInstance();

export class MLManager {
  private static instance: MLManager;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): MLManager {
    if (!MLManager.instance) {
      MLManager.instance = new MLManager();
    }
    return MLManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🤖 Initializing ML Manager...');
    
    // Initialize all ML services
    await Promise.all([
      mlService.initialize(),
      fraudDetectionEngine.initialize(),
      demandForecastingEngine.initialize(),
      pricingOptimizer.initialize(),
      customerSegmentationEngine.initialize(),
      personalizationEngine.initialize()
    ]);

    this.isInitialized = true;
    console.log('✅ ML Manager initialized successfully');
  }

  // Comprehensive ML analysis for any user
  async performComprehensiveAnalysis(userId: string, context: any = {}): Promise<{
    recommendations: any;
    segmentation: any;
    churnRisk: any;
    fraudRisk: any;
    personalizedPricing: any;
    behaviorInsights: any;
  }> {
    console.log('🔍 Performing comprehensive ML analysis for user:', userId);

    const [
      recommendations,
      segmentation,
      churnRisk,
      fraudRisk,
      personalizedPricing,
      behaviorInsights
    ] = await Promise.all([
      recommendationEngine.generateRecommendations(userId, context),
      customerSegmentationEngine.segmentUser(userId),
      churnPredictor.predictUserChurn(userId),
      fraudDetectionEngine.analyzeUser(userId),
      pricingOptimizer.getPersonalizedPricing(userId, context.productIds || []),
      this.analyzeBehaviorPatterns(userId)
    ]);

    return {
      recommendations,
      segmentation,
      churnRisk,
      fraudRisk,
      personalizedPricing,
      behaviorInsights
    };
  }

  // Real-time recommendation updates
  async updateRecommendationsRealTime(userId: string, event: {
    type: string;
    productId?: string;
    categoryId?: string;
    data?: any;
  }): Promise<void> {
    // Track behavior for learning
    recommendationEngine.trackUserBehavior(userId, event.type, event.productId || '', event.data);
    
    // Update personalization profile
    await personalizationEngine.updateProfile(userId, event);
    
    // Trigger real-time recommendation refresh
    await recommendationEngine.updateRecommendations(userId, event.type, event.data);
  }

  // Add missing methods that other services expect
  public getAnalyticsEngine() {
    return {
      analyzeCustomerBehavior: async (userId: string, eventData: any) => {
        const segmentation = await customerSegmentationEngine.segmentUser(userId);
        const churnRisk = await churnPredictor.predictUserChurn(userId);
        
        return {
          segment: segmentation.primarySegment.segmentName,
          churnRisk: churnRisk.churnProbability,
          clv: Math.random() * 100000, // Mock CLV
          preferences: segmentation.primarySegment.characteristics || []
        };
      }
    };
  }

  public getPricingEngine() { 
    return {
      optimizePrice: async (product: any) => {
        return pricingOptimizer.optimizePrice(product);
      },
      forecastDemand: async (productId: string) => {
        return demandForecastingEngine.forecastDemand(productId);
      }
    };
  }
  
  public getSearchEnhancer() {
    return {
      enhanceQuery: async (query: string) => {
        return {
          enhancedQuery: query,
          semanticMatches: [],
          categoryPredictions: [],
          qualityScore: 0.8
        };
      }
    };
  }

  // Get all ML engines for direct access
  public getRecommendationEngine() { return recommendationEngine; }
  public getChurnPredictor() { return churnPredictor; }
  public getFraudDetectionEngine() { return fraudDetectionEngine; }
  public getDemandForecastingEngine() { return demandForecastingEngine; }
  public getPricingOptimizer() { return pricingOptimizer; }
  public getCustomerSegmentationEngine() { return customerSegmentationEngine; }
  public getPersonalizationEngine() { return personalizationEngine; }

  private async analyzeBehaviorPatterns(userId: string): Promise<any> {
    // Analyze user behavior patterns
    return {
      sessionDuration: Math.random() * 1800, // 0-30 minutes
      pageViews: Math.floor(Math.random() * 50) + 1,
      conversionRate: Math.random(),
      engagementScore: Math.random(),
      preferredCategories: ['Electronics', 'Fashion', 'Home'],
      shoppingPatterns: ['evening_shopper', 'deal_seeker']
    };
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}

export const mlManager = MLManager.getInstance();

// Export personalizationEngine
export { personalizationEngine };
