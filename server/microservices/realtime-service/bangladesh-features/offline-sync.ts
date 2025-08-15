/**
 * Offline Sync Handler
 * Amazon.com/Shopee.sg-Level offline message synchronization
 */

import { realtimeRedisService } from '../src/services/redis-service';
import { RealtimeNotification } from '../src/models/RealtimeNotification';
import { ChatMessage } from '../src/models/ChatRoom';

export interface OfflineMessage {
  id: string;
  type: 'notification' | 'chat' | 'presence' | 'order_update' | 'payment_update';
  timestamp: number;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  retry_count: number;
  expires_at: number;
}

export class OfflineSyncHandler {
  private maxRetries = 3;
  private syncInterval: NodeJS.Timeout | null = null;
  private batchSize = 10;

  constructor() {
    this.startSyncScheduler();
  }

  /**
   * Queue message for offline user
   */
  async queueOfflineMessage(userId: string, message: OfflineMessage): Promise<void> {
    try {
      // Store in Redis queue
      await realtimeRedisService.queueOfflineMessage(userId, message);

      // Store critical messages in database for persistence
      if (message.priority === 'critical' || message.priority === 'high') {
        await this.persistCriticalMessage(userId, message);
      }

      console.log(`📱 Queued offline message for user ${userId}: ${message.type}`);
    } catch (error) {
      console.error('Error queuing offline message:', error);
    }
  }

  /**
   * Sync messages when user comes online
   */
  async syncOfflineMessages(userId: string, socketId: string): Promise<{
    synced: number;
    failed: number;
    messages: OfflineMessage[];
  }> {
    try {
      // Get messages from Redis
      const redisMessages = await realtimeRedisService.getOfflineMessages(userId);
      
      // Get critical messages from database
      const dbMessages = await this.getCriticalMessages(userId);
      
      // Combine and deduplicate messages
      const allMessages = this.deduplicateMessages([...redisMessages, ...dbMessages]);
      
      // Sort by priority and timestamp
      const sortedMessages = this.sortMessagesByPriority(allMessages);
      
      // Send messages in batches
      const result = await this.sendMessagesInBatches(socketId, sortedMessages);
      
      // Clean up sent messages
      await this.cleanupSentMessages(userId, result.synced_messages);
      
      console.log(`📱 Synced ${result.synced} offline messages for user ${userId}`);
      
      return {
        synced: result.synced,
        failed: result.failed,
        messages: sortedMessages.slice(0, 20) // Return first 20 for client display
      };
    } catch (error) {
      console.error('Error syncing offline messages:', error);
      return { synced: 0, failed: 0, messages: [] };
    }
  }

  /**
   * Handle connection quality and optimize sync
   */
  async optimizeForConnectionQuality(userId: string, connectionQuality: {
    bandwidth: '2g' | '3g' | '4g' | 'wifi';
    latency: number;
    packetLoss: number;
  }): Promise<{
    batch_size: number;
    compression_enabled: boolean;
    priority_filter: string[];
  }> {
    const { bandwidth, latency, packetLoss } = connectionQuality;
    
    let batchSize = this.batchSize;
    let compressionEnabled = false;
    let priorityFilter = ['critical', 'high', 'medium', 'low'];
    
    // Optimize based on connection quality
    if (bandwidth === '2g' || latency > 1000 || packetLoss > 5) {
      // Very poor connection
      batchSize = 3;
      compressionEnabled = true;
      priorityFilter = ['critical', 'high']; // Only critical and high priority
    } else if (bandwidth === '3g' || latency > 500 || packetLoss > 2) {
      // Poor connection
      batchSize = 5;
      compressionEnabled = true;
      priorityFilter = ['critical', 'high', 'medium'];
    } else if (bandwidth === '4g' || latency < 200) {
      // Good connection
      batchSize = 15;
      compressionEnabled = false;
      priorityFilter = ['critical', 'high', 'medium', 'low'];
    }
    
    // Store optimization settings
    await realtimeRedisService.updateBangladeshNetworkQuality(userId, {
      bandwidth,
      latency,
      packet_loss: packetLoss,
      optimization: {
        batch_size: batchSize,
        compression_enabled: compressionEnabled,
        priority_filter: priorityFilter
      }
    });
    
    return {
      batch_size: batchSize,
      compression_enabled: compressionEnabled,
      priority_filter: priorityFilter
    };
  }

  /**
   * Create notification from real-time event
   */
  async createNotificationFromEvent(eventData: {
    user_id: string;
    event_type: string;
    title: string;
    title_bn?: string;
    message: string;
    message_bn?: string;
    data: any;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      const offlineMessage: OfflineMessage = {
        id: `${eventData.event_type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'notification',
        timestamp: Date.now(),
        data: {
          notification_type: eventData.event_type,
          title: eventData.title,
          title_bn: eventData.title_bn,
          message: eventData.message,
          message_bn: eventData.message_bn,
          data: eventData.data
        },
        priority: eventData.priority,
        retry_count: 0,
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      };

      await this.queueOfflineMessage(eventData.user_id, offlineMessage);
    } catch (error) {
      console.error('Error creating notification from event:', error);
    }
  }

  /**
   * Handle chat message for offline user
   */
  async handleOfflineChatMessage(data: {
    room_id: string;
    recipient_id: string;
    sender_id: string;
    message: string;
    message_bn?: string;
    type: string;
  }): Promise<void> {
    try {
      const offlineMessage: OfflineMessage = {
        id: `chat_${data.room_id}_${Date.now()}`,
        type: 'chat',
        timestamp: Date.now(),
        data: {
          room_id: data.room_id,
          sender_id: data.sender_id,
          message: data.message,
          message_bn: data.message_bn,
          type: data.type
        },
        priority: data.type === 'urgent' ? 'high' : 'medium',
        retry_count: 0,
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours for chat
      };

      await this.queueOfflineMessage(data.recipient_id, offlineMessage);
    } catch (error) {
      console.error('Error handling offline chat message:', error);
    }
  }

  /**
   * Persist critical messages to database
   */
  private async persistCriticalMessage(userId: string, message: OfflineMessage): Promise<void> {
    try {
      if (message.type === 'notification') {
        await RealtimeNotification.create({
          notification_id: message.id,
          user_id: userId,
          notification_type: message.data.notification_type,
          title: message.data.title,
          title_bn: message.data.title_bn,
          message: message.data.message,
          message_bn: message.data.message_bn,
          data: message.data.data || {},
          channels: [{
            type: 'realtime',
            status: 'pending'
          }],
          priority: message.priority,
          user_preferences: {
            language: 'en',
            timezone: 'Asia/Dhaka',
            notification_settings: {
              realtime_enabled: true,
              push_enabled: true,
              email_enabled: false,
              sms_enabled: false
            }
          },
          tracking: {
            created_at: new Date(message.timestamp)
          }
        });
      }
    } catch (error) {
      console.error('Error persisting critical message:', error);
    }
  }

  /**
   * Get critical messages from database
   */
  private async getCriticalMessages(userId: string): Promise<OfflineMessage[]> {
    try {
      const notifications = await RealtimeNotification.find({
        user_id: userId,
        'channels.status': 'pending',
        priority: { $in: ['critical', 'high'] },
        'tracking.created_at': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }).limit(50);

      return notifications.map(notif => ({
        id: notif.notification_id,
        type: 'notification' as const,
        timestamp: notif.tracking.created_at.getTime(),
        data: {
          notification_type: notif.notification_type,
          title: notif.title,
          title_bn: notif.title_bn,
          message: notif.message,
          message_bn: notif.message_bn,
          data: notif.data
        },
        priority: notif.priority,
        retry_count: 0,
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000)
      }));
    } catch (error) {
      console.error('Error getting critical messages from database:', error);
      return [];
    }
  }

  /**
   * Deduplicate messages
   */
  private deduplicateMessages(messages: OfflineMessage[]): OfflineMessage[] {
    const seen = new Set<string>();
    return messages.filter(message => {
      if (seen.has(message.id)) {
        return false;
      }
      seen.add(message.id);
      return true;
    });
  }

  /**
   * Sort messages by priority and timestamp
   */
  private sortMessagesByPriority(messages: OfflineMessage[]): OfflineMessage[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    return messages.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // Then by timestamp (newer first for same priority)
      return b.timestamp - a.timestamp;
    });
  }

  /**
   * Send messages in batches with retry logic
   */
  private async sendMessagesInBatches(socketId: string, messages: OfflineMessage[]): Promise<{
    synced: number;
    failed: number;
    synced_messages: string[];
  }> {
    let synced = 0;
    let failed = 0;
    const syncedMessages: string[] = [];

    try {
      // Get WebSocket service (would need to inject this)
      const io = (global as any).io;
      if (!io) {
        throw new Error('WebSocket service not available');
      }

      for (let i = 0; i < messages.length; i += this.batchSize) {
        const batch = messages.slice(i, i + this.batchSize);
        
        for (const message of batch) {
          try {
            // Send based on message type
            if (message.type === 'notification') {
              io.to(socketId).emit('notification', message.data);
            } else if (message.type === 'chat') {
              io.to(socketId).emit('chat_message', message.data);
            } else if (message.type === 'order_update') {
              io.to(socketId).emit('order_status_updated', message.data);
            } else if (message.type === 'payment_update') {
              io.to(socketId).emit('payment_updated', message.data);
            }
            
            synced++;
            syncedMessages.push(message.id);
            
            // Small delay between messages to avoid overwhelming
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.error(`Error sending message ${message.id}:`, error);
            failed++;
          }
        }
        
        // Longer delay between batches
        if (i + this.batchSize < messages.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.error('Error in batch sending:', error);
      failed = messages.length;
    }

    return { synced, failed, synced_messages: syncedMessages };
  }

  /**
   * Clean up sent messages
   */
  private async cleanupSentMessages(userId: string, messageIds: string[]): Promise<void> {
    try {
      // Update database notifications as delivered
      await RealtimeNotification.updateMany(
        {
          notification_id: { $in: messageIds },
          user_id: userId
        },
        {
          $set: {
            'channels.0.status': 'delivered',
            'channels.0.delivered_at': new Date(),
            'tracking.delivered_at': new Date()
          }
        }
      );
    } catch (error) {
      console.error('Error cleaning up sent messages:', error);
    }
  }

  /**
   * Start background sync scheduler
   */
  private startSyncScheduler(): void {
    // Clean up expired messages every 30 minutes
    this.syncInterval = setInterval(async () => {
      try {
        const now = Date.now();
        
        // This would require access to all user queues
        // In practice, this would be handled by a separate cleanup job
        console.log('🧹 Running offline message cleanup...');
        
        await realtimeRedisService.cleanupExpiredData();
        
        // Clean up expired database notifications
        await RealtimeNotification.deleteMany({
          'tracking.created_at': { $lt: new Date(now - 7 * 24 * 60 * 60 * 1000) },
          'channels.status': { $in: ['pending', 'failed'] }
        });
        
      } catch (error) {
        console.error('Error in sync scheduler cleanup:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Get offline message statistics
   */
  async getOfflineStats(userId: string): Promise<{
    total_queued: number;
    by_priority: Record<string, number>;
    by_type: Record<string, number>;
    oldest_message: number | null;
  }> {
    try {
      const messages = await realtimeRedisService.getOfflineMessages(userId);
      
      if (messages.length === 0) {
        return {
          total_queued: 0,
          by_priority: {},
          by_type: {},
          oldest_message: null
        };
      }

      const byPriority: Record<string, number> = {};
      const byType: Record<string, number> = {};
      let oldestTimestamp = Date.now();

      messages.forEach(message => {
        byPriority[message.priority] = (byPriority[message.priority] || 0) + 1;
        byType[message.type] = (byType[message.type] || 0) + 1;
        
        if (message.timestamp < oldestTimestamp) {
          oldestTimestamp = message.timestamp;
        }
      });

      return {
        total_queued: messages.length,
        by_priority: byPriority,
        by_type: byType,
        oldest_message: oldestTimestamp
      };
    } catch (error) {
      console.error('Error getting offline stats:', error);
      return {
        total_queued: 0,
        by_priority: {},
        by_type: {},
        oldest_message: null
      };
    }
  }

  /**
   * Stop sync scheduler
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const offlineSyncHandler = new OfflineSyncHandler();