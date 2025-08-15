
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Search, Filter, Download, RefreshCw, Users, TrendingUp } from 'lucide-react';

interface BehaviorHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSegment: string;
  onSegmentChange: (segment: string) => void;
}

export const BehaviorHeader: React.FC<BehaviorHeaderProps> = ({
  onRefresh,
  onExport,
  searchQuery,
  onSearchChange,
  selectedSegment,
  onSegmentChange
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Customer Behavior Analytics</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onRefresh} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          
          <Button variant="outline" onClick={onExport} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers by name, email, or behavior..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedSegment} onValueChange={onSegmentChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="high_value">High-Value Loyalists</SelectItem>
              <SelectItem value="mobile_first">Mobile-First Shoppers</SelectItem>
              <SelectItem value="at_risk">At-Risk Customers</SelectItem>
              <SelectItem value="new_customers">New Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
