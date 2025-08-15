/**
 * Presence Service
 * Amazon.com/Shopee.sg-Level user presence management
 */

import { UserPresence, IUserPresence } from '../models/UserPresence';
import { realtimeRedisService } from './redis-service';
import { EventEmitter } from 'events';

export interface PresenceUpdate {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  current_page?: string;
  shopping_activity?: {
    viewing_product?: string;
    cart_items?: number;
    in_checkout?: boolean;
    browsing_category?: string;
    search_query?: string;
  };
  device_info?: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
    app_version?: string;
  };
  geographic_location?: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
}

export class PresenceService extends EventEmitter {
  private presenceTimeout: Map<string, NodeJS.Timeout> = new Map();
  private readonly AWAY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly OFFLINE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  constructor() {
    super();
    this.setupCleanupInterval();
  }

  async updatePresence(presenceData: PresenceUpdate): Promise<IUserPresence> {
    const { user_id, status, current_page, shopping_activity, device_info, geographic_location } = presenceData;

    try {
      // Clear existing timeout
      if (this.presenceTimeout.has(user_id)) {
        clearTimeout(this.presenceTimeout.get(user_id)!);
      }

      // Update MongoDB document
      const updateData: any = {
        status,
        last_seen: new Date(),
        current_page: current_page || '/',
      };

      if (shopping_activity) {
        updateData.shopping_activity = {
          ...shopping_activity,
        };
      }

      if (geographic_location) {
        updateData.geographic_location = geographic_location;
      }

      // Handle device information
      if (device_info) {
        const existingPresence = await UserPresence.findOne({ user_id });
        
        if (existingPresence) {
          // Update existing device or add new one
          const deviceIndex = existingPresence.devices.findIndex(
            d => d.type === device_info.type && d.os === device_info.os
          );
          
          if (deviceIndex >= 0) {
            existingPresence.devices[deviceIndex].last_activity = new Date();
            existingPresence.devices[deviceIndex].browser = device_info.browser;
            if (device_info.app_version) {
              existingPresence.devices[deviceIndex].app_version = device_info.app_version;
            }
          } else {
            existingPresence.devices.push({
              device_id: `${device_info.type}-${Date.now()}`,
              type: device_info.type,
              os: device_info.os,
              browser: device_info.browser,
              app_version: device_info.app_version,
              last_activity: new Date()
            });
          }
          
          updateData.devices = existingPresence.devices;
          updateData.device_count = existingPresence.devices.length;
        }
      }

      // Update session data
      const existingPresence = await UserPresence.findOne({ user_id });
      if (existingPresence) {
        const sessionStart = existingPresence.session_data.session_start;
        const totalTime = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
        
        updateData.session_data = {
          ...existingPresence.session_data,
          total_time: totalTime,
          pages_visited: existingPresence.session_data.pages_visited + (current_page !== existingPresence.current_page ? 1 : 0),
          interactions: existingPresence.session_data.interactions + 1
        };
      }

      const presence = await UserPresence.findOneAndUpdate(
        { user_id },
        updateData,
        { 
          upsert: true, 
          new: true, 
          setDefaultsOnInsert: true 
        }
      );

      // Update Redis cache
      await realtimeRedisService.updateUserPresence(user_id, {
        status,
        last_activity: Date.now(),
        current_page: current_page || '/',
        device_count: presence.device_count,
        activity: shopping_activity
      });

      // Set automatic status transitions
      if (status === 'online') {
        // Set away after 5 minutes of inactivity
        const awayTimeout = setTimeout(() => {
          this.setUserAway(user_id);
        }, this.AWAY_TIMEOUT);
        this.presenceTimeout.set(user_id, awayTimeout);
      }

      // Emit presence update event
      this.emit('presence_updated', {
        user_id,
        status,
        current_page,
        shopping_activity,
        device_count: presence.device_count,
        timestamp: new Date()
      });

      return presence;
    } catch (error) {
      console.error('Error updating presence:', error);
      throw error;
    }
  }

  async getUserPresence(userId: string): Promise<IUserPresence | null> {
    try {
      // Try Redis first for quick access
      const redisPresence = await realtimeRedisService.getUserPresence(userId);
      
      if (redisPresence && redisPresence.status === 'online') {
        // Get full data from MongoDB
        const presence = await UserPresence.findOne({ user_id: userId });
        return presence;
      }

      // Fallback to MongoDB
      const presence = await UserPresence.findOne({ user_id: userId });
      
      if (presence) {
        // Update Redis cache
        await realtimeRedisService.updateUserPresence(userId, {
          status: presence.status,
          last_activity: presence.last_seen.getTime(),
          current_page: presence.current_page,
          device_count: presence.device_count,
          activity: presence.shopping_activity
        });
      }

      return presence;
    } catch (error) {
      console.error('Error getting user presence:', error);
      return null;
    }
  }

  async getOnlineUsers(): Promise<Array<{ user_id: string; status: string; current_page: string; shopping_activity: any }>> {
    try {
      // Get online users from Redis (faster)
      const onlineUserIds = await realtimeRedisService.getOnlineUsers();
      
      if (onlineUserIds.length === 0) {
        return [];
      }

      // Get detailed presence data from MongoDB
      const presences = await UserPresence.find({
        user_id: { $in: onlineUserIds },
        status: { $in: ['online', 'away', 'busy'] }
      }).select('user_id status current_page shopping_activity last_seen device_count');

      return presences.map(p => ({
        user_id: p.user_id,
        status: p.status,
        current_page: p.current_page,
        shopping_activity: p.shopping_activity,
        last_seen: p.last_seen,
        device_count: p.device_count
      }));
    } catch (error) {
      console.error('Error getting online users:', error);
      return [];
    }
  }

  async getPresenceByLocation(location: string): Promise<Array<{ user_id: string; status: string; shopping_activity: any }>> {
    try {
      const presences = await UserPresence.find({
        location,
        status: { $in: ['online', 'away', 'busy'] },
        last_seen: { $gte: new Date(Date.now() - this.OFFLINE_TIMEOUT) }
      }).select('user_id status shopping_activity device_count');

      return presences.map(p => ({
        user_id: p.user_id,
        status: p.status,
        shopping_activity: p.shopping_activity,
        device_count: p.device_count
      }));
    } catch (error) {
      console.error('Error getting presence by location:', error);
      return [];
    }
  }

  async getPresenceStatistics(): Promise<{
    total_online: number;
    by_status: Record<string, number>;
    by_location: Record<string, number>;
    by_device_type: Record<string, number>;
    by_geographic_location: Record<string, number>;
  }> {
    try {
      const stats = await UserPresence.aggregate([
        {
          $match: {
            last_seen: { $gte: new Date(Date.now() - this.OFFLINE_TIMEOUT) }
          }
        },
        {
          $group: {
            _id: null,
            total_online: { $sum: 1 },
            by_status: {
              $push: '$status'
            },
            by_location: {
              $push: '$location'
            },
            by_geographic_city: {
              $push: '$geographic_location.city'
            },
            devices: {
              $push: '$devices'
            }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          total_online: 0,
          by_status: {},
          by_location: {},
          by_device_type: {},
          by_geographic_location: {}
        };
      }

      const result = stats[0];
      
      // Count by status
      const by_status = result.by_status.reduce((acc: Record<string, number>, status: string) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Count by location
      const by_location = result.by_location.reduce((acc: Record<string, number>, location: string) => {
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {});

      // Count by geographic location (city)
      const by_geographic_location = result.by_geographic_city
        .filter((city: string) => city)
        .reduce((acc: Record<string, number>, city: string) => {
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        }, {});

      // Count by device type
      const by_device_type: Record<string, number> = {};
      result.devices.forEach((deviceArray: any[]) => {
        deviceArray.forEach(device => {
          by_device_type[device.type] = (by_device_type[device.type] || 0) + 1;
        });
      });

      return {
        total_online: result.total_online,
        by_status,
        by_location,
        by_device_type,
        by_geographic_location
      };
    } catch (error) {
      console.error('Error getting presence statistics:', error);
      return {
        total_online: 0,
        by_status: {},
        by_location: {},
        by_device_type: {},
        by_geographic_location: {}
      };
    }
  }

  async setUserOffline(userId: string): Promise<void> {
    try {
      await this.updatePresence({
        user_id: userId,
        status: 'offline'
      });

      // Remove from Redis active users
      await realtimeRedisService.updateUserPresence(userId, {
        status: 'offline',
        last_activity: Date.now(),
        current_page: '/',
        device_count: 0
      });

      // Clear timeout
      if (this.presenceTimeout.has(userId)) {
        clearTimeout(this.presenceTimeout.get(userId)!);
        this.presenceTimeout.delete(userId);
      }

      this.emit('user_offline', { user_id: userId, timestamp: new Date() });
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  }

  private async setUserAway(userId: string): Promise<void> {
    try {
      const presence = await UserPresence.findOne({ user_id: userId });
      
      if (presence && presence.status === 'online') {
        await this.updatePresence({
          user_id: userId,
          status: 'away'
        });

        // Set offline after additional time
        const offlineTimeout = setTimeout(() => {
          this.setUserOffline(userId);
        }, this.OFFLINE_TIMEOUT - this.AWAY_TIMEOUT);
        
        this.presenceTimeout.set(userId, offlineTimeout);
      }
    } catch (error) {
      console.error('Error setting user away:', error);
    }
  }

  private setupCleanupInterval(): void {
    // Clean up old presence data every 30 minutes
    setInterval(async () => {
      try {
        const cutoffTime = new Date(Date.now() - this.OFFLINE_TIMEOUT * 2);
        
        // Set users as offline if they haven't been seen for too long
        await UserPresence.updateMany(
          {
            last_seen: { $lt: cutoffTime },
            status: { $ne: 'offline' }
          },
          {
            status: 'offline'
          }
        );

        console.log('✅ Presence cleanup completed');
      } catch (error) {
        console.error('Error during presence cleanup:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Bangladesh-specific features
  async getBangladeshUserActivity(): Promise<{
    dhaka_users: number;
    chittagong_users: number;
    other_cities: number;
    mobile_users: number;
    shopping_users: number;
  }> {
    try {
      const bangladeshStats = await UserPresence.aggregate([
        {
          $match: {
            'geographic_location.country': 'BD',
            status: { $in: ['online', 'away', 'busy'] },
            last_seen: { $gte: new Date(Date.now() - this.AWAY_TIMEOUT) }
          }
        },
        {
          $group: {
            _id: null,
            dhaka_users: {
              $sum: {
                $cond: [{ $eq: ['$geographic_location.city', 'Dhaka'] }, 1, 0]
              }
            },
            chittagong_users: {
              $sum: {
                $cond: [{ $eq: ['$geographic_location.city', 'Chittagong'] }, 1, 0]
              }
            },
            other_cities: {
              $sum: {
                $cond: [
                  { $and: [
                    { $ne: ['$geographic_location.city', 'Dhaka'] },
                    { $ne: ['$geographic_location.city', 'Chittagong'] }
                  ]}, 1, 0
                ]
              }
            },
            mobile_users: {
              $sum: {
                $cond: [
                  { $in: ['mobile', '$devices.type'] }, 1, 0
                ]
              }
            },
            shopping_users: {
              $sum: {
                $cond: [
                  { $gt: ['$shopping_activity.cart_items', 0] }, 1, 0
                ]
              }
            }
          }
        }
      ]);

      return bangladeshStats[0] || {
        dhaka_users: 0,
        chittagong_users: 0,
        other_cities: 0,
        mobile_users: 0,
        shopping_users: 0
      };
    } catch (error) {
      console.error('Error getting Bangladesh user activity:', error);
      return {
        dhaka_users: 0,
        chittagong_users: 0,
        other_cities: 0,
        mobile_users: 0,
        shopping_users: 0
      };
    }
  }
}

export const presenceService = new PresenceService();