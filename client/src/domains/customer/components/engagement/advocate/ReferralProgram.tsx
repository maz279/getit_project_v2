/**
 * Phase 3: Advocate Stage - Referral Program
 * Amazon.com 5 A's Framework Implementation
 * Multi-Tier Referral System with Cultural Bonuses
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Progress } from '@/shared/ui/progress';
import { 
  Users, 
  Share2, 
  Gift, 
  Crown,
  TrendingUp,
  Award,
  Copy,
  MessageCircle,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Whatsapp,
  Star,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Heart,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferralProgramProps {
  userId?: string;
  className?: string;
}

interface ReferralData {
  user: UserProfile;
  referralStats: ReferralStats;
  tierInfo: TierInfo;
  referralHistory: ReferralEntry[];
  availableRewards: ReferralReward[];
  culturalBonuses: CulturalBonus[];
  shareOptions: ShareOption[];
  leaderboard: ReferralLeader[];
}

interface UserProfile {
  id: string;
  name: string;
  referralCode: string;
  joinDate: string;
  totalEarnings: number;
  currentTier: string;
  nextTier: string;
}

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  thisMonthReferrals: number;
  conversionRate: number;
  totalEarnings: number;
  lifetimeValue: number;
}

interface TierInfo {
  currentTier: string;
  nextTier: string;
  progress: number;
  currentReward: number;
  nextReward: number;
  requirementsToNext: number;
  benefits: string[];
  nextBenefits: string[];
}

interface ReferralEntry {
  id: string;
  friendName: string;
  friendEmail: string;
  status: 'pending' | 'registered' | 'purchased' | 'expired';
  inviteDate: string;
  registrationDate?: string;
  purchaseDate?: string;
  purchaseAmount?: number;
  reward: number;
  bonus?: number;
  cultural?: boolean;
}

interface ReferralReward {
  id: string;
  type: 'cashback' | 'discount' | 'points' | 'product';
  title: string;
  description: string;
  value: number;
  requirement: string;
  tier: string;
  popular: boolean;
  claimed: boolean;
}

interface CulturalBonus {
  id: string;
  event: string;
  eventEn: string;
  description: string;
  multiplier: number;
  validUntil: string;
  active: boolean;
  icon: string;
}

interface ShareOption {
  id: string;
  platform: string;
  icon: any;
  color: string;
  message: string;
  url: string;
  popular: boolean;
}

interface ReferralLeader {
  rank: number;
  name: string;
  avatar: string;
  referrals: number;
  earnings: number;
  tier: string;
  isCurrentUser?: boolean;
}

const ReferralProgram: React.FC<ReferralProgramProps> = ({
  userId,
  className,
}) => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'invite' | 'rewards' | 'history'>('overview');
  const [inviteEmails, setInviteEmails] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load referral program data
    const loadReferralData = () => {
      const mockData: ReferralData = {
        user: {
          id: userId || 'user1',
          name: 'Ahmed Rahman',
          referralCode: 'AHMED2025',
          joinDate: '2023-05-15',
          totalEarnings: 12500,
          currentTier: 'Gold Referrer',
          nextTier: 'Platinum Referrer'
        },
        referralStats: {
          totalReferrals: 23,
          successfulReferrals: 18,
          pendingReferrals: 5,
          thisMonthReferrals: 7,
          conversionRate: 78,
          totalEarnings: 12500,
          lifetimeValue: 145000
        },
        tierInfo: {
          currentTier: 'Gold Referrer',
          nextTier: 'Platinum Referrer',
          progress: 72,
          currentReward: 750,
          nextReward: 1000,
          requirementsToNext: 7,
          benefits: [
            '₹750 per successful referral',
            '15% bonus during festivals',
            'Priority customer support',
            'Exclusive referral badges'
          ],
          nextBenefits: [
            '₹1000 per successful referral',
            '25% bonus during festivals',
            'VIP customer support',
            'Platinum referrer badge',
            'Early access to new products'
          ]
        },
        referralHistory: [
          {
            id: 'ref1',
            friendName: 'Sarah Ahmed',
            friendEmail: 'sarah@example.com',
            status: 'purchased',
            inviteDate: '2024-12-01',
            registrationDate: '2024-12-02',
            purchaseDate: '2024-12-03',
            purchaseAmount: 15000,
            reward: 750,
            bonus: 112,
            cultural: true
          },
          {
            id: 'ref2',
            friendName: 'Mohammad Khan',
            friendEmail: 'mohammad@example.com',
            status: 'registered',
            inviteDate: '2024-12-05',
            registrationDate: '2024-12-06',
            reward: 200
          },
          {
            id: 'ref3',
            friendName: 'Fatima Hassan',
            friendEmail: 'fatima@example.com',
            status: 'pending',
            inviteDate: '2024-12-10',
            reward: 0
          },
          {
            id: 'ref4',
            friendName: 'Ali Rahman',
            friendEmail: 'ali@example.com',
            status: 'purchased',
            inviteDate: '2024-11-20',
            registrationDate: '2024-11-21',
            purchaseDate: '2024-11-25',
            purchaseAmount: 8500,
            reward: 750
          }
        ],
        availableRewards: [
          {
            id: 'tier-bonus',
            type: 'cashback',
            title: 'Tier Upgrade Bonus',
            description: 'Reach Platinum tier for exclusive rewards',
            value: 2500,
            requirement: '7 more successful referrals',
            tier: 'Platinum',
            popular: true,
            claimed: false
          },
          {
            id: 'festival-bonus',
            type: 'cashback',
            title: 'Festival Referral Bonus',
            description: 'Extra 25% bonus during Eid celebrations',
            value: 1000,
            requirement: 'Refer 3 friends during Eid',
            tier: 'Gold',
            popular: true,
            claimed: false
          },
          {
            id: 'milestone-10',
            type: 'product',
            title: 'Milestone Reward',
            description: 'Free premium product for 10 successful referrals',
            value: 5000,
            requirement: '10 successful referrals',
            tier: 'Silver',
            popular: false,
            claimed: true
          }
        ],
        culturalBonuses: [
          {
            id: 'eid-bonus',
            event: 'ঈদুল ফিতর',
            eventEn: 'Eid ul-Fitr',
            description: 'Extra 25% referral bonus during Eid celebrations',
            multiplier: 1.25,
            validUntil: '2025-03-31',
            active: true,
            icon: '🌙'
          },
          {
            id: 'pohela-boishakh',
            event: 'পহেলা বৈশাখ',
            eventEn: 'Pohela Boishakh',
            description: 'Bengali New Year special referral rewards',
            multiplier: 1.20,
            validUntil: '2025-04-14',
            active: false,
            icon: '🎊'
          },
          {
            id: 'independence-day',
            event: 'স্বাধীনতা দিবস',
            eventEn: 'Independence Day',
            description: 'Patriotic referral bonus for Independence Day',
            multiplier: 1.15,
            validUntil: '2025-03-26',
            active: false,
            icon: '🇧🇩'
          }
        ],
        shareOptions: [
          {
            id: 'whatsapp',
            platform: 'WhatsApp',
            icon: MessageCircle,
            color: 'bg-green-500',
            message: 'Hey! I found this amazing shopping platform GetIt. Use my code AHMED2025 and get ৳500 off your first order!',
            url: 'https://wa.me/?text=',
            popular: true
          },
          {
            id: 'facebook',
            platform: 'Facebook',
            icon: Facebook,
            color: 'bg-blue-600',
            message: 'Just discovered GetIt - amazing deals and fast delivery! Join using my referral code AHMED2025',
            url: 'https://facebook.com/sharer/sharer.php?u=',
            popular: true
          },
          {
            id: 'email',
            platform: 'Email',
            icon: Mail,
            color: 'bg-gray-600',
            message: 'I wanted to share GetIt with you - it\'s a great platform for online shopping in Bangladesh!',
            url: 'mailto:?subject=Join GetIt&body=',
            popular: false
          },
          {
            id: 'sms',
            platform: 'SMS',
            icon: Smartphone,
            color: 'bg-purple-600',
            message: 'Check out GetIt! Use code AHMED2025 for ৳500 off. Download: https://getit.com.bd',
            url: 'sms:?body=',
            popular: true
          }
        ],
        leaderboard: [
          {
            rank: 1,
            name: 'Rashida Begum',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c371?w=50',
            referrals: 47,
            earnings: 35250,
            tier: 'Diamond'
          },
          {
            rank: 2,
            name: 'Karim Hassan',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50',
            referrals: 39,
            earnings: 28500,
            tier: 'Platinum'
          },
          {
            rank: 3,
            name: 'Sultana Ahmed',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50',
            referrals: 34,
            earnings: 22100,
            tier: 'Platinum'
          },
          {
            rank: 8,
            name: 'Ahmed Rahman (You)',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
            referrals: 23,
            earnings: 12500,
            tier: 'Gold',
            isCurrentUser: true
          }
        ]
      };

      setTimeout(() => {
        setReferralData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadReferralData();
  }, [userId]);

  const handleCopyReferralCode = () => {
    if (referralData) {
      navigator.clipboard.writeText(referralData.user.referralCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShare = (option: ShareOption) => {
    const referralLink = `https://getit.com.bd/register?ref=${referralData?.user.referralCode}`;
    const message = encodeURIComponent(option.message + ' ' + referralLink);
    
    if (option.id === 'whatsapp') {
      window.open(`https://wa.me/?text=${message}`, '_blank');
    } else if (option.id === 'facebook') {
      window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
    } else if (option.id === 'email') {
      window.open(`mailto:?subject=Join GetIt&body=${message}`, '_blank');
    } else if (option.id === 'sms') {
      window.open(`sms:?body=${message}`, '_blank');
    }
  };

  const handleInviteByEmail = () => {
    if (!inviteEmails.trim()) {
      alert('Please enter at least one email address');
      return;
    }

    // Simulate sending invites
    setTimeout(() => {
      alert('Invitations sent successfully!');
      setInviteEmails('');
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'purchased': return 'bg-green-100 text-green-700';
      case 'registered': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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

  if (!referralData) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Referral Program Unavailable</h3>
            <p className="text-muted-foreground">
              Unable to load referral program information.
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
          <Users className="h-6 w-6 text-blue-500" />
          Refer Friends & Earn Rewards
        </h1>
        <p className="text-muted-foreground">
          Share GetIt with your friends and family and earn amazing rewards for every successful referral
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {referralData.referralStats.totalReferrals}
            </div>
            <div className="text-sm text-muted-foreground">Total Referrals</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {referralData.referralStats.successfulReferrals}
            </div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {referralData.referralStats.conversionRate}%
            </div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              ৳{referralData.referralStats.totalEarnings.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Cultural Bonuses Banner */}
      {referralData.culturalBonuses.some(bonus => bonus.active) && (
        <Card className="mb-8 bg-gradient-to-r from-green-50 via-red-50 to-yellow-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌙</div>
              <div className="flex-1">
                <h3 className="font-bold text-green-700">Special Cultural Bonus Active!</h3>
                {referralData.culturalBonuses
                  .filter(bonus => bonus.active)
                  .map((bonus) => (
                    <p key={bonus.id} className="text-sm text-green-600">
                      {bonus.eventEn}: {bonus.description} ({bonus.multiplier}x multiplier)
                    </p>
                  ))}
              </div>
              <Badge className="bg-green-500 text-white">
                <Zap className="h-3 w-3 mr-1" />
                Active Now
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {(['overview', 'invite', 'rewards', 'history'] as const).map((tab) => (
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
            {/* Referral Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Your Referral Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-blue-600 font-mono">
                      {referralData.user.referralCode}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Share this code with friends to earn ৳{referralData.tierInfo.currentReward} per successful referral
                    </p>
                  </div>
                  <Button
                    onClick={handleCopyReferralCode}
                    variant="outline"
                    className={copySuccess ? 'bg-green-50 border-green-200' : ''}
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Share */}
            <Card>
              <CardHeader>
                <CardTitle>Share with Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {referralData.shareOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleShare(option)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:scale-105',
                          option.popular ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white',
                          option.color
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">{option.platform}</span>
                        {option.popular && (
                          <Badge className="text-xs">Popular</Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referralData.referralHistory.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{entry.friendName}</h4>
                          <p className="text-xs text-muted-foreground">{entry.inviteDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status}
                        </Badge>
                        {entry.reward > 0 && (
                          <div className="text-sm font-bold text-primary mt-1">
                            +৳{entry.reward}
                            {entry.bonus && <span className="text-green-600"> (+৳{entry.bonus})</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Tier Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Referrer Tier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold">{referralData.tierInfo.currentTier}</div>
                  <div className="text-sm text-muted-foreground">
                    {referralData.tierInfo.requirementsToNext} more to {referralData.tierInfo.nextTier}
                  </div>
                </div>
                <Progress value={referralData.tierInfo.progress} className="mb-4" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Current Benefits:</h4>
                  {referralData.tierInfo.benefits.slice(0, 3).map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Referrers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referralData.leaderboard.slice(0, 5).map((leader) => (
                    <div key={leader.rank} className={cn(
                      'flex items-center gap-3',
                      leader.isCurrentUser && 'p-2 bg-blue-50 rounded-lg'
                    )}>
                      <div className="text-sm font-bold w-6">#{leader.rank}</div>
                      <img
                        src={leader.avatar}
                        alt={leader.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{leader.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {leader.referrals} referrals • ৳{leader.earnings.toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {leader.tier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'invite' && (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Invite Friends</h2>
            <p className="text-muted-foreground">
              Send personalized invitations to your friends and family
            </p>
          </div>

          {/* Email Invites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invite by Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Addresses</label>
                <textarea
                  placeholder="Enter email addresses separated by commas"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  className="w-full p-3 border rounded-lg min-h-24"
                />
              </div>
              <Button onClick={handleInviteByEmail} className="w-full">
                Send Invitations
              </Button>
            </CardContent>
          </Card>

          {/* Social Share */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share on Social Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {referralData.shareOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleShare(option)}
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-white',
                        option.color
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{option.platform}</div>
                        <div className="text-sm text-muted-foreground">
                          {option.message.substring(0, 50)}...
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Referral Link */}
          <Card>
            <CardHeader>
              <CardTitle>Direct Referral Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={`https://getit.com.bd/register?ref=${referralData.user.referralCode}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyReferralCode} variant="outline">
                  {copySuccess ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Available Rewards</h2>
            <p className="text-muted-foreground">
              Unlock exclusive rewards based on your referral achievements
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {referralData.availableRewards.map((reward) => (
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
                <CardContent className="p-4 pt-6">
                  <div className="text-center mb-4">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2',
                      reward.type === 'cashback' && 'bg-green-100',
                      reward.type === 'discount' && 'bg-blue-100',
                      reward.type === 'points' && 'bg-purple-100',
                      reward.type === 'product' && 'bg-orange-100'
                    )}>
                      {reward.type === 'cashback' && <Gift className="h-6 w-6 text-green-600" />}
                      {reward.type === 'discount' && <Target className="h-6 w-6 text-blue-600" />}
                      {reward.type === 'points' && <Star className="h-6 w-6 text-purple-600" />}
                      {reward.type === 'product' && <Award className="h-6 w-6 text-orange-600" />}
                    </div>
                    <h3 className="font-semibold">{reward.title}</h3>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-primary">
                      {reward.type === 'cashback' ? '৳' : ''}
                      {reward.value.toLocaleString()}
                      {reward.type === 'discount' ? '% OFF' : 
                       reward.type === 'points' ? ' pts' : ''}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {reward.tier} Tier
                    </Badge>
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground mb-4">
                    {reward.requirement}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={reward.claimed}
                    variant={reward.claimed ? 'secondary' : 'default'}
                  >
                    {reward.claimed ? 'Claimed' : 'Claim Reward'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cultural Bonuses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Cultural Festival Bonuses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {referralData.culturalBonuses.map((bonus) => (
                  <div key={bonus.id} className={cn(
                    'p-4 rounded-lg border',
                    bonus.active ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{bonus.icon}</span>
                      <div>
                        <h4 className="font-semibold text-sm">{bonus.eventEn}</h4>
                        <p className="text-xs text-muted-foreground">{bonus.event}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{bonus.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={cn(
                        bonus.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      )}>
                        {bonus.multiplier}x Bonus
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Until {bonus.validUntil}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Referral History</h2>
            <div className="text-sm text-muted-foreground">
              Total earned: ৳{referralData.referralStats.totalEarnings.toLocaleString()}
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {referralData.referralHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{entry.friendName}</h4>
                        <p className="text-sm text-muted-foreground">{entry.friendEmail}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                          {entry.cultural && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              Cultural Bonus
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Invited: {entry.inviteDate}
                      </div>
                      {entry.registrationDate && (
                        <div className="text-sm text-muted-foreground">
                          Registered: {entry.registrationDate}
                        </div>
                      )}
                      {entry.purchaseDate && (
                        <div className="text-sm text-muted-foreground">
                          First Purchase: {entry.purchaseDate}
                        </div>
                      )}
                      <div className="text-lg font-bold text-primary">
                        ৳{entry.reward}
                        {entry.bonus && <span className="text-green-600"> (+৳{entry.bonus})</span>}
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

export default ReferralProgram;