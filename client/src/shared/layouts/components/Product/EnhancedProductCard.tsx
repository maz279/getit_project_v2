import React, { useState, useEffect } from 'react';
import { Heart, Eye, Share2, ShoppingCart, Star, Zap, AlertTriangle, Truck, Shield, Clock, MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from "@/lib/utils";

/**
 * Enhanced ProductCard Component - Amazon.com/Shopee.sg Level
 * Features: Hover effects, quick actions, wishlist, badges, shipping info, ratings, animations
 */
export const EnhancedProductCard = ({
  product,
  layout = "grid", // grid, list, compact
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onShare,
  onProductClick,
  showQuickActions = true,
  showShippingInfo = true,
  showVendorInfo = true,
  className = ""
}) => {
  const [isWishlisted, setIsWishlisted] = useState(product?.isWishlisted || false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  // Multiple images rotation on hover
  useEffect(() => {
    if (isHovered && product?.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          (prev + 1) % product.images.length
        );
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCurrentImageIndex(0);
    }
  }, [isHovered, product?.images?.length]);

  // Format price in Bangladesh Taka
  const formatPrice = (price) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (product?.originalPrice && product?.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  // Handle quick actions
  const handleWishlist = async (e) => {
    e.stopPropagation();
    try {
      await onAddToWishlist?.(product);
      setIsWishlisted(!isWishlisted);
      toast({
        title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
        description: `${product.name} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await onAddToCart?.(product);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare?.(product);
  };

  const handleProductClick = () => {
    onProductClick?.(product);
  };

  // Get current image
  const getCurrentImage = () => {
    if (product?.images?.length > 1) {
      return product.images[currentImageIndex];
    }
    return product?.image || product?.imageUrl || '/api/placeholder/300/300';
  };

  // Render badges
  const renderBadges = () => {
    const badges = [];
    const discount = calculateDiscount();

    if (discount > 0) {
      badges.push(
        <Badge key="discount" className="bg-red-500 text-white font-bold">
          -{discount}%
        </Badge>
      );
    }

    if (product?.isNew) {
      badges.push(
        <Badge key="new" className="bg-green-500 text-white">
          New
        </Badge>
      );
    }

    if (product?.isHot || product?.badge === 'Hot') {
      badges.push(
        <Badge key="hot" className="bg-orange-500 text-white flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Hot
        </Badge>
      );
    }

    if (product?.isFeatured || product?.badge === 'Featured') {
      badges.push(
        <Badge key="featured" className="bg-purple-500 text-white">
          Featured
        </Badge>
      );
    }

    if (product?.isTrending) {
      badges.push(
        <Badge key="trending" className="bg-blue-500 text-white">
          Trending
        </Badge>
      );
    }

    return badges;
  };

  // Render quick action buttons
  const renderQuickActions = () => {
    if (!showQuickActions) return null;

    return (
      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleWishlist}
          className={cn(
            "p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200",
            isWishlisted 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
          )}
        >
          <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleQuickView}
          className="p-2 rounded-full shadow-lg bg-white/90 text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-all duration-200"
        >
          <Eye className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="p-2 rounded-full shadow-lg bg-white/90 text-gray-600 hover:bg-purple-50 hover:text-purple-500 transition-all duration-200"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  // Render rating stars
  const renderRating = (size = "sm") => {
    const rating = product?.rating || 0;
    const reviewCount = product?.reviewCount || product?.reviews || 0;
    
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                size === "sm" ? "w-3 h-3" : "w-4 h-4",
                i < Math.floor(rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              )}
            />
          ))}
        </div>
        <span className={cn(
          "text-gray-600",
          size === "sm" ? "text-xs" : "text-sm"
        )}>
          {rating.toFixed(1)} ({reviewCount})
        </span>
      </div>
    );
  };

  // Render shipping info
  const renderShippingInfo = () => {
    if (!showShippingInfo) return null;

    return (
      <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
        {product?.freeShipping && (
          <div className="flex items-center gap-1 text-green-600">
            <Truck className="w-3 h-3" />
            <span>Free Shipping</span>
          </div>
        )}
        
        {product?.fastDelivery && (
          <div className="flex items-center gap-1 text-blue-600">
            <Clock className="w-3 h-3" />
            <span>Fast Delivery</span>
          </div>
        )}
        
        {product?.securePayment && (
          <div className="flex items-center gap-1 text-purple-600">
            <Shield className="w-3 h-3" />
            <span>Secure</span>
          </div>
        )}
      </div>
    );
  };

  // Render vendor info
  const renderVendorInfo = () => {
    if (!showVendorInfo || !product?.vendorName) return null;

    return (
      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
        <MapPin className="w-3 h-3" />
        <span>by {product.vendorName}</span>
        {product?.vendorLocation && (
          <span className="text-gray-400">• {product.vendorLocation}</span>
        )}
      </div>
    );
  };

  // Stock warning
  const renderStockWarning = () => {
    if (product?.stock > 5 || !product?.stock) return null;

    return (
      <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 animate-pulse">
        <AlertTriangle className="w-3 h-3" />
        Only {product.stock} left!
      </div>
    );
  };

  // Compact layout for mobile/sidebar
  if (layout === "compact") {
    return (
      <Card 
        className={cn(
          "group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden",
          className
        )}
        onClick={handleProductClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            {!imageLoaded && (
              <div className="w-full h-32 bg-gray-200 animate-pulse"></div>
            )}
            <img
              src={getCurrentImage()}
              alt={product?.name}
              className={cn(
                "w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500",
                imageLoaded ? 'block' : 'hidden'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.currentTarget.src = '/api/placeholder/300/300';
              }}
            />
            
            {/* Compact badges */}
            <div className="absolute top-1 left-1 flex flex-col gap-1">
              {renderBadges().slice(0, 2)}
            </div>

            {/* Quick actions for compact */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWishlist}
                className={cn(
                  "p-1 rounded-full shadow-lg transition-all text-xs",
                  isWishlisted 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                )}
              >
                <Heart className={cn("w-3 h-3", isWishlisted && "fill-current")} />
              </Button>
            </div>

            {renderStockWarning()}
          </div>

          <div className="p-2">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {product?.category}
            </div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product?.name}
            </h3>

            {renderRating("sm")}

            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-bold text-gray-900">
                {formatPrice(product?.price)}
              </span>
              {product?.originalPrice && product?.originalPrice > product?.price && (
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product?.originalPrice)}
                </span>
              )}
            </div>

            <Button 
              className="w-full mt-2" 
              size="sm"
              onClick={handleAddToCart}
              disabled={!product?.inStock}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              {product?.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List layout for search results
  if (layout === "list") {
    return (
      <Card 
        className={cn(
          "group cursor-pointer hover:shadow-lg transition-all duration-300 mb-4",
          className
        )}
        onClick={handleProductClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={getCurrentImage()}
                alt={product?.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = '/api/placeholder/300/300';
                }}
              />
              
              {/* List badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {renderBadges().slice(0, 2)}
              </div>

              {renderStockWarning()}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {product?.description}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWishlist}
                  className="ml-2 text-gray-400 hover:text-red-500"
                >
                  <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
                </Button>
              </div>

              {renderVendorInfo()}
              {renderRating()}

              <div className="flex items-center gap-2 my-3">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(product?.price)}
                </span>
                {product?.originalPrice && product?.originalPrice > product?.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product?.originalPrice)}
                  </span>
                )}
              </div>

              {renderShippingInfo()}

              <div className="flex gap-2 mt-4">
                <Button 
                  className="flex-1" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!product?.inStock}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button className="flex-1" size="sm">
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default grid layout
  return (
    <Card 
      className={cn(
        "group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100",
        !product?.inStock && "opacity-75",
        className
      )}
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          {!imageLoaded && (
            <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
          )}
          <img
            src={getCurrentImage()}
            alt={product?.name}
            className={cn(
              "w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500",
              imageLoaded ? 'block' : 'hidden'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = '/api/placeholder/300/300';
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {renderBadges()}
          </div>

          {/* Quick actions */}
          {renderQuickActions()}

          {/* Stock warning */}
          {renderStockWarning()}

          {/* Image indicator for multiple images */}
          {product?.images?.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentImageIndex + 1}/{product.images.length}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {product?.category}
            </Badge>
            {product?.sold && (
              <span className="text-xs text-gray-500">{product.sold} sold</span>
            )}
          </div>

          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product?.name}
          </h3>
          
          {renderRating()}
          {renderVendorInfo()}

          <div className="flex items-center gap-2 my-3">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product?.price)}
            </span>
            {product?.originalPrice && product?.originalPrice > product?.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product?.originalPrice)}
              </span>
            )}
          </div>

          {renderShippingInfo()}
          
          <div className="flex gap-2 mt-4">
            <Button 
              className="flex-1" 
              variant="outline" 
              size="sm"
              onClick={handleAddToCart}
              disabled={!product?.inStock}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product?.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button className="flex-1" size="sm">
              Buy Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProductCard;