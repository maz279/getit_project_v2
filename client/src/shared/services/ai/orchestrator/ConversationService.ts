
import { nlpManager } from '../../nlp';
import { mlManager } from '../../ml';

export class ConversationService {
  private static instance: ConversationService;

  public static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
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
    console.log('Conversation Service: Processing conversation');

    const [nlpAnalysis, response] = await Promise.all([
      this.analyzeMessage(message, context),
      this.generateResponse(message, context)
    ]);

    const actionableInsights = await this.extractInsights(message, nlpAnalysis, context);
    const followUpSuggestions = this.generateFollowUpSuggestions(nlpAnalysis, context);
    const businessIntelligence = await this.generateBusinessIntelligence(message, nlpAnalysis, context);

    return {
      response,
      nlpAnalysis,
      actionableInsights,
      followUpSuggestions,
      businessIntelligence
    };
  }

  private async analyzeMessage(message: string, context: any): Promise<any> {
    return await nlpManager.analyzeText(message, {
      includeIntent: true,
      includeKeywords: true,
      includeSentiment: true,
      includeEntities: true,
      language: context.language || 'en'
    });
  }

  private async generateResponse(message: string, context: any): Promise<string> {
    const nlpAnalysis = await this.analyzeMessage(message, context);
    const intent = nlpAnalysis.intent?.category || 'general';

    switch (intent) {
      case 'product_inquiry':
        return await this.handleProductInquiry(message, context);
      case 'support':
        return await this.handleSupportRequest(message, context);
      case 'complaint':
        return await this.handleComplaint(message, context);
      case 'purchase':
        return await this.handlePurchaseIntent(message, context);
      default:
        return await this.handleGeneralInquiry(message, context);
    }
  }

  private async handleProductInquiry(message: string, context: any): Promise<string> {
    if (context.language === 'bn') {
      return 'আমি আপনাকে সঠিক পণ্য খুঁজে পেতে সাহায্য করতে পারি। আপনি কী ধরনের পণ্য খুঁজছেন?';
    }
    return 'I can help you find the right product. What type of product are you looking for?';
  }

  private async handleSupportRequest(message: string, context: any): Promise<string> {
    if (context.language === 'bn') {
      return 'আমি আপনার সমস্যা সমাধানে সাহায্য করতে প্রস্তুত। আপনার সমস্যাটি কী?';
    }
    return 'I\'m here to help resolve your issue. What seems to be the problem?';
  }

  private async handleComplaint(message: string, context: any): Promise<string> {
    if (context.language === 'bn') {
      return 'আপনার অভিযোগের জন্য আমি দুঃখিত। আমি অবিলম্বে এটি সমাধানের চেষ্টা করব।';
    }
    return 'I apologize for the inconvenience. Let me work on resolving this issue immediately.';
  }

  private async handlePurchaseIntent(message: string, context: any): Promise<string> {
    if (context.language === 'bn') {
      return 'আমি আপনাকে সেরা ডিল এবং পণ্য খুঁজে পেতে সাহায্য করতে পারি। আপনার বাজেট কত?';
    }
    return 'I can help you find the best deals and products. What\'s your budget range?';
  }

  private async handleGeneralInquiry(message: string, context: any): Promise<string> {
    if (context.language === 'bn') {
      return 'আমি আপনাকে সাহায্য করতে এখানে আছি। আপনি কীভাবে আমাকে ব্যবহার করতে পারেন তা জানতে চান?';
    }
    return 'I\'m here to help you. How can I assist you today?';
  }

  private async extractInsights(message: string, nlpAnalysis: any, context: any): Promise<any[]> {
    const insights = [];

    if (nlpAnalysis.sentiment?.sentiment === 'negative') {
      insights.push({
        type: 'customer_satisfaction',
        priority: 'high',
        message: 'Negative sentiment detected - requires immediate attention',
        action: 'escalate_to_human'
      });
    }

    if (nlpAnalysis.intent?.confidence > 0.8) {
      insights.push({
        type: 'clear_intent',
        priority: 'medium',
        message: `Clear ${nlpAnalysis.intent.category} intent detected`,
        action: 'provide_targeted_assistance'
      });
    }

    return insights;
  }

  private generateFollowUpSuggestions(nlpAnalysis: any, context: any): string[] {
    const suggestions = [];
    const intent = nlpAnalysis.intent?.category;
    const isEnglish = context.language !== 'bn';

    switch (intent) {
      case 'product_inquiry':
        suggestions.push(
          isEnglish ? 'Show me similar products' : 'অনুরূপ পণ্য দেখান',
          isEnglish ? 'What are the best deals?' : 'সেরা অফার কী?'
        );
        break;
      case 'support':
        suggestions.push(
          isEnglish ? 'Check order status' : 'অর্ডার স্ট্যাটাস চেক করুন',
          isEnglish ? 'Contact human agent' : 'মানব এজেন্টের সাথে যোগাযোগ করুন'
        );
        break;
      default:
        suggestions.push(
          isEnglish ? 'Browse categories' : 'ক্যাটেগরি ব্রাউজ করুন',
          isEnglish ? 'View recommendations' : 'সুপারিশ দেখুন'
        );
    }

    return suggestions;
  }

  private async generateBusinessIntelligence(message: string, nlpAnalysis: any, context: any): Promise<any> {
    return {
      customerIntent: nlpAnalysis.intent?.category || 'unknown',
      sentimentTrend: nlpAnalysis.sentiment?.sentiment || 'neutral',
      keyTopics: nlpAnalysis.keywords?.slice(0, 3) || [],
      urgencyLevel: this.assessUrgency(nlpAnalysis),
      businessImpact: this.assessBusinessImpact(nlpAnalysis, context),
      recommendedActions: this.recommendBusinessActions(nlpAnalysis)
    };
  }

  private assessUrgency(nlpAnalysis: any): string {
    if (nlpAnalysis.sentiment?.sentiment === 'negative' && nlpAnalysis.sentiment?.confidence > 0.7) {
      return 'high';
    }
    if (nlpAnalysis.intent?.category === 'complaint') {
      return 'medium';
    }
    return 'low';
  }

  private assessBusinessImpact(nlpAnalysis: any, context: any): string {
    if (context.userId && nlpAnalysis.intent?.category === 'purchase') {
      return 'revenue_opportunity';
    }
    if (nlpAnalysis.sentiment?.sentiment === 'negative') {
      return 'reputation_risk';
    }
    return 'engagement';
  }

  private recommendBusinessActions(nlpAnalysis: any): string[] {
    const actions = [];
    
    if (nlpAnalysis.sentiment?.sentiment === 'negative') {
      actions.push('immediate_resolution', 'follow_up_required');
    }
    
    if (nlpAnalysis.intent?.category === 'purchase') {
      actions.push('provide_personalized_offers', 'track_conversion');
    }
    
    return actions;
  }
}

export const conversationService = ConversationService.getInstance();
