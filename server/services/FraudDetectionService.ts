import { db } from "../db";
import { 
  fraudDetectionLogs, 
  orders, 
  users, 
  userBehaviors, 
  userSessions 
} from "@shared/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { redisService } from "./RedisService";

interface RiskFactor {
  type: string;
  score: number;
  description: string;
}

interface FraudAnalysisResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  action: 'allow' | 'review' | 'block' | 'alert';
  recommendation: string;
}

export class FraudDetectionService {
  private riskThresholds = {
    low: 0.3,
    medium: 0.6,
    high: 0.8,
    critical: 0.9
  };

  // Main fraud detection analysis
  async analyzeTransaction(transactionData: {
    userId?: number;
    orderId?: string;
    amount: number;
    paymentMethod: string;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint?: string;
    shippingAddress: any;
    billingAddress: any;
  }): Promise<FraudAnalysisResult> {
    
    const riskFactors: RiskFactor[] = [];
    let totalRiskScore = 0;

    // Analyze various risk factors
    const analyses = await Promise.all([
      this.analyzeUserBehavior(transactionData.userId, transactionData.ipAddress),
      this.analyzeTransactionAmount(transactionData.amount, transactionData.userId),
      this.analyzeDeviceFingerprint(transactionData.deviceFingerprint, transactionData.userId),
      this.analyzeGeographicLocation(transactionData.ipAddress, transactionData.shippingAddress),
      this.analyzePaymentMethod(transactionData.paymentMethod, transactionData.userId),
      this.analyzeTimePattern(transactionData.userId),
      this.analyzeAddressConsistency(transactionData.shippingAddress, transactionData.billingAddress)
    ]);

    analyses.forEach(analysis => {
      if (analysis) {
        riskFactors.push(...analysis.riskFactors);
        totalRiskScore += analysis.score;
      }
    });

    // Normalize risk score (0-1)
    const normalizedScore = Math.min(totalRiskScore / 10, 1);
    
    const result: FraudAnalysisResult = {
      riskScore: normalizedScore,
      riskLevel: this.calculateRiskLevel(normalizedScore),
      riskFactors,
      action: this.determineAction(normalizedScore),
      recommendation: this.generateRecommendation(normalizedScore, riskFactors)
    };

    // Log the fraud detection result
    await this.logFraudDetection(transactionData, result);

    return result;
  }

  // Analyze user behavior patterns
  private async analyzeUserBehavior(userId?: number, ipAddress?: string) {
    if (!userId) return null;

    const riskFactors: RiskFactor[] = [];
    let score = 0;

    try {
      // Check for multiple accounts from same IP
      const recentSessions = await db
        .select({ userId: userSessions.userId })
        .from(userSessions)
        .where(
          and(
            eq(userSessions.ipAddress, ipAddress || ''),
            gte(userSessions.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
          )
        );

      const uniqueUsers = new Set(recentSessions.map(s => s.userId)).size;
      if (uniqueUsers > 3) {
        riskFactors.push({
          type: 'multiple_accounts',
          score: 0.3,
          description: `Multiple accounts (${uniqueUsers}) from same IP in 24h`
        });
        score += 0.3;
      }

      // Check for rapid successive orders
      const recentOrders = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.userId, userId),
            gte(orders.createdAt, new Date(Date.now() - 60 * 60 * 1000)) // Last hour
          )
        );

      if (recentOrders.length > 5) {
        riskFactors.push({
          type: 'rapid_orders',
          score: 0.4,
          description: `${recentOrders.length} orders in last hour`
        });
        score += 0.4;
      }

      // Check for new user with high-value transaction
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length > 0) {
        const accountAge = Date.now() - new Date(user[0].createdAt).getTime();
        const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
        
        if (daysSinceCreation < 1) {
          riskFactors.push({
            type: 'new_account',
            score: 0.2,
            description: 'Account created less than 24 hours ago'
          });
          score += 0.2;
        }
      }

      return { riskFactors, score };
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
      return null;
    }
  }

  // Analyze transaction amount patterns
  private async analyzeTransactionAmount(amount: number, userId?: number) {
    const riskFactors: RiskFactor[] = [];
    let score = 0;

    try {
      if (userId) {
        // Get user's historical spending pattern
        const historicalOrders = await db
          .select({ total: orders.total })
          .from(orders)
          .where(eq(orders.userId, userId))
          .orderBy(desc(orders.createdAt))
          .limit(20);

        if (historicalOrders.length > 0) {
          const amounts = historicalOrders.map(o => parseFloat(o.total));
          const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
          const maxAmount = Math.max(...amounts);

          // Check if current amount is significantly higher than usual
          if (amount > avgAmount * 5) {
            riskFactors.push({
              type: 'unusual_amount',
              score: 0.3,
              description: `Amount ${amount} is 5x higher than average ${avgAmount.toFixed(2)}`
            });
            score += 0.3;
          }

          if (amount > maxAmount * 2) {
            riskFactors.push({
              type: 'highest_amount',
              score: 0.2,
              description: `Amount exceeds previous maximum by 2x`
            });
            score += 0.2;
          }
        }
      }

      // Check for suspiciously high amounts
      if (amount > 100000) { // 1 lakh BDT
        riskFactors.push({
          type: 'high_value',
          score: 0.3,
          description: `High-value transaction: ${amount} BDT`
        });
        score += 0.3;
      }

      return { riskFactors, score };
    } catch (error) {
      console.error('Error analyzing transaction amount:', error);
      return null;
    }
  }

  // Analyze device fingerprint consistency
  private async analyzeDeviceFingerprint(fingerprint?: string, userId?: number) {
    if (!fingerprint || !userId) return null;

    const riskFactors: RiskFactor[] = [];
    let score = 0;

    try {
      // Check if this device has been used by multiple users
      const deviceUsers = await db
        .select({ userId: fraudDetectionLogs.userId })
        .from(fraudDetectionLogs)
        .where(eq(fraudDetectionLogs.deviceFingerprint, fingerprint));

      const uniqueUsers = new Set(deviceUsers.map(u => u.userId)).size;
      
      if (uniqueUsers > 3) {
        riskFactors.push({
          type: 'shared_device',
          score: 0.4,
          description: `Device used by ${uniqueUsers} different users`
        });
        score += 0.4;
      }

      return { riskFactors, score };
    } catch (error) {
      console.error('Error analyzing device fingerprint:', error);
      return null;
    }
  }

  // Analyze geographic location consistency
  private async analyzeGeographicLocation(ipAddress: string, shippingAddress: any) {
    const riskFactors: RiskFactor[] = [];
    let score = 0;

    try {
      // This would integrate with a GeoIP service in production
      // For now, we'll do basic checks

      // Check if IP is from a known proxy/VPN range (simplified)
      const suspiciousIPPatterns = [
        /^10\./, // Private network
        /^192\.168\./, // Private network
        /^172\.1[6-9]\./, // Private network
        /^172\.2[0-9]\./, // Private network
        /^172\.3[0-1]\./ // Private network
      ];

      const isSuspiciousIP = suspiciousIPPatterns.some(pattern => pattern.test(ipAddress));
      
      if (isSuspiciousIP) {
        riskFactors.push({
          type: 'suspicious_ip',
          score: 0.2,
          description: 'IP address from suspicious range'
        });
        score += 0.2;
      }

      // Check for international transactions (simplified)
      if (shippingAddress && shippingAddress.country && shippingAddress.country !== 'BD') {
        riskFactors.push({
          type: 'international_shipping',
          score: 0.1,
          description: `Shipping to ${shippingAddress.country}`
        });
        score += 0.1;
      }

      return { riskFactors, score };
    } catch (error) {
      console.error('Error analyzing geographic location:', error);
      return null;
    }
  }

  // Analyze payment method risk
  private async analyzePaymentMethod(paymentMethod: string, userId?: number) {
    const riskFactors: RiskFactor[] = [];
    let score = 0;

    try {
      // COD has higher fraud risk
      if (paymentMethod === 'cod') {
        riskFactors.push({
          type: 'cod_payment',
          score: 0.1,
          description: 'Cash on delivery payment method'
        });
        score += 0.1;
      }

      // Check for payment method switching patterns
      if (userId) {
        const recentOrders = await db
          .select({ paymentMethod: orders.paymentMethod })
          .from(orders)
          .where(eq(orders.userId, userId))
          .orderBy(desc(orders.createdAt))
          .limit(10);

        const uniquePaymentMethods = new Set(recentOrders.map(o => o.paymentMethod)).size;
        
        if (uniquePaymentMethods > 3) {
          riskFactors.push({
            type: 'payment_method_switching',
            score: 0.2,
            description: `Used ${uniquePaymentMethods} different payment methods recently`
          });
          score += 0.2;
        }
      }

      return { riskFactors, score };
    } catch (error) {
      console.error('Error analyzing payment method:', error);
      return null;
    }
  }

  // Analyze time-based patterns
  private async analyzeTimePattern(userId?: number) {
    if (!userId) return null;

    const riskFactors: RiskFactor[] = [];
    let score = 0;

    try {
      const currentHour = new Date().getHours();
      
      // Transactions during unusual hours (2 AM - 5 AM Bangladesh time)
      if (currentHour >= 2 && currentHour <= 5) {
        riskFactors.push({
          type: 'unusual_hour',
          score: 0.1,
          description: `Transaction at ${currentHour}:00 (unusual hour)`
        });
        score += 0.1;
      }

      return { riskFactors, score };
    } catch (error) {
      console.error('Error analyzing time pattern:', error);
      return null;
    }
  }

  // Analyze address consistency
  private async analyzeAddressConsistency(shippingAddress: any, billingAddress: any) {
    const riskFactors: RiskFactor[] = [];
    let score = 0;

    try {
      if (shippingAddress && billingAddress) {
        // Check if addresses are completely different
        const shippingCountry = shippingAddress.country || '';
        const billingCountry = billingAddress.country || '';
        
        if (shippingCountry !== billingCountry) {
          riskFactors.push({
            type: 'address_mismatch',
            score: 0.2,
            description: 'Shipping and billing addresses in different countries'
          });
          score += 0.2;
        }

        // Check for PO Box or suspicious address patterns
        const addressText = (shippingAddress.street || '').toLowerCase();
        if (addressText.includes('po box') || addressText.includes('p.o. box')) {
          riskFactors.push({
            type: 'po_box_address',
            score: 0.1,
            description: 'Shipping to PO Box'
          });
          score += 0.1;
        }
      }

      return { riskFactors, score };
    } catch (error) {
      console.error('Error analyzing address consistency:', error);
      return null;
    }
  }

  // Calculate risk level based on score
  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.riskThresholds.critical) return 'critical';
    if (score >= this.riskThresholds.high) return 'high';
    if (score >= this.riskThresholds.medium) return 'medium';
    return 'low';
  }

  // Determine action based on risk score
  private determineAction(score: number): 'allow' | 'review' | 'block' | 'alert' {
    if (score >= this.riskThresholds.critical) return 'block';
    if (score >= this.riskThresholds.high) return 'review';
    if (score >= this.riskThresholds.medium) return 'alert';
    return 'allow';
  }

  // Generate recommendation based on analysis
  private generateRecommendation(score: number, riskFactors: RiskFactor[]): string {
    if (score >= this.riskThresholds.critical) {
      return 'Block transaction immediately and flag for investigation';
    }
    if (score >= this.riskThresholds.high) {
      return 'Hold transaction for manual review before processing';
    }
    if (score >= this.riskThresholds.medium) {
      return 'Monitor transaction closely and alert fraud team';
    }
    return 'Proceed with normal processing';
  }

  // Log fraud detection results
  private async logFraudDetection(transactionData: any, result: FraudAnalysisResult) {
    try {
      await db.insert(fraudDetectionLogs).values({
        userId: transactionData.userId || null,
        orderId: transactionData.orderId || null,
        eventType: 'transaction',
        riskScore: result.riskScore,
        riskFactors: result.riskFactors,
        action: result.action,
        reviewStatus: result.action === 'review' ? 'pending' : null,
        ipAddress: transactionData.ipAddress,
        deviceFingerprint: transactionData.deviceFingerprint || null,
      });

      // Cache high-risk events for real-time monitoring
      if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
        await redisService.storeAnalyticsEvent({
          type: 'high_risk_transaction',
          userId: transactionData.userId,
          riskScore: result.riskScore,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error logging fraud detection:', error);
    }
  }

  // Get fraud statistics for dashboard
  async getFraudStatistics(timeframe = '24h') {
    try {
      const timeCondition = timeframe === '24h' 
        ? gte(fraudDetectionLogs.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
        : gte(fraudDetectionLogs.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

      const stats = await db
        .select({
          action: fraudDetectionLogs.action,
          count: sql<number>`count(*)`,
          avgRiskScore: sql<number>`avg(${fraudDetectionLogs.riskScore})`
        })
        .from(fraudDetectionLogs)
        .where(timeCondition)
        .groupBy(fraudDetectionLogs.action);

      const totalEvents = stats.reduce((sum, stat) => sum + stat.count, 0);
      
      return {
        totalEvents,
        breakdown: stats,
        riskDistribution: {
          low: stats.filter(s => s.avgRiskScore < 0.3).reduce((sum, s) => sum + s.count, 0),
          medium: stats.filter(s => s.avgRiskScore >= 0.3 && s.avgRiskScore < 0.6).reduce((sum, s) => sum + s.count, 0),
          high: stats.filter(s => s.avgRiskScore >= 0.6).reduce((sum, s) => sum + s.count, 0)
        }
      };
    } catch (error) {
      console.error('Error getting fraud statistics:', error);
      return null;
    }
  }

  // Real-time risk monitoring for user sessions
  async monitorUserSession(userId: number, sessionData: any) {
    try {
      // Track session behavior for pattern analysis
      const behaviorData = {
        userId: userId.toString(),
        sessionId: sessionData.sessionId,
        eventType: 'session_activity',
        eventData: {
          pageViews: sessionData.pageViews || 0,
          timeSpent: sessionData.timeSpent || 0,
          clickPattern: sessionData.clickPattern || [],
          deviceInfo: sessionData.deviceInfo || {}
        },
        createdAt: new Date()
      };

      await db.insert(userBehaviors).values(behaviorData);

      // Check for suspicious session patterns
      if (sessionData.rapidClicking || sessionData.unusualNavigation) {
        await redisService.storeAnalyticsEvent({
          type: 'suspicious_session',
          userId,
          sessionId: sessionData.sessionId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error monitoring user session:', error);
    }
  }
}

export const fraudDetectionService = new FraudDetectionService();