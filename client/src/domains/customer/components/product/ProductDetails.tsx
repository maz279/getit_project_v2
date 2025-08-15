/**
 * Phase 1: Product Details Component
 * Amazon.com/Shopee.sg-Level Product Detail Page
 * Complete Phase 1 Task 1.3 Implementation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Separator } from '@/shared/ui/separator';
import { Progress } from '@/shared/ui/progress';
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Truck, 
  Shield, 
  Award,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductDetailsProps {
  productId?: string;
  className?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  brand: string;
  category: string;
  images: string[];
  description: string;
  features: string[];
  specifications: Record<string, string>;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
  stockCount: number;
  seller: {
    name: string;
    rating: number;
    verified: boolean;
  };
  shipping: {
    freeShipping: boolean;
    estimatedDays: string;
    location: string;
  };
  warranty: string;
  returns: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  productId,
  className,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate product data loading
    const loadProduct = () => {
      // Simulated product data
      const mockProduct: Product = {
        id: productId || '1',
        name: 'Premium Wireless Bluetooth Headphones',
        price: 8500,
        originalPrice: 12000,
        discount: 29,
        rating: 4.6,
        reviewCount: 2847,
        brand: 'TechAudio Pro',
        category: 'Electronics > Audio > Headphones',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
          'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400'
        ],
        description: 'Experience premium sound quality with these professional-grade wireless headphones. Featuring active noise cancellation, 30-hour battery life, and premium comfort design.',
        features: [
          'Active Noise Cancellation',
          '30+ Hour Battery Life',
          'Quick Charge Technology',
          'Premium Leather Comfort',
          'Multi-Device Connectivity',
          'Voice Assistant Support'
        ],
        specifications: {
          'Driver Size': '40mm Dynamic',
          'Frequency Response': '20Hz - 40kHz',
          'Battery Life': '30 hours (ANC off), 25 hours (ANC on)',
          'Charging Time': '2 hours (USB-C)',
          'Weight': '285g',
          'Connectivity': 'Bluetooth 5.2, 3.5mm Jack',
          'Noise Cancellation': 'Active (up to 35dB)',
          'Voice Assistant': 'Alexa, Google Assistant, Siri'
        },
        availability: 'in-stock',
        stockCount: 47,
        seller: {
          name: 'TechBazar BD',
          rating: 4.8,
          verified: true
        },
        shipping: {
          freeShipping: true,
          estimatedDays: '1-2 days',
          location: 'Dhaka, Bangladesh'
        },
        warranty: '2 Years International Warranty',
        returns: '7 Days Easy Return & Exchange'
      };

      setTimeout(() => {
        setProduct(mockProduct);
        setLoading(false);
      }, 1000);
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    // Add to cart logic
    console.log(`Added ${quantity} items to cart`);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const getStockStatus = () => {
    if (!product) return { color: 'gray', text: 'Loading...', progress: 0 };
    
    if (product.availability === 'out-of-stock') {
      return { color: 'red', text: 'Out of Stock', progress: 0 };
    } else if (product.availability === 'low-stock') {
      return { color: 'orange', text: `Only ${product.stockCount} left`, progress: 30 };
    } else {
      return { color: 'green', text: 'In Stock', progress: 100 };
    }
  };

  const stockStatus = getStockStatus();

  if (loading) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-muted h-96 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-muted h-20 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-muted h-8 rounded"></div>
                <div className="bg-muted h-4 rounded w-3/4"></div>
                <div className="bg-muted h-6 rounded w-1/2"></div>
                <div className="bg-muted h-32 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
            <p className="text-muted-foreground">
              The product you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-7xl mx-auto p-6', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'aspect-square rounded border-2 overflow-hidden transition-all',
                      selectedImage === index 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-muted hover:border-muted-foreground'
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                <p className="text-sm text-muted-foreground">by {product.brand}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlist}
                  className={cn(
                    'h-10 w-10',
                    isWishlisted && 'text-red-500 border-red-200'
                  )}
                >
                  <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4',
                      star <= Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-muted-foreground'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-primary">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    {product.discount}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  'text-sm font-medium',
                  stockStatus.color === 'green' && 'text-green-600',
                  stockStatus.color === 'orange' && 'text-orange-600',
                  stockStatus.color === 'red' && 'text-red-600'
                )}>
                  {stockStatus.text}
                </span>
                {product.availability === 'in-stock' && (
                  <span className="text-xs text-muted-foreground">
                    {product.stockCount} available
                  </span>
                )}
              </div>
              <Progress 
                value={stockStatus.progress} 
                className={cn(
                  'h-2',
                  stockStatus.color === 'green' && '[&>div]:bg-green-500',
                  stockStatus.color === 'orange' && '[&>div]:bg-orange-500',
                  stockStatus.color === 'red' && '[&>div]:bg-red-500'
                )}
              />
            </div>
          </div>

          {/* Purchase Actions */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Quantity */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border rounded">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stockCount}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.availability === 'out-of-stock'}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  disabled={product.availability === 'out-of-stock'}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{product.seller.name}</span>
                    {product.seller.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-sm">{product.seller.rating}</span>
                    <span className="text-xs text-muted-foreground">seller rating</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Shop
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Services */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">
                    {product.shipping.freeShipping ? 'Free Shipping' : 'Shipping'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {product.shipping.estimatedDays} • {product.shipping.location}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Warranty</span>
                </div>
                <p className="text-xs text-muted-foreground">{product.warranty}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{product.description}</p>
                
                <div>
                  <h4 className="font-semibold mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
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
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground">{value}</span>
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
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>Reviews component will be loaded here</p>
                  <p className="text-sm">Integration with ProductReviews.tsx component</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetails;