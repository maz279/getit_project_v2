/**
 * Phase 3 Conversational Service - Frontend Integration
 * Advanced AI assistant client with Bangladesh expertise
 * Implementation Date: July 20, 2025
 */

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    bangladeshInsights?: any;
    suggestedActions?: string[];
  };
}

interface ConversationContext {
  userId?: string;
  sessionId?: string;
  language: 'en' | 'bn';
  conversationHistory: ConversationMessage[];
  userPreferences?: {
    paymentMethods?: string[];
    deliveryZone?: string;
    preferredBrands?: string[];
    culturalContext?: string;
  };
}

interface ConversationResponse {
  response: string;
  intent: string;
  confidence: number;
  suggestedActions: string[];
  contextUpdates: any;
  bangladeshInsights: any;
  sessionId: string;
}

interface InternetSearchResult {
  results: any[];
  summary: any;
  priceComparison: any;
  competitorAnalysis: any;
  specifications?: any;
  reviews?: any;
  trends?: any;
}

interface BangladeshExpertise {
  expertise: any;
  recommendations: any[];
  culturalContext: any;
  localInsights: any;
  trustFactors: any;
}

export class Phase3ConversationalService {
  private static instance: Phase3ConversationalService;
  private baseUrl = '/api/ai';
  private conversationContext: ConversationContext;

  private constructor() {
    this.conversationContext = {
      language: 'en',
      conversationHistory: [],
      sessionId: this.generateSessionId()
    };
  }

  public static getInstance(): Phase3ConversationalService {
    if (!Phase3ConversationalService.instance) {
      Phase3ConversationalService.instance = new Phase3ConversationalService();
    }
    return Phase3ConversationalService.instance;
  }

  /**
   * Send a message to the conversational AI
   */
  async sendMessage(
    message: string, 
    options?: {
      language?: 'en' | 'bn';
      userPreferences?: any;
      resetContext?: boolean;
    }
  ): Promise<ConversationResponse> {
    try {
      if (options?.resetContext) {
        this.resetConversation();
      }

      if (options?.language) {
        this.conversationContext.language = options.language;
      }

      if (options?.userPreferences) {
        this.conversationContext.userPreferences = options.userPreferences;
      }

      // Add user message to history
      const userMessage: ConversationMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      this.conversationContext.conversationHistory.push(userMessage);

      const response = await fetch(`${this.baseUrl}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: this.conversationContext
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Add assistant message to history
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date().toISOString(),
          metadata: {
            intent: result.data.intent,
            confidence: result.data.confidence,
            bangladeshInsights: result.data.bangladeshInsights,
            suggestedActions: result.data.suggestedActions
          }
        };
        this.conversationContext.conversationHistory.push(assistantMessage);

        // Update session ID
        this.conversationContext.sessionId = result.data.sessionId;

        return result.data;
      } else {
        throw new Error(result.error || 'Failed to process conversation');
      }

    } catch (error) {
      console.error('Phase 3 Conversation error:', error);
      throw error;
    }
  }

  /**
   * Perform internet search for competitive analysis and external data
   */
  async searchInternet(
    query: string,
    searchType: 'shopping' | 'specifications' | 'reviews' | 'competitive' = 'shopping',
    context?: {
      productCategory?: string;
      priceRange?: { min: number; max: number };
      location?: string;
    }
  ): Promise<InternetSearchResult> {
    try {
      const response = await fetch(`${this.baseUrl}/internet-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          searchType,
          context: {
            location: 'Bangladesh',
            ...context
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to perform internet search');
      }

    } catch (error) {
      console.error('Internet search error:', error);
      throw error;
    }
  }

  /**
   * Get Bangladesh-specific expertise and cultural insights
   */
  async getBangladeshExpertise(
    query: string,
    expertiseType: 'brands' | 'cultural' | 'payments' | 'delivery' | 'festivals' = 'brands',
    context?: {
      location?: string;
      timeframe?: string;
    }
  ): Promise<BangladeshExpertise> {
    try {
      const response = await fetch(`${this.baseUrl}/bangladesh-expertise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          expertiseType,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to get Bangladesh expertise');
      }

    } catch (error) {
      console.error('Bangladesh expertise error:', error);
      throw error;
    }
  }

  /**
   * Get AI conversation capabilities
   */
  async getCapabilities(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/conversation/capabilities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to get capabilities');
      }

    } catch (error) {
      console.error('Capabilities error:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ConversationMessage[] {
    return this.conversationContext.conversationHistory;
  }

  /**
   * Get current conversation context
   */
  getConversationContext(): ConversationContext {
    return { ...this.conversationContext };
  }

  /**
   * Set user preferences
   */
  setUserPreferences(preferences: any): void {
    this.conversationContext.userPreferences = {
      ...this.conversationContext.userPreferences,
      ...preferences
    };
  }

  /**
   * Switch language
   */
  setLanguage(language: 'en' | 'bn'): void {
    this.conversationContext.language = language;
  }

  /**
   * Reset conversation context
   */
  resetConversation(): void {
    this.conversationContext = {
      language: this.conversationContext.language,
      conversationHistory: [],
      sessionId: this.generateSessionId(),
      userPreferences: this.conversationContext.userPreferences
    };
  }

  /**
   * Get suggested actions from last conversation
   */
  getLastSuggestedActions(): string[] {
    const lastMessage = this.conversationContext.conversationHistory
      .filter(msg => msg.role === 'assistant')
      .pop();
    
    return lastMessage?.metadata?.suggestedActions || [];
  }

  /**
   * Get Bangladesh insights from last conversation
   */
  getLastBangladeshInsights(): any {
    const lastMessage = this.conversationContext.conversationHistory
      .filter(msg => msg.role === 'assistant')
      .pop();
    
    return lastMessage?.metadata?.bangladeshInsights || {};
  }

  /**
   * Check if conversation has context
   */
  hasConversationHistory(): boolean {
    return this.conversationContext.conversationHistory.length > 0;
  }

  /**
   * Export conversation history for analysis
   */
  exportConversationHistory(): string {
    return JSON.stringify({
      context: this.conversationContext,
      exportedAt: new Date().toISOString(),
      version: '3.0.0'
    }, null, 2);
  }

  /**
   * Import conversation history
   */
  importConversationHistory(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      if (data.context && data.context.conversationHistory) {
        this.conversationContext = data.context;
      }
    } catch (error) {
      console.error('Failed to import conversation history:', error);
      throw new Error('Invalid conversation history format');
    }
  }

  private generateSessionId(): string {
    return `phase3_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enhanced message processing with context awareness
   */
  async processMessageWithContext(
    message: string,
    contextHints?: {
      isProductInquiry?: boolean;
      isPriceComparison?: boolean;
      isDeliveryQuestion?: boolean;
      isPaymentHelp?: boolean;
      isCulturalQuery?: boolean;
    }
  ): Promise<{
    conversationResponse: ConversationResponse;
    relatedData?: {
      internetSearch?: InternetSearchResult;
      bangladeshExpertise?: BangladeshExpertise;
    };
  }> {
    try {
      // First get the conversation response
      const conversationResponse = await this.sendMessage(message);

      // Based on intent and context hints, fetch related data
      const relatedData: any = {};

      // If it's a product inquiry or price comparison, perform internet search
      if (contextHints?.isProductInquiry || contextHints?.isPriceComparison || 
          conversationResponse.intent === 'product_search' || conversationResponse.intent === 'price_inquiry') {
        
        try {
          const searchType = contextHints?.isPriceComparison ? 'shopping' : 'competitive';
          relatedData.internetSearch = await this.searchInternet(message, searchType);
        } catch (error) {
          console.warn('Internet search failed:', error);
        }
      }

      // If it's cultural, payment, or delivery related, get Bangladesh expertise
      if (contextHints?.isCulturalQuery || contextHints?.isPaymentHelp || contextHints?.isDeliveryQuestion ||
          ['cultural_inquiry', 'payment_help', 'delivery_inquiry'].includes(conversationResponse.intent)) {
        
        try {
          let expertiseType: 'brands' | 'cultural' | 'payments' | 'delivery' | 'festivals' = 'brands';
          
          if (contextHints?.isCulturalQuery || conversationResponse.intent === 'cultural_inquiry') {
            expertiseType = 'cultural';
          } else if (contextHints?.isPaymentHelp || conversationResponse.intent === 'payment_help') {
            expertiseType = 'payments';
          } else if (contextHints?.isDeliveryQuestion) {
            expertiseType = 'delivery';
          }

          relatedData.bangladeshExpertise = await this.getBangladeshExpertise(message, expertiseType);
        } catch (error) {
          console.warn('Bangladesh expertise failed:', error);
        }
      }

      return {
        conversationResponse,
        relatedData: Object.keys(relatedData).length > 0 ? relatedData : undefined
      };

    } catch (error) {
      console.error('Enhanced message processing error:', error);
      throw error;
    }
  }
}