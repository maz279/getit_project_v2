/**
 * EnhancedProductDetails - Amazon.com/Shopee.sg-Level Product Details
 * Comprehensive product details with rich media, reviews, Q&A, and comparison
 */

import React, { useState, useEffect } from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { Star, Heart, ShoppingCart, Share2, GitCompare, Truck, Shield, Award, MessageCircle, ChevronLeft, ChevronRight, Play, Pause, Volume2, Info, Eye, ThumbsUp, ThumbsDown, Flag, Plus, Minus, Check, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { useSEO } from '@/shared/hooks/useSEO';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  videos: string[];
  description: string;
  features: string[];
  specifications: Record<string, string>;
  vendor: {
    name: string;
    rating: number;
    logo: string;
    verified: boolean;
  };
  shipping: {
    free: boolean;
    cost: number;
    estimatedDays: number;
    locations: string[];
  };
  warranty: {
    duration: string;
    type: string;
    coverage: string[];
  };
  badges: string[];
  variants: {
    color: string[];
    size: string[];
    storage: string[];
  };
  stock: number;
  category: string;
  subcategory: string;
  tags: string[];
}

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  rating: number;
  title: string;
  content: string;
  images: string[];
  helpful: number;
  date: string;
  verified_purchase: boolean;
}

interface Question {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  question: string;
  answer?: string;
  answeredBy?: string;
  date: string;
  helpful: number;
}

export const EnhancedProductDetails: React.FC = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState({
    color: '',
    size: '',
    storage: ''
  });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock product data - in real app, this would come from API
  const product: Product = {
    id: '1',
    name: 'Samsung Galaxy S24 Ultra 5G Smartphone',
    price: 135000,
    originalPrice: 150000,
    rating: 4.8,
    reviewCount: 1234,
    images: [
      '/api/placeholder/600/600',
      '/api/placeholder/600/600',
      '/api/placeholder/600/600',
      '/api/placeholder/600/600'
    ],
    videos: [
      '/api/placeholder/600/400'
    ],
    description: 'The Samsung Galaxy S24 Ultra redefines smartphone excellence with its cutting-edge AI capabilities, professional-grade camera system, and unmatched performance. Featuring a stunning 6.8" Dynamic AMOLED display, advanced S Pen functionality, and all-day battery life, this flagship device is designed for those who demand the very best.',
    features: [
      'AI-Enhanced Camera System',
      'S Pen Integration',
      '6.8" Dynamic AMOLED Display',
      '5000mAh Battery',
      '5G Connectivity',
      'Water Resistant IP68',
      'Wireless Charging',
      'DeX Support'
    ],
    specifications: {
      'Display': '6.8" Dynamic AMOLED 2X, 120Hz',
      'Processor': 'Snapdragon 8 Gen 3',
      'RAM': '12GB LPDDR5X',
      'Storage': '256GB/512GB/1TB',
      'Camera': '200MP Main + 50MP Periscope + 10MP Telephoto + 12MP Ultra-wide',
      'Front Camera': '12MP',
      'Battery': '5000mAh',
      'OS': 'Android 14 with One UI 6.1',
      'Connectivity': '5G, Wi-Fi 7, Bluetooth 5.3',
      'Dimensions': '162.3 x 79.0 x 8.6 mm',
      'Weight': '232g'
    },
    vendor: {
      name: 'Tech Store BD',
      rating: 4.9,
      logo: '/api/placeholder/50/50',
      verified: true
    },
    shipping: {
      free: true,
      cost: 0,
      estimatedDays: 2,
      locations: ['Dhaka', 'Chittagong', 'Sylhet']
    },
    warranty: {
      duration: '1 Year',
      type: 'Official Warranty',
      coverage: ['Manufacturing Defects', 'Hardware Issues', 'Software Support']
    },
    badges: ['Best Seller', 'Fast Delivery', 'Official Warranty', 'Free Shipping'],
    variants: {
      color: ['Titanium Black', 'Titanium Gray', 'Titanium Violet', 'Titanium Yellow'],
      size: [],
      storage: ['256GB', '512GB', '1TB']
    },
    stock: 25,
    category: 'Electronics',
    subcategory: 'Smartphones',
    tags: ['Samsung', 'Android', 'Flagship', '5G', 'AI Camera']
  };

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      user: {
        name: 'Ahmed Rahman',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      rating: 5,
      title: 'Outstanding flagship experience!',
      content: 'The camera quality is absolutely incredible, especially the night mode. The S Pen functionality is smooth and responsive. Battery life easily lasts a full day with heavy usage.',
      images: ['/api/placeholder/100/100', '/api/placeholder/100/100'],
      helpful: 45,
      date: '2024-01-15',
      verified_purchase: true
    },
    {
      id: '2',
      user: {
        name: 'Fatima Khatun',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      rating: 4,
      title: 'Great phone but expensive',
      content: 'Love the display quality and camera performance. The AI features are impressive. However, the price is quite high. Overall satisfied with the purchase.',
      images: [],
      helpful: 32,
      date: '2024-01-10',
      verified_purchase: true
    }
  ];

  // Mock Q&A data
  const questions: Question[] = [
    {
      id: '1',
      user: {
        name: 'Karim Uddin',
        avatar: '/api/placeholder/40/40'
      },
      question: 'Does this come with official Samsung warranty in Bangladesh?',
      answer: 'Yes, this comes with official Samsung Bangladesh warranty for 1 year.',
      answeredBy: 'Tech Store BD',
      date: '2024-01-20',
      helpful: 28
    },
    {
      id: '2',
      user: {
        name: 'Rashida Begum',
        avatar: '/api/placeholder/40/40'
      },
      question: 'Is the S Pen included in the box?',
      answer: 'Yes, the S Pen is included in the box along with all standard accessories.',
      answeredBy: 'Tech Store BD',
      date: '2024-01-18',
      helpful: 15
    }
  ];

  // SEO optimization
  useSEO({
    title: `${product.name} - Best Price in Bangladesh | GetIt`,
    description: `Buy ${product.name} at the best price in Bangladesh. ${product.description.substring(0, 100)}...`,
    keywords: `${product.name}, ${product.tags.join(', ')}, bangladesh, best price, ${product.vendor.name}`
  });

  const ImageGallery: React.FC = () => (
    <div className="space-y-4">
      <div className="relative">
        <img
          src={product.images[selectedImageIndex]}
          alt={product.name}
          className="w-full h-[500px] object-cover rounded-lg"
        />
        {product.videos.length > 0 && (
          <Button
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
            onClick={() => setShowVideoPlayer(!showVideoPlayer)}
          >
            <Play className="h-4 w-4 mr-2" />
            Watch Video
          </Button>
        )}
        <Button
          variant="ghost"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={() => setSelectedImageIndex(Math.min(product.images.length - 1, selectedImageIndex + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {product.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${product.name} ${index + 1}`}
            className={`w-full h-20 object-cover rounded cursor-pointer transition-all ${
              selectedImageIndex === index ? 'ring-2 ring-blue-500' : 'hover:opacity-80'
            }`}
            onClick={() => setSelectedImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );

  const ProductInfo: React.FC = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
            <span className="text-lg font-semibold ml-1">{product.rating}</span>
            <span className="text-gray-500 ml-2">({product.reviewCount} reviews)</span>
          </div>
          <div className="flex gap-1">
            {product.badges.map((badge, index) => (
              <Badge key={index} variant="secondary">{badge}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl font-bold text-blue-600">৳{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xl text-gray-500 line-through">৳{product.originalPrice.toLocaleString()}</span>
          )}
          {product.originalPrice && (
            <Badge className="bg-red-500 text-white">
              Save ৳{(product.originalPrice - product.price).toLocaleString()}
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="h-4 w-4" />
            <span>{product.shipping.free ? 'Free Shipping' : `Shipping: ৳${product.shipping.cost}`}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4" />
            <span>{product.warranty.duration} {product.warranty.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>In Stock: {product.stock} units available</span>
          </div>
        </div>
      </div>

      {/* Variant Selection */}
      <div className="space-y-4">
        {product.variants.color.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Color</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.color.map((color) => (
                <Button
                  key={color}
                  variant={selectedVariant.color === color ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedVariant({...selectedVariant, color})}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {product.variants.storage.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Storage</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.storage.map((storage) => (
                <Button
                  key={storage}
                  variant={selectedVariant.storage === storage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedVariant({...selectedVariant, storage})}
                >
                  {storage}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quantity and Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 border-t border-b text-center min-w-16">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-gray-600">
            Total: ৳{(product.price * quantity).toLocaleString()}
          </span>
        </div>
        
        <div className="flex gap-4">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Button variant="outline" className="flex-1">
            Buy Now
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            {isWishlisted ? 'Saved' : 'Save'}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <GitCompare className="h-4 w-4 mr-2" />
            Compare
          </Button>
        </div>
      </div>

      {/* Vendor Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <img
              src={product.vendor.logo}
              alt={product.vendor.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{product.vendor.name}</h4>
                {product.vendor.verified && (
                  <Badge variant="secondary">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm ml-1">{product.vendor.rating} seller rating</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View Store
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ProductTabs: React.FC = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
        <TabsTrigger value="qa">Q&A ({questions.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="description" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className={`text-gray-700 leading-relaxed ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                {product.description}
              </p>
              <Button
                variant="link"
                className="p-0"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Show Less' : 'Show More'}
              </Button>
              
              <div>
                <h4 className="font-semibold mb-3">Key Features</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="specifications" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">{key}:</span>
                  <span className="text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reviews" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{product.rating}</div>
                  <div className="flex items-center justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{product.reviewCount} reviews</div>
                </div>
                
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">{rating}★</span>
                      <Progress value={rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2} className="flex-1" />
                      <span className="text-sm text-gray-600 w-8">{rating === 5 ? '70%' : rating === 4 ? '20%' : rating === 3 ? '5%' : rating === 2 ? '3%' : '2%'}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Individual Reviews */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-t pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.user.avatar} />
                        <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{review.user.name}</span>
                          {review.user.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {review.verified_purchase && (
                            <Badge variant="outline" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{review.date}</span>
                        </div>
                        <h4 className="font-semibold mb-2">{review.title}</h4>
                        <p className="text-gray-700 mb-3">{review.content}</p>
                        {review.images.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {review.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Review ${index + 1}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Helpful ({review.helpful})
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Flag className="h-4 w-4 mr-1" />
                            Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="qa" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Questions & Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((qa) => (
                <div key={qa.id} className="border-t pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={qa.user.avatar} />
                      <AvatarFallback>{qa.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{qa.user.name}</span>
                        <span className="text-sm text-gray-600">{qa.date}</span>
                      </div>
                      <div className="mb-3">
                        <span className="text-sm font-medium text-blue-600">Q: </span>
                        <span>{qa.question}</span>
                      </div>
                      {qa.answer && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="mb-2">
                            <span className="text-sm font-medium text-green-600">A: </span>
                            <span>{qa.answer}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Answered by {qa.answeredBy}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm mt-3">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful ({qa.helpful})
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ImageGallery />
          <ProductInfo />
        </div>
        
        <ProductTabs />
      </main>
      
      <Footer />
    </div>
  );
};

export default EnhancedProductDetails;