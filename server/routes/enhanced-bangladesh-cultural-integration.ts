/**
 * Phase 5 Week 19-20: Enhanced Bangladesh Cultural Integration API Routes
 * Amazon.com/Shopee.sg-Level Cultural Adaptation with Bangladesh-Specific Features
 * 
 * API Endpoints:
 * - GET /api/v1/cultural-integration/health - Service health check
 * - GET /api/v1/cultural-integration/bengali-localization - Bengali localization configuration
 * - GET /api/v1/cultural-integration/cultural-adaptation - Cultural adaptation features
 * - GET /api/v1/cultural-integration/prayer-times - Current prayer times
 * - GET /api/v1/cultural-integration/payment-localization - Payment localization configuration
 * - GET /api/v1/cultural-integration/cultural-metrics - Cultural metrics and analytics
 * - GET /api/v1/cultural-integration/cultural-insights - Cultural insights and recommendations
 * - GET /api/v1/cultural-integration/festival-calendar - Festival calendar and promotions
 * - POST /api/v1/cultural-integration/calculate-taxes - Calculate Bangladesh taxes
 * - GET /api/v1/cultural-integration/dashboard - Comprehensive cultural integration dashboard
 * - GET /api/v1/cultural-integration/test/system-status - System status for testing
 * - POST /api/v1/cultural-integration/test/generate-data - Generate test data
 * 
 * @fileoverview Enhanced Bangladesh Cultural Integration API Routes
 * @author GetIt Platform Team
 * @version 5.19.0
 */

import express from 'express';
import { EnhancedBangladeshCulturalIntegrationService } from '../services/cultural/EnhancedBangladeshCulturalIntegrationService';

const router = express.Router();
const culturalIntegrationService = new EnhancedBangladeshCulturalIntegrationService();

/**
 * GET /api/v1/cultural-integration/health
 * Service health check
 */
router.get('/health', async (req, res) => {
  try {
    const health = await culturalIntegrationService.getHealth();
    res.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cultural integration health',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/cultural-integration/bengali-localization
 * Bengali localization configuration
 */
router.get('/bengali-localization', async (req, res) => {
  try {
    const bengaliLocalization = await culturalIntegrationService.getBengaliLocalization();
    res.json({
      success: true,
      data: bengaliLocalization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get Bengali localization',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/cultural-integration/cultural-adaptation
 * Cultural adaptation features
 */
router.get('/cultural-adaptation', async (req, res) => {
  try {
    const culturalAdaptation = await culturalIntegrationService.getCulturalAdaptation();
    res.json({
      success: true,
      data: culturalAdaptation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cultural adaptation',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/cultural-integration/prayer-times
 * Current prayer times
 */
router.get('/prayer-times', async (req, res) => {
  try {
    const prayerTimes = await culturalIntegrationService.getPrayerTimes();
    res.json({
      success: true,
      data: prayerTimes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get prayer times',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/cultural-integration/payment-localization
 * Payment localization configuration
 */
router.get('/payment-localization', async (req, res) => {
  try {
    const paymentLocalization = await culturalIntegrationService.getPaymentLocalization();
    res.json({
      success: true,
      data: paymentLocalization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get payment localization',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/cultural-integration/cultural-metrics
 * Cultural metrics and analytics
 */
router.get('/cultural-metrics', async (req, res) => {
  try {
    const culturalMetrics = await culturalIntegrationService.getCulturalMetrics();
    res.json({
      success: true,
      data: culturalMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cultural metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/cultural-integration/cultural-insights
 * Cultural insights and recommendations
 */
router.get('/cultural-insights', async (req, res) => {
  try {
    const culturalInsights = await culturalIntegrationService.getCulturalInsights();
    res.json({
      success: true,
      data: culturalInsights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cultural insights',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/cultural-integration/festival-calendar
 * Festival calendar and promotions
 */
router.get('/festival-calendar', async (req, res) => {
  try {
    const festivalCalendar = await culturalIntegrationService.getFestivalCalendar();
    res.json({
      success: true,
      data: festivalCalendar,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get festival calendar',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/cultural-integration/calculate-taxes
 * Calculate Bangladesh taxes
 */
router.post('/calculate-taxes', async (req, res) => {
  try {
    const { amount, productType } = req.body;
    
    if (!amount || !productType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'Amount and productType are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const taxCalculation = await culturalIntegrationService.calculateBangladeshTaxes(amount, productType);
    res.json({
      success: true,
      data: taxCalculation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calculate Bangladesh taxes',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/cultural-integration/dashboard
 * Comprehensive cultural integration dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const dashboard = await culturalIntegrationService.getCulturalDashboard();
    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cultural integration dashboard',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/cultural-integration/test/system-status
 * System status for testing
 */
router.get('/test/system-status', async (req, res) => {
  try {
    const systemStatus = await culturalIntegrationService.getSystemStatus();
    res.json({
      success: true,
      data: systemStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get system status',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/cultural-integration/test/generate-data
 * Generate test data for validation
 */
router.post('/test/generate-data', async (req, res) => {
  try {
    const { dataType, count = 3 } = req.body;
    
    if (!dataType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter',
        message: 'dataType is required (cultural_trends, user_behavior, festival_data)',
        timestamp: new Date().toISOString()
      });
    }
    
    const validDataTypes = ['cultural_trends', 'user_behavior', 'festival_data'];
    if (!validDataTypes.includes(dataType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data type',
        message: `dataType must be one of: ${validDataTypes.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    const testData = await culturalIntegrationService.generateTestData(dataType, count);
    res.json({
      success: true,
      data: testData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate test data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;