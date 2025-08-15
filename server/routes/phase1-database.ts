import { Router } from 'express';
import { userService } from '../services/user-service';
import { databaseRouter } from '../db/database-router';
import { cacheHierarchy } from '../cache/cache-hierarchy';
import { z } from 'zod';
import { users } from '@shared/schema';
import { createInsertSchema } from 'drizzle-zod';

const insertUserSchema = createInsertSchema(users);

const router = Router();

// Health check for all databases
router.get('/health', async (req, res) => {
  try {
    const health = await databaseRouter.healthCheck();
    const cacheMetrics = cacheHierarchy.getMetrics();
    
    res.json({
      status: 'operational',
      databases: health,
      cache: cacheMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// User Service Routes
router.post('/users', async (req, res) => {
  try {
    const data = insertUserSchema.parse(req.body);
    const user = await userService.createUser(data);
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/users/email/:email', async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.params.email);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/users/:id/details', async (req, res) => {
  try {
    const userDetails = await userService.getUserWithDetails(req.params.id);
    if (!userDetails) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(userDetails);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Cache Management Routes
router.get('/cache/metrics', async (req, res) => {
  try {
    const metrics = cacheHierarchy.getMetrics();
    res.json({
      metrics,
      analysis: {
        l1_efficiency: `${metrics.l1.hitRate}% hit rate with ${metrics.l1.avgLatency}ms avg latency`,
        l2_efficiency: `${metrics.l2.hitRate}% hit rate with ${metrics.l2.avgLatency}ms avg latency`,
        l3_efficiency: `${metrics.l3.hitRate}% hit rate with ${metrics.l3.avgLatency}ms avg latency`,
        l4_efficiency: `${metrics.l4.hitRate}% hit rate with ${metrics.l4.avgLatency}ms avg latency`,
        overall_performance: calculateOverallPerformance(metrics)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cache metrics' });
  }
});

router.post('/cache/warmup', async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) {
      res.status(400).json({ error: 'userIds must be an array' });
      return;
    }
    
    await userService.warmupCache(userIds);
    res.json({ message: 'Cache warmup initiated', count: userIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Cache warmup failed' });
  }
});

router.delete('/cache/invalidate/:pattern', async (req, res) => {
  try {
    await cacheHierarchy.invalidatePattern(req.params.pattern);
    res.json({ message: 'Cache invalidated', pattern: req.params.pattern });
  } catch (error) {
    res.status(500).json({ error: 'Cache invalidation failed' });
  }
});

// Performance Monitoring Routes
router.get('/performance/targets', async (req, res) => {
  res.json({
    targets: {
      p95_latency: {
        target: '<50ms',
        current: 'Measuring...',
        status: 'IN_PROGRESS'
      },
      throughput: {
        target: '10K RPS',
        current: 'Measuring...',
        status: 'IN_PROGRESS'
      },
      cache_hit_rate: {
        target: '>85%',
        current: calculateOverallCacheHitRate(cacheHierarchy.getMetrics()),
        status: 'MONITORING'
      }
    },
    phase: 'Week 3-4: Performance Optimization',
    investment: '$45,000',
    expected_roi: '850%'
  });
});

// Helper functions
function calculateOverallPerformance(metrics: any): string {
  const avgHitRate = (metrics.l1.hitRate + metrics.l2.hitRate + metrics.l3.hitRate + metrics.l4.hitRate) / 4;
  const avgLatency = (metrics.l1.avgLatency + metrics.l2.avgLatency + metrics.l3.avgLatency + metrics.l4.avgLatency) / 4;
  
  if (avgHitRate > 85 && avgLatency < 20) {
    return 'EXCELLENT - Meeting Amazon.com standards';
  } else if (avgHitRate > 70 && avgLatency < 50) {
    return 'GOOD - Approaching target performance';
  } else {
    return 'NEEDS_IMPROVEMENT - Optimization in progress';
  }
}

function calculateOverallCacheHitRate(metrics: any): string {
  const avgHitRate = (metrics.l1.hitRate + metrics.l2.hitRate + metrics.l3.hitRate + metrics.l4.hitRate) / 4;
  return `${avgHitRate.toFixed(1)}%`;
}

export default router;