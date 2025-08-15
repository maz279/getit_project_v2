
import React from 'react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  featured: boolean;
}

interface CategoryMenuProps {
  categories: Category[];
  selectedCategory?: string | null;
  onCategorySelect: (categoryId: string) => void;
}

export const CategoryMenu: React.FC<CategoryMenuProps> = ({
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h1>
        <p className="text-gray-600">Discover millions of products across all categories</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`relative group cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
              selectedCategory === category.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color} text-white group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <Badge variant="secondary" className="text-xs mt-1">
                  {category.count.toLocaleString()}
                </Badge>
              </div>
            </div>
            
            {category.featured && (
              <div className="absolute -top-2 -right-2">
                <Badge variant="destructive" className="text-xs">Hot</Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
