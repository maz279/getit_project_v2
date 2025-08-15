
import React from 'react';
import { Package } from 'lucide-react';

interface CategoryItemsListProps {
  items: string[];
  categoryName: string;
}

export const CategoryItemsList: React.FC<CategoryItemsListProps> = ({ items, categoryName }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="font-bold text-lg mb-4 text-gray-800">
        Available Items in {categoryName}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{item}</h4>
                <p className="text-sm text-gray-500">Available from verified vendors</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
