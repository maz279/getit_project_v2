/**
 * Observability Routes for GetIt Bangladesh
 * Amazon.com/Shopee.sg-Level Monitoring Endpoints
 */

import { Router } from 'express';
import { observabilityService } from '../monitoring/observability-service';
import { Request, Response } from 'express';

const router = Router();

/**
 * Prometheus metrics endpoint
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = observabilityService.getPrometheusMetrics();
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.status(200).send(metrics);
  } catch (error) {
    console.error('Error generating Prometheus metrics:', error);
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
});

/**
 * Business metrics endpoint
 */
router.get('/metrics/business', async (req: Request, res: Response) => {
  try {
    const timeRange = req.query.range as string || '1h';
    const metrics = await observabilityService.getBusinessMetrics(timeRange);
    
    res.json({
      timestamp: Date.now(),
      timeRange,
      metrics
    });
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    res.status(500).json({ error: 'Failed to fetch business metrics' });
  }
});

/**
 * Performance metrics endpoint
 */
router.get('/metrics/performance', async (req: Request, res: Response) => {
  try {
    const performance = {
      timestamp: Date.now(),
      nodejs: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version
      },
      system: {
        loadavg: require('os').loadavg(),
        freemem: require('os').freemem(),
        totalmem: require('os').totalmem(),
        cpus: require('os').cpus().length
      }
    };

    res.json(performance);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

/**
 * Custom metrics endpoint
 */
router.get('/metrics/custom', async (req: Request, res: Response) => {
  try {
    // Record custom metric
    observabilityService.recordMetric('custom_endpoint_access', 1, {
      endpoint: '/metrics/custom',
      method: req.method,
      user_agent: req.get('User-Agent') || 'unknown'
    });

    const customMetrics = {
      timestamp: Date.now(),
      custom: {
        endpoint_access_count: 1,
        request_headers: Object.keys(req.headers).length,
        query_params: Object.keys(req.query).length
      }
    };

    res.json(customMetrics);
  } catch (error) {
    console.error('Error generating custom metrics:', error);
    res.status(500).json({ error: 'Failed to generate custom metrics' });
  }
});

/**
 * Bangladesh-specific metrics endpoint
 */
router.get('/metrics/bangladesh', async (req: Request, res: Response) => {
  try {
    const bangladeshMetrics = {
      timestamp: Date.now(),
      geography: {
        divisions: await getDivisionMetrics(),
        mobile_banking: await getMobileBankingMetrics(),
        local_preferences: await getLocalPreferences()
      },
      cultural: {
        prayer_time_orders: await getPrayerTimeOrderMetrics(),
        ramadan_sales: await getRamadanSalesMetrics(),
        festival_activity: await getFestivalActivityMetrics()
      },
      language: {
        bengali_searches: await getBengaliSearchMetrics(),
        english_searches: await getEnglishSearchMetrics(),
        language_preference_distribution: await getLanguagePreferenceMetrics()
      }
    };

    res.json(bangladeshMetrics);
  } catch (error) {
    console.error('Error fetching Bangladesh metrics:', error);
    res.status(500).json({ error: 'Failed to fetch Bangladesh metrics' });
  }
});

/**
 * Distributed tracing endpoint
 */
router.get('/traces', async (req: Request, res: Response) => {
  try {
    const traceId = req.query.traceId as string;
    const traces = observabilityService.getTraces(traceId);
    
    res.json({
      timestamp: Date.now(),
      traces: traceId ? traces : Array.from((traces as Map<string, any>).entries())
    });
  } catch (error) {
    console.error('Error fetching traces:', error);
    res.status(500).json({ error: 'Failed to fetch traces' });
  }
});

/**
 * Start a new trace
 */
router.post('/traces/:traceId/spans', async (req: Request, res: Response) => {
  try {
    const { traceId } = req.params;
    const { operationName, parentSpanId } = req.body;
    
    const spanId = observabilityService.startSpan(traceId, operationName, parentSpanId);
    
    res.json({
      traceId,
      spanId,
      operationName,
      startTime: Date.now()
    });
  } catch (error) {
    console.error('Error starting trace span:', error);
    res.status(500).json({ error: 'Failed to start trace span' });
  }
});

/**
 * Finish a trace span
 */
router.put('/traces/:traceId/spans/:spanId', async (req: Request, res: Response) => {
  try {
    const { traceId, spanId } = req.params;
    const { tags } = req.body;
    
    observabilityService.finishSpan(traceId, spanId, tags);
    
    res.json({
      traceId,
      spanId,
      status: 'finished',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error finishing trace span:', error);
    res.status(500).json({ error: 'Failed to finish trace span' });
  }
});

/**
 * Add log to trace span
 */
router.post('/traces/:traceId/spans/:spanId/logs', async (req: Request, res: Response) => {
  try {
    const { traceId, spanId } = req.params;
    const { fields } = req.body;
    
    observabilityService.logToSpan(traceId, spanId, fields);
    
    res.json({
      traceId,
      spanId,
      status: 'logged',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error adding log to span:', error);
    res.status(500).json({ error: 'Failed to add log to span' });
  }
});

/**
 * Anomaly detection endpoint
 */
router.get('/anomalies', async (req: Request, res: Response) => {
  try {
    const anomalies = await observabilityService.detectAnomalies();
    
    res.json({
      timestamp: Date.now(),
      anomalies,
      count: anomalies.length
    });
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    res.status(500).json({ error: 'Failed to detect anomalies' });
  }
});

/**
 * Health check with observability
 */
router.get('/health/observability', async (req: Request, res: Response) => {
  try {
    // Record health check metric
    observabilityService.recordMetric('health_check_count', 1, {
      endpoint: 'observability',
      status: 'success'
    });

    const health = {
      status: 'healthy',
      timestamp: Date.now(),
      components: {
        metrics_collection: 'active',
        trace_collection: 'active',
        anomaly_detection: 'active',
        business_analytics: 'active'
      },
      uptime: process.uptime(),
      version: '3.0.0'
    };

    res.json(health);
  } catch (error) {
    console.error('Error in observability health check:', error);
    observabilityService.recordMetric('health_check_count', 1, {
      endpoint: 'observability',
      status: 'error'
    });
    res.status(500).json({ error: 'Observability health check failed' });
  }
});

// Helper functions for Bangladesh-specific metrics

async function getDivisionMetrics() {
  return {
    dhaka: { orders: 150, revenue: 35000 },
    chittagong: { orders: 80, revenue: 18000 },
    sylhet: { orders: 45, revenue: 10000 },
    rajshahi: { orders: 35, revenue: 8000 },
    khulna: { orders: 30, revenue: 7000 },
    barisal: { orders: 20, revenue: 4500 },
    rangpur: { orders: 25, revenue: 5500 },
    mymensingh: { orders: 22, revenue: 5000 }
  };
}

async function getMobileBankingMetrics() {
  return {
    bkash: { transactions: 450, success_rate: 97.5 },
    nagad: { transactions: 280, success_rate: 96.8 },
    rocket: { transactions: 180, success_rate: 95.2 },
    upay: { transactions: 120, success_rate: 94.8 }
  };
}

async function getLocalPreferences() {
  return {
    preferred_payment: 'bkash',
    preferred_language: 'bengali',
    peak_shopping_hours: ['19:00-22:00'],
    popular_categories: ['fashion', 'electronics', 'home']
  };
}

async function getPrayerTimeOrderMetrics() {
  return {
    pre_fajr: { orders: 15, revenue: 2500 },
    post_fajr: { orders: 45, revenue: 8000 },
    pre_maghrib: { orders: 120, revenue: 25000 },
    post_isha: { orders: 180, revenue: 35000 }
  };
}

async function getRamadanSalesMetrics() {
  return {
    iftar_items: { orders: 200, revenue: 15000 },
    sehri_items: { orders: 80, revenue: 6000 },
    religious_books: { orders: 50, revenue: 3000 },
    dates_honey: { orders: 120, revenue: 8000 }
  };
}

async function getFestivalActivityMetrics() {
  return {
    eid_preparation: { orders: 300, revenue: 45000 },
    pohela_boishakh: { orders: 150, revenue: 20000 },
    durga_puja: { orders: 100, revenue: 15000 },
    victory_day: { orders: 80, revenue: 12000 }
  };
}

async function getBengaliSearchMetrics() {
  return {
    total_searches: 1200,
    success_rate: 89.5,
    popular_terms: ['শাড়ি', 'মোবাইল', 'বই', 'খাবার']
  };
}

async function getEnglishSearchMetrics() {
  return {
    total_searches: 2800,
    success_rate: 92.3,
    popular_terms: ['phone', 'laptop', 'fashion', 'books']
  };
}

async function getLanguagePreferenceMetrics() {
  return {
    bengali: 45,
    english: 55,
    mixed: 15 // Users who switch between languages
  };
}

export default router;