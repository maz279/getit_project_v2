/**
 * Event Broadcaster Service - Event Distribution System
 * Amazon.com/Shopee.sg-Level event broadcasting and distribution
 */

import { EventEmitter } from 'events';
import { createClient } from 'redis';
import { WebSocketService } from './websocket-service';

export interface BroadcastEvent {
  id: string;
  type: string;
  channel: string;
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  ttl?: number;
  recipients?: string[];
  conditions?: {
    userTypes?: string[];
    locations?: string[];
    devices?: string[];
    minVersion?: string;
  };
}

export class EventBroadcaster extends EventEmitter {
  private redis = createClient();
  private webSocketService?: WebSocketService;
  private eventQueue: BroadcastEvent[] = [];
  private processingInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.initializeRedis();
    this.startEventProcessor();
  }

  private async initializeRedis() {
    try {
      await this.redis.connect();
      console.log('✅ Redis connected for Event Broadcaster');
      
      // Subscribe to external events
      await this.redis.subscribe('product_updates', this.handleProductUpdate.bind(this));
      await this.redis.subscribe('order_updates', this.handleOrderUpdate.bind(this));
      await this.redis.subscribe('payment_updates', this.handlePaymentUpdate.bind(this));
      await this.redis.subscribe('inventory_updates', this.handleInventoryUpdate.bind(this));
      await this.redis.subscribe('vendor_updates', this.handleVendorUpdate.bind(this));
      await this.redis.subscribe('system_announcements', this.handleSystemAnnouncement.bind(this));
    } catch (error) {
      console.warn('⚠️ Redis connection failed for Event Broadcaster:', error.message);
    }
  }

  public setWebSocketService(webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;
  }

  private startEventProcessor() {
    this.processingInterval = setInterval(() => {
      this.processEventQueue();
    }, 100); // Process every 100ms for real-time performance
  }

  private async processEventQueue() {
    if (this.eventQueue.length === 0) return;

    // Sort by priority (critical > high > medium > low)
    this.eventQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const batchSize = this.eventQueue.length > 100 ? 20 : this.eventQueue.length;
    const eventBatch = this.eventQueue.splice(0, batchSize);

    for (const event of eventBatch) {
      await this.broadcastEvent(event);
    }
  }

  public async queueEvent(event: Omit<BroadcastEvent, 'id' | 'timestamp'>) {
    const broadcastEvent: BroadcastEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    };

    this.eventQueue.push(broadcastEvent);
    
    // Store in Redis for durability
    await this.redis.lPush('event_queue', JSON.stringify(broadcastEvent));
    
    this.emit('event_queued', broadcastEvent);
  }

  private async broadcastEvent(event: BroadcastEvent) {
    try {
      // Get recipients based on channel and conditions
      const recipients = await this.getEventRecipients(event);

      let deliveredCount = 0;
      let failedCount = 0;

      // Broadcast to specific users if recipients specified
      if (event.recipients && event.recipients.length > 0) {
        for (const userId of event.recipients) {
          try {
            await this.webSocketService?.sendToUser(userId, event.type, {
              ...event.data,
              eventId: event.id,
              timestamp: event.timestamp
            });
            deliveredCount++;
          } catch (error) {
            failedCount++;
            console.warn(`Failed to send event ${event.id} to user ${userId}:`, error.message);
          }
        }
      } 
      // Broadcast to channel
      else if (event.channel) {
        try {
          await this.webSocketService?.broadcastToChannel(event.channel, event.type, {
            ...event.data,
            eventId: event.id,
            timestamp: event.timestamp
          });
          deliveredCount = recipients.length;
        } catch (error) {
          failedCount = recipients.length;
          console.error(`Failed to broadcast event ${event.id} to channel ${event.channel}:`, error);
        }
      }
      // Global broadcast
      else {
        try {
          await this.webSocketService?.broadcast(event.type, {
            ...event.data,
            eventId: event.id,
            timestamp: event.timestamp
          });
          deliveredCount = recipients.length;
        } catch (error) {
          failedCount = recipients.length;
          console.error(`Failed to broadcast event ${event.id} globally:`, error);
        }
      }

      // Store delivery statistics
      await this.storeDeliveryStats(event.id, deliveredCount, failedCount);

      this.emit('event_broadcasted', {
        event,
        delivered: deliveredCount,
        failed: failedCount
      });

    } catch (error) {
      console.error(`❌ Error broadcasting event ${event.id}:`, error);
      this.emit('event_failed', { event, error });
    }
  }

  private async getEventRecipients(event: BroadcastEvent): Promise<string[]> {
    try {
      let recipients: string[] = [];

      if (event.channel) {
        // Get users in channel
        const channelUsers = await this.redis.sMembers(`channel:${event.channel}`);
        recipients = await this.filterUsersByConditions(channelUsers, event.conditions);
      } else {
        // Get all online users
        const onlineUsers = await this.redis.sMembers('online_users');
        recipients = await this.filterUsersByConditions(onlineUsers, event.conditions);
      }

      return recipients;
    } catch (error) {
      console.error('Error getting event recipients:', error);
      return [];
    }
  }

  private async filterUsersByConditions(users: string[], conditions?: BroadcastEvent['conditions']): Promise<string[]> {
    if (!conditions) return users;

    const filteredUsers: string[] = [];

    for (const userId of users) {
      let shouldInclude = true;

      // Filter by user type
      if (conditions.userTypes && conditions.userTypes.length > 0) {
        const userType = await this.redis.hGet(`user_info:${userId}`, 'type');
        if (!userType || !conditions.userTypes.includes(userType)) {
          shouldInclude = false;
        }
      }

      // Filter by location
      if (conditions.locations && conditions.locations.length > 0 && shouldInclude) {
        const userLocation = await this.redis.hGet(`user_presence:${userId}`, 'location');
        if (!userLocation || !conditions.locations.includes(userLocation)) {
          shouldInclude = false;
        }
      }

      // Filter by device type
      if (conditions.devices && conditions.devices.length > 0 && shouldInclude) {
        const deviceInfo = await this.redis.hGet(`user_presence:${userId}`, 'deviceInfo');
        if (deviceInfo) {
          const device = JSON.parse(deviceInfo);
          if (!conditions.devices.includes(device.type)) {
            shouldInclude = false;
          }
        }
      }

      if (shouldInclude) {
        filteredUsers.push(userId);
      }
    }

    return filteredUsers;
  }

  // Event handlers for different services

  private async handleProductUpdate(message: string) {
    try {
      const update = JSON.parse(message);
      
      await this.queueEvent({
        type: 'product_update',
        channel: `product:${update.productId}`,
        data: {
          productId: update.productId,
          type: update.type,
          changes: update.changes,
          vendorId: update.vendorId
        },
        priority: update.type === 'price_drop' ? 'high' : 'medium'
      });

      // Bangladesh-specific price drop notifications
      if (update.type === 'price_drop' && update.discountPercentage > 10) {
        await this.queueEvent({
          type: 'bangladesh_price_alert',
          channel: 'bangladesh_users',
          data: {
            productId: update.productId,
            oldPrice: update.oldPrice,
            newPrice: update.newPrice,
            discount: update.discountPercentage,
            message_bn: `দাম কমেছে ${update.discountPercentage}%! এখনই কিনুন।`
          },
          priority: 'high'
        });
      }
    } catch (error) {
      console.error('Error handling product update:', error);
    }
  }

  private async handleOrderUpdate(message: string) {
    try {
      const update = JSON.parse(message);
      
      await this.queueEvent({
        type: 'order_status_update',
        channel: `user:${update.customerId}`,
        data: {
          orderId: update.orderId,
          status: update.status,
          trackingNumber: update.trackingNumber,
          estimatedDelivery: update.estimatedDelivery
        },
        priority: 'high',
        recipients: [update.customerId]
      });

      // Notify vendor
      if (update.vendorId) {
        await this.queueEvent({
          type: 'vendor_order_update',
          channel: `vendor:${update.vendorId}`,
          data: {
            orderId: update.orderId,
            status: update.status,
            customerId: update.customerId
          },
          priority: 'medium',
          recipients: [update.vendorId]
        });
      }
    } catch (error) {
      console.error('Error handling order update:', error);
    }
  }

  private async handlePaymentUpdate(message: string) {
    try {
      const update = JSON.parse(message);
      
      await this.queueEvent({
        type: 'payment_status_update',
        channel: `user:${update.userId}`,
        data: {
          paymentId: update.paymentId,
          orderId: update.orderId,
          status: update.status,
          amount: update.amount,
          method: update.method
        },
        priority: 'critical',
        recipients: [update.userId]
      });

      // Bangladesh mobile banking notifications
      if (['bkash', 'nagad', 'rocket'].includes(update.method)) {
        await this.queueEvent({
          type: 'bangladesh_payment_notification',
          channel: `user:${update.userId}`,
          data: {
            paymentId: update.paymentId,
            status: update.status,
            amount: update.amount,
            method: update.method,
            message_bn: update.status === 'completed' 
              ? 'আপনার পেমেন্ট সফল হয়েছে!' 
              : 'পেমেন্ট প্রক্রিয়াধীন আছে...'
          },
          priority: 'critical',
          recipients: [update.userId]
        });
      }
    } catch (error) {
      console.error('Error handling payment update:', error);
    }
  }

  private async handleInventoryUpdate(message: string) {
    try {
      const update = JSON.parse(message);
      
      // Low stock alert
      if (update.stock <= update.lowStockThreshold) {
        await this.queueEvent({
          type: 'low_stock_alert',
          channel: `vendor:${update.vendorId}`,
          data: {
            productId: update.productId,
            currentStock: update.stock,
            threshold: update.lowStockThreshold
          },
          priority: 'high',
          recipients: [update.vendorId]
        });
      }

      // Out of stock alert
      if (update.stock === 0) {
        await this.queueEvent({
          type: 'out_of_stock',
          channel: `product:${update.productId}`,
          data: {
            productId: update.productId,
            message: 'Product is now out of stock'
          },
          priority: 'medium'
        });
      }

      // Back in stock notification
      if (update.previousStock === 0 && update.stock > 0) {
        await this.queueEvent({
          type: 'back_in_stock',
          channel: `product:${update.productId}`,
          data: {
            productId: update.productId,
            stock: update.stock,
            message: 'Product is back in stock!'
          },
          priority: 'high'
        });
      }
    } catch (error) {
      console.error('Error handling inventory update:', error);
    }
  }

  private async handleVendorUpdate(message: string) {
    try {
      const update = JSON.parse(message);
      
      await this.queueEvent({
        type: 'vendor_update',
        channel: `vendor:${update.vendorId}`,
        data: {
          vendorId: update.vendorId,
          type: update.type,
          data: update.data
        },
        priority: 'medium',
        recipients: [update.vendorId]
      });
    } catch (error) {
      console.error('Error handling vendor update:', error);
    }
  }

  private async handleSystemAnnouncement(message: string) {
    try {
      const announcement = JSON.parse(message);
      
      await this.queueEvent({
        type: 'system_announcement',
        channel: 'all_users',
        data: {
          title: announcement.title,
          message: announcement.message,
          type: announcement.type,
          showUntil: announcement.showUntil
        },
        priority: announcement.priority || 'medium'
      });

      // Bangladesh-specific announcement
      if (announcement.title_bn && announcement.message_bn) {
        await this.queueEvent({
          type: 'bangladesh_announcement',
          channel: 'bangladesh_users',
          data: {
            title: announcement.title_bn,
            message: announcement.message_bn,
            type: announcement.type,
            showUntil: announcement.showUntil
          },
          priority: announcement.priority || 'medium',
          conditions: {
            locations: ['BD']
          }
        });
      }
    } catch (error) {
      console.error('Error handling system announcement:', error);
    }
  }

  // Helper methods

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeDeliveryStats(eventId: string, delivered: number, failed: number) {
    try {
      await this.redis.hSet(`event_delivery:${eventId}`, {
        delivered: delivered.toString(),
        failed: failed.toString(),
        timestamp: Date.now().toString()
      });
      
      // Set expiration for 24 hours
      await this.redis.expire(`event_delivery:${eventId}`, 86400);
    } catch (error) {
      console.warn('Failed to store delivery stats:', error.message);
    }
  }

  // Public API methods

  public async broadcastProductUpdate(productId: string, updateType: string, data: any) {
    await this.queueEvent({
      type: 'product_update',
      channel: `product:${productId}`,
      data: { productId, updateType, ...data },
      priority: updateType === 'price_drop' ? 'high' : 'medium'
    });
  }

  public async sendOrderNotification(userId: string, orderId: string, status: string, data: any) {
    await this.queueEvent({
      type: 'order_notification',
      channel: `user:${userId}`,
      data: { orderId, status, ...data },
      priority: 'high',
      recipients: [userId]
    });
  }

  public async broadcastSystemMaintenance(startTime: Date, endTime: Date, message: string) {
    await this.queueEvent({
      type: 'system_maintenance',
      channel: 'all_users',
      data: {
        startTime,
        endTime,
        message,
        message_bn: 'সিস্টেম রক্ষণাবেক্ষণ চলছে। অনুগ্রহ করে পরে চেষ্টা করুন।'
      },
      priority: 'critical'
    });
  }

  public async sendBangladeshFestivalGreeting(festival: string, message: string, message_bn: string) {
    await this.queueEvent({
      type: 'festival_greeting',
      channel: 'bangladesh_users',
      data: {
        festival,
        message,
        message_bn,
        timestamp: new Date()
      },
      priority: 'medium',
      conditions: {
        locations: ['BD']
      }
    });
  }

  public getQueueStats() {
    return {
      queueLength: this.eventQueue.length,
      priorityBreakdown: this.eventQueue.reduce((acc, event) => {
        acc[event.priority] = (acc[event.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  public async getDeliveryStats(eventId: string) {
    try {
      const stats = await this.redis.hGetAll(`event_delivery:${eventId}`);
      return {
        delivered: parseInt(stats.delivered || '0'),
        failed: parseInt(stats.failed || '0'),
        timestamp: parseInt(stats.timestamp || '0')
      };
    } catch (error) {
      return { delivered: 0, failed: 0, timestamp: 0 };
    }
  }

  public stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
  }
}