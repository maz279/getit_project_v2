/**
 * PHASE 4: MOBILE & PERFORMANCE EXCELLENCE API ROUTES
 * Progressive Web App, Redis caching, and offline capabilities
 * Investment: $20,000 | Duration: 2-3 weeks
 * Date: July 26, 2025
 */

import { Router } from 'express';
import { z } from 'zod';
import { pwaOptimizer } from '../services/mobile-performance/PWAOptimizer';
import { redisCache } from '../services/mobile-performance/RedisPerformanceCache';
import { offlineManager } from '../services/mobile-performance/OfflineCapabilityManager';

const router = Router();

// Request validation schemas
const CacheRequestSchema = z.object({
  key: z.string().min(1),
  value: z.any().optional(),
  ttl: z.number().optional(),
  strategy: z.enum(['suggestions', 'results', 'products', 'categories', 'trending', 'recommendations']).optional()
});

const OfflineActionSchema = z.object({
  type: z.enum(['search', 'product_view', 'cart_add', 'cart_remove', 'wishlist_add', 'user_interaction', 'analytics_event']),
  action: z.string(),
  data: z.record(z.any()),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
});

const PerformanceMetricsSchema = z.object({
  url: z.string().url(),
  metrics: z.object({
    pageLoadTime: z.number(),
    firstContentfulPaint: z.number(),
    largestContentfulPaint: z.number(),
    cumulativeLayoutShift: z.number(),
    firstInputDelay: z.number(),
    timeToInteractive: z.number(),
    totalBlockingTime: z.number()
  })
});

// PWA Endpoints

/**
 * GET /api/phase4/pwa/manifest
 * Get PWA manifest for app installation
 */
router.get('/pwa/manifest', (req, res) => {
  try {
    const manifest = pwaOptimizer.generateManifest();
    
    res.setHeader('Content-Type', 'application/manifest+json');
    res.json(manifest);
    
    console.log('📱 PWA manifest served');
  } catch (error) {
    console.error('❌ Error serving PWA manifest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PWA manifest'
    });
  }
});

/**
 * GET /api/phase4/pwa/service-worker
 * Get service worker script for PWA functionality
 */
router.get('/pwa/service-worker', (req, res) => {
  try {
    const serviceWorker = pwaOptimizer.generateServiceWorker();
    
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(serviceWorker);
    
    console.log('🔧 Service worker script served');
  } catch (error) {
    console.error('❌ Error serving service worker:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate service worker'
    });
  }
});

/**
 * GET /api/phase4/pwa/offline-page
 * Get offline fallback page
 */
router.get('/pwa/offline-page', (req, res) => {
  try {
    const offlinePage = pwaOptimizer.generateOfflinePage();
    
    res.setHeader('Content-Type', 'text/html');
    res.send(offlinePage);
    
    console.log('📱 Offline page served');
  } catch (error) {
    console.error('❌ Error serving offline page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate offline page'
    });
  }
});

/**
 * GET /api/phase4/pwa/app-shell
 * Get app shell for fast initial load
 */
router.get('/pwa/app-shell', (req, res) => {
  try {
    const appShell = pwaOptimizer.generateAppShell();
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.send(appShell);
    
    console.log('🏗️ App shell served');
  } catch (error) {
    console.error('❌ Error serving app shell:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate app shell'
    });
  }
});

/**
 * GET /api/phase4/pwa/install-eligibility
 * Check PWA installation eligibility
 */
router.get('/pwa/install-eligibility', (req, res) => {
  try {
    const eligibility = pwaOptimizer.checkInstallEligibility();
    
    res.json({
      success: true,
      data: eligibility
    });
    
    console.log(`✅ PWA install eligibility checked: ${eligibility.eligible ? 'eligible' : 'not eligible'}`);
  } catch (error) {
    console.error('❌ Error checking PWA eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check PWA eligibility'
    });
  }
});

/**
 * GET /api/phase4/pwa/config
 * Get PWA configuration
 */
router.get('/pwa/config', (req, res) => {
  try {
    const config = pwaOptimizer.getPWAConfig();
    const touchConfig = pwaOptimizer.getTouchConfig();
    const serviceWorkerConfig = pwaOptimizer.getServiceWorkerConfig();
    
    res.json({
      success: true,
      data: {
        pwa: config,
        touch: touchConfig,
        serviceWorker: serviceWorkerConfig
      }
    });
    
    console.log('⚙️ PWA configuration served');
  } catch (error) {
    console.error('❌ Error serving PWA config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get PWA configuration'
    });
  }
});

// Redis Cache Endpoints

/**
 * GET /api/phase4/cache/health
 * Check Redis cache health
 */
router.get('/cache/health', async (req, res) => {
  try {
    const health = await redisCache.healthCheck();
    
    res.json({
      success: true,
      data: health
    });
    
    console.log(`🏥 Cache health check: ${health.connected ? 'healthy' : 'unhealthy'}`);
  } catch (error) {
    console.error('❌ Error checking cache health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check cache health'
    });
  }
});

/**
 * GET /api/phase4/cache/metrics
 * Get cache performance metrics
 */
router.get('/cache/metrics', async (req, res) => {
  try {
    const date = req.query.date as string;
    const metrics = redisCache.getCacheMetrics(date);
    
    res.json({
      success: true,
      data: metrics
    });
    
    console.log(`📊 Cache metrics served for date: ${date || 'today'}`);
  } catch (error) {
    console.error('❌ Error getting cache metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache metrics'
    });
  }
});

/**
 * POST /api/phase4/cache/set
 * Set value in cache
 */
router.post('/cache/set', async (req, res) => {
  try {
    const { key, value, ttl, strategy } = CacheRequestSchema.parse(req.body);
    
    const success = await redisCache.set(key, value, ttl, { 
      strategy: strategy as any,
      compress: true 
    });
    
    res.json({
      success: true,
      data: { cached: success }
    });
    
    console.log(`💾 Cache SET: ${key} (${success ? 'success' : 'failed'})`);
  } catch (error) {
    console.error('❌ Error setting cache:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Invalid request'
    });
  }
});

/**
 * GET /api/phase4/cache/get/:key
 * Get value from cache
 */
router.get('/cache/get/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await redisCache.get(key, { decompress: true });
    
    res.json({
      success: true,
      data: { 
        key,
        value,
        found: value !== null
      }
    });
    
    console.log(`📖 Cache GET: ${key} (${value !== null ? 'hit' : 'miss'})`);
  } catch (error) {
    console.error('❌ Error getting cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cached value'
    });
  }
});

/**
 * DELETE /api/phase4/cache/invalidate
 * Invalidate cache by pattern
 */
router.delete('/cache/invalidate', async (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern) {
      return res.status(400).json({
        success: false,
        error: 'Pattern is required'
      });
    }
    
    const deleted = await redisCache.invalidateByPattern(pattern);
    
    res.json({
      success: true,
      data: { deleted }
    });
    
    console.log(`🗑️ Cache invalidated: ${pattern} (${deleted} keys)`);
  } catch (error) {
    console.error('❌ Error invalidating cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to invalidate cache'
    });
  }
});

/**
 * POST /api/phase4/cache/search/suggestions
 * Cache search suggestions
 */
router.post('/cache/search/suggestions', async (req, res) => {
  try {
    const { query, suggestions, language = 'en' } = req.body;
    
    const success = await redisCache.cacheSearchSuggestions(query, suggestions, language);
    
    res.json({
      success: true,
      data: { cached: success }
    });
    
    console.log(`🔍 Cached search suggestions: "${query}" (${language})`);
  } catch (error) {
    console.error('❌ Error caching search suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cache search suggestions'
    });
  }
});

/**
 * GET /api/phase4/cache/search/suggestions
 * Get cached search suggestions
 */
router.get('/cache/search/suggestions', async (req, res) => {
  try {
    const { query, language = 'en' } = req.query as { query: string; language?: string };
    
    const suggestions = await redisCache.getCachedSearchSuggestions(query, language);
    
    res.json({
      success: true,
      data: {
        query,
        suggestions,
        cached: suggestions !== null
      }
    });
    
    console.log(`🔍 Retrieved cached suggestions: "${query}" (${suggestions ? 'hit' : 'miss'})`);
  } catch (error) {
    console.error('❌ Error getting cached suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cached suggestions'
    });
  }
});

// Offline Capability Endpoints

/**
 * GET /api/phase4/offline/status
 * Get offline sync status
 */
router.get('/offline/status', (req, res) => {
  try {
    const status = offlineManager.getSyncStatus();
    
    res.json({
      success: true,
      data: status
    });
    
    console.log(`📱 Offline status: ${status.isOnline ? 'online' : 'offline'} (${status.pendingItems} pending)`);
  } catch (error) {
    console.error('❌ Error getting offline status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get offline status'
    });
  }
});

/**
 * GET /api/phase4/offline/storage-stats
 * Get offline storage statistics
 */
router.get('/offline/storage-stats', (req, res) => {
  try {
    const stats = offlineManager.getOfflineStorageStats();
    
    res.json({
      success: true,
      data: stats
    });
    
    console.log(`📊 Offline storage stats: ${stats.estimatedSize.toFixed(2)}MB used`);
  } catch (error) {
    console.error('❌ Error getting storage stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get storage statistics'
    });
  }
});

/**
 * POST /api/phase4/offline/queue-action
 * Queue offline action for sync
 */
router.post('/offline/queue-action', async (req, res) => {
  try {
    const { type, action, data, priority } = OfflineActionSchema.parse(req.body);
    
    const id = await offlineManager.queueOfflineAction(type, action, data, priority);
    
    res.json({
      success: true,
      data: { id }
    });
    
    console.log(`📦 Queued offline action: ${type} - ${action} (${priority})`);
  } catch (error) {
    console.error('❌ Error queuing offline action:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Invalid request'
    });
  }
});

/**
 * POST /api/phase4/offline/store-search
 * Store search results for offline access
 */
router.post('/offline/store-search', async (req, res) => {
  try {
    const { query, results, language = 'en' } = req.body;
    
    await offlineManager.storeOfflineSearch(query, results, language);
    
    res.json({
      success: true,
      data: { stored: true }
    });
    
    console.log(`💾 Stored offline search: "${query}" (${results.length} results)`);
  } catch (error) {
    console.error('❌ Error storing offline search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store offline search'
    });
  }
});

/**
 * GET /api/phase4/offline/get-search
 * Get offline search results
 */
router.get('/offline/get-search', async (req, res) => {
  try {
    const { query, language = 'en' } = req.query as { query: string; language?: string };
    
    const results = await offlineManager.getOfflineSearch(query, language);
    
    res.json({
      success: true,
      data: {
        query,
        results,
        offline: results !== null
      }
    });
    
    console.log(`📖 Retrieved offline search: "${query}" (${results ? 'found' : 'not found'})`);
  } catch (error) {
    console.error('❌ Error getting offline search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get offline search'
    });
  }
});

/**
 * POST /api/phase4/offline/store-product
 * Store product for offline browsing
 */
router.post('/offline/store-product', async (req, res) => {
  try {
    const { productId, productData } = req.body;
    
    await offlineManager.storeOfflineProduct(productId, productData);
    
    res.json({
      success: true,
      data: { stored: true }
    });
    
    console.log(`💾 Stored offline product: ${productId}`);
  } catch (error) {
    console.error('❌ Error storing offline product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store offline product'
    });
  }
});

/**
 * GET /api/phase4/offline/get-product/:id
 * Get offline product data
 */
router.get('/offline/get-product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await offlineManager.getOfflineProduct(id);
    
    res.json({
      success: true,
      data: {
        productId: id,
        product,
        offline: product !== null
      }
    });
    
    console.log(`📖 Retrieved offline product: ${id} (${product ? 'found' : 'not found'})`);
  } catch (error) {
    console.error('❌ Error getting offline product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get offline product'
    });
  }
});

/**
 * POST /api/phase4/offline/cart-operation
 * Store offline cart operation
 */
router.post('/offline/cart-operation', async (req, res) => {
  try {
    const { operation, productId, data } = req.body;
    
    await offlineManager.storeOfflineCartOperation(operation, productId, data);
    
    res.json({
      success: true,
      data: { stored: true }
    });
    
    console.log(`🛒 Stored offline cart operation: ${operation} - ${productId}`);
  } catch (error) {
    console.error('❌ Error storing cart operation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store cart operation'
    });
  }
});

/**
 * GET /api/phase4/offline/cart
 * Get offline cart state
 */
router.get('/offline/cart', (req, res) => {
  try {
    const cart = offlineManager.getOfflineCart();
    
    res.json({
      success: true,
      data: { cart }
    });
    
    console.log(`🛒 Retrieved offline cart: ${cart.length} operations`);
  } catch (error) {
    console.error('❌ Error getting offline cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get offline cart'
    });
  }
});

/**
 * POST /api/phase4/offline/force-sync
 * Force synchronization of offline data
 */
router.post('/offline/force-sync', async (req, res) => {
  try {
    await offlineManager.forceSync();
    
    res.json({
      success: true,
      data: { synced: true }
    });
    
    console.log('🔄 Forced offline sync completed');
  } catch (error) {
    console.error('❌ Error forcing sync:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to force sync'
    });
  }
});

/**
 * DELETE /api/phase4/offline/clear-data
 * Clear offline data
 */
router.delete('/offline/clear-data', (req, res) => {
  try {
    const { type } = req.query as { type?: 'searches' | 'products' | 'cart' | 'all' };
    
    offlineManager.clearOfflineData(type);
    
    res.json({
      success: true,
      data: { cleared: type || 'all' }
    });
    
    console.log(`🗑️ Cleared offline data: ${type || 'all'}`);
  } catch (error) {
    console.error('❌ Error clearing offline data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear offline data'
    });
  }
});

// Performance Monitoring Endpoints

/**
 * POST /api/phase4/performance/measure
 * Submit performance metrics
 */
router.post('/performance/measure', async (req, res) => {
  try {
    const { url, metrics } = PerformanceMetricsSchema.parse(req.body);
    
    const result = await pwaOptimizer.measurePerformance(url);
    
    res.json({
      success: true,
      data: { measured: true, metrics: result }
    });
    
    console.log(`📊 Performance measured for: ${url}`);
  } catch (error) {
    console.error('❌ Error measuring performance:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Invalid request'
    });
  }
});

/**
 * GET /api/phase4/performance/metrics
 * Get performance metrics
 */
router.get('/performance/metrics', (req, res) => {
  try {
    const { url } = req.query as { url?: string };
    
    const metrics = pwaOptimizer.getPerformanceMetrics(url);
    
    res.json({
      success: true,
      data: { metrics }
    });
    
    console.log(`📊 Performance metrics retrieved${url ? ` for: ${url}` : ''}`);
  } catch (error) {
    console.error('❌ Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics'
    });
  }
});

// Health Check Endpoint

/**
 * GET /api/phase4/health
 * Get Phase 4 services health status
 */
router.get('/health', async (req, res) => {
  try {
    const [cacheHealth, offlineHealth] = await Promise.all([
      redisCache.healthCheck(),
      Promise.resolve(offlineManager.healthCheck())
    ]);

    const pwaEligibility = pwaOptimizer.checkInstallEligibility();

    const health = {
      status: 'healthy',
      services: {
        redis: {
          status: cacheHealth.connected ? 'healthy' : 'error',
          details: cacheHealth
        },
        offline: {
          status: offlineHealth.status,
          details: offlineHealth.details
        },
        pwa: {
          status: pwaEligibility.eligible ? 'healthy' : 'degraded',
          details: pwaEligibility
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: health
    });
    
    console.log('🏥 Phase 4 health check completed');
  } catch (error) {
    console.error('❌ Error in health check:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

export default router;