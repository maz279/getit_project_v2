/**
 * Amazon.com/Shopee.sg-Level Deals Hub Component
 * Consolidates flash sales, mega sales, and daily deals into unified interface
 * Implements enterprise-grade deal discovery with cultural optimization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Clock, Flame, Star, Gift, Zap, Crown } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  timeLeft: string;
  image: string;
  category: string;
  rating: number;
  sold: number;
  isFlashSale: boolean;
  isMegaSale: boolean;
  isDailyDeal: boolean;
  bengaliTitle?: string;
}

interface DealsHubProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const DealsHub: React.FC<DealsHubProps> = ({ 
  className = '',
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState('flash-sales');
  const [timeLeft, setTimeLeft] = useState('23:45:30');
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    // Simulate deal loading with enterprise-grade data
    const mockDeals: Deal[] = [
      {
        id: '1',
        title: 'Premium Smartphone 128GB',
        bengaliTitle: 'প্রিমিয়াম স্মার্টফোন ১২৮জিবি',
        originalPrice: 45000,
        salePrice: 32000,
        discount: 29,
        timeLeft: '02:15:30',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
        category: 'Electronics',
        rating: 4.5,
        sold: 1250,
        isFlashSale: true,
        isMegaSale: false,
        isDailyDeal: false
      },
      {
        id: '2',
        title: 'Traditional Bangladeshi Saree',
        bengaliTitle: 'ঐতিহ্যবাহী বাংলাদেশী শাড়ি',
        originalPrice: 8500,
        salePrice: 5100,
        discount: 40,
        timeLeft: '01:30:45',
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300',
        category: 'Fashion',
        rating: 4.8,
        sold: 856,
        isFlashSale: false,
        isMegaSale: true,
        isDailyDeal: false
      },
      {
        id: '3',
        title: 'Basmati Rice 5KG',
        bengaliTitle: 'বাসমতি চাল ৫কেজি',
        originalPrice: 1200,
        salePrice: 950,
        discount: 21,
        timeLeft: '18:25:10',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
        category: 'Grocery',
        rating: 4.3,
        sold: 2340,
        isFlashSale: false,
        isMegaSale: false,
        isDailyDeal: true
      }
    ];
    setDeals(mockDeals);
  }, []);

  const renderDealCard = (deal: Deal) => (
    <Card key={deal.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
      <div className="relative overflow-hidden">
        <img 
          src={deal.image} 
          alt={deal.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          {deal.isFlashSale && (
            <Badge className="bg-red-500 text-white">
              <Flame className="w-3 h-3 mr-1" />
              Flash
            </Badge>
          )}
          {deal.isMegaSale && (
            <Badge className="bg-purple-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Mega
            </Badge>
          )}
          {deal.isDailyDeal && (
            <Badge className="bg-green-500 text-white">
              <Gift className="w-3 h-3 mr-1" />
              Daily
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <Badge className="bg-orange-500 text-white font-bold">
            -{deal.discount}%
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
          {language === 'bn' && deal.bengaliTitle ? deal.bengaliTitle : deal.title}
        </h3>
        
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-600">{deal.rating}</span>
          <span className="text-xs text-gray-500">({deal.sold} sold)</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-red-600">
            ৳{deal.salePrice.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 line-through">
            ৳{deal.originalPrice.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-red-600">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">{deal.timeLeft}</span>
          </div>
          <Button size="sm" className="text-xs">
            {language === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`deals-hub ${className}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'bn' ? 'বিশেষ ছাড়ের অফার' : 'Special Deals & Offers'}
            </h1>
            <p className="text-gray-600">
              {language === 'bn' 
                ? 'সীমিত সময়ের জন্য বিশেষ ছাড় - দ্রুত কিনুন!' 
                : 'Limited time offers - Grab them before they\'re gone!'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">
              {language === 'bn' ? 'শেষ হওয়ার সময়' : 'Deals end in'}
            </div>
            <div className="text-2xl font-bold text-red-600">{timeLeft}</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="flash-sales" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              {language === 'bn' ? 'ফ্ল্যাশ সেল' : 'Flash Sales'}
            </TabsTrigger>
            <TabsTrigger value="mega-sales" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              {language === 'bn' ? 'মেগা সেল' : 'Mega Sales'}
            </TabsTrigger>
            <TabsTrigger value="daily-deals" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              {language === 'bn' ? 'দৈনিক অফার' : 'Daily Deals'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flash-sales" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {deals
                .filter(deal => deal.isFlashSale)
                .map(renderDealCard)}
            </div>
          </TabsContent>

          <TabsContent value="mega-sales" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {deals
                .filter(deal => deal.isMegaSale)
                .map(renderDealCard)}
            </div>
          </TabsContent>

          <TabsContent value="daily-deals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {deals
                .filter(deal => deal.isDailyDeal)
                .map(renderDealCard)}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">2,456</div>
            <div className="text-sm text-gray-600">
              {language === 'bn' ? 'চলমান ডিল' : 'Active Deals'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="text-sm text-gray-600">
              {language === 'bn' ? 'সর্বোচ্চ ছাড়' : 'Max Discount'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">12,350</div>
            <div className="text-sm text-gray-600">
              {language === 'bn' ? 'আজকের বিক্রি' : 'Today\'s Sales'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">৳2.5L</div>
            <div className="text-sm text-gray-600">
              {language === 'bn' ? 'মোট সঞ্চয়' : 'Total Savings'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealsHub;