
import { mlManager } from '../ml';
import { nlpManager } from '../nlp';
import { enhancedAISearchService } from '../ai-search/enhancedAISearchService';
import { productAnalysisService } from './orchestrator/ProductAnalysisService';
import { searchService } from './orchestrator/SearchService';
import { behaviorAnalysisService } from './orchestrator/BehaviorAnalysisService';
import { conversationService } from './orchestrator/ConversationService';
import { cacheManager } from './orchestrator/CacheManager';
import { performanceMonitor } from './orchestrator/PerformanceMonitor';

export class AIOrchestrator {
  private static instance: AIOrchestrator;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing AI Orchestrator...');
    
    await Promise.all([
      mlManager.initialize(),
      nlpManager.initialize(),
      enhancedAISearchService.initialize()
    ]);

    performanceMonitor.startMonitoring();
    this.startPerformanceMonitoring();
    this.isInitialized = true;
    console.log('✅ AI Orchestrator fully initialized');
  }

  async analyzeProduct(product: any, context?: {
    userId?: string;
    language?: 'en' | 'bn';
    includeRecommendations?: boolean;
  }): Promise<{
    mlAnalysis: any;
    nlpAnalysis: any;
    recommendations: any[];
    insights: any;
    optimizations: any;
  }> {
    const startTime = Date.now();
    const cacheKey = `product_analysis_${product.id}_${JSON.stringify(context)}`;
    
    const cached = cacheManager.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const result = await productAnalysisService.analyzeProduct(product, context);
      cacheManager.setCache(cacheKey, result, 300000);
      performanceMonitor.trackPerformance('product_analysis', Date.now() - startTime);
      return result;
    } catch (error) {
      console.error('AI Orchestrator: Product analysis failed:', error);
      throw error;
    }
  }

  async performIntelligentSearch(query: string, context?: {
    userId?: string;
    language?: 'en' | 'bn';
    searchType?: 'text' | 'voice' | 'image' | 'conversational';
    filters?: any;
  }): Promise<{
    results: any[];
    mlEnhancements: any;
    nlpInsights: any;
    personalizedRecommendations: any[];
    searchOptimizations: any;
  }> {
    const startTime = Date.now();
    
    try {
      const result = await searchService.performIntelligentSearch(query, context);
      performanceMonitor.trackPerformance('intelligent_search', Date.now() - startTime);
      return result;
    } catch (error) {
      console.error('AI Orchestrator: Intelligent search failed:', error);
      throw error;
    }
  }

  async analyzeUserBehavior(userId: string, event: {
    type: string;
    data: any;
    timestamp: number;
  }): Promise<{
    behaviorInsights: any;
    nextBestActions: string[];
    personalizationUpdates: any;
    mlModelUpdates: any;
  }> {
    try {
      return await behaviorAnalysisService.analyzeUserBehavior(userId, event);
    } catch (error) {
      console.error('AI Orchestrator: Behavior analysis failed:', error);
      throw error;
    }
  }

  async processConversation(message: string, context: {
    userId?: string;
    language?: 'en' | 'bn';
    conversationHistory?: any[];
    intent?: string;
  }): Promise<{
    response: string;
    nlpAnalysis: any;
    actionableInsights: any[];
    followUpSuggestions: string[];
    businessIntelligence: any;
  }> {
    try {
      return await conversationService.processConversation(message, context);
    } catch (error) {
      console.error('AI Orchestrator: Conversation processing failed:', error);
      throw error;
    }
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      cacheManager.cleanupCache();
    }, 60000);
  }

  public getPerformanceMetrics(): any {
    return performanceMonitor.getPerformanceMetrics();
  }
}

export const aiOrchestrator = AIOrchestrator.getInstance();
