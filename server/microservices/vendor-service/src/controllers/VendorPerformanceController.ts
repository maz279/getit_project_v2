/**
 * Vendor Performance Controller - Amazon.com/Shopee.sg Level
 * Complete vendor performance tracking and management system
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  vendors, 
  vendorPerformanceMetrics,
  vendorCommissionStructure,
  vendorCompliance,
  vendorNotifications,
  orders,
  orderItems,
  products,
  users,
  type VendorPerformanceMetrics
} from '@shared/schema';
import { eq, and, desc, gte, lte, count, sum, avg, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Amazon.com/Shopee.sg-Level Vendor Performance Management
 * Implements performance tracking, tier system, and automated actions
 */
export class VendorPerformanceController {

  /**
   * Calculate and Update Vendor Performance Metrics
   * Real-time performance calculation based on Amazon.com standards
   */
  async calculatePerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { period = '30d' } = req.query;

      // Get date range
      const dateRange = this.getDateRange(period as string);

      // Calculate comprehensive performance metrics
      const metrics = await this.calculateComprehensiveMetrics(vendorId, dateRange);

      // Determine performance tier and actions
      const performanceAnalysis = this.analyzePerformance(metrics);

      // Update performance metrics in database
      await this.updatePerformanceMetrics(vendorId, metrics, performanceAnalysis);

      // Check if performance actions are needed
      await this.evaluatePerformanceActions(vendorId, performanceAnalysis);

      res.status(200).json({
        success: true,
        vendorId,
        period,
        metrics,
        performance: {
          score: performanceAnalysis.overallScore,
          tier: performanceAnalysis.tier,
          status: performanceAnalysis.status,
          warnings: performanceAnalysis.warnings,
          recommendations: performanceAnalysis.recommendations
        },
        commissionsUpdate: performanceAnalysis.commissionChanges,
        message: 'Performance metrics updated successfully'
      });

    } catch (error) {
      console.error('Calculate performance metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get Vendor Performance Dashboard
   * Comprehensive performance overview for vendor dashboard
   */
  async getPerformanceDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;

      // Get current performance metrics
      const [currentMetrics] = await db
        .select()
        .from(vendorPerformanceMetrics)
        .where(eq(vendorPerformanceMetrics.vendorId, vendorId))
        .orderBy(desc(vendorPerformanceMetrics.calculatedAt))
        .limit(1);

      // Get historical performance (last 6 months)
      const historicalMetrics = await db
        .select()
        .from(vendorPerformanceMetrics)
        .where(
          and(
            eq(vendorPerformanceMetrics.vendorId, vendorId),
            gte(vendorPerformanceMetrics.calculatedAt, new Date(Date.now() - 180 * 24 * 60 * 60 * 1000))
          )
        )
        .orderBy(desc(vendorPerformanceMetrics.calculatedAt));

      // Get current commission structure
      const [commissionStructure] = await db
        .select()
        .from(vendorCommissionStructure)
        .where(
          and(
            eq(vendorCommissionStructure.vendorId, vendorId),
            eq(vendorCommissionStructure.isActive, true)
          )
        );

      // Get performance targets and benchmarks
      const benchmarks = await this.getPerformanceBenchmarks(vendorId);

      // Get recent performance alerts
      const recentAlerts = await db
        .select()
        .from(vendorNotifications)
        .where(
          and(
            eq(vendorNotifications.vendorId, vendorId),
            eq(vendorNotifications.type, 'performance_alert')
          )
        )
        .orderBy(desc(vendorNotifications.createdAt))
        .limit(10);

      // Calculate performance insights
      const insights = this.generatePerformanceInsights(currentMetrics, historicalMetrics, benchmarks);

      res.status(200).json({
        success: true,
        dashboard: {
          current: {
            metrics: currentMetrics,
            tier: commissionStructure?.tier || 'basic',
            commissionRate: commissionStructure?.commissionRate || '12.0',
            status: this.getPerformanceStatus(currentMetrics)
          },
          historical: {
            metrics: historicalMetrics,
            trends: this.calculateTrends(historicalMetrics)
          },
          benchmarks,
          insights,
          alerts: recentAlerts,
          nextReview: this.calculateNextReviewDate(currentMetrics?.calculatedAt)
        }
      });

    } catch (error) {
      console.error('Get performance dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get performance dashboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Set Performance Targets
   * Allow vendors to set custom performance targets
   */
  async setPerformanceTargets(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const {
        fulfillmentRateTarget,
        customerRatingTarget,
        responseTimeTarget,
        returnRateTarget,
        onTimeDeliveryTarget
      } = req.body;

      // Validate targets against minimum requirements
      const validationResult = this.validatePerformanceTargets({
        fulfillmentRateTarget,
        customerRatingTarget,
        responseTimeTarget,
        returnRateTarget,
        onTimeDeliveryTarget
      });

      if (!validationResult.valid) {
        res.status(400).json({
          success: false,
          error: 'Invalid performance targets',
          details: validationResult.errors
        });
        return;
      }

      // Update vendor performance targets
      await db
        .update(vendors)
        .set({
          performanceTargets: JSON.stringify({
            fulfillmentRate: fulfillmentRateTarget,
            customerRating: customerRatingTarget,
            responseTime: responseTimeTarget,
            returnRate: returnRateTarget,
            onTimeDelivery: onTimeDeliveryTarget,
            setAt: new Date()
          }),
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId));

      res.status(200).json({
        success: true,
        targets: {
          fulfillmentRate: fulfillmentRateTarget,
          customerRating: customerRatingTarget,
          responseTime: responseTimeTarget,
          returnRate: returnRateTarget,
          onTimeDelivery: onTimeDeliveryTarget
        },
        message: 'Performance targets updated successfully'
      });

    } catch (error) {
      console.error('Set performance targets error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set performance targets',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get Performance Benchmarks
   * Industry and platform benchmarks for comparison
   */
  async getPerformanceBenchmarks(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;

      // Get vendor's business category
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      if (!vendor) {
        res.status(404).json({
          success: false,
          error: 'Vendor not found'
        });
        return;
      }

      const benchmarks = await this.getPerformanceBenchmarks(vendorId);

      res.status(200).json({
        success: true,
        benchmarks
      });

    } catch (error) {
      console.error('Get performance benchmarks error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get performance benchmarks',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process Performance Action
   * Handle performance-based actions (warning, probation, suspension)
   */
  async processPerformanceAction(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { action, reason, duration, notes } = req.body;

      // Validate action
      const validActions = ['warning', 'probation', 'suspension', 'improvement_plan'];
      if (!validActions.includes(action)) {
        res.status(400).json({
          success: false,
          error: 'Invalid performance action',
          validActions
        });
        return;
      }

      // Get current vendor status
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      if (!vendor) {
        res.status(404).json({
          success: false,
          error: 'Vendor not found'
        });
        return;
      }

      // Process the action
      const actionResult = await this.executePerformanceAction(vendorId, action, {
        reason,
        duration,
        notes,
        executedBy: req.user?.id,
        executedAt: new Date()
      });

      // Create notification
      await this.createPerformanceNotification(vendorId, action, actionResult);

      res.status(200).json({
        success: true,
        action,
        result: actionResult,
        message: `Performance action '${action}' processed successfully`
      });

    } catch (error) {
      console.error('Process performance action error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process performance action',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ======================
  // PRIVATE HELPER METHODS
  // ======================

  private getDateRange(period: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return { startDate, endDate };
  }

  private async calculateComprehensiveMetrics(vendorId: string, dateRange: { startDate: Date; endDate: Date }): Promise<any> {
    const { startDate, endDate } = dateRange;

    // Order fulfillment metrics
    const fulfillmentData = await db
      .select({
        totalOrders: count(orders.id),
        fulfilledOrders: sum(
          sql`CASE WHEN ${orders.status} IN ('shipped', 'delivered', 'completed') THEN 1 ELSE 0 END`
        ),
        cancelledOrders: sum(
          sql`CASE WHEN ${orders.status} = 'cancelled' THEN 1 ELSE 0 END`
        ),
        returnedOrders: sum(
          sql`CASE WHEN ${orders.status} = 'returned' THEN 1 ELSE 0 END`
        )
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orderItems.vendorId, vendorId),
          gte(orders.createdAt, startDate),
          lte(orders.createdAt, endDate)
        )
      );

    // Response time metrics (mock - would integrate with support system)
    const responseTimeData = {
      averageResponseTime: 2.5, // hours
      responseRate: 95.5 // percentage
    };

    // Customer satisfaction metrics
    const customerData = await db
      .select({
        averageRating: avg(products.rating),
        totalReviews: count(products.id)
      })
      .from(products)
      .where(eq(products.vendorId, vendorId));

    // Calculate metrics
    const fulfillment = fulfillmentData[0];
    const customer = customerData[0];

    const fulfillmentRate = fulfillment.totalOrders > 0 
      ? (Number(fulfillment.fulfilledOrders) / Number(fulfillment.totalOrders)) * 100 
      : 0;

    const returnRate = fulfillment.totalOrders > 0 
      ? (Number(fulfillment.returnedOrders) / Number(fulfillment.totalOrders)) * 100 
      : 0;

    const cancellationRate = fulfillment.totalOrders > 0 
      ? (Number(fulfillment.cancelledOrders) / Number(fulfillment.totalOrders)) * 100 
      : 0;

    return {
      fulfillmentRate: Number(fulfillmentRate.toFixed(2)),
      customerRating: Number(customer.averageRating) || 0,
      responseTime: responseTimeData.averageResponseTime,
      returnRate: Number(returnRate.toFixed(2)),
      cancellationRate: Number(cancellationRate.toFixed(2)),
      responseRate: responseTimeData.responseRate,
      totalOrders: Number(fulfillment.totalOrders),
      totalReviews: Number(customer.totalReviews),
      calculatedAt: new Date()
    };
  }

  private analyzePerformance(metrics: any): any {
    // Performance standards (Amazon.com/Shopee.sg level)
    const standards = {
      fulfillmentRate: { excellent: 98, good: 95, acceptable: 90, poor: 85 },
      customerRating: { excellent: 4.5, good: 4.0, acceptable: 3.5, poor: 3.0 },
      responseTime: { excellent: 1, good: 2, acceptable: 4, poor: 8 }, // hours
      returnRate: { excellent: 2, good: 5, acceptable: 10, poor: 15 }, // percentage (lower is better)
      responseRate: { excellent: 98, good: 95, acceptable: 90, poor: 85 }
    };

    // Calculate scores
    const scores = {
      fulfillment: this.getMetricScore(metrics.fulfillmentRate, standards.fulfillmentRate),
      rating: this.getMetricScore(metrics.customerRating, standards.customerRating),
      response: this.getMetricScore(metrics.responseRate, standards.responseRate),
      returns: this.getInverseMetricScore(metrics.returnRate, standards.returnRate)
    };

    const overallScore = (scores.fulfillment + scores.rating + scores.response + scores.returns) / 4;

    // Determine tier and actions
    let tier = 'basic';
    let commissionRate = 12;
    let status = 'good';
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (overallScore >= 90) {
      tier = 'platinum';
      commissionRate = 6;
      status = 'excellent';
    } else if (overallScore >= 80) {
      tier = 'gold';
      commissionRate = 8;
      status = 'very_good';
    } else if (overallScore >= 70) {
      tier = 'silver';
      commissionRate = 10;
      status = 'good';
    } else if (overallScore >= 60) {
      tier = 'basic';
      commissionRate = 12;
      status = 'needs_improvement';
      warnings.push('Performance below optimal level');
    } else {
      tier = 'probation';
      commissionRate = 15;
      status = 'poor';
      warnings.push('Performance significantly below standards');
      warnings.push('Account under review');
    }

    // Specific recommendations
    if (metrics.fulfillmentRate < 90) {
      recommendations.push('Improve order fulfillment rate - aim for 95%+');
    }
    if (metrics.customerRating < 4.0) {
      recommendations.push('Focus on customer satisfaction - maintain 4.0+ rating');
    }
    if (metrics.responseTime > 4) {
      recommendations.push('Reduce response time to under 2 hours');
    }
    if (metrics.returnRate > 10) {
      recommendations.push('Reduce return rate through better product descriptions');
    }

    return {
      overallScore: Number(overallScore.toFixed(2)),
      scores,
      tier,
      status,
      warnings,
      recommendations,
      commissionChanges: {
        newRate: commissionRate,
        tierUpgrade: true // Would compare with previous tier
      }
    };
  }

  private getMetricScore(value: number, standards: any): number {
    if (value >= standards.excellent) return 100;
    if (value >= standards.good) return 85;
    if (value >= standards.acceptable) return 70;
    if (value >= standards.poor) return 50;
    return 25;
  }

  private getInverseMetricScore(value: number, standards: any): number {
    if (value <= standards.excellent) return 100;
    if (value <= standards.good) return 85;
    if (value <= standards.acceptable) return 70;
    if (value <= standards.poor) return 50;
    return 25;
  }

  private async updatePerformanceMetrics(vendorId: string, metrics: any, analysis: any): Promise<void> {
    await db.insert(vendorPerformanceMetrics).values({
      id: uuidv4(),
      vendorId,
      metricType: 'comprehensive',
      metricValue: JSON.stringify(metrics),
      score: analysis.overallScore.toString(),
      tier: analysis.tier,
      calculatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update commission structure if tier changed
    if (analysis.commissionChanges.tierUpgrade) {
      await this.updateCommissionStructure(vendorId, analysis.tier, analysis.commissionChanges.newRate);
    }
  }

  private async updateCommissionStructure(vendorId: string, tier: string, rate: number): Promise<void> {
    // Deactivate current structure
    await db
      .update(vendorCommissionStructure)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(vendorCommissionStructure.vendorId, vendorId),
          eq(vendorCommissionStructure.isActive, true)
        )
      );

    // Create new structure
    await db.insert(vendorCommissionStructure).values({
      id: uuidv4(),
      vendorId,
      tier,
      commissionRate: rate.toString(),
      minimumOrders: this.getMinimumOrdersForTier(tier),
      effectiveFrom: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  private getMinimumOrdersForTier(tier: string): number {
    const requirements = {
      basic: 0,
      silver: 100,
      gold: 500,
      platinum: 1000
    };
    return requirements[tier] || 0;
  }

  private async evaluatePerformanceActions(vendorId: string, analysis: any): Promise<void> {
    if (analysis.status === 'poor') {
      await this.triggerPerformanceAction(vendorId, 'warning', {
        reason: 'Performance below minimum standards',
        metrics: analysis.scores,
        autoTriggered: true
      });
    }
  }

  private async triggerPerformanceAction(vendorId: string, action: string, details: any): Promise<void> {
    // Create compliance record
    await db.insert(vendorCompliance).values({
      id: uuidv4(),
      vendorId,
      complianceType: 'performance_action',
      status: 'action_required',
      details: JSON.stringify({ action, ...details }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create notification
    await this.createPerformanceNotification(vendorId, action, details);
  }

  private async executePerformanceAction(vendorId: string, action: string, details: any): Promise<any> {
    // Implementation would depend on the specific action
    switch (action) {
      case 'warning':
        return await this.issueWarning(vendorId, details);
      case 'probation':
        return await this.placeProbation(vendorId, details);
      case 'suspension':
        return await this.suspendVendor(vendorId, details);
      case 'improvement_plan':
        return await this.createImprovementPlan(vendorId, details);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async issueWarning(vendorId: string, details: any): Promise<any> {
    // Update vendor status
    await db
      .update(vendors)
      .set({
        status: 'warned',
        updatedAt: new Date()
      })
      .where(eq(vendors.id, vendorId));

    return { action: 'warning_issued', effectiveDate: new Date() };
  }

  private async placeProbation(vendorId: string, details: any): Promise<any> {
    const probationEnd = new Date();
    probationEnd.setDate(probationEnd.getDate() + (details.duration || 30));

    await db
      .update(vendors)
      .set({
        status: 'probation',
        probationUntil: probationEnd,
        updatedAt: new Date()
      })
      .where(eq(vendors.id, vendorId));

    return { action: 'probation_placed', effectiveDate: new Date(), expiresAt: probationEnd };
  }

  private async suspendVendor(vendorId: string, details: any): Promise<any> {
    await db
      .update(vendors)
      .set({
        status: 'suspended',
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(vendors.id, vendorId));

    return { action: 'vendor_suspended', effectiveDate: new Date() };
  }

  private async createImprovementPlan(vendorId: string, details: any): Promise<any> {
    // Create improvement plan (would be more detailed in production)
    const plan = {
      objectives: details.recommendations || [],
      timeline: '30 days',
      checkpoints: ['week_1', 'week_2', 'week_4'],
      createdAt: new Date()
    };

    return { action: 'improvement_plan_created', plan };
  }

  private async createPerformanceNotification(vendorId: string, action: string, details: any): Promise<void> {
    await db.insert(vendorNotifications).values({
      id: uuidv4(),
      vendorId,
      type: 'performance_alert',
      title: `Performance Action: ${action.toUpperCase()}`,
      message: JSON.stringify(details),
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  private validatePerformanceTargets(targets: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (targets.fulfillmentRateTarget < 85) {
      errors.push('Fulfillment rate target must be at least 85%');
    }
    if (targets.customerRatingTarget < 3.0) {
      errors.push('Customer rating target must be at least 3.0');
    }
    if (targets.responseTimeTarget > 24) {
      errors.push('Response time target must be less than 24 hours');
    }
    if (targets.returnRateTarget > 20) {
      errors.push('Return rate target must be less than 20%');
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }

  private async getPerformanceBenchmarks(vendorId: string): Promise<any> {
    // Industry benchmarks (would be calculated from platform data)
    return {
      platform: {
        fulfillmentRate: 94.2,
        customerRating: 4.1,
        responseTime: 3.2,
        returnRate: 7.8,
        responseRate: 92.1
      },
      industry: {
        fulfillmentRate: 91.5,
        customerRating: 3.9,
        responseTime: 4.1,
        returnRate: 9.2,
        responseRate: 89.3
      },
      topPerformers: {
        fulfillmentRate: 98.7,
        customerRating: 4.7,
        responseTime: 1.2,
        returnRate: 3.1,
        responseRate: 97.8
      }
    };
  }

  private generatePerformanceInsights(current: any, historical: any, benchmarks: any): any {
    return {
      strengths: ['High customer satisfaction', 'Consistent fulfillment rate'],
      improvementAreas: ['Response time optimization', 'Return rate reduction'],
      trends: ['Improving customer rating', 'Stable fulfillment performance'],
      recommendations: [
        'Consider automation for faster response times',
        'Implement quality control to reduce returns',
        'Focus on customer service training'
      ]
    };
  }

  private getPerformanceStatus(metrics: any): string {
    if (!metrics) return 'unknown';
    
    const score = parseFloat(metrics.score);
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very_good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'needs_improvement';
    return 'poor';
  }

  private calculateTrends(historical: any[]): any {
    if (!historical || historical.length < 2) {
      return { direction: 'stable', change: 0 };
    }

    const recent = parseFloat(historical[0]?.score || '0');
    const previous = parseFloat(historical[1]?.score || '0');
    const change = recent - previous;

    return {
      direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
      change: Number(change.toFixed(2))
    };
  }

  private calculateNextReviewDate(lastReview?: Date): Date {
    const nextReview = new Date(lastReview || new Date());
    nextReview.setDate(nextReview.getDate() + 7); // Weekly reviews
    return nextReview;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      service: 'vendor-performance-controller',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
}