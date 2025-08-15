/**
 * Flash Deals Component
 * Time-limited flash sale management with countdown timers
 * Implements Amazon.com/Shopee.sg-level flash sale experience
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Zap, 
  Clock, 
  Flame, 
  Star,
  ShoppingCart,
  Heart,
  Eye,
  TrendingUp,
  Users,
  Timer
} from 'lucide-react';

interface FlashDeal {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  brand: string;
  discount: number;
  sold: number;
  total: number;
  rating: number;
  reviews: number;
  endTime: string;
  isActive: boolean;
  isUpcoming: boolean;
}

interface FlashDealsProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const FlashDeals: React.FC<FlashDealsProps> = ({
  className = '',
  language = 'en'
}) => {
  const [timeLeft, setTimeLeft] = useState<{[key: string]: number}>({});
  const [nextSaleCountdown, setNextSaleCountdown] = useState(14400); // 4 hours

  const flashDeals: FlashDeal[] = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max 256GB',
      bengaliTitle: 'আইফোন ১৫ প্রো ম্যাক্স ২৫৬জিবি',
      price: 135000,
      originalPrice: 155000,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      category: 'Electronics',
      brand: 'Apple',
      discount: 13,
      sold: 47,
      total: 100,
      rating: 4.8,
      reviews: 2847,
      endTime: '2025-01-12T20:00:00',
      isActive: true,
      isUpcoming: false
    },
    {
      id: '2',
      title: 'Samsung 55" 4K Smart TV',
      bengaliTitle: 'স্যামসাং ৫৫" ৪কে স্মার্ট টিভি',
      price: 65000,
      originalPrice: 85000,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
      category: 'Electronics',
      brand: 'Samsung',
      discount: 24,
      sold: 23,
      total: 50,
      rating: 4.6,
      reviews: 1456,
      endTime: '2025-01-12T20:00:00',
      isActive: true,
      isUpcoming: false
    },
    {
      id: '3',
      title: 'Premium Wireless Headphones',
      bengaliTitle: 'প্রিমিয়াম ওয়্যারলেস হেডফোন',
      price: 2400,
      originalPrice: 4000,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category: 'Electronics',
      brand: 'TechGear',
      discount: 40,
      sold: 127,
      total: 200,
      rating: 4.6,
      reviews: 1284,
      endTime: '2025-01-12T20:00:00',
      isActive: true,
      isUpcoming: false
    },
    {
      id: '4',
      title: 'Gaming Laptop RTX 4060',
      bengaliTitle: 'গেমিং ল্যাপটপ RTX 4060',
      price: 95000,
      originalPrice: 125000,
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
      category: 'Electronics',
      brand: 'ASUS',
      discount: 24,
      sold: 0,
      total: 25,
      rating: 4.7,
      reviews: 892,
      endTime: '2025-01-13T12:00:00',
      isActive: false,
      isUpcoming: true
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newTimeLeft: {[key: string]: number} = {};
      
      flashDeals.forEach(deal => {
        const endTime = new Date(deal.endTime).getTime();
        const difference = endTime - now;
        newTimeLeft[deal.id] = Math.max(0, difference);
      });
      
      setTimeLeft(newTimeLeft);
      setNextSaleCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  const formatNextSaleTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return { hours, minutes: mins, seconds: secs };
  };

  const nextSaleTime = formatNextSaleTime(nextSaleCountdown);

  return (
    <div className={`flash-deals ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  {language === 'bn' ? 'ফ্ল্যাশ ডিল' : 'Flash Deals'}
                </h1>
                <p className="text-gray-600">
                  {language === 'bn' 
                    ? 'সীমিত সময়ের জন্য অবিশ্বাস্য ছাড়'
                    : 'Incredible discounts for limited time'}
                </p>
              </div>
            </div>
            
            <Badge className="bg-red-500 text-white animate-pulse text-lg px-4 py-2">
              <Fire className="w-4 h-4 mr-2" />
              LIVE
            </Badge>
          </div>

          {/* Next Sale Countdown */}
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'bn' ? 'পরবর্তী ফ্ল্যাশ সেল' : 'Next Flash Sale'}
                  </h3>
                  <p className="text-purple-200">
                    {language === 'bn' ? 'গেমিং ল্যাপটপে ৫০% পর্যন্ত ছাড়' : 'Up to 50% off on Gaming Laptops'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {String(nextSaleTime.hours).padStart(2, '0')}:
                    {String(nextSaleTime.minutes).padStart(2, '0')}:
                    {String(nextSaleTime.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-purple-200">
                    {language === 'bn' ? 'ঘন্টা:মিনিট:সেকেন্ড' : 'Hours:Minutes:Seconds'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Flash Deals */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold">
              {language === 'bn' ? 'চলমান ফ্ল্যাশ ডিল' : 'Active Flash Deals'}
            </h2>
            <Badge className="bg-red-500 text-white">
              {flashDeals.filter(deal => deal.isActive).length} {language === 'bn' ? 'টি লাইভ' : 'LIVE'}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashDeals.filter(deal => deal.isActive).map((deal) => {
              const time = formatTime(timeLeft[deal.id] || 0);
              const soldPercentage = (deal.sold / deal.total) * 100;

              return (
                <Card key={deal.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-red-200">
                  <div className="relative overflow-hidden">
                    <img 
                      src={deal.image} 
                      alt={deal.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Flash Deal Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 text-white animate-pulse">
                        <Zap className="w-3 h-3 mr-1" />
                        FLASH -{deal.discount}%
                      </Badge>
                    </div>

                    {/* Time Left */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      {String(time.hours).padStart(2, '0')}:
                      {String(time.minutes).padStart(2, '0')}:
                      {String(time.seconds).padStart(2, '0')}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{deal.rating}</span>
                      <span className="text-xs text-gray-500">({deal.reviews.toLocaleString()})</span>
                    </div>
                    
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {language === 'bn' && deal.bengaliTitle ? deal.bengaliTitle : deal.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-red-600">
                        ৳{deal.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ৳{deal.originalPrice.toLocaleString()}
                      </span>
                      <Badge className="bg-green-500 text-white text-xs">
                        ৳{(deal.originalPrice - deal.price).toLocaleString()} {language === 'bn' ? 'সাশ্রয়' : 'saved'}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{language === 'bn' ? 'বিক্রি হয়েছে' : 'Sold'}</span>
                        <span>{deal.sold}/{deal.total}</span>
                      </div>
                      <Progress value={soldPercentage} className="h-2" />
                      <div className="text-xs text-gray-600 mt-1">
                        {soldPercentage >= 80 
                          ? (language === 'bn' ? 'প্রায় শেষ!' : 'Almost sold out!')
                          : soldPercentage >= 50
                          ? (language === 'bn' ? 'দ্রুত বিক্রি হচ্ছে!' : 'Selling fast!')
                          : (language === 'bn' ? `${deal.total - deal.sold} টি বাকি` : `${deal.total - deal.sold} left`)
                        }
                      </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="bg-red-50 p-2 rounded mb-3">
                      <div className="flex items-center justify-center gap-2 text-red-800">
                        <Timer className="w-4 h-4" />
                        <span className="font-bold">
                          {String(time.hours).padStart(2, '0')}:
                          {String(time.minutes).padStart(2, '0')}:
                          {String(time.seconds).padStart(2, '0')}
                        </span>
                        <span className="text-xs">
                          {language === 'bn' ? 'বাকি' : 'left'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-3">
                      {deal.brand} • {deal.category}
                    </div>
                    
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {language === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Upcoming Flash Deals */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold">
              {language === 'bn' ? 'আসছে শীঘ্রই' : 'Coming Soon'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {flashDeals.filter(deal => deal.isUpcoming).map((deal) => (
              <Card key={deal.id} className="group hover:shadow-lg transition-all">
                <div className="relative">
                  <img 
                    src={deal.image} 
                    alt={deal.title}
                    className="w-full h-32 object-cover opacity-75"
                  />
                  
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Clock className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-bold">
                        {language === 'bn' ? 'আসছে শীঘ্রই' : 'Coming Soon'}
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-2 left-2">
                    <Badge className="bg-blue-500 text-white">
                      -{deal.discount}% OFF
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-3">
                  <h4 className="font-medium mb-2 line-clamp-2 text-sm">
                    {language === 'bn' && deal.bengaliTitle ? deal.bengaliTitle : deal.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-blue-600">
                      ৳{deal.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      ৳{deal.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    {language === 'bn' ? 'রিমাইন্ডার সেট করুন' : 'Set Reminder'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Flash Deal Stats */}
        <Card className="mt-8 bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <Fire className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-xl font-semibold mb-2">
              {language === 'bn' ? 'ফ্ল্যাশ ডিল পরিসংখ্যান' : 'Flash Deal Statistics'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">197</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'আজ বিক্রি' : 'Sold Today'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">4.2K</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'ভিউ' : 'Views'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹8.4L</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'মোট সাশ্রয়' : 'Total Savings'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">89%</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'সন্তুষ্ট গ্রাহক' : 'Happy Customers'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlashDeals;