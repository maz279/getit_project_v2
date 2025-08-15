/**
 * PHASE 3: MULTI-MODEL AI ORCHESTRATOR
 * Intelligent routing between Grok, DeepSeek, and OpenAI models
 * Investment: $35,000 | Week 1-2: AI Orchestration Foundation
 * Date: July 26, 2025
 */

import { z } from 'zod';
import OpenAI from 'openai';

// AI Model Configuration
interface AIModel {
  readonly name: 'grok' | 'deepseek' | 'openai';
  readonly baseURL: string;
  readonly apiKey: string;
  readonly models: {
    readonly text: string;
    readonly vision?: string;
  };
  readonly pricing: {
    readonly inputTokens: number; // per 1K tokens
    readonly outputTokens: number; // per 1K tokens
  };
  readonly strengths: readonly string[];
  readonly limitations: readonly string[];
  readonly maxTokens: number;
  readonly responseTimeTarget: number; // ms
}

// Query Context Interface
interface QueryContext {
  readonly query: string;
  readonly userId?: string;
  readonly location?: string;
  readonly language: 'bengali' | 'english';
  readonly queryType: 'product_search' | 'cultural_context' | 'technical_support' | 'conversational' | 'recommendation';
  readonly complexity: 'simple' | 'medium' | 'complex';
  readonly urgency: 'low' | 'medium' | 'high' | 'critical';
  readonly previousConversation?: ConversationTurn[];
  readonly userProfile?: UserProfile;
}

// Conversation Turn
interface ConversationTurn {
  readonly id: string;
  readonly timestamp: number;
  readonly userMessage: string;
  readonly aiResponse: string;
  readonly model: string;
  readonly context: Record<string, any>;
}

// User Profile
interface UserProfile {
  readonly id: string;
  readonly demographics: {
    readonly age?: number;
    readonly location: string;
    readonly district: string;
    readonly preferences: string[];
  };
  readonly behaviorData: {
    readonly searchHistory: string[];
    readonly purchaseHistory: string[];
    readonly interactionPatterns: Record<string, number>;
  };
  readonly culturalContext: {
    readonly festivals: string[];
    readonly seasonalPreferences: string[];
    readonly languagePreference: 'bengali' | 'english' | 'mixed';
  };
}

// AI Response
interface AIResponse {
  readonly response: string;
  readonly model: string;
  readonly confidence: number;
  readonly processingTime: number;
  readonly tokenCount: number;
  readonly cost: number;
  readonly metadata: {
    readonly culturalRelevance: number;
    readonly technicalAccuracy: number;
    readonly userPersonalization: number;
  };
}

// Performance Metrics
interface PerformanceMetrics {
  readonly requests: number;
  readonly totalTime: number;
  readonly totalCost: number;
  readonly avgResponseTime: number;
  readonly successRate: number;
  readonly avgCulturalRelevance: number;
  readonly avgTechnicalAccuracy: number;
  readonly avgPersonalization: number;
}

export class MultiModelAIOrchestrator {
  private readonly models: Map<string, AIModel>;
  private readonly clients: Map<string, OpenAI>;
  private readonly performanceMetrics: Map<string, PerformanceMetrics>;
  private readonly conversationHistory: Map<string, ConversationTurn[]>;

  constructor() {
    this.models = new Map();
    this.clients = new Map();
    this.performanceMetrics = new Map();
    this.conversationHistory = new Map();
    
    this.initializeModels();
    this.initializeClients();
  }

  /**
   * Initialize AI model configurations
   */
  private initializeModels(): void {
    const models: AIModel[] = [
      {
        name: 'grok',
        baseURL: 'https://api.x.ai/v1',
        apiKey: process.env.XAI_API_KEY || '',
        models: {
          text: 'grok-2-1212',
          vision: 'grok-2-vision-1212'
        },
        pricing: {
          inputTokens: 0.002, // $2 per 1M tokens
          outputTokens: 0.008 // $8 per 1M tokens
        },
        strengths: ['cultural_context', 'conversational', 'bengali_language', 'local_knowledge'],
        limitations: ['technical_complexity', 'mathematical_precision'],
        maxTokens: 131072,
        responseTimeTarget: 2000
      },
      {
        name: 'deepseek',
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        models: {
          text: 'deepseek-chat'
        },
        pricing: {
          inputTokens: 0.0014, // $1.4 per 1M tokens
          outputTokens: 0.0028 // $2.8 per 1M tokens
        },
        strengths: ['technical_accuracy', 'coding', 'complex_analysis', 'structured_output'],
        limitations: ['cultural_context', 'conversational_flow'],
        maxTokens: 32768,
        responseTimeTarget: 3000
      },
      {
        name: 'openai',
        baseURL: 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY || '',
        models: {
          text: 'gpt-4o',
          vision: 'gpt-4o'
        },
        pricing: {
          inputTokens: 0.0025, // $2.5 per 1M tokens
          outputTokens: 0.010 // $10 per 1M tokens
        },
        strengths: ['balanced_performance', 'vision_analysis', 'general_knowledge', 'instruction_following'],
        limitations: ['higher_cost', 'limited_cultural_context'],
        maxTokens: 128000,
        responseTimeTarget: 2500
      }
    ];

    models.forEach(model => {
      this.models.set(model.name, model);
      this.performanceMetrics.set(`${model.name}-${new Date().toISOString().split('T')[0]}`, {
        requests: 0,
        totalTime: 0,
        totalCost: 0,
        avgResponseTime: 0,
        successRate: 1.0,
        avgCulturalRelevance: 0.8,
        avgTechnicalAccuracy: 0.8,
        avgPersonalization: 0.7
      });
    });
  }

  /**
   * Initialize API clients for each model
   */
  private initializeClients(): void {
    for (const [name, model] of this.models) {
      if (model.apiKey) {
        this.clients.set(name, new OpenAI({
          baseURL: model.baseURL,
          apiKey: model.apiKey
        }));
      }
    }
  }

  /**
   * Process query with intelligent model selection
   */
  async processQuery(context: QueryContext): Promise<AIResponse> {
    const startTime = Date.now();
    
    // Select optimal model
    const selectedModel = this.selectOptimalModel(context);
    
    try {
      // Process query with selected model
      const response = await this.processWithModel(selectedModel, context);
      
      // Update performance metrics
      this.updatePerformanceMetrics(selectedModel, startTime, response, true);
      
      return response;
    } catch (error) {
      console.error(`Error with model ${selectedModel}:`, error);
      
      // Fallback to secondary model
      const fallbackModel = this.selectFallbackModel(selectedModel, context);
      
      try {
        const response = await this.processWithModel(fallbackModel, context);
        this.updatePerformanceMetrics(fallbackModel, startTime, response, true);
        return response;
      } catch (fallbackError) {
        console.error(`Fallback model ${fallbackModel} also failed:`, fallbackError);
        this.updatePerformanceMetrics(selectedModel, startTime, null, false);
        
        // Return error response
        return {
          response: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
          model: selectedModel,
          confidence: 0.1,
          processingTime: Date.now() - startTime,
          tokenCount: 0,
          cost: 0,
          metadata: {
            culturalRelevance: 0,
            technicalAccuracy: 0,
            userPersonalization: 0
          }
        };
      }
    }
  }

  /**
   * Select optimal model based on query context
   */
  private selectOptimalModel(context: QueryContext): string {
    const { queryType, complexity, language, urgency } = context;
    
    // Score each model based on context
    const scores = new Map<string, number>();
    
    for (const [name, model] of this.models) {
      let score = 0;
      
      // Base score from performance metrics
      const metrics = this.getLatestMetrics(name);
      score += metrics.successRate * 0.3;
      score += (1 - metrics.avgResponseTime / 5000) * 0.2; // Response time weight
      
      // Query type scoring
      switch (queryType) {
        case 'cultural_context':
          if (model.strengths.includes('cultural_context')) score += 0.4;
          if (model.strengths.includes('local_knowledge')) score += 0.3;
          break;
        case 'technical_support':
          if (model.strengths.includes('technical_accuracy')) score += 0.4;
          if (model.strengths.includes('structured_output')) score += 0.3;
          break;
        case 'conversational':
          if (model.strengths.includes('conversational')) score += 0.4;
          if (model.strengths.includes('instruction_following')) score += 0.2;
          break;
        case 'product_search':
          if (model.strengths.includes('balanced_performance')) score += 0.3;
          if (model.strengths.includes('general_knowledge')) score += 0.2;
          break;
        case 'recommendation':
          if (model.strengths.includes('balanced_performance')) score += 0.3;
          if (model.strengths.includes('user_personalization')) score += 0.3;
          break;
      }
      
      // Language preference
      if (language === 'bengali' && model.strengths.includes('bengali_language')) {
        score += 0.2;
      }
      
      // Complexity handling
      if (complexity === 'complex' && model.strengths.includes('complex_analysis')) {
        score += 0.2;
      }
      
      // Urgency consideration
      if (urgency === 'critical' && model.responseTimeTarget < 2000) {
        score += 0.1;
      }
      
      // Cost efficiency (inverse relationship)
      const avgCost = (model.pricing.inputTokens + model.pricing.outputTokens) / 2;
      score += (1 - avgCost / 0.010) * 0.1; // Normalize against OpenAI pricing
      
      scores.set(name, score);
    }
    
    // Select model with highest score
    let bestModel = 'grok';
    let bestScore = 0;
    
    for (const [name, score] of scores) {
      if (score > bestScore && this.clients.has(name)) {
        bestModel = name;
        bestScore = score;
      }
    }
    
    return bestModel;
  }

  /**
   * Select fallback model
   */
  private selectFallbackModel(primaryModel: string, context: QueryContext): string {
    const models = Array.from(this.models.keys()).filter(name => 
      name !== primaryModel && this.clients.has(name)
    );
    
    if (models.length === 0) return primaryModel;
    
    // Prefer Grok for cultural queries, OpenAI for general, DeepSeek for technical
    if (context.queryType === 'cultural_context' && models.includes('grok')) return 'grok';
    if (context.queryType === 'technical_support' && models.includes('deepseek')) return 'deepseek';
    if (models.includes('openai')) return 'openai';
    
    return models[0];
  }

  /**
   * Process query with specific model
   */
  private async processWithModel(modelName: string, context: QueryContext): Promise<AIResponse> {
    const model = this.models.get(modelName);
    const client = this.clients.get(modelName);
    
    if (!model || !client) {
      throw new Error(`Model ${modelName} not available`);
    }
    
    const startTime = Date.now();
    
    // Build prompt with context
    const prompt = this.buildContextualPrompt(context);
    
    // Make API call
    const response = await client.chat.completions.create({
      model: model.models.text,
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt(modelName, context)
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: Math.min(2000, model.maxTokens),
      temperature: context.queryType === 'technical_support' ? 0.3 : 0.7,
    });
    
    const processingTime = Date.now() - startTime;
    const content = response.choices[0]?.message?.content || '';
    const tokenCount = response.usage?.total_tokens || 0;
    const cost = this.calculateCost(model, response.usage?.prompt_tokens || 0, response.usage?.completion_tokens || 0);
    
    // Calculate metadata scores
    const metadata = this.calculateMetadata(content, context, modelName);
    
    return {
      response: content,
      model: modelName,
      confidence: this.calculateConfidence(response, context),
      processingTime,
      tokenCount,
      cost,
      metadata
    };
  }

  /**
   * Build contextual prompt
   */
  private buildContextualPrompt(context: QueryContext): string {
    let prompt = context.query;
    
    // Add conversation context
    if (context.previousConversation && context.previousConversation.length > 0) {
      const recentContext = context.previousConversation.slice(-3);
      const contextStr = recentContext.map(turn => 
        `User: ${turn.userMessage}\nAI: ${turn.aiResponse}`
      ).join('\n\n');
      prompt = `Previous conversation:\n${contextStr}\n\nCurrent query: ${prompt}`;
    }
    
    // Add user profile context
    if (context.userProfile) {
      const { demographics, culturalContext } = context.userProfile;
      prompt += `\n\nUser context: Location: ${demographics.location}, Language preference: ${culturalContext.languagePreference}`;
    }
    
    // Add urgency indicator
    if (context.urgency === 'critical' || context.urgency === 'high') {
      prompt += `\n\nUrgency: ${context.urgency}. Please provide a quick, actionable response.`;
    }
    
    return prompt;
  }

  /**
   * Get system prompt for specific model
   */
  private getSystemPrompt(modelName: string, context: QueryContext): string {
    const basePrompt = `You are an AI assistant for GetIt, Bangladesh's leading e-commerce platform. 
    
Key guidelines:
- Provide helpful and accurate responses
- Consider Bangladesh cultural context
- Support both Bengali and English languages
- Focus on e-commerce and shopping assistance
- Be respectful of local customs and preferences`;

    const modelSpecificPrompts = {
      grok: `${basePrompt}
      
You excel at:
- Understanding Bengali language and culture
- Providing conversational, natural responses
- Local Bangladesh market knowledge
- Cultural sensitivity and context awareness`,

      deepseek: `${basePrompt}
      
You excel at:
- Technical accuracy and detailed analysis
- Structured, precise responses
- Complex problem solving
- Code and technical explanations`,

      openai: `${basePrompt}
      
You excel at:
- Balanced, well-rounded responses
- Following instructions precisely
- General knowledge and reasoning
- Multi-modal understanding`
    };

    return modelSpecificPrompts[modelName] || basePrompt;
  }

  /**
   * Calculate API cost
   */
  private calculateCost(model: AIModel, inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * model.pricing.inputTokens;
    const outputCost = (outputTokens / 1000) * model.pricing.outputTokens;
    return inputCost + outputCost;
  }

  /**
   * Calculate response confidence
   */
  private calculateConfidence(response: any, context: QueryContext): number {
    let confidence = 0.8; // Base confidence
    
    // Adjust based on response length and structure
    const content = response.choices[0]?.message?.content || '';
    if (content.length > 100) confidence += 0.1;
    if (content.includes('sorry') || content.includes('apologize')) confidence -= 0.2;
    
    // Adjust based on query complexity
    if (context.complexity === 'simple') confidence += 0.1;
    if (context.complexity === 'complex') confidence -= 0.1;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Calculate metadata scores
   */
  private calculateMetadata(content: string, context: QueryContext, modelName: string): {
    culturalRelevance: number;
    technicalAccuracy: number;
    userPersonalization: number;
  } {
    const model = this.models.get(modelName);
    
    // Base scores from model strengths
    let culturalRelevance = model?.strengths.includes('cultural_context') ? 0.8 : 0.5;
    let technicalAccuracy = model?.strengths.includes('technical_accuracy') ? 0.9 : 0.7;
    let userPersonalization = 0.6;
    
    // Adjust based on content analysis
    const contentLower = content.toLowerCase();
    
    // Cultural relevance indicators
    const culturalTerms = ['bangladesh', 'bengali', 'dhaka', 'taka', 'bkash', 'nagad', 'eid', 'puja'];
    const culturalMatches = culturalTerms.filter(term => contentLower.includes(term)).length;
    culturalRelevance += (culturalMatches / culturalTerms.length) * 0.2;
    
    // Technical accuracy indicators
    if (context.queryType === 'technical_support') {
      const technicalTerms = ['step', 'process', 'solution', 'method', 'troubleshoot'];
      const technicalMatches = technicalTerms.filter(term => contentLower.includes(term)).length;
      technicalAccuracy += (technicalMatches / technicalTerms.length) * 0.1;
    }
    
    // Personalization indicators
    if (context.userProfile && content.includes(context.userProfile.demographics.location)) {
      userPersonalization += 0.2;
    }
    if (context.language && contentLower.includes(context.language)) {
      userPersonalization += 0.1;
    }
    
    return {
      culturalRelevance: Math.min(1.0, culturalRelevance),
      technicalAccuracy: Math.min(1.0, technicalAccuracy),
      userPersonalization: Math.min(1.0, userPersonalization)
    };
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(
    modelName: string, 
    startTime: number, 
    response: AIResponse | null, 
    success: boolean
  ): void {
    const dateKey = `${modelName}-${new Date().toISOString().split('T')[0]}`;
    const current = this.performanceMetrics.get(dateKey) || {
      requests: 0,
      totalTime: 0,
      totalCost: 0,
      avgResponseTime: 0,
      successRate: 1.0,
      avgCulturalRelevance: 0.8,
      avgTechnicalAccuracy: 0.8,
      avgPersonalization: 0.7
    };
    
    const processingTime = Date.now() - startTime;
    
    const updated: PerformanceMetrics = {
      requests: current.requests + 1,
      totalTime: current.totalTime + processingTime,
      totalCost: current.totalCost + (response?.cost || 0),
      avgResponseTime: (current.totalTime + processingTime) / (current.requests + 1),
      successRate: ((current.successRate * current.requests) + (success ? 1 : 0)) / (current.requests + 1),
      avgCulturalRelevance: response ? 
        ((current.avgCulturalRelevance * current.requests) + response.metadata.culturalRelevance) / (current.requests + 1) : 
        current.avgCulturalRelevance,
      avgTechnicalAccuracy: response ? 
        ((current.avgTechnicalAccuracy * current.requests) + response.metadata.technicalAccuracy) / (current.requests + 1) : 
        current.avgTechnicalAccuracy,
      avgPersonalization: response ? 
        ((current.avgPersonalization * current.requests) + response.metadata.userPersonalization) / (current.requests + 1) : 
        current.avgPersonalization
    };
    
    this.performanceMetrics.set(dateKey, updated);
  }

  /**
   * Get latest metrics for a model
   */
  private getLatestMetrics(modelName: string): PerformanceMetrics {
    const dateKey = `${modelName}-${new Date().toISOString().split('T')[0]}`;
    return this.performanceMetrics.get(dateKey) || {
      requests: 0,
      totalTime: 0,
      totalCost: 0,
      avgResponseTime: 2000,
      successRate: 1.0,
      avgCulturalRelevance: 0.8,
      avgTechnicalAccuracy: 0.8,
      avgPersonalization: 0.7
    };
  }

  /**
   * Store conversation history
   */
  storeConversationTurn(userId: string, turn: ConversationTurn): void {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    
    const history = this.conversationHistory.get(userId)!;
    history.push(turn);
    
    // Keep only last 50 turns
    if (history.length > 50) {
      this.conversationHistory.set(userId, history.slice(-50));
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(userId: string): ConversationTurn[] {
    return this.conversationHistory.get(userId) || [];
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(userId: string): void {
    this.conversationHistory.delete(userId);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.performanceMetrics);
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Health check for all models
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    
    for (const modelName of this.clients.keys()) {
      try {
        const client = this.clients.get(modelName)!;
        const model = this.models.get(modelName)!;
        
        const response = await client.chat.completions.create({
          model: model.models.text,
          messages: [{ role: 'user', content: 'Health check' }],
          max_tokens: 10
        });
        
        health[modelName] = !!response.choices[0]?.message?.content;
      } catch (error) {
        health[modelName] = false;
      }
    }
    
    return health;
  }
}

// Export singleton instance
export const aiOrchestrator = new MultiModelAIOrchestrator();