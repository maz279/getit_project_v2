
import { MainCategory } from '../categoriesData';
import { createElement } from 'react';
import { Palette } from 'lucide-react';
import { bengaliHandicraftsData } from './handicrafts/bengaliHandicraftsData';
import { islamicArtData } from './handicrafts/islamicArtData';
import { folkArtData } from './handicrafts/folkArtData';
import { handmadeTextilesData } from './handicrafts/handmadeTextilesData';

export const handicraftsData: MainCategory = {
  id: 'handicrafts-traditional',
  name: 'Handicrafts & Traditional Items',
  icon: createElement(Palette, { className: 'w-6 h-6' }),
  color: 'text-orange-600',
  count: 5678,
  featured: true,
  subcategories: {
    'bengali-handicrafts': bengaliHandicraftsData,
    'islamic-art-decor': islamicArtData,
    'folk-art-crafts': folkArtData,
    'handmade-textiles': handmadeTextilesData
  }
};
