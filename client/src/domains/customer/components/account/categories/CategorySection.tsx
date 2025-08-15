
import React from 'react';
import { Button } from '@/shared/ui/button';
import { CategoryCard } from './CategoryCard';
import { CategoryData } from './types';

interface CategorySectionProps {
  title: string;
  categories: CategoryData[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  showCreateButton?: boolean;
  gridCols?: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  categories,
  activeCategory,
  onCategoryChange,
  showCreateButton = false,
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
}) => (
  <div className="space-y-4 mb-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {showCreateButton && (
        <Button variant="outline" size="sm">
          + Create New
        </Button>
      )}
    </div>
    <div className={`grid ${gridCols} gap-4`}>
      {categories.map((category) => (
        <CategoryCard 
          key={category.id} 
          category={category}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
        />
      ))}
    </div>
  </div>
);
