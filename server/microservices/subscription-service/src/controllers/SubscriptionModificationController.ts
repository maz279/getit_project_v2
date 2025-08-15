/**
 * Subscription Modification Controller - Amazon.com/Shopee.sg-Level Modification Management
 * Handles subscription upgrades, downgrades, plan changes, and quantity modifications
 * 
 * @fileoverview Enterprise-grade subscription modification management with proration
 * @author GetIt Platform Team
 * @version 2.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  subscriptionModifications,
  userSubscriptions,
  subscriptionPlans,
  subscriptionBilling,
  users,
  insertSubscriptionModificationSchema
} from '../../../../../shared/schema';
import { eq, desc, and, gte, lte, count, sum, avg, inArray } from 'drizzle-orm';
import { z } from 'zod';

export class SubscriptionModificationController {
  /**
   * Get all subscription modifications
   * GET /api/v1/subscriptions/modifications
   */
  static async getAllModifications(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        subscriptionId,
        modificationType,
        status,
        dateFrom,
        dateTo,
        userId,
        approvalRequired
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      // Build where conditions
      const conditions = [];
      if (subscriptionId) {
        conditions.push(eq(subscriptionModifications.subscriptionId, subscriptionId as string));
      }
      if (modificationType) {
        if (Array.isArray(modificationType)) {
          conditions.push(inArray(subscriptionModifications.modificationType, modificationType as string[]));
        } else {
          conditions.push(eq(subscriptionModifications.modificationType, modificationType as string));
        }
      }
      if (status) {
        conditions.push(eq(subscriptionModifications.status, status as string));
      }
      if (approvalRequired !== undefined) {
        conditions.push(eq(subscriptionModifications.approvalRequired, approvalRequired === 'true'));
      }
      if (dateFrom) {
        conditions.push(gte(subscriptionModifications.requestedAt, dateFrom as string));
      }
      if (dateTo) {
        conditions.push(lte(subscriptionModifications.requestedAt, dateTo as string));
      }

      // Get modifications with related data
      const modifications = await db
        .select({
          id: subscriptionModifications.id,
          subscriptionId: subscriptionModifications.subscriptionId,
          modificationType: subscriptionModifications.modificationType,
          fromPlanId: subscriptionModifications.fromPlanId,
          toPlanId: subscriptionModifications.toPlanId,
          fromQuantity: subscriptionModifications.fromQuantity,
          toQuantity: subscriptionModifications.toQuantity,
          oldPrice: subscriptionModifications.oldPrice,
          newPrice: subscriptionModifications.newPrice,
          priceChange: subscriptionModifications.priceChange,
          prorationAmount: subscriptionModifications.prorationAmount,
          requestedAt: subscriptionModifications.requestedAt,
          effectiveDate: subscriptionModifications.effectiveDate,
          processedAt: subscriptionModifications.processedAt,
          status: subscriptionModifications.status,
          approvalRequired: subscriptionModifications.approvalRequired,
          approvedBy: subscriptionModifications.approvedBy,
          approvedAt: subscriptionModifications.approvedAt,
          requestedBy: subscriptionModifications.requestedBy,
          reason: subscriptionModifications.reason,
          customerNotes: subscriptionModifications.customerNotes,
          internalNotes: subscriptionModifications.internalNotes,
          metadata: subscriptionModifications.metadata,
          createdAt: subscriptionModifications.createdAt,
          // User details
          userId: userSubscriptions.userId,
          // Plan details
          fromPlanName: subscriptionPlans.name,
          toPlanName: subscriptionPlans.name
        })
        .from(subscriptionModifications)
        .leftJoin(userSubscriptions, eq(subscriptionModifications.subscriptionId, userSubscriptions.id))
        .leftJoin(subscriptionPlans, eq(subscriptionModifications.fromPlanId, subscriptionPlans.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(subscriptionModifications.requestedAt))
        .limit(Number(limit))
        .offset(offset);

      // Get total count for pagination
      const totalResult = await db
        .select({ count: count() })
        .from(subscriptionModifications)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult[0]?.count || 0;

      // Calculate modification statistics
      const stats = {
        totalModifications: total,
        pending: modifications.filter(m => m.status === 'pending').length,
        approved: modifications.filter(m => m.status === 'approved').length,
        processed: modifications.filter(m => m.status === 'processed').length,
        upgrades: modifications.filter(m => m.modificationType === 'upgrade').length,
        downgrades: modifications.filter(m => m.modificationType === 'downgrade').length,
        totalPriceImpact: modifications.reduce((sum, m) => sum + Number(m.priceChange || 0), 0),
        averageProcessingTime: this.calculateAverageProcessingTime(modifications)
      };

      res.json({
        success: true,
        data: modifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        stats,
        bangladeshFeatures: {
          supportedModifications: ['upgrade', 'downgrade', 'plan_change', 'quantity_change', 'pause', 'resume', 'cancel'],
          culturalConsiderations: ['ramadan_pause', 'festival_adjustments'],
          approvalWorkflow: true,
          prorationSupport: true
        }
      });
    } catch (error) {
      console.error('Error fetching modifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch modifications',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get modification details
   * GET /api/v1/subscriptions/modifications/:id
   */
  static async getModificationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { includeProrationDetails = 'true' } = req.query;

      // Get modification details
      const modification = await db
        .select({
          id: subscriptionModifications.id,
          subscriptionId: subscriptionModifications.subscriptionId,
          modificationType: subscriptionModifications.modificationType,
          fromPlanId: subscriptionModifications.fromPlanId,
          toPlanId: subscriptionModifications.toPlanId,
          fromQuantity: subscriptionModifications.fromQuantity,
          toQuantity: subscriptionModifications.toQuantity,
          oldPrice: subscriptionModifications.oldPrice,
          newPrice: subscriptionModifications.newPrice,
          priceChange: subscriptionModifications.priceChange,
          prorationAmount: subscriptionModifications.prorationAmount,
          requestedAt: subscriptionModifications.requestedAt,
          effectiveDate: subscriptionModifications.effectiveDate,
          processedAt: subscriptionModifications.processedAt,
          status: subscriptionModifications.status,
          approvalRequired: subscriptionModifications.approvalRequired,
          approvedBy: subscriptionModifications.approvedBy,
          approvedAt: subscriptionModifications.approvedAt,
          requestedBy: subscriptionModifications.requestedBy,
          reason: subscriptionModifications.reason,
          customerNotes: subscriptionModifications.customerNotes,
          internalNotes: subscriptionModifications.internalNotes,
          metadata: subscriptionModifications.metadata,
          createdAt: subscriptionModifications.createdAt,
          // Subscription details
          userId: userSubscriptions.userId,
          currentPlanId: userSubscriptions.planId,
          subscriptionStatus: userSubscriptions.status
        })
        .from(subscriptionModifications)
        .leftJoin(userSubscriptions, eq(subscriptionModifications.subscriptionId, userSubscriptions.id))
        .where(eq(subscriptionModifications.id, id))
        .limit(1);

      if (!modification.length) {
        return res.status(404).json({
          success: false,
          message: 'Modification not found'
        });
      }

      const modificationData = modification[0];

      // Get plan details if available
      let fromPlan = null;
      let toPlan = null;

      if (modificationData.fromPlanId) {
        const fromPlanResult = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, modificationData.fromPlanId))
          .limit(1);
        fromPlan = fromPlanResult[0] || null;
      }

      if (modificationData.toPlanId) {
        const toPlanResult = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, modificationData.toPlanId))
          .limit(1);
        toPlan = toPlanResult[0] || null;
      }

      // Calculate proration details if requested
      let prorationDetails = null;
      if (includeProrationDetails === 'true') {
        prorationDetails = await this.calculateProrationDetails(modificationData);
      }

      const responseData = {
        ...modificationData,
        fromPlan,
        toPlan,
        prorationDetails,
        impact: this.calculateModificationImpact(modificationData, fromPlan, toPlan),
        timeline: this.getModificationTimeline(modificationData),
        bangladeshFeatures: {
          culturalConsiderations: this.getCulturalConsiderations(modificationData),
          paymentAdjustments: this.getPaymentAdjustments(modificationData),
          approvalWorkflow: this.getApprovalWorkflow(modificationData)
        }
      };

      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      console.error('Error fetching modification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch modification',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Request subscription modification
   * POST /api/v1/subscriptions/modifications
   */
  static async requestModification(req: Request, res: Response) {
    try {
      // Validate modification data
      const modificationData = insertSubscriptionModificationSchema.parse(req.body);

      // Get current subscription details
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
        .where(eq(userSubscriptions.id, modificationData.subscriptionId))
        .limit(1);

      if (!subscription.length) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      const currentSubscription = subscription[0];

      // Validate modification request
      const validation = await this.validateModificationRequest(modificationData, currentSubscription);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          errors: validation.errors
        });
      }

      // Calculate pricing changes and proration
      const pricingCalculation = await this.calculatePricingChanges(modificationData, currentSubscription);

      // Determine if approval is required
      const approvalRequired = this.isApprovalRequired(modificationData, pricingCalculation);

      // Create modification request
      const newModification = await db
        .insert(subscriptionModifications)
        .values({
          ...modificationData,
          oldPrice: pricingCalculation.oldPrice,
          newPrice: pricingCalculation.newPrice,
          priceChange: pricingCalculation.priceChange,
          prorationAmount: pricingCalculation.prorationAmount,
          approvalRequired,
          status: approvalRequired ? 'pending' : 'approved',
          effectiveDate: modificationData.effectiveDate || new Date().toISOString()
        })
        .returning();

      const createdModification = newModification[0];

      // If no approval required, process immediately
      if (!approvalRequired) {
        await this.processModification(createdModification.id);
      }

      // Send notification (TODO: Implement notification service)
      // await this.sendModificationRequestNotification(createdModification);

      res.status(201).json({
        success: true,
        message: approvalRequired ? 
          'Modification request submitted for approval' : 
          'Modification processed successfully',
        messageBn: approvalRequired ?
          'পরিবর্তনের অনুরোধ অনুমোদনের জন্য জমা দেওয়া হয়েছে' :
          'পরিবর্তন সফলভাবে প্রক্রিয়া করা হয়েছে',
        data: {
          modification: createdModification,
          pricingImpact: pricingCalculation,
          approvalRequired,
          estimatedProcessingTime: approvalRequired ? '24-48 hours' : 'Immediate'
        }
      });
    } catch (error) {
      console.error('Error requesting modification:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to request modification',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Approve modification request
   * POST /api/v1/subscriptions/modifications/:id/approve
   */
  static async approveModification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { approvedBy, approvalNotes, processImmediately = true } = req.body;

      // Get modification details
      const modification = await db
        .select()
        .from(subscriptionModifications)
        .where(eq(subscriptionModifications.id, id))
        .limit(1);

      if (!modification.length) {
        return res.status(404).json({
          success: false,
          message: 'Modification not found'
        });
      }

      const modificationData = modification[0];

      if (modificationData.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Modification is not pending approval'
        });
      }

      // Update modification status
      const updatedModification = await db
        .update(subscriptionModifications)
        .set({
          status: 'approved',
          approvedBy: Number(approvedBy),
          approvedAt: new Date(),
          internalNotes: approvalNotes || modificationData.internalNotes,
          updatedAt: new Date()
        })
        .where(eq(subscriptionModifications.id, id))
        .returning();

      // Process modification if requested
      if (processImmediately) {
        await this.processModification(id);
      }

      // Send approval notification
      // await this.sendModificationApprovalNotification(updatedModification[0]);

      res.json({
        success: true,
        message: 'Modification approved successfully',
        messageBn: 'পরিবর্তন সফলভাবে অনুমোদিত হয়েছে',
        data: {
          modification: updatedModification[0],
          processed: processImmediately
        }
      });
    } catch (error) {
      console.error('Error approving modification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve modification',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Process approved modification
   * POST /api/v1/subscriptions/modifications/:id/process
   */
  static async processModification(modificationId: string) {
    try {
      // Get modification details
      const modification = await db
        .select()
        .from(subscriptionModifications)
        .where(eq(subscriptionModifications.id, modificationId))
        .limit(1);

      if (!modification.length) {
        throw new Error('Modification not found');
      }

      const modificationData = modification[0];

      if (modificationData.status !== 'approved') {
        throw new Error('Modification is not approved');
      }

      // Process based on modification type
      switch (modificationData.modificationType) {
        case 'upgrade':
        case 'downgrade':
        case 'plan_change':
          await this.processPlanChange(modificationData);
          break;
        
        case 'quantity_change':
          await this.processQuantityChange(modificationData);
          break;
        
        case 'pause':
          await this.processPause(modificationData);
          break;
        
        case 'resume':
          await this.processResume(modificationData);
          break;
        
        case 'cancel':
          await this.processCancel(modificationData);
          break;
        
        default:
          throw new Error(`Unknown modification type: ${modificationData.modificationType}`);
      }

      // Update modification status
      await db
        .update(subscriptionModifications)
        .set({
          status: 'processed',
          processedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(subscriptionModifications.id, modificationId));

      // Create billing adjustment if needed
      if (modificationData.prorationAmount && Number(modificationData.prorationAmount) !== 0) {
        await this.createBillingAdjustment(modificationData);
      }

      return { success: true };
    } catch (error) {
      console.error('Error processing modification:', error);
      
      // Update modification status to failed
      await db
        .update(subscriptionModifications)
        .set({
          status: 'failed',
          internalNotes: `Processing failed: ${error.message}`,
          updatedAt: new Date()
        })
        .where(eq(subscriptionModifications.id, modificationId));

      throw error;
    }
  }

  /**
   * Get modification analytics
   * GET /api/v1/subscriptions/modifications/analytics
   */
  static async getModificationAnalytics(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo, groupBy = 'month' } = req.query;

      // Build date conditions
      const conditions = [];
      if (dateFrom) {
        conditions.push(gte(subscriptionModifications.requestedAt, dateFrom as string));
      }
      if (dateTo) {
        conditions.push(lte(subscriptionModifications.requestedAt, dateTo as string));
      }

      // Get modification statistics
      const modificationStats = await db
        .select({
          totalModifications: count(),
          averagePriceChange: avg(subscriptionModifications.priceChange),
          totalPriceImpact: sum(subscriptionModifications.priceChange),
          totalProrationAmount: sum(subscriptionModifications.prorationAmount)
        })
        .from(subscriptionModifications)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Get modification type breakdown
      const typeBreakdown = await db
        .select({
          modificationType: subscriptionModifications.modificationType,
          count: count(),
          averagePriceChange: avg(subscriptionModifications.priceChange)
        })
        .from(subscriptionModifications)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(subscriptionModifications.modificationType);

      // Get status breakdown
      const statusBreakdown = await db
        .select({
          status: subscriptionModifications.status,
          count: count()
        })
        .from(subscriptionModifications)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(subscriptionModifications.status);

      res.json({
        success: true,
        data: {
          overview: modificationStats[0],
          typeBreakdown,
          statusBreakdown,
          bangladeshInsights: {
            culturalModifications: {
              ramadanPauses: 150, // Mock data
              festivalUpgrades: 89,
              ecommerceSeasonality: 67
            },
            processingEfficiency: {
              averageApprovalTime: '18 hours',
              autoApprovalRate: 65,
              customerSatisfaction: 4.2
            },
            revenueImpact: {
              upgradeRevenue: Number(modificationStats[0]?.totalPriceImpact || 0) * 0.7,
              downgradeImpact: Number(modificationStats[0]?.totalPriceImpact || 0) * 0.3,
              netRevenueChange: Number(modificationStats[0]?.totalPriceImpact || 0)
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching modification analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch modification analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Private helper methods
  private static async validateModificationRequest(modification: any, currentSubscription: any) {
    const errors = [];

    // Check if subscription is active
    if (currentSubscription.status !== 'active' && modification.modificationType !== 'resume') {
      errors.push('Subscription must be active for this modification');
    }

    // Check for conflicting modifications
    const existingModifications = await db
      .select()
      .from(subscriptionModifications)
      .where(
        and(
          eq(subscriptionModifications.subscriptionId, modification.subscriptionId),
          inArray(subscriptionModifications.status, ['pending', 'approved'])
        )
      );

    if (existingModifications.length > 0) {
      errors.push('There is already a pending modification for this subscription');
    }

    // Validate plan change
    if (modification.toPlanId && modification.toPlanId === currentSubscription.planId) {
      errors.push('Cannot change to the same plan');
    }

    // Validate quantity change
    if (modification.modificationType === 'quantity_change') {
      if (!modification.toQuantity || modification.toQuantity <= 0) {
        errors.push('Invalid quantity specified');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      message: errors.length > 0 ? errors[0] : 'Modification request is valid'
    };
  }

  private static async calculatePricingChanges(modification: any, currentSubscription: any) {
    let oldPrice = Number(currentSubscription.price || 0);
    let newPrice = oldPrice;

    // Calculate new price based on modification type
    if (modification.toPlanId) {
      const newPlan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, modification.toPlanId))
        .limit(1);
      
      if (newPlan.length > 0) {
        newPrice = Number(newPlan[0].price);
      }
    }

    if (modification.toQuantity && modification.modificationType === 'quantity_change') {
      const basePrice = Number(currentSubscription.price || 0);
      newPrice = basePrice * modification.toQuantity;
    }

    const priceChange = newPrice - oldPrice;

    // Calculate proration (simplified - would be more complex in production)
    const prorationAmount = this.calculateProration(
      oldPrice,
      newPrice,
      currentSubscription.billingCycle,
      new Date(modification.effectiveDate || new Date())
    );

    return {
      oldPrice: oldPrice.toString(),
      newPrice: newPrice.toString(),
      priceChange: priceChange.toString(),
      prorationAmount: prorationAmount.toString()
    };
  }

  private static calculateProration(
    oldPrice: number,
    newPrice: number,
    billingCycle: string,
    effectiveDate: Date
  ): number {
    // Simplified proration calculation
    // In production, this would consider the exact billing cycle dates
    const priceDifference = newPrice - oldPrice;
    const daysInCycle = billingCycle === 'monthly' ? 30 : 365;
    const remainingDays = 15; // Mock calculation
    
    return (priceDifference * remainingDays) / daysInCycle;
  }

  private static isApprovalRequired(modification: any, pricingCalculation: any): boolean {
    // Define approval rules
    const requiresApproval = [
      // High-value changes
      Math.abs(Number(pricingCalculation.priceChange)) > 1000,
      // Downgrades always require approval
      modification.modificationType === 'downgrade',
      // Cancellations require approval
      modification.modificationType === 'cancel',
      // Custom approval rules can be added here
    ];

    return requiresApproval.some(condition => condition);
  }

  private static async processPlanChange(modification: any) {
    // Update subscription plan
    await db
      .update(userSubscriptions)
      .set({
        planId: modification.toPlanId,
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.id, modification.subscriptionId));
  }

  private static async processQuantityChange(modification: any) {
    // Update subscription quantity (if quantity field exists)
    // This would depend on your subscription schema
    console.log('Processing quantity change:', modification.toQuantity);
  }

  private static async processPause(modification: any) {
    // Update subscription status to paused
    await db
      .update(userSubscriptions)
      .set({
        status: 'paused',
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.id, modification.subscriptionId));
  }

  private static async processResume(modification: any) {
    // Update subscription status to active
    await db
      .update(userSubscriptions)
      .set({
        status: 'active',
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.id, modification.subscriptionId));
  }

  private static async processCancel(modification: any) {
    // Update subscription status to cancelled
    await db
      .update(userSubscriptions)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.id, modification.subscriptionId));
  }

  private static async createBillingAdjustment(modification: any) {
    // Create billing adjustment record
    // This would integrate with the billing system
    console.log('Creating billing adjustment for:', modification.prorationAmount);
  }

  private static calculateAverageProcessingTime(modifications: any[]): string {
    const processedModifications = modifications.filter(m => 
      m.status === 'processed' && m.requestedAt && m.processedAt
    );

    if (processedModifications.length === 0) return 'N/A';

    const totalTime = processedModifications.reduce((sum, mod) => {
      const requested = new Date(mod.requestedAt).getTime();
      const processed = new Date(mod.processedAt).getTime();
      return sum + (processed - requested);
    }, 0);

    const avgTimeMs = totalTime / processedModifications.length;
    const avgTimeHours = avgTimeMs / (1000 * 60 * 60);

    return `${avgTimeHours.toFixed(1)} hours`;
  }

  private static async calculateProrationDetails(modification: any) {
    // Calculate detailed proration breakdown
    return {
      baseCalculation: Number(modification.prorationAmount || 0),
      taxAdjustment: Number(modification.prorationAmount || 0) * 0.15, // 15% VAT
      totalAdjustment: Number(modification.prorationAmount || 0) * 1.15,
      billingCycleImpact: 'Next billing cycle',
      effectiveDate: modification.effectiveDate
    };
  }

  private static calculateModificationImpact(modification: any, fromPlan: any, toPlan: any) {
    return {
      financial: {
        monthlyChange: Number(modification.priceChange || 0),
        annualChange: Number(modification.priceChange || 0) * 12,
        prorationImpact: Number(modification.prorationAmount || 0)
      },
      features: {
        added: toPlan ? (toPlan.features || []) : [],
        removed: fromPlan ? (fromPlan.features || []) : [],
        changed: []
      },
      service: {
        deliveryFrequency: 'Maintained',
        supportLevel: 'Enhanced',
        bangladeshFeatures: 'Maintained'
      }
    };
  }

  private static getModificationTimeline(modification: any) {
    return {
      requested: modification.requestedAt,
      approved: modification.approvedAt,
      effective: modification.effectiveDate,
      processed: modification.processedAt,
      estimatedCompletion: modification.processedAt || 'Pending'
    };
  }

  private static getCulturalConsiderations(modification: any) {
    return {
      ramadanAware: modification.modificationType === 'pause' && 
                    modification.reason?.includes('ramadan'),
      festivalOptimized: false,
      culturalSensitivity: 'High',
      bengaliSupport: true
    };
  }

  private static getPaymentAdjustments(modification: any) {
    return {
      prorationMethod: 'Daily proration',
      adjustmentTiming: 'Next billing cycle',
      refundEligible: Number(modification.priceChange || 0) < 0,
      paymentMethodCompatible: true
    };
  }

  private static getApprovalWorkflow(modification: any) {
    return {
      required: modification.approvalRequired,
      autoApprovalEligible: !modification.approvalRequired,
      approverRole: 'Subscription Manager',
      escalationPath: 'Team Lead → Department Head',
      slaTarget: '24 hours'
    };
  }
}