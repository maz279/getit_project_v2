/**
 * Feature Pipeline - Automated Feature Engineering
 * Real-time and batch feature processing pipeline
 */

import { logger } from '../utils/logger';

interface PipelineStage {
  name: string;
  type: 'extraction' | 'transformation' | 'validation' | 'storage';
  enabled: boolean;
  config: any;
  dependencies: string[];
}

interface PipelineJob {
  id: string;
  name: string;
  stages: PipelineStage[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  results?: any;
  error?: string;
}

interface FeatureComputationRequest {
  entityType: string;
  entityIds: string[];
  featureNames: string[];
  computationType: 'realtime' | 'batch';
  priority: 'high' | 'medium' | 'low';
}

interface TransformationRule {
  name: string;
  sourceFeature: string;
  targetFeature: string;
  transformation: string;
  config: any;
}

export class FeaturePipeline {
  private pipelines: Map<string, PipelineJob>;
  private processingQueue: string[];
  private transformationRules: Map<string, TransformationRule>;
  private isRunning: boolean;
  private activeJobs: Set<string>;
  private stats: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    avgProcessingTime: number;
  };

  constructor() {
    this.pipelines = new Map();
    this.processingQueue = [];
    this.transformationRules = new Map();
    this.isRunning = false;
    this.activeJobs = new Set();
    this.stats = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      avgProcessingTime: 0
    };
    
    this.initializeTransformationRules();
    
    logger.info('⚙️ Feature Pipeline initialized');
  }

  /**
   * Start the feature pipeline
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('⚠️ Feature Pipeline already running');
      return;
    }

    this.isRunning = true;
    
    // Start processing worker
    this.startProcessingWorker();
    
    // Start monitoring
    this.startMonitoring();
    
    logger.info('🚀 Feature Pipeline started');
  }

  /**
   * Stop the feature pipeline
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Wait for active jobs to complete
    while (this.activeJobs.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    logger.info('🛑 Feature Pipeline stopped');
  }

  /**
   * Submit feature computation job
   */
  async submitJob(request: FeatureComputationRequest): Promise<string> {
    const jobId = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: PipelineJob = {
      id: jobId,
      name: `${request.entityType}_${request.computationType}`,
      stages: this.buildPipelineStages(request),
      status: 'pending',
      progress: 0,
      startTime: new Date()
    };
    
    this.pipelines.set(jobId, job);
    
    // Add to queue based on priority
    if (request.priority === 'high') {
      this.processingQueue.unshift(jobId);
    } else {
      this.processingQueue.push(jobId);
    }
    
    this.stats.totalJobs++;
    
    logger.info('📋 Pipeline job submitted', {
      jobId: jobId,
      entityType: request.entityType,
      entityCount: request.entityIds.length,
      featureCount: request.featureNames.length,
      priority: request.priority
    });
    
    return jobId;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): PipelineJob | null {
    return this.pipelines.get(jobId) || null;
  }

  /**
   * Get all jobs
   */
  getAllJobs(): PipelineJob[] {
    return Array.from(this.pipelines.values());
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.pipelines.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status === 'running') {
      job.status = 'failed';
      job.error = 'Job cancelled by user';
      job.endTime = new Date();
      this.activeJobs.delete(jobId);
    } else if (job.status === 'pending') {
      job.status = 'failed';
      job.error = 'Job cancelled by user';
      job.endTime = new Date();
      
      // Remove from queue
      const index = this.processingQueue.indexOf(jobId);
      if (index > -1) {
        this.processingQueue.splice(index, 1);
      }
    }
    
    logger.info('❌ Pipeline job cancelled', { jobId: jobId });
  }

  /**
   * Add transformation rule
   */
  addTransformationRule(rule: TransformationRule): void {
    this.transformationRules.set(rule.name, rule);
    logger.debug('✅ Transformation rule added', { ruleName: rule.name });
  }

  /**
   * Get transformation rules
   */
  getTransformationRules(): TransformationRule[] {
    return Array.from(this.transformationRules.values());
  }

  /**
   * Get pipeline statistics
   */
  getStatistics(): any {
    return {
      ...this.stats,
      queueSize: this.processingQueue.length,
      activeJobs: this.activeJobs.size,
      isRunning: this.isRunning,
      successRate: this.stats.totalJobs > 0 ? 
        (this.stats.completedJobs / this.stats.totalJobs) * 100 : 0
    };
  }

  /**
   * Initialize transformation rules
   */
  private initializeTransformationRules(): void {
    const rules: TransformationRule[] = [
      {
        name: 'normalize_numerical',
        sourceFeature: '*_numerical',
        targetFeature: '*_normalized',
        transformation: 'normalize',
        config: { method: 'min_max', range: [0, 1] }
      },
      {
        name: 'encode_categorical',
        sourceFeature: '*_categorical',
        targetFeature: '*_encoded',
        transformation: 'encode',
        config: { method: 'one_hot' }
      },
      {
        name: 'extract_text_features',
        sourceFeature: '*_text',
        targetFeature: '*_text_features',
        transformation: 'text_features',
        config: { method: 'tfidf', max_features: 1000 }
      },
      {
        name: 'aggregate_time_series',
        sourceFeature: '*_time_series',
        targetFeature: '*_aggregated',
        transformation: 'aggregate',
        config: { method: 'rolling_window', window: 7 }
      },
      {
        name: 'calculate_ratios',
        sourceFeature: '*_count',
        targetFeature: '*_rate',
        transformation: 'ratio',
        config: { denominator: 'total_count' }
      },
      {
        name: 'detect_anomalies',
        sourceFeature: '*_numerical',
        targetFeature: '*_anomaly_score',
        transformation: 'anomaly_detection',
        config: { method: 'isolation_forest', threshold: 0.1 }
      },
      {
        name: 'extract_date_features',
        sourceFeature: '*_date',
        targetFeature: '*_date_features',
        transformation: 'date_features',
        config: { features: ['hour', 'day_of_week', 'month', 'is_weekend'] }
      },
      {
        name: 'bangladesh_cultural_context',
        sourceFeature: '*_timestamp',
        targetFeature: '*_cultural_context',
        transformation: 'cultural_context',
        config: { country: 'bangladesh', include_festivals: true, include_prayer_times: true }
      }
    ];

    for (const rule of rules) {
      this.transformationRules.set(rule.name, rule);
    }
  }

  /**
   * Build pipeline stages for request
   */
  private buildPipelineStages(request: FeatureComputationRequest): PipelineStage[] {
    const stages: PipelineStage[] = [];

    // Data extraction stage
    stages.push({
      name: 'data_extraction',
      type: 'extraction',
      enabled: true,
      config: {
        entityType: request.entityType,
        entityIds: request.entityIds,
        sources: ['database', 'cache', 'external_apis']
      },
      dependencies: []
    });

    // Feature transformation stage
    stages.push({
      name: 'feature_transformation',
      type: 'transformation',
      enabled: true,
      config: {
        featureNames: request.featureNames,
        transformationRules: Array.from(this.transformationRules.keys()),
        bangladeshOptimization: true
      },
      dependencies: ['data_extraction']
    });

    // Feature validation stage
    stages.push({
      name: 'feature_validation',
      type: 'validation',
      enabled: true,
      config: {
        validationRules: ['range_check', 'null_check', 'type_check'],
        qualityThreshold: 0.95
      },
      dependencies: ['feature_transformation']
    });

    // Feature storage stage
    stages.push({
      name: 'feature_storage',
      type: 'storage',
      enabled: true,
      config: {
        storageType: request.computationType === 'realtime' ? 'online' : 'offline',
        cacheExpiry: request.computationType === 'realtime' ? 300 : 3600
      },
      dependencies: ['feature_validation']
    });

    return stages;
  }

  /**
   * Start processing worker
   */
  private startProcessingWorker(): void {
    setInterval(async () => {
      if (!this.isRunning || this.processingQueue.length === 0) return;

      const jobId = this.processingQueue.shift()!;
      const job = this.pipelines.get(jobId);
      
      if (!job) return;

      try {
        await this.processJob(job);
      } catch (error) {
        logger.error('❌ Error processing pipeline job', { jobId, error });
      }
    }, 1000);
  }

  /**
   * Process a single job
   */
  private async processJob(job: PipelineJob): Promise<void> {
    this.activeJobs.add(job.id);
    job.status = 'running';
    
    logger.info('🔄 Processing pipeline job', { jobId: job.id });
    
    try {
      const results = [];
      const totalStages = job.stages.length;
      
      for (let i = 0; i < job.stages.length; i++) {
        const stage = job.stages[i];
        
        logger.debug('⚙️ Processing stage', { 
          jobId: job.id, 
          stage: stage.name,
          progress: `${i + 1}/${totalStages}`
        });
        
        const stageResult = await this.processStage(stage);
        results.push(stageResult);
        
        // Update progress
        job.progress = Math.round(((i + 1) / totalStages) * 100);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      job.status = 'completed';
      job.results = results;
      job.endTime = new Date();
      
      this.stats.completedJobs++;
      this.updateAverageProcessingTime(job);
      
      logger.info('✅ Pipeline job completed', { 
        jobId: job.id,
        duration: job.endTime.getTime() - job.startTime.getTime()
      });
      
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.endTime = new Date();
      
      this.stats.failedJobs++;
      
      logger.error('❌ Pipeline job failed', { 
        jobId: job.id, 
        error: error.message 
      });
    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  /**
   * Process a single stage
   */
  private async processStage(stage: PipelineStage): Promise<any> {
    switch (stage.type) {
      case 'extraction':
        return this.processExtractionStage(stage);
      case 'transformation':
        return this.processTransformationStage(stage);
      case 'validation':
        return this.processValidationStage(stage);
      case 'storage':
        return this.processStorageStage(stage);
      default:
        throw new Error(`Unknown stage type: ${stage.type}`);
    }
  }

  /**
   * Process extraction stage
   */
  private async processExtractionStage(stage: PipelineStage): Promise<any> {
    const config = stage.config;
    
    // Simulate data extraction
    const extractedData = {
      entityType: config.entityType,
      entityCount: config.entityIds.length,
      sources: config.sources,
      extractedFeatures: config.entityIds.length * 10, // Simulate extracted features
      quality: 0.95
    };
    
    return {
      stage: stage.name,
      success: true,
      data: extractedData
    };
  }

  /**
   * Process transformation stage
   */
  private async processTransformationStage(stage: PipelineStage): Promise<any> {
    const config = stage.config;
    
    // Apply transformation rules
    const appliedRules = [];
    for (const ruleName of config.transformationRules) {
      const rule = this.transformationRules.get(ruleName);
      if (rule) {
        appliedRules.push({
          rule: ruleName,
          transformation: rule.transformation,
          success: true
        });
      }
    }
    
    // Simulate Bangladesh optimization
    const bangladeshOptimization = config.bangladeshOptimization ? {
      culturalFeatures: ['festival_context', 'prayer_time_context'],
      paymentFeatures: ['bkash_preference', 'nagad_preference', 'rocket_preference'],
      regionalFeatures: ['dhaka_preference', 'chittagong_preference']
    } : null;
    
    return {
      stage: stage.name,
      success: true,
      appliedRules: appliedRules,
      bangladeshOptimization: bangladeshOptimization,
      transformedFeatures: config.featureNames.length
    };
  }

  /**
   * Process validation stage
   */
  private async processValidationStage(stage: PipelineStage): Promise<any> {
    const config = stage.config;
    
    // Simulate validation
    const validationResults = {
      totalFeatures: 100,
      validFeatures: 95,
      invalidFeatures: 5,
      qualityScore: 0.95,
      passedThreshold: 0.95 >= config.qualityThreshold
    };
    
    return {
      stage: stage.name,
      success: validationResults.passedThreshold,
      validation: validationResults
    };
  }

  /**
   * Process storage stage
   */
  private async processStorageStage(stage: PipelineStage): Promise<any> {
    const config = stage.config;
    
    // Simulate storage
    const storageResults = {
      storageType: config.storageType,
      storedFeatures: 95,
      cacheExpiry: config.cacheExpiry,
      success: true
    };
    
    return {
      stage: stage.name,
      success: true,
      storage: storageResults
    };
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    setInterval(() => {
      if (!this.isRunning) return;
      
      logger.debug('📊 Pipeline monitoring', {
        queueSize: this.processingQueue.length,
        activeJobs: this.activeJobs.size,
        stats: this.stats
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Update average processing time
   */
  private updateAverageProcessingTime(job: PipelineJob): void {
    const processingTime = job.endTime!.getTime() - job.startTime.getTime();
    this.stats.avgProcessingTime = 
      (this.stats.avgProcessingTime + processingTime) / 2;
  }
}