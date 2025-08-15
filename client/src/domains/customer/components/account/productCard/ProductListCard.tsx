
import React, { useState } from 'react';
import { ShoppingCart, Star, Truck, Clock, CreditCard, MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { ProductCardProps } from './types';
import { getStockBadge, calculateDiscountPercentage, paymentMethods } from './utils';
import { ActionButtons } from './ActionButtons';
import { VendorInfo } from './VendorInfo';

export const ProductListCard: React.FC<ProductCardProps> = ({
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

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-gray-100">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Selection Checkbox */}
          {onSelect && (
            <div className="flex items-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(id, checked as boolean)}
              />
            </div>
          )}

          <div className="relative w-32 h-32 flex-shrink-0">
            {!imageLoaded && <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg"></div>}
            <img
              src={image}
              alt={name}
              className={`w-full h-full object-cover rounded-lg transition-transform hover:scale-105 ${imageLoaded ? 'block' : 'hidden'}`}
              onLoad={() => setImageLoaded(true)}
            />
            {features.festival && (
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white text-xs">
                Eid Special
              </Badge>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 
                className="font-semibold text-lg text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                onMouseEnter={() => setShowNameBn(true)}
                onMouseLeave={() => setShowNameBn(false)}
              >
                {showNameBn && nameBn ? nameBn : name}
              </h3>
              <VendorInfo vendor={vendor} variant="list" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">৳{price.toLocaleString()}</span>
                {originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">৳{originalPrice.toLocaleString()}</span>
                    <Badge className="bg-red-500 text-white">{discountPercentage}% OFF</Badge>
                  </>
                )}
              </div>
              <Badge className={stockBadge.color}>{stockBadge.text}</Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                <span>{delivery.estimatedDays} days delivery</span>
              </div>
              {delivery.cod && (
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  <span>COD Available</span>
                </div>
              )}
              {delivery.freeShipping && (
                <Badge variant="outline" className="text-green-600 border-green-600">Free Shipping</Badge>
              )}
              {features.emi && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">EMI Available</Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {paymentMethods.map((method, index) => (
                <Badge key={index} variant="outline" className={`text-xs ${method.color}`}>
                  {method.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ActionButtons
              id={id}
              onRemove={onRemove}
              onShare={onShare}
              onQuickView={onQuickView}
              onCompare={onCompare}
              variant="list"
            />
            <Button
              onClick={() => onAddToCart(id)}
              disabled={stock.status === 'out_of_stock'}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
