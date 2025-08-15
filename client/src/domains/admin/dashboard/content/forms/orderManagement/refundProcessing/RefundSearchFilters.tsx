import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Search, Filter } from 'lucide-react';

interface RefundSearchFiltersProps {
  onSearch?: (filters: any) => void;
}

export const RefundSearchFilters: React.FC<RefundSearchFiltersProps> = ({ onSearch }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Refund Search Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Order ID</label>
            <Input placeholder="Enter order ID" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Refund Status</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Input type="date" />
          </div>
        </div>
        <Button className="w-full md:w-auto">
          <Search className="h-4 w-4 mr-2" />
          Search Refunds
        </Button>
      </CardContent>
    </Card>
  );
};