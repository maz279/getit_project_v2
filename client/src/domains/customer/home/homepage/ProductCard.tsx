
import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye, Zap, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  image: string;
  category: string;
  title: string;
  originalPrice: string;
  salePrice: string;
  stockLeft: number;
  rating?: number;
  reviews?: number;
  badge?: string;
  isFlashSale?: boolean;
  discount?: string;
  isCompact?: boolean;
  onAddToCart?: () => void;
  onWishlist?: () => void;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  category,
  title,
  originalPrice,
  salePrice,
  stockLeft,
  rating = 4.5,
  reviews = 128,
  badge = "Hot Sale",
  isFlashSale = false,
  discount = "25% OFF",
  isCompact = false,
  onAddToCart,
  onWishlist,
  onClick
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlist?.();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.();
  };

  const handleCardClick = () => {
    onClick?.();
  };

  if (isCompact) {
    return (
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden border border-gray-100 cursor-pointer"
      >
        {/* Compact Image Container */}
        <div className="relative overflow-hidden">
          {!imageLoaded && (
            <div className="w-full h-32 bg-gray-200 animate-pulse"></div>
          )}
          <img
            src={image}
            alt={title}
            className={`w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? 'block' : 'hidden'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Compact Badges */}
          <div className="absolute top-1 left-1 flex flex-col gap-1">
            {isFlashSale && (
              <div className="bg-gradient-to-r from-red-500 to-yellow-400 text-white px-1 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                <Zap className="w-2 h-2" />
                Flash
              </div>
            )}
            {discount && (
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                {discount}
              </div>
            )}
          </div>

          {/* Compact Action Button */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlist}
              className={`p-1 rounded-full shadow-lg transition-all text-xs ${
                isWishlisted 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Stock Warning */}
          {stockLeft <= 5 && (
            <div className="absolute bottom-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold flex items-center gap-1">
              <AlertCircle className="w-2 h-2" />
              {stockLeft} left!
            </div>
          )}
        </div>

        {/* Compact Content */}
        <div className="p-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{category}</div>
          <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title.length > 40 ? title.substring(0, 40) + '...' : title}
          </h3>

          {/* Compact Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2 h-2 ${
                    i < Math.floor(rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviews})</span>
          </div>

          {/* Compact Pricing */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-green-600">{salePrice}</span>
              <span className="text-xs text-gray-400 line-through">{originalPrice}</span>
            </div>
          </div>

          {/* Compact Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-blue-500 to-green-600 text-white font-semibold py-1.5 rounded text-xs hover:from-blue-600 hover:to-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-1 shadow-md"
          >
            <ShoppingCart className="w-3 h-3" />
            Add to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden border border-gray-100 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        {!imageLoaded && (
          <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
        )}
        <img
          src={image}
          alt={title}
          className={`w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 ${
            imageLoaded ? 'block' : 'hidden'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isFlashSale && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Flash Sale
            </div>
          )}
          {discount && (
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {discount}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlist}
            className={`p-2 rounded-full shadow-lg transition-all ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 bg-white text-gray-600 rounded-full shadow-lg hover:bg-blue-50 hover:text-blue-500 transition-all">
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Stock Warning */}
        {stockLeft <= 5 && (
          <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            Only {stockLeft} left!
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{category}</div>
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviews})</span>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-green-600">{salePrice}</span>
          <span className="text-sm text-gray-400 line-through">{originalPrice}</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};
