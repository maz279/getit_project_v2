/**
 * ProductGrid - Shopee.sg Style Responsive Grid with Hover Actions
 * Phase 1 Week 3-4: Component Modernization
 * Features: Responsive grid layout, hover actions, wishlist, quick view, Bangladesh optimization
 */

import React, { useState } from 'react';
import { Heart, Eye, ShoppingCart, Star, Plus, Zap, Gift, Shield } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';

interface Product {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  image: string;
  badge?: string;
}

interface ProductGridProps {
  title?: string;
  products: Product[];
  category?: string;
  className?: string;
  onProductClick?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title = "Featured Products",
  products = [],
  category = "general",
  className = "",
  onProductClick
}) => {
  const [hoveredProduct, setHoveredProduct] = useState<string | number | null>(null);
  const [wishlistedItems, setWishlistedItems] = useState<Set<string | number>>(new Set());

  // Enhanced products with default values
  const enhancedProducts = products.map(product => ({
    ...product,
    originalPrice: product.originalPrice || product.price * 1.2,
    discount: product.discount || Math.round(((product.originalPrice || product.price * 1.2) - product.price) / (product.originalPrice || product.price * 1.2) * 100),
    rating: product.rating || 4.5,
    badge: product.badge || (Math.random() > 0.7 ? ['HOT', 'NEW', 'SALE'][Math.floor(Math.random() * 3)] : undefined)
  }));

  const handleWishlistToggle = (productId: string | number) => {
    setWishlistedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Section Header - Mobile Optimized */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="flex items-center gap-1 md:gap-2">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            <span className="text-xs md:text-sm text-yellow-600 font-medium">Flash Deals</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs md:text-sm">
          View All
        </Button>
      </div>

      {/* Product Grid - Shopee.sg Style Mobile-First Design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
        {enhancedProducts.map((product) => (
          <Card
            key={product.id}
            className="group relative overflow-hidden bg-white border border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all duration-300 cursor-pointer rounded-lg"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
            onClick={() => onProductClick?.(product)}
          >
            <CardContent className="p-0">
              {/* Product Image - Shopee.sg Style */}
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges - Shopee.sg Style */}
                {product.badge && (
                  <Badge 
                    className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-1.5 py-0.5 rounded-sm"
                    variant="destructive"
                  >
                    {product.badge}
                  </Badge>
                )}

                {product.discount && product.discount > 0 && (
                  <Badge 
                    className="absolute top-1 right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-1.5 py-0.5 rounded-sm"
                  >
                    -{product.discount}%
                  </Badge>
                )}

                {/* Mobile-First Touch Actions */}
                <div className={`absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center gap-1 transition-opacity duration-300 ${
                  hoveredProduct === product.id ? 'opacity-100' : 'opacity-0 md:opacity-0'
                } md:${hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'}`}>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white text-gray-700 hover:bg-gray-100 shadow-lg p-2 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle(product.id);
                    }}
                  >
                    <Heart className={`w-3 h-3 md:w-4 md:h-4 ${wishlistedItems.has(product.id) ? 'text-red-500 fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white text-gray-700 hover:bg-gray-100 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Add Button */}
                <div className={`absolute bottom-2 right-2 transition-all duration-300 ${
                  hoveredProduct === product.id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                }`}>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 space-y-2">
                {/* Product Name */}
                <h3 className="font-medium text-sm text-gray-800 line-clamp-2 leading-relaxed group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                  <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Shield className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                    {Math.random() > 0.5 && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Gift className="w-3 h-3" />
                        <span>Gift</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bangladesh Specific Features */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>ঢাকায় ডেলিভারি</span>
                  </div>
                  <span className="text-orange-600 font-medium">২৪ ঘন্টায়</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-8">
        <Button 
          variant="outline" 
          className="px-8 py-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
        >
          Load More Products
        </Button>
      </div>
    </div>
  );
};

export { ProductGrid };
export default ProductGrid;