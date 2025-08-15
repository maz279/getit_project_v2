
import { MainCategory } from '../categoriesData';
import { createElement } from 'react';
import { Monitor } from 'lucide-react';
import { softwareAppsData } from './digitalProducts/softwareAppsData';
import { digitalEntertainmentData } from './digitalProducts/digitalEntertainmentData';
import { onlineServicesData } from './digitalProducts/onlineServicesData';

export const digitalProductsData: MainCategory = {
  id: 'digital-products-services',
  name: 'Digital Products & Services',
  icon: createElement(Monitor, { className: 'w-6 h-6' }),
  color: 'text-blue-600',
  count: 1234,
  featured: false,
  subcategories: {
    'software-applications': softwareAppsData,
    'digital-entertainment': digitalEntertainmentData,
    'online-services': onlineServicesData
  }
};
