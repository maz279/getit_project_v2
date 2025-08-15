import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import { requestTrackingMiddleware, responseHelpers } from '../utils/standardApiResponse';

const router = express.Router();

// Apply middleware
router.use(requestTrackingMiddleware);

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Login endpoint
const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
  language: z.enum(['en', 'bn']).default('en'),
});

router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password, rememberMe, language } = loginSchema.parse(req.body);
    
    // Find user by email or phone
    const users = await storage.getUsers();
    const user = users.find(u => 
      u.email === emailOrPhone || 
      u.phoneNumber === emailOrPhone ||
      u.phone === emailOrPhone
    );
    
    if (!user) {
      return responseHelpers.unauthorized(req, res, 
        language === 'bn' ? 'ভুল ইমেইল/ফোন বা পাসওয়ার্ড' : 'Invalid email/phone or password'
      );
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      return responseHelpers.unauthorized(req, res, 
        language === 'bn' ? 'ভুল ইমেইল/ফোন বা পাসওয়ার্ড' : 'Invalid email/phone or password'
      );
    }
    
    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'customer',
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: rememberMe ? '30d' : JWT_EXPIRES_IN,
    });
    
    // Remove password from user data
    const { password: _, ...userWithoutPassword } = user;
    
    return responseHelpers.success(req, res, {
      user: userWithoutPassword,
      token,
      expiresIn: rememberMe ? '30d' : JWT_EXPIRES_IN,
    }, language === 'bn' ? 'সফলভাবে লগইন হয়েছে' : 'Login successful');
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responseHelpers.badRequest(req, res, 'Validation error', error.errors);
    }
    
    return responseHelpers.internalServerError(req, res, 'Login failed', error.message);
  }
});

// Signup endpoint schema - maps frontend form fields to backend user schema
const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(11, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  city: z.string().min(1, 'City is required'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  subscribeNewsletter: z.boolean().default(false),
  language: z.enum(['en', 'bn']).default('en'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

router.post('/signup', async (req, res) => {
  try {
    const userData = signupSchema.parse(req.body);
    const { confirmPassword, language, agreeToTerms, subscribeNewsletter, ...userDataForStorage } = userData;
    
    // Check if user already exists
    const existingUsers = await storage.getUsers();
    const existingUser = existingUsers.find(u => 
      u.email === userData.email || 
      u.phoneNumber === userData.phoneNumber ||
      u.phone === userData.phoneNumber
    );
    
    if (existingUser) {
      return responseHelpers.conflict(req, res, 
        language === 'bn' ? 'এই ইমেইল বা ফোন নম্বর ইতিমধ্যে ব্যবহৃত হয়েছে' : 'Email or phone number already exists'
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Generate username from email
    const username = userData.email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 4);

    // Create user data
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: username,
      name: userData.fullName,
      email: userData.email,
      phone: userData.phoneNumber,
      phoneNumber: userData.phoneNumber,
      password: hashedPassword,
      role: 'customer' as const,
      city: userData.city,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      preferences: {
        language,
        subscribeNewsletter,
      },
      isEmailVerified: false,
      isPhoneVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Create user
    const createdUser = await storage.createUser(newUser);
    
    // Generate JWT token
    const tokenPayload = {
      userId: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = createdUser;
    
    return responseHelpers.created(req, res, {
      user: userWithoutPassword,
      token,
      expiresIn: JWT_EXPIRES_IN,
    }, language === 'bn' ? 'একাউন্ট সফলভাবে তৈরি হয়েছে' : 'Account created successfully');
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responseHelpers.badRequest(req, res, 'Validation error', error.errors);
    }
    
    return responseHelpers.internalServerError(req, res, 'Signup failed', error.message);
  }
});

// Get current user endpoint
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return responseHelpers.unauthorized(req, res, 'Access token required');
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const users = await storage.getUsers();
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return responseHelpers.unauthorized(req, res, 'User not found');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    return responseHelpers.success(req, res, { user: userWithoutPassword });
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return responseHelpers.unauthorized(req, res, 'Invalid token');
    }
    
    return responseHelpers.internalServerError(req, res, 'Failed to get user info', error.message);
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { language } = req.body;
    
    // In a real app, you'd maintain a blacklist of tokens or use Redis
    // For now, we'll just return success as client will remove the token
    
    return responseHelpers.success(req, res, {}, 
      language === 'bn' ? 'সফলভাবে লগআউট হয়েছে' : 'Logged out successfully'
    );
  } catch (error) {
    return responseHelpers.internalServerError(req, res, 'Logout failed', error.message);
  }
});

// Social auth endpoints (Google, Facebook, Apple)
router.get('/google', (req, res) => {
  // In production, this would redirect to Google OAuth
  // For demo purposes, we'll simulate the process
  const redirectUrl = `/api/auth/google/callback?code=demo_code&state=demo_state`;
  res.redirect(redirectUrl);
});

router.get('/google/callback', async (req, res) => {
  try {
    // In production, this would exchange the code for tokens and get user info
    // For demo purposes, we'll create a demo user
    const demoUser = {
      id: `google_user_${Date.now()}`,
      name: 'Google Demo User',
      email: 'demo@google.com',
      role: 'customer' as const,
      isEmailVerified: true,
      socialProvider: 'google',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Generate JWT token
    const token = jwt.sign({
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // Redirect to frontend with token
    res.redirect(`/?token=${token}&provider=google`);
    
  } catch (error) {
    res.redirect('/?error=social_login_failed');
  }
});

router.get('/facebook', (req, res) => {
  const redirectUrl = `/api/auth/facebook/callback?code=demo_code&state=demo_state`;
  res.redirect(redirectUrl);
});

router.get('/facebook/callback', async (req, res) => {
  try {
    const demoUser = {
      id: `facebook_user_${Date.now()}`,
      name: 'Facebook Demo User',
      email: 'demo@facebook.com',
      role: 'customer' as const,
      isEmailVerified: true,
      socialProvider: 'facebook',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const token = jwt.sign({
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.redirect(`/?token=${token}&provider=facebook`);
    
  } catch (error) {
    res.redirect('/?error=social_login_failed');
  }
});

router.get('/apple', (req, res) => {
  const redirectUrl = `/api/auth/apple/callback?code=demo_code&state=demo_state`;
  res.redirect(redirectUrl);
});

router.get('/apple/callback', async (req, res) => {
  try {
    const demoUser = {
      id: `apple_user_${Date.now()}`,
      name: 'Apple Demo User',
      email: 'demo@apple.com',
      role: 'customer' as const,
      isEmailVerified: true,
      socialProvider: 'apple',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const token = jwt.sign({
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.redirect(`/?token=${token}&provider=apple`);
    
  } catch (error) {
    res.redirect('/?error=social_login_failed');
  }
});

// Password reset endpoints
router.post('/forgot-password', async (req, res) => {
  try {
    const { emailOrPhone, language } = req.body;
    
    // In production, this would send a password reset email/SMS
    // For demo purposes, we'll just return success
    
    return responseHelpers.success(req, res, {}, 
      language === 'bn' ? 'পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে' : 'Password reset link sent'
    );
  } catch (error) {
    return responseHelpers.internalServerError(req, res, 'Password reset failed', error.message);
  }
});

export default router;