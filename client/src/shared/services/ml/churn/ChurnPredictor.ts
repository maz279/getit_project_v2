
import type { ChurnPrediction, EngagementPrediction, ChurnAnalytics, RetentionCampaignMetrics } from './types';
import { UserBehaviorManager } from './UserBehaviorManager';
import { ChurnAnalysisUtils } from './ChurnAnalysisUtils';
import { RetentionStrategies } from './RetentionStrategies';
import { EngagementPredictor } from './EngagementPredictor';
import { ChurnAnalyticsService } from './ChurnAnalytics';

export class ChurnPredictor {
  private static instance: ChurnPredictor;
  private userBehaviorManager: UserBehaviorManager;
  private churnModel: any = null;
  private engagementModel: any = null;

  private constructor() {
    this.userBehaviorManager = new UserBehaviorManager();
  }

  public static getInstance(): ChurnPredictor {
    if (!ChurnPredictor.instance) {
      ChurnPredictor.instance = new ChurnPredictor();
    }
    return ChurnPredictor.instance;
  }

  // Predict individual user churn
  async predictUserChurn(userId: string): Promise<ChurnPrediction> {
    console.log('Churn ML: Predicting churn for user:', userId);

    const userBehavior = this.userBehaviorManager.getUserBehaviorData(userId);
    const churnFactors = ChurnAnalysisUtils.analyzeChurnFactors(userBehavior);
    const churnProbability = ChurnAnalysisUtils.calculateChurnProbability(churnFactors);
    const riskLevel = ChurnAnalysisUtils.determineRiskLevel(churnProbability);
    const timeToChurn = ChurnAnalysisUtils.estimateTimeToChurn(churnProbability, churnFactors);
    const retentionStrategies = RetentionStrategies.generateRetentionStrategies(churnFactors, riskLevel);
    const confidence = ChurnAnalysisUtils.calculatePredictionConfidence(userBehavior);

    return {
      userId,
      churnProbability,
      riskLevel,
      timeToChurn,
      churnFactors,
      retentionStrategies,
      confidence
    };
  }

  // Batch churn prediction for multiple users
  async batchPredictChurn(userIds: string[]): Promise<ChurnPrediction[]> {
    console.log('Churn ML: Batch predicting churn for', userIds.length, 'users');

    const predictions = await Promise.all(
      userIds.map(userId => this.predictUserChurn(userId))
    );

    return predictions.sort((a, b) => b.churnProbability - a.churnProbability);
  }

  // Predict feature engagement
  async predictEngagement(userId: string): Promise<EngagementPrediction> {
    const userBehavior = this.userBehaviorManager.getUserBehaviorData(userId);
    return EngagementPredictor.predictEngagement(userId, userBehavior);
  }

  // Get high-risk users for proactive retention
  async getHighRiskUsers(limit: number = 100): Promise<ChurnPrediction[]> {
    console.log('Churn ML: Identifying high-risk users');

    const mockUserIds = Array.from({ length: 500 }, (_, i) => `user_${i + 1}`);
    
    const predictions = await this.batchPredictChurn(mockUserIds.slice(0, limit));
    
    return predictions.filter(pred => pred.riskLevel === 'high' || pred.riskLevel === 'critical');
  }

  // Analyze churn trends across customer segments
  async analyzeChurnTrends(): Promise<ChurnAnalytics> {
    return ChurnAnalyticsService.analyzeChurnTrends();
  }

  // Track retention campaign effectiveness
  async trackRetentionCampaignEffectiveness(campaignId: string): Promise<RetentionCampaignMetrics> {
    return ChurnAnalyticsService.trackRetentionCampaignEffectiveness(campaignId);
  }
}

export const churnPredictor = ChurnPredictor.getInstance();
