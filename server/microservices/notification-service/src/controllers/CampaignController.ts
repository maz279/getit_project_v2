import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  campaigns, 
  notificationTemplates, 
  users, 
  notifications,
  emailLogs,
  smsLogs,
  pushNotifications,
  whatsappMessages,
  InsertCampaign,
  Campaign,
  InsertNotification
} from '../../../../../shared/schema';
import { eq, and, desc, asc, count, between, sql, inArray } from 'drizzle-orm';
import { logger } from '../../../../services/LoggingService';

/**
 * Campaign Controller
 * Manages marketing campaigns, bulk messaging, and promotional notifications
 * Amazon.com/Shopee.sg-level campaign management with analytics and automation
 */
export class CampaignController {
  private serviceName = 'notification-service:campaign-controller';

  /**
   * Create Campaign
   * Creates a new marketing campaign with targeting and scheduling
   */
  async createCampaign(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `campaign-create-${Date.now()}`;
    
    try {
      const {
        name,
        description,
        type,
        templateId,
        channels,
        targetAudience,
        scheduleType = 'immediate',
        scheduledAt,
        recurringPattern,
        budget,
        currency = 'BDT',
        testGroup = false, // A/B testing
        testPercentage = 10
      } = req.body;

      // Validate required fields
      if (!name || !type || !templateId || !channels || channels.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Required fields: name, type, templateId, channels'
        });
      }

      // Validate template exists
      const [template] = await db.select().from(notificationTemplates)
        .where(eq(notificationTemplates.id, templateId));
      
      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      // Calculate target audience size
      const audienceSize = await this.calculateAudienceSize(targetAudience);
      
      // Create campaign
      const campaignData: InsertCampaign = {
        name,
        description,
        type,
        templateId,
        channels,
        targetAudience,
        scheduleType,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        recurringPattern,
        totalRecipients: audienceSize,
        budget: budget ? budget.toString() : null,
        currency,
        createdBy: req.user?.id || 1, // Default admin user
        status: scheduleType === 'immediate' ? 'running' : 'scheduled'
      };

      const [campaign] = await db.insert(campaigns)
        .values(campaignData)
        .returning();

      // If immediate campaign, start sending
      if (scheduleType === 'immediate') {
        this.executeCampaign(campaign.id, testGroup, testPercentage);
      }

      logger.info('Campaign created', {
        serviceId: this.serviceName,
        correlationId,
        campaignId: campaign.id,
        audienceSize,
        scheduleType
      });

      res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          totalRecipients: campaign.totalRecipients,
          scheduledAt: campaign.scheduledAt,
          createdAt: campaign.createdAt
        }
      });

    } catch (error: any) {
      logger.error('Campaign creation failed', {
        serviceId: this.serviceName,
        correlationId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to create campaign',
        details: error.message
      });
    }
  }

  /**
   * Get Campaigns
   * Retrieve campaigns with filtering, sorting, and pagination
   */
  async getCampaigns(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        createdBy,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        startDate,
        endDate
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      // Build query conditions
      const conditions = [];
      if (status) conditions.push(eq(campaigns.status, status as string));
      if (type) conditions.push(eq(campaigns.type, type as string));
      if (createdBy) conditions.push(eq(campaigns.createdBy, parseInt(createdBy as string)));
      if (startDate && endDate) {
        conditions.push(between(campaigns.createdAt, new Date(startDate as string), new Date(endDate as string)));
      }
      if (search) {
        conditions.push(sql`(
          ${campaigns.name} ILIKE ${`%${search}%`} OR 
          ${campaigns.description} ILIKE ${`%${search}%`}
        )`);
      }

      // Get campaigns with creator info
      const campaignsList = await db.select({
        id: campaigns.id,
        name: campaigns.name,
        description: campaigns.description,
        type: campaigns.type,
        status: campaigns.status,
        channels: campaigns.channels,
        totalRecipients: campaigns.totalRecipients,
        sentCount: campaigns.sentCount,
        deliveredCount: campaigns.deliveredCount,
        openedCount: campaigns.openedCount,
        clickedCount: campaigns.clickedCount,
        bouncedCount: campaigns.bouncedCount,
        budget: campaigns.budget,
        spentAmount: campaigns.spentAmount,
        currency: campaigns.currency,
        scheduledAt: campaigns.scheduledAt,
        startedAt: campaigns.startedAt,
        completedAt: campaigns.completedAt,
        createdAt: campaigns.createdAt,
        creatorName: users.name,
        creatorEmail: users.email
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.createdBy, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sortOrder === 'desc' ? desc(campaigns[sortBy as keyof typeof campaigns]) : asc(campaigns[sortBy as keyof typeof campaigns]))
      .limit(parseInt(limit as string))
      .offset(offset);

      // Get total count
      const [{ total }] = await db.select({ total: count() })
        .from(campaigns)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Calculate performance metrics for each campaign
      const campaignsWithMetrics = campaignsList.map(campaign => ({
        ...campaign,
        deliveryRate: campaign.totalRecipients > 0 ? 
          ((campaign.deliveredCount || 0) / campaign.totalRecipients * 100).toFixed(2) : '0.00',
        openRate: campaign.deliveredCount > 0 ? 
          ((campaign.openedCount || 0) / campaign.deliveredCount * 100).toFixed(2) : '0.00',
        clickRate: campaign.openedCount > 0 ? 
          ((campaign.clickedCount || 0) / campaign.openedCount * 100).toFixed(2) : '0.00',
        bounceRate: campaign.sentCount > 0 ? 
          ((campaign.bouncedCount || 0) / campaign.sentCount * 100).toFixed(2) : '0.00'
      }));

      res.json({
        success: true,
        campaigns: campaignsWithMetrics,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });

    } catch (error: any) {
      logger.error('Failed to get campaigns', {
        serviceId: this.serviceName,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve campaigns',
        details: error.message
      });
    }
  }

  /**
   * Get Campaign Details
   * Retrieve detailed campaign information with analytics
   */
  async getCampaignDetails(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;

      // Get campaign details
      const [campaign] = await db.select({
        id: campaigns.id,
        name: campaigns.name,
        description: campaigns.description,
        type: campaigns.type,
        status: campaigns.status,
        targetAudience: campaigns.targetAudience,
        channels: campaigns.channels,
        scheduleType: campaigns.scheduleType,
        scheduledAt: campaigns.scheduledAt,
        recurringPattern: campaigns.recurringPattern,
        totalRecipients: campaigns.totalRecipients,
        sentCount: campaigns.sentCount,
        deliveredCount: campaigns.deliveredCount,
        openedCount: campaigns.openedCount,
        clickedCount: campaigns.clickedCount,
        bouncedCount: campaigns.bouncedCount,
        budget: campaigns.budget,
        spentAmount: campaigns.spentAmount,
        currency: campaigns.currency,
        startedAt: campaigns.startedAt,
        completedAt: campaigns.completedAt,
        createdAt: campaigns.createdAt,
        templateName: notificationTemplates.name,
        templateSubject: notificationTemplates.subject,
        creatorName: users.name,
        creatorEmail: users.email
      })
      .from(campaigns)
      .leftJoin(notificationTemplates, eq(campaigns.templateId, notificationTemplates.id))
      .leftJoin(users, eq(campaigns.createdBy, users.id))
      .where(eq(campaigns.id, campaignId));

      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        });
      }

      // Get delivery analytics by channel
      const deliveryAnalytics = await db.select({
        channel: deliveryLogs.channel,
        sent: count(deliveryLogs.id),
        delivered: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`,
        failed: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'failed' THEN 1 END)`,
        avgDeliveryTime: sql<number>`AVG(${deliveryLogs.deliveryTime})`,
        totalCost: sql<number>`SUM(${deliveryLogs.cost})`
      })
      .from(deliveryLogs)
      .innerJoin(notifications, eq(deliveryLogs.notificationId, notifications.id))
      .where(eq(notifications.data, sql`jsonb_build_object('campaignId', ${campaignId})`))
      .groupBy(deliveryLogs.channel);

      // Get recent delivery logs for timeline
      const recentDeliveries = await db.select({
        id: deliveryLogs.id,
        channel: deliveryLogs.channel,
        status: deliveryLogs.status,
        recipientAddress: deliveryLogs.recipientAddress,
        deliveryTime: deliveryLogs.deliveryTime,
        cost: deliveryLogs.cost,
        sentAt: deliveryLogs.sentAt,
        deliveredAt: deliveryLogs.deliveredAt
      })
      .from(deliveryLogs)
      .innerJoin(notifications, eq(deliveryLogs.notificationId, notifications.id))
      .where(eq(notifications.data, sql`jsonb_build_object('campaignId', ${campaignId})`))
      .orderBy(desc(deliveryLogs.createdAt))
      .limit(50);

      // Calculate performance metrics
      const metrics = {
        deliveryRate: campaign.totalRecipients > 0 ? 
          ((campaign.deliveredCount || 0) / campaign.totalRecipients * 100) : 0,
        openRate: campaign.deliveredCount > 0 ? 
          ((campaign.openedCount || 0) / campaign.deliveredCount * 100) : 0,
        clickRate: campaign.openedCount > 0 ? 
          ((campaign.clickedCount || 0) / campaign.openedCount * 100) : 0,
        bounceRate: campaign.sentCount > 0 ? 
          ((campaign.bouncedCount || 0) / campaign.sentCount * 100) : 0,
        budgetUtilization: campaign.budget ? 
          ((parseFloat(campaign.spentAmount || '0') / parseFloat(campaign.budget)) * 100) : 0
      };

      res.json({
        success: true,
        campaign: {
          ...campaign,
          metrics
        },
        analytics: {
          byChannel: deliveryAnalytics,
          recentDeliveries
        }
      });

    } catch (error: any) {
      logger.error('Failed to get campaign details', {
        serviceId: this.serviceName,
        campaignId: req.params.campaignId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve campaign details',
        details: error.message
      });
    }
  }

  /**
   * Execute Campaign
   * Processes and sends campaign notifications to target audience
   */
  async executeCampaign(campaignId: string, testGroup: boolean = false, testPercentage: number = 10) {
    try {
      // Get campaign details
      const [campaign] = await db.select().from(campaigns)
        .where(eq(campaigns.id, campaignId));

      if (!campaign || campaign.status !== 'scheduled') {
        throw new Error('Campaign not found or not in scheduled status');
      }

      // Update campaign status
      await db.update(campaigns)
        .set({ 
          status: 'running',
          startedAt: new Date()
        })
        .where(eq(campaigns.id, campaignId));

      // Get target audience
      const targetUsers = await this.getTargetAudience(campaign.targetAudience, testGroup, testPercentage);

      // Get template
      const [template] = await db.select().from(notificationTemplates)
        .where(eq(notificationTemplates.id, campaign.templateId!));

      if (!template) {
        throw new Error('Template not found');
      }

      // Send notifications in batches
      const batchSize = 100;
      let sentCount = 0;
      
      for (let i = 0; i < targetUsers.length; i += batchSize) {
        const batch = targetUsers.slice(i, i + batchSize);
        
        for (const user of batch) {
          // Create notification for each channel
          for (const channel of campaign.channels) {
            const notificationData: InsertNotification = {
              userId: user.id,
              type: campaign.type,
              channel,
              title: template.subject || campaign.name,
              message: this.personalizeContent(template.bodyTemplate, user),
              data: JSON.stringify({ 
                campaignId: campaign.id,
                templateId: template.id,
                channel
              }),
              status: 'pending',
              priority: 'normal'
            };

            await db.insert(notifications).values(notificationData);
            sentCount++;
          }
        }

        // Update sent count
        await db.update(campaigns)
          .set({ sentCount })
          .where(eq(campaigns.id, campaignId));

        // Add delay between batches to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Mark campaign as completed if all sent
      await db.update(campaigns)
        .set({ 
          status: 'completed',
          completedAt: new Date(),
          sentCount
        })
        .where(eq(campaigns.id, campaignId));

      logger.info('Campaign executed successfully', {
        serviceId: this.serviceName,
        campaignId,
        sentCount,
        channels: campaign.channels
      });

    } catch (error: any) {
      // Mark campaign as failed
      await db.update(campaigns)
        .set({ status: 'failed' })
        .where(eq(campaigns.id, campaignId));

      logger.error('Campaign execution failed', {
        serviceId: this.serviceName,
        campaignId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Pause Campaign
   * Pauses a running campaign
   */
  async pauseCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;

      const [campaign] = await db.update(campaigns)
        .set({ 
          status: 'paused',
          updatedAt: new Date()
        })
        .where(and(
          eq(campaigns.id, campaignId),
          eq(campaigns.status, 'running')
        ))
        .returning();

      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found or not in running status'
        });
      }

      res.json({
        success: true,
        message: 'Campaign paused successfully',
        campaign: {
          id: campaign.id,
          status: campaign.status,
          updatedAt: campaign.updatedAt
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to pause campaign',
        details: error.message
      });
    }
  }

  /**
   * Resume Campaign
   * Resumes a paused campaign
   */
  async resumeCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;

      const [campaign] = await db.update(campaigns)
        .set({ 
          status: 'running',
          updatedAt: new Date()
        })
        .where(and(
          eq(campaigns.id, campaignId),
          eq(campaigns.status, 'paused')
        ))
        .returning();

      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found or not in paused status'
        });
      }

      res.json({
        success: true,
        message: 'Campaign resumed successfully',
        campaign: {
          id: campaign.id,
          status: campaign.status,
          updatedAt: campaign.updatedAt
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to resume campaign',
        details: error.message
      });
    }
  }

  /**
   * Cancel Campaign
   * Cancels a scheduled or running campaign
   */
  async cancelCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;

      const [campaign] = await db.update(campaigns)
        .set({ 
          status: 'cancelled',
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(campaigns.id, campaignId),
          inArray(campaigns.status, ['scheduled', 'running', 'paused'])
        ))
        .returning();

      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found or cannot be cancelled'
        });
      }

      res.json({
        success: true,
        message: 'Campaign cancelled successfully',
        campaign: {
          id: campaign.id,
          status: campaign.status,
          completedAt: campaign.completedAt
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to cancel campaign',
        details: error.message
      });
    }
  }

  /**
   * Get Campaign Analytics
   * Comprehensive campaign performance analytics
   */
  async getCampaignAnalytics(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const { timeframe = '7d' } = req.query;

      // Calculate date range based on timeframe
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
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
          startDate.setDate(endDate.getDate() - 7);
      }

      // Get campaign performance data
      const analytics = await db.select({
        date: sql<string>`DATE(${deliveryLogs.createdAt})`,
        channel: deliveryLogs.channel,
        sent: count(deliveryLogs.id),
        delivered: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`,
        opened: sql<number>`COUNT(CASE WHEN ${deliveryLogs.openedAt} IS NOT NULL THEN 1 END)`,
        clicked: sql<number>`COUNT(CASE WHEN ${deliveryLogs.clickedAt} IS NOT NULL THEN 1 END)`,
        failed: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'failed' THEN 1 END)`,
        avgDeliveryTime: sql<number>`AVG(${deliveryLogs.deliveryTime})`,
        totalCost: sql<number>`SUM(${deliveryLogs.cost})`
      })
      .from(deliveryLogs)
      .innerJoin(notifications, eq(deliveryLogs.notificationId, notifications.id))
      .where(and(
        eq(notifications.data, sql`jsonb_build_object('campaignId', ${campaignId})`),
        between(deliveryLogs.createdAt, startDate, endDate)
      ))
      .groupBy(sql`DATE(${deliveryLogs.createdAt})`, deliveryLogs.channel)
      .orderBy(sql`DATE(${deliveryLogs.createdAt})`);

      // Get overall campaign metrics
      const [overallMetrics] = await db.select({
        totalSent: campaigns.sentCount,
        totalDelivered: campaigns.deliveredCount,
        totalOpened: campaigns.openedCount,
        totalClicked: campaigns.clickedCount,
        totalBounced: campaigns.bouncedCount,
        totalCost: campaigns.spentAmount,
        currency: campaigns.currency
      })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

      res.json({
        success: true,
        analytics: {
          timeframe,
          overall: overallMetrics,
          daily: analytics,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get campaign analytics',
        details: error.message
      });
    }
  }

  // Helper Methods

  private async calculateAudienceSize(targetAudience: any): Promise<number> {
    try {
      if (!targetAudience) return 0;

      // Build user query based on audience criteria
      let query = db.select({ count: count() }).from(users);
      
      // Add filtering conditions based on targetAudience criteria
      // This is a simplified version - in production, you'd have more complex segmentation
      if (targetAudience.userIds) {
        query = query.where(inArray(users.id, targetAudience.userIds));
      }

      const [result] = await query;
      return result.count;
    } catch (error) {
      logger.error('Failed to calculate audience size', { error });
      return 0;
    }
  }

  private async getTargetAudience(targetAudience: any, testGroup: boolean, testPercentage: number): Promise<any[]> {
    try {
      let query = db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        preferredLanguage: users.preferredLanguage
      }).from(users);

      // Apply audience filters
      if (targetAudience?.userIds) {
        query = query.where(inArray(users.id, targetAudience.userIds));
      }

      let audience = await query;

      // Apply test group filtering if needed
      if (testGroup && testPercentage > 0) {
        const testSize = Math.ceil(audience.length * (testPercentage / 100));
        audience = audience.slice(0, testSize);
      }

      return audience;
    } catch (error) {
      logger.error('Failed to get target audience', { error });
      return [];
    }
  }

  private personalizeContent(template: string, user: any): string {
    return template
      .replace(/{{user\.name}}/g, user.name || 'Valued Customer')
      .replace(/{{user\.email}}/g, user.email || '')
      .replace(/{{user\.phone}}/g, user.phone || '');
  }
}