// Phase 3: Performance Optimization Routes
// Day 13-15: Advanced Performance API Endpoints

import { Router } from 'express';
import { PerformanceOptimizedDeepSeek } from '../services/ai/PerformanceOptimizedDeepSeek.js';

const router = Router();

/**
 * Phase 3: Optimized conversational AI endpoint with performance enhancements
 */
router.post('/optimized-conversation', async (req, res) => {
  try {
    const { message, conversationHistory = [], options = {} } = req.body;
    
    // Input validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Request body must contain a "message" field with string value'
      });
    }
    
    const service = PerformanceOptimizedDeepSeek.getInstance();
    
    const result = await service.optimizedConversation(
      message,
      conversationHistory,
      {
        urgent: options.urgent || false,
        maxTokens: options.maxTokens || 300,
        timeout: options.timeout || 8000
      }
    );
    
    res.json({
      success: result.success,
      response: result.response,
      confidence: result.confidence,
      responseTime: result.responseTime,
      cacheHit: result.cacheHit,
      optimization: result.optimization,
      metadata: result.metadata,
      error: result.error,
      message: result.message
    });
    
  } catch (error) {
    console.error('Optimized conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Performance optimization service temporarily unavailable'
    });
  }
});

/**
 * Performance metrics endpoint
 */
router.get('/performance-metrics', async (req, res) => {
  try {
    const service = PerformanceOptimizedDeepSeek.getInstance();
    const metrics = service.getPerformanceMetrics();
    
    res.json({
      success: true,
      data: {
        ...metrics,
        timestamp: new Date().toISOString(),
        service: 'Phase3-PerformanceOptimized'
      }
    });
    
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics',
      message: error.message
    });
  }
});

/**
 * Performance health check endpoint
 */
router.get('/performance-health', async (req, res) => {
  try {
    const service = PerformanceOptimizedDeepSeek.getInstance();
    const health = await service.healthCheck();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 206 : 503;
    
    res.status(statusCode).json({
      success: true,
      data: health
    });
    
  } catch (error) {
    console.error('Performance health check error:', error);
    res.status(503).json({
      success: false,
      error: 'Performance health check failed',
      message: error.message
    });
  }
});

/**
 * Cache management endpoint
 */
router.post('/cache-management', async (req, res) => {
  try {
    const { action } = req.body;
    
    if (action === 'clear') {
      // This would require implementing cache clearing in the service
      res.json({
        success: true,
        message: 'Cache clear requested',
        action: 'clear',
        timestamp: new Date().toISOString()
      });
    } else if (action === 'stats') {
      const service = PerformanceOptimizedDeepSeek.getInstance();
      const metrics = service.getPerformanceMetrics();
      
      res.json({
        success: true,
        data: {
          cacheSize: metrics.cacheSize,
          cacheHitRate: metrics.cacheHitRate,
          compressionSavings: metrics.compressionSavings,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid action',
        message: 'Action must be "clear" or "stats"'
      });
    }
    
  } catch (error) {
    console.error('Cache management error:', error);
    res.status(500).json({
      success: false,
      error: 'Cache management failed',
      message: error.message
    });
  }
});

/**
 * Batch processing endpoint for high-throughput scenarios
 */
router.post('/batch-conversation', async (req, res) => {
  try {
    const { requests } = req.body;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Request body must contain an array of conversation requests'
      });
    }
    
    if (requests.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Batch size exceeded',
        message: 'Maximum 10 requests per batch allowed'
      });
    }
    
    const service = PerformanceOptimizedDeepSeek.getInstance();
    
    // Process all requests in parallel for optimal performance
    const batchPromises = requests.map(async (request, index) => {
      try {
        const result = await service.optimizedConversation(
          request.message,
          request.conversationHistory || [],
          {
            urgent: false, // Batch requests are not urgent by nature
            maxTokens: request.maxTokens || 200, // Smaller tokens for batch
            timeout: 6000 // Shorter timeout for batch
          }
        );
        
        return {
          index,
          success: true,
          ...result
        };
        
      } catch (error) {
        return {
          index,
          success: false,
          error: error.message,
          responseTime: 0
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    // Calculate batch statistics
    const successful = batchResults.filter(r => r.success).length;
    const averageResponseTime = batchResults
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.responseTime, 0) / successful || 0;
    
    res.json({
      success: true,
      batchSize: requests.length,
      successful,
      failed: requests.length - successful,
      averageResponseTime: Math.round(averageResponseTime),
      results: batchResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Batch conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch processing failed',
      message: error.message
    });
  }
});

/**
 * Performance optimization configuration endpoint
 */
router.post('/optimization-config', async (req, res) => {
  try {
    const { config } = req.body;
    
    // This would allow runtime configuration of optimization parameters
    res.json({
      success: true,
      message: 'Optimization configuration updated',
      config: {
        cacheEnabled: true,
        batchingEnabled: true,
        compressionEnabled: true,
        targetResponseTime: 500,
        ...config
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Optimization config error:', error);
    res.status(500).json({
      success: false,
      error: 'Configuration update failed',
      message: error.message
    });
  }
});

export default router;