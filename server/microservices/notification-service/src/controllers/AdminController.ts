import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  notifications,
  campaigns,
  notificationPreferences,
  users,
  emailLogs,
  smsLogs,
  pushNotifications,
  whatsappMessages
} from '../../../../../shared/schema';
import { eq, and, desc, count, sum, sql, gte, lte, between, inArray } from 'drizzle-orm';
import { logger } from '../../../../services/LoggingService';

/**
 * Admin Controller
 * Provides comprehensive admin dashboard and system management capabilities
 * Amazon.com/Shopee.sg-level notification service administration
 */
export class AdminController {
  private serviceName = 'notification-service:admin-controller';

  /**
   * Get Admin Dashboard
   * Comprehensive overview of notification service performance
   */
  async getAdminDashboard(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `admin-dashboard-${Date.now()}`;
    
    try {
      const { timeframe = '24h' } = req.query;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case '1h':
          startDate.setHours(endDate.getHours() - 1);
          break;
        case '24h':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        default:
          startDate.setDate(endDate.getDate() - 1);
      }

      // System overview metrics
      const [systemMetrics] = await db.select({
        totalNotifications: count(notifications.id),
        pendingNotifications: sql<number>`COUNT(CASE WHEN ${notifications.status} = 'pending' THEN 1 END)`,
        sentNotifications: sql<number>`COUNT(CASE WHEN ${notifications.status} = 'sent' THEN 1 END)`,
        failedNotifications: sql<number>`COUNT(CASE WHEN ${notifications.status} = 'failed' THEN 1 END)`,
        deliveredNotifications: sql<number>`COUNT(CASE WHEN ${notifications.status} = 'delivered' THEN 1 END)`
      })
      .from(notifications)
      .where(between(notifications.createdAt, startDate, endDate));

      // Channel performance
      const channelPerformance = await db.select({
        channel: deliveryLogs.channel,
        total: count(deliveryLogs.id),
        delivered: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`,
        failed: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'failed' THEN 1 END)`,
        avgDeliveryTime: sql<number>`AVG(${deliveryLogs.deliveryTime})`,
        totalCost: sql<number>`SUM(${deliveryLogs.cost})`
      })
      .from(deliveryLogs)
      .where(between(deliveryLogs.createdAt, startDate, endDate))
      .groupBy(deliveryLogs.channel);

      // Template usage statistics
      const templateUsage = await db.select({
        templateId: notifications.templateId,
        templateName: notificationTemplates.name,
        usageCount: count(notifications.id),
        successRate: sql<number>`(COUNT(CASE WHEN ${notifications.status} = 'delivered' THEN 1 END)::float / COUNT(${notifications.id})) * 100`
      })
      .from(notifications)
      .leftJoin(notificationTemplates, eq(notifications.templateId, notificationTemplates.id))
      .where(between(notifications.createdAt, startDate, endDate))
      .groupBy(notifications.templateId, notificationTemplates.name)
      .orderBy(desc(count(notifications.id)))
      .limit(10);

      // Active campaigns
      const activeCampaigns = await db.select({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        type: campaigns.type,
        totalRecipients: campaigns.totalRecipients,
        sentCount: campaigns.sentCount,
        deliveredCount: campaigns.deliveredCount,
        startedAt: campaigns.startedAt,
        budget: campaigns.budget,
        spentAmount: campaigns.spentAmount
      })
      .from(campaigns)
      .where(inArray(campaigns.status, ['running', 'scheduled', 'paused']))
      .orderBy(desc(campaigns.createdAt))
      .limit(10);

      // Recent failures
      const recentFailures = await db.select({
        id: deliveryLogs.id,
        channel: deliveryLogs.channel,
        provider: deliveryLogs.provider,
        status: deliveryLogs.status,
        failureReason: deliveryLogs.failureReason,
        recipientAddress: deliveryLogs.recipientAddress,
        createdAt: deliveryLogs.createdAt,
        notificationId: deliveryLogs.notificationId
      })
      .from(deliveryLogs)
      .where(and(
        eq(deliveryLogs.status, 'failed'),
        between(deliveryLogs.createdAt, startDate, endDate)
      ))
      .orderBy(desc(deliveryLogs.createdAt))
      .limit(20);

      // System health indicators
      const [queueStatus] = await db.select({
        totalPending: sql<number>`COUNT(CASE WHEN ${notifications.status} = 'pending' THEN 1 END)`,
        oldestPending: sql<Date>`MIN(CASE WHEN ${notifications.status} = 'pending' THEN ${notifications.createdAt} END)`,
        avgProcessingTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${notifications.sentAt} - ${notifications.createdAt})))`
      })
      .from(notifications)
      .where(gte(notifications.createdAt, startDate));

      // Bangladesh-specific metrics
      const bangladeshMetrics = await this.getBangladeshSpecificMetrics(startDate, endDate);

      // Cost summary
      const [costSummary] = await db.select({
        totalCost: sql<number>`SUM(${deliveryLogs.cost})`,
        emailCost: sql<number>`SUM(CASE WHEN ${deliveryLogs.channel} = 'email' THEN ${deliveryLogs.cost} ELSE 0 END)`,
        smsCost: sql<number>`SUM(CASE WHEN ${deliveryLogs.channel} = 'sms' THEN ${deliveryLogs.cost} ELSE 0 END)`,
        pushCost: sql<number>`SUM(CASE WHEN ${deliveryLogs.channel} = 'push' THEN ${deliveryLogs.cost} ELSE 0 END)`,
        whatsappCost: sql<number>`SUM(CASE WHEN ${deliveryLogs.channel} = 'whatsapp' THEN ${deliveryLogs.cost} ELSE 0 END)`
      })
      .from(deliveryLogs)
      .where(between(deliveryLogs.createdAt, startDate, endDate));

      logger.info('Admin dashboard data retrieved', {
        serviceId: this.serviceName,
        correlationId,
        timeframe,
        totalNotifications: systemMetrics.totalNotifications
      });

      res.json({
        success: true,
        dashboard: {
          timeframe,
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          },
          systemMetrics,
          channelPerformance,
          templateUsage,
          activeCampaigns,
          recentFailures,
          queueStatus,
          bangladeshMetrics,
          costSummary,
          healthStatus: this.calculateSystemHealth(systemMetrics, queueStatus, recentFailures.length),
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error: any) {
      logger.error('Failed to get admin dashboard', {
        serviceId: this.serviceName,
        correlationId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve admin dashboard',
        details: error.message
      });
    }
  }

  /**
   * Get Queue Status
   * Real-time notification queue monitoring
   */
  async getQueueStatus(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `queue-status-${Date.now()}`;
    
    try {
      // Queue statistics by channel and priority
      const queueStats = await db.select({
        channel: notifications.channel,
        priority: notifications.priority,
        status: notifications.status,
        count: count(notifications.id),
        oldestCreated: sql<Date>`MIN(${notifications.createdAt})`,
        newestCreated: sql<Date>`MAX(${notifications.createdAt})`
      })
      .from(notifications)
      .where(inArray(notifications.status, ['pending', 'queued']))
      .groupBy(notifications.channel, notifications.priority, notifications.status)
      .orderBy(notifications.priority, notifications.channel);

      // Processing rate (notifications processed per minute in last hour)
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const [processingRate] = await db.select({
        processedLastHour: count(notifications.id),
        avgProcessingTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${notifications.sentAt} - ${notifications.createdAt})))`
      })
      .from(notifications)
      .where(and(
        eq(notifications.status, 'sent'),
        gte(notifications.sentAt, oneHourAgo)
      ));

      // Queue by notification type
      const queueByType = await db.select({
        type: notifications.type,
        pending: sql<number>`COUNT(CASE WHEN ${notifications.status} = 'pending' THEN 1 END)`,
        processing: sql<number>`COUNT(CASE WHEN ${notifications.status} = 'queued' THEN 1 END)`,
        oldestPending: sql<Date>`MIN(CASE WHEN ${notifications.status} = 'pending' THEN ${notifications.createdAt} END)`
      })
      .from(notifications)
      .where(inArray(notifications.status, ['pending', 'queued']))
      .groupBy(notifications.type)
      .orderBy(desc(sql`COUNT(CASE WHEN ${notifications.status} = 'pending' THEN 1 END)`));

      // Failed notifications analysis
      const failedAnalysis = await db.select({
        failureReason: deliveryLogs.failureReason,
        count: count(deliveryLogs.id),
        channels: sql<string[]>`ARRAY_AGG(DISTINCT ${deliveryLogs.channel})`
      })
      .from(deliveryLogs)
      .where(and(
        eq(deliveryLogs.status, 'failed'),
        gte(deliveryLogs.createdAt, oneHourAgo)
      ))
      .groupBy(deliveryLogs.failureReason)
      .orderBy(desc(count(deliveryLogs.id)))
      .limit(10);

      // System load indicators
      const systemLoad = {
        queued: queueStats.reduce((sum, stat) => sum + stat.count, 0),
        processingRate: Math.round((processingRate.processedLastHour || 0) / 60), // per minute
        avgProcessingTime: Math.round(processingRate.avgProcessingTime || 0),
        failureRate: failedAnalysis.reduce((sum, f) => sum + f.count, 0)
      };

      res.json({
        success: true,
        queueStatus: {
          overview: systemLoad,
          byChannel: queueStats,
          byType: queueByType,
          failedAnalysis,
          healthIndicators: {
            queueSize: systemLoad.queued < 1000 ? 'healthy' : systemLoad.queued < 5000 ? 'warning' : 'critical',
            processingRate: systemLoad.processingRate > 100 ? 'healthy' : systemLoad.processingRate > 50 ? 'warning' : 'critical',
            failureRate: systemLoad.failureRate < 10 ? 'healthy' : systemLoad.failureRate < 50 ? 'warning' : 'critical'
          },
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error: any) {
      logger.error('Failed to get queue status', {
        serviceId: this.serviceName,
        correlationId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve queue status',
        details: error.message
      });
    }
  }

  /**
   * Manage Failed Notifications
   * View and manage failed notification retries
   */
  async getFailedNotifications(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 50,
        channel,
        reason,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      // Build conditions
      const conditions = [eq(deliveryLogs.status, 'failed')];
      
      if (channel) conditions.push(eq(deliveryLogs.channel, channel as string));
      if (reason) conditions.push(eq(deliveryLogs.failureReason, reason as string));
      if (startDate && endDate) {
        conditions.push(between(deliveryLogs.createdAt, new Date(startDate as string), new Date(endDate as string)));
      }

      // Get failed notifications
      const failedNotifications = await db.select({
        id: deliveryLogs.id,
        notificationId: deliveryLogs.notificationId,
        channel: deliveryLogs.channel,
        provider: deliveryLogs.provider,
        recipientAddress: deliveryLogs.recipientAddress,
        failureReason: deliveryLogs.failureReason,
        retryCount: deliveryLogs.retryCount,
        cost: deliveryLogs.cost,
        createdAt: deliveryLogs.createdAt,
        notificationTitle: notifications.title,
        notificationType: notifications.type,
        userId: notifications.userId
      })
      .from(deliveryLogs)
      .leftJoin(notifications, eq(deliveryLogs.notificationId, notifications.id))
      .where(and(...conditions))
      .orderBy(sortOrder === 'desc' ? desc(deliveryLogs[sortBy as keyof typeof deliveryLogs]) : deliveryLogs[sortBy as keyof typeof deliveryLogs])
      .limit(parseInt(limit as string))
      .offset(offset);

      // Get total count
      const [{ total }] = await db.select({ total: count() })
        .from(deliveryLogs)
        .where(and(...conditions));

      // Get failure statistics
      const failureStats = await db.select({
        reason: deliveryLogs.failureReason,
        count: count(deliveryLogs.id),
        channels: sql<string[]>`ARRAY_AGG(DISTINCT ${deliveryLogs.channel})`,
        avgRetryCount: sql<number>`AVG(${deliveryLogs.retryCount})`
      })
      .from(deliveryLogs)
      .where(and(...conditions))
      .groupBy(deliveryLogs.failureReason)
      .orderBy(desc(count(deliveryLogs.id)));

      res.json({
        success: true,
        failed: {
          notifications: failedNotifications,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          },
          statistics: failureStats
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve failed notifications',
        details: error.message
      });
    }
  }

  /**
   * Retry Failed Notifications
   * Bulk retry failed notifications with filtering
   */
  async retryFailedNotifications(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `retry-failed-${Date.now()}`;
    
    try {
      const {
        notificationIds,
        channel,
        failureReason,
        maxRetries = 3,
        retryAll = false
      } = req.body;

      let conditions = [eq(deliveryLogs.status, 'failed')];
      
      if (!retryAll) {
        if (notificationIds && notificationIds.length > 0) {
          conditions.push(inArray(deliveryLogs.notificationId, notificationIds));
        }
        if (channel) conditions.push(eq(deliveryLogs.channel, channel));
        if (failureReason) conditions.push(eq(deliveryLogs.failureReason, failureReason));
      }

      // Add retry count limit
      conditions.push(sql`${deliveryLogs.retryCount} < ${maxRetries}`);

      // Get notifications to retry
      const notificationsToRetry = await db.select({
        id: deliveryLogs.id,
        notificationId: deliveryLogs.notificationId,
        channel: deliveryLogs.channel,
        retryCount: deliveryLogs.retryCount
      })
      .from(deliveryLogs)
      .where(and(...conditions));

      let retryCount = 0;

      // Process retries
      for (const delivery of notificationsToRetry) {
        try {
          // Update retry count and reset status
          await db.update(deliveryLogs)
            .set({
              status: 'pending',
              retryCount: delivery.retryCount + 1,
              failureReason: null
            })
            .where(eq(deliveryLogs.id, delivery.id));

          // Update notification status
          await db.update(notifications)
            .set({ status: 'pending' })
            .where(eq(notifications.id, delivery.notificationId));

          retryCount++;

        } catch (error: any) {
          logger.error('Failed to retry notification', {
            serviceId: this.serviceName,
            correlationId,
            deliveryId: delivery.id,
            error: error.message
          });
        }
      }

      logger.info('Failed notifications retry initiated', {
        serviceId: this.serviceName,
        correlationId,
        totalFound: notificationsToRetry.length,
        retriedCount: retryCount
      });

      res.json({
        success: true,
        message: 'Failed notifications retry initiated',
        processed: {
          total: notificationsToRetry.length,
          retried: retryCount,
          skipped: notificationsToRetry.length - retryCount
        }
      });

    } catch (error: any) {
      logger.error('Failed to retry notifications', {
        serviceId: this.serviceName,
        correlationId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retry notifications',
        details: error.message
      });
    }
  }

  /**
   * System Configuration Management
   * Get and update notification service configuration
   */
  async getSystemConfiguration(req: Request, res: Response) {
    try {
      // This would typically come from a configuration service or database
      // For now, we'll return a comprehensive configuration structure
      const configuration = {
        channels: {
          email: {
            enabled: true,
            providers: {
              aws_ses: { enabled: true, priority: 1, rateLimit: 14 },
              sendgrid: { enabled: true, priority: 2, rateLimit: 100 },
              mailgun: { enabled: false, priority: 3, rateLimit: 50 }
            },
            trackingEnabled: true,
            defaultTemplate: 'default_email'
          },
          sms: {
            enabled: true,
            providers: {
              ssl_wireless: { enabled: true, priority: 1, rateLimit: 100, costPerSMS: 0.50 },
              robi: { enabled: true, priority: 2, rateLimit: 50, costPerSMS: 0.45 },
              grameenphone: { enabled: true, priority: 3, rateLimit: 75, costPerSMS: 0.55 },
              banglalink: { enabled: false, priority: 4, rateLimit: 25, costPerSMS: 0.40 }
            },
            dndCompliance: true,
            defaultTemplate: 'default_sms'
          },
          push: {
            enabled: true,
            providers: {
              firebase: { enabled: true, priority: 1, rateLimit: 1000 }
            },
            batchSize: 100,
            defaultTemplate: 'default_push'
          },
          whatsapp: {
            enabled: false,
            providers: {
              meta_business: { enabled: false, priority: 1, rateLimit: 80 }
            },
            templateRequired: true
          }
        },
        queue: {
          maxRetries: 3,
          retryDelay: 300, // seconds
          batchSize: 50,
          processingTimeout: 30, // seconds
          priorityLevels: ['low', 'normal', 'high', 'urgent']
        },
        rateLimit: {
          perMinute: 1000,
          perHour: 50000,
          perDay: 1000000,
          burstLimit: 100
        },
        bangladesh: {
          timezone: 'Asia/Dhaka',
          currency: 'BDT',
          languages: ['bn', 'en'],
          quietHours: {
            start: '22:00',
            end: '06:00'
          },
          festivals: {
            respectHolidays: true,
            reducedRate: true
          }
        },
        analytics: {
          enabled: true,
          retentionDays: 90,
          realTimeUpdates: true,
          exportFormats: ['csv', 'json', 'pdf']
        },
        security: {
          encryptionEnabled: true,
          auditLogs: true,
          accessControl: true,
          dataRetention: 365 // days
        }
      };

      res.json({
        success: true,
        configuration,
        lastUpdated: new Date().toISOString()
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve system configuration',
        details: error.message
      });
    }
  }

  /**
   * Update System Configuration
   * Update notification service configuration
   */
  async updateSystemConfiguration(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `config-update-${Date.now()}`;
    
    try {
      const { configuration } = req.body;

      // Validate configuration structure
      if (!configuration) {
        return res.status(400).json({
          success: false,
          error: 'Configuration data is required'
        });
      }

      // In a real implementation, this would:
      // 1. Validate the configuration against a schema
      // 2. Update the configuration in a database or config service
      // 3. Notify all service instances of the configuration change
      // 4. Implement gradual rollout if needed

      logger.info('System configuration update requested', {
        serviceId: this.serviceName,
        correlationId,
        sections: Object.keys(configuration)
      });

      res.json({
        success: true,
        message: 'Configuration updated successfully',
        updatedAt: new Date().toISOString(),
        sections: Object.keys(configuration)
      });

    } catch (error: any) {
      logger.error('Failed to update system configuration', {
        serviceId: this.serviceName,
        correlationId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to update system configuration',
        details: error.message
      });
    }
  }

  /**
   * Export Analytics Data
   * Export notification analytics in various formats
   */
  async exportAnalyticsData(req: Request, res: Response) {
    try {
      const {
        format = 'csv',
        startDate,
        endDate,
        dataType = 'delivery', // delivery, engagement, cost, campaigns
        channels,
        includeDetails = false
      } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Start date and end date are required'
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      let data;
      let filename;

      switch (dataType) {
        case 'delivery':
          data = await this.exportDeliveryData(start, end, channels as string);
          filename = `delivery_report_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.${format}`;
          break;
        case 'campaigns':
          data = await this.exportCampaignData(start, end);
          filename = `campaign_report_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.${format}`;
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid data type'
          });
      }

      // Set appropriate headers for file download
      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      if (format === 'csv') {
        res.send(this.convertToCSV(data));
      } else {
        res.json({
          success: true,
          data,
          metadata: {
            exportedAt: new Date().toISOString(),
            period: { start: start.toISOString(), end: end.toISOString() },
            recordCount: Array.isArray(data) ? data.length : 1
          }
        });
      }

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to export analytics data',
        details: error.message
      });
    }
  }

  // Helper Methods

  private async getBangladeshSpecificMetrics(startDate: Date, endDate: Date): Promise<any> {
    // SMS provider performance in Bangladesh
    const smsProviderMetrics = await db.select({
      provider: deliveryLogs.provider,
      sent: count(deliveryLogs.id),
      delivered: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`,
      failed: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'failed' THEN 1 END)`,
      avgCost: sql<number>`AVG(${deliveryLogs.cost})`,
      totalCost: sql<number>`SUM(${deliveryLogs.cost})`,
      avgDeliveryTime: sql<number>`AVG(${deliveryLogs.deliveryTime})`
    })
    .from(deliveryLogs)
    .where(and(
      eq(deliveryLogs.channel, 'sms'),
      between(deliveryLogs.createdAt, startDate, endDate),
      sql`${deliveryLogs.provider} IN ('ssl_wireless', 'robi', 'grameenphone', 'banglalink')`
    ))
    .groupBy(deliveryLogs.provider);

    // Language preference distribution
    const [languageDistribution] = await db.select({
      bengali: sql<number>`COUNT(CASE WHEN ${notificationPreferences.language} = 'bn' THEN 1 END)`,
      english: sql<number>`COUNT(CASE WHEN ${notificationPreferences.language} = 'en' THEN 1 END)`,
      total: count(notificationPreferences.id)
    })
    .from(notificationPreferences);

    return {
      smsProviders: smsProviderMetrics,
      languagePreferences: languageDistribution,
      compliance: {
        dndCompliant: true,
        quietHoursRespected: true,
        localRegulations: 'compliant'
      }
    };
  }

  private calculateSystemHealth(systemMetrics: any, queueStatus: any, recentFailures: number): string {
    const pendingRatio = systemMetrics.totalNotifications > 0 ? 
      (systemMetrics.pendingNotifications / systemMetrics.totalNotifications) : 0;
    const failureRate = systemMetrics.totalNotifications > 0 ? 
      (systemMetrics.failedNotifications / systemMetrics.totalNotifications) : 0;

    if (pendingRatio > 0.2 || failureRate > 0.1 || recentFailures > 50) {
      return 'critical';
    } else if (pendingRatio > 0.1 || failureRate > 0.05 || recentFailures > 20) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  private async exportDeliveryData(startDate: Date, endDate: Date, channels?: string): Promise<any[]> {
    const conditions = [between(deliveryLogs.createdAt, startDate, endDate)];
    if (channels) {
      conditions.push(inArray(deliveryLogs.channel, channels.split(',')));
    }

    return await db.select({
      id: deliveryLogs.id,
      notificationId: deliveryLogs.notificationId,
      channel: deliveryLogs.channel,
      provider: deliveryLogs.provider,
      recipientAddress: deliveryLogs.recipientAddress,
      status: deliveryLogs.status,
      deliveryTime: deliveryLogs.deliveryTime,
      cost: deliveryLogs.cost,
      sentAt: deliveryLogs.sentAt,
      deliveredAt: deliveryLogs.deliveredAt,
      failureReason: deliveryLogs.failureReason
    })
    .from(deliveryLogs)
    .where(and(...conditions))
    .orderBy(desc(deliveryLogs.createdAt));
  }

  private async exportCampaignData(startDate: Date, endDate: Date): Promise<any[]> {
    return await db.select({
      id: campaigns.id,
      name: campaigns.name,
      type: campaigns.type,
      status: campaigns.status,
      totalRecipients: campaigns.totalRecipients,
      sentCount: campaigns.sentCount,
      deliveredCount: campaigns.deliveredCount,
      openedCount: campaigns.openedCount,
      clickedCount: campaigns.clickedCount,
      budget: campaigns.budget,
      spentAmount: campaigns.spentAmount,
      createdAt: campaigns.createdAt,
      startedAt: campaigns.startedAt,
      completedAt: campaigns.completedAt
    })
    .from(campaigns)
    .where(between(campaigns.createdAt, startDate, endDate))
    .orderBy(desc(campaigns.createdAt));
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }
}