
import React, { useState } from 'react';
import { WishlistStats } from './WishlistStats';
import { WishlistToolbar } from './WishlistToolbar';
import { WishlistFilters } from './WishlistFilters';

interface DashboardProps {
  totalItems: number;
  totalValue: number;
  availableItems: number;
  priceDrops: number;
  onSortChange: (sort: string) => void;
  onFilterChange: (filters: any) => void;
  onViewModeChange: (mode: 'grid' | 'list' | 'compact') => void;
  viewMode: 'grid' | 'list' | 'compact';
}

export const WishlistDashboard: React.FC<DashboardProps> = ({
  totalItems,
  totalValue,
  availableItems,
  priceDrops,
  onSortChange,
  onFilterChange,
  onViewModeChange,
  viewMode
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: '',
    category: '',
    stockStatus: '',
    delivery: '',
    vendor: ''
  });

  const handleFilterChange = (newFilters: any) => {
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFiltersCount = Object.values(selectedFilters).filter(filter => filter).length;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <WishlistStats
        totalItems={totalItems}
        totalValue={totalValue}
        availableItems={availableItems}
        priceDrops={priceDrops}
      />

      {/* Quick Action Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <WishlistToolbar
          onSortChange={onSortChange}
          onViewModeChange={onViewModeChange}
          viewMode={viewMode}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Advanced Filters */}
        <WishlistFilters
          showFilters={showFilters}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
};
