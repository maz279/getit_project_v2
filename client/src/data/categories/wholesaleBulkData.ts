
import { MainCategory } from '../categoriesData';
import { createElement } from 'react';
import { Scale } from 'lucide-react';
import { bulkOrdersData } from './wholesaleBulk/bulkOrdersData';

export const wholesaleBulkData: MainCategory = {
  id: 'wholesale-bulk',
  name: 'Wholesale & Bulk',
  icon: createElement(Scale, { className: 'w-6 h-6' }),
  color: 'text-purple-700',
  count: 2987,
  featured: false,
  subcategories: {
    'bulk-orders': bulkOrdersData
  }
};
