
import React from 'react';
import { Filter, Grid3X3, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';

interface WishlistToolbarProps {
  onSortChange: (sort: string) => void;
  onViewModeChange: (mode: 'grid' | 'list' | 'compact') => void;
  viewMode: 'grid' | 'list' | 'compact';
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFiltersCount: number;
}

export const WishlistToolbar: React.FC<WishlistToolbarProps> = ({
  onSortChange,
  onViewModeChange,
  viewMode,
  showFilters,
  onToggleFilters,
  activeFiltersCount
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <Select onValueChange={onSortChange} defaultValue="newest">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Date Added (Newest)</SelectItem>
            <SelectItem value="oldest">Date Added (Oldest)</SelectItem>
            <SelectItem value="price_low">Price (Low to High)</SelectItem>
            <SelectItem value="price_high">Price (High to Low)</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="stock">Stock Availability</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount} active
          </Badge>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-gray-600">View:</span>
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="p-2"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="p-2"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('compact')}
            className="p-2"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
