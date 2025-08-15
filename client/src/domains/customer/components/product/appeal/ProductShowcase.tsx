/**
 * Phase 3: Appeal Stage - Product Showcase
 * Amazon.com 5 A's Framework Implementation
 * Rich Product Display with Advanced Media and Interactive Features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Heart, 
  Share2, 
  Star, 
  Eye, 
  Play, 
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Gift,
  Shield,
  Truck,
  RotateCcw,
  Award,
  Users,
  ThumbsUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductShowcaseProps {
  productId?: string;
  className?: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  videos: string[];
  description: string;
  highlights: string[];
  specifications: Record<string, string>;
  badges: ProductBadge[];
  socialProof: SocialProof;
  variants: ProductVariant[];
  offers: ProductOffer[];
}

interface ProductBadge {
  id: string;
  text: string;
  type: 'bestseller' | 'premium' | 'limited' | 'new' | 'recommended';
  color: string;
  icon?: any;
}

interface SocialProof {
  recentPurchases: number;
  viewing: number;
  wishlist: number;
  shared: number;
}

interface ProductVariant {
  id: string;
  name: string;
  image: string;
  price: number;
  available: boolean;
}

interface ProductOffer {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  productId,
  className,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [viewMode, setViewMode] = useState<'image' | 'video' | '360'>('image');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate product data loading
    const loadProduct = () => {
      const mockProduct: Product = {
        id: productId || '1',
        name: 'Premium Wireless Gaming Headset with RGB Lighting',
        brand: 'TechPro Gaming',
        price: 12500,
        originalPrice: 18000,
        discount: 31,
        rating: 4.8,
        reviewCount: 3247,
        images: [
          'https://images.unsplash.com/photo-1599669454699-248893623440?w=600',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
          'https://images.unsplash.com/photo-1545127398-14699f92334b?w=600'
        ],
        videos: [
          'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
        ],
        description: 'Experience next-level gaming with premium audio quality, comfortable design, and stunning RGB lighting effects. Perfect for long gaming sessions with noise cancellation technology.',
        highlights: [
          '7.1 Surround Sound Technology',
          'Active Noise Cancellation',
          'RGB Lighting with 16.7M Colors',
          '50+ Hour Battery Life',
          'Universal Compatibility',
          'Professional Microphone with Noise Suppression'
        ],
        specifications: {
          'Driver Size': '50mm Neodymium',
          'Frequency Response': '20Hz - 40kHz',
          'Impedance': '32Ω',
          'Sensitivity': '105dB SPL',
          'Battery Life': '50+ hours',
          'Charging Time': '2 hours (USB-C)',
          'Weight': '320g',
          'Connectivity': 'Bluetooth 5.2, 3.5mm, USB-C',
          'Compatibility': 'PC, PS5, Xbox, Mobile, Switch'
        },
        badges: [
          {
            id: 'bestseller',
            text: 'Best Seller',
            type: 'bestseller',
            color: 'bg-yellow-500',
            icon: Award
          },
          {
            id: 'premium',
            text: 'Premium Quality',
            type: 'premium',
            color: 'bg-purple-500',
            icon: Star
          },
          {
            id: 'recommended',
            text: 'Editor\'s Choice',
            type: 'recommended',
            color: 'bg-blue-500',
            icon: ThumbsUp
          }
        ],
        socialProof: {
          recentPurchases: 89,
          viewing: 24,
          wishlist: 156,
          shared: 43
        },
        variants: [
          {
            id: 'black',
            name: 'Midnight Black',
            image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=100',
            price: 12500,
            available: true
          },
          {
            id: 'white',
            name: 'Arctic White',
            image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100',
            price: 13000,
            available: true
          },
          {
            id: 'red',
            name: 'Gaming Red',
            image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=100',
            price: 13500,
            available: false
          }
        ],
        offers: [
          {
            id: 'warranty',
            title: '2 Years Warranty',
            description: 'Extended warranty coverage',
            icon: Shield,
            color: 'text-green-600'
          },
          {
            id: 'shipping',
            title: 'Free Express Shipping',
            description: 'Delivery within 24 hours',
            icon: Truck,
            color: 'text-blue-600'
          },
          {
            id: 'return',
            title: '30-Day Returns',
            description: 'Easy return & exchange',
            icon: RotateCcw,
            color: 'text-purple-600'
          }
        ]
      };

      setTimeout(() => {
        setProduct(mockProduct);
        setLoading(false);
      }, 1000);
    };

    loadProduct();
  }, [productId]);

  const handlePrevImage = () => {
    if (product) {
      setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1);
    }
  };

  const handleNextImage = () => {
    if (product) {
      setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1);
    }
  };

  const ProductBadgeComponent = ({ badge }: { badge: ProductBadge }) => {
    const Icon = badge.icon;
    return (
      <Badge className={cn(badge.color, 'text-white flex items-center gap-1')}>
        {Icon && <Icon className="h-3 w-3" />}
        {badge.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-muted h-96 rounded-lg"></div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
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
      </div>
    );
  }

  if (!product) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
            <p className="text-muted-foreground">
              The product you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-7xl mx-auto p-6', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Media */}
        <div className="space-y-4">
          {/* Main Media Display */}
          <Card className="overflow-hidden">
            <div className="relative aspect-square bg-muted">
              {viewMode === 'image' && (
                <>
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-between p-4">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full bg-white/80 hover:bg-white"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full bg-white/80 hover:bg-white"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full bg-white/80 hover:bg-white"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
              
              {viewMode === 'video' && (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <Button variant="secondary" size="lg" className="rounded-full">
                    <Play className="h-8 w-8 mr-2" />
                    Play Product Demo
                  </Button>
                </div>
              )}

              {viewMode === '360' && (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center">
                    <RotateCcw className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
                    <p className="text-lg font-semibold">360° View</p>
                    <p className="text-sm text-muted-foreground">Drag to rotate</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Media Controls */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={viewMode === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('image')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Images
            </Button>
            <Button
              variant={viewMode === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('video')}
            >
              <Play className="h-4 w-4 mr-2" />
              Video
            </Button>
            <Button
              variant={viewMode === '360' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('360')}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              360° View
            </Button>
          </div>

          {/* Image Thumbnails */}
          {viewMode === 'image' && (
            <div className="grid grid-cols-5 gap-2">
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
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.badges.map((badge) => (
              <ProductBadgeComponent key={badge.id} badge={badge} />
            ))}
          </div>

          {/* Basic Info */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
            <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
            
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
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                  <Badge variant="destructive" className="text-sm">
                    {product.discount}% OFF
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Social Proof */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">{product.socialProof.recentPurchases}</div>
                <div className="text-xs text-muted-foreground">Purchased today</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{product.socialProof.viewing}</div>
                <div className="text-xs text-muted-foreground">Currently viewing</div>
              </div>
            </div>
          </Card>

          {/* Variants */}
          <div>
            <h3 className="font-semibold mb-3">Color Variants</h3>
            <div className="flex gap-2">
              {product.variants.map((variant, index) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(index)}
                  disabled={!variant.available}
                  className={cn(
                    'relative border-2 rounded-lg overflow-hidden transition-all',
                    selectedVariant === index 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-muted hover:border-muted-foreground',
                    !variant.available && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <img
                    src={variant.image}
                    alt={variant.name}
                    className="w-16 h-16 object-cover"
                  />
                  {!variant.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">Out</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {product.variants[selectedVariant].name} - ৳{product.variants[selectedVariant].price.toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="flex-1" size="lg">
              <Zap className="h-4 w-4 mr-2" />
              Buy Now
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={cn(
                'px-4',
                isWishlisted && 'text-red-500 border-red-200'
              )}
            >
              <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
            </Button>
            <Button variant="outline" size="lg" className="px-4">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Offers */}
          <div className="space-y-3">
            {product.offers.map((offer) => {
              const Icon = offer.icon;
              return (
                <div key={offer.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Icon className={cn('h-5 w-5', offer.color)} />
                  <div>
                    <div className="font-medium text-sm">{offer.title}</div>
                    <div className="text-xs text-muted-foreground">{offer.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="highlights" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="highlights">Highlights</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
          </TabsList>
          
          <TabsContent value="highlights" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {product.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
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
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductShowcase;