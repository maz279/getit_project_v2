/**
 * Daily Offers Component
 * Daily deal management with rotating offers
 * Implements Amazon.com/Shopee.sg-level daily deals experience
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Gift, 
  Star,
  ShoppingCart,
  Heart,
  TrendingUp,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Sparkles
} from 'lucide-react';

interface DailyOffer {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  brand: string;
  discount: number;
  rating: number;
  reviews: number;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  isActive: boolean;
  remaining: number;
  total: number;
  specialType?: 'early_bird' | 'lunch_special' | 'evening_deal' | 'midnight_sale';
}

interface DailyOffersProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const DailyOffers: React.FC<DailyOffersProps> = ({
  className = '',
  language = 'en'
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSlot, setActiveSlot] = useState<string>('morning');

  const dailyOffers: DailyOffer[] = [
    // Morning Deals (6 AM - 12 PM)
    {
      id: '1',
      title: 'Fresh Breakfast Combo Pack',
      bengaliTitle: 'তাজা নাস্তা কম্বো প্যাক',
      price: 450,
      originalPrice: 650,
      image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400',
      category: 'Food & Beverage',
      brand: 'FreshMart',
      discount: 31,
      rating: 4.5,
      reviews: 234,
      timeSlot: 'morning',
      isActive: true,
      remaining: 47,
      total: 100,
      specialType: 'early_bird'
    },
    {
      id: '2',
      title: 'Premium Coffee Beans 1kg',
      bengaliTitle: 'প্রিমিয়াম কফি বিন ১ কেজি',
      price: 850,
      originalPrice: 1200,
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
      category: 'Food & Beverage',
      brand: 'Coffee House',
      discount: 29,
      rating: 4.7,
      reviews: 156,
      timeSlot: 'morning',
      isActive: true,
      remaining: 23,
      total: 50,
      specialType: 'early_bird'
    },
    // Afternoon Deals (12 PM - 6 PM)
    {
      id: '3',
      title: 'Office Desk Organizer Set',
      bengaliTitle: 'অফিস ডেস্ক অর্গানাইজার সেট',
      price: 1250,
      originalPrice: 1800,
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
      category: 'Office Supplies',
      brand: 'WorkSpace',
      discount: 31,
      rating: 4.4,
      reviews: 89,
      timeSlot: 'afternoon',
      isActive: false,
      remaining: 67,
      total: 80,
      specialType: 'lunch_special'
    },
    {
      id: '4',
      title: 'Wireless Bluetooth Speaker',
      bengaliTitle: 'ওয়্যারলেস ব্লুটুথ স্পিকার',
      price: 1850,
      originalPrice: 2500,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      category: 'Electronics',
      brand: 'SoundTech',
      discount: 26,
      rating: 4.6,
      reviews: 445,
      timeSlot: 'afternoon',
      isActive: false,
      remaining: 34,
      total: 60,
      specialType: 'lunch_special'
    },
    // Evening Deals (6 PM - 10 PM)
    {
      id: '5',
      title: 'Premium Dinner Set',
      bengaliTitle: 'প্রিমিয়াম ডিনার সেট',
      price: 3200,
      originalPrice: 4500,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      category: 'Home & Kitchen',
      brand: 'ElegantHome',
      discount: 29,
      rating: 4.5,
      reviews: 234,
      timeSlot: 'evening',
      isActive: false,
      remaining: 12,
      total: 30,
      specialType: 'evening_deal'
    },
    {
      id: '6',
      title: 'LED Smart Bulb 4-Pack',
      bengaliTitle: 'LED স্মার্ট বাল্ব ৪-প্যাক',
      price: 1150,
      originalPrice: 1600,
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
      category: 'Electronics',
      brand: 'SmartHome',
      discount: 28,
      rating: 4.3,
      reviews: 167,
      timeSlot: 'evening',
      isActive: false,
      remaining: 28,
      total: 40,
      specialType: 'evening_deal'
    },
    // Night Deals (10 PM - 6 AM)
    {
      id: '7',
      title: 'Night Skincare Routine Set',
      bengaliTitle: 'রাতের স্কিনকেয়ার রুটিন সেট',
      price: 1650,
      originalPrice: 2200,
      image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
      category: 'Beauty & Personal Care',
      brand: 'GlowNight',
      discount: 25,
      rating: 4.6,
      reviews: 312,
      timeSlot: 'night',
      isActive: false,
      remaining: 45,
      total: 70,
      specialType: 'midnight_sale'
    },
    {
      id: '8',
      title: 'Sleep Essential Oil Diffuser',
      bengaliTitle: 'ঘুমের এসেনশিয়াল অয়েল ডিফিউজার',
      price: 2450,
      originalPrice: 3200,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      category: 'Home & Living',
      brand: 'RelaxHome',
      discount: 23,
      rating: 4.4,
      reviews: 189,
      timeSlot: 'night',
      isActive: false,
      remaining: 18,
      total: 25,
      specialType: 'midnight_sale'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    // Determine active slot based on current time
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setActiveSlot('morning');
    else if (hour >= 12 && hour < 18) setActiveSlot('afternoon');
    else if (hour >= 18 && hour < 22) setActiveSlot('evening');
    else setActiveSlot('night');

    return () => clearInterval(timer);
  }, []);

  const getSlotIcon = (slot: string) => {
    switch (slot) {
      case 'morning': return <Sunrise className="w-5 h-5 text-yellow-500" />;
      case 'afternoon': return <Sun className="w-5 h-5 text-orange-500" />;
      case 'evening': return <Sunset className="w-5 h-5 text-purple-500" />;
      case 'night': return <Moon className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getSlotName = (slot: string) => {
    if (language === 'bn') {
      switch (slot) {
        case 'morning': return 'সকাল';
        case 'afternoon': return 'দুপুর';
        case 'evening': return 'সন্ধ্যা';
        case 'night': return 'রাত';
        default: return 'অজানা';
      }
    }
    return slot.charAt(0).toUpperCase() + slot.slice(1);
  };

  const getSlotTime = (slot: string) => {
    switch (slot) {
      case 'morning': return '6 AM - 12 PM';
      case 'afternoon': return '12 PM - 6 PM';
      case 'evening': return '6 PM - 10 PM';
      case 'night': return '10 PM - 6 AM';
      default: return '';
    }
  };

  const getSpecialTypeText = (type: string) => {
    if (language === 'bn') {
      switch (type) {
        case 'early_bird': return 'আর্লি বার্ড';
        case 'lunch_special': return 'লাঞ্চ স্পেশাল';
        case 'evening_deal': return 'সন্ধ্যার অফার';
        case 'midnight_sale': return 'মিডনাইট সেল';
        default: return '';
      }
    }
    return type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  const timeSlots = ['morning', 'afternoon', 'evening', 'night'];

  return (
    <div className={`daily-offers ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-green-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {language === 'bn' ? 'দৈনিক অফার' : 'Daily Offers'}
              </h1>
              <p className="text-gray-600">
                {language === 'bn' 
                  ? 'প্রতিদিন নতুন ছাড় এবং অফার'
                  : 'Fresh discounts and offers every day'}
              </p>
            </div>
          </div>

          {/* Current Time and Active Slot */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">
                      {language === 'bn' ? 'বর্তমান সময়:' : 'Current Time:'} {currentTime.toLocaleTimeString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentTime.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSlotIcon(activeSlot)}
                  <div className="text-right">
                    <div className="font-medium">{getSlotName(activeSlot)} {language === 'bn' ? 'অফার' : 'Offers'}</div>
                    <div className="text-sm text-gray-600">{getSlotTime(activeSlot)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Slot Tabs */}
        <Tabs value={activeSlot} onValueChange={setActiveSlot} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {timeSlots.map((slot) => (
              <TabsTrigger key={slot} value={slot} className="flex items-center gap-2">
                {getSlotIcon(slot)}
                <span className="hidden sm:inline">{getSlotName(slot)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {timeSlots.map((slot) => (
            <TabsContent key={slot} value={slot}>
              <div className="mb-4 text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {getSlotName(slot)} {language === 'bn' ? 'বিশেষ অফার' : 'Special Offers'}
                </h3>
                <p className="text-gray-600">
                  {getSlotTime(slot)} • {dailyOffers.filter(offer => offer.timeSlot === slot).length} {language === 'bn' ? 'টি অফার' : 'offers available'}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dailyOffers.filter(offer => offer.timeSlot === slot).map((offer) => {
                  const soldPercentage = ((offer.total - offer.remaining) / offer.total) * 100;

                  return (
                    <Card key={offer.id} className={`group hover:shadow-lg transition-all ${
                      slot === activeSlot ? 'border-2 border-blue-200' : ''
                    }`}>
                      <div className="relative">
                        <img 
                          src={offer.image} 
                          alt={offer.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        
                        {/* Special Type Badge */}
                        {offer.specialType && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-purple-600 text-white">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {getSpecialTypeText(offer.specialType)}
                            </Badge>
                          </div>
                        )}

                        {/* Discount Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-red-500 text-white text-lg">
                            -{offer.discount}%
                          </Badge>
                        </div>

                        {/* Time Slot Indicator */}
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="outline" className="bg-white/90">
                            {getSlotIcon(slot)}
                            <span className="ml-1">{getSlotTime(slot)}</span>
                          </Badge>
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{offer.rating}</span>
                          <span className="text-xs text-gray-500">({offer.reviews})</span>
                        </div>
                        
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {language === 'bn' && offer.bengaliTitle ? offer.bengaliTitle : offer.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl font-bold text-green-600">
                            ৳{offer.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ৳{offer.originalPrice.toLocaleString()}
                          </span>
                        </div>

                        {/* Availability Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{language === 'bn' ? 'বাকি আছে' : 'Available'}</span>
                            <span>{offer.remaining}/{offer.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(offer.remaining / offer.total) * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {soldPercentage >= 80 
                              ? (language === 'bn' ? 'সীমিত স্টক!' : 'Limited stock!')
                              : (language === 'bn' ? 'ভাল স্টক' : 'Good availability')
                            }
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-3">
                          {offer.brand} • {offer.category}
                        </div>
                        
                        <Button 
                          className={`w-full ${
                            slot === activeSlot 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'bg-gray-500 hover:bg-gray-600'
                          }`}
                          disabled={slot !== activeSlot}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {slot === activeSlot 
                            ? (language === 'bn' ? 'এখনই কিনুন' : 'Buy Now')
                            : (language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon')
                          }
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Daily Deal Schedule */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {language === 'bn' ? 'দৈনিক অফার সময়সূচী' : 'Daily Offer Schedule'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {timeSlots.map((slot) => (
                <div key={slot} className={`p-4 rounded-lg border-2 ${
                  slot === activeSlot ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getSlotIcon(slot)}
                    <span className="font-medium">{getSlotName(slot)}</span>
                    {slot === activeSlot && (
                      <Badge className="bg-green-500 text-white text-xs">ACTIVE</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{getSlotTime(slot)}</div>
                  <div className="text-sm">
                    {dailyOffers.filter(offer => offer.timeSlot === slot).length} {language === 'bn' ? 'টি অফার' : 'offers'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Statistics */}
        <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6 text-center">
            <Gift className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-2">
              {language === 'bn' ? 'আজকের পরিসংখ্যান' : "Today's Statistics"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">247</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'আজ বিক্রি' : 'Items Sold'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">₹1.2L</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'মোট সাশ্রয়' : 'Total Savings'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">8</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'সময়ের স্লট' : 'Time Slots'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">92%</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'সন্তুষ্ট গ্রাহক' : 'Satisfied Customers'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyOffers;