import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { 
  Heart, 
  Share2, 
  MessageCircle, 
  Users, 
  TrendingUp, 
  ShoppingCart, 
  Star,
  Instagram,
  Facebook,
  Twitter,
  UserCheck,
  Gift,
  Zap,
  Eye,
  ThumbsUp,
  Bookmark
} from 'lucide-react';

interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok';
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    followerCount: number;
  };
  content: {
    text: string;
    images: string[];
    video?: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
  products: SocialProduct[];
  tags: string[];
  timestamp: string;
  isSponsored: boolean;
  influencerTier: 'nano' | 'micro' | 'macro' | 'mega';
}

interface SocialProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: number;
  rating: number;
  vendor: string;
  socialProof: {
    mentionCount: number;
    purchaseCount: number;
    shareCount: number;
  };
}

interface InfluencerRecommendation {
  id: string;
  name: string;
  avatar: string;
  platform: string;
  followerCount: number;
  category: string;
  engagementRate: number;
  products: SocialProduct[];
  recentPosts: number;
  verified: boolean;
}

interface SocialCommerceIntegrationProps {
  className?: string;
  category?: string;
  showInfluencers?: boolean;
}

export const SocialCommerceIntegration: React.FC<SocialCommerceIntegrationProps> = ({ 
  className = "",
  category = 'all',
  showInfluencers = true 
}) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'influencers' | 'social-proof'>('trending');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState(category);

  // Fetch social commerce data
  const { data: socialData, isLoading, error } = useQuery({
    queryKey: ['/api/v1/social-commerce/trending', activeTab, selectedPlatform, filterCategory],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  // Mock social posts data
  const mockSocialPosts: SocialPost[] = [
    {
      id: '1',
      platform: 'instagram',
      author: {
        name: 'Fatima Rahman',
        username: '@fatima_style_bd',
        avatar: '/api/placeholder/100/100',
        verified: true,
        followerCount: 125000
      },
      content: {
        text: 'Just got this amazing Eid collection! 😍 Perfect for the upcoming festivities. Link in bio for special discount! #EidFashion #BangladeshStyle',
        images: ['/api/placeholder/400/400', '/api/placeholder/400/400']
      },
      engagement: {
        likes: 2847,
        comments: 234,
        shares: 156,
        views: 15420
      },
      products: [
        {
          id: 'sp1',
          name: 'Designer Eid Punjabi',
          price: 2800,
          originalPrice: 4000,
          image: '/api/placeholder/200/200',
          discount: 30,
          rating: 4.7,
          vendor: 'Fashion House BD',
          socialProof: {
            mentionCount: 45,
            purchaseCount: 23,
            shareCount: 67
          }
        }
      ],
      tags: ['eid', 'fashion', 'bangladesh', 'traditional'],
      timestamp: '2025-01-12T14:30:00Z',
      isSponsored: true,
      influencerTier: 'macro'
    },
    {
      id: '2',
      platform: 'facebook',
      author: {
        name: 'Tech Reviewer BD',
        username: '@techreviewerbd',
        avatar: '/api/placeholder/100/100',
        verified: true,
        followerCount: 89000
      },
      content: {
        text: 'Unboxing the latest Samsung Galaxy! Incredible camera quality and performance. Check out my full review and get exclusive discount code in comments! 📱✨',
        images: ['/api/placeholder/400/400'],
        video: '/api/placeholder/video'
      },
      engagement: {
        likes: 1564,
        comments: 89,
        shares: 234,
        views: 8920
      },
      products: [
        {
          id: 'sp2',
          name: 'Samsung Galaxy A54 5G',
          price: 42000,
          originalPrice: 45000,
          image: '/api/placeholder/200/200',
          discount: 7,
          rating: 4.6,
          vendor: 'Samsung Store BD',
          socialProof: {
            mentionCount: 234,
            purchaseCount: 89,
            shareCount: 156
          }
        }
      ],
      tags: ['tech', 'samsung', 'smartphone', 'review'],
      timestamp: '2025-01-12T12:15:00Z',
      isSponsored: false,
      influencerTier: 'micro'
    },
    {
      id: '3',
      platform: 'instagram',
      author: {
        name: 'Beauty Guru BD',
        username: '@beautyguru_bd',
        avatar: '/api/placeholder/100/100',
        verified: false,
        followerCount: 45000
      },
      content: {
        text: 'My skincare routine using these amazing local products! 🌟 Swipe to see the transformation. Use code GLOW20 for discount!',
        images: ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400']
      },
      engagement: {
        likes: 892,
        comments: 156,
        shares: 67,
        views: 4567
      },
      products: [
        {
          id: 'sp3',
          name: 'Natural Glow Skincare Set',
          price: 1800,
          originalPrice: 2500,
          image: '/api/placeholder/200/200',
          discount: 28,
          rating: 4.5,
          vendor: 'Beauty Bangladesh',
          socialProof: {
            mentionCount: 78,
            purchaseCount: 34,
            shareCount: 45
          }
        }
      ],
      tags: ['beauty', 'skincare', 'natural', 'bangladesh'],
      timestamp: '2025-01-12T16:45:00Z',
      isSponsored: true,
      influencerTier: 'micro'
    }
  ];

  // Mock influencer recommendations
  const mockInfluencers: InfluencerRecommendation[] = [
    {
      id: '1',
      name: 'Fatima Rahman',
      avatar: '/api/placeholder/100/100',
      platform: 'Instagram',
      followerCount: 125000,
      category: 'Fashion',
      engagementRate: 4.2,
      verified: true,
      recentPosts: 12,
      products: [
        {
          id: 'ip1',
          name: 'Eid Special Collection',
          price: 2800,
          image: '/api/placeholder/150/150',
          rating: 4.7,
          vendor: 'Fashion House',
          socialProof: { mentionCount: 45, purchaseCount: 23, shareCount: 67 }
        }
      ]
    },
    {
      id: '2',
      name: 'Tech Reviewer BD',
      avatar: '/api/placeholder/100/100',
      platform: 'YouTube',
      followerCount: 89000,
      category: 'Electronics',
      engagementRate: 5.8,
      verified: true,
      recentPosts: 8,
      products: [
        {
          id: 'ip2',
          name: 'Samsung Galaxy A54',
          price: 42000,
          image: '/api/placeholder/150/150',
          rating: 4.6,
          vendor: 'Samsung Store',
          socialProof: { mentionCount: 234, purchaseCount: 89, shareCount: 156 }
        }
      ]
    }
  ];

  const socialPosts = socialData?.posts || mockSocialPosts;
  const influencers = socialData?.influencers || mockInfluencers;

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: '🌐' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'facebook', name: 'Facebook', icon: '👥' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now.getTime() - past.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      return 'Just now';
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${Math.floor(hours / 24)}d ago`;
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-64 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                সোশ্যাল কমার্স
              </h2>
              <p className="text-gray-600">Discover products through social media and influencers</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
            { key: 'influencers', label: 'Influencers', icon: <UserCheck className="h-4 w-4" /> },
            { key: 'social-proof', label: 'Social Proof', icon: <Star className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Filter */}
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPlatform === platform.id
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{platform.icon}</span>
            {platform.name}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'trending' && (
        <div className="space-y-6">
          {/* Social Commerce Analytics */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">💫</div>
                <div className="font-semibold">Viral Products</div>
                <div className="text-gray-600">24 this week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600 mb-1">👥</div>
                <div className="font-semibold">Social Influence</div>
                <div className="text-gray-600">2.1M reach</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">💰</div>
                <div className="font-semibold">Social Sales</div>
                <div className="text-gray-600">₹45K today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">📈</div>
                <div className="font-semibold">Engagement</div>
                <div className="text-gray-600">+47% growth</div>
              </div>
            </div>
          </div>

          {/* Trending Social Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  {/* Post Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{post.author.name}</span>
                          {post.author.verified && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>@{post.author.username}</span>
                          <span>•</span>
                          <span>{formatCount(post.author.followerCount)} followers</span>
                          <span>•</span>
                          <span>{getTimeAgo(post.timestamp)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        {post.isSponsored && (
                          <Badge variant="outline" className="text-xs">
                            Sponsored
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-gray-900">{post.content.text}</p>
                    
                    {/* Post Images */}
                    {post.content.images.length > 0 && (
                      <div className={`grid gap-2 ${
                        post.content.images.length === 1 ? 'grid-cols-1' :
                        post.content.images.length === 2 ? 'grid-cols-2' :
                        'grid-cols-2'
                      }`}>
                        {post.content.images.slice(0, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Post image ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {formatCount(post.engagement.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {formatCount(post.engagement.comments)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          {formatCount(post.engagement.shares)}
                        </span>
                      </div>
                      {post.engagement.views && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {formatCount(post.engagement.views)}
                        </span>
                      )}
                    </div>

                    {/* Featured Products */}
                    {post.products.length > 0 && (
                      <div className="space-y-3 pt-3 border-t">
                        <div className="text-sm font-medium text-gray-900">Featured Products:</div>
                        {post.products.map((product) => (
                          <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 text-sm">{product.name}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-blue-600">
                                  ৳{product.price.toLocaleString()}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-xs text-gray-500 line-through">
                                    ৳{product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                                {product.discount && (
                                  <Badge variant="destructive" className="text-xs">
                                    -{product.discount}%
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-500">{product.rating}</span>
                                <span className="text-xs text-gray-400">
                                  • {product.socialProof.mentionCount} mentions
                                </span>
                              </div>
                            </div>
                            <Button size="sm">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Buy
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Like
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'influencers' && showInfluencers && (
        <div className="space-y-6">
          {/* Influencer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {influencers.map((influencer) => (
              <Card key={influencer.id} className="overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    {/* Influencer Avatar */}
                    <div className="relative">
                      <img
                        src={influencer.avatar}
                        alt={influencer.name}
                        className="w-20 h-20 rounded-full mx-auto"
                      />
                      {influencer.verified && (
                        <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>

                    {/* Influencer Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900">{influencer.name}</h3>
                      <p className="text-sm text-gray-600">{influencer.category} • {influencer.platform}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatCount(influencer.followerCount)}
                        </div>
                        <div className="text-xs text-gray-500">Followers</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {influencer.engagementRate}%
                        </div>
                        <div className="text-xs text-gray-500">Engagement</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          {influencer.recentPosts}
                        </div>
                        <div className="text-xs text-gray-500">Recent Posts</div>
                      </div>
                    </div>

                    {/* Recent Products */}
                    {influencer.products.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900">Recent Recommendations:</div>
                        {influencer.products.slice(0, 2).map((product) => (
                          <div key={product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <div className="flex-1 text-left">
                              <p className="text-xs font-medium truncate">{product.name}</p>
                              <p className="text-xs text-blue-600 font-bold">
                                ৳{product.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button className="w-full">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Follow & Shop
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'social-proof' && (
        <div className="space-y-6">
          {/* Social Proof Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialPosts.flatMap(post => post.products).slice(0, 6).map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Product Image */}
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      {product.discount && (
                        <Badge variant="destructive" className="absolute top-2 right-2">
                          -{product.discount}% OFF
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h4>
                      <p className="text-sm text-gray-600">by {product.vendor}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-blue-600">
                          ৳{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ৳{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    </div>

                    {/* Social Proof */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-blue-900 mb-2">Social Proof:</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">{product.socialProof.mentionCount}</div>
                          <div className="text-gray-600">Mentions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">{product.socialProof.purchaseCount}</div>
                          <div className="text-gray-600">Bought</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-purple-600">{product.socialProof.shareCount}</div>
                          <div className="text-gray-600">Shared</div>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialCommerceIntegration;