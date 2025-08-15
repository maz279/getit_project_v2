
import React from 'react';
import { Gift } from 'lucide-react';
import { MainCategory } from './types';

export const giftItemsData: MainCategory = {
  id: 'gift-items',
  name: 'Gift Items',
  icon: React.createElement(Gift, { className: "w-6 h-6" }),
  color: 'bg-pink-600 text-white',
  count: 14321,
  subcategories: {
    'occasion-gifts': {
      name: "Occasion Gifts",
      subcategories: [
        { name: 'Birthday Gifts', count: 3210 },
        { name: 'Wedding Gifts', count: 2987 },
        { name: 'Anniversary Gifts', count: 2109 },
        { name: 'Holiday Gifts', count: 1876 }
      ]
    },
    'corporate-gifts': {
      name: "Corporate Gifts",
      subcategories: [
        { name: 'Business Gifts', count: 2109 },
        { name: 'Promotional Items', count: 1876 },
        { name: 'Awards & Trophies', count: 1654 },
        { name: 'Gift Cards', count: 1432 }
      ]
    }
  }
};
