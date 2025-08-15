/**
 * Mobile Banking API Routes - Phase 2 Week 5-6
 * Comprehensive API endpoints for bKash, Nagad, and Rocket integration
 * Investment: $55,000 Enhanced Implementation
 */

import { Router, Request, Response } from 'express';
import BKashPaymentService from '../services/payment/BKashPaymentService';
import NagadPaymentService from '../services/payment/NagadPaymentService';
import RocketPaymentService from '../services/payment/RocketPaymentService';
import MobileBankingOrchestrator from '../services/payment/MobileBankingOrchestrator';

const router = Router();

// Initialize services
const bkashService = new BKashPaymentService();
const nagadService = new NagadPaymentService();
const rocketService = new RocketPaymentService();
const orchestrator = new MobileBankingOrchestrator();

/**
 * Unified Mobile Banking Endpoints
 */

// Process payment with intelligent routing
router.post('/process-payment', async (req: Request, res: Response) => {
  try {
    const { 
      amount, 
      customerMsisdn, 
      provider, 
      merchantInvoiceNumber,
      fallbackOrder,
      metadata 
    } = req.body;

    if (!amount || !customerMsisdn || !merchantInvoiceNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, customerMsisdn, merchantInvoiceNumber'
      });
    }

    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: provider || 'bkash',
      amount: parseFloat(amount),
      currency: 'BDT',
      customerMsisdn,
      merchantInvoiceNumber,
      fallbackOrder,
      metadata
    };

    const result = await orchestrator.processPayment(transaction);

    res.json({
      success: result.success,
      transactionId: result.transactionId,
      provider: result.provider,
      fallbackUsed: result.fallbackUsed,
      fallbackProvider: result.fallbackProvider,
      processingTime: result.processingTime,
      fees: result.fees,
      cashback: result.cashback,
      offlineQueued: result.offlineQueued,
      requiresPin: result.requiresPin,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error during payment processing'
    });
  }
});

// Get provider health status
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await orchestrator.getProviderHealth();
    const analytics = await orchestrator.getAnalytics();

    res.json({
      success: true,
      data: {
        providers: health,
        analytics: {
          totalTransactions: analytics.totalTransactions,
          successRate: analytics.totalTransactions > 0 
            ? (analytics.successfulTransactions / analytics.totalTransactions * 100).toFixed(2)
            : 0,
          averageProcessingTime: analytics.averageProcessingTime,
          providerDistribution: analytics.providerDistribution,
          fallbackUsageRate: (analytics.fallbackUsageRate * 100).toFixed(2),
          offlineQueueSize: analytics.offlineQueueSize
        },
        loadDistribution: orchestrator.currentLoadDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health status'
    });
  }
});

// Get cross-platform balance
router.get('/balance/:customerMsisdn', async (req: Request, res: Response) => {
  try {
    const { customerMsisdn } = req.params;
    const balance = await orchestrator.getBalance(customerMsisdn);

    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve balance'
    });
  }
});

// Get transaction history
router.get('/transactions/:customerMsisdn', async (req: Request, res: Response) => {
  try {
    const { customerMsisdn } = req.params;
    const { provider, limit = 50 } = req.query;

    const history = await orchestrator.getTransactionHistory(
      customerMsisdn,
      provider as any,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction history'
    });
  }
});

/**
 * bKash Specific Endpoints
 */

// Process bKash payment
router.post('/bkash/process-payment', async (req: Request, res: Response) => {
  try {
    const transaction = {
      id: `bkash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...req.body,
      status: 'pending',
      timestamp: new Date(),
      retryCount: 0,
      riskScore: 0
    };

    const result = await bkashService.processPayment(transaction);

    res.json({
      success: result.success,
      transactionId: result.transactionId,
      offlineQueued: result.offlineQueued,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'bKash payment processing failed'
    });
  }
});

// Get bKash transaction status
router.get('/bkash/transaction/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const result = await bkashService.getTransactionStatus(transactionId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bKash transaction status'
    });
  }
});

// Get bKash account balance
router.get('/bkash/balance/:customerMsisdn', async (req: Request, res: Response) => {
  try {
    const { customerMsisdn } = req.params;
    const balance = await bkashService.getAccountBalance(customerMsisdn);

    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bKash balance'
    });
  }
});

/**
 * Nagad Specific Endpoints
 */

// Process Nagad payment
router.post('/nagad/process-payment', async (req: Request, res: Response) => {
  try {
    const transaction = {
      id: `nagad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...req.body,
      status: 'pending',
      timestamp: new Date(),
      retryCount: 0,
      riskScore: 0
    };

    const result = await nagadService.processPayment(transaction);

    res.json({
      success: result.success,
      transactionId: result.transactionId,
      offlineQueued: result.offlineQueued,
      nagadResponse: result.nagadResponse,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Nagad payment processing failed'
    });
  }
});

// Get Nagad cross-platform balance
router.get('/nagad/balance/:customerMsisdn', async (req: Request, res: Response) => {
  try {
    const { customerMsisdn } = req.params;
    const balance = await nagadService.getBalance(customerMsisdn);

    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve Nagad balance'
    });
  }
});

// Sync Nagad balance
router.post('/nagad/sync-balance', async (req: Request, res: Response) => {
  try {
    const { customerMsisdn } = req.body;
    const balance = await nagadService.syncBalance(customerMsisdn);

    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to sync Nagad balance'
    });
  }
});

/**
 * Rocket Specific Endpoints
 */

// Process Rocket payment
router.post('/rocket/process-payment', async (req: Request, res: Response) => {
  try {
    const transaction = {
      id: `rocket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...req.body,
      status: 'pending',
      timestamp: new Date(),
      retryCount: 0,
      riskScore: 0
    };

    const result = await rocketService.processPayment(transaction);

    res.json({
      success: result.success,
      transactionId: result.transactionId,
      offlineQueued: result.offlineQueued,
      requiresPin: result.requiresPin,
      rocketResponse: result.rocketResponse,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Rocket payment processing failed'
    });
  }
});

// Verify Rocket PIN
router.post('/rocket/verify-pin', async (req: Request, res: Response) => {
  try {
    const { customerMsisdn, pin } = req.body;

    if (!customerMsisdn || !pin) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customerMsisdn, pin'
      });
    }

    const result = await rocketService.verifyPin(customerMsisdn, pin);

    res.json({
      success: result.verified,
      attemptsRemaining: result.attemptsRemaining,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'PIN verification failed'
    });
  }
});

// Get Rocket cashback history
router.get('/rocket/cashback/:customerMsisdn', async (req: Request, res: Response) => {
  try {
    const { customerMsisdn } = req.params;
    const { limit = 50 } = req.query;

    const history = await rocketService.getCashbackHistory(
      customerMsisdn,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cashback history'
    });
  }
});

/**
 * Administrative Endpoints
 */

// Update fallback strategy
router.post('/admin/fallback-strategy', async (req: Request, res: Response) => {
  try {
    const strategy = req.body;
    await orchestrator.updateFallbackStrategy(strategy);

    res.json({
      success: true,
      message: 'Fallback strategy updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update fallback strategy'
    });
  }
});

// Get comprehensive analytics
router.get('/admin/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await orchestrator.getAnalytics();
    const providerHealth = await orchestrator.getProviderHealth();

    res.json({
      success: true,
      data: {
        analytics,
        providerHealth,
        offlineQueueLength: orchestrator.totalOfflineQueueLength,
        loadDistribution: orchestrator.currentLoadDistribution,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
});

// Health check endpoint
router.get('/admin/health-check', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        services: {
          bkash: {
            status: 'active',
            offlineQueue: bkashService.offlineQueueLength,
            rateLimiter: bkashService.rateLimiterStats.size
          },
          nagad: {
            status: 'active',
            offlineQueue: nagadService.offlineQueueLength,
            balanceCache: nagadService.balanceCacheSize
          },
          rocket: {
            status: 'active',
            offlineQueue: rocketService.offlineQueueLength,
            pinAttempts: rocketService.pinAttemptStats.size,
            bankConnectivity: rocketService.bankConnectivityStatus
          }
        },
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

export default router;