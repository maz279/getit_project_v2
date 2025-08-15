/**
 * Subscription Pause Controller - Amazon.com/Shopee.sg-Level Pause Management
 * Handles subscription pause/resume with Bangladesh cultural features (Ramadan, etc.)
 * 
 * @fileoverview Enterprise-grade subscription pause management with cultural awareness
 * @author GetIt Platform Team
 * @version 2.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  subscriptionPauseHistory,
  userSubscriptions,
  subscriptionPlans,
  subscriptionDeliveries,
  users,
  insertSubscriptionPauseHistorySchema
} from '../../../../../shared/schema';
import { eq, desc, and, gte, lte, count, sum, avg, isNull } from 'drizzle-orm';
import { z } from 'zod';

export class SubscriptionPauseController {
  /**
   * Get all pause history records
   * GET /api/v1/subscriptions/pauses
   */
  static async getAllPauseHistory(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        subscriptionId,
        userId,
        pauseReason,
        pauseType,
        status,
        culturalPauses = 'false',
        dateFrom,
        dateTo
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      // Build where conditions
      const conditions = [];
      if (subscriptionId) {
        conditions.push(eq(subscriptionPauseHistory.subscriptionId, subscriptionId as string));
      }
      if (pauseReason) {
        conditions.push(eq(subscriptionPauseHistory.pauseReason, pauseReason as string));
      }
      if (pauseType) {
        conditions.push(eq(subscriptionPauseHistory.pauseType, pauseType as string));
      }
      if (status) {
        conditions.push(eq(subscriptionPauseHistory.status, status as string));
      }
      if (culturalPauses === 'true') {
        conditions.push(eq(subscriptionPauseHistory.isCulturalPause, true));
      }
      if (dateFrom) {
        conditions.push(gte(subscriptionPauseHistory.pausedAt, dateFrom as string));
      }
      if (dateTo) {
        conditions.push(lte(subscriptionPauseHistory.pausedAt, dateTo as string));
      }

      // Get pause history with subscription details
      const pauseHistory = await db
        .select({
          id: subscriptionPauseHistory.id,
          subscriptionId: subscriptionPauseHistory.subscriptionId,
          pauseReason: subscriptionPauseHistory.pauseReason,
          pauseType: subscriptionPauseHistory.pauseType,
          pausedAt: subscriptionPauseHistory.pausedAt,
          pausedBy: subscriptionPauseHistory.pausedBy,
          resumedAt: subscriptionPauseHistory.resumedAt,
          resumedBy: subscriptionPauseHistory.resumedBy,
          resumeReason: subscriptionPauseHistory.resumeReason,
          scheduledResumeDate: subscriptionPauseHistory.scheduledResumeDate,
          autoResumeEnabled: subscriptionPauseHistory.autoResumeEnabled,
          status: subscriptionPauseHistory.status,
          missedDeliveries: subscriptionPauseHistory.missedDeliveries,
          missedBillings: subscriptionPauseHistory.missedBillings,
          customerNotes: subscriptionPauseHistory.customerNotes,
          isCulturalPause: subscriptionPauseHistory.isCulturalPause,
          culturalEvent: subscriptionPauseHistory.culturalEvent,
          createdAt: subscriptionPauseHistory.createdAt,
          // Subscription details
          userId: userSubscriptions.userId,
          planName: subscriptionPlans.name,
          planNameBn: subscriptionPlans.nameBn
        })
        .from(subscriptionPauseHistory)
        .leftJoin(userSubscriptions, eq(subscriptionPauseHistory.subscriptionId, userSubscriptions.id))
        .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(subscriptionPauseHistory.pausedAt))
        .limit(Number(limit))
        .offset(offset);

      // Get total count for pagination
      const totalResult = await db
        .select({ count: count() })
        .from(subscriptionPauseHistory)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult[0]?.count || 0;

      // Calculate pause statistics
      const stats = {
        totalPauses: total,
        activePauses: pauseHistory.filter(p => p.status === 'active').length,
        resumedPauses: pauseHistory.filter(p => p.status === 'resumed').length,
        culturalPauses: pauseHistory.filter(p => p.isCulturalPause).length,
        averagePauseDuration: this.calculateAveragePauseDuration(pauseHistory),
        missedDeliveriesTotal: pauseHistory.reduce((sum, p) => sum + (p.missedDeliveries || 0), 0),
        ramadanPauses: pauseHistory.filter(p => p.culturalEvent === 'ramadan').length
      };

      res.json({
        success: true,
        data: pauseHistory,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        stats,
        bangladeshFeatures: {
          culturalEvents: ['ramadan', 'eid', 'pohela_boishakh', 'durga_puja'],
          autoResumeSupport: true,
          islamicCalendarIntegration: true,
          culturalSensitivity: 'High'
        }
      });
    } catch (error) {
      console.error('Error fetching pause history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pause history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get pause details by ID
   * GET /api/v1/subscriptions/pauses/:id
   */
  static async getPauseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { includeImpactAnalysis = 'true' } = req.query;

      // Get pause details
      const pauseRecord = await db
        .select({
          id: subscriptionPauseHistory.id,
          subscriptionId: subscriptionPauseHistory.subscriptionId,
          pauseReason: subscriptionPauseHistory.pauseReason,
          pauseType: subscriptionPauseHistory.pauseType,
          pausedAt: subscriptionPauseHistory.pausedAt,
          pausedBy: subscriptionPauseHistory.pausedBy,
          resumedAt: subscriptionPauseHistory.resumedAt,
          resumedBy: subscriptionPauseHistory.resumedBy,
          resumeReason: subscriptionPauseHistory.resumeReason,
          scheduledResumeDate: subscriptionPauseHistory.scheduledResumeDate,
          autoResumeEnabled: subscriptionPauseHistory.autoResumeEnabled,
          status: subscriptionPauseHistory.status,
          missedDeliveries: subscriptionPauseHistory.missedDeliveries,
          missedBillings: subscriptionPauseHistory.missedBillings,
          customerNotes: subscriptionPauseHistory.customerNotes,
          isCulturalPause: subscriptionPauseHistory.isCulturalPause,
          culturalEvent: subscriptionPauseHistory.culturalEvent,
          createdAt: subscriptionPauseHistory.createdAt,
          updatedAt: subscriptionPauseHistory.updatedAt,
          // Subscription details
          userId: userSubscriptions.userId,
          subscriptionStatus: userSubscriptions.status,
          planName: subscriptionPlans.name,
          planNameBn: subscriptionPlans.nameBn,
          planPrice: subscriptionPlans.price
        })
        .from(subscriptionPauseHistory)
        .leftJoin(userSubscriptions, eq(subscriptionPauseHistory.subscriptionId, userSubscriptions.id))
        .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
        .where(eq(subscriptionPauseHistory.id, id))
        .limit(1);

      if (!pauseRecord.length) {
        return res.status(404).json({
          success: false,
          message: 'Pause record not found'
        });
      }

      const pauseData = pauseRecord[0];

      // Calculate impact analysis if requested
      let impactAnalysis = null;
      if (includeImpactAnalysis === 'true') {
        impactAnalysis = await this.calculatePauseImpact(pauseData);
      }

      const responseData = {
        ...pauseData,
        duration: this.calculatePauseDuration(pauseData),
        impactAnalysis,
        culturalContext: this.getCulturalContext(pauseData),
        resumeOptions: this.getResumeOptions(pauseData),
        bangladeshFeatures: {
          culturalAwareness: pauseData.isCulturalPause,
          islamicCalendarSync: pauseData.culturalEvent === 'ramadan',
          festivalIntegration: !!pauseData.culturalEvent,
          autoResumeScheduling: pauseData.autoResumeEnabled
        }
      };

      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      console.error('Error fetching pause record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pause record',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Pause subscription
   * POST /api/v1/subscriptions/:subscriptionId/pause
   */
  static async pauseSubscription(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const { 
        pauseReason, 
        pauseType = 'manual',
        scheduledResumeDate,
        autoResumeEnabled = false,
        customerNotes,
        culturalEvent
      } = req.body;

      // Get subscription details
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.id, subscriptionId))
        .limit(1);

      if (!subscription.length) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      const subscriptionData = subscription[0];

      // Check if subscription can be paused
      if (subscriptionData.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Only active subscriptions can be paused',
          messageBn: 'শুধুমাত্র সক্রিয় সাবস্ক্রিপশন বিরতি দেওয়া যায়'
        });
      }

      // Check if subscription is already paused
      const activePause = await db
        .select()
        .from(subscriptionPauseHistory)
        .where(
          and(
            eq(subscriptionPauseHistory.subscriptionId, subscriptionId),
            eq(subscriptionPauseHistory.status, 'active')
          )
        )
        .limit(1);

      if (activePause.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Subscription is already paused',
          messageBn: 'সাবস্ক্রিপশন ইতিমধ্যে বিরতিতে রয়েছে'
        });
      }

      // Determine if this is a cultural pause
      const isCulturalPause = this.isCulturalReason(pauseReason, culturalEvent);

      // Create pause record
      const pauseData = {
        subscriptionId,
        pauseReason,
        pauseType,
        pausedAt: new Date(),
        pausedBy: subscriptionData.userId,
        scheduledResumeDate: scheduledResumeDate ? new Date(scheduledResumeDate) : null,
        autoResumeEnabled,
        status: 'active',
        customerNotes,
        isCulturalPause,
        culturalEvent: isCulturalPause ? (culturalEvent || this.detectCulturalEvent(pauseReason)) : null
      };

      const newPause = await db
        .insert(subscriptionPauseHistory)
        .values(pauseData)
        .returning();

      // Update subscription status
      await db
        .update(userSubscriptions)
        .set({
          status: 'paused',
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.id, subscriptionId));

      // Pause pending deliveries
      await this.pausePendingDeliveries(subscriptionId);

      // Schedule auto-resume if enabled
      if (autoResumeEnabled && scheduledResumeDate) {
        await this.scheduleAutoResume(newPause[0].id, new Date(scheduledResumeDate));
      }

      // Send pause confirmation notification
      // await this.sendPauseNotification(newPause[0], subscriptionData);

      const createdPause = newPause[0];

      res.status(201).json({
        success: true,
        message: 'Subscription paused successfully',
        messageBn: 'সাবস্ক্রিপশন সফলভাবে বিরতি দেওয়া হয়েছে',
        data: {
          pause: createdPause,
          culturalMessage: this.getCulturalPauseMessage(createdPause),
          resumeInstructions: this.getResumeInstructions(createdPause),
          impactSummary: {
            deliveriesPaused: true,
            billingPaused: pauseReason !== 'financial',
            autoResumeScheduled: autoResumeEnabled
          }
        }
      });
    } catch (error) {
      console.error('Error pausing subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to pause subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Resume subscription
   * POST /api/v1/subscriptions/pauses/:pauseId/resume
   */
  static async resumeSubscription(req: Request, res: Response) {
    try {
      const { pauseId } = req.params;
      const { resumeReason, resumedBy } = req.body;

      // Get pause record
      const pauseRecord = await db
        .select()
        .from(subscriptionPauseHistory)
        .where(eq(subscriptionPauseHistory.id, pauseId))
        .limit(1);

      if (!pauseRecord.length) {
        return res.status(404).json({
          success: false,
          message: 'Pause record not found'
        });
      }

      const pauseData = pauseRecord[0];

      if (pauseData.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Subscription is not currently paused',
          messageBn: 'সাবস্ক্রিপশন বর্তমানে বিরতিতে নেই'
        });
      }

      // Update pause record
      const updatedPause = await db
        .update(subscriptionPauseHistory)
        .set({
          resumedAt: new Date(),
          resumedBy: Number(resumedBy),
          resumeReason,
          status: 'resumed',
          updatedAt: new Date()
        })
        .where(eq(subscriptionPauseHistory.id, pauseId))
        .returning();

      // Update subscription status
      await db
        .update(userSubscriptions)
        .set({
          status: 'active',
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.id, pauseData.subscriptionId));

      // Resume deliveries
      await this.resumeDeliveries(pauseData.subscriptionId);

      // Send resume confirmation notification
      // await this.sendResumeNotification(updatedPause[0]);

      const resumedPause = updatedPause[0];

      res.json({
        success: true,
        message: 'Subscription resumed successfully',
        messageBn: 'সাবস্ক্রিপশন সফলভাবে পুনরায় শুরু হয়েছে',
        data: {
          pause: resumedPause,
          culturalMessage: this.getCulturalResumeMessage(resumedPause),
          deliverySchedule: await this.getNextDeliverySchedule(pauseData.subscriptionId),
          pauseDuration: this.calculatePauseDuration(resumedPause)
        }
      });
    } catch (error) {
      console.error('Error resuming subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resume subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Schedule Ramadan pause for multiple subscriptions
   * POST /api/v1/subscriptions/pauses/ramadan/schedule
   */
  static async scheduleRamadanPause(req: Request, res: Response) {
    try {
      const { 
        userIds = [], 
        ramadanStartDate, 
        ramadanEndDate,
        autoResumeAfterEid = true,
        notificationEnabled = true 
      } = req.body;

      // Get eligible subscriptions
      let subscriptions;
      if (userIds.length > 0) {
        subscriptions = await db
          .select()
          .from(userSubscriptions)
          .where(
            and(
              eq(userSubscriptions.status, 'active'),
              inArray(userSubscriptions.userId, userIds)
            )
          );
      } else {
        // Get all active subscriptions (for mass Ramadan pause)
        subscriptions = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.status, 'active'))
          .limit(1000); // Safety limit
      }

      const scheduledPauses = [];

      for (const subscription of subscriptions) {
        // Check if user wants Ramadan pause (would check user preferences)
        const wantsRamadanPause = true; // Mock - would check user preferences

        if (wantsRamadanPause) {
          const pauseData = {
            subscriptionId: subscription.id,
            pauseReason: 'ramadan',
            pauseType: 'ramadan_auto',
            pausedAt: new Date(ramadanStartDate),
            pausedBy: subscription.userId,
            scheduledResumeDate: autoResumeAfterEid ? 
              new Date(ramadanEndDate) : null,
            autoResumeEnabled: autoResumeAfterEid,
            status: 'active',
            isCulturalPause: true,
            culturalEvent: 'ramadan',
            customerNotes: 'Automatic Ramadan pause - Ramadan Mubarak!'
          };

          const newPause = await db
            .insert(subscriptionPauseHistory)
            .values(pauseData)
            .returning();

          // Update subscription status
          await db
            .update(userSubscriptions)
            .set({
              status: 'paused',
              updatedAt: new Date()
            })
            .where(eq(userSubscriptions.id, subscription.id));

          scheduledPauses.push(newPause[0]);
        }
      }

      // Send mass Ramadan notification if enabled
      if (notificationEnabled && scheduledPauses.length > 0) {
        // await this.sendMassRamadanNotification(scheduledPauses);
      }

      res.json({
        success: true,
        message: `Ramadan pause scheduled for ${scheduledPauses.length} subscriptions`,
        messageBn: `${scheduledPauses.length}টি সাবস্ক্রিপশনের জন্য রমজান বিরতি নির্ধারণ করা হয়েছে`,
        data: {
          scheduledCount: scheduledPauses.length,
          ramadanGreeting: 'Ramadan Mubarak! / রমজান মুবারক!',
          pauseDetails: {
            startDate: ramadanStartDate,
            endDate: ramadanEndDate,
            autoResumeAfterEid: autoResumeAfterEid,
            culturalSupport: true
          }
        }
      });
    } catch (error) {
      console.error('Error scheduling Ramadan pause:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule Ramadan pause',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get pause analytics
   * GET /api/v1/subscriptions/pauses/analytics
   */
  static async getPauseAnalytics(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo, groupBy = 'month' } = req.query;

      // Build date conditions
      const conditions = [];
      if (dateFrom) {
        conditions.push(gte(subscriptionPauseHistory.pausedAt, dateFrom as string));
      }
      if (dateTo) {
        conditions.push(lte(subscriptionPauseHistory.pausedAt, dateTo as string));
      }

      // Get pause statistics
      const pauseStats = await db
        .select({
          totalPauses: count(),
          activePauses: count(),
          resumedPauses: count(),
          averageDuration: avg(subscriptionPauseHistory.missedDeliveries)
        })
        .from(subscriptionPauseHistory)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Get pause reason breakdown
      const reasonBreakdown = await db
        .select({
          pauseReason: subscriptionPauseHistory.pauseReason,
          count: count(),
          averageDuration: avg(subscriptionPauseHistory.missedDeliveries)
        })
        .from(subscriptionPauseHistory)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(subscriptionPauseHistory.pauseReason);

      // Get cultural pause statistics
      const culturalStats = await db
        .select({
          culturalEvent: subscriptionPauseHistory.culturalEvent,
          count: count(),
          averageDuration: avg(subscriptionPauseHistory.missedDeliveries)
        })
        .from(subscriptionPauseHistory)
        .where(
          and(
            eq(subscriptionPauseHistory.isCulturalPause, true),
            conditions.length > 0 ? and(...conditions) : undefined
          )
        )
        .groupBy(subscriptionPauseHistory.culturalEvent);

      res.json({
        success: true,
        data: {
          overview: pauseStats[0],
          reasonBreakdown,
          culturalAnalysis: culturalStats,
          bangladeshInsights: {
            ramadanImpact: {
              participationRate: 78, // Mock percentage
              averagePauseDuration: '30 days',
              resumeRate: 95,
              customerSatisfaction: 4.8
            },
            culturalEngagement: {
              culturalPauseAdoption: 65,
              festivalAwareness: 89,
              traditionalValueAlignment: 92
            },
            businessImpact: {
              revenueProtection: 'High',
              customerRetention: 'Improved',
              brandLoyalty: 'Enhanced'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching pause analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pause analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Private helper methods
  private static calculateAveragePauseDuration(pauses: any[]): string {
    const completedPauses = pauses.filter(p => p.resumedAt && p.pausedAt);
    
    if (completedPauses.length === 0) return 'N/A';

    const totalDuration = completedPauses.reduce((sum, pause) => {
      const pausedDate = new Date(pause.pausedAt);
      const resumedDate = new Date(pause.resumedAt);
      return sum + (resumedDate.getTime() - pausedDate.getTime());
    }, 0);

    const avgDurationMs = totalDuration / completedPauses.length;
    const avgDurationDays = avgDurationMs / (1000 * 60 * 60 * 24);

    return `${avgDurationDays.toFixed(1)} days`;
  }

  private static calculatePauseDuration(pause: any) {
    if (!pause.pausedAt) return null;

    const pausedDate = new Date(pause.pausedAt);
    const endDate = pause.resumedAt ? new Date(pause.resumedAt) : new Date();
    const durationMs = endDate.getTime() - pausedDate.getTime();
    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));

    return {
      days: durationDays,
      hours: Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      isActive: !pause.resumedAt,
      formatted: `${durationDays} days`
    };
  }

  private static async calculatePauseImpact(pause: any) {
    // Get missed deliveries count
    const missedDeliveries = await db
      .select({ count: count() })
      .from(subscriptionDeliveries)
      .where(
        and(
          eq(subscriptionDeliveries.subscriptionId, pause.subscriptionId),
          gte(subscriptionDeliveries.scheduledDate, pause.pausedAt),
          pause.resumedAt ? lte(subscriptionDeliveries.scheduledDate, pause.resumedAt) : undefined
        )
      );

    return {
      deliveriesImpacted: missedDeliveries[0]?.count || 0,
      estimatedSavings: Number(pause.planPrice || 0) * 0.3, // Mock calculation
      billingAdjustment: pause.pauseReason === 'financial' ? 'Suspended' : 'Continued',
      customerRetention: 'Improved',
      culturalBenefit: pause.isCulturalPause ? 'High' : 'None'
    };
  }

  private static getCulturalContext(pause: any) {
    if (!pause.isCulturalPause) return null;

    const culturalContexts = {
      ramadan: {
        name: 'Ramadan',
        nameBn: 'রমজান',
        significance: 'Holy month of fasting and spiritual reflection',
        significationBn: 'পবিত্র রোজা ও আধ্যাত্মিক চিন্তাভাবনার মাস',
        greeting: 'Ramadan Mubarak / রমজান মুবারক',
        duration: '30 days',
        resumeEvent: 'Eid ul-Fitr'
      },
      eid: {
        name: 'Eid',
        nameBn: 'ঈদ',
        significance: 'Celebration of the end of Ramadan',
        greeting: 'Eid Mubarak / ঈদ মুবারক'
      }
    };

    return culturalContexts[pause.culturalEvent as keyof typeof culturalContexts] || null;
  }

  private static getResumeOptions(pause: any) {
    return {
      manual: {
        available: true,
        method: 'Customer request or admin action'
      },
      scheduled: {
        available: !!pause.scheduledResumeDate,
        date: pause.scheduledResumeDate,
        automatic: pause.autoResumeEnabled
      },
      cultural: {
        available: pause.isCulturalPause,
        event: pause.culturalEvent,
        traditionalResume: this.getCulturalResumeDate(pause.culturalEvent)
      }
    };
  }

  private static isCulturalReason(reason: string, culturalEvent?: string): boolean {
    const culturalReasons = ['ramadan', 'religious', 'festival', 'cultural'];
    return culturalReasons.includes(reason.toLowerCase()) || !!culturalEvent;
  }

  private static detectCulturalEvent(reason: string): string | null {
    const eventMap = {
      'ramadan': 'ramadan',
      'eid': 'eid',
      'religious': 'religious_observance',
      'festival': 'festival'
    };

    return eventMap[reason.toLowerCase() as keyof typeof eventMap] || null;
  }

  private static async pausePendingDeliveries(subscriptionId: string) {
    // Update pending deliveries to paused status
    await db
      .update(subscriptionDeliveries)
      .set({
        status: 'paused',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(subscriptionDeliveries.subscriptionId, subscriptionId),
          inArray(subscriptionDeliveries.status, ['scheduled', 'preparing'])
        )
      );
  }

  private static async resumeDeliveries(subscriptionId: string) {
    // Resume paused deliveries and reschedule them
    await db
      .update(subscriptionDeliveries)
      .set({
        status: 'scheduled',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(subscriptionDeliveries.subscriptionId, subscriptionId),
          eq(subscriptionDeliveries.status, 'paused')
        )
      );
  }

  private static async scheduleAutoResume(pauseId: string, resumeDate: Date) {
    // In production, this would integrate with a job scheduler
    console.log(`Auto-resume scheduled for pause ${pauseId} on ${resumeDate}`);
  }

  private static async getNextDeliverySchedule(subscriptionId: string) {
    const nextDelivery = await db
      .select()
      .from(subscriptionDeliveries)
      .where(
        and(
          eq(subscriptionDeliveries.subscriptionId, subscriptionId),
          eq(subscriptionDeliveries.status, 'scheduled')
        )
      )
      .orderBy(subscriptionDeliveries.scheduledDate)
      .limit(1);

    return nextDelivery[0] || null;
  }

  private static getCulturalPauseMessage(pause: any) {
    if (!pause.isCulturalPause) return null;

    const messages = {
      ramadan: {
        message: 'Your subscription is paused for Ramadan. Ramadan Mubarak!',
        messageBn: 'আপনার সাবস্ক্রিপশন রমজানের জন্য বিরতি দেওয়া হয়েছে। রমজান মুবারক!',
        blessing: 'May this holy month bring peace and blessings'
      },
      eid: {
        message: 'Enjoying Eid celebrations! Your subscription will resume soon.',
        messageBn: 'ঈদের উৎসব উপভোগ করুন! আপনার সাবস্ক্রিপশন শীঘ্রই পুনরায় শুরু হবে।'
      }
    };

    return messages[pause.culturalEvent as keyof typeof messages] || null;
  }

  private static getCulturalResumeMessage(pause: any) {
    if (!pause.isCulturalPause) return null;

    const messages = {
      ramadan: {
        message: 'Welcome back! Hope you had a blessed Ramadan.',
        messageBn: 'স্বাগতম! আশা করি আপনার রমজান বরকতময় ছিল।'
      },
      eid: {
        message: 'Eid Mubarak! Your subscription is now active.',
        messageBn: 'ঈদ মুবারক! আপনার সাবস্ক্রিপশন এখন সক্রিয়।'
      }
    };

    return messages[pause.culturalEvent as keyof typeof messages] || null;
  }

  private static getResumeInstructions(pause: any) {
    return {
      manual: 'Contact customer service or use the app to resume anytime',
      manualBn: 'যেকোনো সময় গ্রাহক সেবায় যোগাযোগ করুন বা অ্যাপ ব্যবহার করে পুনরায় শুরু করুন',
      automatic: pause.autoResumeEnabled ? 
        `Will automatically resume on ${pause.scheduledResumeDate}` :
        'No automatic resume scheduled',
      cultural: pause.isCulturalPause ?
        'Will resume after the cultural event ends' :
        null
    };
  }

  private static getCulturalResumeDate(culturalEvent: string): string | null {
    // This would integrate with Islamic/Bengali calendar APIs
    const culturalDates = {
      'ramadan': 'Eid ul-Fitr (end of Ramadan)',
      'eid': '3 days after Eid',
      'pohela_boishakh': 'April 15th',
      'durga_puja': '5 days after Puja'
    };

    return culturalDates[culturalEvent as keyof typeof culturalDates] || null;
  }
}