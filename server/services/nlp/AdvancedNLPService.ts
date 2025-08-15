/**
 * Advanced NLP Service for Enhanced Bangla Language Processing
 * Implements Phase 1: Week 1-4 Advanced NLP Infrastructure
 */

interface LanguageModel {
  banglaModel: string;
  englishModel: string;
  phoneticMatcher: string;
  intentClassifier: string;
}

interface ProcessingCapabilities {
  tokenization: string;
  namedEntityRecognition: string;
  sentimentAnalysis: string;
  queryUnderstanding: string;
}

interface PhoneticMapping {
  [key: string]: string[];
}

interface IntentClassification {
  intent: 'search' | 'compare' | 'buy' | 'help' | 'navigate' | 'price_check';
  confidence: number;
  entities: ExtractedEntity[];
}

interface ExtractedEntity {
  entity: string;
  type: 'product' | 'brand' | 'price' | 'category' | 'cultural_term' | 'location';
  value: string;
  confidence: number;
  originalText: string;
}

interface CulturalContext {
  festivals: string[];
  seasons: string[];
  traditionalItems: string[];
  localTerms: string[];
}

export class AdvancedNLPService {
  private static instance: AdvancedNLPService;
  
  private readonly languageModels: LanguageModel = {
    banglaModel: 'bn-BERT-large',
    englishModel: 'en-BERT-base',
    phoneticMatcher: 'custom-bangla-phonetic',
    intentClassifier: 'bangla-intent-recognition'
  };

  private readonly processing: ProcessingCapabilities = {
    tokenization: 'bangla-word-tokenizer',
    namedEntityRecognition: 'bn-NER',
    sentimentAnalysis: 'bangla-sentiment',
    queryUnderstanding: 'semantic-parser'
  };

  // Advanced Bangla Phonetic Mapping System
  private readonly phoneticMappings: PhoneticMapping = {
    // Electronics & Technology
    'মোবাইল': ['mobile', 'mobail', 'mobaile', 'phone'],
    'স্মার্টফোন': ['smartphone', 'smart phone', 'smartphone'],
    'ল্যাপটপ': ['laptop', 'laptop computer'],
    'কম্পিউটার': ['computer', 'komputer'],
    'টেলিভিশন': ['television', 'tv', 'tivi'],
    'ক্যামেরা': ['camera', 'kamera'],
    'হেডফোন': ['headphone', 'headset'],
    
    // Clothing & Fashion
    'জামা': ['shirt', 'jama', 'clothing'],
    'প্যান্ট': ['pant', 'pants', 'trouser'],
    'শাড়ি': ['saree', 'shari', 'sharee'],
    'পাঞ্জাবি': ['punjabi', 'panjabi', 'kurta'],
    'লুঙ্গি': ['lungi', 'longyi'],
    'কামিজ': ['kamiz', 'kameez'],
    'ব্লাউজ': ['blouse', 'blouj'],
    
    // Food & Grocery
    'চাল': ['rice', 'chal', 'chawal'],
    'ডাল': ['dal', 'lentil', 'pulse'],
    'মাছ': ['fish', 'mach', 'machh'],
    'মাংস': ['meat', 'mangsho', 'mangso'],
    'সবজি': ['vegetable', 'vegetables', 'shabjee'],
    'ফল': ['fruit', 'fruits', 'fol'],
    
    // Cultural & Festival Items
    'ঈদ': ['eid', 'id', 'eid collection'],
    'পহেলা বৈশাখ': ['pohela boishakh', 'poila boishakh', 'bengali new year'],
    'দুর্গা পূজা': ['durga puja', 'durga pujo', 'puja items'],
    'বিয়ে': ['wedding', 'biye', 'marriage', 'shaadi'],
    
    // Home & Kitchen
    'ঘর': ['home', 'ghor', 'house'],
    'রান্নাঘর': ['kitchen', 'rannaghor'],
    'বিছানা': ['bed', 'bichana'],
    'চেয়ার': ['chair', 'cheyar'],
    'টেবিল': ['table', 'tebil'],
    
    // Beauty & Personal Care
    'সাবান': ['soap', 'shaban'],
    'শ্যাম্পু': ['shampoo', 'shampu'],
    'তেল': ['oil', 'tel'],
    'ক্রিম': ['cream', 'krim'],
    'পারফিউম': ['perfume', 'attar'],
    
    // Sports & Recreation
    'ক্রিকেট': ['cricket', 'kriket'],
    'ফুটবল': ['football', 'futbol', 'soccer'],
    'ব্যাডমিন্টন': ['badminton', 'bedminton'],
    'খেলা': ['game', 'khela', 'sports']
  };

  // Cultural Context Database
  private readonly culturalContext: CulturalContext = {
    festivals: [
      'ঈদুল ফিতর', 'ঈদুল আযহা', 'পহেলা বৈশাখ', 'দুর্গা পূজা', 
      'কালী পূজা', 'সরস্বতী পূজা', 'একুশে ফেব্রুয়ারি', 'বিজয় দিবস',
      'স্বাধীনতা দিবস', 'শব-ই-বরাত', 'শব-ই-কদর'
    ],
    seasons: [
      'গ্রীষ্মকাল', 'বর্ষাকাল', 'শীতকাল', 'বসন্তকাল', 
      'রমজান', 'ঈদ সিজন', 'পূজা সিজন', 'বিয়ে সিজন'
    ],
    traditionalItems: [
      'শাড়ি', 'পাঞ্জাবি', 'লুঙ্গি', 'গামছা', 'কাঁথা', 'ধুতি',
      'হিলসা মাছ', 'আম', 'কাঁঠাল', 'পিঠা', 'রসগোল্লা', 'মিষ্টি'
    ],
    localTerms: [
      'বাজার', 'দোকান', 'হাট', 'মেলা', 'পাড়া', 'গ্রাম', 'শহর',
      'টাকা', 'পয়সা', 'দাম', 'দর', 'কেনা', 'বিক্রি', 'ছাড়'
    ]
  };

  // Intent Classification Patterns
  private readonly intentPatterns = {
    search: [
      /খুঁজছি|খুজছি|দেখতে চাই|চাই|আছে কি|পাওয়া যায়/,
      /looking for|want|need|search|find|show me/
    ],
    compare: [
      /তুলনা|comparison|compare|দাম দেখ|price check|কোনটা ভাল/,
      /which is better|vs|versus|difference/
    ],
    buy: [
      /কিনব|কিনতে চাই|অর্ডার|কার্টে|buy|purchase|order|cart/,
      /add to cart|checkout|কিনি/
    ],
    help: [
      /সাহায্য|help|support|জানতে চাই|বুঝতে পারছি না/,
      /how to|what is|explain|guide/
    ],
    price_check: [
      /দাম কত|price|cost|কত টাকা|price range|budget/,
      /cheap|expensive|affordable|সস্তা|দামি/
    ]
  };

  public static getInstance(): AdvancedNLPService {
    if (!AdvancedNLPService.instance) {
      AdvancedNLPService.instance = new AdvancedNLPService();
    }
    return AdvancedNLPService.instance;
  }

  /**
   * Enhanced Bangla Phonetic Search
   * Converts Bangla text to English equivalents and vice versa
   */
  public phoneticSearch(query: string): string[] {
    const normalizedQuery = query.toLowerCase().trim();
    const phoneticMatches: Set<string> = new Set();

    // Add original query
    phoneticMatches.add(normalizedQuery);

    // Check for direct phonetic mappings
    Object.entries(this.phoneticMappings).forEach(([bangla, englishVariants]) => {
      if (normalizedQuery.includes(bangla.toLowerCase())) {
        englishVariants.forEach(variant => phoneticMatches.add(variant));
      }
      
      englishVariants.forEach(variant => {
        if (normalizedQuery.includes(variant.toLowerCase())) {
          phoneticMatches.add(bangla);
        }
      });
    });

    // Advanced phonetic pattern matching
    this.generatePhoneticVariations(normalizedQuery).forEach(variation => {
      phoneticMatches.add(variation);
    });

    return Array.from(phoneticMatches);
  }

  /**
   * Advanced Intent Classification
   */
  public async classifyIntent(query: string): Promise<IntentClassification> {
    const normalizedQuery = query.toLowerCase();
    let maxConfidence = 0;
    let detectedIntent: IntentClassification['intent'] = 'search';

    // Pattern-based intent detection
    Object.entries(this.intentPatterns).forEach(([intent, patterns]) => {
      patterns.forEach(pattern => {
        const match = normalizedQuery.match(pattern);
        if (match) {
          const confidence = this.calculateIntentConfidence(match, normalizedQuery);
          if (confidence > maxConfidence) {
            maxConfidence = confidence;
            detectedIntent = intent as IntentClassification['intent'];
          }
        }
      });
    });

    // Extract entities
    const entities = await this.extractEntities(query);

    return {
      intent: detectedIntent,
      confidence: Math.max(maxConfidence, 0.7), // Minimum confidence
      entities
    };
  }

  /**
   * Named Entity Recognition with Bangla Support
   */
  public async extractEntities(query: string): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];
    const normalizedQuery = query.toLowerCase();

    // Product category detection
    const productCategories = [
      'mobile', 'laptop', 'tv', 'camera', 'headphone',
      'shirt', 'pant', 'saree', 'shoes', 'bag',
      'rice', 'oil', 'fish', 'meat', 'vegetables'
    ];

    productCategories.forEach(category => {
      if (normalizedQuery.includes(category)) {
        entities.push({
          entity: category,
          type: 'category',
          value: category,
          confidence: 0.8,
          originalText: category
        });
      }
    });

    // Brand detection
    const brands = [
      'samsung', 'apple', 'xiaomi', 'huawei', 'nokia',
      'sony', 'lg', 'dell', 'hp', 'asus'
    ];

    brands.forEach(brand => {
      if (normalizedQuery.includes(brand)) {
        entities.push({
          entity: brand,
          type: 'brand',
          value: brand,
          confidence: 0.9,
          originalText: brand
        });
      }
    });

    // Price detection
    const pricePatterns = [
      /(\d+)\s*টাকা/g,
      /(\d+)\s*taka/g,
      /৳\s*(\d+)/g,
      /\$\s*(\d+)/g,
      /under\s+(\d+)/g,
      /below\s+(\d+)/g
    ];

    pricePatterns.forEach(pattern => {
      const matches = normalizedQuery.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const price = match.match(/\d+/)?.[0];
          if (price) {
            entities.push({
              entity: 'price',
              type: 'price',
              value: price,
              confidence: 0.9,
              originalText: match
            });
          }
        });
      }
    });

    // Cultural term detection
    this.culturalContext.festivals.forEach(festival => {
      if (normalizedQuery.includes(festival.toLowerCase())) {
        entities.push({
          entity: festival,
          type: 'cultural_term',
          value: festival,
          confidence: 0.8,
          originalText: festival
        });
      }
    });

    return entities;
  }

  /**
   * Sentiment Analysis for Query Understanding
   */
  public analyzeSentiment(query: string): {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    urgency: 'low' | 'medium' | 'high';
  } {
    const normalizedQuery = query.toLowerCase();
    
    // Positive indicators
    const positiveWords = [
      'ভাল', 'চমৎকার', 'সুন্দর', 'পছন্দ', 'দারুণ',
      'good', 'great', 'excellent', 'amazing', 'love', 'like'
    ];

    // Negative indicators
    const negativeWords = [
      'খারাপ', 'ভাল না', 'পছন্দ না', 'সমস্যা',
      'bad', 'terrible', 'hate', 'problem', 'issue', 'wrong'
    ];

    // Urgency indicators
    const urgencyWords = [
      'জরুরি', 'তাড়াতাড়ি', 'এখনই', 'আজই',
      'urgent', 'asap', 'immediately', 'now', 'today'
    ];

    let positiveScore = 0;
    let negativeScore = 0;
    let urgencyScore = 0;

    positiveWords.forEach(word => {
      if (normalizedQuery.includes(word)) positiveScore++;
    });

    negativeWords.forEach(word => {
      if (normalizedQuery.includes(word)) negativeScore++;
    });

    urgencyWords.forEach(word => {
      if (normalizedQuery.includes(word)) urgencyScore++;
    });

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 0.5;

    if (positiveScore > negativeScore) {
      sentiment = 'positive';
      confidence = Math.min(0.9, 0.6 + (positiveScore * 0.1));
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
      confidence = Math.min(0.9, 0.6 + (negativeScore * 0.1));
    }

    let urgency: 'low' | 'medium' | 'high' = 'low';
    if (urgencyScore > 0) {
      urgency = urgencyScore >= 2 ? 'high' : 'medium';
    }

    return { sentiment, confidence, urgency };
  }

  /**
   * Semantic Query Understanding
   */
  public async parseSemanticQuery(query: string): Promise<{
    mainIntent: string;
    subIntents: string[];
    semanticMeaning: string;
    queryExpansion: string[];
    culturalContext: string[];
  }> {
    const intent = await this.classifyIntent(query);
    const entities = await this.extractEntities(query);
    const sentiment = this.analyzeSentiment(query);
    const phoneticVariations = this.phoneticSearch(query);

    // Determine cultural context
    const culturalContext: string[] = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;

    // Festival-based context
    if (currentMonth === 4 || currentMonth === 5) {
      culturalContext.push('Pohela Boishakh Season');
    }
    if (currentMonth >= 9 && currentMonth <= 11) {
      culturalContext.push('Festival Season', 'Puja Season');
    }
    if (currentMonth === 12 || currentMonth === 1) {
      culturalContext.push('Winter Season', 'Wedding Season');
    }

    // Query expansion based on context
    const queryExpansion = [...phoneticVariations];
    entities.forEach(entity => {
      if (entity.type === 'category') {
        queryExpansion.push(...this.getCategoryExpansion(entity.value));
      }
    });

    return {
      mainIntent: intent.intent,
      subIntents: entities.map(e => e.type),
      semanticMeaning: this.generateSemanticMeaning(query, intent, entities),
      queryExpansion,
      culturalContext
    };
  }

  /**
   * Generate phonetic variations for advanced matching
   */
  private generatePhoneticVariations(query: string): string[] {
    const variations: string[] = [];
    
    // Common Bangla-English transliteration patterns
    const transliterationMap = {
      'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh',
      'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh',
      'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh',
      'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh',
      'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh',
      'ম': 'm', 'য': 'y', 'র': 'r', 'ল': 'l',
      'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
      'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u',
      'ে': 'e', 'ৈ': 'ai', 'ো': 'o', 'ৌ': 'ou'
    };

    // Apply transliteration if query contains Bangla characters
    let transliterated = query;
    Object.entries(transliterationMap).forEach(([bangla, english]) => {
      transliterated = transliterated.replace(new RegExp(bangla, 'g'), english);
    });

    if (transliterated !== query) {
      variations.push(transliterated);
    }

    return variations;
  }

  /**
   * Calculate intent confidence based on pattern match
   */
  private calculateIntentConfidence(match: RegExpMatchArray, query: string): number {
    const matchLength = match[0].length;
    const queryLength = query.length;
    const coverage = matchLength / queryLength;
    
    // Base confidence + coverage bonus
    return Math.min(0.95, 0.6 + (coverage * 0.3));
  }

  /**
   * Get category expansion terms
   */
  private getCategoryExpansion(category: string): string[] {
    const expansions: { [key: string]: string[] } = {
      mobile: ['smartphone', 'phone', 'cell phone', 'android', 'ios'],
      laptop: ['computer', 'notebook', 'gaming laptop', 'ultrabook'],
      tv: ['television', 'smart tv', 'led tv', 'lcd tv'],
      shirt: ['t-shirt', 'polo', 'formal shirt', 'casual shirt'],
      saree: ['traditional wear', 'ethnic wear', 'indian wear']
    };

    return expansions[category] || [];
  }

  /**
   * Generate semantic meaning description
   */
  private generateSemanticMeaning(
    query: string, 
    intent: IntentClassification, 
    entities: ExtractedEntity[]
  ): string {
    const entityTypes = entities.map(e => e.type).join(', ');
    const mainEntity = entities.find(e => e.type === 'product' || e.type === 'category');
    
    let meaning = `User wants to ${intent.intent}`;
    
    if (mainEntity) {
      meaning += ` for ${mainEntity.value}`;
    }
    
    if (entityTypes) {
      meaning += ` (entities: ${entityTypes})`;
    }

    return meaning;
  }
}

export default AdvancedNLPService;