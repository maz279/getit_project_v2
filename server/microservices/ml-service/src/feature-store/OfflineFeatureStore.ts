/**
 * Offline Feature Store - Batch Feature Processing
 * Large-scale feature computation and historical analysis
 */

import { logger } from '../utils/logger';

interface FeatureRequest {
  entityId: string;
  entityType: 'user' | 'product' | 'order' | 'vendor';
  featureNames: string[];
  timestamp?: Date;
}

interface FeatureValue {
  featureName: string;
  value: any;
  timestamp: Date;
  entityId: string;
  entityType: string;
}

interface BatchJob {
  id: string;
  entityType: string;
  featureNames: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  results?: any[];
}

interface HistoricalData {
  entityId: string;
  entityType: string;
  features: { [key: string]: any };
  timestamp: Date;
}

export class OfflineFeatureStore {
  private historicalData: Map<string, HistoricalData[]>;
  private batchJobs: Map<string, BatchJob>;
  private aggregatedFeatures: Map<string, any>;
  private processingQueue: string[];

  constructor() {
    this.historicalData = new Map();
    this.batchJobs = new Map();
    this.aggregatedFeatures = new Map();
    this.processingQueue = [];
    
    // Initialize with some historical data
    this.initializeHistoricalData();
    
    // Start batch processing worker
    this.startBatchProcessor();
    
    logger.info('📊 Offline Feature Store initialized');
  }

  /**
   * Get features from offline store
   */
  async getFeatures(request: FeatureRequest): Promise<{ [key: string]: any }> {
    try {
      logger.debug('📊 Getting offline features', {
        entityId: request.entityId,
        entityType: request.entityType,
        featureCount: request.featureNames.length
      });

      const features = await this.computeHistoricalFeatures(request);
      
      logger.debug('✅ Offline features retrieved', {
        entityId: request.entityId,
        featureCount: Object.keys(features).length
      });

      return features;
      
    } catch (error) {
      logger.error('❌ Error getting offline features', { error });
      throw error;
    }
  }

  /**
   * Store features in offline store
   */
  async storeFeatures(values: FeatureValue[]): Promise<void> {
    try {
      logger.debug('💾 Storing features in offline store', {
        featureCount: values.length
      });

      const groupedData = this.groupFeaturesByEntity(values);
      
      for (const [entityKey, features] of groupedData) {
        const [entityType, entityId] = entityKey.split(':');
        
        const historicalEntry: HistoricalData = {
          entityId: entityId,
          entityType: entityType,
          features: features,
          timestamp: new Date()
        };

        if (!this.historicalData.has(entityKey)) {
          this.historicalData.set(entityKey, []);
        }
        
        this.historicalData.get(entityKey)!.push(historicalEntry);
        
        // Keep only last 1000 entries per entity
        const entries = this.historicalData.get(entityKey)!;
        if (entries.length > 1000) {
          entries.splice(0, entries.length - 1000);
        }
      }
      
      logger.debug('✅ Features stored in offline store', {
        featureCount: values.length,
        entityCount: groupedData.size
      });
      
    } catch (error) {
      logger.error('❌ Error storing features in offline store', { error });
      throw error;
    }
  }

  /**
   * Create batch processing job
   */
  async createBatchJob(entityType: string, featureNames: string[]): Promise<string> {
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: BatchJob = {
      id: jobId,
      entityType: entityType,
      featureNames: featureNames,
      status: 'pending',
      progress: 0,
      startTime: new Date()
    };
    
    this.batchJobs.set(jobId, job);
    this.processingQueue.push(jobId);
    
    logger.info('📋 Batch job created', {
      jobId: jobId,
      entityType: entityType,
      featureCount: featureNames.length
    });
    
    return jobId;
  }

  /**
   * Get batch job status
   */
  getBatchJobStatus(jobId: string): BatchJob | null {
    return this.batchJobs.get(jobId) || null;
  }

  /**
   * Get historical features for an entity
   */
  async getHistoricalFeatures(entityId: string, entityType: string, 
                              featureNames: string[], 
                              startDate: Date, 
                              endDate: Date): Promise<HistoricalData[]> {
    const entityKey = `${entityType}:${entityId}`;
    const history = this.historicalData.get(entityKey) || [];
    
    return history.filter(entry => 
      entry.timestamp >= startDate && 
      entry.timestamp <= endDate &&
      featureNames.some(name => entry.features[name] !== undefined)
    );
  }

  /**
   * Get feature statistics
   */
  async getFeatureStatistics(entityType: string, 
                            featureName: string, 
                            timeRange: { start: Date; end: Date }): Promise<any> {
    const stats = {
      count: 0,
      min: Infinity,
      max: -Infinity,
      avg: 0,
      sum: 0,
      std: 0,
      percentiles: {
        p25: 0,
        p50: 0,
        p75: 0,
        p95: 0,
        p99: 0
      }
    };
    
    const values: number[] = [];
    
    // Collect all values for the feature
    for (const [entityKey, history] of this.historicalData) {
      if (!entityKey.startsWith(entityType)) continue;
      
      for (const entry of history) {
        if (entry.timestamp >= timeRange.start && 
            entry.timestamp <= timeRange.end &&
            entry.features[featureName] !== undefined) {
          
          const value = entry.features[featureName];
          if (typeof value === 'number') {
            values.push(value);
            stats.count++;
            stats.sum += value;
            stats.min = Math.min(stats.min, value);
            stats.max = Math.max(stats.max, value);
          }
        }
      }
    }
    
    if (values.length === 0) return stats;
    
    // Calculate average
    stats.avg = stats.sum / values.length;
    
    // Calculate standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - stats.avg, 2), 0) / values.length;
    stats.std = Math.sqrt(variance);
    
    // Calculate percentiles
    const sorted = values.sort((a, b) => a - b);
    stats.percentiles.p25 = this.percentile(sorted, 0.25);
    stats.percentiles.p50 = this.percentile(sorted, 0.50);
    stats.percentiles.p75 = this.percentile(sorted, 0.75);
    stats.percentiles.p95 = this.percentile(sorted, 0.95);
    stats.percentiles.p99 = this.percentile(sorted, 0.99);
    
    return stats;
  }

  /**
   * Compute aggregated features
   */
  async computeAggregatedFeatures(entityType: string, 
                                 aggregationType: 'hourly' | 'daily' | 'weekly' | 'monthly',
                                 timeRange: { start: Date; end: Date }): Promise<any[]> {
    const aggregations: any[] = [];
    const buckets = new Map<string, any[]>();
    
    // Group data by time buckets
    for (const [entityKey, history] of this.historicalData) {
      if (!entityKey.startsWith(entityType)) continue;
      
      for (const entry of history) {
        if (entry.timestamp >= timeRange.start && entry.timestamp <= timeRange.end) {
          const bucketKey = this.getBucketKey(entry.timestamp, aggregationType);
          if (!buckets.has(bucketKey)) {
            buckets.set(bucketKey, []);
          }
          buckets.get(bucketKey)!.push(entry);
        }
      }
    }
    
    // Compute aggregations for each bucket
    for (const [bucketKey, entries] of buckets) {
      const aggregation = {
        bucket: bucketKey,
        timestamp: new Date(bucketKey),
        count: entries.length,
        features: {}
      };
      
      // Aggregate each feature
      const featureValues = new Map<string, number[]>();
      
      for (const entry of entries) {
        for (const [featureName, value] of Object.entries(entry.features)) {
          if (typeof value === 'number') {
            if (!featureValues.has(featureName)) {
              featureValues.set(featureName, []);
            }
            featureValues.get(featureName)!.push(value);
          }
        }
      }
      
      for (const [featureName, values] of featureValues) {
        aggregation.features[featureName] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
      
      aggregations.push(aggregation);
    }
    
    return aggregations.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Compute historical features for request
   */
  private async computeHistoricalFeatures(request: FeatureRequest): Promise<{ [key: string]: any }> {
    const entityKey = `${request.entityType}:${request.entityId}`;
    const history = this.historicalData.get(entityKey) || [];
    
    if (history.length === 0) {
      // Return default features if no history
      return this.getDefaultFeatures(request);
    }
    
    // Get latest features
    const latestEntry = history[history.length - 1];
    const features: { [key: string]: any } = {};
    
    for (const featureName of request.featureNames) {
      features[featureName] = latestEntry.features[featureName] || null;
    }
    
    return features;
  }

  /**
   * Get default features when no history exists
   */
  private getDefaultFeatures(request: FeatureRequest): { [key: string]: any } {
    const features: { [key: string]: any } = {};
    
    for (const featureName of request.featureNames) {
      // Return appropriate default values
      if (featureName.includes('_count') || featureName.includes('_total')) {
        features[featureName] = 0;
      } else if (featureName.includes('_rate') || featureName.includes('_score')) {
        features[featureName] = 0.0;
      } else if (featureName.includes('_days') || featureName.includes('_age')) {
        features[featureName] = 0;
      } else if (featureName.includes('_avg') || featureName.includes('_mean')) {
        features[featureName] = 0.0;
      } else if (featureName.includes('_preference')) {
        features[featureName] = false;
      } else {
        features[featureName] = null;
      }
    }
    
    return features;
  }

  /**
   * Group features by entity
   */
  private groupFeaturesByEntity(values: FeatureValue[]): Map<string, { [key: string]: any }> {
    const grouped = new Map<string, { [key: string]: any }>();
    
    for (const value of values) {
      const entityKey = `${value.entityType}:${value.entityId}`;
      if (!grouped.has(entityKey)) {
        grouped.set(entityKey, {});
      }
      grouped.get(entityKey)![value.featureName] = value.value;
    }
    
    return grouped;
  }

  /**
   * Initialize historical data
   */
  private initializeHistoricalData(): void {
    // Initialize with some sample historical data
    const sampleData = [
      {
        entityId: 'user_1',
        entityType: 'user',
        features: {
          user_age: 25,
          user_total_orders: 10,
          user_avg_order_value: 1500,
          user_region_bangladesh: 'Dhaka'
        },
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        entityId: 'product_1',
        entityType: 'product',
        features: {
          product_price: 2000,
          product_rating: 4.5,
          product_sales_count: 150,
          product_local_brand: false
        },
        timestamp: new Date(Date.now() - 86400000)
      }
    ];
    
    for (const data of sampleData) {
      const entityKey = `${data.entityType}:${data.entityId}`;
      this.historicalData.set(entityKey, [data]);
    }
  }

  /**
   * Start batch processor
   */
  private startBatchProcessor(): void {
    setInterval(() => {
      this.processBatchJobs();
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process batch jobs
   */
  private async processBatchJobs(): Promise<void> {
    if (this.processingQueue.length === 0) return;
    
    const jobId = this.processingQueue.shift()!;
    const job = this.batchJobs.get(jobId);
    
    if (!job) return;
    
    try {
      job.status = 'running';
      logger.info('🔄 Processing batch job', { jobId: jobId });
      
      // Simulate batch processing
      for (let i = 0; i <= 100; i += 10) {
        job.progress = i;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      job.status = 'completed';
      job.endTime = new Date();
      job.results = [`Processed ${job.featureNames.length} features for ${job.entityType}`];
      
      logger.info('✅ Batch job completed', { jobId: jobId });
      
    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date();
      logger.error('❌ Batch job failed', { jobId: jobId, error });
    }
  }

  /**
   * Get bucket key for time aggregation
   */
  private getBucketKey(timestamp: Date, aggregationType: string): string {
    const year = timestamp.getFullYear();
    const month = timestamp.getMonth();
    const day = timestamp.getDate();
    const hour = timestamp.getHours();
    
    switch (aggregationType) {
      case 'hourly':
        return `${year}-${month}-${day}-${hour}`;
      case 'daily':
        return `${year}-${month}-${day}`;
      case 'weekly':
        const weekStart = new Date(timestamp);
        weekStart.setDate(timestamp.getDate() - timestamp.getDay());
        return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
      case 'monthly':
        return `${year}-${month}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * Get store statistics
   */
  getStoreStatistics(): any {
    const totalEntities = this.historicalData.size;
    let totalEntries = 0;
    let oldestEntry = new Date();
    let newestEntry = new Date(0);
    
    for (const [entityKey, history] of this.historicalData) {
      totalEntries += history.length;
      
      if (history.length > 0) {
        const firstEntry = history[0];
        const lastEntry = history[history.length - 1];
        
        if (firstEntry.timestamp < oldestEntry) {
          oldestEntry = firstEntry.timestamp;
        }
        
        if (lastEntry.timestamp > newestEntry) {
          newestEntry = lastEntry.timestamp;
        }
      }
    }
    
    return {
      totalEntities,
      totalEntries,
      avgEntriesPerEntity: totalEntries / totalEntities,
      oldestEntry,
      newestEntry,
      activeBatchJobs: Array.from(this.batchJobs.values()).filter(job => 
        job.status === 'running' || job.status === 'pending'
      ).length,
      queueSize: this.processingQueue.length
    };
  }
}