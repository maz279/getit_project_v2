
import React from 'react';
import { categoriesData } from '@/data/categoriesData';

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategorySelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categoriesData.map((category) => (
        <div 
          key={category.id} 
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onCategorySelect(category.id)}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`${category.color} p-3 bg-gray-50 rounded-lg`}>
              {category.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{category.name}</h3>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{category.count.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Products Available</div>
            </div>
            {category.featured && (
              <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </div>
            )}
          </div>
          
          <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Browse Products
          </button>
        </div>
      ))}
    </div>
  );
};
