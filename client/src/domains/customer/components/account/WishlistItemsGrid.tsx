
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { EnhancedProductCard } from './EnhancedProductCard';
import { ProductVendor, ProductStock, ProductDelivery, ProductFeatures } from './productCard/types';

interface WishlistItem {
  id: number;
  name: string;
  nameBn: string;
  price: number;
  originalPrice: number;
  image: string;
  vendor: ProductVendor;
  stock: ProductStock;
  delivery: ProductDelivery;
  features: ProductFeatures;
}

interface WishlistItemsGridProps {
  items: WishlistItem[];
  viewMode: 'grid' | 'list' | 'compact';
  selectedItems: number[];
  onItemSelect: (id: number, selected: boolean) => void;
  onRemoveFromWishlist: (id: number) => void;
  onAddToCart: (id: number) => void;
  onShare: (id: number) => void;
  onQuickView: (id: number) => void;
  onCompare: (id: number) => void;
}

export const WishlistItemsGrid: React.FC<WishlistItemsGridProps> = ({
  items,
  viewMode,
  selectedItems,
  onItemSelect,
  onRemoveFromWishlist,
  onAddToCart,
  onShare,
  onQuickView,
  onCompare
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8">Start adding products you love to keep track of them</p>
        <Link
          to="/products"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className={`
      ${viewMode === 'list' 
        ? 'space-y-4' 
        : viewMode === 'compact'
        ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      }
    `}>
      {items.map((item) => (
        <EnhancedProductCard
          key={item.id}
          {...item}
          viewMode={viewMode}
          isSelected={selectedItems.includes(item.id)}
          onSelect={onItemSelect}
          onRemove={onRemoveFromWishlist}
          onAddToCart={onAddToCart}
          onShare={onShare}
          onQuickView={onQuickView}
          onCompare={onCompare}
        />
      ))}
    </div>
  );
};
