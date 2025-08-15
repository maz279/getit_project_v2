/**
 * Presence Controller - User Presence Management
 * Amazon.com/Shopee.sg-Level real-time user presence tracking
 */

import { Router, Request, Response } from 'express';
import { createClient } from 'redis';

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentPage: string;
  shoppingActivity: {
    viewingProduct?: string;
    cartItems: number;
    inCheckout: boolean;
    wishlistItems: number;
  };
  deviceCount: number;
  location: string;
  sessionInfo: {
    browser: string;
    os: string;
    country: string;
    city: string;
  };
}

export class PresenceController {
  private router = Router();
  private redis = createClient();

  constructor() {
    this.initializeRoutes();
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      await this.redis.connect();
      console.log('✅ Redis connected for Presence controller');
    } catch (error) {
      console.warn('⚠️ Redis connection failed for Presence:', error.message);
    }
  }

  private initializeRoutes() {
    // Update user presence
    this.router.put('/presence/:userId?', this.updatePresence.bind(this));
    
    // Get user presence
    this.router.get('/presence/:userId', this.getUserPresence.bind(this));
    
    // Get multiple users presence
    this.router.post('/presence/bulk', this.getBulkPresence.bind(this));
    
    // Get online users count
    this.router.get('/online-users', this.getOnlineUsers.bind(this));
    
    // Get online users by location
    this.router.get('/online-users/location/:location', this.getOnlineUsersByLocation.bind(this));
    
    // Set user away status
    this.router.post('/presence/:userId/away', this.setUserAway.bind(this));
    
    // Set user busy status
    this.router.post('/presence/:userId/busy', this.setUserBusy.bind(this));
    
    // Set user offline
    this.router.post('/presence/:userId/offline', this.setUserOffline.bind(this));
    
    // Update shopping activity
    this.router.put('/presence/:userId/activity', this.updateShoppingActivity.bind(this));
    
    // Get presence analytics
    this.router.get('/analytics/presence', this.getPresenceAnalytics.bind(this));
    
    // Bangladesh-specific presence features
    this.router.get('/bangladesh/online-users', this.getBangladeshOnlineUsers.bind(this));
    this.router.get('/bangladesh/city-presence/:city', this.getCityPresence.bind(this));
    
    // Health check
    this.router.get('/health', this.healthCheck.bind(this));
  }

  private async updatePresence(req: Request, res: Response) {
    try {
      const userId = req.params.userId || req.body.userId;
      const { status, currentPage, activity, sessionInfo } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const presence: UserPresence = {
        userId,
        status: status || 'online',
        lastSeen: new Date(),
        currentPage: currentPage || '/',
        shoppingActivity: {
          viewingProduct: activity?.viewingProduct,
          cartItems: activity?.cartItems || 0,
          inCheckout: activity?.inCheckout || false,
          wishlistItems: activity?.wishlistItems || 0
        },
        deviceCount: await this.getDeviceCount(userId),
        location: this.determineLocation(currentPage),
        sessionInfo: {
          browser: sessionInfo?.browser || 'Unknown',
          os: sessionInfo?.os || 'Unknown',
          country: sessionInfo?.country || 'BD',
          city: sessionInfo?.city || 'Dhaka'
        }
      };

      // Store in Redis
      await this.redis.hSet(`user_presence:${userId}`, {
        status: presence.status,
        lastSeen: presence.lastSeen.toISOString(),
        currentPage: presence.currentPage,
        shoppingActivity: JSON.stringify(presence.shoppingActivity),
        deviceCount: presence.deviceCount.toString(),
        location: presence.location,
        sessionInfo: JSON.stringify(presence.sessionInfo)
      });

      // Add to online users set if online
      if (status === 'online') {
        await this.redis.sAdd('online_users', userId);
        await this.redis.sAdd(`online_users:${presence.sessionInfo.country}`, userId);
        await this.redis.sAdd(`online_users:${presence.sessionInfo.city}`, userId);
      } else {
        await this.redis.sRem('online_users', userId);
      }

      // Set expiration for automatic cleanup
      await this.redis.expire(`user_presence:${userId}`, 3600); // 1 hour

      res.json({
        success: true,
        message: 'Presence updated successfully',
        data: presence
      });
    } catch (error) {
      console.error('❌ Error updating presence:', error);
      res.status(500).json({ error: 'Failed to update presence' });
    }
  }

  private async getUserPresence(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const presenceData = await this.redis.hGetAll(`user_presence:${userId}`);

      if (!presenceData || Object.keys(presenceData).length === 0) {
        return res.status(404).json({ error: 'User presence not found' });
      }

      const presence: UserPresence = {
        userId,
        status: presenceData.status as any,
        lastSeen: new Date(presenceData.lastSeen),
        currentPage: presenceData.currentPage,
        shoppingActivity: JSON.parse(presenceData.shoppingActivity || '{}'),
        deviceCount: parseInt(presenceData.deviceCount || '0'),
        location: presenceData.location,
        sessionInfo: JSON.parse(presenceData.sessionInfo || '{}')
      };

      res.json({
        success: true,
        data: presence
      });
    } catch (error) {
      console.error('❌ Error getting user presence:', error);
      res.status(500).json({ error: 'Failed to get user presence' });
    }
  }

  private async getBulkPresence(req: Request, res: Response) {
    try {
      const { userIds } = req.body;

      if (!Array.isArray(userIds)) {
        return res.status(400).json({ error: 'userIds must be an array' });
      }

      const presencePromises = userIds.map(async (userId) => {
        try {
          const presenceData = await this.redis.hGetAll(`user_presence:${userId}`);
          if (presenceData && Object.keys(presenceData).length > 0) {
            return {
              userId,
              status: presenceData.status,
              lastSeen: presenceData.lastSeen,
              currentPage: presenceData.currentPage,
              location: presenceData.location
            };
          }
          return { userId, status: 'offline' };
        } catch (error) {
          return { userId, status: 'offline' };
        }
      });

      const presences = await Promise.all(presencePromises);

      res.json({
        success: true,
        data: presences
      });
    } catch (error) {
      console.error('❌ Error getting bulk presence:', error);
      res.status(500).json({ error: 'Failed to get bulk presence' });
    }
  }

  private async getOnlineUsers(req: Request, res: Response) {
    try {
      const totalOnline = await this.redis.sCard('online_users');
      const byCountry = await this.getOnlineUsersByCountry();
      const byLocation = await this.getOnlineUsersByPages();

      res.json({
        success: true,
        data: {
          totalOnline,
          byCountry,
          byLocation,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Error getting online users:', error);
      res.status(500).json({ error: 'Failed to get online users' });
    }
  }

  private async getOnlineUsersByLocation(req: Request, res: Response) {
    try {
      const { location } = req.params;
      const onlineUsers = await this.redis.sMembers('online_users');
      
      const usersInLocation = [];
      for (const userId of onlineUsers) {
        const presenceData = await this.redis.hGet(`user_presence:${userId}`, 'location');
        if (presenceData === location) {
          usersInLocation.push(userId);
        }
      }

      res.json({
        success: true,
        data: {
          location,
          userCount: usersInLocation.length,
          users: usersInLocation
        }
      });
    } catch (error) {
      console.error('❌ Error getting users by location:', error);
      res.status(500).json({ error: 'Failed to get users by location' });
    }
  }

  private async setUserAway(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await this.updateUserStatus(userId, 'away');
      res.json({ success: true, message: 'User set to away' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to set user away' });
    }
  }

  private async setUserBusy(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await this.updateUserStatus(userId, 'busy');
      res.json({ success: true, message: 'User set to busy' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to set user busy' });
    }
  }

  private async setUserOffline(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await this.updateUserStatus(userId, 'offline');
      await this.redis.sRem('online_users', userId);
      res.json({ success: true, message: 'User set to offline' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to set user offline' });
    }
  }

  private async updateShoppingActivity(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { viewingProduct, cartItems, inCheckout, wishlistItems } = req.body;

      const activity = {
        viewingProduct,
        cartItems: cartItems || 0,
        inCheckout: inCheckout || false,
        wishlistItems: wishlistItems || 0
      };

      await this.redis.hSet(`user_presence:${userId}`, {
        shoppingActivity: JSON.stringify(activity),
        lastSeen: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Shopping activity updated',
        data: activity
      });
    } catch (error) {
      console.error('❌ Error updating shopping activity:', error);
      res.status(500).json({ error: 'Failed to update shopping activity' });
    }
  }

  private async getPresenceAnalytics(req: Request, res: Response) {
    try {
      const totalOnline = await this.redis.sCard('online_users');
      const onlineUsers = await this.redis.sMembers('online_users');
      
      const statusDistribution = { online: 0, away: 0, busy: 0, offline: 0 };
      const locationDistribution: Record<string, number> = {};
      const pageDistribution: Record<string, number> = {};
      const activityData = { totalViewingProducts: 0, totalInCheckout: 0, avgCartItems: 0 };

      let totalCartItems = 0;
      let viewingProductCount = 0;
      let inCheckoutCount = 0;

      for (const userId of onlineUsers) {
        const presenceData = await this.redis.hGetAll(`user_presence:${userId}`);
        if (presenceData) {
          // Status distribution
          statusDistribution[presenceData.status as keyof typeof statusDistribution]++;
          
          // Location distribution
          const location = presenceData.location || 'unknown';
          locationDistribution[location] = (locationDistribution[location] || 0) + 1;
          
          // Page distribution
          const page = presenceData.currentPage || 'unknown';
          pageDistribution[page] = (pageDistribution[page] || 0) + 1;
          
          // Activity data
          try {
            const activity = JSON.parse(presenceData.shoppingActivity || '{}');
            if (activity.viewingProduct) viewingProductCount++;
            if (activity.inCheckout) inCheckoutCount++;
            totalCartItems += activity.cartItems || 0;
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }

      activityData.totalViewingProducts = viewingProductCount;
      activityData.totalInCheckout = inCheckoutCount;
      activityData.avgCartItems = onlineUsers.length > 0 ? totalCartItems / onlineUsers.length : 0;

      res.json({
        success: true,
        data: {
          totalOnline,
          statusDistribution,
          locationDistribution,
          pageDistribution,
          activityData,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Error getting presence analytics:', error);
      res.status(500).json({ error: 'Failed to get presence analytics' });
    }
  }

  private async getBangladeshOnlineUsers(req: Request, res: Response) {
    try {
      const bangladeshUsers = await this.redis.sCard('online_users:BD');
      const cityBreakdown = {
        Dhaka: await this.redis.sCard('online_users:Dhaka'),
        Chittagong: await this.redis.sCard('online_users:Chittagong'),
        Sylhet: await this.redis.sCard('online_users:Sylhet'),
        Rajshahi: await this.redis.sCard('online_users:Rajshahi'),
        Khulna: await this.redis.sCard('online_users:Khulna'),
        Barisal: await this.redis.sCard('online_users:Barisal'),
        Rangpur: await this.redis.sCard('online_users:Rangpur'),
        Mymensingh: await this.redis.sCard('online_users:Mymensingh')
      };

      res.json({
        success: true,
        data: {
          totalBangladeshUsers: bangladeshUsers,
          cityBreakdown,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Error getting Bangladesh online users:', error);
      res.status(500).json({ error: 'Failed to get Bangladesh online users' });
    }
  }

  private async getCityPresence(req: Request, res: Response) {
    try {
      const { city } = req.params;
      const cityUsers = await this.redis.sMembers(`online_users:${city}`);
      
      const userPresences = [];
      for (const userId of cityUsers) {
        const presenceData = await this.redis.hGetAll(`user_presence:${userId}`);
        if (presenceData) {
          userPresences.push({
            userId,
            status: presenceData.status,
            currentPage: presenceData.currentPage,
            lastSeen: presenceData.lastSeen
          });
        }
      }

      res.json({
        success: true,
        data: {
          city,
          totalUsers: cityUsers.length,
          users: userPresences
        }
      });
    } catch (error) {
      console.error('❌ Error getting city presence:', error);
      res.status(500).json({ error: 'Failed to get city presence' });
    }
  }

  private async healthCheck(req: Request, res: Response) {
    try {
      const totalOnline = await this.redis.sCard('online_users');
      
      res.json({
        service: 'presence-controller',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics: {
          totalOnlineUsers: totalOnline,
          redisConnected: this.redis.isReady
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Health check failed' });
    }
  }

  // Helper methods

  private async getDeviceCount(userId: string): Promise<number> {
    try {
      return await this.redis.sCard(`user_sockets:${userId}`);
    } catch (error) {
      return 1;
    }
  }

  private determineLocation(currentPage: string): string {
    if (currentPage.includes('/product/')) return 'product_page';
    if (currentPage.includes('/cart')) return 'cart';
    if (currentPage.includes('/checkout')) return 'checkout';
    if (currentPage.includes('/orders')) return 'orders';
    if (currentPage.includes('/vendor/')) return 'vendor_page';
    if (currentPage === '/') return 'home';
    return 'other';
  }

  private async updateUserStatus(userId: string, status: 'online' | 'away' | 'busy' | 'offline') {
    await this.redis.hSet(`user_presence:${userId}`, {
      status,
      lastSeen: new Date().toISOString()
    });
  }

  private async getOnlineUsersByCountry(): Promise<Record<string, number>> {
    const countries = ['BD', 'IN', 'US', 'UK'];
    const result: Record<string, number> = {};
    
    for (const country of countries) {
      result[country] = await this.redis.sCard(`online_users:${country}`);
    }
    
    return result;
  }

  private async getOnlineUsersByPages(): Promise<Record<string, number>> {
    const onlineUsers = await this.redis.sMembers('online_users');
    const pageDistribution: Record<string, number> = {};
    
    for (const userId of onlineUsers) {
      const location = await this.redis.hGet(`user_presence:${userId}`, 'location');
      if (location) {
        pageDistribution[location] = (pageDistribution[location] || 0) + 1;
      }
    }
    
    return pageDistribution;
  }

  getRouter() {
    return this.router;
  }
}