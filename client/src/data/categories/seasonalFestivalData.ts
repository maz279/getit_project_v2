
import React from 'react';
import { Calendar } from 'lucide-react';
import { MainCategory } from './types';

export const seasonalFestivalData: MainCategory = {
  id: 'seasonal-festival',
  name: 'Seasonal & Festival',
  icon: React.createElement(Calendar, { className: "w-6 h-6" }),
  color: 'bg-yellow-600 text-white',
  count: 12987,
  subcategories: {
    'festival-items': {
      name: "Festival Items",
      subcategories: [
        { name: 'Eid Collection', count: 3210 },
        { name: 'Puja Items', count: 2987 },
        { name: 'Christmas Decor', count: 2109 },
        { name: 'New Year Items', count: 1876 }
      ]
    },
    'seasonal-products': {
      name: "Seasonal Products",
      subcategories: [
        { name: 'Summer Essentials', count: 2109 },
        { name: 'Winter Collection', count: 1876 },
        { name: 'Monsoon Gear', count: 1654 },
        { name: 'Spring Collection', count: 1432 }
      ]
    }
  }
};
