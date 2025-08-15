
import React from 'react';
import { Wrench } from 'lucide-react';
import { MainCategory } from './types';

export const toolsHardwareData: MainCategory = {
  id: 'tools-hardware',
  name: 'Tools & Hardware',
  icon: React.createElement(Wrench, { className: "w-6 h-6" }),
  color: 'bg-stone-600 text-white',
  count: 23210,
  subcategories: {
    'hand-tools': {
      name: "Hand Tools",
      subcategories: [
        { name: 'Basic Tools', count: 6543 },
        { name: 'Measuring Tools', count: 4321 },
        { name: 'Cutting Tools', count: 3210 },
        { name: 'Safety Equipment', count: 2987 }
      ]
    },
    'power-tools': {
      name: "Power Tools",
      subcategories: [
        { name: 'Electric Tools', count: 4321 },
        { name: 'Cordless Tools', count: 3210 },
        { name: 'Tool Accessories', count: 2109 },
        { name: 'Workbenches', count: 1876 }
      ]
    }
  }
};
