/**
 * Admin Controller
 * Amazon.com/Shopee.sg-Level real-time service administration
 */

import { Request, Response } from 'express';
import { realtimeRedisService } from '../services/redis-service';
import { UserPresence } from '../models/UserPresence';
import { RealtimeEvent } from '../models/RealtimeEvent';
import { RealtimeNotification } from '../models/RealtimeNotification';
import { ChatRoom, ChatMessage } from '../models/ChatRoom';

export class AdminController {
  /**
   * Get comprehensive real-time dashboard statistics
   */
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const timeRange = req.query.range as string || '24h';
      const now = new Date();
      let startTime: Date;

      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // Get connection statistics from Redis
      const connectionStats = await realtimeRedisService.getConnectionStats();
      const realtimeStats = await realtimeRedisService.getRealtimeStats();

      // Get presence statistics
      const presenceStats = await UserPresence.aggregate([
        {
          $match: {
            last_seen: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            total_users: { $sum: 1 },
            online_users: {
              $sum: {
                $cond: [{ $eq: ['$status', 'online'] }, 1, 0]
              }
            },
            away_users: {
              $sum: {
                $cond: [{ $eq: ['$status', 'away'] }, 1, 0]
              }
            },
            busy_users: {
              $sum: {
                $cond: [{ $eq: ['$status', 'busy'] }, 1, 0]
              }
            },
            mobile_users: {
              $sum: {
                $cond: [
                  { $in: ['mobile', '$devices.type'] }, 1, 0
                ]
              }
            },
            desktop_users: {
              $sum: {
                $cond: [
                  { $in: ['desktop', '$devices.type'] }, 1, 0
                ]
              }
            },
            by_location: { $push: '$location' },
            by_city: { $push: '$geographic_location.city' }
          }
        }
      ]);

      // Get event statistics
      const eventStats = await RealtimeEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            total_events: { $sum: 1 },
            total_recipients: { $sum: '$delivery_status.total_recipients' },
            total_delivered: { $sum: '$delivery_status.delivered' },
            total_failed: { $sum: '$delivery_status.failed' },
            by_type: { $push: '$event_type' },
            by_priority: { $push: '$priority' },
            avg_attempts: { $avg: '$attempts' }
          }
        }
      ]);

      // Get notification statistics
      const notificationStats = await RealtimeNotification.aggregate([
        {
          $match: {
            'tracking.created_at': { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            total_notifications: { $sum: 1 },
            delivered_notifications: {
              $sum: {
                $cond: [
                  { $eq: ['$channels.0.status', 'delivered'] }, 1, 0
                ]
              }
            },
            read_notifications: {
              $sum: {
                $cond: [
                  { $eq: ['$channels.0.status', 'read'] }, 1, 0
                ]
              }
            },
            clicked_notifications: {
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

      // Get chat statistics
      const chatStats = await ChatRoom.aggregate([
        {
          $match: {
            last_activity: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            total_rooms: { $sum: 1 },
            active_rooms: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
              }
            },
            by_type: { $push: '$type' },
            avg_response_time: { $avg: '$statistics.average_response_time' },
            avg_satisfaction: { $avg: '$statistics.satisfaction_rating' }
          }
        }
      ]);

      const chatMessageStats = await ChatMessage.aggregate([
        {
          $match: {
            timestamp: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            total_messages: { $sum: 1 },
            by_type: { $push: '$type' },
            by_sender_role: { $push: '$sender_role' }
          }
        }
      ]);

      // Process results
      const presence = presenceStats[0] || {};
      const events = eventStats[0] || {};
      const notifications = notificationStats[0] || {};
      const chat = chatStats[0] || {};
      const messages = chatMessageStats[0] || {};

      // Calculate rates
      const deliveryRate = events.total_recipients > 0 ? 
        (events.total_delivered / events.total_recipients) * 100 : 0;
      const notificationReadRate = notifications.delivered_notifications > 0 ? 
        (notifications.read_notifications / notifications.delivered_notifications) * 100 : 0;

      // Group data by type
      const eventsByType = this.groupByField(events.by_type || []);
      const notificationsByType = this.groupByField(notifications.by_type || []);
      const chatsByType = this.groupByField(chat.by_type || []);
      const messagesByType = this.groupByField(messages.by_type || []);
      const locationStats = this.groupByField(presence.by_location || []);
      const cityStats = this.groupByField(presence.by_city?.filter((city: string) => city) || []);

      res.json({
        success: true,
        time_range: timeRange,
        timestamp: now,
        overview: {
          total_connections: connectionStats.total_connections || 0,
          online_users: connectionStats.online_users || 0,
          total_events: events.total_events || 0,
          total_notifications: notifications.total_notifications || 0,
          active_chat_rooms: chat.active_rooms || 0,
          total_messages: messages.total_messages || 0
        },
        connections: {
          total: connectionStats.total_connections || 0,
          online_users: connectionStats.online_users || 0,
          messages_per_second: realtimeStats.messages_per_second || 0,
          average_latency: realtimeStats.average_latency || 0
        },
        presence: {
          total_users: presence.total_users || 0,
          online: presence.online_users || 0,
          away: presence.away_users || 0,
          busy: presence.busy_users || 0,
          mobile_users: presence.mobile_users || 0,
          desktop_users: presence.desktop_users || 0,
          by_location: locationStats,
          by_city: cityStats
        },
        events: {
          total: events.total_events || 0,
          delivered: events.total_delivered || 0,
          failed: events.total_failed || 0,
          delivery_rate: Math.round(deliveryRate * 100) / 100,
          avg_attempts: Math.round((events.avg_attempts || 0) * 100) / 100,
          by_type: eventsByType
        },
        notifications: {
          total: notifications.total_notifications || 0,
          delivered: notifications.delivered_notifications || 0,
          read: notifications.read_notifications || 0,
          clicked: notifications.clicked_notifications || 0,
          read_rate: Math.round(notificationReadRate * 100) / 100,
          avg_response_time: Math.round(notifications.avg_response_time || 0),
          by_type: notificationsByType
        },
        chat: {
          total_rooms: chat.total_rooms || 0,
          active_rooms: chat.active_rooms || 0,
          total_messages: messages.total_messages || 0,
          avg_response_time: Math.round((chat.avg_response_time || 0) * 100) / 100,
          avg_satisfaction: Math.round((chat.avg_satisfaction || 0) * 100) / 100,
          rooms_by_type: chatsByType,
          messages_by_type: messagesByType
        }
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ error: 'Failed to get dashboard statistics' });
    }
  }

  /**
   * Get active connections with details
   */
  async getActiveConnections(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 50 } = req.query;

      // Get online users from presence
      const onlineUsers = await UserPresence.find({
        status: { $in: ['online', 'away', 'busy'] },
        last_seen: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
      })
      .sort({ last_seen: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('user_id status last_seen current_page shopping_activity devices geographic_location session_data');

      const total = await UserPresence.countDocuments({
        status: { $in: ['online', 'away', 'busy'] },
        last_seen: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
      });

      // Get connection details from Redis
      const connectionsWithDetails = await Promise.all(
        onlineUsers.map(async (user) => {
          const connections = await realtimeRedisService.getUserConnections(user.user_id);
          const networkQuality = await realtimeRedisService.getBangladeshNetworkQuality(user.user_id);
          
          return {
            user_id: user.user_id,
            status: user.status,
            last_seen: user.last_seen,
            current_page: user.current_page,
            shopping_activity: user.shopping_activity,
            device_count: user.devices.length,
            devices: user.devices.map(d => ({
              type: d.type,
              os: d.os,
              browser: d.browser,
              last_activity: d.last_activity
            })),
            location: user.geographic_location,
            session_duration: Math.floor((Date.now() - user.session_data.session_start.getTime()) / 1000),
            pages_visited: user.session_data.pages_visited,
            interactions: user.session_data.interactions,
            active_connections: connections.length,
            network_quality: networkQuality
          };
        })
      );

      res.json({
        success: true,
        connections: connectionsWithDetails,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting active connections:', error);
      res.status(500).json({ error: 'Failed to get active connections' });
    }
  }

  /**
   * Get event logs with filtering
   */
  async getEventLogs(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 100, 
        event_type, 
        priority, 
        status, 
        hours = 24 
      } = req.query;

      const startTime = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);
      const query: any = {
        timestamp: { $gte: startTime }
      };

      if (event_type) {
        query.event_type = event_type;
      }

      if (priority) {
        query.priority = priority;
      }

      // Filter by delivery status
      if (status === 'delivered') {
        query['delivery_status.delivered'] = { $gt: 0 };
      } else if (status === 'failed') {
        query['delivery_status.failed'] = { $gt: 0 };
      } else if (status === 'pending') {
        query['delivery_status.pending'] = { $gt: 0 };
      }

      const events = await RealtimeEvent.find(query)
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .select('event_type channel timestamp priority delivery_status attempts error_log metadata');

      const total = await RealtimeEvent.countDocuments(query);

      res.json({
        success: true,
        events: events.map(event => ({
          id: event._id,
          event_type: event.event_type,
          channel: event.channel,
          timestamp: event.timestamp,
          priority: event.priority,
          delivery_status: event.delivery_status,
          attempts: event.attempts,
          success_rate: event.delivery_status.total_recipients > 0 ? 
            (event.delivery_status.delivered / event.delivery_status.total_recipients) * 100 : 0,
          has_errors: event.error_log && event.error_log.length > 0,
          metadata: event.metadata
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting event logs:', error);
      res.status(500).json({ error: 'Failed to get event logs' });
    }
  }

  /**
   * Get system performance metrics
   */
  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { hours = 1 } = req.query;
      const startTime = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);

      // Get Redis stats
      const realtimeStats = await realtimeRedisService.getRealtimeStats();
      const connectionStats = await realtimeRedisService.getConnectionStats();

      // Calculate message throughput
      const recentEvents = await RealtimeEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: {
              minute: { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$timestamp' } }
            },
            count: { $sum: 1 },
            avgLatency: { $avg: '$delivery_status.delivered' }
          }
        },
        {
          $sort: { '_id.minute': 1 }
        }
      ]);

      // Calculate average response times
      const responseTimeStats = await RealtimeNotification.aggregate([
        {
          $match: {
            'tracking.created_at': { $gte: startTime },
            'tracking.response_time': { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            avg_response_time: { $avg: '$tracking.response_time' },
            min_response_time: { $min: '$tracking.response_time' },
            max_response_time: { $max: '$tracking.response_time' },
            count: { $sum: 1 }
          }
        }
      ]);

      // Get system resource usage
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      res.json({
        success: true,
        timestamp: new Date(),
        period_hours: Number(hours),
        realtime: {
          total_connections: connectionStats.total_connections || 0,
          online_users: connectionStats.online_users || 0,
          messages_per_second: realtimeStats.messages_per_second || 0,
          average_latency: realtimeStats.average_latency || 0
        },
        throughput: {
          recent_events: recentEvents.length,
          avg_events_per_minute: recentEvents.length > 0 ? 
            recentEvents.reduce((sum, event) => sum + event.count, 0) / recentEvents.length : 0,
          timeline: recentEvents.map(event => ({
            time: event._id.minute,
            count: event.count,
            avgLatency: event.avgLatency
          }))
        },
        response_times: responseTimeStats[0] ? {
          average: Math.round(responseTimeStats[0].avg_response_time),
          minimum: responseTimeStats[0].min_response_time,
          maximum: responseTimeStats[0].max_response_time,
          total_measured: responseTimeStats[0].count
        } : {
          average: 0,
          minimum: 0,
          maximum: 0,
          total_measured: 0
        },
        system_resources: {
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024),
            rss: Math.round(memoryUsage.rss / 1024 / 1024)
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          },
          uptime: Math.floor(process.uptime())
        }
      });
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      res.status(500).json({ error: 'Failed to get performance metrics' });
    }
  }

  /**
   * Broadcast admin message to all users
   */
  async broadcastAdminMessage(req: Request, res: Response): Promise<void> {
    try {
      const { 
        title, 
        message, 
        type = 'system_announcement', 
        priority = 'medium',
        target_users = 'all',
        channels = ['online']
      } = req.body;

      if (!title || !message) {
        res.status(400).json({ error: 'Title and message are required' });
        return;
      }

      const io = (global as any).io;
      if (!io) {
        res.status(500).json({ error: 'WebSocket service not available' });
        return;
      }

      let targetUserIds: string[] = [];

      if (target_users === 'all') {
        // Get all online users
        const onlineUsers = await realtimeRedisService.getOnlineUsers();
        targetUserIds = onlineUsers;
      } else if (Array.isArray(target_users)) {
        targetUserIds = target_users;
      }

      let sentCount = 0;
      let failedCount = 0;

      for (const userId of targetUserIds) {
        try {
          if (channels.includes('online')) {
            // Send to online users via WebSocket
            const userConnections = await realtimeRedisService.getUserConnections(userId);
            
            if (userConnections.length > 0) {
              const messageData = {
                id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type,
                title,
                message,
                timestamp: new Date(),
                priority,
                from_admin: true
              };

              userConnections.forEach(socketId => {
                io.to(socketId).emit('system_announcement', messageData);
              });

              sentCount++;
            } else if (channels.includes('offline')) {
              // Queue for offline users
              await realtimeRedisService.queueOfflineMessage(userId, {
                id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'notification',
                timestamp: Date.now(),
                data: { title, message, type, priority, from_admin: true },
                priority,
                retry_count: 0,
                expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
              });

              sentCount++;
            }
          }
        } catch (error) {
          console.error(`Error sending admin message to user ${userId}:`, error);
          failedCount++;
        }
      }

      res.json({
        success: true,
        message: 'Admin message broadcasted',
        target_users: targetUserIds.length,
        sent: sentCount,
        failed: failedCount
      });
    } catch (error) {
      console.error('Error broadcasting admin message:', error);
      res.status(500).json({ error: 'Failed to broadcast admin message' });
    }
  }

  /**
   * Force disconnect user
   */
  async forceDisconnectUser(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params;
      const { reason = 'Administrative action' } = req.body;

      const userConnections = await realtimeRedisService.getUserConnections(user_id);
      const io = (global as any).io;

      if (!io) {
        res.status(500).json({ error: 'WebSocket service not available' });
        return;
      }

      let disconnectedConnections = 0;

      for (const socketId of userConnections) {
        try {
          // Send disconnect message
          io.to(socketId).emit('force_disconnect', {
            reason,
            timestamp: new Date()
          });

          // Disconnect socket
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.disconnect(true);
            disconnectedConnections++;
          }

          // Clean up Redis
          await realtimeRedisService.removeUserConnection(user_id, socketId);
        } catch (error) {
          console.error(`Error disconnecting socket ${socketId}:`, error);
        }
      }

      // Update presence to offline
      await UserPresence.findOneAndUpdate(
        { user_id },
        { 
          status: 'offline',
          last_seen: new Date()
        }
      );

      res.json({
        success: true,
        user_id,
        disconnected_connections: disconnectedConnections,
        reason
      });
    } catch (error) {
      console.error('Error force disconnecting user:', error);
      res.status(500).json({ error: 'Failed to force disconnect user' });
    }
  }

  /**
   * Helper method to group array by field occurrences
   */
  private groupByField(array: string[]): Record<string, number> {
    return array.reduce((acc: Record<string, number>, item: string) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
  }
}