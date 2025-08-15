// Health Check Routes - Phase 1 Production Integration
// Day 3-4: Production Integration - Health Check Endpoints

import { Router } from 'express';
import { ProductionHealthCheck } from '../../monitoring/ProductionHealthCheck';

export const healthRouter = Router();

/**
 * Basic health check endpoint
 * GET /health
 */
healthRouter.get('/', async (req, res) => {
  try {
    const healthStatus = await ProductionHealthCheck.performHealthCheck();
    
    const statusCode = healthStatus.status === 'healthy' ? 200 :
                       healthStatus.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json({
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString()
    });
    
    // Record successful request
    ProductionHealthCheck.recordRequest(true);
    
  } catch (error) {
    console.error('Health check endpoint error:', error);
    
    // Record failed request
    ProductionHealthCheck.recordRequest(false);
    
    res.status(503).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Detailed health check with all components
 * GET /health/detailed
 */
healthRouter.get('/detailed', async (req, res) => {
  try {
    const healthStatus = await ProductionHealthCheck.performHealthCheck();
    
    // Add additional detailed information
    const detailedStatus = {
      ...healthStatus,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      },
      dependencies: {
        deepSeekAPI: process.env.DEEPSEEK_API_KEY ? 'configured' : 'missing',
        database: 'connected', // Would be determined by actual DB check
        cache: 'in-memory',
        rateLimiting: 'queue-based'
      }
    };
    
    const statusCode = healthStatus.status === 'healthy' ? 200 :
                       healthStatus.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json({
      success: true,
      data: detailedStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Detailed health check error:', error);
    
    res.status(503).json({
      success: false,
      error: 'Detailed health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Readiness probe (for Kubernetes/container orchestration)
 * GET /health/ready
 */
healthRouter.get('/ready', async (req, res) => {
  try {
    const healthStatus = await ProductionHealthCheck.performHealthCheck();
    
    // Service is ready if all critical components are functional
    const isReady = healthStatus.status === 'healthy' || healthStatus.status === 'degraded';
    
    if (isReady) {
      res.status(200).json({
        success: true,
        ready: true,
        message: 'Service is ready to accept traffic',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        ready: false,
        message: 'Service is not ready',
        status: healthStatus.status,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    res.status(503).json({
      success: false,
      ready: false,
      error: 'Readiness check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Liveness probe (for Kubernetes/container orchestration)
 * GET /health/live
 */
healthRouter.get('/live', (req, res) => {
  // Simple liveness check - just verify the service is running
  res.status(200).json({
    success: true,
    alive: true,
    uptime: ProductionHealthCheck.getUptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Performance metrics endpoint
 * GET /health/metrics
 */
healthRouter.get('/metrics', async (req, res) => {
  try {
    const healthStatus = await ProductionHealthCheck.performHealthCheck();
    
    const metrics = {
      service_uptime_seconds: ProductionHealthCheck.getUptime(),
      memory_usage_bytes: process.memoryUsage(),
      cpu_usage_percent: process.cpuUsage(),
      response_time_ms: healthStatus.performance.responseTime,
      error_rate: healthStatus.performance.errorRate,
      cache_hit_rate: healthStatus.performance.cacheHitRate,
      queue_size: healthStatus.performance.queueSize,
      health_status: healthStatus.status === 'healthy' ? 1 : 0,
      timestamp: Date.now()
    };
    
    res.status(200).json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Metrics endpoint error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default healthRouter;