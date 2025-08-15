
import { MainCategory } from '../categoriesData';
import { createElement } from 'react';
import { TreePine } from 'lucide-react';
import { gardeningSuppliesData } from './gardenOutdoor/gardeningSuppliesData';
import { outdoorLivingData } from './gardenOutdoor/outdoorLivingData';

export const gardenOutdoorData: MainCategory = {
  id: 'garden-outdoor',
  name: 'Garden & Outdoor',
  icon: createElement(TreePine, { className: 'w-6 h-6' }),
  color: 'text-green-600',
  count: 4321,
  featured: false,
  subcategories: {
    'gardening-supplies': gardeningSuppliesData,
    'outdoor-living': outdoorLivingData
  }
};
