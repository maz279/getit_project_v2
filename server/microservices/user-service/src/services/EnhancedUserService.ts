import { db } from '../../../db.js';
import { 
  users, 
  profiles, 
  userAddresses, 
  socialAccounts, 
  userPreferences, 
  passwordHistory,
  userSessions,
  userSecurityEvents,
  userActivityLogs,
  type InsertUser,
  type InsertProfile,
  type InsertUserAddress
} from '../../../../shared/schema';
import { eq, and, or, desc, count, gte } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { logger } from '../../../../services/LoggingService';
import { redisService } from '../../../../services/RedisService';

/**
 * Enhanced User Service
 * Comprehensive user management with Bangladesh-specific features
 * Amazon.com/Shopee.sg-level functionality
 */
export class EnhancedUserService {
  private serviceName = 'enhanced-user-service';

  // Get comprehensive user profile
  async getComprehensiveProfile(userId: number): Promise<any> {
    try {
      // Get user basic data
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        throw new Error('User not found');
      }

      // Get profile data
      const [profile] = await db.select()
        .from(profiles)
        .where(eq(profiles.userId, userId));

      // Get addresses
      const addresses = await db.select()
        .from(userAddresses)
        .where(eq(userAddresses.userId, userId))
        .orderBy(desc(userAddresses.isDefault));

      // Get social accounts
      const socialAccounts = await db.select()
        .from(socialAccounts)
        .where(eq(socialAccounts.userId, userId));

      // Get preferences
      const [preferences] = await db.select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));

      // Get verification status
      const verificationStatus = {
        email: user.isEmailVerified,
        phone: user.isPhoneVerified,
        nid: user.nidVerified,
        mfa: user.mfaEnabled,
        level: this.calculateVerificationLevel(user)
      };

      // Remove sensitive data
      const { password, mfaSecret, ...safeUser } = user;

      const comprehensiveProfile = {
        user: safeUser,
        profile: profile || {},
        addresses: addresses || [],
        socialAccounts: socialAccounts.map(sa => ({
          provider: sa.provider,
          email: sa.email,
          name: sa.name,
          linkedAt: sa.createdAt
        })),
        preferences: preferences || {},
        verification: verificationStatus,
        stats: {
          totalAddresses: addresses?.length || 0,
          linkedSocialAccounts: socialAccounts?.length || 0,
          accountAge: this.calculateAccountAge(user.createdAt)
        }
      };

      logger.info('Comprehensive profile retrieved', {
        service: this.serviceName,
        userId,
        verificationLevel: verificationStatus.level
      });

      return comprehensiveProfile;

    } catch (error: any) {
      logger.error('Comprehensive profile retrieval failed', {
        service: this.serviceName,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  // Update user preferences with Bangladesh-specific options
  async updateUserPreferences(userId: number, preferences: any): Promise<any> {
    try {
      // Validate Bangladesh-specific preferences
      const validatedPreferences = this.validateBangladeshPreferences(preferences);

      // Check if preferences exist
      const [existingPreferences] = await db.select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));

      let updatedPreferences;

      if (existingPreferences) {
        // Update existing preferences
        [updatedPreferences] = await db.update(userPreferences)
          .set({
            ...validatedPreferences,
            updatedAt: new Date()
          })
          .where(eq(userPreferences.userId, userId))
          .returning();
      } else {
        // Create new preferences
        [updatedPreferences] = await db.insert(userPreferences)
          .values({
            userId,
            ...validatedPreferences
          })
          .returning();
      }

      // Update user's preferred language in main users table if provided
      if (validatedPreferences.language) {
        await db.update(users)
          .set({
            preferredLanguage: validatedPreferences.language,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));
      }

      // Cache updated preferences
      await redisService.set(
        `user_preferences:${userId}`, 
        JSON.stringify(updatedPreferences), 
        3600 // 1 hour
      );

      logger.info('User preferences updated', {
        service: this.serviceName,
        userId,
        language: validatedPreferences.language,
        currency: validatedPreferences.currency
      });

      return updatedPreferences;

    } catch (error: any) {
      logger.error('User preferences update failed', {
        service: this.serviceName,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  // Get user verification status
  async getVerificationStatus(userId: number): Promise<any> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        throw new Error('User not found');
      }

      // Check social account links
      const socialAccountsCount = await db.select({ count: count() })
        .from(socialAccounts)
        .where(eq(socialAccounts.userId, userId));

      // Check recent security events
      const recentSecurityEvents = await db.select()
        .from(userSecurityEvents)
        .where(and(
          eq(userSecurityEvents.userId, userId),
          gte(userSecurityEvents.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        ))
        .orderBy(desc(userSecurityEvents.createdAt))
        .limit(5);

      const verificationStatus = {
        email: {
          verified: user.isEmailVerified,
          verifiedAt: user.createdAt // Placeholder - need emailVerifiedAt field
        },
        phone: {
          verified: user.isPhoneVerified,
          number: user.phone,
          format: this.formatBangladeshPhone(user.phone)
        },
        nid: {
          verified: user.nidVerified,
          verifiedAt: user.nidVerifiedAt,
          number: user.nidNumber ? `****${user.nidNumber.slice(-4)}` : null
        },
        mfa: {
          enabled: user.mfaEnabled,
          enabledAt: user.mfaEnabledAt,
          method: user.mfaEnabled ? 'TOTP' : null
        },
        socialAccounts: {
          linked: socialAccountsCount[0].count,
          providers: [] // Would be populated with actual provider names
        },
        security: {
          level: this.calculateVerificationLevel(user),
          score: this.calculateSecurityScore(user),
          recentEvents: recentSecurityEvents.length,
          recommendations: this.getSecurityRecommendations(user)
        }
      };

      return verificationStatus;

    } catch (error: any) {
      logger.error('Verification status check failed', {
        service: this.serviceName,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  // GDPR data export
  async exportUserData(userId: number): Promise<any> {
    try {
      const comprehensiveProfile = await this.getComprehensiveProfile(userId);

      // Get activity logs
      const activityLogs = await db.select()
        .from(userActivityLogs)
        .where(eq(userActivityLogs.userId, userId))
        .orderBy(desc(userActivityLogs.createdAt))
        .limit(1000); // Last 1000 activities

      // Get security events
      const securityEvents = await db.select()
        .from(userSecurityEvents)
        .where(eq(userSecurityEvents.userId, userId))
        .orderBy(desc(userSecurityEvents.createdAt));

      // Get sessions
      const sessions = await db.select()
        .from(userSessions)
        .where(eq(userSessions.userId, userId))
        .orderBy(desc(userSessions.lastActivityAt))
        .limit(50); // Last 50 sessions

      const exportData = {
        profile: comprehensiveProfile,
        activityLogs: activityLogs.map(log => ({
          action: log.action,
          entityType: log.entityType,
          timestamp: log.createdAt,
          details: log.details
        })),
        securityEvents: securityEvents.map(event => ({
          type: event.eventType,
          description: event.eventDescription,
          timestamp: event.createdAt,
          severity: event.severity
        })),
        sessions: sessions.map(session => ({
          device: session.deviceInfo,
          location: session.location,
          lastActivity: session.lastActivityAt,
          created: session.createdAt
        })),
        exportInfo: {
          requestedAt: new Date(),
          exportVersion: '1.0',
          dataRetentionPolicy: 'Data retained according to Bangladesh Data Protection guidelines'
        }
      };

      // Log export request
      await db.insert(userActivityLogs).values({
        userId,
        action: 'gdpr_data_export',
        entityType: 'user_data',
        details: { exportVersion: '1.0' },
        ipAddress: '127.0.0.1', // Should be passed from request
        userAgent: 'system'
      });

      logger.info('GDPR data export completed', {
        service: this.serviceName,
        userId,
        dataPoints: Object.keys(exportData).length
      });

      return exportData;

    } catch (error: any) {
      logger.error('GDPR data export failed', {
        service: this.serviceName,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  // Private helper methods
  private validateBangladeshPreferences(preferences: any): any {
    const validated: any = {};

    // Language validation
    if (preferences.language) {
      const validLanguages = ['en', 'bn', 'both'];
      if (validLanguages.includes(preferences.language)) {
        validated.language = preferences.language;
      }
    }

    // Currency validation
    if (preferences.currency) {
      const validCurrencies = ['BDT', 'USD', 'EUR'];
      if (validCurrencies.includes(preferences.currency)) {
        validated.currency = preferences.currency;
      }
    }

    // Timezone validation
    if (preferences.timezone) {
      const validTimezones = ['Asia/Dhaka', 'UTC', 'Asia/Kolkata'];
      if (validTimezones.includes(preferences.timezone)) {
        validated.timezone = preferences.timezone;
      }
    }

    // Cultural preferences
    if (preferences.cultural) {
      validated.cultural = {
        festivals: preferences.cultural.festivals || [],
        prayerTimes: preferences.cultural.prayerTimes || false,
        localEvents: preferences.cultural.localEvents || false
      };
    }

    // Notification preferences
    if (preferences.notifications) {
      validated.notifications = {
        email: preferences.notifications.email || false,
        sms: preferences.notifications.sms || false,
        push: preferences.notifications.push || false,
        marketing: preferences.notifications.marketing || false
      };
    }

    return validated;
  }

  private calculateVerificationLevel(user: any): string {
    let level = 'basic';
    
    if (user.isEmailVerified && user.isPhoneVerified) {
      level = 'verified';
    }
    
    if (user.nidVerified) {
      level = 'enhanced';
    }
    
    if (user.mfaEnabled && user.nidVerified) {
      level = 'premium';
    }
    
    return level;
  }

  private calculateSecurityScore(user: any): number {
    let score = 0;
    
    if (user.isEmailVerified) score += 20;
    if (user.isPhoneVerified) score += 20;
    if (user.nidVerified) score += 30;
    if (user.mfaEnabled) score += 25;
    if (user.password) score += 5; // Has password set
    
    return Math.min(score, 100);
  }

  private getSecurityRecommendations(user: any): string[] {
    const recommendations = [];
    
    if (!user.isEmailVerified) {
      recommendations.push('Verify your email address');
    }
    
    if (!user.isPhoneVerified) {
      recommendations.push('Verify your phone number');
    }
    
    if (!user.nidVerified) {
      recommendations.push('Complete NID verification for enhanced security');
    }
    
    if (!user.mfaEnabled) {
      recommendations.push('Enable two-factor authentication');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Your account security is excellent!');
    }
    
    return recommendations;
  }

  private formatBangladeshPhone(phone: string | null): string | null {
    if (!phone) return null;
    
    // Convert +8801XXXXXXXXX to +88 01XXX-XXXXXX
    if (phone.startsWith('+8801')) {
      const number = phone.substring(4);
      return `+88 ${number.substring(0, 3)}-${number.substring(3)}`;
    }
    return phone;
  }

  private calculateAccountAge(createdAt: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) {
      return `${diffInDays} days`;
    } else if (diffInDays < 365) {
      return `${Math.floor(diffInDays / 30)} months`;
    } else {
      return `${Math.floor(diffInDays / 365)} years`;
    }
  }
}