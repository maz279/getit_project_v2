import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  TrendingUp,
  Eye,
  Star,
  ShoppingBag,
  Video,
  Camera,
  Bookmark,
  Award
} from 'lucide-react';

interface SocialTrendsProps {
  timeRange: 'today' | 'week' | 'month';
  className?: string;
}

export const SocialTrends: React.FC<SocialTrendsProps> = ({ timeRange, className }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'influencers' | 'reviews' | 'videos'>('posts');

  const getTrendingPosts = (range: string) => {
    const basePosts = [
      {
        id: 1,
        user: {
          name: 'TechReviewer_BD',
          avatar: '👨‍💻',
          followers: 125000,
          verified: true
        },
        content: 'Just unboxed the iPhone 15 Pro Max! The titanium build feels premium 📱✨ Full review coming soon!',
        image: '/api/placeholder/300/200',
        product: 'iPhone 15 Pro Max',
        likes: 2450,
        comments: 156,
        shares: 89,
        views: 15600,
        timestamp: '2h ago',
        engagement: 94.5,
        category: 'Tech Review'
      },
      {
        id: 2,
        user: {
          name: 'FashionFinds_BD',
          avatar: '👗',
          followers: 89000,
          verified: true
        },
        content: 'Winter collection haul from H&M! These sweaters are perfect for Dhaka weather 🧥❄️ Swipe for styling tips!',
        image: '/api/placeholder/300/200',
        product: 'H&M Winter Collection',
        likes: 3200,
        comments: 234,
        shares: 167,
        views: 22400,
        timestamp: '4h ago',
        engagement: 87.2,
        category: 'Fashion'
      },
      {
        id: 3,
        user: {
          name: 'GadgetGuru',
          avatar: '⚡',
          followers: 156000,
          verified: true
        },
        content: 'Gaming setup reveal! PS5 + 4K OLED = Pure gaming bliss 🎮🔥 Details in my bio!',
        image: '/api/placeholder/300/200',
        product: 'Gaming Setup',
        likes: 4100,
        comments: 189,
        shares: 234,
        views: 31200,
        timestamp: '6h ago',
        engagement: 91.8,
        category: 'Gaming'
      },
      {
        id: 4,
        user: {
          name: 'HomeDecor_Dhaka',
          avatar: '🏡',
          followers: 67000,
          verified: false
        },
        content: 'Transformed my living room with these IKEA finds! Budget-friendly makeover under ৳15,000 💫',
        image: '/api/placeholder/300/200',
        product: 'IKEA Furniture',
        likes: 1890,
        comments: 145,
        shares: 78,
        views: 12300,
        timestamp: '8h ago',
        engagement: 82.4,
        category: 'Home Decor'
      },
      {
        id: 5,
        user: {
          name: 'FoodieFinds_BD',
          avatar: '🍕',
          followers: 78000,
          verified: true
        },
        content: 'Air fryer recipes that changed my life! Healthy + delicious = winning combo 🥗✨',
        image: '/api/placeholder/300/200',
        product: 'Philips Air Fryer',
        likes: 2600,
        comments: 198,
        shares: 145,
        views: 18900,
        timestamp: '10h ago',
        engagement: 88.7,
        category: 'Food & Kitchen'
      }
    ];

    // Adjust metrics based on time range
    const multiplier = range === 'week' ? 7 : range === 'month' ? 30 : 1;
    return basePosts.map(post => ({
      ...post,
      likes: Math.floor(post.likes * multiplier),
      comments: Math.floor(post.comments * multiplier),
      shares: Math.floor(post.shares * multiplier),
      views: Math.floor(post.views * multiplier)
    }));
  };

  const getTopInfluencers = () => [
    {
      id: 1,
      name: 'TechReviewer_BD',
      avatar: '👨‍💻',
      followers: 125000,
      category: 'Technology',
      engagement: 94.5,
      weeklyGrowth: 12.3,
      topProducts: ['iPhone 15', 'MacBook Pro', 'AirPods'],
      verified: true
    },
    {
      id: 2,
      name: 'FashionFinds_BD',
      avatar: '👗',
      followers: 89000,
      category: 'Fashion',
      engagement: 87.2,
      weeklyGrowth: 8.7,
      topProducts: ['Winter Jackets', 'Sneakers', 'Accessories'],
      verified: true
    },
    {
      id: 3,
      name: 'GadgetGuru',
      avatar: '⚡',
      followers: 156000,
      category: 'Gaming',
      engagement: 91.8,
      weeklyGrowth: 15.6,
      topProducts: ['PS5', 'Gaming Chairs', 'Peripherals'],
      verified: true
    },
    {
      id: 4,
      name: 'HomeDecor_Dhaka',
      avatar: '🏡',
      followers: 67000,
      category: 'Home & Living',
      engagement: 82.4,
      weeklyGrowth: 6.9,
      topProducts: ['Furniture', 'Decorations', 'Kitchen'],
      verified: false
    }
  ];

  const getViralReviews = () => [
    {
      id: 1,
      product: 'iPhone 15 Pro Max',
      reviewer: 'TechExpert_BD',
      rating: 4.8,
      likes: 1560,
      helpful: 89,
      review: 'Camera quality is absolutely stunning! Worth every taka for photography enthusiasts.',
      verified: true
    },
    {
      id: 2,
      product: 'Samsung Galaxy Watch 6',
      reviewer: 'FitnessTracker',
      rating: 4.6,
      likes: 1230,
      helpful: 76,
      review: 'Perfect fitness companion. Battery life exceeded expectations!',
      verified: true
    },
    {
      id: 3,
      product: 'Sony WH-1000XM5',
      reviewer: 'AudioPhile_BD',
      rating: 4.9,
      likes: 1890,
      helpful: 92,
      review: 'Best noise cancellation I\'ve experienced. Music quality is phenomenal!',
      verified: true
    }
  ];

  const getTrendingVideos = () => [
    {
      id: 1,
      title: 'iPhone 15 Pro Max Unboxing & First Impressions',
      creator: 'TechReviewer_BD',
      views: 45600,
      likes: 3200,
      duration: '12:34',
      thumbnail: '/api/placeholder/300/200',
      category: 'Unboxing'
    },
    {
      id: 2,
      title: 'Winter Fashion Haul 2024 - Affordable Finds',
      creator: 'FashionFinds_BD',
      views: 32100,
      likes: 2800,
      duration: '15:22',
      thumbnail: '/api/placeholder/300/200',
      category: 'Fashion'
    },
    {
      id: 3,
      title: 'Gaming Setup Tour - Budget to Pro Setup',
      creator: 'GadgetGuru',
      views: 28900,
      likes: 2450,
      duration: '18:45',
      thumbnail: '/api/placeholder/300/200',
      category: 'Gaming'
    }
  ];

  const trendingPosts = getTrendingPosts(timeRange);
  const topInfluencers = getTopInfluencers();
  const viralReviews = getViralReviews();
  const trendingVideos = getTrendingVideos();

  const tabs = [
    { id: 'posts', label: 'Trending Posts', icon: MessageCircle, count: trendingPosts.length },
    { id: 'influencers', label: 'Top Creators', icon: Users, count: topInfluencers.length },
    { id: 'reviews', label: 'Viral Reviews', icon: Star, count: viralReviews.length },
    { id: 'videos', label: 'Hot Videos', icon: Video, count: trendingVideos.length }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <Badge variant="secondary" className="text-xs">
                {tab.count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {trendingPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* User Info */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                      {post.user.avatar}
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{post.user.name}</span>
                      {post.user.verified && <Badge className="text-xs bg-blue-100 text-blue-700">Verified</Badge>}
                      <span className="text-sm text-gray-500">{post.timestamp}</span>
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                    </div>
                    
                    <p className="text-gray-800 mb-3">{post.content}</p>
                    
                    {/* Product Tag */}
                    <Badge className="mb-3 bg-purple-100 text-purple-700">
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      {post.product}
                    </Badge>
                    
                    {/* Engagement Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        <span>{post.shares}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views.toLocaleString()}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        {post.engagement}% engagement
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'influencers' && (
        <div className="grid md:grid-cols-2 gap-4">
          {topInfluencers.map((influencer) => (
            <Card key={influencer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
                    {influencer.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{influencer.name}</h3>
                      {influencer.verified && <Award className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-600">{influencer.category}</p>
                    <p className="text-sm font-medium">{(influencer.followers / 1000).toFixed(0)}K followers</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="font-bold text-lg text-green-600">{influencer.engagement}%</div>
                    <div className="text-xs text-gray-600">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-blue-600">+{influencer.weeklyGrowth}%</div>
                    <div className="text-xs text-gray-600">Weekly Growth</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-xs text-gray-600 mb-2">Top Products:</div>
                  <div className="flex flex-wrap gap-1">
                    {influencer.topProducts.map((product) => (
                      <Badge key={product} variant="outline" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button size="sm" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Follow
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {viralReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{review.product}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">by {review.reviewer}</span>
                      {review.verified && <Badge className="text-xs bg-green-100 text-green-700">Verified</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold">{review.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-800 mb-3">{review.review}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{review.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{review.helpful}% found helpful</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingVideos.map((video) => (
            <Card key={video.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                    {video.duration}
                  </Badge>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="sm" className="rounded-full w-12 h-12 p-0">
                      <Video className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{video.creator}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      <span>{video.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-3 h-3" />
                      <span>{video.likes.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};