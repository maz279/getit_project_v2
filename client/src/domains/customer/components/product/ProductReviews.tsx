/**
 * Product Reviews Component
 * Advanced review system with filtering, sorting, and verification
 * Implements Amazon.com/Shopee.sg-level review experience
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Camera,
  Shield,
  Search,
  Filter,
  SortDesc,
  Flag,
  Award,
  CheckCircle
} from 'lucide-react';

interface ProductReview {
  id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  images?: string[];
  variant?: string;
  pros?: string[];
  cons?: string[];
  replied: boolean;
  response?: {
    author: string;
    content: string;
    date: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  verifiedPercentage: number;
  withPhotos: number;
}

interface ProductReviewsProps {
  productId?: string;
  className?: string;
  language?: 'en' | 'bn';
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId = 'product_123',
  className = '',
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const reviewStats: ReviewStats = {
    totalReviews: 1284,
    averageRating: 4.6,
    ratingDistribution: {
      5: 856,
      4: 298,
      3: 89,
      2: 31,
      1: 10
    },
    verifiedPercentage: 87,
    withPhotos: 342
  };

  const reviews: ProductReview[] = [
    {
      id: '1',
      customerName: 'আহমেদ হাসান',
      customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      rating: 5,
      title: 'অসাধারণ সাউন্ড কোয়ালিটি!',
      content: 'এই হেডফোনের সাউন্ড কোয়ালিটি সত্যিই অবিশ্বাস্য। নয়েজ ক্যান্সেলেশন খুবই ভাল কাজ করে। দাম অনুযায়ী পারফেক্ট প্রোডাক্ট। ব্যাটারি লাইফও দুর্দান্ত, প্রায় ৩০ ঘন্টা চলে।',
      date: '2025-01-10',
      verified: true,
      helpful: 23,
      notHelpful: 2,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200'
      ],
      variant: 'Black',
      pros: ['Excellent sound quality', 'Great battery life', 'Comfortable'],
      cons: ['Slightly heavy'],
      replied: true,
      response: {
        author: 'TechGear Support',
        content: 'Thank you for your wonderful review! We\'re thrilled you love the sound quality.',
        date: '2025-01-11'
      }
    },
    {
      id: '2',
      customerName: 'Fatema Khatun',
      customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c5f2?w=100',
      rating: 4,
      title: 'Good headphones, comfortable for long use',
      content: 'Very good headphones overall. The sound is clear and bass is nice. Comfortable to wear for hours. Only issue is that the case could be better. Delivery was fast and packaging was excellent.',
      date: '2025-01-08',
      verified: true,
      helpful: 18,
      notHelpful: 1,
      variant: 'Silver',
      pros: ['Clear sound', 'Comfortable', 'Fast delivery'],
      cons: ['Case quality could improve'],
      replied: false
    },
    {
      id: '3',
      customerName: 'রহিম উদ্দিন',
      customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      rating: 5,
      title: 'টাকার বিনিময়ে সেরা হেডফোন',
      content: 'দারুণ প্রোডাক্ট। সাউন্ড কোয়ালিটি অসাধারণ। দ্রুত ডেলিভারি পেয়েছি। প্যাকেজিং ও ভাল ছিল। ওয়্যারলেস কানেকশন স্টেবল। সবমিলিয়ে সন্তুষ্ট।',
      date: '2025-01-05',
      verified: true,
      helpful: 15,
      notHelpful: 0,
      images: ['https://images.unsplash.com/photo-1599669454699-248893623440?w=200'],
      variant: 'Black',
      pros: ['Great value', 'Stable connection', 'Good packaging'],
      cons: [],
      replied: false
    }
  ];

  const filteredReviews = reviews.filter(review => {
    if (filterRating > 0 && review.rating !== filterRating) return false;
    if (searchQuery && !review.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeTab === 'verified' && !review.verified) return false;
    if (activeTab === 'photos' && !review.images?.length) return false;
    return true;
  });

  const handleVoteHelpful = (reviewId: string, isHelpful: boolean) => {
    // Handle voting logic
    console.log(`Vote ${isHelpful ? 'helpful' : 'not helpful'} for review ${reviewId}`);
  };

  const handleReportReview = (reviewId: string) => {
    // Handle report logic
    console.log(`Report review ${reviewId}`);
  };

  return (
    <div className={`product-reviews ${className}`}>
      <div className="space-y-6">
        {/* Review Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              {language === 'bn' ? 'গ্রাহক রিভিউ' : 'Customer Reviews'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{reviewStats.averageRating}</div>
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-6 h-6 ${
                        star <= Math.round(reviewStats.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-gray-600">
                  {reviewStats.totalReviews.toLocaleString()} {language === 'bn' ? 'টি রিভিউ' : 'reviews'}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="w-8 text-sm">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ 
                          width: `${(reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      {reviewStats.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-600" />
                <div className="text-lg font-bold text-green-800">{reviewStats.verifiedPercentage}%</div>
                <div className="text-xs text-green-600">
                  {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                </div>
              </div>

              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Camera className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <div className="text-lg font-bold text-blue-800">{reviewStats.withPhotos}</div>
                <div className="text-xs text-blue-600">
                  {language === 'bn' ? 'ছবি সহ' : 'With Photos'}
                </div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <MessageCircle className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <div className="text-lg font-bold text-purple-800">
                  {reviews.filter(r => r.replied).length}
                </div>
                <div className="text-xs text-purple-600">
                  {language === 'bn' ? 'উত্তর দেওয়া' : 'Responded'}
                </div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Award className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                <div className="text-lg font-bold text-orange-800">4.6</div>
                <div className="text-xs text-orange-600">
                  {language === 'bn' ? 'গড় রেটিং' : 'Avg Rating'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={language === 'bn' ? 'রিভিউ খুঁজুন...' : 'Search reviews...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Rating Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select 
                  value={filterRating} 
                  onChange={(e) => setFilterRating(Number(e.target.value))}
                  className="border rounded px-3 py-2"
                >
                  <option value={0}>{language === 'bn' ? 'সব রেটিং' : 'All Ratings'}</option>
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <SortDesc className="w-4 h-4 text-gray-600" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="newest">{language === 'bn' ? 'নতুন' : 'Newest'}</option>
                  <option value="oldest">{language === 'bn' ? 'পুরাতন' : 'Oldest'}</option>
                  <option value="helpful">{language === 'bn' ? 'সহায়ক' : 'Most Helpful'}</option>
                  <option value="rating">{language === 'bn' ? 'রেটিং' : 'Highest Rating'}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              {language === 'bn' ? 'সব' : 'All'} ({reviewStats.totalReviews})
            </TabsTrigger>
            <TabsTrigger value="verified">
              <Shield className="w-4 h-4 mr-1" />
              {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
            </TabsTrigger>
            <TabsTrigger value="photos">
              <Camera className="w-4 h-4 mr-1" />
              {language === 'bn' ? 'ছবি সহ' : 'With Photos'}
            </TabsTrigger>
            <TabsTrigger value="recent">
              {language === 'bn' ? 'সাম্প্রতিক' : 'Recent'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {review.customerAvatar ? (
                          <img 
                            src={review.customerAvatar} 
                            alt={review.customerName}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {review.customerName.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.customerName}</span>
                          {review.verified && (
                            <Badge className="bg-green-600 text-white text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">{review.date}</span>
                          {review.variant && (
                            <Badge variant="outline" className="text-xs">
                              {review.variant}
                            </Badge>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${
                                star <= review.rating 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                          <span className="font-medium">{review.title}</span>
                        </div>

                        {/* Content */}
                        <p className="text-gray-700 mb-3">{review.content}</p>

                        {/* Pros and Cons */}
                        {(review.pros?.length || review.cons?.length) && (
                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            {review.pros && review.pros.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-green-600 mb-1">
                                  {language === 'bn' ? 'ভাল দিক:' : 'Pros:'}
                                </div>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {review.pros.map((pro, index) => (
                                    <li key={index} className="flex items-center gap-1">
                                      <span className="text-green-500">+</span>
                                      {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {review.cons && review.cons.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-red-600 mb-1">
                                  {language === 'bn' ? 'খারাপ দিক:' : 'Cons:'}
                                </div>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {review.cons.map((con, index) => (
                                    <li key={index} className="flex items-center gap-1">
                                      <span className="text-red-500">-</span>
                                      {con}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {review.images.map((image, index) => (
                              <img 
                                key={index}
                                src={image} 
                                alt={`Review image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                              />
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 text-sm">
                          <button 
                            onClick={() => handleVoteHelpful(review.id, true)}
                            className="flex items-center gap-1 text-gray-600 hover:text-green-600"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {language === 'bn' ? 'সহায়ক' : 'Helpful'} ({review.helpful})
                          </button>
                          
                          <button 
                            onClick={() => handleVoteHelpful(review.id, false)}
                            className="flex items-center gap-1 text-gray-600 hover:text-red-600"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            ({review.notHelpful})
                          </button>
                          
                          <button 
                            onClick={() => handleReportReview(review.id)}
                            className="flex items-center gap-1 text-gray-600 hover:text-orange-600"
                          >
                            <Flag className="w-4 h-4" />
                            {language === 'bn' ? 'রিপোর্ট' : 'Report'}
                          </button>
                        </div>

                        {/* Seller Response */}
                        {review.response && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-blue-600 text-white text-xs">
                                {language === 'bn' ? 'বিক্রেতার উত্তর' : 'Seller Response'}
                              </Badge>
                              <span className="text-sm text-gray-600">{review.response.date}</span>
                            </div>
                            <p className="text-sm text-gray-700">{review.response.content}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-6">
              <Button variant="outline">
                {language === 'bn' ? 'আরো রিভিউ দেখুন' : 'Load More Reviews'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductReviews;