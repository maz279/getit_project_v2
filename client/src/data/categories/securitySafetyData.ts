
import { MainCategory } from '../categoriesData';
import { createElement } from 'react';
import { Shield } from 'lucide-react';
import { homeSecurityData } from './securitySafety/homeSecurityData';

export const securitySafetyData: MainCategory = {
  id: 'security-safety',
  name: 'Security & Safety',
  icon: createElement(Shield, { className: 'w-6 h-6' }),
  color: 'text-orange-700',
  count: 1654,
  featured: false,
  subcategories: {
    'home-security': homeSecurityData
  }
};
