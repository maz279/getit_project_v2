/**
 * GroqAIService.ts - Production-Ready AI Service
 * Comprehensive AI service for e-commerce search, recommendations, and conversational AI
 * Enhanced: Security, Performance, Type Safety, Error Handling, Memory Management
 */

import { z } from 'zod';
import OpenAI from 'openai';

// === CONFIGURATION CONSTANTS ===
const CONFIG = {
  TIMEOUTS: {
    DEFAULT: 3000,
    FAST: 1500,
    CONVERSATIONAL: 5000,
  },
  TOKEN_LIMITS: {
    SUGGESTIONS: 200,
    ENHANCEMENT: 300,
    CONVERSATIONAL: 500,
    PURCHASE_GUIDE: 800,
  },
  MODELS: {
    FAST: 'llama3-8b-8192',
    QUALITY: 'llama3-8b-8192',
  },
  CACHE: {
    TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 1000,
    CLEANUP_INTERVAL: 60000, // 1 minute
  },
  VALIDATION: {
    INPUT_MAX_LENGTH: 1000,
    MIN_QUERY_LENGTH: 1,
  },
} as const;

// === ZOD SCHEMAS FOR RUNTIME VALIDATION ===
const GroqResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.string(),
      role: z.string(),
    }),
    finish_reason: z.string(),
  })).min(1),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

const SearchEnhancementSchema = z.object({
  enhancedQuery: z.string(),
  intent: z.string(),
  categories: z.array(z.string()),
  semanticKeywords: z.array(z.string()),
  suggestions: z.array(z.object({
    text: z.string(),
    relevance: z.number().min(0).max(1),
    type: z.enum(['product', 'category', 'brand', 'intent']),
    context: z.string(),
  })),
  confidence: z.number().min(0).max(1),
});

const IntentAnalysisSchema = z.object({
  intent: z.string(),
  confidence: z.number().min(0).max(1),
  category: z.string(),
  urgency: z.enum(['low', 'medium', 'high']),
});

const ConversationalResponseSchema = z.object({
  response: z.string(),
  confidence: z.number().min(0).max(1),
  language: z.string(),
  context: z.string(),
});

const PurchaseGuideSchema = z.object({
  recommendations: z.array(z.object({
    product: z.string(),
    reason: z.string(),
    price_range: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    rating: z.number().min(0).max(5),
  })),
  buying_tips: z.array(z.string()),
  budget_advice: z.string(),
  seasonal_considerations: z.array(z.string()),
});

// === TYPES ===
export type SearchEnhancement = z.infer<typeof SearchEnhancementSchema>;
export type IntentAnalysis = z.infer<typeof IntentAnalysisSchema>;
export type ConversationalResponse = z.infer<typeof ConversationalResponseSchema>;
export type PurchaseGuide = z.infer<typeof PurchaseGuideSchema>;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface ServiceStats {
  totalRequests: number;
  successfulRequests: number;
  averageResponseTime: number;
  errorCount: number;
  cacheHits: number;
}

interface ServiceError extends Error {
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

// === CUSTOM ERROR CLASSES ===
export class GroqServiceError extends Error implements ServiceError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'GROQ_SERVICE_ERROR',
    statusCode: number = 500,
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'GroqServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends GroqServiceError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class ServiceUnavailableError extends GroqServiceError {
  constructor(message: string = 'Groq AI service is not available') {
    super(message, 'SERVICE_UNAVAILABLE', 503);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Enhanced AI service using Groq API for fast, reliable e-commerce intelligence.
 * Production-ready with comprehensive error handling, security, and performance optimization.
 */
export class GroqAIService {
  private static instance: GroqAIService | null = null;
  private static readonly instanceLock = Symbol('GroqAIService.instance');
  
  private readonly client: OpenAI;
  private readonly isAvailable: boolean;
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly stats: ServiceStats = {
    totalRequests: 0,
    successfulRequests: 0,
    averageResponseTime: 0,
    errorCount: 0,
    cacheHits: 0,
  };
  
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly abortControllers = new Map<string, AbortController>();

  /**
   * Private constructor to enforce singleton pattern with proper error handling
   */
  private constructor() {
    const apiKey = this.getValidatedApiKey();
    
    if (!apiKey) {
      console.warn('⚠️ GROQ_API_KEY not provided - AI enhancement disabled');
      this.isAvailable = false;
      this.client = {} as OpenAI; // Dummy client
      return;
    }

    try {
      this.client = new OpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: apiKey,
        timeout: CONFIG.TIMEOUTS.DEFAULT,
      });

      this.isAvailable = true;
      this.startCacheCleanup();
      
      console.log('✅ Groq AI Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Groq AI Service:', error);
      this.isAvailable = false;
      this.client = {} as OpenAI;
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): GroqAIService {
    if (!GroqAIService.instance) {
      GroqAIService.instance = new GroqAIService();
    }
    return GroqAIService.instance;
  }

  /**
   * Reset singleton instance (for model updates)
   */
  public static resetInstance(): void {
    GroqAIService.instance = null;
  }

  /**
   * Generate contextual search suggestions - Core search functionality
   */
  public async generateContextualSuggestions(
    query: string,
    language: string = 'en',
    userHistory: string[] = []
  ): Promise<string[]> {
    if (!this.isAvailable) {
      throw new Error('Groq AI service is not available');
    }

    const cacheKey = `suggestions_${query}_${language}_${userHistory.join(',')}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      this.validateInput(query, GroqAIService.INPUT_MAX_LENGTH);

      const prompt = this.buildContextualSuggestionsPrompt(query, language, userHistory);
      
      const response = await this.client.chat.completions.create({
        model: GroqAIService.MODEL_FAST,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: GroqAIService.MAX_TOKENS_SUGGESTIONS,
        temperature: 0.7,
        stream: false
      });

      const suggestions = this.parseSearchSuggestions(response.choices[0].message.content);
      
      // Cache the results
      this.setCache(cacheKey, suggestions);
      
      this.updateStats(startTime, true);
      return suggestions;

    } catch (error) {
      this.updateStats(startTime, false);
      console.error('Groq contextual suggestions error:', error);
      throw new Error('AI suggestion service temporarily unavailable');
    }
  }

  /**
   * Enhanced query processing - Improves search queries with AI intelligence
   */
  public async enhanceQuery(
    query: string,
    context: { category?: string; priceRange?: string; location?: string } = {}
  ): Promise<SearchEnhancement> {
    if (!this.isAvailable) {
      throw new Error('Groq AI service is not available');
    }

    const cacheKey = `enhance_${query}_${JSON.stringify(context)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      this.validateInput(query, GroqAIService.INPUT_MAX_LENGTH);

      const prompt = this.buildQueryEnhancementPrompt(query, context);
      
      const response = await this.client.chat.completions.create({
        model: GroqAIService.MODEL_QUALITY,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: GroqAIService.MAX_TOKENS_ENHANCEMENT,
        temperature: 0.3,
        stream: false
      });

      const enhancement = this.parseQueryEnhancement(response.choices[0].message.content, query);
      
      this.setCache(cacheKey, enhancement);
      this.updateStats(startTime, true);
      return enhancement;

    } catch (error) {
      this.updateStats(startTime, false);
      console.error('Groq query enhancement error:', error);
      throw new Error('Query enhancement service temporarily unavailable');
    }
  }

  /**
   * Intent analysis - Understand user search intent
   */
  public async analyzeIntent(query: string): Promise<IntentAnalysis> {
    if (!this.isAvailable) {
      throw new Error('Groq AI service is not available');
    }

    const cacheKey = `intent_${query}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      this.validateInput(query, GroqAIService.INPUT_MAX_LENGTH);

      const prompt = this.buildIntentAnalysisPrompt(query);
      
      const response = await this.client.chat.completions.create({
        model: GroqAIService.MODEL_FAST,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.2,
        stream: false
      });

      const analysis = this.parseIntentAnalysis(response.choices[0].message.content);
      
      this.setCache(cacheKey, analysis);
      this.updateStats(startTime, true);
      return analysis;

    } catch (error) {
      this.updateStats(startTime, false);
      console.error('Groq intent analysis error:', error);
      throw new Error('Intent analysis service temporarily unavailable');
    }
  }

  /**
   * Conversational AI responses - Direct question answering
   */
  public async directResponse(
    query: string,
    context: string = '',
    language: string = 'en'
  ): Promise<ConversationalResponse> {
    if (!this.isAvailable) {
      throw new Error('Groq AI service is not available');
    }

    const cacheKey = `conversation_${query}_${context}_${language}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      this.validateInput(query, GroqAIService.INPUT_MAX_LENGTH);

      const prompt = this.buildConversationalPrompt(query, context, language);
      
      const response = await this.client.chat.completions.create({
        model: GroqAIService.MODEL_QUALITY,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: GroqAIService.MAX_TOKENS_CONVERSATIONAL,
        temperature: 0.4,
        stream: false
      });

      const conversationalResponse = this.parseConversationalResponse(
        response.choices[0].message.content,
        language
      );
      
      this.setCache(cacheKey, conversationalResponse);
      this.updateStats(startTime, true);
      return conversationalResponse;

    } catch (error) {
      this.updateStats(startTime, false);
      console.error('Groq conversational response error:', error);
      throw new Error('Conversational AI service temporarily unavailable');
    }
  }

  /**
   * Purchase guidance - Detailed product recommendations and buying advice
   */
  public async generatePurchaseGuide(
    query: string,
    budget?: string,
    preferences?: string[]
  ): Promise<PurchaseGuide> {
    if (!this.isAvailable) {
      throw new Error('Groq AI service is not available');
    }

    const cacheKey = `purchase_guide_${query}_${budget}_${preferences?.join(',')}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      this.validateInput(query, GroqAIService.INPUT_MAX_LENGTH);

      const prompt = this.buildPurchaseGuidePrompt(query, budget, preferences);
      
      const response = await this.client.chat.completions.create({
        model: GroqAIService.MODEL_QUALITY,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: GroqAIService.MAX_TOKENS_PURCHASE_GUIDE,
        temperature: 0.3,
        stream: false
      });

      const guide = this.parsePurchaseGuide(response.choices[0].message.content);
      
      this.setCache(cacheKey, guide);
      this.updateStats(startTime, true);
      return guide;

    } catch (error) {
      this.updateStats(startTime, false);
      console.error('Groq purchase guide error:', error);
      throw new Error('Purchase guide service temporarily unavailable');
    }
  }

  // === PROMPT BUILDERS ===

  private buildContextualSuggestionsPrompt(
    query: string,
    language: string,
    userHistory: string[]
  ): string {
    return `Generate 8 contextual e-commerce search suggestions for: "${query}"

Language: ${language}
User search history: ${userHistory.slice(-5).join(', ')}
Context: Bangladesh e-commerce marketplace focusing on local products and preferences

Requirements:
- Include popular Bangladesh brands (Samsung, Xiaomi, Walton, Symphony, etc.)
- Consider seasonal trends (Eid, Puja, Bengali New Year, monsoon season)
- Mix product names, categories, and brand suggestions
- Focus on products commonly available in Bangladesh market
- Include price-conscious alternatives
- Return as clean JSON array: ["suggestion 1", "suggestion 2", ...]

Examples of good suggestions:
- "Samsung Galaxy A54 under 50000 taka"
- "Walton refrigerator with warranty"
- "Eid collection traditional wear"
- "monsoon season electronics protection"

Return only the JSON array, no explanations.`;
  }

  private buildQueryEnhancementPrompt(
    query: string,
    context: { category?: string; priceRange?: string; location?: string }
  ): string {
    return `Enhance this e-commerce search query for better results: "${query}"

Context provided:
- Category: ${context.category || 'not specified'}
- Price range: ${context.priceRange || 'not specified'}
- Location: ${context.location || 'Bangladesh (general)'}

Marketplace: Bangladesh e-commerce focusing on local availability and preferences

Return a JSON object with this exact structure:
{
  "enhancedQuery": "improved search query with better keywords",
  "intent": "buying/browsing/comparing/researching",
  "categories": ["primary category", "secondary category"],
  "semanticKeywords": ["keyword1", "keyword2", "keyword3"],
  "suggestions": [
    {
      "text": "suggestion text",
      "relevance": 0.9,
      "type": "product",
      "context": "why this suggestion is relevant"
    }
  ],
  "confidence": 0.85
}

Focus on Bangladesh market context, local brands, and typical user search patterns.`;
  }

  private buildIntentAnalysisPrompt(query: string): string {
    return `Analyze the intent behind this e-commerce search query: "${query}"

Consider Bangladesh market context and typical user behavior patterns.

Return a JSON object with this exact structure:
{
  "intent": "buying/browsing/comparing/researching/support",
  "confidence": 0.85,
  "category": "electronics/clothing/home/beauty/sports/books/etc",
  "urgency": "low/medium/high"
}

Guidelines:
- "buying": clear purchase intent with specific products
- "browsing": general exploration without specific target
- "comparing": looking at multiple options/alternatives
- "researching": seeking information before purchase
- "support": looking for help with existing products

- "high" urgency: immediate need (broken phone, emergency)
- "medium" urgency: planned purchase (festival shopping)
- "low" urgency: casual browsing or future planning`;
  }

  private buildConversationalPrompt(
    query: string,
    context: string,
    language: string
  ): string {
    return `You are a helpful e-commerce assistant for GetIt Bangladesh marketplace. Answer this question: "${query}"

Previous context: ${context}
Response language: ${language}
Market focus: Bangladesh e-commerce, local products, cultural context

Guidelines:
- Provide helpful, accurate advice about products and shopping
- Consider Bangladesh market availability and pricing
- Include local brands when relevant (Walton, Symphony, etc.)
- Mention seasonal considerations (Eid, Puja, monsoon)
- Be conversational but professional
- Include practical buying tips when appropriate

Return a JSON object with this structure:
{
  "response": "your helpful response here",
  "confidence": 0.9,
  "language": "${language}",
  "context": "brief context about the response type"
}

Focus on being genuinely helpful for Bangladesh consumers.`;
  }

  private buildPurchaseGuidePrompt(
    query: string,
    budget?: string,
    preferences?: string[]
  ): string {
    return `Create a comprehensive purchase guide for: "${query}"

Budget: ${budget || 'not specified'}
Preferences: ${preferences?.join(', ') || 'none specified'}
Market: Bangladesh e-commerce

Return a JSON object with this structure:
{
  "recommendations": [
    {
      "product": "specific product name",
      "reason": "why this is recommended",
      "price_range": "estimated price in taka",
      "pros": ["advantage 1", "advantage 2"],
      "cons": ["limitation 1", "limitation 2"],
      "rating": 4.2
    }
  ],
  "buying_tips": ["tip 1", "tip 2", "tip 3"],
  "budget_advice": "advice about budget allocation",
  "seasonal_considerations": ["timing advice", "seasonal factors"]
}

Guidelines:
- Include 3-5 product recommendations
- Focus on products available in Bangladesh
- Consider local brand alternatives (Walton, Symphony)
- Include practical buying tips
- Mention warranty and service considerations
- Consider seasonal factors (Eid sales, monsoon protection)
- Be realistic about pricing in Bangladesh market`;
  }

  // === RESPONSE PARSERS ===

  private parseSearchSuggestions(content: string): string[] {
    try {
      // Clean up the content and extract JSON array
      const cleaned = content.trim().replace(/```json|```/g, '');
      const jsonMatch = cleaned.match(/\[.*\]/s);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 8).filter(item => typeof item === 'string' && item.trim());
        }
      }

      // Fallback: parse line by line
      const lines = content.split('\n')
        .filter(line => line.trim() && !line.includes('```') && !line.includes('JSON'))
        .slice(0, 8)
        .map(line => line.replace(/^\d+\.?\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(line => line.length > 0);

      return lines.length > 0 ? lines : this.getDefaultSuggestions();

    } catch (error) {
      console.error('Error parsing suggestions:', error);
      return this.getDefaultSuggestions();
    }
  }

  private parseQueryEnhancement(content: string, originalQuery: string): SearchEnhancement {
    try {
      const cleaned = content.trim().replace(/```json|```/g, '');
      const jsonMatch = cleaned.match(/\{.*\}/s);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return SearchEnhancementSchema.parse(parsed);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing query enhancement:', error);
      return this.getDefaultEnhancement(originalQuery);
    }
  }

  private parseIntentAnalysis(content: string): IntentAnalysis {
    try {
      const cleaned = content.trim().replace(/```json|```/g, '');
      const jsonMatch = cleaned.match(/\{.*\}/s);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return IntentAnalysisSchema.parse(parsed);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing intent analysis:', error);
      return {
        intent: 'browsing',
        confidence: 0.5,
        category: 'general',
        urgency: 'medium'
      };
    }
  }

  private parseConversationalResponse(content: string, language: string): ConversationalResponse {
    try {
      const cleaned = content.trim().replace(/```json|```/g, '');
      const jsonMatch = cleaned.match(/\{.*\}/s);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return ConversationalResponseSchema.parse(parsed);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing conversational response:', error);
      return {
        response: content.trim() || 'I understand your question. Could you please provide more details so I can give you a better answer?',
        confidence: 0.6,
        language: language,
        context: 'fallback_response'
      };
    }
  }

  private parsePurchaseGuide(content: string): PurchaseGuide {
    try {
      const cleaned = content.trim().replace(/```json|```/g, '');
      const jsonMatch = cleaned.match(/\{.*\}/s);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return PurchaseGuideSchema.parse(parsed);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing purchase guide:', error);
      return {
        recommendations: [
          {
            product: 'Popular product in this category',
            reason: 'Good value for money and reliable brand',
            price_range: 'Budget-friendly pricing',
            pros: ['Good quality', 'Local warranty'],
            cons: ['Consider comparing with alternatives'],
            rating: 4.0
          }
        ],
        buying_tips: [
          'Compare prices across multiple sellers',
          'Check warranty and service centers',
          'Read customer reviews carefully'
        ],
        budget_advice: 'Consider your needs and compare features before deciding',
        seasonal_considerations: ['Check for seasonal discounts and offers']
      };
    }
  }

  // === UTILITY METHODS ===

  private validateInput(input: string, maxLength: number): void {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input: must be a non-empty string');
    }
    
    if (input.length > maxLength) {
      throw new Error(`Input too long: maximum ${maxLength} characters allowed`);
    }
    
    // Basic security: prevent potential injection attempts
    const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+=/i];
    if (suspiciousPatterns.some(pattern => pattern.test(input))) {
      throw new Error('Invalid input: contains potentially harmful content');
    }
  }

  private getDefaultSuggestions(): string[] {
    return [
      'smartphones under 30000 taka',
      'laptop deals Bangladesh',
      'Samsung mobile offers',
      'Walton electronics',
      'Eid special collection',
      'winter clothing sale',
      'home appliances',
      'books and stationery'
    ];
  }

  private getDefaultEnhancement(query: string): SearchEnhancement {
    return {
      enhancedQuery: query,
      intent: 'browsing',
      categories: ['general'],
      semanticKeywords: [query],
      suggestions: [
        {
          text: query,
          relevance: 0.8,
          type: 'product',
          context: 'original query'
        }
      ],
      confidence: 0.6
    };
  }

  // === CACHING SYSTEM ===

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.cache.entries()) {
        if (now - cached.timestamp >= cached.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  // === PERFORMANCE TRACKING ===

  private updateStats(startTime: number, success: boolean): void {
    const duration = Date.now() - startTime;
    
    if (success) {
      this.stats.successfulRequests++;
      this.stats.averageResponseTime = 
        (this.stats.averageResponseTime * (this.stats.successfulRequests - 1) + duration) / 
        this.stats.successfulRequests;
    } else {
      this.stats.errorCount++;
    }
  }

  // === PUBLIC UTILITY METHODS ===

  public getServiceAvailability(): boolean {
    return this.isAvailable;
  }

  public getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      uptime: this.isAvailable ? 'Available' : 'Unavailable'
    };
  }

  public clearCache(): void {
    this.cache.clear();
    console.log('Groq AI Service cache cleared');
  }
}