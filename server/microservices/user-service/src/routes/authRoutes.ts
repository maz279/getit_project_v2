/**
 * Authentication Routes - Amazon.com/Shopee.sg Level Implementation
 * RESTful API endpoints for user authentication and management
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';

const router = Router();
const authController = new AuthController();

/**
 * Public Authentication Routes (no authentication required)
 */

// User Registration
router.post('/register', 
  rateLimitMiddleware(10, 60), // 10 attempts per minute
  authController.register.bind(authController)
);

// User Login
router.post('/login',
  rateLimitMiddleware(5, 300), // 5 attempts per 5 minutes
  authController.login.bind(authController)
);

/**
 * Protected Authentication Routes (require authentication)
 */

// User Logout
router.post('/logout',
  authMiddleware,
  authController.logout.bind(authController)
);

// Get Current User Profile  
router.get('/me',
  authMiddleware,
  authController.getCurrentUser.bind(authController)
);

// Update Current User Profile
router.put('/me',
  authMiddleware,
  authController.updateCurrentUser.bind(authController)
);

/**
 * Password Management Routes  
 */

// Forgot Password (public)
router.post('/forgot-password',
  rateLimitMiddleware(3, 300), // 3 attempts per 5 minutes
  authController.forgotPassword.bind(authController)
);

// Reset Password (public)
router.post('/reset-password',
  rateLimitMiddleware(3, 300), // 3 attempts per 5 minutes
  authController.resetPassword.bind(authController)
);

// Change Password (protected)
router.post('/change-password',
  authMiddleware,
  rateLimitMiddleware(5, 300), // 5 attempts per 5 minutes
  authController.changePassword.bind(authController)
);

/**
 * Email & Phone Verification Routes
 */

// Verify Email (public)
router.post('/verify-email',
  rateLimitMiddleware(5, 300), // 5 attempts per 5 minutes
  authController.verifyEmail.bind(authController)
);

// Verify Phone (protected)
router.post('/verify-phone',
  authMiddleware,
  rateLimitMiddleware(5, 300), // 5 attempts per 5 minutes
  authController.verifyPhone.bind(authController)
);

/**
 * Account Management Routes (Admin)
 */

// Activate User Account (admin only)
router.post('/:id/activate',
  authMiddleware,
  rateLimitMiddleware(10, 60), // 10 admin actions per minute
  authController.activateUser.bind(authController)
);

// Deactivate User Account (admin only)
router.post('/:id/deactivate',
  authMiddleware,
  rateLimitMiddleware(10, 60), // 10 admin actions per minute
  authController.deactivateUser.bind(authController)
);

// Get User by ID (admin only)
router.get('/:id',
  authMiddleware,
  authController.getUserById.bind(authController)
);

// Update User (admin only)
router.put('/:id',
  authMiddleware,
  rateLimitMiddleware(10, 60), // 10 admin actions per minute
  authController.updateUser.bind(authController)
);

// Delete User (admin only)
router.delete('/:id',
  authMiddleware,
  rateLimitMiddleware(5, 300), // 5 deletions per 5 minutes
  authController.deleteUser.bind(authController)
);

/**
 * User Listing Routes (Admin)
 */

// Get All Users (admin only)
router.get('/',
  authMiddleware,
  authController.getAllUsers.bind(authController)
);

/**
 * Health Check Route
 */
router.get('/health',
  authController.healthCheck.bind(authController)
);

export default router;