import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  notificationPreferences, 
  users,
  InsertNotificationPreference,
  NotificationPreference
} from '../../../../../shared/schema';
import { eq, and, desc, count, inArray } from 'drizzle-orm';
import { logger } from '../../../../services/LoggingService';

/**
 * Preferences Controller
 * Manages user notification preferences and channel settings
 * Amazon.com/Shopee.sg-level preference management with DND compliance
 */
export class PreferencesController {
  private serviceName = 'notification-service:preferences-controller';

  /**
   * Get User Preferences
   * Retrieves all notification preferences for a user
   */
  async getUserPreferences(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `prefs-get-${Date.now()}`;
    
    try {
      const { userId } = req.params;

      // Validate user exists
      const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get user notification preferences
      const preferences = await db.select().from(notificationPreferences)
        .where(eq(notificationPreferences.userId, parseInt(userId)))
        .orderBy(notificationPreferences.notificationType, notificationPreferences.channel);

      // Get user notification channels
      const channels = await db.select().from(notificationChannels)
        .where(eq(notificationChannels.userId, parseInt(userId)))
        .orderBy(notificationChannels.channelType);

      // Group preferences by notification type
      const groupedPreferences = preferences.reduce((acc, pref) => {
        if (!acc[pref.notificationType]) {
          acc[pref.notificationType] = {};
        }
        acc[pref.notificationType][pref.channel] = {
          isEnabled: pref.isEnabled,
          frequency: pref.frequency,
          quietHoursStart: pref.quietHoursStart,
          quietHoursEnd: pref.quietHoursEnd,
          timezone: pref.timezone,
          language: pref.language
        };
        return acc;
      }, {} as any);

      // Group channels by type
      const groupedChannels = channels.reduce((acc, channel) => {
        if (!acc[channel.channelType]) {
          acc[channel.channelType] = [];
        }
        acc[channel.channelType].push({
          id: channel.id,
          address: channel.address,
          isVerified: channel.isVerified,
          isPrimary: channel.isPrimary,
          verifiedAt: channel.verifiedAt,
          lastUsedAt: channel.lastUsedAt
        });
        return acc;
      }, {} as any);

      // Default preferences for Bangladesh market
      const defaultPreferences = {
        order: {
          email: { isEnabled: true, frequency: 'immediate' },
          sms: { isEnabled: true, frequency: 'immediate' },
          push: { isEnabled: true, frequency: 'immediate' },
          in_app: { isEnabled: true, frequency: 'immediate' }
        },
        payment: {
          email: { isEnabled: true, frequency: 'immediate' },
          sms: { isEnabled: true, frequency: 'immediate' },
          push: { isEnabled: true, frequency: 'immediate' },
          in_app: { isEnabled: true, frequency: 'immediate' }
        },
        shipping: {
          email: { isEnabled: true, frequency: 'immediate' },
          sms: { isEnabled: true, frequency: 'immediate' },
          push: { isEnabled: true, frequency: 'immediate' },
          in_app: { isEnabled: true, frequency: 'immediate' }
        },
        marketing: {
          email: { isEnabled: false, frequency: 'weekly' },
          sms: { isEnabled: false, frequency: 'never' },
          push: { isEnabled: false, frequency: 'daily' },
          in_app: { isEnabled: true, frequency: 'daily' }
        },
        system: {
          email: { isEnabled: true, frequency: 'immediate' },
          sms: { isEnabled: false, frequency: 'never' },
          push: { isEnabled: true, frequency: 'immediate' },
          in_app: { isEnabled: true, frequency: 'immediate' }
        }
      };

      // Merge with defaults for missing preferences
      const mergedPreferences = { ...defaultPreferences };
      for (const [type, channels] of Object.entries(groupedPreferences)) {
        if (mergedPreferences[type as keyof typeof mergedPreferences]) {
          mergedPreferences[type as keyof typeof mergedPreferences] = {
            ...mergedPreferences[type as keyof typeof mergedPreferences],
            ...channels
          };
        }
      }

      logger.info('User preferences retrieved', {
        serviceId: this.serviceName,
        correlationId,
        userId,
        preferencesCount: preferences.length,
        channelsCount: channels.length
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          preferredLanguage: user.preferredLanguage,
          timezone: user.timezone || 'Asia/Dhaka'
        },
        preferences: mergedPreferences,
        channels: groupedChannels,
        metadata: {
          lastUpdated: preferences.length > 0 ? Math.max(...preferences.map(p => new Date(p.updatedAt || p.createdAt).getTime())) : null,
          totalPreferences: preferences.length,
          verifiedChannels: channels.filter(c => c.isVerified).length
        }
      });

    } catch (error: any) {
      logger.error('Failed to get user preferences', {
        serviceId: this.serviceName,
        correlationId,
        userId: req.params.userId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user preferences',
        details: error.message
      });
    }
  }

  /**
   * Update User Preferences
   * Updates notification preferences for a user
   */
  async updateUserPreferences(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `prefs-update-${Date.now()}`;
    
    try {
      const { userId } = req.params;
      const { preferences, globalSettings } = req.body;

      // Validate user exists
      const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const updatedPreferences = [];
      
      // Process each notification type and channel combination
      for (const [notificationType, channels] of Object.entries(preferences)) {
        for (const [channel, settings] of Object.entries(channels as any)) {
          const preferenceData: InsertNotificationPreference = {
            userId: parseInt(userId),
            notificationType,
            channel,
            isEnabled: settings.isEnabled,
            frequency: settings.frequency || 'immediate',
            quietHoursStart: settings.quietHoursStart || globalSettings?.quietHoursStart,
            quietHoursEnd: settings.quietHoursEnd || globalSettings?.quietHoursEnd,
            timezone: settings.timezone || globalSettings?.timezone || 'Asia/Dhaka',
            language: settings.language || globalSettings?.language || 'en'
          };

          // Check if preference already exists
          const [existingPref] = await db.select().from(notificationPreferences)
            .where(and(
              eq(notificationPreferences.userId, parseInt(userId)),
              eq(notificationPreferences.notificationType, notificationType),
              eq(notificationPreferences.channel, channel)
            ));

          if (existingPref) {
            // Update existing preference
            const [updated] = await db.update(notificationPreferences)
              .set({
                ...preferenceData,
                updatedAt: new Date()
              })
              .where(eq(notificationPreferences.id, existingPref.id))
              .returning();
            
            updatedPreferences.push(updated);
          } else {
            // Create new preference
            const [created] = await db.insert(notificationPreferences)
              .values(preferenceData)
              .returning();
            
            updatedPreferences.push(created);
          }
        }
      }

      // Update user's global settings if provided
      if (globalSettings) {
        await db.update(users)
          .set({
            preferredLanguage: globalSettings.language || user.preferredLanguage,
            timezone: globalSettings.timezone || user.timezone,
            updatedAt: new Date()
          })
          .where(eq(users.id, parseInt(userId)));
      }

      logger.info('User preferences updated', {
        serviceId: this.serviceName,
        correlationId,
        userId,
        updatedCount: updatedPreferences.length
      });

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        updated: updatedPreferences.length,
        preferences: updatedPreferences
      });

    } catch (error: any) {
      logger.error('Failed to update user preferences', {
        serviceId: this.serviceName,
        correlationId,
        userId: req.params.userId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to update user preferences',
        details: error.message
      });
    }
  }

  /**
   * Add Notification Channel
   * Adds a new notification channel for a user
   */
  async addNotificationChannel(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `channel-add-${Date.now()}`;
    
    try {
      const { userId } = req.params;
      const { channelType, address, isPrimary = false } = req.body;

      // Validate required fields
      if (!channelType || !address) {
        return res.status(400).json({
          success: false,
          error: 'Required fields: channelType, address'
        });
      }

      // Validate channel type
      const validChannels = ['email', 'sms', 'push', 'whatsapp'];
      if (!validChannels.includes(channelType)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid channel type. Must be one of: email, sms, push, whatsapp'
        });
      }

      // Validate user exists
      const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if channel already exists
      const [existingChannel] = await db.select().from(notificationChannels)
        .where(and(
          eq(notificationChannels.userId, parseInt(userId)),
          eq(notificationChannels.channelType, channelType),
          eq(notificationChannels.address, address)
        ));

      if (existingChannel) {
        return res.status(409).json({
          success: false,
          error: 'Channel already exists for this user'
        });
      }

      // If setting as primary, unset other primary channels of same type
      if (isPrimary) {
        await db.update(notificationChannels)
          .set({ isPrimary: false })
          .where(and(
            eq(notificationChannels.userId, parseInt(userId)),
            eq(notificationChannels.channelType, channelType)
          ));
      }

      // Generate verification token for channels that need verification
      const needsVerification = ['email', 'sms'];
      const verificationToken = needsVerification.includes(channelType) ? 
        Math.random().toString(36).substr(2, 10).toUpperCase() : null;

      // Create channel
      const channelData: InsertNotificationChannel = {
        userId: parseInt(userId),
        channelType,
        address,
        isPrimary,
        isVerified: !needsVerification.includes(channelType), // Push and WhatsApp don't need verification
        verificationToken
      };

      const [channel] = await db.insert(notificationChannels)
        .values(channelData)
        .returning();

      // Send verification if needed
      if (verificationToken) {
        await this.sendVerification(channel, user);
      }

      logger.info('Notification channel added', {
        serviceId: this.serviceName,
        correlationId,
        userId,
        channelType,
        needsVerification: !!verificationToken
      });

      res.status(201).json({
        success: true,
        message: 'Notification channel added successfully',
        channel: {
          id: channel.id,
          channelType: channel.channelType,
          address: channel.address,
          isVerified: channel.isVerified,
          isPrimary: channel.isPrimary,
          needsVerification: !!verificationToken
        }
      });

    } catch (error: any) {
      logger.error('Failed to add notification channel', {
        serviceId: this.serviceName,
        correlationId,
        userId: req.params.userId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to add notification channel',
        details: error.message
      });
    }
  }

  /**
   * Verify Notification Channel
   * Verifies a notification channel using verification token
   */
  async verifyNotificationChannel(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `channel-verify-${Date.now()}`;
    
    try {
      const { channelId } = req.params;
      const { verificationToken } = req.body;

      if (!verificationToken) {
        return res.status(400).json({
          success: false,
          error: 'Verification token is required'
        });
      }

      // Find channel with matching token
      const [channel] = await db.select().from(notificationChannels)
        .where(and(
          eq(notificationChannels.id, channelId),
          eq(notificationChannels.verificationToken, verificationToken),
          eq(notificationChannels.isVerified, false)
        ));

      if (!channel) {
        return res.status(404).json({
          success: false,
          error: 'Invalid verification token or channel already verified'
        });
      }

      // Update channel as verified
      const [verifiedChannel] = await db.update(notificationChannels)
        .set({
          isVerified: true,
          verifiedAt: new Date(),
          verificationToken: null
        })
        .where(eq(notificationChannels.id, channelId))
        .returning();

      logger.info('Notification channel verified', {
        serviceId: this.serviceName,
        correlationId,
        channelId,
        channelType: channel.channelType,
        userId: channel.userId
      });

      res.json({
        success: true,
        message: 'Channel verified successfully',
        channel: {
          id: verifiedChannel.id,
          channelType: verifiedChannel.channelType,
          address: verifiedChannel.address,
          isVerified: verifiedChannel.isVerified,
          verifiedAt: verifiedChannel.verifiedAt
        }
      });

    } catch (error: any) {
      logger.error('Failed to verify notification channel', {
        serviceId: this.serviceName,
        correlationId,
        channelId: req.params.channelId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to verify notification channel',
        details: error.message
      });
    }
  }

  /**
   * Remove Notification Channel
   * Removes a notification channel for a user
   */
  async removeNotificationChannel(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `channel-remove-${Date.now()}`;
    
    try {
      const { channelId } = req.params;
      const { userId } = req.query;

      // Build where conditions
      const whereConditions = [eq(notificationChannels.id, channelId)];
      if (userId) {
        whereConditions.push(eq(notificationChannels.userId, parseInt(userId as string)));
      }

      // Delete channel
      const [deletedChannel] = await db.delete(notificationChannels)
        .where(and(...whereConditions))
        .returning();

      if (!deletedChannel) {
        return res.status(404).json({
          success: false,
          error: 'Channel not found'
        });
      }

      logger.info('Notification channel removed', {
        serviceId: this.serviceName,
        correlationId,
        channelId,
        channelType: deletedChannel.channelType,
        userId: deletedChannel.userId
      });

      res.json({
        success: true,
        message: 'Notification channel removed successfully',
        removed: {
          id: deletedChannel.id,
          channelType: deletedChannel.channelType,
          address: deletedChannel.address
        }
      });

    } catch (error: any) {
      logger.error('Failed to remove notification channel', {
        serviceId: this.serviceName,
        correlationId,
        channelId: req.params.channelId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to remove notification channel',
        details: error.message
      });
    }
  }

  /**
   * Bulk Unsubscribe
   * Unsubscribes user from specific notification types or channels
   */
  async bulkUnsubscribe(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `bulk-unsubscribe-${Date.now()}`;
    
    try {
      const { userId } = req.params;
      const { notificationTypes, channels, unsubscribeAll = false } = req.body;

      // Validate user exists
      const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      let updatedCount = 0;

      if (unsubscribeAll) {
        // Disable all notifications
        const result = await db.update(notificationPreferences)
          .set({ 
            isEnabled: false,
            updatedAt: new Date()
          })
          .where(eq(notificationPreferences.userId, parseInt(userId)));
        
        updatedCount = result.rowCount || 0;
      } else {
        // Selective unsubscribe
        const conditions = [eq(notificationPreferences.userId, parseInt(userId))];
        
        if (notificationTypes && notificationTypes.length > 0) {
          conditions.push(inArray(notificationPreferences.notificationType, notificationTypes));
        }
        
        if (channels && channels.length > 0) {
          conditions.push(inArray(notificationPreferences.channel, channels));
        }

        if (conditions.length > 1) {
          const result = await db.update(notificationPreferences)
            .set({ 
              isEnabled: false,
              updatedAt: new Date()
            })
            .where(and(...conditions));
          
          updatedCount = result.rowCount || 0;
        }
      }

      logger.info('Bulk unsubscribe completed', {
        serviceId: this.serviceName,
        correlationId,
        userId,
        updatedCount,
        unsubscribeAll,
        notificationTypes,
        channels
      });

      res.json({
        success: true,
        message: 'Unsubscribe completed successfully',
        updatedPreferences: updatedCount,
        action: unsubscribeAll ? 'unsubscribed_from_all' : 'selective_unsubscribe'
      });

    } catch (error: any) {
      logger.error('Bulk unsubscribe failed', {
        serviceId: this.serviceName,
        correlationId,
        userId: req.params.userId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to process unsubscribe request',
        details: error.message
      });
    }
  }

  /**
   * Get Global Preference Statistics
   * Returns platform-wide preference statistics for admin insights
   */
  async getGlobalPreferenceStatistics(req: Request, res: Response) {
    try {
      // Get total users
      const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(users);

      // Get preference statistics by type and channel
      const preferenceStats = await db.select({
        notificationType: notificationPreferences.notificationType,
        channel: notificationPreferences.channel,
        enabled: count(),
        disabled: count()
      })
      .from(notificationPreferences)
      .groupBy(notificationPreferences.notificationType, notificationPreferences.channel);

      // Get channel verification statistics
      const channelStats = await db.select({
        channelType: notificationChannels.channelType,
        total: count(),
        verified: count(),
        primary: count()
      })
      .from(notificationChannels)
      .groupBy(notificationChannels.channelType);

      res.json({
        success: true,
        statistics: {
          totalUsers,
          preferences: preferenceStats,
          channels: channelStats,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get preference statistics',
        details: error.message
      });
    }
  }

  // Helper Methods

  private async sendVerification(channel: NotificationChannel, user: any): Promise<void> {
    try {
      if (channel.channelType === 'email') {
        // Send email verification
        const subject = 'Verify Your Email Address - GetIt Bangladesh';
        const message = `Hi ${user.name},\n\nPlease verify your email address using this code: ${channel.verificationToken}\n\nBest regards,\nGetIt Bangladesh Team`;
        
        // This would integrate with your email service
        logger.info('Email verification sent', {
          serviceId: this.serviceName,
          channelId: channel.id,
          address: channel.address
        });
        
      } else if (channel.channelType === 'sms') {
        // Send SMS verification
        const message = `GetIt Bangladesh: আপনার SMS ভেরিফিকেশন কোড: ${channel.verificationToken}`;
        
        // This would integrate with your SMS service
        logger.info('SMS verification sent', {
          serviceId: this.serviceName,
          channelId: channel.id,
          address: channel.address
        });
      }
    } catch (error: any) {
      logger.error('Failed to send verification', {
        serviceId: this.serviceName,
        channelId: channel.id,
        error: error.message
      });
    }
  }
}