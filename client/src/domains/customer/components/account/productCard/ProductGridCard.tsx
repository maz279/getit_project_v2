
import React, { useState } from 'react';
import { ShoppingCart, BarChart3 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { ProductCardProps } from './types';
import { getStockBadge, calculateDiscountPercentage, paymentMethods } from './utils';
import { ProductImage } from './ProductImage';
import { ActionButtons } from './ActionButtons';
import { VendorInfo } from './VendorInfo';

export const ProductGridCard: React.FC<ProductCardProps> = ({
  id,
  name,
  nameBn,
  price,
  originalPrice,
  image,
  vendor,
  stock,
  delivery,
  features,
  viewMode,
  isSelected = false,
  onSelect,
  onRemove,
  onAddToCart,
  onShare,
  onQuickView,
  onCompare
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showNameBn, setShowNameBn] = useState(false);

  const discountPercentage = calculateDiscountPercentage(price, originalPrice);
  const stockBadge = getStockBadge(stock);
  
  const cardSize = viewMode === 'compact' ? 'w-64' : 'w-80';
  const imageHeight = viewMode === 'compact' ? 'h-40' : 'h-48';

  return (
    <Card className={`${cardSize} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden border border-gray-100 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-0">
        {/* Selection Checkbox */}
        {onSelect && (
          <div className="absolute top-3 left-3 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(id, checked as boolean)}
              className="bg-white shadow-lg"
            />
          </div>
        )}

        <ProductImage
          image={image}
          name={name}
          imageLoaded={imageLoaded}
          onImageLoad={() => setImageLoaded(true)}
          features={features}
          stock={stock}
          discountPercentage={discountPercentage}
          imageHeight={imageHeight}
        />

        {/* Action Buttons */}
        <ActionButtons
          id={id}
          onRemove={onRemove}
          onShare={onShare}
          onQuickView={onQuickView}
          onCompare={onCompare}
        />

        <div className="p-4 space-y-3">
          <div>
            <h3 
              className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2"
              onMouseEnter={() => setShowNameBn(true)}
              onMouseLeave={() => setShowNameBn(false)}
            >
              {showNameBn && nameBn ? nameBn : name}
            </h3>
            <VendorInfo vendor={vendor} />
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">৳{price.toLocaleString()}</span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">৳{originalPrice.toLocaleString()}</span>
              )}
              {features.priceHistory && (
                <Button variant="ghost" size="sm" className="p-1">
                  <BarChart3 className="w-3 h-3 text-blue-500" />
                </Button>
              )}
            </div>
            <Badge className={stockBadge.color}>{stockBadge.text}</Badge>
          </div>

          {/* Delivery Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{delivery.estimatedDays} days delivery</span>
              {delivery.express && <Badge variant="outline" className="text-xs">Express</Badge>}
            </div>
            <div className="flex flex-wrap gap-1">
              {delivery.cod && <Badge variant="outline" className="text-xs text-green-600">COD</Badge>}
              {delivery.freeShipping && <Badge variant="outline" className="text-xs text-blue-600">Free Ship</Badge>}
              {features.emi && <Badge variant="outline" className="text-xs text-purple-600">EMI</Badge>}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-wrap gap-1">
            {paymentMethods.slice(0, 3).map((method, index) => (
              <Badge key={index} variant="outline" className={`text-xs ${method.color}`}>
                {method.name}
              </Badge>
            ))}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={() => onAddToCart(id)}
            disabled={stock.status === 'out_of_stock'}
            className="w-full flex items-center justify-center gap-2 font-semibold"
          >
            <ShoppingCart className="w-4 h-4" />
            {stock.status === 'preorder' ? 'Pre-order Now' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
