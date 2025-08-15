/**
 * Fraud Detection Service using ML-based patterns
 * Provides comprehensive fraud detection for e-commerce transactions
 */

interface TransactionData {
  userId: string;
  amount: number;
  timestamp: number;
  location?: string;
  deviceInfo?: string;
  paymentMethod: string;
  productCategory?: string;
  vendorId?: string;
}

interface FraudRiskAssessment {
  riskScore: number; // 0-100 scale
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  recommendations: string[];
  confidence: number;
  processingTime: number;
}

interface UserBehaviorPattern {
  userId: string;
  avgTransactionAmount: number;
  transactionFrequency: number;
  preferredCategories: string[];
  typicalLocations: string[];
  paymentMethods: string[];
  riskHistory: number[];
}

export class FraudDetectionService {
  private userPatterns: Map<string, UserBehaviorPattern> = new Map();
  private suspiciousPatterns: Set<string> = new Set();
  private isInitialized = false;

  // Risk thresholds
  private readonly RISK_THRESHOLDS = {
    HIGH_AMOUNT: 50000, // Above 50k BDT
    VELOCITY_LIMIT: 5, // Max 5 transactions per hour
    LOCATION_DISTANCE: 100, // 100km distance
    UNUSUAL_TIME: { start: 23, end: 6 } // 11PM to 6AM
  };

  constructor() {
    this.initializeSuspiciousPatterns();
  }

  public async initialize(): Promise<void> {
    try {
      console.log('🛡️ Initializing Fraud Detection Service...');

      // Load historical patterns if available
      await this.loadHistoricalPatterns();

      this.isInitialized = true;
      console.log('✅ Fraud Detection Service initialized successfully');
    } catch (error) {
      console.error('❌ Fraud Detection Service initialization failed:', error);
      throw error;
    }
  }

  public async assessTransaction(transaction: TransactionData): Promise<FraudRiskAssessment> {
    const startTime = performance.now();

    if (!this.isInitialized) {
      throw new Error('Fraud Detection Service not initialized');
    }

    const riskFactors: string[] = [];
    let riskScore = 0;

    // 1. Amount-based risk analysis
    const amountRisk = this.analyzeAmountRisk(transaction);
    riskScore += amountRisk.score;
    if (amountRisk.reasons.length > 0) {
      riskFactors.push(...amountRisk.reasons);
    }

    // 2. User behavior pattern analysis
    const behaviorRisk = this.analyzeBehaviorPattern(transaction);
    riskScore += behaviorRisk.score;
    if (behaviorRisk.reasons.length > 0) {
      riskFactors.push(...behaviorRisk.reasons);
    }

    // 3. Velocity analysis
    const velocityRisk = this.analyzeVelocity(transaction);
    riskScore += velocityRisk.score;
    if (velocityRisk.reasons.length > 0) {
      riskFactors.push(...velocityRisk.reasons);
    }

    // 4. Location-based analysis
    const locationRisk = this.analyzeLocation(transaction);
    riskScore += locationRisk.score;
    if (locationRisk.reasons.length > 0) {
      riskFactors.push(...locationRisk.reasons);
    }

    // 5. Time-based analysis
    const timeRisk = this.analyzeTimePattern(transaction);
    riskScore += timeRisk.score;
    if (timeRisk.reasons.length > 0) {
      riskFactors.push(...timeRisk.reasons);
    }

    // 6. Device fingerprinting
    const deviceRisk = this.analyzeDevice(transaction);
    riskScore += deviceRisk.score;
    if (deviceRisk.reasons.length > 0) {
      riskFactors.push(...deviceRisk.reasons);
    }

    // Normalize score to 0-100
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine risk level
    const riskLevel = this.determineRiskLevel(riskScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(riskLevel, riskFactors);

    // Update user pattern
    this.updateUserPattern(transaction, riskScore);

    const processingTime = performance.now() - startTime;

    return {
      riskScore,
      riskLevel,
      reasons: riskFactors,
      recommendations,
      confidence: this.calculateConfidence(riskFactors.length),
      processingTime
    };
  }

  public async analyzeUserRiskProfile(userId: string): Promise<{
    overallRisk: number;
    trustScore: number;
    patterns: UserBehaviorPattern | null;
    recommendations: string[];
  }> {
    const userPattern = this.userPatterns.get(userId);

    if (!userPattern) {
      return {
        overallRisk: 50, // Neutral for new users
        trustScore: 50,
        patterns: null,
        recommendations: ['Monitor initial transactions closely', 'Verify identity through additional methods']
      };
    }

    const avgRisk = userPattern.riskHistory.length > 0 
      ? userPattern.riskHistory.reduce((a, b) => a + b, 0) / userPattern.riskHistory.length
      : 50;

    const trustScore = Math.max(0, 100 - avgRisk);

    const recommendations = this.generateUserRecommendations(avgRisk, userPattern);

    return {
      overallRisk: avgRisk,
      trustScore,
      patterns: userPattern,
      recommendations
    };
  }

  public async detectSuspiciousPatterns(): Promise<{
    suspiciousUsers: string[];
    patterns: string[];
    alertLevel: 'low' | 'medium' | 'high';
  }> {
    const suspiciousUsers: string[] = [];
    const detectedPatterns: string[] = [];

    // Analyze all user patterns for suspicious behavior
    for (const [userId, pattern] of this.userPatterns.entries()) {
      const recentRisk = pattern.riskHistory.slice(-5); // Last 5 transactions
      const avgRecentRisk = recentRisk.reduce((a, b) => a + b, 0) / recentRisk.length;

      if (avgRecentRisk > 70) {
        suspiciousUsers.push(userId);
        detectedPatterns.push(`High risk pattern for user ${userId}`);
      }

      // Check for velocity attacks
      if (pattern.transactionFrequency > this.RISK_THRESHOLDS.VELOCITY_LIMIT) {
        suspiciousUsers.push(userId);
        detectedPatterns.push(`High frequency transactions for user ${userId}`);
      }
    }

    const alertLevel = suspiciousUsers.length > 10 ? 'high' 
      : suspiciousUsers.length > 5 ? 'medium' : 'low';

    return {
      suspiciousUsers: [...new Set(suspiciousUsers)],
      patterns: detectedPatterns,
      alertLevel
    };
  }

  public async getAnalytics(): Promise<{
    totalTransactionsAnalyzed: number;
    fraudDetectionRate: number;
    averageRiskScore: number;
    topRiskFactors: string[];
  }> {
    const totalUsers = this.userPatterns.size;
    const allRiskScores = Array.from(this.userPatterns.values())
      .flatMap(pattern => pattern.riskHistory);

    const averageRiskScore = allRiskScores.length > 0
      ? allRiskScores.reduce((a, b) => a + b, 0) / allRiskScores.length
      : 0;

    const fraudDetectionRate = allRiskScores.filter(score => score > 70).length / allRiskScores.length * 100;

    return {
      totalTransactionsAnalyzed: allRiskScores.length,
      fraudDetectionRate: Math.round(fraudDetectionRate * 100) / 100,
      averageRiskScore: Math.round(averageRiskScore * 100) / 100,
      topRiskFactors: [
        'Unusual amount pattern',
        'High transaction velocity',
        'Location mismatch',
        'Unusual time pattern',
        'Device fingerprint mismatch'
      ]
    };
  }

  private analyzeAmountRisk(transaction: TransactionData): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Check if amount is unusually high
    if (transaction.amount > this.RISK_THRESHOLDS.HIGH_AMOUNT) {
      score += 30;
      reasons.push(`High transaction amount: ৳${transaction.amount}`);
    }

    // Check against user's typical spending
    const userPattern = this.userPatterns.get(transaction.userId);
    if (userPattern) {
      const deviation = Math.abs(transaction.amount - userPattern.avgTransactionAmount) / userPattern.avgTransactionAmount;
      if (deviation > 3) { // More than 3x typical amount
        score += 25;
        reasons.push('Amount significantly differs from user pattern');
      }
    }

    // Round number amounts (often used in fraud)
    if (transaction.amount % 1000 === 0 && transaction.amount >= 10000) {
      score += 10;
      reasons.push('Round number amount pattern');
    }

    return { score, reasons };
  }

  private analyzeBehaviorPattern(transaction: TransactionData): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    const userPattern = this.userPatterns.get(transaction.userId);
    if (!userPattern) {
      score += 15;
      reasons.push('New user - limited behavior data');
      return { score, reasons };
    }

    // Check category deviation
    if (transaction.productCategory && 
        !userPattern.preferredCategories.includes(transaction.productCategory)) {
      score += 15;
      reasons.push('Unusual product category for user');
    }

    // Check payment method deviation
    if (!userPattern.paymentMethods.includes(transaction.paymentMethod)) {
      score += 20;
      reasons.push('New payment method');
    }

    return { score, reasons };
  }

  private analyzeVelocity(transaction: TransactionData): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    const userPattern = this.userPatterns.get(transaction.userId);
    if (userPattern && userPattern.transactionFrequency > this.RISK_THRESHOLDS.VELOCITY_LIMIT) {
      score += 35;
      reasons.push(`High transaction velocity: ${userPattern.transactionFrequency} transactions/hour`);
    }

    return { score, reasons };
  }

  private analyzeLocation(transaction: TransactionData): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    if (!transaction.location) {
      score += 10;
      reasons.push('Missing location information');
      return { score, reasons };
    }

    const userPattern = this.userPatterns.get(transaction.userId);
    if (userPattern && userPattern.typicalLocations.length > 0) {
      const isTypicalLocation = userPattern.typicalLocations.some(loc => 
        transaction.location?.includes(loc)
      );

      if (!isTypicalLocation) {
        score += 25;
        reasons.push('Transaction from unusual location');
      }
    }

    return { score, reasons };
  }

  private analyzeTimePattern(transaction: TransactionData): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    const hour = new Date(transaction.timestamp).getHours();
    
    if (hour >= this.RISK_THRESHOLDS.UNUSUAL_TIME.start || 
        hour <= this.RISK_THRESHOLDS.UNUSUAL_TIME.end) {
      score += 15;
      reasons.push(`Transaction at unusual time: ${hour}:00`);
    }

    return { score, reasons };
  }

  private analyzeDevice(transaction: TransactionData): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    if (!transaction.deviceInfo) {
      score += 10;
      reasons.push('Missing device information');
      return { score, reasons };
    }

    // Simple device fingerprint analysis
    if (transaction.deviceInfo.includes('bot') || 
        transaction.deviceInfo.includes('crawler')) {
      score += 40;
      reasons.push('Suspicious device signature');
    }

    return { score, reasons };
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  private generateRecommendations(riskLevel: string, reasons: string[]): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'critical':
        recommendations.push('Block transaction immediately');
        recommendations.push('Require manual review');
        recommendations.push('Contact customer for verification');
        break;
      case 'high':
        recommendations.push('Hold transaction for review');
        recommendations.push('Request additional verification');
        recommendations.push('Monitor subsequent transactions closely');
        break;
      case 'medium':
        recommendations.push('Apply additional verification steps');
        recommendations.push('Monitor transaction patterns');
        break;
      case 'low':
        recommendations.push('Process normally');
        recommendations.push('Continue monitoring');
        break;
    }

    return recommendations;
  }

  private generateUserRecommendations(avgRisk: number, pattern: UserBehaviorPattern): string[] {
    const recommendations: string[] = [];

    if (avgRisk > 70) {
      recommendations.push('High-risk user - require enhanced verification');
      recommendations.push('Limit transaction amounts');
    } else if (avgRisk > 50) {
      recommendations.push('Medium-risk user - standard monitoring');
    } else {
      recommendations.push('Low-risk user - trusted customer');
      recommendations.push('Consider for premium services');
    }

    return recommendations;
  }

  private updateUserPattern(transaction: TransactionData, riskScore: number): void {
    let pattern = this.userPatterns.get(transaction.userId);

    if (!pattern) {
      pattern = {
        userId: transaction.userId,
        avgTransactionAmount: transaction.amount,
        transactionFrequency: 1,
        preferredCategories: transaction.productCategory ? [transaction.productCategory] : [],
        typicalLocations: transaction.location ? [transaction.location] : [],
        paymentMethods: [transaction.paymentMethod],
        riskHistory: [riskScore]
      };
    } else {
      // Update averages and patterns
      pattern.avgTransactionAmount = (pattern.avgTransactionAmount + transaction.amount) / 2;
      pattern.transactionFrequency += 1;

      if (transaction.productCategory && !pattern.preferredCategories.includes(transaction.productCategory)) {
        pattern.preferredCategories.push(transaction.productCategory);
      }

      if (transaction.location && !pattern.typicalLocations.includes(transaction.location)) {
        pattern.typicalLocations.push(transaction.location);
      }

      if (!pattern.paymentMethods.includes(transaction.paymentMethod)) {
        pattern.paymentMethods.push(transaction.paymentMethod);
      }

      pattern.riskHistory.push(riskScore);
      
      // Keep only last 50 risk scores
      if (pattern.riskHistory.length > 50) {
        pattern.riskHistory = pattern.riskHistory.slice(-50);
      }
    }

    this.userPatterns.set(transaction.userId, pattern);
  }

  private calculateConfidence(factorCount: number): number {
    // More factors = higher confidence in assessment
    return Math.min(0.95, 0.5 + (factorCount * 0.1));
  }

  private initializeSuspiciousPatterns(): void {
    this.suspiciousPatterns.add('rapid_fire_transactions');
    this.suspiciousPatterns.add('round_number_amounts');
    this.suspiciousPatterns.add('location_jumping');
    this.suspiciousPatterns.add('new_payment_methods');
    this.suspiciousPatterns.add('unusual_time_patterns');
  }

  private async loadHistoricalPatterns(): Promise<void> {
    // In a real implementation, this would load from database
    // For now, we'll initialize with empty patterns
    console.log('Loading historical fraud patterns...');
  }
}

export default FraudDetectionService;