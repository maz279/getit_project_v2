
import React from 'react';
import { Car } from 'lucide-react';
import { MainCategory } from './types';

export const automobilesData: MainCategory = {
  id: 'automobiles',
  name: 'Automobiles',
  icon: React.createElement(Car, { className: "w-6 h-6" }),
  color: 'bg-gray-700 text-white',
  count: 76543,
  subcategories: {
    'cars-motorcycles': {
      name: "Cars & Motorcycles",
      subcategories: [
        { name: 'New Cars', count: 12345 },
        { name: 'Used Cars', count: 23456 },
        { name: 'Motorcycles', count: 15678 },
        { name: 'Bicycles', count: 9876 }
      ]
    },
    'auto-parts': {
      name: "Auto Parts & Accessories",
      subcategories: [
        { name: 'Car Parts', count: 18976 },
        { name: 'Motorcycle Parts', count: 12345 },
        { name: 'Car Accessories', count: 15678 },
        { name: 'Tools & Equipment', count: 9876 }
      ]
    }
  }
};
