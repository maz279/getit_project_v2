
import React from 'react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ChevronRight } from 'lucide-react';

interface SubmenuItem {
  name: string;
  subcategories: Array<{
    name: string;
    count: number;
  }>;
}

interface Category {
  id: string;
  name: string;
  subcategories: {
    [key: string]: SubmenuItem;
  };
}

interface CategorySubmenuProps {
  category: Category | null | undefined;
  selectedSubmenu?: string | null;
  onSubmenuSelect: (submenuId: string) => void;
}

export const CategorySubmenu: React.FC<CategorySubmenuProps> = ({
  category,
  selectedSubmenu,
  onSubmenuSelect
}) => {
  if (!category) return null;

  const submenuItems = Object.entries(category.subcategories);

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
        <ChevronRight className="w-5 h-5 mx-2 text-gray-400" />
        <span className="text-gray-600">Select Subcategory</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {submenuItems.map(([key, submenu]) => {
          const totalCount = submenu.subcategories.reduce((sum, sub) => sum + sub.count, 0);
          
          return (
            <div
              key={key}
              onClick={() => onSubmenuSelect(key)}
              className={`group cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                selectedSubmenu === key
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                  {submenu.name}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {totalCount.toLocaleString()}
                </Badge>
              </div>
              
              <div className="space-y-1">
                {submenu.subcategories.slice(0, 4).map((sub, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-600">
                    <span>{sub.name}</span>
                    <span className="text-gray-400">({sub.count})</span>
                  </div>
                ))}
                {submenu.subcategories.length > 4 && (
                  <div className="text-xs text-blue-600 font-medium">
                    +{submenu.subcategories.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
