/**
 * PHASE 3: CONVERSATIONAL AI ENGINE
 * Multi-turn conversation capabilities with Bengali language processing
 * Investment: $35,000 | Week 3-4: Conversational AI Evolution
 * Date: July 26, 2025
 */

import { z } from 'zod';
import { aiOrchestrator } from '../ai-orchestration/MultiModelAIOrchestrator';
import { bangladeshCulturalIntelligence } from '../cultural-intelligence/BangladeshCulturalIntelligence';

// Conversation State Interface
interface ConversationState {
  readonly conversationId: string;
  readonly userId: string;
  readonly startTime: number;
  readonly lastActivity: number;
  readonly turnCount: number;
  readonly language: 'bengali' | 'english' | 'mixed';
  readonly context: ConversationContext;
  readonly currentTopic: string;
  readonly userSentiment: 'positive' | 'neutral' | 'negative' | 'confused';
  readonly aiPersonality: 'helpful' | 'friendly' | 'professional' | 'casual';
  readonly conversationFlow: ConversationTurn[];
}

// Conversation Context
interface ConversationContext {
  readonly domain: 'shopping' | 'support' | 'general' | 'cultural' | 'technical';
  readonly intent: string;
  readonly entities: Map<string, any>;
  readonly preferences: UserPreferences;
  readonly constraints: string[];
  readonly goals: string[];
}

// User Preferences
interface UserPreferences {
  readonly communicationStyle: 'formal' | 'casual' | 'mixed';
  readonly responseLength: 'brief' | 'detailed' | 'conversational';
  readonly technicalLevel: 'beginner' | 'intermediate' | 'advanced';
  readonly culturalSensitivity: 'high' | 'medium' | 'low';
  readonly languagePreference: 'bengali' | 'english' | 'mixed';
}

// Conversation Turn
interface ConversationTurn {
  readonly turnId: string;
  readonly timestamp: number;
  readonly userInput: string;
  readonly aiResponse: string;
  readonly intent: string;
  readonly confidence: number;
  readonly followUpQuestions: string[];
  readonly contextCarryover: Record<string, any>;
}

// Intent Recognition
interface Intent {
  readonly name: string;
  readonly confidence: number;
  readonly parameters: Record<string, any>;
  readonly requiredSlots: string[];
  readonly optionalSlots: string[];
}

// Bengali Language Processing
interface BengaliProcessingResult {
  readonly originalText: string;
  readonly transliterated: string;
  readonly englishTranslation: string;
  readonly languageConfidence: number;
  readonly culturalContext: string[];
  readonly formalityLevel: 'very_formal' | 'formal' | 'casual' | 'very_casual';
}

// Follow-up Question Generation
interface FollowUpQuestion {
  readonly question: string;
  readonly questionInBengali: string;
  readonly intent: string;
  readonly priority: 'high' | 'medium' | 'low';
  readonly type: 'clarification' | 'exploration' | 'recommendation' | 'action';
}

export class ConversationalAIEngine {
  private readonly conversations: Map<string, ConversationState>;
  private readonly intentClassifier: Map<string, string[]>;
  private readonly responseTemplates: Map<string, any>;
  private readonly bengaliPatterns: Map<string, RegExp>;

  constructor() {
    this.conversations = new Map();
    this.intentClassifier = new Map();
    this.responseTemplates = new Map();
    this.bengaliPatterns = new Map();
    
    this.initializeIntentClassifier();
    this.initializeResponseTemplates();
    this.initializeBengaliPatterns();
  }

  /**
   * Initialize intent classifier with Bengali and English patterns
   */
  private initializeIntentClassifier(): void {
    const intents = {
      'product_search': [
        'খুঁজছি', 'দরকার', 'চাই', 'কিনতে', 'দেখতে', 'পেতে',
        'search', 'find', 'looking for', 'need', 'want', 'buy', 'purchase'
      ],
      'price_inquiry': [
        'দাম', 'দর', 'টাকা', 'কত', 'মূল্য', 'খরচ',
        'price', 'cost', 'how much', 'expensive', 'cheap', 'rate'
      ],
      'comparison_request': [
        'তুলনা', 'পার্থক্য', 'ভাল', 'খারাপ', 'পছন্দ',
        'compare', 'difference', 'better', 'worse', 'vs', 'versus'
      ],
      'recommendation_request': [
        'সুপারিশ', 'পরামর্শ', 'বল', 'কোনটা', 'সেরা',
        'recommend', 'suggest', 'best', 'which one', 'advice'
      ],
      'support_request': [
        'সমস্যা', 'সাহায্য', 'কিভাবে', 'পারছি না', 'বুঝতে',
        'help', 'problem', 'issue', 'how to', 'support', 'trouble'
      ],
      'cultural_inquiry': [
        'ঐতিহ্য', 'সংস্কৃতি', 'উৎসব', 'পার্বণ', 'বাংলাদেশ',
        'culture', 'tradition', 'festival', 'bangladesh', 'local'
      ],
      'greeting': [
        'হ্যালো', 'হাই', 'সালাম', 'নমস্কার', 'আদাব',
        'hello', 'hi', 'salaam', 'namaste', 'greetings'
      ],
      'farewell': [
        'বিদায়', 'যাই', 'ধন্যবাদ', 'আল্লাফেজ',
        'goodbye', 'bye', 'thanks', 'thank you', 'farewell'
      ]
    };

    for (const [intent, patterns] of Object.entries(intents)) {
      this.intentClassifier.set(intent, patterns);
    }
  }

  /**
   * Initialize response templates for different scenarios
   */
  private initializeResponseTemplates(): void {
    const templates = {
      greeting: {
        bengali: ['নমস্কার! আপনি কিভাবে সাহায্য চেয়েছেন?', 'হ্যালো! আমি আপনাকে কিভাবে সাহায্য করতে পারি?'],
        english: ['Hello! How can I help you today?', 'Hi! What can I assist you with?']
      },
      product_not_found: {
        bengali: ['দুঃখিত, আমি এই পণ্যটি খুঁজে পাইনি। আপনি কি অন্য কিছু চেষ্টা করতে চান?'],
        english: ['Sorry, I couldn\'t find that product. Would you like to try something else?']
      },
      clarification_needed: {
        bengali: ['আপনি কি আরও বিস্তারিত বলতে পারেন?', 'আমি ভালভাবে বুঝতে পারিনি। আপনি কি আরও স্পষ্ট করতে পারেন?'],
        english: ['Could you provide more details?', 'I didn\'t quite understand. Could you clarify?']
      },
      cultural_context: {
        bengali: ['বাংলাদেশের প্রেক্ষাপটে, আমি এই সুপারিশ করব...'],
        english: ['In the context of Bangladesh, I would recommend...']
      }
    };

    for (const [category, langs] of Object.entries(templates)) {
      this.responseTemplates.set(category, langs);
    }
  }

  /**
   * Initialize Bengali language patterns
   */
  private initializeBengaliPatterns(): void {
    const patterns = {
      bengali_text: /[\u0980-\u09FF]+/g,
      question_words: /^(কি|কে|কেন|কিভাবে|কোথায়|কখন|কত|কোন)/,
      formal_address: /(আপনি|আপনার|আপনাকে)/g,
      informal_address: /(তুমি|তোমার|তোমাকে)/g,
      price_mention: /(টাকা|দাম|মূল্য|দর)/,
      location_mention: /(ঢাকা|চট্টগ্রাম|সিলেট|রাজশাহী|খুলনা|বরিশাল|রংপুর)/
    };

    for (const [name, pattern] of Object.entries(patterns)) {
      this.bengaliPatterns.set(name, pattern);
    }
  }

  /**
   * Start a new conversation
   */
  async startConversation(
    userId: string,
    initialMessage: string,
    preferences: UserPreferences = {
      communicationStyle: 'friendly',
      responseLength: 'conversational',
      technicalLevel: 'intermediate',
      culturalSensitivity: 'high',
      languagePreference: 'mixed'
    }
  ): Promise<ConversationState> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Process initial message
    const bengaliProcessing = this.processBengaliText(initialMessage);
    const intent = this.classifyIntent(initialMessage);
    
    // Create conversation context
    const context: ConversationContext = {
      domain: this.determineDomain(intent.name),
      intent: intent.name,
      entities: new Map(),
      preferences,
      constraints: [],
      goals: []
    };

    // Create conversation state
    const conversation: ConversationState = {
      conversationId,
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      turnCount: 0,
      language: bengaliProcessing.languageConfidence > 0.5 ? 'bengali' : 'english',
      context,
      currentTopic: intent.name,
      userSentiment: 'neutral',
      aiPersonality: preferences.communicationStyle === 'formal' ? 'professional' : 'friendly',
      conversationFlow: []
    };

    this.conversations.set(conversationId, conversation);
    return conversation;
  }

  /**
   * Continue conversation with new user input
   */
  async continueConversation(
    conversationId: string,
    userInput: string
  ): Promise<{
    response: string;
    followUpQuestions: FollowUpQuestion[];
    conversationState: ConversationState;
  }> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Process user input
    const bengaliProcessing = this.processBengaliText(userInput);
    const intent = this.classifyIntent(userInput);
    const sentiment = this.analyzeSentiment(userInput);

    // Update conversation context
    const updatedContext = this.updateContext(conversation.context, intent, userInput);
    
    // Generate contextual response using AI orchestrator
    const aiResponse = await aiOrchestrator.processQuery({
      query: userInput,
      userId: conversation.userId,
      location: await this.getUserLocation(conversation.userId),
      language: conversation.language,
      queryType: this.mapIntentToQueryType(intent.name),
      complexity: this.assessComplexity(userInput, conversation),
      urgency: this.assessUrgency(userInput, sentiment),
      previousConversation: conversation.conversationFlow.map(turn => ({
        id: turn.turnId,
        timestamp: turn.timestamp,
        userMessage: turn.userInput,
        aiResponse: turn.aiResponse,
        model: 'conversational',
        context: turn.contextCarryover
      })),
      userProfile: await this.buildUserProfile(conversation.userId)
    });

    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(
      userInput,
      aiResponse.response,
      intent,
      conversation
    );

    // Create conversation turn
    const turn: ConversationTurn = {
      turnId: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      userInput,
      aiResponse: aiResponse.response,
      intent: intent.name,
      confidence: intent.confidence,
      followUpQuestions: followUpQuestions.map(q => q.question),
      contextCarryover: {
        intent: intent.name,
        entities: Object.fromEntries(updatedContext.entities),
        sentiment,
        language: conversation.language
      }
    };

    // Update conversation state
    const updatedConversation: ConversationState = {
      ...conversation,
      lastActivity: Date.now(),
      turnCount: conversation.turnCount + 1,
      context: updatedContext,
      currentTopic: intent.name,
      userSentiment: sentiment,
      conversationFlow: [...conversation.conversationFlow, turn].slice(-10) // Keep last 10 turns
    };

    this.conversations.set(conversationId, updatedConversation);

    return {
      response: aiResponse.response,
      followUpQuestions,
      conversationState: updatedConversation
    };
  }

  /**
   * Process Bengali text with transliteration and cultural context
   */
  private processBengaliText(text: string): BengaliProcessingResult {
    const bengaliPattern = this.bengaliPatterns.get('bengali_text')!;
    const bengaliMatches = text.match(bengaliPattern) || [];
    const bengaliTextRatio = bengaliMatches.join('').length / text.length;

    // Simple transliteration mapping (in production, use proper library)
    const transliterationMap = {
      'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
      'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
      'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
      'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
      'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
      'য': 'y', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 's',
      'স': 's', 'হ': 'h', 'া': 'a', 'ি': 'i', 'ী': 'i',
      'ু': 'u', 'ূ': 'u', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou'
    };

    let transliterated = text;
    for (const [bengali, roman] of Object.entries(transliterationMap)) {
      transliterated = transliterated.replace(new RegExp(bengali, 'g'), roman);
    }

    // Detect formality level
    const formalPattern = this.bengaliPatterns.get('formal_address');
    const informalPattern = this.bengaliPatterns.get('informal_address');
    
    let formalityLevel: 'very_formal' | 'formal' | 'casual' | 'very_casual' = 'casual';
    if (formalPattern && formalPattern.test(text)) {
      formalityLevel = 'formal';
    } else if (informalPattern && informalPattern.test(text)) {
      formalityLevel = 'very_casual';
    }

    // Extract cultural context
    const culturalContext: string[] = [];
    if (this.bengaliPatterns.get('location_mention')?.test(text)) {
      culturalContext.push('location_specific');
    }
    if (this.bengaliPatterns.get('price_mention')?.test(text)) {
      culturalContext.push('price_sensitive');
    }

    return {
      originalText: text,
      transliterated,
      englishTranslation: this.translateToEnglish(text), // Simplified translation
      languageConfidence: bengaliTextRatio,
      culturalContext,
      formalityLevel
    };
  }

  /**
   * Classify user intent using pattern matching and ML
   */
  private classifyIntent(text: string): Intent {
    const textLower = text.toLowerCase();
    let bestMatch = { intent: 'general', confidence: 0.0 };

    for (const [intent, patterns] of this.intentClassifier) {
      let matchCount = 0;
      let totalPatterns = patterns.length;

      for (const pattern of patterns) {
        if (textLower.includes(pattern.toLowerCase())) {
          matchCount++;
        }
      }

      const confidence = matchCount / totalPatterns;
      if (confidence > bestMatch.confidence) {
        bestMatch = { intent, confidence };
      }
    }

    return {
      name: bestMatch.intent,
      confidence: bestMatch.confidence,
      parameters: this.extractParameters(text, bestMatch.intent),
      requiredSlots: this.getRequiredSlots(bestMatch.intent),
      optionalSlots: this.getOptionalSlots(bestMatch.intent)
    };
  }

  /**
   * Analyze user sentiment
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' | 'confused' {
    const positiveWords = ['ভাল', 'চমৎকার', 'দারুণ', 'perfect', 'great', 'excellent', 'good'];
    const negativeWords = ['খারাপ', 'সমস্যা', 'wrong', 'bad', 'terrible', 'problem', 'issue'];
    const confusedWords = ['বুঝতে', 'জানি না', 'confused', 'unclear', 'don\'t understand'];

    const textLower = text.toLowerCase();
    
    if (confusedWords.some(word => textLower.includes(word))) return 'confused';
    if (positiveWords.some(word => textLower.includes(word))) return 'positive';
    if (negativeWords.some(word => textLower.includes(word))) return 'negative';
    
    return 'neutral';
  }

  /**
   * Generate contextual follow-up questions
   */
  private generateFollowUpQuestions(
    userInput: string,
    aiResponse: string,
    intent: Intent,
    conversation: ConversationState
  ): FollowUpQuestion[] {
    const followUps: FollowUpQuestion[] = [];

    switch (intent.name) {
      case 'product_search':
        followUps.push({
          question: 'What is your budget range for this product?',
          questionInBengali: 'এই পণ্যের জন্য আপনার বাজেট কত?',
          intent: 'price_inquiry',
          priority: 'high',
          type: 'clarification'
        });
        followUps.push({
          question: 'Are you looking for any specific brand?',
          questionInBengali: 'আপনি কি কোন নির্দিষ্ট ব্র্যান্ড খুঁজছেন?',
          intent: 'brand_preference',
          priority: 'medium',
          type: 'exploration'
        });
        break;

      case 'price_inquiry':
        followUps.push({
          question: 'Would you like to see products in a different price range?',
          questionInBengali: 'আপনি কি অন্য দামের পণ্য দেখতে চান?',
          intent: 'alternative_search',
          priority: 'medium',
          type: 'recommendation'
        });
        break;

      case 'comparison_request':
        followUps.push({
          question: 'What features are most important to you?',
          questionInBengali: 'কোন বৈশিষ্ট্যগুলো আপনার কাছে সবচেয়ে গুরুত্বপূর্ণ?',
          intent: 'feature_priority',
          priority: 'high',
          type: 'clarification'
        });
        break;

      case 'support_request':
        followUps.push({
          question: 'Can you describe the specific issue you\'re facing?',
          questionInBengali: 'আপনি কি নির্দিষ্ট সমস্যাটি বর্ণনা করতে পারেন?',
          intent: 'problem_description',
          priority: 'high',
          type: 'clarification'
        });
        break;
    }

    // Add cultural context follow-ups
    if (conversation.language === 'bengali') {
      followUps.push({
        question: 'Would you like recommendations based on local preferences?',
        questionInBengali: 'আপনি কি স্থানীয় পছন্দের ভিত্তিতে সুপারিশ চান?',
        intent: 'cultural_preference',
        priority: 'medium',
        type: 'recommendation'
      });
    }

    return followUps.slice(0, 3); // Return top 3 follow-ups
  }

  /**
   * Update conversation context with new information
   */
  private updateContext(
    currentContext: ConversationContext,
    intent: Intent,
    userInput: string
  ): ConversationContext {
    const updatedEntities = new Map(currentContext.entities);
    
    // Extract and update entities based on intent
    const parameters = intent.parameters;
    for (const [key, value] of Object.entries(parameters)) {
      updatedEntities.set(key, value);
    }

    return {
      ...currentContext,
      intent: intent.name,
      entities: updatedEntities
    };
  }

  /**
   * Helper methods for conversation management
   */
  private translateToEnglish(bengaliText: string): string {
    // Simplified translation - in production, use proper translation service
    const commonTranslations = {
      'নমস্কার': 'Hello',
      'ধন্যবাদ': 'Thank you',
      'দাম': 'price',
      'কত': 'how much',
      'ভাল': 'good',
      'খারাপ': 'bad',
      'পণ্য': 'product',
      'কিনতে': 'to buy',
      'চাই': 'want'
    };

    let translation = bengaliText;
    for (const [bengali, english] of Object.entries(commonTranslations)) {
      translation = translation.replace(new RegExp(bengali, 'g'), english);
    }

    return translation;
  }

  private extractParameters(text: string, intent: string): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    // Extract common parameters based on intent
    switch (intent) {
      case 'product_search':
        const productMatch = text.match(/(laptop|phone|mobile|computer|camera)/i);
        if (productMatch) parameters.product_type = productMatch[1];
        break;
        
      case 'price_inquiry':
        const priceMatch = text.match(/(\d+)/);
        if (priceMatch) parameters.price_mentioned = parseInt(priceMatch[1]);
        break;
    }

    return parameters;
  }

  private getRequiredSlots(intent: string): string[] {
    const slots = {
      'product_search': ['product_type'],
      'price_inquiry': ['product_reference'],
      'comparison_request': ['products_to_compare'],
      'support_request': ['issue_type']
    };
    
    return slots[intent] || [];
  }

  private getOptionalSlots(intent: string): string[] {
    const slots = {
      'product_search': ['brand', 'budget', 'features'],
      'price_inquiry': ['budget_range'],
      'comparison_request': ['comparison_criteria'],
      'support_request': ['urgency_level']
    };
    
    return slots[intent] || [];
  }

  private determineDomain(intent: string): 'shopping' | 'support' | 'general' | 'cultural' | 'technical' {
    const domainMap = {
      'product_search': 'shopping',
      'price_inquiry': 'shopping',
      'comparison_request': 'shopping',
      'recommendation_request': 'shopping',
      'support_request': 'support',
      'cultural_inquiry': 'cultural',
      'greeting': 'general',
      'farewell': 'general'
    };
    
    return domainMap[intent] || 'general';
  }

  private mapIntentToQueryType(intent: string): 'product_search' | 'cultural_context' | 'technical_support' | 'conversational' | 'recommendation' {
    const mapping = {
      'product_search': 'product_search',
      'cultural_inquiry': 'cultural_context',
      'support_request': 'technical_support',
      'recommendation_request': 'recommendation'
    };
    
    return mapping[intent] || 'conversational';
  }

  private assessComplexity(userInput: string, conversation: ConversationState): 'simple' | 'medium' | 'complex' {
    const wordCount = userInput.split(' ').length;
    const hasMultipleIntents = userInput.includes(' and ') || userInput.includes(' or ');
    const hasComparisons = userInput.includes('vs') || userInput.includes('compare');
    
    if (wordCount > 20 || hasMultipleIntents || hasComparisons) return 'complex';
    if (wordCount > 10 || conversation.turnCount > 5) return 'medium';
    return 'simple';
  }

  private assessUrgency(userInput: string, sentiment: string): 'low' | 'medium' | 'high' | 'critical' {
    const urgentWords = ['urgent', 'emergency', 'immediately', 'asap', 'critical'];
    const textLower = userInput.toLowerCase();
    
    if (urgentWords.some(word => textLower.includes(word))) return 'critical';
    if (sentiment === 'negative') return 'high';
    if (sentiment === 'confused') return 'medium';
    return 'low';
  }

  private async getUserLocation(userId: string): Promise<string> {
    // In production, get from user profile or IP geolocation
    return 'Dhaka';
  }

  private async buildUserProfile(userId: string): Promise<any> {
    // In production, build comprehensive user profile
    return {
      id: userId,
      demographics: { age: 30, location: 'Dhaka', district: 'Dhaka', preferences: [] },
      behaviorData: { searchHistory: [], purchaseHistory: [], interactionPatterns: {} },
      culturalContext: { festivals: [], seasonalPreferences: [], languagePreference: 'mixed' }
    };
  }

  /**
   * Get conversation history
   */
  getConversation(conversationId: string): ConversationState | null {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * End conversation
   */
  endConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(): {
    totalConversations: number;
    activeConversations: number;
    averageTurns: number;
    languageDistribution: Record<string, number>;
  } {
    const conversations = Array.from(this.conversations.values());
    const activeThreshold = Date.now() - (30 * 60 * 1000); // 30 minutes
    
    const activeConversations = conversations.filter(c => c.lastActivity > activeThreshold);
    const totalTurns = conversations.reduce((sum, c) => sum + c.turnCount, 0);
    
    const languageDistribution = conversations.reduce((dist, c) => {
      dist[c.language] = (dist[c.language] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    return {
      totalConversations: conversations.length,
      activeConversations: activeConversations.length,
      averageTurns: conversations.length > 0 ? totalTurns / conversations.length : 0,
      languageDistribution
    };
  }
}

// Export singleton instance
export const conversationalAIEngine = new ConversationalAIEngine();