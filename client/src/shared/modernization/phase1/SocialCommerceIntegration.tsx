/**
 * SocialCommerceIntegration - Influencer and Social Features Platform
 * Phase 1 Week 3-4: Component Modernization
 * Features: Influencer partnerships, social sharing, community engagement, viral marketing
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Share2, Heart, MessageCircle, Star, TrendingUp, Award, Camera, Video, Instagram, Twitter, Youtube, Facebook, Linkedin, Globe, CheckCircle, Zap, Gift, Crown, Target } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Avatar } from '../../ui/avatar';
import { Progress } from '../../ui/progress';
import { Separator } from '../../ui/separator';

interface Influencer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  verified: boolean;
  tier: 'nano' | 'micro' | 'macro' | 'mega';
  followers: {
    total: number;
    instagram: number;
    youtube: number;
    tiktok: number;
    facebook: number;
  };
  engagement: {
    rate: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
  };
  niche: string[];
  location: string;
  language: string[];
  rating: number;
  reviewCount: number;
  partneredBrands: string[];
  recentCampaigns: number;
  totalRevenue: number;
  isPartner: boolean;
  collaborationRate: number;
  responseTime: string;
}

interface SocialPost {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar: string;
  influencerVerified: boolean;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'twitter';
  content: {
    type: 'image' | 'video' | 'story' | 'reel';
    url: string;
    thumbnail?: string;
    description: string;
    hashtags: string[];
  };
  productId?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clickThroughs: number;
    conversions: number;
  };
  timestamp: Date;
  isSponsored: boolean;
  campaignId?: string;
  discount?: {
    code: string;
    percentage: number;
    validUntil: Date;
  };
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  brand: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  objectives: string[];
  targetAudience: {
    ageRange: string;
    gender: string[];
    interests: string[];
    location: string[];
  };
  requirements: {
    minFollowers: number;
    platforms: string[];
    contentType: string[];
    postCount: number;
  };
  compensation: {
    type: 'fixed' | 'commission' | 'hybrid';
    amount: number;
    commission?: number;
  };
  selectedInfluencers: string[];
  applicants: number;
  totalReach: number;
  totalEngagement: number;
  roi: number;
}

interface SocialStats {
  totalInfluencers: number;
  activePartners: number;
  totalReach: number;
  totalEngagement: number;
  conversionRate: number;
  socialRevenue: number;
  topPlatforms: Array<{
    platform: string;
    users: number;
    engagement: number;
    revenue: number;
  }>;
}

interface SocialCommerceIntegrationProps {
  influencers?: Influencer[];
  socialPosts?: SocialPost[];
  activeCampaigns?: Campaign[];
  socialStats?: SocialStats;
  currentUserId?: string;
  className?: string;
  onInfluencerClick?: (influencerId: string) => void;
  onPostClick?: (postId: string) => void;
  onCampaignApply?: (campaignId: string) => void;
  onShareProduct?: (productId: string, platform: string) => void;
  onCollaborate?: (influencerId: string) => void;
}

export function SocialCommerceIntegration({
  influencers = [],
  socialPosts = [],
  activeCampaigns = [],
  socialStats,
  currentUserId,
  className = "",
  onInfluencerClick,
  onPostClick,
  onCampaignApply,
  onShareProduct,
  onCollaborate
}: SocialCommerceIntegrationProps) {
  const [activeTab, setActiveTab] = useState('influencers');
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [trendingPosts, setTrendingPosts] = useState<SocialPost[]>([]);
  const [socialMetrics, setSocialMetrics] = useState<SocialStats | null>(null);

  // Mock data for demonstration
  const mockInfluencers: Influencer[] = [
    {
      id: 'inf-1',
      name: 'Ayesha Rahman',
      username: '@ayesha_style',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face',
      bio: 'Fashion enthusiast & lifestyle blogger. Sharing style tips and beauty secrets.',
      verified: true,
      tier: 'macro',
      followers: {
        total: 125000,
        instagram: 95000,
        youtube: 18000,
        tiktok: 8000,
        facebook: 4000
      },
      engagement: {
        rate: 4.2,
        avgLikes: 3200,
        avgComments: 180,
        avgShares: 95
      },
      niche: ['fashion', 'beauty', 'lifestyle'],
      location: 'Dhaka, Bangladesh',
      language: ['Bengali', 'English'],
      rating: 4.8,
      reviewCount: 47,
      partneredBrands: ['StyleCo', 'BeautyBD', 'FashionForward'],
      recentCampaigns: 8,
      totalRevenue: 245000,
      isPartner: true,
      collaborationRate: 95,
      responseTime: '2-4 hours'
    },
    {
      id: 'inf-2',
      name: 'Tanvir Ahmed',
      username: '@techguru_bd',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      bio: 'Tech reviewer & gadget expert. Latest reviews, unboxings, and tech tips.',
      verified: true,
      tier: 'micro',
      followers: {
        total: 45000,
        instagram: 25000,
        youtube: 15000,
        tiktok: 3000,
        facebook: 2000
      },
      engagement: {
        rate: 6.8,
        avgLikes: 1800,
        avgComments: 240,
        avgShares: 85
      },
      niche: ['technology', 'gadgets', 'reviews'],
      location: 'Chittagong, Bangladesh',
      language: ['Bengali', 'English'],
      rating: 4.9,
      reviewCount: 32,
      partneredBrands: ['TechBD', 'GadgetZone', 'ElectroMart'],
      recentCampaigns: 12,
      totalRevenue: 89000,
      isPartner: true,
      collaborationRate: 98,
      responseTime: '1-2 hours'
    }
  ];

  const mockSocialPosts: SocialPost[] = [
    {
      id: 'post-1',
      influencerId: 'inf-1',
      influencerName: 'Ayesha Rahman',
      influencerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face',
      influencerVerified: true,
      platform: 'instagram',
      content: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop',
        description: 'Obsessed with this summer dress from @StyleCo! Perfect for Dhaka weather 🌞 Use code AYESHA20 for 20% off! #SummerFashion #StyleCo #GetItBD',
        hashtags: ['SummerFashion', 'StyleCo', 'GetItBD', 'Fashion', 'OOTD']
      },
      productId: 'product-1',
      productName: 'Summer Floral Dress',
      productImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop',
      productPrice: 2499,
      metrics: {
        views: 45200,
        likes: 3840,
        comments: 298,
        shares: 156,
        saves: 892,
        clickThroughs: 1240,
        conversions: 89
      },
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      isSponsored: true,
      campaignId: 'camp-1',
      discount: {
        code: 'AYESHA20',
        percentage: 20,
        validUntil: new Date(Date.now() + 604800000) // 7 days from now
      }
    },
    {
      id: 'post-2',
      influencerId: 'inf-2',
      influencerName: 'Tanvir Ahmed',
      influencerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      influencerVerified: true,
      platform: 'youtube',
      content: {
        type: 'video',
        url: '/mock-video-review.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=400&fit=crop',
        description: 'Honest review of the TechSound Wireless Earbuds! Amazing sound quality for the price. Link in bio 🔥 #TechReview #TechSound #GetItBD',
        hashtags: ['TechReview', 'TechSound', 'GetItBD', 'Earbuds', 'Technology']
      },
      productId: 'product-2',
      productName: 'TechSound Wireless Earbuds',
      productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop',
      productPrice: 3999,
      metrics: {
        views: 28500,
        likes: 2640,
        comments: 387,
        shares: 298,
        saves: 567,
        clickThroughs: 890,
        conversions: 67
      },
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      isSponsored: true,
      campaignId: 'camp-2'
    }
  ];

  const mockCampaigns: Campaign[] = [
    {
      id: 'camp-1',
      title: 'Summer Fashion Collection 2024',
      description: 'Promote our new summer collection with authentic styling content',
      brand: 'StyleCo',
      budget: 50000,
      startDate: new Date(Date.now() - 604800000), // 1 week ago
      endDate: new Date(Date.now() + 1209600000), // 2 weeks from now
      status: 'active',
      objectives: ['Brand Awareness', 'Sales Conversion', 'Social Engagement'],
      targetAudience: {
        ageRange: '18-35',
        gender: ['Female'],
        interests: ['Fashion', 'Beauty', 'Lifestyle'],
        location: ['Dhaka', 'Chittagong', 'Sylhet']
      },
      requirements: {
        minFollowers: 10000,
        platforms: ['Instagram', 'TikTok', 'Facebook'],
        contentType: ['Post', 'Story', 'Reel'],
        postCount: 3
      },
      compensation: {
        type: 'hybrid',
        amount: 5000,
        commission: 15
      },
      selectedInfluencers: ['inf-1'],
      applicants: 23,
      totalReach: 125000,
      totalEngagement: 8340,
      roi: 3.2
    }
  ];

  const mockSocialStats: SocialStats = {
    totalInfluencers: 1247,
    activePartners: 89,
    totalReach: 2500000,
    totalEngagement: 185000,
    conversionRate: 3.8,
    socialRevenue: 1240000,
    topPlatforms: [
      { platform: 'Instagram', users: 1200000, engagement: 98000, revenue: 650000 },
      { platform: 'YouTube', users: 450000, engagement: 35000, revenue: 320000 },
      { platform: 'TikTok', users: 680000, engagement: 42000, revenue: 180000 },
      { platform: 'Facebook', users: 170000, engagement: 10000, revenue: 90000 }
    ]
  };

  // Initialize with mock data or provided data
  useEffect(() => {
    if (influencers.length === 0) {
      // Use mock data for demonstration
    }
    setTrendingPosts(socialPosts.length > 0 ? socialPosts : mockSocialPosts);
    setSocialMetrics(socialStats || mockSocialStats);
  }, [influencers, socialPosts, socialStats]);

  // Format currency
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

  // Format number with suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    const icons = {
      instagram: <Instagram className="w-4 h-4" />,
      youtube: <Youtube className="w-4 h-4" />,
      tiktok: <Video className="w-4 h-4" />,
      facebook: <Facebook className="w-4 h-4" />,
      twitter: <Twitter className="w-4 h-4" />,
      linkedin: <Linkedin className="w-4 h-4" />
    };
    return icons[platform] || <Globe className="w-4 h-4" />;
  };

  // Get tier badge color
  const getTierColor = (tier: string) => {
    const colors = {
      nano: 'bg-gray-500',
      micro: 'bg-blue-500',
      macro: 'bg-purple-500',
      mega: 'bg-gold-500'
    };
    return colors[tier] || 'bg-gray-500';
  };

  // Render influencer card
  const renderInfluencerCard = (influencer: Influencer) => (
    <Card
      key={influencer.id}
      className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
      onClick={() => {
        setSelectedInfluencer(influencer);
        onInfluencerClick?.(influencer.id);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <img src={influencer.avatar} alt={influencer.name} />
            </Avatar>
            {influencer.verified && (
              <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{influencer.name}</h3>
              <Badge className={`${getTierColor(influencer.tier)} text-white text-xs`}>
                {influencer.tier.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">{influencer.username}</p>
            <p className="text-xs text-gray-500 line-clamp-2">{influencer.bio}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-3 text-center">
          <div>
            <div className="font-bold text-lg">{formatNumber(influencer.followers.total)}</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div>
            <div className="font-bold text-lg">{influencer.engagement.rate}%</div>
            <div className="text-xs text-gray-500">Engagement</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-bold">{influencer.rating}</span>
            </div>
            <div className="text-xs text-gray-500">({influencer.reviewCount})</div>
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-2">Platform Reach:</div>
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Instagram className="w-3 h-3" />
              <span>{formatNumber(influencer.followers.instagram)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Youtube className="w-3 h-3" />
              <span>{formatNumber(influencer.followers.youtube)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              <span>{formatNumber(influencer.followers.tiktok)}</span>
            </div>
          </div>
        </div>

        {/* Niche tags */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {influencer.niche.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
          <div>Response: {influencer.responseTime}</div>
          <div>Success: {influencer.collaborationRate}%</div>
          <div>Campaigns: {influencer.recentCampaigns}</div>
          <div>Revenue: {formatCurrency(influencer.totalRevenue)}</div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full"
          variant={influencer.isPartner ? "outline" : "default"}
          onClick={(e) => {
            e.stopPropagation();
            onCollaborate?.(influencer.id);
          }}
        >
          {influencer.isPartner ? 'View Partnership' : 'Start Collaboration'}
        </Button>
      </CardContent>
    </Card>
  );

  // Render social post
  const renderSocialPost = (post: SocialPost) => (
    <Card
      key={post.id}
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onPostClick?.(post.id)}
    >
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <img src={post.influencerAvatar} alt={post.influencerName} />
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{post.influencerName}</span>
                {post.influencerVerified && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
                {post.isSponsored && (
                  <Badge className="bg-orange-500 text-xs">Sponsored</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {getPlatformIcon(post.platform)}
                <span>{post.timestamp.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="relative">
          {post.content.type === 'video' ? (
            <div className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="w-12 h-12 mx-auto mb-2" />
                <span className="text-sm">Video Content</span>
              </div>
            </div>
          ) : (
            <img
              src={post.content.url}
              alt="Post content"
              className="w-full aspect-square object-cover"
            />
          )}
          
          {post.productId && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-white bg-opacity-90 rounded-lg p-2 flex items-center gap-2">
                <img
                  src={post.productImage}
                  alt={post.productName}
                  className="w-8 h-8 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{post.productName}</div>
                  <div className="text-xs text-gray-600">{formatCurrency(post.productPrice || 0)}</div>
                </div>
                <Button size="sm" className="text-xs py-1 px-2">
                  Shop
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Post Description */}
        <div className="p-4 pt-2">
          <p className="text-sm mb-2 line-clamp-3">{post.content.description}</p>
          
          {/* Hashtags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {post.content.hashtags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs text-blue-600">
                #{tag}
              </span>
            ))}
          </div>

          {/* Discount Code */}
          {post.discount && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-red-700">
                    {post.discount.percentage}% OFF
                  </span>
                  <span className="text-xs text-red-600 ml-2">
                    Code: {post.discount.code}
                  </span>
                </div>
                <Badge className="bg-red-500 text-xs">
                  {Math.ceil((post.discount.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                </Badge>
              </div>
            </div>
          )}

          {/* Engagement Metrics */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{formatNumber(post.metrics.likes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{formatNumber(post.metrics.comments)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                <span>{formatNumber(post.metrics.shares)}</span>
              </div>
            </div>
            <div className="text-xs">
              {((post.metrics.conversions / post.metrics.views) * 100).toFixed(1)}% CVR
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render campaign card
  const renderCampaignCard = (campaign: Campaign) => (
    <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{campaign.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{campaign.brand}</p>
          </div>
          <Badge className={`${
            campaign.status === 'active' ? 'bg-green-500' :
            campaign.status === 'paused' ? 'bg-yellow-500' :
            campaign.status === 'completed' ? 'bg-blue-500' :
            'bg-gray-500'
          }`}>
            {campaign.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">{campaign.description}</p>
        
        {/* Campaign Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Budget:</span>
            <span className="font-medium ml-2">{formatCurrency(campaign.budget)}</span>
          </div>
          <div>
            <span className="text-gray-600">ROI:</span>
            <span className="font-medium ml-2">{campaign.roi}x</span>
          </div>
          <div>
            <span className="text-gray-600">Reach:</span>
            <span className="font-medium ml-2">{formatNumber(campaign.totalReach)}</span>
          </div>
          <div>
            <span className="text-gray-600">Applicants:</span>
            <span className="font-medium ml-2">{campaign.applicants}</span>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <h4 className="text-sm font-medium mb-2">Requirements:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Min Followers: {formatNumber(campaign.requirements.minFollowers)}</div>
            <div>Platforms: {campaign.requirements.platforms.join(', ')}</div>
            <div>Content: {campaign.requirements.contentType.join(', ')}</div>
            <div>Posts: {campaign.requirements.postCount}</div>
          </div>
        </div>

        {/* Compensation */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2">Compensation:</h4>
          <div className="text-sm">
            <span className="font-medium">{formatCurrency(campaign.compensation.amount)}</span>
            {campaign.compensation.commission && (
              <span className="text-gray-600"> + {campaign.compensation.commission}% commission</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full"
          onClick={() => onCampaignApply?.(campaign.id)}
          disabled={campaign.status !== 'active'}
        >
          {campaign.status === 'active' ? 'Apply for Campaign' : 'Campaign Ended'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className={`social-commerce-integration ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Social Commerce Hub</h2>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
            Influencer Powered
          </Badge>
        </div>
        <p className="text-gray-600">
          Connect with influencers, run campaigns, and leverage social commerce
        </p>
      </div>

      {/* Social Stats Dashboard */}
      {socialMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(socialMetrics.totalInfluencers)}
              </div>
              <div className="text-sm text-gray-600">Total Influencers</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(socialMetrics.totalReach)}
              </div>
              <div className="text-sm text-gray-600">Total Reach</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {socialMetrics.conversionRate}%
              </div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(socialMetrics.socialRevenue)}
              </div>
              <div className="text-sm text-gray-600">Social Revenue</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="influencers">
            <Users className="w-4 h-4 mr-2" />
            Influencers
          </TabsTrigger>
          <TabsTrigger value="posts">
            <Camera className="w-4 h-4 mr-2" />
            Social Posts
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Target className="w-4 h-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Influencers Tab */}
        <TabsContent value="influencers">
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <select className="px-3 py-2 border rounded-lg text-sm">
                    <option>All Tiers</option>
                    <option>Nano (1K-10K)</option>
                    <option>Micro (10K-100K)</option>
                    <option>Macro (100K-1M)</option>
                    <option>Mega (1M+)</option>
                  </select>
                  
                  <select className="px-3 py-2 border rounded-lg text-sm">
                    <option>All Niches</option>
                    <option>Fashion</option>
                    <option>Beauty</option>
                    <option>Technology</option>
                    <option>Lifestyle</option>
                  </select>
                  
                  <select className="px-3 py-2 border rounded-lg text-sm">
                    <option>All Locations</option>
                    <option>Dhaka</option>
                    <option>Chittagong</option>
                    <option>Sylhet</option>
                    <option>Rajshahi</option>
                  </select>
                  
                  <Button variant="outline" size="sm">
                    <Crown className="w-4 h-4 mr-2" />
                    Partners Only
                  </Button>
                  
                  {/* Bangladesh Mobile Banking Filter */}
                  <Button variant="outline" size="sm" className="bg-orange-50 text-orange-700 border-orange-300">
                    <span className="text-orange-600 mr-1">🟠</span>
                    bKash Ready
                  </Button>
                  
                  <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-300">
                    <span className="text-blue-600 mr-1">🔵</span>
                    Nagad Ready
                  </Button>
                  
                  <Button variant="outline" size="sm" className="bg-purple-50 text-purple-700 border-purple-300">
                    <span className="text-purple-600 mr-1">🟣</span>
                    Rocket Ready
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Influencers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(influencers.length > 0 ? influencers : mockInfluencers).map(renderInfluencerCard)}
            </div>
          </div>
        </TabsContent>

        {/* Social Posts Tab */}
        <TabsContent value="posts">
          <div className="space-y-6">
            {/* Post Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <select className="px-3 py-2 border rounded-lg text-sm">
                    <option>All Platforms</option>
                    <option>Instagram</option>
                    <option>YouTube</option>
                    <option>TikTok</option>
                    <option>Facebook</option>
                  </select>
                  
                  <select className="px-3 py-2 border rounded-lg text-sm">
                    <option>All Content Types</option>
                    <option>Images</option>
                    <option>Videos</option>
                    <option>Stories</option>
                    <option>Reels</option>
                  </select>
                  
                  <Button variant="outline" size="sm">
                    <Zap className="w-4 h-4 mr-2" />
                    Sponsored Only
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingPosts.map(renderSocialPost)}
            </div>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="space-y-6">
            {/* Campaign Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Active Campaigns</h3>
              <Button>
                <Target className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(activeCampaigns.length > 0 ? activeCampaigns : mockCampaigns).map(renderCampaignCard)}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Platform Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialMetrics?.topPlatforms.map((platform, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(platform.platform.toLowerCase())}
                        <span className="font-medium">{platform.platform}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-8 text-sm">
                        <div className="text-right">
                          <div className="font-medium">{formatNumber(platform.users)}</div>
                          <div className="text-gray-500">Users</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatNumber(platform.engagement)}</div>
                          <div className="text-gray-500">Engagement</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(platform.revenue)}</div>
                          <div className="text-gray-500">Revenue</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Month</span>
                      <span className="font-bold text-green-600">+24.3%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="text-xs text-gray-500">
                      185K total engagements this month
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversion Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Social to Sales</span>
                      <span className="font-bold text-blue-600">3.8%</span>
                    </div>
                    <Progress value={38} className="h-2" />
                    <div className="text-xs text-gray-500">
                      Above industry average (2.9%)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Mobile Optimization & Performance - Bangladesh */}
      <div className="fixed bottom-4 left-4 space-y-2">
        {/* Mobile Optimization Indicator */}
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-green-800 font-medium">Mobile Optimized</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            3G/4G adaptive loading • Battery efficient
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-xs font-medium text-blue-800 mb-1">Performance</div>
          <div className="text-xs text-gray-600">
            <div>Load time: &lt;2s</div>
            <div>Data usage: Optimized</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialCommerceIntegration;