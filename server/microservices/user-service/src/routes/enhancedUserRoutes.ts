import { Router } from 'express';
import { BangladeshController } from '../controllers/BangladeshController';
import { SecurityController } from '../controllers/SecurityController';
import { SocialAuthController } from '../controllers/SocialAuthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import { 
  validateNID, 
  validatePhone, 
  validateMobileBanking, 
  validateAddress,
  validateMfaSetup,
  validateMfaVerification,
  validateSocialAuthCallback,
  validateSocialAccountLink,
  validateUserPreferences,
  validateSecurityEventQuery
} from '../middleware/validationMiddleware';

const router = Router();

// Initialize controllers
const bangladeshController = new BangladeshController();
const securityController = new SecurityController();
const socialAuthController = new SocialAuthController();

/**
 * Enhanced User Management Routes
 * Amazon.com/Shopee.sg-level comprehensive user management API
 */

// ============= BANGLADESH-SPECIFIC ROUTES =============
router.post('/bangladesh/validate-nid', 
  authMiddleware, 
  rateLimitMiddleware(5, 60), // 5 attempts per minute
  validateNID,
  bangladeshController.validateNID.bind(bangladeshController)
);

router.post('/bangladesh/validate-phone', 
  authMiddleware,
  rateLimitMiddleware(3, 60), // 3 attempts per minute
  validatePhone,
  bangladeshController.validateBangladeshPhone.bind(bangladeshController)
);

router.post('/bangladesh/link-mobile-banking', 
  authMiddleware,
  rateLimitMiddleware(5, 300), // 5 attempts per 5 minutes
  validateMobileBanking,
  bangladeshController.linkMobileBankingAccount.bind(bangladeshController)
);

router.post('/bangladesh/address', 
  authMiddleware,
  validateAddress,
  bangladeshController.createBangladeshAddress.bind(bangladeshController)
);

router.get('/bangladesh/health', 
  bangladeshController.healthCheck.bind(bangladeshController)
);

// ============= SECURITY ROUTES =============
router.post('/security/setup-mfa', 
  authMiddleware,
  rateLimitMiddleware(3, 300), // 3 attempts per 5 minutes
  securityController.setupMFA.bind(securityController)
);

router.post('/security/verify-mfa', 
  authMiddleware,
  rateLimitMiddleware(5, 300), // 5 attempts per 5 minutes
  securityController.verifyAndEnableMFA.bind(securityController)
);

router.post('/security/check-lockout', 
  rateLimitMiddleware(10, 60), // 10 checks per minute
  securityController.checkAccountLockout.bind(securityController)
);

router.post('/security/track-failed-login', 
  rateLimitMiddleware(20, 60), // 20 attempts per minute (for system use)
  securityController.trackFailedLogin.bind(securityController)
);

router.get('/security/suspicious-activity/:user_id', 
  authMiddleware,
  rateLimitMiddleware(10, 60), // 10 checks per minute
  securityController.detectSuspiciousActivity.bind(securityController)
);

router.get('/security/events/:user_id', 
  authMiddleware,
  rateLimitMiddleware(30, 60), // 30 requests per minute
  securityController.getSecurityEvents.bind(securityController)
);

router.get('/security/health', 
  securityController.healthCheck.bind(securityController)
);

// ============= SOCIAL AUTHENTICATION ROUTES =============
router.post('/auth/google/callback', 
  rateLimitMiddleware(10, 60), // 10 attempts per minute
  socialAuthController.googleCallback.bind(socialAuthController)
);

router.post('/auth/facebook/callback', 
  rateLimitMiddleware(10, 60), // 10 attempts per minute
  socialAuthController.facebookCallback.bind(socialAuthController)
);

router.post('/social/link', 
  authMiddleware,
  rateLimitMiddleware(5, 300), // 5 attempts per 5 minutes
  socialAuthController.linkSocialAccount.bind(socialAuthController)
);

router.post('/social/unlink', 
  authMiddleware,
  rateLimitMiddleware(5, 300), // 5 attempts per 5 minutes
  socialAuthController.unlinkSocialAccount.bind(socialAuthController)
);

router.get('/social/accounts/:user_id', 
  authMiddleware,
  rateLimitMiddleware(30, 60), // 30 requests per minute
  socialAuthController.getLinkedAccounts.bind(socialAuthController)
);

router.get('/social/health', 
  socialAuthController.healthCheck.bind(socialAuthController)
);

// ============= ADVANCED USER MANAGEMENT ROUTES =============

/**
 * @route GET /api/v1/users/enhanced/profile/:user_id
 * @desc Get comprehensive user profile with Bangladesh data
 * @access Private
 */
router.get('/enhanced/profile/:user_id', authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // This would integrate with all the enhanced controllers
    // to provide a comprehensive user profile
    
    res.json({
      success: true,
      message: 'Enhanced profile endpoint - integration pending',
      userId: user_id
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Enhanced profile retrieval failed',
      details: error.message
    });
  }
});

/**
 * @route PUT /api/v1/users/enhanced/preferences/:user_id
 * @desc Update user preferences with Bangladesh-specific options
 * @access Private
 */
router.put('/enhanced/preferences/:user_id', authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;
    const preferences = req.body;
    
    // This would update user preferences including:
    // - Language (Bengali/English)
    // - Currency (BDT/USD)
    // - Cultural preferences
    // - Notification settings
    
    res.json({
      success: true,
      message: 'Enhanced preferences endpoint - integration pending',
      userId: user_id,
      preferences
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Preferences update failed',
      details: error.message
    });
  }
});

/**
 * @route GET /api/v1/users/enhanced/verification-status/:user_id
 * @desc Get comprehensive verification status (email, phone, NID, etc.)
 * @access Private
 */
router.get('/enhanced/verification-status/:user_id', authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // This would check all verification statuses:
    // - Email verification
    // - Phone verification
    // - NID verification
    // - MFA status
    // - Social account links
    
    res.json({
      success: true,
      message: 'Enhanced verification status endpoint - integration pending',
      userId: user_id
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Verification status check failed',
      details: error.message
    });
  }
});

// ============= GDPR COMPLIANCE ROUTES =============

/**
 * @route GET /api/v1/users/gdpr/export/:user_id
 * @desc Export all user data for GDPR compliance
 * @access Private
 */
router.get('/gdpr/export/:user_id', authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // This would export all user data in machine-readable format
    // for GDPR compliance
    
    res.json({
      success: true,
      message: 'GDPR export endpoint - integration pending',
      userId: user_id
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'GDPR export failed',
      details: error.message
    });
  }
});

/**
 * @route DELETE /api/v1/users/gdpr/delete/:user_id
 * @desc Delete user account and anonymize data for GDPR compliance
 * @access Private
 */
router.delete('/gdpr/delete/:user_id', authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // This would handle account deletion and data anonymization
    // while preserving necessary business records
    
    res.json({
      success: true,
      message: 'GDPR deletion endpoint - integration pending',
      userId: user_id
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'GDPR deletion failed',
      details: error.message
    });
  }
});

export default router;