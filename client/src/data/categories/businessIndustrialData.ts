
import { MainCategory } from '../categoriesData';
import { createElement } from 'react';
import { Briefcase } from 'lucide-react';
import { officeEquipmentData } from './businessIndustrial/officeEquipmentData';
import { industrialSuppliesData } from './businessIndustrial/industrialSuppliesData';
import { professionalServicesData } from './businessIndustrial/professionalServicesData';

export const businessIndustrialData: MainCategory = {
  id: 'business-industrial',
  name: 'Business & Industrial',
  icon: createElement(Briefcase, { className: 'w-6 h-6' }),
  color: 'text-gray-700',
  count: 5432,
  featured: false,
  subcategories: {
    'office-equipment': officeEquipmentData,
    'industrial-supplies': industrialSuppliesData,
    'professional-services': professionalServicesData
  }
};
