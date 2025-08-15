
import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Star, MapPin } from 'lucide-react';
import { ProductVendor } from './types';

interface VendorInfoProps {
  vendor: ProductVendor;
  variant?: 'grid' | 'list';
}

export const VendorInfo: React.FC<VendorInfoProps> = ({ vendor, variant = 'grid' }) => {
  if (variant === 'list') {
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm text-gray-600">Sold by</span>
        <span className="font-medium text-blue-600">{vendor.name}</span>
        {vendor.verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600">{vendor.rating}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{vendor.location}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-500">Sold by</span>
        <span className="text-sm font-medium text-blue-600">{vendor.name}</span>
        {vendor.verified && <Badge variant="secondary" className="text-xs">✓</Badge>}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < Math.floor(vendor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">({vendor.rating})</span>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{vendor.location}</span>
        </div>
      </div>
    </>
  );
};
