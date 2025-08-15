
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Search, Download, RefreshCw, TrendingUp, Filter } from 'lucide-react';

interface CLVHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSegment: string;
  onSegmentChange: (value: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const CLVHeader: React.FC<CLVHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedSegment,
  onSegmentChange,
  selectedTimeframe,
  onTimeframeChange,
  onRefresh,
  onExport
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Lifetime Value</h1>
            <p className="text-gray-600">Analyze and optimize customer value over time</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mt-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search customers by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-3">
          <Select value={selectedSegment} onValueChange={onSegmentChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Customer Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="high_value">High Value</SelectItem>
              <SelectItem value="medium_value">Medium Value</SelectItem>
              <SelectItem value="low_value">Low Value</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="new_customer">New Customer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTimeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
              <SelectItem value="2years">2 Years</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
