/**
 * Phase 3: Advocate Stage - Review Incentives
 * Amazon.com 5 A's Framework Implementation
 * Gamified Review System with Rewards
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Progress } from '@/shared/ui/progress';
import { 
  Star, 
  Camera, 
  Gift, 
  Award,
  TrendingUp,
  Users,
  ThumbsUp,
  MessageCircle,
  Upload,
  Crown,
  Zap,
  Target,
  CheckCircle,
  Calendar,
  Clock,
  Eye,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewIncentivesProps {
  productId?: string;
  orderId?: string;
  className?: string;
}

interface ReviewIncentiveData {
  product: ProductInfo;
  reviewProgram: ReviewProgram;
  userProgress: UserProgress;
  availableRewards: Reward[];
  reviewChallenges: ReviewChallenge[];
  leaderboard: LeaderboardEntry[];
  recentReviews: RecentReview[];
  reviewGuidelines: ReviewGuideline[];
}

interface ProductInfo {
  id: string;
  name: string;
  image: string;
  category: string;
  purchaseDate: string;
  canReview: boolean;
  reviewDeadline: string;
  averageRating: number;
  totalReviews: number;
}

interface ReviewProgram {
  currentLevel: number;
  levelName: string;
  nextLevel: number;
  nextLevelName: string;
  progressToNext: number;
  totalReviews: number;
  qualityScore: number;
  helpfulVotes: number;
  perks: string[];
  nextPerks: string[];
}

interface UserProgress {
  reviewsWritten: number;
  photosUploaded: number;
  videosUploaded: number;
  helpfulVotes: number;
  qualityScore: number;
  streak: number;
  badges: string[];
  totalEarnings: number;
}

interface Reward {
  id: string;
  type: 'points' | 'discount' | 'cashback' | 'product' | 'badge';
  title: string;
  description: string;
  value: number;
  requirements: string[];
  timeLimit: string;
  claimed: boolean;
  popular: boolean;
}

interface ReviewChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard';
  deadline: string;
  completed: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  totalReviews: number;
  qualityScore: number;
  helpfulVotes: number;
  badges: string[];
  isCurrentUser?: boolean;
}

interface RecentReview {
  id: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpfulVotes: number;
  hasPhotos: boolean;
  hasVideo: boolean;
  verified: boolean;
}

interface ReviewGuideline {
  id: string;
  category: string;
  title: string;
  description: string;
  example: string;
  points: number;
}

const ReviewIncentives: React.FC<ReviewIncentivesProps> = ({
  productId,
  orderId,
  className,
}) => {
  const [incentiveData, setIncentiveData] = useState<ReviewIncentiveData | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'rewards' | 'challenges' | 'leaderboard'>('write');
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load review incentive data
    const loadIncentiveData = () => {
      const mockData: ReviewIncentiveData = {
        product: {
          id: productId || 'product1',
          name: 'Premium Wireless Gaming Headset',
          image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=300',
          category: 'Gaming Accessories',
          purchaseDate: '2024-12-12',
          canReview: true,
          reviewDeadline: '2024-12-27',
          averageRating: 4.6,
          totalReviews: 1247
        },
        reviewProgram: {
          currentLevel: 3,
          levelName: 'Trusted Reviewer',
          nextLevel: 4,
          nextLevelName: 'Expert Reviewer',
          progressToNext: 75,
          totalReviews: 12,
          qualityScore: 87,
          helpfulVotes: 156,
          perks: [
            'Priority review display',
            '15% bonus points',
            'Early product access',
            'Special reviewer badge'
          ],
          nextPerks: [
            'Product testing invitations',
            '25% bonus points',
            'Exclusive reviewer events',
            'Expert reviewer badge',
            'Direct brand communication'
          ]
        },
        userProgress: {
          reviewsWritten: 12,
          photosUploaded: 8,
          videosUploaded: 2,
          helpfulVotes: 156,
          qualityScore: 87,
          streak: 5,
          badges: ['Quality Reviewer', 'Photo Expert', 'Helpful Contributor'],
          totalEarnings: 2400
        },
        availableRewards: [
          {
            id: 'quality-bonus',
            type: 'points',
            title: 'Quality Review Bonus',
            description: 'Write a detailed review with photos',
            value: 200,
            requirements: ['Minimum 150 words', 'Include photos', '4+ star rating'],
            timeLimit: '15 days',
            claimed: false,
            popular: true
          },
          {
            id: 'photo-reward',
            type: 'points',
            title: 'Photo Upload Reward',
            description: 'Upload 3+ high-quality photos',
            value: 150,
            requirements: ['3+ photos', 'High resolution', 'Clear product shots'],
            timeLimit: '10 days',
            claimed: false,
            popular: false
          },
          {
            id: 'video-bonus',
            type: 'cashback',
            title: 'Video Review Bonus',
            description: 'Create a video review showcasing the product',
            value: 500,
            requirements: ['2+ minute video', 'Clear audio', 'Product demonstration'],
            timeLimit: '20 days',
            claimed: false,
            popular: true
          },
          {
            id: 'early-reviewer',
            type: 'discount',
            title: 'Early Reviewer Discount',
            description: 'Be among first 10 reviewers',
            value: 25,
            requirements: ['Review within 48 hours', 'Minimum 100 words'],
            timeLimit: '2 days',
            claimed: false,
            popular: true
          }
        ],
        reviewChallenges: [
          {
            id: 'december-reviewer',
            title: 'December Review Challenge',
            description: 'Write 5 quality reviews this month',
            target: 5,
            progress: 3,
            reward: '1000 bonus points + Exclusive badge',
            difficulty: 'medium',
            deadline: '2024-12-31',
            completed: false
          },
          {
            id: 'photo-master',
            title: 'Photo Master Challenge',
            description: 'Upload photos with 10 reviews',
            target: 10,
            progress: 8,
            reward: '500 points + Photo Expert badge',
            difficulty: 'easy',
            deadline: '2024-12-25',
            completed: false
          },
          {
            id: 'helpful-reviewer',
            title: 'Helpful Reviewer Challenge',
            description: 'Get 50 helpful votes',
            target: 50,
            progress: 42,
            reward: 'Helpful Contributor badge + 750 points',
            difficulty: 'hard',
            deadline: '2024-12-30',
            completed: false
          }
        ],
        leaderboard: [
          {
            rank: 1,
            name: 'Sarah Ahmed',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c371?w=50',
            totalReviews: 47,
            qualityScore: 96,
            helpfulVotes: 834,
            badges: ['Expert Reviewer', 'Photo Master', 'Video Pro']
          },
          {
            rank: 2,
            name: 'Mohammad Khan',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50',
            totalReviews: 39,
            qualityScore: 94,
            helpfulVotes: 712,
            badges: ['Trusted Reviewer', 'Quality Expert']
          },
          {
            rank: 3,
            name: 'Fatima Rahman',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50',
            totalReviews: 35,
            qualityScore: 92,
            helpfulVotes: 645,
            badges: ['Trusted Reviewer', 'Helpful Contributor']
          },
          {
            rank: 8,
            name: 'Ahmed Rahman (You)',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
            totalReviews: 12,
            qualityScore: 87,
            helpfulVotes: 156,
            badges: ['Quality Reviewer', 'Photo Expert'],
            isCurrentUser: true
          }
        ],
        recentReviews: [
          {
            id: 'review1',
            userName: 'TechGamer_BD',
            rating: 5,
            title: 'Amazing sound quality for gaming!',
            content: 'Been using this headset for 2 weeks now. The sound quality is incredible...',
            date: '2024-12-11',
            helpfulVotes: 23,
            hasPhotos: true,
            hasVideo: false,
            verified: true
          },
          {
            id: 'review2',
            userName: 'AudioLover123',
            rating: 4,
            title: 'Great value for money',
            content: 'Solid build quality and comfortable for long gaming sessions...',
            date: '2024-12-10',
            helpfulVotes: 18,
            hasPhotos: true,
            hasVideo: true,
            verified: true
          }
        ],
        reviewGuidelines: [
          {
            id: 'detailed',
            category: 'Content Quality',
            title: 'Write Detailed Reviews',
            description: 'Share specific details about your experience',
            example: 'The bass response is excellent for gaming, especially in FPS games...',
            points: 50
          },
          {
            id: 'photos',
            category: 'Visual Content',
            title: 'Include High-Quality Photos',
            description: 'Upload clear, well-lit photos of the product',
            example: 'Show the product in use, packaging, accessories...',
            points: 75
          },
          {
            id: 'honest',
            category: 'Authenticity',
            title: 'Be Honest and Balanced',
            description: 'Share both positives and any limitations',
            example: 'Great sound quality, but the headband could be more comfortable...',
            points: 100
          }
        ]
      };

      setTimeout(() => {
        setIncentiveData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadIncentiveData();
  }, [productId, orderId]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedPhotos(prev => [...prev, ...files].slice(0, 5)); // Max 5 photos
  };

  const handleSubmitReview = () => {
    if (!rating || !reviewTitle || !reviewContent) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate potential rewards
    let totalPoints = 100; // Base points
    if (reviewContent.length > 150) totalPoints += 50;
    if (uploadedPhotos.length > 0) totalPoints += 75;
    if (rating >= 4) totalPoints += 25;

    // Simulate review submission
    setTimeout(() => {
      alert(`Review submitted successfully! You earned ${totalPoints} points!`);
      // Reset form
      setRating(0);
      setReviewTitle('');
      setReviewContent('');
      setUploadedPhotos([]);
    }, 1000);
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={cn(
            'p-1 transition-colors',
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          )}
        >
          <Star className="h-6 w-6 fill-current" />
        </button>
      ))}
    </div>
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

  if (!incentiveData) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Review System Unavailable</h3>
            <p className="text-muted-foreground">
              Unable to load review incentive information.
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
          <Star className="h-6 w-6 text-yellow-500" />
          Review & Earn Rewards
        </h1>
        <p className="text-muted-foreground">
          Share your experience and earn points, badges, and exclusive rewards
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {incentiveData.userProgress.reviewsWritten}
            </div>
            <div className="text-sm text-muted-foreground">Reviews Written</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <ThumbsUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {incentiveData.userProgress.helpfulVotes}
            </div>
            <div className="text-sm text-muted-foreground">Helpful Votes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {incentiveData.userProgress.qualityScore}%
            </div>
            <div className="text-sm text-muted-foreground">Quality Score</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              ৳{incentiveData.userProgress.totalEarnings}
            </div>
            <div className="text-sm text-muted-foreground">Total Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {(['write', 'rewards', 'challenges', 'leaderboard'] as const).map((tab) => (
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
              {tab === 'write' && 'Write Review'}
              {tab === 'rewards' && 'Available Rewards'}
              {tab === 'challenges' && 'Challenges'}
              {tab === 'leaderboard' && 'Leaderboard'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'write' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Write Your Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <img
                    src={incentiveData.product.image}
                    alt={incentiveData.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{incentiveData.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Purchased on {incentiveData.product.purchaseDate}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{incentiveData.product.averageRating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({incentiveData.product.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2">Overall Rating *</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">Review Title *</label>
                  <Input
                    placeholder="Summarize your experience in a few words"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                  />
                </div>

                {/* Review Content */}
                <div>
                  <label className="block text-sm font-medium mb-2">Your Review *</label>
                  <Textarea
                    placeholder="Share details about your experience with this product. What did you like? Any limitations? How does it perform?"
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="min-h-32"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground">
                      {reviewContent.length}/500 characters
                    </span>
                    {reviewContent.length >= 150 && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        +50 bonus points for detailed review
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Add Photos (Optional)</label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload photos of the product to earn bonus points
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Camera className="h-4 w-4 mr-2" />
                        Choose Photos
                      </label>
                    </Button>
                  </div>
                  {uploadedPhotos.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {uploadedPhotos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Upload ${index + 1}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </div>
                        ))}
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 text-xs mt-2">
                        +75 bonus points for photos
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitReview}
                  className="w-full"
                  disabled={!rating || !reviewTitle || !reviewContent}
                >
                  Submit Review & Earn Points
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Reviewer Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Reviewer Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold">{incentiveData.reviewProgram.levelName}</div>
                  <div className="text-sm text-muted-foreground">Level {incentiveData.reviewProgram.currentLevel}</div>
                </div>
                <Progress value={incentiveData.reviewProgram.progressToNext} className="mb-4" />
                <div className="text-center text-sm text-muted-foreground mb-4">
                  {100 - incentiveData.reviewProgram.progressToNext}% to {incentiveData.reviewProgram.nextLevelName}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Current Perks:</h4>
                  {incentiveData.reviewProgram.perks.slice(0, 3).map((perk) => (
                    <div key={perk} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {perk}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Review Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Review Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incentiveData.reviewGuidelines.map((guideline) => (
                    <div key={guideline.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{guideline.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          +{guideline.points} pts
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{guideline.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Available Rewards</h2>
            <p className="text-muted-foreground">
              Complete review activities to unlock these exclusive rewards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incentiveData.availableRewards.map((reward) => (
              <Card key={reward.id} className={cn(
                'hover:shadow-lg transition-shadow',
                reward.popular && 'ring-2 ring-orange-200 bg-orange-50'
              )}>
                {reward.popular && (
                  <Badge className="absolute -top-2 left-4 bg-orange-500 text-white">
                    <Zap className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                <CardContent className="p-4 pt-6">
                  <div className="text-center mb-4">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2',
                      reward.type === 'points' && 'bg-blue-100',
                      reward.type === 'discount' && 'bg-green-100',
                      reward.type === 'cashback' && 'bg-purple-100'
                    )}>
                      {reward.type === 'points' && <Star className="h-6 w-6 text-blue-600" />}
                      {reward.type === 'discount' && <Gift className="h-6 w-6 text-green-600" />}
                      {reward.type === 'cashback' && <Award className="h-6 w-6 text-purple-600" />}
                    </div>
                    <h3 className="font-semibold">{reward.title}</h3>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-primary">
                      {reward.value} {reward.type === 'points' ? 'pts' : 
                       reward.type === 'discount' ? '% off' : 'BDT'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Valid for {reward.timeLimit}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-sm">Requirements:</h4>
                    {reward.requirements.map((req) => (
                      <div key={req} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {req}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={reward.claimed}
                    variant={reward.claimed ? 'secondary' : 'default'}
                  >
                    {reward.claimed ? 'Claimed' : 'Claim Reward'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Review Challenges</h2>
            <p className="text-muted-foreground">
              Complete challenges to earn exclusive badges and bonus rewards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {incentiveData.reviewChallenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge variant={
                      challenge.difficulty === 'easy' ? 'secondary' :
                      challenge.difficulty === 'medium' ? 'default' : 'destructive'
                    }>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.target}</span>
                    </div>
                    <Progress value={(challenge.progress / challenge.target) * 100} />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Ends {challenge.deadline}</span>
                    </div>
                    <div className="font-medium text-primary">{challenge.reward}</div>
                  </div>
                  
                  {challenge.completed && (
                    <Badge className="w-full mt-3 bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed!
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Top Reviewers</h2>
            <p className="text-muted-foreground">
              See how you rank among our community of reviewers
            </p>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {incentiveData.leaderboard.map((entry) => (
                  <div key={entry.rank} className={cn(
                    'flex items-center gap-4 p-4 border-b last:border-b-0',
                    entry.isCurrentUser && 'bg-blue-50 border-blue-200'
                  )}>
                    <div className="text-center w-8">
                      <div className={cn(
                        'font-bold text-lg',
                        entry.rank <= 3 && 'text-yellow-600'
                      )}>
                        #{entry.rank}
                      </div>
                    </div>
                    
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-12 h-12 rounded-full"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{entry.name}</h3>
                        {entry.isCurrentUser && (
                          <Badge className="bg-blue-100 text-blue-700">You</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.badges.slice(0, 2).map((badge) => (
                          <Badge key={badge} variant="outline" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">{entry.totalReviews} reviews</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.qualityScore}% quality • {entry.helpfulVotes} helpful
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReviewIncentives;