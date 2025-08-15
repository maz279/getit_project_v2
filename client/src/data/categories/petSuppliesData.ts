
import React from 'react';
import { PawPrint } from 'lucide-react';
import { MainCategory } from './types';

export const petSuppliesData: MainCategory = {
  id: 'pet-supplies',
  name: 'Pet Supplies',
  icon: React.createElement(PawPrint, { className: "w-6 h-6" }),
  color: 'bg-amber-500 text-white',
  count: 27654,
  subcategories: {
    'pet-food': {
      name: "Pet Food & Care",
      subcategories: [
        { name: 'Dog Food', count: 8765 },
        { name: 'Cat Food', count: 6543 },
        { name: 'Bird Food', count: 4321 },
        { name: 'Fish Food', count: 3210 },
        { name: 'Pet Health', count: 5432 }
      ]
    },
    'pet-accessories': {
      name: "Pet Accessories",
      subcategories: [
        { name: 'Pet Toys', count: 4321 },
        { name: 'Pet Beds', count: 3210 },
        { name: 'Collars & Leashes', count: 2987 },
        { name: 'Pet Carriers', count: 2109 }
      ]
    }
  }
};
