/**
 * Customer Loyalty Engine - Amazon.com ADVOCATE Stage
 * Post-purchase engagement and loyalty building with gamification
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Progress } from '../../../shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { cn } from '../../../../lib/utils';

interface LoyaltyTier {
  id: string;
  name: string;
  namebn: string;
  threshold: number;
  benefits: string[];
  color: string;
  icon: string;
}

interface ReferralReward {
  id: string;
  type: 'cash' | 'discount' | 'points' | 'cultural-bonus';
  amount: number;
  description: string;
  descriptionbn: string;
  conditions: string[];
}

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  currentPoints: number;
  currentTier: string;
  nextTierProgress: number;
  referralsCount: number;
  reviewsCount: number;
  communityRank: number;
}

interface CustomerLoyaltyEngineProps {
  customerId: string;
  className?: string;
  language?: 'en' | 'bn';
  showGamification?: boolean;
  enableCulturalRewards?: boolean;
}

export default function CustomerLoyaltyEngine({
  customerId,
  className,
  language = 'en',
  showGamification = true,
  enableCulturalRewards = true
}: CustomerLoyaltyEngineProps) {
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Loyalty tiers configuration
  const loyaltyTiers: LoyaltyTier[] = [
    {
      id: 'bronze',
      name: 'Bronze Member',
      namebn: 'ব্রোঞ্জ সদস্য',
      threshold: 0,
      benefits: ['Free delivery on orders over ৳500', '5% birthday discount', 'Early sale access'],
      color: 'from-amber-600 to-orange-600',
      icon: '🥉'
    },
    {
      id: 'silver',
      name: 'Silver Elite',
      namebn: 'সিলভার এলিট',
      threshold: 50000,
      benefits: ['Free delivery on all orders', '10% birthday discount', 'Priority customer support', 'Exclusive flash sales'],
      color: 'from-gray-400 to-gray-600',
      icon: '🥈'
    },
    {
      id: 'gold',
      name: 'Gold Premium',
      namebn: 'গোল্ড প্রিমিয়াম',
      threshold: 150000,
      benefits: ['Same-day delivery', '15% birthday discount', 'VIP customer support', 'Beta product access', 'Cultural festival bonuses'],
      color: 'from-yellow-400 to-yellow-600',
      icon: '🥇'
    },
    {
      id: 'platinum',
      name: 'Platinum Elite',
      namebn: 'প্ল্যাটিনাম এলিট',
      threshold: 500000,
      benefits: ['Personal shopping assistant', '20% birthday discount', 'Dedicated account manager', 'Exclusive events', 'Hajj/Umrah travel discounts'],
      color: 'from-purple-400 to-purple-600',
      icon: '💎'
    }
  ];

  // Referral rewards configuration
  const referralRewards: ReferralReward[] = [
    {
      id: 'standard',
      type: 'cash',
      amount: 200,
      description: 'Earn ৳200 for each successful referral',
      descriptionbn: 'প্রতি সফল রেফারেলের জন্য ৳২০০ পান',
      conditions: ['Friend must make first purchase', 'Minimum order ৳500']
    },
    {
      id: 'eid-bonus',
      type: 'cultural-bonus',
      amount: 500,
      description: 'Special Eid bonus for referrals',
      descriptionbn: 'রেফারেলের জন্য বিশেষ ঈদ বোনাস',
      conditions: ['Valid during Eid season', 'Double rewards for family referrals']
    },
    {
      id: 'bulk-referral',
      type: 'discount',
      amount: 15,
      description: '15% discount for referring 5+ friends',
      descriptionbn: '৫+ বন্ধু রেফার করলে ১৫% ছাড়',
      conditions: ['All referrals must be active', 'Valid for 6 months']
    }
  ];

  // Load customer loyalty data
  useEffect(() => {
    const loadCustomerData = () => {
      // Sample data - in production, this would come from loyalty service
      const sampleStats: CustomerStats = {
        totalOrders: 28,
        totalSpent: 125000,
        currentPoints: 12500,
        currentTier: 'gold',
        nextTierProgress: 75, // 75% to platinum
        referralsCount: 6,
        reviewsCount: 18,
        communityRank: 142
      };

      const sampleActivity = [
        {
          type: 'purchase',
          description: language === 'bn' ? 'অর্ডার সম্পূর্ণ হয়েছে' : 'Order completed',
          points: 250,
          date: '2025-07-12',
          icon: '🛒'
        },
        {
          type: 'review',
          description: language === 'bn' ? 'পণ্যের রিভিউ দিয়েছেন' : 'Product review submitted',
          points: 50,
          date: '2025-07-11',
          icon: '⭐'
        },
        {
          type: 'referral',
          description: language === 'bn' ? 'বন্ধু রেফার করেছেন' : 'Friend referred',
          points: 200,
          date: '2025-07-10',
          icon: '👥'
        },
        {
          type: 'cultural-bonus',
          description: language === 'bn' ? 'ঈদ বোনাস পেয়েছেন' : 'Eid bonus earned',
          points: 500,
          date: '2025-07-05',
          icon: '🌙'
        }
      ];

      setCustomerStats(sampleStats);
      setRecentActivity(sampleActivity);
      setIsLoading(false);
    };

    loadCustomerData();
  }, [customerId, language]);

  const getCurrentTier = () => {
    if (!customerStats) return loyaltyTiers[0];
    return loyaltyTiers.find(tier => tier.id === customerStats.currentTier) || loyaltyTiers[0];
  };

  const getNextTier = () => {
    const currentTierIndex = loyaltyTiers.findIndex(tier => tier.id === customerStats?.currentTier);
    return currentTierIndex < loyaltyTiers.length - 1 ? loyaltyTiers[currentTierIndex + 1] : null;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <Card className={cn("p-6 animate-pulse", className)}>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!customerStats) return null;

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Loyalty Status Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-gradient-to-r",
              currentTier.color
            )}>
              {currentTier.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {language === 'bn' ? currentTier.namebn : currentTier.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {customerStats.currentPoints.toLocaleString()} {language === 'bn' ? 'পয়েন্ট' : 'points'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'bn' ? 'মোট খরচ' : 'Total Spent'}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(customerStats.totalSpent)}
            </p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'bn' ? 'পরবর্তী স্তর:' : 'Next tier:'} {language === 'bn' ? nextTier.namebn : nextTier.name}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {customerStats.nextTierProgress}%
              </span>
            </div>
            <Progress value={customerStats.nextTierProgress} className="h-3" />
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {language === 'bn' 
                ? `আরও ${formatPrice(nextTier.threshold - customerStats.totalSpent)} খরচ করুন`
                : `Spend ${formatPrice(nextTier.threshold - customerStats.totalSpent)} more to unlock`
              }
            </p>
          </div>
        )}
      </Card>

      {/* Loyalty Tabs */}
      <Card className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              {language === 'bn' ? 'সংক্ষিপ্ত' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="benefits">
              {language === 'bn' ? 'সুবিধা' : 'Benefits'}
            </TabsTrigger>
            <TabsTrigger value="referrals">
              {language === 'bn' ? 'রেফারেল' : 'Referrals'}
            </TabsTrigger>
            <TabsTrigger value="activity">
              {language === 'bn' ? 'কার্যক্রম' : 'Activity'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{customerStats.totalOrders}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{customerStats.referralsCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'bn' ? 'সফল রেফারেল' : 'Successful Referrals'}
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">#{customerStats.communityRank}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'bn' ? 'কমিউনিটি র‍্যাঙ্ক' : 'Community Rank'}
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {language === 'bn' ? 'দ্রুত কাজ' : 'Quick Actions'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="h-12 justify-start">
                  <span className="mr-2">👥</span>
                  {language === 'bn' ? 'বন্ধু রেফার করুন' : 'Refer Friends'}
                </Button>
                <Button variant="outline" className="h-12 justify-start">
                  <span className="mr-2">⭐</span>
                  {language === 'bn' ? 'রিভিউ লিখুন' : 'Write Reviews'}
                </Button>
                <Button variant="outline" className="h-12 justify-start">
                  <span className="mr-2">🎁</span>
                  {language === 'bn' ? 'পয়েন্ট ব্যবহার করুন' : 'Redeem Points'}
                </Button>
                <Button variant="outline" className="h-12 justify-start">
                  <span className="mr-2">🏆</span>
                  {language === 'bn' ? 'চ্যালেঞ্জ দেখুন' : 'View Challenges'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4 mt-6">
            <div className="space-y-4">
              {loyaltyTiers.map((tier, index) => {
                const isCurrentTier = tier.id === customerStats.currentTier;
                const isUnlocked = customerStats.totalSpent >= tier.threshold;
                
                return (
                  <Card key={tier.id} className={cn(
                    "p-4 border-l-4",
                    isCurrentTier && "border-l-blue-500 bg-blue-50 dark:bg-blue-950",
                    !isUnlocked && "opacity-60"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gradient-to-r",
                          tier.color
                        )}>
                          {tier.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {language === 'bn' ? tier.namebn : tier.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {language === 'bn' ? 'প্রয়োজন:' : 'Requires:'} {formatPrice(tier.threshold)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isCurrentTier && (
                          <Badge variant="default">
                            {language === 'bn' ? 'বর্তমান' : 'Current'}
                          </Badge>
                        )}
                        {isUnlocked && !isCurrentTier && (
                          <Badge variant="secondary">
                            {language === 'bn' ? 'আনলকড' : 'Unlocked'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <span className="mr-2 text-green-500">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {language === 'bn' ? 'রেফারেল প্রোগ্রাম' : 'Referral Program'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {language === 'bn' 
                    ? 'বন্ধুদের রেফার করুন এবং পুরস্কার জিতুন!'
                    : 'Refer friends and earn rewards for every successful referral!'
                  }
                </p>
                <Button className="w-full">
                  {language === 'bn' ? 'রেফারেল লিঙ্ক শেয়ার করুন' : 'Share Referral Link'}
                </Button>
              </div>

              {/* Referral Rewards */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                  {language === 'bn' ? 'রেফারেল পুরস্কার' : 'Referral Rewards'}
                </h5>
                {referralRewards.map((reward) => (
                  <Card key={reward.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h6 className="font-medium text-gray-900 dark:text-gray-100">
                          {language === 'bn' ? reward.descriptionbn : reward.description}
                        </h6>
                        <ul className="mt-2 space-y-1">
                          {reward.conditions.map((condition, i) => (
                            <li key={i} className="text-xs text-gray-500 dark:text-gray-500">
                              • {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {reward.type === 'cash' ? formatPrice(reward.amount) : 
                         reward.type === 'discount' ? `${reward.amount}%` : 
                         `${reward.amount} pts`}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {language === 'bn' ? 'সাম্প্রতিক কার্যক্রম' : 'Recent Activity'}
              </h4>
              
              {recentActivity.map((activity, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{activity.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {activity.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {new Date(activity.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-BD')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      +{activity.points} {language === 'bn' ? 'পয়েন্ট' : 'pts'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Cultural Bonuses */}
      {enableCulturalRewards && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-red-50 dark:from-green-950 dark:to-red-950">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            🌙 {language === 'bn' ? 'সাংস্কৃতিক বোনাস' : 'Cultural Bonuses'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕌</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {language === 'bn' ? 'ঈদ বিশেষ ছাড়' : 'Eid Special Discounts'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'bn' ? 'পারিবারিক অর্ডারে অতিরিক্ত ১০%' : 'Extra 10% on family orders'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎋</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {language === 'bn' ? 'পহেলা বৈশাখ অফার' : 'Pohela Boishakh Offers'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'bn' ? 'ঐতিহ্যবাহী পণ্যে বিশেষ ছাড়' : 'Special discounts on traditional items'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}