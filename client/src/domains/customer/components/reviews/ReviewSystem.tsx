// ReviewSystem.tsx - Amazon.com/Shopee.sg-Level Review System
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, Camera, Video, Award, Shield, CheckCircle, MessageSquare, Filter, SortAsc } from 'lucide-react';

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    totalReviews: number;
  };
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  images: string[];
  videos: string[];
  pros: string[];
  cons: string[];
  tags: string[];
  productVariant?: string;
  recommend: boolean;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  verifiedPurchases: number;
  recommendationRate: number;
}

interface ReviewSystemProps {
  productId: string;
  allowReviews?: boolean;
  showStats?: boolean;
  className?: string;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({
  productId,
  allowReviews = true,
  showStats = true,
  className = ''
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('helpful');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock review data
    const mockReviews: Review[] = [
      {
        id: '1',
        user: {
          name: 'Ahmed Rahman',
          avatar: '/users/ahmed.jpg',
          verified: true,
          level: 'gold',
          totalReviews: 45
        },
        rating: 5,
        title: 'Excellent product, highly recommended!',
        content: 'Amazing quality and fast delivery. The product exceeded my expectations. Great value for money and the customer service was fantastic.',
        date: '2024-01-15',
        verified: true,
        helpful: 23,
        notHelpful: 2,
        images: ['/reviews/review-1-1.jpg', '/reviews/review-1-2.jpg'],
        videos: ['/reviews/review-1-video.mp4'],
        pros: ['Great quality', 'Fast delivery', 'Good value'],
        cons: ['None'],
        tags: ['Quality', 'Delivery', 'Value'],
        productVariant: 'Black - 64GB',
        recommend: true
      },
      {
        id: '2',
        user: {
          name: 'Fatima Khan',
          avatar: '/users/fatima.jpg',
          verified: true,
          level: 'silver',
          totalReviews: 18
        },
        rating: 4,
        title: 'Good product with minor issues',
        content: 'Overall satisfied with the purchase. Some minor quality issues but nothing major. Would buy again.',
        date: '2024-01-10',
        verified: true,
        helpful: 15,
        notHelpful: 3,
        images: ['/reviews/review-2-1.jpg'],
        videos: [],
        pros: ['Good design', 'Easy to use'],
        cons: ['Minor quality issues', 'Packaging could be better'],
        tags: ['Design', 'Usability'],
        productVariant: 'White - 128GB',
        recommend: true
      },
      {
        id: '3',
        user: {
          name: 'Mohammad Ali',
          avatar: '/users/mohammad.jpg',
          verified: false,
          level: 'bronze',
          totalReviews: 3
        },
        rating: 3,
        title: 'Average product',
        content: 'It\'s okay for the price. Not the best quality but acceptable.',
        date: '2024-01-05',
        verified: false,
        helpful: 8,
        notHelpful: 5,
        images: [],
        videos: [],
        pros: ['Affordable'],
        cons: ['Average quality', 'Slow delivery'],
        tags: ['Price', 'Quality'],
        recommend: false
      }
    ];

    const mockStats: ReviewStats = {
      totalReviews: 3,
      averageRating: 4.0,
      ratingDistribution: {
        5: 1,
        4: 1,
        3: 1,
        2: 0,
        1: 0
      },
      verifiedPurchases: 2,
      recommendationRate: 67
    };

    setReviews(mockReviews);
    setStats(mockStats);
    setLoading(false);
  }, [productId]);

  const filteredReviews = reviews.filter(review => {
    if (selectedRating > 0 && review.rating !== selectedRating) return false;
    if (showVerifiedOnly && !review.verified) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'helpful':
        return b.helpful - a.helpful;
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'rating-high':
        return b.rating - a.rating;
      case 'rating-low':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const handleHelpful = (reviewId: string, helpful: boolean) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            helpful: helpful ? review.helpful + 1 : review.helpful,
            notHelpful: !helpful ? review.notHelpful + 1 : review.notHelpful
          }
        : review
    ));
  };

  const getUserLevelColor = (level: string) => {
    switch (level) {
      case 'platinum': return 'text-purple-600';
      case 'gold': return 'text-yellow-600';
      case 'silver': return 'text-gray-500';
      default: return 'text-orange-600';
    }
  };

  const getUserLevelIcon = (level: string) => {
    switch (level) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  if (loading) {
    return (
      <div className={`${className} p-8`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Review Stats */}
      {showStats && stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{stats.averageRating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star}
                    className={`h-5 w-5 ${star <= Math.round(stats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">{stats.totalReviews} reviews</div>
            </div>

            {/* Rating Distribution */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Rating Breakdown</h4>
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{stats.ratingDistribution[rating]}</span>
                </div>
              ))}
            </div>

            {/* Key Metrics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">
                  {((stats.verifiedPurchases / stats.totalReviews) * 100).toFixed(0)}% verified purchases
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">
                  {stats.recommendationRate}% recommend this product
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>All ratings</option>
              {[5, 4, 3, 2, 1].map(rating => (
                <option key={rating} value={rating}>{rating} stars</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="helpful">Most helpful</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="rating-high">Highest rating</option>
              <option value="rating-low">Lowest rating</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showVerifiedOnly}
              onChange={(e) => setShowVerifiedOnly(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Verified purchases only</span>
          </label>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map(review => (
          <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Review Header */}
            <div className="flex items-start gap-4 mb-4">
              <img 
                src={review.user.avatar} 
                alt={review.user.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `/api/placeholder/48/48?text=${review.user.name[0]}`;
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                  {review.user.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                  <span className={`text-sm ${getUserLevelColor(review.user.level)}`}>
                    {getUserLevelIcon(review.user.level)} {review.user.level}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{review.user.totalReviews} reviews</span>
                  <span>{review.date}</span>
                  {review.verified && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Verified Purchase</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rating and Title */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star}
                      className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                {review.productVariant && (
                  <span className="text-sm text-gray-600">• {review.productVariant}</span>
                )}
              </div>
              <h5 className="font-semibold text-gray-900">{review.title}</h5>
            </div>

            {/* Review Content */}
            <p className="text-gray-700 mb-4">{review.content}</p>

            {/* Pros and Cons */}
            {(review.pros.length > 0 || review.cons.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {review.pros.length > 0 && (
                  <div>
                    <h6 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      Pros
                    </h6>
                    <ul className="space-y-1">
                      {review.pros.map((pro, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-1">
                          <span className="text-green-600">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {review.cons.length > 0 && (
                  <div>
                    <h6 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4" />
                      Cons
                    </h6>
                    <ul className="space-y-1">
                      {review.cons.map((con, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-1">
                          <span className="text-red-600">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Media */}
            {(review.images.length > 0 || review.videos.length > 0) && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {review.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`Review image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `/api/placeholder/80/80?text=Image`;
                      }}
                    />
                  ))}
                  {review.videos.map((video, index) => (
                    <div key={index} className="relative w-20 h-20 bg-gray-100 rounded-lg cursor-pointer hover:shadow-md transition-shadow">
                      <Video className="h-8 w-8 text-gray-600 absolute inset-0 m-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {review.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {review.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                {review.recommend ? (
                  <>
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Recommends this product</span>
                  </>
                ) : (
                  <>
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">Does not recommend this product</span>
                  </>
                )}
              </div>
            </div>

            {/* Review Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Was this review helpful?</span>
                <button 
                  onClick={() => handleHelpful(review.id, true)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Yes ({review.helpful})
                </button>
                <button 
                  onClick={() => handleHelpful(review.id, false)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <ThumbsDown className="h-4 w-4" />
                  No ({review.notHelpful})
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Reply
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors">
                  <Flag className="h-4 w-4" />
                  Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Write Review Button */}
      {allowReviews && (
        <div className="mt-8 text-center">
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto">
            <MessageSquare className="h-5 w-5" />
            Write a Review
          </button>
        </div>
      )}

      {/* No Reviews State */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-600">
            {selectedRating > 0 || showVerifiedOnly 
              ? 'Try adjusting your filters to see more reviews'
              : 'Be the first to review this product!'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewSystem;