
import { MainCategory } from '../categoriesData';
import { createElement } from 'react';
import { Gamepad2 } from 'lucide-react';
import { traditionalGamesData } from './toysHobbies/traditionalGamesData';
import { modernToysData } from './toysHobbies/modernToysData';
import { hobbyCraftSuppliesData } from './toysHobbies/hobbyCraftSuppliesData';

export const toysHobbiesData: MainCategory = {
  id: 'toys-hobbies',
  name: 'Toys & Hobbies',
  icon: createElement(Gamepad2, { className: 'w-6 h-6' }),
  color: 'text-red-600',
  count: 4567,
  featured: true,
  subcategories: {
    'traditional-games': traditionalGamesData,
    'modern-toys': modernToysData,
    'hobby-craft-supplies': hobbyCraftSuppliesData
  }
};
