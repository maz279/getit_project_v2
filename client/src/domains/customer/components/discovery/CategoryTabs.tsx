
import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { ProductGrid } from './ProductGrid';

interface SubmenuItem {
  name: string;
  subcategories: Array<{
    name: string;
    count: number;
  }>;
}

interface CategoryTabsProps {
  submenu: SubmenuItem | null | undefined;
  selectedTab?: string | null;
  activeTab: string;
  onTabSelect: (tabId: string) => void;
  onActiveTabChange: (tab: string) => void;
  category?: string | null;
  subcategory?: string | null;
  subSubcategory?: string | null;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  submenu,
  selectedTab,
  activeTab,
  onTabSelect,
  onActiveTabChange,
  category,
  subcategory,
  subSubcategory
}) => {
  if (!submenu) return null;

  const totalProducts = submenu.subcategories.reduce((sum, sub) => sum + sub.count, 0);

  return (
    <div className="border-b bg-gray-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{submenu.name}</h3>
            <p className="text-gray-600">
              {totalProducts.toLocaleString()} products available
            </p>
          </div>
          
          {/* Subcategory Tags */}
          <div className="flex flex-wrap gap-2">
            {submenu.subcategories.slice(0, 6).map((sub, index) => (
              <button
                key={index}
                onClick={() => onTabSelect(sub.name)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTab === sub.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border hover:bg-gray-50'
                }`}
              >
                {sub.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {sub.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid - Show all products without tabs */}
        <div className="mt-0">
          <ProductGrid
            category={category}
            submenu={subcategory}
            tab={subSubcategory}
            activeTab="all"
            tabType="all"
          />
        </div>
      </div>
    </div>
  );
};
