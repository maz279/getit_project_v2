/**
 * Live Streaming Controller - Amazon Live/Shopee Live Level Implementation
 * Real-time streaming infrastructure with instant purchase capabilities
 * 
 * @fileoverview Amazon.com/Shopee.sg-level livestreaming controller with advanced features
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../db.js';
import { 
  liveStreams,
  liveStreamProducts,
  liveStreamViewers,
  liveStreamChat,
  liveStreamPurchases,
  liveStreamAnalytics,
  users,
  products,
  socialProfiles
} from '../../../../shared/schema.js';
import { eq, desc, and, gte, lte, count, sum, avg, sql } from 'drizzle-orm';
import winston from 'winston';
import { validationResult } from 'express-validator';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'live-streaming-controller' },
  transports: [
    new winston.transports.File({ filename: 'logs/live-streaming.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

export class LiveStreamingController {
  
  /**
   * Create a new live stream session
   * Amazon Live-style stream creation with product integration
   */
  async createLiveStream(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          success: false, 
          errors: errors.array(),
          message: 'Validation failed for live stream creation'
        });
        return;
      }

      const {
        hostId,
        title,
        titleBn,
        description,
        descriptionBn,
        category,
        productIds = [],
        scheduledStartTime,
        isScheduled = false,
        streamSettings = {
          allowChat: true,
          allowGifts: true,
          allowQuestions: true,
          moderatedChat: false,
          maxViewers: 10000
        }
      } = req.body;

      // Verify host exists and has streaming permissions
      const host = await db.select().from(socialProfiles).where(eq(socialProfiles.userId, hostId)).limit(1);
      if (host.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Host profile not found' 
        });
        return;
      }

      // Generate unique stream key and RTMP URL
      const streamKey = `stream_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const rtmpUrl = `rtmp://live.getit.com.bd/live/${streamKey}`;
      const hlsUrl = `https://cdn.getit.com.bd/live/${streamKey}/playlist.m3u8`;

      // Create live stream record
      const newStream = await db.insert(liveStreams).values({
        hostId,
        title,
        titleBn,
        description,
        descriptionBn,
        category,
        streamKey,
        rtmpUrl,
        hlsUrl,
        status: isScheduled ? 'scheduled' : 'created',
        scheduledStartTime: isScheduled ? new Date(scheduledStartTime) : null,
        streamSettings,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      const streamId = newStream[0].id;

      // Add products to stream if provided
      if (productIds.length > 0) {
        const streamProducts = productIds.map((productId: string, index: number) => ({
          streamId,
          productId,
          displayOrder: index + 1,
          isActive: true,
          addedAt: new Date()
        }));

        await db.insert(liveStreamProducts).values(streamProducts);
      }

      // Initialize stream analytics
      await db.insert(liveStreamAnalytics).values({
        streamId,
        viewerCount: 0,
        peakViewers: 0,
        totalViews: 0,
        averageWatchTime: 0,
        chatMessages: 0,
        likes: 0,
        shares: 0,
        productClicks: 0,
        purchases: 0,
        revenue: 0,
        engagementRate: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      logger.info(`Live stream created successfully: ${streamId} by host ${hostId}`);

      res.status(201).json({
        success: true,
        message: 'Live stream created successfully',
        data: {
          stream: newStream[0],
          streamingUrls: {
            rtmp: rtmpUrl,
            hls: hlsUrl,
            webrtc: `wss://live.getit.com.bd/webrtc/${streamKey}`
          },
          productCount: productIds.length
        }
      });

    } catch (error) {
      logger.error('Error creating live stream:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error while creating live stream',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get active live streams with Shopee Live-style discovery
   */
  async getActiveLiveStreams(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        category,
        language = 'en',
        sortBy = 'viewers' // viewers, recent, trending
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Build query with proper joins
      let query = db.select({
        id: liveStreams.id,
        hostId: liveStreams.hostId,
        title: language === 'bn' ? liveStreams.titleBn : liveStreams.title,
        description: language === 'bn' ? liveStreams.descriptionBn : liveStreams.description,
        category: liveStreams.category,
        thumbnailUrl: liveStreams.thumbnailUrl,
        status: liveStreams.status,
        startedAt: liveStreams.startedAt,
        hlsUrl: liveStreams.hlsUrl,
        hostName: socialProfiles.displayName,
        hostAvatar: socialProfiles.avatarUrl,
        hostVerified: socialProfiles.verificationStatus,
        viewerCount: liveStreamAnalytics.viewerCount,
        peakViewers: liveStreamAnalytics.peakViewers,
        totalViews: liveStreamAnalytics.totalViews,
        likes: liveStreamAnalytics.likes,
        productCount: count(liveStreamProducts.id)
      })
      .from(liveStreams)
      .leftJoin(socialProfiles, eq(liveStreams.hostId, socialProfiles.userId))
      .leftJoin(liveStreamAnalytics, eq(liveStreams.id, liveStreamAnalytics.streamId))
      .leftJoin(liveStreamProducts, eq(liveStreams.id, liveStreamProducts.streamId))
      .where(eq(liveStreams.status, 'live'))
      .groupBy(
        liveStreams.id, 
        socialProfiles.displayName, 
        socialProfiles.avatarUrl, 
        socialProfiles.verificationStatus,
        liveStreamAnalytics.viewerCount,
        liveStreamAnalytics.peakViewers,
        liveStreamAnalytics.totalViews,
        liveStreamAnalytics.likes
      );

      // Apply category filter
      if (category) {
        query = query.where(and(
          eq(liveStreams.status, 'live'),
          eq(liveStreams.category, category as string)
        ));
      }

      // Apply sorting
      switch (sortBy) {
        case 'recent':
          query = query.orderBy(desc(liveStreams.startedAt));
          break;
        case 'trending':
          query = query.orderBy(desc(liveStreamAnalytics.engagementRate));
          break;
        case 'viewers':
        default:
          query = query.orderBy(desc(liveStreamAnalytics.viewerCount));
          break;
      }

      const streams = await query.limit(Number(limit)).offset(offset);

      // Get total count for pagination
      const totalCount = await db.select({ count: count() })
        .from(liveStreams)
        .where(eq(liveStreams.status, 'live'));

      res.status(200).json({
        success: true,
        data: {
          streams,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalCount[0].count,
            totalPages: Math.ceil(totalCount[0].count / Number(limit))
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching active live streams:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching live streams',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Join a live stream session
   * Real-time viewer tracking with analytics
   */
  async joinLiveStream(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { 
        userId, 
        viewerInfo = {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          country: 'BD',
          device: 'web'
        }
      } = req.body;

      // Verify stream exists and is live
      const stream = await db.select().from(liveStreams)
        .where(and(
          eq(liveStreams.id, streamId),
          eq(liveStreams.status, 'live')
        )).limit(1);

      if (stream.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Live stream not found or not currently live' 
        });
        return;
      }

      // Check if user is already viewing
      const existingViewer = await db.select().from(liveStreamViewers)
        .where(and(
          eq(liveStreamViewers.streamId, streamId),
          eq(liveStreamViewers.userId, userId),
          eq(liveStreamViewers.isActive, true)
        )).limit(1);

      if (existingViewer.length === 0) {
        // Add new viewer
        await db.insert(liveStreamViewers).values({
          streamId,
          userId,
          joinedAt: new Date(),
          isActive: true,
          viewerInfo,
          lastHeartbeat: new Date()
        });

        // Update viewer count in analytics
        await db.update(liveStreamAnalytics)
          .set({
            viewerCount: sql`${liveStreamAnalytics.viewerCount} + 1`,
            totalViews: sql`${liveStreamAnalytics.totalViews} + 1`,
            peakViewers: sql`GREATEST(${liveStreamAnalytics.peakViewers}, ${liveStreamAnalytics.viewerCount} + 1)`,
            updatedAt: new Date()
          })
          .where(eq(liveStreamAnalytics.streamId, streamId));
      } else {
        // Update existing viewer heartbeat
        await db.update(liveStreamViewers)
          .set({
            isActive: true,
            lastHeartbeat: new Date()
          })
          .where(eq(liveStreamViewers.id, existingViewer[0].id));
      }

      // Get stream details with products
      const streamDetails = await db.select({
        id: liveStreams.id,
        title: liveStreams.title,
        description: liveStreams.description,
        hlsUrl: liveStreams.hlsUrl,
        chatEnabled: sql`${liveStreams.streamSettings}->>'allowChat'`,
        giftsEnabled: sql`${liveStreams.streamSettings}->>'allowGifts'`,
        hostName: socialProfiles.displayName,
        hostAvatar: socialProfiles.avatarUrl,
        viewerCount: liveStreamAnalytics.viewerCount
      })
      .from(liveStreams)
      .leftJoin(socialProfiles, eq(liveStreams.hostId, socialProfiles.userId))
      .leftJoin(liveStreamAnalytics, eq(liveStreams.id, liveStreamAnalytics.streamId))
      .where(eq(liveStreams.id, streamId))
      .limit(1);

      // Get active products in stream
      const streamProducts = await db.select({
        id: liveStreamProducts.id,
        productId: liveStreamProducts.productId,
        displayOrder: liveStreamProducts.displayOrder,
        productName: products.name,
        productImage: products.imageUrl,
        price: products.salePrice,
        originalPrice: products.price
      })
      .from(liveStreamProducts)
      .leftJoin(products, eq(liveStreamProducts.productId, products.id))
      .where(and(
        eq(liveStreamProducts.streamId, streamId),
        eq(liveStreamProducts.isActive, true)
      ))
      .orderBy(liveStreamProducts.displayOrder);

      logger.info(`User ${userId} joined live stream ${streamId}`);

      res.status(200).json({
        success: true,
        message: 'Successfully joined live stream',
        data: {
          stream: streamDetails[0],
          products: streamProducts,
          chatToken: `chat_${streamId}_${userId}_${Date.now()}`, // For real-time chat authentication
          webrtcToken: `webrtc_${streamId}_${userId}_${Date.now()}` // For WebRTC connection
        }
      });

    } catch (error) {
      logger.error('Error joining live stream:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error joining live stream',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Leave a live stream session
   */
  async leaveLiveStream(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { userId } = req.body;

      // Update viewer status
      const result = await db.update(liveStreamViewers)
        .set({
          isActive: false,
          leftAt: new Date()
        })
        .where(and(
          eq(liveStreamViewers.streamId, streamId),
          eq(liveStreamViewers.userId, userId),
          eq(liveStreamViewers.isActive, true)
        ));

      if (result.rowCount > 0) {
        // Update viewer count in analytics
        await db.update(liveStreamAnalytics)
          .set({
            viewerCount: sql`GREATEST(0, ${liveStreamAnalytics.viewerCount} - 1)`,
            updatedAt: new Date()
          })
          .where(eq(liveStreamAnalytics.streamId, streamId));

        logger.info(`User ${userId} left live stream ${streamId}`);
      }

      res.status(200).json({
        success: true,
        message: 'Successfully left live stream'
      });

    } catch (error) {
      logger.error('Error leaving live stream:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error leaving live stream',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * End a live stream session
   */
  async endLiveStream(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { hostId, recordingUrl } = req.body;

      // Verify host permission
      const stream = await db.select().from(liveStreams)
        .where(and(
          eq(liveStreams.id, streamId),
          eq(liveStreams.hostId, hostId)
        )).limit(1);

      if (stream.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Stream not found or unauthorized' 
        });
        return;
      }

      // Update stream status
      await db.update(liveStreams)
        .set({
          status: 'ended',
          endedAt: new Date(),
          recordingUrl: recordingUrl || null,
          updatedAt: new Date()
        })
        .where(eq(liveStreams.id, streamId));

      // Mark all viewers as inactive
      await db.update(liveStreamViewers)
        .set({
          isActive: false,
          leftAt: new Date()
        })
        .where(eq(liveStreamViewers.streamId, streamId));

      // Get final analytics
      const finalAnalytics = await db.select().from(liveStreamAnalytics)
        .where(eq(liveStreamAnalytics.streamId, streamId))
        .limit(1);

      logger.info(`Live stream ${streamId} ended by host ${hostId}`);

      res.status(200).json({
        success: true,
        message: 'Live stream ended successfully',
        data: {
          streamId,
          finalAnalytics: finalAnalytics[0],
          recordingUrl
        }
      });

    } catch (error) {
      logger.error('Error ending live stream:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error ending live stream',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get live stream analytics
   * Real-time performance metrics
   */
  async getLiveStreamAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;

      const analytics = await db.select({
        streamId: liveStreamAnalytics.streamId,
        viewerCount: liveStreamAnalytics.viewerCount,
        peakViewers: liveStreamAnalytics.peakViewers,
        totalViews: liveStreamAnalytics.totalViews,
        averageWatchTime: liveStreamAnalytics.averageWatchTime,
        chatMessages: liveStreamAnalytics.chatMessages,
        likes: liveStreamAnalytics.likes,
        shares: liveStreamAnalytics.shares,
        productClicks: liveStreamAnalytics.productClicks,
        purchases: liveStreamAnalytics.purchases,
        revenue: liveStreamAnalytics.revenue,
        engagementRate: liveStreamAnalytics.engagementRate,
        streamTitle: liveStreams.title,
        streamStatus: liveStreams.status,
        startedAt: liveStreams.startedAt,
        endedAt: liveStreams.endedAt
      })
      .from(liveStreamAnalytics)
      .leftJoin(liveStreams, eq(liveStreamAnalytics.streamId, liveStreams.id))
      .where(eq(liveStreamAnalytics.streamId, streamId))
      .limit(1);

      if (analytics.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Stream analytics not found' 
        });
        return;
      }

      // Get viewer demographics
      const viewerDemographics = await db.select({
        country: sql`${liveStreamViewers.viewerInfo}->>'country'`,
        device: sql`${liveStreamViewers.viewerInfo}->>'device'`,
        count: count()
      })
      .from(liveStreamViewers)
      .where(eq(liveStreamViewers.streamId, streamId))
      .groupBy(
        sql`${liveStreamViewers.viewerInfo}->>'country'`,
        sql`${liveStreamViewers.viewerInfo}->>'device'`
      );

      // Get top products
      const topProducts = await db.select({
        productId: liveStreamProducts.productId,
        productName: products.name,
        clicks: liveStreamProducts.clickCount,
        purchases: liveStreamProducts.purchaseCount,
        revenue: liveStreamProducts.revenue
      })
      .from(liveStreamProducts)
      .leftJoin(products, eq(liveStreamProducts.productId, products.id))
      .where(eq(liveStreamProducts.streamId, streamId))
      .orderBy(desc(liveStreamProducts.revenue))
      .limit(10);

      res.status(200).json({
        success: true,
        data: {
          analytics: analytics[0],
          demographics: viewerDemographics,
          topProducts
        }
      });

    } catch (error) {
      logger.error('Error fetching live stream analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching stream analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}