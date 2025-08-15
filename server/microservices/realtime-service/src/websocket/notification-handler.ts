/**
 * Notification Event Handler
 * Amazon.com/Shopee.sg-Level real-time notification processing
 */

import { Socket } from 'socket.io';
import { RealtimeNotification } from '../models/RealtimeNotification';
import { realtimeRedisService } from '../services/redis-service';
import { localLanguageHandler } from '../../bangladesh-features/local-language-handler';
import { offlineSyncHandler } from '../../bangladesh-features/offline-sync';

export class NotificationHandler {
  constructor(private io: any) {}

  /**
   * Handle notification events
   */
  handleEvents(socket: Socket): void {
    // Handle notification subscription
    socket.on('subscribe_notifications', async (data) => {
      try {
        const { user_id, notification_types = [], priority_levels = ['critical', 'high', 'medium'] } = data;
        
        if (!user_id) {
          socket.emit('error', { message: 'User ID required for notification subscription' });
          return;
        }

        // Subscribe to user-specific notification channel
        const userChannel = `notifications:user:${user_id}`;
        await socket.join(userChannel);

        // Subscribe to specific notification types
        for (const type of notification_types) {
          const typeChannel = `notifications:type:${type}`;
          await socket.join(typeChannel);
        }

        // Subscribe to priority channels
        for (const priority of priority_levels) {
          const priorityChannel = `notifications:priority:${priority}`;
          await socket.join(priorityChannel);
        }

        // Store subscription preferences in Redis
        await realtimeRedisService.updateUserPresence(user_id, {
          status: 'online',
          last_activity: Date.now(),
          current_page: '/',
          device_count: 1,
          activity: {
            notification_subscriptions: {
              types: notification_types,
              priorities: priority_levels,
              subscribed_at: Date.now()
            }
          }
        });

        socket.emit('notification_subscription_confirmed', {
          user_id,
          subscribed_types: notification_types,
          subscribed_priorities: priority_levels,
          channels: [userChannel, ...notification_types.map(t => `notifications:type:${t}`)]
        });

        console.log(`📱 User ${user_id} subscribed to notifications`);
      } catch (error) {
        console.error('Error handling notification subscription:', error);
        socket.emit('error', { message: 'Failed to subscribe to notifications' });
      }
    });

    // Handle notification preferences update
    socket.on('update_notification_preferences', async (data) => {
      try {
        const { 
          user_id, 
          language = 'en', 
          timezone = 'Asia/Dhaka',
          enabled_types = [],
          enabled_priorities = [],
          sound_enabled = true,
          vibration_enabled = true 
        } = data;

        // Update user preferences
        await RealtimeNotification.updateMany(
          { user_id },
          {
            $set: {
              'user_preferences.language': language,
              'user_preferences.timezone': timezone,
              'user_preferences.notification_settings': {
                realtime_enabled: true,
                push_enabled: true,
                email_enabled: false,
                sms_enabled: false,
                sound_enabled,
                vibration_enabled,
                enabled_types,
                enabled_priorities
              }
            }
          }
        );

        socket.emit('notification_preferences_updated', {
          user_id,
          preferences: {
            language,
            timezone,
            enabled_types,
            enabled_priorities,
            sound_enabled,
            vibration_enabled
          }
        });
      } catch (error) {
        console.error('Error updating notification preferences:', error);
        socket.emit('error', { message: 'Failed to update notification preferences' });
      }
    });

    // Handle notification acknowledgment
    socket.on('acknowledge_notification', async (data) => {
      try {
        const { notification_id, user_id, action = 'received' } = data;

        const updateData: any = {};
        
        switch (action) {
          case 'received':
            updateData['channels.0.status'] = 'delivered';
            updateData['channels.0.delivered_at'] = new Date();
            updateData['tracking.delivered_at'] = new Date();
            break;
          case 'read':
            updateData['channels.0.status'] = 'read';
            updateData['channels.0.read_at'] = new Date();
            updateData['tracking.read_at'] = new Date();
            break;
          case 'clicked':
            updateData['channels.0.status'] = 'clicked';
            updateData['channels.0.clicked_at'] = new Date();
            updateData['tracking.clicked_at'] = new Date();
            break;
        }

        await RealtimeNotification.findOneAndUpdate(
          { notification_id, user_id },
          { $set: updateData }
        );

        socket.emit('notification_acknowledged', {
          notification_id,
          action,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error acknowledging notification:', error);
        socket.emit('error', { message: 'Failed to acknowledge notification' });
      }
    });

    // Handle bulk notification actions
    socket.on('bulk_notification_action', async (data) => {
      try {
        const { notification_ids, user_id, action } = data;

        if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
          socket.emit('error', { message: 'Invalid notification IDs array' });
          return;
        }

        const updateData: any = {};
        
        switch (action) {
          case 'mark_all_read':
            updateData['channels.0.status'] = 'read';
            updateData['channels.0.read_at'] = new Date();
            updateData['tracking.read_at'] = new Date();
            break;
          case 'clear_all':
            await RealtimeNotification.deleteMany({
              notification_id: { $in: notification_ids },
              user_id
            });
            
            socket.emit('bulk_notifications_cleared', {
              cleared_count: notification_ids.length,
              user_id
            });
            return;
        }

        const result = await RealtimeNotification.updateMany(
          {
            notification_id: { $in: notification_ids },
            user_id
          },
          { $set: updateData }
        );

        socket.emit('bulk_notification_action_completed', {
          action,
          affected_count: result.modifiedCount,
          notification_ids
        });
      } catch (error) {
        console.error('Error handling bulk notification action:', error);
        socket.emit('error', { message: 'Failed to perform bulk notification action' });
      }
    });

    // Handle real-time notification request
    socket.on('request_notifications', async (data) => {
      try {
        const { user_id, limit = 20, status, types, language = 'en' } = data;

        const query: any = { user_id };
        
        if (status) {
          query['channels.status'] = status;
        }
        
        if (types && Array.isArray(types)) {
          query.notification_type = { $in: types };
        }

        const notifications = await RealtimeNotification.find(query)
          .sort({ 'tracking.created_at': -1 })
          .limit(limit);

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

        socket.emit('notifications_response', {
          user_id,
          notifications: formattedNotifications,
          total: formattedNotifications.length
        });
      } catch (error) {
        console.error('Error handling notification request:', error);
        socket.emit('error', { message: 'Failed to fetch notifications' });
      }
    });

    // Handle Bangladesh-specific notification events
    socket.on('bangladesh_notification', async (data) => {
      try {
        const { 
          user_id, 
          type, 
          payment_method, 
          amount, 
          order_id,
          language = 'bn' 
        } = data;

        let notificationData;

        // Handle Bangladesh payment notifications
        if (type === 'payment_pending') {
          const methodName = {
            'bkash': language === 'bn' ? 'বিকাশ' : 'bKash',
            'nagad': language === 'bn' ? 'নগদ' : 'Nagad',
            'rocket': language === 'bn' ? 'রকেট' : 'Rocket'
          }[payment_method] || payment_method;

          notificationData = {
            type: 'bangladesh_payment',
            title_key: 'payment_pending',
            message_key: 'payment_pending',
            variables: {
              method: methodName,
              amount: localLanguageHandler.formatBengaliCurrency(amount)
            },
            user_language: language
          };
        }

        if (notificationData) {
          const bilingualContent = localLanguageHandler.formatRealtimeNotification(notificationData);

          // Create and send notification
          const notification = await RealtimeNotification.create({
            notification_id: `bd_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id,
            notification_type: type,
            title: bilingualContent.title,
            title_bn: bilingualContent.title_bn,
            message: bilingualContent.message,
            message_bn: bilingualContent.message_bn,
            data: { payment_method, amount, order_id },
            channels: [{ type: 'realtime', status: 'pending' }],
            priority: 'high',
            user_preferences: {
              language,
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

          // Send to user
          const userChannel = `notifications:user:${user_id}`;
          this.io.to(userChannel).emit('notification', {
            id: notification.notification_id,
            type,
            title: language === 'bn' ? bilingualContent.title_bn : bilingualContent.title,
            message: language === 'bn' ? bilingualContent.message_bn : bilingualContent.message,
            data: { payment_method, amount, order_id },
            timestamp: new Date(),
            priority: 'high',
            bangladesh_specific: true
          });

          // Update delivery status
          await RealtimeNotification.findByIdAndUpdate(notification._id, {
            $set: {
              'channels.0.status': 'delivered',
              'channels.0.delivered_at': new Date(),
              'tracking.delivered_at': new Date()
            }
          });
        }
      } catch (error) {
        console.error('Error handling Bangladesh notification:', error);
        socket.emit('error', { message: 'Failed to process Bangladesh notification' });
      }
    });

    // Handle notification sound/vibration test
    socket.on('test_notification_delivery', async (data) => {
      try {
        const { user_id, language = 'en' } = data;

        const testNotification = {
          id: `test_${Date.now()}`,
          type: 'test',
          title: language === 'bn' ? 'পরীক্ষা বিজ্ঞপ্তি' : 'Test Notification',
          message: language === 'bn' ? 'এটি একটি পরীক্ষা বিজ্ঞপ্তি' : 'This is a test notification',
          data: { test: true },
          timestamp: new Date(),
          priority: 'medium',
          sound_enabled: true,
          vibration_enabled: true
        };

        socket.emit('notification', testNotification);

        socket.emit('test_notification_sent', {
          user_id,
          test_notification_id: testNotification.id,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error sending test notification:', error);
        socket.emit('error', { message: 'Failed to send test notification' });
      }
    });
  }

  /**
   * Broadcast notification to multiple users
   */
  async broadcastNotification(data: {
    user_ids: string[];
    notification_type: string;
    title: string;
    message: string;
    notification_data?: any;
    priority?: string;
  }): Promise<{ sent: number; failed: number }> {
    const { user_ids, notification_type, title, message, notification_data = {}, priority = 'medium' } = data;
    
    let sent = 0;
    let failed = 0;

    for (const user_id of user_ids) {
      try {
        // Check if user is subscribed to this notification type
        const userPresence = await realtimeRedisService.getUserPresence(user_id);
        const subscriptions = userPresence?.activity?.notification_subscriptions;
        
        if (subscriptions && subscriptions.types.length > 0 && !subscriptions.types.includes(notification_type)) {
          continue; // Skip if user not subscribed to this type
        }

        // Generate bilingual content
        const bilingualContent = localLanguageHandler.formatRealtimeNotification({
          type: notification_type,
          title_key: title,
          message_key: message,
          variables: notification_data
        });

        // Send to user channel
        const userChannel = `notifications:user:${user_id}`;
        this.io.to(userChannel).emit('notification', {
          id: `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: notification_type,
          title: bilingualContent.title,
          title_bn: bilingualContent.title_bn,
          message: bilingualContent.message,
          message_bn: bilingualContent.message_bn,
          data: notification_data,
          timestamp: new Date(),
          priority,
          broadcast: true
        });

        sent++;
      } catch (error) {
        console.error(`Error broadcasting notification to user ${user_id}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Send priority notification
   */
  async sendPriorityNotification(data: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    notification_data?: any;
    bypass_preferences?: boolean;
  }): Promise<boolean> {
    try {
      const { user_id, type, title, message, notification_data = {}, bypass_preferences = false } = data;

      // Generate bilingual content
      const bilingualContent = localLanguageHandler.formatRealtimeNotification({
        type,
        title_key: title,
        message_key: message,
        variables: notification_data
      });

      // Send to multiple channels for critical notifications
      const channels = [
        `notifications:user:${user_id}`,
        `notifications:priority:critical`,
        `notifications:type:${type}`
      ];

      const notificationPayload = {
        id: `priority_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        title: bilingualContent.title,
        title_bn: bilingualContent.title_bn,
        message: bilingualContent.message,
        message_bn: bilingualContent.message_bn,
        data: notification_data,
        timestamp: new Date(),
        priority: 'critical',
        sound_enabled: true,
        vibration_enabled: true,
        bypass_preferences
      };

      channels.forEach(channel => {
        this.io.to(channel).emit('priority_notification', notificationPayload);
      });

      return true;
    } catch (error) {
      console.error('Error sending priority notification:', error);
      return false;
    }
  }
}