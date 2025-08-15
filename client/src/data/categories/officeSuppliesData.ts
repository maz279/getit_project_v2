
import React from 'react';
import { Briefcase } from 'lucide-react';
import { MainCategory } from './types';

export const officeSuppliesData: MainCategory = {
  id: 'office-supplies',
  name: 'Office Supplies',
  icon: React.createElement(Briefcase, { className: "w-6 h-6" }),
  color: 'bg-slate-600 text-white',
  count: 25432,
  subcategories: {
    'stationery': {
      name: "Stationery",
      subcategories: [
        { name: 'Writing Instruments', count: 7654 },
        { name: 'Paper Products', count: 6543 },
        { name: 'Filing & Storage', count: 5432 },
        { name: 'Desk Accessories', count: 4321 }
      ]
    },
    'office-equipment': {
      name: "Office Equipment",
      subcategories: [
        { name: 'Printers & Scanners', count: 3210 },
        { name: 'Office Furniture', count: 2987 },
        { name: 'Communication', count: 2109 },
        { name: 'Security', count: 1876 }
      ]
    }
  }
};
