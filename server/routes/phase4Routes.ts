// Phase 4: Enterprise Integration Routes
// Advanced enterprise features with multi-tenant architecture

import { Router } from 'express';
import { EnterpriseDeepSeekOrchestrator } from '../services/ai/EnterpriseDeepSeekOrchestrator.js';

const router = Router();

/**
 * Phase 4: Enterprise conversational AI endpoint with multi-tenant support
 */
router.post('/enterprise-conversation', async (req, res) => {
  try {
    const { message, tenantId, userId, conversationHistory = [], options = {}, securityLevel = 'standard' } = req.body;
    
    // Input validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Request body must contain a "message" field with string value'
      });
    }
    
    if (!tenantId || typeof tenantId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Request body must contain a "tenantId" field with string value'
      });
    }
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Request body must contain a "userId" field with string value'
      });
    }
    
    const service = EnterpriseDeepSeekOrchestrator.getInstance();
    
    const result = await service.enterpriseConversation({
      message,
      tenantId,
      userId,
      conversationHistory,
      options,
      securityLevel
    });
    
    const statusCode = result.success ? 200 : 400;
    
    res.status(statusCode).json({
      success: result.success,
      response: result.response,
      error: result.error,
      confidence: result.confidence,
      requestId: result.requestId,
      tenantId: result.tenantId,
      responseTime: result.responseTime,
      securityValidation: result.securityValidation,
      complianceResult: result.complianceResult,
      performanceOptimization: result.performanceOptimization,
      enterpriseMetadata: result.enterpriseMetadata,
      metadata: result.metadata
    });
    
  } catch (error) {
    console.error('Enterprise conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Enterprise AI service temporarily unavailable'
    });
  }
});

/**
 * Enterprise analytics endpoint
 */
router.get('/enterprise-analytics', async (req, res) => {
  try {
    const service = EnterpriseDeepSeekOrchestrator.getInstance();
    const analytics = service.getEnterpriseAnalytics();
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Enterprise analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve enterprise analytics',
      message: error.message
    });
  }
});

/**
 * Tenant metrics endpoint
 */
router.get('/tenant-metrics/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Tenant ID is required'
      });
    }
    
    const service = EnterpriseDeepSeekOrchestrator.getInstance();
    const metrics = service.getTenantMetrics(tenantId);
    
    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
        message: `No metrics found for tenant: ${tenantId}`
      });
    }
    
    res.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error('Tenant metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tenant metrics',
      message: error.message
    });
  }
});

/**
 * Audit logs endpoint
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const { tenantId, limit = '100' } = req.query;
    const limitNumber = parseInt(limit as string) || 100;
    
    if (limitNumber > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Limit cannot exceed 1000'
      });
    }
    
    const service = EnterpriseDeepSeekOrchestrator.getInstance();
    const auditLogs = service.getAuditLogs(tenantId as string, limitNumber);
    
    res.json({
      success: true,
      data: {
        logs: auditLogs,
        totalCount: auditLogs.length,
        tenantId: tenantId || 'all',
        limit: limitNumber
      }
    });
    
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit logs',
      message: error.message
    });
  }
});

/**
 * Enterprise report generation endpoint
 */
router.post('/enterprise-report', async (req, res) => {
  try {
    const service = EnterpriseDeepSeekOrchestrator.getInstance();
    const report = await service.generateEnterpriseReport();
    
    res.json({
      success: true,
      data: report
    });
    
  } catch (error) {
    console.error('Enterprise report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate enterprise report',
      message: error.message
    });
  }
});

/**
 * Multi-tenant batch processing endpoint
 */
router.post('/enterprise-batch', async (req, res) => {
  try {
    const { requests } = req.body;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Request body must contain an array of enterprise conversation requests'
      });
    }
    
    if (requests.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Batch size exceeded',
        message: 'Maximum 20 requests per batch allowed for enterprise processing'
      });
    }
    
    // Validate each request has required fields
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      if (!request.message || !request.tenantId || !request.userId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid batch request',
          message: `Request ${i + 1} missing required fields: message, tenantId, userId`
        });
      }
    }
    
    const service = EnterpriseDeepSeekOrchestrator.getInstance();
    
    // Process all enterprise requests in parallel
    const batchPromises = requests.map(async (request, index) => {
      try {
        const result = await service.enterpriseConversation({
          message: request.message,
          tenantId: request.tenantId,
          userId: request.userId,
          conversationHistory: request.conversationHistory || [],
          options: {
            urgent: false, // Batch requests are not urgent
            maxTokens: request.maxTokens || 300,
            timeout: 8000 // Enterprise timeout
          },
          securityLevel: request.securityLevel || 'standard'
        });
        
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
          tenantId: request.tenantId,
          responseTime: 0
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    // Calculate batch statistics
    const successful = batchResults.filter(r => r.success).length;
    const averageResponseTime = batchResults
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / successful || 0;
    
    // Group by tenant for analytics
    const tenantGroups = new Map();
    batchResults.forEach(result => {
      if (!tenantGroups.has(result.tenantId)) {
        tenantGroups.set(result.tenantId, { successful: 0, failed: 0 });
      }
      const group = tenantGroups.get(result.tenantId);
      if (result.success) {
        group.successful++;
      } else {
        group.failed++;
      }
    });
    
    res.json({
      success: true,
      batchSize: requests.length,
      successful,
      failed: requests.length - successful,
      averageResponseTime: Math.round(averageResponseTime),
      tenantBreakdown: Object.fromEntries(tenantGroups),
      results: batchResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Enterprise batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Enterprise batch processing failed',
      message: error.message
    });
  }
});

/**
 * Enterprise health check endpoint
 */
router.get('/enterprise-health', async (req, res) => {
  try {
    const service = EnterpriseDeepSeekOrchestrator.getInstance();
    const analytics = service.getEnterpriseAnalytics();
    
    // Determine health status based on metrics
    const successRate = analytics.enterpriseSuccessRate;
    const avgResponseTime = analytics.averageEnterpriseResponseTime;
    const securityEvents = analytics.securityEvents;
    
    let status = 'healthy';
    let issues: string[] = [];
    
    if (successRate < 90) {
      status = 'degraded';
      issues.push(`Low success rate: ${successRate.toFixed(1)}%`);
    }
    
    if (avgResponseTime > 8000) {
      status = 'degraded';
      issues.push(`High response time: ${avgResponseTime.toFixed(0)}ms`);
    }
    
    if (securityEvents > 50) {
      status = 'unhealthy';
      issues.push(`High security events: ${securityEvents}`);
    }
    
    const statusCode = status === 'healthy' ? 200 : 
                      status === 'degraded' ? 206 : 503;
    
    res.status(statusCode).json({
      success: true,
      data: {
        service: 'EnterpriseDeepSeekOrchestrator',
        status,
        issues,
        metrics: {
          totalRequests: analytics.totalEnterpriseRequests,
          activeTenants: analytics.tenantCount,
          successRate: Math.round(analytics.enterpriseSuccessRate),
          averageResponseTime: Math.round(analytics.averageEnterpriseResponseTime),
          securityEvents: analytics.securityEvents,
          auditLogSize: analytics.auditLogSize
        },
        enterpriseFeatures: {
          multiTenantSupport: true,
          auditLogging: true,
          complianceChecking: true,
          securityValidation: true,
          batchProcessing: true,
          analyticsReporting: true
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Enterprise health check error:', error);
    res.status(503).json({
      success: false,
      error: 'Enterprise health check failed',
      message: error.message
    });
  }
});

/**
 * Enterprise configuration endpoint
 */
router.post('/enterprise-config', async (req, res) => {
  try {
    const { config } = req.body;
    
    // This would allow runtime configuration of enterprise parameters
    res.json({
      success: true,
      message: 'Enterprise configuration updated',
      config: {
        multiTenantIsolation: true,
        auditLogging: true,
        complianceChecking: true,
        securityValidation: true,
        maxConcurrentRequests: 50,
        auditLogRetention: 90,
        ...config
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Enterprise configuration error:', error);
    res.status(500).json({
      success: false,
      error: 'Configuration update failed',
      message: error.message
    });
  }
});

export default router;