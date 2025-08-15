
export class ChurnAnalysisUtils {
  static analyzeChurnFactors(userBehavior: any): Array<{
    factor: string;
    impact: number;
    description: string;
  }> {
    const factors = [];

    if (userBehavior.daysSinceLastLogin > 14) {
      factors.push({
        factor: 'login_recency',
        impact: Math.min(userBehavior.daysSinceLastLogin / 30, 1),
        description: `Last login ${userBehavior.daysSinceLastLogin} days ago`
      });
    }

    if (userBehavior.averageSessionDuration < 10) {
      factors.push({
        factor: 'low_engagement',
        impact: 0.6,
        description: 'Below average session duration'
      });
    }

    if (userBehavior.totalPurchases === 0 && userBehavior.daysSinceRegistration > 30) {
      factors.push({
        factor: 'no_purchases',
        impact: 0.7,
        description: 'No purchases after 30+ days'
      });
    }

    if (userBehavior.supportTickets > 2) {
      factors.push({
        factor: 'support_issues',
        impact: 0.4,
        description: 'Multiple support tickets indicate friction'
      });
    }

    const featureUsageValues = Object.values(userBehavior.featureUsage);
    let featureUsageSum = 0;
    let validCount = 0;
    
    for (const usage of featureUsageValues) {
      if (typeof usage === 'number' && !isNaN(usage)) {
        featureUsageSum += usage;
        validCount++;
      }
    }
    
    const featureUsageScore = validCount > 0 ? featureUsageSum / validCount : 0;
    
    if (featureUsageScore < 0.3) {
      factors.push({
        factor: 'low_feature_adoption',
        impact: 0.5,
        description: 'Low adoption of key features'
      });
    }

    return factors;
  }

  static calculateChurnProbability(churnFactors: any[]): number {
    if (churnFactors.length === 0) return 0.1;

    const totalImpact = churnFactors.reduce((sum, factor) => sum + factor.impact, 0);
    const weightedImpact = totalImpact / churnFactors.length;
    
    return Math.min(0.95, 0.1 + weightedImpact * 0.8);
  }

  static determineRiskLevel(probability: number): 'low' | 'medium' | 'high' | 'critical' {
    if (probability >= 0.8) return 'critical';
    if (probability >= 0.6) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  }

  static estimateTimeToChurn(probability: number, factors: any[]): number {
    const baseTime = 90;
    const urgencyMultiplier = 1 - probability;
    
    const hasRecentActivity = factors.some(f => f.factor === 'login_recency' && f.impact > 0.7);
    if (hasRecentActivity) return Math.floor(baseTime * 0.3);
    
    return Math.floor(baseTime * urgencyMultiplier);
  }

  static calculatePredictionConfidence(userBehavior: any): number {
    let confidence = 0.5;
    
    confidence += Math.min(userBehavior.totalSessions / 20, 0.3);
    confidence += Math.min(userBehavior.daysSinceRegistration / 180, 0.2);
    
    return Math.min(0.95, confidence);
  }
}
