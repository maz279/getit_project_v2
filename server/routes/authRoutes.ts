import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import { validateRequest } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/security';

const router = Router();

// Enhanced login schema with multiple identifier support
const loginSchema = z.object({
  identifier: z.string().min(1, 'Username, email, or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
  deviceInfo: z.object({
    userAgent: z.string(),
    platform: z.string(),
    timestamp: z.string(),
  }).optional(),
});

// Enhanced registration schema
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  phoneNumber: z.string().optional(),
  preferredLanguage: z.enum(['en', 'bn']).default('en'),
  businessInfo: z.object({
    businessName: z.string(),
    businessType: z.string(),
    registrationNumber: z.string(),
    taxId: z.string(),
  }).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Login endpoint with enhanced authentication
router.post('/login', rateLimitMiddleware, validateRequest(loginSchema), async (req, res) => {
  try {
    const { identifier, password, rememberMe, deviceInfo } = req.body;

    // Find user by username, email, or phone
    let user;
    if (identifier.includes('@')) {
      user = await storage.getUserByEmail?.(identifier);
    } else if (identifier.match(/^\+?[\d\s-()]+$/)) {
      user = await storage.getUserByPhone?.(identifier);
    } else {
      user = await storage.getUserByUsername(identifier);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated. Please contact support.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback_secret',
      { 
        expiresIn: rememberMe ? '30d' : '7d',
        issuer: 'getit-bangladesh',
        audience: 'getit-users'
      }
    );

    // Update last login timestamp
    await storage.updateUserLastLogin?.(user.id);

    // Track login session
    if (storage.createUserSession) {
      await storage.createUserSession({
        userId: user.id,
        sessionToken: token,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        isActive: true,
        expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)),
      });
    }

    // Get user profile
    const userProfile = await storage.getUserProfile?.(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      profile: userProfile,
      token,
      message: 'Login successful'
    });

    // Track user behavior
    await storage.trackUserBehavior({
      userId: user.id,
      action: 'login',
      category: 'authentication',
      metadata: {
        loginMethod: identifier.includes('@') ? 'email' : identifier.match(/^\+?[\d\s-()]+$/) ? 'phone' : 'username',
        deviceInfo,
        ipAddress: req.ip,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Enhanced registration endpoint
router.post('/register', rateLimitMiddleware, validateRequest(registerSchema), async (req, res) => {
  try {
    const { password, confirmPassword, businessInfo, acceptTerms, ...userData } = req.body;

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    if (userData.email) {
      const existingEmailUser = await storage.getUserByEmail?.(userData.email);
      if (existingEmailUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'customer',
      isEmailVerified: false,
      isPhoneVerified: false,
      isActive: true,
      preferredLanguage: userData.preferredLanguage || 'en',
    });

    // Create user profile
    const defaultProfile = {
      userId: newUser.id,
      addresses: [],
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true,
          orderUpdates: true,
          promotions: true,
          recommendations: true,
        },
        privacy: {
          showOnlineStatus: true,
          shareDataForPersonalization: true,
          allowThirdPartyMarketing: false,
        },
        display: {
          theme: 'light' as const,
          currency: 'BDT' as const,
          language: userData.preferredLanguage || 'en' as const,
        },
      },
      loyaltyPoints: 0,
      membershipTier: 'bronze' as const,
      kycStatus: 'pending' as const,
      businessInfo: businessInfo || undefined,
    };

    const userProfile = await storage.createUserProfile?.(defaultProfile);

    // Create JWT token
    const tokenPayload = {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback_secret',
      { 
        expiresIn: '7d',
        issuer: 'getit-bangladesh',
        audience: 'getit-users'
      }
    );

    // Create user session
    if (storage.createUserSession) {
      await storage.createUserSession({
        userId: newUser.id,
        sessionToken: token,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    // Send verification email if email provided
    if (newUser.email) {
      // TODO: Implement email verification
      console.log('TODO: Send verification email to', newUser.email);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      user: userWithoutPassword,
      profile: userProfile,
      token,
      message: 'Registration successful'
    });

    // Track user behavior
    await storage.trackUserBehavior({
      userId: newUser.id,
      action: 'register',
      category: 'authentication',
      metadata: {
        registrationMethod: newUser.role,
        hasBusinessInfo: !!businessInfo,
        ipAddress: req.ip,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Logout endpoint
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (userId && token && storage.deactivateUserSession) {
      await storage.deactivateUserSession(token);
    }

    // Track logout behavior
    if (userId) {
      await storage.trackUserBehavior({
        userId,
        action: 'logout',
        category: 'authentication',
        metadata: {
          ipAddress: req.ip,
        },
      });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // TODO: Implement email verification logic
    // This would involve verifying the token and updating user's email verification status
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Phone verification endpoint
router.post('/verify-phone', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user?.userId;

    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    // TODO: Implement phone verification logic
    // This would involve verifying the SMS code and updating user's phone verification status
    
    res.json({ message: 'Phone verified successfully' });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({ error: 'Phone verification failed' });
  }
});

// Password reset request endpoint
router.post('/request-password-reset', rateLimitMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await storage.getUserByEmail?.(email);
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If your email is registered, you will receive a password reset link.' });
    }

    // TODO: Generate and send password reset token
    console.log('TODO: Send password reset email to', email);

    res.json({ message: 'If your email is registered, you will receive a password reset link.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// Password reset endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // TODO: Verify token and update password
    console.log('TODO: Reset password with token', token);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// 2FA endpoints
router.post('/enable-2fa', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    // TODO: Generate 2FA secret and QR code
    const secret = 'TODO_GENERATE_SECRET';
    const qrCode = 'TODO_GENERATE_QR_CODE';
    
    res.json({ secret, qrCode });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ error: '2FA setup failed' });
  }
});

router.post('/disable-2fa', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user?.userId;

    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    // TODO: Verify 2FA code and disable 2FA
    
    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: '2FA disable failed' });
  }
});

export default router;