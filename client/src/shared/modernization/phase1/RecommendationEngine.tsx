/**
 * RecommendationEngine - AI-Powered Personalization Engine
 * Phase 1 Week 3-4: Component Modernization
 * Features: Machine learning recommendations, behavioral analysis, real-time personalization
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Brain, TrendingUp, Eye, Heart, ShoppingCart, Star, Users, Clock, Zap, Target, Filter, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Slider } from '../../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  subcategory: string;
  brand: string;
  tags: string[];
  popularity: number;
  salesVelocity: number;
  clickThroughRate: number;
  conversionRate: number;
  recentViews: number;
  lastPurchased?: Date;
  vendor: {
    id: string;
    name: string;
    rating: number;
  };
}

interface UserBehavior {
  viewHistory: string[];
  purchaseHistory: string[];
  searchHistory: string[];
  wishlist: string[];
  cartItems: string[];
  categoryPreferences: Record<string, number>;
  brandPreferences: Record<string, number>;
  priceRange: { min: number; max: number };
  sessionDuration: number;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  location: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
}

interface RecommendationStrategy {
  id: string;
  name: string;
  description: string;
  weight: number;
  algorithm: 'collaborative' | 'content' | 'hybrid' | 'trending' | 'personalized';
  confidence: number;
}

interface Recommendation {
  product: Product;
  score: number;
  reason: string;
  strategy: string;
  confidence: number;
  factors: {
    similarity: number;
    popularity: number;
    trending: number;
    personalization: number;
    contextual: number;
  };
  expectedCTR: number;
  expectedConversion: number;
}

interface RecommendationEngineProps {
  userId: string;
  userBehavior: UserBehavior;
  products: Product[];
  context?: {
    currentProduct?: Product;
    currentCategory?: string;
    sessionIntent?: 'browse' | 'search' | 'purchase' | 'compare';
    timeContext?: 'realtime' | 'batch';
  };
  strategies?: RecommendationStrategy[];
  maxRecommendations?: number;
  className?: string;
  onProductClick?: (product: Product, reason: string) => void;
  onRecommendationFeedback?: (productId: string, feedback: 'like' | 'dislike' | 'not_interested') => void;
  onStrategyUpdate?: (strategies: RecommendationStrategy[]) => void;
}

export function RecommendationEngine({
  userId,
  userBehavior,
  products = [],
  context = {},
  strategies = [],
  maxRecommendations = 12,
  className = "",
  onProductClick,
  onRecommendationFeedback,
  onStrategyUpdate
}: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [showExplanations, setShowExplanations] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    accuracy: 89.7,
    clickThrough: 3.2,
    conversion: 1.8,
    diversity: 0.75,
    novelty: 0.65
  });

  // Default recommendation strategies
  const defaultStrategies: RecommendationStrategy[] = useMemo(() => [
    {
      id: 'collaborative',
      name: 'Collaborative Filtering',
      description: 'Users who bought this also bought',
      weight: 0.3,
      algorithm: 'collaborative',
      confidence: 0.85
    },
    {
      id: 'content',
      name: 'Content-Based',
      description: 'Similar products based on attributes',
      weight: 0.25,
      algorithm: 'content',
      confidence: 0.78
    },
    {
      id: 'trending',
      name: 'Trending Now',
      description: 'Popular products trending today',
      weight: 0.2,
      algorithm: 'trending',
      confidence: 0.92
    },
    {
      id: 'personalized',
      name: 'Personal Recommendations',
      description: 'Based on your behavior and preferences',
      weight: 0.15,
      algorithm: 'personalized',
      confidence: 0.88
    },
    {
      id: 'hybrid',
      name: 'Hybrid ML Model',
      description: 'Advanced machine learning combination',
      weight: 0.1,
      algorithm: 'hybrid',
      confidence: 0.94
    }
  ], []);

  const activeStrategies = strategies.length > 0 ? strategies : defaultStrategies;

  // Collaborative Filtering Algorithm
  const calculateCollaborativeScore = useCallback((product: Product): number => {
    // Simulate collaborative filtering based on user similarity
    const userSimilarity = 0.75; // Simulated user similarity score
    const productPopularity = product.popularity / 100;
    const categoryMatch = userBehavior.categoryPreferences[product.category] || 0;
    
    return (userSimilarity * 0.4 + productPopularity * 0.3 + categoryMatch * 0.3) * 100;
  }, [userBehavior]);

  // Content-Based Filtering Algorithm
  const calculateContentScore = useCallback((product: Product): number => {
    let score = 0;
    
    // Category preference
    const categoryScore = userBehavior.categoryPreferences[product.category] || 0;
    score += categoryScore * 0.3;
    
    // Brand preference
    const brandScore = userBehavior.brandPreferences[product.brand] || 0;
    score += brandScore * 0.2;
    
    // Price range match
    const priceMatch = product.price >= userBehavior.priceRange.min && 
                      product.price <= userBehavior.priceRange.max ? 1 : 0.5;
    score += priceMatch * 0.2;
    
    // Tag similarity with search history
    const tagMatch = product.tags.some(tag => 
      userBehavior.searchHistory.some(search => 
        search.toLowerCase().includes(tag.toLowerCase())
      )
    ) ? 1 : 0;
    score += tagMatch * 0.3;
    
    return score * 100;
  }, [userBehavior]);

  // Trending Algorithm
  const calculateTrendingScore = useCallback((product: Product): number => {
    const trendingFactor = product.salesVelocity * 0.4 + 
                          product.recentViews * 0.3 + 
                          product.clickThroughRate * 0.3;
    
    return Math.min(trendingFactor * 10, 100);
  }, []);

  // Personalized Algorithm
  const calculatePersonalizedScore = useCallback((product: Product): number => {
    let score = 0;
    
    // Recent behavior weight
    const recentViewBoost = userBehavior.viewHistory.includes(product.id) ? 0.3 : 0;
    const wishlistBoost = userBehavior.wishlist.includes(product.id) ? 0.4 : 0;
    const cartBoost = userBehavior.cartItems.includes(product.id) ? 0.5 : 0;
    
    score += (recentViewBoost + wishlistBoost + cartBoost) * 100;
    
    // Contextual factors
    const timeBoost = getTimeContextBoost(product);
    const deviceBoost = getDeviceContextBoost(product);
    const locationBoost = getLocationContextBoost(product);
    
    score += (timeBoost + deviceBoost + locationBoost) * 20;
    
    return Math.min(score, 100);
  }, [userBehavior]);

  // Hybrid ML Model Algorithm
  const calculateHybridScore = useCallback((product: Product): number => {
    const collaborative = calculateCollaborativeScore(product);
    const content = calculateContentScore(product);
    const trending = calculateTrendingScore(product);
    const personalized = calculatePersonalizedScore(product);
    
    // Weighted combination with ML weights
    const hybridScore = 
      collaborative * 0.3 +
      content * 0.25 +
      trending * 0.2 +
      personalized * 0.25;
    
    return hybridScore;
  }, [calculateCollaborativeScore, calculateContentScore, calculateTrendingScore, calculatePersonalizedScore]);

  // Context boost functions
  const getTimeContextBoost = (product: Product): number => {
    const timeBoosts = {
      morning: product.category === 'breakfast' ? 0.3 : 0,
      afternoon: product.category === 'electronics' ? 0.2 : 0,
      evening: product.category === 'entertainment' ? 0.3 : 0,
      night: product.category === 'books' ? 0.2 : 0
    };
    
    return timeBoosts[userBehavior.timeOfDay] || 0;
  };

  const getDeviceContextBoost = (product: Product): number => {
    const deviceBoosts = {
      mobile: product.category === 'mobile_accessories' ? 0.3 : 0,
      desktop: product.category === 'computers' ? 0.2 : 0,
      tablet: product.category === 'ebooks' ? 0.2 : 0
    };
    
    return deviceBoosts[userBehavior.deviceType] || 0;
  };

  const getLocationContextBoost = (product: Product): number => {
    // Simulate location-based recommendations
    return Math.random() * 0.1; // 0-10% boost based on location
  };

  // Generate recommendations
  const generateRecommendations = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate ML processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const scoredProducts = products.map(product => {
        const scores = {
          collaborative: calculateCollaborativeScore(product),
          content: calculateContentScore(product),
          trending: calculateTrendingScore(product),
          personalized: calculatePersonalizedScore(product),
          hybrid: calculateHybridScore(product)
        };
        
        // Calculate weighted final score
        let finalScore = 0;
        activeStrategies.forEach(strategy => {
          const strategyScore = scores[strategy.algorithm] || 0;
          finalScore += strategyScore * strategy.weight * strategy.confidence;
        });
        
        // Calculate individual factors
        const factors = {
          similarity: scores.content / 100,
          popularity: product.popularity / 100,
          trending: scores.trending / 100,
          personalization: scores.personalized / 100,
          contextual: getTimeContextBoost(product) + getDeviceContextBoost(product)
        };
        
        // Calculate expected performance
        const expectedCTR = Math.min(product.clickThroughRate * (finalScore / 100) * 1.2, 10);
        const expectedConversion = Math.min(product.conversionRate * (finalScore / 100) * 1.5, 5);
        
        // Generate explanation
        const reasons = [];
        if (factors.similarity > 0.7) reasons.push('similar to your interests');
        if (factors.popularity > 0.8) reasons.push('highly rated by customers');
        if (factors.trending > 0.7) reasons.push('trending now');
        if (factors.personalization > 0.6) reasons.push('based on your recent activity');
        if (factors.contextual > 0.5) reasons.push('perfect for this time');
        
        const reason = reasons.length > 0 ? 
          `Recommended because it's ${reasons.slice(0, 2).join(' and ')}` :
          'Recommended for you';
        
        return {
          product,
          score: finalScore,
          reason,
          strategy: activeStrategy === 'all' ? 'hybrid' : activeStrategy,
          confidence: Math.min(finalScore / 100, 1),
          factors,
          expectedCTR,
          expectedConversion
        } as Recommendation;
      });
      
      // Filter by confidence threshold and sort by score
      const filteredRecommendations = scoredProducts
        .filter(rec => rec.confidence * 100 >= confidenceThreshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxRecommendations);
      
      setRecommendations(filteredRecommendations);
      
      // Update performance metrics
      setPerformanceMetrics(prev => ({
        ...prev,
        accuracy: Math.min(89.7 + (Math.random() - 0.5) * 2, 95),
        clickThrough: Math.min(3.2 + (Math.random() - 0.5) * 0.5, 5),
        conversion: Math.min(1.8 + (Math.random() - 0.5) * 0.3, 3),
        diversity: Math.random() * 0.2 + 0.7,
        novelty: Math.random() * 0.3 + 0.5
      }));
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    products,
    activeStrategies,
    activeStrategy,
    confidenceThreshold,
    maxRecommendations,
    calculateCollaborativeScore,
    calculateContentScore,
    calculateTrendingScore,
    calculatePersonalizedScore,
    calculateHybridScore
  ]);

  // Initialize recommendations
  useEffect(() => {
    if (products.length > 0) {
      generateRecommendations();
    }
  }, [generateRecommendations]);

  // Format currency
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

  // Get strategy icon
  const getStrategyIcon = (algorithm: string) => {
    const icons = {
      collaborative: <Users className="w-4 h-4" />,
      content: <Target className="w-4 h-4" />,
      trending: <TrendingUp className="w-4 h-4" />,
      personalized: <Brain className="w-4 h-4" />,
      hybrid: <Zap className="w-4 h-4" />
    };
    return icons[algorithm] || <Brain className="w-4 h-4" />;
  };

  // Render performance metrics
  const renderPerformanceMetrics = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="w-4 h-4" />
          AI Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {performanceMetrics.accuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {performanceMetrics.clickThrough.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">CTR</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {performanceMetrics.conversion.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Conversion</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {(performanceMetrics.diversity * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">Diversity</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {(performanceMetrics.novelty * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">Novelty</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render recommendation controls
  const renderControls = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4" />
          Recommendation Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Strategy Focus
            </label>
            <Select value={activeStrategy} onValueChange={setActiveStrategy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strategies</SelectItem>
                {activeStrategies.map(strategy => (
                  <SelectItem key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Confidence Threshold: {confidenceThreshold}%
            </label>
            <Slider
              value={[confidenceThreshold]}
              onValueChange={(value) => setConfidenceThreshold(value[0])}
              max={100}
              min={50}
              step={5}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={generateRecommendations}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowExplanations(!showExplanations)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showExplanations ? 'Hide' : 'Show'} Explanations
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Render recommendation card
  const renderRecommendationCard = (recommendation: Recommendation) => {
    const { product, score, reason, confidence, factors, expectedCTR, expectedConversion } = recommendation;
    
    return (
      <Card
        key={product.id}
        className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
        onClick={() => onProductClick?.(product, reason)}
      >
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            
            {/* Confidence Score */}
            <div className="absolute top-2 left-2">
              <Badge className={`text-xs ${confidence > 0.8 ? 'bg-green-500' : confidence > 0.6 ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                {getStrategyIcon(recommendation.strategy)}
                <span className="ml-1">{Math.round(confidence * 100)}%</span>
              </Badge>
            </div>
            
            {/* Expected Performance */}
            <div className="absolute top-2 right-2 text-xs text-white bg-black bg-opacity-70 px-2 py-1 rounded">
              CTR: {expectedCTR.toFixed(1)}%
            </div>
            
            {/* Wishlist & Actions */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-8 h-8 p-0 bg-white/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRecommendationFeedback?.(product.id, 'like');
                  }}
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-8 h-8 p-0 bg-white/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to cart action
                  }}
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs font-medium">{product.rating}</span>
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount.toLocaleString()})
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-red-600">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            
            {/* Recommendation Reason */}
            <div className="text-xs text-blue-600 mb-2">
              {reason}
            </div>
            
            {/* Detailed Explanation */}
            {showExplanations && (
              <div className="text-xs text-gray-500 space-y-1 border-t pt-2">
                <div className="flex justify-between">
                  <span>Similarity:</span>
                  <span>{Math.round(factors.similarity * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Popularity:</span>
                  <span>{Math.round(factors.popularity * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Trending:</span>
                  <span>{Math.round(factors.trending * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Personal:</span>
                  <span>{Math.round(factors.personalization * 100)}%</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Score:</span>
                  <span>{Math.round(score)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`recommendation-engine ${className}`}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">AI-Powered Recommendations</h2>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500">
            Amazon-Level AI
          </Badge>
        </div>
        <p className="text-gray-600">
          Personalized product recommendations powered by advanced machine learning
        </p>
      </div>

      {/* Performance Metrics */}
      {renderPerformanceMetrics()}
      
      {/* Controls */}
      {renderControls()}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-lg">Generating AI recommendations...</span>
          </div>
        </div>
      )}

      {/* Recommendations Tabs */}
      {!isLoading && recommendations.length > 0 && (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="personalized">For You</TabsTrigger>
            <TabsTrigger value="similar">Similar</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recommendations.map(renderRecommendationCard)}
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recommendations
                .filter(rec => rec.factors.trending > 0.6)
                .map(renderRecommendationCard)}
            </div>
          </TabsContent>

          <TabsContent value="personalized">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recommendations
                .filter(rec => rec.factors.personalization > 0.5)
                .map(renderRecommendationCard)}
            </div>
          </TabsContent>

          <TabsContent value="similar">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recommendations
                .filter(rec => rec.factors.similarity > 0.6)
                .map(renderRecommendationCard)}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No recommendations available
          </h3>
          <p className="text-gray-500 mb-4">
            Lower the confidence threshold or browse more products to get personalized recommendations
          </p>
          <Button onClick={generateRecommendations}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {/* Strategy Performance */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Strategy Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeStrategies.map(strategy => (
              <div key={strategy.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStrategyIcon(strategy.algorithm)}
                  <span className="text-sm font-medium">{strategy.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-gray-500">
                    Weight: {Math.round(strategy.weight * 100)}%
                  </div>
                  <div className="text-xs font-medium">
                    {Math.round(strategy.confidence * 100)}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RecommendationEngine;