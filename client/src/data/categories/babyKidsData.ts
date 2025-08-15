
import React from 'react';
import { Baby } from 'lucide-react';
import { MainCategory } from './types';

export const babyKidsData: MainCategory = {
  id: 'baby-kids',
  name: 'Baby & Kids',
  icon: React.createElement(Baby, { className: "w-6 h-6" }),
  color: 'bg-yellow-500 text-white',
  count: 98765,
  subcategories: {
    'baby-essentials': {
      name: "Baby Essentials",
      subcategories: [
        { name: 'Feeding', count: 18976 },
        { name: 'Diapering', count: 15432 },
        { name: 'Baby Care', count: 12345 },
        { name: 'Baby Safety', count: 9876 },
        { name: 'Baby Health', count: 8765 }
      ]
    },
    'toys-games': {
      name: "Toys & Games",
      subcategories: [
        { name: 'Educational Toys', count: 23456 },
        { name: 'Action Figures', count: 18976 },
        { name: 'Dolls & Accessories', count: 15678 },
        { name: 'Board Games', count: 12345 },
        { name: 'Outdoor Toys', count: 9876 }
      ]
    },
    'kids-furniture': {
      name: "Kids Furniture",
      subcategories: [
        { name: 'Cribs & Nursery', count: 12345 },
        { name: 'Kids Beds', count: 9876 },
        { name: 'Study Tables', count: 8765 },
        { name: 'Storage Solutions', count: 6543 }
      ]
    }
  }
};
