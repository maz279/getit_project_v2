import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { ProfileController } from '../controllers/ProfileController';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleBasedAccess } from '../middleware/roleBasedAccess';
import { rateLimiter } from '../middleware/rateLimiter';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { validationSchemas } from '../utils/ValidationUtils';

const router = Router();

// Initialize controllers
const authController = new AuthController();
const profileController = new ProfileController();
const adminController = new AdminController();

// ======================
// AUTHENTICATION ROUTES
// ======================

// User Registration
router.post('/auth/register',
  rateLimiter.registration,
  validationMiddleware(validationSchemas.userRegistration),
  authController.register.bind(authController)
);

// User Login
router.post('/auth/login',
  rateLimiter.login,
  validationMiddleware(validationSchemas.userLogin),
  authController.login.bind(authController)
);

// User Logout
router.post('/auth/logout',
  authMiddleware,
  authController.logout.bind(authController)
);

// Refresh Token
router.post('/auth/refresh',
  authController.refreshToken.bind(authController)
);

// Email Verification
router.post('/auth/verify-email',
  validationMiddleware(validationSchemas.emailVerification),
  authController.verifyEmail.bind(authController)
);

// Resend Email Verification
router.post('/auth/resend-verification',
  rateLimiter.emailVerification,
  authController.resendEmailVerification.bind(authController)
);

// Phone Verification
router.post('/auth/verify-phone',
  validationMiddleware(validationSchemas.phoneVerification),
  authController.verifyPhone.bind(authController)
);

// Send Phone Verification
router.post('/auth/send-phone-verification',
  rateLimiter.phoneVerification,
  authController.sendPhoneVerification.bind(authController)
);

// Forgot Password
router.post('/auth/forgot-password',
  rateLimiter.forgotPassword,
  validationMiddleware(validationSchemas.forgotPassword),
  authController.forgotPassword.bind(authController)
);

// Reset Password
router.post('/auth/reset-password',
  validationMiddleware(validationSchemas.resetPassword),
  authController.resetPassword.bind(authController)
);

// ====================
// USER PROFILE ROUTES
// ====================

// Get Current User Profile
router.get('/profile',
  authMiddleware,
  profileController.getProfile.bind(profileController)
);

// Update User Profile
router.put('/profile',
  authMiddleware,
  validationMiddleware(validationSchemas.profileUpdate),
  profileController.updateProfile.bind(profileController)
);

// Update Bangladesh Profile
router.put('/bangladesh-profile',
  authMiddleware,
  validationMiddleware(validationSchemas.bangladeshProfile),
  profileController.updateBangladeshProfile.bind(profileController)
);

// Change Password
router.post('/change-password',
  authMiddleware,
  rateLimiter.passwordChange,
  validationMiddleware(validationSchemas.passwordChange),
  profileController.changePassword.bind(profileController)
);

// Upload Avatar
router.post('/upload-avatar',
  authMiddleware,
  profileController.uploadAvatar.bind(profileController)
);

// Get Activity Logs
router.get('/activity-logs',
  authMiddleware,
  profileController.getActivityLogs.bind(profileController)
);

// ====================
// TWO-FACTOR AUTH ROUTES
// ====================

// Enable 2FA
router.post('/2fa/enable',
  authMiddleware,
  authController.enable2FA.bind(authController)
);

// Disable 2FA
router.post('/2fa/disable',
  authMiddleware,
  authController.disable2FA.bind(authController)
);

// Verify 2FA
router.post('/2fa/verify',
  authMiddleware,
  authController.verify2FA.bind(authController)
);

// ======================
// ADMIN ROUTES
// ======================

// Get All Users (Admin/Moderator only)
router.get('/admin/users',
  authMiddleware,
  roleBasedAccess(['admin', 'moderator']),
  adminController.getAllUsers.bind(adminController)
);

// Get User Details (Admin/Moderator only)
router.get('/admin/users/:userId',
  authMiddleware,
  roleBasedAccess(['admin', 'moderator']),
  adminController.getUserDetails.bind(adminController)
);

// Create User (Admin only)
router.post('/admin/users',
  authMiddleware,
  roleBasedAccess(['admin']),
  validationMiddleware(validationSchemas.adminUserCreation),
  adminController.createUser.bind(adminController)
);

// Update User (Admin only)
router.put('/admin/users/:userId',
  authMiddleware,
  roleBasedAccess(['admin']),
  validationMiddleware(validationSchemas.adminUserUpdate),
  adminController.updateUser.bind(adminController)
);

// Ban User (Admin only)
router.post('/admin/users/:userId/ban',
  authMiddleware,
  roleBasedAccess(['admin']),
  validationMiddleware(validationSchemas.userBan),
  adminController.banUser.bind(adminController)
);

// Unban User (Admin only)
router.post('/admin/users/:userId/unban',
  authMiddleware,
  roleBasedAccess(['admin']),
  adminController.unbanUser.bind(adminController)
);

// Get System Statistics (Admin only)
router.get('/admin/stats',
  authMiddleware,
  roleBasedAccess(['admin']),
  adminController.getSystemStats.bind(adminController)
);

// ======================
// USER MANAGEMENT ROUTES
// ======================

// Get User by ID
router.get('/:userId',
  authMiddleware,
  async (req, res) => {
    try {
      // Check if user is accessing their own profile or is admin/moderator
      const requestingUserId = req.user?.userId;
      const targetUserId = req.params.userId;
      const userRole = req.user?.role;
      
      if (requestingUserId !== targetUserId && !['admin', 'moderator'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }
      
      // Forward to profile controller
      req.params.userId = targetUserId;
      await profileController.getProfile(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile',
      });
    }
  }
);

// Search Users (Admin/Moderator only)
router.get('/search/:query',
  authMiddleware,
  roleBasedAccess(['admin', 'moderator']),
  async (req, res) => {
    try {
      // Implement user search logic
      const query = req.params.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Add search functionality (to be implemented)
      res.json({
        success: true,
        data: {
          users: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Search failed',
      });
    }
  }
);

// ======================
// HEALTH CHECK ROUTES
// ======================

// User Service Health Check
router.get('/health',
  profileController.healthCheck.bind(profileController)
);

// Admin Service Health Check
router.get('/admin/health',
  adminController.healthCheck.bind(adminController)
);

// Detailed Health Check
router.get('/health/detailed',
  authMiddleware,
  roleBasedAccess(['admin']),
  async (req, res) => {
    try {
      res.json({
        service: 'user-service',
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV,
        features: {
          authentication: 'active',
          registration: 'active',
          profileManagement: 'active',
          emailVerification: 'active',
          phoneVerification: 'active',
          passwordReset: 'active',
          twoFactorAuth: 'active',
          adminPanel: 'active',
          bangladeshIntegration: 'active',
          activityLogging: 'active',
          securityMonitoring: 'active',
        },
        capabilities: [
          'multi-method-login',
          'social-authentication',
          'bangladesh-validation',
          'bengali-localization',
          'role-based-access',
          'session-management',
          'security-auditing',
          'admin-management',
          'profile-completeness',
          'activity-tracking',
        ],
      });
    } catch (error) {
      res.status(500).json({
        service: 'user-service',
        status: 'unhealthy',
        error: 'Health check failed',
      });
    }
  }
);

export default router;