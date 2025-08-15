/**
 * Phase 3: Advocate Stage - Post Purchase Engagement
 * Amazon.com 5 A's Framework Implementation
 * Complete Post-Purchase Customer Journey
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Heart, 
  Star, 
  Share2, 
  MessageCircle,
  Gift,
  Award,
  TrendingUp,
  Users,
  ShoppingCart,
  Calendar,
  Clock,
  CheckCircle,
  Package,
  ThumbsUp,
  Camera,
  Smartphone,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostPurchaseEngagementProps {
  orderId?: string;
  customerId?: string;
  className?: string;
}

interface EngagementData {
  order: OrderInfo;
  customer: CustomerProfile;
  engagementTasks: EngagementTask[];
  socialOpportunities: SocialOpportunity[];
  personalizedOffers: PersonalizedOffer[];
  loyaltyProgress: LoyaltyProgress;
  productRecommendations: ProductRecommendation[];
  milestones: Milestone[];
}

interface OrderInfo {
  id: string;
  status: string;
  deliveredAt?: string;
  items: OrderItem[];
  value: number;
  satisfactionScore?: number;
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  reviewed: boolean;
  canReview: boolean;
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  loyaltyTier: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  lastActive: string;
  preferences: string[];
}

interface EngagementTask {
  id: string;
  type: 'review' | 'photo' | 'share' | 'refer' | 'feedback';
  title: string;
  description: string;
  reward: number;
  rewardType: 'points' | 'discount' | 'cashback';
  deadline: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
}

interface SocialOpportunity {
  id: string;
  platform: string;
  type: 'share' | 'review' | 'unboxing' | 'recommendation';
  content: string;
  potential_reach: number;
  reward: number;
  trending: boolean;
}

interface PersonalizedOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
  category: string;
  validUntil: string;
  minimumSpend?: number;
  exclusive: boolean;
}

interface LoyaltyProgress {
  currentTier: string;
  nextTier: string;
  pointsEarned: number;
  pointsToNext: number;
  progressPercentage: number;
  benefits: string[];
  nextBenefits: string[];
}

interface ProductRecommendation {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  reason: string;
  matchScore: number;
  category: string;
  inStock: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: string;
  reward: string;
  progress: number;
  target: number;
}

const PostPurchaseEngagement: React.FC<PostPurchaseEngagementProps> = ({
  orderId,
  customerId,
  className,
}) => {
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'social' | 'rewards'>('overview');
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load post-purchase engagement data
    const loadEngagementData = () => {
      const mockData: EngagementData = {
        order: {
          id: orderId || 'GT2025-0001',
          status: 'delivered',
          deliveredAt: '2024-12-12',
          items: [
            {
              id: 'item1',
              name: 'Premium Wireless Gaming Headset',
              image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=300',
              category: 'Electronics',
              price: 12500,
              reviewed: false,
              canReview: true
            }
          ],
          value: 12500,
          satisfactionScore: undefined
        },
        customer: {
          id: customerId || 'customer1',
          name: 'Ahmed Rahman',
          email: 'ahmed@example.com',
          loyaltyTier: 'Gold',
          totalOrders: 23,
          totalSpent: 245000,
          joinDate: '2023-05-15',
          lastActive: '2024-12-13',
          preferences: ['Gaming', 'Electronics', 'Tech Reviews']
        },
        engagementTasks: [
          {
            id: 'review-product',
            type: 'review',
            title: 'Share Your Product Experience',
            description: 'Write a detailed review of your gaming headset to help other customers',
            reward: 100,
            rewardType: 'points',
            deadline: '2024-12-20',
            completed: false,
            priority: 'high',
            estimatedTime: 5
          },
          {
            id: 'upload-photo',
            type: 'photo',
            title: 'Show Off Your Setup',
            description: 'Upload a photo of your gaming setup with the new headset',
            reward: 150,
            rewardType: 'points',
            deadline: '2024-12-25',
            completed: false,
            priority: 'medium',
            estimatedTime: 3
          },
          {
            id: 'share-experience',
            type: 'share',
            title: 'Share on Social Media',
            description: 'Share your purchase experience on Facebook or Instagram',
            reward: 200,
            rewardType: 'points',
            deadline: '2024-12-30',
            completed: false,
            priority: 'medium',
            estimatedTime: 2
          },
          {
            id: 'refer-friend',
            type: 'refer',
            title: 'Refer a Gaming Friend',
            description: 'Invite friends who might be interested in gaming gear',
            reward: 500,
            rewardType: 'cashback',
            deadline: '2024-12-31',
            completed: false,
            priority: 'high',
            estimatedTime: 1
          },
          {
            id: 'product-feedback',
            type: 'feedback',
            title: 'Detailed Product Feedback',
            description: 'Provide detailed feedback about product quality and features',
            reward: 75,
            rewardType: 'points',
            deadline: '2024-12-18',
            completed: false,
            priority: 'low',
            estimatedTime: 10
          }
        ],
        socialOpportunities: [
          {
            id: 'facebook-share',
            platform: 'Facebook',
            type: 'share',
            content: 'Just got my new gaming headset from GetIt! Amazing sound quality! 🎧',
            potential_reach: 250,
            reward: 150,
            trending: true
          },
          {
            id: 'instagram-unboxing',
            platform: 'Instagram',
            type: 'unboxing',
            content: 'Unboxing my premium gaming headset - the packaging is incredible!',
            potential_reach: 500,
            reward: 300,
            trending: false
          },
          {
            id: 'youtube-review',
            platform: 'YouTube',
            type: 'review',
            content: 'Full review: Is this ৳12,500 gaming headset worth it?',
            potential_reach: 1000,
            reward: 1000,
            trending: true
          }
        ],
        personalizedOffers: [
          {
            id: 'gaming-accessories',
            title: '25% Off Gaming Accessories',
            description: 'Complete your gaming setup with matching accessories',
            discount: 25,
            category: 'Gaming',
            validUntil: '2024-12-31',
            minimumSpend: 2000,
            exclusive: true
          },
          {
            id: 'electronics-bundle',
            title: 'Electronics Bundle Deal',
            description: 'Buy 2 electronics items and save extra 15%',
            discount: 15,
            category: 'Electronics',
            validUntil: '2024-12-25',
            minimumSpend: 5000,
            exclusive: false
          }
        ],
        loyaltyProgress: {
          currentTier: 'Gold',
          nextTier: 'Platinum',
          pointsEarned: 2450,
          pointsToNext: 550,
          progressPercentage: 82,
          benefits: [
            'Free Express Shipping',
            'Priority Customer Support',
            '5% Cashback on All Orders',
            'Early Access to Sales'
          ],
          nextBenefits: [
            'Free Same-Day Delivery',
            'Dedicated Account Manager',
            '10% Cashback on All Orders',
            'Exclusive Product Access',
            'Annual VIP Gift'
          ]
        },
        productRecommendations: [
          {
            id: 'gaming-mouse',
            name: 'RGB Gaming Mouse',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
            price: 4200,
            originalPrice: 6000,
            reason: 'Perfect companion for your gaming headset',
            matchScore: 94,
            category: 'Gaming Accessories',
            inStock: true
          },
          {
            id: 'gaming-keyboard',
            name: 'Mechanical Gaming Keyboard',
            image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300',
            price: 8500,
            originalPrice: 12000,
            reason: 'Complete your professional gaming setup',
            matchScore: 91,
            category: 'Gaming Accessories',
            inStock: true
          }
        ],
        milestones: [
          {
            id: 'first-review',
            title: 'First Product Review',
            description: 'Write your first product review',
            achieved: false,
            reward: '100 Loyalty Points',
            progress: 0,
            target: 1
          },
          {
            id: 'social-sharer',
            title: 'Social Media Influencer',
            description: 'Share 5 purchases on social media',
            achieved: false,
            reward: 'Exclusive Discount Codes',
            progress: 2,
            target: 5
          },
          {
            id: 'loyal-customer',
            title: 'Loyal Customer',
            description: 'Complete 25 orders',
            achieved: false,
            reward: 'Platinum Tier Upgrade',
            progress: 23,
            target: 25
          }
        ]
      };

      setTimeout(() => {
        setEngagementData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadEngagementData();
  }, [orderId, customerId]);

  const handleTaskComplete = (taskId: string) => {
    setCompletedTasks(prev => new Set([...prev, taskId]));
    
    // Simulate API call to complete task
    setTimeout(() => {
      alert('Task completed! Points have been added to your account.');
    }, 500);
  };

  const TaskCard = ({ task }: { task: EngagementTask }) => (
    <Card className={cn(
      'transition-all hover:shadow-lg',
      completedTasks.has(task.id) && 'bg-green-50 border-green-200',
      task.priority === 'high' && 'border-l-4 border-l-orange-500'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              task.type === 'review' && 'bg-blue-100',
              task.type === 'photo' && 'bg-purple-100',
              task.type === 'share' && 'bg-green-100',
              task.type === 'refer' && 'bg-orange-100',
              task.type === 'feedback' && 'bg-yellow-100'
            )}>
              {task.type === 'review' && <Star className="h-5 w-5 text-blue-600" />}
              {task.type === 'photo' && <Camera className="h-5 w-5 text-purple-600" />}
              {task.type === 'share' && <Share2 className="h-5 w-5 text-green-600" />}
              {task.type === 'refer' && <Users className="h-5 w-5 text-orange-600" />}
              {task.type === 'feedback' && <MessageCircle className="h-5 w-5 text-yellow-600" />}
            </div>
            <div>
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-muted-foreground">{task.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.estimatedTime} min
                </span>
                <span>Due: {task.deadline}</span>
              </div>
            </div>
          </div>
          <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
            {task.priority}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {task.reward} {task.rewardType === 'points' ? 'pts' : task.rewardType}
            </span>
          </div>
          
          {completedTasks.has(task.id) ? (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          ) : (
            <Button 
              size="sm" 
              onClick={() => handleTaskComplete(task.id)}
            >
              Complete Task
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!engagementData) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Engagement Data Unavailable</h3>
            <p className="text-muted-foreground">
              Unable to load post-purchase engagement information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-6xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          Post-Purchase Experience
        </h1>
        <p className="text-muted-foreground">
          Thank you for your purchase! Let's make the most of your experience.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {engagementData.loyaltyProgress.pointsEarned}
            </div>
            <div className="text-sm text-muted-foreground">Loyalty Points</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {engagementData.customer.totalOrders}
            </div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {engagementData.engagementTasks.filter(t => !t.completed).length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Tasks</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              ৳{engagementData.customer.totalSpent.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {(['overview', 'tasks', 'social', 'rewards'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm capitalize',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Your Recent Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                {engagementData.order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <div className="text-primary font-bold">৳{item.price.toLocaleString()}</div>
                    </div>
                    {item.canReview && !item.reviewed && (
                      <Button size="sm">
                        <Star className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="h-16 flex flex-col gap-1">
                    <Star className="h-5 w-5" />
                    <span className="text-sm">Write Review</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-1">
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm">Share Purchase</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-1">
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Refer Friends</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-1">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-sm">Buy Again</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Loyalty Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Loyalty Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold">{engagementData.loyaltyProgress.currentTier}</div>
                  <div className="text-sm text-muted-foreground">
                    {engagementData.loyaltyProgress.pointsToNext} points to {engagementData.loyaltyProgress.nextTier}
                  </div>
                </div>
                <Progress value={engagementData.loyaltyProgress.progressPercentage} className="mb-4" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Current Benefits:</h4>
                  {engagementData.loyaltyProgress.benefits.slice(0, 3).map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personalized Offers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Exclusive Offers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {engagementData.personalizedOffers.map((offer) => (
                    <div key={offer.id} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{offer.title}</h4>
                        {offer.exclusive && (
                          <Badge className="bg-orange-500 text-white text-xs">Exclusive</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{offer.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-green-600">{offer.discount}% OFF</span>
                        <Button size="sm">Use Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Engagement Tasks</h2>
            <div className="text-sm text-muted-foreground">
              Complete tasks to earn rewards and unlock benefits
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {engagementData.engagementTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Share Your Experience</h2>
            <p className="text-muted-foreground">
              Share your purchase on social media and earn rewards while helping others discover great products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {engagementData.socialOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Share2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">{opportunity.platform}</h3>
                    {opportunity.trending && (
                      <Badge className="bg-orange-500 text-white text-xs">Trending</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{opportunity.content}</p>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span>Potential reach: {opportunity.potential_reach.toLocaleString()}</span>
                    <span className="font-bold text-primary">{opportunity.reward} points</span>
                  </div>
                  <Button className="w-full">Share Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Achievement Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-start gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        milestone.achieved ? 'bg-green-100' : 'bg-gray-100'
                      )}>
                        {milestone.achieved ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Award className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={(milestone.progress / milestone.target) * 100} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {milestone.progress}/{milestone.target}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-primary mt-1">
                          Reward: {milestone.reward}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData.productRecommendations.map((product) => (
                    <div key={product.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">{product.reason}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-primary">
                            ৳{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Badge className="text-xs mt-1 bg-blue-100 text-blue-700">
                          {product.matchScore}% match
                        </Badge>
                      </div>
                      <Button size="sm">Add to Cart</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPurchaseEngagement;