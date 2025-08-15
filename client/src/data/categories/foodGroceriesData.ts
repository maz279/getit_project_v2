
import React from 'react';
import { Coffee } from 'lucide-react';
import { MainCategory } from './types';

export const foodGroceriesData: MainCategory = {
  id: 'food-groceries',
  name: 'Food & Groceries',
  icon: React.createElement(Coffee, { className: "w-6 h-6" }),
  color: 'bg-emerald-500 text-white',
  count: 54321,
  subcategories: {
    'fresh-food': {
      name: "Fresh Food",
      subcategories: [
        { name: 'Fruits & Vegetables', count: 12345 },
        { name: 'Meat & Poultry', count: 9876 },
        { name: 'Fish & Seafood', count: 8765 },
        { name: 'Dairy Products', count: 6543 }
      ]
    },
    'packaged-foods': {
      name: "Packaged Foods",
      subcategories: [
        { name: 'Rice & Grains', count: 15678 },
        { name: 'Snacks & Confectionery', count: 12345 },
        { name: 'Beverages', count: 9876 },
        { name: 'Cooking Ingredients', count: 8765 }
      ]
    }
  }
};
