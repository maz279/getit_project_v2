import { textAnalyzer } from './TextAnalyzer';
import { voiceProcessor } from './VoiceProcessor';
import { documentProcessor } from './DocumentProcessor';
import { conversationEngine } from './ConversationEngine';
import { contentGenerator } from './ContentGenerator';

export class NLPManager {
  private static instance: NLPManager;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): NLPManager {
    if (!NLPManager.instance) {
      NLPManager.instance = new NLPManager();
    }
    return NLPManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🧠 Initializing NLP Manager...');
    
    await Promise.all([
      textAnalyzer.initialize(),
      voiceProcessor.initialize(),
      documentProcessor.initialize(),
      conversationEngine.initialize(),
      contentGenerator.initialize()
    ]);

    this.isInitialized = true;
    console.log('✅ NLP Manager initialized successfully');
  }

  // Main analyzeText method that other services expect
  async analyzeText(text: string, options: {
    includeIntent?: boolean;
    includeKeywords?: boolean;
    includeSentiment?: boolean;
    includeEntities?: boolean;
    language?: 'en' | 'bn';
  } = {}): Promise<{
    sentiment?: any;
    keywords?: any;
    entities?: any;
    intent?: any;
    language?: any;
  }> {
    console.log('🔍 Analyzing text with options:', options);
    
    const results: any = {};
    const language = options.language || 'en';

    if (options.includeSentiment) {
      results.sentiment = await textAnalyzer.analyzeSentiment(text, language);
    }

    if (options.includeKeywords) {
      results.keywords = await textAnalyzer.extractKeywords(text, language);
    }

    if (options.includeEntities) {
      results.entities = await textAnalyzer.extractEntities(text);
    }

    if (options.includeIntent) {
      results.intent = await textAnalyzer.detectIntent(text);
    }

    return results;
  }

  // Comprehensive text analysis
  async performComprehensiveTextAnalysis(text: string, language: 'en' | 'bn' = 'en'): Promise<{
    sentiment: any;
    keywords: any;
    entities: any;
    topics: any;
    language: any;
    readability: any;
    intent: any;
  }> {
    console.log('🔍 Performing comprehensive text analysis');

    const [sentiment, keywords, entities, topics, languageDetection, readability, intent] = await Promise.all([
      textAnalyzer.analyzeSentiment(text, language),
      textAnalyzer.extractKeywords(text, language),
      textAnalyzer.extractEntities(text),
      textAnalyzer.extractTopics(text),
      textAnalyzer.detectLanguage(text),
      textAnalyzer.analyzeReadability(text),
      textAnalyzer.detectIntent(text)
    ]);

    return {
      sentiment,
      keywords,
      entities,
      topics,
      language: languageDetection,
      readability,
      intent
    };
  }

  // Product content analysis
  async analyzeProductContent(content: {
    title?: string;
    description?: string;
    reviews?: string[];
    category?: string;
  }): Promise<{
    titleAnalysis: any;
    descriptionAnalysis: any;
    reviewsSummary: any;
    contentQuality: any;
    recommendations: string[];
  }> {
    console.log('📦 Analyzing product content');

    const titleAnalysis = content.title ? 
      await this.performComprehensiveTextAnalysis(content.title) : null;
    
    const descriptionAnalysis = content.description ? 
      await this.performComprehensiveTextAnalysis(content.description) : null;

    let reviewsSummary = null;
    if (content.reviews && content.reviews.length > 0) {
      reviewsSummary = await this.analyzeReviews(content.reviews);
    }

    const contentQuality = this.assessContentQuality({
      titleAnalysis,
      descriptionAnalysis,
      reviewsSummary
    });

    const recommendations = this.generateContentRecommendations(contentQuality);

    return {
      titleAnalysis,
      descriptionAnalysis,
      reviewsSummary,
      contentQuality,
      recommendations
    };
  }

  // Customer message processing
  async processCustomerMessage(message: string, context?: {
    userId?: string;
    language?: 'en' | 'bn';
    conversationHistory?: any[];
  }): Promise<{
    intent: string;
    entities: any[];
    sentiment: any;
    response: string;
    nextSteps: string[];
    escalation: boolean;
  }> {
    console.log('💬 Processing customer message');

    const analysis = await this.performComprehensiveTextAnalysis(message, context?.language);
    const conversationResponse = await conversationEngine.processMessage(message, context);

    return {
      intent: analysis.intent.intent,
      entities: analysis.entities.entities,
      sentiment: analysis.sentiment,
      response: conversationResponse.response,
      nextSteps: conversationResponse.suggestedActions,
      escalation: analysis.sentiment.sentiment === 'negative' && analysis.sentiment.confidence > 0.8
    };
  }

  // Review analysis
  private async analyzeReviews(reviews: string[]): Promise<{
    overallSentiment: any;
    commonThemes: string[];
    positiveAspects: string[];
    negativeAspects: string[];
    trustworthiness: number;
    summary: string;
  }> {
    const sentiments = await Promise.all(
      reviews.map(review => textAnalyzer.analyzeSentiment(review))
    );

    const overallSentiment = this.aggregateSentiments(sentiments);
    
    // Extract common themes and aspects
    const allText = reviews.join(' ');
    const topics = await textAnalyzer.extractTopics(allText);
    const keywords = await textAnalyzer.extractKeywords(allText);

    const positiveReviews = reviews.filter((_, index) => sentiments[index].sentiment === 'positive');
    const negativeReviews = reviews.filter((_, index) => sentiments[index].sentiment === 'negative');

    const positiveAspects = positiveReviews.length > 0 ? 
      await this.extractAspects(positiveReviews.join(' ')) : [];
    const negativeAspects = negativeReviews.length > 0 ? 
      await this.extractAspects(negativeReviews.join(' ')) : [];

    const trustworthiness = this.calculateReviewTrustworthiness(reviews, sentiments);
    const summary = await contentGenerator.generateReviewSummary(reviews, overallSentiment);

    return {
      overallSentiment,
      commonThemes: topics.topics.slice(0, 5),
      positiveAspects,
      negativeAspects,
      trustworthiness,
      summary
    };
  }

  private aggregateSentiments(sentiments: any[]): any {
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    let totalConfidence = 0;

    sentiments.forEach(sentiment => {
      sentimentCounts[sentiment.sentiment as keyof typeof sentimentCounts]++;
      totalConfidence += sentiment.confidence;
    });

    const dominantSentiment = Object.entries(sentimentCounts)
      .reduce((a, b) => sentimentCounts[a[0] as keyof typeof sentimentCounts] > sentimentCounts[b[0] as keyof typeof sentimentCounts] ? a : b)[0];

    return {
      sentiment: dominantSentiment,
      confidence: totalConfidence / sentiments.length,
      distribution: sentimentCounts
    };
  }

  private async extractAspects(text: string): Promise<string[]> {
    const keywords = await textAnalyzer.extractKeywords(text);
    return keywords.keywords.slice(0, 5).map((k: any) => k.word);
  }

  private calculateReviewTrustworthiness(reviews: string[], sentiments: any[]): number {
    let trustScore = 0.5;

    // Length diversity
    const lengths = reviews.map(r => r.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    if (avgLength > 50) trustScore += 0.1;

    // Sentiment diversity
    const uniqueSentiments = new Set(sentiments.map(s => s.sentiment)).size;
    if (uniqueSentiments > 1) trustScore += 0.1;

    // Language quality (simplified)
    const hasProperPunctuation = reviews.some(r => r.includes('.') || r.includes('!'));
    if (hasProperPunctuation) trustScore += 0.1;

    return Math.min(1, trustScore);
  }

  private assessContentQuality(analyses: any): any {
    let qualityScore = 0.5;
    const issues = [];
    const strengths = [];

    if (analyses.titleAnalysis) {
      if (analyses.titleAnalysis.readability.score > 0.7) {
        qualityScore += 0.1;
        strengths.push('Clear title');
      }
      if (analyses.titleAnalysis.keywords.keywords.length > 2) {
        qualityScore += 0.1;
        strengths.push('Rich keywords in title');
      }
    }

    if (analyses.descriptionAnalysis) {
      if (analyses.descriptionAnalysis.readability.score > 0.6) {
        qualityScore += 0.15;
        strengths.push('Readable description');
      } else {
        issues.push('Description readability could be improved');
      }
    }

    if (analyses.reviewsSummary) {
      if (analyses.reviewsSummary.trustworthiness > 0.7) {
        qualityScore += 0.15;
        strengths.push('Trustworthy reviews');
      }
      if (analyses.reviewsSummary.overallSentiment.sentiment === 'positive') {
        qualityScore += 0.1;
        strengths.push('Positive customer feedback');
      }
    }

    return {
      score: Math.min(1, qualityScore),
      issues,
      strengths,
      grade: qualityScore > 0.8 ? 'A' : qualityScore > 0.6 ? 'B' : qualityScore > 0.4 ? 'C' : 'D'
    };
  }

  private generateContentRecommendations(contentQuality: any): string[] {
    const recommendations = [];

    if (contentQuality.score < 0.6) {
      recommendations.push('Improve overall content quality');
    }

    if (contentQuality.issues.length > 0) {
      recommendations.push(...contentQuality.issues);
    }

    if (contentQuality.score < 0.5) {
      recommendations.push('Consider professional content review');
    }

    return recommendations;
  }

  // Public accessors
  public getTextAnalyzer() { return textAnalyzer; }
  public getVoiceProcessor() { return voiceProcessor; }
  public getDocumentProcessor() { return documentProcessor; }
  public getConversationEngine() { return conversationEngine; }
  public getContentGenerator() { return contentGenerator; }

  public isReady(): boolean {
    return this.isInitialized;
  }
}

export const nlpManager = NLPManager.getInstance();
