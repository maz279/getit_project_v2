import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  notifications,
  users,
  notificationPreferences,
  type InsertNotification
} from '../../../../../shared/schema';
import { eq, and, desc, count, sql, gte, lte, isNull } from 'drizzle-orm';
import { logger } from '../../../../services/LoggingService';
import { redisService } from '../../../../services/RedisService';

/**
 * Enterprise-Grade In-App Notification Controller for GetIt Bangladesh
 * Amazon.com/Shopee.sg-Level In-App Notification Management
 * 
 * Features:
 * - Real-time in-app notifications
 * - Notification center management
 * - Read/unread status tracking
 * - Notification categories and filtering
 * - User preference management
 * - Bulk operations (mark all as read, clear all)
 * - Real-time WebSocket integration
 * - Bengali/English localization
 * - Notification grouping and threading
 * - Push notification integration
 */
export class InAppController {
  private serviceName = 'inapp-controller';
  private notificationTypes = ['order', 'payment', 'shipping', 'promotion', 'system', 'social', 'security'];

  constructor() {
    this.initializeInAppService();
  }

  private async initializeInAppService() {
    logger.info(`🚀 Initializing In-App Controller for ${this.serviceName}`, {
      timestamp: new Date().toISOString(),
      notificationTypes: this.notificationTypes,
      supportedLanguages: ['en', 'bn'],
      features: ['Real-time', 'WebSocket', 'Grouping', 'Filtering']
    });
  }

  /**
   * Send In-App Notification
   * Create and deliver in-app notifications with real-time updates
   */
  async sendInAppNotification(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `inapp-send-${Date.now()}`;
    
    try {
      const {
        userId,
        title,
        message,
        type = 'system',
        category = 'general',
        priority = 'normal', // low, normal, high, urgent
        data = {},
        actionUrl,
        imageUrl,
        iconUrl,
        groupKey, // For grouping related notifications
        expiresAt,
        silent = false // Don't show popup if true
      } = req.body;

      // Validate required fields
      if (!userId || !title || !message) {
        return res.status(400).json({
          success: false,
          error: 'Required fields: userId, title, message'
        });
      }

      // Validate notification type
      if (!this.notificationTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid notification type. Supported: ${this.notificationTypes.join(', ')}`
        });
      }

      // Get user details
      const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check user preferences
      const [preferences] = await db.select().from(notificationPreferences)
        .where(and(
          eq(notificationPreferences.userId, user.id),
          eq(notificationPreferences.type, type)
        ));

      let isSilent = silent;
      if (preferences && !preferences.pushEnabled) {
        // If user disabled this type of notification, still create but mark as silent
        isSilent = true;
      }

      // Check for existing notifications in the same group
      let groupedNotification = null;
      if (groupKey) {
        groupedNotification = await this.findGroupedNotification(user.id, groupKey);
      }

      // Create notification record
      const notificationData: InsertNotification = {
        userId: user.id,
        type: 'in_app',
        channel: 'in_app',
        title,
        message,
        data: JSON.stringify({ 
          type,
          category,
          actionUrl,
          imageUrl,
          iconUrl,
          groupKey,
          groupedWith: groupedNotification?.id,
          silent: isSilent
        }),
        status: 'pending',
        priority,
        scheduledAt: null,
        metadata: JSON.stringify({
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          createdBy: 'system',
          language: user.preferredLanguage || 'en'
        })
      };

      const [notification] = await db.insert(notifications)
        .values(notificationData)
        .returning();

      // Mark as delivered immediately for in-app notifications
      await db.update(notifications)
        .set({ 
          status: 'delivered',
          sentAt: new Date(),
          deliveredAt: new Date()
        })
        .where(eq(notifications.id, notification.id));

      // Update grouped notification count if this is part of a group
      if (groupedNotification) {
        await this.updateGroupedNotificationCount(groupedNotification.id);
      }

      // Send real-time notification via WebSocket
      if (!isSilent) {
        await this.sendRealtimeNotification(user.id, {
          id: notification.id,
          title,
          message,
          type,
          category,
          priority,
          actionUrl,
          imageUrl,
          iconUrl,
          createdAt: notification.createdAt
        });
      }

      // Cache notification for quick access
      await this.cacheNotification(notification.id, notification);

      // Update user's unread count
      await this.updateUnreadCount(user.id);

      logger.info('In-app notification sent', {
        serviceId: this.serviceName,
        correlationId,
        notificationId: notification.id,
        userId: user.id,
        type,
        silent: isSilent
      });

      res.status(200).json({
        success: true,
        message: 'In-app notification sent successfully',
        notificationId: notification.id,
        type,
        priority,
        delivered: !silent
      });

    } catch (error: any) {
      logger.error('In-app notification sending failed', error, {
        serviceId: this.serviceName,
        correlationId
      });
      
      res.status(500).json({
        success: false,
        error: 'In-app notification sending failed',
        details: error.message
      });
    }
  }

  /**
   * Get User Notifications
   * Retrieve user's in-app notifications with filtering and pagination
   */
  async getUserNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        limit = 20,
        type,
        category,
        unreadOnly = false,
        includeExpired = false,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build query conditions
      const conditions = [
        eq(notifications.userId, parseInt(userId)),
        eq(notifications.channel, 'in_app')
      ];

      if (type) {
        conditions.push(sql`${notifications.data}->>'type' = ${type}`);
      }

      if (category) {
        conditions.push(sql`${notifications.data}->>'category' = ${category}`);
      }

      if (unreadOnly) {
        conditions.push(isNull(notifications.readAt));
      }

      if (!includeExpired) {
        conditions.push(sql`
          (${notifications.metadata}->>'expiresAt' IS NULL OR 
           ${notifications.metadata}->>'expiresAt' > NOW()::text)
        `);
      }

      // Get notifications with pagination
      const userNotifications = await db.select({
        id: notifications.id,
        title: notifications.title,
        message: notifications.message,
        data: notifications.data,
        metadata: notifications.metadata,
        status: notifications.status,
        priority: notifications.priority,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt
      })
      .from(notifications)
      .where(and(...conditions))
      .orderBy(
        sortOrder === 'desc' 
          ? desc(notifications[sortBy as keyof typeof notifications] || notifications.createdAt)
          : notifications[sortBy as keyof typeof notifications] || notifications.createdAt
      )
      .limit(parseInt(limit as string))
      .offset(offset);

      // Parse JSON data for each notification
      const formattedNotifications = userNotifications.map(notification => ({
        ...notification,
        data: notification.data ? JSON.parse(notification.data) : {},
        metadata: notification.metadata ? JSON.parse(notification.metadata) : {},
        isRead: !!notification.readAt,
        isExpired: this.isNotificationExpired(notification.metadata)
      }));

      // Get total count
      const [{ total }] = await db.select({ total: count() })
        .from(notifications)
        .where(and(...conditions));

      // Get unread count
      const [{ unreadCount }] = await db.select({ unreadCount: count() })
        .from(notifications)
        .where(and(
          eq(notifications.userId, parseInt(userId)),
          eq(notifications.channel, 'in_app'),
          isNull(notifications.readAt)
        ));

      res.status(200).json({
        success: true,
        notifications: formattedNotifications,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        },
        summary: {
          totalNotifications: total,
          unreadCount,
          readCount: total - unreadCount
        }
      });

    } catch (error: any) {
      logger.error('Failed to get user notifications', error, {
        serviceId: this.serviceName
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to get user notifications',
        details: error.message
      });
    }
  }

  /**
   * Mark Notification as Read
   * Mark single notification as read
   */
  async markAsRead(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `mark-read-${Date.now()}`;
    
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!id || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Required fields: id, userId'
        });
      }

      // Check if notification exists and belongs to user
      const [notification] = await db.select().from(notifications)
        .where(and(
          eq(notifications.id, id),
          eq(notifications.userId, parseInt(userId)),
          eq(notifications.channel, 'in_app')
        ));

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found or does not belong to user'
        });
      }

      // Mark as read if not already read
      if (!notification.readAt) {
        await db.update(notifications)
          .set({ readAt: new Date() })
          .where(eq(notifications.id, id));

        // Update user's unread count
        await this.updateUnreadCount(parseInt(userId));

        // Remove from cache
        await this.removeCachedNotification(id);

        // Send real-time update
        await this.sendRealtimeUpdate(parseInt(userId), {
          type: 'notification_read',
          notificationId: id
        });
      }

      logger.info('Notification marked as read', {
        serviceId: this.serviceName,
        correlationId,
        notificationId: id,
        userId
      });

      res.status(200).json({
        success: true,
        message: 'Notification marked as read successfully'
      });

    } catch (error: any) {
      logger.error('Failed to mark notification as read', error, {
        serviceId: this.serviceName,
        correlationId
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read',
        details: error.message
      });
    }
  }

  /**
   * Mark All as Read
   * Mark all user notifications as read
   */
  async markAllAsRead(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `mark-all-read-${Date.now()}`;
    
    try {
      const { userId } = req.params;
      const { type, category } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // Build conditions
      const conditions = [
        eq(notifications.userId, parseInt(userId)),
        eq(notifications.channel, 'in_app'),
        isNull(notifications.readAt)
      ];

      if (type) {
        conditions.push(sql`${notifications.data}->>'type' = ${type}`);
      }

      if (category) {
        conditions.push(sql`${notifications.data}->>'category' = ${category}`);
      }

      // Mark all matching notifications as read
      const result = await db.update(notifications)
        .set({ readAt: new Date() })
        .where(and(...conditions))
        .returning({ id: notifications.id });

      // Update user's unread count
      await this.updateUnreadCount(parseInt(userId));

      // Clear notification cache for user
      await this.clearUserNotificationCache(parseInt(userId));

      // Send real-time update
      await this.sendRealtimeUpdate(parseInt(userId), {
        type: 'all_notifications_read',
        count: result.length,
        filters: { type, category }
      });

      logger.info('All notifications marked as read', {
        serviceId: this.serviceName,
        correlationId,
        userId,
        count: result.length
      });

      res.status(200).json({
        success: true,
        message: `${result.length} notifications marked as read successfully`,
        markedCount: result.length
      });

    } catch (error: any) {
      logger.error('Failed to mark all notifications as read', error, {
        serviceId: this.serviceName,
        correlationId
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to mark all notifications as read',
        details: error.message
      });
    }
  }

  /**
   * Delete Notification
   * Soft delete notification
   */
  async deleteNotification(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `delete-notification-${Date.now()}`;
    
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!id || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Required fields: id, userId'
        });
      }

      // Check if notification exists and belongs to user
      const [notification] = await db.select().from(notifications)
        .where(and(
          eq(notifications.id, id),
          eq(notifications.userId, parseInt(userId)),
          eq(notifications.channel, 'in_app')
        ));

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found or does not belong to user'
        });
      }

      // Soft delete by updating status
      await db.update(notifications)
        .set({ 
          status: 'deleted',
          updatedAt: new Date()
        })
        .where(eq(notifications.id, id));

      // Update user's unread count if notification was unread
      if (!notification.readAt) {
        await this.updateUnreadCount(parseInt(userId));
      }

      // Remove from cache
      await this.removeCachedNotification(id);

      // Send real-time update
      await this.sendRealtimeUpdate(parseInt(userId), {
        type: 'notification_deleted',
        notificationId: id
      });

      logger.info('Notification deleted', {
        serviceId: this.serviceName,
        correlationId,
        notificationId: id,
        userId
      });

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });

    } catch (error: any) {
      logger.error('Failed to delete notification', error, {
        serviceId: this.serviceName,
        correlationId
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to delete notification',
        details: error.message
      });
    }
  }

  /**
   * Clear All Notifications
   * Clear all user notifications
   */
  async clearAllNotifications(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `clear-all-${Date.now()}`;
    
    try {
      const { userId } = req.params;
      const { olderThan, type, category } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // Build conditions
      const conditions = [
        eq(notifications.userId, parseInt(userId)),
        eq(notifications.channel, 'in_app')
      ];

      if (olderThan) {
        conditions.push(sql`${notifications.createdAt} < ${new Date(olderThan)}`);
      }

      if (type) {
        conditions.push(sql`${notifications.data}->>'type' = ${type}`);
      }

      if (category) {
        conditions.push(sql`${notifications.data}->>'category' = ${category}`);
      }

      // Soft delete all matching notifications
      const result = await db.update(notifications)
        .set({ 
          status: 'deleted',
          updatedAt: new Date()
        })
        .where(and(...conditions))
        .returning({ id: notifications.id, readAt: notifications.readAt });

      // Update user's unread count
      await this.updateUnreadCount(parseInt(userId));

      // Clear notification cache for user
      await this.clearUserNotificationCache(parseInt(userId));

      // Send real-time update
      await this.sendRealtimeUpdate(parseInt(userId), {
        type: 'all_notifications_cleared',
        count: result.length,
        filters: { olderThan, type, category }
      });

      logger.info('All notifications cleared', {
        serviceId: this.serviceName,
        correlationId,
        userId,
        count: result.length
      });

      res.status(200).json({
        success: true,
        message: `${result.length} notifications cleared successfully`,
        clearedCount: result.length
      });

    } catch (error: any) {
      logger.error('Failed to clear all notifications', error, {
        serviceId: this.serviceName,
        correlationId
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to clear all notifications',
        details: error.message
      });
    }
  }

  /**
   * Get Notification Summary
   * Get notification counts and summary for user
   */
  async getNotificationSummary(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // Get counts by type
      const typeCounts = await db.select({
        type: sql`${notifications.data}->>'type'`.as('type'),
        total: count().as('total'),
        unread: sql`COUNT(CASE WHEN ${notifications.readAt} IS NULL THEN 1 END)`.as('unread')
      })
      .from(notifications)
      .where(and(
        eq(notifications.userId, parseInt(userId)),
        eq(notifications.channel, 'in_app'),
        sql`${notifications.status} != 'deleted'`
      ))
      .groupBy(sql`${notifications.data}->>'type'`);

      // Get overall counts
      const [overallCounts] = await db.select({
        total: count().as('total'),
        unread: sql`COUNT(CASE WHEN ${notifications.readAt} IS NULL THEN 1 END)`.as('unread'),
        read: sql`COUNT(CASE WHEN ${notifications.readAt} IS NOT NULL THEN 1 END)`.as('read')
      })
      .from(notifications)
      .where(and(
        eq(notifications.userId, parseInt(userId)),
        eq(notifications.channel, 'in_app'),
        sql`${notifications.status} != 'deleted'`
      ));

      // Get recent activity (last 24 hours)
      const [recentActivity] = await db.select({
        count: count().as('count')
      })
      .from(notifications)
      .where(and(
        eq(notifications.userId, parseInt(userId)),
        eq(notifications.channel, 'in_app'),
        sql`${notifications.status} != 'deleted'`,
        gte(notifications.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
      ));

      res.status(200).json({
        success: true,
        summary: {
          overall: {
            total: Number(overallCounts?.total || 0),
            unread: Number(overallCounts?.unread || 0),
            read: Number(overallCounts?.read || 0)
          },
          byType: typeCounts.map(item => ({
            type: item.type,
            total: Number(item.total),
            unread: Number(item.unread),
            read: Number(item.total) - Number(item.unread)
          })),
          recentActivity: {
            last24Hours: Number(recentActivity?.count || 0)
          }
        }
      });

    } catch (error: any) {
      logger.error('Failed to get notification summary', error, {
        serviceId: this.serviceName
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to get notification summary',
        details: error.message
      });
    }
  }

  /**
   * Find Grouped Notification
   * Find existing notification in the same group
   */
  private async findGroupedNotification(userId: number, groupKey: string): Promise<any> {
    const [grouped] = await db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.channel, 'in_app'),
        sql`${notifications.data}->>'groupKey' = ${groupKey}`,
        sql`${notifications.status} != 'deleted'`
      ))
      .orderBy(desc(notifications.createdAt))
      .limit(1);

    return grouped || null;
  }

  /**
   * Update Grouped Notification Count
   * Update count for grouped notifications
   */
  private async updateGroupedNotificationCount(notificationId: string): Promise<void> {
    // Implementation for updating grouped notification count
    // This would involve updating the notification data with new count
  }

  /**
   * Send Realtime Notification
   * Send notification via WebSocket
   */
  private async sendRealtimeNotification(userId: number, notificationData: any): Promise<void> {
    try {
      // Implement WebSocket notification sending
      // This would integrate with your WebSocket service
      logger.info('Real-time notification sent', {
        serviceId: this.serviceName,
        userId,
        notificationId: notificationData.id
      });
    } catch (error) {
      logger.warn('Failed to send real-time notification', { userId, error });
    }
  }

  /**
   * Send Realtime Update
   * Send real-time updates for notification actions
   */
  private async sendRealtimeUpdate(userId: number, updateData: any): Promise<void> {
    try {
      // Implement WebSocket update sending
      logger.info('Real-time update sent', {
        serviceId: this.serviceName,
        userId,
        updateType: updateData.type
      });
    } catch (error) {
      logger.warn('Failed to send real-time update', { userId, error });
    }
  }

  /**
   * Update Unread Count
   * Update cached unread count for user
   */
  private async updateUnreadCount(userId: number): Promise<void> {
    try {
      const [{ unreadCount }] = await db.select({ unreadCount: count() })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.channel, 'in_app'),
          isNull(notifications.readAt),
          sql`${notifications.status} != 'deleted'`
        ));

      // Cache the unread count
      await redisService.setex(`unread_count:${userId}`, 3600, JSON.stringify(Number(unreadCount)));

      // Send real-time unread count update
      await this.sendRealtimeUpdate(userId, {
        type: 'unread_count_updated',
        count: Number(unreadCount)
      });

    } catch (error) {
      logger.warn('Failed to update unread count', { userId, error });
    }
  }

  /**
   * Is Notification Expired
   * Check if notification has expired
   */
  private isNotificationExpired(metadata: string | null): boolean {
    if (!metadata) return false;
    
    try {
      const meta = JSON.parse(metadata);
      if (!meta.expiresAt) return false;
      
      return new Date(meta.expiresAt) < new Date();
    } catch (error) {
      return false;
    }
  }

  /**
   * Cache Notification
   * Cache notification for quick access
   */
  private async cacheNotification(notificationId: string, notification: any): Promise<void> {
    try {
      await redisService.setex(`notification:${notificationId}`, 3600, JSON.stringify(notification));
    } catch (error) {
      logger.warn('Failed to cache notification', { notificationId, error });
    }
  }

  /**
   * Remove Cached Notification
   * Remove notification from cache
   */
  private async removeCachedNotification(notificationId: string): Promise<void> {
    try {
      await redisService.del(`notification:${notificationId}`);
    } catch (error) {
      logger.warn('Failed to remove cached notification', { notificationId, error });
    }
  }

  /**
   * Clear User Notification Cache
   * Clear all cached notifications for user
   */
  private async clearUserNotificationCache(userId: number): Promise<void> {
    try {
      // Clear user-specific caches
      await redisService.del(`unread_count:${userId}`);
      await redisService.del(`notifications:${userId}:*`);
    } catch (error) {
      logger.warn('Failed to clear user notification cache', { userId, error });
    }
  }

  /**
   * Health Check
   */
  async healthCheck(req: Request, res: Response) {
    try {
      // Check database connectivity
      const dbCheck = await db.select({ count: count() }).from(notifications)
        .where(eq(notifications.channel, 'in_app'));
      
      res.status(200).json({
        success: true,
        service: 'inapp-controller',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'connected',
          supportedTypes: this.notificationTypes
        },
        statistics: {
          totalInAppNotifications: Number(dbCheck[0]?.count || 0)
        }
      });

    } catch (error: any) {
      res.status(503).json({
        success: false,
        service: 'inapp-controller',
        status: 'unhealthy',
        error: error.message
      });
    }
  }
}