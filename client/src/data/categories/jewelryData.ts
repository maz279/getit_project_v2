
import React from 'react';
import { Diamond } from 'lucide-react';
import { MainCategory } from './types';

export const jewelryData: MainCategory = {
  id: 'jewelry',
  name: 'Jewelry & Accessories',
  icon: React.createElement(Diamond, { className: "w-6 h-6" }),
  color: 'bg-purple-500 text-white',
  count: 43210,
  featured: true,
  subcategories: {
    'traditional-jewelry': {
      name: "Traditional Jewelry",
      subcategories: [
        { name: 'Gold Jewelry', count: 12345 },
        { name: 'Silver Jewelry', count: 9876 },
        { name: 'Bangles & Bracelets', count: 8765 },
        { name: 'Earrings', count: 6543 },
        { name: 'Necklaces', count: 5432 }
      ]
    },
    'fashion-jewelry': {
      name: "Fashion Jewelry",
      subcategories: [
        { name: 'Artificial Jewelry', count: 15678 },
        { name: 'Costume Jewelry', count: 12345 },
        { name: 'Watches', count: 9876 },
        { name: 'Sunglasses', count: 8765 }
      ]
    }
  }
};
