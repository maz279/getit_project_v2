
import React from 'react';
import { Factory } from 'lucide-react';
import { MainCategory } from './types';

export const industrialSuppliesData: MainCategory = {
  id: 'industrial-supplies',
  name: 'Industrial Supplies',
  icon: React.createElement(Factory, { className: "w-6 h-6" }),
  color: 'bg-gray-600 text-white',
  count: 8543,
  subcategories: {
    'manufacturing': {
      name: "Manufacturing",
      subcategories: [
        { name: 'Industrial Tools', count: 2109 },
        { name: 'Raw Materials', count: 1876 },
        { name: 'Machinery Parts', count: 1654 },
        { name: 'Safety Equipment', count: 1432 }
      ]
    },
    'industrial-equipment': {
      name: "Industrial Equipment",
      subcategories: [
        { name: 'Heavy Machinery', count: 1432 },
        { name: 'Electrical Equipment', count: 1210 },
        { name: 'Hydraulic Systems', count: 1098 },
        { name: 'Pneumatic Tools', count: 987 }
      ]
    }
  }
};
