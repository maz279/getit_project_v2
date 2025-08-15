import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useSimpleLanguage } from '../../../../contexts/SimpleLanguageContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Heart, 
  ShoppingCart, 
  Eye, 
  Flame,
  Star,
  Users
} from 'lucide-react';

interface TrendingProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  vendor: string;
  category: string;
  discount?: number;
  trendScore: number;
  salesVolume: number;
  viewCount: number;
  growth: number;
  badge?: string;
  isLimitedTime?: boolean;
}

interface TrendingData {
  overall: TrendingProduct[];
  categories: {
    [key: string]: TrendingProduct[];
  };
  timeRanges: {
    hourly: TrendingProduct[];
    daily: TrendingProduct[];
    weekly: TrendingProduct[];
  };
}

interface AdvancedTrendingCarouselProps {
  className?: string;
  showAnalytics?: boolean;
}

export const AdvancedTrendingCarousel: React.FC<AdvancedTrendingCarouselProps> = ({ 
  className = "",
  showAnalytics = true 
}) => {
  const { language, t } = useSimpleLanguage();
  const [activeTab, setActiveTab] = useState<'overall' | 'hourly' | 'daily' | 'weekly'>('overall');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch trending data with real-time analytics
  const { data: trendingData, isLoading, error } = useQuery({
    queryKey: ['/api/v1/analytics/trending', activeTab, selectedCategory],
    staleTime: 2 * 60 * 1000, // 2 minutes for trending data
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Mock trending data for demonstration
  const mockTrendingData: TrendingData = {
    overall: [
      {
        id: '1',
        name: 'iPhone 15 Pro Max 256GB',
        price: 155000,
        originalPrice: 165000,
        image: '/api/placeholder/300/300',
        rating: 4.8,
        reviewCount: 2847,
        vendor: 'iStore BD',
        category: 'Electronics',
        discount: 6,
        trendScore: 98,
        salesVolume: 245,
        viewCount: 15420,
        growth: 187,
        badge: '🔥 Hot',
        isLimitedTime: true
      },
      {
        id: '2',
        name: 'Nike Air Max 270 Sneakers',
        price: 12500,
        originalPrice: 15000,
        image: '/api/placeholder/300/300',
        rating: 4.6,
        reviewCount: 1654,
        vendor: 'Nike Bangladesh',
        category: 'Fashion',
        discount: 17,
        trendScore: 94,
        salesVolume: 189,
        viewCount: 12850,
        growth: 142,
        badge: '⚡ Fast Selling'
      },
      {
        id: '3',
        name: 'MacBook Air M3 13-inch',
        price: 135000,
        originalPrice: 145000,
        image: '/api/placeholder/300/300',
        rating: 4.9,
        reviewCount: 987,
        vendor: 'Apple Store BD',
        category: 'Electronics',
        discount: 7,
        trendScore: 92,
        salesVolume: 89,
        viewCount: 18650,
        growth: 95,
        badge: '🎯 Most Viewed'
      },
      // Add more products...
    ],
    categories: {
      'Electronics': [/* electronics products */],
      'Fashion': [/* fashion products */],
      'Home': [/* home products */],
    },
    timeRanges: {
      hourly: [/* hourly trending */],
      daily: [/* daily trending */],
      weekly: [/* weekly trending */],
    }
  };

  const currentProducts = trendingData?.overall || mockTrendingData.overall;
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, currentProducts.length - itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const getTimeRangeData = () => {
    switch (activeTab) {
      case 'hourly': return trendingData?.timeRanges?.hourly || mockTrendingData.timeRanges.hourly;
      case 'daily': return trendingData?.timeRanges?.daily || mockTrendingData.timeRanges.daily;
      case 'weekly': return trendingData?.timeRanges?.weekly || mockTrendingData.timeRanges.weekly;
      default: return currentProducts;
    }
  };

  const displayProducts = getTimeRangeData();

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Trending Analytics */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 text-white rounded-full">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {language === 'bn' ? 'ট্রেন্ডিং প্রোডাক্ট' : 'Trending Products'}
              </h2>
              <p className="text-gray-600">
                {language === 'bn' ? 'বাংলাদেশে রিয়েল-টাইম ট্রেন্ডিং প্রোডাক্ট' : 'Real-time trending products in Bangladesh'}
              </p>
            </div>
          </div>
        </div>

        {/* Time Range Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { 
              key: 'overall', 
              label: language === 'bn' ? 'সামগ্রিক' : 'Overall', 
              icon: <TrendingUp className="h-4 w-4" /> 
            },
            { 
              key: 'hourly', 
              label: language === 'bn' ? 'গত ঘন্টা' : 'Last Hour', 
              icon: <Flame className="h-4 w-4" /> 
            },
            { 
              key: 'daily', 
              label: language === 'bn' ? 'আজ' : 'Today', 
              icon: <Eye className="h-4 w-4" /> 
            },
            { 
              key: 'weekly', 
              label: language === 'bn' ? 'এই সপ্তাহ' : 'This Week', 
              icon: <Users className="h-4 w-4" /> 
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Analytics Bar */}
      {showAnalytics && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">🔥</div>
              <div className="font-semibold">Hot Trending</div>
              <div className="text-gray-600">+187% growth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">⚡</div>
              <div className="font-semibold">Fast Moving</div>
              <div className="text-gray-600">245 sold/hour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">👁️</div>
              <div className="font-semibold">Most Viewed</div>
              <div className="text-gray-600">18.6K views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">💰</div>
              <div className="font-semibold">Best Deals</div>
              <div className="text-gray-600">Up to 50% off</div>
            </div>
          </div>
        </div>
      )}

      {/* Product Carousel */}
      <div className="relative">
        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl"
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl"
          onClick={nextSlide}
          disabled={currentIndex >= maxIndex}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Products Grid */}
        <div className="mx-8 overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out gap-4"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
          >
            {displayProducts.map((product, index) => (
              <Card 
                key={product.id} 
                className="flex-shrink-0 w-[calc(25%-12px)] hover:shadow-lg transition-all cursor-pointer group"
              >
                <CardContent className="p-4">
                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    
                    {/* Trending Rank Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 text-white text-xs">
                        #{index + 1}
                      </Badge>
                    </div>

                    {/* Special Badges */}
                    {product.badge && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {product.badge}
                        </Badge>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {product.discount && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="destructive" className="text-xs">
                          -{product.discount}%
                        </Badge>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="h-8 w-8 p-0">
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                      {product.name}
                    </h4>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">
                        ৳{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ৳{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-sm text-gray-500">
                          ({product.reviewCount})
                        </span>
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        {product.salesVolume} {language === 'bn' ? 'বিক্রিত' : 'sold'}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {language === 'bn' ? 'বিক্রেতা' : 'by'} {product.vendor}
                    </div>

                    {/* Trending Metrics */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded p-2 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>{language === 'bn' ? 'ট্রেন্ড স্কোর:' : 'Trend Score:'}</span>
                        <span className="font-semibold text-red-600">{product.trendScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'bn' ? 'বৃদ্ধি:' : 'Growth:'}</span>
                        <span className="font-semibold text-green-600">+{product.growth}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'bn' ? 'দেখা:' : 'Views:'}</span>
                        <span className="font-semibold">{product.viewCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentIndex === index ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button 
          size="lg" 
          onClick={() => {
            window.location.href = `/trending?tab=${activeTab}`;
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          {language === 'bn' ? 'সব ট্রেন্ডিং প্রোডাক্ট দেখুন →' : 'View All Trending Products →'}
        </Button>
      </div>
    </div>
  );
};

export default AdvancedTrendingCarousel;