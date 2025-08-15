/**
 * Enterprise Database API Routes
 * Amazon.com/Shopee.sg Multi-Database Architecture Showcase
 */

import { Router } from 'express';
import { dbRouter } from '../database/database-router';
import { multiDbManager } from '../database/multi-db-manager';
import { enterpriseCacheService } from '../services/enterprise-cache-service';
import { performanceOptimizationService } from '../services/performance-optimization-service';

const router = Router();

// Health Check endpoint
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check all database health
    const databaseHealth = await multiDbManager.healthCheck();
    
    // Get cache metrics
    const cacheMetrics = enterpriseCacheService.getMetrics();
    
    // Get performance metrics
    const performanceMetrics = performanceOptimizationService.getMetrics();
    
    // Calculate total cache hit rate
    const totalHits = cacheMetrics.hits.L1 + cacheMetrics.hits.L2 + cacheMetrics.hits.L3;
    const totalMisses = cacheMetrics.misses.L1 + cacheMetrics.misses.L2 + cacheMetrics.misses.L3;
    const totalRequests = totalHits + totalMisses;
    const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
    
    const responseTime = Date.now() - startTime;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      architecture: {
        databases: databaseHealth,
        cache: {
          hitRate: `${hitRate.toFixed(2)}%`,
          layers: {
            L1: { size: cacheMetrics.memory.L1, hits: cacheMetrics.hits.L1 },
            L2: { size: cacheMetrics.memory.L2, hits: cacheMetrics.hits.L2 },
            L3: { hits: cacheMetrics.hits.L3 }
          }
        },
        performance: {
          avgResponseTime: `${performanceMetrics.responseTime.avg.toFixed(2)}ms`,
          p95ResponseTime: `${performanceMetrics.responseTime.p95.toFixed(2)}ms`,
          target: '50ms (Amazon.com standard)',
          status: performanceMetrics.responseTime.p95 <= 50 ? 'EXCELLENT' : 
                 performanceMetrics.responseTime.p95 <= 100 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Database routing demonstration
router.get('/demo/routing', async (req, res) => {
  try {
    const demonstrations = [];
    
    // Demonstrate primary database routing
    await dbRouter.readFromPrimary(
      'users',
      async (db) => {
        demonstrations.push({
          operation: 'Primary Database Read',
          database: 'PostgreSQL',
          description: 'User data retrieval with caching',
          status: 'success'
        });
        return { demo: true };
      },
      'demo:users',
      3600
    );
    
    // Demonstrate analytics database routing
    await dbRouter.recordAnalytics(async (db) => {
      demonstrations.push({
        operation: 'Analytics Database Write',
        database: 'ClickHouse (Simulated)',
        description: 'Real-time analytics event recording',
        status: 'success'
      });
      return { recorded: true };
    });
    
    // Demonstrate search database routing
    await dbRouter.searchProducts(async (db) => {
      demonstrations.push({
        operation: 'Search Database Query',
        database: 'Elasticsearch (Simulated)', 
        description: 'Product search with ML recommendations',
        status: 'success'
      });
      return { results: [] };
    });
    
    // Demonstrate metrics recording
    await dbRouter.recordMetrics(async (db) => {
      demonstrations.push({
        operation: 'Metrics Database Write',
        database: 'InfluxDB (Simulated)',
        description: 'Performance metrics timeseries recording',
        status: 'success'
      });
      return { recorded: true };
    });
    
    res.json({
      message: 'Multi-Database Routing Demonstration',
      architecture: 'Amazon.com/Shopee.sg Enterprise Pattern',
      demonstrations,
      routing_strategy: {
        users: 'PostgreSQL (Primary)',
        analytics: 'ClickHouse (Real-time Analytics)',
        search: 'Elasticsearch (Product Discovery)',
        cache: 'Redis Cluster (Session & Cart Data)',
        metrics: 'InfluxDB (Performance Monitoring)'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cache layer demonstration
router.get('/demo/cache', async (req, res) => {
  try {
    const demoKey = 'demo:cache:test';
    const demoValue = {
      message: 'L1/L2/L3 Cache Hierarchy Test',
      timestamp: new Date().toISOString(),
      architecture: 'Amazon.com/Shopee.sg Enterprise Caching'
    };
    
    // Test cache set
    await enterpriseCacheService.set(demoKey, demoValue, 300);
    
    // Test cache get (should hit L1)
    const cachedValue = await enterpriseCacheService.get(demoKey);
    
    // Get current metrics
    const metrics = enterpriseCacheService.getMetrics();
    
    res.json({
      operation: 'Enterprise Cache Hierarchy Test',
      cached_value: cachedValue,
      cache_metrics: {
        L1: {
          hits: metrics.hits.L1,
          misses: metrics.misses.L1,
          size: metrics.memory.L1,
          description: 'In-memory, fastest access'
        },
        L2: {
          hits: metrics.hits.L2,
          misses: metrics.misses.L2,
          size: metrics.memory.L2,
          description: 'In-memory, larger capacity'
        },
        L3: {
          hits: metrics.hits.L3,
          misses: metrics.misses.L3,
          description: 'Redis cluster, distributed'
        }
      },
      strategy: 'write-through',
      performance: 'Sub-millisecond L1/L2 access, <10ms L3 access'
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Performance optimization demonstration
router.get('/demo/performance', async (req, res) => {
  try {
    // Trigger performance benchmark
    const benchmark = await performanceOptimizationService.benchmarkPerformance();
    const metrics = performanceOptimizationService.getMetrics();
    
    res.json({
      operation: 'Performance Optimization Analysis',
      benchmark: {
        status: benchmark.status,
        recommendations: benchmark.recommendations
      },
      current_metrics: {
        response_time: {
          average: `${metrics.responseTime.avg.toFixed(2)}ms`,
          p95: `${metrics.responseTime.p95.toFixed(2)}ms`,
          p99: `${metrics.responseTime.p99.toFixed(2)}ms`,
          target: '50ms (Amazon.com standard)'
        },
        cache_performance: {
          hit_rate: `${metrics.cache.hitRate.toFixed(2)}%`,
          target: '85%+'
        },
        memory_usage: {
          heap_used: `${(metrics.memory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heap_total: `${(metrics.memory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          usage_percent: `${((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100).toFixed(2)}%`
        }
      },
      optimizations: {
        auto_scaling: 'Dynamic cache size adjustment',
        query_optimization: 'Intelligent database routing',
        cache_warming: 'Preemptive cache population',
        performance_monitoring: 'Real-time metric collection'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Analytics demonstration endpoint
router.post('/demo/analytics', async (req, res) => {
  try {
    const event = {
      user_id: req.body.userId || 'demo_user',
      event_type: req.body.eventType || 'page_view',
      product_id: req.body.productId || 'demo_product',
      timestamp: new Date().toISOString(),
      session_id: req.body.sessionId || 'demo_session',
      conversion_value: req.body.conversionValue || 0
    };
    
    // Record to analytics database
    await dbRouter.recordAnalytics(async (analyticsDb) => {
      return await analyticsDb.insert('customer_behavior', [event]);
    });
    
    // Record performance metrics
    await dbRouter.recordMetrics(async (metricsDb) => {
      return await metricsDb.writePoint({
        measurement: 'user_events',
        tags: {
          event_type: event.event_type,
          user_id: event.user_id
        },
        fields: {
          conversion_value: event.conversion_value,
          timestamp: Date.now()
        }
      });
    });
    
    res.json({
      message: 'Analytics event recorded successfully',
      event_recorded: event,
      architecture: {
        analytics_db: 'ClickHouse - Real-time OLAP processing',
        metrics_db: 'InfluxDB - Timeseries performance data',
        processing: 'Asynchronous batch processing for optimal performance'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Database schema information
router.get('/schema', async (req, res) => {
  try {
    res.json({
      multi_database_architecture: {
        primary: {
          database: 'PostgreSQL',
          purpose: 'User data, orders, products',
          features: ['ACID compliance', 'Complex queries', 'Transactions'],
          tables: ['users', 'products', 'orders', 'categories', 'vendors']
        },
        analytics: {
          database: 'ClickHouse',
          purpose: 'Real-time analytics (Shopee pattern)',
          features: ['Column storage', 'Real-time aggregation', 'High throughput'],
          tables: ['customer_behavior', 'conversion_events', 'product_analytics']
        },
        cache: {
          database: 'Redis Cluster',
          purpose: 'Session data, cart data',
          features: ['Sub-millisecond access', 'Distributed', 'Persistence'],
          data_types: ['sessions', 'cart_items', 'user_preferences', 'search_cache']
        },
        search: {
          database: 'Elasticsearch',
          purpose: 'Product search, recommendations',
          features: ['Full-text search', 'ML recommendations', 'Faceted search'],
          indexes: ['products', 'categories', 'user_behavior', 'recommendations']
        },
        timeseries: {
          database: 'InfluxDB',
          purpose: 'Performance metrics, tracking',
          features: ['Time-series optimization', 'Real-time queries', 'Data retention'],
          measurements: ['performance_metrics', 'user_events', 'system_health']
        }
      },
      routing_strategy: {
        user_operations: 'Primary → Cache',
        product_search: 'Search → Cache → Primary',
        analytics_events: 'Analytics (async)',
        performance_metrics: 'Timeseries (async)',
        session_management: 'Cache → Primary (fallback)'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;