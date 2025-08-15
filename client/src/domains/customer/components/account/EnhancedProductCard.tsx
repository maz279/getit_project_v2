
import React from 'react';
import { ProductCardProps } from './productCard/types';
import { ProductListCard } from './productCard/ProductListCard';
import { ProductGridCard } from './productCard/ProductGridCard';

export const EnhancedProductCard: React.FC<ProductCardProps> = (props) => {
  if (props.viewMode === 'list') {
    return <ProductListCard {...props} />;
  }

  return <ProductGridCard {...props} />;
};
