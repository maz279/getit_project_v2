
import React from 'react';
import { Paintbrush } from 'lucide-react';
import { MainCategory } from './types';

export const artCraftData: MainCategory = {
  id: 'art-craft',
  name: 'Art & Craft',
  icon: React.createElement(Paintbrush, { className: "w-6 h-6" }),
  color: 'bg-teal-500 text-white',
  count: 32100,
  subcategories: {
    'art-supplies': {
      name: "Art Supplies",
      subcategories: [
        { name: 'Paints & Brushes', count: 8765 },
        { name: 'Drawing Materials', count: 6543 },
        { name: 'Canvas & Paper', count: 5432 },
        { name: 'Art Tools', count: 4321 }
      ]
    },
    'craft-supplies': {
      name: "Craft Supplies",
      subcategories: [
        { name: 'Sewing & Textiles', count: 7654 },
        { name: 'Pottery & Clay', count: 4321 },
        { name: 'Jewelry Making', count: 3210 },
        { name: 'Scrapbooking', count: 2109 }
      ]
    }
  }
};
