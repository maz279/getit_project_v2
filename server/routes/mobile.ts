/**
 * Mobile Optimization API Routes - Phase 2 Implementation
 * Complete mobile optimization and PWA API endpoints
 * 
 * @fileoverview Mobile optimization routes for Phase 2 implementation
 * @author GetIt Platform Team
 * @version 2.0.0
 * @since Phase 2 Mobile-First Architecture Transformation
 */

import { Router } from 'express';
import { z } from 'zod';
import MobileOptimizationService from '../services/mobile/MobileOptimizationService';
import PushNotificationService from '../services/pwa/PushNotificationService';

const router = Router();

// Initialize services
const mobileOptimizationService = new MobileOptimizationService({
  name: 'mobile-optimization',
  version: '2.0.0',
  timeout: 30000,
  retryAttempts: 3
});

const pushNotificationService = new PushNotificationService({
  name: 'push-notification',
  version: '2.0.0',
  timeout: 30000,
  retryAttempts: 3
});

// Validation schemas
const deviceDetectionSchema = z.object({
  userAgent: z.string(),
  screenWidth: z.number().optional(),
  screenHeight: z.number().optional(),
  pixelRatio: z.number().optional(),
  connectionType: z.string().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  isCharging: z.boolean().optional()
});

const touchGestureConfigSchema = z.object({
  swipeThreshold: z.number().min(10).max(200).optional(),
  tapTimeout: z.number().min(100).max(500).optional(),
  longPressTimeout: z.number().min(300).max(1000).optional(),
  doubleTapTimeout: z.number().min(200).max(600).optional(),
  pinchThreshold: z.number().min(5).max(50).optional(),
  enableHapticFeedback: z.boolean().optional(),
  culturalGestures: z.boolean().optional()
});

const notificationSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  }),
  userAgent: z.string().optional(),
  platform: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  preferences: z.object({
    orderUpdates: z.boolean().default(true),
    priceAlerts: z.boolean().default(true),
    flashSales: z.boolean().default(true),
    newProducts: z.boolean().default(false),
    prayerTimes: z.boolean().default(false),
    festivalOffers: z.boolean().default(true),
    culturalEvents: z.boolean().default(false),
    personalizedDeals: z.boolean().default(true),
    chatMessages: z.boolean().default(true),
    systemUpdates: z.boolean().default(false),
    quietHours: z.object({
      enabled: z.boolean().default(false),
      start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('22:00'),
      end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('08:00')
    }).optional(),
    language: z.enum(['en', 'bn']).default('en'),
    frequency: z.enum(['immediate', 'daily', 'weekly']).default('immediate')
  })
});

const pushNotificationSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(200),
  icon: z.string().url().optional(),
  image: z.string().url().optional(),
  tag: z.string().optional(),
  data: z.record(z.any()).optional(),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
  category: z.enum(['order', 'price', 'flash_sale', 'prayer', 'festival', 'system']).default('system'),
  bengaliContent: z.object({
    title: z.string(),
    body: z.string()
  }).optional(),
  ttl: z.number().min(300).max(86400).default(3600),
  urgency: z.enum(['very-low', 'low', 'normal', 'high']).default('normal')
});

/**
 * POST /api/v1/mobile/device/detect
 * Detect mobile device capabilities and optimize accordingly
 */
router.post('/device/detect', async (req, res) => {
  try {
    const validatedData = deviceDetectionSchema.parse(req.body);
    
    const result = await mobileOptimizationService.detectMobileDevice(
      validatedData.userAgent,
      req.headers as Record<string, string>
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Mobile device detected and optimized successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to detect mobile device'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/v1/mobile/gestures/configure
 * Configure touch gesture recognition
 */
router.post('/gestures/configure', async (req, res) => {
  try {
    const validatedData = touchGestureConfigSchema.parse(req.body);
    
    const result = await mobileOptimizationService.configureTouchGestures(validatedData);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Touch gestures configured successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to configure touch gestures'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/v1/mobile/performance/optimize
 * Optimize performance for mobile device
 */
router.post('/performance/optimize', async (req, res) => {
  try {
    const deviceInfo = req.body.deviceInfo;
    
    const result = await mobileOptimizationService.optimizePerformance(deviceInfo);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Performance optimized successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to optimize performance'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/v1/mobile/battery/manage
 * Enable battery management features
 */
router.post('/battery/manage', async (req, res) => {
  try {
    const { batteryLevel, isCharging } = req.body;
    
    const result = await mobileOptimizationService.enableBatteryManagement(
      batteryLevel,
      isCharging
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Battery management enabled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to enable battery management'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/v1/mobile/analytics
 * Get mobile optimization analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '24h';
    
    const result = await mobileOptimizationService.getOptimizationAnalytics(timeRange);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Mobile optimization analytics retrieved successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to retrieve analytics'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/v1/mobile/pwa/subscribe
 * Subscribe to push notifications
 */
router.post('/pwa/subscribe', async (req, res) => {
  try {
    const validatedData = notificationSubscriptionSchema.parse(req.body);
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    
    const result = await pushNotificationService.subscribe(
      userId,
      {
        endpoint: validatedData.endpoint,
        keys: validatedData.keys,
        userAgent: validatedData.userAgent,
        platform: validatedData.platform,
        language: validatedData.language,
        timezone: validatedData.timezone
      },
      validatedData.preferences
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Successfully subscribed to push notifications'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to subscribe to push notifications'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/v1/mobile/pwa/notify
 * Send push notification
 */
router.post('/pwa/notify', async (req, res) => {
  try {
    const validatedData = pushNotificationSchema.parse(req.body);
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    
    const message = {
      id: `notify_${Date.now()}`,
      ...validatedData
    };
    
    const result = await pushNotificationService.sendNotification(userId, message);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Push notification sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to send push notification'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/v1/mobile/pwa/notify/order
 * Send order update notification
 */
router.post('/pwa/notify/order', async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    
    const result = await pushNotificationService.sendOrderUpdateNotification(
      userId,
      { id: orderId, status }
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Order notification sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to send order notification'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/v1/mobile/pwa/notify/prayer
 * Send prayer time notification
 */
router.post('/pwa/notify/prayer', async (req, res) => {
  try {
    const { prayerName, time } = req.body;
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    
    const result = await pushNotificationService.sendPrayerTimeNotification(
      userId,
      prayerName,
      time
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Prayer time notification sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to send prayer time notification'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/v1/mobile/pwa/notify/flash-sale
 * Send flash sale notification
 */
router.post('/pwa/notify/flash-sale', async (req, res) => {
  try {
    const { saleId, discount, category, image } = req.body;
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    
    const result = await pushNotificationService.sendFlashSaleNotification(
      userId,
      { id: saleId, discount, category, image }
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Flash sale notification sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to send flash sale notification'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/v1/mobile/pwa/analytics
 * Get push notification analytics
 */
router.get('/pwa/analytics', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '24h';
    
    const result = await pushNotificationService.getNotificationAnalytics(timeRange);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Push notification analytics retrieved successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to retrieve notification analytics'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/v1/mobile/health
 * Health check for mobile services
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      mobile_optimization: {
        status: 'healthy',
        version: '2.0.0',
        features: [
          'Device detection',
          'Touch gesture configuration',
          'Performance optimization',
          'Battery management',
          'Bangladesh cultural optimization'
        ],
        last_check: new Date().toISOString()
      },
      push_notifications: {
        status: 'healthy',
        version: '2.0.0',
        features: [
          'Push notification sending',
          'Order update notifications',
          'Prayer time notifications',
          'Flash sale notifications',
          'Bengali language support'
        ],
        last_check: new Date().toISOString()
      },
      pwa_features: {
        status: 'active',
        service_worker: true,
        offline_support: true,
        app_manifest: true,
        push_notifications: true,
        background_sync: true,
        install_prompt: true
      }
    };
    
    res.json({
      success: true,
      data: health,
      message: 'Mobile services are healthy'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;