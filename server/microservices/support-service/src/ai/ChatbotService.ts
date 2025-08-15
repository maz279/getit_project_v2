/**
 * AI Chatbot Service - Amazon.com/Shopee.sg Level
 * Intelligent NLP-powered chatbot with Bangladesh cultural context
 */

import { db } from '../../../../db';
import { 
  chatbotConversations, 
  knowledgeBaseArticles, 
  supportTickets,
  users,
  insertChatbotConversationSchema
} from '../../../../../shared/schema';
import { eq, ilike, desc, and, gte, lte } from 'drizzle-orm';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface ChatbotResponse {
  response: string;
  responseBn?: string;
  intent: string;
  confidence: number;
  actions?: string[];
  escalateToHuman?: boolean;
  relatedArticles?: any[];
}

export class ChatbotService {
  /**
   * Process user message and generate intelligent response
   */
  static async processMessage(
    userId: number | null,
    sessionId: string,
    message: string,
    language: string = 'en'
  ): Promise<ChatbotResponse> {
    try {
      // Load conversation history
      const conversation = await ChatbotService.getConversationHistory(sessionId);
      
      // Analyze user intent
      const intent = await ChatbotService.analyzeIntent(message, language);
      
      // Generate appropriate response based on intent
      const response = await ChatbotService.generateResponse(
        message,
        intent,
        language,
        conversation,
        userId
      );
      
      // Save conversation
      await ChatbotService.saveConversation(
        sessionId,
        userId,
        message,
        response,
        language
      );
      
      return response;
      
    } catch (error) {
      console.error('Error processing chatbot message:', error);
      return {
        response: 'I apologize, but I\'m experiencing technical difficulties. Please try again or contact our support team.',
        responseBn: 'আমি দুঃখিত, কিন্তু আমি প্রযুক্তিগত সমস্যার সম্মুখীন হচ্ছি। অনুগ্রহ করে আবার চেষ্টা করুন অথবা আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।',
        intent: 'error',
        confidence: 1.0,
        escalateToHuman: true
      };
    }
  }
  
  /**
   * Analyze user intent using NLP
   */
  private static async analyzeIntent(message: string, language: string): Promise<{
    intent: string;
    confidence: number;
    entities: any[];
  }> {
    const normalizedMessage = message.toLowerCase();
    
    // Intent patterns (in production, use advanced NLP libraries like compromise or natural)
    const intentPatterns = {
      // Order-related intents
      order_status: [
        'order status', 'track order', 'where is my order', 'delivery status',
        'আমার অর্ডার', 'অর্ডার স্ট্যাটাস', 'ডেলিভারি', 'অর্ডার কোথায়'
      ],
      order_cancel: [
        'cancel order', 'cancel my order', 'stop delivery',
        'অর্ডার বাতিল', 'অর্ডার ক্যান্সেল', 'ডেলিভারি বন্ধ'
      ],
      order_return: [
        'return product', 'refund', 'exchange', 'money back',
        'পণ্য ফেরত', 'রিফান্ড', 'টাকা ফেরত', 'এক্সচেঞ্জ'
      ],
      
      // Payment-related intents
      payment_issue: [
        'payment failed', 'payment problem', 'bkash issue', 'nagad problem', 'rocket payment',
        'পেমেন্ট সমস্যা', 'বিকাশ সমস্যা', 'নগদ সমস্যা', 'রকেট পেমেন্ট'
      ],
      payment_methods: [
        'payment options', 'how to pay', 'payment methods', 'bkash', 'nagad', 'rocket',
        'পেমেন্ট অপশন', 'কিভাবে পেমেন্ট', 'বিকাশ', 'নগদ', 'রকেট'
      ],
      
      // Shipping-related intents
      shipping_info: [
        'delivery time', 'shipping cost', 'delivery area', 'courier',
        'ডেলিভারি সময়', 'শিপিং কস্ট', 'ডেলিভারি এলাকা', 'কুরিয়ার'
      ],
      
      // Product-related intents
      product_inquiry: [
        'product information', 'product details', 'specifications', 'availability',
        'পণ্যের তথ্য', 'পণ্যের বিবরণ', 'স্পেসিফিকেশন', 'পাওয়া যাচ্ছে'
      ],
      
      // Account-related intents
      account_issue: [
        'account problem', 'login issue', 'password reset', 'profile update',
        'একাউন্ট সমস্যা', 'লগইন সমস্যা', 'পাসওয়ার্ড রিসেট', 'প্রোফাইল আপডেট'
      ],
      
      // General intents
      greeting: [
        'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
        'হ্যালো', 'হাই', 'সালাম', 'আসসালামু আলাইকুম', 'শুভ সকাল', 'শুভ বিকাল'
      ],
      thanks: [
        'thank you', 'thanks', 'appreciate', 'grateful',
        'ধন্যবাদ', 'শুকরিয়া', 'কৃতজ্ঞ'
      ],
      human_agent: [
        'talk to human', 'speak to agent', 'human support', 'live chat',
        'মানুষের সাথে কথা', 'এজেন্টের সাথে কথা', 'লাইভ চ্যাট'
      ]
    };
    
    // Simple pattern matching (in production, use ML-based intent classification)
    let bestMatch = { intent: 'general_inquiry', confidence: 0.3 };
    
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        if (normalizedMessage.includes(pattern)) {
          const confidence = pattern.length / normalizedMessage.length;
          if (confidence > bestMatch.confidence) {
            bestMatch = { intent, confidence: Math.min(confidence * 2, 0.95) };
          }
        }
      }
    }
    
    // Extract entities (simplified)
    const entities = ChatbotService.extractEntities(message);
    
    return {
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      entities
    };
  }
  
  /**
   * Generate appropriate response based on intent
   */
  private static async generateResponse(
    message: string,
    intent: any,
    language: string,
    conversationHistory: ChatMessage[],
    userId: number | null
  ): Promise<ChatbotResponse> {
    const { intent: intentType, confidence, entities } = intent;
    
    // If confidence is low, search knowledge base
    if (confidence < 0.6) {
      return await ChatbotService.searchKnowledgeBase(message, language);
    }
    
    // Generate response based on intent
    switch (intentType) {
      case 'greeting':
        return ChatbotService.generateGreetingResponse(language);
        
      case 'order_status':
        return await ChatbotService.handleOrderStatusInquiry(entities, language, userId);
        
      case 'payment_issue':
        return ChatbotService.handlePaymentIssue(entities, language);
        
      case 'payment_methods':
        return ChatbotService.handlePaymentMethodsInquiry(language);
        
      case 'shipping_info':
        return ChatbotService.handleShippingInquiry(language);
        
      case 'product_inquiry':
        return await ChatbotService.handleProductInquiry(entities, language);
        
      case 'account_issue':
        return ChatbotService.handleAccountIssue(language);
        
      case 'human_agent':
        return ChatbotService.handleHumanAgentRequest(language);
        
      case 'thanks':
        return ChatbotService.generateThanksResponse(language);
        
      default:
        return await ChatbotService.searchKnowledgeBase(message, language);
    }
  }
  
  /**
   * Search knowledge base for relevant articles
   */
  private static async searchKnowledgeBase(query: string, language: string): Promise<ChatbotResponse> {
    const articles = await db.select({
      id: knowledgeBaseArticles.id,
      title: knowledgeBaseArticles.title,
      titleBn: knowledgeBaseArticles.titleBn,
      summary: knowledgeBaseArticles.summary,
      slug: knowledgeBaseArticles.slug
    })
    .from(knowledgeBaseArticles)
    .where(and(
      eq(knowledgeBaseArticles.status, 'published'),
      ilike(knowledgeBaseArticles.content, `%${query}%`)
    ))
    .orderBy(desc(knowledgeBaseArticles.viewCount))
    .limit(3);
    
    if (articles.length > 0) {
      const response = language === 'bn' 
        ? `আমি আপনার প্রশ্নের সাথে সম্পর্কিত কিছু সহায়ক আর্টিকেল পেয়েছি:`
        : `I found some helpful articles related to your question:`;
        
      return {
        response,
        intent: 'knowledge_base_search',
        confidence: 0.8,
        relatedArticles: articles,
        actions: ['show_articles']
      };
    }
    
    return {
      response: language === 'bn' 
        ? 'আমি আপনার প্রশ্নটি সম্পূর্ণ বুঝতে পারিনি। আপনি কি আরো বিস্তারিত বলতে পারেন? অথবা আমাদের সাপোর্ট এজেন্টের সাথে কথা বলতে চান?'
        : 'I didn\'t fully understand your question. Could you provide more details? Or would you like to speak with our support agent?',
      intent: 'clarification_needed',
      confidence: 0.5,
      actions: ['request_clarification', 'offer_human_agent']
    };
  }
  
  // Response generators for different intents
  private static generateGreetingResponse(language: string): ChatbotResponse {
    const responses = {
      en: [
        'Hello! Welcome to GetIt Bangladesh. How can I help you today?',
        'Hi there! I\'m here to assist you with your shopping needs. What can I do for you?',
        'Welcome! I\'m your virtual assistant. How may I help you?'
      ],
      bn: [
        'হ্যালো! গেট ইট বাংলাদেশে আপনাকে স্বাগতম। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
        'আসসালামু আলাইকুম! আমি আপনার কেনাকাটার প্রয়োজনে সাহায্য করতে এখানে আছি। আমি আপনার জন্য কী করতে পারি?',
        'স্বাগতম! আমি আপনার ভার্চুয়াল সহায়ক। আমি আপনাকে কীভাবে সাহায্য করতে পারি?'
      ]
    };
    
    const responseList = responses[language] || responses.en;
    const response = responseList[Math.floor(Math.random() * responseList.length)];
    
    return {
      response,
      intent: 'greeting',
      confidence: 0.95,
      actions: ['show_quick_options']
    };
  }
  
  private static async handleOrderStatusInquiry(entities: any[], language: string, userId: number | null): Promise<ChatbotResponse> {
    // Extract order number from entities if available
    const orderNumber = entities.find(e => e.type === 'order_number')?.value;
    
    if (!orderNumber && !userId) {
      return {
        response: language === 'bn' 
          ? 'আপনার অর্ডার স্ট্যাটাস চেক করতে, দয়া করে আপনার অর্ডার নম্বর দিন অথবা আপনার একাউন্টে লগইন করুন।'
          : 'To check your order status, please provide your order number or log in to your account.',
        intent: 'order_status_help',
        confidence: 0.9,
        actions: ['request_order_number', 'suggest_login']
      };
    }
    
    // In production, fetch actual order data
    return {
      response: language === 'bn' 
        ? 'আমি আপনার অর্ডারের তথ্য খোঁজ করছি। একটি মুহূর্ত অপেক্ষা করুন...'
        : 'Let me look up your order information. Please wait a moment...',
      intent: 'order_status_lookup',
      confidence: 0.9,
      actions: ['lookup_order', 'show_order_status']
    };
  }
  
  private static handlePaymentIssue(entities: any[], language: string): ChatbotResponse {
    const paymentMethod = entities.find(e => e.type === 'payment_method')?.value;
    
    let response = '';
    let actions = ['show_payment_troubleshooting'];
    
    if (paymentMethod?.includes('bkash') || paymentMethod?.includes('বিকাশ')) {
      response = language === 'bn' 
        ? 'বিকাশ পেমেন্টে সমস্যা হচ্ছে? নিশ্চিত করুন যে: ১) আপনার বিকাশ একাউন্টে পর্যাপ্ত ব্যালেন্স আছে ২) ইন্টারনেট সংযোগ ভালো আছে ৩) সঠিক পিন দিয়েছেন'
        : 'Having trouble with bKash payment? Please ensure: 1) Sufficient balance in your bKash account 2) Good internet connection 3) Correct PIN entered';
      actions.push('contact_bkash_support');
    } else {
      response = language === 'bn' 
        ? 'পেমেন্টে সমস্যা হচ্ছে? আমি আপনাকে সাহায্য করতে পারি। কোন পেমেন্ট মেথড ব্যবহার করছেন?'
        : 'Having payment issues? I can help you. Which payment method are you using?';
    }
    
    return {
      response,
      intent: 'payment_troubleshooting',
      confidence: 0.9,
      actions
    };
  }
  
  private static handlePaymentMethodsInquiry(language: string): ChatbotResponse {
    return {
      response: language === 'bn' 
        ? 'গেট ইট বাংলাদেশে আমরা নিম্নলিখিত পেমেন্ট মেথড গ্রহণ করি:\n\n🔹 বিকাশ (bKash)\n🔹 নগদ (Nagad)\n🔹 রকেট (Rocket)\n🔹 ক্যাশ অন ডেলিভারি (COD)\n🔹 ভিসা/মাস্টারকার্ড\n\nকোনটি সম্পর্কে আরো জানতে চান?'
        : 'At GetIt Bangladesh, we accept the following payment methods:\n\n🔹 bKash\n🔹 Nagad\n🔹 Rocket\n🔹 Cash on Delivery (COD)\n🔹 Visa/Mastercard\n\nWhich one would you like to know more about?',
      intent: 'payment_methods_info',
      confidence: 0.95,
      actions: ['show_payment_details', 'show_payment_guide']
    };
  }
  
  private static handleShippingInquiry(language: string): ChatbotResponse {
    return {
      response: language === 'bn' 
        ? 'ডেলিভারি তথ্য:\n\n📦 ঢাকার ভিতরে: ১-২ দিন\n📦 ঢাকার বাইরে: ৩-৫ দিন\n📦 সেম ডে ডেলিভারি: ঢাকায় উপলব্ধ\n📦 ডেলিভারি চার্জ: ৬০-১২০ টাকা\n\nআমরা পাঠাও, পেপারফ্লাই এবং অন্যান্য নিরভরযোগ্য কুরিয়ার ব্যবহার করি।'
        : 'Shipping Information:\n\n📦 Inside Dhaka: 1-2 days\n📦 Outside Dhaka: 3-5 days\n📦 Same Day Delivery: Available in Dhaka\n📦 Delivery Charge: 60-120 BDT\n\nWe use Pathao, Paperfly and other reliable couriers.',
      intent: 'shipping_info',
      confidence: 0.95,
      actions: ['check_delivery_area', 'calculate_shipping_cost']
    };
  }
  
  private static async handleProductInquiry(entities: any[], language: string): Promise<ChatbotResponse> {
    return {
      response: language === 'bn' 
        ? 'পণ্য সম্পর্কে জানতে চান? আমি সাহায্য করতে পারি। আপনি কোন পণ্য খুঁজছেন?'
        : 'Looking for product information? I can help. What product are you looking for?',
      intent: 'product_inquiry_help',
      confidence: 0.8,
      actions: ['product_search', 'show_categories']
    };
  }
  
  private static handleAccountIssue(language: string): ChatbotResponse {
    return {
      response: language === 'bn' 
        ? 'একাউন্ট সমস্যায় সাহায্য করতে পারি। সাধারণ সমাধান:\n\n🔹 পাসওয়ার্ড রিসেট: লগইন পেজে "পাসওয়ার্ড ভুলে গেছেন?" ক্লিক করুন\n🔹 প্রোফাইল আপডেট: একাউন্ট সেটিংস থেকে\n🔹 ইমেইল ভেরিফিকেশন: ইনবক্স চেক করুন\n\nআরো সাহায্যের প্রয়োজন?'
        : 'I can help with account issues. Common solutions:\n\n🔹 Password Reset: Click "Forgot Password?" on login page\n🔹 Profile Update: Go to Account Settings\n🔹 Email Verification: Check your inbox\n\nNeed more help?',
      intent: 'account_help',
      confidence: 0.9,
      actions: ['password_reset_guide', 'contact_support']
    };
  }
  
  private static handleHumanAgentRequest(language: string): ChatbotResponse {
    return {
      response: language === 'bn' 
        ? 'আমি আপনাকে একজন সাপোর্ট এজেন্টের সাথে সংযুক্ত করছি। অনুগ্রহ করে একটু অপেক্ষা করুন...'
        : 'I\'m connecting you with a support agent. Please wait a moment...',
      intent: 'escalate_to_human',
      confidence: 1.0,
      escalateToHuman: true,
      actions: ['initiate_live_chat']
    };
  }
  
  private static generateThanksResponse(language: string): ChatbotResponse {
    const responses = {
      en: [
        'You\'re welcome! Is there anything else I can help you with?',
        'Happy to help! Let me know if you need anything else.',
        'My pleasure! Feel free to ask if you have more questions.'
      ],
      bn: [
        'আপনাকে স্বাগতম! আর কিছু সাহায্যের প্রয়োজন আছে?',
        'সাহায্য করতে পেরে খুশি! আর কিছু দরকার হলে জানাবেন।',
        'আমার আনন্দ! আরো প্রশ্ন থাকলে নির্দ্বিধায় জিজ্ঞেস করুন।'
      ]
    };
    
    const responseList = responses[language] || responses.en;
    const response = responseList[Math.floor(Math.random() * responseList.length)];
    
    return {
      response,
      intent: 'thanks_response',
      confidence: 0.95,
      actions: ['offer_more_help']
    };
  }
  
  // Utility methods
  private static extractEntities(message: string): any[] {
    const entities = [];
    
    // Extract order numbers (pattern: GT-XXXXXX-XXXX)
    const orderPattern = /GT-\d{6}-[A-Z0-9]{4}/gi;
    const orderMatches = message.match(orderPattern);
    if (orderMatches) {
      entities.push({
        type: 'order_number',
        value: orderMatches[0],
        confidence: 0.9
      });
    }
    
    // Extract payment methods
    const paymentMethods = ['bkash', 'nagad', 'rocket', 'cod', 'বিকাশ', 'নগদ', 'রকেট'];
    paymentMethods.forEach(method => {
      if (message.toLowerCase().includes(method)) {
        entities.push({
          type: 'payment_method',
          value: method,
          confidence: 0.8
        });
      }
    });
    
    // Extract phone numbers
    const phonePattern = /(\+88)?01[3-9]\d{8}/g;
    const phoneMatches = message.match(phonePattern);
    if (phoneMatches) {
      entities.push({
        type: 'phone_number',
        value: phoneMatches[0],
        confidence: 0.9
      });
    }
    
    return entities;
  }
  
  private static async getConversationHistory(sessionId: string): Promise<ChatMessage[]> {
    const [conversation] = await db.select()
      .from(chatbotConversations)
      .where(eq(chatbotConversations.sessionId, sessionId))
      .limit(1);
      
    if (!conversation) {
      return [];
    }
    
    return conversation.conversationHistory as ChatMessage[];
  }
  
  private static async saveConversation(
    sessionId: string,
    userId: number | null,
    userMessage: string,
    botResponse: ChatbotResponse,
    language: string
  ) {
    const existingConversation = await db.select()
      .from(chatbotConversations)
      .where(eq(chatbotConversations.sessionId, sessionId))
      .limit(1);
    
    const newMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    const botMessage: ChatMessage = {
      role: 'assistant',
      content: botResponse.response,
      timestamp: new Date(),
      metadata: {
        intent: botResponse.intent,
        confidence: botResponse.confidence,
        actions: botResponse.actions
      }
    };
    
    if (existingConversation.length > 0) {
      const currentHistory = existingConversation[0].conversationHistory as ChatMessage[];
      const updatedHistory = [...currentHistory, newMessage, botMessage];
      
      await db.update(chatbotConversations)
        .set({
          conversationHistory: updatedHistory,
          intent: botResponse.intent,
          confidenceScore: botResponse.confidence.toString(),
          escalatedToHuman: botResponse.escalateToHuman || false,
          updatedAt: new Date()
        })
        .where(eq(chatbotConversations.sessionId, sessionId));
    } else {
      await db.insert(chatbotConversations)
        .values({
          sessionId,
          userId,
          conversationHistory: [newMessage, botMessage],
          intent: botResponse.intent,
          confidenceScore: botResponse.confidence.toString(),
          escalatedToHuman: botResponse.escalateToHuman || false,
          language
        });
    }
  }
  
  /**
   * Get chatbot analytics
   */
  static async getAnalytics(dateFrom: Date, dateTo: Date) {
    const conversations = await db.select()
      .from(chatbotConversations)
      .where(and(
        gte(chatbotConversations.createdAt, dateFrom),
        lte(chatbotConversations.createdAt, dateTo)
      ));
    
    const totalConversations = conversations.length;
    const resolvedByBot = conversations.filter(c => c.resolvedByBot).length;
    const escalatedToHuman = conversations.filter(c => c.escalatedToHuman).length;
    const averageConfidence = conversations.reduce((sum, c) => sum + parseFloat(c.confidenceScore || '0'), 0) / totalConversations;
    
    const intentDistribution = conversations.reduce((acc, conv) => {
      const intent = conv.intent || 'unknown';
      acc[intent] = (acc[intent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalConversations,
      resolvedByBot,
      escalatedToHuman,
      resolutionRate: totalConversations > 0 ? ((resolvedByBot / totalConversations) * 100).toFixed(1) : '0',
      escalationRate: totalConversations > 0 ? ((escalatedToHuman / totalConversations) * 100).toFixed(1) : '0',
      averageConfidence: averageConfidence.toFixed(2),
      intentDistribution
    };
  }
}