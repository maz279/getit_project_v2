/**
 * CDN Controller - Multi-CDN Orchestration System
 * Amazon.com CloudFront-Level CDN Management with Global Distribution
 * 
 * @fileoverview Advanced CDN controller with intelligent routing and optimization
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../db.js';
import { 
  streamCdnMetrics, 
  videoStreams 
} from '../../../../shared/schema.js';
import { eq, desc, and, gte, lte, avg, count } from 'drizzle-orm';
import winston from 'winston';
import axios from 'axios';
import { CDNOrchestrationService } from '../services/CDNOrchestrationService.js';
import { EdgeComputingService } from '../services/EdgeComputingService.js';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cdn-controller' },
  transports: [
    new winston.transports.File({ filename: 'logs/cdn-combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

interface CDNProvider {
  name: string;
  regions: string[];
  endpoints: {
    api: string;
    streaming: string;
    analytics: string;
  };
  pricing: {
    bandwidth: number;
    requests: number;
  };
  capabilities: string[];
}

export class CDNController {
  private cdnService: CDNOrchestrationService;
  private edgeService: EdgeComputingService;
  private cdnProviders: Map<string, CDNProvider>;

  constructor() {
    this.cdnService = new CDNOrchestrationService();
    this.edgeService = new EdgeComputingService();
    this.initializeCDNProviders();
  }

  /**
   * Get CDN health status across all providers
   * Real-time monitoring of global CDN infrastructure
   */
  async getCDNHealth(req: Request, res: Response): Promise<void> {
    try {
      const { region = 'global' } = req.query;

      // Get recent CDN metrics
      const metrics = await db
        .select()
        .from(streamCdnMetrics)
        .where(
          and(
            gte(streamCdnMetrics.timestamp, new Date(Date.now() - 15 * 60 * 1000)) // Last 15 minutes
          )
        )
        .orderBy(desc(streamCdnMetrics.timestamp));

      // Group by provider
      const providerMetrics = new Map();
      
      for (const metric of metrics) {
        const provider = metric.cdnProvider;
        if (!providerMetrics.has(provider)) {
          providerMetrics.set(provider, []);
        }
        providerMetrics.get(provider).push(metric);
      }

      // Calculate health scores
      const healthReport = Array.from(providerMetrics.entries()).map(([provider, metrics]) => {
        const avgLatency = metrics.reduce((sum: number, m: any) => sum + m.latencyMs, 0) / metrics.length;
        const avgErrorRate = metrics.reduce((sum: number, m: any) => sum + Number(m.errorRate), 0) / metrics.length;
        const avgThroughput = metrics.reduce((sum: number, m: any) => sum + Number(m.throughputMbps), 0) / metrics.length;
        const avgCacheHit = metrics.reduce((sum: number, m: any) => sum + Number(m.cacheHitRate), 0) / metrics.length;

        const healthScore = this.calculateCDNHealthScore(avgLatency, avgErrorRate, avgThroughput, avgCacheHit);
        
        return {
          provider,
          healthScore,
          status: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'degraded' : 'unhealthy',
          metrics: {
            averageLatency: Math.round(avgLatency),
            errorRate: Number(avgErrorRate.toFixed(4)),
            throughput: Number(avgThroughput.toFixed(2)),
            cacheHitRate: Number(avgCacheHit.toFixed(2))
          },
          regions: this.getProviderRegions(provider),
          lastUpdated: new Date()
        };
      });

      // Calculate overall health
      const overallHealth = healthReport.reduce((sum, provider) => sum + provider.healthScore, 0) / healthReport.length;

      res.json({
        success: true,
        data: {
          overallHealth: Math.round(overallHealth),
          overallStatus: overallHealth > 80 ? 'healthy' : overallHealth > 60 ? 'degraded' : 'unhealthy',
          providers: healthReport,
          timestamp: new Date(),
          region: region === 'global' ? 'Global' : region
        }
      });
    } catch (error) {
      logger.error('❌ Error getting CDN health:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get CDN health',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get optimal CDN configuration for stream
   * Intelligent CDN selection based on location and requirements
   */
  async getOptimalCDN(req: Request, res: Response): Promise<void> {
    try {
      const { 
        streamId, 
        viewerLocation = 'bangladesh', 
        latencyMode = 'low',
        expectedViewers = 1000
      } = req.query;

      // Get current CDN performance data
      const cdnMetrics = await db
        .select()
        .from(streamCdnMetrics)
        .where(
          and(
            streamId ? eq(streamCdnMetrics.streamId, streamId as string) : undefined,
            gte(streamCdnMetrics.timestamp, new Date(Date.now() - 30 * 60 * 1000)) // Last 30 minutes
          )
        )
        .orderBy(desc(streamCdnMetrics.timestamp));

      // Calculate optimal CDN selection
      const optimalCDN = await this.cdnService.selectOptimalCDN({
        location: viewerLocation as string,
        latencyMode: latencyMode as 'ultra_low' | 'low' | 'standard',
        expectedViewers: Number(expectedViewers),
        currentMetrics: cdnMetrics
      });

      // Get edge locations for optimal CDN
      const edgeLocations = await this.edgeService.getOptimalEdgeLocations(
        viewerLocation as string,
        optimalCDN.provider
      );

      // Calculate cost estimation
      const costEstimate = this.calculateCDNCost(
        optimalCDN.provider,
        Number(expectedViewers),
        latencyMode as string
      );

      res.json({
        success: true,
        data: {
          optimalCDN,
          edgeLocations,
          costEstimate,
          recommendations: {
            primary: optimalCDN.provider,
            fallback: optimalCDN.fallbackProvider,
            reason: optimalCDN.selectionReason
          },
          performance: {
            expectedLatency: optimalCDN.expectedLatency,
            expectedThroughput: optimalCDN.expectedThroughput,
            reliability: optimalCDN.reliabilityScore
          },
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('❌ Error getting optimal CDN:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get optimal CDN',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Configure CDN settings for stream
   * Dynamic CDN configuration with real-time optimization
   */
  async configureCDN(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const {
        primaryCDN,
        fallbackCDN,
        cacheSettings,
        compressionSettings,
        securitySettings,
        geoRestrictions
      } = req.body;

      // Validate stream exists
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

      // Configure primary CDN
      const primaryConfig = await this.cdnService.configureProvider(primaryCDN, {
        streamId,
        cacheSettings: {
          ttl: cacheSettings?.ttl || 3600,
          purgeOnUpdate: cacheSettings?.purgeOnUpdate || true,
          compressionLevel: compressionSettings?.level || 'medium'
        },
        security: {
          tokenAuthentication: securitySettings?.tokenAuth || false,
          referrerRestriction: securitySettings?.referrerRestriction || false,
          ipWhitelist: securitySettings?.ipWhitelist || []
        },
        geo: {
          restrictions: geoRestrictions?.blocked || [],
          allowedCountries: geoRestrictions?.allowed || []
        }
      });

      // Configure fallback CDN
      const fallbackConfig = fallbackCDN ? await this.cdnService.configureProvider(fallbackCDN, {
        streamId,
        cacheSettings: {
          ttl: cacheSettings?.ttl || 3600,
          purgeOnUpdate: cacheSettings?.purgeOnUpdate || true
        }
      }) : null;

      // Update stream configuration
      await db
        .update(videoStreams)
        .set({
          streamSettings: {
            ...stream.streamSettings,
            cdn: {
              primary: primaryConfig,
              fallback: fallbackConfig,
              configuredAt: new Date()
            }
          }
        })
        .where(eq(videoStreams.id, streamId));

      logger.info('🌐 CDN configuration updated', {
        streamId,
        primaryCDN,
        fallbackCDN,
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'CDN configuration updated successfully',
        data: {
          streamId,
          primaryCDN: primaryConfig,
          fallbackCDN: fallbackConfig,
          configuredAt: new Date()
        }
      });
    } catch (error) {
      logger.error('❌ Error configuring CDN:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to configure CDN',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get CDN analytics and performance metrics
   * Comprehensive CDN performance analysis
   */
  async getCDNAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { 
        streamId, 
        timeRange = '24h',
        provider,
        region 
      } = req.query;

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

      // Build query conditions
      const conditions = [
        gte(streamCdnMetrics.timestamp, startTime),
        lte(streamCdnMetrics.timestamp, endTime)
      ];

      if (streamId) conditions.push(eq(streamCdnMetrics.streamId, streamId as string));
      if (provider) conditions.push(eq(streamCdnMetrics.cdnProvider, provider as any));
      if (region) conditions.push(eq(streamCdnMetrics.region, region as string));

      // Get CDN metrics
      const metrics = await db
        .select()
        .from(streamCdnMetrics)
        .where(and(...conditions))
        .orderBy(desc(streamCdnMetrics.timestamp));

      // Calculate analytics
      const analytics = {
        totalRequests: metrics.reduce((sum, m) => sum + (m.requestCount || 0), 0),
        averageLatency: metrics.reduce((sum, m) => sum + m.latencyMs, 0) / metrics.length,
        averageThroughput: metrics.reduce((sum, m) => sum + Number(m.throughputMbps), 0) / metrics.length,
        averageErrorRate: metrics.reduce((sum, m) => sum + Number(m.errorRate), 0) / metrics.length,
        averageCacheHitRate: metrics.reduce((sum, m) => sum + Number(m.cacheHitRate), 0) / metrics.length,
        totalBandwidthCost: metrics.reduce((sum, m) => sum + Number(m.bandwidthCost), 0),
        uptime: this.calculateUptime(metrics),
        performanceScore: this.calculateOverallPerformance(metrics)
      };

      // Group by provider for comparison
      const providerComparison = this.groupMetricsByProvider(metrics);

      // Get trend data
      const trendData = this.calculateTrendData(metrics, timeRange as string);

      res.json({
        success: true,
        data: {
          analytics,
          providerComparison,
          trendData,
          timeRange,
          totalDataPoints: metrics.length,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('❌ Error getting CDN analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get CDN analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Purge CDN cache for stream
   * Instant cache invalidation across all CDN providers
   */
  async purgeCDNCache(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { 
        providers = ['all'], 
        purgeType = 'all',
        urls = [] 
      } = req.body;

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

      // Determine providers to purge
      const targetProviders = providers.includes('all') ? 
        ['cloudfront', 'cloudflare', 'akamai'] : 
        providers;

      // Purge cache for each provider
      const purgeResults = [];
      
      for (const provider of targetProviders) {
        try {
          const result = await this.cdnService.purgeCache(provider, {
            streamId,
            purgeType,
            urls: urls.length > 0 ? urls : [
              stream.hlsUrl,
              stream.dashUrl,
              stream.webrtcUrl
            ].filter(Boolean)
          });

          purgeResults.push({
            provider,
            success: true,
            purgeId: result.purgeId,
            estimatedTime: result.estimatedTime
          });
        } catch (error) {
          purgeResults.push({
            provider,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = purgeResults.filter(r => r.success).length;
      const overallSuccess = successCount > 0;

      logger.info('🗑️ CDN cache purge completed', {
        streamId,
        providers: targetProviders,
        successCount,
        totalProviders: targetProviders.length
      });

      res.json({
        success: overallSuccess,
        message: `Cache purge completed for ${successCount}/${targetProviders.length} providers`,
        data: {
          streamId,
          results: purgeResults,
          overallSuccess,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('❌ Error purging CDN cache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to purge CDN cache',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Private helper methods
   */
  private initializeCDNProviders(): void {
    this.cdnProviders = new Map([
      ['cloudfront', {
        name: 'Amazon CloudFront',
        regions: ['us-east-1', 'ap-southeast-1', 'eu-west-1', 'ap-south-1'],
        endpoints: {
          api: 'https://cloudfront.amazonaws.com',
          streaming: 'https://d1a2b3c4d5e6f7.cloudfront.net',
          analytics: 'https://cloudfront-analytics.amazonaws.com'
        },
        pricing: {
          bandwidth: 0.085, // per GB
          requests: 0.0075 // per 10,000 requests
        },
        capabilities: ['hls', 'dash', 'webrtc', 'drm', 'analytics']
      }],
      ['cloudflare', {
        name: 'Cloudflare Stream',
        regions: ['global'],
        endpoints: {
          api: 'https://api.cloudflare.com/client/v4',
          streaming: 'https://customer-streams.cloudflarestream.com',
          analytics: 'https://api.cloudflare.com/client/v4/accounts/analytics'
        },
        pricing: {
          bandwidth: 0.01, // per GB
          requests: 0.005 // per 10,000 requests
        },
        capabilities: ['hls', 'dash', 'webrtc', 'analytics']
      }],
      ['akamai', {
        name: 'Akamai Media Services',
        regions: ['global'],
        endpoints: {
          api: 'https://akab-h05jfcfcfcfcfcfc-akab.luna.akamaiapis.net',
          streaming: 'https://example.akamaized.net',
          analytics: 'https://reporting-api.akamai.com'
        },
        pricing: {
          bandwidth: 0.12, // per GB
          requests: 0.008 // per 10,000 requests
        },
        capabilities: ['hls', 'dash', 'drm', 'analytics']
      }]
    ]);
  }

  private calculateCDNHealthScore(latency: number, errorRate: number, throughput: number, cacheHit: number): number {
    let score = 100;
    
    // Latency penalty
    if (latency > 500) score -= 30;
    else if (latency > 300) score -= 15;
    else if (latency > 200) score -= 5;
    
    // Error rate penalty
    if (errorRate > 0.05) score -= 25;
    else if (errorRate > 0.02) score -= 10;
    
    // Throughput bonus/penalty
    if (throughput < 10) score -= 20;
    else if (throughput > 100) score += 5;
    
    // Cache hit rate bonus
    if (cacheHit > 0.95) score += 10;
    else if (cacheHit < 0.7) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  }

  private getProviderRegions(provider: string): string[] {
    const providerConfig = this.cdnProviders.get(provider);
    return providerConfig?.regions || [];
  }

  private calculateCDNCost(provider: string, viewers: number, latencyMode: string): any {
    const providerConfig = this.cdnProviders.get(provider);
    if (!providerConfig) return null;

    const estimatedGB = viewers * 0.5; // 0.5 GB per viewer estimate
    const estimatedRequests = viewers * 100; // 100 requests per viewer

    const bandwidthCost = estimatedGB * providerConfig.pricing.bandwidth;
    const requestCost = (estimatedRequests / 10000) * providerConfig.pricing.requests;

    return {
      provider,
      estimatedGB,
      estimatedRequests,
      bandwidthCost: Number(bandwidthCost.toFixed(4)),
      requestCost: Number(requestCost.toFixed(4)),
      totalCost: Number((bandwidthCost + requestCost).toFixed(4)),
      currency: 'USD'
    };
  }

  private calculateUptime(metrics: any[]): number {
    const healthyMetrics = metrics.filter(m => m.healthStatus === 'healthy');
    return metrics.length > 0 ? (healthyMetrics.length / metrics.length) * 100 : 0;
  }

  private calculateOverallPerformance(metrics: any[]): number {
    if (metrics.length === 0) return 0;

    const avgLatency = metrics.reduce((sum, m) => sum + m.latencyMs, 0) / metrics.length;
    const avgErrorRate = metrics.reduce((sum, m) => sum + Number(m.errorRate), 0) / metrics.length;
    const avgThroughput = metrics.reduce((sum, m) => sum + Number(m.throughputMbps), 0) / metrics.length;
    const avgCacheHit = metrics.reduce((sum, m) => sum + Number(m.cacheHitRate), 0) / metrics.length;

    return this.calculateCDNHealthScore(avgLatency, avgErrorRate, avgThroughput, avgCacheHit);
  }

  private groupMetricsByProvider(metrics: any[]): any {
    const grouped = new Map();
    
    for (const metric of metrics) {
      const provider = metric.cdnProvider;
      if (!grouped.has(provider)) {
        grouped.set(provider, []);
      }
      grouped.get(provider).push(metric);
    }

    return Array.from(grouped.entries()).map(([provider, providerMetrics]) => ({
      provider,
      metrics: {
        averageLatency: providerMetrics.reduce((sum: number, m: any) => sum + m.latencyMs, 0) / providerMetrics.length,
        averageErrorRate: providerMetrics.reduce((sum: number, m: any) => sum + Number(m.errorRate), 0) / providerMetrics.length,
        averageThroughput: providerMetrics.reduce((sum: number, m: any) => sum + Number(m.throughputMbps), 0) / providerMetrics.length,
        totalRequests: providerMetrics.reduce((sum: number, m: any) => sum + (m.requestCount || 0), 0),
        uptime: this.calculateUptime(providerMetrics)
      }
    }));
  }

  private calculateTrendData(metrics: any[], timeRange: string): any[] {
    // Group metrics by time intervals
    const intervals = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : 7;
    const intervalMs = timeRange === '1h' ? 5 * 60 * 1000 : timeRange === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    const now = Date.now();
    const trends = [];
    
    for (let i = intervals - 1; i >= 0; i--) {
      const intervalStart = new Date(now - (i + 1) * intervalMs);
      const intervalEnd = new Date(now - i * intervalMs);
      
      const intervalMetrics = metrics.filter(m => 
        m.timestamp >= intervalStart && m.timestamp < intervalEnd
      );
      
      if (intervalMetrics.length > 0) {
        const avgLatency = intervalMetrics.reduce((sum, m) => sum + m.latencyMs, 0) / intervalMetrics.length;
        const avgThroughput = intervalMetrics.reduce((sum, m) => sum + Number(m.throughputMbps), 0) / intervalMetrics.length;
        
        trends.push({
          timestamp: intervalEnd,
          latency: Math.round(avgLatency),
          throughput: Number(avgThroughput.toFixed(2)),
          dataPoints: intervalMetrics.length
        });
      }
    }
    
    return trends;
  }
}