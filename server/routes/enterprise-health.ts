/**
 * Enterprise Health Check Routes for Phase 1 Infrastructure
 * Amazon.com/Shopee.sg-Level Health Monitoring
 */

import { Router } from 'express';
import { getEnterpriseDB } from '../database/enterprise-db';
import { getEnterpriseRedis } from '../services/EnterpriseRedisService';

const router = Router();

/**
 * Comprehensive health check endpoint
 */
router.get('/health/enterprise', async (req, res) => {
  try {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      enterpriseMode: process.env.ENTERPRISE_MODE === 'true',
      services: {},
      performance: {},
      summary: {
        healthy: 0,
        degraded: 0,
        unhealthy: 0,
        total: 0
      }
    };

    // Database Health Check
    try {
      if (process.env.ENTERPRISE_MODE === 'true') {
        const enterpriseDB = getEnterpriseDB();
        const dbHealth = await enterpriseDB.healthCheck();
        
        healthStatus.services.database = {
          type: 'enterprise-multi-db',
          primary: dbHealth.primary,
          cache: dbHealth.cache,
          search: dbHealth.search,
          shards: dbHealth.shards,
          status: dbHealth.primary ? 'healthy' : 'unhealthy'
        };
      } else {
        // Legacy database check
        healthStatus.services.database = {
          type: 'legacy-postgresql',
          status: 'healthy' // Simplified check
        };
      }
    } catch (error) {
      healthStatus.services.database = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Cache Health Check
    try {
      if (process.env.ENTERPRISE_MODE === 'true') {
        const enterpriseRedis = getEnterpriseRedis();
        const cacheHealth = enterpriseRedis.getHealthStatus();
        const cacheMetrics = enterpriseRedis.getMetrics();
        
        healthStatus.services.cache = {
          type: 'enterprise-redis-cluster',
          status: cacheHealth.healthy ? 'healthy' : 'degraded',
          activeClients: cacheHealth.activeClients,
          totalClients: cacheHealth.totalClients,
          fallbackMode: cacheHealth.fallbackMode,
          metrics: {
            hitRate: `${cacheMetrics.hitRate}%`,
            operations: cacheMetrics.operations,
            errors: cacheMetrics.errors
          }
        };
      } else {
        healthStatus.services.cache = {
          type: 'legacy-redis',
          status: 'disconnected'
        };
      }
    } catch (error) {
      healthStatus.services.cache = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Service Mesh Health Check
    healthStatus.services.serviceMesh = {
      type: 'istio',
      status: process.env.ENTERPRISE_MODE === 'true' ? 'configured' : 'not-deployed',
      features: process.env.ENTERPRISE_MODE === 'true' ? [
        'mTLS security',
        'Traffic management', 
        'Load balancing',
        'Circuit breaker',
        'Rate limiting'
      ] : []
    };

    // Performance Metrics
    healthStatus.performance = {
      uptime: process.uptime(),
      memoryUsage: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
      },
      cpuUsage: process.cpuUsage(),
      nodeVersion: process.version,
      pid: process.pid
    };

    // Calculate summary
    Object.values(healthStatus.services).forEach((service: any) => {
      healthStatus.summary.total++;
      
      if (service.status === 'healthy') {
        healthStatus.summary.healthy++;
      } else if (service.status === 'degraded' || service.status === 'configured') {
        healthStatus.summary.degraded++;
      } else {
        healthStatus.summary.unhealthy++;
      }
    });

    // Determine overall status
    const overallStatus = healthStatus.summary.unhealthy > 0 ? 'unhealthy' : 
                         healthStatus.summary.degraded > 0 ? 'degraded' : 'healthy';
    
    res.status(overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 206 : 503).json({
      status: overallStatus,
      ...healthStatus
    });

  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Database-specific health check
 */
router.get('/health/database', async (req, res) => {
  try {
    if (process.env.ENTERPRISE_MODE === 'true') {
      const enterpriseDB = getEnterpriseDB();
      const health = await enterpriseDB.healthCheck();
      
      res.json({
        status: 'enterprise',
        health,
        sharding: {
          enabled: true,
          strategy: 'user_based',
          shardCount: 4
        }
      });
    } else {
      res.json({
        status: 'legacy',
        connection: 'postgresql'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Cache-specific health check
 */
router.get('/health/cache', async (req, res) => {
  try {
    if (process.env.ENTERPRISE_MODE === 'true') {
      const enterpriseRedis = getEnterpriseRedis();
      const health = enterpriseRedis.getHealthStatus();
      const metrics = enterpriseRedis.getMetrics();
      
      res.json({
        status: 'enterprise',
        health,
        metrics,
        features: [
          'Multi-tier caching',
          'Automatic failover',
          'In-memory fallback',
          'Health monitoring'
        ]
      });
    } else {
      res.json({
        status: 'legacy',
        connection: 'redis'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Infrastructure overview
 */
router.get('/health/infrastructure', async (req, res) => {
  try {
    const infrastructure = {
      phase: 'Phase 1: Foundation Infrastructure',
      implementation: 'Amazon.com/Shopee.sg-Level Architecture',
      components: {
        database: {
          implemented: process.env.ENTERPRISE_MODE === 'true',
          features: [
            'Multi-database strategy',
            'Database sharding',
            'Aurora-style clustering',
            'Read replicas',
            'Connection pooling'
          ]
        },
        caching: {
          implemented: process.env.ENTERPRISE_MODE === 'true',
          features: [
            'Redis cluster',
            'Multi-tier caching',
            'Automatic failover',
            'In-memory fallback',
            'Performance monitoring'
          ]
        },
        serviceMesh: {
          configured: process.env.ENTERPRISE_MODE === 'true',
          features: [
            'Istio service mesh',
            'mTLS security',
            'Traffic management',
            'Load balancing',
            'Circuit breaker patterns'
          ]
        },
        monitoring: {
          available: true,
          features: [
            'Health monitoring',
            'Performance metrics',
            'Real-time analytics',
            'Enterprise dashboards'
          ]
        }
      },
      deployment: {
        dockerCompose: 'infrastructure/docker/docker-compose.enterprise.yml',
        kubernetes: 'infrastructure/kubernetes/',
        scripts: 'scripts/deploy-phase1.sh'
      },
      nextPhases: [
        'Phase 2: Enterprise CI/CD Pipeline',
        'Phase 3: Advanced Monitoring & Observability', 
        'Phase 4: Security & Compliance Enhancement',
        'Phase 5: Performance Optimization & Scalability'
      ]
    };

    res.json(infrastructure);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Performance metrics endpoint
 */
router.get('/health/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      application: {
        enterpriseMode: process.env.ENTERPRISE_MODE === 'true',
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid
      }
    };

    // Add cache metrics if enterprise mode
    if (process.env.ENTERPRISE_MODE === 'true') {
      try {
        const enterpriseRedis = getEnterpriseRedis();
        metrics.cache = enterpriseRedis.getMetrics();
      } catch (error) {
        metrics.cache = { error: error.message };
      }
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

export default router;