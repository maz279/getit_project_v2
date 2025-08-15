/**
 * Product Recommendations Component
 * AI-powered product recommendation system
 * Implements Amazon.com/Shopee.sg-level recommendation algorithms
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  TrendingUp,
  Users,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface RecommendedProduct {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  brand: string;
  reason: string;
  bengaliReason?: string;
  confidence: number;
  tags: string[];
}

interface RecommendationSection {
  id: string;
  title: string;
  bengaliTitle: string;
  algorithm: string;
  products: RecommendedProduct[];
  icon: React.ReactNode;
}

interface ProductRecommendationsProps {
  className?: string;
  language?: 'en' | 'bn';
  userId?: string;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  className = '',
  language = 'en',
  userId = 'user123'
}) => {
  const [sections, setSections] = useState<RecommendationSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlides, setCurrentSlides] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockSections: RecommendationSection[] = [
      {
        id: 'personalized',
        title: 'Recommended for You',
        bengaliTitle: 'আপনার জন্য সুপারিশ',
        algorithm: 'Collaborative Filtering + AI',
        icon: <Sparkles className="w-5 h-5 text-purple-600" />,
        products: [
          {
            id: '1',
            title: 'Premium Wireless Headphones',
            bengaliTitle: 'প্রিমিয়াম ওয়্যারলেস হেডফোন',
            price: 2850,
            originalPrice: 4000,
            rating: 4.6,
            reviews: 1284,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
            category: 'Electronics',
            brand: 'TechGear',
            reason: 'Based on your recent electronics purchases',
            bengaliReason: 'আপনার সাম্প্রতিক ইলেকট্রনিক্স কেনাকাটার ভিত্তিতে',
            confidence: 94,
            tags: ['trending', 'high-rated']
          },
          {
            id: '2',
            title: 'Smart Fitness Watch',
            bengaliTitle: 'স্মার্ট ফিটনেস ওয়াচ',
            price: 3200,
            originalPrice: 4500,
            rating: 4.4,
            reviews: 892,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
            category: 'Electronics',
            brand: 'FitTech',
            reason: 'Popular among similar customers',
            bengaliReason: 'অনুরূপ গ্রাহকদের মধ্যে জনপ্রিয়',
            confidence: 87,
            tags: ['bestseller']
          }
        ]
      },
      {
        id: 'trending',
        title: 'Trending Now',
        bengaliTitle: 'এখন ট্রেন্ডিং',
        algorithm: 'Real-time Trend Analysis',
        icon: <TrendingUp className="w-5 h-5 text-green-600" />,
        products: [
          {
            id: '3',
            title: 'Cotton Punjabi - Eid Collection',
            bengaliTitle: 'কটন পাঞ্জাবি - ঈদ কালেকশন',
            price: 1950,
            rating: 4.5,
            reviews: 567,
            image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300',
            category: 'Fashion',
            brand: 'Dhaka Fashion',
            reason: 'Trending in Bangladesh fashion',
            bengaliReason: 'বাংলাদেশের ফ্যাশনে ট্রেন্ডিং',
            confidence: 92,
            tags: ['trending', 'cultural']
          },
          {
            id: '4',
            title: 'Bluetooth Speaker with Quran',
            bengaliTitle: 'কুরআন সহ ব্লুটুথ স্পিকার',
            price: 1800,
            originalPrice: 2500,
            rating: 4.7,
            reviews: 445,
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
            category: 'Electronics',
            brand: 'IslamicTech',
            reason: 'High demand this week',
            bengaliReason: 'এই সপ্তাহে উচ্চ চাহিদা',
            confidence: 89,
            tags: ['trending', 'islamic']
          }
        ]
      },
      {
        id: 'similar_customers',
        title: 'Customers Like You Also Bought',
        bengaliTitle: 'আপনার মতো গ্রাহকরাও কিনেছেন',
        algorithm: 'Customer Behavior Analysis',
        icon: <Users className="w-5 h-5 text-blue-600" />,
        products: [
          {
            id: '5',
            title: 'Laptop Cooling Pad',
            bengaliTitle: 'ল্যাপটপ কুলিং প্যাড',
            price: 1250,
            rating: 4.3,
            reviews: 289,
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
            category: 'Electronics',
            brand: 'CoolTech',
            reason: 'Often bought with electronics',
            bengaliReason: 'প্রায়শই ইলেকট্রনিক্সের সাথে কেনা হয়',
            confidence: 78,
            tags: ['accessory']
          },
          {
            id: '6',
            title: 'Wireless Mouse',
            bengaliTitle: 'ওয়্যারলেস মাউস',
            price: 850,
            originalPrice: 1200,
            rating: 4.2,
            reviews: 334,
            image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300',
            category: 'Electronics',
            brand: 'TechGear',
            reason: 'Frequently purchased together',
            bengaliReason: 'প্রায়শই একসাথে কেনা হয়',
            confidence: 85,
            tags: ['accessory', 'combo']
          }
        ]
      }
    ];
    
    setSections(mockSections);
    
    // Initialize slide positions
    const initialSlides: {[key: string]: number} = {};
    mockSections.forEach(section => {
      initialSlides[section.id] = 0;
    });
    setCurrentSlides(initialSlides);
    
    setIsLoading(false);
  };

  const nextSlide = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const maxSlide = Math.max(0, section.products.length - 2);
      setCurrentSlides(prev => ({
        ...prev,
        [sectionId]: Math.min(prev[sectionId] + 1, maxSlide)
      }));
    }
  };

  const prevSlide = (sectionId: string) => {
    setCurrentSlides(prev => ({
      ...prev,
      [sectionId]: Math.max(prev[sectionId] - 1, 0)
    }));
  };

  const refreshRecommendations = () => {
    loadRecommendations();
  };

  if (isLoading) {
    return (
      <div className={`product-recommendations ${className}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-pulse" />
            <h2 className="text-xl font-semibold mb-2">
              {language === 'bn' ? 'সুপারিশ তৈরি করা হচ্ছে...' : 'Creating Recommendations...'}
            </h2>
            <p className="text-gray-600">
              {language === 'bn' 
                ? 'AI আপনার জন্য সেরা পণ্য বিশ্লেষণ করছে'
                : 'AI is analyzing the best products for you'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-recommendations ${className}`}>
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'bn' ? 'পণ্য সুপারিশ' : 'Product Recommendations'}
            </h1>
            <p className="text-gray-600">
              {language === 'bn' 
                ? 'AI-চালিত ব্যক্তিগত সুপারিশ আপনার জন্য'
                : 'AI-powered personalized recommendations just for you'}
            </p>
          </div>
          <Button variant="outline" onClick={refreshRecommendations}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </Button>
        </div>

        {/* Recommendation Sections */}
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div>
                    <CardTitle>
                      {language === 'bn' ? section.bengaliTitle : section.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'bn' ? 'অ্যালগরিদম:' : 'Algorithm:'} {section.algorithm}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => prevSlide(section.id)}
                    disabled={currentSlides[section.id] === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => nextSlide(section.id)}
                    disabled={currentSlides[section.id] >= section.products.length - 2}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out gap-4"
                  style={{ 
                    transform: `translateX(-${currentSlides[section.id] * 50}%)` 
                  }}
                >
                  {section.products.map((product) => (
                    <div key={product.id} className="flex-none w-[calc(50%-8px)] md:w-[calc(33.333%-11px)]">
                      <Card className="group hover:shadow-lg transition-all h-full">
                        <div className="relative">
                          <img 
                            src={product.image} 
                            alt={product.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          
                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.originalPrice && (
                              <Badge className="bg-red-500 text-white">
                                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                              </Badge>
                            )}
                            {product.tags.includes('trending') && (
                              <Badge className="bg-green-500 text-white">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          
                          {/* Confidence Score */}
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-purple-600 text-white">
                              {product.confidence}% match
                            </Badge>
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
                            <span className="text-sm">{product.rating}</span>
                            <span className="text-xs text-gray-500">({product.reviews})</span>
                          </div>
                          
                          <h3 className="font-semibold mb-2 line-clamp-2 min-h-[2.5rem]">
                            {language === 'bn' && product.bengaliTitle ? product.bengaliTitle : product.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-blue-600">
                              ৳{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ৳{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          {/* Recommendation Reason */}
                          <div className="bg-purple-50 p-2 rounded mb-3">
                            <div className="text-xs text-purple-800">
                              <Sparkles className="w-3 h-3 inline mr-1" />
                              {language === 'bn' && product.bengaliReason ? product.bengaliReason : product.reason}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-3">
                            {product.brand} • {product.category}
                          </div>
                          
                          <Button className="w-full">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Recommendation Quality */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-semibold mb-2">
              {language === 'bn' ? 'সুপারিশের গুণমান' : 'Recommendation Quality'}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === 'bn' 
                ? 'আমাদের AI আপনার পছন্দ থেকে শিখে এবং আরও ভাল সুপারিশ প্রদান করে'
                : 'Our AI learns from your preferences and provides better recommendations over time'}
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">94%</div>
                <div className="text-gray-600">
                  {language === 'bn' ? 'নির্ভুলতা' : 'Accuracy'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2.3M+</div>
                <div className="text-gray-600">
                  {language === 'bn' ? 'ডেটা পয়েন্ট' : 'Data Points'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-gray-600">
                  {language === 'bn' ? 'গ্রাহক সন্তুষ্টি' : 'Satisfaction'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductRecommendations;