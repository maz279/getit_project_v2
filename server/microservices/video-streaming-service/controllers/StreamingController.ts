/**
 * Streaming Controller - Amazon.com/Shopee.sg-Level Stream Management
 * Enterprise-grade stream lifecycle management with real-time monitoring
 * 
 * @fileoverview Advanced streaming controller with CDN optimization and analytics
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../db.js';
import { 
  videoStreams, 
  streamAnalytics, 
  streamCdnMetrics, 
  streamQualityMetrics,
  streamProcessingJobs,
  streamThumbnails,
  vendors
} from '../../../../shared/schema.js';
import { eq, desc, and, gte, lte, count, sum, avg } from 'drizzle-orm';
import winston from 'winston';
import crypto from 'crypto';
import { WebRTCService } from '../services/WebRTCService.js';
import { CDNOrchestrationService } from '../services/CDNOrchestrationService.js';
import { TranscodingService } from '../services/TranscodingService.js';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'video-streaming-controller' },
  transports: [
    new winston.transports.File({ filename: 'logs/video-streaming-combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

export class StreamingController {
  private webRTCService: WebRTCService;
  private cdnService: CDNOrchestrationService;
  private transcodingService: TranscodingService;

  constructor() {
    this.webRTCService = new WebRTCService();
    this.cdnService = new CDNOrchestrationService();
    this.transcodingService = new TranscodingService();
  }

  /**
   * Create a new video stream session
   * Amazon.com/Shopee.sg-Level stream creation with enterprise features
   */
  async createStream(req: Request, res: Response): Promise<void> {
    try {
      const {
        vendorId,
        liveSessionId,
        title,
        description,
        scheduledStartTime,
        scheduledEndTime,
        qualityLevels = ['720p', '480p', '360p'],
        latencyMode = 'low',
        maxViewers = 10000,
        recordingEnabled = true,
        drmEnabled = false,
        geoblockingEnabled = false,
        allowedCountries = [],
        chatEnabled = true,
        moderationEnabled = true
      } = req.body;

      // Generate unique stream identifiers
      const sessionId = crypto.randomUUID();
      const streamKey = crypto.randomBytes(32).toString('hex');

      // Get optimal CDN configuration
      const cdnConfig = await this.cdnService.getOptimalCDNConfig('bangladesh');

      // Create stream URLs
      const streamUrls = {
        rtmpUrl: `${cdnConfig.rtmpEndpoint}/live/${streamKey}`,
        hlsUrl: `${cdnConfig.hlsEndpoint}/live/${streamKey}/index.m3u8`,
        dashUrl: `${cdnConfig.dashEndpoint}/live/${streamKey}/manifest.mpd`,
        webrtcUrl: `${cdnConfig.webrtcEndpoint}/live/${streamKey}`
      };

      // Create stream in database
      const [stream] = await db
        .insert(videoStreams)
        .values({
          sessionId,
          vendorId,
          liveSessionId,
          title,
          description,
          streamKey,
          ...streamUrls,
          qualityLevels,
          latencyMode,
          maxViewers,
          recordingEnabled,
          drmEnabled,
          geoblockingEnabled,
          allowedCountries,
          chatEnabled,
          moderationEnabled,
          scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : null,
          scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : null,
          status: 'scheduled'
        })
        .returning();

      // Initialize stream analytics
      await db
        .insert(streamAnalytics)
        .values({
          streamId: stream.id,
          timestamp: new Date(),
          viewerCount: 0,
          peakViewers: 0,
          averageBitrate: 0,
          fps: 30,
          latencyMs: 0
        });

      // Set up CDN monitoring
      await this.setupCDNMonitoring(stream.id);

      // Schedule processing job if recording enabled
      if (recordingEnabled) {
        await this.scheduleRecordingJob(stream.id);
      }

      logger.info('🎬 Video stream created successfully', {
        streamId: stream.id,
        sessionId,
        vendorId,
        title,
        qualityLevels,
        latencyMode
      });

      res.status(201).json({
        success: true,
        message: 'Stream created successfully',
        data: {
          stream,
          streamUrls,
          cdnConfig: {
            provider: cdnConfig.provider,
            region: cdnConfig.region,
            latencyOptimized: true
          }
        }
      });
    } catch (error) {
      logger.error('❌ Error creating stream:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create stream',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Start a live stream
   * Enterprise-grade stream initialization with real-time monitoring
   */
  async startStream(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { quality = '720p' } = req.body;

      // Get stream from database
      const [stream] = await db
        .select()
        .from(videoStreams)
        .where(eq(videoStreams.id, streamId))
        .limit(1);

      if (!stream) {
        res.status(404).json({
          success: false,
          message: 'Stream not found'
        });
        return;
      }

      // Initialize WebRTC if ultra-low latency mode
      if (stream.latencyMode === 'ultra_low') {
        await this.webRTCService.initializeWebRTCStream(streamId, quality);
      }

      // Start transcoding service
      await this.transcodingService.startTranscoding(streamId, {
        inputUrl: stream.rtmpUrl,
        outputQualities: stream.qualityLevels,
        preset: stream.latencyMode
      });

      // Update stream status
      await db
        .update(videoStreams)
        .set({
          status: 'live',
          actualStartTime: new Date(),
          currentViewers: 0
        })
        .where(eq(videoStreams.id, streamId));

      // Initialize real-time analytics
      await this.initializeRealTimeAnalytics(streamId);

      logger.info('🔴 Stream started successfully', {
        streamId,
        quality,
        latencyMode: stream.latencyMode,
        title: stream.title
      });

      res.json({
        success: true,
        message: 'Stream started successfully',
        data: {
          streamId,
          status: 'live',
          startTime: new Date(),
          monitoringEnabled: true
        }
      });
    } catch (error) {
      logger.error('❌ Error starting stream:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start stream',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Stop a live stream
   * Complete stream shutdown with analytics finalization
   */
  async stopStream(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;

      // Get stream from database
      const [stream] = await db
        .select()
        .from(videoStreams)
        .where(eq(videoStreams.id, streamId))
        .limit(1);

      if (!stream) {
        res.status(404).json({
          success: false,
          message: 'Stream not found'
        });
        return;
      }

      // Stop transcoding service
      await this.transcodingService.stopTranscoding(streamId);

      // Stop WebRTC if used
      if (stream.latencyMode === 'ultra_low') {
        await this.webRTCService.stopWebRTCStream(streamId);
      }

      // Finalize analytics
      await this.finalizeStreamAnalytics(streamId);

      // Update stream status
      await db
        .update(videoStreams)
        .set({
          status: 'ended',
          actualEndTime: new Date(),
          currentViewers: 0
        })
        .where(eq(videoStreams.id, streamId));

      // Process recording if enabled
      if (stream.recordingEnabled) {
        await this.processRecording(streamId);
      }

      logger.info('⏹️ Stream stopped successfully', {
        streamId,
        title: stream.title,
        duration: stream.actualStartTime ? 
          Date.now() - stream.actualStartTime.getTime() : 0
      });

      res.json({
        success: true,
        message: 'Stream stopped successfully',
        data: {
          streamId,
          status: 'ended',
          endTime: new Date(),
          recordingProcessing: stream.recordingEnabled
        }
      });
    } catch (error) {
      logger.error('❌ Error stopping stream:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stop stream',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get stream status and metrics
   * Real-time stream monitoring with comprehensive analytics
   */
  async getStreamStatus(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;

      // Get stream details
      const [stream] = await db
        .select()
        .from(videoStreams)
        .where(eq(videoStreams.id, streamId))
        .limit(1);

      if (!stream) {
        res.status(404).json({
          success: false,
          message: 'Stream not found'
        });
        return;
      }

      // Get latest analytics
      const [analytics] = await db
        .select()
        .from(streamAnalytics)
        .where(eq(streamAnalytics.streamId, streamId))
        .orderBy(desc(streamAnalytics.timestamp))
        .limit(1);

      // Get CDN metrics
      const cdnMetrics = await db
        .select()
        .from(streamCdnMetrics)
        .where(eq(streamCdnMetrics.streamId, streamId))
        .orderBy(desc(streamCdnMetrics.timestamp))
        .limit(3);

      // Get quality metrics
      const qualityMetrics = await db
        .select()
        .from(streamQualityMetrics)
        .where(eq(streamQualityMetrics.streamId, streamId))
        .orderBy(desc(streamQualityMetrics.timestamp))
        .limit(5);

      // Calculate performance score
      const performanceScore = this.calculatePerformanceScore(analytics, cdnMetrics, qualityMetrics);

      res.json({
        success: true,
        data: {
          stream,
          analytics,
          cdnMetrics,
          qualityMetrics,
          performanceScore,
          isLive: stream.status === 'live',
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('❌ Error getting stream status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get stream status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get comprehensive stream metrics
   * Advanced analytics with business intelligence
   */
  async getStreamMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { timeRange = '24h' } = req.query;

      // Calculate time range
      const endTime = new Date();
      const startTime = new Date();
      
      switch (timeRange) {
        case '1h':
          startTime.setHours(startTime.getHours() - 1);
          break;
        case '24h':
          startTime.setDate(startTime.getDate() - 1);
          break;
        case '7d':
          startTime.setDate(startTime.getDate() - 7);
          break;
        case '30d':
          startTime.setDate(startTime.getDate() - 30);
          break;
        default:
          startTime.setHours(startTime.getHours() - 24);
      }

      // Get analytics data
      const analyticsData = await db
        .select()
        .from(streamAnalytics)
        .where(
          and(
            eq(streamAnalytics.streamId, streamId),
            gte(streamAnalytics.timestamp, startTime),
            lte(streamAnalytics.timestamp, endTime)
          )
        )
        .orderBy(desc(streamAnalytics.timestamp));

      // Calculate aggregated metrics
      const aggregatedMetrics = {
        totalViews: Math.max(...analyticsData.map(a => a.viewerCount || 0)),
        peakViewers: Math.max(...analyticsData.map(a => a.peakViewers || 0)),
        averageLatency: analyticsData.reduce((sum, a) => sum + (a.latencyMs || 0), 0) / analyticsData.length,
        totalBandwidth: analyticsData.reduce((sum, a) => sum + Number(a.bandwidthUsage || 0), 0),
        engagementRate: analyticsData.reduce((sum, a) => sum + Number(a.engagementScore || 0), 0) / analyticsData.length,
        conversionRate: analyticsData.reduce((sum, a) => sum + Number(a.conversionRate || 0), 0) / analyticsData.length,
        totalRevenue: analyticsData.reduce((sum, a) => sum + Number(a.revenueGenerated || 0), 0),
        totalInteractions: analyticsData.reduce((sum, a) => sum + (a.interactions || 0), 0)
      };

      // Get geographic and device distribution
      const latestAnalytics = analyticsData[0];
      const geographicData = latestAnalytics?.geographicDistribution || {};
      const deviceData = latestAnalytics?.deviceBreakdown || {};

      res.json({
        success: true,
        data: {
          streamId,
          timeRange,
          aggregatedMetrics,
          geographicDistribution: geographicData,
          deviceBreakdown: deviceData,
          timeSeriesData: analyticsData.map(a => ({
            timestamp: a.timestamp,
            viewerCount: a.viewerCount,
            latency: a.latencyMs,
            bitrate: a.averageBitrate,
            engagement: a.engagementScore
          })),
          performanceGrade: this.calculatePerformanceGrade(aggregatedMetrics)
        }
      });
    } catch (error) {
      logger.error('❌ Error getting stream metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get stream metrics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Private helper methods
   */
  private async setupCDNMonitoring(streamId: string): Promise<void> {
    // Initialize CDN monitoring for multiple providers
    const cdnProviders = ['cloudfront', 'cloudflare', 'akamai'];
    
    for (const provider of cdnProviders) {
      await db
        .insert(streamCdnMetrics)
        .values({
          streamId,
          cdnProvider: provider as any,
          region: 'ap-southeast-1',
          latencyMs: 0,
          throughputMbps: 0,
          errorRate: 0,
          cacheHitRate: 0,
          healthStatus: 'healthy'
        });
    }
  }

  private async scheduleRecordingJob(streamId: string): Promise<void> {
    await db
      .insert(streamProcessingJobs)
      .values({
        streamId,
        jobType: 'recording',
        status: 'pending',
        processingSettings: {
          format: 'mp4',
          quality: '1080p',
          codec: 'h264'
        }
      });
  }

  private async initializeRealTimeAnalytics(streamId: string): Promise<void> {
    // Set up real-time analytics tracking
    // This would integrate with actual analytics services
    logger.info('📊 Real-time analytics initialized', { streamId });
  }

  private async finalizeStreamAnalytics(streamId: string): Promise<void> {
    // Finalize analytics and generate summary
    const finalAnalytics = await db
      .select()
      .from(streamAnalytics)
      .where(eq(streamAnalytics.streamId, streamId))
      .orderBy(desc(streamAnalytics.timestamp))
      .limit(1);

    if (finalAnalytics.length > 0) {
      logger.info('📈 Stream analytics finalized', {
        streamId,
        totalViews: finalAnalytics[0].viewerCount,
        peakViewers: finalAnalytics[0].peakViewers,
        revenue: finalAnalytics[0].revenueGenerated
      });
    }
  }

  private async processRecording(streamId: string): Promise<void> {
    // Process stream recording
    await db
      .insert(streamProcessingJobs)
      .values({
        streamId,
        jobType: 'post_processing',
        status: 'pending',
        processingSettings: {
          generateThumbnails: true,
          createHighlights: true,
          transcodeQualities: ['1080p', '720p', '480p']
        }
      });
  }

  private calculatePerformanceScore(analytics: any, cdnMetrics: any[], qualityMetrics: any[]): number {
    // Calculate comprehensive performance score (0-100)
    let score = 100;
    
    // Deduct for high latency
    if (analytics?.latencyMs > 5000) score -= 20;
    else if (analytics?.latencyMs > 3000) score -= 10;
    
    // Deduct for low engagement
    if (analytics?.engagementScore < 0.5) score -= 15;
    
    // Deduct for CDN issues
    const unhealthyCDNs = cdnMetrics.filter(m => m.healthStatus !== 'healthy').length;
    score -= unhealthyCDNs * 10;
    
    // Deduct for quality issues
    const highBufferRates = qualityMetrics.filter(m => m.bufferRatio > 0.1).length;
    score -= highBufferRates * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculatePerformanceGrade(metrics: any): string {
    const { averageLatency, engagementRate, conversionRate } = metrics;
    
    let score = 100;
    
    // Latency scoring
    if (averageLatency > 5000) score -= 30;
    else if (averageLatency > 3000) score -= 15;
    
    // Engagement scoring
    if (engagementRate < 0.3) score -= 25;
    else if (engagementRate < 0.5) score -= 10;
    
    // Conversion scoring
    if (conversionRate < 0.01) score -= 20;
    else if (conversionRate < 0.03) score -= 10;
    
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  }
}