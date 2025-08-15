/**
 * ProductCard Molecule - Product display card
 * Amazon.com/Shopee.sg Enterprise Standards
 */

import { forwardRef, useState } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import { Icon, HeartIcon, ShoppingCartIcon, StarIcon } from '../../atoms/Icon/Icon';
import { cn } from '@/lib/utils';

export interface ProductCardProps {
  className?: string;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    currency?: string;
    image: string;
    rating?: number;
    reviewCount?: number;
    discount?: number;
    badge?: string;
    isWishlisted?: boolean;
    inStock?: boolean;
    freeShipping?: boolean;
  };
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  onClick?: (productId: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
  loading?: boolean;
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({
    className,
    product,
    onAddToCart,
    onToggleWishlist,
    onQuickView,
    onClick,
    variant = 'default',
    loading,
    ...props
  }, ref) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const formatPrice = (price: number) => {
      const currency = product.currency || 'BDT';
      return `${currency} ${price.toLocaleString()}`;
    };

    const discountPercentage = product.originalPrice 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : product.discount || 0;

    return (
      <div
        ref={ref}
        className={cn(
          'group relative bg-background border border-border rounded-lg overflow-hidden transition-all duration-300',
          'hover:shadow-lg hover:border-primary/50',
          !loading && 'cursor-pointer',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick?.(product.id)}
        {...props}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          
          <img
            src={product.image}
            alt={product.name}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300',
              isHovered && 'scale-105',
              !imageLoaded && 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
              {product.badge}
            </div>
          )}

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 right-2 bg-error text-error-foreground px-2 py-1 rounded text-xs font-medium">
              -{discountPercentage}%
            </div>
          )}

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background',
              discountPercentage > 0 && 'top-10'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist?.(product.id);
            }}
          >
            <HeartIcon 
              className={cn(
                'h-4 w-4',
                product.isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )}
            />
          </Button>

          {/* Quick Actions (visible on hover) */}
          {isHovered && (
            <div className="absolute bottom-2 left-2 right-2 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView?.(product.id);
                }}
              >
                Quick View
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.(product.id);
                }}
                disabled={!product.inStock}
              >
                <ShoppingCartIcon className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <Typography
            variant="small"
            className="line-clamp-2 font-medium"
            title={product.name}
          >
            {product.name}
          </Typography>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < product.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <Typography variant="caption" className="text-muted-foreground">
                ({product.reviewCount || 0})
              </Typography>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <Typography variant="small" className="font-bold text-primary">
              {formatPrice(product.price)}
            </Typography>
            {product.originalPrice && (
              <Typography variant="caption" className="line-through text-muted-foreground">
                {formatPrice(product.originalPrice)}
              </Typography>
            )}
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <Typography variant="caption" className="text-error">
              Out of Stock
            </Typography>
          )}

          {/* Free Shipping */}
          {product.freeShipping && (
            <Typography variant="caption" className="text-success">
              Free Shipping
            </Typography>
          )}

          {/* Add to Cart Button (mobile) */}
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:hidden"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product.id);
            }}
            disabled={!product.inStock || loading}
          >
            <ShoppingCartIcon className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';

export { ProductCard };