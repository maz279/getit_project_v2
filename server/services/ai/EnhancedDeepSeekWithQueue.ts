// Phase 2: Enhanced DeepSeek AI Service with Intelligent Queue Management
// Day 9: DeepSeek-specific queue-based rate limiting integration

import { z } from 'zod';

/**
 * Enhanced DeepSeek AI Service with intelligent queue-based rate limiting
 * Replaces hard blocking with smart queuing for better user experience
 */
export class EnhancedDeepSeekWithQueue {
  private static instance: EnhancedDeepSeekWithQueue | null = null;
  private static readonly API_KEY = process.env.DEEPSEEK_API_KEY;
  private static readonly API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
  
  // Rate limiting and queue management
  private static readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private static readonly MAX_REQUESTS_PER_MINUTE = 8; // DeepSeek API limit
  private static readonly MAX_QUEUE_SIZE = 20;
  private static readonly QUEUE_TIMEOUT = 300000; // 5 minutes
  
  private requestQueue: QueuedRequest[] = [];
  private requestTimestamps: number[] = [];
  private processing = false;
  
  // Enhanced queue management statistics
  private stats = {
    totalRequests: 0,
    queuedRequests: 0,
    processedRequests: 0,
    failedRequests: 0,
    averageQueueTime: 0,
    rateLimitHits: 0
  };

  private constructor() {
    this.startQueueProcessor();
  }

  /**
   * Singleton pattern with lazy initialization
   */
  public static getInstance(): EnhancedDeepSeekWithQueue {
    if (!this.instance) {
      this.instance = new EnhancedDeepSeekWithQueue();
    }
    return this.instance;
  }

  /**
   * Enhanced AI conversation with intelligent queue management
   */
  public async enhanceConversation(
    userMessage: string,
    conversationHistory: Array<{role: string, content: string}> = [],
    options: {
      priority?: 'high' | 'normal' | 'low',
      maxTokens?: number,
      timeout?: number
    } = {}
  ): Promise<EnhancedConversationResult> {
    this.stats.totalRequests++;
    
    try {
      // Input validation and sanitization
      const validatedInput = this.validateAndSanitizeInput(userMessage, conversationHistory);
      
      // Check if request can be processed immediately
      if (this.canProcessImmediately()) {
        console.log('🚀 Processing DeepSeek request immediately');
        return await this.processDirectly(validatedInput, options);
      }
      
      // Queue the request with intelligent priority handling
      console.log('📋 Queuing DeepSeek request - rate limit reached');
      return await this.queueRequest(validatedInput, options);
      
    } catch (error) {
      this.stats.failedRequests++;
      console.error('❌ Enhanced conversation failed:', error);
      
      return {
        success: false,
        error: 'Conversation processing failed',
        message: 'Unable to process your request at this time. Please try again.',
        queueStatus: 'failed',
        estimatedWaitTime: 0
      };
    }
  }

  /**
   * Check if request can be processed immediately (within rate limits)
   */
  private canProcessImmediately(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - EnhancedDeepSeekWithQueue.RATE_LIMIT_WINDOW;
    
    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);
    
    return this.requestTimestamps.length < EnhancedDeepSeekWithQueue.MAX_REQUESTS_PER_MINUTE;
  }

  /**
   * Process request directly (when within rate limits)
   */
  private async processDirectly(
    input: ValidatedInput,
    options: any
  ): Promise<EnhancedConversationResult> {
    try {
      this.requestTimestamps.push(Date.now());
      
      const result = await this.callDeepSeekAPI(input, options);
      
      this.stats.processedRequests++;
      
      return {
        success: true,
        response: result.content,
        confidence: result.confidence || 0.9,
        processingTime: result.processingTime,
        queueStatus: 'processed_immediately',
        estimatedWaitTime: 0,
        metadata: {
          tokensUsed: result.tokensUsed,
          model: 'deepseek-chat',
          processedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      throw new Error(`Direct processing failed: ${error.message}`);
    }
  }

  /**
   * Queue request for later processing
   */
  private async queueRequest(
    input: ValidatedInput,
    options: any
  ): Promise<EnhancedConversationResult> {
    
    // Check queue capacity
    if (this.requestQueue.length >= EnhancedDeepSeekWithQueue.MAX_QUEUE_SIZE) {
      this.stats.rateLimitHits++;
      
      return {
        success: false,
        error: 'Queue full',
        message: 'Request queue is full. Please try again later.',
        queueStatus: 'queue_full',
        estimatedWaitTime: this.calculateEstimatedWaitTime(),
        queueSize: this.requestQueue.length
      };
    }

    // Create queued request with priority handling
    const queuedRequest: QueuedRequest = {
      id: this.generateRequestId(),
      input,
      options,
      priority: options.priority || 'normal',
      queuedAt: Date.now(),
      resolve: null as any,
      reject: null as any
    };

    // Add to queue with priority ordering
    this.addToQueueWithPriority(queuedRequest);
    this.stats.queuedRequests++;

    // Return promise that resolves when request is processed
    return new Promise((resolve, reject) => {
      queuedRequest.resolve = resolve;
      queuedRequest.reject = reject;
      
      // Set timeout for queued request
      setTimeout(() => {
        this.removeFromQueue(queuedRequest.id);
        reject(new Error('Request timeout in queue'));
      }, EnhancedDeepSeekWithQueue.QUEUE_TIMEOUT);
    });
  }

  /**
   * Add request to queue with intelligent priority ordering
   */
  private addToQueueWithPriority(request: QueuedRequest): void {
    const priorityValues = { high: 3, normal: 2, low: 1 };
    const requestPriority = priorityValues[request.priority];
    
    // Find insertion point based on priority
    let insertIndex = this.requestQueue.length;
    for (let i = 0; i < this.requestQueue.length; i++) {
      const queuePriority = priorityValues[this.requestQueue[i].priority];
      if (requestPriority > queuePriority) {
        insertIndex = i;
        break;
      }
    }
    
    this.requestQueue.splice(insertIndex, 0, request);
    console.log(`📋 Request queued with ${request.priority} priority at position ${insertIndex + 1}`);
  }

  /**
   * Background queue processor - runs continuously
   */
  private startQueueProcessor(): void {
    setInterval(async () => {
      if (!this.processing && this.requestQueue.length > 0 && this.canProcessImmediately()) {
        this.processing = true;
        
        try {
          const request = this.requestQueue.shift()!;
          console.log(`🔄 Processing queued request ${request.id} (waited ${Date.now() - request.queuedAt}ms)`);
          
          const result = await this.processDirectly(request.input, request.options);
          
          // Update queue statistics
          const queueTime = Date.now() - request.queuedAt;
          this.updateQueueStats(queueTime);
          
          // Resolve the queued promise
          if (request.resolve) {
            request.resolve({
              ...result,
              queueStatus: 'processed_from_queue',
              queueTime,
              estimatedWaitTime: 0
            });
          }
          
        } catch (error) {
          console.error('❌ Queue processing error:', error);
          this.stats.failedRequests++;
          
          // Reject the queued promise
          const request = this.requestQueue[0];
          if (request && request.reject) {
            request.reject(error);
          }
        } finally {
          this.processing = false;
        }
      }
    }, 2000); // Check every 2 seconds
  }

  /**
   * Core DeepSeek API call with enhanced error handling
   */
  private async callDeepSeekAPI(
    input: ValidatedInput,
    options: any
  ): Promise<DeepSeekResponse> {
    
    if (!EnhancedDeepSeekWithQueue.API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 30000);

    try {
      const response = await fetch(EnhancedDeepSeekWithQueue.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${EnhancedDeepSeekWithQueue.API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for a Bangladesh e-commerce platform.' },
            ...input.conversationHistory,
            { role: 'user', content: input.userMessage }
          ],
          max_tokens: options.maxTokens || 500,
          temperature: 0.7,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        content: data.choices[0]?.message?.content || 'No response generated',
        confidence: 0.9,
        processingTime,
        tokensUsed: data.usage?.total_tokens || 0
      };

    } catch (error) {
      clearTimeout(timeout);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Input validation and sanitization
   */
  private validateAndSanitizeInput(
    userMessage: string,
    conversationHistory: Array<{role: string, content: string}>
  ): ValidatedInput {
    
    // Validate message
    if (!userMessage || typeof userMessage !== 'string') {
      throw new Error('Invalid user message');
    }
    
    if (userMessage.length > 2000) {
      throw new Error('Message too long');
    }
    
    // Sanitize and validate conversation history
    const validatedHistory = conversationHistory
      .filter(msg => msg && typeof msg.content === 'string' && msg.content.length < 1000)
      .slice(-10); // Keep only last 10 messages

    return {
      userMessage: userMessage.trim(),
      conversationHistory: validatedHistory
    };
  }

  /**
   * Utility methods
   */
  private generateRequestId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private removeFromQueue(requestId: string): void {
    this.requestQueue = this.requestQueue.filter(req => req.id !== requestId);
  }

  private calculateEstimatedWaitTime(): number {
    const avgProcessingTime = 2000; // 2 seconds per request
    return this.requestQueue.length * avgProcessingTime;
  }

  private updateQueueStats(queueTime: number): void {
    const currentAvg = this.stats.averageQueueTime;
    const processed = this.stats.processedRequests;
    this.stats.averageQueueTime = (currentAvg * (processed - 1) + queueTime) / processed;
  }

  /**
   * Get queue and performance statistics
   */
  public getQueueStats() {
    return {
      ...this.stats,
      currentQueueSize: this.requestQueue.length,
      isProcessing: this.processing,
      rateLimitStatus: this.canProcessImmediately() ? 'available' : 'limited',
      estimatedWaitTime: this.calculateEstimatedWaitTime()
    };
  }

  /**
   * Health check for monitoring
   */
  public async healthCheck(): Promise<QueueHealthStatus> {
    return {
      service: 'EnhancedDeepSeekWithQueue',
      status: EnhancedDeepSeekWithQueue.API_KEY ? 'healthy' : 'degraded',
      queueSize: this.requestQueue.length,
      processing: this.processing,
      rateLimitStatus: this.canProcessImmediately() ? 'available' : 'limited',
      stats: this.getQueueStats(),
      timestamp: new Date().toISOString()
    };
  }
}

// Types
interface ValidatedInput {
  userMessage: string;
  conversationHistory: Array<{role: string, content: string}>;
}

interface DeepSeekResponse {
  content: string;
  confidence: number;
  processingTime: number;
  tokensUsed: number;
}

interface EnhancedConversationResult {
  success: boolean;
  response?: string;
  error?: string;
  message?: string;
  confidence?: number;
  processingTime?: number;
  queueStatus: 'processed_immediately' | 'processed_from_queue' | 'queued' | 'queue_full' | 'failed';
  queueTime?: number;
  estimatedWaitTime: number;
  queueSize?: number;
  metadata?: {
    tokensUsed: number;
    model: string;
    processedAt: string;
  };
}

interface QueuedRequest {
  id: string;
  input: ValidatedInput;
  options: any;
  priority: 'high' | 'normal' | 'low';
  queuedAt: number;
  resolve: (result: EnhancedConversationResult) => void;
  reject: (error: Error) => void;
}

interface QueueHealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  queueSize: number;
  processing: boolean;
  rateLimitStatus: 'available' | 'limited';
  stats: any;
  timestamp: string;
}

export default EnhancedDeepSeekWithQueue;