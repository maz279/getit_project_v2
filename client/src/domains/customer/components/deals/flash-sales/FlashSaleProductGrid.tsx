
import React from 'react';
import { Button } from '@/shared/ui/button';
import { FlashSaleProductCard } from './FlashSaleProductCard';

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

interface FlashSaleProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
}

export const FlashSaleProductGrid: React.FC<FlashSaleProductGridProps> = ({
  products,
  viewMode
}) => {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {products.map((product) => (
            <FlashSaleProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-3 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            Load More Products
          </Button>
        </div>
      </div>
    </section>
  );
};
