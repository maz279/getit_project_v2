import { eq } from 'drizzle-orm';
import { databaseRouter } from '../db/database-router';
import { cacheHierarchy } from '../cache/cache-hierarchy';
import * as schema from '@shared/schemas/user-service-schema';
import { z } from 'zod';

export class UserService {
  private cachePrefix = 'user:';

  // Create a new user
  async createUser(data: schema.InsertUser) {
    const db = await databaseRouter.getDatabase('users');
    
    const [user] = await db
      .insert(schema.users)
      .values(data)
      .returning();

    // Cache the new user
    await cacheHierarchy.set(`${this.cachePrefix}${user.id}`, user);
    await cacheHierarchy.set(`${this.cachePrefix}email:${user.email}`, user);

    return user;
  }

  // Get user by ID with caching
  async getUserById(id: string): Promise<schema.User | null> {
    const cacheKey = `${this.cachePrefix}${id}`;
    
    // Check cache first
    const cached = await cacheHierarchy.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const db = await databaseRouter.getDatabase('users');
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));

    if (user) {
      // Cache for 1 hour
      await cacheHierarchy.set(cacheKey, user, 3600000);
    }

    return user || null;
  }

  // Get user by email with caching
  async getUserByEmail(email: string): Promise<schema.User | null> {
    const cacheKey = `${this.cachePrefix}email:${email}`;
    
    // Check cache first
    const cached = await cacheHierarchy.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const db = await databaseRouter.getDatabase('users');
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (user) {
      // Cache for 1 hour
      await cacheHierarchy.set(cacheKey, user, 3600000);
      await cacheHierarchy.set(`${this.cachePrefix}${user.id}`, user, 3600000);
    }

    return user || null;
  }

  // Create user profile
  async createUserProfile(userId: string, data: schema.InsertUserProfile) {
    const db = await databaseRouter.getDatabase('users');
    
    const [profile] = await db
      .insert(schema.userProfiles)
      .values({ ...data, userId })
      .returning();

    // Invalidate user cache
    await cacheHierarchy.invalidatePattern(`${this.cachePrefix}${userId}*`);

    return profile;
  }

  // Add user address
  async addUserAddress(userId: string, data: schema.InsertUserAddress) {
    const db = await databaseRouter.getDatabase('users');
    
    const [address] = await db
      .insert(schema.userAddresses)
      .values({ ...data, userId })
      .returning();

    // Invalidate user cache
    await cacheHierarchy.invalidatePattern(`${this.cachePrefix}${userId}*`);

    return address;
  }

  // Get user with profile and addresses
  async getUserWithDetails(userId: string) {
    const cacheKey = `${this.cachePrefix}details:${userId}`;
    
    // Check cache first
    const cached = await cacheHierarchy.get(cacheKey);
    if (cached) {
      return cached;
    }

    const db = await databaseRouter.getDatabase('users');
    
    // Use relations to fetch user with profile and addresses
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: {
        profile: true,
        addresses: true,
        auth: {
          columns: {
            passwordHash: false, // Don't expose password hash
          },
        },
      },
    });

    if (user) {
      // Cache for 30 minutes
      await cacheHierarchy.set(cacheKey, user, 1800000);
    }

    return user;
  }

  // Update user
  async updateUser(userId: string, data: Partial<schema.InsertUser>) {
    const db = await databaseRouter.getDatabase('users');
    
    const [updated] = await db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();

    // Invalidate all user caches
    await cacheHierarchy.invalidatePattern(`${this.cachePrefix}${userId}*`);
    if (updated?.email) {
      await cacheHierarchy.invalidate(`${this.cachePrefix}email:${updated.email}`);
    }

    return updated;
  }

  // Get cache metrics
  async getCacheMetrics() {
    return cacheHierarchy.getMetrics();
  }

  // Warm up cache with frequently accessed users
  async warmupCache(userIds: string[]) {
    await cacheHierarchy.warmup(
      userIds.map(id => `${this.cachePrefix}${id}`),
      async (key) => {
        const id = key.replace(this.cachePrefix, '');
        return this.getUserById(id);
      }
    );
  }
}

// Singleton instance
export const userService = new UserService();