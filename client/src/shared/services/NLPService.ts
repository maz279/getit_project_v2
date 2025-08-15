
export class NLPService {
  private static instance: NLPService;
  private isInitialized = false;
  private languageModels: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('🧠 Initializing NLP Service...');
    
    // Initialize language models (simulated for demo)
    this.languageModels.set('sentiment', { ready: true });
    this.languageModels.set('translation', { ready: true });
    this.languageModels.set('entities', { ready: true });
    this.languageModels.set('summarization', { ready: true });
    
    this.isInitialized = true;
    console.log('✅ NLP Service initialized successfully');
  }

  // Advanced Sentiment Analysis
  async analyzeSentiment(text: string, options?: {
    language?: 'en' | 'bn';
    detailed?: boolean;
  }): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: string[];
    aspects?: Array<{
      aspect: string;
      sentiment: string;
      confidence: number;
    }>;
  }> {
    console.log('NLP: Analyzing sentiment for text');
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const text_lower = text.toLowerCase();
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 0.5;
    
    // Enhanced sentiment detection
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'awesome', 'fantastic', 'perfect', 'outstanding'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'poor', 'useless'];
    
    const positiveCount = positiveWords.filter(word => text_lower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text_lower.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(0.7 + (positiveCount * 0.1), 0.95);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(0.7 + (negativeCount * 0.1), 0.95);
    }
    
    const emotions = this.extractEmotions(text_lower, sentiment);
    const aspects = options?.detailed ? this.extractAspects(text) : undefined;
    
    return {
      sentiment,
      confidence,
      emotions,
      aspects
    };
  }

  // Named Entity Recognition
  async extractEntities(text: string, language: 'en' | 'bn' = 'en'): Promise<{
    entities: Array<{
      text: string;
      label: string;
      confidence: number;
      start: number;
      end: number;
    }>;
    brands: string[];
    products: string[];
    locations: string[];
    dates: string[];
    prices: string[];
  }> {
    console.log('NLP: Extracting entities from text');
    
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const entities = [];
    const brands = [];
    const products = [];
    const locations = [];
    const dates = [];
    const prices = [];
    
    // Brand detection
    const brandPatterns = ['samsung', 'apple', 'nike', 'adidas', 'dell', 'hp', 'sony', 'lg'];
    brandPatterns.forEach(brand => {
      const index = text.toLowerCase().indexOf(brand);
      if (index !== -1) {
        entities.push({
          text: brand,
          label: 'BRAND',
          confidence: 0.9,
          start: index,
          end: index + brand.length
        });
        brands.push(brand);
      }
    });
    
    // Product detection
    const productPatterns = ['phone', 'laptop', 'shoes', 'shirt', 'watch', 'headphones'];
    productPatterns.forEach(product => {
      const index = text.toLowerCase().indexOf(product);
      if (index !== -1) {
        entities.push({
          text: product,
          label: 'PRODUCT',
          confidence: 0.85,
          start: index,
          end: index + product.length
        });
        products.push(product);
      }
    });
    
    // Price detection
    const priceRegex = /৳\s*(\d+(?:,\d{3})*)|(\d+(?:,\d{3})*)\s*taka|(\d+(?:,\d{3})*)\s*tk/gi;
    let match;
    while ((match = priceRegex.exec(text)) !== null) {
      entities.push({
        text: match[0],
        label: 'PRICE',
        confidence: 0.95,
        start: match.index,
        end: match.index + match[0].length
      });
      prices.push(match[0]);
    }
    
    // Location detection
    const locationPatterns = ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal'];
    locationPatterns.forEach(location => {
      const index = text.toLowerCase().indexOf(location);
      if (index !== -1) {
        entities.push({
          text: location,
          label: 'LOCATION',
          confidence: 0.8,
          start: index,
          end: index + location.length
        });
        locations.push(location);
      }
    });
    
    return {
      entities,
      brands,
      products,
      locations,
      dates,
      prices
    };
  }

  // Language Translation
  async translateText(text: string, options: {
    from: 'en' | 'bn' | 'auto';
    to: 'en' | 'bn';
  }): Promise<{
    translatedText: string;
    detectedLanguage?: string;
    confidence: number;
  }> {
    console.log('NLP: Translating text');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simple translation simulation
    const englishToBengali: { [key: string]: string } = {
      'search': 'খুঁজুন',
      'product': 'পণ্য',
      'price': 'দাম',
      'buy': 'কিনুন',
      'cart': 'কার্ট',
      'electronics': 'ইলেকট্রনিক্স',
      'fashion': 'ফ্যাশন',
      'home': 'বাড়ি',
      'books': 'বই'
    };
    
    const bengaliToEnglish: { [key: string]: string } = Object.fromEntries(
      Object.entries(englishToBengali).map(([en, bn]) => [bn, en])
    );
    
    let translatedText = text;
    let detectedLanguage = options.from;
    
    if (options.from === 'auto') {
      // Simple language detection
      const bengaliChars = /[\u0980-\u09FF]/.test(text);
      detectedLanguage = bengaliChars ? 'bn' : 'en';
    }
    
    if (detectedLanguage === 'en' && options.to === 'bn') {
      Object.entries(englishToBengali).forEach(([en, bn]) => {
        translatedText = translatedText.replace(new RegExp(en, 'gi'), bn);
      });
    } else if (detectedLanguage === 'bn' && options.to === 'en') {
      Object.entries(bengaliToEnglish).forEach(([bn, en]) => {
        translatedText = translatedText.replace(new RegExp(bn, 'g'), en);
      });
    }
    
    return {
      translatedText,
      detectedLanguage,
      confidence: 0.85
    };
  }

  // Text Summarization
  async summarizeText(text: string, options?: {
    maxLength?: number;
    style?: 'extractive' | 'abstractive';
    language?: 'en' | 'bn';
  }): Promise<{
    summary: string;
    keyPoints: string[];
    confidence: number;
  }> {
    console.log('NLP: Summarizing text');
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxLength = options?.maxLength || 100;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Simple extractive summarization
    const importantSentences = sentences
      .map(sentence => ({
        text: sentence.trim(),
        score: this.calculateSentenceImportance(sentence)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, Math.floor(sentences.length / 3)));
    
    const summary = importantSentences
      .map(s => s.text)
      .join('. ')
      .substring(0, maxLength) + '...';
    
    const keyPoints = importantSentences
      .slice(0, 3)
      .map(s => s.text);
    
    return {
      summary,
      keyPoints,
      confidence: 0.8
    };
  }

  // Intent Classification
  async classifyIntent(text: string): Promise<{
    intent: string;
    confidence: number;
    subIntents: Array<{
      intent: string;
      confidence: number;
    }>;
  }> {
    console.log('NLP: Classifying intent');
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const text_lower = text.toLowerCase();
    
    const intentPatterns = {
      'search_product': ['find', 'search', 'looking for', 'need', 'want'],
      'price_inquiry': ['price', 'cost', 'how much', 'expensive'],
      'comparison': ['compare', 'vs', 'versus', 'difference', 'better'],
      'recommendation': ['recommend', 'suggest', 'best', 'top'],
      'complaint': ['problem', 'issue', 'wrong', 'defective', 'broken'],
      'support': ['help', 'support', 'how to', 'assistance'],
      'navigation': ['go to', 'page', 'section', 'category']
    };
    
    const scores: { [key: string]: number } = {};
    
    Object.entries(intentPatterns).forEach(([intent, patterns]) => {
      scores[intent] = patterns.filter(pattern => text_lower.includes(pattern)).length;
    });
    
    const topIntent = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0];
    
    const subIntents = Object.entries(scores)
      .filter(([intent, score]) => score > 0 && intent !== topIntent[0])
      .map(([intent, score]) => ({
        intent,
        confidence: Math.min(score * 0.2, 0.8)
      }))
      .slice(0, 3);
    
    return {
      intent: topIntent[0] || 'general',
      confidence: Math.min(topIntent[1] * 0.3, 0.9) || 0.5,
      subIntents
    };
  }

  // Keyword Extraction
  async extractKeywords(text: string, options?: {
    maxKeywords?: number;
    minLength?: number;
  }): Promise<{
    keywords: Array<{
      word: string;
      score: number;
      frequency: number;
    }>;
    phrases: Array<{
      phrase: string;
      score: number;
    }>;
  }> {
    console.log('NLP: Extracting keywords');
    
    const maxKeywords = options?.maxKeywords || 10;
    const minLength = options?.minLength || 3;
    
    // Remove common stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'
    ]);
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= minLength && !stopWords.has(word));
    
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const keywords = Object.entries(wordFreq)
      .map(([word, frequency]) => ({
        word,
        score: frequency / words.length,
        frequency
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxKeywords);
    
    // Extract key phrases (2-3 word combinations)
    const phrases = [];
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (i < words.length - 2) {
        const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        phrases.push({ phrase: trigram, score: 0.8 });
      }
      phrases.push({ phrase: bigram, score: 0.6 });
    }
    
    const uniquePhrases = phrases
      .filter((phrase, index, self) => 
        self.findIndex(p => p.phrase === phrase.phrase) === index
      )
      .slice(0, 5);
    
    return {
      keywords,
      phrases: uniquePhrases
    };
  }

  private extractEmotions(text: string, sentiment: string): string[] {
    const emotionPatterns = {
      joy: ['happy', 'excited', 'delighted', 'pleased'],
      anger: ['angry', 'furious', 'mad', 'annoyed'],
      sadness: ['sad', 'disappointed', 'upset', 'unhappy'],
      fear: ['scared', 'worried', 'anxious', 'concerned'],
      surprise: ['surprised', 'amazed', 'shocked', 'astonished']
    };
    
    const emotions = [];
    Object.entries(emotionPatterns).forEach(([emotion, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        emotions.push(emotion);
      }
    });
    
    if (emotions.length === 0) {
      emotions.push(sentiment === 'positive' ? 'satisfaction' : 
                   sentiment === 'negative' ? 'dissatisfaction' : 'neutral');
    }
    
    return emotions;
  }

  private extractAspects(text: string): Array<{
    aspect: string;
    sentiment: string;
    confidence: number;
  }> {
    const aspects = [
      { keyword: 'price', aspect: 'pricing' },
      { keyword: 'quality', aspect: 'quality' },
      { keyword: 'delivery', aspect: 'shipping' },
      { keyword: 'service', aspect: 'customer_service' },
      { keyword: 'product', aspect: 'product_quality' }
    ];
    
    return aspects
      .filter(({ keyword }) => text.toLowerCase().includes(keyword))
      .map(({ aspect }) => ({
        aspect,
        sentiment: 'positive', // Simplified
        confidence: 0.7
      }));
  }

  private calculateSentenceImportance(sentence: string): number {
    // Simple scoring based on length, keywords, and position
    const importantWords = ['best', 'excellent', 'quality', 'price', 'delivery', 'service'];
    const wordCount = sentence.split(' ').length;
    const importantWordCount = importantWords.filter(word => 
      sentence.toLowerCase().includes(word)
    ).length;
    
    return (wordCount * 0.1) + (importantWordCount * 0.5);
  }
}

export const nlpService = NLPService.getInstance();
