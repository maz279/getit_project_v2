
import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { AlertTriangle, Zap } from 'lucide-react';
import { ProductFeatures, ProductStock } from './types';

interface ProductImageProps {
  image: string;
  name: string;
  imageLoaded: boolean;
  onImageLoad: () => void;
  features: ProductFeatures;
  stock: ProductStock;
  discountPercentage: number;
  imageHeight: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  image,
  name,
  imageLoaded,
  onImageLoad,
  features,
  stock,
  discountPercentage,
  imageHeight
}) => {
  return (
    <div className="relative overflow-hidden">
      {!imageLoaded && <div className={`w-full ${imageHeight} bg-gray-200 animate-pulse`}></div>}
      <img
        src={image}
        alt={name}
        className={`w-full ${imageHeight} object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoaded ? 'block' : 'hidden'}`}
        onLoad={onImageLoad}
      />
      
      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        {features.festival && (
          <Badge className="bg-gradient-to-r from-red-500 to-yellow-500 text-white">Eid Special</Badge>
        )}
        {discountPercentage > 0 && (
          <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white">{discountPercentage}% OFF</Badge>
        )}
        {features.trending && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Trending
          </Badge>
        )}
      </div>

      {/* Stock Warning */}
      {stock.status === 'limited' && stock.quantity && stock.quantity <= 5 && (
        <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Only {stock.quantity} left!
        </div>
      )}
    </div>
  );
};
