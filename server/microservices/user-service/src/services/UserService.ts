/**
 * User Service - Amazon.com/Shopee.sg Level Implementation
 * Core business logic for user profile management
 */

import { db } from '../../../../db';
import { users, profiles } from '../../../../../shared/schema';
import { eq, and, like, or, desc, asc } from 'drizzle-orm';
import { LoggingService } from '../../../../services/LoggingService';
import { AuthUser } from '../types/AuthTypes';

export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: string;
  avatar?: string;
  bio?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAddress {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface UserSearchFilters {
  search?: string;
  role?: string;
  status?: string;
  verified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface UserListResult {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserService {
  private logger: LoggingService;

  constructor() {
    this.logger = new LoggingService();
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          phone: users.phone,
          firstName: users.firstName,
          lastName: users.lastName,
          isEmailVerified: users.isEmailVerified,
          isPhoneVerified: users.isPhoneVerified,
          role: users.role,
          status: users.isActive,
          avatar: users.avatar,
          bio: users.bio,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          dateOfBirth: profiles.dateOfBirth,
          gender: profiles.gender
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(users.id, userId));

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        avatar: user.avatar,
        bio: user.bio,
        isEmailVerified: user.isEmailVerified || false,
        isPhoneVerified: user.isPhoneVerified || false,
        role: user.role,
        status: user.status ? 'active' : 'inactive',
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date()
      };

    } catch (error) {
      this.logger.error('Get user by ID failed', { error: error.message, userId });
      return null;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserProfile | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        return null;
      }

      return this.getUserById(user.id);

    } catch (error) {
      this.logger.error('Find user by email failed', { error: error.message, email });
      return null;
    }
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone: string): Promise<UserProfile | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone));

      if (!user) {
        return null;
      }

      return this.getUserById(user.id);

    } catch (error) {
      this.logger.error('Find user by phone failed', { error: error.message, phone });
      return null;
    }
  }

  /**
   * Find user by email or phone
   */
  async findByEmailOrPhone(email?: string, phone?: string): Promise<UserProfile | null> {
    try {
      if (!email && !phone) {
        return null;
      }

      let whereClause;
      if (email && phone) {
        whereClause = or(eq(users.email, email), eq(users.phone, phone));
      } else if (email) {
        whereClause = eq(users.email, email);
      } else {
        whereClause = eq(users.phone, phone);
      }

      const [user] = await db
        .select()
        .from(users)
        .where(whereClause);

      if (!user) {
        return null;
      }

      return this.getUserById(user.id);

    } catch (error) {
      this.logger.error('Find user by email or phone failed', { error: error.message, email, phone });
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<boolean> {
    try {
      // Update users table
      const userUpdates: any = {};
      if (profileData.username) userUpdates.username = profileData.username;
      if (profileData.email) userUpdates.email = profileData.email;
      if (profileData.phone) userUpdates.phone = profileData.phone;
      if (profileData.firstName) userUpdates.firstName = profileData.firstName;
      if (profileData.lastName) userUpdates.lastName = profileData.lastName;
      if (profileData.avatar) userUpdates.avatar = profileData.avatar;
      if (profileData.bio) userUpdates.bio = profileData.bio;
      userUpdates.updatedAt = new Date();

      if (Object.keys(userUpdates).length > 1) { // More than just updatedAt
        await db
          .update(users)
          .set(userUpdates)
          .where(eq(users.id, userId));
      }

      // Update profiles table
      const profileUpdates: any = {};
      if (profileData.dateOfBirth) profileUpdates.dateOfBirth = profileData.dateOfBirth;
      if (profileData.gender) profileUpdates.gender = profileData.gender;
      profileUpdates.updatedAt = new Date();

      if (Object.keys(profileUpdates).length > 1) { // More than just updatedAt
        // Check if profile exists
        const [existingProfile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.userId, userId));

        if (existingProfile) {
          await db
            .update(profiles)
            .set(profileUpdates)
            .where(eq(profiles.userId, userId));
        } else {
          await db
            .insert(profiles)
            .values({
              id: crypto.randomUUID(),
              userId,
              ...profileUpdates,
              createdAt: new Date()
            });
        }
      }

      this.logger.info('User profile updated', { userId });
      return true;

    } catch (error) {
      this.logger.error('Update profile failed', { error: error.message, userId });
      return false;
    }
  }

  /**
   * Update email verification status
   */
  async updateEmailVerification(userId: string, isVerified: boolean): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ 
          isEmailVerified: isVerified,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      this.logger.info('Email verification updated', { userId, isVerified });
      return true;

    } catch (error) {
      this.logger.error('Update email verification failed', { error: error.message, userId });
      return false;
    }
  }

  /**
   * Update phone verification status
   */
  async updatePhoneVerification(userId: string, isVerified: boolean): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ 
          isPhoneVerified: isVerified,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      this.logger.info('Phone verification updated', { userId, isVerified });
      return true;

    } catch (error) {
      this.logger.error('Update phone verification failed', { error: error.message, userId });
      return false;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ 
          lastLoginAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      this.logger.info('Last login updated', { userId });
      return true;

    } catch (error) {
      this.logger.error('Update last login failed', { error: error.message, userId });
      return false;
    }
  }

  /**
   * Get user addresses
   */
  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    try {
      const addresses = await db
        .select()
        .from(userAddresses)
        .where(eq(userAddresses.userId, userId))
        .orderBy(desc(userAddresses.isDefault), asc(userAddresses.createdAt));

      return addresses.map(addr => ({
        id: addr.id,
        userId: addr.userId,
        type: addr.type as 'home' | 'work' | 'other',
        fullName: addr.fullName,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        isDefault: addr.isDefault || false,
        createdAt: addr.createdAt || new Date()
      }));

    } catch (error) {
      this.logger.error('Get user addresses failed', { error: error.message, userId });
      return [];
    }
  }

  /**
   * Add user address
   */
  async addUserAddress(userId: string, addressData: Omit<UserAddress, 'id' | 'userId' | 'createdAt'>): Promise<string | null> {
    try {
      const addressId = crypto.randomUUID();

      // If this is the default address, unset other defaults
      if (addressData.isDefault) {
        await db
          .update(userAddresses)
          .set({ isDefault: false })
          .where(eq(userAddresses.userId, userId));
      }

      await db
        .insert(userAddresses)
        .values({
          id: addressId,
          userId,
          type: addressData.type,
          fullName: addressData.fullName,
          phone: addressData.phone,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          postalCode: addressData.postalCode,
          country: addressData.country,
          isDefault: addressData.isDefault,
          createdAt: new Date()
        });

      this.logger.info('User address added', { userId, addressId });
      return addressId;

    } catch (error) {
      this.logger.error('Add user address failed', { error: error.message, userId });
      return null;
    }
  }

  /**
   * Search users with filters
   */
  async searchUsers(filters: UserSearchFilters, page = 1, limit = 20): Promise<UserListResult> {
    try {
      const offset = (page - 1) * limit;
      
      let whereClause = eq(users.isActive, true);

      if (filters.search) {
        whereClause = and(
          whereClause,
          or(
            like(users.firstName, `%${filters.search}%`),
            like(users.lastName, `%${filters.search}%`),
            like(users.email, `%${filters.search}%`),
            like(users.username, `%${filters.search}%`)
          )
        );
      }

      if (filters.role) {
        whereClause = and(whereClause, eq(users.role, filters.role));
      }

      if (filters.verified !== undefined) {
        whereClause = and(
          whereClause,
          and(
            eq(users.isEmailVerified, filters.verified),
            eq(users.isPhoneVerified, filters.verified)
          )
        );
      }

      const [totalResult] = await db
        .select({ count: users.id })
        .from(users)
        .where(whereClause);

      const userResults = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          phone: users.phone,
          firstName: users.firstName,
          lastName: users.lastName,
          isEmailVerified: users.isEmailVerified,
          isPhoneVerified: users.isPhoneVerified,
          role: users.role,
          status: users.isActive,
          avatar: users.avatar,
          bio: users.bio,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      const userProfiles: UserProfile[] = userResults.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        isEmailVerified: user.isEmailVerified || false,
        isPhoneVerified: user.isPhoneVerified || false,
        role: user.role,
        status: user.status ? 'active' : 'inactive',
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date()
      }));

      const total = Array.isArray(totalResult) ? totalResult.length : 0;
      const totalPages = Math.ceil(total / limit);

      return {
        users: userProfiles,
        total,
        page,
        limit,
        totalPages
      };

    } catch (error) {
      this.logger.error('Search users failed', { error: error.message, filters });
      return {
        users: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      this.logger.info('User deactivated', { userId });
      return true;

    } catch (error) {
      this.logger.error('Deactivate user failed', { error: error.message, userId });
      return false;
    }
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ 
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      this.logger.info('User reactivated', { userId });
      return true;

    } catch (error) {
      this.logger.error('Reactivate user failed', { error: error.message, userId });
      return false;
    }
  }
}