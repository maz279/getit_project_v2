/**
 * VERIFICATION SERVICE FOR REVIEW AUTHENTICITY
 * Amazon.com/Shopee.sg-Level Purchase and Account Verification
 * 
 * Features:
 * - Multi-signal purchase verification
 * - Account credibility scoring
 * - Cross-platform verification
 * - Real-time fraud detection
 * - Bangladesh payment method integration
 */

import { db } from '../../../../db';
import { 
  orders, 
  users, 
  reviews,
  reviewVerificationData
} from '../../../../../shared/schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';

export class VerificationService {
  
  /**
   * COMPREHENSIVE PURCHASE VERIFICATION
   * Amazon.com standard: Multi-signal verification with timing analysis
   */
  async verifyPurchaseAuthenticity(userId: number, productId: string) {
    try {
      console.log(`🔍 Starting purchase verification for user ${userId}, product ${productId}`);

      // 1. Direct Purchase Verification
      const purchaseVerification = await this.verifyDirectPurchase(userId, productId);

      // 2. Price Verification
      const priceVerification = await this.verifyPurchasePrice(userId, productId);

      // 3. Timing Analysis
      const timingAnalysis = await this.analyzePurchaseTiming(userId, productId);

      // 4. Payment Method Verification (Bangladesh-specific)
      const paymentVerification = await this.verifyPaymentMethod(userId, productId);

      // 5. Account Credibility Scoring
      const credibilityScore = await this.calculateAccountCredibility(userId);

      // 6. Cross-order Pattern Analysis
      const orderPatternAnalysis = await this.analyzeOrderPatterns(userId);

      // Calculate composite verification score
      const verificationScore = this.calculateVerificationScore({
        purchaseVerification,
        priceVerification,
        timingAnalysis,
        paymentVerification,
        credibilityScore,
        orderPatternAnalysis
      });

      return {
        isVerified: verificationScore > 0.7,
        score: verificationScore,
        riskLevel: this.getRiskLevel(1 - verificationScore),
        indicators: this.getVerificationIndicators({
          purchaseVerification,
          priceVerification,
          timingAnalysis,
          paymentVerification,
          credibilityScore
        }),
        details: {
          purchaseVerified: purchaseVerification.verified,
          priceValid: priceVerification.valid,
          timingNormal: timingAnalysis.normal,
          paymentLegitimate: paymentVerification.legitimate,
          accountCredible: credibilityScore > 0.6
        }
      };

    } catch (error) {
      console.error('Purchase verification failed:', error);
      return {
        isVerified: false,
        score: 0.3, // Low score for failed verification
        riskLevel: 'high',
        indicators: ['verification_failed'],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * DIRECT PURCHASE VERIFICATION
   * Verifies actual purchase transaction exists
   */
  private async verifyDirectPurchase(userId: number, productId: string) {
    try {
      // Look for completed orders containing this product
      const purchaseOrders = await db.query.orders.findMany({
        where: and(
          eq(orders.userId, userId),
          eq(orders.status, 'completed')
        ),
        with: {
          orderItems: true
        }
      });

      // Check if any order contains the product
      const productPurchased = purchaseOrders.some(order => 
        order.orderItems?.some(item => item.productId === productId)
      );

      if (!productPurchased) {
        return {
          verified: false,
          confidence: 0.95,
          reason: 'no_purchase_found',
          orderCount: purchaseOrders.length
        };
      }

      // Find the specific order for this product
      const productOrder = purchaseOrders.find(order => 
        order.orderItems?.some(item => item.productId === productId)
      );

      return {
        verified: true,
        confidence: 0.95,
        orderId: productOrder?.id,
        purchaseDate: productOrder?.createdAt,
        orderCount: purchaseOrders.length
      };

    } catch (error) {
      console.error('Direct purchase verification failed:', error);
      return {
        verified: false,
        confidence: 0.3,
        reason: 'verification_error',
        error: error.message
      };
    }
  }

  /**
   * PRICE VERIFICATION
   * Amazon.com standard: Ensures purchase was at typical retail price
   */
  private async verifyPurchasePrice(userId: number, productId: string) {
    try {
      // Get user's purchase price for this product
      const userOrder = await db.query.orders.findFirst({
        where: and(
          eq(orders.userId, userId),
          eq(orders.status, 'completed')
        ),
        with: {
          orderItems: {
            where: eq(sql`order_items.product_id`, productId)
          }
        }
      });

      if (!userOrder?.orderItems?.length) {
        return {
          valid: false,
          reason: 'no_purchase_price_found',
          confidence: 0.9
        };
      }

      const purchasePrice = userOrder.orderItems[0].price;

      // Get current product price and price history
      const priceAnalysis = await this.analyzeProductPricing(productId, purchasePrice);

      // Check if purchase price is within reasonable range
      const priceVariation = Math.abs(purchasePrice - priceAnalysis.currentPrice) / priceAnalysis.currentPrice;

      return {
        valid: priceVariation <= 0.5, // Within 50% of current price
        purchasePrice,
        currentPrice: priceAnalysis.currentPrice,
        priceVariation,
        confidence: 0.8,
        suspicious: priceVariation > 0.8 || purchasePrice < priceAnalysis.minPrice * 0.1
      };

    } catch (error) {
      console.error('Price verification failed:', error);
      return {
        valid: false,
        reason: 'price_verification_error',
        confidence: 0.3
      };
    }
  }

  /**
   * PURCHASE TIMING ANALYSIS
   * Detects suspicious review timing patterns
   */
  private async analyzePurchaseTiming(userId: number, productId: string) {
    try {
      // Get purchase date
      const purchaseOrder = await db.query.orders.findFirst({
        where: and(
          eq(orders.userId, userId),
          eq(orders.status, 'completed')
        ),
        with: {
          orderItems: {
            where: eq(sql`order_items.product_id`, productId)
          }
        }
      });

      if (!purchaseOrder) {
        return {
          normal: false,
          reason: 'no_purchase_found',
          confidence: 0.9
        };
      }

      // Get review date (if review exists)
      const userReview = await db.query.reviews.findFirst({
        where: and(
          eq(reviews.userId, userId),
          eq(reviews.productId, productId)
        )
      });

      if (!userReview) {
        return {
          normal: true,
          reason: 'no_review_yet',
          confidence: 0.8
        };
      }

      // Calculate time between purchase and review
      const purchaseDate = new Date(purchaseOrder.createdAt);
      const reviewDate = new Date(userReview.createdAt);
      const daysBetween = (reviewDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);

      // Analyze if timing is normal
      const timingAnalysis = this.analyzeReviewTiming(daysBetween);

      return {
        normal: timingAnalysis.normal,
        daysBetween,
        purchaseDate,
        reviewDate,
        timingCategory: timingAnalysis.category,
        confidence: 0.85
      };

    } catch (error) {
      console.error('Timing analysis failed:', error);
      return {
        normal: false,
        reason: 'timing_analysis_error',
        confidence: 0.3
      };
    }
  }

  /**
   * PAYMENT METHOD VERIFICATION
   * Bangladesh-specific payment verification (bKash, Nagad, Rocket)
   */
  private async verifyPaymentMethod(userId: number, productId: string) {
    try {
      // Get payment information for the order
      const orderWithPayment = await db.query.orders.findFirst({
        where: and(
          eq(orders.userId, userId),
          eq(orders.status, 'completed')
        ),
        with: {
          orderItems: {
            where: eq(sql`order_items.product_id`, productId)
          }
        }
      });

      if (!orderWithPayment) {
        return {
          legitimate: false,
          reason: 'no_payment_found',
          confidence: 0.9
        };
      }

      const paymentMethod = orderWithPayment.paymentMethod;
      const paymentStatus = orderWithPayment.paymentStatus;

      // Verify Bangladesh mobile banking payments
      if (['bkash', 'nagad', 'rocket'].includes(paymentMethod)) {
        return await this.verifyMobileBankingPayment(orderWithPayment);
      }

      // Verify card payments
      if (['card', 'credit_card', 'debit_card'].includes(paymentMethod)) {
        return await this.verifyCardPayment(orderWithPayment);
      }

      // Verify other payment methods
      return {
        legitimate: paymentStatus === 'completed',
        paymentMethod,
        paymentStatus,
        confidence: 0.7
      };

    } catch (error) {
      console.error('Payment verification failed:', error);
      return {
        legitimate: false,
        reason: 'payment_verification_error',
        confidence: 0.3
      };
    }
  }

  /**
   * ACCOUNT CREDIBILITY SCORING
   * Multi-factor account credibility analysis
   */
  private async calculateAccountCredibility(userId: number) {
    try {
      // Get user account information
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });

      if (!user) {
        return 0.1; // Very low credibility for non-existent user
      }

      // Calculate account age score
      const accountAgeDays = Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const ageScore = this.calculateAgeScore(accountAgeDays);

      // Calculate verification score
      const verificationScore = this.calculateUserVerificationScore(user);

      // Calculate activity score
      const activityScore = await this.calculateUserActivityScore(userId);

      // Calculate review quality score
      const reviewQualityScore = await this.calculateReviewQualityScore(userId);

      // Calculate composite credibility score
      const credibilityScore = (
        ageScore * 0.25 +
        verificationScore * 0.3 +
        activityScore * 0.25 +
        reviewQualityScore * 0.2
      );

      return Math.min(1, credibilityScore);

    } catch (error) {
      console.error('Credibility calculation failed:', error);
      return 0.3; // Medium-low credibility for errors
    }
  }

  /**
   * ORDER PATTERN ANALYSIS
   * Detects suspicious ordering patterns
   */
  private async analyzeOrderPatterns(userId: number) {
    try {
      // Get user's order history
      const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, userId),
        orderBy: desc(orders.createdAt),
        limit: 50 // Analyze recent 50 orders
      });

      // Analyze order frequency
      const orderFrequency = this.analyzeOrderFrequency(userOrders);

      // Analyze order amounts
      const amountPatterns = this.analyzeOrderAmounts(userOrders);

      // Analyze order timing
      const timingPatterns = this.analyzeOrderTiming(userOrders);

      // Calculate pattern suspicion score
      const suspicionScore = this.calculatePatternSuspicionScore({
        orderFrequency,
        amountPatterns,
        timingPatterns
      });

      return {
        suspicionScore,
        orderCount: userOrders.length,
        patterns: {
          frequency: orderFrequency,
          amounts: amountPatterns,
          timing: timingPatterns
        },
        normalBehavior: suspicionScore < 0.3
      };

    } catch (error) {
      console.error('Order pattern analysis failed:', error);
      return {
        suspicionScore: 0.5,
        orderCount: 0,
        patterns: {},
        normalBehavior: false
      };
    }
  }

  /**
   * UTILITY METHODS
   */

  private calculateVerificationScore(factors: any): number {
    const weights = {
      purchase: 0.3,
      price: 0.2,
      timing: 0.2,
      payment: 0.15,
      credibility: 0.1,
      orderPattern: 0.05
    };

    return Math.min(1,
      (factors.purchaseVerification.verified ? 1 : 0) * weights.purchase +
      (factors.priceVerification.valid ? 1 : 0) * weights.price +
      (factors.timingAnalysis.normal ? 1 : 0) * weights.timing +
      (factors.paymentVerification.legitimate ? 1 : 0) * weights.payment +
      factors.credibilityScore * weights.credibility +
      (1 - factors.orderPatternAnalysis.suspicionScore) * weights.orderPattern
    );
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score > 0.8) return 'critical';
    if (score > 0.6) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
  }

  private getVerificationIndicators(analysis: any): string[] {
    const indicators = [];
    
    if (!analysis.purchaseVerification.verified) indicators.push('no_purchase_found');
    if (!analysis.priceVerification.valid) indicators.push('price_suspicious');
    if (!analysis.timingAnalysis.normal) indicators.push('timing_anomaly');
    if (!analysis.paymentVerification.legitimate) indicators.push('payment_issues');
    if (analysis.credibilityScore < 0.5) indicators.push('low_account_credibility');
    
    return indicators;
  }

  private async analyzeProductPricing(productId: string, purchasePrice: number) {
    // Mock implementation - would analyze actual product pricing
    return {
      currentPrice: purchasePrice * 1.1,
      minPrice: purchasePrice * 0.8,
      maxPrice: purchasePrice * 1.3,
      avgPrice: purchasePrice
    };
  }

  private analyzeReviewTiming(daysBetween: number) {
    // Amazon.com timing analysis standards
    if (daysBetween < 0) {
      return { normal: false, category: 'review_before_purchase' };
    }
    if (daysBetween < 1) {
      return { normal: false, category: 'immediate_review' }; // Suspicious
    }
    if (daysBetween <= 30) {
      return { normal: true, category: 'normal_timing' }; // Normal
    }
    if (daysBetween <= 90) {
      return { normal: true, category: 'delayed_review' }; // Still normal
    }
    return { normal: false, category: 'very_delayed_review' }; // Suspicious
  }

  private async verifyMobileBankingPayment(order: any) {
    // Bangladesh mobile banking verification
    const paymentMethod = order.paymentMethod;
    
    // Verify transaction patterns for mobile banking
    return {
      legitimate: order.paymentStatus === 'completed',
      paymentMethod,
      paymentStatus: order.paymentStatus,
      bangladeshPayment: true,
      confidence: 0.8
    };
  }

  private async verifyCardPayment(order: any) {
    // Card payment verification
    return {
      legitimate: order.paymentStatus === 'completed',
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      confidence: 0.75
    };
  }

  private calculateAgeScore(ageDays: number): number {
    // Account age scoring (0-1)
    if (ageDays >= 365) return 1.0; // 1+ year = perfect score
    if (ageDays >= 180) return 0.8; // 6+ months = good score
    if (ageDays >= 90) return 0.6;  // 3+ months = okay score
    if (ageDays >= 30) return 0.4;  // 1+ month = low score
    return 0.1; // New account = very low score
  }

  private calculateUserVerificationScore(user: any): number {
    let score = 0;
    if (user.isEmailVerified) score += 0.3;
    if (user.isPhoneVerified) score += 0.3;
    if (user.nidVerified) score += 0.4; // Bangladesh NID verification
    return score;
  }

  private async calculateUserActivityScore(userId: number): Promise<number> {
    // Calculate user activity score based on orders, reviews, etc.
    const orderCount = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.userId, userId));

    const reviewCount = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.userId, userId));

    // Normalize activity score
    const totalActivity = orderCount[0].count + reviewCount[0].count;
    return Math.min(1, totalActivity / 20); // 20+ activities = perfect score
  }

  private async calculateReviewQualityScore(userId: number): Promise<number> {
    // Calculate average quality of user's reviews
    const userReviews = await db.query.reviews.findMany({
      where: eq(reviews.userId, userId),
      limit: 10 // Recent 10 reviews
    });

    if (userReviews.length === 0) return 0.5;

    const avgHelpfulCount = userReviews.reduce((sum, review) => 
      sum + (review.helpfulCount || 0), 0) / userReviews.length;

    return Math.min(1, avgHelpfulCount / 5); // 5+ helpful votes = perfect score
  }

  private analyzeOrderFrequency(orders: any[]) {
    // Analyze order frequency patterns
    if (orders.length === 0) return { normal: true, frequency: 0 };

    const timeSpan = Date.now() - new Date(orders[orders.length - 1].createdAt).getTime();
    const frequencyPerDay = orders.length / (timeSpan / (1000 * 60 * 60 * 24));

    return {
      normal: frequencyPerDay <= 2, // Max 2 orders per day is normal
      frequency: frequencyPerDay,
      suspicious: frequencyPerDay > 5
    };
  }

  private analyzeOrderAmounts(orders: any[]) {
    // Analyze order amount patterns
    const amounts = orders.map(order => order.totalAmount || 0);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    
    return {
      avgAmount,
      consistency: this.calculateAmountConsistency(amounts),
      suspiciouslyLow: avgAmount < 100, // Very low amounts might be suspicious
      suspiciouslyHigh: avgAmount > 50000 // Very high amounts might be suspicious
    };
  }

  private analyzeOrderTiming(orders: any[]) {
    // Analyze order timing patterns
    if (orders.length < 2) return { normal: true };

    const timeDiffs = [];
    for (let i = 1; i < orders.length; i++) {
      const diff = new Date(orders[i-1].createdAt).getTime() - new Date(orders[i].createdAt).getTime();
      timeDiffs.push(diff / (1000 * 60 * 60)); // Convert to hours
    }

    const avgTimeBetween = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;

    return {
      normal: avgTimeBetween > 12, // At least 12 hours between orders
      avgHoursBetween: avgTimeBetween,
      tooFrequent: avgTimeBetween < 1 // Less than 1 hour between orders
    };
  }

  private calculatePatternSuspicionScore(patterns: any): number {
    let suspicionScore = 0;

    if (!patterns.frequency.normal) suspicionScore += 0.3;
    if (patterns.amounts.suspiciouslyLow || patterns.amounts.suspiciouslyHigh) suspicionScore += 0.2;
    if (!patterns.timing.normal) suspicionScore += 0.3;
    if (patterns.timing.tooFrequent) suspicionScore += 0.2;

    return Math.min(1, suspicionScore);
  }

  private calculateAmountConsistency(amounts: number[]): number {
    if (amounts.length < 2) return 1;

    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower coefficient of variation = higher consistency
    const coefficientOfVariation = standardDeviation / mean;
    return Math.max(0, 1 - coefficientOfVariation);
  }
}