
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { 
  ShoppingCart, 
  Heart, 
  Eye, 
  Star,
  Truck,
  Play,
  FileText,
  CreditCard,
  RotateCcw,
  MessageCircle,
  Phone,
  BarChart3
} from 'lucide-react';

interface Product {
  id: number;
  image: string;
  title: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  rating: number;
  reviews: number;
  sold: number;
  stockLeft: number;
  freeShipping: boolean;
  badge: string | null;
  location: string;
}

interface FlashSaleProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

export const FlashSaleProductCard: React.FC<FlashSaleProductCardProps> = ({ 
  product, 
  viewMode 
}) => {
  const [showMoreActions, setShowMoreActions] = useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden border ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      {/* Product Image */}
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48' : ''}`}>
        <img
          src={product.image}
          alt={product.title}
          className={`w-full object-cover group-hover:scale-110 transition-transform duration-500 ${
            viewMode === 'list' ? 'h-full' : 'h-48'
          }`}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            -{product.discount}%
          </div>
          {product.badge && (
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
              {product.badge}
            </div>
          )}
          {product.freeShipping && (
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Free
            </div>
          )}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors">
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors">
            <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-lg hover:bg-purple-50 transition-colors">
            <BarChart3 className="w-4 h-4 text-gray-600 hover:text-purple-500" />
          </button>
        </div>

        {/* Stock Warning */}
        {product.stockLeft <= 10 && (
          <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
            Only {product.stockLeft} left!
          </div>
        )}

        {/* Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex gap-2">
            <Button size="sm" className="bg-white text-black hover:bg-gray-100">
              <Eye className="w-4 h-4 mr-1" />
              Quick View
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              <Play className="w-4 h-4 mr-1" />
              Video
            </Button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className={`p-4 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
        <div>
          <h3 className={`font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors ${
            viewMode === 'list' ? 'text-lg' : 'text-sm'
          }`}>
            {product.title}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {product.rating.toFixed(1)} ({product.reviews})
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-bold text-red-600 ${viewMode === 'list' ? 'text-xl' : 'text-lg'}`}>
              ৳{product.salePrice.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ৳{product.originalPrice.toLocaleString()}
            </span>
          </div>

          {/* Sales Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>{product.sold} sold</span>
            <span>{product.location}</span>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="space-y-2">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button className="bg-red-500 hover:bg-red-600 text-white font-medium text-xs py-2">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add to Cart
            </Button>
            <Button className="bg-green-500 hover:bg-green-600 text-white font-medium text-xs py-2">
              💰 Buy Now
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-3 gap-1">
            <Button variant="outline" size="sm" className="text-xs p-1">
              <Heart className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="sm" className="text-xs p-1">
              <MessageCircle className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="sm" className="text-xs p-1">
              <Phone className="w-3 h-3" />
            </Button>
          </div>

          {/* Expandable Quick Actions */}
          {showMoreActions && (
            <div className="grid grid-cols-2 gap-1 animate-in slide-in-from-bottom-2">
              <Button variant="outline" size="sm" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Details
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Truck className="w-3 h-3 mr-1" />
                Delivery
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <CreditCard className="w-3 h-3 mr-1" />
                Payment
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <RotateCcw className="w-3 h-3 mr-1" />
                Return
              </Button>
            </div>
          )}

          {/* Toggle More Actions */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-gray-500"
            onClick={() => setShowMoreActions(!showMoreActions)}
          >
            {showMoreActions ? 'Less Options' : 'More Options'}
          </Button>
        </div>
      </div>
    </div>
  );
};
