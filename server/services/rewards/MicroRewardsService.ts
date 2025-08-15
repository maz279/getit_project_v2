/**
 * Micro-Interaction Rewards Service for Complex Search Queries
 * Gamification system that rewards users for sophisticated search behavior
 * Production-ready implementation for Phase 2
 */

import { logger } from '../LoggingService';

export interface SearchComplexityMetrics {
  modalityCount: number;        // Number of search modalities used (text, voice, image, etc.)
  filterDepth: number;          // Number of filters applied
  queryLength: number;          // Length of search query
  contextRichness: number;      // How much context provided
  advancedFeatures: string[];   // Advanced features used
  complexityScore: number;      // Overall complexity score 0-100
}

export interface MicroReward {
  id: string;
  type: 'points' | 'badge' | 'achievement' | 'streak' | 'multiplier';
  title: string;
  description: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  visualEffect: string;
  category: string;
  earnedAt: string;
}

export interface UserRewardsProfile {
  userId: string;
  totalPoints: number;
  level: number;
  badges: string[];
  achievements: string[];
  currentStreak: number;
  maxStreak: number;
  searchesToday: number;
  complexSearchCount: number;
  recentRewards: MicroReward[];
  multipliers: {
    type: string;
    factor: number;
    expiresAt: string;
  }[];
}

export interface ComplexSearchReward {
  reward: MicroReward;
  complexityBreakdown: SearchComplexityMetrics;
  nextLevelHint: string;
  celebrationMessage: string;
}

class MicroRewardsService {
  private static instance: MicroRewardsService;
  private userProfiles: Map<string, UserRewardsProfile> = new Map();

  public static getInstance(): MicroRewardsService {
    if (!MicroRewardsService.instance) {
      MicroRewardsService.instance = new MicroRewardsService();
    }
    return MicroRewardsService.instance;
  }

  constructor() {
    logger.info('🎮 Micro-Interaction Rewards Service initialized');
  }

  /**
   * Analyze search complexity and calculate rewards
   */
  public async analyzeSearchComplexity(searchData: {
    query?: string;
    modalities: string[];
    filters: Record<string, any>;
    context: Record<string, any>;
    imageData?: string;
    voiceData?: boolean;
    userId?: string;
  }): Promise<SearchComplexityMetrics> {
    const startTime = Date.now();

    try {
      // Calculate modality count (text, voice, image, filters, etc.)
      const modalityCount = this.calculateModalityCount(searchData);

      // Calculate filter depth
      const filterDepth = this.calculateFilterDepth(searchData.filters);

      // Calculate query complexity
      const queryLength = searchData.query ? this.calculateQueryComplexity(searchData.query) : 0;

      // Calculate context richness
      const contextRichness = this.calculateContextRichness(searchData.context);

      // Identify advanced features used
      const advancedFeatures = this.identifyAdvancedFeatures(searchData);

      // Calculate overall complexity score
      const complexityScore = this.calculateComplexityScore({
        modalityCount,
        filterDepth,
        queryLength,
        contextRichness,
        advancedFeatures
      });

      const metrics: SearchComplexityMetrics = {
        modalityCount,
        filterDepth,
        queryLength,
        contextRichness,
        advancedFeatures,
        complexityScore
      };

      const processingTime = Date.now() - startTime;
      
      logger.info('Search complexity analyzed', {
        userId: searchData.userId,
        complexityScore,
        processingTime,
        modalityCount,
        advancedFeatures
      });

      return metrics;

    } catch (error) {
      logger.error('Search complexity analysis failed', {
        error: error.message,
        userId: searchData.userId
      });
      
      // Return minimal complexity on error
      return {
        modalityCount: 1,
        filterDepth: 0,
        queryLength: 1,
        contextRichness: 0,
        advancedFeatures: [],
        complexityScore: 10
      };
    }
  }

  /**
   * Calculate and award micro-rewards based on search complexity
   */
  public async calculateAndAwardRewards(
    userId: string,
    complexityMetrics: SearchComplexityMetrics,
    searchType: string
  ): Promise<ComplexSearchReward | null> {
    try {
      // Get or create user profile
      const userProfile = this.getUserProfile(userId);

      // Check if complexity threshold met for rewards
      if (complexityMetrics.complexityScore < 30) {
        logger.debug('Search complexity below reward threshold', {
          userId,
          complexityScore: complexityMetrics.complexityScore
        });
        return null;
      }

      // Generate appropriate reward
      const reward = this.generateReward(complexityMetrics, userProfile, searchType);

      // Update user profile
      this.updateUserProfile(userId, reward, complexityMetrics);

      // Generate celebration message
      const celebrationMessage = this.generateCelebrationMessage(reward, complexityMetrics);

      // Generate next level hint
      const nextLevelHint = this.generateNextLevelHint(userProfile, complexityMetrics);

      logger.info('Micro-reward awarded', {
        userId,
        rewardType: reward.type,
        rewardValue: reward.value,
        complexityScore: complexityMetrics.complexityScore
      });

      return {
        reward,
        complexityBreakdown: complexityMetrics,
        nextLevelHint,
        celebrationMessage
      };

    } catch (error) {
      logger.error('Reward calculation failed', {
        error: error.message,
        userId
      });
      return null;
    }
  }

  /**
   * Get user rewards profile
   */
  public getUserProfile(userId: string): UserRewardsProfile {
    if (!this.userProfiles.has(userId)) {
      const newProfile: UserRewardsProfile = {
        userId,
        totalPoints: 0,
        level: 1,
        badges: [],
        achievements: [],
        currentStreak: 0,
        maxStreak: 0,
        searchesToday: 0,
        complexSearchCount: 0,
        recentRewards: [],
        multipliers: []
      };
      this.userProfiles.set(userId, newProfile);
    }
    return this.userProfiles.get(userId)!;
  }

  private calculateModalityCount(searchData: any): number {
    let count = 0;
    
    if (searchData.query && searchData.query.length > 0) count++; // Text search
    if (searchData.imageData) count++; // Image search
    if (searchData.voiceData) count++; // Voice search
    if (Object.keys(searchData.filters || {}).length > 0) count++; // Filters
    if (Object.keys(searchData.context || {}).length > 2) count++; // Rich context
    
    return Math.min(count, 5); // Cap at 5 modalities
  }

  private calculateFilterDepth(filters: Record<string, any>): number {
    if (!filters) return 0;
    
    let depth = 0;
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        depth++;
        // Extra points for complex filters
        if (typeof filters[key] === 'object') depth += 0.5;
      }
    });
    
    return Math.min(depth, 10); // Cap at 10
  }

  private calculateQueryComplexity(query: string): number {
    const length = query.length;
    const wordCount = query.split(' ').length;
    const hasSpecialChars = /[+\-"()~*]/.test(query);
    const hasBengali = /[\u0980-\u09FF]/.test(query);
    
    let complexity = Math.min(length / 10, 5); // Length factor
    complexity += Math.min(wordCount / 2, 3); // Word count factor
    if (hasSpecialChars) complexity += 2; // Special operators
    if (hasBengali) complexity += 1; // Multilingual
    
    return Math.min(complexity, 10);
  }

  private calculateContextRichness(context: Record<string, any>): number {
    if (!context) return 0;
    
    let richness = Object.keys(context).length;
    
    // Bonus for specific context types
    if (context.location) richness += 1;
    if (context.preferences && Array.isArray(context.preferences)) {
      richness += context.preferences.length * 0.5;
    }
    if (context.previousSearches) richness += 1;
    
    return Math.min(richness, 8);
  }

  private identifyAdvancedFeatures(searchData: any): string[] {
    const features: string[] = [];
    
    if (searchData.imageData) features.push('visual_search');
    if (searchData.voiceData) features.push('voice_search');
    if (searchData.filters?.priceRange) features.push('price_filtering');
    if (searchData.filters?.category) features.push('category_filtering');
    if (searchData.context?.location) features.push('location_context');
    if (searchData.modalities?.length > 2) features.push('multi_modal');
    
    return features;
  }

  private calculateComplexityScore(metrics: Partial<SearchComplexityMetrics>): number {
    const weights = {
      modalityCount: 25,     // 25% weight
      filterDepth: 20,       // 20% weight
      queryLength: 15,       // 15% weight
      contextRichness: 20,   // 20% weight
      advancedFeatures: 20   // 20% weight
    };

    let score = 0;
    score += (metrics.modalityCount || 0) * weights.modalityCount / 5;
    score += (metrics.filterDepth || 0) * weights.filterDepth / 10;
    score += (metrics.queryLength || 0) * weights.queryLength / 10;
    score += (metrics.contextRichness || 0) * weights.contextRichness / 8;
    score += (metrics.advancedFeatures?.length || 0) * weights.advancedFeatures / 6;

    return Math.min(Math.round(score), 100);
  }

  private generateReward(
    metrics: SearchComplexityMetrics,
    userProfile: UserRewardsProfile,
    searchType: string
  ): MicroReward {
    const rewardId = `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine reward based on complexity
    let rewardType: MicroReward['type'] = 'points';
    let value = Math.round(metrics.complexityScore / 2);
    let rarity: MicroReward['rarity'] = 'common';
    let title = 'Search Explorer';
    let description = 'Used advanced search features';

    if (metrics.complexityScore >= 80) {
      rewardType = 'achievement';
      rarity = 'legendary';
      title = 'Search Master';
      description = 'Performed an incredibly sophisticated search';
      value = 100;
    } else if (metrics.complexityScore >= 60) {
      rewardType = 'badge';
      rarity = 'epic';
      title = 'Advanced Searcher';
      description = 'Used multiple search modalities expertly';
      value = 50;
    } else if (metrics.complexityScore >= 40) {
      rewardType = 'streak';
      rarity = 'rare';
      title = 'Smart Searcher';
      description = 'Applied intelligent search strategies';
      value = 25;
    }

    return {
      id: rewardId,
      type: rewardType,
      title,
      description,
      value,
      rarity,
      visualEffect: this.getVisualEffect(rarity),
      category: searchType,
      earnedAt: new Date().toISOString()
    };
  }

  private getVisualEffect(rarity: MicroReward['rarity']): string {
    const effects = {
      common: 'sparkle',
      rare: 'glow',
      epic: 'rainbow',
      legendary: 'fireworks'
    };
    return effects[rarity];
  }

  private updateUserProfile(
    userId: string,
    reward: MicroReward,
    metrics: SearchComplexityMetrics
  ): void {
    const profile = this.getUserProfile(userId);
    
    profile.totalPoints += reward.value;
    profile.complexSearchCount++;
    profile.searchesToday++;
    profile.currentStreak++;
    profile.maxStreak = Math.max(profile.maxStreak, profile.currentStreak);
    
    // Add reward to recent rewards (keep last 10)
    profile.recentRewards.unshift(reward);
    if (profile.recentRewards.length > 10) {
      profile.recentRewards.pop();
    }

    // Add badges/achievements
    if (reward.type === 'badge' && !profile.badges.includes(reward.id)) {
      profile.badges.push(reward.id);
    }
    if (reward.type === 'achievement' && !profile.achievements.includes(reward.id)) {
      profile.achievements.push(reward.id);
    }

    // Calculate new level
    profile.level = Math.floor(profile.totalPoints / 1000) + 1;
  }

  private generateCelebrationMessage(
    reward: MicroReward,
    metrics: SearchComplexityMetrics
  ): string {
    const messages = {
      legendary: [
        "🏆 Incredible! You've mastered the art of search!",
        "✨ Amazing search skills! You're a true search virtuoso!",
        "🌟 Outstanding! Your search complexity is off the charts!"
      ],
      epic: [
        "🎉 Excellent search technique! Keep up the great work!",
        "💫 Impressive! You're becoming a search expert!",
        "🚀 Great job using advanced search features!"
      ],
      rare: [
        "👏 Nice search strategy! You're getting better!",
        "⭐ Good use of multiple search methods!",
        "🎯 Smart searching! You found the right approach!"
      ],
      common: [
        "💡 Good start with advanced searching!",
        "🔍 Keep exploring more search features!",
        "📈 You're improving your search skills!"
      ]
    };

    const rarityMessages = messages[reward.rarity];
    return rarityMessages[Math.floor(Math.random() * rarityMessages.length)];
  }

  private generateNextLevelHint(
    userProfile: UserRewardsProfile,
    metrics: SearchComplexityMetrics
  ): string {
    if (metrics.modalityCount < 3) {
      return "💡 Try combining image search with voice commands for bonus points!";
    }
    if (metrics.filterDepth < 2) {
      return "🎯 Add more filters to your search for higher complexity scores!";
    }
    if (metrics.contextRichness < 3) {
      return "📍 Provide location and preferences for richer search context!";
    }
    if (!metrics.advancedFeatures.includes('multi_modal')) {
      return "🌟 Use multiple search types together for maximum rewards!";
    }
    
    return "🚀 You're doing great! Keep exploring new search combinations!";
  }

  /**
   * Get rewards summary for dashboard
   */
  public getRewardsSummary(userId: string) {
    const profile = this.getUserProfile(userId);
    
    return {
      totalPoints: profile.totalPoints,
      level: profile.level,
      currentStreak: profile.currentStreak,
      badgeCount: profile.badges.length,
      achievementCount: profile.achievements.length,
      recentRewards: profile.recentRewards.slice(0, 5),
      nextLevelProgress: (profile.totalPoints % 1000) / 1000,
      rank: this.calculateUserRank(userId)
    };
  }

  private calculateUserRank(userId: string): string {
    const profile = this.getUserProfile(userId);
    
    if (profile.totalPoints >= 10000) return 'Search Legend';
    if (profile.totalPoints >= 5000) return 'Search Expert';
    if (profile.totalPoints >= 2000) return 'Advanced Searcher';
    if (profile.totalPoints >= 500) return 'Smart Searcher';
    return 'Search Explorer';
  }
}

export default MicroRewardsService;