/**
 * PHASE 2: FILTER CONTROLS COMPONENT
 * Advanced filtering and search functionality for product moderation
 * Investment: $25,000 | Week 1: Component Decomposition
 * Date: July 26, 2025
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  RefreshCw,
  Download,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../../../../store';
import { updateFilters, clearFilters } from '../../../../../../../../store/slices/moderationSlice';
import type { ModerationFilters } from '../types/moderationTypes';

interface FilterControlsProps {
  className?: string;
  onSearch?: (filters: ModerationFilters) => void;
  onExport?: () => void;
  showExport?: boolean;
}

export const FilterControls = memo<FilterControlsProps>(({
  className = '',
  onSearch,
  onExport,
  showExport = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { filters, loading } = useSelector((state: RootState) => ({
    filters: state.moderation.filters,
    loading: state.moderation.loading.products,
  }));

  // Local state for form inputs
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Available filter options
  const filterOptions = useMemo(() => ({
    status: [
      { value: 'pending-review', label: 'Pending Review' },
      { value: 'content-review', label: 'Content Review' },
      { value: 'quality-check', label: 'Quality Check' },
      { value: 'escalated', label: 'Escalated' },
    ],
    priority: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High Priority' },
      { value: 'medium', label: 'Medium Priority' },
      { value: 'low', label: 'Low Priority' },
    ],
    category: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'fashion', label: 'Fashion' },
      { value: 'food', label: 'Food & Beverages' },
      { value: 'home', label: 'Home & Garden' },
      { value: 'health', label: 'Health & Beauty' },
      { value: 'sports', label: 'Sports & Outdoors' },
    ],
    vendor: [
      { value: 'tech-solutions-bd', label: 'Tech Solutions BD' },
      { value: 'heritage-fashion-bd', label: 'Heritage Fashion BD' },
      { value: 'natural-products-bd', label: 'Natural Products BD' },
      { value: 'digital-world-bd', label: 'Digital World BD' },
      { value: 'green-life-bd', label: 'Green Life BD' },
    ],
    sortBy: [
      { value: 'submittedAt', label: 'Submission Date' },
      { value: 'priority', label: 'Priority' },
      { value: 'score', label: 'Quality Score' },
      { value: 'name', label: 'Product Name' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'category', label: 'Category' },
    ],
  }), []);

  // Handle filter updates
  const handleFilterUpdate = useCallback((updates: Partial<ModerationFilters>) => {
    const newFilters = { ...filters, ...updates };
    dispatch(updateFilters(newFilters));
    onSearch?.(newFilters);
  }, [dispatch, filters, onSearch]);

  // Handle array filter toggles
  const handleArrayFilterToggle = useCallback((
    filterType: 'status' | 'priority' | 'category' | 'vendor',
    value: string
  ) => {
    const currentArray = filters[filterType] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterUpdate({ [filterType]: newArray });
  }, [filters, handleFilterUpdate]);

  // Handle search
  const handleSearch = useCallback(() => {
    handleFilterUpdate({ searchQuery });
  }, [searchQuery, handleFilterUpdate]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    dispatch(clearFilters());
    onSearch?.(filters);
  }, [dispatch, filters, onSearch]);

  // Handle export
  const handleExport = useCallback(() => {
    onExport?.();
  }, [onExport]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    count += filters.status.length;
    count += filters.priority.length;
    count += filters.category.length;
    count += filters.vendor.length;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.hasFlags) count++;
    return count;
  }, [filters]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Filtering & Search
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Simple' : 'Advanced'}
            </Button>
            {showExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <Label htmlFor="search-input" className="sr-only">Search</Label>
            <Input
              id="search-input"
              placeholder="Search by product name, ID, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Select
            value={filters.status.join(',')}
            onValueChange={(value) => handleFilterUpdate({ status: value ? value.split(',') : [] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.status.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priority.join(',')}
            onValueChange={(value) => handleFilterUpdate({ priority: value ? value.split(',') : [] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.priority.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category.join(',')}
            onValueChange={(value) => handleFilterUpdate({ category: value ? value.split(',') : [] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.category.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.vendor.join(',')}
            onValueChange={(value) => handleFilterUpdate({ vendor: value ? value.split(',') : [] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.vendor.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="space-y-4 pt-4 border-t">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Submitted After</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => handleFilterUpdate({
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Submitted Before</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => handleFilterUpdate({
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Score Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-score">Min Quality Score</Label>
                <Input
                  id="min-score"
                  type="number"
                  min="0"
                  max="100"
                  value={filters.minScore || ''}
                  onChange={(e) => handleFilterUpdate({
                    minScore: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                />
              </div>
              <div>
                <Label htmlFor="max-score">Max Quality Score</Label>
                <Input
                  id="max-score"
                  type="number"
                  min="0"
                  max="100"
                  value={filters.maxScore || ''}
                  onChange={(e) => handleFilterUpdate({
                    maxScore: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-flags"
                  checked={filters.hasFlags}
                  onCheckedChange={(checked) => handleFilterUpdate({ hasFlags: !!checked })}
                />
                <Label htmlFor="has-flags">Only items with flags</Label>
              </div>
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Label htmlFor="sort-select">Sort by:</Label>
            <Select
              value={filters.sortBy || 'submittedAt'}
              onValueChange={(value) => handleFilterUpdate({ sortBy: value as any })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.sortBy.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterUpdate({
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
              })}
            >
              {filters.sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.searchQuery && (
              <Badge variant="secondary" className="flex items-center">
                Search: "{filters.searchQuery}"
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => {
                    setSearchQuery('');
                    handleFilterUpdate({ searchQuery: '' });
                  }}
                />
              </Badge>
            )}
            
            {filters.status.map(status => (
              <Badge key={status} variant="secondary" className="flex items-center">
                Status: {filterOptions.status.find(opt => opt.value === status)?.label}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleArrayFilterToggle('status', status)}
                />
              </Badge>
            ))}
            
            {filters.priority.map(priority => (
              <Badge key={priority} variant="secondary" className="flex items-center">
                Priority: {filterOptions.priority.find(opt => opt.value === priority)?.label}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleArrayFilterToggle('priority', priority)}
                />
              </Badge>
            ))}
            
            {filters.category.map(category => (
              <Badge key={category} variant="secondary" className="flex items-center">
                Category: {filterOptions.category.find(opt => opt.value === category)?.label}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleArrayFilterToggle('category', category)}
                />
              </Badge>
            ))}
            
            {filters.vendor.map(vendor => (
              <Badge key={vendor} variant="secondary" className="flex items-center">
                Vendor: {filterOptions.vendor.find(opt => opt.value === vendor)?.label}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleArrayFilterToggle('vendor', vendor)}
                />
              </Badge>
            ))}
            
            {filters.hasFlags && (
              <Badge variant="secondary" className="flex items-center">
                Has Flags
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterUpdate({ hasFlags: false })}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

FilterControls.displayName = 'FilterControls';