
import { mlManager } from '../../ml';

export class BehaviorAnalysisService {
  private static instance: BehaviorAnalysisService;

  public static getInstance(): BehaviorAnalysisService {
    if (!BehaviorAnalysisService.instance) {
      BehaviorAnalysisService.instance = new BehaviorAnalysisService();
    }
    return BehaviorAnalysisService.instance;
  }

  async analyzeUserBehavior(userId: string, event: {
    type: string;
    data: any;
    timestamp: number;
  }): Promise<{
    behaviorInsights: any;
    nextBestActions: string[];
    personalizationUpdates: any;
    mlModelUpdates: any;
  }> {
    console.log('Behavior Analysis: Analyzing user behavior for:', userId);

    const [behaviorInsights, nextBestActions] = await Promise.all([
      this.generateBehaviorInsights(userId, event),
      this.determineNextBestActions(userId, event)
    ]);

    const personalizationUpdates = await this.updatePersonalizationProfile(userId, event);
    const mlModelUpdates = await this.updateMLModels(userId, event);

    return {
      behaviorInsights,
      nextBestActions,
      personalizationUpdates,
      mlModelUpdates
    };
  }

  private async generateBehaviorInsights(userId: string, event: any): Promise<any> {
    const analyticsEngine = mlManager.getAnalyticsEngine();
    const customerProfile = await analyticsEngine.analyzeCustomerBehavior(userId, event.data);

    return {
      userSegment: customerProfile.segment,
      engagementLevel: this.calculateEngagementLevel(event),
      purchaseIntent: this.assessPurchaseIntent(event),
      preferences: customerProfile.preferences,
      riskFactors: this.identifyRiskFactors(customerProfile),
      opportunities: this.identifyOpportunities(event, customerProfile)
    };
  }

  private async determineNextBestActions(userId: string, event: any): Promise<string[]> {
    const actions = [];

    switch (event.type) {
      case 'product_view':
        actions.push('show_similar_products', 'offer_assistance');
        break;
      case 'cart_abandonment':
        actions.push('send_recovery_email', 'offer_discount');
        break;
      case 'purchase':
        actions.push('recommend_accessories', 'request_review');
        break;
      case 'search':
        actions.push('refine_search_results', 'suggest_categories');
        break;
      default:
        actions.push('personalize_experience');
    }

    return actions;
  }

  private async updatePersonalizationProfile(userId: string, event: any): Promise<any> {
    return {
      updatedSegments: this.updateUserSegments(event),
      newPreferences: this.extractPreferences(event),
      behaviorPatterns: this.updateBehaviorPatterns(event),
      lastUpdate: Date.now()
    };
  }

  private async updateMLModels(userId: string, event: any): Promise<any> {
    return {
      recommendationModel: 'updated',
      pricingModel: event.type === 'purchase' ? 'updated' : 'unchanged',
      churnPrediction: 'recalculated',
      segmentationModel: 'updated'
    };
  }

  private calculateEngagementLevel(event: any): string {
    const engagementScore = this.calculateEngagementScore(event);
    
    if (engagementScore > 0.8) return 'high';
    if (engagementScore > 0.5) return 'medium';
    return 'low';
  }

  private calculateEngagementScore(event: any): number {
    let score = 0.5; // Base score

    switch (event.type) {
      case 'purchase':
        score = 1.0;
        break;
      case 'cart_addition':
        score = 0.8;
        break;
      case 'product_view':
        score = 0.6;
        break;
      case 'search':
        score = 0.4;
        break;
    }

    return score;
  }

  private assessPurchaseIntent(event: any): string {
    switch (event.type) {
      case 'purchase':
        return 'completed';
      case 'cart_addition':
        return 'high';
      case 'product_view':
        return 'medium';
      case 'search':
        return 'low';
      default:
        return 'unknown';
    }
  }

  private identifyRiskFactors(customerProfile: any): string[] {
    const risks = [];
    
    if (customerProfile.churnRisk > 0.7) {
      risks.push('high_churn_risk');
    }
    
    if (customerProfile.clv < 10000) {
      risks.push('low_value_customer');
    }
    
    return risks;
  }

  private identifyOpportunities(event: any, customerProfile: any): string[] {
    const opportunities = [];
    
    if (customerProfile.clv > 50000) {
      opportunities.push('vip_upgrade');
    }
    
    if (event.type === 'product_view' && customerProfile.preferences.length > 3) {
      opportunities.push('cross_sell');
    }
    
    return opportunities;
  }

  private updateUserSegments(event: any): string[] {
    const segments = [];
    
    if (event.type === 'purchase' && event.data.amount > 50000) {
      segments.push('high_value');
    }
    
    return segments;
  }

  private extractPreferences(event: any): string[] {
    const preferences = [];
    
    if (event.data.category) {
      preferences.push(event.data.category);
    }
    
    return preferences;
  }

  private updateBehaviorPatterns(event: any): any {
    return {
      lastActivity: event.timestamp,
      activityType: event.type,
      frequency: 'calculated_based_on_history'
    };
  }
}

export const behaviorAnalysisService = BehaviorAnalysisService.getInstance();
