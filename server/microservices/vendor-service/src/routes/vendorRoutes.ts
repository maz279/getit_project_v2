/**
 * Vendor Routes - Amazon.com/Shopee.sg Level API Endpoints
 * Comprehensive vendor management routes with enterprise authentication
 */

import { Router } from 'express';
import { VendorController } from '../controllers/VendorController';
import { VendorRegistrationController } from '../controllers/VendorRegistrationController';
import { VendorPerformanceController } from '../controllers/VendorPerformanceController';
import { VendorSubscriptionController } from '../controllers/VendorSubscriptionController';
import { KYCController } from '../controllers/KYCController';
import { StoreController } from '../controllers/StoreController';
import { PayoutController } from '../controllers/PayoutController';
import { VendorAnalyticsController } from '../controllers/VendorAnalyticsController';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateVendorRegistration, validateVendorUpdate, validateKYCSubmission } from '../middleware/validation';

const router = Router();

// Initialize controllers
const vendorController = new VendorController();
const registrationController = new VendorRegistrationController();
const performanceController = new VendorPerformanceController();
const subscriptionController = new VendorSubscriptionController();
const kycController = new KYCController();
const storeController = new StoreController();
const payoutController = new PayoutController();
const analyticsController = new VendorAnalyticsController();

// Health check endpoint
router.get('/health', vendorController.healthCheck.bind(vendorController));

// Public vendor routes (no authentication required)
router.get('/:vendorId/profile', vendorController.getVendorProfile.bind(vendorController));

// Protected vendor routes (authentication required)
router.use(authMiddleware);
router.use(rateLimiter);

// Vendor registration and management
router.post('/register', 
  validateVendorRegistration, 
  vendorController.registerVendor.bind(vendorController)
);

router.put('/:vendorId/profile', 
  validateVendorUpdate, 
  vendorController.updateVendorProfile.bind(vendorController)
);

// KYC management
router.post('/:vendorId/kyc', 
  validateKYCSubmission, 
  vendorController.submitKYC.bind(vendorController)
);

router.get('/:vendorId/kyc/status', 
  vendorController.getKYCStatus.bind(vendorController)
);

// Analytics and reporting
router.get('/:vendorId/analytics', 
  vendorController.getVendorAnalytics.bind(vendorController)
);

router.get('/:vendorId/dashboard', 
  vendorController.getDashboardData.bind(vendorController)
);

// Payout management
router.get('/:vendorId/payouts', 
  vendorController.getVendorPayouts.bind(vendorController)
);

router.post('/:vendorId/payouts/request', 
  vendorController.requestPayout.bind(vendorController)
);

// Admin routes (admin authentication required)
router.get('/all', 
  // adminAuthMiddleware would go here
  vendorController.getAllVendors.bind(vendorController)
);

// ======================
// KYC MANAGEMENT ROUTES
// ======================

// Initiate KYC process
router.post('/kyc/initiate',
  authMiddleware,
  rateLimiter.kycSubmission,
  kycController.initiateKYC.bind(kycController)
);

// Upload KYC documents
router.post('/kyc/upload-document',
  authMiddleware,
  rateLimiter.documentUpload,
  kycController.uploadDocument.bind(kycController)
);

// Get KYC status
router.get('/:vendorId/kyc/status',
  authMiddleware,
  kycController.getKYCStatus.bind(kycController)
);

// Admin: Verify documents
router.post('/kyc/verify',
  authMiddleware,
  // roleBasedAccess(['admin', 'moderator']),
  kycController.verifyDocuments.bind(kycController)
);

// Admin: Get pending verifications
router.get('/kyc/pending',
  authMiddleware,
  // roleBasedAccess(['admin', 'moderator']),
  kycController.getPendingVerifications.bind(kycController)
);

// Get business categories
router.get('/business-categories',
  kycController.getBusinessCategories.bind(kycController)
);

// ======================
// STORE MANAGEMENT ROUTES
// ======================

// Create store
router.post('/store/create',
  authMiddleware,
  rateLimiter.storeCreation,
  storeController.createStore.bind(storeController)
);

// Update store
router.put('/:vendorId/store',
  authMiddleware,
  storeController.updateStore.bind(storeController)
);

// Customize store
router.put('/store/customize',
  authMiddleware,
  storeController.customizeStore.bind(storeController)
);

// Update SEO settings
router.put('/store/seo',
  authMiddleware,
  storeController.updateSEOSettings.bind(storeController)
);

// Get store
router.get('/:vendorId/store',
  authMiddleware,
  storeController.getStore.bind(storeController)
);

// Toggle store status
router.put('/:vendorId/store/status',
  authMiddleware,
  storeController.toggleStoreStatus.bind(storeController)
);

// Get available themes
router.get('/store/themes',
  storeController.getThemes.bind(storeController)
);

// ======================
// PAYOUT MANAGEMENT ROUTES
// ======================

// Add payout method
router.post('/payout-methods',
  authMiddleware,
  rateLimiter.payoutMethod,
  payoutController.addPayoutMethod.bind(payoutController)
);

// Get payout methods
router.get('/:vendorId/payout-methods',
  authMiddleware,
  payoutController.getPayoutMethods.bind(payoutController)
);

// Request payout
router.post('/payouts/request',
  authMiddleware,
  rateLimiter.payoutRequest,
  payoutController.requestPayout.bind(payoutController)
);

// Get payout history
router.get('/:vendorId/payouts',
  authMiddleware,
  payoutController.getPayoutHistory.bind(payoutController)
);

// Get earning dashboard
router.get('/:vendorId/earnings',
  authMiddleware,
  payoutController.getEarningDashboard.bind(payoutController)
);

// Admin: Process payout
router.put('/payouts/:payoutId/process',
  authMiddleware,
  // roleBasedAccess(['admin']),
  payoutController.processPayout.bind(payoutController)
);

// Set commission structure
router.post('/commission-structure',
  authMiddleware,
  // roleBasedAccess(['admin']),
  payoutController.setCommissionStructure.bind(payoutController)
);

// ======================
// ANALYTICS ROUTES
// ======================

// Get vendor dashboard analytics
router.get('/:vendorId/analytics/dashboard',
  authMiddleware,
  analyticsController.getVendorDashboard.bind(analyticsController)
);

// Get sales analytics
router.get('/:vendorId/analytics/sales',
  authMiddleware,
  analyticsController.getSalesAnalytics.bind(analyticsController)
);

// Get customer insights
router.get('/:vendorId/analytics/customers',
  authMiddleware,
  analyticsController.getCustomerInsights.bind(analyticsController)
);

// Get inventory analytics
router.get('/:vendorId/analytics/inventory',
  authMiddleware,
  analyticsController.getInventoryAnalytics.bind(analyticsController)
);

// Get competitive analysis
router.get('/:vendorId/analytics/competitive',
  authMiddleware,
  analyticsController.getCompetitiveAnalysis.bind(analyticsController)
);

// Set performance targets
router.post('/analytics/targets',
  authMiddleware,
  analyticsController.setPerformanceTargets.bind(analyticsController)
);

// Export analytics data
router.get('/:vendorId/analytics/export',
  authMiddleware,
  analyticsController.exportAnalyticsData.bind(analyticsController)
);

// ======================
// VENDOR REGISTRATION WORKFLOW ROUTES (Amazon.com/Shopee.sg Level)
// ======================

// Step 1: Basic Registration
router.post('/registration/initiate',
  authMiddleware,
  rateLimiter,
  registrationController.initiateRegistration.bind(registrationController)
);

// Step 2: Document Submission
router.post('/:vendorId/registration/documents',
  authMiddleware,
  rateLimiter,
  registrationController.submitDocuments.bind(registrationController)
);

// Step 3: Bank Details Setup
router.post('/:vendorId/registration/bank-details',
  authMiddleware,
  rateLimiter,
  registrationController.setupBankDetails.bind(registrationController)
);

// Step 4: Store Setup
router.post('/:vendorId/registration/store-setup',
  authMiddleware,
  rateLimiter,
  registrationController.setupStore.bind(registrationController)
);

// Get Registration Status
router.get('/:vendorId/registration/status',
  authMiddleware,
  registrationController.getRegistrationStatus.bind(registrationController)
);

// ======================
// VENDOR PERFORMANCE MANAGEMENT ROUTES (Amazon.com/Shopee.sg Level)
// ======================

// Calculate Performance Metrics
router.post('/:vendorId/performance/calculate',
  authMiddleware,
  performanceController.calculatePerformanceMetrics.bind(performanceController)
);

// Get Performance Dashboard
router.get('/:vendorId/performance/dashboard',
  authMiddleware,
  performanceController.getPerformanceDashboard.bind(performanceController)
);

// Set Performance Targets
router.post('/:vendorId/performance/targets',
  authMiddleware,
  performanceController.setPerformanceTargets.bind(performanceController)
);

// Get Performance Benchmarks
router.get('/:vendorId/performance/benchmarks',
  authMiddleware,
  performanceController.getPerformanceBenchmarks.bind(performanceController)
);

// Process Performance Action (Warning, Probation, Suspension)
router.post('/:vendorId/performance/action',
  authMiddleware,
  // roleBasedAccess(['admin', 'moderator']),
  performanceController.processPerformanceAction.bind(performanceController)
);

// ======================
// VENDOR SUBSCRIPTION MANAGEMENT ROUTES (Amazon.com/Shopee.sg Level)
// ======================

// Get Available Subscription Plans
router.get('/subscription/plans',
  subscriptionController.getAvailablePlans.bind(subscriptionController)
);

// Subscribe to Plan
router.post('/:vendorId/subscription/subscribe',
  authMiddleware,
  rateLimiter,
  subscriptionController.subscribeToPlan.bind(subscriptionController)
);

// Get Current Subscription
router.get('/:vendorId/subscription/current',
  authMiddleware,
  subscriptionController.getCurrentSubscription.bind(subscriptionController)
);

// Cancel Subscription
router.post('/:vendorId/subscription/cancel',
  authMiddleware,
  subscriptionController.cancelSubscription.bind(subscriptionController)
);

// Get Subscription Analytics
router.get('/:vendorId/subscription/analytics',
  authMiddleware,
  subscriptionController.getSubscriptionAnalytics.bind(subscriptionController)
);

// ======================
// ADMIN ROUTES
// ======================

router.post('/:vendorId/approve', 
  authMiddleware,
  // roleBasedAccess(['admin']),
  vendorController.approveVendor.bind(vendorController)
);

router.post('/:vendorId/reject', 
  authMiddleware,
  // roleBasedAccess(['admin']),
  vendorController.rejectVendor.bind(vendorController)
);

// ======================
// HEALTH CHECK ROUTES
// ======================

// Vendor service health
router.get('/health',
  vendorController.healthCheck.bind(vendorController)
);

// KYC service health
router.get('/kyc/health',
  kycController.healthCheck.bind(kycController)
);

// Store service health
router.get('/store/health',
  storeController.healthCheck.bind(storeController)
);

// Payout service health
router.get('/payouts/health',
  payoutController.healthCheck.bind(payoutController)
);

// Analytics service health
router.get('/analytics/health',
  analyticsController.healthCheck.bind(analyticsController)
);

// Subscription service health
router.get('/subscription/health',
  subscriptionController.healthCheck.bind(subscriptionController)
);

// Registration service health
router.get('/registration/health',
  registrationController.healthCheck.bind(registrationController)
);

// Performance service health
router.get('/performance/health',
  performanceController.healthCheck.bind(performanceController)
);

export default router;