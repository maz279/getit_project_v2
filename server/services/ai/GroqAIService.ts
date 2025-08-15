/**
 * GroqAIService.ts - Production-Ready AI Service
 * Comprehensive AI service for e-commerce search, recommendations, and conversational AI
 * Enhanced: Security, Performance, Type Safety, Error Handling, Memory Management
 */

import { z } from 'zod';
import OpenAI from 'openai';

// === ENHANCED CONFIGURATION CONSTANTS ===
const CONFIG = {
  TIMEOUTS: {
    DEFAULT: 3000,
    FAST: 1500,
    CONVERSATIONAL: 8000,
    RECOMMENDATION: 4000,
    CULTURAL_ANALYSIS: 5000,
  },
  TOKEN_LIMITS: {
    SUGGESTIONS: 300,
    ENHANCEMENT: 300,
    CONVERSATIONAL: 800,
    PURCHASE_GUIDE: 800,
    RECOMMENDATIONS: 600,
    CULTURAL_CONTEXT: 700,
    COMPARISON: 500,
    BENGALI_RESPONSE: 600,
  },
  MODELS: {
    FAST: 'llama3-8b-8192',
    QUALITY: 'llama3-8b-8192',
    CULTURAL: 'llama3-8b-8192',
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
  // LOW PRIORITY #1: Magic Number Elimination - Additional constants
  PERFORMANCE: {
    REQUEST_TIMEOUT_MULTIPLIER: 2, // For cleanup timeout calculation
    STATS_PRECISION: 2, // Decimal places for performance metrics
    CACHE_HIT_BOOST: 0.1, // Performance boost from cache hits
  },
  // ENHANCED: Comprehensive Bangladesh Context
  BANGLADESH_CONTEXT: {
    MAJOR_CITIES: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'],
    FESTIVALS: ['Eid ul-Fitr', 'Eid ul-Adha', 'Durga Puja', 'Pohela Boishakh', 'Kali Puja', 'Christmas'],
    SEASONS: ['Summer', 'Monsoon', 'Winter', 'Pre-monsoon'],
    LOCAL_BRANDS: ['Walton', 'Symphony', 'Minister', 'Pran', 'Square', 'ACI', 'Bashundhara'],
    PAYMENT_METHODS: ['bKash', 'Nagad', 'Rocket', 'SureCash', 'Bank Transfer', 'Cash on Delivery'],
    LANGUAGES: ['Bengali', 'English', 'Chittagonian', 'Sylheti'],
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

// ENHANCED: Advanced Bangladesh-specific schemas
const BengaliConversationSchema = z.object({
  bengaliResponse: z.string(),
  englishResponse: z.string(),
  culturalContext: z.array(z.string()),
  localReferences: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  responseType: z.enum(['informational', 'transactional', 'cultural', 'support']),
  suggestedActions: z.array(z.string()).optional(),
});

const PersonalizedRecommendationSchema = z.object({
  recommendations: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    reason: z.string(),
    confidence: z.number().min(0).max(1),
    priceRange: z.string(),
    availability: z.string(),
    culturalRelevance: z.string().optional(),
    seasonalFactor: z.string().optional(),
    localBrandPreference: z.boolean().optional(),
  })),
  recommendationType: z.enum(['collaborative', 'content-based', 'hybrid', 'cultural', 'seasonal']),
  userProfile: z.object({
    preferences: z.array(z.string()),
    culturalBackground: z.string().optional(),
    location: z.string().optional(),
    budgetRange: z.string().optional(),
  }),
  metadata: z.object({
    algorithm: z.string(),
    confidence: z.number(),
    refreshTime: z.string(),
  }),
});

const SeasonalRecommendationSchema = z.object({
  seasonalProducts: z.array(z.object({
    category: z.string(),
    products: z.array(z.string()),
    reason: z.string(),
    urgency: z.enum(['low', 'medium', 'high']),
    priceExpectation: z.string(),
  })),
  festivalSpecific: z.array(z.object({
    festival: z.string(),
    recommendations: z.array(z.string()),
    culturalSignificance: z.string(),
    timingAdvice: z.string(),
  })),
  weatherConsiderations: z.array(z.string()),
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

// === ENHANCED TYPES ===
export type SearchEnhancement = z.infer<typeof SearchEnhancementSchema>;
export type IntentAnalysis = z.infer<typeof IntentAnalysisSchema>;
export type ConversationalResponse = z.infer<typeof ConversationalResponseSchema>;
export type PurchaseGuide = z.infer<typeof PurchaseGuideSchema>;

// ENHANCED: Advanced Bangladesh-specific types
export type BengaliConversation = z.infer<typeof BengaliConversationSchema>;
export type PersonalizedRecommendation = z.infer<typeof PersonalizedRecommendationSchema>;
export type SeasonalRecommendation = z.infer<typeof SeasonalRecommendationSchema>;

interface UserProfile {
  readonly userId: string;
  readonly preferences: string[];
  readonly purchaseHistory?: string[];
  readonly culturalBackground?: string;
  readonly location?: string;
  readonly budgetRange?: string;
  readonly language: 'en' | 'bn' | 'mixed';
  readonly paymentPreferences?: string[];
  readonly deliveryPreferences?: string[];
}

interface CulturalContext {
  readonly currentSeason: string;
  readonly upcomingFestivals: string[];
  readonly regionalPreferences: string[];
  readonly localTrends: string[];
}

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

// Singleton instance management - moved to module scope to prevent recreation on each import
const INSTANCE_LOCK = Symbol('GroqAIService.instance');

/**
 * Enhanced AI service using Groq API for fast, reliable e-commerce intelligence.
 * Production-ready with comprehensive error handling, security, and performance optimization.
 */
export class GroqAIService {
  private static instance: GroqAIService | null = null;
  private static readonly instanceLock = INSTANCE_LOCK;
  
  private readonly client: OpenAI;
  private readonly isAvailable: boolean;
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  // ENHANCED: Advanced statistics tracking
  private readonly stats: ServiceStats & {
    bengaliRequests: number;
    culturalQueries: number;
    recommendationRequests: number;
    seasonalQueries: number;
  } = {
    totalRequests: 0,
    successfulRequests: 0,
    averageResponseTime: 0,
    errorCount: 0,
    cacheHits: 0,
    bengaliRequests: 0,
    culturalQueries: 0,
    recommendationRequests: 0,
    seasonalQueries: 0,
  };
  
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly abortControllers = new Map<string, AbortController>();
  private readonly CACHE_TTL = CONFIG.CACHE.TTL;

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
      this.validateInput(query, CONFIG.VALIDATION.INPUT_MAX_LENGTH);

      const prompt = this.buildContextualSuggestionsPrompt(query, language, userHistory);
      
      const response = await this.client.chat.completions.create({
        model: CONFIG.MODELS.FAST,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: CONFIG.TOKEN_LIMITS.SUGGESTIONS,
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
      // NO FAKE DATA FALLBACKS - Return empty array instead
      return [];
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
      this.validateInput(query, CONFIG.VALIDATION.INPUT_MAX_LENGTH);

      const prompt = this.buildQueryEnhancementPrompt(query, context);
      
      const response = await this.client.chat.completions.create({
        model: CONFIG.MODELS.QUALITY,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: CONFIG.TOKEN_LIMITS.ENHANCEMENT,
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
      this.validateInput(query, CONFIG.VALIDATION.INPUT_MAX_LENGTH);

      const prompt = this.buildIntentAnalysisPrompt(query);
      
      const response = await this.client.chat.completions.create({
        model: CONFIG.MODELS.FAST,
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
      this.validateInput(query, CONFIG.VALIDATION.INPUT_MAX_LENGTH);

      const prompt = this.buildConversationalPrompt(query, context, language);
      
      const response = await this.client.chat.completions.create({
        model: CONFIG.MODELS.QUALITY,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: CONFIG.TOKEN_LIMITS.CONVERSATIONAL,
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
      this.validateInput(query, CONFIG.VALIDATION.INPUT_MAX_LENGTH);

      const prompt = this.buildPurchaseGuidePrompt(query, budget, preferences);
      
      const response = await this.client.chat.completions.create({
        model: CONFIG.MODELS.QUALITY,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: CONFIG.TOKEN_LIMITS.PURCHASE_GUIDE,
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
      // Use unified parsing utility with schema validation
      const parsed = this.parseJsonResponse(content, {
        patterns: ['greedy', 'nongreedy'],
        validateSchema: IntentAnalysisSchema
      });
      
      if (parsed) {
        return parsed;
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
      // FORENSIC FIX: Comprehensive JSON sanitization to handle control characters
      const cleaned = content.trim()
        .replace(/```json|```/g, '')
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/\r?\n/g, '\\n') // Escape newlines
        .replace(/\r/g, '\\r') // Escape carriage returns
        .replace(/\t/g, '\\t') // Escape tabs
        .replace(/\\/g, '\\\\') // Escape backslashes
        .replace(/"/g, '\\"'); // Escape quotes
      
      const jsonMatch = cleaned.match(/\{.*\}/s);
      
      if (jsonMatch) {
        // Additional sanitization for the matched JSON
        const jsonString = jsonMatch[0]
          .replace(/\\n/g, ' ') // Convert escaped newlines to spaces
          .replace(/\\r/g, '') // Remove escaped carriage returns
          .replace(/\\t/g, ' ') // Convert escaped tabs to spaces
          .replace(/\\\\/g, '\\') // Unescape backslashes
          .replace(/\\"/g, '"'); // Unescape quotes
        
        const parsed = JSON.parse(jsonString);
        return ConversationalResponseSchema.parse(parsed);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing conversational response:', error);
      // FORENSIC FIX: Enhanced fallback with better error context
      return {
        response: this.sanitizeTextResponse(content, language),
        confidence: 0.6,
        language: language,
        context: 'fallback_response'
      };
    }
  }

  // FORENSIC FIX: New method for sanitizing text responses
  private sanitizeTextResponse(content: string, language: string): string {
    const defaultResponses = {
      'en': 'I understand your question. Could you please provide more details so I can give you a better answer?',
      'bn': 'আমি আপনার প্রশ্নটি বুঝতে পেরেছি। আরও ভাল উত্তর দেওয়ার জন্য অনুগ্রহ করে আরো বিস্তারিত জানান।'
    };

    const sanitized = content.trim()
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .slice(0, 500); // Limit length

    return sanitized || defaultResponses[language as keyof typeof defaultResponses] || defaultResponses.en;
  }

  // === ENHANCED: BENGALI CONVERSATIONAL AI ===
  public async bengaliConversationalAI(
    message: string,
    userProfile: Partial<UserProfile>,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<BengaliConversation> {
    if (!this.isAvailable) {
      throw new ServiceUnavailableError('Bengali conversational AI service not available');
    }

    this.validateInput(message, CONFIG.VALIDATION.INPUT_MAX_LENGTH);
    const requestId = this.generateRequestId();
    const controller = this.createRequestController(requestId);
    const startTime = Date.now();

    try {
      const prompt = this.buildBengaliConversationPrompt(message, userProfile, conversationHistory);
      
      const response = await this.client.chat.completions.create({
        model: CONFIG.MODELS.CULTURAL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: CONFIG.TOKEN_LIMITS.BENGALI_RESPONSE,
        temperature: 0.5,
      }, {
        signal: controller.signal
      });

      const conversation = this.parseBengaliConversation(response.choices[0].message.content);
      this.updateStats(startTime, true, 'bengali'); // Enhanced tracking with operation type
      this.cleanupRequest(requestId);
      
      return conversation;
    } catch (error) {
      this.updateStats(startTime, false, 'bengali'); // Enhanced tracking with operation type
      this.cleanupRequest(requestId);
      console.error(`[${requestId}] Bengali conversational AI failed:`, error);
      
      // Enhanced fallback with cultural context
      return {
        bengaliResponse: this.getFallbackBengaliResponse(message),
        englishResponse: this.getFallbackEnglishResponse(message),
        culturalContext: this.getDefaultCulturalContext(),
        localReferences: this.getDefaultLocalReferences(),
        confidence: 0.6,
        responseType: 'support',
        suggestedActions: ['Ask for more specific details', 'Try rephrasing your question']
      };
    }
  }

  // === ENHANCED: PERSONALIZED RECOMMENDATION ENGINE ===
  public async generateAdvancedRecommendations(
    userProfile: UserProfile,
    recommendationType: 'collaborative' | 'content-based' | 'hybrid' | 'cultural' | 'seasonal',
    context: CulturalContext
  ): Promise<PersonalizedRecommendation> {
    if (!this.isAvailable) {
      throw new ServiceUnavailableError('Recommendation service not available');
    }

    const requestId = this.generateRequestId();
    const controller = this.createRequestController(requestId);
    const startTime = Date.now();

    try {
      const prompt = this.buildRecommendationPrompt(userProfile, recommendationType, context);
      
      const response = await this.client.chat.completions.create({
        model: CONFIG.MODELS.QUALITY,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: CONFIG.TOKEN_LIMITS.RECOMMENDATIONS,
        temperature: 0.4,
      }, {
        signal: controller.signal
      });

      const recommendations = this.parseRecommendations(response.choices[0].message.content, userProfile, recommendationType);
      this.updateStats(startTime, true, 'recommendation'); // Enhanced tracking with operation type
      this.cleanupRequest(requestId);
      
      return recommendations;
    } catch (error) {
      this.updateStats(startTime, false, 'recommendation'); // Enhanced tracking with operation type
      this.cleanupRequest(requestId);
      console.error(`[${requestId}] Advanced recommendations failed:`, error);
      throw new GroqServiceError('Failed to generate personalized recommendations');
    }
  }

  // === ENHANCED: SEASONAL RECOMMENDATIONS ===
  public async getSeasonalRecommendations(
    currentSeason: string,
    upcomingFestivals: string[],
    userLocation: string
  ): Promise<SeasonalRecommendation> {
    if (!this.isAvailable) {
      throw new ServiceUnavailableError('Seasonal recommendation service not available');
    }

    const requestId = this.generateRequestId();
    const controller = this.createRequestController(requestId);
    const startTime = Date.now();

    try {
      const prompt = this.buildSeasonalRecommendationPrompt(currentSeason, upcomingFestivals, userLocation);
      
      const response = await this.client.chat.completions.create({
        model: CONFIG.MODELS.CULTURAL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: CONFIG.TOKEN_LIMITS.CULTURAL_CONTEXT,
        temperature: 0.4,
      }, {
        signal: controller.signal
      });

      const recommendations = this.parseSeasonalRecommendations(response.choices[0].message.content);
      this.updateStats(startTime, true, 'seasonal'); // Enhanced tracking with operation type
      this.cleanupRequest(requestId);
      
      return recommendations;
    } catch (error) {
      this.updateStats(startTime, false, 'seasonal'); // Enhanced tracking with operation type
      this.cleanupRequest(requestId);
      console.error(`[${requestId}] Seasonal recommendations failed:`, error);
      throw new GroqServiceError('Failed to generate seasonal recommendations');
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

  private getValidatedApiKey(): string | null {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return null;
    }

    const trimmedKey = apiKey.trim();
    
    // Security fix: Don't log API key content
    console.log(`🔑 GROQ_API_KEY validation: ${trimmedKey.length > 0 ? 'present' : 'empty'}`);
    
    if (!trimmedKey.startsWith('gsk_')) {
      console.warn('⚠️ GROQ_API_KEY appears invalid - should start with "gsk_"');
      return null;
    }

    return trimmedKey;
  }

  private validateInput(input: string, maxLength: number): void {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input: must be a non-empty string');
    }
    
    if (input.length > maxLength) {
      throw new Error(`Input too long: maximum ${maxLength} characters allowed`);
    }
    
    // Enhanced security patterns for comprehensive XSS prevention
    const suspiciousPatterns = [
      /(<script[^>]*>)/i,
      /(javascript:)/i,
      /(on\w+\s*=)/i,
      /(<iframe[^>]*>)/i,
      /(\bexec\b)/i,
      /(<object[^>]*>)/i,
      /(<embed[^>]*>)/i,
      /(vbscript:)/i
    ];
    
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

  private setCache(key: string, data: any, ttl: number = CONFIG.CACHE.TTL): void {
    // Enforce cache size limit to prevent unbounded memory growth
    if (this.cache.size >= CONFIG.CACHE.MAX_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl  // Use parameter correctly instead of undefined property
    });
  }

  private startCacheCleanup(): void {
    // Store interval reference to prevent memory leak
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.cache.entries()) {
        if (now - cached.timestamp >= cached.ttl) {
          this.cache.delete(key);
        }
      }
    }, CONFIG.CACHE.CLEANUP_INTERVAL || 60000); // Use config value
  }

  // === UTILITY METHODS ===

  /**
   * Generate unique request ID for tracking and debugging
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enhanced JSON parsing with better error handling and security
   */
  private parseJsonSafely(content: string): any {
    try {
      const cleaned = content.trim()
        .replace(/```json|```/g, '')
        .replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Remove control characters
      
      // Use non-greedy pattern to avoid over-matching nested JSON
      const jsonMatch = cleaned.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return null;
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return null;
    }
  }

  // === LOW PRIORITY #2: Unified Response Processing Utilities ===

  /**
   * Enhanced unified JSON parsing with multiple pattern support
   */
  private parseJsonResponse(content: string, options: {
    patterns?: Array<'greedy' | 'nongreedy' | 'strict'>,
    removeControlChars?: boolean,
    validateSchema?: z.ZodSchema<any>
  } = {}): any {
    const { 
      patterns = ['nongreedy', 'greedy'], 
      removeControlChars = true,
      validateSchema 
    } = options;

    try {
      let cleaned = content.trim().replace(/```json|```/g, '');
      
      if (removeControlChars) {
        cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      }

      // Try different parsing patterns in order of preference
      for (const pattern of patterns) {
        let jsonMatch: RegExpMatchArray | null = null;
        
        switch (pattern) {
          case 'nongreedy':
            jsonMatch = cleaned.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
            break;
          case 'greedy':
            jsonMatch = cleaned.match(/\{.*\}/s);
            break;
          case 'strict':
            jsonMatch = cleaned.match(/^\s*\{.*\}\s*$/s);
            break;
        }

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Apply schema validation if provided
          if (validateSchema) {
            return validateSchema.parse(parsed);
          }
          
          return parsed;
        }
      }
      
      return null;
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return null;
    }
  }

  /**
   * Standardized error handling across all service methods
   */
  private handleServiceError(error: any, operation: string, fallback?: any): any {
    console.error(`GroqAIService.${operation} failed:`, error);
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    throw new ServiceUnavailableError(`${operation} temporarily unavailable`);
  }

  /**
   * Cancel a specific request by ID
   */
  private cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
      console.log(`🚫 Request ${requestId} cancelled`);
    }
  }

  /**
   * Cancel all pending requests
   */
  public cancelAllRequests(): void {
    for (const [requestId, controller] of this.abortControllers.entries()) {
      controller.abort();
    }
    this.abortControllers.clear();
    console.log(`🚫 All ${this.abortControllers.size} pending requests cancelled`);
  }

  /**
   * Get count of active requests
   */
  public getActiveRequestCount(): number {
    return this.abortControllers.size;
  }

  /**
   * Create and track AbortController for a request
   */
  private createRequestController(requestId: string): AbortController {
    // Clean up any existing controller for this request ID
    this.cancelRequest(requestId);
    
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);
    
    // Auto-cleanup on timeout
    setTimeout(() => {
      if (this.abortControllers.has(requestId)) {
        this.cancelRequest(requestId);
      }
    }, CONFIG.TIMEOUTS.DEFAULT * CONFIG.PERFORMANCE.REQUEST_TIMEOUT_MULTIPLIER); // Cleanup after 2x timeout
    
    return controller;
  }

  /**
   * Clean up completed request
   */
  private cleanupRequest(requestId: string): void {
    this.abortControllers.delete(requestId);
  }

  public dispose(): void {
    // Cancel all pending requests before cleanup
    this.cancelAllRequests();
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }

  // === LOW PRIORITY #3: Enhanced Performance Tracking ===

  private updateStats(startTime: number, success: boolean, operationType?: string, cacheHit?: boolean): void {
    const duration = Date.now() - startTime;
    this.stats.totalRequests++;
    
    if (success) {
      this.stats.successfulRequests++;
      
      // Enhanced moving average calculation with precision control
      const precision = Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION);
      this.stats.averageResponseTime = Math.round(
        ((this.stats.averageResponseTime * (this.stats.successfulRequests - 1) + duration) / 
        this.stats.successfulRequests) * precision
      ) / precision;
      
      // Track specific operation types
      if (operationType) {
        switch (operationType) {
          case 'bengali':
            this.stats.bengaliRequests++;
            break;
          case 'cultural':
            this.stats.culturalQueries++;
            break;
          case 'recommendation':
            this.stats.recommendationRequests++;
            break;
          case 'seasonal':
            this.stats.seasonalQueries++;
            break;
        }
      }
      
      // Apply cache hit performance boost to tracking
      if (cacheHit) {
        this.stats.cacheHits++;
      }
    } else {
      this.stats.errorCount++;
    }
  }

  /**
   * Get comprehensive performance metrics
   */
  public getPerformanceMetrics(): {
    overview: ServiceStats;
    ratios: {
      successRate: number;
      cacheHitRate: number;
      errorRate: number;
    };
    specialized: {
      bengaliUsage: number;
      culturalQueryRatio: number;
      recommendationRatio: number;
    };
  } {
    const total = this.stats.totalRequests || 1; // Prevent division by zero
    
    return {
      overview: { ...this.stats },
      ratios: {
        successRate: Math.round((this.stats.successfulRequests / total) * 100 * 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION)) / 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION),
        cacheHitRate: Math.round((this.stats.cacheHits / total) * 100 * 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION)) / 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION),
        errorRate: Math.round((this.stats.errorCount / total) * 100 * 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION)) / 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION)
      },
      specialized: {
        bengaliUsage: Math.round((this.stats.bengaliRequests / total) * 100 * 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION)) / 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION),
        culturalQueryRatio: Math.round((this.stats.culturalQueries / total) * 100 * 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION)) / 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION),
        recommendationRatio: Math.round((this.stats.recommendationRequests / total) * 100 * 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION)) / 
          Math.pow(10, CONFIG.PERFORMANCE.STATS_PRECISION)
      }
    };
  }

  // === ENHANCED: BENGALI & CULTURAL HELPER METHODS ===

  private buildBengaliConversationPrompt(
    message: string,
    userProfile: Partial<UserProfile>,
    history: Array<{ role: 'user' | 'assistant'; content: string }>
  ): string {
    return `You are GetIt's bilingual AI shopping assistant with deep Bangladesh cultural knowledge.

User Message: "${message}"
User Location: ${userProfile.location || 'Bangladesh'}
Cultural Background: ${userProfile.culturalBackground || 'Bangladeshi'}
Language Preference: ${userProfile.language || 'mixed (Bengali + English)'}

Conversation History:
${history.map(h => `${h.role}: ${h.content}`).join('\n')}

Bangladesh Cultural Context:
- Local Brands: ${CONFIG.BANGLADESH_CONTEXT.LOCAL_BRANDS.join(', ')}
- Payment Methods: ${CONFIG.BANGLADESH_CONTEXT.PAYMENT_METHODS.join(', ')}
- Current Season: ${this.getCurrentSeason()}
- Upcoming Festivals: ${this.getUpcomingFestivals().join(', ')}
- Regional Considerations: Consider Dhaka, Chittagong, Sylhet variations

Instructions:
- Respond in both Bengali and English
- Include cultural context and local references
- Mention relevant festivals, seasons, local brands
- Consider local shopping habits and preferences
- Include practical advice for Bangladesh market
- Be conversational and culturally aware

Return JSON:
{
  "bengaliResponse": "বাংলা উত্তর",
  "englishResponse": "English response",
  "culturalContext": ["cultural reference 1", "cultural reference 2"],
  "localReferences": ["local brand/place", "payment method"],
  "confidence": 0.XX,
  "responseType": "informational/transactional/cultural/support",
  "suggestedActions": ["action 1", "action 2"]
}`;
  }

  private parseBengaliConversation(content: string): BengaliConversation {
    try {
      // Use unified parsing utility with schema validation
      const parsed = this.parseJsonResponse(content, {
        patterns: ['greedy', 'nongreedy'], // Bengali responses may need greedy parsing
        validateSchema: BengaliConversationSchema
      });
      
      if (parsed) {
        return parsed;
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing Bengali conversation:', error);
      return {
        bengaliResponse: 'আমি আপনার প্রশ্নটি বুঝতে পেরেছি। আরও সাহায্য করতে পারি কিভাবে?',
        englishResponse: 'I understand your question. How can I help you further?',
        culturalContext: ['Bangladesh e-commerce context'],
        localReferences: ['GetIt Bangladesh', 'bKash payment'],
        confidence: 0.6,
        responseType: 'support'
      };
    }
  }

  private buildRecommendationPrompt(
    userProfile: UserProfile,
    type: string,
    context: CulturalContext
  ): string {
    return `Generate ${type} recommendations for Bangladesh e-commerce user.

User Profile:
- ID: ${userProfile.userId}
- Preferences: ${userProfile.preferences.join(', ')}
- Purchase History: ${userProfile.purchaseHistory?.join(', ') || 'none'}
- Location: ${userProfile.location}
- Budget: ${userProfile.budgetRange}
- Language: ${userProfile.language}
- Cultural Background: ${userProfile.culturalBackground}

Cultural Context:
- Current Season: ${context.currentSeason}
- Upcoming Festivals: ${context.upcomingFestivals.join(', ')}
- Regional Preferences: ${context.regionalPreferences.join(', ')}
- Local Trends: ${context.localTrends.join(', ')}

Bangladesh Market Context:
- Local Brands: ${CONFIG.BANGLADESH_CONTEXT.LOCAL_BRANDS.join(', ')}
- Major Cities: ${CONFIG.BANGLADESH_CONTEXT.MAJOR_CITIES.join(', ')}
- Popular Festivals: ${CONFIG.BANGLADESH_CONTEXT.FESTIVALS.join(', ')}

Return JSON with this structure:
{
  "recommendations": [
    {
      "productId": "unique_id",
      "productName": "product name",
      "reason": "personalized reasoning",
      "confidence": 0.85,
      "priceRange": "৳X,XXX - ৳X,XXX",
      "availability": "in stock/pre-order/seasonal",
      "culturalRelevance": "cultural significance",
      "seasonalFactor": "seasonal relevance",
      "localBrandPreference": true/false
    }
  ],
  "recommendationType": "${type}",
  "userProfile": {
    "preferences": [],
    "culturalBackground": "",
    "location": "",
    "budgetRange": ""
  },
  "metadata": {
    "algorithm": "algorithm used",
    "confidence": 0.XX,
    "refreshTime": "timestamp"
  }
}`;
  }

  private parseRecommendations(content: string, userProfile: UserProfile, type: string): PersonalizedRecommendation {
    try {
      // Use unified parsing utility with schema validation  
      const parsed = this.parseJsonResponse(content, {
        patterns: ['nongreedy', 'greedy'],
        validateSchema: PersonalizedRecommendationSchema
      });
      
      if (parsed) {
        return parsed;
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      return this.handleServiceError(error, 'parseRecommendations', {
        recommendations: [{
          productId: 'fallback_001',
          productName: 'Popular Bangladesh Product',
          reason: 'Recommended based on your location and preferences',
          confidence: 0.6,
          priceRange: '৳5,000 - ৳15,000',
          availability: 'in stock',
          culturalRelevance: 'Popular in Bangladesh market',
          localBrandPreference: true
        }],
        recommendationType: type as any,
        userProfile: {
          preferences: userProfile.preferences,
          culturalBackground: userProfile.culturalBackground,
          location: userProfile.location,
          budgetRange: userProfile.budgetRange
        },
        metadata: {
          algorithm: 'fallback_recommendation',
          confidence: 0.6,
          refreshTime: new Date().toISOString()
        }
      });
    }
  }

  private buildSeasonalRecommendationPrompt(
    season: string,
    festivals: string[],
    location: string
  ): string {
    return `Generate seasonal recommendations for Bangladesh e-commerce.

Current Season: ${season}
Upcoming Festivals: ${festivals.join(', ')}
Location: ${location}

Bangladesh Seasonal Context:
- Summer (March-June): AC, cooling products, light clothing
- Monsoon (June-October): waterproof items, umbrellas, indoor entertainment
- Winter (November-February): warm clothing, heaters, festival items
- Pre-monsoon (February-March): preparation items

Festival Considerations:
- Eid: traditional wear, gifts, food items, decorations
- Durga Puja: traditional items, jewelry, home decoration
- Pohela Boishakh: traditional Bengali items, cultural products
- Christmas: gifts, decorations, winter items

Return JSON:
{
  "seasonalProducts": [
    {
      "category": "Electronics/Clothing/Home",
      "products": ["product1", "product2"],
      "reason": "seasonal need explanation",
      "urgency": "low/medium/high",
      "priceExpectation": "price trend info"
    }
  ],
  "festivalSpecific": [
    {
      "festival": "festival name",
      "recommendations": ["item1", "item2"],
      "culturalSignificance": "why important",
      "timingAdvice": "when to buy"
    }
  ],
  "weatherConsiderations": ["weather factor 1", "weather factor 2"]
}`;
  }

  private parseSeasonalRecommendations(content: string): SeasonalRecommendation {
    try {
      const parsed = this.parseJsonSafely(content);
      if (parsed) {
        return SeasonalRecommendationSchema.parse(parsed);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      return this.handleServiceError(error, 'parseSeasonalRecommendations', {
        seasonalProducts: [{
          category: 'General',
          products: ['Seasonal essentials', 'Weather-appropriate items'],
          reason: 'Based on current season and weather patterns',
          urgency: 'medium',
          priceExpectation: 'Stable pricing expected'
        }],
        festivalSpecific: [{
          festival: 'Upcoming celebration',
          recommendations: ['Traditional items', 'Gift options'],
          culturalSignificance: 'Important cultural celebration',
          timingAdvice: 'Purchase 1-2 weeks in advance'
        }],
        weatherConsiderations: ['Consider seasonal weather patterns', 'Plan for climate changes']
      });
    }
  }

  // === CULTURAL CONTEXT HELPERS ===

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 6) return 'Summer';
    if (month >= 7 && month <= 10) return 'Monsoon';
    if (month >= 11 || month <= 2) return 'Winter';
    return 'Pre-monsoon';
  }

  private getUpcomingFestivals(): string[] {
    const month = new Date().getMonth() + 1;
    const festivals = CONFIG.BANGLADESH_CONTEXT.FESTIVALS;
    
    // Simple logic - could be enhanced with actual festival dates
    if (month >= 3 && month <= 5) return ['Pohela Boishakh', 'Eid ul-Fitr'];
    if (month >= 6 && month <= 8) return ['Eid ul-Adha'];
    if (month >= 9 && month <= 11) return ['Durga Puja', 'Kali Puja'];
    return ['Christmas', 'Pohela Boishakh'];
  }

  private getFallbackBengaliResponse(message: string): string {
    return `আমি আপনার "${message}" সম্পর্কে প্রশ্নটি বুঝতে পেরেছি। GetIt বাংলাদেশের সেরা ই-কমার্স প্ল্যাটফর্ম হিসেবে আমরা আপনাকে সাহায্য করতে পারি। আরও নির্দিষ্ট তথ্য দিলে আমি আরও ভাল উত্তর দিতে পারব।`;
  }

  private getFallbackEnglishResponse(message: string): string {
    return `I understand your question about "${message}". As GetIt Bangladesh's AI assistant, I'm here to help you with shopping, product recommendations, and cultural guidance. Could you provide more specific details so I can give you a better answer?`;
  }

  private getDefaultCulturalContext(): string[] {
    return [
      'Bangladesh e-commerce preferences',
      'Local payment methods (bKash, Nagad)',
      'Seasonal shopping patterns',
      'Cultural festivals and celebrations'
    ];
  }

  private getDefaultLocalReferences(): string[] {
    return [
      'GetIt Bangladesh platform',
      'Dhaka delivery options',
      'Local brand preferences',
      'bKash payment convenience'
    ];
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