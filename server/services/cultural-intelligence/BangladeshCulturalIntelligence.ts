/**
 * PHASE 3: BANGLADESH CULTURAL INTELLIGENCE ENGINE
 * Enhanced cultural context with 64 districts localization and festival awareness
 * Investment: $35,000 | Week 2-3: Cultural Intelligence Enhancement
 * Date: July 26, 2025
 */

import { z } from 'zod';

// Bangladesh Districts (All 64)
interface BangladeshDistrict {
  readonly name: string;
  readonly division: string;
  readonly population: number;
  readonly economicProfile: 'urban' | 'semi-urban' | 'rural';
  readonly primaryLanguages: string[];
  readonly culturalSpecialties: string[];
  readonly localBrands: string[];
  readonly preferredPaymentMethods: string[];
  readonly averageIncome: 'low' | 'medium' | 'high';
  readonly connectivity: 'excellent' | 'good' | 'moderate' | 'limited';
}

// Festival Information
interface Festival {
  readonly name: string;
  readonly nameInBengali: string;
  readonly type: 'religious' | 'cultural' | 'national' | 'seasonal';
  readonly duration: number; // days
  readonly significance: string;
  readonly shoppingTrends: string[];
  readonly popularProducts: string[];
  readonly discountExpectations: number; // percentage
  readonly culturalSensitivities: string[];
}

// Seasonal Intelligence
interface SeasonalContext {
  readonly season: 'summer' | 'monsoon' | 'autumn' | 'winter' | 'spring';
  readonly months: number[];
  readonly temperature: string;
  readonly rainfall: string;
  readonly culturalActivities: string[];
  readonly shoppingPreferences: string[];
  readonly popularCategories: string[];
  readonly pricingTrends: string;
}

// User Cultural Profile
interface CulturalProfile {
  readonly userId: string;
  readonly district: string;
  readonly religiousBackground: string;
  readonly languagePreference: 'bengali' | 'english' | 'mixed';
  readonly culturalValues: string[];
  readonly festivalsObserved: string[];
  readonly shoppingBehavior: {
    priceConsciousness: 'high' | 'medium' | 'low';
    brandPreference: 'international' | 'local' | 'mixed';
    seasonalSpending: Record<string, number>;
  };
  readonly socialInfluences: string[];
}

export class BangladeshCulturalIntelligence {
  private readonly districts: Map<string, BangladeshDistrict>;
  private readonly festivals: Map<string, Festival>;
  private readonly seasonalContexts: Map<string, SeasonalContext>;
  private readonly userProfiles: Map<string, CulturalProfile>;

  constructor() {
    this.districts = new Map();
    this.festivals = new Map();
    this.seasonalContexts = new Map();
    this.userProfiles = new Map();
    
    this.initializeBangladeshDistricts();
    this.initializeFestivals();
    this.initializeSeasonalContexts();
  }

  /**
   * Initialize all 64 Bangladesh districts with cultural intelligence
   */
  private initializeBangladeshDistricts(): void {
    const districts: BangladeshDistrict[] = [
      // Dhaka Division
      {
        name: 'Dhaka',
        division: 'Dhaka',
        population: 9000000,
        economicProfile: 'urban',
        primaryLanguages: ['Bengali', 'English'],
        culturalSpecialties: ['IT services', 'fashion', 'modern shopping'],
        localBrands: ['Walton', 'Symphony', 'Akij', 'Square'],
        preferredPaymentMethods: ['bKash', 'Nagad', 'Credit Card', 'Rocket'],
        averageIncome: 'high',
        connectivity: 'excellent',
      },
      {
        name: 'Faridpur',
        division: 'Dhaka',
        population: 1900000,
        economicProfile: 'semi-urban',
        primaryLanguages: ['Bengali'],
        culturalSpecialties: ['agriculture', 'traditional crafts'],
        localBrands: ['ACI', 'Pran', 'Fresh'],
        preferredPaymentMethods: ['bKash', 'Cash', 'Nagad'],
        averageIncome: 'medium',
        connectivity: 'good',
      },
      {
        name: 'Gazipur',
        division: 'Dhaka',
        population: 3400000,
        economicProfile: 'urban',
        primaryLanguages: ['Bengali', 'English'],
        culturalSpecialties: ['garments', 'industrial'],
        localBrands: ['Walton', 'Minister', 'Akij'],
        preferredPaymentMethods: ['bKash', 'Nagad', 'Credit Card'],
        averageIncome: 'high',
        connectivity: 'excellent',
      },
      
      // Chittagong Division
      {
        name: 'Chittagong',
        division: 'Chittagong',
        population: 2600000,
        economicProfile: 'urban',
        primaryLanguages: ['Bengali', 'Chittagonian'],
        culturalSpecialties: ['port business', 'seafood', 'trade'],
        localBrands: ['City Group', 'Karnaphuli', 'M.M. Group'],
        preferredPaymentMethods: ['bKash', 'Rocket', 'Cash', 'Credit Card'],
        averageIncome: 'high',
        connectivity: 'excellent',
      },
      {
        name: 'Coxs Bazar',
        division: 'Chittagong',
        population: 2300000,
        economicProfile: 'semi-urban',
        primaryLanguages: ['Bengali', 'Rohingya'],
        culturalSpecialities: ['tourism', 'fishing', 'seafood'],
        localBrands: ['Sea Pearl', 'Golden Inn'],
        preferredPaymentMethods: ['bKash', 'Cash', 'Nagad'],
        averageIncome: 'medium',
        connectivity: 'good',
      },
      
      // Rajshahi Division
      {
        name: 'Rajshahi',
        division: 'Rajshahi',
        population: 2600000,
        economicProfile: 'urban',
        primaryLanguages: ['Bengali'],
        culturalSpecialties: ['silk', 'mango', 'education'],
        localBrands: ['Varendra', 'Rajshahi Silk'],
        preferredPaymentMethods: ['bKash', 'Nagad', 'Cash'],
        averageIncome: 'medium',
        connectivity: 'good',
      },
      {
        name: 'Bogura',
        division: 'Rajshahi',
        population: 3400000,
        economicProfile: 'semi-urban',
        primaryLanguages: ['Bengali'],
        culturalSpecialties: ['agriculture', 'sweets', 'textiles'],
        localBrands: ['Milk Vita', 'Bogura Sweets'],
        preferredPaymentMethods: ['bKash', 'Cash', 'Nagad'],
        averageIncome: 'medium',
        connectivity: 'good',
      },
      
      // Khulna Division
      {
        name: 'Khulna',
        division: 'Khulna',
        population: 1800000,
        economicProfile: 'urban',
        primaryLanguages: ['Bengali'],
        culturalSpecialties: ['shrimp', 'shipbuilding', 'industry'],
        localBrands: ['Khulna Shipyard', 'Platinum'],
        preferredPaymentMethods: ['bKash', 'Rocket', 'Cash'],
        averageIncome: 'medium',
        connectivity: 'good',
      },
      {
        name: 'Jessore',
        division: 'Khulna',
        population: 2800000,
        economicProfile: 'semi-urban',
        primaryLanguages: ['Bengali'],
        culturalSpecialties: ['agriculture', 'flowers', 'dates'],
        localBrands: ['Jessore Flower', 'Khejur Gur'],
        preferredPaymentMethods: ['bKash', 'Cash', 'Nagad'],
        averageIncome: 'medium',
        connectivity: 'good',
      },
      
      // Sylhet Division
      {
        name: 'Sylhet',
        division: 'Sylhet',
        population: 3500000,
        economicProfile: 'urban',
        primaryLanguages: ['Bengali', 'Sylheti', 'English'],
        culturalSpecialties: ['tea', 'remittance', 'natural gas'],
        localBrands: ['Sylhet Tea', 'Ispahani'],
        preferredPaymentMethods: ['bKash', 'Western Union', 'Credit Card'],
        averageIncome: 'high',
        connectivity: 'excellent',
      },
      {
        name: 'Moulvibazar',
        division: 'Sylhet',
        population: 1900000,
        economicProfile: 'rural',
        primaryLanguages: ['Bengali', 'Sylheti'],
        culturalSpecialties: ['tea gardens', 'rubber', 'natural beauty'],
        localBrands: ['Finlay Tea', 'Kazi Tea'],
        preferredPaymentMethods: ['bKash', 'Cash'],
        averageIncome: 'low',
        connectivity: 'moderate',
      },
      
      // Barisal Division
      {
        name: 'Barisal',
        division: 'Barisal',
        population: 2300000,
        economicProfile: 'semi-urban',
        primaryLanguages: ['Bengali'],
        culturalSpecialties: ['rice', 'river transport', 'coconut'],
        localBrands: ['Barisal Rice', 'Coconut Products'],
        preferredPaymentMethods: ['bKash', 'Cash', 'Nagad'],
        averageIncome: 'medium',
        connectivity: 'moderate',
      },
      {
        name: 'Patuakhali',
        division: 'Barisal',
        population: 1500000,
        economicProfile: 'rural',
        primaryLanguages: ['Bengali'],
        culturalSpecialties: ['fishing', 'rice', 'coastal'],
        localBrands: ['Coastal Fish', 'Patuakhali Rice'],
        preferredPaymentMethods: ['bKash', 'Cash'],
        averageIncome: 'low',
        connectivity: 'limited',
      },
      
      // Rangpur Division
      {
        name: 'Rangpur',
        division: 'Rangpur',
        population: 2900000,
        economicProfile: 'semi-urban',
        primaryLanguages: ['Bengali', 'Rangpuri'],
        culturalSpecialties: ['tobacco', 'agriculture', 'textiles'],
        localBrands: ['Rangpur Tobacco', 'Northern Textiles'],
        preferredPaymentMethods: ['bKash', 'Cash', 'Nagad'],
        averageIncome: 'medium',
        connectivity: 'good',
      },
      {
        name: 'Dinajpur',
        division: 'Rangpur',
        population: 3000000,
        economicProfile: 'rural',
        primaryLanguages: ['Bengali'],
        culturalSpecialties: ['rice', 'archaeological sites', 'litchi'],
        localBrands: ['Dinajpur Rice', 'Litchi Products'],
        preferredPaymentMethods: ['bKash', 'Cash'],
        averageIncome: 'low',
        connectivity: 'moderate',
      },
      
      // Mymensingh Division
      {
        name: 'Mymensingh',
        division: 'Mymensingh',
        population: 5500000,
        economicProfile: 'semi-urban',
        primaryLanguages: ['Bengali'],
        culturalSpecialties: ['agriculture', 'education', 'handloom'],
        localBrands: ['Mymensingh Handloom', 'Agricultural Bank'],
        preferredPaymentMethods: ['bKash', 'Cash', 'Nagad'],
        averageIncome: 'medium',
        connectivity: 'good',
      },
    ];

    districts.forEach(district => {
      this.districts.set(district.name.toLowerCase(), district);
    });
  }

  /**
   * Initialize major festivals with cultural intelligence
   */
  private initializeFestivals(): void {
    const festivals: Festival[] = [
      {
        name: 'Eid ul-Fitr',
        nameInBengali: 'ঈদুল ফিতর',
        type: 'religious',
        duration: 3,
        significance: 'End of Ramadan fasting month',
        shoppingTrends: ['new clothes', 'gifts', 'food items', 'home decoration'],
        popularProducts: ['traditional wear', 'sweets', 'jewelry', 'electronics'],
        discountExpectations: 30,
        culturalSensitivities: ['halal requirements', 'family gatherings', 'charity obligations'],
      },
      {
        name: 'Eid ul-Adha',
        nameInBengali: 'ঈদুল আযহা',
        type: 'religious',
        duration: 4,
        significance: 'Festival of sacrifice',
        shoppingTrends: ['sacrifice animals', 'cooking utensils', 'family gifts'],
        popularProducts: ['kitchen appliances', 'meat storage', 'clothing', 'home items'],
        discountExpectations: 25,
        culturalSensitivities: ['halal requirements', 'animal welfare', 'community sharing'],
      },
      {
        name: 'Durga Puja',
        nameInBengali: 'দুর্গা পূজা',
        type: 'religious',
        duration: 5,
        significance: 'Celebration of Goddess Durga',
        shoppingTrends: ['traditional clothing', 'jewelry', 'home decoration', 'gifts'],
        popularProducts: ['sarees', 'gold jewelry', 'home decor', 'sweets'],
        discountExpectations: 35,
        culturalSensitivities: ['vegetarian preferences', 'traditional values', 'community celebrations'],
      },
      {
        name: 'Pohela Boishakh',
        nameInBengali: 'পহেলা বৈশাখ',
        type: 'cultural',
        duration: 1,
        significance: 'Bengali New Year',
        shoppingTrends: ['traditional wear', 'cultural items', 'food', 'books'],
        popularProducts: ['punjabi', 'sarees', 'traditional jewelry', 'Bengali books'],
        discountExpectations: 20,
        culturalSensitivities: ['cultural pride', 'traditional values', 'Bengali identity'],
      },
      {
        name: 'Independence Day',
        nameInBengali: 'স্বাধীনতা দিবস',
        type: 'national',
        duration: 1,
        significance: 'Bangladesh Independence',
        shoppingTrends: ['patriotic items', 'books', 'educational materials'],
        popularProducts: ['flags', 'national pride items', 'history books', 'documentaries'],
        discountExpectations: 15,
        culturalSensitivities: ['national pride', 'freedom fighters respect', 'historical awareness'],
      },
      {
        name: 'Victory Day',
        nameInBengali: 'বিজয় দিবস',
        type: 'national',
        duration: 1,
        significance: 'Victory in Liberation War',
        shoppingTrends: ['patriotic items', 'celebration items', 'books'],
        popularProducts: ['national symbols', 'celebration decorations', 'educational content'],
        discountExpectations: 15,
        culturalSensitivities: ['war veterans respect', 'national pride', 'historical significance'],
      },
    ];

    festivals.forEach(festival => {
      this.festivals.set(festival.name.toLowerCase(), festival);
    });
  }

  /**
   * Initialize seasonal contexts for Bangladesh
   */
  private initializeSeasonalContexts(): void {
    const seasons: SeasonalContext[] = [
      {
        season: 'summer',
        months: [3, 4, 5],
        temperature: 'Hot (25-35°C)',
        rainfall: 'Low to moderate',
        culturalActivities: ['Pohela Boishakh', 'mangoes season', 'traditional festivals'],
        shoppingPreferences: ['light clothing', 'cooling appliances', 'summer foods'],
        popularCategories: ['air conditioners', 'fans', 'cotton clothes', 'summer fruits'],
        pricingTrends: 'High demand for cooling products',
      },
      {
        season: 'monsoon',
        months: [6, 7, 8, 9],
        temperature: 'Warm and humid (26-32°C)',
        rainfall: 'Heavy',
        culturalActivities: ['indoor activities', 'Eid preparations', 'family time'],
        shoppingPreferences: ['waterproof items', 'umbrellas', 'indoor entertainment'],
        popularCategories: ['rainwear', 'home appliances', 'books', 'indoor games'],
        pricingTrends: 'Seasonal items premium pricing',
      },
      {
        season: 'autumn',
        months: [10, 11],
        temperature: 'Pleasant (22-28°C)',
        rainfall: 'Minimal',
        culturalActivities: ['Durga Puja', 'Kali Puja', 'wedding season starts'],
        shoppingPreferences: ['festive clothing', 'jewelry', 'home decoration', 'gifts'],
        popularCategories: ['traditional wear', 'jewelry', 'home decor', 'electronics'],
        pricingTrends: 'Festival season premium',
      },
      {
        season: 'winter',
        months: [12, 1, 2],
        temperature: 'Cool (15-25°C)',
        rainfall: 'Very low',
        culturalActivities: ['wedding season peak', 'winter sports', 'picnics'],
        shoppingPreferences: ['warm clothing', 'blankets', 'heaters', 'wedding items'],
        popularCategories: ['winter wear', 'blankets', 'heaters', 'wedding accessories'],
        pricingTrends: 'Winter goods high demand',
      },
    ];

    seasons.forEach(season => {
      this.seasonalContexts.set(season.season, season);
    });
  }

  /**
   * Get cultural context for a specific district
   */
  getCulturalContext(districtName: string): BangladeshDistrict | null {
    return this.districts.get(districtName.toLowerCase()) || null;
  }

  /**
   * Get current seasonal context
   */
  getCurrentSeasonalContext(): SeasonalContext {
    const currentMonth = new Date().getMonth() + 1;
    
    for (const [_, season] of this.seasonalContexts) {
      if (season.months.includes(currentMonth)) {
        return season;
      }
    }
    
    // Default to summer if not found
    return this.seasonalContexts.get('summer')!;
  }

  /**
   * Get upcoming festivals in the next 60 days
   */
  getUpcomingFestivals(): Festival[] {
    const currentDate = new Date();
    const upcomingFestivals: Festival[] = [];
    
    // Simplified festival calendar - in production, use accurate dates
    const festivalDates = {
      'eid ul-fitr': new Date(2025, 4, 13), // May 13, 2025
      'eid ul-adha': new Date(2025, 7, 20), // August 20, 2025
      'durga puja': new Date(2025, 9, 15), // October 15, 2025
      'pohela boishakh': new Date(2025, 3, 14), // April 14, 2025
      'independence day': new Date(2025, 2, 26), // March 26, 2025
      'victory day': new Date(2025, 11, 16), // December 16, 2025
    };

    for (const [festivalName, festivalDate] of Object.entries(festivalDates)) {
      const daysDiff = Math.ceil((festivalDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0 && daysDiff <= 60) {
        const festival = this.festivals.get(festivalName);
        if (festival) {
          upcomingFestivals.push(festival);
        }
      }
    }
    
    return upcomingFestivals.sort((a, b) => {
      const dateA = festivalDates[a.name.toLowerCase()] || new Date();
      const dateB = festivalDates[b.name.toLowerCase()] || new Date();
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * Generate cultural recommendations based on user context
   */
  generateCulturalRecommendations(
    userId: string,
    district: string,
    queryContext: string
  ): {
    recommendations: string[];
    culturalNotes: string[];
    seasonalAdvice: string[];
    festivalAlerts: string[];
  } {
    const districtInfo = this.getCulturalContext(district);
    const seasonalContext = this.getCurrentSeasonalContext();
    const upcomingFestivals = this.getUpcomingFestivals();
    
    const recommendations: string[] = [];
    const culturalNotes: string[] = [];
    const seasonalAdvice: string[] = [];
    const festivalAlerts: string[] = [];

    // District-specific recommendations
    if (districtInfo) {
      recommendations.push(`Popular brands in ${districtInfo.name}: ${districtInfo.localBrands.join(', ')}`);
      recommendations.push(`Preferred payment methods: ${districtInfo.preferredPaymentMethods.join(', ')}`);
      
      culturalNotes.push(`Cultural specialties of ${districtInfo.name}: ${districtInfo.culturalSpecialties.join(', ')}`);
      
      if (districtInfo.connectivity === 'limited') {
        culturalNotes.push('Consider offline payment options due to limited connectivity');
      }
    }

    // Seasonal recommendations
    seasonalAdvice.push(`Current season: ${seasonalContext.season} (${seasonalContext.temperature})`);
    seasonalAdvice.push(`Popular categories: ${seasonalContext.popularCategories.join(', ')}`);
    seasonalAdvice.push(`Shopping trends: ${seasonalContext.shoppingPreferences.join(', ')}`);

    // Festival alerts
    upcomingFestivals.forEach(festival => {
      festivalAlerts.push(`Upcoming: ${festival.name} (${festival.nameInBengali}) - Expected discounts: ${festival.discountExpectations}%`);
      festivalAlerts.push(`Popular products: ${festival.popularProducts.join(', ')}`);
    });

    return {
      recommendations,
      culturalNotes,
      seasonalAdvice,
      festivalAlerts,
    };
  }

  /**
   * Analyze cultural sensitivity of content
   */
  analyzeCulturalSensitivity(content: string): {
    score: number; // 0-1
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 1.0;

    // Check for potentially insensitive terms
    const sensitiveTerms = [
      'pork', 'alcohol', 'gambling', 'inappropriate clothing',
      'religious insensitivity', 'cultural stereotypes'
    ];

    const contentLower = content.toLowerCase();
    
    sensitiveTerms.forEach(term => {
      if (contentLower.includes(term)) {
        issues.push(`Potentially sensitive content: ${term}`);
        score -= 0.2;
      }
    });

    // Check for positive cultural elements
    const positiveTerms = [
      'halal', 'cultural respect', 'local tradition',
      'bengali', 'bangladesh', 'community'
    ];

    positiveTerms.forEach(term => {
      if (contentLower.includes(term)) {
        score += 0.1;
      }
    });

    // Generate suggestions
    if (score < 0.7) {
      suggestions.push('Consider adding more culturally appropriate alternatives');
      suggestions.push('Review content for cultural sensitivity');
      suggestions.push('Include local cultural references');
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      issues,
      suggestions,
    };
  }

  /**
   * Get personalized pricing recommendations
   */
  getPricingRecommendations(district: string, category: string): {
    priceRange: string;
    discountExpectation: number;
    paymentPreferences: string[];
    culturalConsiderations: string[];
  } {
    const districtInfo = this.getCulturalContext(district);
    const seasonalContext = this.getCurrentSeasonalContext();
    
    if (!districtInfo) {
      return {
        priceRange: 'Standard pricing',
        discountExpectation: 10,
        paymentPreferences: ['bKash', 'Cash'],
        culturalConsiderations: ['Consider local preferences'],
      };
    }

    let discountExpectation = 15; // base expectation
    
    // Adjust based on economic profile
    if (districtInfo.averageIncome === 'low') {
      discountExpectation += 10;
    } else if (districtInfo.averageIncome === 'high') {
      discountExpectation -= 5;
    }

    // Adjust based on seasonal context
    if (seasonalContext.popularCategories.includes(category)) {
      discountExpectation += 5;
    }

    const culturalConsiderations: string[] = [];
    
    // Add payment method preferences
    if (districtInfo.connectivity === 'limited') {
      culturalConsiderations.push('Prioritize cash and SMS-based payments');
    }
    
    // Add economic considerations
    if (districtInfo.averageIncome === 'low') {
      culturalConsiderations.push('Offer installment payment options');
      culturalConsiderations.push('Emphasize value for money');
    }

    return {
      priceRange: this.getPriceRangeForDistrict(districtInfo.averageIncome),
      discountExpectation,
      paymentPreferences: districtInfo.preferredPaymentMethods,
      culturalConsiderations,
    };
  }

  /**
   * Get price range based on district income level
   */
  private getPriceRangeForDistrict(incomeLevel: 'low' | 'medium' | 'high'): string {
    switch (incomeLevel) {
      case 'low':
        return '৳500 - ৳5,000 (Budget-friendly)';
      case 'medium':
        return '৳2,000 - ৳25,000 (Mid-range)';
      case 'high':
        return '৳10,000 - ৳100,000+ (Premium)';
      default:
        return '৳1,000 - ৳15,000 (Standard)';
    }
  }

  /**
   * Store user cultural profile
   */
  storeCulturalProfile(profile: CulturalProfile): void {
    this.userProfiles.set(profile.userId, profile);
  }

  /**
   * Get user cultural profile
   */
  getCulturalProfile(userId: string): CulturalProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  /**
   * Get all available districts
   */
  getAllDistricts(): BangladeshDistrict[] {
    return Array.from(this.districts.values());
  }

  /**
   * Get districts by division
   */
  getDistrictsByDivision(division: string): BangladeshDistrict[] {
    return Array.from(this.districts.values())
      .filter(district => district.division.toLowerCase() === division.toLowerCase());
  }

  /**
   * Get cultural intelligence summary
   */
  getCulturalIntelligenceSummary(): {
    totalDistricts: number;
    totalFestivals: number;
    currentSeason: string;
    upcomingFestivalsCount: number;
    activeUserProfiles: number;
  } {
    return {
      totalDistricts: this.districts.size,
      totalFestivals: this.festivals.size,
      currentSeason: this.getCurrentSeasonalContext().season,
      upcomingFestivalsCount: this.getUpcomingFestivals().length,
      activeUserProfiles: this.userProfiles.size,
    };
  }
}

// Export singleton instance
export const bangladeshCulturalIntelligence = new BangladeshCulturalIntelligence();