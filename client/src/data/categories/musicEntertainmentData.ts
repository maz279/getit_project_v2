
import React from 'react';
import { Music } from 'lucide-react';
import { MainCategory } from './types';

export const musicEntertainmentData: MainCategory = {
  id: 'music-entertainment',
  name: 'Music & Entertainment',
  icon: React.createElement(Music, { className: "w-6 h-6" }),
  color: 'bg-purple-600 text-white',
  count: 29876,
  subcategories: {
    'musical-instruments': {
      name: "Musical Instruments",
      subcategories: [
        { name: 'Traditional Instruments', count: 8765 },
        { name: 'Modern Instruments', count: 6543 },
        { name: 'Audio Equipment', count: 5432 },
        { name: 'Accessories', count: 4321 }
      ]
    },
    'entertainment': {
      name: "Entertainment",
      subcategories: [
        { name: 'DVDs & Blu-rays', count: 3210 },
        { name: 'Streaming Devices', count: 2109 },
        { name: 'Party Supplies', count: 1987 },
        { name: 'Event Equipment', count: 1543 }
      ]
    }
  }
};
