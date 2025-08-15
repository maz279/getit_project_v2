
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { Slider } from '@/shared/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Star, Filter, X, MapPin, Truck, Shield, Award, Zap } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';

export const CategoryFilters: React.FC = () => {
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [freeShipping, setFreeShipping] = useState(false);
  const [quickDelivery, setQuickDelivery] = useState(false);
  const [verifiedSeller, setVerifiedSeller] = useState(false);

  const brands = [
    'Fashion House BD', 'Ethnic Wear', 'Heritage Textiles', 'Trendy Fashion',
    'Bridal Couture', 'Urban Style', 'Comfort Zone', 'Glamour Collection',
    'Artisan Craft', 'Royal Collections', 'Modern Trends', 'Classic Style'
  ];

  const locations = [
    'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal',
    'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur'
  ];

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    if (checked) {
      setSelectedLocations([...selectedLocations, location]);
    } else {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    }
  };

  const clearAllFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedBrands([]);
    setSelectedLocations([]);
    setSelectedRating(null);
    setFreeShipping(false);
    setQuickDelivery(false);
    setVerifiedSeller(false);
  };

  return (
    <div className="space-y-4">
      {/* Active Filters */}
      {(selectedBrands.length > 0 || selectedLocations.length > 0 || selectedRating || freeShipping || quickDelivery || verifiedSeller) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {selectedBrands.map(brand => (
                <Badge key={brand} variant="secondary" className="cursor-pointer">
                  {brand}
                  <X className="w-3 h-3 ml-1" onClick={() => handleBrandChange(brand, false)} />
                </Badge>
              ))}
              {selectedLocations.map(location => (
                <Badge key={location} variant="secondary" className="cursor-pointer">
                  <MapPin className="w-3 h-3 mr-1" />
                  {location}
                  <X className="w-3 h-3 ml-1" onClick={() => handleLocationChange(location, false)} />
                </Badge>
              ))}
              {selectedRating && (
                <Badge variant="secondary" className="cursor-pointer">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                  {selectedRating}+ Stars
                  <X className="w-3 h-3 ml-1" onClick={() => setSelectedRating(null)} />
                </Badge>
              )}
              {freeShipping && (
                <Badge variant="secondary" className="cursor-pointer">
                  <Truck className="w-3 h-3 mr-1" />
                  Free Shipping
                  <X className="w-3 h-3 ml-1" onClick={() => setFreeShipping(false)} />
                </Badge>
              )}
              {quickDelivery && (
                <Badge variant="secondary" className="cursor-pointer">
                  <Zap className="w-3 h-3 mr-1" />
                  Quick Delivery
                  <X className="w-3 h-3 ml-1" onClick={() => setQuickDelivery(false)} />
                </Badge>
              )}
              {verifiedSeller && (
                <Badge variant="secondary" className="cursor-pointer">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified Seller
                  <X className="w-3 h-3 ml-1" onClick={() => setVerifiedSeller(false)} />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Price Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={10000}
              min={0}
              step={100}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="flex-1"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
              className="flex-1"
            />
          </div>
          <div className="text-sm text-gray-600 text-center">
            ৳{priceRange[0].toLocaleString()} - ৳{priceRange[1].toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Customer Rating */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="w-4 h-4" />
            Customer Rating
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedRating === rating}
                onCheckedChange={(checked) => setSelectedRating(checked ? rating : null)}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 cursor-pointer">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm">& Up</span>
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Brands */}
      <Card>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4" />
                Brands ({brands.length})
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {brands.map(brand => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={(checked) => handleBrandChange(brand, !!checked)}
                    />
                    <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Location */}
      <Card>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location ({locations.length})
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {locations.map(location => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={selectedLocations.includes(location)}
                      onCheckedChange={(checked) => handleLocationChange(location, !!checked)}
                    />
                    <Label htmlFor={`location-${location}`} className="text-sm cursor-pointer">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Delivery Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Delivery Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="free-shipping"
              checked={freeShipping}
              onCheckedChange={(checked) => setFreeShipping(!!checked)}
            />
            <Label htmlFor="free-shipping" className="text-sm cursor-pointer">
              Free Shipping
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="quick-delivery"
              checked={quickDelivery}
              onCheckedChange={(checked) => setQuickDelivery(!!checked)}
            />
            <Label htmlFor="quick-delivery" className="text-sm cursor-pointer">
              Quick Delivery (1-2 days)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Seller Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Seller Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified-seller"
              checked={verifiedSeller}
              onCheckedChange={(checked) => setVerifiedSeller(!!checked)}
            />
            <Label htmlFor="verified-seller" className="text-sm cursor-pointer">
              Verified Sellers Only
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Apply Filters Button */}
      <Button className="w-full">
        Apply Filters
      </Button>
    </div>
  );
};
