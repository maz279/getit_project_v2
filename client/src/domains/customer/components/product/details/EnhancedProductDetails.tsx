/**
 * Amazon.com/Shopee.sg-Level Enhanced Product Details
 * Comprehensive product page with media gallery, specifications, reviews
 * Implements enterprise-grade product experience with cultural optimization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Truck,
  Shield,
  Award,
  MessageCircle,
  Camera,
  Play,
  Plus,
  Minus,
  MapPin,
  Clock,
  CheckCircle
} from 'lucide-react';

interface ProductMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
}

interface ProductSpec {
  category: string;
  specs: Array<{
    label: string;
    value: string;
    bengaliLabel?: string;
    bengaliValue?: string;
  }>;
}

interface ProductReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

interface EnhancedProductDetailsProps {
  productId?: string;
  className?: string;
  language?: 'en' | 'bn';
}

export const EnhancedProductDetails: React.FC<EnhancedProductDetailsProps> = ({
  productId = 'product_12345',
  className = '',
  language = 'en'
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('default');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const productData = {
    id: productId,
    title: 'Premium Wireless Bluetooth Headphones with Active Noise Cancellation',
    bengaliTitle: 'অ্যাক্টিভ নয়েজ ক্যান্সেলেশন সহ প্রিমিয়াম ওয়্যারলেস ব্লুটুথ হেডফোন',
    price: 2850,
    originalPrice: 4000,
    discount: 29,
    rating: 4.6,
    reviewCount: 1284,
    soldCount: 2547,
    availability: 'In Stock',
    brand: 'TechGear BD',
    category: 'Electronics > Audio > Headphones',
    sku: 'TG-WH-001',
    tags: ['wireless', 'bluetooth', 'noise-cancelling', 'premium']
  };

  const mediaGallery: ProductMedia[] = [
    {
      id: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      caption: 'Front view'
    },
    {
      id: '2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
      caption: 'Side view'
    },
    {
      id: '3',
      type: 'video',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
      caption: 'Product demonstration'
    },
    {
      id: '4',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=600',
      caption: 'Unboxing contents'
    }
  ];

  const specifications: ProductSpec[] = [
    {
      category: 'Audio',
      specs: [
        { label: 'Driver Size', value: '40mm', bengaliLabel: 'ড্রাইভার সাইজ', bengaliValue: '৪০মিমি' },
        { label: 'Frequency Response', value: '20Hz - 20kHz', bengaliLabel: 'ফ্রিকুয়েন্সি রেসপন্স', bengaliValue: '২০হার্জ - ২০কিলোহার্জ' },
        { label: 'Impedance', value: '32 Ohms', bengaliLabel: 'প্রতিবন্ধকতা', bengaliValue: '৩২ ওহম' }
      ]
    },
    {
      category: 'Connectivity',
      specs: [
        { label: 'Bluetooth Version', value: '5.2', bengaliLabel: 'ব্লুটুথ ভার্সন', bengaliValue: '৫.২' },
        { label: 'Range', value: '10 meters', bengaliLabel: 'পরিসীমা', bengaliValue: '১০ মিটার' },
        { label: 'Codecs', value: 'SBC, AAC, aptX', bengaliLabel: 'কোডেক', bengaliValue: 'এসবিসি, এএসি, এপটিএক্স' }
      ]
    },
    {
      category: 'Battery',
      specs: [
        { label: 'Battery Life', value: '30 hours', bengaliLabel: 'ব্যাটারি লাইফ', bengaliValue: '৩০ ঘন্টা' },
        { label: 'Charging Time', value: '2 hours', bengaliLabel: 'চার্জিং টাইম', bengaliValue: '২ ঘন্টা' },
        { label: 'Quick Charge', value: '15 min = 3 hours', bengaliLabel: 'দ্রুত চার্জ', bengaliValue: '১৫ মিনিট = ৩ ঘন্টা' }
      ]
    }
  ];

  const reviews: ProductReview[] = [
    {
      id: '1',
      customerName: 'আহমেদ হাসান',
      rating: 5,
      comment: 'অসাধারণ সাউন্ড কোয়ালিটি। নয়েজ ক্যান্সেলেশন খুবই ভাল কাজ করে। দাম অনুযায়ী পারফেক্ট।',
      date: '2025-01-10',
      verified: true,
      helpful: 23,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200']
    },
    {
      id: '2',
      customerName: 'ফাতেমা খাতুন',
      rating: 4,
      comment: 'Very good headphones. Comfortable for long use. Battery life is excellent.',
      date: '2025-01-08',
      verified: true,
      helpful: 18
    },
    {
      id: '3',
      customerName: 'রহিম উদ্দিন',
      rating: 5,
      comment: 'টাকার বিনিময়ে সেরা হেডফোন। দ্রুত ডেলিভারি পেয়েছি। প্যাকেজিং ও ভাল ছিল।',
      date: '2025-01-05',
      verified: true,
      helpful: 15
    }
  ];

  const handleAddToCart = () => {
    // Add to cart logic
    console.log('Added to cart:', { productId, quantity, variant: selectedVariant });
  };

  const handleBuyNow = () => {
    // Buy now logic
    console.log('Buy now:', { productId, quantity, variant: selectedVariant });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className={`enhanced-product-details ${className}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Media Gallery */}
          <div className="space-y-4">
            {/* Main Media Display */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {mediaGallery[selectedImage]?.type === 'video' ? (
                <div className="relative w-full h-full">
                  {showVideoPlayer ? (
                    <video
                      controls
                      className="w-full h-full object-cover"
                      src={mediaGallery[selectedImage].url}
                    />
                  ) : (
                    <div 
                      className="relative w-full h-full cursor-pointer group"
                      onClick={() => setShowVideoPlayer(true)}
                    >
                      <img 
                        src={mediaGallery[selectedImage].thumbnail} 
                        alt={mediaGallery[selectedImage].caption}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-colors">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-blue-600 ml-1" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <img 
                  src={mediaGallery[selectedImage]?.url} 
                  alt={mediaGallery[selectedImage]?.caption}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Wishlist Button */}
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 bg-white"
                onClick={handleWishlist}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto">
              {mediaGallery.map((media, index) => (
                <div
                  key={media.id}
                  className={`relative w-20 h-20 border-2 rounded-lg overflow-hidden cursor-pointer ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedImage(index);
                    setShowVideoPlayer(false);
                  }}
                >
                  <img 
                    src={media.type === 'video' ? media.thumbnail : media.url} 
                    alt={media.caption}
                    className="w-full h-full object-cover"
                  />
                  {media.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-600 text-white">{productData.brand}</Badge>
                <Badge variant="outline">{productData.availability}</Badge>
              </div>
              
              <h1 className="text-2xl font-bold mb-2">
                {language === 'bn' && productData.bengaliTitle ? productData.bengaliTitle : productData.title}
              </h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{productData.rating}</span>
                </div>
                <span className="text-gray-600">({productData.reviewCount} reviews)</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{productData.soldCount} sold</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-b pb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-red-600">
                  ৳{productData.price.toLocaleString()}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ৳{productData.originalPrice.toLocaleString()}
                </span>
                <Badge className="bg-red-500 text-white">-{productData.discount}%</Badge>
              </div>
              <div className="text-sm text-green-600">
                {language === 'bn' 
                  ? `আপনি সাশ্রয় করছেন ৳${(productData.originalPrice - productData.price).toLocaleString()}`
                  : `You save ৳${(productData.originalPrice - productData.price).toLocaleString()}`}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === 'bn' ? 'পরিমাণ' : 'Quantity'}
                </label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center border rounded px-3 py-1">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                </Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleBuyNow}>
                  {language === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Delivery & Service Info */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">
                    {language === 'bn' ? 'বিনামূল্যে ডেলিভারি' : 'Free Delivery'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'bn' ? 'ঢাকায় ২৪ ঘন্টায়' : 'Within 24 hours in Dhaka'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">
                    {language === 'bn' ? '৭ দিনের রিটার্ন' : '7 Day Returns'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'bn' ? 'সহজ রিটার্ন নীতি' : 'Easy return policy'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium">
                    {language === 'bn' ? 'আসল পণ্যের গ্যারান্টি' : 'Authenticity Guaranteed'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'bn' ? '১০০% অরিজিনাল পণ্য' : '100% original products'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">
                {language === 'bn' ? 'বিবরণ' : 'Description'}
              </TabsTrigger>
              <TabsTrigger value="specifications">
                {language === 'bn' ? 'স্পেসিফিকেশন' : 'Specifications'}
              </TabsTrigger>
              <TabsTrigger value="reviews">
                {language === 'bn' ? 'রিভিউ' : 'Reviews'} ({productData.reviewCount})
              </TabsTrigger>
              <TabsTrigger value="qa">
                {language === 'bn' ? 'প্রশ্ন উত্তর' : 'Q&A'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-4">
                      {language === 'bn' ? 'পণ্যের বিবরণ' : 'Product Description'}
                    </h3>
                    <p className="mb-4">
                      Experience premium audio quality with our latest wireless Bluetooth headphones featuring 
                      active noise cancellation technology. Designed for comfort and performance, these headphones 
                      deliver exceptional sound clarity and up to 30 hours of battery life.
                    </p>
                    <p className="mb-4">
                      {language === 'bn' && (
                        <>
                          আমাদের সর্বশেষ ওয়্যারলেস ব্লুটুথ হেডফোনের সাথে প্রিমিয়াম অডিও কোয়ালিটির অভিজ্ঞতা নিন 
                          যা অ্যাক্টিভ নয়েজ ক্যান্সেলেশন প্রযুক্তি সহ আসে। আরাম এবং পারফরমেন্সের জন্য ডিজাইন করা 
                          এই হেডফোনগুলি ব্যতিক্রমী সাউন্ড স্বচ্ছতা এবং ৩০ ঘন্টা পর্যন্ত ব্যাটারি লাইফ প্রদান করে।
                        </>
                      )}
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Advanced 40mm drivers for rich, detailed sound</li>
                      <li>Active noise cancellation reduces ambient noise by up to 90%</li>
                      <li>30-hour battery life with quick charge support</li>
                      <li>Comfortable over-ear design for extended use</li>
                      <li>Built-in microphone for hands-free calls</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <div className="space-y-4">
                {specifications.map((spec, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{spec.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {spec.specs.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">
                              {language === 'bn' && item.bengaliLabel ? item.bengaliLabel : item.label}:
                            </span>
                            <span>
                              {language === 'bn' && item.bengaliValue ? item.bengaliValue : item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Review Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold">{productData.rating}</div>
                        <div className="flex justify-center mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">
                          {productData.reviewCount} {language === 'bn' ? 'রিভিউ' : 'reviews'}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-2 mb-1">
                            <span className="w-3">{rating}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ width: `${Math.random() * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">
                              {Math.floor(Math.random() * 500)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {review.customerName.charAt(0)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.customerName}</span>
                              {review.verified && (
                                <Badge className="bg-green-600 text-white text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              <span className="text-sm text-gray-600">{review.date}</span>
                            </div>
                            
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
                            </div>
                            
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            
                            {review.images && (
                              <div className="flex gap-2 mb-3">
                                {review.images.map((image, idx) => (
                                  <img 
                                    key={idx}
                                    src={image} 
                                    alt="Review image"
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {language === 'bn' ? 'উত্তর' : 'Reply'}
                              </Button>
                              <span>{review.helpful} {language === 'bn' ? 'জন সহায়ক মনে করেছেন' : 'found this helpful'}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">
                      {language === 'bn' ? 'এখনো কোন প্রশ্ন নেই' : 'No questions yet'}
                    </h3>
                    <p className="mb-4">
                      {language === 'bn' 
                        ? 'এই পণ্য সম্পর্কে প্রথম প্রশ্ন করুন'
                        : 'Be the first to ask a question about this product'}
                    </p>
                    <Button>
                      {language === 'bn' ? 'প্রশ্ন করুন' : 'Ask a Question'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductDetails;