
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { CategorySection } from './categories/CategorySection';
import { defaultCategories, customCategories, festivalCollections } from './categories/categoriesData';

interface WishlistCategoriesProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const WishlistCategories: React.FC<WishlistCategoriesProps> = ({
  activeCategory,
  onCategoryChange
}) => {
  const [showCustomCategories, setShowCustomCategories] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Wishlist Categories</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowCustomCategories(!showCustomCategories)}
        >
          {showCustomCategories ? 'Show Less' : 'Show More'}
        </Button>
      </div>

      {/* Default Categories */}
      <CategorySection
        title="Default Categories"
        categories={defaultCategories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />

      {/* Custom Categories */}
      {showCustomCategories && (
        <>
          <CategorySection
            title="My Custom Categories"
            categories={customCategories}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            showCreateButton={true}
            gridCols="grid-cols-1 md:grid-cols-2"
          />

          {/* Festival Collections */}
          <CategorySection
            title="Festival Collections"
            categories={festivalCollections}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            gridCols="grid-cols-1 md:grid-cols-3"
          />
        </>
      )}
    </div>
  );
};
