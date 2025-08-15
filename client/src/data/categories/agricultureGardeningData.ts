
import React from 'react';
import { TreePine } from 'lucide-react';
import { MainCategory } from './types';

export const agricultureGardeningData: MainCategory = {
  id: 'agriculture-gardening',
  name: 'Agriculture & Gardening',
  icon: React.createElement(TreePine, { className: "w-6 h-6" }),
  color: 'bg-green-600 text-white',
  count: 21098,
  subcategories: {
    'farming-supplies': {
      name: "Farming Supplies",
      subcategories: [
        { name: 'Seeds & Plants', count: 6543 },
        { name: 'Fertilizers', count: 4321 },
        { name: 'Farming Tools', count: 3210 },
        { name: 'Irrigation', count: 2987 }
      ]
    },
    'gardening': {
      name: "Gardening",
      subcategories: [
        { name: 'Garden Tools', count: 4321 },
        { name: 'Plant Care', count: 3210 },
        { name: 'Garden Decor', count: 2109 },
        { name: 'Outdoor Furniture', count: 1876 }
      ]
    }
  }
};
