/**
 * Natural.js NLP Integration Service
 * Activates and integrates existing Natural.js for offline NLP processing
 */

import natural from 'natural';
import Sentiment from 'sentiment';

interface NLPRequest {
  text: string;
  language?: 'en' | 'bn';
  type?: 'sentiment' | 'entities' | 'classification' | 'keywords' | 'all';
}

interface NLPResult {
  sentiment: {
    score: number;
    comparative: number;
    classification: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  entities: {
    persons: string[];
    places: string[];
    organizations: string[];
    products: string[];
  };
  keywords: string[];
  topics: string[];
  language: string;
  processingTime: number;
}

interface SearchQueryAnalysis {
  intent: 'buy' | 'browse' | 'compare' | 'review' | 'information';
  entities: string[];
  sentiment: number;
  urgency: 'high' | 'medium' | 'low';
  category: string | null;
  price_range: { min?: number; max?: number } | null;
}

export class NaturalNLPIntegrationService {
  private classifier: natural.BayesClassifier;
  private sentiment: Sentiment;
  private stemmer = natural.PorterStemmer;
  private isInitialized = false;

  // Bengali language patterns
  private bengaliPatterns = {
    products: ['মোবাইল', 'ল্যাপটপ', 'শাড়ি', 'জুতা', 'বই'],
    price_indicators: ['দাম', 'টাকা', 'কত', 'মূল্য'],
    buy_intent: ['কিনতে', 'কিনব', 'কেনা', 'অর্ডার'],
    review_intent: ['রিভিউ', 'মতামত', 'কেমন', 'ভালো']
  };

  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.sentiment = new Sentiment();
  }

  public async initialize(): Promise<void> {
    try {
      console.log('🧠 Initializing Natural.js NLP Integration Service...');

      // Train the classifier with e-commerce specific data
      await this.trainClassifier();

      this.isInitialized = true;
      console.log('✅ Natural.js NLP Integration Service initialized successfully');
    } catch (error) {
      console.error('❌ Natural.js NLP initialization failed:', error);
      throw error;
    }
  }

  public async processText(request: NLPRequest): Promise<NLPResult> {
    const startTime = performance.now();

    if (!this.isInitialized) {
      throw new Error('NLP Service not initialized');
    }

    const { text, language = 'en', type = 'all' } = request;

    const result: NLPResult = {
      sentiment: { score: 0, comparative: 0, classification: 'neutral', confidence: 0 },
      entities: { persons: [], places: [], organizations: [], products: [] },
      keywords: [],
      topics: [],
      language,
      processingTime: 0
    };

    if (type === 'sentiment' || type === 'all') {
      result.sentiment = this.analyzeSentiment(text);
    }

    if (type === 'entities' || type === 'all') {
      result.entities = this.extractEntities(text, language);
    }

    if (type === 'keywords' || type === 'all') {
      result.keywords = this.extractKeywords(text);
    }

    if (type === 'classification' || type === 'all') {
      result.topics = this.classifyTopics(text);
    }

    result.processingTime = performance.now() - startTime;
    return result;
  }

  public async analyzeSearchQuery(query: string): Promise<SearchQueryAnalysis> {
    if (!this.isInitialized) {
      throw new Error('NLP Service not initialized');
    }

    const lowerQuery = query.toLowerCase();
    
    // Analyze intent
    const intent = this.detectIntent(lowerQuery);
    
    // Extract entities
    const entities = this.extractSearchEntities(lowerQuery);
    
    // Analyze sentiment
    const sentimentResult = this.analyzeSentiment(query);
    
    // Detect urgency
    const urgency = this.detectUrgency(lowerQuery);
    
    // Predict category
    const category = this.predictCategory(lowerQuery);
    
    // Extract price range
    const price_range = this.extractPriceRange(lowerQuery);

    return {
      intent,
      entities,
      sentiment: sentimentResult.score,
      urgency,
      category,
      price_range
    };
  }

  public async generateSearchSuggestions(partialQuery: string): Promise<string[]> {
    if (!this.isInitialized || !partialQuery.trim()) {
      return [];
    }

    const tokens = natural.WordTokenizer().tokenize(partialQuery.toLowerCase());
    const lastToken = tokens[tokens.length - 1];

    // Generate suggestions based on common e-commerce terms
    const suggestions = this.getCommonTerms()
      .filter(term => term.startsWith(lastToken))
      .slice(0, 5);

    return suggestions.map(suggestion => {
      const queryTokens = [...tokens.slice(0, -1), suggestion];
      return queryTokens.join(' ');
    });
  }

  public async classifyProductReview(review: string): Promise<{
    rating: number;
    aspects: Record<string, number>;
    summary: string;
    confidence: number;
  }> {
    if (!this.isInitialized) {
      throw new Error('NLP Service not initialized');
    }

    const sentiment = this.analyzeSentiment(review);
    
    // Convert sentiment to 1-5 rating
    const rating = Math.max(1, Math.min(5, Math.round(3 + (sentiment.score / 2))));

    // Analyze aspects (quality, price, delivery, service)
    const aspects = this.analyzeAspects(review);

    // Generate summary
    const summary = this.generateReviewSummary(review, sentiment);

    return {
      rating,
      aspects,
      summary,
      confidence: sentiment.confidence
    };
  }

  private async trainClassifier(): Promise<void> {
    // E-commerce intent training data
    const trainingData = [
      // Buy intent
      { text: 'want to buy smartphone', label: 'buy' },
      { text: 'purchase laptop online', label: 'buy' },
      { text: 'order traditional saree', label: 'buy' },
      { text: 'কিনতে চাই মোবাইল', label: 'buy' },
      
      // Browse intent
      { text: 'show me electronics', label: 'browse' },
      { text: 'latest fashion trends', label: 'browse' },
      { text: 'new arrivals', label: 'browse' },
      
      // Compare intent
      { text: 'compare samsung vs iphone', label: 'compare' },
      { text: 'difference between models', label: 'compare' },
      { text: 'which is better', label: 'compare' },
      
      // Review intent
      { text: 'product reviews', label: 'review' },
      { text: 'customer feedback', label: 'review' },
      { text: 'how is this product', label: 'review' },
      
      // Information intent
      { text: 'product specifications', label: 'information' },
      { text: 'delivery time', label: 'information' },
      { text: 'warranty details', label: 'information' }
    ];

    trainingData.forEach(data => {
      this.classifier.addDocument(data.text, data.label);
    });

    this.classifier.train();
  }

  private analyzeSentiment(text: string): {
    score: number;
    comparative: number;
    classification: 'positive' | 'negative' | 'neutral';
    confidence: number;
  } {
    const result = this.sentiment.analyze(text);
    
    let classification: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (result.score > 1) classification = 'positive';
    else if (result.score < -1) classification = 'negative';

    const confidence = Math.min(1, Math.abs(result.comparative) * 2);

    return {
      score: result.score,
      comparative: result.comparative,
      classification,
      confidence
    };
  }

  private extractEntities(text: string, language: string): {
    persons: string[];
    places: string[];
    organizations: string[];
    products: string[];
  } {
    const tokens = natural.WordTokenizer().tokenize(text);
    
    const entities = {
      persons: this.findPersons(tokens),
      places: this.findPlaces(tokens, language),
      organizations: this.findOrganizations(tokens),
      products: this.findProducts(tokens, language)
    };

    return entities;
  }

  private extractKeywords(text: string): string[] {
    const tokens = natural.WordTokenizer().tokenize(text.toLowerCase());
    const filtered = tokens.filter(token => 
      token.length > 2 && 
      !natural.stopwords.includes(token)
    );

    // Use TF-IDF for keyword extraction
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(filtered.join(' '));

    const keywords: string[] = [];
    tfidf.listTerms(0).forEach(item => {
      if (keywords.length < 10) {
        keywords.push(item.term);
      }
    });

    return keywords;
  }

  private classifyTopics(text: string): string[] {
    const classification = this.classifier.classify(text);
    return [classification];
  }

  private detectIntent(query: string): 'buy' | 'browse' | 'compare' | 'review' | 'information' {
    const buyKeywords = ['buy', 'purchase', 'order', 'কিনতে', 'কিনব'];
    const compareKeywords = ['compare', 'vs', 'difference', 'better', 'তুলনা'];
    const reviewKeywords = ['review', 'feedback', 'rating', 'রিভিউ'];
    const infoKeywords = ['specification', 'details', 'info', 'delivery', 'warranty'];

    if (buyKeywords.some(keyword => query.includes(keyword))) return 'buy';
    if (compareKeywords.some(keyword => query.includes(keyword))) return 'compare';
    if (reviewKeywords.some(keyword => query.includes(keyword))) return 'review';
    if (infoKeywords.some(keyword => query.includes(keyword))) return 'information';
    
    return 'browse';
  }

  private extractSearchEntities(query: string): string[] {
    const tokens = natural.WordTokenizer().tokenize(query);
    const entities = [];

    // Extract product entities
    const products = this.findProducts(tokens, 'en');
    entities.push(...products);

    // Extract brand names (capitalized words)
    const brands = tokens.filter(token => 
      /^[A-Z][a-z]+$/.test(token) && token.length > 2
    );
    entities.push(...brands);

    return [...new Set(entities)];
  }

  private detectUrgency(query: string): 'high' | 'medium' | 'low' {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'today', 'now'];
    const mediumKeywords = ['soon', 'quick', 'fast'];

    if (urgentKeywords.some(keyword => query.includes(keyword))) return 'high';
    if (mediumKeywords.some(keyword => query.includes(keyword))) return 'medium';
    
    return 'low';
  }

  private predictCategory(query: string): string | null {
    const categories = {
      'electronics': ['phone', 'mobile', 'laptop', 'computer', 'tv', 'smartphone'],
      'clothing': ['shirt', 'dress', 'saree', 'pant', 'jacket', 'shoes'],
      'books': ['book', 'novel', 'textbook', 'magazine'],
      'home': ['furniture', 'kitchen', 'bedroom', 'decoration']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return category;
      }
    }

    return null;
  }

  private extractPriceRange(query: string): { min?: number; max?: number } | null {
    const pricePattern = /(\d+)\s*(?:to|-)?\s*(\d+)?\s*(?:taka|tk|৳)/gi;
    const match = pricePattern.exec(query);

    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : undefined;
      return { min, max };
    }

    return null;
  }

  private findPersons(tokens: string[]): string[] {
    // Simple person detection based on capitalized names
    return tokens.filter(token => 
      /^[A-Z][a-z]+$/.test(token) && token.length > 2
    );
  }

  private findPlaces(tokens: string[], language: string): string[] {
    const places = language === 'bn' 
      ? ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী']
      : ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'bangladesh'];

    return tokens.filter(token => 
      places.some(place => token.toLowerCase().includes(place.toLowerCase()))
    );
  }

  private findOrganizations(tokens: string[]): string[] {
    const organizations = ['samsung', 'apple', 'google', 'microsoft', 'amazon'];
    return tokens.filter(token => 
      organizations.some(org => token.toLowerCase().includes(org))
    );
  }

  private findProducts(tokens: string[], language: string): string[] {
    const products = language === 'bn' 
      ? this.bengaliPatterns.products
      : ['smartphone', 'laptop', 'saree', 'book', 'shoes', 'dress'];

    return tokens.filter(token => 
      products.some(product => 
        token.toLowerCase().includes(product.toLowerCase())
      )
    );
  }

  private getCommonTerms(): string[] {
    return [
      'smartphone', 'laptop', 'saree', 'traditional', 'electronics',
      'clothing', 'books', 'shoes', 'dress', 'shirt', 'mobile',
      'computer', 'tablet', 'headphones', 'watch', 'bag'
    ];
  }

  private analyzeAspects(review: string): Record<string, number> {
    const aspects = {
      quality: 0,
      price: 0,
      delivery: 0,
      service: 0
    };

    const qualityKeywords = ['quality', 'build', 'material', 'durable'];
    const priceKeywords = ['price', 'cost', 'expensive', 'cheap', 'value'];
    const deliveryKeywords = ['delivery', 'shipping', 'arrived', 'package'];
    const serviceKeywords = ['service', 'support', 'help', 'customer'];

    const reviewSentiment = this.analyzeSentiment(review);
    const baseScore = Math.max(1, Math.min(5, 3 + reviewSentiment.score));

    if (qualityKeywords.some(keyword => review.toLowerCase().includes(keyword))) {
      aspects.quality = baseScore;
    }
    if (priceKeywords.some(keyword => review.toLowerCase().includes(keyword))) {
      aspects.price = baseScore;
    }
    if (deliveryKeywords.some(keyword => review.toLowerCase().includes(keyword))) {
      aspects.delivery = baseScore;
    }
    if (serviceKeywords.some(keyword => review.toLowerCase().includes(keyword))) {
      aspects.service = baseScore;
    }

    return aspects;
  }

  private generateReviewSummary(review: string, sentiment: any): string {
    const keywords = this.extractKeywords(review).slice(0, 3);
    const classification = sentiment.classification;
    
    return `${classification.charAt(0).toUpperCase() + classification.slice(1)} review focusing on ${keywords.join(', ')}`;
  }
}

export default NaturalNLPIntegrationService;