import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  Gift, 
  Users, 
  Copy, 
  Share2, 
  Star, 
  Crown, 
  Award,
  TrendingUp,
  CheckCircle,
  Calendar,
  DollarSign,
  Facebook,
  Twitter,
  MessageSquare,
  Mail,
  Phone
} from 'lucide-react';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  currentTierLevel: number;
  nextTierRequirement: number;
  pointsToNextTier: number;
}

interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'registered' | 'first_purchase' | 'completed';
  inviteDate: Date;
  registrationDate?: Date;
  firstPurchaseDate?: Date;
  earnedAmount: number;
  avatar?: string;
}

interface Reward {
  id: string;
  type: 'signup' | 'first_purchase' | 'milestone' | 'tier_bonus';
  amount: number;
  description: string;
  earnedDate: Date;
  referralId?: string;
}

export const ReferralProgram: React.FC = () => {
  const [referralCode, setReferralCode] = useState('JOHN2025BD');
  const [referralLink, setReferralLink] = useState(`https://getit.com.bd/join/${referralCode}`);
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 12,
    successfulReferrals: 8,
    totalEarnings: 15500,
    currentTierLevel: 2,
    nextTierRequirement: 15,
    pointsToNextTier: 3
  });

  const [referrals, setReferrals] = useState<Referral[]>([
    {
      id: '1',
      name: 'Fatima Rahman',
      email: 'fatima.rahman@gmail.com',
      status: 'completed',
      inviteDate: new Date('2024-12-15'),
      registrationDate: new Date('2024-12-16'),
      firstPurchaseDate: new Date('2024-12-18'),
      earnedAmount: 1500,
      avatar: '/api/placeholder/40/40'
    },
    {
      id: '2',
      name: 'Mohammad Hassan',
      email: 'mohammad.hassan@yahoo.com',
      status: 'first_purchase',
      inviteDate: new Date('2024-12-20'),
      registrationDate: new Date('2024-12-21'),
      firstPurchaseDate: new Date('2024-12-25'),
      earnedAmount: 1000,
      avatar: '/api/placeholder/40/40'
    },
    {
      id: '3',
      name: 'Rashida Begum',
      email: 'rashida.b@hotmail.com',
      status: 'registered',
      inviteDate: new Date('2025-01-05'),
      registrationDate: new Date('2025-01-06'),
      earnedAmount: 500,
      avatar: '/api/placeholder/40/40'
    },
    {
      id: '4',
      name: 'Abdullah Khan',
      email: 'abdullah.khan@gmail.com',
      status: 'pending',
      inviteDate: new Date('2025-01-10'),
      earnedAmount: 0,
      avatar: '/api/placeholder/40/40'
    }
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      type: 'first_purchase',
      amount: 1500,
      description: 'Fatima Rahman made her first purchase',
      earnedDate: new Date('2024-12-18'),
      referralId: '1'
    },
    {
      id: '2',
      type: 'signup',
      amount: 500,
      description: 'Mohammad Hassan signed up',
      earnedDate: new Date('2024-12-21'),
      referralId: '2'
    },
    {
      id: '3',
      type: 'tier_bonus',
      amount: 2000,
      description: 'Silver tier achievement bonus',
      earnedDate: new Date('2024-12-25')
    }
  ]);

  const tiers = [
    { level: 1, name: 'Bronze', requirement: 0, color: 'text-amber-600', bgColor: 'bg-amber-50', benefits: ['₹500 per referral', 'Basic support'] },
    { level: 2, name: 'Silver', requirement: 5, color: 'text-gray-600', bgColor: 'bg-gray-50', benefits: ['₹750 per referral', 'Priority support', '₹2000 tier bonus'] },
    { level: 3, name: 'Gold', requirement: 15, color: 'text-yellow-600', bgColor: 'bg-yellow-50', benefits: ['₹1000 per referral', 'VIP support', '₹5000 tier bonus'] },
    { level: 4, name: 'Platinum', requirement: 30, color: 'text-purple-600', bgColor: 'bg-purple-50', benefits: ['₹1500 per referral', 'Dedicated manager', '₹10000 tier bonus'] }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = () => {
    if (!inviteEmail.trim()) return;
    
    // Simulate sending invite
    console.log(`Sending invite to: ${inviteEmail}`);
    setInviteEmail('');
    
    // Add new pending referral
    const newReferral: Referral = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      status: 'pending',
      inviteDate: new Date(),
      earnedAmount: 0
    };
    
    setReferrals(prev => [newReferral, ...prev]);
    setStats(prev => ({ ...prev, totalReferrals: prev.totalReferrals + 1 }));
  };

  const shareToSocialMedia = (platform: string) => {
    const message = `Join me on GetIt Bangladesh! Use my referral code ${referralCode} and we both get rewards! ${referralLink}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Join GetIt Bangladesh&body=${encodeURIComponent(message)}`, '_blank');
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Invited', color: 'bg-yellow-100 text-yellow-800' },
      registered: { label: 'Registered', color: 'bg-blue-100 text-blue-800' },
      first_purchase: { label: 'First Purchase', color: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Active User', color: 'bg-green-100 text-green-800' }
    };
    
    const { label, color } = config[status as keyof typeof config];
    return <Badge className={`${color} border-0 text-xs`}>{label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'first_purchase':
        return <Star className="h-4 w-4 text-purple-600" />;
      case 'registered':
        return <Users className="h-4 w-4 text-blue-600" />;
      default:
        return <Calendar className="h-4 w-4 text-yellow-600" />;
    }
  };

  const currentTier = tiers.find(tier => tier.level === stats.currentTierLevel);
  const nextTier = tiers.find(tier => tier.level === stats.currentTierLevel + 1);
  const progressToNextTier = nextTier ? ((stats.successfulReferrals / nextTier.requirement) * 100) : 100;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
          <p className="text-gray-600 mt-1">Invite friends and earn rewards together</p>
        </div>
        <div className="flex items-center space-x-2">
          {currentTier && (
            <Badge className={`${currentTier.color} ${currentTier.bgColor} border-0`}>
              <Crown className="h-3 w-3 mr-1" />
              {currentTier.name} Member
            </Badge>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
                <p className="text-sm text-gray-600">Total Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.successfulReferrals}</p>
                <p className="text-sm text-gray-600">Successful Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">৳{stats.totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{((stats.successfulReferrals / stats.totalReferrals) * 100).toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Progress */}
      {nextTier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Tier Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Progress to {nextTier.name}</p>
                  <p className="text-sm text-gray-600">
                    {stats.successfulReferrals} of {nextTier.requirement} successful referrals
                  </p>
                </div>
                <Badge className={`${nextTier.color} ${nextTier.bgColor} border-0`}>
                  {stats.pointsToNextTier} more needed
                </Badge>
              </div>
              <Progress value={progressToNextTier} className="h-2" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                {nextTier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Invite Friends</TabsTrigger>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
          <TabsTrigger value="rewards">Reward History</TabsTrigger>
          <TabsTrigger value="tiers">Tier Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Referral Code & Link */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Information</CardTitle>
              <CardDescription>Share your code or link to invite friends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Referral Code</label>
                <div className="flex space-x-2">
                  <Input value={referralCode} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(referralCode)}
                    className="whitespace-nowrap"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Referral Link</label>
                <div className="flex space-x-2">
                  <Input value={referralLink} readOnly className="text-sm" />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(referralLink)}
                    className="whitespace-nowrap"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invite via Email */}
          <Card>
            <CardHeader>
              <CardTitle>Invite via Email</CardTitle>
              <CardDescription>Send a personal invitation to your friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button onClick={sendInvite} disabled={!inviteEmail.trim()}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Share on Social Media</CardTitle>
              <CardDescription>Spread the word on your favorite platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareToSocialMedia('facebook')}
                  className="flex items-center space-x-2"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span>Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocialMedia('twitter')}
                  className="flex items-center space-x-2"
                >
                  <Twitter className="h-4 w-4 text-blue-500" />
                  <span>Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocialMedia('whatsapp')}
                  className="flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span>WhatsApp</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocialMedia('email')}
                  className="flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span>Email</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Referrals ({referrals.length})</CardTitle>
              <CardDescription>Track the status of your invited friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrals.map(referral => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={referral.avatar || '/api/placeholder/40/40'} 
                        alt={referral.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{referral.name}</h4>
                        <p className="text-sm text-gray-600">{referral.email}</p>
                        <p className="text-xs text-gray-500">
                          Invited: {referral.inviteDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-green-600">৳{referral.earnedAmount}</p>
                        <p className="text-xs text-gray-500">earned</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(referral.status)}
                        {getStatusBadge(referral.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reward History</CardTitle>
              <CardDescription>Your earning history from referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rewards.map(reward => (
                  <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Gift className="h-8 w-8 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{reward.description}</h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {reward.type.replace('_', ' ')} reward
                        </p>
                        <p className="text-xs text-gray-500">
                          {reward.earnedDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">+৳{reward.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiers.map(tier => (
              <Card key={tier.level} className={`${tier.level <= stats.currentTierLevel ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center space-x-2 ${tier.color}`}>
                    <Crown className="h-5 w-5" />
                    <span>{tier.name}</span>
                    {tier.level <= stats.currentTierLevel && (
                      <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {tier.requirement === 0 ? 'Starting tier' : `${tier.requirement} successful referrals required`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralProgram;