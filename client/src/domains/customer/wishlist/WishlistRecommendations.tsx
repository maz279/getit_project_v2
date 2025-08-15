/**
 * WishlistRecommendations - Related Items and Recommendations Component
 * Amazon.com/Shopee.sg-Level Wishlist AI Recommendations
 * Phase 1 Week 3-4 Implementation
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Star, 
  ShoppingCart, 
  Heart,
  Eye,
  ArrowRight,
  Zap,
  Target,
  Package,
  Gift,
  Percent
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

interface RecommendedItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendor: string;
  category: string;
  rating: number;
  reviewCount: number;
  reason: string;
  confidence: number;
  isPopular: boolean;
  isTrending: boolean;
  isOnSale: boolean;
  discount?: number;
  estimatedDelivery: string;
}

interface PersonalizedSet {
  id: string;
  title: string;
  description: string;
  items: RecommendedItem[];
  totalValue: number;
  savings: number;
  icon: string;
  category: string;
}

interface WishlistRecommendationsProps {
  wishlistItems: any[];
  recommendations: RecommendedItem[];
  personalizedSets: PersonalizedSet[];
  onAddToWishlist: (item: RecommendedItem) => void;
  onAddToCart: (item: RecommendedItem) => void;
  onViewItem: (item: RecommendedItem) => void;
  onAddSetToWishlist: (set: PersonalizedSet) => void;
  className?: string;
}

export const WishlistRecommendations: React.FC<WishlistRecommendationsProps> = ({
  wishlistItems,
  recommendations,
  personalizedSets,
  onAddToWishlist,
  onAddToCart,
  onViewItem,
  onAddSetToWishlist,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('for-you');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'rating' | 'popularity'>('relevance');

  const categories = ['all', 'electronics', 'fashion', 'home', 'beauty', 'sports', 'books'];

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`;
  };

  const getRecommendationsByType = (type: string) => {
    switch (type) {
      case 'for-you':
        return recommendations.filter(item => 
          item.reason.includes('Based on your wishlist') || 
          item.reason.includes('Personalized')
        );
      case 'trending':
        return recommendations.filter(item => item.isTrending);
      case 'similar':
        return recommendations.filter(item => 
          item.reason.includes('Similar to') || 
          item.reason.includes('Often bought')
        );
      case 'popular':
        return recommendations.filter(item => item.isPopular);
      case 'deals':
        return recommendations.filter(item => item.isOnSale);
      default:
        return recommendations;
    }
  };

  const filteredRecommendations = getRecommendationsByType(activeTab)
    .filter(item => selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'relevance') return b.confidence - a.confidence;
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'popularity') return b.reviewCount - a.reviewCount;
      return 0;
    });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-blue-600';
    return 'text-orange-600';
  };

  const getReasonIcon = (reason: string) => {
    if (reason.includes('wishlist')) return <Heart className="h-3 w-3" />;
    if (reason.includes('Similar')) return <Target className="h-3 w-3" />;
    if (reason.includes('trending')) return <TrendingUp className="h-3 w-3" />;
    if (reason.includes('popular')) return <Users className="h-3 w-3" />;
    return <Sparkles className="h-3 w-3" />;
  };

  return (
    <div className={`max-w-7xl mx-auto p-4 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <Sparkles className="h-6 w-6 mr-2" />
              Recommendations for You
            </h1>
            <p className="text-blue-100">
              Discover items perfectly matched to your interests and wishlist
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <div className="text-sm text-blue-100">New Suggestions</div>
          </div>
        </div>
      </div>

      {/* Personalized Sets */}
      {personalizedSets.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              Curated Sets for You
            </CardTitle>
            <p className="text-sm text-gray-600">
              Complete sets chosen based on your wishlist preferences
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {personalizedSets.slice(0, 2).map((set) => (
                <Card key={set.id} className="border-2 border-dashed border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center">
                          <span className="text-2xl mr-2">{set.icon}</span>
                          {set.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{set.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="font-medium text-gray-900">
                            {formatPrice(set.totalValue)}
                          </span>
                          {set.savings > 0 && (
                            <Badge className="bg-green-100 text-green-800">
                              Save {formatPrice(set.savings)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAddSetToWishlist(set)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Add Set
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2 overflow-x-auto">
                      {set.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                      {set.items.length > 4 && (
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            +{set.items.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="relevance">Most Relevant</option>
                <option value="price">Price: Low to High</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredRecommendations.length} recommendations
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="for-you" className="flex items-center">
            <Sparkles className="h-4 w-4 mr-1" />
            For You
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="similar" className="flex items-center">
            <Target className="h-4 w-4 mr-1" />
            Similar Items
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center">
            <Percent className="h-4 w-4 mr-1" />
            Deals
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredRecommendations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No recommendations found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new suggestions
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecommendations.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="relative mb-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      
                      {item.isOnSale && item.discount && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          -{item.discount}%
                        </Badge>
                      )}
                      
                      {item.isTrending && (
                        <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      
                      {item.isPopular && (
                        <Badge className="absolute bottom-2 right-2 bg-blue-500 text-white">
                          <Users className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.name}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mb-2">by {item.vendor}</p>
                    
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {item.rating} ({item.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-gray-600">
                          {getReasonIcon(item.reason)}
                          <span className="ml-1 line-clamp-1">{item.reason}</span>
                        </div>
                        <span className={`font-medium ${getConfidenceColor(item.confidence)}`}>
                          {item.confidence}% match
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => onAddToCart(item)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAddToWishlist(item)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => onViewItem(item)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      <Package className="h-3 w-3 inline mr-1" />
                      {item.estimatedDelivery}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* AI Insights */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            AI Shopping Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Trending in Your Categories</h4>
              </div>
              <p className="text-sm text-blue-700">
                Electronics and fashion items are trending 23% higher this week in your interest areas.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Percent className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-900">Best Time to Buy</h4>
              </div>
              <p className="text-sm text-green-700">
                Prices in your wishlist categories typically drop 15% during weekend sales.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-purple-900">Quality Prediction</h4>
              </div>
              <p className="text-sm text-purple-700">
                Based on your preferences, we recommend items with 4.5+ stars and 100+ reviews.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-12 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Smart Recommendation Engine</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <p className="font-medium mb-1">AI-Powered Matching</p>
              <p>Advanced algorithms analyze your preferences and behavior</p>
            </div>
            <div>
              <p className="font-medium mb-1">Real-Time Updates</p>
              <p>Recommendations update based on trending items and market changes</p>
            </div>
            <div>
              <p className="font-medium mb-1">Bangladesh Optimized</p>
              <p>Considers local preferences, pricing, and cultural factors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistRecommendations;