import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../../../db';
import { users, profiles, bangladeshUserProfiles, userActivityLogs } from '../../../../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import winston from 'winston';
import bcrypt from 'bcrypt';

// Logging setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/profile-controller.log' })
  ],
});

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    instagram: z.string().url().optional(),
  }).optional(),
  notificationSettings: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
    marketing: z.boolean().optional(),
  }).optional(),
  privacySettings: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
    showEmail: z.boolean().optional(),
    showPhone: z.boolean().optional(),
  }).optional(),
});

const updateBangladeshProfileSchema = z.object({
  nidNumber: z.string().length(10).optional(),
  passportNumber: z.string().optional(),
  division: z.enum([
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 
    'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'
  ]).optional(),
  district: z.string().min(2).max(50).optional(),
  upazila: z.string().min(2).max(50).optional(),
  postCode: z.string().length(4).optional(),
  preferredPaymentMethods: z.array(z.enum(['bkash', 'nagad', 'rocket', 'card', 'bank'])).optional(),
  mobileWalletNumbers: z.object({
    bkash: z.string().optional(),
    nagad: z.string().optional(),
    rocket: z.string().optional(),
  }).optional(),
  languagePreference: z.enum(['en', 'bn', 'both']).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export class ProfileController {
  // Get user profile with all related data
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || req.params.userId;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
        return;
      }

      // Get user basic info
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          phone: users.phone,
          fullName: users.fullName,
          avatar: users.avatar,
          role: users.role,
          isEmailVerified: users.isEmailVerified,
          isPhoneVerified: users.isPhoneVerified,
          preferredLanguage: users.preferredLanguage,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Get extended profile
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, parseInt(userId)))
        .limit(1);

      // Get Bangladesh-specific profile
      const [bangladeshProfile] = await db
        .select()
        .from(bangladeshUserProfiles)
        .where(eq(bangladeshUserProfiles.userId, parseInt(userId)))
        .limit(1);

      // Combine all profile data
      const completeProfile = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          preferredLanguage: user.preferredLanguage,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
        },
        profile: profile || {},
        bangladeshProfile: bangladeshProfile || {},
        completeness: this.calculateProfileCompleteness(user, profile, bangladeshProfile),
      };

      // Log profile access
      await this.logActivity(parseInt(userId), 'profile_viewed', 'user_profile', userId, {
        viewedBy: req.user?.userId,
        timestamp: new Date(),
      }, req);

      res.json({
        success: true,
        data: completeProfile,
      });
    } catch (error) {
      logger.error('Error fetching user profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.params.userId,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile',
      });
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const profileData = updateProfileSchema.parse(req.body);
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Check if profile exists
      const [existingProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, parseInt(userId)))
        .limit(1);

      let updatedProfile;

      if (existingProfile) {
        // Update existing profile
        [updatedProfile] = await db
          .update(profiles)
          .set({
            ...profileData,
            dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
            updatedAt: new Date(),
          })
          .where(eq(profiles.userId, parseInt(userId)))
          .returning();
      } else {
        // Create new profile
        [updatedProfile] = await db
          .insert(profiles)
          .values({
            userId: parseInt(userId),
            ...profileData,
            dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
      }

      // Log profile update
      await this.logActivity(parseInt(userId), 'profile_updated', 'user_profile', userId, {
        updatedFields: Object.keys(profileData),
        timestamp: new Date(),
      }, req);

      logger.info('User profile updated', {
        userId,
        updatedFields: Object.keys(profileData),
      });

      res.json({
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      logger.error('Error updating user profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid profile data',
      });
    }
  }

  // Update Bangladesh-specific profile
  async updateBangladeshProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const bangladeshData = updateBangladeshProfileSchema.parse(req.body);
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Check if Bangladesh profile exists
      const [existingProfile] = await db
        .select()
        .from(bangladeshUserProfiles)
        .where(eq(bangladeshUserProfiles.userId, parseInt(userId)))
        .limit(1);

      let updatedProfile;

      if (existingProfile) {
        // Update existing profile
        [updatedProfile] = await db
          .update(bangladeshUserProfiles)
          .set({
            ...bangladeshData,
            updatedAt: new Date(),
          })
          .where(eq(bangladeshUserProfiles.userId, parseInt(userId)))
          .returning();
      } else {
        // Create new profile
        [updatedProfile] = await db
          .insert(bangladeshUserProfiles)
          .values({
            userId: parseInt(userId),
            ...bangladeshData,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
      }

      // Log Bangladesh profile update
      await this.logActivity(parseInt(userId), 'bangladesh_profile_updated', 'bangladesh_profile', userId, {
        updatedFields: Object.keys(bangladeshData),
        timestamp: new Date(),
      }, req);

      logger.info('Bangladesh user profile updated', {
        userId,
        updatedFields: Object.keys(bangladeshData),
      });

      res.json({
        success: true,
        data: updatedProfile,
        message: 'Bangladesh profile updated successfully',
      });
    } catch (error) {
      logger.error('Error updating Bangladesh user profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid Bangladesh profile data',
      });
    }
  }

  // Change password
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const passwordData = changePasswordSchema.parse(req.body);
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Get current user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(passwordData.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
        });
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(passwordData.newPassword, 12);

      // Update password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, parseInt(userId)));

      // Log password change
      await this.logActivity(parseInt(userId), 'password_changed', 'user_security', userId, {
        timestamp: new Date(),
        security_event: true,
      }, req);

      logger.info('User password changed', {
        userId,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Error changing password', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password',
      });
    }
  }

  // Upload avatar
  async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const avatarUrl = req.body.avatarUrl;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      if (!avatarUrl) {
        res.status(400).json({
          success: false,
          error: 'Avatar URL is required',
        });
        return;
      }

      // Update user avatar
      await db
        .update(users)
        .set({
          avatar: avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, parseInt(userId)));

      // Log avatar update
      await this.logActivity(parseInt(userId), 'avatar_updated', 'user_profile', userId, {
        avatarUrl,
        timestamp: new Date(),
      }, req);

      logger.info('User avatar updated', {
        userId,
        avatarUrl,
      });

      res.json({
        success: true,
        data: { avatarUrl },
        message: 'Avatar updated successfully',
      });
    } catch (error) {
      logger.error('Error uploading avatar', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to upload avatar',
      });
    }
  }

  // Get user activity logs
  async getActivityLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Get activity logs
      const activityLogs = await db
        .select()
        .from(userActivityLogs)
        .where(eq(userActivityLogs.userId, parseInt(userId)))
        .orderBy(desc(userActivityLogs.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalCount = await db
        .select({ count: userActivityLogs.id })
        .from(userActivityLogs)
        .where(eq(userActivityLogs.userId, parseInt(userId)));

      res.json({
        success: true,
        data: {
          logs: activityLogs,
          pagination: {
            page,
            limit,
            total: totalCount.length,
            totalPages: Math.ceil(totalCount.length / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching activity logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch activity logs',
      });
    }
  }

  // Private helper methods
  private calculateProfileCompleteness(user: any, profile: any, bangladeshProfile: any): number {
    let completeness = 0;
    const totalFields = 15;

    // Basic user fields (5 points)
    if (user.email) completeness += 1;
    if (user.phone) completeness += 1;
    if (user.fullName) completeness += 1;
    if (user.avatar) completeness += 1;
    if (user.isEmailVerified && user.isPhoneVerified) completeness += 1;

    // Profile fields (5 points)
    if (profile?.firstName) completeness += 1;
    if (profile?.lastName) completeness += 1;
    if (profile?.dateOfBirth) completeness += 1;
    if (profile?.gender) completeness += 1;
    if (profile?.bio) completeness += 1;

    // Bangladesh profile fields (5 points)
    if (bangladeshProfile?.division) completeness += 1;
    if (bangladeshProfile?.district) completeness += 1;
    if (bangladeshProfile?.postCode) completeness += 1;
    if (bangladeshProfile?.preferredPaymentMethods?.length > 0) completeness += 1;
    if (bangladeshProfile?.languagePreference) completeness += 1;

    return Math.round((completeness / totalFields) * 100);
  }

  private async logActivity(
    userId: number,
    action: string,
    entityType: string,
    entityId: string,
    details: any,
    req: Request
  ): Promise<void> {
    try {
      await db.insert(userActivityLogs).values({
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        createdAt: new Date(),
      });
    } catch (error) {
      logger.error('Failed to log activity', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        action,
      });
    }
  }

  // Health check
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      service: 'profile-controller',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }
}