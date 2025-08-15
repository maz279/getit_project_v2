
export class ChurnPredictor {
  private static instance: ChurnPredictor;
  private userProfiles: Map<string, any> = new Map();

  public static getInstance(): ChurnPredictor {
    if (!ChurnPredictor.instance) {
      ChurnPredictor.instance = new ChurnPredictor();
    }
    return ChurnPredictor.instance;
  }

  async initialize(): Promise<void> {
    console.log('📉 Initializing Churn Predictor...');
  }

  async predictUserChurn(userId: string): Promise<{
    churnProbability: number;
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
    retentionStrategies: string[];
    confidence: number;
  }> {
    console.log('📉 Predicting churn for user:', userId);

    const userProfile = this.userProfiles.get(userId) || this.generateMockProfile();
    
    let churnProbability = 0.2; // Base probability
    const riskFactors = [];

    // Calculate churn probability based on various factors
    if (userProfile.daysSinceLastPurchase > 60) {
      churnProbability += 0.3;
      riskFactors.push('Long time since last purchase');
    }

    if (userProfile.totalOrders < 3) {
      churnProbability += 0.2;
      riskFactors.push('Low purchase frequency');
    }

    if (userProfile.averageOrderValue < 1000) {
      churnProbability += 0.1;
      riskFactors.push('Low order value');
    }

    if (userProfile.customerSupportTickets > 2) {
      churnProbability += 0.2;
      riskFactors.push('Multiple support issues');
    }

    // Cap probability at 0.95
    churnProbability = Math.min(0.95, churnProbability);

    const riskLevel = this.calculateRiskLevel(churnProbability);
    const retentionStrategies = this.generateRetentionStrategies(riskLevel, riskFactors);

    return {
      churnProbability,
      riskLevel,
      riskFactors,
      retentionStrategies,
      confidence: 0.8
    };
  }

  private generateMockProfile(): any {
    return {
      daysSinceLastPurchase: Math.floor(Math.random() * 90),
      totalOrders: Math.floor(Math.random() * 20),
      averageOrderValue: Math.random() * 5000 + 500,
      customerSupportTickets: Math.floor(Math.random() * 5),
      accountAge: Math.floor(Math.random() * 365) + 30
    };
  }

  private calculateRiskLevel(churnProbability: number): 'low' | 'medium' | 'high' {
    if (churnProbability >= 0.7) return 'high';
    if (churnProbability >= 0.4) return 'medium';
    return 'low';
  }

  private generateRetentionStrategies(riskLevel: string, riskFactors: string[]): string[] {
    const strategies = [];

    if (riskLevel === 'high') {
      strategies.push('Offer personalized discount');
      strategies.push('Assign dedicated account manager');
      strategies.push('Send targeted re-engagement campaign');
    } else if (riskLevel === 'medium') {
      strategies.push('Send product recommendations');
      strategies.push('Offer loyalty program enrollment');
    } else {
      strategies.push('Continue regular engagement');
      strategies.push('Monitor for changes');
    }

    return strategies;
  }
}

export const churnPredictor = ChurnPredictor.getInstance();
