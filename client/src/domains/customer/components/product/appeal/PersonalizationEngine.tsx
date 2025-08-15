/**
 * Phase 3: Appeal Stage - Personalization Engine
 * Amazon.com 5 A's Framework Implementation
 * AI-Powered Personalized Product Recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Brain, 
  Star, 
  Heart, 
  Eye, 
  TrendingUp, 
  Target,
  Sparkles,
  Users,
  ShoppingCart,
  Clock,
  Award,
  Zap,
  ThumbsUp,
  Filter,
  Shuffle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalizationEngineProps {
  userId?: string;
  productId?: string;
  className?: string;
}

interface PersonalizationData {
  userProfile: UserProfile;
  recommendations: ProductRecommendation[];
  behaviorInsights: BehaviorInsight[];
  personalizedOffers: PersonalizedOffer[];
  similarCustomers: SimilarCustomer[];
  aiInsights: AIInsight[];
}

interface UserProfile {
  preferences: {
    categories: string[];
    priceRange: { min: number; max: number };
    brands: string[];
    features: string[];
  };
  behaviorScore: number;
  loyaltyTier: string;
  purchaseHistory: number;
  browsingSessions: number;
  culturalPreferences: string[];
  location: string;
}

interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  matchScore: number;
  reason: string;
  category: string;
  badges: string[];
  urgency?: string;
  culturalRelevance: number;
}

interface BehaviorInsight {
  id: string;
  type: 'preference' | 'pattern' | 'timing' | 'cultural';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  icon: any;
}

interface PersonalizedOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  category: string;
  conditions: string[];
  used: boolean;
}

interface SimilarCustomer {
  id: string;
  similarity: number;
  purchasedItems: string[];
  location: string;
  demographics: string;
}

interface AIInsight {
  id: string;
  category: 'prediction' | 'optimization' | 'cultural' | 'timing';
  title: string;
  content: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

const PersonalizationEngine: React.FC<PersonalizationEngineProps> = ({
  userId,
  productId,
  className,
}) => {
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high-match' | 'cultural' | 'trending'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI personalization data loading
    const loadPersonalizationData = () => {
      const mockData: PersonalizationData = {
        userProfile: {
          preferences: {
            categories: ['Electronics', 'Gaming', 'Books', 'Fashion'],
            priceRange: { min: 1000, max: 25000 },
            brands: ['Samsung', 'Apple', 'Sony', 'Dell'],
            features: ['Wireless', 'RGB Lighting', 'Fast Charging', 'Noise Cancellation']
          },
          behaviorScore: 87,
          loyaltyTier: 'Gold',
          purchaseHistory: 23,
          browsingSessions: 156,
          culturalPreferences: ['Bengali Literature', 'Traditional Wear', 'Local Brands'],
          location: 'Dhaka, Bangladesh'
        },
        recommendations: [
          {
            id: 'rec1',
            name: 'Gaming Mechanical Keyboard',
            price: 8500,
            originalPrice: 12000,
            image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300',
            rating: 4.7,
            matchScore: 94,
            reason: 'Perfect complement to your gaming setup',
            category: 'Gaming Accessories',
            badges: ['AI Recommended', 'Best Value'],
            urgency: 'Limited Stock',
            culturalRelevance: 65
          },
          {
            id: 'rec2',
            name: 'Wireless Gaming Mouse',
            price: 4200,
            originalPrice: 6000,
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
            rating: 4.6,
            matchScore: 91,
            reason: 'Based on your recent gaming purchases',
            category: 'Gaming Accessories',
            badges: ['Trending', 'Popular Choice'],
            culturalRelevance: 70
          },
          {
            id: 'rec3',
            name: 'Programming Books Bundle',
            price: 3500,
            originalPrice: 5000,
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
            rating: 4.8,
            matchScore: 88,
            reason: 'Matches your educational interests',
            category: 'Books & Learning',
            badges: ['Educational', 'Best Seller'],
            culturalRelevance: 85
          },
          {
            id: 'rec4',
            name: 'Traditional Bengali Kurta',
            price: 2200,
            originalPrice: 3200,
            image: 'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=300',
            rating: 4.9,
            matchScore: 82,
            reason: 'Perfect for upcoming cultural events',
            category: 'Traditional Fashion',
            badges: ['Cultural Choice', 'Handmade'],
            urgency: 'Festival Season',
            culturalRelevance: 95
          },
          {
            id: 'rec5',
            name: 'Smartphone Power Bank',
            price: 1800,
            originalPrice: 2500,
            image: 'https://images.unsplash.com/photo-1609592242893-45ab6b3d8ac5?w=300',
            rating: 4.5,
            matchScore: 79,
            reason: 'Essential tech accessory',
            category: 'Mobile Accessories',
            badges: ['Practical', 'Fast Charging'],
            culturalRelevance: 60
          },
          {
            id: 'rec6',
            name: 'Smart Fitness Watch',
            price: 12000,
            originalPrice: 15000,
            image: 'https://images.unsplash.com/photo-1611472173362-3f4d9d9b1a7b?w=300',
            rating: 4.4,
            matchScore: 76,
            reason: 'Supports your active lifestyle',
            category: 'Fitness & Health',
            badges: ['Smart Feature', 'Health Tracking'],
            culturalRelevance: 55
          }
        ],
        behaviorInsights: [
          {
            id: 'insight1',
            type: 'preference',
            title: 'Gaming Enthusiast Profile',
            description: 'You show strong preference for gaming accessories and RGB-enabled products',
            confidence: 92,
            actionable: true,
            icon: Target
          },
          {
            id: 'insight2',
            type: 'cultural',
            title: 'Cultural Heritage Appreciation',
            description: 'You frequently browse traditional Bengali products during festival seasons',
            confidence: 88,
            actionable: true,
            icon: Heart
          },
          {
            id: 'insight3',
            type: 'timing',
            title: 'Evening Shopping Pattern',
            description: 'You typically make purchases between 7-9 PM on weekdays',
            confidence: 84,
            actionable: false,
            icon: Clock
          },
          {
            id: 'insight4',
            type: 'pattern',
            title: 'Quality-First Buyer',
            description: 'You prioritize product reviews and ratings over lowest price',
            confidence: 90,
            actionable: true,
            icon: Star
          }
        ],
        personalizedOffers: [
          {
            id: 'offer1',
            title: 'Gaming Bundle Discount',
            description: 'Complete your gaming setup with 25% off on accessories',
            discount: 25,
            validUntil: '2025-01-20',
            category: 'Gaming',
            conditions: ['Minimum ৳5,000 purchase', 'Gaming category only'],
            used: false
          },
          {
            id: 'offer2',
            title: 'Cultural Collection Bonus',
            description: 'Special festival discount on traditional wear',
            discount: 30,
            validUntil: '2025-01-31',
            category: 'Traditional Fashion',
            conditions: ['Valid during festival season', 'Traditional items only'],
            used: false
          },
          {
            id: 'offer3',
            title: 'Loyalty Tier Upgrade',
            description: 'Exclusive Gold member early access deals',
            discount: 15,
            validUntil: '2025-02-15',
            category: 'All Categories',
            conditions: ['Gold tier exclusive', 'Limited time'],
            used: true
          }
        ],
        similarCustomers: [
          {
            id: 'sim1',
            similarity: 94,
            purchasedItems: ['Gaming Headset', 'Mechanical Keyboard', 'Programming Books'],
            location: 'Dhaka',
            demographics: 'Tech Professional, 25-30'
          },
          {
            id: 'sim2',
            similarity: 89,
            purchasedItems: ['Traditional Kurta', 'Bengali Books', 'Gaming Mouse'],
            location: 'Chittagong',
            demographics: 'Student, 20-25'
          },
          {
            id: 'sim3',
            similarity: 86,
            purchasedItems: ['Smart Watch', 'Power Bank', 'Cultural Items'],
            location: 'Sylhet',
            demographics: 'Professional, 30-35'
          }
        ],
        aiInsights: [
          {
            id: 'ai1',
            category: 'prediction',
            title: 'Next Purchase Prediction',
            content: 'Based on your behavior, you\'re 87% likely to purchase a gaming keyboard within the next 2 weeks.',
            impact: 'high',
            actionable: true
          },
          {
            id: 'ai2',
            category: 'cultural',
            title: 'Festival Shopping Opportunity',
            content: 'Pohela Boishakh is approaching. Consider traditional wear purchases for optimal cultural engagement.',
            impact: 'medium',
            actionable: true
          },
          {
            id: 'ai3',
            category: 'optimization',
            title: 'Bundle Opportunity',
            content: 'Customers with similar profiles save 23% on average by purchasing gaming accessories together.',
            impact: 'high',
            actionable: true
          }
        ]
      };

      setTimeout(() => {
        setPersonalizationData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadPersonalizationData();
  }, [userId, productId]);

  const filterRecommendations = (recommendations: ProductRecommendation[]) => {
    switch (activeFilter) {
      case 'high-match':
        return recommendations.filter(r => r.matchScore >= 85);
      case 'cultural':
        return recommendations.filter(r => r.culturalRelevance >= 80);
      case 'trending':
        return recommendations.filter(r => r.badges.includes('Trending') || r.badges.includes('Popular Choice'));
      default:
        return recommendations;
    }
  };

  const ProductCard = ({ product }: { product: ProductRecommendation }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
        />
        <Badge className="absolute top-2 left-2 bg-primary text-white">
          <Brain className="h-3 w-3 mr-1" />
          {product.matchScore}% Match
        </Badge>
        {product.urgency && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white">
            <Zap className="h-3 w-3 mr-1" />
            {product.urgency}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-xs">{product.rating}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3">{product.reason}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Cultural Relevance:</span>
            <Progress value={product.culturalRelevance} className="w-16 h-1" />
          </div>
          
          <div className="flex flex-wrap gap-1">
            {product.badges.slice(0, 2).map((badge) => (
              <Badge key={badge} variant="secondary" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        </div>

        <Button className="w-full mt-3" size="sm">
          <ShoppingCart className="h-3 w-3 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!personalizationData) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Personalization Unavailable</h3>
            <p className="text-muted-foreground">
              AI personalization data is not available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredRecommendations = filterRecommendations(personalizationData.recommendations);

  return (
    <div className={cn('max-w-7xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-500" />
          AI Personalization Engine
        </h1>
        <p className="text-muted-foreground">
          Personalized recommendations powered by advanced AI and cultural intelligence
        </p>
      </div>

      {/* User Profile Summary */}
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {personalizationData.userProfile.behaviorScore}%
              </div>
              <div className="text-sm text-muted-foreground">Behavior Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {personalizationData.userProfile.loyaltyTier}
              </div>
              <div className="text-sm text-muted-foreground">Loyalty Tier</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {personalizationData.userProfile.purchaseHistory}
              </div>
              <div className="text-sm text-muted-foreground">Purchases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {personalizationData.userProfile.browsingSessions}
              </div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Insights & Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personalizationData.aiInsights.map((insight) => (
              <div key={insight.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {insight.category}
                  </Badge>
                  <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'} className="text-xs">
                    {insight.impact} impact
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm mb-2">{insight.title}</h4>
                <p className="text-xs text-muted-foreground">{insight.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Behavior Insights */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Behavior Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalizationData.behaviorInsights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div key={insight.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Icon className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Offers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Personalized Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personalizationData.personalizedOffers.map((offer) => (
              <div key={offer.id} className={cn(
                'p-4 rounded-lg border-2',
                offer.used ? 'border-muted bg-muted/20' : 'border-green-200 bg-green-50'
              )}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{offer.title}</h4>
                  <Badge className={offer.used ? 'bg-muted' : 'bg-green-500'}>
                    {offer.discount}% OFF
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{offer.description}</p>
                <div className="text-xs space-y-1">
                  <div>Valid until: {offer.validUntil}</div>
                  <div>Category: {offer.category}</div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-3" 
                  disabled={offer.used}
                  variant={offer.used ? 'secondary' : 'default'}
                >
                  {offer.used ? 'Used' : 'Apply Offer'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <div className="flex gap-2">
          {(['all', 'high-match', 'cultural', 'trending'] as const).map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
            >
              {filter.replace('-', ' ')}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="ml-auto">
          <Shuffle className="h-4 w-4 mr-2" />
          Refresh Recommendations
        </Button>
      </div>

      {/* Personalized Recommendations */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Recommended For You ({filteredRecommendations.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Similar Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Customers Like You Also Bought
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personalizationData.similarCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Progress value={customer.similarity} className="w-16 h-2" />
                    <span className="text-sm font-medium">{customer.similarity}% similar</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {customer.demographics} • {customer.location}
                  </div>
                  <div className="text-xs mt-1">
                    Also bought: {customer.purchasedItems.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizationEngine;