
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { MapPin, Calendar, Users, ArrowLeft, ArrowRight } from 'lucide-react';

interface BusinessDetailsStepProps {
  data: {
    address: string;
    businessType: string;
    description: string;
    establishedYear: string;
    employeeCount: string;
    expectedMonthlyRevenue: string;
    productCategories: string[];
  };
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const businessTypes = [
  'Retailer',
  'Wholesaler', 
  'Manufacturer',
  'Distributor',
  'Service Provider',
  'Other'
];

const categories = [
  'Electronics',
  'Fashion & Clothing',
  'Home & Garden',
  'Sports & Fitness',
  'Books & Education',
  'Health & Beauty',
  'Food & Grocery',
  'Automotive',
  'Baby & Kids',
  'Jewelry & Accessories'
];

export const BusinessDetailsStep: React.FC<BusinessDetailsStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}) => {
  const handleChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...data.productCategories, category]
      : data.productCategories.filter(c => c !== category);
    updateData({ productCategories: updatedCategories });
  };

  const isValid = data.address && data.businessType && data.description && 
                  data.establishedYear && data.employeeCount && data.productCategories.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="address">Business Address *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="address"
              placeholder="Complete business address"
              value={data.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type *</Label>
            <Select value={data.businessType} onValueChange={(value) => handleChange('businessType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="establishedYear">Established Year *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="establishedYear"
                type="number"
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear()}
                value={data.establishedYear}
                onChange={(e) => handleChange('establishedYear', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeCount">Employee Count *</Label>
            <Select value={data.employeeCount} onValueChange={(value) => handleChange('employeeCount', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-5">1-5 employees</SelectItem>
                <SelectItem value="6-20">6-20 employees</SelectItem>
                <SelectItem value="21-50">21-50 employees</SelectItem>
                <SelectItem value="51-100">51-100 employees</SelectItem>
                <SelectItem value="100+">100+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedRevenue">Expected Monthly Revenue (BDT)</Label>
          <Select value={data.expectedMonthlyRevenue} onValueChange={(value) => handleChange('expectedMonthlyRevenue', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select expected monthly revenue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="below-50k">Below ৳50,000</SelectItem>
              <SelectItem value="50k-200k">৳50,000 - ৳2,00,000</SelectItem>
              <SelectItem value="200k-500k">৳2,00,000 - ৳5,00,000</SelectItem>
              <SelectItem value="500k-1m">৳5,00,000 - ৳10,00,000</SelectItem>
              <SelectItem value="above-1m">Above ৳10,00,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Business Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe your business, products, and services..."
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="space-y-4">
          <Label>Product Categories * (Select at least one)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={data.productCategories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                />
                <Label htmlFor={category} className="text-sm font-normal">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="min-w-[120px]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="min-w-[120px]">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
