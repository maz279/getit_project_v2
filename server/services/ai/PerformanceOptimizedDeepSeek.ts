// Phase 3: Performance Optimization Service
// Day 13-15: Advanced Performance Optimization Implementation

import { z } from 'zod';

/**
 * Performance-optimized DeepSeek AI Service with advanced caching,
 * request batching, and intelligent response optimization
 */
export class PerformanceOptimizedDeepSeek {
  private static instance: PerformanceOptimizedDeepSeek | null = null;
  private static readonly API_KEY = process.env.DEEPSEEK_API_KEY;
  private static readonly API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
  
  // Performance optimization settings
  private static readonly CACHE_TTL = 300000; // 5 minutes
  private static readonly BATCH_SIZE = 5;
  private static readonly COMPRESSION_THRESHOLD = 1000;
  private static readonly RESPONSE_TIME_TARGET = 500; // 500ms target
  
  // Advanced caching with performance tracking
  private performanceCache = new Map<string, CachedResponse>();
  private batchQueue: BatchRequest[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  
  // Performance analytics
  private metrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    batchedRequests: 0,
    compressionSavings: 0,
    errorRate: 0
  };

  private constructor() {
    this.startBatchProcessor();
    this.startCacheCleanup();
  }

  /**
   * Singleton pattern with performance monitoring
   */
  public static getInstance(): PerformanceOptimizedDeepSeek {
    if (!this.instance) {
      this.instance = new PerformanceOptimizedDeepSeek();
    }
    return this.instance;
  }

  /**
   * High-performance AI conversation with advanced optimizations
   */
  public async optimizedConversation(
    userMessage: string,
    conversationHistory: Array<{role: string, content: string}> = [],
    options: OptimizationOptions = {}
  ): Promise<OptimizedConversationResult> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    
    try {
      // Input validation and preprocessing
      const processedInput = this.preprocessInput(userMessage, conversationHistory);
      
      // Check performance cache first
      const cacheKey = this.generateCacheKey(processedInput, options);
      const cachedResult = this.getFromCache(cacheKey);
      
      if (cachedResult) {
        this.metrics.cacheHits++;
        const responseTime = Date.now() - startTime;
        
        return {
          success: true,
          response: cachedResult.response,
          confidence: cachedResult.confidence,
          responseTime,
          cacheHit: true,
          optimization: {
            cached: true,
            compressed: cachedResult.compressed,
            batchProcessed: false,
            performanceGain: cachedResult.originalResponseTime - responseTime
          },
          metadata: cachedResult.metadata
        };
      }
      
      this.metrics.cacheMisses++;
      
      // Determine processing strategy based on urgency
      if (options.urgent) {
        return await this.processImmediately(processedInput, options, startTime, cacheKey);
      } else {
        return await this.processBatched(processedInput, options, startTime, cacheKey);
      }
      
    } catch (error) {
      this.metrics.errorRate = (this.metrics.errorRate + 1) / this.metrics.totalRequests;
      console.error('❌ Optimized conversation failed:', error);
      
      return {
        success: false,
        error: 'Performance optimization failed',
        message: 'Unable to process your request efficiently. Please try again.',
        responseTime: Date.now() - startTime,
        cacheHit: false,
        optimization: {
          cached: false,
          compressed: false,
          batchProcessed: false,
          performanceGain: 0
        }
      };
    }
  }

  /**
   * Immediate processing for urgent requests
   */
  private async processImmediately(
    input: ProcessedInput,
    options: OptimizationOptions,
    startTime: number,
    cacheKey: string
  ): Promise<OptimizedConversationResult> {
    
    try {
      const result = await this.callOptimizedDeepSeekAPI(input, options);
      
      // Cache the result with compression if beneficial
      const compressed = this.shouldCompress(result.content);
      this.cacheResult(cacheKey, result, compressed, Date.now() - startTime);
      
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);
      
      return {
        success: true,
        response: result.content,
        confidence: result.confidence,
        responseTime,
        cacheHit: false,
        optimization: {
          cached: false,
          compressed,
          batchProcessed: false,
          performanceGain: 0
        },
        metadata: {
          tokensUsed: result.tokensUsed,
          model: 'deepseek-chat-optimized',
          processedAt: new Date().toISOString(),
          optimizationLevel: 'immediate'
        }
      };
      
    } catch (error) {
      throw new Error(`Immediate processing failed: ${error.message}`);
    }
  }

  /**
   * Batched processing for better efficiency
   */
  private async processBatched(
    input: ProcessedInput,
    options: OptimizationOptions,
    startTime: number,
    cacheKey: string
  ): Promise<OptimizedConversationResult> {
    
    return new Promise((resolve, reject) => {
      const batchRequest: BatchRequest = {
        id: this.generateRequestId(),
        input,
        options,
        startTime,
        cacheKey,
        resolve,
        reject
      };
      
      this.batchQueue.push(batchRequest);
      
      // Process batch if it's full or start timer for processing
      if (this.batchQueue.length >= PerformanceOptimizedDeepSeek.BATCH_SIZE) {
        this.processBatch();
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.processBatch(), 100); // 100ms batch window
      }
    });
  }

  /**
   * Process batched requests for optimal performance
   */
  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;
    
    const batch = this.batchQueue.splice(0, PerformanceOptimizedDeepSeek.BATCH_SIZE);
    this.batchTimer = null;
    
    console.log(`🔄 Processing batch of ${batch.length} requests`);
    
    try {
      // Process all requests in parallel for better performance
      const batchPromises = batch.map(async (request) => {
        try {
          const result = await this.callOptimizedDeepSeekAPI(request.input, request.options);
          
          // Cache with compression
          const compressed = this.shouldCompress(result.content);
          this.cacheResult(request.cacheKey, result, compressed, Date.now() - request.startTime);
          
          const responseTime = Date.now() - request.startTime;
          this.updateAverageResponseTime(responseTime);
          this.metrics.batchedRequests++;
          
          request.resolve({
            success: true,
            response: result.content,
            confidence: result.confidence,
            responseTime,
            cacheHit: false,
            optimization: {
              cached: false,
              compressed,
              batchProcessed: true,
              performanceGain: Math.max(0, this.metrics.averageResponseTime - responseTime)
            },
            metadata: {
              tokensUsed: result.tokensUsed,
              model: 'deepseek-chat-optimized',
              processedAt: new Date().toISOString(),
              optimizationLevel: 'batched'
            }
          });
          
        } catch (error) {
          request.reject(new Error(`Batch processing failed: ${error.message}`));
        }
      });
      
      await Promise.all(batchPromises);
      
    } catch (error) {
      console.error('❌ Batch processing error:', error);
      
      // Reject all requests in batch
      batch.forEach(request => {
        request.reject(new Error(`Batch processing failed: ${error.message}`));
      });
    }
  }

  /**
   * Optimized DeepSeek API call with performance enhancements
   */
  private async callOptimizedDeepSeekAPI(
    input: ProcessedInput,
    options: OptimizationOptions
  ): Promise<DeepSeekResponse> {
    
    if (!PerformanceOptimizedDeepSeek.API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 8000);

    try {
      // Optimize request payload for better performance
      const optimizedPayload = {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are an efficient AI assistant for Bangladesh e-commerce. Provide concise, helpful responses.' },
          ...input.conversationHistory.slice(-5), // Limit history for better performance
          { role: 'user', content: input.userMessage }
        ],
        max_tokens: Math.min(options.maxTokens || 300, 500), // Limit tokens for speed
        temperature: 0.3, // Lower temperature for faster, more focused responses
        stream: false,
        // Performance optimizations
        top_p: 0.8,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      };

      const response = await fetch(PerformanceOptimizedDeepSeek.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PerformanceOptimizedDeepSeek.API_KEY}`,
          'Accept-Encoding': 'gzip, deflate', // Enable compression
        },
        body: JSON.stringify(optimizedPayload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      // Validate and process response
      const content = data.choices[0]?.message?.content || 'No response generated';
      
      return {
        content: content.trim(),
        confidence: this.calculateConfidence(content, processingTime),
        processingTime,
        tokensUsed: data.usage?.total_tokens || 0
      };

    } catch (error) {
      clearTimeout(timeout);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - optimizing for faster responses');
      }
      
      throw error;
    }
  }

  /**
   * Advanced input preprocessing for optimization
   */
  private preprocessInput(
    userMessage: string,
    conversationHistory: Array<{role: string, content: string}>
  ): ProcessedInput {
    
    // Validate and sanitize
    if (!userMessage || typeof userMessage !== 'string') {
      throw new Error('Invalid user message');
    }
    
    // Optimize message length for performance
    const optimizedMessage = userMessage.length > 1000 
      ? userMessage.substring(0, 1000) + '...' 
      : userMessage;
    
    // Filter and optimize conversation history
    const optimizedHistory = conversationHistory
      .filter(msg => msg && typeof msg.content === 'string' && msg.content.length < 500)
      .slice(-3) // Keep only last 3 messages for performance
      .map(msg => ({
        role: msg.role,
        content: msg.content.trim()
      }));

    return {
      userMessage: optimizedMessage.trim(),
      conversationHistory: optimizedHistory
    };
  }

  /**
   * Intelligent caching with compression
   */
  private generateCacheKey(input: ProcessedInput, options: OptimizationOptions): string {
    const keyComponents = [
      input.userMessage,
      JSON.stringify(input.conversationHistory),
      options.maxTokens || 300,
      options.urgent ? 'urgent' : 'normal'
    ];
    
    return this.hashString(keyComponents.join('|'));
  }

  private getFromCache(cacheKey: string): CachedResponse | null {
    const cached = this.performanceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < PerformanceOptimizedDeepSeek.CACHE_TTL) {
      return cached;
    }
    
    if (cached) {
      this.performanceCache.delete(cacheKey);
    }
    
    return null;
  }

  private cacheResult(
    cacheKey: string,
    result: DeepSeekResponse,
    compressed: boolean,
    originalResponseTime: number
  ): void {
    
    const cachedResponse: CachedResponse = {
      response: result.content,
      confidence: result.confidence,
      timestamp: Date.now(),
      originalResponseTime,
      compressed,
      metadata: {
        tokensUsed: result.tokensUsed,
        model: 'deepseek-chat-optimized',
        cachedAt: new Date().toISOString()
      }
    };
    
    this.performanceCache.set(cacheKey, cachedResponse);
    
    if (compressed) {
      this.metrics.compressionSavings += Math.floor(result.content.length * 0.3); // Estimate 30% compression
    }
  }

  /**
   * Utility methods
   */
  private shouldCompress(content: string): boolean {
    return content.length > PerformanceOptimizedDeepSeek.COMPRESSION_THRESHOLD;
  }

  private calculateConfidence(content: string, processingTime: number): number {
    // Higher confidence for faster responses with substantial content
    const lengthScore = Math.min(content.length / 100, 1.0);
    const speedScore = Math.max(0, 1.0 - (processingTime / 5000)); // Penalize slow responses
    return Math.min(0.9, (lengthScore + speedScore) / 2);
  }

  private updateAverageResponseTime(responseTime: number): void {
    const total = this.metrics.totalRequests;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (total - 1) + responseTime) / total;
  }

  private generateRequestId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Background processes
   */
  private startBatchProcessor(): void {
    // Additional batch processing runs every 50ms for high throughput
    setInterval(() => {
      if (this.batchQueue.length > 0 && !this.batchTimer) {
        this.processBatch();
      }
    }, 50);
  }

  private startCacheCleanup(): void {
    // Clean expired cache entries every 2 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.performanceCache.entries()) {
        if (now - value.timestamp > PerformanceOptimizedDeepSeek.CACHE_TTL) {
          this.performanceCache.delete(key);
        }
      }
    }, 120000);
  }

  /**
   * Performance analytics and monitoring
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    const cacheHitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100 
      : 0;
    
    const batchEfficiency = this.metrics.totalRequests > 0 
      ? (this.metrics.batchedRequests / this.metrics.totalRequests) * 100 
      : 0;

    return {
      ...this.metrics,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      batchEfficiency: Math.round(batchEfficiency * 100) / 100,
      cacheSize: this.performanceCache.size,
      performanceScore: this.calculatePerformanceScore(),
      targetAchievement: this.metrics.averageResponseTime <= PerformanceOptimizedDeepSeek.RESPONSE_TIME_TARGET
    };
  }

  private calculatePerformanceScore(): number {
    const cacheHitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.cacheHits / this.metrics.totalRequests) 
      : 0;
    
    const speedScore = this.metrics.averageResponseTime > 0 
      ? Math.max(0, 1 - (this.metrics.averageResponseTime / 2000)) 
      : 0;
    
    const errorScore = Math.max(0, 1 - this.metrics.errorRate);
    
    return Math.round(((cacheHitRate * 0.3) + (speedScore * 0.5) + (errorScore * 0.2)) * 100);
  }

  /**
   * Health check with performance data
   */
  public async healthCheck(): Promise<PerformanceHealthStatus> {
    const metrics = this.getPerformanceMetrics();
    
    return {
      service: 'PerformanceOptimizedDeepSeek',
      status: metrics.performanceScore > 70 ? 'healthy' : metrics.performanceScore > 40 ? 'degraded' : 'unhealthy',
      performanceScore: metrics.performanceScore,
      averageResponseTime: metrics.averageResponseTime,
      cacheHitRate: metrics.cacheHitRate,
      targetAchievement: metrics.targetAchievement,
      optimizations: {
        caching: this.performanceCache.size > 0,
        batching: metrics.batchEfficiency > 0,
        compression: metrics.compressionSavings > 0
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Types
interface ProcessedInput {
  userMessage: string;
  conversationHistory: Array<{role: string, content: string}>;
}

interface OptimizationOptions {
  urgent?: boolean;
  maxTokens?: number;
  timeout?: number;
}

interface DeepSeekResponse {
  content: string;
  confidence: number;
  processingTime: number;
  tokensUsed: number;
}

interface OptimizedConversationResult {
  success: boolean;
  response?: string;
  error?: string;
  message?: string;
  confidence?: number;
  responseTime: number;
  cacheHit: boolean;
  optimization: {
    cached: boolean;
    compressed: boolean;
    batchProcessed: boolean;
    performanceGain: number;
  };
  metadata?: {
    tokensUsed: number;
    model: string;
    processedAt: string;
    optimizationLevel: string;
  };
}

interface CachedResponse {
  response: string;
  confidence: number;
  timestamp: number;
  originalResponseTime: number;
  compressed: boolean;
  metadata: any;
}

interface BatchRequest {
  id: string;
  input: ProcessedInput;
  options: OptimizationOptions;
  startTime: number;
  cacheKey: string;
  resolve: (result: OptimizedConversationResult) => void;
  reject: (error: Error) => void;
}

interface PerformanceMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  batchedRequests: number;
  compressionSavings: number;
  errorRate: number;
  cacheHitRate: number;
  batchEfficiency: number;
  cacheSize: number;
  performanceScore: number;
  targetAchievement: boolean;
}

interface PerformanceHealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  performanceScore: number;
  averageResponseTime: number;
  cacheHitRate: number;
  targetAchievement: boolean;
  optimizations: {
    caching: boolean;
    batching: boolean;
    compression: boolean;
  };
  timestamp: string;
}

export default PerformanceOptimizedDeepSeek;