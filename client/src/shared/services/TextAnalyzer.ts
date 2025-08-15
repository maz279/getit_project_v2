
export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: string[];
  intensity: number;
}

export interface KeywordExtraction {
  keywords: Array<{
    word: string;
    relevance: number;
    frequency: number;
    category?: string;
  }>;
  phrases: string[];
  tags: string[];
}

export interface EntityExtraction {
  entities: Array<{
    text: string;
    type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'PRODUCT' | 'BRAND' | 'PRICE';
    confidence: number;
    startIndex: number;
    endIndex: number;
  }>;
  brands: string[];
  products: string[];
  locations: string[];
  prices: Array<{ amount: number; currency: string }>;
}

export class TextAnalyzer {
  private static instance: TextAnalyzer;

  public static getInstance(): TextAnalyzer {
    if (!TextAnalyzer.instance) {
      TextAnalyzer.instance = new TextAnalyzer();
    }
    return TextAnalyzer.instance;
  }

  async initialize(): Promise<void> {
    console.log('📝 Initializing Text Analyzer...');
  }

  async analyzeSentiment(text: string, language: 'en' | 'bn' = 'en'): Promise<SentimentAnalysis> {
    console.log('😊 Analyzing sentiment...');
    
    // Mock sentiment analysis with more sophisticated logic
    const words = text.toLowerCase().split(/\s+/);
    
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'best', 'awesome', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'useless'];
    const neutralWords = ['okay', 'average', 'normal', 'standard', 'regular'];

    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
      if (neutralWords.includes(word)) neutralScore++;
    });

    const totalScore = positiveScore + negativeScore + neutralScore;
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    let confidence: number;
    let intensity: number;

    if (positiveScore > negativeScore && positiveScore > neutralScore) {
      sentiment = 'positive';
      confidence = totalScore > 0 ? positiveScore / totalScore : 0.5;
      intensity = Math.min(1, positiveScore / 3);
    } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
      sentiment = 'negative';
      confidence = totalScore > 0 ? negativeScore / totalScore : 0.5;
      intensity = Math.min(1, negativeScore / 3);
    } else {
      sentiment = 'neutral';
      confidence = 0.6;
      intensity = 0.3;
    }

    // Adjust confidence based on text length
    if (words.length < 5) confidence *= 0.7;
    if (words.length > 50) confidence *= 1.2;
    confidence = Math.min(0.95, Math.max(0.1, confidence));

    const emotions = this.detectEmotions(text, sentiment);

    return {
      sentiment,
      confidence,
      emotions,
      intensity
    };
  }

  async extractKeywords(text: string, language: 'en' | 'bn' = 'en'): Promise<KeywordExtraction> {
    console.log('🔑 Extracting keywords...');

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'this', 'that', 'these', 'those'
    ]);

    const filteredWords = words.filter(word => !stopWords.has(word));

    // Count word frequency
    const wordFreq: { [key: string]: number } = {};
    filteredWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Calculate relevance (simplified TF-IDF approximation)
    const keywords = Object.entries(wordFreq)
      .map(([word, frequency]) => ({
        word,
        relevance: frequency / filteredWords.length,
        frequency,
        category: this.categorizeKeyword(word)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    // Extract phrases (simplified)
    const phrases = this.extractPhrases(text);
    
    // Generate tags
    const tags = keywords.slice(0, 5).map(k => k.word);

    return {
      keywords,
      phrases,
      tags
    };
  }

  async extractEntities(text: string): Promise<EntityExtraction> {
    console.log('🏷️ Extracting entities...');

    const entities: EntityExtraction['entities'] = [];
    const brands: string[] = [];
    const products: string[] = [];
    const locations: string[] = [];
    const prices: Array<{ amount: number; currency: string }> = [];

    // Brand detection (simplified)
    const brandPatterns = ['samsung', 'apple', 'sony', 'lg', 'nike', 'adidas', 'zara', 'h&m'];
    brandPatterns.forEach(brand => {
      const regex = new RegExp(`\\b${brand}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          text: match[0],
          type: 'BRAND',
          confidence: 0.9,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
        brands.push(match[0]);
      }
    });

    // Product detection (simplified)
    const productPatterns = ['phone', 'smartphone', 'laptop', 'tablet', 'headphones', 'shoes', 'shirt', 'dress'];
    productPatterns.forEach(product => {
      const regex = new RegExp(`\\b${product}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          text: match[0],
          type: 'PRODUCT',
          confidence: 0.8,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
        products.push(match[0]);
      }
    });

    // Location detection (simplified)
    const locationPatterns = ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'bangladesh', 'usa', 'uk'];
    locationPatterns.forEach(location => {
      const regex = new RegExp(`\\b${location}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          text: match[0],
          type: 'LOCATION',
          confidence: 0.85,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
        locations.push(match[0]);
      }
    });

    // Price detection
    const priceRegex = /(?:৳|tk|taka|usd|\$|rs)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi;
    let priceMatch;
    while ((priceMatch = priceRegex.exec(text)) !== null) {
      const currency = priceMatch[0].match(/৳|tk|taka/) ? 'BDT' : 
                     priceMatch[0].match(/usd|\$/) ? 'USD' : 'BDT';
      const amount = parseFloat(priceMatch[1].replace(/,/g, ''));
      
      entities.push({
        text: priceMatch[0],
        type: 'PRICE',
        confidence: 0.95,
        startIndex: priceMatch.index,
        endIndex: priceMatch.index + priceMatch[0].length
      });
      
      prices.push({ amount, currency });
    }

    return {
      entities,
      brands: [...new Set(brands)],
      products: [...new Set(products)],
      locations: [...new Set(locations)],
      prices
    };
  }

  async extractTopics(text: string): Promise<{
    topics: string[];
    categories: string[];
    confidence: number;
  }> {
    console.log('📚 Extracting topics...');

    const keywords = await this.extractKeywords(text);
    
    // Topic modeling (simplified)
    const topicWords = keywords.keywords
      .filter(k => k.relevance > 0.1)
      .map(k => k.word);

    // Categorize into topics
    const topics = this.categorizeIntoTopics(topicWords);
    const categories = this.identifyCategories(topicWords);

    return {
      topics,
      categories,
      confidence: topicWords.length > 3 ? 0.8 : 0.5
    };
  }

  async detectLanguage(text: string): Promise<{
    language: string;
    confidence: number;
    script: string;
  }> {
    console.log('🌐 Detecting language...');

    // Simple language detection
    const bengaliChars = /[\u0980-\u09FF]/;
    const hasBengali = bengaliChars.test(text);
    
    if (hasBengali) {
      return {
        language: 'bn',
        confidence: 0.9,
        script: 'Bengali'
      };
    } else {
      return {
        language: 'en',
        confidence: 0.85,
        script: 'Latin'
      };
    }
  }

  async analyzeReadability(text: string): Promise<{
    score: number;
    level: 'easy' | 'medium' | 'hard';
    suggestions: string[];
  }> {
    console.log('📖 Analyzing readability...');

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(text);

    // Simplified Flesch Reading Ease
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    const normalizedScore = Math.max(0, Math.min(1, fleschScore / 100));

    let level: 'easy' | 'medium' | 'hard';
    if (normalizedScore > 0.7) level = 'easy';
    else if (normalizedScore > 0.4) level = 'medium';
    else level = 'hard';

    const suggestions = this.generateReadabilitySuggestions(avgSentenceLength, avgSyllablesPerWord);

    return {
      score: normalizedScore,
      level,
      suggestions
    };
  }

  async detectIntent(text: string): Promise<{
    intent: string;
    confidence: number;
    category: string;
  }> {
    console.log('🎯 Detecting intent...');

    const lowerText = text.toLowerCase();
    
    // Intent patterns
    const intents = [
      { pattern: /buy|purchase|order|checkout/, intent: 'purchase', category: 'commerce' },
      { pattern: /search|find|look|show/, intent: 'search', category: 'navigation' },
      { pattern: /help|support|problem|issue/, intent: 'support', category: 'assistance' },
      { pattern: /compare|vs|versus|difference/, intent: 'compare', category: 'research' },
      { pattern: /price|cost|cheap|expensive/, intent: 'pricing', category: 'commerce' },
      { pattern: /review|rating|feedback|opinion/, intent: 'review', category: 'information' },
      { pattern: /return|refund|exchange/, intent: 'return', category: 'support' },
      { pattern: /shipping|delivery|track/, intent: 'shipping', category: 'logistics' }
    ];

    for (const intentData of intents) {
      if (intentData.pattern.test(lowerText)) {
        return {
          intent: intentData.intent,
          confidence: 0.8,
          category: intentData.category
        };
      }
    }

    return {
      intent: 'general',
      confidence: 0.5,
      category: 'general'
    };
  }

  private detectEmotions(text: string, sentiment: string): string[] {
    const emotions = [];
    const lowerText = text.toLowerCase();

    if (sentiment === 'positive') {
      if (lowerText.includes('love') || lowerText.includes('amazing')) emotions.push('joy');
      if (lowerText.includes('excited') || lowerText.includes('can\'t wait')) emotions.push('excitement');
      if (lowerText.includes('satisfied') || lowerText.includes('pleased')) emotions.push('satisfaction');
    } else if (sentiment === 'negative') {
      if (lowerText.includes('angry') || lowerText.includes('frustrated')) emotions.push('anger');
      if (lowerText.includes('disappointed') || lowerText.includes('sad')) emotions.push('disappointment');
      if (lowerText.includes('confused') || lowerText.includes('unclear')) emotions.push('confusion');
    } else {
      emotions.push('neutral');
    }

    return emotions.length > 0 ? emotions : ['neutral'];
  }

  private categorizeKeyword(word: string): string {
    const categories = {
      technology: ['phone', 'computer', 'laptop', 'software', 'app', 'digital'],
      fashion: ['dress', 'shirt', 'shoes', 'fashion', 'clothing', 'style'],
      home: ['furniture', 'kitchen', 'appliance', 'home', 'decor'],
      electronics: ['camera', 'tv', 'speaker', 'headphones', 'gadget'],
      sports: ['sport', 'fitness', 'exercise', 'gym', 'athletic'],
      beauty: ['beauty', 'makeup', 'cosmetic', 'skincare', 'fragrance']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => word.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  private extractPhrases(text: string): string[] {
    // Simple phrase extraction (2-3 word combinations)
    const words = text.toLowerCase().split(/\s+/);
    const phrases = [];

    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
      if (i < words.length - 2) {
        phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      }
    }

    return phrases.slice(0, 10);
  }

  private categorizeIntoTopics(words: string[]): string[] {
    const topicKeywords = {
      'e-commerce': ['buy', 'sell', 'shop', 'price', 'order', 'payment'],
      'product-review': ['review', 'rating', 'quality', 'good', 'bad', 'recommend'],
      'customer-service': ['help', 'support', 'problem', 'issue', 'question'],
      'delivery': ['shipping', 'delivery', 'fast', 'slow', 'arrived'],
      'technology': ['phone', 'computer', 'software', 'app', 'digital']
    };

    const topics = [];
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics.length > 0 ? topics : ['general'];
  }

  private identifyCategories(words: string[]): string[] {
    const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty'];
    return categories.slice(0, Math.min(3, categories.length));
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    let syllableCount = 0;

    words.forEach(word => {
      let syllables = word.match(/[aeiouy]+/g);
      syllableCount += syllables ? syllables.length : 1;
    });

    return syllableCount;
  }

  private generateReadabilitySuggestions(avgSentenceLength: number, avgSyllablesPerWord: number): string[] {
    const suggestions = [];

    if (avgSentenceLength > 20) {
      suggestions.push('Consider shorter sentences for better readability');
    }

    if (avgSyllablesPerWord > 2) {
      suggestions.push('Use simpler words when possible');
    }

    if (suggestions.length === 0) {
      suggestions.push('Text readability is good');
    }

    return suggestions;
  }
}

export const textAnalyzer = TextAnalyzer.getInstance();
