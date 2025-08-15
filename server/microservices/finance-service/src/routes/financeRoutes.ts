/**
 * Finance Routes - Amazon.com/Shopee.sg Level Financial Management
 * Enterprise-grade financial operations and commission management API endpoints
 */

import { Router } from 'express';
import { FinanceController } from '../controllers/FinanceController';
import { reconciliationController } from '../controllers/ReconciliationController';
import { payoutController } from '../controllers/PayoutController';
import { authMiddleware } from '../../../user-service/middleware/authMiddleware';
import { rateLimiter } from '../../../user-service/middleware/rateLimiter';

const router = Router();
const financeController = new FinanceController();

/**
 * @route GET /api/v1/finance/health
 * @desc Health check for finance service
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    service: 'finance-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/v1/finance/overview
 * @desc Get financial dashboard overview
 * @access Private (Admin/Vendor)
 */
router.get('/overview', 
  authMiddleware, 
  rateLimiter,
  financeController.getFinancialOverview.bind(financeController)
);

/**
 * @route GET /api/v1/finance/commissions/:vendorId
 * @desc Get vendor commission details
 * @access Private (Admin/Vendor)
 */
router.get('/commissions/:vendorId', 
  authMiddleware, 
  rateLimiter,
  financeController.getVendorCommissions.bind(financeController)
);

/**
 * @route POST /api/v1/finance/payouts/:vendorId
 * @desc Process vendor payout
 * @access Private (Admin)
 */
router.post('/payouts/:vendorId', 
  authMiddleware, 
  rateLimiter,
  financeController.processVendorPayout.bind(financeController)
);

/**
 * @route GET /api/v1/finance/platform/revenue
 * @desc Get platform revenue analytics
 * @access Private (Admin)
 */
router.get('/platform/revenue', 
  authMiddleware, 
  rateLimiter,
  financeController.getPlatformRevenue.bind(financeController)
);

/**
 * @route GET /api/v1/finance/reports
 * @desc Get financial reports
 * @access Private (Admin/Vendor)
 */
router.get('/reports', 
  authMiddleware, 
  rateLimiter,
  financeController.getFinancialReports.bind(financeController)
);

/**
 * @route GET /api/v1/finance/commission-settings
 * @desc Get commission rates and settings
 * @access Private (Admin/Vendor)
 */
router.get('/commission-settings', 
  authMiddleware, 
  rateLimiter,
  financeController.getCommissionSettings.bind(financeController)
);

/**
 * @route PUT /api/v1/finance/commission-settings
 * @desc Update commission settings
 * @access Private (Admin)
 */
router.put('/commission-settings', 
  authMiddleware, 
  rateLimiter,
  financeController.updateCommissionSettings.bind(financeController)
);

/**
 * @route GET /api/v1/finance/tax-reports
 * @desc Get tax reports (Bangladesh specific)
 * @access Private (Admin/Vendor)
 */
router.get('/tax-reports', 
  authMiddleware, 
  rateLimiter,
  financeController.getTaxReports.bind(financeController)
);

/**
 * @route GET /api/v1/finance/orders/:orderId/commission
 * @desc Calculate order commission
 * @access Private (Admin/Vendor)
 */
router.get('/orders/:orderId/commission', 
  authMiddleware, 
  rateLimiter,
  financeController.calculateOrderCommission.bind(financeController)
);

// ============= RECONCILIATION ROUTES =============

/**
 * @route POST /api/v1/finance/reconciliation/bank
 * @desc Perform bank statement reconciliation
 * @access Private (Admin)
 */
router.post('/reconciliation/bank',
  authMiddleware,
  rateLimiter,
  reconciliationController.performBankReconciliation.bind(reconciliationController)
);

/**
 * @route POST /api/v1/finance/reconciliation/payment-gateway
 * @desc Reconcile payment gateway transactions
 * @access Private (Admin)
 */
router.post('/reconciliation/payment-gateway',
  authMiddleware,
  rateLimiter,
  reconciliationController.reconcilePaymentGateway.bind(reconciliationController)
);

/**
 * @route POST /api/v1/finance/reconciliation/auto-match
 * @desc Perform automatic transaction matching
 * @access Private (Admin)
 */
router.post('/reconciliation/auto-match',
  authMiddleware,
  rateLimiter,
  reconciliationController.performAutomaticMatching.bind(reconciliationController)
);

/**
 * @route GET /api/v1/finance/reconciliation/summary
 * @desc Get reconciliation summary for period
 * @access Private (Admin)
 */
router.get('/reconciliation/summary',
  authMiddleware,
  rateLimiter,
  reconciliationController.getReconciliationSummary.bind(reconciliationController)
);

/**
 * @route GET /api/v1/finance/reconciliation/variance-report
 * @desc Generate reconciliation variance report
 * @access Private (Admin)
 */
router.get('/reconciliation/variance-report',
  authMiddleware,
  rateLimiter,
  reconciliationController.generateVarianceReport.bind(reconciliationController)
);

/**
 * @route POST /api/v1/finance/reconciliation/approve-matches
 * @desc Approve reconciliation matches
 * @access Private (Admin)
 */
router.post('/reconciliation/approve-matches',
  authMiddleware,
  rateLimiter,
  reconciliationController.approveMatches.bind(reconciliationController)
);

// ============= PAYOUT ROUTES =============

/**
 * @route POST /api/v1/finance/payouts/calculate
 * @desc Calculate vendor payout for period
 * @access Private (Admin/Vendor)
 */
router.post('/payouts/calculate',
  authMiddleware,
  rateLimiter,
  payoutController.calculateVendorPayout.bind(payoutController)
);

/**
 * @route POST /api/v1/finance/payouts/process
 * @desc Process vendor payout
 * @access Private (Admin)
 */
router.post('/payouts/process',
  authMiddleware,
  rateLimiter,
  payoutController.processVendorPayout.bind(payoutController)
);

/**
 * @route POST /api/v1/finance/payouts/batch
 * @desc Process batch payouts
 * @access Private (Admin)
 */
router.post('/payouts/batch',
  authMiddleware,
  rateLimiter,
  payoutController.processBatchPayouts.bind(payoutController)
);

/**
 * @route POST /api/v1/finance/payouts/adjust
 * @desc Apply payout adjustment
 * @access Private (Admin)
 */
router.post('/payouts/adjust',
  authMiddleware,
  rateLimiter,
  payoutController.applyPayoutAdjustment.bind(payoutController)
);

/**
 * @route POST /api/v1/finance/payouts/hold
 * @desc Hold vendor payout
 * @access Private (Admin)
 */
router.post('/payouts/hold',
  authMiddleware,
  rateLimiter,
  payoutController.holdVendorPayout.bind(payoutController)
);

/**
 * @route GET /api/v1/finance/payouts/summary
 * @desc Get payout summary for period
 * @access Private (Admin)
 */
router.get('/payouts/summary',
  authMiddleware,
  rateLimiter,
  payoutController.getPayoutSummary.bind(payoutController)
);

/**
 * @route GET /api/v1/finance/payouts/vendor/:vendorId/history
 * @desc Get vendor payout history
 * @access Private (Admin/Vendor)
 */
router.get('/payouts/vendor/:vendorId/history',
  authMiddleware,
  rateLimiter,
  payoutController.getVendorPayoutHistory.bind(payoutController)
);

export default router;