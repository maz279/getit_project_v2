
export interface FraudAnalysis {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  recommendations: string[];
  confidence: number;
}

export interface TransactionData {
  userId: string;
  amount: number;
  location?: string;
  paymentMethod: string;
  deviceInfo?: any;
  timestamp: number;
  products: Array<{
    id: string;
    category: string;
    price: number;
  }>;
}

export class FraudDetectionEngine {
  private static instance: FraudDetectionEngine;
  private userTransactionHistory: Map<string, TransactionData[]> = new Map();
  private deviceFingerprints: Map<string, any> = new Map();
  private suspiciousPatterns: Set<string> = new Set();

  public static getInstance(): FraudDetectionEngine {
    if (!FraudDetectionEngine.instance) {
      FraudDetectionEngine.instance = new FraudDetectionEngine();
    }
    return FraudDetectionEngine.instance;
  }

  async analyzeTransaction(transaction: TransactionData): Promise<FraudAnalysis> {
    console.log('Fraud Detection: Analyzing transaction for user:', transaction.userId);

    const userHistory = this.userTransactionHistory.get(transaction.userId) || [];
    this.userTransactionHistory.set(transaction.userId, [...userHistory, transaction]);

    const flags = [];
    let riskScore = 0;

    // Amount-based analysis
    const amountRisk = this.analyzeTransactionAmount(transaction, userHistory);
    riskScore += amountRisk.score;
    flags.push(...amountRisk.flags);

    // Frequency analysis
    const frequencyRisk = this.analyzeTransactionFrequency(transaction, userHistory);
    riskScore += frequencyRisk.score;
    flags.push(...frequencyRisk.flags);

    // Location analysis
    const locationRisk = this.analyzeTransactionLocation(transaction, userHistory);
    riskScore += locationRisk.score;
    flags.push(...locationRisk.flags);

    // Device analysis
    const deviceRisk = this.analyzeDevicePatterns(transaction);
    riskScore += deviceRisk.score;
    flags.push(...deviceRisk.flags);

    // Behavioral analysis
    const behaviorRisk = this.analyzeBehavioralPatterns(transaction, userHistory);
    riskScore += behaviorRisk.score;
    flags.push(...behaviorRisk.flags);

    const riskLevel = this.calculateRiskLevel(riskScore);
    const recommendations = this.generateRecommendations(riskLevel, flags);

    return {
      riskScore: Math.min(riskScore, 1),
      riskLevel,
      flags: Array.from(new Set(flags)),
      recommendations,
      confidence: 0.85
    };
  }

  async detectAnomalies(userId: string): Promise<{
    anomalies: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      timestamp: number;
    }>;
    overallRisk: number;
  }> {
    const userHistory = this.userTransactionHistory.get(userId) || [];
    const anomalies = [];
    let overallRisk = 0;

    if (userHistory.length === 0) {
      return { anomalies: [], overallRisk: 0 };
    }

    // Detect spending spikes
    const recentTransactions = userHistory.slice(-10);
    const averageAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length;
    
    recentTransactions.forEach(transaction => {
      if (transaction.amount > averageAmount * 3) {
        anomalies.push({
          type: 'spending_spike',
          description: `Transaction amount (${transaction.amount}) is 3x higher than average`,
          severity: 'high',
          timestamp: transaction.timestamp
        });
        overallRisk += 0.3;
      }
    });

    // Detect unusual time patterns
    const nightTransactions = userHistory.filter(t => {
      const hour = new Date(t.timestamp).getHours();
      return hour >= 2 && hour <= 5;
    });

    if (nightTransactions.length > userHistory.length * 0.3) {
      anomalies.push({
        type: 'unusual_timing',
        description: 'High percentage of transactions during unusual hours',
        severity: 'medium',
        timestamp: Date.now()
      });
      overallRisk += 0.2;
    }

    // Detect rapid successive transactions
    for (let i = 1; i < userHistory.length; i++) {
      const timeDiff = userHistory[i].timestamp - userHistory[i-1].timestamp;
      if (timeDiff < 60000) { // Less than 1 minute
        anomalies.push({
          type: 'rapid_transactions',
          description: 'Multiple transactions within 1 minute',
          severity: 'high',
          timestamp: userHistory[i].timestamp
        });
        overallRisk += 0.25;
      }
    }

    return {
      anomalies,
      overallRisk: Math.min(overallRisk, 1)
    };
  }

  private analyzeTransactionAmount(transaction: TransactionData, history: TransactionData[]): {
    score: number;
    flags: string[];
  } {
    const flags = [];
    let score = 0;

    // Very high amount
    if (transaction.amount > 500000) {
      flags.push('very_high_amount');
      score += 0.4;
    } else if (transaction.amount > 100000) {
      flags.push('high_amount');
      score += 0.2;
    }

    // Compare with user's history
    if (history.length > 0) {
      const averageAmount = history.reduce((sum, t) => sum + t.amount, 0) / history.length;
      if (transaction.amount > averageAmount * 5) {
        flags.push('amount_deviation');
        score += 0.3;
      }
    }

    return { score, flags };
  }

  private analyzeTransactionFrequency(transaction: TransactionData, history: TransactionData[]): {
    score: number;
    flags: string[];
  } {
    const flags = [];
    let score = 0;

    // Check transactions in last hour
    const lastHour = Date.now() - 3600000;
    const recentTransactions = history.filter(t => t.timestamp > lastHour);

    if (recentTransactions.length > 10) {
      flags.push('high_frequency');
      score += 0.4;
    } else if (recentTransactions.length > 5) {
      flags.push('moderate_frequency');
      score += 0.2;
    }

    return { score, flags };
  }

  private analyzeTransactionLocation(transaction: TransactionData, history: TransactionData[]): {
    score: number;
    flags: string[];
  } {
    const flags = [];
    let score = 0;

    if (!transaction.location) return { score, flags };

    // Check for location changes
    const recentLocations = history
      .slice(-5)
      .map(t => t.location)
      .filter(Boolean);

    if (recentLocations.length > 0 && !recentLocations.includes(transaction.location)) {
      flags.push('location_change');
      score += 0.15;
    }

    // Check for high-risk locations (mock data)
    const highRiskLocations = ['unknown', 'proxy', 'tor'];
    if (highRiskLocations.includes(transaction.location.toLowerCase())) {
      flags.push('high_risk_location');
      score += 0.3;
    }

    return { score, flags };
  }

  private analyzeDevicePatterns(transaction: TransactionData): {
    score: number;
    flags: string[];
  } {
    const flags = [];
    let score = 0;

    if (!transaction.deviceInfo) return { score, flags };

    const deviceId = transaction.deviceInfo.id;
    const existingDevice = this.deviceFingerprints.get(deviceId);

    if (!existingDevice) {
      // New device
      flags.push('new_device');
      score += 0.1;
      this.deviceFingerprints.set(deviceId, transaction.deviceInfo);
    } else {
      // Check for device inconsistencies
      if (existingDevice.platform !== transaction.deviceInfo.platform) {
        flags.push('device_inconsistency');
        score += 0.25;
      }
    }

    return { score, flags };
  }

  private analyzeBehavioralPatterns(transaction: TransactionData, history: TransactionData[]): {
    score: number;
    flags: string[];
  } {
    const flags = [];
    let score = 0;

    // Unusual time of day
    const hour = new Date(transaction.timestamp).getHours();
    if (hour >= 2 && hour <= 5) {
      flags.push('unusual_time');
      score += 0.15;
    }

    // Unusual product categories
    const userCategories = history
      .flatMap(t => t.products.map(p => p.category))
      .reduce((acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const transactionCategories = transaction.products.map(p => p.category);
    const unusualCategories = transactionCategories.filter(cat => !userCategories[cat]);

    if (unusualCategories.length > 0) {
      flags.push('unusual_categories');
      score += 0.1;
    }

    return { score, flags };
  }

  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  private generateRecommendations(riskLevel: string, flags: string[]): string[] {
    const recommendations = [];

    if (riskLevel === 'critical') {
      recommendations.push('Block transaction immediately');
      recommendations.push('Require manual review');
      recommendations.push('Contact user for verification');
    } else if (riskLevel === 'high') {
      recommendations.push('Require additional authentication');
      recommendations.push('Flag for manual review');
    } else if (riskLevel === 'medium') {
      recommendations.push('Monitor closely');
      recommendations.push('Send SMS verification');
    }

    if (flags.includes('new_device')) {
      recommendations.push('Send device verification email');
    }

    if (flags.includes('location_change')) {
      recommendations.push('Verify location change with user');
    }

    return recommendations;
  }

  public getUserTransactionHistory(userId: string): TransactionData[] {
    return this.userTransactionHistory.get(userId) || [];
  }

  public getOverallFraudStatistics(): any {
    const allTransactions = Array.from(this.userTransactionHistory.values()).flat();
    const totalTransactions = allTransactions.length;
    
    if (totalTransactions === 0) {
      return { totalTransactions: 0, fraudulentTransactions: 0, fraudRate: 0 };
    }

    // Mock fraud detection based on suspicious patterns
    const fraudulentTransactions = Math.floor(totalTransactions * 0.02); // 2% fraud rate

    return {
      totalTransactions,
      fraudulentTransactions,
      fraudRate: fraudulentTransactions / totalTransactions,
      riskDistribution: {
        low: Math.floor(totalTransactions * 0.7),
        medium: Math.floor(totalTransactions * 0.25),
        high: Math.floor(totalTransactions * 0.04),
        critical: Math.floor(totalTransactions * 0.01)
      }
    };
  }
}

export const fraudDetectionEngine = FraudDetectionEngine.getInstance();
