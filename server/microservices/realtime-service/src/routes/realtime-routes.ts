/**
 * Real-time Service Routes
 * Amazon.com/Shopee.sg-Level API endpoints for real-time functionality
 */

import { Router } from 'express';
import { NotificationController } from '../controllers/notification-controller';
import { AdminController } from '../controllers/admin-controller';
import { presenceService } from '../services/presence-service';
import { realtimeRedisService } from '../services/redis-service';
import { realTimeRateLimiter } from '../middleware/rate-limiting';

const router = Router();

// Initialize controllers
const notificationController = new NotificationController();
const adminController = new AdminController();

// Middleware for API rate limiting
const apiRateLimit = (req: any, res: any, next: any) => {
  // Extract user ID from auth token or use IP
  const userId = req.user?.id || req.ip;
  
  // Create a simple rate limiter for API endpoints
  realTimeRateLimiter.getRateLimitStatus(userId, 'api_request')
    .then(status => {
      if (status && !status.allowed) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: status.resetTime
        });
      }
      next();
    })
    .catch(() => next()); // Continue if rate limiting fails
};

// Apply rate limiting to all routes
router.use(apiRateLimit);

// ===== NOTIFICATION ROUTES =====
router.post('/notifications/send', notificationController.sendNotification);
router.get('/notifications/user/:user_id', notificationController.getUserNotifications);
router.put('/notifications/:notification_id/read', notificationController.markAsRead);
router.put('/notifications/:notification_id/clicked', notificationController.markAsClicked);
router.post('/notifications/bulk', notificationController.bulkSendNotifications);
router.get('/notifications/analytics', notificationController.getNotificationAnalytics);
router.delete('/notifications/cleanup', notificationController.cleanupOldNotifications);

// ===== PRESENCE ROUTES =====
router.put('/presence', async (req, res) => {
  try {
    const presenceData = req.body;
    const result = await presenceService.updatePresence(presenceData);
    res.json({ success: true, presence: result });
  } catch (error) {
    console.error('Error updating presence:', error);
    res.status(500).json({ error: 'Failed to update presence' });
  }
});

router.get('/presence/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const presence = await presenceService.getUserPresence(user_id);
    
    if (!presence) {
      res.status(404).json({ error: 'User presence not found' });
      return;
    }
    
    res.json({ success: true, presence });
  } catch (error) {
    console.error('Error getting user presence:', error);
    res.status(500).json({ error: 'Failed to get user presence' });
  }
});

router.get('/presence/online/users', async (req, res) => {
  try {
    const onlineUsers = await presenceService.getOnlineUsers();
    res.json({ success: true, online_users: onlineUsers });
  } catch (error) {
    console.error('Error getting online users:', error);
    res.status(500).json({ error: 'Failed to get online users' });
  }
});

router.get('/presence/location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const users = await presenceService.getPresenceByLocation(location);
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error getting users by location:', error);
    res.status(500).json({ error: 'Failed to get users by location' });
  }
});

router.get('/presence/statistics', async (req, res) => {
  try {
    const stats = await presenceService.getPresenceStatistics();
    res.json({ success: true, statistics: stats });
  } catch (error) {
    console.error('Error getting presence statistics:', error);
    res.status(500).json({ error: 'Failed to get presence statistics' });
  }
});

router.post('/presence/:user_id/offline', async (req, res) => {
  try {
    const { user_id } = req.params;
    await presenceService.setUserOffline(user_id);
    res.json({ success: true, message: 'User set to offline' });
  } catch (error) {
    console.error('Error setting user offline:', error);
    res.status(500).json({ error: 'Failed to set user offline' });
  }
});

// ===== CONNECTION MANAGEMENT ROUTES =====
router.get('/connections', async (req, res) => {
  try {
    const stats = await realtimeRedisService.getConnectionStats();
    res.json({ success: true, connections: stats });
  } catch (error) {
    console.error('Error getting connection stats:', error);
    res.status(500).json({ error: 'Failed to get connection statistics' });
  }
});

router.get('/connections/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const connections = await realtimeRedisService.getUserConnections(user_id);
    const connectionCount = await realtimeRedisService.getUserConnectionCount(user_id);
    
    res.json({ 
      success: true, 
      user_id,
      connections,
      connection_count: connectionCount
    });
  } catch (error) {
    console.error('Error getting user connections:', error);
    res.status(500).json({ error: 'Failed to get user connections' });
  }
});

// ===== CHANNEL MANAGEMENT ROUTES =====
router.get('/channels/:channel/subscribers', async (req, res) => {
  try {
    const { channel } = req.params;
    const subscribers = await realtimeRedisService.getChannelSubscribers(channel);
    const count = await realtimeRedisService.getChannelSubscriberCount(channel);
    
    res.json({ 
      success: true, 
      channel,
      subscribers,
      subscriber_count: count
    });
  } catch (error) {
    console.error('Error getting channel subscribers:', error);
    res.status(500).json({ error: 'Failed to get channel subscribers' });
  }
});

// ===== REAL-TIME STATISTICS ROUTES =====
router.get('/stats', async (req, res) => {
  try {
    const stats = await realtimeRedisService.getRealtimeStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting real-time stats:', error);
    res.status(500).json({ error: 'Failed to get real-time statistics' });
  }
});

router.put('/stats', async (req, res) => {
  try {
    const statsUpdate = req.body;
    await realtimeRedisService.updateRealtimeStats(statsUpdate);
    res.json({ success: true, message: 'Statistics updated' });
  } catch (error) {
    console.error('Error updating real-time stats:', error);
    res.status(500).json({ error: 'Failed to update statistics' });
  }
});

// ===== BANGLADESH-SPECIFIC ROUTES =====
router.get('/bangladesh/network/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const networkQuality = await realtimeRedisService.getBangladeshNetworkQuality(user_id);
    res.json({ success: true, user_id, network_quality: networkQuality });
  } catch (error) {
    console.error('Error getting Bangladesh network quality:', error);
    res.status(500).json({ error: 'Failed to get network quality' });
  }
});

router.put('/bangladesh/network/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const networkData = req.body;
    
    await realtimeRedisService.updateBangladeshNetworkQuality(user_id, networkData);
    res.json({ success: true, message: 'Network quality updated' });
  } catch (error) {
    console.error('Error updating Bangladesh network quality:', error);
    res.status(500).json({ error: 'Failed to update network quality' });
  }
});

router.get('/bangladesh/users/activity', async (req, res) => {
  try {
    const activity = await presenceService.getBangladeshUserActivity();
    res.json({ success: true, bangladesh_activity: activity });
  } catch (error) {
    console.error('Error getting Bangladesh user activity:', error);
    res.status(500).json({ error: 'Failed to get Bangladesh user activity' });
  }
});

// ===== OFFLINE MESSAGE ROUTES =====
router.get('/offline/:user_id/messages', async (req, res) => {
  try {
    const { user_id } = req.params;
    const messages = await realtimeRedisService.getOfflineMessages(user_id);
    const count = await realtimeRedisService.getOfflineMessageCount(user_id);
    
    res.json({ 
      success: true, 
      user_id,
      messages,
      message_count: count
    });
  } catch (error) {
    console.error('Error getting offline messages:', error);
    res.status(500).json({ error: 'Failed to get offline messages' });
  }
});

router.post('/offline/:user_id/queue', async (req, res) => {
  try {
    const { user_id } = req.params;
    const message = req.body;
    
    await realtimeRedisService.queueOfflineMessage(user_id, message);
    res.json({ success: true, message: 'Message queued for offline user' });
  } catch (error) {
    console.error('Error queuing offline message:', error);
    res.status(500).json({ error: 'Failed to queue offline message' });
  }
});

// ===== RATE LIMITING ROUTES =====
router.get('/rate-limit/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { action } = req.query;
    
    const status = await realTimeRateLimiter.getRateLimitStatus(user_id, action as string);
    res.json({ success: true, user_id, rate_limit_status: status });
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    res.status(500).json({ error: 'Failed to get rate limit status' });
  }
});

router.post('/rate-limit/:user_id/reset', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    await realTimeRateLimiter.resetUserRateLimits(user_id);
    res.json({ success: true, message: 'Rate limits reset for user' });
  } catch (error) {
    console.error('Error resetting rate limits:', error);
    res.status(500).json({ error: 'Failed to reset rate limits' });
  }
});

// ===== ADMIN ROUTES =====
router.get('/admin/dashboard', adminController.getDashboardStats);
router.get('/admin/connections', adminController.getActiveConnections);
router.get('/admin/events', adminController.getEventLogs);
router.get('/admin/performance', adminController.getPerformanceMetrics);
router.post('/admin/broadcast', adminController.broadcastAdminMessage);
router.post('/admin/disconnect/:user_id', adminController.forceDisconnectUser);

// ===== EVENT BROADCASTING ROUTES =====
router.post('/events/broadcast', async (req, res) => {
  try {
    const { channel, event_type, data, priority = 'medium' } = req.body;
    
    if (!channel || !event_type || !data) {
      res.status(400).json({ error: 'Channel, event_type, and data are required' });
      return;
    }

    // Get WebSocket service instance
    const io = (global as any).io;
    if (!io) {
      res.status(500).json({ error: 'WebSocket service not available' });
      return;
    }

    // Broadcast to channel
    io.to(channel).emit(event_type, {
      ...data,
      timestamp: new Date(),
      priority
    });

    res.json({ 
      success: true, 
      message: 'Event broadcasted',
      channel,
      event_type
    });
  } catch (error) {
    console.error('Error broadcasting event:', error);
    res.status(500).json({ error: 'Failed to broadcast event' });
  }
});

router.post('/events/send', async (req, res) => {
  try {
    const { user_id, event_type, data } = req.body;
    
    if (!user_id || !event_type || !data) {
      res.status(400).json({ error: 'user_id, event_type, and data are required' });
      return;
    }

    // Get user connections
    const connections = await realtimeRedisService.getUserConnections(user_id);
    const io = (global as any).io;

    if (connections.length === 0 || !io) {
      res.status(404).json({ error: 'User not connected or WebSocket service unavailable' });
      return;
    }

    // Send to all user connections
    connections.forEach(socketId => {
      io.to(socketId).emit(event_type, {
        ...data,
        timestamp: new Date()
      });
    });

    res.json({ 
      success: true, 
      message: 'Event sent to user',
      user_id,
      connections_notified: connections.length
    });
  } catch (error) {
    console.error('Error sending event:', error);
    res.status(500).json({ error: 'Failed to send event' });
  }
});

// ===== HEALTH CHECK ROUTES =====
router.get('/health', async (req, res) => {
  try {
    const connectionStats = await realtimeRedisService.getConnectionStats();
    const realtimeStats = await realtimeRedisService.getRealtimeStats();
    
    res.json({
      service: 'realtime-service-complete',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '2.0.0',
      features: {
        websocket: true,
        notifications: true,
        presence: true,
        chat: true,
        bangladesh_optimization: true,
        rate_limiting: true,
        admin_management: true
      },
      statistics: {
        total_connections: connectionStats.total_connections || 0,
        online_users: connectionStats.online_users || 0,
        messages_per_second: realtimeStats.messages_per_second || 0,
        average_latency: realtimeStats.average_latency || 0
      },
      memory: process.memoryUsage()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      service: 'realtime-service-complete',
      status: 'unhealthy',
      error: error.message
    });
  }
});

router.get('/info', (req, res) => {
  res.json({
    service: 'realtime-service-complete',
    version: '2.0.0',
    description: 'Amazon.com/Shopee.sg-Level Real-time Service',
    features: [
      'WebSocket Management',
      'Real-time Notifications',
      'User Presence Tracking',
      'Live Chat System',
      'Event Broadcasting',
      'Bangladesh Optimization',
      'Rate Limiting',
      'Admin Management',
      'Offline Synchronization',
      'Multi-language Support'
    ],
    endpoints: {
      websocket: 'ws://localhost:5000/realtime',
      api: '/api/v1/realtime/*'
    },
    bangladesh_features: [
      'Bengali Language Support',
      'Mobile Network Optimization',
      'Cultural Context Integration',
      'Prayer Time Awareness',
      'Festival Notifications',
      'Mobile Banking Integration'
    ]
  });
});

export { router as realtimeRoutes };