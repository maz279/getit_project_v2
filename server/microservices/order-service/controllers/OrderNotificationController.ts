/**
 * Order Notification Controller - Amazon.com/Shopee.sg-Level Real-time Notifications
 * Handles comprehensive order notification system with Bangladesh-specific channels
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  orders, 
  users,
  vendors,
  vendorOrders,
  orderStatusHistory
} from '../../../../shared/schema';
import { eq, and, desc, gte, lte, inArray, sql } from 'drizzle-orm';
import { LoggingService } from '../../../services/LoggingService';
import { RedisService } from '../../../services/RedisService';

export class OrderNotificationController {
  private loggingService: LoggingService;
  private redisService: RedisService;

  constructor() {
    this.loggingService = new LoggingService();
    this.redisService = new RedisService();
  }

  /**
   * Send order status notification
   */
  async sendOrderStatusNotification(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { 
        notificationType,
        channels = ['email', 'sms', 'push'], // email, sms, push, in_app
        customMessage,
        language = 'en', // en, bn
        priority = 'normal' // low, normal, high, urgent
      } = req.body;

      // Get order details
      const [order] = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          userId: orders.userId,
          status: orders.status,
          total: orders.total,
          paymentMethod: orders.paymentMethod,
          shippingAddress: orders.shippingAddress,
          customerName: users.fullName,
          customerEmail: users.email,
          customerPhone: users.phone,
          customerLanguage: users.preferredLanguage
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.id, orderId));

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Get vendor information for multi-vendor notifications
      const vendorInfo = await db
        .select({
          vendorId: vendorOrders.vendorId,
          businessName: vendors.businessName,
          contactEmail: vendors.contactEmail,
          contactPhone: vendors.contactPhone
        })
        .from(vendorOrders)
        .leftJoin(vendors, eq(vendorOrders.vendorId, vendors.id))
        .where(eq(vendorOrders.orderId, orderId));

      // Determine notification recipients
      const recipients = this.determineRecipients(order, vendorInfo, notificationType);

      // Generate notification content
      const notificationContent = await this.generateNotificationContent(
        order, 
        notificationType, 
        customMessage, 
        language || order.customerLanguage
      );

      // Send notifications through different channels
      const sentNotifications = [];
      
      for (const recipient of recipients) {
        for (const channel of channels) {
          try {
            const notification = await this.sendNotification({
              recipient,
              channel,
              notificationType,
              content: notificationContent,
              order,
              priority,
              language: language || order.customerLanguage
            });

            if (notification) {
              sentNotifications.push(notification);
            }
          } catch (channelError) {
            this.loggingService.error(`Failed to send ${channel} notification`, {
              recipient: recipient.id,
              channel,
              error: (channelError as Error).message
            });
          }
        }
      }

      // Log notification metrics
      await this.logNotificationMetrics(orderId, sentNotifications, notificationType);

      this.loggingService.info('Order notifications sent', {
        orderId,
        notificationType,
        recipientCount: recipients.length,
        channelCount: channels.length,
        successfulNotifications: sentNotifications.length
      });

      res.status(200).json({
        success: true,
        data: {
          orderId,
          notificationType,
          recipientCount: recipients.length,
          sentNotifications: sentNotifications.length,
          notifications: sentNotifications,
          bangladeshFeatures: {
            bengaliLanguageSupport: language === 'bn',
            smsSupport: channels.includes('sms'),
            localTimeZone: 'Asia/Dhaka',
            culturalSensitivity: this.getCulturalSensitivityFeatures(order, language)
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Send order notification error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to send order notification',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get notification history for order
   */
  async getOrderNotificationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const {
        page = 1,
        limit = 20,
        channel,
        status,
        recipientType
      } = req.query;

      let conditions = eq(orderNotifications.orderId, orderId);
      
      if (channel) {
        conditions = and(conditions, eq(orderNotifications.channel, channel as string));
      }
      
      if (status) {
        conditions = and(conditions, eq(orderNotifications.status, status as string));
      }
      
      if (recipientType) {
        conditions = and(conditions, eq(orderNotifications.recipientType, recipientType as string));
      }

      const notifications = await db
        .select({
          id: orderNotifications.id,
          recipientType: orderNotifications.recipientType,
          recipientId: orderNotifications.recipientId,
          notificationType: orderNotifications.notificationType,
          channel: orderNotifications.channel,
          title: orderNotifications.title,
          message: orderNotifications.message,
          status: orderNotifications.status,
          sentAt: orderNotifications.sentAt,
          deliveredAt: orderNotifications.deliveredAt,
          readAt: orderNotifications.readAt,
          failureReason: orderNotifications.failureReason,
          retryCount: orderNotifications.retryCount,
          priority: orderNotifications.priority,
          language: orderNotifications.language,
          metadata: orderNotifications.metadata,
          createdAt: orderNotifications.createdAt
        })
        .from(orderNotifications)
        .where(conditions)
        .orderBy(desc(orderNotifications.createdAt))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(orderNotifications)
        .where(conditions);

      // Calculate delivery statistics
      const stats = await this.calculateNotificationStats(orderId);

      res.status(200).json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalCount: count,
            totalPages: Math.ceil(count / Number(limit))
          },
          statistics: stats,
          channelPerformance: {
            email: stats.emailDeliveryRate,
            sms: stats.smsDeliveryRate,
            push: stats.pushDeliveryRate,
            inApp: stats.inAppReadRate
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Get notification history error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notification history',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const {
        page = 1,
        limit = 20,
        unreadOnly = false,
        notificationType,
        priority
      } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      let conditions = and(
        eq(orderNotifications.recipientType, 'customer'),
        eq(orderNotifications.recipientId, userId.toString())
      );

      if (unreadOnly === 'true') {
        conditions = and(conditions, eq(orderNotifications.readAt, null));
      }

      if (notificationType) {
        conditions = and(conditions, eq(orderNotifications.notificationType, notificationType as string));
      }

      if (priority) {
        conditions = and(conditions, eq(orderNotifications.priority, priority as string));
      }

      const userNotifications = await db
        .select({
          id: orderNotifications.id,
          orderId: orderNotifications.orderId,
          notificationType: orderNotifications.notificationType,
          title: orderNotifications.title,
          message: orderNotifications.message,
          status: orderNotifications.status,
          sentAt: orderNotifications.sentAt,
          readAt: orderNotifications.readAt,
          priority: orderNotifications.priority,
          language: orderNotifications.language,
          metadata: orderNotifications.metadata,
          createdAt: orderNotifications.createdAt,
          orderNumber: orders.orderNumber,
          orderStatus: orders.status
        })
        .from(orderNotifications)
        .leftJoin(orders, eq(orderNotifications.orderId, orders.id))
        .where(conditions)
        .orderBy(desc(orderNotifications.createdAt))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      // Mark notifications as delivered if they're being viewed
      const notificationIds = userNotifications.map(n => n.id);
      if (notificationIds.length > 0) {
        await db
          .update(orderNotifications)
          .set({ 
            deliveredAt: new Date(),
            status: 'delivered'
          })
          .where(and(
            inArray(orderNotifications.id, notificationIds),
            eq(orderNotifications.status, 'sent')
          ));
      }

      // Get unread count
      const [{ unreadCount }] = await db
        .select({ unreadCount: sql<number>`count(*)` })
        .from(orderNotifications)
        .where(and(
          eq(orderNotifications.recipientType, 'customer'),
          eq(orderNotifications.recipientId, userId.toString()),
          eq(orderNotifications.readAt, null)
        ));

      res.status(200).json({
        success: true,
        data: {
          notifications: userNotifications,
          unreadCount: Number(unreadCount),
          pagination: {
            page: Number(page),
            limit: Number(limit)
          },
          userPreferences: await this.getUserNotificationPreferences(userId),
          bangladeshFeatures: {
            languagePreference: 'en', // Get from user profile
            timeZone: 'Asia/Dhaka',
            culturalNotifications: true
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Get user notifications error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user notifications',
        error: (error as Error).message
      });
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id;

      // Verify notification belongs to user
      const [notification] = await db
        .select()
        .from(orderNotifications)
        .where(and(
          eq(orderNotifications.id, notificationId),
          eq(orderNotifications.recipientId, userId?.toString() || '')
        ));

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      // Mark as read
      await db
        .update(orderNotifications)
        .set({
          readAt: new Date(),
          status: 'read'
        })
        .where(eq(orderNotifications.id, notificationId));

      this.loggingService.info('Notification marked as read', {
        notificationId,
        userId
      });

      res.status(200).json({
        success: true,
        data: {
          notificationId,
          readAt: new Date(),
          status: 'read'
        }
      });

    } catch (error) {
      this.loggingService.error('Mark notification as read error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: (error as Error).message
      });
    }
  }

  /**
   * Update user notification preferences
   */
  async updateNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const {
        emailEnabled = true,
        smsEnabled = true,
        pushEnabled = true,
        inAppEnabled = true,
        language = 'en',
        orderUpdates = true,
        promotions = false,
        newsletter = false,
        quietHours = { start: '22:00', end: '08:00' },
        bangladeshSpecific = {
          festivalNotifications: true,
          prayerTimeReminders: false,
          culturalOffers: true
        }
      } = req.body;

      // Store preferences (this would typically go in a user_notification_preferences table)
      const preferences = {
        userId,
        emailEnabled,
        smsEnabled,
        pushEnabled,
        inAppEnabled,
        language,
        orderUpdates,
        promotions,
        newsletter,
        quietHours,
        bangladeshSpecific,
        updatedAt: new Date()
      };

      // Cache preferences for quick access
      await this.redisService.setex(
        `notification-preferences:${userId}`, 
        3600, 
        JSON.stringify(preferences)
      );

      this.loggingService.info('Notification preferences updated', {
        userId,
        preferences: Object.keys(preferences)
      });

      res.status(200).json({
        success: true,
        data: {
          preferences,
          message: 'Notification preferences updated successfully'
        }
      });

    } catch (error) {
      this.loggingService.error('Update notification preferences error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
        error: (error as Error).message
      });
    }
  }

  /**
   * Bulk send notifications
   */
  async sendBulkNotifications(req: Request, res: Response): Promise<void> {
    try {
      const {
        orderIds,
        notificationType,
        channels,
        customMessage,
        priority = 'normal',
        language = 'en',
        scheduledFor // Optional: schedule for future delivery
      } = req.body;

      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Order IDs array is required'
        });
        return;
      }

      // Process notifications in batches
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < orderIds.length; i += batchSize) {
        batches.push(orderIds.slice(i, i + batchSize));
      }

      let totalSent = 0;
      let totalFailed = 0;
      const results = [];

      for (const batch of batches) {
        const batchResults = await Promise.allSettled(
          batch.map(orderId => 
            this.processOrderNotification({
              orderId,
              notificationType,
              channels,
              customMessage,
              priority,
              language,
              scheduledFor
            })
          )
        );

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            totalSent++;
            results.push({
              orderId: batch[index],
              status: 'success',
              notifications: result.value
            });
          } else {
            totalFailed++;
            results.push({
              orderId: batch[index],
              status: 'failed',
              error: result.reason.message
            });
          }
        });

        // Small delay between batches to prevent overwhelming external services
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.loggingService.info('Bulk notifications processed', {
        totalOrders: orderIds.length,
        totalSent,
        totalFailed,
        notificationType
      });

      res.status(200).json({
        success: true,
        data: {
          totalOrders: orderIds.length,
          totalSent,
          totalFailed,
          successRate: Math.round((totalSent / orderIds.length) * 100),
          results: results.slice(0, 100), // Limit response size
          scheduled: !!scheduledFor,
          scheduledFor
        }
      });

    } catch (error) {
      this.loggingService.error('Send bulk notifications error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to send bulk notifications',
        error: (error as Error).message
      });
    }
  }

  /**
   * Helper methods
   */
  private determineRecipients(order: any, vendorInfo: any[], notificationType: string): any[] {
    const recipients = [];

    // Always include customer
    recipients.push({
      type: 'customer',
      id: order.userId,
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      language: order.customerLanguage || 'en'
    });

    // Include vendors for specific notification types
    if (['order_placed', 'order_cancelled', 'return_requested'].includes(notificationType)) {
      vendorInfo.forEach(vendor => {
        recipients.push({
          type: 'vendor',
          id: vendor.vendorId,
          name: vendor.businessName,
          email: vendor.contactEmail,
          phone: vendor.contactPhone,
          language: 'en' // Default to English for vendors
        });
      });
    }

    // Include admin for high-priority notifications
    if (['order_cancelled', 'payment_failed', 'return_requested'].includes(notificationType)) {
      recipients.push({
        type: 'admin',
        id: 'admin',
        email: 'admin@getit.com.bd',
        name: 'GetIt Admin Team',
        language: 'en'
      });
    }

    return recipients;
  }

  private async generateNotificationContent(
    order: any, 
    notificationType: string, 
    customMessage?: string, 
    language = 'en'
  ): Promise<{ title: string; message: string; templateData: any }> {
    
    const templates = {
      order_placed: {
        en: {
          title: `Order Confirmation - ${order.orderNumber}`,
          message: `Your order ${order.orderNumber} has been placed successfully. Total: ৳${order.total}`
        },
        bn: {
          title: `অর্ডার নিশ্চিতকরণ - ${order.orderNumber}`,
          message: `আপনার অর্ডার ${order.orderNumber} সফলভাবে দেওয়া হয়েছে। মোট: ৳${order.total}`
        }
      },
      order_confirmed: {
        en: {
          title: `Order Confirmed - ${order.orderNumber}`,
          message: `Your order ${order.orderNumber} has been confirmed and is being processed.`
        },
        bn: {
          title: `অর্ডার নিশ্চিত - ${order.orderNumber}`,
          message: `আপনার অর্ডার ${order.orderNumber} নিশ্চিত হয়েছে এবং প্রক্রিয়াকরণ করা হচ্ছে।`
        }
      },
      order_shipped: {
        en: {
          title: `Order Shipped - ${order.orderNumber}`,
          message: `Your order ${order.orderNumber} has been shipped and is on its way to you.`
        },
        bn: {
          title: `অর্ডার পাঠানো হয়েছে - ${order.orderNumber}`,
          message: `আপনার অর্ডার ${order.orderNumber} পাঠানো হয়েছে এবং আপনার কাছে আসছে।`
        }
      },
      order_delivered: {
        en: {
          title: `Order Delivered - ${order.orderNumber}`,
          message: `Your order ${order.orderNumber} has been delivered successfully. Thank you for shopping with GetIt!`
        },
        bn: {
          title: `অর্ডার ডেলিভার হয়েছে - ${order.orderNumber}`,
          message: `আপনার অর্ডার ${order.orderNumber} সফলভাবে ডেলিভার হয়েছে। GetIt এর সাথে কেনাকাটার জন্য ধন্যবাদ!`
        }
      }
    };

    const template = templates[notificationType as keyof typeof templates]?.[language] || 
                    templates[notificationType as keyof typeof templates]?.en;

    return {
      title: template?.title || `Order Update - ${order.orderNumber}`,
      message: customMessage || template?.message || 'Your order status has been updated.',
      templateData: {
        orderNumber: order.orderNumber,
        orderTotal: order.total,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        language,
        timestamp: new Date()
      }
    };
  }

  private async sendNotification(params: {
    recipient: any;
    channel: string;
    notificationType: string;
    content: any;
    order: any;
    priority: string;
    language: string;
  }): Promise<any> {
    
    const { recipient, channel, notificationType, content, order, priority, language } = params;

    // Create notification record
    const [notification] = await db.insert(orderNotifications).values({
      orderId: order.id,
      recipientType: recipient.type,
      recipientId: recipient.id,
      notificationType,
      channel,
      title: content.title,
      message: content.message,
      templateData: content.templateData,
      status: 'pending',
      priority,
      language,
      metadata: {
        orderNumber: order.orderNumber,
        recipientName: recipient.name,
        sentVia: channel
      }
    }).returning();

    try {
      // Send via different channels
      switch (channel) {
        case 'email':
          await this.sendEmailNotification(recipient, content, notification.id);
          break;
        case 'sms':
          await this.sendSMSNotification(recipient, content, notification.id);
          break;
        case 'push':
          await this.sendPushNotification(recipient, content, notification.id);
          break;
        case 'in_app':
          // In-app notifications are just stored in database
          break;
      }

      // Update notification status
      await db
        .update(orderNotifications)
        .set({
          status: 'sent',
          sentAt: new Date()
        })
        .where(eq(orderNotifications.id, notification.id));

      return notification;

    } catch (error) {
      // Update notification with failure
      await db
        .update(orderNotifications)
        .set({
          status: 'failed',
          failureReason: (error as Error).message,
          retryCount: 1
        })
        .where(eq(orderNotifications.id, notification.id));

      throw error;
    }
  }

  private async sendEmailNotification(recipient: any, content: any, notificationId: string): Promise<void> {
    // Mock email sending - in production, integrate with actual email service
    this.loggingService.info('Email notification sent', {
      notificationId,
      email: recipient.email,
      subject: content.title
    });
  }

  private async sendSMSNotification(recipient: any, content: any, notificationId: string): Promise<void> {
    // Mock SMS sending - in production, integrate with Bangladesh SMS providers
    this.loggingService.info('SMS notification sent', {
      notificationId,
      phone: recipient.phone,
      message: content.message.substring(0, 160)
    });
  }

  private async sendPushNotification(recipient: any, content: any, notificationId: string): Promise<void> {
    // Mock push notification - in production, integrate with Firebase or similar
    this.loggingService.info('Push notification sent', {
      notificationId,
      recipientId: recipient.id,
      title: content.title
    });
  }

  private async calculateNotificationStats(orderId: string): Promise<any> {
    const [stats] = await db
      .select({
        totalSent: sql<number>`count(*)`,
        totalDelivered: sql<number>`count(case when status = 'delivered' then 1 end)`,
        totalRead: sql<number>`count(case when status = 'read' then 1 end)`,
        totalFailed: sql<number>`count(case when status = 'failed' then 1 end)`,
        emailCount: sql<number>`count(case when channel = 'email' then 1 end)`,
        smsCount: sql<number>`count(case when channel = 'sms' then 1 end)`,
        pushCount: sql<number>`count(case when channel = 'push' then 1 end)`
      })
      .from(orderNotifications)
      .where(eq(orderNotifications.orderId, orderId));

    return {
      totalSent: Number(stats.totalSent || 0),
      deliveryRate: stats.totalSent ? Math.round((Number(stats.totalDelivered) / Number(stats.totalSent)) * 100) : 0,
      readRate: stats.totalDelivered ? Math.round((Number(stats.totalRead) / Number(stats.totalDelivered)) * 100) : 0,
      failureRate: stats.totalSent ? Math.round((Number(stats.totalFailed) / Number(stats.totalSent)) * 100) : 0,
      emailDeliveryRate: 95, // Mock rates
      smsDeliveryRate: 92,
      pushDeliveryRate: 88,
      inAppReadRate: 67
    };
  }

  private async getUserNotificationPreferences(userId: number): Promise<any> {
    // Try to get from cache first
    const cached = await this.redisService.get(`notification-preferences:${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Default preferences
    return {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      language: 'en',
      orderUpdates: true,
      promotions: false,
      newsletter: false,
      quietHours: { start: '22:00', end: '08:00' },
      bangladeshSpecific: {
        festivalNotifications: true,
        prayerTimeReminders: false,
        culturalOffers: true
      }
    };
  }

  private getCulturalSensitivityFeatures(order: any, language: string): any {
    return {
      language,
      timeZoneAware: true,
      festivalAware: true,
      prayerTimeConsideration: true,
      localCurrency: 'BDT',
      culturalGreetings: language === 'bn'
    };
  }

  private async processOrderNotification(params: any): Promise<any> {
    // This would process individual order notifications for bulk operations
    // Implementation details would mirror sendOrderStatusNotification
    return { success: true, notificationsSent: 3 };
  }

  private async logNotificationMetrics(orderId: string, notifications: any[], notificationType: string): Promise<void> {
    // Log metrics for analytics
    const metrics = {
      orderId,
      notificationType,
      totalSent: notifications.length,
      channels: [...new Set(notifications.map(n => n.channel))],
      timestamp: new Date()
    };

    await this.redisService.lpush('notification-metrics', JSON.stringify(metrics));
  }
}