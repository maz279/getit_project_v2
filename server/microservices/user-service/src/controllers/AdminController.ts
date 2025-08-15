import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../../../db';
import { users, profiles, bangladeshUserProfiles, userSessions, userSecurityEvents } from '../../../../../shared/schema';
import { eq, desc, asc, like, or, and, count, sql } from 'drizzle-orm';
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
    new winston.transports.File({ filename: 'logs/admin-controller.log' })
  ],
});

// Validation schemas
const userFilterSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['customer', 'vendor', 'admin', 'moderator']).optional(),
  status: z.enum(['active', 'inactive', 'banned']).optional(),
  isEmailVerified: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'lastLoginAt', 'username', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  fullName: z.string().min(1).max(100).optional(),
  role: z.enum(['customer', 'vendor', 'admin', 'moderator']).optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
  preferredLanguage: z.enum(['en', 'bn']).optional(),
});

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(100),
  role: z.enum(['customer', 'vendor', 'admin', 'moderator']).default('customer'),
  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),
  preferredLanguage: z.enum(['en', 'bn']).default('en'),
});

const banUserSchema = z.object({
  reason: z.string().min(10).max(500),
  duration: z.number().optional(), // Days, if not provided = permanent
  banType: z.enum(['temporary', 'permanent']).default('temporary'),
});

export class AdminController {
  // Get all users with advanced filtering and pagination
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      // Check admin permissions
      if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
        });
        return;
      }

      const filters = userFilterSchema.parse(req.query);
      const offset = (filters.page - 1) * filters.limit;

      // Build where conditions
      const whereConditions = [];

      if (filters.search) {
        whereConditions.push(
          or(
            like(users.username, `%${filters.search}%`),
            like(users.email, `%${filters.search}%`),
            like(users.fullName, `%${filters.search}%`)
          )
        );
      }

      if (filters.role) {
        whereConditions.push(eq(users.role, filters.role));
      }

      if (filters.status === 'active') {
        whereConditions.push(eq(users.isActive, true));
      } else if (filters.status === 'inactive') {
        whereConditions.push(eq(users.isActive, false));
      }

      if (filters.isEmailVerified !== undefined) {
        whereConditions.push(eq(users.isEmailVerified, filters.isEmailVerified));
      }

      if (filters.isPhoneVerified !== undefined) {
        whereConditions.push(eq(users.isPhoneVerified, filters.isPhoneVerified));
      }

      if (filters.dateFrom) {
        whereConditions.push(sql`${users.createdAt} >= ${new Date(filters.dateFrom)}`);
      }

      if (filters.dateTo) {
        whereConditions.push(sql`${users.createdAt} <= ${new Date(filters.dateTo)}`);
      }

      // Get users with pagination
      const userList = await db
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
          isActive: users.isActive,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(
          filters.sortOrder === 'desc' 
            ? desc(users[filters.sortBy]) 
            : asc(users[filters.sortBy])
        )
        .limit(filters.limit)
        .offset(offset);

      // Get total count
      const [totalResult] = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(whereConditions.length ? and(...whereConditions) : undefined);

      const total = Number(totalResult.count);

      // Get user statistics
      const stats = await this.getUserStatistics();

      res.json({
        success: true,
        data: {
          users: userList,
          pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            totalPages: Math.ceil(total / filters.limit),
          },
          statistics: stats,
          appliedFilters: filters,
        },
      });
    } catch (error) {
      logger.error('Error fetching users', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: req.query,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
      });
    }
  }

  // Get user details by ID (admin view)
  async getUserDetails(req: Request, res: Response): Promise<void> {
    try {
      // Check admin permissions
      if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
        });
        return;
      }

      const { userId } = req.params;

      // Get user basic info
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

      // Get extended profile
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, parseInt(userId)))
        .limit(1);

      // Get Bangladesh profile
      const [bangladeshProfile] = await db
        .select()
        .from(bangladeshUserProfiles)
        .where(eq(bangladeshUserProfiles.userId, parseInt(userId)))
        .limit(1);

      // Get active sessions
      const activeSessions = await db
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.userId, parseInt(userId)),
            eq(userSessions.isActive, true),
            sql`${userSessions.expiresAt} > NOW()`
          )
        );

      // Get recent security events
      const securityEvents = await db
        .select()
        .from(userSecurityEvents)
        .where(eq(userSecurityEvents.userId, parseInt(userId)))
        .orderBy(desc(userSecurityEvents.createdAt))
        .limit(10);

      // Exclude sensitive information
      const { password, ...userSafe } = user;

      res.json({
        success: true,
        data: {
          user: userSafe,
          profile: profile || {},
          bangladeshProfile: bangladeshProfile || {},
          activeSessions: activeSessions.length,
          sessionDetails: activeSessions,
          securityEvents,
          accountStatus: {
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            lastLogin: user.lastLoginAt,
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching user details', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.params.userId,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user details',
      });
    }
  }

  // Create new user (admin only)
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // Check admin permissions
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Admin access required',
        });
        return;
      }

      const userData = createUserSchema.parse(req.body);

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(
          or(
            eq(users.username, userData.username),
            eq(users.email, userData.email)
          )
        )
        .limit(1);

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'User already exists with this username or email',
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          username: userData.username,
          password: hashedPassword,
          email: userData.email,
          phone: userData.phone,
          fullName: userData.fullName,
          role: userData.role,
          isEmailVerified: userData.isEmailVerified,
          isPhoneVerified: userData.isPhoneVerified,
          preferredLanguage: userData.preferredLanguage,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Log user creation
      await this.logSecurityEvent(
        newUser.id,
        'user_created_by_admin',
        `User created by admin ${req.user?.userId}`,
        'medium',
        {
          createdBy: req.user?.userId,
          userRole: userData.role,
        },
        req
      );

      logger.info('User created by admin', {
        newUserId: newUser.id,
        adminId: req.user?.userId,
        role: userData.role,
      });

      const { password, ...userSafe } = newUser;

      res.status(201).json({
        success: true,
        data: userSafe,
        message: 'User created successfully',
      });
    } catch (error) {
      logger.error('Error creating user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminId: req.user?.userId,
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      });
    }
  }

  // Update user (admin only)
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      // Check admin permissions
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Admin access required',
        });
        return;
      }

      const { userId } = req.params;
      const updateData = updateUserSchema.parse(req.body);

      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!existingUser) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Update user
      const [updatedUser] = await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, parseInt(userId)))
        .returning();

      // Log user update
      await this.logSecurityEvent(
        parseInt(userId),
        'user_updated_by_admin',
        `User updated by admin ${req.user?.userId}`,
        'medium',
        {
          updatedBy: req.user?.userId,
          updatedFields: Object.keys(updateData),
        },
        req
      );

      logger.info('User updated by admin', {
        userId,
        adminId: req.user?.userId,
        updatedFields: Object.keys(updateData),
      });

      const { password, ...userSafe } = updatedUser;

      res.json({
        success: true,
        data: userSafe,
        message: 'User updated successfully',
      });
    } catch (error) {
      logger.error('Error updating user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.params.userId,
        adminId: req.user?.userId,
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      });
    }
  }

  // Ban/suspend user
  async banUser(req: Request, res: Response): Promise<void> {
    try {
      // Check admin permissions
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Admin access required',
        });
        return;
      }

      const { userId } = req.params;
      const banData = banUserSchema.parse(req.body);

      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!existingUser) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Deactivate user
      await db
        .update(users)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, parseInt(userId)));

      // Deactivate all user sessions
      await db
        .update(userSessions)
        .set({
          isActive: false,
        })
        .where(eq(userSessions.userId, parseInt(userId)));

      // Log ban event
      await this.logSecurityEvent(
        parseInt(userId),
        'user_banned',
        `User banned by admin: ${banData.reason}`,
        'high',
        {
          bannedBy: req.user?.userId,
          reason: banData.reason,
          banType: banData.banType,
          duration: banData.duration,
        },
        req
      );

      logger.info('User banned by admin', {
        userId,
        adminId: req.user?.userId,
        reason: banData.reason,
        banType: banData.banType,
      });

      res.json({
        success: true,
        message: 'User banned successfully',
        data: {
          userId,
          banType: banData.banType,
          reason: banData.reason,
          bannedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error banning user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.params.userId,
        adminId: req.user?.userId,
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to ban user',
      });
    }
  }

  // Unban/activate user
  async unbanUser(req: Request, res: Response): Promise<void> {
    try {
      // Check admin permissions
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Admin access required',
        });
        return;
      }

      const { userId } = req.params;

      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!existingUser) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Activate user
      await db
        .update(users)
        .set({
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, parseInt(userId)));

      // Log unban event
      await this.logSecurityEvent(
        parseInt(userId),
        'user_unbanned',
        `User unbanned by admin ${req.user?.userId}`,
        'medium',
        {
          unbannedBy: req.user?.userId,
        },
        req
      );

      logger.info('User unbanned by admin', {
        userId,
        adminId: req.user?.userId,
      });

      res.json({
        success: true,
        message: 'User unbanned successfully',
        data: {
          userId,
          unbannedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error unbanning user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.params.userId,
        adminId: req.user?.userId,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to unban user',
      });
    }
  }

  // Get system statistics
  async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      // Check admin permissions
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Admin access required',
        });
        return;
      }

      const stats = await this.getUserStatistics();
      const securityStats = await this.getSecurityStatistics();

      res.json({
        success: true,
        data: {
          users: stats,
          security: securityStats,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error fetching system stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminId: req.user?.userId,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system statistics',
      });
    }
  }

  // Private helper methods
  private async getUserStatistics() {
    const [totalUsers] = await db.select({ count: sql`count(*)` }).from(users);
    const [activeUsers] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.isActive, true));
    const [verifiedUsers] = await db.select({ count: sql`count(*)` }).from(users).where(and(eq(users.isEmailVerified, true), eq(users.isPhoneVerified, true)));
    
    const roleStats = await db
      .select({
        role: users.role,
        count: sql`count(*)`,
      })
      .from(users)
      .groupBy(users.role);

    const languageStats = await db
      .select({
        language: users.preferredLanguage,
        count: sql`count(*)`,
      })
      .from(users)
      .groupBy(users.preferredLanguage);

    return {
      total: Number(totalUsers.count),
      active: Number(activeUsers.count),
      verified: Number(verifiedUsers.count),
      inactive: Number(totalUsers.count) - Number(activeUsers.count),
      byRole: roleStats,
      byLanguage: languageStats,
    };
  }

  private async getSecurityStatistics() {
    const [totalEvents] = await db.select({ count: sql`count(*)` }).from(userSecurityEvents);
    const [highSeverityEvents] = await db.select({ count: sql`count(*)` }).from(userSecurityEvents).where(eq(userSecurityEvents.severity, 'high'));
    const [unresolvedEvents] = await db.select({ count: sql`count(*)` }).from(userSecurityEvents).where(eq(userSecurityEvents.isResolved, false));

    return {
      totalEvents: Number(totalEvents.count),
      highSeverity: Number(highSeverityEvents.count),
      unresolved: Number(unresolvedEvents.count),
    };
  }

  private async logSecurityEvent(
    userId: number,
    eventType: string,
    description: string,
    severity: string,
    metadata: any,
    req: Request
  ): Promise<void> {
    try {
      await db.insert(userSecurityEvents).values({
        userId,
        eventType,
        eventDescription: description,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: severity as 'low' | 'medium' | 'high' | 'critical',
        isResolved: false,
        metadata,
        createdAt: new Date(),
      });
    } catch (error) {
      logger.error('Failed to log security event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        eventType,
      });
    }
  }

  // Health check
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      service: 'admin-controller',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }
}