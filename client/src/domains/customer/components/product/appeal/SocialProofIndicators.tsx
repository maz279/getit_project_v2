/**
 * Phase 3: Appeal Stage - Social Proof Indicators
 * Amazon.com 5 A's Framework Implementation
 * Reviews, Ratings, Sales Data, and Social Validation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { 
  Star, 
  Users, 
  ShoppingCart, 
  Heart, 
  Share2, 
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  MapPin,
  ThumbsUp,
  MessageCircle,
  Camera,
  Shield,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialProofIndicatorsProps {
  productId?: string;
  className?: string;
}

interface SocialProofData {
  overallRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
  recentActivity: RecentActivity;
  verifiedPurchases: number;
  topReviews: Review[];
  socialMetrics: SocialMetrics;
  trustIndicators: TrustIndicator[];
  salesData: SalesData;
}

interface RatingDistribution {
  [key: number]: number;
}

interface RecentActivity {
  purchases24h: number;
  views24h: number;
  wishlistAdds24h: number;
  shares24h: number;
  currentViewers: number;
}

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
    verified: boolean;
    reviewCount: number;
  };
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  images?: string[];
  verified: boolean;
  location: string;
}

interface SocialMetrics {
  totalWishlists: number;
  totalShares: number;
  socialMentions: number;
  influencerEndorsements: number;
}

interface TrustIndicator {
  id: string;
  title: string;
  description: string;
  icon: any;
  verified: boolean;
  color: string;
}

interface SalesData {
  totalSold: number;
  salesRank: number;
  category: string;
  trending: boolean;
  bestSellerBadge: boolean;
}

const SocialProofIndicators: React.FC<SocialProofIndicatorsProps> = ({
  productId,
  className,
}) => {
  const [socialProof, setSocialProof] = useState<SocialProofData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate social proof data loading
    const loadSocialProofData = () => {
      const mockData: SocialProofData = {
        overallRating: 4.7,
        totalReviews: 3247,
        ratingDistribution: {
          5: 78,
          4: 15,
          3: 5,
          2: 1,
          1: 1
        },
        recentActivity: {
          purchases24h: 89,
          views24h: 1247,
          wishlistAdds24h: 156,
          shares24h: 43,
          currentViewers: 24
        },
        verifiedPurchases: 2987,
        topReviews: [
          {
            id: '1',
            user: {
              name: 'Ahmed Rahman',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40',
              verified: true,
              reviewCount: 47
            },
            rating: 5,
            title: 'Outstanding gaming headset - exceeded expectations!',
            content: 'This headset has completely transformed my gaming experience. The sound quality is incredible, especially for competitive gaming. The RGB lighting is a nice touch and the build quality feels premium.',
            date: '2 days ago',
            helpful: 23,
            images: [
              'https://images.unsplash.com/photo-1599669454699-248893623440?w=200'
            ],
            verified: true,
            location: 'Dhaka, Bangladesh'
          },
          {
            id: '2',
            user: {
              name: 'Fatima Khatun',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c371?w=40',
              verified: true,
              reviewCount: 23
            },
            rating: 5,
            title: 'Perfect for work-from-home setup',
            content: 'Bought this for online meetings and it\'s fantastic. Clear microphone, comfortable for long wear, and the noise cancellation really helps in noisy environments.',
            date: '5 days ago',
            helpful: 18,
            verified: true,
            location: 'Chittagong, Bangladesh'
          },
          {
            id: '3',
            user: {
              name: 'Karim Hassan',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40',
              verified: false,
              reviewCount: 12
            },
            rating: 4,
            title: 'Great value for money',
            content: 'Really happy with this purchase. The bass is powerful and the design looks sleek. Only minor complaint is that it can get a bit warm during long sessions.',
            date: '1 week ago',
            helpful: 15,
            verified: false,
            location: 'Sylhet, Bangladesh'
          }
        ],
        socialMetrics: {
          totalWishlists: 12456,
          totalShares: 3847,
          socialMentions: 856,
          influencerEndorsements: 23
        },
        trustIndicators: [
          {
            id: 'verified',
            title: 'Verified Seller',
            description: 'Authorized retailer with 98% positive feedback',
            icon: CheckCircle,
            verified: true,
            color: 'text-green-600'
          },
          {
            id: 'warranty',
            title: 'Official Warranty',
            description: '2 years manufacturer warranty included',
            icon: Shield,
            verified: true,
            color: 'text-blue-600'
          },
          {
            id: 'fast-shipping',
            title: 'Fast Shipping',
            description: 'Express delivery within 24 hours',
            icon: Zap,
            verified: true,
            color: 'text-purple-600'
          },
          {
            id: 'bestseller',
            title: 'Best Seller',
            description: '#1 in Gaming Headsets category',
            icon: Award,
            verified: true,
            color: 'text-yellow-600'
          }
        ],
        salesData: {
          totalSold: 15847,
          salesRank: 1,
          category: 'Gaming Headsets',
          trending: true,
          bestSellerBadge: true
        }
      };

      setTimeout(() => {
        setSocialProof(mockData);
        setLoading(false);
      }, 1000);
    };

    loadSocialProofData();
  }, [productId]);

  const ReviewCard = ({ review }: { review: Review }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={review.user.avatar} />
            <AvatarFallback>{review.user.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">{review.user.name}</span>
              {review.user.verified && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {review.verified && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Verified Purchase
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-3 w-3',
                      star <= review.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-muted-foreground'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{review.date}</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {review.location}
              </div>
            </div>
            
            <h4 className="font-semibold text-sm mb-2">{review.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{review.content}</p>
            
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mb-3">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="Review"
                    className="w-16 h-16 object-cover rounded border"
                  />
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-primary">
                <ThumbsUp className="h-3 w-3" />
                Helpful ({review.helpful})
              </button>
              <button className="flex items-center gap-1 hover:text-primary">
                <MessageCircle className="h-3 w-3" />
                Reply
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!socialProof) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Social Proof Data</h3>
            <p className="text-muted-foreground">
              Social proof information is not available for this product.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Customer Reviews & Social Proof</h1>
        <p className="text-muted-foreground">
          Real feedback from verified customers and social validation metrics
        </p>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold">{socialProof.overallRating}</div>
              <div>
                <div className="flex items-center mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= Math.floor(socialProof.overallRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {socialProof.totalReviews.toLocaleString()} total reviews
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              {Object.entries(socialProof.ratingDistribution)
                .reverse()
                .map(([rating, percentage]) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-6">{rating}★</span>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm w-8">{percentage}%</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Purchased today</span>
                </div>
                <Badge variant="secondary">{socialProof.recentActivity.purchases24h}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Currently viewing</span>
                </div>
                <Badge variant="secondary">{socialProof.recentActivity.currentViewers}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Added to wishlist</span>
                </div>
                <Badge variant="secondary">{socialProof.recentActivity.wishlistAdds24h}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Shared today</span>
                </div>
                <Badge variant="secondary">{socialProof.recentActivity.shares24h}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Indicators */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Trust & Security Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {socialProof.trustIndicators.map((indicator) => {
              const Icon = indicator.icon;
              return (
                <div key={indicator.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Icon className={cn('h-5 w-5', indicator.color)} />
                  <div>
                    <div className="font-semibold text-sm">{indicator.title}</div>
                    <div className="text-xs text-muted-foreground">{indicator.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sales Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Sales Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {socialProof.salesData.totalSold.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Sold</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                #{socialProof.salesData.salesRank}
              </div>
              <div className="text-sm text-muted-foreground">In {socialProof.salesData.category}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {socialProof.socialMetrics.totalWishlists.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Wishlisted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {socialProof.socialMetrics.socialMentions}
              </div>
              <div className="text-sm text-muted-foreground">Social Mentions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Most Helpful Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {socialProof.topReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Button variant="outline">
              View All {socialProof.totalReviews.toLocaleString()} Reviews
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span><strong>3 customers</strong> purchased this item in the last hour</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span><strong>Ahmed from Dhaka</strong> added this to wishlist 2 minutes ago</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span><strong>Fatima from Chittagong</strong> shared this product 5 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialProofIndicators;