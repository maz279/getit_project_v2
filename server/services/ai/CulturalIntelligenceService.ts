/**
 * CULTURAL INTELLIGENCE SERVICE - Bangladesh E-commerce Context Engine
 * Advanced cultural awareness for contextual product suggestions
 * Production Implementation: July 20, 2025
 */

interface BangladeshFestival {
  name: string;
  localName: string;
  description: string;
  timing: {
    months: number[];
    duration: number; // days
    isVariable: boolean; // lunar calendar dependency
  };
  culturalProducts: string[];
  searchBoostKeywords: string[];
  traditionalColors: string[];
  modernAdaptations: string[];
}

interface RegionalPreferences {
  division: string;
  localName: string;
  culturalStrength: number; // 0-1 scale
  modernAdoption: number; // 0-1 scale
  economicLevel: 'high' | 'medium' | 'low';
  preferredCategories: string[];
  traditionalProducts: string[];
  localBrands: string[];
  deliveryPreferences: string[];
}

interface TraditionalProductMapping {
  english: string;
  bangla: string;
  alternativeNames: string[];
  category: string;
  culturalSignificance: 'high' | 'medium' | 'low';
  festivalRelevance: string[];
  regionalVariations: { [division: string]: string };
}

export class CulturalIntelligenceService {
  private static instance: CulturalIntelligenceService;

  // Bangladesh Festival Intelligence Database
  private readonly BANGLADESH_FESTIVALS: BangladeshFestival[] = [
    {
      name: 'Eid ul-Fitr',
      localName: 'ঈদুল ফিতর',
      description: 'Major Islamic festival after Ramadan',
      timing: { months: [5, 6, 7], duration: 3, isVariable: true },
      culturalProducts: ['panjabi', 'saree', 'jewelry', 'sweets', 'perfume', 'gifts'],
      searchBoostKeywords: ['eid', 'ঈদ', 'festival', 'traditional', 'islamic', 'celebration'],
      traditionalColors: ['white', 'green', 'gold', 'silver'],
      modernAdaptations: ['designer panjabi', 'fusion wear', 'digital gifts']
    },
    {
      name: 'Durga Puja',
      localName: 'দুর্গা পূজা',
      description: 'Major Hindu festival celebrating Goddess Durga',
      timing: { months: [9, 10], duration: 5, isVariable: true },
      culturalProducts: ['saree', 'dhoti', 'jewelry', 'flowers', 'decoration'],
      searchBoostKeywords: ['durga', 'puja', 'দুর্গা', 'পূজা', 'hindu', 'goddess'],
      traditionalColors: ['red', 'white', 'yellow', 'orange'],
      modernAdaptations: ['contemporary saree', 'modern jewelry', 'fusion accessories']
    },
    {
      name: 'Pohela Boishakh',
      localName: 'পহেলা বৈশাখ',
      description: 'Bengali New Year celebration',
      timing: { months: [4], duration: 1, isVariable: false },
      culturalProducts: ['traditional clothing', 'handicrafts', 'sweets', 'cultural items'],
      searchBoostKeywords: ['boishakh', 'বৈশাখ', 'new year', 'bengali', 'traditional'],
      traditionalColors: ['red', 'white', 'yellow'],
      modernAdaptations: ['modern bengali wear', 'contemporary handicrafts']
    },
    {
      name: 'Eid ul-Adha',
      localName: 'ঈদুল আযহা',
      description: 'Festival of Sacrifice in Islam',
      timing: { months: [7, 8, 9], duration: 3, isVariable: true },
      culturalProducts: ['traditional wear', 'gifts', 'food items', 'kitchen accessories'],
      searchBoostKeywords: ['qurbani', 'sacrifice', 'eid', 'adha', 'আযহা'],
      traditionalColors: ['white', 'green', 'gold'],
      modernAdaptations: ['modern islamic wear', 'contemporary gifts']
    }
  ];

  // Bangladesh Regional Intelligence
  private readonly REGIONAL_PREFERENCES: RegionalPreferences[] = [
    {
      division: 'dhaka',
      localName: 'ঢাকা',
      culturalStrength: 0.3,
      modernAdoption: 0.9,
      economicLevel: 'high',
      preferredCategories: ['electronics', 'fashion', 'gadgets', 'international brands'],
      traditionalProducts: ['traditional sweets', 'handicrafts'],
      localBrands: ['ACI', 'Square', 'BRAC'],
      deliveryPreferences: ['same-day', 'express', 'pickup-points']
    },
    {
      division: 'chittagong',
      localName: 'চট্টগ্রাম',
      culturalStrength: 0.4,
      modernAdoption: 0.7,
      economicLevel: 'high',
      preferredCategories: ['maritime products', 'international goods', 'textiles'],
      traditionalProducts: ['fish products', 'traditional textiles'],
      localBrands: ['Chittagong Steel', 'Port products'],
      deliveryPreferences: ['standard', 'express']
    },
    {
      division: 'sylhet',
      localName: 'সিলেট',
      culturalStrength: 0.6,
      modernAdoption: 0.4,
      economicLevel: 'medium',
      preferredCategories: ['traditional items', 'religious products', 'remittance goods'],
      traditionalProducts: ['traditional jewelry', 'religious items', 'local handicrafts'],
      localBrands: ['Sylhet tea', 'Local artisans'],
      deliveryPreferences: ['standard', 'reliable']
    },
    {
      division: 'rajshahi',
      localName: 'রাজশাহী',
      culturalStrength: 0.7,
      modernAdoption: 0.3,
      economicLevel: 'medium',
      preferredCategories: ['agricultural products', 'traditional items', 'handloom'],
      traditionalProducts: ['silk products', 'mangoes', 'traditional crafts'],
      localBrands: ['Rajshahi silk', 'Local farmers'],
      deliveryPreferences: ['standard', 'cash-on-delivery']
    },
    {
      division: 'khulna',
      localName: 'খুলনা',
      culturalStrength: 0.5,
      modernAdoption: 0.5,
      economicLevel: 'medium',
      preferredCategories: ['shrimp products', 'textiles', 'traditional items'],
      traditionalProducts: ['seafood', 'traditional textiles'],
      localBrands: ['Khulna products'],
      deliveryPreferences: ['standard', 'reliable']
    },
    {
      division: 'barisal',
      localName: 'বরিশাল',
      culturalStrength: 0.8,
      modernAdoption: 0.2,
      economicLevel: 'low',
      preferredCategories: ['agricultural products', 'traditional items', 'basic necessities'],
      traditionalProducts: ['rice products', 'traditional crafts', 'local fish'],
      localBrands: ['Local farmers', 'Traditional artisans'],
      deliveryPreferences: ['cash-on-delivery', 'standard']
    },
    {
      division: 'rangpur',
      localName: 'রংপুর',
      culturalStrength: 0.8,
      modernAdoption: 0.2,
      economicLevel: 'low',
      preferredCategories: ['agricultural products', 'traditional clothing', 'basic goods'],
      traditionalProducts: ['traditional textiles', 'agricultural tools'],
      localBrands: ['Local cooperatives'],
      deliveryPreferences: ['cash-on-delivery', 'standard']
    },
    {
      division: 'mymensingh',
      localName: 'ময়মনসিংহ',
      culturalStrength: 0.7,
      modernAdoption: 0.3,
      economicLevel: 'medium',
      preferredCategories: ['agricultural products', 'traditional items', 'educational materials'],
      traditionalProducts: ['traditional crafts', 'agricultural products'],
      localBrands: ['BAU products', 'Local artisans'],
      deliveryPreferences: ['standard', 'cash-on-delivery']
    }
  ];

  // Traditional Product Mappings
  private readonly TRADITIONAL_PRODUCTS: TraditionalProductMapping[] = [
    {
      english: 'saree',
      bangla: 'শাড়ি',
      alternativeNames: ['sari', 'sharee'],
      category: 'traditional clothing',
      culturalSignificance: 'high',
      festivalRelevance: ['durga_puja', 'pohela_boishakh', 'eid'],
      regionalVariations: {
        dhaka: 'ঢাকাই শাড়ি',
        rajshahi: 'রাজশাহী সিল্ক',
        sylhet: 'সিলেটি শাড়ি'
      }
    },
    {
      english: 'panjabi',
      bangla: 'পাঞ্জাবী',
      alternativeNames: ['punjabi', 'kurta'],
      category: 'traditional menswear',
      culturalSignificance: 'high',
      festivalRelevance: ['eid', 'pohela_boishakh'],
      regionalVariations: {
        dhaka: 'ঢাকাই পাঞ্জাবী',
        chittagong: 'চট্টগ্রামী কুর্তা'
      }
    },
    {
      english: 'rice',
      bangla: 'চাল',
      alternativeNames: ['chaal', 'bhat'],
      category: 'staple food',
      culturalSignificance: 'high',
      festivalRelevance: ['all'],
      regionalVariations: {
        barisal: 'বরিশালী চাল',
        rangpur: 'রংপুরী চাল',
        mymensingh: 'ময়মনসিংহী চাল'
      }
    },
    {
      english: 'fish',
      bangla: 'মাছ',
      alternativeNames: ['mach', 'fish curry'],
      category: 'protein food',
      culturalSignificance: 'high',
      festivalRelevance: ['all'],
      regionalVariations: {
        chittagong: 'চট্টগ্রামী মাছ',
        sylhet: 'সিলেটি মাছ',
        khulna: 'খুলনার চিংড়ি'
      }
    }
  ];

  private constructor() {
    console.log('🏛️ Cultural Intelligence Service initialized with Bangladesh context');
  }

  public static getInstance(): CulturalIntelligenceService {
    if (!CulturalIntelligenceService.instance) {
      CulturalIntelligenceService.instance = new CulturalIntelligenceService();
    }
    return CulturalIntelligenceService.instance;
  }

  /**
   * Get current festival context for suggestion boosting
   */
  public getCurrentFestivalContext(): BangladeshFestival | null {
    const currentMonth = new Date().getMonth() + 1;
    
    return this.BANGLADESH_FESTIVALS.find(festival => 
      festival.timing.months.includes(currentMonth)
    ) || null;
  }

  /**
   * Enhance query with cultural intelligence
   */
  public enhanceQueryWithCulture(
    query: string,
    userLocation?: string,
    language: 'en' | 'bn' | 'mixed' = 'en'
  ): {
    enhancedQuery: string;
    culturalBoosts: string[];
    festivalContext?: BangladeshFestival;
    regionalContext?: RegionalPreferences;
  } {
    const lowerQuery = query.toLowerCase();
    let enhancedQuery = query;
    const culturalBoosts: string[] = [];
    
    // Get current festival context
    const festivalContext = this.getCurrentFestivalContext();
    
    // Get regional context
    const regionalContext = userLocation ? 
      this.REGIONAL_PREFERENCES.find(region => region.division === userLocation.toLowerCase()) : 
      null;

    // Apply festival-based enhancements
    if (festivalContext) {
      const relevantKeywords = festivalContext.searchBoostKeywords.filter(keyword =>
        lowerQuery.includes(keyword.toLowerCase())
      );
      
      if (relevantKeywords.length > 0) {
        culturalBoosts.push(`${festivalContext.name} context`);
        
        // Add festival-specific product suggestions
        festivalContext.culturalProducts.forEach(product => {
          if (!enhancedQuery.toLowerCase().includes(product)) {
            culturalBoosts.push(product);
          }
        });
      }
    }

    // Apply traditional product mapping
    this.TRADITIONAL_PRODUCTS.forEach(product => {
      if (lowerQuery.includes(product.english.toLowerCase()) || 
          lowerQuery.includes(product.bangla) ||
          product.alternativeNames.some(alt => lowerQuery.includes(alt.toLowerCase()))) {
        
        culturalBoosts.push(`traditional ${product.category}`);
        
        // Add regional variations if location is available
        if (regionalContext && product.regionalVariations[regionalContext.division]) {
          culturalBoosts.push(product.regionalVariations[regionalContext.division]);
        }
      }
    });

    // Apply regional enhancements
    if (regionalContext) {
      regionalContext.preferredCategories.forEach(category => {
        if (lowerQuery.includes(category.toLowerCase())) {
          culturalBoosts.push(`${regionalContext.localName} preference`);
        }
      });
    }

    return {
      enhancedQuery,
      culturalBoosts,
      festivalContext: festivalContext || undefined,
      regionalContext: regionalContext || undefined
    };
  }

  /**
   * Get cultural boost score for suggestion
   */
  public getCulturalBoostScore(
    suggestion: string,
    userLocation?: string,
    currentFestival?: string
  ): number {
    let boostScore = 0;
    const lowerSuggestion = suggestion.toLowerCase();

    // Festival boost
    if (currentFestival) {
      const festival = this.BANGLADESH_FESTIVALS.find(f => f.name.toLowerCase().includes(currentFestival));
      if (festival) {
        const isRelevant = festival.culturalProducts.some(product =>
          lowerSuggestion.includes(product.toLowerCase())
        ) || festival.searchBoostKeywords.some(keyword =>
          lowerSuggestion.includes(keyword.toLowerCase())
        );
        
        if (isRelevant) {
          boostScore += 0.3; // 30% boost for festival relevance
        }
      }
    }

    // Regional boost
    if (userLocation) {
      const region = this.REGIONAL_PREFERENCES.find(r => r.division === userLocation.toLowerCase());
      if (region) {
        const isPreferred = region.preferredCategories.some(category =>
          lowerSuggestion.includes(category.toLowerCase())
        ) || region.traditionalProducts.some(product =>
          lowerSuggestion.includes(product.toLowerCase())
        );
        
        if (isPreferred) {
          boostScore += 0.2; // 20% boost for regional preference
        }
      }
    }

    // Traditional product boost
    const traditionalMatch = this.TRADITIONAL_PRODUCTS.find(product =>
      lowerSuggestion.includes(product.english.toLowerCase()) ||
      lowerSuggestion.includes(product.bangla) ||
      product.alternativeNames.some(alt => lowerSuggestion.includes(alt.toLowerCase()))
    );

    if (traditionalMatch) {
      const significanceBoost = {
        'high': 0.25,
        'medium': 0.15,
        'low': 0.1
      }[traditionalMatch.culturalSignificance];
      
      boostScore += significanceBoost;
    }

    return Math.min(boostScore, 0.5); // Cap at 50% boost
  }

  /**
   * Get festival-specific suggestions
   */
  public getFestivalSuggestions(festivalName?: string): string[] {
    if (!festivalName) {
      const currentFestival = this.getCurrentFestivalContext();
      if (!currentFestival) return [];
      festivalName = currentFestival.name;
    }

    const festival = this.BANGLADESH_FESTIVALS.find(f => 
      f.name.toLowerCase().includes(festivalName.toLowerCase())
    );

    if (!festival) return [];

    return [
      ...festival.culturalProducts,
      ...festival.modernAdaptations,
      `${festival.localName} collection`,
      `${festival.name} special offers`
    ];
  }

  /**
   * Get regional product preferences
   */
  public getRegionalPreferences(location: string): string[] {
    const region = this.REGIONAL_PREFERENCES.find(r => 
      r.division === location.toLowerCase()
    );

    if (!region) return [];

    return [
      ...region.preferredCategories,
      ...region.traditionalProducts,
      ...region.localBrands
    ];
  }

  /**
   * Translate product terms to local language
   */
  public translateToLocal(productName: string, targetLanguage: 'bn' | 'en' = 'bn'): string {
    if (targetLanguage === 'en') return productName;

    const mapping = this.TRADITIONAL_PRODUCTS.find(product =>
      product.english.toLowerCase() === productName.toLowerCase() ||
      product.alternativeNames.some(alt => alt.toLowerCase() === productName.toLowerCase())
    );

    return mapping ? mapping.bangla : productName;
  }

  /**
   * Get seasonal preferences
   */
  public getSeasonalPreferences(): string[] {
    const currentMonth = new Date().getMonth() + 1;
    
    // Monsoon season (June-September)
    if ([6, 7, 8, 9].includes(currentMonth)) {
      return ['rain gear', 'waterproof items', 'umbrellas', 'indoor activities'];
    }
    
    // Winter season (December-February) 
    if ([12, 1, 2].includes(currentMonth)) {
      return ['warm clothing', 'winter wear', 'heaters', 'seasonal foods'];
    }
    
    // Summer season (March-May)
    if ([3, 4, 5].includes(currentMonth)) {
      return ['cooling items', 'fans', 'light clothing', 'summer drinks'];
    }
    
    // Post-monsoon (October-November)
    return ['festive items', 'celebration goods', 'traditional wear'];
  }

  /**
   * Check if product is culturally appropriate
   */
  public isCulturallyAppropriate(
    productName: string,
    category: string,
    userProfile?: { religion?: string; region?: string }
  ): boolean {
    // Basic appropriateness check
    const inappropriateTerms = ['alcohol', 'pork', 'gambling'];
    const lowerProduct = productName.toLowerCase();
    
    if (inappropriateTerms.some(term => lowerProduct.includes(term))) {
      return userProfile?.religion !== 'islam';
    }
    
    return true; // Default to appropriate
  }

  /**
   * Get cultural context summary
   */
  public getCulturalContextSummary(): {
    currentFestival?: string;
    seasonalFocus: string[];
    traditionalProducts: string[];
    regionalHighlights: string[];
  } {
    const currentFestival = this.getCurrentFestivalContext();
    
    return {
      currentFestival: currentFestival?.name,
      seasonalFocus: this.getSeasonalPreferences(),
      traditionalProducts: this.TRADITIONAL_PRODUCTS
        .filter(p => p.culturalSignificance === 'high')
        .map(p => p.english),
      regionalHighlights: this.REGIONAL_PREFERENCES
        .filter(r => r.culturalStrength > 0.6)
        .map(r => r.division)
    };
  }
}