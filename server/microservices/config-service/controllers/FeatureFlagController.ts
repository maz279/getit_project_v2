/**
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * Feature Flag Controller - Amazon.com/Shopee.sg-Level Enterprise Feature Management
 * 
 * Features:
 * - Dynamic feature toggles with gradual rollouts
 * - Advanced targeting and segmentation
 * - Real-time feature flag updates
 * - A/B testing integration
 * - Bangladesh market optimization
 * - Performance monitoring and analytics
 * 
 * Last Updated: July 9, 2025
 */

import { Request, Response } from 'express';
import { db } from '../../../db.js';
import { featureFlags, auditLogsDetailed, featureFlagEvaluations } from '../../../../shared/schema.js';
import { eq, and, or, desc, asc, count, sql } from 'drizzle-orm';
import { z } from 'zod';
import { Redis } from 'ioredis';
import * as crypto from 'crypto';

export class FeatureFlagController {
  private redis: Redis;
  private cachePrefix = 'feature_flag:';
  private cacheTTL = 300; // 5 minutes

  constructor() {
    // Initialize Redis connection with graceful fallback
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        enableOfflineQueue: false
      });
      
      this.redis.on('error', () => {
        console.warn('Redis connection failed for FeatureFlagController');
      });
    } catch (error) {
      console.warn('Redis not available for FeatureFlagController');
      this.redis = null;
    }
  }

  /**
   * Get all feature flags with filtering and pagination
   */
  async getAllFeatureFlags(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 50, 
        status, 
        environment, 
        owner, 
        search,
        tags 
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let query = db.select().from(featureFlags);
      let whereConditions: any[] = [];

      // Apply filters
      if (status) {
        const isActiveStatus = status === 'enabled' ? true : false;
        whereConditions.push(eq(featureFlags.isActive, isActiveStatus));
      }

      if (owner) {
        whereConditions.push(eq(featureFlags.createdBy, parseInt(owner as string)));
      }

      if (search) {
        whereConditions.push(
          or(
            sql`${featureFlags.flagName} ILIKE ${'%' + search + '%'}`,
            sql`${featureFlags.description} ILIKE ${'%' + search + '%'}`,
            sql`${featureFlags.displayName} ILIKE ${'%' + search + '%'}`
          )
        );
      }

      if (tags) {
        const tagArray = (tags as string).split(',');
        whereConditions.push(
          sql`${featureFlags.tags} @> ${JSON.stringify(tagArray)}`
        );
      }

      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }

      const results = await query
        .orderBy(desc(featureFlags.updatedAt))
        .limit(limitNum)
        .offset(offset);

      // Get total count for pagination
      const totalQuery = db.select({ count: count() }).from(featureFlags);
      if (whereConditions.length > 0) {
        totalQuery.where(and(...whereConditions));
      }
      const totalResult = await totalQuery;
      const total = totalResult[0].count;

      res.json({
        success: true,
        data: {
          featureFlags: results,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feature flags'
      });
    }
  }

  /**
   * Get specific feature flag by ID or key
   */
  async getFeatureFlag(req: Request, res: Response): Promise<void> {
    try {
      const { identifier } = req.params;
      const { environment = 'production' } = req.query;

      // Check cache first
      const cacheKey = `${this.cachePrefix}${identifier}:${environment}`;
      let featureFlag = null;

      if (this.redis) {
        try {
          const cached = await this.redis.get(cacheKey);
          if (cached) {
            featureFlag = JSON.parse(cached);
          }
        } catch (error) {
          console.warn('Redis cache miss for feature flag:', identifier);
        }
      }

      if (!featureFlag) {
        // Try to find by ID first, then by key
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        
        if (isUuid) {
          const result = await db.select().from(featureFlags).where(eq(featureFlags.id, identifier));
          featureFlag = result[0];
        } else {
          const result = await db.select().from(featureFlags).where(eq(featureFlags.key, identifier));
          featureFlag = result[0];
        }

        if (!featureFlag) {
          res.status(404).json({
            success: false,
            error: 'Feature flag not found'
          });
          return;
        }

        // Cache the result
        if (this.redis) {
          try {
            await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(featureFlag));
          } catch (error) {
            console.warn('Failed to cache feature flag:', identifier);
          }
        }
      }

      // Evaluate feature flag for the current context
      const evaluatedFlag = await this.evaluateFeatureFlag(featureFlag, req, environment as string);

      res.json({
        success: true,
        data: evaluatedFlag
      });
    } catch (error) {
      console.error('Error fetching feature flag:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feature flag'
      });
    }
  }

  /**
   * Create new feature flag
   */
  async createFeatureFlag(req: Request, res: Response): Promise<void> {
    try {
      const createSchema = z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        key: z.string().min(1).max(255),
        status: z.enum(['enabled', 'disabled', 'gradual_rollout', 'kill_switch']).default('disabled'),
        rolloutStrategy: z.enum(['percentage', 'user_list', 'geographic', 'device_type', 'user_attributes']).default('percentage'),
        rolloutPercentage: z.number().min(0).max(100).default(0),
        targetUsers: z.array(z.string()).optional(),
        targetGroups: z.array(z.string()).optional(),
        targetAttributes: z.object({}).optional(),
        environments: z.array(z.string()).optional(),
        defaultValue: z.any().optional(),
        variations: z.object({}).optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.object({}).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        teamId: z.string().optional()
      });

      const validatedData = createSchema.parse(req.body);
      const userId = req.user?.id || 1; // Fallback for development

      // Check for unique key
      const existingFlag = await db.select().from(featureFlags).where(eq(featureFlags.key, validatedData.key));
      if (existingFlag.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Feature flag key already exists'
        });
        return;
      }

      // Create feature flag
      const newFlag = await db.insert(featureFlags).values({
        ...validatedData,
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null
      }).returning();

      // Create audit log
      await this.createAuditLog(newFlag[0].id, 'create', null, newFlag[0], userId, req);

      // Invalidate cache
      if (this.redis) {
        try {
          await this.redis.del(`${this.cachePrefix}${newFlag[0].key}:*`);
        } catch (error) {
          console.warn('Failed to invalidate cache for new feature flag');
        }
      }

      res.status(201).json({
        success: true,
        data: newFlag[0]
      });
    } catch (error) {
      console.error('Error creating feature flag:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create feature flag'
      });
    }
  }

  /**
   * Update feature flag
   */
  async updateFeatureFlag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 1;

      const updateSchema = z.object({
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        status: z.enum(['enabled', 'disabled', 'gradual_rollout', 'kill_switch']).optional(),
        rolloutStrategy: z.enum(['percentage', 'user_list', 'geographic', 'device_type', 'user_attributes']).optional(),
        rolloutPercentage: z.number().min(0).max(100).optional(),
        targetUsers: z.array(z.string()).optional(),
        targetGroups: z.array(z.string()).optional(),
        targetAttributes: z.object({}).optional(),
        environments: z.array(z.string()).optional(),
        defaultValue: z.any().optional(),
        variations: z.object({}).optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.object({}).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        teamId: z.string().optional()
      });

      const validatedData = updateSchema.parse(req.body);

      // Get current feature flag
      const currentFlag = await db.select().from(featureFlags).where(eq(featureFlags.id, id));
      if (currentFlag.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Feature flag not found'
        });
        return;
      }

      // Update feature flag
      const updatedFlag = await db.update(featureFlags)
        .set({
          ...validatedData,
          updatedBy: userId,
          updatedAt: new Date(),
          startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined
        })
        .where(eq(featureFlags.id, id))
        .returning();

      // Create audit log
      await this.createAuditLog(id, 'update', currentFlag[0], updatedFlag[0], userId, req);

      // Invalidate cache
      if (this.redis) {
        try {
          await this.redis.del(`${this.cachePrefix}${currentFlag[0].key}:*`);
        } catch (error) {
          console.warn('Failed to invalidate cache for updated feature flag');
        }
      }

      res.json({
        success: true,
        data: updatedFlag[0]
      });
    } catch (error) {
      console.error('Error updating feature flag:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update feature flag'
      });
    }
  }

  /**
   * Delete feature flag
   */
  async deleteFeatureFlag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 1;

      // Get current feature flag
      const currentFlag = await db.select().from(featureFlags).where(eq(featureFlags.id, id));
      if (currentFlag.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Feature flag not found'
        });
        return;
      }

      // Delete feature flag
      await db.delete(featureFlags).where(eq(featureFlags.id, id));

      // Create audit log
      await this.createAuditLog(id, 'delete', currentFlag[0], null, userId, req);

      // Invalidate cache
      if (this.redis) {
        try {
          await this.redis.del(`${this.cachePrefix}${currentFlag[0].key}:*`);
        } catch (error) {
          console.warn('Failed to invalidate cache for deleted feature flag');
        }
      }

      res.json({
        success: true,
        message: 'Feature flag deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete feature flag'
      });
    }
  }

  /**
   * Toggle feature flag status
   */
  async toggleFeatureFlag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id || 1;

      const toggleSchema = z.object({
        status: z.enum(['enabled', 'disabled', 'gradual_rollout', 'kill_switch'])
      });

      const validatedData = toggleSchema.parse({ status });

      // Get current feature flag
      const currentFlag = await db.select().from(featureFlags).where(eq(featureFlags.id, id));
      if (currentFlag.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Feature flag not found'
        });
        return;
      }

      // Update status
      const updatedFlag = await db.update(featureFlags)
        .set({
          status: validatedData.status,
          updatedBy: userId,
          updatedAt: new Date()
        })
        .where(eq(featureFlags.id, id))
        .returning();

      // Create audit log
      await this.createAuditLog(id, 'update', currentFlag[0], updatedFlag[0], userId, req);

      // Invalidate cache
      if (this.redis) {
        try {
          await this.redis.del(`${this.cachePrefix}${currentFlag[0].key}:*`);
        } catch (error) {
          console.warn('Failed to invalidate cache for toggled feature flag');
        }
      }

      res.json({
        success: true,
        data: updatedFlag[0]
      });
    } catch (error) {
      console.error('Error toggling feature flag:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle feature flag'
      });
    }
  }

  /**
   * Update rollout percentage
   */
  async updateRolloutPercentage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { percentage } = req.body;
      const userId = req.user?.id || 1;

      const rolloutSchema = z.object({
        percentage: z.number().min(0).max(100)
      });

      const validatedData = rolloutSchema.parse({ percentage });

      // Get current feature flag
      const currentFlag = await db.select().from(featureFlags).where(eq(featureFlags.id, id));
      if (currentFlag.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Feature flag not found'
        });
        return;
      }

      // Update rollout percentage
      const updatedFlag = await db.update(featureFlags)
        .set({
          rolloutPercentage: validatedData.percentage,
          updatedBy: userId,
          updatedAt: new Date()
        })
        .where(eq(featureFlags.id, id))
        .returning();

      // Create audit log
      await this.createAuditLog(id, 'update', currentFlag[0], updatedFlag[0], userId, req);

      // Invalidate cache
      if (this.redis) {
        try {
          await this.redis.del(`${this.cachePrefix}${currentFlag[0].key}:*`);
        } catch (error) {
          console.warn('Failed to invalidate cache for rollout update');
        }
      }

      res.json({
        success: true,
        data: updatedFlag[0]
      });
    } catch (error) {
      console.error('Error updating rollout percentage:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update rollout percentage'
      });
    }
  }

  /**
   * Get feature flag analytics
   */
  async getFeatureFlagAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const analytics = await db.select()
        .from(configAnalytics)
        .where(
          and(
            eq(configAnalytics.configId, id),
            startDate ? sql`${configAnalytics.timestamp} >= ${startDate}` : undefined,
            endDate ? sql`${configAnalytics.timestamp} <= ${endDate}` : undefined
          )
        )
        .orderBy(desc(configAnalytics.timestamp));

      // Process analytics data
      const processedAnalytics = this.processAnalyticsData(analytics);

      res.json({
        success: true,
        data: processedAnalytics
      });
    } catch (error) {
      console.error('Error fetching feature flag analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feature flag analytics'
      });
    }
  }

  /**
   * Get feature flag health status
   */
  async getFeatureFlagHealth(req: Request, res: Response): Promise<void> {
    try {
      const healthStats = await db.select({
        total: count(),
        enabled: count(sql`CASE WHEN ${featureFlags.status} = 'enabled' THEN 1 END`),
        disabled: count(sql`CASE WHEN ${featureFlags.status} = 'disabled' THEN 1 END`),
        gradualRollout: count(sql`CASE WHEN ${featureFlags.status} = 'gradual_rollout' THEN 1 END`),
        killSwitch: count(sql`CASE WHEN ${featureFlags.status} = 'kill_switch' THEN 1 END`)
      }).from(featureFlags);

      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date(),
          stats: healthStats[0],
          redis: this.redis ? 'connected' : 'disconnected'
        }
      });
    } catch (error) {
      console.error('Error fetching feature flag health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feature flag health'
      });
    }
  }

  /**
   * Evaluate feature flag for specific context
   */
  private async evaluateFeatureFlag(flag: any, req: Request, environment: string): Promise<any> {
    const context = {
      userId: req.user?.id,
      environment,
      country: req.get('CF-IPCountry') || 'BD', // Default to Bangladesh
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    };

    let isEnabled = false;
    let variation = flag.defaultValue;

    // Check if feature flag is active
    if (flag.status === 'disabled' || flag.status === 'kill_switch') {
      isEnabled = false;
    } else if (flag.status === 'enabled') {
      isEnabled = true;
    } else if (flag.status === 'gradual_rollout') {
      // Evaluate rollout strategy
      isEnabled = await this.evaluateRolloutStrategy(flag, context);
    }

    // If enabled, determine variation
    if (isEnabled && flag.variations) {
      variation = await this.determineVariation(flag, context);
    }

    // Log analytics
    await this.logAnalytics(flag.id, 'evaluation', context, { isEnabled, variation });

    return {
      ...flag,
      isEnabled,
      variation,
      evaluationContext: context
    };
  }

  /**
   * Evaluate rollout strategy
   */
  private async evaluateRolloutStrategy(flag: any, context: any): Promise<boolean> {
    switch (flag.rolloutStrategy) {
      case 'percentage':
        return this.evaluatePercentageRollout(flag, context);
      case 'user_list':
        return this.evaluateUserListRollout(flag, context);
      case 'geographic':
        return this.evaluateGeographicRollout(flag, context);
      case 'device_type':
        return this.evaluateDeviceTypeRollout(flag, context);
      case 'user_attributes':
        return this.evaluateUserAttributesRollout(flag, context);
      default:
        return false;
    }
  }

  /**
   * Evaluate percentage rollout
   */
  private evaluatePercentageRollout(flag: any, context: any): boolean {
    const hash = crypto.createHash('md5').update(`${flag.key}:${context.userId}`).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16);
    const percentage = (hashValue % 100) + 1;
    return percentage <= flag.rolloutPercentage;
  }

  /**
   * Evaluate user list rollout
   */
  private evaluateUserListRollout(flag: any, context: any): boolean {
    if (!flag.targetUsers || !context.userId) return false;
    return flag.targetUsers.includes(context.userId.toString());
  }

  /**
   * Evaluate geographic rollout
   */
  private evaluateGeographicRollout(flag: any, context: any): boolean {
    if (!flag.targetAttributes?.countries) return false;
    return flag.targetAttributes.countries.includes(context.country);
  }

  /**
   * Evaluate device type rollout
   */
  private evaluateDeviceTypeRollout(flag: any, context: any): boolean {
    if (!flag.targetAttributes?.deviceTypes || !context.userAgent) return false;
    
    const userAgent = context.userAgent.toLowerCase();
    const deviceType = userAgent.includes('mobile') ? 'mobile' : 
                      userAgent.includes('tablet') ? 'tablet' : 'desktop';
    
    return flag.targetAttributes.deviceTypes.includes(deviceType);
  }

  /**
   * Evaluate user attributes rollout
   */
  private evaluateUserAttributesRollout(flag: any, context: any): boolean {
    // This would typically integrate with user service to get user attributes
    // For now, return a basic implementation
    return true;
  }

  /**
   * Determine variation for A/B testing
   */
  private async determineVariation(flag: any, context: any): Promise<any> {
    if (!flag.variations || Object.keys(flag.variations).length === 0) {
      return flag.defaultValue;
    }

    const variations = Object.keys(flag.variations);
    const hash = crypto.createHash('md5').update(`${flag.key}:${context.userId}:variation`).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16);
    const variationIndex = hashValue % variations.length;
    
    return flag.variations[variations[variationIndex]];
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(configId: string, action: string, oldValue: any, newValue: any, userId: number, req: Request): Promise<void> {
    try {
      await db.insert(configurationAudits).values({
        configId,
        action: action as any,
        oldValue,
        newValue,
        userId,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        metadata: {
          endpoint: req.originalUrl,
          method: req.method
        }
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log analytics data
   */
  private async logAnalytics(configId: string, eventType: string, context: any, data: any): Promise<void> {
    try {
      await db.insert(configAnalytics).values({
        configId,
        eventType,
        eventData: data,
        userId: context.userId,
        environment: context.environment,
        ipAddress: context.ipAddress,
        country: context.country,
        userAgent: context.userAgent,
        metadata: {
          timestamp: new Date(),
          context
        }
      });
    } catch (error) {
      console.error('Failed to log analytics:', error);
    }
  }

  /**
   * Process analytics data for reporting
   */
  private processAnalyticsData(analytics: any[]): any {
    const summary = {
      totalEvaluations: analytics.length,
      enabledCount: 0,
      disabledCount: 0,
      byEnvironment: {},
      byCountry: {},
      timeline: []
    };

    analytics.forEach(item => {
      if (item.eventData?.isEnabled) {
        summary.enabledCount++;
      } else {
        summary.disabledCount++;
      }

      // Group by environment
      if (!summary.byEnvironment[item.environment]) {
        summary.byEnvironment[item.environment] = 0;
      }
      summary.byEnvironment[item.environment]++;

      // Group by country
      if (!summary.byCountry[item.country]) {
        summary.byCountry[item.country] = 0;
      }
      summary.byCountry[item.country]++;
    });

    return summary;
  }
}

export default FeatureFlagController;