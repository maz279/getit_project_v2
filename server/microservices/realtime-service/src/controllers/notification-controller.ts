/**
 * Notification Controller
 * Amazon.com/Shopee.sg-Level real-time notification management
 */

import { Request, Response } from 'express';
import { RealtimeNotification, IRealtimeNotification } from '../models/RealtimeNotification';
import { realtimeRedisService } from '../services/redis-service';
import { localLanguageHandler } from '../../bangladesh-features/local-language-handler';
import { offlineSyncHandler } from '../../bangladesh-features/offline-sync';

export class NotificationController {
  /**
   * Send real-time notification
   */
  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const {
        user_id,
        notification_type,
        title,
        message,
        data = {},
        priority = 'medium',
        channels = [{ type: 'realtime', status: 'pending' }],
        scheduled_for,
        user_language = 'en'
      } = req.body;

      // Generate bilingual content
      const bilingualContent = localLanguageHandler.formatRealtimeNotification({
        type: notification_type,
        title_key: title,
        message_key: message,
        variables: data,
        user_language
      });

      // Create notification document
      const notification = await RealtimeNotification.create({
        notification_id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id,
        notification_type,
        title: bilingualContent.title,
        title_bn: bilingualContent.title_bn,
        message: bilingualContent.message,
        message_bn: bilingualContent.message_bn,
        data,
        channels,
        priority,
        scheduled_for: scheduled_for ? new Date(scheduled_for) : undefined,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        user_preferences: {
          language: user_language,
          timezone: 'Asia/Dhaka',
          notification_settings: {
            realtime_enabled: true,
            push_enabled: true,
            email_enabled: false,
            sms_enabled: false
          }
        },
        tracking: {
          created_at: new Date()
        }
      });

      // Send real-time notification if user is online
      const userConnections = await realtimeRedisService.getUserConnections(user_id);
      const io = (global as any).io;

      if (userConnections.length > 0 && io) {
        const notificationData = {
          id: notification.notification_id,
          type: notification_type,
          title: user_language === 'bn' ? bilingualContent.title_bn : bilingualContent.title,
          message: user_language === 'bn' ? bilingualContent.message_bn : bilingualContent.message,
          data,
          timestamp: new Date(),
          priority
        };

        // Send to all user connections
        userConnections.forEach(socketId => {
          io.to(socketId).emit('notification', notificationData);
        });

        // Update delivery status
        await RealtimeNotification.findByIdAndUpdate(notification._id, {
          $set: {
            'channels.0.status': 'delivered',
            'channels.0.delivered_at': new Date(),
            'tracking.delivered_at': new Date()
          }
        });
      } else {
        // Queue for offline user
        await offlineSyncHandler.queueOfflineMessage(user_id, {
          id: notification.notification_id,
          type: 'notification',
          timestamp: Date.now(),
          data: {
            notification_type,
            title: bilingualContent.title,
            title_bn: bilingualContent.title_bn,
            message: bilingualContent.message,
            message_bn: bilingualContent.message_bn,
            data
          },
          priority,
          retry_count: 0,
          expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000
        });
      }

      res.json({
        success: true,
        notification_id: notification.notification_id,
        delivered: userConnections.length > 0,
        queued_for_offline: userConnections.length === 0
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params;
      const { page = 1, limit = 20, status, type, language = 'en' } = req.query;

      const query: any = { user_id };
      
      if (status) {
        query['channels.status'] = status;
      }
      
      if (type) {
        query.notification_type = type;
      }

      const notifications = await RealtimeNotification.find(query)
        .sort({ 'tracking.created_at': -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await RealtimeNotification.countDocuments(query);

      const formattedNotifications = notifications.map(notif => ({
        id: notif.notification_id,
        type: notif.notification_type,
        title: language === 'bn' && notif.title_bn ? notif.title_bn : notif.title,
        message: language === 'bn' && notif.message_bn ? notif.message_bn : notif.message,
        data: notif.data,
        priority: notif.priority,
        status: notif.channels[0]?.status || 'pending',
        created_at: notif.tracking.created_at,
        read_at: notif.tracking.read_at,
        clicked_at: notif.tracking.clicked_at
      }));

      res.json({
        success: true,
        notifications: formattedNotifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting user notifications:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notification_id } = req.params;
      const { user_id } = req.body;

      const notification = await RealtimeNotification.findOneAndUpdate(
        { notification_id, user_id },
        {
          $set: {
            'channels.0.status': 'read',
            'channels.0.read_at': new Date(),
            'tracking.read_at': new Date(),
            'tracking.response_time': Date.now() - new Date().getTime()
          }
        },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      res.json({
        success: true,
        notification_id,
        status: 'read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  /**
   * Mark notification as clicked
   */
  async markAsClicked(req: Request, res: Response): Promise<void> {
    try {
      const { notification_id } = req.params;
      const { user_id } = req.body;

      const notification = await RealtimeNotification.findOneAndUpdate(
        { notification_id, user_id },
        {
          $set: {
            'channels.0.status': 'clicked',
            'channels.0.clicked_at': new Date(),
            'tracking.clicked_at': new Date()
          }
        },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      res.json({
        success: true,
        notification_id,
        status: 'clicked'
      });
    } catch (error) {
      console.error('Error marking notification as clicked:', error);
      res.status(500).json({ error: 'Failed to mark notification as clicked' });
    }
  }

  /**
   * Bulk send notifications
   */
  async bulkSendNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { notifications } = req.body;

      if (!Array.isArray(notifications) || notifications.length === 0) {
        res.status(400).json({ error: 'Invalid notifications array' });
        return;
      }

      const results = [];
      const io = (global as any).io;

      for (const notifData of notifications) {
        try {
          const {
            user_id,
            notification_type,
            title,
            message,
            data = {},
            priority = 'medium',
            user_language = 'en'
          } = notifData;

          // Generate bilingual content
          const bilingualContent = localLanguageHandler.formatRealtimeNotification({
            type: notification_type,
            title_key: title,
            message_key: message,
            variables: data,
            user_language
          });

          // Create notification
          const notification = await RealtimeNotification.create({
            notification_id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id,
            notification_type,
            title: bilingualContent.title,
            title_bn: bilingualContent.title_bn,
            message: bilingualContent.message,
            message_bn: bilingualContent.message_bn,
            data,
            channels: [{ type: 'realtime', status: 'pending' }],
            priority,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            user_preferences: {
              language: user_language,
              timezone: 'Asia/Dhaka',
              notification_settings: {
                realtime_enabled: true,
                push_enabled: true,
                email_enabled: false,
                sms_enabled: false
              }
            },
            tracking: {
              created_at: new Date()
            }
          });

          // Check if user is online
          const userConnections = await realtimeRedisService.getUserConnections(user_id);
          let delivered = false;

          if (userConnections.length > 0 && io) {
            const notificationData = {
              id: notification.notification_id,
              type: notification_type,
              title: user_language === 'bn' ? bilingualContent.title_bn : bilingualContent.title,
              message: user_language === 'bn' ? bilingualContent.message_bn : bilingualContent.message,
              data,
              timestamp: new Date(),
              priority
            };

            // Send to all user connections
            userConnections.forEach(socketId => {
              io.to(socketId).emit('notification', notificationData);
            });

            delivered = true;

            // Update delivery status
            await RealtimeNotification.findByIdAndUpdate(notification._id, {
              $set: {
                'channels.0.status': 'delivered',
                'channels.0.delivered_at': new Date(),
                'tracking.delivered_at': new Date()
              }
            });
          } else {
            // Queue for offline user
            await offlineSyncHandler.queueOfflineMessage(user_id, {
              id: notification.notification_id,
              type: 'notification',
              timestamp: Date.now(),
              data: {
                notification_type,
                title: bilingualContent.title,
                title_bn: bilingualContent.title_bn,
                message: bilingualContent.message,
                message_bn: bilingualContent.message_bn,
                data
              },
              priority,
              retry_count: 0,
              expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000
            });
          }

          results.push({
            user_id,
            notification_id: notification.notification_id,
            delivered,
            queued_for_offline: !delivered
          });
        } catch (error) {
          console.error(`Error sending notification to user ${notifData.user_id}:`, error);
          results.push({
            user_id: notifData.user_id,
            error: 'Failed to send notification'
          });
        }
      }

      res.json({
        success: true,
        total_sent: notifications.length,
        results
      });
    } catch (error) {
      console.error('Error bulk sending notifications:', error);
      res.status(500).json({ error: 'Failed to bulk send notifications' });
    }
  }

  /**
   * Get notification analytics
   */
  async getNotificationAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, days = 7 } = req.query;
      const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

      const query: any = {
        'tracking.created_at': { $gte: startDate }
      };

      if (user_id) {
        query.user_id = user_id;
      }

      const analytics = await RealtimeNotification.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total_sent: { $sum: 1 },
            delivered: {
              $sum: {
                $cond: [
                  { $eq: ['$channels.0.status', 'delivered'] }, 1, 0
                ]
              }
            },
            read: {
              $sum: {
                $cond: [
                  { $eq: ['$channels.0.status', 'read'] }, 1, 0
                ]
              }
            },
            clicked: {
              $sum: {
                $cond: [
                  { $eq: ['$channels.0.status', 'clicked'] }, 1, 0
                ]
              }
            },
            by_type: { $push: '$notification_type' },
            by_priority: { $push: '$priority' },
            avg_response_time: { $avg: '$tracking.response_time' }
          }
        }
      ]);

      const result = analytics[0] || {
        total_sent: 0,
        delivered: 0,
        read: 0,
        clicked: 0,
        by_type: [],
        by_priority: [],
        avg_response_time: 0
      };

      // Calculate rates
      const deliveryRate = result.total_sent > 0 ? (result.delivered / result.total_sent) * 100 : 0;
      const readRate = result.delivered > 0 ? (result.read / result.delivered) * 100 : 0;
      const clickRate = result.read > 0 ? (result.clicked / result.read) * 100 : 0;

      // Group by type and priority
      const byType: Record<string, number> = {};
      result.by_type.forEach((type: string) => {
        byType[type] = (byType[type] || 0) + 1;
      });

      const byPriority: Record<string, number> = {};
      result.by_priority.forEach((priority: string) => {
        byPriority[priority] = (byPriority[priority] || 0) + 1;
      });

      res.json({
        success: true,
        analytics: {
          total_sent: result.total_sent,
          delivered: result.delivered,
          read: result.read,
          clicked: result.clicked,
          delivery_rate: Math.round(deliveryRate * 100) / 100,
          read_rate: Math.round(readRate * 100) / 100,
          click_rate: Math.round(clickRate * 100) / 100,
          avg_response_time: Math.round(result.avg_response_time || 0),
          by_type: byType,
          by_priority: byPriority
        },
        period: {
          days: Number(days),
          start_date: startDate,
          end_date: new Date()
        }
      });
    } catch (error) {
      console.error('Error getting notification analytics:', error);
      res.status(500).json({ error: 'Failed to get notification analytics' });
    }
  }

  /**
   * Delete old notifications
   */
  async cleanupOldNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { days = 30 } = req.query;
      const cutoffDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

      const result = await RealtimeNotification.deleteMany({
        'tracking.created_at': { $lt: cutoffDate },
        'channels.status': { $in: ['delivered', 'read', 'clicked'] }
      });

      res.json({
        success: true,
        deleted_count: result.deletedCount,
        cutoff_date: cutoffDate
      });
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      res.status(500).json({ error: 'Failed to cleanup old notifications' });
    }
  }
}