
import { nlpService } from './NLPService';

export class ChatbotService {
  private conversationHistory: Array<{
    message: string;
    response: string;
    timestamp: number;
    intent: string;
  }> = [];

  async processMessage(message: string, context?: {
    userId?: string;
    language?: 'en' | 'bn';
    sessionId?: string;
  }): Promise<{
    response: string;
    intent: string;
    confidence: number;
    suggestions: string[];
    requiresHumanAgent: boolean;
  }> {
    console.log('Chatbot: Processing user message');
    
    await nlpService.initialize();
    
    // Analyze the message
    const [intentAnalysis, sentiment, entities] = await Promise.all([
      nlpService.classifyIntent(message),
      nlpService.analyzeSentiment(message),
      nlpService.extractEntities(message)
    ]);
    
    const response = await this.generateResponse(message, intentAnalysis.intent, entities);
    const suggestions = this.generateSuggestions(intentAnalysis.intent);
    const requiresHumanAgent = this.shouldTransferToHuman(sentiment, intentAnalysis);
    
    // Store conversation history
    this.conversationHistory.push({
      message,
      response,
      timestamp: Date.now(),
      intent: intentAnalysis.intent
    });
    
    return {
      response,
      intent: intentAnalysis.intent,
      confidence: intentAnalysis.confidence,
      suggestions,
      requiresHumanAgent
    };
  }

  private async generateResponse(message: string, intent: string, entities: any): Promise<string> {
    const responses = {
      search_product: this.generateProductSearchResponse(entities),
      price_inquiry: "Let me help you with pricing information. What specific product are you interested in?",
      comparison: "I can help you compare products. Which items would you like to compare?",
      recommendation: "I'd be happy to recommend products based on your preferences. What are you looking for?",
      complaint: "I understand your concern. Let me help resolve this issue for you. Can you provide more details?",
      support: "I'm here to help! What specific assistance do you need?",
      navigation: "I can help you navigate our site. Where would you like to go?",
      general: "Thank you for your message. How can I assist you today?"
    };
    
    return responses[intent as keyof typeof responses] || responses.general;
  }

  private generateProductSearchResponse(entities: any): string {
    if (entities.brands.length > 0 || entities.products.length > 0) {
      const items = [...entities.brands, ...entities.products].join(', ');
      return `I found some great options for ${items}. Let me show you our best products in this category.`;
    }
    return "What type of product are you looking for? I can help you find the perfect item.";
  }

  private generateSuggestions(intent: string): string[] {
    const suggestionMap = {
      search_product: [
        "Show me popular items",
        "Filter by price range", 
        "See customer reviews",
        "Compare similar products"
      ],
      price_inquiry: [
        "Check for discounts",
        "View price history",
        "Set price alert",
        "Compare prices"
      ],
      support: [
        "Track my order",
        "Return policy",
        "Contact support",
        "FAQ"
      ]
    };
    
    return suggestionMap[intent as keyof typeof suggestionMap] || [
      "Browse categories",
      "View deals",
      "Customer support",
      "Track order"
    ];
  }

  private shouldTransferToHuman(sentiment: any, intentAnalysis: any): boolean {
    // Transfer to human for negative sentiment complaints or complex issues
    return (sentiment.sentiment === 'negative' && sentiment.confidence > 0.8) ||
           (intentAnalysis.intent === 'complaint' && intentAnalysis.confidence > 0.7);
  }

  getConversationHistory(): Array<{
    message: string;
    response: string;
    timestamp: number;
    intent: string;
  }> {
    return this.conversationHistory;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

export const chatbotService = new ChatbotService();
