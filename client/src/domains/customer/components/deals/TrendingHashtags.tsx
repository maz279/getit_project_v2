import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Hash, TrendingUp, Search, Users, MessageCircle, Heart } from 'lucide-react';

interface TrendingHashtagsProps {
  className?: string;
}

export const TrendingHashtags: React.FC<TrendingHashtagsProps> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', count: 156 },
    { id: 'shopping', label: 'Shopping', count: 45 },
    { id: 'deals', label: 'Deals', count: 32 },
    { id: 'lifestyle', label: 'Lifestyle', count: 28 },
    { id: 'tech', label: 'Tech', count: 24 },
    { id: 'fashion', label: 'Fashion', count: 19 },
    { id: 'gaming', label: 'Gaming', count: 8 }
  ];

  const trendingHashtags = [
    {
      id: 1,
      tag: 'WinterSale2024',
      posts: 45620,
      engagement: 89.5,
      growth: 156.8,
      category: 'deals',
      relatedProducts: ['Winter Jackets', 'Boots', 'Sweaters'],
      color: 'from-blue-500 to-cyan-500',
      trending: 'hot'
    },
    {
      id: 2,
      tag: 'FlashSaleAlert',
      posts: 38940,
      engagement: 92.3,
      growth: 234.1,
      category: 'shopping',
      relatedProducts: ['Electronics', 'Fashion', 'Home'],
      color: 'from-red-500 to-orange-500',
      trending: 'viral'
    },
    {
      id: 3,
      tag: 'TechReview2024',
      posts: 32150,
      engagement: 76.8,
      growth: 89.4,
      category: 'tech',
      relatedProducts: ['Smartphones', 'Laptops', 'Gadgets'],
      color: 'from-purple-500 to-pink-500',
      trending: 'rising'
    },
    {
      id: 4,
      tag: 'BestDeals',
      posts: 28760,
      engagement: 84.2,
      growth: 67.3,
      category: 'deals',
      relatedProducts: ['Daily Deals', 'Clearance', 'Bundles'],
      color: 'from-green-500 to-teal-500',
      trending: 'steady'
    },
    {
      id: 5,
      tag: 'FashionTrends',
      posts: 25430,
      engagement: 91.7,
      growth: 45.2,
      category: 'fashion',
      relatedProducts: ['Clothing', 'Accessories', 'Shoes'],
      color: 'from-pink-500 to-rose-500',
      trending: 'rising'
    },
    {
      id: 6,
      tag: 'GamingDeals',
      posts: 22890,
      engagement: 88.9,
      growth: 123.6,
      category: 'gaming',
      relatedProducts: ['Console Games', 'Gaming Gear', 'Accessories'],
      color: 'from-indigo-500 to-purple-500',
      trending: 'hot'
    },
    {
      id: 7,
      tag: 'HomeDecor2024',
      posts: 19560,
      engagement: 73.4,
      growth: 34.8,
      category: 'lifestyle',
      relatedProducts: ['Furniture', 'Decorations', 'Lighting'],
      color: 'from-yellow-500 to-orange-500',
      trending: 'steady'
    },
    {
      id: 8,
      tag: 'MustHave',
      posts: 17230,
      engagement: 95.1,
      growth: 78.9,
      category: 'shopping',
      relatedProducts: ['Trending Items', 'Bestsellers', 'New Arrivals'],
      color: 'from-cyan-500 to-blue-500',
      trending: 'rising'
    },
    {
      id: 9,
      tag: 'WeekendSpecial',
      posts: 15890,
      engagement: 82.6,
      growth: 56.7,
      category: 'deals',
      relatedProducts: ['Weekend Deals', 'Limited Time', 'Special Offers'],
      color: 'from-emerald-500 to-green-500',
      trending: 'steady'
    },
    {
      id: 10,
      tag: 'NewArrivals',
      posts: 14560,
      engagement: 87.3,
      growth: 92.4,
      category: 'shopping',
      relatedProducts: ['Latest Products', 'Fresh Stock', 'Just Launched'],
      color: 'from-violet-500 to-purple-500',
      trending: 'rising'
    },
    {
      id: 11,
      tag: 'LifestyleGoals',
      posts: 13470,
      engagement: 79.8,
      growth: 23.1,
      category: 'lifestyle',
      relatedProducts: ['Wellness', 'Fitness', 'Self Care'],
      color: 'from-teal-500 to-cyan-500',
      trending: 'steady'
    },
    {
      id: 12,
      tag: 'TechLaunch2024',
      posts: 12340,
      engagement: 94.2,
      growth: 167.5,
      category: 'tech',
      relatedProducts: ['New Tech', 'Innovation', 'Cutting Edge'],
      color: 'from-slate-500 to-gray-500',
      trending: 'viral'
    }
  ];

  const filteredHashtags = selectedCategory === 'all' 
    ? trendingHashtags 
    : trendingHashtags.filter(tag => tag.category === selectedCategory);

  const getTrendingIcon = (trending: string) => {
    switch (trending) {
      case 'viral':
        return '🔥';
      case 'hot':
        return '⚡';
      case 'rising':
        return '📈';
      default:
        return '📊';
    }
  };

  const getTrendingColor = (trending: string) => {
    switch (trending) {
      case 'viral':
        return 'text-red-600 bg-red-100';
      case 'hot':
        return 'text-orange-600 bg-orange-100';
      case 'rising':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Hash className="w-6 h-6" />
          Trending Hashtags
        </h2>
        <p className="text-gray-600">
          Discover what's buzzing in the shopping community
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            {category.label}
            <Badge variant="secondary" className="text-xs">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Top Hashtag Spotlight */}
      {filteredHashtags.length > 0 && (
        <Card className={`bg-gradient-to-r ${filteredHashtags[0].color} border-0 text-white overflow-hidden`}>
          <CardContent className="p-6 relative">
            <div className="absolute inset-0 bg-black/10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Hash className="w-8 h-8" />
                  <h3 className="text-3xl font-bold">#{filteredHashtags[0].tag}</h3>
                  <Badge className={getTrendingColor(filteredHashtags[0].trending)}>
                    {getTrendingIcon(filteredHashtags[0].trending)} {filteredHashtags[0].trending.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-lg text-white/90 mb-4">
                  {filteredHashtags[0].posts.toLocaleString()} posts • 
                  {filteredHashtags[0].engagement}% engagement • 
                  +{filteredHashtags[0].growth}% growth
                </p>
                <div className="flex flex-wrap gap-2">
                  {filteredHashtags[0].relatedProducts.map((product) => (
                    <Badge key={product} className="bg-white/20 text-white border-0">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30 mb-2">
                  <Search className="w-4 h-4 mr-2" />
                  Explore
                </Button>
                <div className="text-sm text-white/80">
                  #{filteredHashtags[0].posts.toLocaleString()} posts
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredHashtags.reduce((sum, tag) => sum + tag.posts, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(filteredHashtags.reduce((sum, tag) => sum + tag.engagement, 0) / filteredHashtags.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Engagement</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredHashtags.filter(tag => tag.trending === 'viral' || tag.trending === 'hot').length}
            </div>
            <div className="text-sm text-gray-600">Hot Tags</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              +{Math.round(filteredHashtags.reduce((sum, tag) => sum + tag.growth, 0) / filteredHashtags.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Growth</div>
          </CardContent>
        </Card>
      </div>

      {/* Hashtags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHashtags.slice(1).map((hashtag, index) => (
          <Card key={hashtag.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-gray-500" />
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {hashtag.tag}
                  </h3>
                </div>
                <Badge className={getTrendingColor(hashtag.trending)}>
                  {getTrendingIcon(hashtag.trending)}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-900">
                    {(hashtag.posts / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    Posts
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-green-600">
                    {hashtag.engagement}%
                  </div>
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <Heart className="w-3 h-3" />
                    Engage
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-blue-600">
                    +{hashtag.growth.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Growth
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-600 mb-2">Related:</div>
                <div className="flex flex-wrap gap-1">
                  {hashtag.relatedProducts.map((product) => (
                    <Badge key={product} variant="outline" className="text-xs">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button size="sm" className={`w-full bg-gradient-to-r ${hashtag.color} text-white hover:shadow-lg`}>
                <Search className="w-4 h-4 mr-2" />
                Explore #{hashtag.tag}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Hashtag CTA */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-2xl font-bold mb-2">
            📱 Start Your Own Trend
          </h3>
          <p className="text-lg text-white/90 mb-4">
            Share your shopping finds and create viral hashtags
          </p>
          <Button className="bg-white text-indigo-600 hover:bg-gray-100" size="lg">
            <Hash className="w-5 h-5 mr-2" />
            Create Hashtag
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};