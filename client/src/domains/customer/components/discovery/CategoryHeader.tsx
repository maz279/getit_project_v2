
import React from 'react';
import { Filter, Grid3X3, List } from 'lucide-react';

interface CategoryHeaderProps {
  title: string;
  description: string;
  productCount: number;
  viewMode: 'grid' | 'list';
  sortBy: string;
  showFilters: boolean;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (sortBy: string) => void;
  onToggleFilters: () => void;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  title,
  description,
  productCount,
  viewMode,
  sortBy,
  showFilters,
  onViewModeChange,
  onSortChange,
  onToggleFilters
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {productCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Products Available</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleFilters}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
