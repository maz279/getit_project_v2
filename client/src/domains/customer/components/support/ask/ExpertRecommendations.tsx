/**
 * Phase 3: Ask Stage - Expert Recommendations
 * Amazon.com 5 A's Framework Implementation
 * AI-Powered Expert Product Recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { 
  UserCheck, 
  Award, 
  Star, 
  ThumbsUp, 
  MessageCircle,
  TrendingUp,
  Brain,
  Target,
  CheckCircle,
  Eye,
  Clock,
  Zap,
  Users,
  Sparkles,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpertRecommendationsProps {
  productId?: string;
  categoryId?: string;
  className?: string;
}

interface Expert {
  id: string;
  name: string;
  title: string;
  avatar: string;
  expertise: string[];
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  verified: boolean;
  credentials: string[];
  specialties: string[];
}

interface ExpertRecommendation {
  id: string;
  expert: Expert;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  recommendationText: string;
  reasoning: string[];
  prosConsAnalysis: {
    pros: string[];
    cons: string[];
  };
  confidenceScore: number;
  categoryRank: number;
  alternatives: Alternative[];
  useCases: string[];
  targetAudience: string;
  createdAt: string;
  helpfulVotes: number;
  totalVotes: number;
}

interface Alternative {
  id: string;
  name: string;
  price: number;
  image: string;
  reason: string;
  comparison: string;
}

interface ExpertCategory {
  id: string;
  name: string;
  description: string;
  expertCount: number;
  icon: any;
  color: string;
}

const ExpertRecommendations: React.FC<ExpertRecommendationsProps> = ({
  productId,
  categoryId,
  className,
}) => {
  const [recommendations, setRecommendations] = useState<ExpertRecommendation[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [categories, setCategories] = useState<ExpertCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExpert, setSelectedExpert] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'helpful' | 'recent'>('confidence');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load expert recommendations data
    const loadExpertData = () => {
      const mockExperts: Expert[] = [
        {
          id: 'expert1',
          name: 'Dr. Ahmed Rahman',
          title: 'Technology Consultant',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          expertise: ['Electronics', 'Gaming', 'Mobile Technology'],
          rating: 4.9,
          reviewCount: 1247,
          yearsExperience: 12,
          verified: true,
          credentials: ['PhD Computer Science', 'Tech Industry Expert', 'Product Review Specialist'],
          specialties: ['Gaming Hardware', 'Audio Equipment', 'Mobile Devices']
        },
        {
          id: 'expert2',
          name: 'Fatima Hassan',
          title: 'Fashion & Lifestyle Expert',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c371?w=100',
          expertise: ['Fashion', 'Traditional Wear', 'Lifestyle'],
          rating: 4.8,
          reviewCount: 856,
          yearsExperience: 8,
          verified: true,
          credentials: ['Fashion Design Degree', 'Cultural Heritage Specialist', 'Style Consultant'],
          specialties: ['Bengali Traditional Wear', 'Festival Fashion', 'Cultural Clothing']
        },
        {
          id: 'expert3',
          name: 'Mohammad Karim',
          title: 'Home & Kitchen Specialist',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          expertise: ['Home Appliances', 'Kitchen Tools', 'Smart Home'],
          rating: 4.7,
          reviewCount: 634,
          yearsExperience: 10,
          verified: true,
          credentials: ['Mechanical Engineering', 'Home Automation Expert', 'Energy Efficiency Consultant'],
          specialties: ['Kitchen Appliances', 'Smart Home Systems', 'Energy Efficient Devices']
        }
      ];

      const mockCategories: ExpertCategory[] = [
        {
          id: 'electronics',
          name: 'Electronics & Gaming',
          description: 'Expert advice on tech products and gaming gear',
          expertCount: 15,
          icon: Zap,
          color: 'bg-blue-500'
        },
        {
          id: 'fashion',
          name: 'Fashion & Cultural',
          description: 'Traditional and modern fashion expertise',
          expertCount: 12,
          icon: Sparkles,
          color: 'bg-pink-500'
        },
        {
          id: 'home',
          name: 'Home & Kitchen',
          description: 'Home improvement and kitchen appliance guidance',
          expertCount: 8,
          icon: Users,
          color: 'bg-green-500'
        }
      ];

      const mockRecommendations: ExpertRecommendation[] = [
        {
          id: 'rec1',
          expert: mockExperts[0],
          productId: 'prod1',
          productName: 'Premium Wireless Gaming Headset',
          productImage: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=300',
          productPrice: 12500,
          recommendationText: 'After extensive testing, this headset delivers exceptional audio quality for both gaming and professional use. The build quality is outstanding, and the feature set justifies the premium price point.',
          reasoning: [
            'Superior 7.1 surround sound technology',
            'Exceptional battery life (50+ hours)',
            'Professional-grade microphone quality',
            'Comfortable for extended gaming sessions',
            'Wide platform compatibility'
          ],
          prosConsAnalysis: {
            pros: [
              'Outstanding audio clarity and bass response',
              'Excellent noise cancellation performance',
              'Durable construction with premium materials',
              'Intuitive controls and user-friendly design',
              'Strong brand support and warranty coverage'
            ],
            cons: [
              'Premium pricing may not suit all budgets',
              'Slightly heavier than some competitors',
              'RGB lighting affects battery life when active'
            ]
          },
          confidenceScore: 95,
          categoryRank: 1,
          alternatives: [
            {
              id: 'alt1',
              name: 'Budget Gaming Headset',
              price: 4500,
              image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200',
              reason: 'Budget-friendly option',
              comparison: 'Good value but lacks premium features'
            },
            {
              id: 'alt2',
              name: 'Professional Studio Headphones',
              price: 22000,
              image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200',
              reason: 'Professional audio production',
              comparison: 'Better for music production, not gaming-focused'
            }
          ],
          useCases: [
            'Competitive gaming tournaments',
            'Content creation and streaming',
            'Professional audio work',
            'Long gaming sessions',
            'Multi-platform gaming'
          ],
          targetAudience: 'Serious gamers, content creators, and audio enthusiasts willing to invest in premium quality',
          createdAt: '2024-12-10',
          helpfulVotes: 234,
          totalVotes: 267
        },
        {
          id: 'rec2',
          expert: mockExperts[1],
          productId: 'prod2',
          productName: 'Traditional Bengali Silk Saree',
          productImage: 'https://images.unsplash.com/photo-1610030469036-12993ce8c2c2?w=300',
          productPrice: 8500,
          recommendationText: 'This saree represents the finest tradition of Bengali craftsmanship. The silk quality is exceptional, and the handwoven patterns showcase authentic cultural heritage. Perfect for special occasions and cultural celebrations.',
          reasoning: [
            'Authentic handwoven Bengali craftsmanship',
            'Premium silk quality with natural sheen',
            'Traditional motifs with cultural significance',
            'Versatile styling for various occasions',
            'Supporting local artisan communities'
          ],
          prosConsAnalysis: {
            pros: [
              'Authentic cultural heritage piece',
              'Premium quality silk fabric',
              'Unique handwoven patterns',
              'Excellent drape and fall',
              'Investment piece that retains value'
            ],
            cons: [
              'Requires special care and maintenance',
              'Higher price point for premium quality',
              'Limited occasions for wearing'
            ]
          },
          confidenceScore: 92,
          categoryRank: 2,
          alternatives: [
            {
              id: 'alt3',
              name: 'Cotton Handloom Saree',
              price: 3500,
              image: 'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=200',
              reason: 'More affordable traditional option',
              comparison: 'Good quality but less luxurious than silk'
            }
          ],
          useCases: [
            'Wedding ceremonies and receptions',
            'Cultural festivals and celebrations',
            'Special family gatherings',
            'Traditional photography sessions',
            'Cultural events and performances'
          ],
          targetAudience: 'Women who appreciate traditional Bengali culture and invest in authentic heritage pieces',
          createdAt: '2024-12-08',
          helpfulVotes: 189,
          totalVotes: 205
        },
        {
          id: 'rec3',
          expert: mockExperts[2],
          productId: 'prod3',
          productName: 'Smart Rice Cooker with App Control',
          productImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300',
          productPrice: 15000,
          recommendationText: 'This smart rice cooker revolutionizes traditional cooking with precise temperature control and app connectivity. Perfect for busy families who want restaurant-quality rice with minimal effort.',
          reasoning: [
            'Precise temperature and timing control',
            'Multiple cooking modes for different rice types',
            'App control for remote monitoring',
            'Energy efficient operation',
            'Easy cleaning and maintenance'
          ],
          prosConsAnalysis: {
            pros: [
              'Consistently perfect rice every time',
              'Smart features enhance convenience',
              'Energy efficient compared to traditional methods',
              'Large capacity suitable for families',
              'Durable construction with warranty'
            ],
            cons: [
              'Higher initial investment than basic models',
              'Requires smartphone app for full functionality',
              'May be complex for users preferring simple appliances'
            ]
          },
          confidenceScore: 88,
          categoryRank: 1,
          alternatives: [
            {
              id: 'alt4',
              name: 'Traditional Rice Cooker',
              price: 3500,
              image: 'https://images.unsplash.com/photo-1574782296055-08e8b4b8d8d8?w=200',
              reason: 'Simple and affordable option',
              comparison: 'Basic functionality without smart features'
            }
          ],
          useCases: [
            'Daily family meal preparation',
            'Busy professionals needing convenience',
            'Tech-savvy households',
            'Large family cooking',
            'Entertaining guests'
          ],
          targetAudience: 'Modern families who value convenience and technology in their kitchen appliances',
          createdAt: '2024-12-05',
          helpfulVotes: 156,
          totalVotes: 178
        }
      ];

      setTimeout(() => {
        setExperts(mockExperts);
        setCategories(mockCategories);
        setRecommendations(mockRecommendations);
        setLoading(false);
      }, 1000);
    };

    loadExpertData();
  }, [productId, categoryId]);

  const sortRecommendations = (recommendations: ExpertRecommendation[]) => {
    switch (sortBy) {
      case 'helpful':
        return [...recommendations].sort((a, b) => (b.helpfulVotes / b.totalVotes) - (a.helpfulVotes / a.totalVotes));
      case 'recent':
        return [...recommendations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return [...recommendations].sort((a, b) => b.confidenceScore - a.confidenceScore);
    }
  };

  const filterRecommendations = (recommendations: ExpertRecommendation[]) => {
    let filtered = recommendations;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(rec => 
        rec.expert.expertise.some(exp => exp.toLowerCase().includes(selectedCategory))
      );
    }
    
    if (selectedExpert !== 'all') {
      filtered = filtered.filter(rec => rec.expert.id === selectedExpert);
    }
    
    return sortRecommendations(filtered);
  };

  const RecommendationCard = ({ recommendation }: { recommendation: ExpertRecommendation }) => {
    const helpfulPercentage = (recommendation.helpfulVotes / recommendation.totalVotes) * 100;
    
    return (
      <Card className="mb-6 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={recommendation.expert.avatar} />
              <AvatarFallback>{recommendation.expert.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">{recommendation.expert.name}</h3>
                {recommendation.expert.verified && (
                  <Badge className="bg-blue-100 text-blue-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Expert
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  Rank #{recommendation.categoryRank}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{recommendation.expert.title}</p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span>{recommendation.expert.rating}</span>
                  <span>({recommendation.expert.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span>{recommendation.expert.yearsExperience} years experience</span>
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  <span>{recommendation.confidenceScore}% confidence</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product */}
            <div>
              <img
                src={recommendation.productImage}
                alt={recommendation.productName}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <h4 className="font-semibold mb-2">{recommendation.productName}</h4>
              <p className="text-xl font-bold text-primary mb-2">
                ৳{recommendation.productPrice.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View Product
                </Button>
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Ask Expert
                </Button>
              </div>
            </div>
            
            {/* Recommendation */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Expert Recommendation</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {recommendation.recommendationText}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="font-medium text-sm mb-2 text-green-600">Pros</h5>
                  <ul className="space-y-1">
                    {recommendation.prosConsAnalysis.pros.slice(0, 3).map((pro, index) => (
                      <li key={index} className="flex items-start gap-1 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-sm mb-2 text-red-600">Cons</h5>
                  <ul className="space-y-1">
                    {recommendation.prosConsAnalysis.cons.slice(0, 3).map((con, index) => (
                      <li key={index} className="flex items-start gap-1 text-xs">
                        <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="font-medium text-sm mb-2">Best For</h5>
                <p className="text-xs text-muted-foreground">{recommendation.targetAudience}</p>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{recommendation.helpfulVotes}/{recommendation.totalVotes}</span>
                    <span className="text-muted-foreground">({helpfulPercentage.toFixed(0)}% helpful)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{recommendation.createdAt}</span>
                  </div>
                </div>
                
                <Button size="sm" variant="outline">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Helpful
                </Button>
              </div>
            </div>
          </div>
          
          {/* Alternatives */}
          {recommendation.alternatives.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h5 className="font-medium text-sm mb-3">Expert Also Suggests</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendation.alternatives.map((alt) => (
                  <div key={alt.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <img
                      src={alt.image}
                      alt={alt.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h6 className="font-medium text-sm">{alt.name}</h6>
                      <p className="text-xs text-muted-foreground">{alt.reason}</p>
                      <p className="text-sm font-bold text-primary">৳{alt.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredRecommendations = filterRecommendations(recommendations);

  return (
    <div className={cn('max-w-6xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-purple-500" />
          Expert Product Recommendations
        </h1>
        <p className="text-muted-foreground">
          Get professional advice from verified experts in their respective fields
        </p>
      </div>

      {/* Expert Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card 
              key={category.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-lg',
                selectedCategory === category.id && 'ring-2 ring-primary'
              )}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={cn('w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center', category.color)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                <Badge variant="outline">{category.expertCount} experts</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Sort */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <select
              value={selectedExpert}
              onChange={(e) => setSelectedExpert(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Experts</option>
              {experts.map((expert) => (
                <option key={expert.id} value={expert.id}>{expert.name}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="confidence">Highest Confidence</option>
              <option value="helpful">Most Helpful</option>
              <option value="recent">Most Recent</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedExpert('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expert Statistics */}
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{experts.length}</div>
              <div className="text-sm text-muted-foreground">Verified Experts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
              <div className="text-sm text-muted-foreground">Recommendations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-muted-foreground">Avg Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">4.8★</div>
              <div className="text-sm text-muted-foreground">Expert Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Expert Recommendations ({filteredRecommendations.length})
          </h2>
        </div>
        
        {filteredRecommendations.length > 0 ? (
          <div>
            {filteredRecommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Recommendations Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or browse different categories
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExpertRecommendations;