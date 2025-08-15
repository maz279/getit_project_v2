/**
 * Special Promotions Component
 * Targeted promotional campaigns and special offers
 * Implements Amazon.com/Shopee.sg-level promotional strategies
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Gift, 
  Percent, 
  Users, 
  Crown,
  Star,
  ShoppingCart,
  Heart,
  Copy,
  Share2,
  Calendar,
  Target,
  Sparkles,
  Trophy,
  Zap
} from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  bengaliTitle?: string;
  description: string;
  bengaliDescription?: string;
  type: 'coupon' | 'buyget' | 'bundle' | 'cashback' | 'loyalty' | 'referral';
  code?: string;
  discount: number;
  discountType: 'percentage' | 'fixed' | 'buyget';
  minPurchase?: number;
  maxDiscount?: number;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  isExclusive: boolean;
  targetAudience: 'all' | 'new' | 'premium' | 'frequent';
  image?: string;
  products?: string[];
  categories?: string[];
}

interface PromotionalProduct {
  id: string;
  promotionId: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  bundleItems?: number;
  specialOffer?: string;
}

interface SpecialPromotionsProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const SpecialPromotions: React.FC<SpecialPromotionsProps> = ({
  className = '',
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState('coupons');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const promotions: Promotion[] = [
    {
      id: '1',
      title: 'Welcome New Customer',
      bengaliTitle: 'নতুন গ্রাহক স্বাগতম',
      description: 'Get 25% off on your first order above ৳1000',
      bengaliDescription: '১০০০ টাকার উপরে প্রথম অর্ডারে ২৫% ছাড় পান',
      type: 'coupon',
      code: 'WELCOME25',
      discount: 25,
      discountType: 'percentage',
      minPurchase: 1000,
      maxDiscount: 500,
      validUntil: '2025-12-31',
      usageLimit: 1,
      usedCount: 0,
      isActive: true,
      isExclusive: false,
      targetAudience: 'new'
    },
    {
      id: '2',
      title: 'Buy 2 Get 1 Free',
      bengaliTitle: '২টি কিনুন ১টি ফ্রি পান',
      description: 'Buy any 2 fashion items and get 1 free',
      bengaliDescription: 'যেকোনো ২টি ফ্যাশন আইটেম কিনুন এবং ১টি ফ্রি পান',
      type: 'buyget',
      code: 'FASHION2GET1',
      discount: 33,
      discountType: 'buyget',
      validUntil: '2025-02-28',
      usageLimit: 1000,
      usedCount: 234,
      isActive: true,
      isExclusive: false,
      targetAudience: 'all',
      categories: ['Fashion']
    },
    {
      id: '3',
      title: 'Premium Member Exclusive',
      bengaliTitle: 'প্রিমিয়াম সদস্য এক্সক্লুসিভ',
      description: 'Exclusive 30% off for premium members',
      bengaliDescription: 'প্রিমিয়াম সদস্যদের জন্য এক্সক্লুসিভ ৩০% ছাড়',
      type: 'loyalty',
      code: 'PREMIUM30',
      discount: 30,
      discountType: 'percentage',
      minPurchase: 2000,
      maxDiscount: 1500,
      validUntil: '2025-03-31',
      usageLimit: 5,
      usedCount: 1,
      isActive: true,
      isExclusive: true,
      targetAudience: 'premium'
    },
    {
      id: '4',
      title: 'Electronics Bundle Deal',
      bengaliTitle: 'ইলেকট্রনিক্স বান্ডল ডিল',
      description: 'Save ৳2000 when you buy laptop + accessories',
      bengaliDescription: 'ল্যাপটপ + এক্সেসরিজ কিনলে ২০০০ টাকা সাশ্রয় করুন',
      type: 'bundle',
      code: 'BUNDLE2000',
      discount: 2000,
      discountType: 'fixed',
      minPurchase: 50000,
      validUntil: '2025-01-31',
      usageLimit: 100,
      usedCount: 23,
      isActive: true,
      isExclusive: false,
      targetAudience: 'all',
      categories: ['Electronics']
    },
    {
      id: '5',
      title: 'Cashback Friday',
      bengaliTitle: 'ক্যাশব্যাক ফ্রাইডে',
      description: 'Get 10% cashback on all purchases, max ৳1000',
      bengaliDescription: 'সব কেনাকাটায় ১০% ক্যাশব্যাক, সর্বোচ্চ ১০০০ টাকা',
      type: 'cashback',
      code: 'CASHBACK10',
      discount: 10,
      discountType: 'percentage',
      maxDiscount: 1000,
      validUntil: '2025-01-17',
      usageLimit: 1000,
      usedCount: 567,
      isActive: true,
      isExclusive: false,
      targetAudience: 'all'
    },
    {
      id: '6',
      title: 'Refer a Friend',
      bengaliTitle: 'বন্ধুকে রেফার করুন',
      description: 'You and your friend both get ৳500 off',
      bengaliDescription: 'আপনি এবং আপনার বন্ধু দুজনেই ৫০০ টাকা ছাড় পাবেন',
      type: 'referral',
      code: 'REFER500',
      discount: 500,
      discountType: 'fixed',
      minPurchase: 2000,
      validUntil: '2025-06-30',
      usageLimit: 10,
      usedCount: 3,
      isActive: true,
      isExclusive: false,
      targetAudience: 'all'
    }
  ];

  const promotionalProducts: PromotionalProduct[] = [
    {
      id: '1',
      promotionId: '2',
      title: 'Cotton T-Shirt Collection',
      bengaliTitle: 'কটন টি-শার্ট কালেকশন',
      price: 850,
      originalPrice: 1200,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
      category: 'Fashion',
      brand: 'ComfortWear',
      rating: 4.5,
      reviews: 234,
      bundleItems: 3,
      specialOffer: 'Buy 2 Get 1 Free'
    },
    {
      id: '2',
      promotionId: '4',
      title: 'Gaming Laptop Bundle',
      bengaliTitle: 'গেমিং ল্যাপটপ বান্ডল',
      price: 65000,
      originalPrice: 75000,
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300',
      category: 'Electronics',
      brand: 'TechPro',
      rating: 4.7,
      reviews: 89,
      bundleItems: 5,
      specialOffer: 'Laptop + Mouse + Bag + Cooler + Software'
    }
  ];

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'coupon': return <Percent className="w-5 h-5 text-green-600" />;
      case 'buyget': return <Gift className="w-5 h-5 text-blue-600" />;
      case 'bundle': return <Target className="w-5 h-5 text-purple-600" />;
      case 'cashback': return <Zap className="w-5 h-5 text-orange-600" />;
      case 'loyalty': return <Crown className="w-5 h-5 text-yellow-600" />;
      case 'referral': return <Users className="w-5 h-5 text-pink-600" />;
      default: return <Gift className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'coupon': return 'bg-green-100 text-green-800';
      case 'buyget': return 'bg-blue-100 text-blue-800';
      case 'bundle': return 'bg-purple-100 text-purple-800';
      case 'cashback': return 'bg-orange-100 text-orange-800';
      case 'loyalty': return 'bg-yellow-100 text-yellow-800';
      case 'referral': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = (type: string) => {
    if (language === 'bn') {
      switch (type) {
        case 'coupon': return 'কুপন';
        case 'buyget': return 'কিনুন পান';
        case 'bundle': return 'বান্ডল';
        case 'cashback': return 'ক্যাশব্যাক';
        case 'loyalty': return 'লয়ালটি';
        case 'referral': return 'রেফারেল';
        default: return 'অজানা';
      }
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getAudienceText = (audience: string) => {
    if (language === 'bn') {
      switch (audience) {
        case 'all': return 'সবার জন্য';
        case 'new': return 'নতুন গ্রাহক';
        case 'premium': return 'প্রিমিয়াম সদস্য';
        case 'frequent': return 'নিয়মিত গ্রাহক';
        default: return 'সবার জন্য';
      }
    }
    switch (audience) {
      case 'all': return 'For Everyone';
      case 'new': return 'New Customers';
      case 'premium': return 'Premium Members';
      case 'frequent': return 'Frequent Buyers';
      default: return 'For Everyone';
    }
  };

  const coupons = promotions.filter(p => p.type === 'coupon');
  const buyGetOffers = promotions.filter(p => p.type === 'buyget');
  const bundles = promotions.filter(p => p.type === 'bundle');
  const cashbacks = promotions.filter(p => p.type === 'cashback');
  const loyaltyOffers = promotions.filter(p => p.type === 'loyalty');
  const referrals = promotions.filter(p => p.type === 'referral');

  return (
    <div className={`special-promotions ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {language === 'bn' ? 'বিশেষ প্রমোশন' : 'Special Promotions'}
              </h1>
              <p className="text-gray-600">
                {language === 'bn' 
                  ? 'এক্সক্লুসিভ অফার এবং কুপন কোড'
                  : 'Exclusive offers and coupon codes'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Percent className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{promotions.filter(p => p.isActive).length}</div>
                <div className="text-xs text-gray-600">
                  {language === 'bn' ? 'সক্রিয় অফার' : 'Active Offers'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">{promotions.filter(p => p.isExclusive).length}</div>
                <div className="text-xs text-gray-600">
                  {language === 'bn' ? 'এক্সক্লুসিভ' : 'Exclusive'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">70%</div>
                <div className="text-xs text-gray-600">
                  {language === 'bn' ? 'সর্বোচ্চ ছাড়' : 'Max Discount'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">12K+</div>
                <div className="text-xs text-gray-600">
                  {language === 'bn' ? 'ব্যবহারকারী' : 'Users Saved'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Promotion Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6">
            <TabsTrigger value="coupons" className="flex items-center gap-1">
              <Percent className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'কুপন' : 'Coupons'}</span>
            </TabsTrigger>
            <TabsTrigger value="buyget" className="flex items-center gap-1">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'কিনুন পান' : 'Buy & Get'}</span>
            </TabsTrigger>
            <TabsTrigger value="bundles" className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'বান্ডল' : 'Bundles'}</span>
            </TabsTrigger>
            <TabsTrigger value="cashback" className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'ক্যাশব্যাক' : 'Cashback'}</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-1">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'লয়ালটি' : 'Loyalty'}</span>
            </TabsTrigger>
            <TabsTrigger value="referral" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'রেফারেল' : 'Referral'}</span>
            </TabsTrigger>
          </TabsList>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <div className="grid md:grid-cols-2 gap-4">
              {coupons.map((promo) => (
                <Card key={promo.id} className="group hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getPromotionIcon(promo.type)}
                        <div>
                          <h3 className="font-semibold">
                            {language === 'bn' && promo.bengaliTitle ? promo.bengaliTitle : promo.title}
                          </h3>
                          <Badge className={getTypeColor(promo.type)}>
                            {getTypeName(promo.type)}
                          </Badge>
                        </div>
                      </div>
                      {promo.isExclusive && (
                        <Badge className="bg-purple-600 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          {language === 'bn' ? 'এক্সক্লুসিভ' : 'Exclusive'}
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">
                      {language === 'bn' && promo.bengaliDescription ? promo.bengaliDescription : promo.description}
                    </p>

                    {/* Coupon Code */}
                    {promo.code && (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              {language === 'bn' ? 'কুপন কোড' : 'Coupon Code'}
                            </div>
                            <div className="text-lg font-bold text-green-600">{promo.code}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(promo.code!)}
                            className={copiedCode === promo.code ? 'bg-green-100 text-green-600' : ''}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            {copiedCode === promo.code 
                              ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied')
                              : (language === 'bn' ? 'কপি' : 'Copy')
                            }
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex justify-between">
                        <span>{language === 'bn' ? 'ছাড়:' : 'Discount:'}</span>
                        <span className="font-medium">
                          {promo.discountType === 'percentage' ? `${promo.discount}%` : `৳${promo.discount}`}
                          {promo.maxDiscount && ` (max ৳${promo.maxDiscount})`}
                        </span>
                      </div>
                      {promo.minPurchase && (
                        <div className="flex justify-between">
                          <span>{language === 'bn' ? 'মিনিমাম:' : 'Min Purchase:'}</span>
                          <span className="font-medium">৳{promo.minPurchase}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>{language === 'bn' ? 'শেষ তারিখ:' : 'Valid Until:'}</span>
                        <span className="font-medium">{new Date(promo.validUntil).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'bn' ? 'লক্ষ্য:' : 'Target:'}</span>
                        <span className="font-medium">{getAudienceText(promo.targetAudience)}</span>
                      </div>
                    </div>

                    {/* Usage Progress */}
                    {promo.usageLimit && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{language === 'bn' ? 'ব্যবহৃত' : 'Used'}</span>
                          <span>{promo.usedCount} / {promo.usageLimit}</span>
                        </div>
                        <Progress value={(promo.usedCount / promo.usageLimit) * 100} className="h-1" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button className="flex-1">
                        {language === 'bn' ? 'এখনই ব্যবহার করুন' : 'Use Now'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Buy & Get Tab */}
          <TabsContent value="buyget">
            <div className="space-y-6">
              {buyGetOffers.map((promo) => {
                const products = promotionalProducts.filter(p => p.promotionId === promo.id);

                return (
                  <Card key={promo.id} className="border-2 border-blue-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPromotionIcon(promo.type)}
                          <div>
                            <CardTitle>
                              {language === 'bn' && promo.bengaliTitle ? promo.bengaliTitle : promo.title}
                            </CardTitle>
                            <p className="text-gray-600">
                              {language === 'bn' && promo.bengaliDescription ? promo.bengaliDescription : promo.description}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-blue-600 text-white">
                          {promo.code}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {products.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-4">
                          {products.map((product) => (
                            <Card key={product.id} className="group hover:shadow-md transition-all">
                              <div className="relative">
                                <img 
                                  src={product.image} 
                                  alt={product.title}
                                  className="w-full h-32 object-cover rounded-t-lg"
                                />
                                <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                                  {product.specialOffer}
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
                                <h4 className="font-medium text-sm mb-2 line-clamp-2">
                                  {language === 'bn' && product.bengaliTitle ? product.bengaliTitle : product.title}
                                </h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-bold text-blue-600">
                                    ৳{product.price.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-500 line-through">
                                    ৳{product.originalPrice.toLocaleString()}
                                  </span>
                                </div>
                                <Button size="sm" className="w-full">
                                  <ShoppingCart className="w-3 h-3 mr-1" />
                                  {language === 'bn' ? 'অফার পান' : 'Get Offer'}
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Other tabs would be similar... */}
          {/* For brevity, I'll just show the structure for the remaining tabs */}
          
          <TabsContent value="bundles">
            <div className="grid md:grid-cols-2 gap-4">
              {bundles.map((promo) => (
                <Card key={promo.id} className="border-2 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {getPromotionIcon(promo.type)}
                      <div>
                        <h3 className="font-semibold">
                          {language === 'bn' && promo.bengaliTitle ? promo.bengaliTitle : promo.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {language === 'bn' && promo.bengaliDescription ? promo.bengaliDescription : promo.description}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      {language === 'bn' ? 'বান্ডল দেখুন' : 'View Bundle'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cashback">
            <div className="grid md:grid-cols-2 gap-4">
              {cashbacks.map((promo) => (
                <Card key={promo.id} className="border-2 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {getPromotionIcon(promo.type)}
                      <div>
                        <h3 className="font-semibold">
                          {language === 'bn' && promo.bengaliTitle ? promo.bengaliTitle : promo.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {language === 'bn' && promo.bengaliDescription ? promo.bengaliDescription : promo.description}
                        </p>
                      </div>
                    </div>
                    {promo.code && (
                      <div className="bg-orange-50 p-2 rounded mb-3 text-center">
                        <div className="font-bold text-orange-600">{promo.code}</div>
                      </div>
                    )}
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      {language === 'bn' ? 'ক্যাশব্যাক পান' : 'Get Cashback'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="loyalty">
            <div className="grid md:grid-cols-2 gap-4">
              {loyaltyOffers.map((promo) => (
                <Card key={promo.id} className="border-2 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {getPromotionIcon(promo.type)}
                      <div>
                        <h3 className="font-semibold">
                          {language === 'bn' && promo.bengaliTitle ? promo.bengaliTitle : promo.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {language === 'bn' && promo.bengaliDescription ? promo.bengaliDescription : promo.description}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                      {language === 'bn' ? 'সদস্য হোন' : 'Become Member'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="referral">
            <div className="grid md:grid-cols-2 gap-4">
              {referrals.map((promo) => (
                <Card key={promo.id} className="border-2 border-pink-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {getPromotionIcon(promo.type)}
                      <div>
                        <h3 className="font-semibold">
                          {language === 'bn' && promo.bengaliTitle ? promo.bengaliTitle : promo.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {language === 'bn' && promo.bengaliDescription ? promo.bengaliDescription : promo.description}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full bg-pink-600 hover:bg-pink-700">
                      {language === 'bn' ? 'বন্ধুদের আমন্ত্রণ জানান' : 'Invite Friends'}
                    </Button>
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

export default SpecialPromotions;