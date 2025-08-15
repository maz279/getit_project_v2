/**
 * Optimization API Routes
 * Phase 6 Optimization endpoints
 */

import { Router } from 'express';
import { AdvancedPerformanceOptimizer } from '../services/optimization/AdvancedPerformanceOptimizer';
import { LoadTestingService } from '../services/optimization/LoadTestingService';
import { SecurityHardeningService } from '../services/optimization/SecurityHardeningService';

const router = Router();

// Create optimization service instances
const performanceOptimizer = new AdvancedPerformanceOptimizer({
  name: 'AdvancedPerformanceOptimizer',
  version: '6.0.0'
});

const loadTestingService = new LoadTestingService({
  name: 'LoadTestingService',
  version: '6.0.0'
});

const securityHardeningService = new SecurityHardeningService({
  name: 'SecurityHardeningService',
  version: '6.0.0'
});

// ========== Performance Optimization Routes ==========

/**
 * GET /api/v1/optimization/performance/analyze
 * Analyze current performance
 */
router.get('/performance/analyze', async (req, res) => {
  try {
    const result = await performanceOptimizer.analyzePerformance();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'PERFORMANCE_ANALYSIS_ERROR',
      message: 'Failed to analyze performance'
    });
  }
});

/**
 * GET /api/v1/optimization/performance/bottlenecks
 * Identify performance bottlenecks
 */
router.get('/performance/bottlenecks', async (req, res) => {
  try {
    const result = await performanceOptimizer.identifyBottlenecks();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'BOTTLENECK_ANALYSIS_ERROR',
      message: 'Failed to identify bottlenecks'
    });
  }
});

/**
 * GET /api/v1/optimization/performance/recommendations
 * Generate optimization recommendations
 */
router.get('/performance/recommendations', async (req, res) => {
  try {
    const result = await performanceOptimizer.generateRecommendations();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'RECOMMENDATION_GENERATION_ERROR',
      message: 'Failed to generate recommendations'
    });
  }
});

/**
 * POST /api/v1/optimization/performance/apply
 * Apply optimization
 */
router.post('/performance/apply', async (req, res) => {
  try {
    const { optimizationId } = req.body;
    const result = await performanceOptimizer.applyOptimization(optimizationId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'OPTIMIZATION_APPLICATION_ERROR',
      message: 'Failed to apply optimization'
    });
  }
});

/**
 * POST /api/v1/optimization/performance/config
 * Configure auto-optimization
 */
router.post('/performance/config', async (req, res) => {
  try {
    const config = req.body;
    const result = await performanceOptimizer.configureAutoOptimization(config);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'AUTO_OPTIMIZATION_CONFIG_ERROR',
      message: 'Failed to configure auto-optimization'
    });
  }
});

/**
 * POST /api/v1/optimization/performance/benchmark
 * Run performance benchmark
 */
router.post('/performance/benchmark', async (req, res) => {
  try {
    const config = req.body;
    const result = await performanceOptimizer.runBenchmark(config);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'BENCHMARK_ERROR',
      message: 'Failed to run performance benchmark'
    });
  }
});

/**
 * POST /api/v1/optimization/performance/bangladesh
 * Optimize for Bangladesh networks
 */
router.post('/performance/bangladesh', async (req, res) => {
  try {
    const result = await performanceOptimizer.optimizeForBangladesh();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'BANGLADESH_OPTIMIZATION_ERROR',
      message: 'Failed to apply Bangladesh optimizations'
    });
  }
});

// ========== Load Testing Routes ==========

/**
 * POST /api/v1/optimization/load-test/start
 * Start load test
 */
router.post('/load-test/start', async (req, res) => {
  try {
    const config = req.body;
    const result = await loadTestingService.startLoadTest(config);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'LOAD_TEST_START_ERROR',
      message: 'Failed to start load test'
    });
  }
});

/**
 * GET /api/v1/optimization/load-test/results/:testId
 * Get load test results
 */
router.get('/load-test/results/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const result = await loadTestingService.getTestResults(testId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'LOAD_TEST_RESULTS_ERROR',
      message: 'Failed to get load test results'
    });
  }
});

/**
 * POST /api/v1/optimization/load-test/stop/:testId
 * Stop load test
 */
router.post('/load-test/stop/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const result = await loadTestingService.stopTest(testId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'LOAD_TEST_STOP_ERROR',
      message: 'Failed to stop load test'
    });
  }
});

/**
 * POST /api/v1/optimization/load-test/bangladesh
 * Run Bangladesh-specific test
 */
router.post('/load-test/bangladesh', async (req, res) => {
  try {
    const config = req.body;
    const result = await loadTestingService.runBangladeshTest(config);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'BANGLADESH_LOAD_TEST_ERROR',
      message: 'Failed to run Bangladesh load test'
    });
  }
});

/**
 * GET /api/v1/optimization/load-test/templates
 * Get available test templates
 */
router.get('/load-test/templates', async (req, res) => {
  try {
    const result = await loadTestingService.getTestTemplates();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'TEMPLATES_FETCH_ERROR',
      message: 'Failed to fetch test templates'
    });
  }
});

// ========== Security Hardening Routes ==========

/**
 * GET /api/v1/optimization/security/assessment
 * Run security assessment
 */
router.get('/security/assessment', async (req, res) => {
  try {
    const result = await securityHardeningService.runSecurityAssessment();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SECURITY_ASSESSMENT_ERROR',
      message: 'Failed to run security assessment'
    });
  }
});

/**
 * POST /api/v1/optimization/security/pentest
 * Start penetration test
 */
router.post('/security/pentest', async (req, res) => {
  try {
    const config = req.body;
    const result = await securityHardeningService.startPenetrationTest(config);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'PENETRATION_TEST_START_ERROR',
      message: 'Failed to start penetration test'
    });
  }
});

/**
 * GET /api/v1/optimization/security/pentest/:testId
 * Get penetration test results
 */
router.get('/security/pentest/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const result = await securityHardeningService.getPenetrationTestResults(testId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'PENETRATION_TEST_RESULTS_ERROR',
      message: 'Failed to get penetration test results'
    });
  }
});

/**
 * POST /api/v1/optimization/security/harden
 * Apply security hardening
 */
router.post('/security/harden', async (req, res) => {
  try {
    const { recommendations } = req.body;
    const result = await securityHardeningService.applySecurityHardening(recommendations);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SECURITY_HARDENING_ERROR',
      message: 'Failed to apply security hardening'
    });
  }
});

/**
 * GET /api/v1/optimization/security/compliance/:framework
 * Check compliance framework
 */
router.get('/security/compliance/:framework', async (req, res) => {
  try {
    const { framework } = req.params;
    const result = await securityHardeningService.checkComplianceFramework(framework);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'COMPLIANCE_CHECK_ERROR',
      message: 'Failed to check compliance framework'
    });
  }
});

/**
 * GET /api/v1/optimization/security/mobile-payment
 * Validate mobile payment security
 */
router.get('/security/mobile-payment', async (req, res) => {
  try {
    const result = await securityHardeningService.validateMobilePaymentSecurity();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'MOBILE_PAYMENT_SECURITY_ERROR',
      message: 'Failed to validate mobile payment security'
    });
  }
});

export default router;