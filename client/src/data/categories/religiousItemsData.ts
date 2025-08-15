
import React from 'react';
import { Archive } from 'lucide-react';
import { MainCategory } from './types';

export const religiousItemsData: MainCategory = {
  id: 'religious-items',
  name: 'Religious Items',
  icon: React.createElement(Archive, { className: "w-6 h-6" }),
  color: 'bg-emerald-600 text-white',
  count: 16543,
  subcategories: {
    'islamic-items': {
      name: "Islamic Items",
      subcategories: [
        { name: 'Prayer Items', count: 4321 },
        { name: 'Islamic Books', count: 3210 },
        { name: 'Islamic Clothing', count: 2987 },
        { name: 'Decorative Items', count: 2109 }
      ]
    },
    'general-religious': {
      name: "General Religious",
      subcategories: [
        { name: 'Prayer Beads', count: 2987 },
        { name: 'Religious Art', count: 2109 },
        { name: 'Ceremonial Items', count: 1876 },
        { name: 'Religious Jewelry', count: 1654 }
      ]
    }
  }
};
