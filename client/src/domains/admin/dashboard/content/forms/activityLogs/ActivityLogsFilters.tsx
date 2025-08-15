
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

interface ActivityLogsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedLogType: string;
  onLogTypeChange: (value: string) => void;
  selectedDateRange: string;
  onDateRangeChange: (value: string) => void;
}

export const ActivityLogsFilters: React.FC<ActivityLogsFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedLogType,
  onLogTypeChange,
  selectedDateRange,
  onDateRangeChange,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by user, action, or IP address..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedLogType} onValueChange={onLogTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="authentication">Authentication</SelectItem>
              <SelectItem value="user-management">User Management</SelectItem>
              <SelectItem value="product-management">Product Management</SelectItem>
              <SelectItem value="order-management">Order Management</SelectItem>
              <SelectItem value="system">System Events</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1hour">Last Hour</SelectItem>
              <SelectItem value="24hours">Last 24 Hours</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
