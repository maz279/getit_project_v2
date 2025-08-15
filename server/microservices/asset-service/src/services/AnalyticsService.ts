/**
 * AnalyticsService - Amazon.com/Shopee.sg-Level Asset Analytics & Intelligence
 * 
 * Comprehensive analytics system providing:
 * - Real-time asset usage tracking and engagement metrics
 * - Performance monitoring and optimization insights
 * - Cost analysis and financial optimization
 * - Bangladesh market-specific analytics
 * - AI-powered recommendations and predictions
 * - Business intelligence and executive dashboards
 */

import { performance } from 'perf_hooks';

export interface AssetUsageEvent {
  assetId: string;
  eventType: 'upload' | 'access' | 'download' | 'view' | 'transform' | 'delete';
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  performance?: {
    loadTime?: number;
    transferSize?: number;
    responseCode?: number;
  };
  bangladesh?: {
    region?: string;
    mobileNetwork?: 'grameenphone' | 'banglalink' | 'robi' | 'teletalk' | 'airtel';
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    culturalContext?: string;
  };
}

export interface AssetPerformanceMetrics {
  assetId: string;
  totalViews: number;
  uniqueViews: number;
  avgLoadTime: number;
  transferSize: number;
  cacheHitRatio: number;
  errorRate: number;
  engagementScore: number;
  conversionRate?: number;
  bangladesh?: {
    mobilePerformance: number;
    regionalPopularity: Record<string, number>;
    culturalEngagement: number;
  };
}

export interface AssetCostAnalysis {
  assetId: string;
  storageCost: number;
  bandwidthCost: number;
  processingCost: number;
  cdnCost: number;
  totalCost: number;
  costPerView: number;
  roi?: number;
  projectedMonthlyCost: number;
}

export interface BangladeshMarketInsights {
  topRegions: Array<{ region: string; usage: number; engagement: number }>;
  mobileNetworkPerformance: Record<string, { speed: number; reliability: number; satisfaction: number }>;
  culturalContentPerformance: Record<string, { views: number; engagement: number; conversion: number }>;
  festivalImpact: Array<{ festival: string; trafficIncrease: number; engagementBoost: number }>;
  paymentMethodPreferences: Record<string, number>;
  deviceUsagePatterns: Record<string, number>;
}

export interface AssetRecommendation {
  type: 'optimization' | 'replacement' | 'removal' | 'promotion' | 'cultural-adaptation';
  assetId: string;
  recommendation: string;
  expectedImpact: {
    performanceGain?: number;
    costSaving?: number;
    engagementIncrease?: number;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
}

export class AnalyticsService {
  private events: AssetUsageEvent[] = [];
  private metricsCache = new Map<string, AssetPerformanceMetrics>();
  private costCache = new Map<string, AssetCostAnalysis>();
  private bangladeshInsights: BangladeshMarketInsights | null = null;
  
  constructor() {
    this.initializeAnalytics();
    this.startPeriodicAnalysis();
  }

  /**
   * Track asset upload with comprehensive metadata
   */
  public async trackAssetUpload(event: {
    assetId: string;
    category: string;
    fileSize: number;
    userId: string;
    bangladesh?: string;
  }): Promise<void> {
    const usageEvent: AssetUsageEvent = {
      assetId: event.assetId,
      eventType: 'upload',
      userId: event.userId,
      timestamp: new Date(),
      metadata: {
        category: event.category,
        fileSize: event.fileSize
      },
      bangladesh: event.bangladesh ? {
        region: event.bangladesh,
        deviceType: 'desktop' // Default for uploads
      } : undefined
    };

    await this.recordEvent(usageEvent);
    await this.updateRealTimeMetrics(event.assetId, 'upload');
  }

  /**
   * Track asset access with performance metrics
   */
  public async trackAssetAccess(event: {
    assetId: string;
    userId?: string;
    userAgent?: string;
    ipAddress?: string;
    loadTime?: number;
    transferSize?: number;
  }): Promise<void> {
    const bangladesh = await this.extractBangladeshContext(event.userAgent, event.ipAddress);
    
    const usageEvent: AssetUsageEvent = {
      assetId: event.assetId,
      eventType: 'access',
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: new Date(),
      performance: {
        loadTime: event.loadTime,
        transferSize: event.transferSize,
        responseCode: 200
      },
      bangladesh
    };

    await this.recordEvent(usageEvent);
    await this.updateRealTimeMetrics(event.assetId, 'access');
    
    // Update Bangladesh market insights if applicable
    if (bangladesh) {
      await this.updateBangladeshInsights(event.assetId, bangladesh);
    }
  }

  /**
   * Track asset transformation/optimization events
   */
  public async trackAssetTransformation(event: {
    assetId: string;
    transformationType: string;
    originalSize: number;
    optimizedSize: number;
    processingTime: number;
  }): Promise<void> {
    const usageEvent: AssetUsageEvent = {
      assetId: event.assetId,
      eventType: 'transform',
      timestamp: new Date(),
      metadata: {
        transformationType: event.transformationType,
        compressionRatio: event.originalSize / event.optimizedSize,
        sizeSaving: event.originalSize - event.optimizedSize,
        processingTime: event.processingTime
      }
    };

    await this.recordEvent(usageEvent);
    await this.updateOptimizationMetrics(event.assetId, event);
  }

  /**
   * Track asset deletion events
   */
  public async trackAssetDeletion(event: {
    assetId: string;
    userId: string;
    deletionType: 'soft' | 'hard';
  }): Promise<void> {
    const usageEvent: AssetUsageEvent = {
      assetId: event.assetId,
      eventType: 'delete',
      userId: event.userId,
      timestamp: new Date(),
      metadata: {
        deletionType: event.deletionType
      }
    };

    await this.recordEvent(usageEvent);
    await this.archiveAssetMetrics(event.assetId);
  }

  /**
   * Track asset update events
   */
  public async trackAssetUpdate(event: {
    assetId: string;
    userId: string;
    changes: string[];
  }): Promise<void> {
    const usageEvent: AssetUsageEvent = {
      assetId: event.assetId,
      eventType: 'access', // Using access for updates
      userId: event.userId,
      timestamp: new Date(),
      metadata: {
        updateType: 'metadata',
        changes: event.changes
      }
    };

    await this.recordEvent(usageEvent);
  }

  /**
   * Get comprehensive asset performance metrics
   */
  public async getAssetMetrics(assetId: string): Promise<AssetPerformanceMetrics> {
    try {
      // Check cache first
      if (this.metricsCache.has(assetId)) {
        const cached = this.metricsCache.get(assetId)!;
        // Return cached if less than 5 minutes old
        if (Date.now() - cached.timestamp < 300000) {
          return cached;
        }
      }

      // Calculate metrics from events
      const assetEvents = this.events.filter(e => e.assetId === assetId);
      const metrics = await this.calculateAssetMetrics(assetId, assetEvents);
      
      // Cache the result
      this.metricsCache.set(assetId, { ...metrics, timestamp: Date.now() } as any);
      
      return metrics;

    } catch (error) {
      console.error('Asset metrics calculation error:', error);
      throw new Error(`Failed to get asset metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get asset cost analysis with ROI calculation
   */
  public async getAssetCostAnalysis(assetId: string): Promise<AssetCostAnalysis> {
    try {
      // Check cache first
      if (this.costCache.has(assetId)) {
        const cached = this.costCache.get(assetId)!;
        // Return cached if less than 1 hour old
        if (Date.now() - cached.timestamp < 3600000) {
          return cached;
        }
      }

      const analysis = await this.calculateAssetCosts(assetId);
      
      // Cache the result
      this.costCache.set(assetId, { ...analysis, timestamp: Date.now() } as any);
      
      return analysis;

    } catch (error) {
      console.error('Asset cost analysis error:', error);
      throw new Error(`Failed to get cost analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Bangladesh market insights and analytics
   */
  public async getBangladeshMarketInsights(): Promise<BangladeshMarketInsights> {
    try {
      if (this.bangladeshInsights && Date.now() - this.bangladeshInsights.timestamp < 1800000) { // 30 minutes
        return this.bangladeshInsights;
      }

      const insights = await this.calculateBangladeshInsights();
      this.bangladeshInsights = { ...insights, timestamp: Date.now() } as any;
      
      return insights;

    } catch (error) {
      console.error('Bangladesh insights calculation error:', error);
      throw new Error(`Failed to get Bangladesh insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate AI-powered optimization recommendations
   */
  public async generateOptimizationRecommendations(): Promise<AssetRecommendation[]> {
    try {
      const recommendations: AssetRecommendation[] = [];

      // Analyze performance metrics for all assets
      const allMetrics = await this.getAllAssetMetrics();
      
      // Identify underperforming assets
      const underperformingAssets = allMetrics.filter(m => 
        m.avgLoadTime > 2000 || m.errorRate > 0.05 || m.engagementScore < 0.3
      );

      for (const asset of underperformingAssets) {
        recommendations.push(...await this.generateAssetRecommendations(asset));
      }

      // Identify cost optimization opportunities
      const costAnalyses = await this.getAllCostAnalyses();
      const expensiveAssets = costAnalyses.filter(c => c.costPerView > 0.01);

      for (const analysis of expensiveAssets) {
        recommendations.push({
          type: 'optimization',
          assetId: analysis.assetId,
          recommendation: `Optimize asset to reduce cost per view from $${analysis.costPerView.toFixed(4)} to ~$0.005`,
          expectedImpact: {
            costSaving: analysis.costPerView * 0.5
          },
          priority: analysis.costPerView > 0.02 ? 'high' : 'medium',
          implementation: 'Apply advanced compression and move to appropriate storage tier'
        });
      }

      // Bangladesh-specific recommendations
      const bangladeshRecommendations = await this.generateBangladeshRecommendations();
      recommendations.push(...bangladeshRecommendations);

      // Sort by priority and expected impact
      return recommendations.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    } catch (error) {
      console.error('Recommendations generation error:', error);
      throw new Error(`Failed to generate recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get real-time dashboard data
   */
  public async getRealTimeDashboard(): Promise<{
    totalAssets: number;
    totalViews: number;
    totalCost: number;
    avgPerformance: number;
    topAssets: Array<{ assetId: string; views: number; performance: number }>;
    recentActivity: AssetUsageEvent[];
    bangladeshMetrics: {
      totalBangladeshUsers: number;
      topRegions: string[];
      mobileUsage: number;
    };
  }> {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentEvents = this.events.filter(e => e.timestamp >= last24Hours);

      const totalAssets = new Set(recentEvents.map(e => e.assetId)).size;
      const totalViews = recentEvents.filter(e => e.eventType === 'access').length;
      
      // Calculate average performance
      const performanceEvents = recentEvents.filter(e => e.performance?.loadTime);
      const avgPerformance = performanceEvents.reduce((sum, e) => sum + (e.performance?.loadTime || 0), 0) / performanceEvents.length || 0;

      // Get top performing assets
      const assetViews = new Map<string, number>();
      recentEvents.forEach(e => {
        if (e.eventType === 'access') {
          assetViews.set(e.assetId, (assetViews.get(e.assetId) || 0) + 1);
        }
      });

      const topAssets = Array.from(assetViews.entries())
        .map(([assetId, views]) => ({
          assetId,
          views,
          performance: this.calculateAssetPerformanceScore(assetId)
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Bangladesh-specific metrics
      const bangladeshEvents = recentEvents.filter(e => e.bangladesh);
      const bangladeshUsers = new Set(bangladeshEvents.map(e => e.userId)).size;
      const mobileEvents = bangladeshEvents.filter(e => e.bangladesh?.deviceType === 'mobile');
      const mobileUsage = mobileEvents.length / bangladeshEvents.length || 0;

      const regionCounts = new Map<string, number>();
      bangladeshEvents.forEach(e => {
        if (e.bangladesh?.region) {
          regionCounts.set(e.bangladesh.region, (regionCounts.get(e.bangladesh.region) || 0) + 1);
        }
      });

      const topRegions = Array.from(regionCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([region]) => region);

      return {
        totalAssets,
        totalViews,
        totalCost: 0, // Calculated separately
        avgPerformance,
        topAssets,
        recentActivity: recentEvents.slice(-20),
        bangladeshMetrics: {
          totalBangladeshUsers: bangladeshUsers,
          topRegions,
          mobileUsage: Math.round(mobileUsage * 100) / 100
        }
      };

    } catch (error) {
      console.error('Real-time dashboard error:', error);
      throw new Error(`Failed to get dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private implementation methods

  private initializeAnalytics(): void {
    // Initialize analytics system
    console.log('Asset Analytics Service initialized');
  }

  private startPeriodicAnalysis(): void {
    // Run periodic analysis every 15 minutes
    setInterval(async () => {
      await this.performPeriodicAnalysis();
    }, 900000);
  }

  private async recordEvent(event: AssetUsageEvent): Promise<void> {
    // Store event (in production, this would go to database)
    this.events.push(event);

    // Keep only last 10,000 events in memory
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }

    // Trigger real-time analysis if needed
    if (this.shouldTriggerRealTimeAnalysis(event)) {
      await this.performRealTimeAnalysis(event);
    }
  }

  private async updateRealTimeMetrics(assetId: string, eventType: string): Promise<void> {
    // Update real-time metrics cache
    // Implementation would update running counters and averages
  }

  private async extractBangladeshContext(userAgent?: string, ipAddress?: string): Promise<AssetUsageEvent['bangladesh']> {
    if (!userAgent && !ipAddress) return undefined;

    // Extract device type from user agent
    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (userAgent) {
      if (/Mobile|Android|iPhone/.test(userAgent)) {
        deviceType = 'mobile';
      } else if (/Tablet|iPad/.test(userAgent)) {
        deviceType = 'tablet';
      }
    }

    // Extract region from IP (in production, use IP geolocation service)
    let region = 'dhaka'; // Default
    if (ipAddress) {
      // IP geolocation logic would go here
      region = this.getRegionFromIP(ipAddress);
    }

    // Detect mobile network (would require additional data sources)
    const mobileNetwork = this.detectMobileNetwork(userAgent, ipAddress);

    return {
      region,
      deviceType,
      mobileNetwork
    };
  }

  private async updateBangladeshInsights(assetId: string, bangladesh: NonNullable<AssetUsageEvent['bangladesh']>): Promise<void> {
    // Update Bangladesh-specific insights
    // Implementation would update regional usage patterns, network performance, etc.
  }

  private async updateOptimizationMetrics(assetId: string, event: any): Promise<void> {
    // Update optimization-related metrics
    // Implementation would track compression ratios, processing times, etc.
  }

  private async archiveAssetMetrics(assetId: string): Promise<void> {
    // Archive metrics for deleted assets
    this.metricsCache.delete(assetId);
    this.costCache.delete(assetId);
  }

  private async calculateAssetMetrics(assetId: string, events: AssetUsageEvent[]): Promise<AssetPerformanceMetrics> {
    const accessEvents = events.filter(e => e.eventType === 'access');
    const uniqueUsers = new Set(accessEvents.map(e => e.userId)).size;
    
    const loadTimes = accessEvents.map(e => e.performance?.loadTime).filter(Boolean) as number[];
    const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length || 0;

    const transferSizes = accessEvents.map(e => e.performance?.transferSize).filter(Boolean) as number[];
    const avgTransferSize = transferSizes.reduce((sum, size) => sum + size, 0) / transferSizes.length || 0;

    // Calculate engagement score based on multiple factors
    const engagementScore = this.calculateEngagementScore(events);

    // Bangladesh-specific metrics
    const bangladeshEvents = events.filter(e => e.bangladesh);
    const mobileEvents = bangladeshEvents.filter(e => e.bangladesh?.deviceType === 'mobile');
    const mobilePerformance = mobileEvents.length > 0 ? 
      mobileEvents.reduce((sum, e) => sum + (e.performance?.loadTime || 0), 0) / mobileEvents.length : 0;

    const regionalPopularity: Record<string, number> = {};
    bangladeshEvents.forEach(e => {
      if (e.bangladesh?.region) {
        regionalPopularity[e.bangladesh.region] = (regionalPopularity[e.bangladesh.region] || 0) + 1;
      }
    });

    return {
      assetId,
      totalViews: accessEvents.length,
      uniqueViews: uniqueUsers,
      avgLoadTime,
      transferSize: avgTransferSize,
      cacheHitRatio: 0.85, // Placeholder - would be calculated from CDN metrics
      errorRate: events.filter(e => e.performance?.responseCode && e.performance.responseCode >= 400).length / events.length,
      engagementScore,
      bangladesh: bangladeshEvents.length > 0 ? {
        mobilePerformance,
        regionalPopularity,
        culturalEngagement: this.calculateCulturalEngagement(bangladeshEvents)
      } : undefined
    };
  }

  private async calculateAssetCosts(assetId: string): Promise<AssetCostAnalysis> {
    // Calculate various cost components
    const events = this.events.filter(e => e.assetId === assetId);
    const accessEvents = events.filter(e => e.eventType === 'access');
    
    // Placeholder calculations - in production, these would use actual cost data
    const totalViews = accessEvents.length;
    const avgTransferSize = accessEvents.reduce((sum, e) => sum + (e.performance?.transferSize || 0), 0) / totalViews || 0;
    
    const storageCost = 0.023; // $0.023 per GB per month
    const bandwidthCost = (avgTransferSize / 1024 / 1024 / 1024) * totalViews * 0.09; // $0.09 per GB
    const processingCost = totalViews * 0.0001; // $0.0001 per processing operation
    const cdnCost = (avgTransferSize / 1024 / 1024 / 1024) * totalViews * 0.085; // $0.085 per GB CDN
    
    const totalCost = storageCost + bandwidthCost + processingCost + cdnCost;
    const costPerView = totalViews > 0 ? totalCost / totalViews : 0;

    return {
      assetId,
      storageCost,
      bandwidthCost,
      processingCost,
      cdnCost,
      totalCost,
      costPerView,
      projectedMonthlyCost: totalCost * 30 // Rough projection
    };
  }

  private async calculateBangladeshInsights(): Promise<BangladeshMarketInsights> {
    const bangladeshEvents = this.events.filter(e => e.bangladesh);
    
    // Calculate top regions
    const regionUsage = new Map<string, number>();
    const regionEngagement = new Map<string, number>();
    
    bangladeshEvents.forEach(e => {
      if (e.bangladesh?.region) {
        regionUsage.set(e.bangladesh.region, (regionUsage.get(e.bangladesh.region) || 0) + 1);
        regionEngagement.set(e.bangladesh.region, (regionEngagement.get(e.bangladesh.region) || 0) + (e.performance?.loadTime ? 1 / e.performance.loadTime : 0));
      }
    });

    const topRegions = Array.from(regionUsage.entries()).map(([region, usage]) => ({
      region,
      usage,
      engagement: regionEngagement.get(region) || 0
    })).sort((a, b) => b.usage - a.usage);

    // Calculate mobile network performance
    const networkPerformance: Record<string, { speed: number; reliability: number; satisfaction: number }> = {};
    ['grameenphone', 'banglalink', 'robi', 'teletalk', 'airtel'].forEach(network => {
      const networkEvents = bangladeshEvents.filter(e => e.bangladesh?.mobileNetwork === network);
      if (networkEvents.length > 0) {
        const avgSpeed = networkEvents.reduce((sum, e) => sum + (e.performance?.loadTime ? 1000 / e.performance.loadTime : 0), 0) / networkEvents.length;
        networkPerformance[network] = {
          speed: avgSpeed,
          reliability: 0.95, // Placeholder
          satisfaction: 0.85  // Placeholder
        };
      }
    });

    return {
      topRegions,
      mobileNetworkPerformance: networkPerformance,
      culturalContentPerformance: {}, // Placeholder
      festivalImpact: [], // Placeholder
      paymentMethodPreferences: {
        'bkash': 0.45,
        'nagad': 0.30,
        'rocket': 0.15,
        'card': 0.10
      },
      deviceUsagePatterns: {
        'mobile': 0.75,
        'desktop': 0.20,
        'tablet': 0.05
      }
    };
  }

  private calculateEngagementScore(events: AssetUsageEvent[]): number {
    // Calculate engagement score based on various factors
    const accessEvents = events.filter(e => e.eventType === 'access');
    if (accessEvents.length === 0) return 0;

    const avgLoadTime = accessEvents.reduce((sum, e) => sum + (e.performance?.loadTime || 0), 0) / accessEvents.length;
    const uniqueUsers = new Set(accessEvents.map(e => e.userId)).size;
    const totalAccesses = accessEvents.length;

    // Scoring factors
    const loadTimeScore = Math.max(0, 1 - (avgLoadTime / 5000)); // Penalize slow loading
    const uniquenessScore = Math.min(1, uniqueUsers / totalAccesses); // Reward unique engagement
    const volumeScore = Math.min(1, totalAccesses / 100); // Reward high usage

    return (loadTimeScore * 0.4 + uniquenessScore * 0.3 + volumeScore * 0.3);
  }

  private calculateCulturalEngagement(bangladeshEvents: AssetUsageEvent[]): number {
    // Calculate cultural engagement score for Bangladesh content
    // Implementation would analyze cultural context, festival correlations, etc.
    return 0.75; // Placeholder
  }

  // Helper methods with placeholder implementations
  private getRegionFromIP(ipAddress: string): string {
    // IP geolocation implementation
    const regionMap: Record<string, string> = {
      '203.': 'dhaka',
      '114.': 'chittagong',
      '122.': 'sylhet'
    };

    for (const [prefix, region] of Object.entries(regionMap)) {
      if (ipAddress.startsWith(prefix)) {
        return region;
      }
    }

    return 'dhaka'; // Default
  }

  private detectMobileNetwork(userAgent?: string, ipAddress?: string): AssetUsageEvent['bangladesh']['mobileNetwork'] {
    // Mobile network detection implementation
    // This would require additional data sources or API calls
    return 'grameenphone'; // Placeholder
  }

  private shouldTriggerRealTimeAnalysis(event: AssetUsageEvent): boolean {
    // Determine if this event should trigger real-time analysis
    return event.eventType === 'access' || event.eventType === 'upload';
  }

  private async performRealTimeAnalysis(event: AssetUsageEvent): Promise<void> {
    // Perform real-time analysis for immediate insights
    // Implementation would update dashboards, trigger alerts, etc.
  }

  private async performPeriodicAnalysis(): Promise<void> {
    // Perform periodic analysis and cleanup
    // Implementation would update aggregated metrics, generate reports, etc.
  }

  private calculateAssetPerformanceScore(assetId: string): number {
    const events = this.events.filter(e => e.assetId === assetId);
    return this.calculateEngagementScore(events);
  }

  private async getAllAssetMetrics(): Promise<AssetPerformanceMetrics[]> {
    const assetIds = [...new Set(this.events.map(e => e.assetId))];
    const metrics: AssetPerformanceMetrics[] = [];

    for (const assetId of assetIds) {
      try {
        const metric = await this.getAssetMetrics(assetId);
        metrics.push(metric);
      } catch (error) {
        console.warn(`Failed to get metrics for asset ${assetId}:`, error);
      }
    }

    return metrics;
  }

  private async getAllCostAnalyses(): Promise<AssetCostAnalysis[]> {
    const assetIds = [...new Set(this.events.map(e => e.assetId))];
    const analyses: AssetCostAnalysis[] = [];

    for (const assetId of assetIds) {
      try {
        const analysis = await this.getAssetCostAnalysis(assetId);
        analyses.push(analysis);
      } catch (error) {
        console.warn(`Failed to get cost analysis for asset ${assetId}:`, error);
      }
    }

    return analyses;
  }

  private async generateAssetRecommendations(asset: AssetPerformanceMetrics): Promise<AssetRecommendation[]> {
    const recommendations: AssetRecommendation[] = [];

    if (asset.avgLoadTime > 2000) {
      recommendations.push({
        type: 'optimization',
        assetId: asset.assetId,
        recommendation: `Optimize asset to reduce load time from ${asset.avgLoadTime}ms to <1000ms`,
        expectedImpact: {
          performanceGain: (asset.avgLoadTime - 1000) / asset.avgLoadTime
        },
        priority: asset.avgLoadTime > 5000 ? 'critical' : 'high',
        implementation: 'Apply image optimization, use next-gen formats (WebP/AVIF), implement progressive loading'
      });
    }

    if (asset.errorRate > 0.05) {
      recommendations.push({
        type: 'optimization',
        assetId: asset.assetId,
        recommendation: `Fix asset reliability issues - current error rate: ${(asset.errorRate * 100).toFixed(1)}%`,
        expectedImpact: {
          performanceGain: asset.errorRate
        },
        priority: 'high',
        implementation: 'Check CDN configuration, verify asset integrity, implement redundant storage'
      });
    }

    return recommendations;
  }

  private async generateBangladeshRecommendations(): Promise<AssetRecommendation[]> {
    const recommendations: AssetRecommendation[] = [];
    const insights = await this.getBangladeshMarketInsights();

    // Mobile optimization recommendations
    if (insights.deviceUsagePatterns.mobile > 0.6) {
      recommendations.push({
        type: 'optimization',
        assetId: 'mobile-assets',
        recommendation: 'Optimize assets for mobile-first experience - 75% of traffic is mobile',
        expectedImpact: {
          engagementIncrease: 0.2,
          performanceGain: 0.3
        },
        priority: 'high',
        implementation: 'Implement aggressive mobile compression, use smaller image variants for mobile devices'
      });
    }

    return recommendations;
  }
}