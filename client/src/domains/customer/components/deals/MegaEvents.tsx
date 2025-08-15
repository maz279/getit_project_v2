/**
 * Mega Events Component
 * Large-scale promotional events and mega sales
 * Implements Amazon.com/Shopee.sg-level mega sale experience
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Gift2,
  Star,
  Users,
  TrendingUp,
  Crown,
  Sparkles,
  PartyPopper,
  ShoppingCart,
  Heart,
  Zap
} from 'lucide-react';

interface MegaEvent {
  id: string;
  title: string;
  bengaliTitle?: string;
  description: string;
  bengaliDescription?: string;
  startDate: string;
  endDate: string;
  image: string;
  bannerImage: string;
  status: 'upcoming' | 'active' | 'ended';
  type: 'festival' | 'seasonal' | 'anniversary' | 'flash_mega';
  maxDiscount: number;
  participatingBrands: number;
  totalProducts: number;
  expectedSavings: number;
  badge?: string;
}

interface EventProduct {
  id: string;
  eventId: string;
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
  sold: number;
  isExclusive: boolean;
  isLimitedTime: boolean;
}

interface MegaEventsProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const MegaEvents: React.FC<MegaEventsProps> = ({
  className = '',
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState('active');
  const [countdown, setCountdown] = useState<{[key: string]: number}>({});

  const megaEvents: MegaEvent[] = [
    {
      id: '1',
      title: 'Eid Mega Sale 2025',
      bengaliTitle: 'ঈদ মেগা সেল ২০২৫',
      description: 'Biggest Eid celebration with up to 70% off on everything',
      bengaliDescription: 'সবকিছুতে ৭০% পর্যন্ত ছাড় সহ সবচেয়ে বড় ঈদ উৎসব',
      startDate: '2025-01-12T00:00:00',
      endDate: '2025-01-20T23:59:59',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      bannerImage: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800',
      status: 'active',
      type: 'festival',
      maxDiscount: 70,
      participatingBrands: 2500,
      totalProducts: 150000,
      expectedSavings: 50000000,
      badge: 'LIVE NOW'
    },
    {
      id: '2',
      title: 'Pohela Boishakh Festival',
      bengaliTitle: 'পহেলা বৈশাখ উৎসব',
      description: 'Celebrate Bengali New Year with amazing deals',
      bengaliDescription: 'অসাধারণ অফার সহ বাংলা নববর্ষ উদযাপন করুন',
      startDate: '2025-04-14T00:00:00',
      endDate: '2025-04-16T23:59:59',
      image: 'https://images.unsplash.com/photo-1594736797933-d0ea5ba3b772?w=400',
      bannerImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      status: 'upcoming',
      type: 'festival',
      maxDiscount: 60,
      participatingBrands: 1800,
      totalProducts: 80000,
      expectedSavings: 25000000,
      badge: 'COMING SOON'
    },
    {
      id: '3',
      title: 'GetIt Anniversary Sale',
      bengaliTitle: 'GetIt বার্ষিকী সেল',
      description: '5 years of excellence - Special anniversary celebration',
      bengaliDescription: '৫ বছরের শ্রেষ্ঠত্ব - বিশেষ বার্ষিকী উদযাপন',
      startDate: '2025-03-01T00:00:00',
      endDate: '2025-03-07T23:59:59',
      image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400',
      bannerImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
      status: 'upcoming',
      type: 'anniversary',
      maxDiscount: 75,
      participatingBrands: 3000,
      totalProducts: 200000,
      expectedSavings: 75000000,
      badge: 'ANNIVERSARY'
    },
    {
      id: '4',
      title: 'Winter Clearance Mega Sale',
      bengaliTitle: 'শীতের ক্লিয়ারেন্স মেগা সেল',
      description: 'Clear out winter stock with massive discounts',
      bengaliDescription: 'বিশাল ছাড় সহ শীতের স্টক পরিষ্কার',
      startDate: '2025-01-01T00:00:00',
      endDate: '2025-01-10T23:59:59',
      image: 'https://images.unsplash.com/photo-1544880820-e4d8f2e6ae4a?w=400',
      bannerImage: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800',
      status: 'ended',
      type: 'seasonal',
      maxDiscount: 65,
      participatingBrands: 1200,
      totalProducts: 60000,
      expectedSavings: 20000000,
      badge: 'ENDED'
    }
  ];

  const eventProducts: EventProduct[] = [
    {
      id: '1',
      eventId: '1',
      title: 'Premium Eid Collection Punjabi',
      bengaliTitle: 'প্রিমিয়াম ঈদ কালেকশন পাঞ্জাবি',
      price: 2100,
      originalPrice: 3500,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300',
      category: 'Fashion',
      brand: 'Dhaka Fashion',
      discount: 40,
      rating: 4.7,
      reviews: 234,
      sold: 1247,
      isExclusive: true,
      isLimitedTime: true
    },
    {
      id: '2',
      eventId: '1',
      title: 'Smart Home Security System',
      bengaliTitle: 'স্মার্ট হোম সিকিউরিটি সিস্টেম',
      price: 8500,
      originalPrice: 15000,
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=300',
      category: 'Electronics',
      brand: 'SecureHome',
      discount: 43,
      rating: 4.5,
      reviews: 167,
      sold: 89,
      isExclusive: true,
      isLimitedTime: false
    },
    {
      id: '3',
      eventId: '1',
      title: 'Traditional Bengali Sweets Box',
      bengaliTitle: 'ঐতিহ্যবাহী বাংলা মিষ্টির বাক্স',
      price: 850,
      originalPrice: 1200,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300',
      category: 'Food & Beverage',
      brand: 'Sweet Bengal',
      discount: 29,
      rating: 4.8,
      reviews: 445,
      sold: 567,
      isExclusive: false,
      isLimitedTime: true
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newCountdown: {[key: string]: number} = {};
      
      megaEvents.forEach(event => {
        if (event.status === 'active') {
          const endTime = new Date(event.endDate).getTime();
          newCountdown[event.id] = Math.max(0, endTime - now);
        } else if (event.status === 'upcoming') {
          const startTime = new Date(event.startDate).getTime();
          newCountdown[event.id] = Math.max(0, startTime - now);
        }
      });
      
      setCountdown(newCountdown);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'festival': return <PartyPopper className="w-5 h-5 text-purple-600" />;
      case 'seasonal': return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'anniversary': return <Crown className="w-5 h-5 text-yellow-600" />;
      case 'flash_mega': return <Zap className="w-5 h-5 text-red-600" />;
      default: return <Gift2 className="w-5 h-5 text-green-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'upcoming': return 'bg-blue-500 text-white';
      case 'ended': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const activeEvents = megaEvents.filter(event => event.status === 'active');
  const upcomingEvents = megaEvents.filter(event => event.status === 'upcoming');
  const endedEvents = megaEvents.filter(event => event.status === 'ended');

  return (
    <div className={`mega-events ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {language === 'bn' ? 'মেগা ইভেন্ট' : 'Mega Events'}
              </h1>
              <p className="text-gray-600">
                {language === 'bn' 
                  ? 'বছরের সবচেয়ে বড় সেল এবং উৎসব'
                  : 'Biggest sales and festivals of the year'}
              </p>
            </div>
          </div>

          {/* Live Event Banner */}
          {activeEvents.length > 0 && (
            <Card className="relative overflow-hidden bg-gradient-to-r from-red-500 to-orange-600 text-white">
              <div className="absolute inset-0 opacity-20">
                <img 
                  src={activeEvents[0].bannerImage} 
                  alt={activeEvents[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-white text-red-600 mb-2 animate-pulse">
                      <Sparkles className="w-3 h-3 mr-1" />
                      LIVE NOW
                    </Badge>
                    <h2 className="text-2xl font-bold mb-2">
                      {language === 'bn' && activeEvents[0].bengaliTitle 
                        ? activeEvents[0].bengaliTitle 
                        : activeEvents[0].title}
                    </h2>
                    <p className="text-orange-100">
                      {language === 'bn' && activeEvents[0].bengaliDescription
                        ? activeEvents[0].bengaliDescription
                        : activeEvents[0].description}
                    </p>
                  </div>
                  <div className="text-center">
                    {countdown[activeEvents[0].id] && (() => {
                      const time = formatCountdown(countdown[activeEvents[0].id]);
                      return (
                        <div>
                          <div className="text-3xl font-bold">
                            {time.days}d {time.hours}h {time.minutes}m
                          </div>
                          <div className="text-sm text-orange-200">
                            {language === 'bn' ? 'বাকি সময়' : 'Time Left'}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Event Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {language === 'bn' ? 'লাইভ' : 'Live'} ({activeEvents.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {language === 'bn' ? 'আসছে' : 'Upcoming'} ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="ended" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {language === 'bn' ? 'শেষ' : 'Ended'} ({endedEvents.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Events */}
          <TabsContent value="active">
            {activeEvents.length > 0 ? (
              <div className="space-y-6">
                {activeEvents.map((event) => {
                  const time = countdown[event.id] ? formatCountdown(countdown[event.id]) : null;
                  const eventProductList = eventProducts.filter(p => p.eventId === event.id);

                  return (
                    <Card key={event.id} className="border-2 border-green-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getEventIcon(event.type)}
                            <div>
                              <CardTitle className="text-xl">
                                {language === 'bn' && event.bengaliTitle ? event.bengaliTitle : event.title}
                              </CardTitle>
                              <p className="text-gray-600">
                                {language === 'bn' && event.bengaliDescription ? event.bengaliDescription : event.description}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(event.status)}>
                            {event.badge}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Event Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{event.maxDiscount}%</div>
                            <div className="text-xs text-red-800">
                              {language === 'bn' ? 'সর্বোচ্চ ছাড়' : 'Max Discount'}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{event.participatingBrands.toLocaleString()}</div>
                            <div className="text-xs text-blue-800">
                              {language === 'bn' ? 'ব্র্যান্ড' : 'Brands'}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{(event.totalProducts / 1000).toFixed(0)}K</div>
                            <div className="text-xs text-green-800">
                              {language === 'bn' ? 'পণ্য' : 'Products'}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">৳{(event.expectedSavings / 10000000).toFixed(1)}Cr</div>
                            <div className="text-xs text-purple-800">
                              {language === 'bn' ? 'প্রত্যাশিত সাশ্রয়' : 'Expected Savings'}
                            </div>
                          </div>
                        </div>

                        {/* Countdown */}
                        {time && (
                          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg">
                            <div className="text-center">
                              <div className="text-sm font-medium text-red-800 mb-2">
                                {language === 'bn' ? 'ইভেন্ট শেষ হবে:' : 'Event ends in:'}
                              </div>
                              <div className="flex justify-center gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-red-600">{time.days}</div>
                                  <div className="text-xs text-red-800">
                                    {language === 'bn' ? 'দিন' : 'Days'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-red-600">{time.hours}</div>
                                  <div className="text-xs text-red-800">
                                    {language === 'bn' ? 'ঘন্টা' : 'Hours'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-red-600">{time.minutes}</div>
                                  <div className="text-xs text-red-800">
                                    {language === 'bn' ? 'মিনিট' : 'Minutes'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-red-600">{time.seconds}</div>
                                  <div className="text-xs text-red-800">
                                    {language === 'bn' ? 'সেকেন্ড' : 'Seconds'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Featured Products */}
                        {eventProductList.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">
                              {language === 'bn' ? 'ফিচার্ড পণ্য' : 'Featured Products'}
                            </h4>
                            <div className="grid md:grid-cols-3 gap-4">
                              {eventProductList.slice(0, 3).map((product) => (
                                <Card key={product.id} className="group hover:shadow-lg transition-all">
                                  <div className="relative">
                                    <img 
                                      src={product.image} 
                                      alt={product.title}
                                      className="w-full h-32 object-cover rounded-t-lg"
                                    />
                                    {product.isExclusive && (
                                      <Badge className="absolute top-2 left-2 bg-purple-600 text-white text-xs">
                                        <Crown className="w-3 h-3 mr-1" />
                                        Exclusive
                                      </Badge>
                                    )}
                                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                                      -{product.discount}%
                                    </Badge>
                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                                        <Heart className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <CardContent className="p-3">
                                    <div className="flex items-center gap-1 mb-1">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs">{product.rating}</span>
                                      <span className="text-xs text-gray-500">({product.reviews})</span>
                                    </div>
                                    <h5 className="font-medium text-sm mb-2 line-clamp-2">
                                      {language === 'bn' && product.bengaliTitle ? product.bengaliTitle : product.title}
                                    </h5>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-bold text-green-600">
                                        ৳{product.price.toLocaleString()}
                                      </span>
                                      <span className="text-xs text-gray-500 line-through">
                                        ৳{product.originalPrice.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2">
                                      {product.sold} {language === 'bn' ? 'বিক্রি হয়েছে' : 'sold'}
                                    </div>
                                    <Button size="sm" className="w-full">
                                      <ShoppingCart className="w-3 h-3 mr-1" />
                                      {language === 'bn' ? 'কিনুন' : 'Buy'}
                                    </Button>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          {language === 'bn' ? 'সব অফার দেখুন' : 'View All Offers'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">
                  {language === 'bn' ? 'বর্তমানে কোন লাইভ ইভেন্ট নেই' : 'No live events currently'}
                </h3>
                <p className="text-gray-600">
                  {language === 'bn' ? 'আসছে ইভেন্ট দেখুন' : 'Check upcoming events'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Upcoming Events */}
          <TabsContent value="upcoming">
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => {
                const time = countdown[event.id] ? formatCountdown(countdown[event.id]) : null;

                return (
                  <Card key={event.id} className="border-2 border-blue-200">
                    <div className="relative">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-32 object-cover rounded-t-lg opacity-75"
                      />
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <Badge className="bg-blue-600 text-white">
                          {event.badge}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getEventIcon(event.type)}
                        <h3 className="font-semibold">
                          {language === 'bn' && event.bengaliTitle ? event.bengaliTitle : event.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {language === 'bn' && event.bengaliDescription ? event.bengaliDescription : event.description}
                      </p>
                      
                      {time && (
                        <div className="bg-blue-50 p-3 rounded mb-3">
                          <div className="text-center">
                            <div className="text-sm font-medium text-blue-800 mb-1">
                              {language === 'bn' ? 'শুরু হবে:' : 'Starts in:'}
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {time.days}d {time.hours}h {time.minutes}m
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-bold">{event.maxDiscount}%</div>
                          <div className="text-gray-600">
                            {language === 'bn' ? 'সর্বোচ্চ ছাড়' : 'Max Off'}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-bold">{(event.totalProducts / 1000).toFixed(0)}K</div>
                          <div className="text-gray-600">
                            {language === 'bn' ? 'পণ্য' : 'Products'}
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        {language === 'bn' ? 'রিমাইন্ডার সেট করুন' : 'Set Reminder'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Ended Events */}
          <TabsContent value="ended">
            <div className="grid md:grid-cols-3 gap-4">
              {endedEvents.map((event) => (
                <Card key={event.id} className="opacity-75">
                  <div className="relative">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-24 object-cover rounded-t-lg grayscale"
                    />
                    <Badge className="absolute top-2 right-2 bg-gray-500 text-white">
                      {event.badge}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm mb-2">
                      {language === 'bn' && event.bengaliTitle ? event.bengaliTitle : event.title}
                    </h4>
                    <div className="text-xs text-gray-600">
                      {new Date(event.endDate).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MegaEvents;