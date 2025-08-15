
import React from 'react';
import { CategoryList } from './CategoryList';
import { CategoryFilters } from './CategoryFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Filter, List } from 'lucide-react';

interface CategorySidebarProps {
  onCategorySelect: (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => void;
  selectedCategory?: string | null;
  selectedSubcategory?: string | null;
  selectedSubSubcategory?: string | null;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  onCategorySelect,
  selectedCategory,
  selectedSubcategory,
  selectedSubSubcategory
}) => {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <List className="w-5 h-5 text-blue-600" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <CategoryList 
            onCategorySelect={onCategorySelect}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedSubSubcategory={selectedSubSubcategory}
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-blue-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <CategoryFilters />
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
              New Arrivals
            </button>
            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
              Best Sellers
            </button>
            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
              Sale Items
            </button>
            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
              Featured Products
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
