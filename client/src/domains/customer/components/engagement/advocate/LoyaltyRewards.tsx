/**
 * Phase 3: Advocate Stage - Loyalty Rewards
 * Amazon.com 5 A's Framework Implementation
 * Multi-Tier Loyalty Program with Gamification
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Crown, 
  Star, 
  Gift, 
  Award,
  TrendingUp,
  Users,
  Zap,
  Heart,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  Sparkles,
  Diamond,
  Trophy,
  Lock,
  Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoyaltyRewardsProps {
  userId?: string;
  className?: string;
}

interface LoyaltyData {
  user: LoyaltyUser;
  currentTier: LoyaltyTier;
  tiers: LoyaltyTier[];
  points: PointsOverview;
  availableRewards: LoyaltyReward[];
  achievements: Achievement[];
  challenges: LoyaltyChallenge[];
  history: LoyaltyTransaction[];
  specialOffers: SpecialOffer[];
}

interface LoyaltyUser {
  id: string;
  name: string;
  joinDate: string;
  tierName: string;
  tierLevel: number;
  totalPoints: number;
  lifetimePoints: number;
  nextTierPoints: number;
  tierExpiry: string;
  streak: number;
  badges: string[];
}

interface LoyaltyTier {
  id: string;
  name: string;
  level: number;
  minPoints: number;
  maxPoints?: number;
  color: string;
  icon: any;
  benefits: TierBenefit[];
  multiplier: number;
  exclusivePerks: string[];
}

interface TierBenefit {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'shipping' | 'support' | 'access' | 'bonus';
  value: string;
  icon: any;
}

interface PointsOverview {
  available: number;
  pending: number;
  lifetime: number;
  thisMonth: number;
  expiring: number;
  expiryDate: string;
}

interface LoyaltyReward {
  id: string;
  type: 'discount' | 'product' | 'cashback' | 'experience' | 'voucher';
  title: string;
  description: string;
  pointsCost: number;
  value: number;
  category: string;
  available: number;
  redeemed: boolean;
  exclusive: boolean;
  tierRequired: number;
  validUntil: string;
  image: string;
  popular: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'shopping' | 'engagement' | 'social' | 'milestone';
  icon: any;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
}

interface LoyaltyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  target: number;
  progress: number;
  reward: string;
  deadline: string;
  bonus: boolean;
  completed: boolean;
}

interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  reason: string;
  date: string;
  orderId?: string;
  rewardName?: string;
}

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  pointsMultiplier: number;
  category: string;
  validUntil: string;
  tierExclusive?: number;
  limited: boolean;
  claimed: boolean;
}

const LoyaltyRewards: React.FC<LoyaltyRewardsProps> = ({
  userId,
  className,
}) => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'achievements' | 'history'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load loyalty program data
    const loadLoyaltyData = () => {
      const tiers: LoyaltyTier[] = [
        {
          id: 'bronze',
          name: 'Bronze Explorer',
          level: 1,
          minPoints: 0,
          maxPoints: 999,
          color: 'bg-amber-600',
          icon: Star,
          multiplier: 1.0,
          benefits: [
            {
              id: 'basic-points',
              title: 'Base Points',
              description: '1 point per ৳100 spent',
              type: 'bonus',
              value: '1x',
              icon: Star
            },
            {
              id: 'free-shipping-1000',
              title: 'Free Shipping',
              description: 'On orders above ৳1000',
              type: 'shipping',
              value: 'Above ৳1000',
              icon: Target
            }
          ],
          exclusivePerks: ['Welcome bonus', 'Birthday rewards']
        },
        {
          id: 'silver',
          name: 'Silver Adventurer',
          level: 2,
          minPoints: 1000,
          maxPoints: 4999,
          color: 'bg-gray-400',
          icon: Award,
          multiplier: 1.2,
          benefits: [
            {
              id: 'bonus-points',
              title: 'Bonus Points',
              description: '1.2x points on all purchases',
              type: 'bonus',
              value: '1.2x',
              icon: TrendingUp
            },
            {
              id: 'free-shipping-750',
              title: 'Free Shipping',
              description: 'On orders above ৳750',
              type: 'shipping',
              value: 'Above ৳750',
              icon: Target
            },
            {
              id: 'priority-support',
              title: 'Priority Support',
              description: 'Faster customer service',
              type: 'support',
              value: 'Priority',
              icon: Users
            }
          ],
          exclusivePerks: ['Early sale access', 'Special discounts', 'Member-only products']
        },
        {
          id: 'gold',
          name: 'Gold Champion',
          level: 3,
          minPoints: 5000,
          maxPoints: 14999,
          color: 'bg-yellow-500',
          icon: Crown,
          multiplier: 1.5,
          benefits: [
            {
              id: 'premium-points',
              title: 'Premium Points',
              description: '1.5x points on all purchases',
              type: 'bonus',
              value: '1.5x',
              icon: Sparkles
            },
            {
              id: 'free-shipping-all',
              title: 'Free Shipping',
              description: 'On all orders',
              type: 'shipping',
              value: 'All orders',
              icon: Target
            },
            {
              id: 'premium-support',
              title: 'Premium Support',
              description: '24/7 dedicated support',
              type: 'support',
              value: '24/7',
              icon: Heart
            },
            {
              id: 'cashback',
              title: 'Cashback',
              description: '2% cashback on all purchases',
              type: 'discount',
              value: '2%',
              icon: Gift
            }
          ],
          exclusivePerks: ['VIP events', 'Personal shopper', 'Exclusive collections', 'Birthday bonuses']
        },
        {
          id: 'platinum',
          name: 'Platinum Elite',
          level: 4,
          minPoints: 15000,
          maxPoints: 29999,
          color: 'bg-purple-600',
          icon: Diamond,
          multiplier: 2.0,
          benefits: [
            {
              id: 'elite-points',
              title: 'Elite Points',
              description: '2x points on all purchases',
              type: 'bonus',
              value: '2x',
              icon: Zap
            },
            {
              id: 'express-shipping',
              title: 'Express Shipping',
              description: 'Free same-day delivery',
              type: 'shipping',
              value: 'Same-day',
              icon: Zap
            },
            {
              id: 'concierge-support',
              title: 'Concierge Support',
              description: 'Personal account manager',
              type: 'support',
              value: 'Personal',
              icon: Crown
            },
            {
              id: 'premium-cashback',
              title: 'Premium Cashback',
              description: '5% cashback on all purchases',
              type: 'discount',
              value: '5%',
              icon: Trophy
            }
          ],
          exclusivePerks: ['Luxury experiences', 'Beta product access', 'Annual VIP gifts', 'Executive lounge access']
        },
        {
          id: 'diamond',
          name: 'Diamond Royalty',
          level: 5,
          minPoints: 30000,
          color: 'bg-blue-600',
          icon: Trophy,
          multiplier: 3.0,
          benefits: [
            {
              id: 'royal-points',
              title: 'Royal Points',
              description: '3x points on all purchases',
              type: 'bonus',
              value: '3x',
              icon: Trophy
            },
            {
              id: 'royal-shipping',
              title: 'Royal Delivery',
              description: 'Instant delivery available',
              type: 'shipping',
              value: 'Instant',
              icon: Crown
            },
            {
              id: 'royal-support',
              title: 'Royal Support',
              description: 'Dedicated executive team',
              type: 'support',
              value: 'Executive',
              icon: Diamond
            },
            {
              id: 'royal-cashback',
              title: 'Royal Cashback',
              description: '10% cashback on all purchases',
              type: 'discount',
              value: '10%',
              icon: Sparkles
            }
          ],
          exclusivePerks: ['Private shopping events', 'Product customization', 'Lifetime benefits', 'Invitation-only experiences']
        }
      ];

      const mockData: LoyaltyData = {
        user: {
          id: userId || 'user1',
          name: 'Ahmed Rahman',
          joinDate: '2023-05-15',
          tierName: 'Gold Champion',
          tierLevel: 3,
          totalPoints: 8750,
          lifetimePoints: 24500,
          nextTierPoints: 6250,
          tierExpiry: '2025-12-31',
          streak: 12,
          badges: ['Early Adopter', 'Review Master', 'Social Influencer', 'Loyal Customer']
        },
        currentTier: tiers[2], // Gold
        tiers,
        points: {
          available: 8750,
          pending: 450,
          lifetime: 24500,
          thisMonth: 1250,
          expiring: 500,
          expiryDate: '2025-01-15'
        },
        availableRewards: [
          {
            id: 'discount-500',
            type: 'discount',
            title: '৳500 Discount Voucher',
            description: 'Use on any purchase above ৳2000',
            pointsCost: 1000,
            value: 500,
            category: 'Shopping',
            available: 50,
            redeemed: false,
            exclusive: false,
            tierRequired: 1,
            validUntil: '2025-03-31',
            image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=200',
            popular: true
          },
          {
            id: 'free-shipping-month',
            type: 'voucher',
            title: 'Free Shipping for 1 Month',
            description: 'Unlimited free shipping on all orders',
            pointsCost: 2000,
            value: 1000,
            category: 'Shipping',
            available: 25,
            redeemed: false,
            exclusive: false,
            tierRequired: 2,
            validUntil: '2025-06-30',
            image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=200',
            popular: true
          },
          {
            id: 'premium-headset',
            type: 'product',
            title: 'Premium Gaming Headset',
            description: 'Latest wireless gaming headset',
            pointsCost: 15000,
            value: 12500,
            category: 'Electronics',
            available: 5,
            redeemed: false,
            exclusive: true,
            tierRequired: 3,
            validUntil: '2025-04-30',
            image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=200',
            popular: false
          },
          {
            id: 'vip-experience',
            type: 'experience',
            title: 'VIP Shopping Experience',
            description: 'Personal shopping session with expert',
            pointsCost: 5000,
            value: 8000,
            category: 'Experience',
            available: 10,
            redeemed: false,
            exclusive: true,
            tierRequired: 3,
            validUntil: '2025-05-31',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
            popular: false
          },
          {
            id: 'cashback-1000',
            type: 'cashback',
            title: '৳1000 Instant Cashback',
            description: 'Direct cashback to your account',
            pointsCost: 2500,
            value: 1000,
            category: 'Cashback',
            available: 100,
            redeemed: false,
            exclusive: false,
            tierRequired: 2,
            validUntil: '2025-02-28',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200',
            popular: true
          }
        ],
        achievements: [
          {
            id: 'first-purchase',
            title: 'First Steps',
            description: 'Make your first purchase',
            category: 'shopping',
            icon: Star,
            progress: 1,
            target: 1,
            completed: true,
            completedAt: '2023-05-16',
            reward: '100 bonus points',
            difficulty: 'easy'
          },
          {
            id: 'loyal-customer',
            title: 'Loyal Customer',
            description: 'Complete 50 orders',
            category: 'shopping',
            icon: Heart,
            progress: 34,
            target: 50,
            completed: false,
            reward: '2500 bonus points + Platinum tier',
            difficulty: 'hard'
          },
          {
            id: 'review-master',
            title: 'Review Master',
            description: 'Write 25 product reviews',
            category: 'engagement',
            icon: Award,
            progress: 25,
            target: 25,
            completed: true,
            completedAt: '2024-09-12',
            reward: 'Review Master badge + 1000 points',
            difficulty: 'medium'
          },
          {
            id: 'social-influencer',
            title: 'Social Influencer',
            description: 'Refer 20 friends',
            category: 'social',
            icon: Users,
            progress: 18,
            target: 20,
            completed: false,
            reward: 'Social Influencer badge + 5000 points',
            difficulty: 'hard'
          },
          {
            id: 'shopping-streak',
            title: 'Shopping Streak',
            description: 'Make purchases for 12 consecutive months',
            category: 'milestone',
            icon: Flame,
            progress: 12,
            target: 12,
            completed: true,
            completedAt: '2024-12-01',
            reward: 'Streak Master badge + 3000 points',
            difficulty: 'legendary'
          }
        ],
        challenges: [
          {
            id: 'december-shopper',
            title: 'December Shopping Challenge',
            description: 'Make 5 purchases this month',
            type: 'monthly',
            target: 5,
            progress: 3,
            reward: '1500 bonus points',
            deadline: '2024-12-31',
            bonus: true,
            completed: false
          },
          {
            id: 'daily-login',
            title: 'Daily Visitor',
            description: 'Visit the app daily',
            type: 'daily',
            target: 1,
            progress: 1,
            reward: '50 points',
            deadline: '2024-12-14',
            bonus: false,
            completed: true
          },
          {
            id: 'weekly-reviewer',
            title: 'Weekly Reviewer',
            description: 'Write 3 reviews this week',
            type: 'weekly',
            target: 3,
            progress: 1,
            reward: '300 bonus points',
            deadline: '2024-12-20',
            bonus: false,
            completed: false
          }
        ],
        history: [
          {
            id: 'txn1',
            type: 'earned',
            points: 125,
            reason: 'Purchase: Gaming Headset',
            date: '2024-12-12',
            orderId: 'GT-2025-0001'
          },
          {
            id: 'txn2',
            type: 'bonus',
            points: 200,
            reason: 'Review bonus for Gaming Headset',
            date: '2024-12-13'
          },
          {
            id: 'txn3',
            type: 'redeemed',
            points: -1000,
            reason: 'Redeemed: ৳500 Discount Voucher',
            date: '2024-12-10',
            rewardName: '৳500 Discount Voucher'
          },
          {
            id: 'txn4',
            type: 'earned',
            points: 95,
            reason: 'Purchase: Bluetooth Speaker',
            date: '2024-12-08',
            orderId: 'GT-2024-0089'
          }
        ],
        specialOffers: [
          {
            id: 'double-points',
            title: 'Double Points Weekend',
            description: 'Earn 2x points on all electronics',
            pointsMultiplier: 2.0,
            category: 'Electronics',
            validUntil: '2024-12-15',
            limited: true,
            claimed: false
          },
          {
            id: 'gold-exclusive',
            title: 'Gold Member Exclusive',
            description: '50% bonus points on fashion items',
            pointsMultiplier: 1.5,
            category: 'Fashion',
            validUntil: '2024-12-31',
            tierExclusive: 3,
            limited: false,
            claimed: false
          }
        ]
      };

      setTimeout(() => {
        setLoyaltyData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadLoyaltyData();
  }, [userId]);

  const handleRedeemReward = (rewardId: string) => {
    // Simulate reward redemption
    setTimeout(() => {
      alert('Reward redeemed successfully! Check your account for details.');
    }, 1000);
  };

  const getCurrentTierProgress = () => {
    if (!loyaltyData) return 0;
    const current = loyaltyData.user.totalPoints;
    const tierMin = loyaltyData.currentTier.minPoints;
    const tierMax = loyaltyData.currentTier.maxPoints || current + loyaltyData.user.nextTierPoints;
    return ((current - tierMin) / (tierMax - tierMin)) * 100;
  };

  if (loading) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Loyalty Program Unavailable</h3>
            <p className="text-muted-foreground">
              Unable to load loyalty program information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-6xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          Loyalty Rewards Program
        </h1>
        <p className="text-muted-foreground">
          Earn points with every purchase and unlock exclusive rewards and benefits
        </p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className={cn('bg-gradient-to-r from-yellow-50 to-orange-50', loyaltyData.currentTier.color, 'text-white')}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Crown className="h-6 w-6" />
            </div>
            <div className="text-lg font-bold">{loyaltyData.user.tierName}</div>
            <div className="text-sm opacity-90">Current Tier</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {loyaltyData.points.available.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Available Points</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {loyaltyData.user.nextTierPoints.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Points to Next Tier</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {loyaltyData.user.streak}
            </div>
            <div className="text-sm text-muted-foreground">Month Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tier Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{loyaltyData.currentTier.name}</span>
              <span className="text-sm text-muted-foreground">
                {loyaltyData.user.totalPoints.toLocaleString()} / {loyaltyData.user.totalPoints + loyaltyData.user.nextTierPoints} points
              </span>
            </div>
            <Progress value={getCurrentTierProgress()} className="h-3" />
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Current multiplier: {loyaltyData.currentTier.multiplier}x points
              </div>
              <div className="text-sm font-medium text-primary">
                {loyaltyData.user.nextTierPoints.toLocaleString()} points to {loyaltyData.tiers[loyaltyData.user.tierLevel]?.name}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {(['overview', 'rewards', 'achievements', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm capitalize',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* All Tiers */}
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loyaltyData.tiers.map((tier) => {
                    const Icon = tier.icon;
                    const isCurrentTier = tier.level === loyaltyData.user.tierLevel;
                    const isUnlocked = tier.level <= loyaltyData.user.tierLevel;
                    
                    return (
                      <div key={tier.id} className={cn(
                        'p-4 rounded-lg border',
                        isCurrentTier && 'border-primary bg-primary/5',
                        !isUnlocked && 'opacity-60'
                      )}>
                        <div className="flex items-center gap-4 mb-3">
                          <div className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center text-white',
                            tier.color
                          )}>
                            {isUnlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                          </div>
                          <div>
                            <h3 className="font-semibold">{tier.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {tier.minPoints.toLocaleString()}+ points • {tier.multiplier}x multiplier
                            </p>
                          </div>
                          {isCurrentTier && (
                            <Badge className="ml-auto">Current Tier</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {tier.benefits.slice(0, 4).map((benefit) => {
                            const BenefitIcon = benefit.icon;
                            return (
                              <div key={benefit.id} className="flex items-center gap-2 text-sm">
                                <BenefitIcon className="h-4 w-4 text-primary" />
                                <span>{benefit.title}: {benefit.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Current Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Active Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loyaltyData.challenges.filter(c => !c.completed).map((challenge) => (
                    <div key={challenge.id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{challenge.title}</h4>
                        <Badge variant={challenge.bonus ? 'default' : 'secondary'}>
                          {challenge.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Progress: {challenge.progress}/{challenge.target}</span>
                        <span className="text-sm text-primary font-medium">{challenge.reward}</span>
                      </div>
                      <Progress value={(challenge.progress / challenge.target) * 100} />
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Deadline: {challenge.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Points Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Points Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Available</span>
                    <span className="font-bold text-primary">{loyaltyData.points.available.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span className="text-yellow-600">{loyaltyData.points.pending.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="text-green-600">{loyaltyData.points.thisMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Lifetime Total</span>
                    <span className="font-bold">{loyaltyData.points.lifetime.toLocaleString()}</span>
                  </div>
                  {loyaltyData.points.expiring > 0 && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Points Expiring Soon</span>
                      </div>
                      <div className="text-sm text-orange-700">
                        {loyaltyData.points.expiring} points expire on {loyaltyData.points.expiryDate}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {loyaltyData.user.badges.map((badge) => (
                    <div key={badge} className="p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg text-center">
                      <Award className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
                      <div className="text-xs font-medium">{badge}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Offers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Special Offers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loyaltyData.specialOffers.map((offer) => (
                    <div key={offer.id} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <h4 className="font-semibold text-sm">{offer.title}</h4>
                      <p className="text-xs text-muted-foreground">{offer.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className="bg-purple-100 text-purple-700">
                          {offer.pointsMultiplier}x Points
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Until {offer.validUntil}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Rewards</h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Categories</option>
              <option value="Shopping">Shopping</option>
              <option value="Shipping">Shipping</option>
              <option value="Electronics">Electronics</option>
              <option value="Experience">Experience</option>
              <option value="Cashback">Cashback</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loyaltyData.availableRewards
              .filter(reward => selectedCategory === 'all' || reward.category === selectedCategory)
              .map((reward) => (
                <Card key={reward.id} className={cn(
                  'hover:shadow-lg transition-shadow',
                  reward.popular && 'ring-2 ring-orange-200 bg-orange-50'
                )}>
                  {reward.popular && (
                    <Badge className="absolute -top-2 left-4 bg-orange-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {reward.exclusive && (
                    <Badge className="absolute -top-2 right-4 bg-purple-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Exclusive
                    </Badge>
                  )}
                  <CardContent className="p-4 pt-6">
                    <img
                      src={reward.image}
                      alt={reward.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-semibold mb-2">{reward.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {reward.pointsCost.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          ৳{reward.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Value</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                      <span>{reward.available} available</span>
                      <span>Tier {reward.tierRequired}+</span>
                    </div>
                    
                    <Button
                      onClick={() => handleRedeemReward(reward.id)}
                      disabled={
                        reward.redeemed || 
                        loyaltyData.points.available < reward.pointsCost ||
                        loyaltyData.user.tierLevel < reward.tierRequired
                      }
                      className="w-full"
                      variant={reward.redeemed ? 'secondary' : 'default'}
                    >
                      {reward.redeemed ? 'Redeemed' : 
                       loyaltyData.points.available < reward.pointsCost ? 'Not Enough Points' :
                       loyaltyData.user.tierLevel < reward.tierRequired ? `Requires Tier ${reward.tierRequired}` :
                       'Redeem Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Achievements</h2>
            <p className="text-muted-foreground">
              Complete challenges to earn badges and bonus points
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loyaltyData.achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Card key={achievement.id} className={cn(
                  'hover:shadow-lg transition-shadow',
                  achievement.completed && 'bg-green-50 border-green-200'
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center',
                        achievement.completed ? 'bg-green-100' : 'bg-gray-100'
                      )}>
                        <Icon className={cn(
                          'h-6 w-6',
                          achievement.completed ? 'text-green-600' : 'text-gray-400'
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <Badge variant={
                            achievement.difficulty === 'easy' ? 'secondary' :
                            achievement.difficulty === 'medium' ? 'default' :
                            achievement.difficulty === 'hard' ? 'destructive' : 'default'
                          } className={
                            achievement.difficulty === 'legendary' ? 'bg-purple-500 text-white' : ''
                          }>
                            {achievement.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        
                        {!achievement.completed && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}/{achievement.target}</span>
                            </div>
                            <Progress value={(achievement.progress / achievement.target) * 100} />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-primary">{achievement.reward}</span>
                          {achievement.completed && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed {achievement.completedAt}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Points History</h2>
            <div className="text-sm text-muted-foreground">
              Lifetime points: {loyaltyData.points.lifetime.toLocaleString()}
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {loyaltyData.history.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        transaction.type === 'earned' && 'bg-green-100',
                        transaction.type === 'bonus' && 'bg-blue-100',
                        transaction.type === 'redeemed' && 'bg-red-100',
                        transaction.type === 'expired' && 'bg-gray-100'
                      )}>
                        {transaction.type === 'earned' && <TrendingUp className="h-5 w-5 text-green-600" />}
                        {transaction.type === 'bonus' && <Star className="h-5 w-5 text-blue-600" />}
                        {transaction.type === 'redeemed' && <Gift className="h-5 w-5 text-red-600" />}
                        {transaction.type === 'expired' && <Clock className="h-5 w-5 text-gray-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{transaction.reason}</h4>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        {transaction.orderId && (
                          <p className="text-xs text-muted-foreground">Order: {transaction.orderId}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={cn(
                        'text-lg font-bold',
                        transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {transaction.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LoyaltyRewards;