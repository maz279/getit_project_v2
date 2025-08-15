
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';

interface WishlistFiltersProps {
  showFilters: boolean;
  selectedFilters: {
    priceRange: string;
    category: string;
    stockStatus: string;
    delivery: string;
    vendor: string;
  };
  onFilterChange: (filters: any) => void;
}

export const WishlistFilters: React.FC<WishlistFiltersProps> = ({
  showFilters,
  selectedFilters,
  onFilterChange
}) => {
  const setSelectedFilters = (newFilters: any) => {
    onFilterChange(newFilters);
  };

  if (!showFilters) return null;

  return (
    <div className="border-t pt-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range (BDT)</label>
          <Select value={selectedFilters.priceRange} onValueChange={(value) => setSelectedFilters({...selectedFilters, priceRange: value})}>
            <SelectTrigger>
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_1000">Under ৳1,000</SelectItem>
              <SelectItem value="1000_5000">৳1,000 - ৳5,000</SelectItem>
              <SelectItem value="5000_10000">৳5,000 - ৳10,000</SelectItem>
              <SelectItem value="10000_25000">৳10,000 - ৳25,000</SelectItem>
              <SelectItem value="over_25000">Over ৳25,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
          <Select value={selectedFilters.category} onValueChange={(value) => setSelectedFilters({...selectedFilters, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="home">Home & Garden</SelectItem>
              <SelectItem value="beauty">Beauty</SelectItem>
              <SelectItem value="books">Books</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Stock Status</label>
          <Select value={selectedFilters.stockStatus} onValueChange={(value) => setSelectedFilters({...selectedFilters, stockStatus: value})}>
            <SelectTrigger>
              <SelectValue placeholder="All Items" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_stock">In Stock (সংগ্রহে আছে)</SelectItem>
              <SelectItem value="limited">Limited Stock (সীমিত সংগ্রহ)</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock (স্টক নেই)</SelectItem>
              <SelectItem value="preorder">Pre-order Available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Delivery Options</label>
          <Select value={selectedFilters.delivery} onValueChange={(value) => setSelectedFilters({...selectedFilters, delivery: value})}>
            <SelectTrigger>
              <SelectValue placeholder="All Delivery" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="same_day">Same Day Delivery</SelectItem>
              <SelectItem value="express">Express Delivery</SelectItem>
              <SelectItem value="standard">Standard Delivery</SelectItem>
              <SelectItem value="cod">COD Available</SelectItem>
              <SelectItem value="free_shipping">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Vendor Rating</label>
          <Select value={selectedFilters.vendor} onValueChange={(value) => setSelectedFilters({...selectedFilters, vendor: value})}>
            <SelectTrigger>
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5_star">5 Star Vendors</SelectItem>
              <SelectItem value="4_plus">4+ Star Vendors</SelectItem>
              <SelectItem value="3_plus">3+ Star Vendors</SelectItem>
              <SelectItem value="verified">Verified Vendors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="sale-items" />
            <label htmlFor="sale-items" className="text-sm text-gray-700">Sale Items Only</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="dhaka-delivery" />
            <label htmlFor="dhaka-delivery" className="text-sm text-gray-700">Dhaka Delivery Available</label>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedFilters({priceRange: '', category: '', stockStatus: '', delivery: '', vendor: ''})}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};
