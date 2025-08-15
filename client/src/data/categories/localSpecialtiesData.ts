
import { MainCategory } from '../categoriesData';
import { createElement } from 'react';
import { MapPin } from 'lucide-react';
import { regionalProductsData } from './localSpecialties/regionalProductsData';
import { artisanProductsData } from './localSpecialties/artisanProductsData';

export const localSpecialtiesData: MainCategory = {
  id: 'local-specialties',
  name: 'Local Specialties (স্থানীয় বিশেষত্ব)',
  icon: createElement(MapPin, { className: 'w-6 h-6' }),
  color: 'text-orange-600',
  count: 2150,
  featured: true,
  subcategories: {
    'regional-products': regionalProductsData,
    'artisan-products': artisanProductsData
  }
};
