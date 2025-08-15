
import React from 'react';
import { Star, MapPin, Truck } from 'lucide-react';

interface VendorInfo {
  id: string;
  name: string;
  rating: number;
  location: string;
  products: number;
  verified: boolean;
}

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  vendor: VendorInfo;
  image: string;
  discount?: number;
  freeShipping: boolean;
}

interface ProductListProps {
  products: ProductInfo[];
  viewMode: 'grid' | 'list';
  gridSize?: 'normal' | 'small';
}

export const ProductList: React.FC<ProductListProps> = ({ products, viewMode, gridSize = 'normal' }) => {
  const gridCols = gridSize === 'small' 
    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
    : 'grid grid-cols-1 md:grid-cols-2 gap-6';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className={viewMode === 'grid' ? gridCols : 'space-y-4'}>
        {products.map((product) => (
          <div key={product.id} className={`border rounded-lg hover:shadow-md transition-shadow ${
            viewMode === 'list' ? 'flex gap-4 p-4' : gridSize === 'small' ? 'p-3' : 'p-4'
          }`}>
            <div className={
              viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 
              gridSize === 'small' ? 'aspect-square mb-2' : 'aspect-square mb-4'
            }>
              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
            </div>
            
            <div className="flex-1">
              <h3 className={`font-medium text-gray-800 mb-2 ${gridSize === 'small' ? 'text-sm' : ''}`}>
                {gridSize === 'small' && product.name.length > 40 
                  ? `${product.name.substring(0, 40)}...` 
                  : product.name
                }
              </h3>
              
              <div className={`flex items-center gap-2 mb-2 ${gridSize === 'small' ? 'text-xs' : ''}`}>
                <div className="flex items-center gap-1">
                  <Star className={`text-yellow-400 fill-current ${gridSize === 'small' ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  <span className="text-gray-600">{product.rating}</span>
                </div>
                <span className="text-gray-400">({product.reviews})</span>
              </div>
              
              {gridSize !== 'small' && (
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-blue-600 font-medium">{product.vendor.name}</span>
                  {product.vendor.verified && (
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">Verified</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-bold text-blue-600 ${gridSize === 'small' ? 'text-sm' : 'text-lg'}`}>
                    ৳{product.price.toLocaleString()}
                  </div>
                  {product.originalPrice && (
                    <div className={`text-gray-500 line-through ${gridSize === 'small' ? 'text-xs' : 'text-sm'}`}>
                      ৳{product.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {product.discount && (
                    <span className={`bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium ${gridSize === 'small' ? 'text-xs' : 'text-xs'}`}>
                      {product.discount}% OFF
                    </span>
                  )}
                  {product.freeShipping && gridSize !== 'small' && (
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <Truck className="w-3 h-3" />
                      <span>Free Shipping</span>
                    </div>
                  )}
                </div>
              </div>
              
              {gridSize === 'small' && (
                <div className="text-xs text-gray-600 mt-1 truncate">{product.vendor.name}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
