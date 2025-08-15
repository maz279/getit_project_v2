
export class RetentionStrategies {
  static generateRetentionStrategies(factors: any[], riskLevel: string): Array<{
    strategy: string;
    priority: number;
    expectedImpact: number;
    description: string;
  }> {
    const strategies = [];

    if (factors.some(f => f.factor === 'login_recency')) {
      strategies.push({
        strategy: 'reengagement_campaign',
        priority: 1,
        expectedImpact: 0.4,
        description: 'Send personalized re-engagement emails with special offers'
      });
    }

    if (factors.some(f => f.factor === 'no_purchases')) {
      strategies.push({
        strategy: 'first_purchase_incentive',
        priority: 2,
        expectedImpact: 0.6,
        description: 'Offer first-time buyer discount and product recommendations'
      });
    }

    if (factors.some(f => f.factor === 'low_feature_adoption')) {
      strategies.push({
        strategy: 'feature_education',
        priority: 3,
        expectedImpact: 0.3,
        description: 'Guided tutorial and feature highlight campaigns'
      });
    }

    if (riskLevel === 'critical') {
      strategies.push({
        strategy: 'personal_outreach',
        priority: 1,
        expectedImpact: 0.7,
        description: 'Direct customer success team intervention'
      });
    }

    return strategies.sort((a, b) => a.priority - b.priority);
  }
}
