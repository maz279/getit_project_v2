/**
 * GamificationService - Advanced Gamification System
 * Amazon.com/Shopee.sg-Level Enterprise Gamification Implementation
 * 
 * @fileoverview Complete gamification system with points, badges, levels, challenges, 
 * leaderboards, and reward mechanisms for enhanced user engagement
 * @author GetIt Platform Team
 * @version 3.6.0
 */

import { EventEmitter } from 'events';

// =============================================
// TYPES & INTERFACES
// =============================================

export interface GamificationUser {
  id: string;
  email: string;
  level: number;
  points: number;
  badges: string[];
  streak: number;
  lastActivity: Date;
  preferences: {
    notifications: boolean;
    challenges: boolean;
    social: boolean;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'shopping' | 'social' | 'achievement' | 'loyalty';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    threshold: number;
    timeframe?: string;
  };
  reward: {
    points: number;
    discount?: number;
    freeShipping?: boolean;
  };
  earned: boolean;
  earnedAt?: Date;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'shopping' | 'social' | 'exploration' | 'loyalty';
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: {
    action: string;
    target: number;
    timeframe: string;
  };
  reward: {
    points: number;
    badge?: string;
    discount?: number;
  };
  progress: number;
  active: boolean;
  startDate: Date;
  endDate: Date;
  participants: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  points: number;
  level: number;
  badges: number;
  rank: number;
  change: number; // Position change from last period
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'freeShipping' | 'cashback' | 'points' | 'badge';
  value: number;
  cost: number; // Points required
  availability: number;
  claimed: number;
  category: string;
  validUntil: Date;
  terms: string[];
}

export interface GamificationConfig {
  pointsPerPurchase: number;
  pointsPerReview: number;
  pointsPerShare: number;
  pointsPerReferral: number;
  levelThresholds: number[];
  streakBonus: number;
  badgeMultiplier: number;
  challengeRefreshInterval: number;
  leaderboardUpdateInterval: number;
  maxDailyChallenges: number;
  maxWeeklyChallenges: number;
  socialFeatures: boolean;
  notifications: boolean;
}

export interface GamificationAnalytics {
  totalUsers: number;
  activeUsers: number;
  averageLevel: number;
  totalPointsAwarded: number;
  totalBadgesEarned: number;
  completedChallenges: number;
  rewardsRedeemed: number;
  engagementRate: number;
  retentionRate: number;
  conversionImprovement: number;
  topUsers: LeaderboardEntry[];
  popularBadges: Badge[];
  challengeCompletionRate: number;
}

// =============================================
// GAMIFICATION SERVICE
// =============================================

export class GamificationService extends EventEmitter {
  private static instance: GamificationService;
  private config: GamificationConfig;
  private users: Map<string, GamificationUser>;
  private badges: Map<string, Badge>;
  private challenges: Map<string, Challenge>;
  private leaderboard: LeaderboardEntry[];
  private rewards: Map<string, Reward>;
  private analytics: GamificationAnalytics;
  private initialized: boolean = false;

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
    this.users = new Map();
    this.badges = new Map();
    this.challenges = new Map();
    this.leaderboard = [];
    this.rewards = new Map();
    this.analytics = this.getDefaultAnalytics();
  }

  public static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // =============================================
  // INITIALIZATION
  // =============================================

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.initializeBadges();
      await this.initializeChallenges();
      await this.initializeRewards();
      await this.initializeUsers();
      await this.updateLeaderboard();
      await this.updateAnalytics();
      
      this.startPeriodicUpdates();
      this.initialized = true;
      
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize GamificationService:', error);
      throw error;
    }
  }

  private getDefaultConfig(): GamificationConfig {
    return {
      pointsPerPurchase: 10,
      pointsPerReview: 5,
      pointsPerShare: 3,
      pointsPerReferral: 50,
      levelThresholds: [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500],
      streakBonus: 1.2,
      badgeMultiplier: 1.5,
      challengeRefreshInterval: 86400000, // 24 hours
      leaderboardUpdateInterval: 3600000, // 1 hour
      maxDailyChallenges: 3,
      maxWeeklyChallenges: 5,
      socialFeatures: true,
      notifications: true
    };
  }

  private getDefaultAnalytics(): GamificationAnalytics {
    return {
      totalUsers: 0,
      activeUsers: 0,
      averageLevel: 0,
      totalPointsAwarded: 0,
      totalBadgesEarned: 0,
      completedChallenges: 0,
      rewardsRedeemed: 0,
      engagementRate: 0,
      retentionRate: 0,
      conversionImprovement: 0,
      topUsers: [],
      popularBadges: [],
      challengeCompletionRate: 0
    };
  }

  // =============================================
  // USER MANAGEMENT
  // =============================================

  public async createUser(userId: string, email: string): Promise<GamificationUser> {
    if (this.users.has(userId)) {
      return this.users.get(userId)!;
    }

    const user: GamificationUser = {
      id: userId,
      email,
      level: 1,
      points: 0,
      badges: [],
      streak: 0,
      lastActivity: new Date(),
      preferences: {
        notifications: true,
        challenges: true,
        social: true
      }
    };

    this.users.set(userId, user);
    await this.updateAnalytics();
    
    this.emit('userCreated', user);
    return user;
  }

  public async getUser(userId: string): Promise<GamificationUser | null> {
    return this.users.get(userId) || null;
  }

  public async updateUserActivity(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    const now = new Date();
    const lastActivity = user.lastActivity;
    const daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastActivity === 1) {
      user.streak += 1;
    } else if (daysSinceLastActivity > 1) {
      user.streak = 1;
    }

    user.lastActivity = now;
    this.users.set(userId, user);
    
    this.emit('userActivityUpdated', user);
  }

  // =============================================
  // POINTS SYSTEM
  // =============================================

  public async awardPoints(userId: string, points: number, reason: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    let finalPoints = points;
    
    // Apply streak bonus
    if (user.streak > 0) {
      finalPoints = Math.floor(points * (1 + (user.streak * 0.1)));
    }

    // Apply badge multiplier
    const badgeCount = user.badges.length;
    if (badgeCount > 0) {
      finalPoints = Math.floor(finalPoints * (1 + (badgeCount * 0.05)));
    }

    user.points += finalPoints;
    
    // Check for level up
    await this.checkLevelUp(userId);
    
    this.users.set(userId, user);
    this.analytics.totalPointsAwarded += finalPoints;
    
    this.emit('pointsAwarded', { userId, points: finalPoints, reason });
  }

  public async deductPoints(userId: string, points: number, reason: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || user.points < points) return false;

    user.points -= points;
    this.users.set(userId, user);
    
    this.emit('pointsDeducted', { userId, points, reason });
    return true;
  }

  private async checkLevelUp(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    const currentLevel = user.level;
    const newLevel = this.calculateLevel(user.points);

    if (newLevel > currentLevel) {
      user.level = newLevel;
      this.users.set(userId, user);
      
      // Award bonus points for level up
      const bonusPoints = newLevel * 10;
      user.points += bonusPoints;
      
      this.emit('levelUp', { userId, newLevel, bonusPoints });
    }
  }

  private calculateLevel(points: number): number {
    for (let i = this.config.levelThresholds.length - 1; i >= 0; i--) {
      if (points >= this.config.levelThresholds[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  // =============================================
  // BADGE SYSTEM
  // =============================================

  private async initializeBadges(): Promise<void> {
    const defaultBadges: Badge[] = [
      {
        id: 'first-purchase',
        name: 'First Purchase',
        description: 'Complete your first purchase',
        category: 'shopping',
        icon: '🛒',
        rarity: 'common',
        requirements: { type: 'purchase', threshold: 1 },
        reward: { points: 50 },
        earned: false
      },
      {
        id: 'shopaholic',
        name: 'Shopaholic',
        description: 'Make 50 purchases',
        category: 'shopping',
        icon: '🛍️',
        rarity: 'epic',
        requirements: { type: 'purchase', threshold: 50 },
        reward: { points: 500, discount: 10 },
        earned: false
      },
      {
        id: 'reviewer',
        name: 'Product Reviewer',
        description: 'Write 10 product reviews',
        category: 'social',
        icon: '⭐',
        rarity: 'rare',
        requirements: { type: 'review', threshold: 10 },
        reward: { points: 100 },
        earned: false
      },
      {
        id: 'social-butterfly',
        name: 'Social Butterfly',
        description: 'Share 25 products',
        category: 'social',
        icon: '🦋',
        rarity: 'rare',
        requirements: { type: 'share', threshold: 25 },
        reward: { points: 150 },
        earned: false
      },
      {
        id: 'loyalty-champion',
        name: 'Loyalty Champion',
        description: 'Maintain 30-day streak',
        category: 'loyalty',
        icon: '🏆',
        rarity: 'legendary',
        requirements: { type: 'streak', threshold: 30 },
        reward: { points: 1000, freeShipping: true },
        earned: false
      }
    ];

    for (const badge of defaultBadges) {
      this.badges.set(badge.id, badge);
    }
  }

  public async checkBadgeEligibility(userId: string, action: string, value: number): Promise<Badge[]> {
    const user = this.users.get(userId);
    if (!user) return [];

    const earnedBadges: Badge[] = [];

    for (const badge of this.badges.values()) {
      if (user.badges.includes(badge.id)) continue;

      let eligible = false;
      
      switch (badge.requirements.type) {
        case 'purchase':
          eligible = action === 'purchase' && value >= badge.requirements.threshold;
          break;
        case 'review':
          eligible = action === 'review' && value >= badge.requirements.threshold;
          break;
        case 'share':
          eligible = action === 'share' && value >= badge.requirements.threshold;
          break;
        case 'streak':
          eligible = user.streak >= badge.requirements.threshold;
          break;
      }

      if (eligible) {
        await this.awardBadge(userId, badge.id);
        earnedBadges.push(badge);
      }
    }

    return earnedBadges;
  }

  public async awardBadge(userId: string, badgeId: string): Promise<void> {
    const user = this.users.get(userId);
    const badge = this.badges.get(badgeId);
    
    if (!user || !badge || user.badges.includes(badgeId)) return;

    user.badges.push(badgeId);
    badge.earned = true;
    badge.earnedAt = new Date();
    
    // Award badge points
    await this.awardPoints(userId, badge.reward.points, `Badge earned: ${badge.name}`);
    
    this.users.set(userId, user);
    this.badges.set(badgeId, badge);
    this.analytics.totalBadgesEarned++;
    
    this.emit('badgeEarned', { userId, badge });
  }

  public async getUserBadges(userId: string): Promise<Badge[]> {
    const user = this.users.get(userId);
    if (!user) return [];

    return user.badges.map(badgeId => this.badges.get(badgeId)!).filter(Boolean);
  }

  // =============================================
  // CHALLENGE SYSTEM
  // =============================================

  private async initializeChallenges(): Promise<void> {
    const defaultChallenges: Challenge[] = [
      {
        id: 'daily-explorer',
        name: 'Daily Explorer',
        description: 'Browse 10 different products today',
        type: 'daily',
        category: 'exploration',
        difficulty: 'easy',
        requirements: { action: 'browse', target: 10, timeframe: '1d' },
        reward: { points: 25 },
        progress: 0,
        active: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        participants: 0
      },
      {
        id: 'weekly-shopper',
        name: 'Weekly Shopper',
        description: 'Make 3 purchases this week',
        type: 'weekly',
        category: 'shopping',
        difficulty: 'medium',
        requirements: { action: 'purchase', target: 3, timeframe: '7d' },
        reward: { points: 100, discount: 5 },
        progress: 0,
        active: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        participants: 0
      },
      {
        id: 'social-influencer',
        name: 'Social Influencer',
        description: 'Share 5 products and get 10 likes',
        type: 'weekly',
        category: 'social',
        difficulty: 'hard',
        requirements: { action: 'social', target: 15, timeframe: '7d' },
        reward: { points: 200, badge: 'social-butterfly' },
        progress: 0,
        active: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        participants: 0
      }
    ];

    for (const challenge of defaultChallenges) {
      this.challenges.set(challenge.id, challenge);
    }
  }

  public async createChallenge(challengeData: Omit<Challenge, 'id' | 'progress' | 'participants'>): Promise<Challenge> {
    const challenge: Challenge = {
      ...challengeData,
      id: `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      participants: 0
    };

    this.challenges.set(challenge.id, challenge);
    
    this.emit('challengeCreated', challenge);
    return challenge;
  }

  public async getUserChallenges(userId: string): Promise<Challenge[]> {
    const user = this.users.get(userId);
    if (!user || !user.preferences.challenges) return [];

    return Array.from(this.challenges.values()).filter(challenge => 
      challenge.active && challenge.endDate > new Date()
    );
  }

  public async updateChallengeProgress(userId: string, action: string, value: number = 1): Promise<Challenge[]> {
    const user = this.users.get(userId);
    if (!user) return [];

    const completedChallenges: Challenge[] = [];

    for (const challenge of this.challenges.values()) {
      if (!challenge.active || challenge.endDate < new Date()) continue;
      if (challenge.requirements.action !== action) continue;

      challenge.progress += value;
      
      if (challenge.progress >= challenge.requirements.target) {
        await this.completeChallenge(userId, challenge.id);
        completedChallenges.push(challenge);
      }
      
      this.challenges.set(challenge.id, challenge);
    }

    return completedChallenges;
  }

  private async completeChallenge(userId: string, challengeId: string): Promise<void> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return;

    // Award challenge points
    await this.awardPoints(userId, challenge.reward.points, `Challenge completed: ${challenge.name}`);
    
    // Award badge if specified
    if (challenge.reward.badge) {
      await this.awardBadge(userId, challenge.reward.badge);
    }

    challenge.active = false;
    this.challenges.set(challengeId, challenge);
    this.analytics.completedChallenges++;
    
    this.emit('challengeCompleted', { userId, challenge });
  }

  // =============================================
  // LEADERBOARD SYSTEM
  // =============================================

  public async updateLeaderboard(): Promise<void> {
    const entries: LeaderboardEntry[] = [];

    for (const user of this.users.values()) {
      entries.push({
        userId: user.id,
        username: user.email.split('@')[0],
        points: user.points,
        level: user.level,
        badges: user.badges.length,
        rank: 0,
        change: 0
      });
    }

    // Sort by points (descending)
    entries.sort((a, b) => b.points - a.points);

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Calculate rank changes
    for (const entry of entries) {
      const previousEntry = this.leaderboard.find(e => e.userId === entry.userId);
      if (previousEntry) {
        entry.change = previousEntry.rank - entry.rank;
      }
    }

    this.leaderboard = entries;
    this.emit('leaderboardUpdated', this.leaderboard);
  }

  public async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return this.leaderboard.slice(0, limit);
  }

  public async getUserRank(userId: string): Promise<number> {
    const entry = this.leaderboard.find(e => e.userId === userId);
    return entry ? entry.rank : 0;
  }

  // =============================================
  // REWARD SYSTEM
  // =============================================

  private async initializeRewards(): Promise<void> {
    const defaultRewards: Reward[] = [
      {
        id: 'discount-5',
        name: '5% Discount',
        description: 'Get 5% off your next purchase',
        type: 'discount',
        value: 5,
        cost: 100,
        availability: 100,
        claimed: 0,
        category: 'shopping',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        terms: ['Valid for 30 days', 'Cannot be combined with other offers']
      },
      {
        id: 'free-shipping',
        name: 'Free Shipping',
        description: 'Free shipping on your next order',
        type: 'freeShipping',
        value: 1,
        cost: 200,
        availability: 50,
        claimed: 0,
        category: 'shipping',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        terms: ['Valid for 14 days', 'Minimum order value $25']
      },
      {
        id: 'cashback-10',
        name: '$10 Cashback',
        description: 'Get $10 cashback on purchases over $100',
        type: 'cashback',
        value: 10,
        cost: 500,
        availability: 25,
        claimed: 0,
        category: 'cashback',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        terms: ['Valid for 7 days', 'Minimum purchase $100']
      }
    ];

    for (const reward of defaultRewards) {
      this.rewards.set(reward.id, reward);
    }
  }

  public async getAvailableRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(reward => 
      reward.availability > reward.claimed && reward.validUntil > new Date()
    );
  }

  public async redeemReward(userId: string, rewardId: string): Promise<boolean> {
    const user = this.users.get(userId);
    const reward = this.rewards.get(rewardId);
    
    if (!user || !reward) return false;
    if (user.points < reward.cost) return false;
    if (reward.claimed >= reward.availability) return false;
    if (reward.validUntil < new Date()) return false;

    // Deduct points
    const success = await this.deductPoints(userId, reward.cost, `Reward redeemed: ${reward.name}`);
    if (!success) return false;

    // Update reward
    reward.claimed++;
    this.rewards.set(rewardId, reward);
    this.analytics.rewardsRedeemed++;
    
    this.emit('rewardRedeemed', { userId, reward });
    return true;
  }

  // =============================================
  // ANALYTICS & INSIGHTS
  // =============================================

  private async updateAnalytics(): Promise<void> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic metrics
    this.analytics.totalUsers = this.users.size;
    this.analytics.activeUsers = Array.from(this.users.values()).filter(
      user => user.lastActivity > oneWeekAgo
    ).length;

    // Average level
    const totalLevels = Array.from(this.users.values()).reduce((sum, user) => sum + user.level, 0);
    this.analytics.averageLevel = this.users.size > 0 ? totalLevels / this.users.size : 0;

    // Engagement metrics
    this.analytics.engagementRate = this.users.size > 0 ? (this.analytics.activeUsers / this.users.size) * 100 : 0;
    this.analytics.challengeCompletionRate = this.challenges.size > 0 ? 
      (this.analytics.completedChallenges / this.challenges.size) * 100 : 0;

    // Top users
    this.analytics.topUsers = this.leaderboard.slice(0, 10);

    // Popular badges
    const badgeCount = new Map<string, number>();
    for (const user of this.users.values()) {
      for (const badgeId of user.badges) {
        badgeCount.set(badgeId, (badgeCount.get(badgeId) || 0) + 1);
      }
    }
    
    this.analytics.popularBadges = Array.from(badgeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([badgeId]) => this.badges.get(badgeId)!)
      .filter(Boolean);

    this.emit('analyticsUpdated', this.analytics);
  }

  public async getAnalytics(): Promise<GamificationAnalytics> {
    await this.updateAnalytics();
    return { ...this.analytics };
  }

  // =============================================
  // CONFIGURATION
  // =============================================

  public async updateConfig(newConfig: Partial<GamificationConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  public getConfig(): GamificationConfig {
    return { ...this.config };
  }

  // =============================================
  // PERIODIC UPDATES
  // =============================================

  private startPeriodicUpdates(): void {
    // Update leaderboard every hour
    setInterval(async () => {
      await this.updateLeaderboard();
    }, this.config.leaderboardUpdateInterval);

    // Refresh challenges daily
    setInterval(async () => {
      await this.refreshChallenges();
    }, this.config.challengeRefreshInterval);

    // Update analytics every 5 minutes
    setInterval(async () => {
      await this.updateAnalytics();
    }, 5 * 60 * 1000);
  }

  private async refreshChallenges(): Promise<void> {
    const now = new Date();
    
    // Remove expired challenges
    for (const [id, challenge] of this.challenges) {
      if (challenge.endDate < now) {
        this.challenges.delete(id);
      }
    }

    // Add new challenges if needed
    await this.initializeChallenges();
    
    this.emit('challengesRefreshed');
  }

  // =============================================
  // INITIALIZATION HELPERS
  // =============================================

  private async initializeUsers(): Promise<void> {
    // Generate sample users for testing
    const sampleUsers = [
      { id: 'user1', email: 'alice@example.com', points: 1250, level: 3, badges: ['first-purchase', 'reviewer'] },
      { id: 'user2', email: 'bob@example.com', points: 850, level: 2, badges: ['first-purchase'] },
      { id: 'user3', email: 'charlie@example.com', points: 2100, level: 5, badges: ['first-purchase', 'reviewer', 'social-butterfly'] },
      { id: 'user4', email: 'diana@example.com', points: 650, level: 2, badges: ['first-purchase'] },
      { id: 'user5', email: 'eve@example.com', points: 1800, level: 4, badges: ['first-purchase', 'reviewer', 'shopaholic'] }
    ];

    for (const userData of sampleUsers) {
      const user: GamificationUser = {
        id: userData.id,
        email: userData.email,
        level: userData.level,
        points: userData.points,
        badges: userData.badges,
        streak: Math.floor(Math.random() * 10) + 1,
        lastActivity: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
        preferences: {
          notifications: true,
          challenges: true,
          social: true
        }
      };
      
      this.users.set(userData.id, user);
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  public async getHealthCheck(): Promise<{
    service: string;
    status: string;
    users: number;
    badges: number;
    challenges: number;
    rewards: number;
    leaderboard: number;
    analytics: object;
  }> {
    return {
      service: 'GamificationService',
      status: this.initialized ? 'healthy' : 'initializing',
      users: this.users.size,
      badges: this.badges.size,
      challenges: this.challenges.size,
      rewards: this.rewards.size,
      leaderboard: this.leaderboard.length,
      analytics: this.analytics
    };
  }

  public async reset(): Promise<void> {
    this.users.clear();
    this.badges.clear();
    this.challenges.clear();
    this.rewards.clear();
    this.leaderboard = [];
    this.analytics = this.getDefaultAnalytics();
    this.initialized = false;
    
    this.emit('reset');
  }
}

// =============================================
// EXPORT SINGLETON INSTANCE
// =============================================

export const gamificationService = GamificationService.getInstance();
export default gamificationService;