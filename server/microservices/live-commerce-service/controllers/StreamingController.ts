/**
 * Streaming Controller - Enhanced Live Commerce Stream Management
 * Amazon.com/Shopee.sg-Level stream lifecycle and real-time interaction management
 * 
 * @fileoverview Enterprise-grade streaming controller with advanced features
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../db.js';
import { 
  liveCommerceSessions, 
  liveStreamViewers, 
  liveStreamInteractions,
  liveStreamAnalytics,
  liveCommerceProducts,
  liveStreamRecordings
} from '../../../../shared/schema.js';
import { eq, desc, and, gte, lte, count, sum } from 'drizzle-orm';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'streaming-controller' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/streaming-controller.log' })
  ]
});

export class StreamingController {
  
  // Get live sessions with enhanced filtering
  async getLiveSessions(req: Request, res: Response): Promise<void> {
    try {
      const { 
        status = 'live',
        category,
        language = 'all',
        sortBy = 'viewers',
        page = 1,
        limit = 20,
        minViewers = 0,
        maxViewers = 1000000
      } = req.query;

      let query = db.select({
        id: liveCommerceSessions.id,
        title: liveCommerceSessions.title,
        description: liveCommerceSessions.description,
        vendorId: liveCommerceSessions.vendorId,
        category: liveCommerceSessions.category,
        status: liveCommerceSessions.status,
        streamUrl: liveCommerceSessions.streamUrl,
        currentViewers: liveCommerceSessions.currentViewers,
        maxViewers: liveCommerceSessions.maxViewers,
        language: liveCommerceSessions.language,
        scheduledStartTime: liveCommerceSessions.scheduledStartTime,
        actualStartTime: liveCommerceSessions.actualStartTime,
        featuredProducts: liveCommerceSessions.featuredProducts,
        tags: liveCommerceSessions.tags,
        thumbnailUrl: liveCommerceSessions.thumbnailUrl,
        createdAt: liveCommerceSessions.createdAt
      }).from(liveCommerceSessions);

      // Apply filters
      const conditions = [];
      
      if (status !== 'all') {
        conditions.push(eq(liveCommerceSessions.status, status as string));
      }
      
      if (category) {
        conditions.push(eq(liveCommerceSessions.category, category as string));
      }
      
      if (language !== 'all') {
        conditions.push(eq(liveCommerceSessions.language, language as string));
      }
      
      if (minViewers > 0) {
        conditions.push(gte(liveCommerceSessions.currentViewers, Number(minViewers)));
      }
      
      if (maxViewers < 1000000) {
        conditions.push(lte(liveCommerceSessions.currentViewers, Number(maxViewers)));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply sorting
      switch (sortBy) {
        case 'viewers':
          query = query.orderBy(desc(liveCommerceSessions.currentViewers));
          break;
        case 'newest':
          query = query.orderBy(desc(liveCommerceSessions.createdAt));
          break;
        case 'trending':
          query = query.orderBy(desc(liveCommerceSessions.currentViewers));
          break;
        default:
          query = query.orderBy(desc(liveCommerceSessions.currentViewers));
      }

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      const sessions = await query.limit(Number(limit)).offset(offset);

      // Enrich with real-time data
      const enrichedSessions = await Promise.all(
        sessions.map(async (session) => {
          // Get viewer analytics
          const viewerStats = await db.select({
            totalViewers: count(),
            uniqueViewers: count()
          }).from(liveStreamViewers)
            .where(eq(liveStreamViewers.sessionId, session.id));

          // Get interaction stats
          const interactionStats = await db.select({
            totalInteractions: count(),
            likes: sum(liveStreamInteractions.metadata)
          }).from(liveStreamInteractions)
            .where(eq(liveStreamInteractions.sessionId, session.id));

          // Get product count
          const productCount = await db.select({
            count: count()
          }).from(liveCommerceProducts)
            .where(eq(liveCommerceProducts.sessionId, session.id));

          return {
            ...session,
            analytics: {
              totalViewers: viewerStats[0]?.totalViewers || 0,
              uniqueViewers: viewerStats[0]?.uniqueViewers || 0,
              totalInteractions: interactionStats[0]?.totalInteractions || 0,
              productCount: productCount[0]?.count || 0,
              engagement: this.calculateEngagement(
                session.currentViewers,
                interactionStats[0]?.totalInteractions || 0
              )
            }
          };
        })
      );

      res.json({
        success: true,
        data: {
          sessions: enrichedSessions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: sessions.length,
            hasMore: sessions.length === Number(limit)
          },
          filters: {
            status,
            category,
            language,
            sortBy,
            minViewers: Number(minViewers),
            maxViewers: Number(maxViewers)
          }
        }
      });

      logger.info('📺 Live sessions retrieved', {
        count: sessions.length,
        filters: { status, category, language, sortBy }
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving live sessions', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve live sessions'
      });
    }
  }

  // Get detailed session information
  async getSessionDetails(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      // Get session details
      const session = await db.select().from(liveCommerceSessions)
        .where(eq(liveCommerceSessions.id, sessionId))
        .limit(1);

      if (session.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      // Get comprehensive analytics
      const analytics = await this.getSessionAnalytics(sessionId);
      
      // Get featured products
      const products = await db.select().from(liveCommerceProducts)
        .where(eq(liveCommerceProducts.sessionId, sessionId))
        .orderBy(desc(liveCommerceProducts.displayOrder));

      // Get recent interactions
      const recentInteractions = await db.select().from(liveStreamInteractions)
        .where(eq(liveStreamInteractions.sessionId, sessionId))
        .orderBy(desc(liveStreamInteractions.timestamp))
        .limit(50);

      // Get recording information
      const recordings = await db.select().from(liveStreamRecordings)
        .where(eq(liveStreamRecordings.sessionId, sessionId));

      res.json({
        success: true,
        data: {
          session: session[0],
          analytics,
          products,
          recentInteractions,
          recordings,
          streamingInfo: {
            hlsUrl: session[0].streamUrl,
            webRtcUrl: session[0].streamUrl?.replace('hls', 'webrtc'),
            thumbnailUrl: session[0].thumbnailUrl,
            isLive: session[0].status === 'live'
          }
        }
      });

      logger.info('📊 Session details retrieved', { sessionId });

    } catch (error: any) {
      logger.error('❌ Error retrieving session details', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve session details'
      });
    }
  }

  // Join session with enhanced tracking
  async joinSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { 
        userId, 
        deviceInfo, 
        location, 
        userAgent,
        referrer 
      } = req.body;

      // Validate session
      const session = await db.select().from(liveCommerceSessions)
        .where(eq(liveCommerceSessions.id, sessionId))
        .limit(1);

      if (session.length === 0 || session[0].status !== 'live') {
        res.status(404).json({
          success: false,
          error: 'Session not found or not live'
        });
        return;
      }

      // Check capacity
      if (session[0].currentViewers >= session[0].maxViewers) {
        res.status(400).json({
          success: false,
          error: 'Session at maximum capacity'
        });
        return;
      }

      // Add viewer
      const viewer = await db.insert(liveStreamViewers).values({
        sessionId,
        userId: userId || null,
        deviceInfo: deviceInfo || {},
        location: location || {},
        userAgent: userAgent || '',
        referrer: referrer || '',
        joinedAt: new Date(),
        isActive: true
      }).returning();

      // Update session viewer count
      await db.update(liveCommerceSessions)
        .set({
          currentViewers: session[0].currentViewers + 1,
          updatedAt: new Date()
        })
        .where(eq(liveCommerceSessions.id, sessionId));

      res.json({
        success: true,
        data: {
          viewerId: viewer[0].id,
          sessionInfo: {
            title: session[0].title,
            description: session[0].description,
            streamUrl: session[0].streamUrl,
            currentViewers: session[0].currentViewers + 1,
            maxViewers: session[0].maxViewers
          },
          streamingEndpoints: {
            hls: session[0].streamUrl,
            webRtc: session[0].streamUrl?.replace('hls', 'webrtc'),
            thumbnails: session[0].thumbnailUrl
          }
        }
      });

      logger.info('👥 User joined session', {
        sessionId,
        userId: userId || 'anonymous',
        currentViewers: session[0].currentViewers + 1
      });

    } catch (error: any) {
      logger.error('❌ Error joining session', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to join session'
      });
    }
  }

  // Leave session
  async leaveSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { userId, viewerId } = req.body;

      // Update viewer status
      const whereCondition = viewerId 
        ? eq(liveStreamViewers.id, viewerId)
        : and(
            eq(liveStreamViewers.sessionId, sessionId),
            eq(liveStreamViewers.userId, userId)
          );

      const updatedViewer = await db.update(liveStreamViewers)
        .set({
          isActive: false,
          leftAt: new Date()
        })
        .where(whereCondition)
        .returning();

      if (updatedViewer.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Viewer not found'
        });
        return;
      }

      // Update session viewer count
      const activeViewers = await db.select({
        count: count()
      }).from(liveStreamViewers)
        .where(and(
          eq(liveStreamViewers.sessionId, sessionId),
          eq(liveStreamViewers.isActive, true)
        ));

      await db.update(liveCommerceSessions)
        .set({
          currentViewers: activeViewers[0].count,
          updatedAt: new Date()
        })
        .where(eq(liveCommerceSessions.id, sessionId));

      res.json({
        success: true,
        data: {
          message: 'Successfully left session',
          currentViewers: activeViewers[0].count
        }
      });

      logger.info('👤 User left session', {
        sessionId,
        userId: userId || 'anonymous',
        currentViewers: activeViewers[0].count
      });

    } catch (error: any) {
      logger.error('❌ Error leaving session', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to leave session'
      });
    }
  }

  // Get real-time analytics
  async getRealtimeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { timeRange = '1h' } = req.query;

      const analytics = await this.getSessionAnalytics(sessionId, timeRange as string);

      res.json({
        success: true,
        data: {
          analytics,
          timestamp: new Date(),
          timeRange
        }
      });

      logger.info('📊 Real-time analytics retrieved', { sessionId, timeRange });

    } catch (error: any) {
      logger.error('❌ Error retrieving real-time analytics', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analytics'
      });
    }
  }

  // Private helper methods
  private async getSessionAnalytics(sessionId: string, timeRange: string = '1h'): Promise<any> {
    const timeRangeMap = {
      '1h': new Date(Date.now() - 60 * 60 * 1000),
      '24h': new Date(Date.now() - 24 * 60 * 60 * 1000),
      '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };

    const since = timeRangeMap[timeRange as keyof typeof timeRangeMap] || timeRangeMap['1h'];

    // Get viewer analytics
    const viewerStats = await db.select({
      totalViewers: count(),
      uniqueViewers: count()
    }).from(liveStreamViewers)
      .where(and(
        eq(liveStreamViewers.sessionId, sessionId),
        gte(liveStreamViewers.joinedAt, since)
      ));

    // Get interaction analytics
    const interactionStats = await db.select({
      totalInteractions: count()
    }).from(liveStreamInteractions)
      .where(and(
        eq(liveStreamInteractions.sessionId, sessionId),
        gte(liveStreamInteractions.timestamp, since)
      ));

    // Get product analytics
    const productStats = await db.select({
      totalProducts: count(),
      totalPurchases: sum(liveCommerceProducts.purchaseCount)
    }).from(liveCommerceProducts)
      .where(eq(liveCommerceProducts.sessionId, sessionId));

    return {
      viewers: {
        total: viewerStats[0]?.totalViewers || 0,
        unique: viewerStats[0]?.uniqueViewers || 0,
        peak: await this.getPeakViewers(sessionId, since)
      },
      interactions: {
        total: interactionStats[0]?.totalInteractions || 0,
        rate: this.calculateInteractionRate(
          viewerStats[0]?.totalViewers || 0,
          interactionStats[0]?.totalInteractions || 0
        )
      },
      products: {
        total: productStats[0]?.totalProducts || 0,
        purchases: productStats[0]?.totalPurchases || 0,
        conversionRate: this.calculateConversionRate(
          viewerStats[0]?.totalViewers || 0,
          Number(productStats[0]?.totalPurchases || 0)
        )
      },
      engagement: {
        score: this.calculateEngagement(
          viewerStats[0]?.totalViewers || 0,
          interactionStats[0]?.totalInteractions || 0
        ),
        rating: this.getEngagementRating(
          viewerStats[0]?.totalViewers || 0,
          interactionStats[0]?.totalInteractions || 0
        )
      }
    };
  }

  private async getPeakViewers(sessionId: string, since: Date): Promise<number> {
    // In a real implementation, this would query time-series data
    // For now, return a simulated peak
    return Math.floor(Math.random() * 1000) + 100;
  }

  private calculateEngagement(viewers: number, interactions: number): number {
    if (viewers === 0) return 0;
    return Math.round((interactions / viewers) * 100);
  }

  private calculateInteractionRate(viewers: number, interactions: number): number {
    if (viewers === 0) return 0;
    return Math.round((interactions / viewers) * 100 * 100) / 100;
  }

  private calculateConversionRate(viewers: number, purchases: number): number {
    if (viewers === 0) return 0;
    return Math.round((purchases / viewers) * 100 * 100) / 100;
  }

  private getEngagementRating(viewers: number, interactions: number): string {
    const engagement = this.calculateEngagement(viewers, interactions);
    if (engagement >= 80) return 'excellent';
    if (engagement >= 60) return 'good';
    if (engagement >= 40) return 'average';
    if (engagement >= 20) return 'low';
    return 'very-low';
  }
}