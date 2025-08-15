// ReviewCenter.tsx - Amazon.com/Shopee.sg-Level Review Management Center
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Camera, Video, MessageSquare, Award, TrendingUp, Filter, Search, Edit, Trash2, Eye, Share2 } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  title: string;
  content: string;
  date: Date;
  verified: boolean;
  helpful: number;
  images: string[];
  videos: string[];
  status: 'published' | 'pending' | 'rejected';
  category: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  helpfulVotes: number;
  rankPoints: number;
  badge: string;
  nextBadge: string;
  reviewsToNext: number;
}

const ReviewCenter: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useSEO({
    title: 'Review Center - Manage Your Product Reviews | GetIt Bangladesh',
    description: 'Manage all your product reviews, track your reviewer status, earn review badges, and help other customers make informed decisions.',
    keywords: 'product reviews, review management, customer feedback, reviewer badges, product ratings'
  });

  useEffect(() => {
    // Mock review data
    const mockReviews: Review[] = [
      {
        id: 'rev-1',
        productId: 'prod-1',
        productName: 'Samsung Galaxy A54 5G',
        productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        rating: 5,
        title: 'Excellent phone with great camera quality',
        content: 'I\'ve been using this phone for 3 months now and I\'m really impressed with the camera quality, especially in low light. The battery lasts a full day with heavy usage. The build quality feels premium despite being in the mid-range category. Highly recommended for anyone looking for a reliable Android phone.',
        date: new Date('2024-12-15'),
        verified: true,
        helpful: 24,
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
        videos: [],
        status: 'published',
        category: 'Electronics',
        pros: ['Great camera', 'Long battery life', 'Premium build'],
        cons: ['Slightly heavy', 'No wireless charging'],
        wouldRecommend: true
      },
      {
        id: 'rev-2',
        productId: 'prod-2',
        productName: 'Uniqlo Cotton T-Shirt',
        productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        rating: 4,
        title: 'Good quality cotton shirt',
        content: 'The fabric quality is really good and comfortable to wear. The fit is true to size. Only issue is that it shrinks a bit after washing, so I recommend buying one size larger.',
        date: new Date('2024-12-10'),
        verified: true,
        helpful: 12,
        images: [],
        videos: [],
        status: 'published',
        category: 'Fashion',
        pros: ['Comfortable fabric', 'True to size', 'Good value'],
        cons: ['Shrinks after wash'],
        wouldRecommend: true
      },
      {
        id: 'rev-3',
        productId: 'prod-3',
        productName: 'Instant Pot Duo 7-in-1',
        productImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        rating: 5,
        title: 'Game changer for cooking!',
        content: 'This pressure cooker has completely changed how I cook. Rice, curry, steaming vegetables - everything is so much faster and the food tastes better. The safety features are excellent and it\'s very easy to clean.',
        date: new Date('2024-12-08'),
        verified: true,
        helpful: 18,
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'],
        videos: ['video1.mp4'],
        status: 'published',
        category: 'Home & Kitchen',
        pros: ['Fast cooking', 'Multiple functions', 'Easy to clean', 'Safety features'],
        cons: ['Takes space', 'Learning curve'],
        wouldRecommend: true
      },
      {
        id: 'rev-4',
        productId: 'prod-4',
        productName: 'The Alchemist Book',
        productImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        rating: 3,
        title: 'Overhyped but decent read',
        content: 'The book has some good philosophical insights but I found it a bit slow in some parts. The story is inspiring but not as life-changing as people make it out to be. Still worth reading once.',
        date: new Date('2024-12-05'),
        verified: true,
        helpful: 8,
        images: [],
        videos: [],
        status: 'published',
        category: 'Books',
        pros: ['Inspiring message', 'Easy to read'],
        cons: ['Slow pacing', 'Overhyped'],
        wouldRecommend: false
      },
      {
        id: 'rev-5',
        productId: 'prod-5',
        productName: 'Nike Air Max Sneakers',
        productImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        rating: 4,
        title: 'Comfortable but runs small',
        content: 'Really comfortable shoes for daily wear and light exercise. The cushioning is excellent and they look great. However, they definitely run about half a size small, so size up when ordering.',
        date: new Date('2024-12-01'),
        verified: true,
        helpful: 15,
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'],
        videos: [],
        status: 'pending',
        category: 'Fashion',
        pros: ['Comfortable', 'Good cushioning', 'Stylish design'],
        cons: ['Runs small', 'Price is high'],
        wouldRecommend: true
      }
    ];

    const mockStats: ReviewStats = {
      totalReviews: 23,
      averageRating: 4.3,
      helpfulVotes: 187,
      rankPoints: 2340,
      badge: 'Top Reviewer',
      nextBadge: 'Elite Reviewer',
      reviewsToNext: 7
    };

    setReviews(mockReviews);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;
    const matchesSearch = searchQuery === '' || 
      review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesRating && matchesSearch;
  });

  const renderStars = (rating: number, size: string = 'h-4 w-4') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading your reviews...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Review Center</h1>
          <p className="text-xl opacity-90 mb-8">
            Manage your reviews, track your reviewer status, and help other customers
          </p>
          
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalReviews}</p>
                    <p className="opacity-80">Total Reviews</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">{stats.averageRating}</p>
                    <p className="opacity-80">Avg Rating</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <ThumbsUp className="h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">{stats.helpfulVotes}</p>
                    <p className="opacity-80">Helpful Votes</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">{stats.badge}</p>
                    <p className="opacity-80">Current Badge</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Reviewer Progress */}
      {stats && (
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Reviewer Progress</h3>
                  <p className="text-gray-600">You're {stats.reviewsToNext} reviews away from {stats.nextBadge} status!</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="font-bold text-gray-900">{stats.badge}</span>
                  </div>
                  <p className="text-sm text-gray-600">{stats.rankPoints} points</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${((stats.totalReviews % 10) / 10) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{stats.totalReviews} reviews</span>
                <span>{stats.totalReviews + stats.reviewsToNext} for next badge</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters and Search */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your reviews..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              
              {/* Rating Filter */}
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-6">
            {filteredReviews.map(review => (
              <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={review.productImage}
                      alt={review.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{review.productName}</h3>
                        <div className="flex items-center gap-3 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            {review.date.toLocaleDateString('en-BD')}
                          </span>
                          {review.verified && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              Verified Purchase
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                    <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>
                    
                    {/* Pros and Cons */}
                    {(review.pros.length > 0 || review.cons.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {review.pros.length > 0 && (
                          <div>
                            <h5 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              Pros
                            </h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {review.pros.map((pro, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {review.cons.length > 0 && (
                          <div>
                            <h5 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                              <ThumbsDown className="h-4 w-4" />
                              Cons
                            </h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {review.cons.map((con, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
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
                        <div className="flex gap-2">
                          {review.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ))}
                          {review.videos.map((video, index) => (
                            <div key={index} className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                              <Video className="h-6 w-6 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {review.helpful} people found this helpful
                        </span>
                        {review.wouldRecommend && (
                          <span className="text-green-600">Would recommend</span>
                        )}
                      </div>
                      
                      <span className="text-sm text-gray-500">{review.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? `No reviews match your search for "${searchQuery}"`
                  : 'Start writing reviews to help other customers and earn reviewer badges!'
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Keep Reviewing, Keep Growing!</h2>
          <p className="text-xl mb-8 opacity-90">
            Your reviews help millions of customers make better decisions. Write more to earn exclusive badges and rewards.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all">
              Write a Review
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-all">
              View Reviewer Guidelines
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ReviewCenter;