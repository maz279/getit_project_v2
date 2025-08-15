
import { MainCategory } from '../categoriesData';
import { createElement } from 'react';
import { Truck } from 'lucide-react';
import { travelAccessoriesData } from './travelLuggage/travelAccessoriesData';
import { outdoorGearData } from './travelLuggage/outdoorGearData';

export const travelLuggageData: MainCategory = {
  id: 'travel-luggage',
  name: 'Travel & Luggage',
  icon: createElement(Truck, { className: 'w-6 h-6' }),
  color: 'text-blue-700',
  count: 2345,
  featured: false,
  subcategories: {
    'travel-accessories': travelAccessoriesData,
    'outdoor-gear': outdoorGearData
  }
};
