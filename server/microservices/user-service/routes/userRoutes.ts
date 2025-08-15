import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../../db';
import { users, profiles, insertUserSchema, insertProfileSchema } from '@shared/schema';
import { eq, and, or, desc, asc, count } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/authMiddleware';
import { profileValidation } from '../middleware/profileValidation';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// User authentication and profile management routes
// Amazon/Shopee-level user service with comprehensive features

/**
 * @route POST /api/v1/users/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', rateLimiter, async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await db.select().from(users)
      .where(or(
        eq(users.email, validatedData.email!),
        eq(users.username, validatedData.username),
        eq(users.phone, validatedData.phone!)
      ));
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email, username, or phone',
        code: 'USER_EXISTS'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Create user
    const [newUser] = await db.insert(users).values({
      ...validatedData,
      password: hashedPassword
    }).returning();
    
    // Create user profile
    const [profile] = await db.insert(profiles).values({
      userId: newUser.id,
      firstName: validatedData.fullName?.split(' ')[0] || '',
      lastName: validatedData.fullName?.split(' ').slice(1).join(' ') || ''
    }).returning();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          phone: newUser.phone,
          fullName: newUser.fullName,
          role: newUser.role,
          preferredLanguage: newUser.preferredLanguage
        },
        profile,
        token
      }
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/users/login
 * @desc Authenticate user and return token
 * @access Public
 */
router.post('/login', rateLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username/phone and password',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    // Find user by email, username, or phone
    const [user] = await db.select().from(users)
      .where(or(
        eq(users.email, identifier),
        eq(users.username, identifier),
        eq(users.phone, identifier)
      ));
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or account inactive',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          preferredLanguage: user.preferredLanguage
        },
        token
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/users/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const [userProfile] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      phone: users.phone,
      fullName: users.fullName,
      avatar: users.avatar,
      role: users.role,
      isEmailVerified: users.isEmailVerified,
      isPhoneVerified: users.isPhoneVerified,
      dateOfBirth: users.dateOfBirth,
      gender: users.gender,
      preferredLanguage: users.preferredLanguage,
      createdAt: users.createdAt,
      profile: {
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        address: profiles.address,
        preferences: profiles.preferences,
        emergencyContacts: profiles.emergencyContacts
      }
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.id, userId));
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route PUT /api/v1/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authMiddleware, profileValidation, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { user: userData, profile: profileData } = req.body;
    
    // Update user data if provided
    if (userData) {
      await db.update(users)
        .set({
          ...userData,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    }
    
    // Update profile data if provided
    if (profileData) {
      await db.update(profiles)
        .set({
          ...profileData,
          updatedAt: new Date()
        })
        .where(eq(profiles.userId, userId));
    }
    
    // Get updated profile
    const [updatedProfile] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      phone: users.phone,
      fullName: users.fullName,
      avatar: users.avatar,
      role: users.role,
      preferredLanguage: users.preferredLanguage,
      profile: {
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        address: profiles.address,
        preferences: profiles.preferences
      }
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.id, userId));
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/users
 * @desc Get all users (Admin only)
 * @access Private (Admin)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
        code: 'ACCESS_DENIED'
      });
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      phone: users.phone,
      fullName: users.fullName,
      role: users.role,
      isActive: users.isActive,
      isEmailVerified: users.isEmailVerified,
      isPhoneVerified: users.isPhoneVerified,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);
    
    const [{ count: totalUsers }] = await db.select({ count: count() }).from(users);
    
    res.json({
      success: true,
      data: {
        users: allUsers,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;