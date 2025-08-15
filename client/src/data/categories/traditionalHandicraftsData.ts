
import React from 'react';
import { Sparkles } from 'lucide-react';
import { MainCategory } from './types';

export const traditionalHandicraftsData: MainCategory = {
  id: 'traditional-handicrafts',
  name: 'Traditional Handicrafts',
  icon: React.createElement(Sparkles, { className: "w-6 h-6" }),
  color: 'bg-rose-600 text-white',
  count: 18765,
  featured: true,
  subcategories: {
    'bengali-handicrafts': {
      name: "Bengali Handicrafts",
      subcategories: [
        { name: 'Nakshi Kantha', count: 4321 },
        { name: 'Jamdani', count: 3210 },
        { name: 'Pottery', count: 2987 },
        { name: 'Wood Crafts', count: 2109 }
      ]
    },
    'folk-art': {
      name: "Folk Art",
      subcategories: [
        { name: 'Traditional Paintings', count: 3210 },
        { name: 'Handwoven Textiles', count: 2987 },
        { name: 'Metal Crafts', count: 2109 },
        { name: 'Bamboo Crafts', count: 1876 }
      ]
    }
  }
};
