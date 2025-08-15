
export interface FraudAnalysis {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendation: 'approve' | 'review' | 'block';
  confidence: number;
}

export class FraudDetectionEngine {
  private static instance: FraudDetectionEngine;
  private userProfiles: Map<string, any> = new Map();
  private transactionHistory: Map<string, any[]> = new Map();

  public static getInstance(): FraudDetectionEngine {
    if (!FraudDetectionEngine.instance) {
      FraudDetectionEngine.instance = new FraudDetectionEngine();
    }
    return FraudDetectionEngine.instance;
  }

  async initialize(): Promise<void> {
    console.log('🛡️ Initializing Fraud Detection Engine...');
  }

  async analyzeTransaction(transactionData: {
    userId?: string;
    amount: number;
    paymentMethod: string;
    location?: string;
    deviceFingerprint?: string;
    timeOfDay?: string;
  }): Promise<FraudAnalysis> {
    console.log('🔍 Analyzing transaction for fraud detection');

    let riskScore = 0;
    const riskFactors: string[] = [];

    // Amount-based risk assessment
    if (transactionData.amount > 100000) {
      riskScore += 0.3;
      riskFactors.push('high_amount');
    }

    // Payment method risk
    if (transactionData.paymentMethod === 'new_card') {
      riskScore += 0.2;
      riskFactors.push('new_payment_method');
    }

    // Location-based risk
    if (transactionData.location && this.isUnusualLocation(transactionData.userId, transactionData.location)) {
      riskScore += 0.25;
      riskFactors.push('unusual_location');
    }

    // Device fingerprint analysis
    if (transactionData.deviceFingerprint && this.isNewDevice(transactionData.userId, transactionData.deviceFingerprint)) {
      riskScore += 0.15;
      riskFactors.push('new_device');
    }

    // Time-based analysis
    if (this.isUnusualTime(transactionData.timeOfDay)) {
      riskScore += 0.1;
      riskFactors.push('unusual_time');
    }

    // User behavior analysis
    if (transactionData.userId) {
      const behaviorRisk = await this.analyzeBehaviorPattern(transactionData.userId);
      riskScore += behaviorRisk.score;
      riskFactors.push(...behaviorRisk.factors);
    }

    const riskLevel = this.calculateRiskLevel(riskScore);
    const recommendation = this.getRecommendation(riskLevel);

    return {
      riskScore: Math.min(riskScore, 1),
      riskLevel,
      riskFactors,
      recommendation,
      confidence: 0.85
    };
  }

  async analyzeUser(userId: string): Promise<{
    overallRiskScore: number;
    riskFactors: string[];
    accountAge: number;
    transactionHistory: any;
    behaviorPattern: any;
  }> {
    const userHistory = this.transactionHistory.get(userId) || [];
    const profile = this.userProfiles.get(userId) || {};

    return {
      overallRiskScore: Math.random() * 0.3, // Generally low risk for existing users
      riskFactors: profile.riskFactors || [],
      accountAge: profile.accountAge || 30,
      transactionHistory: {
        totalTransactions: userHistory.length,
        averageAmount: userHistory.reduce((sum, t) => sum + t.amount, 0) / Math.max(userHistory.length, 1),
        successRate: 0.95
      },
      behaviorPattern: {
        typicalShoppingTime: 'evening',
        preferredPaymentMethods: ['card', 'mobile_banking'],
        averageSessionDuration: 15
      }
    };
  }

  private isUnusualLocation(userId?: string, location?: string): boolean {
    if (!userId || !location) return false;
    const profile = this.userProfiles.get(userId);
    return !profile?.commonLocations?.includes(location);
  }

  private isNewDevice(userId?: string, deviceFingerprint?: string): boolean {
    if (!userId || !deviceFingerprint) return false;
    const profile = this.userProfiles.get(userId);
    return !profile?.knownDevices?.includes(deviceFingerprint);
  }

  private isUnusualTime(timeOfDay?: string): boolean {
    if (!timeOfDay) return false;
    const hour = new Date().getHours();
    return hour < 6 || hour > 23; // Very early morning or very late night
  }

  private async analyzeBehaviorPattern(userId: string): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    // Check for rapid successive transactions
    const recentTransactions = this.getRecentTransactions(userId, 1); // Last 1 hour
    if (recentTransactions.length > 5) {
      score += 0.2;
      factors.push('rapid_transactions');
    }

    // Check for failed payment attempts
    const failedAttempts = this.getFailedPaymentAttempts(userId, 24); // Last 24 hours
    if (failedAttempts > 3) {
      score += 0.3;
      factors.push('multiple_failed_payments');
    }

    return { score, factors };
  }

  private getRecentTransactions(userId: string, hours: number): any[] {
    const transactions = this.transactionHistory.get(userId) || [];
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return transactions.filter(t => t.timestamp > cutoff);
  }

  private getFailedPaymentAttempts(userId: string, hours: number): number {
    const transactions = this.getRecentTransactions(userId, hours);
    return transactions.filter(t => t.status === 'failed').length;
  }

  private calculateRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 0.8) return 'critical';
    if (riskScore >= 0.6) return 'high';
    if (riskScore >= 0.4) return 'medium';
    return 'low';
  }

  private getRecommendation(riskLevel: string): 'approve' | 'review' | 'block' {
    switch (riskLevel) {
      case 'critical': return 'block';
      case 'high': return 'review';
      case 'medium': return 'review';
      default: return 'approve';
    }
  }
}

export const fraudDetectionEngine = FraudDetectionEngine.getInstance();
