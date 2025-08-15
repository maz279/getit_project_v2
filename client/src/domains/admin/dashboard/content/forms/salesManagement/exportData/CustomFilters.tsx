
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

interface CustomFiltersProps {
  customFilters: {
    minAmount: string;
    maxAmount: string;
    category: string;
    status: string;
    customerSegment: string;
  };
  setCustomFilters: React.Dispatch<React.SetStateAction<{
    minAmount: string;
    maxAmount: string;
    category: string;
    status: string;
    customerSegment: string;
  }>>;
}

export const CustomFilters: React.FC<CustomFiltersProps> = ({
  customFilters,
  setCustomFilters
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minAmount">Minimum Amount (৳)</Label>
            <Input
              id="minAmount"
              type="number"
              value={customFilters.minAmount}
              onChange={(e) => setCustomFilters(prev => ({ ...prev, minAmount: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxAmount">Maximum Amount (৳)</Label>
            <Input
              id="maxAmount"
              type="number"
              value={customFilters.maxAmount}
              onChange={(e) => setCustomFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
              placeholder="No limit"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Product Category</Label>
            <Select value={customFilters.category} onValueChange={(value) => setCustomFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="home-garden">Home & Garden</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="beauty">Beauty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Order Status</Label>
            <Select value={customFilters.status} onValueChange={(value) => setCustomFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
