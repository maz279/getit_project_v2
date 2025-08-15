
import React from 'react';
import { Button } from '@/shared/ui/button';

interface ProductPaginationProps {
  currentProducts: number;
  totalProducts: number;
}

export const ProductPagination: React.FC<ProductPaginationProps> = ({
  currentProducts,
  totalProducts = 2456789
}) => {
  return (
    <div className="flex items-center justify-between mt-8 p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600">
        Showing 1-{currentProducts} of {totalProducts.toLocaleString()} results
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {[1, 2, 3, '...', 15432].map((page, index) => (
            <Button
              key={index}
              variant={page === 1 ? 'default' : 'outline'}
              size="sm"
              className="w-10"
            >
              {page}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm">
          Next
        </Button>
      </div>
    </div>
  );
};
