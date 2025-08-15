
import React from 'react';
import { Shirt } from 'lucide-react';
import { MainCategory } from './types';
import { womensFashionDataConverted } from './fashion/womensFashionHierarchical';
import { mensFashionData } from './fashion/mensFashionData';
import { kidsFashionData } from './fashion/kidsFashionData';
import { footwearData } from './fashion/footwearData';
import { bagsAccessoriesData } from './fashion/bagsAccessoriesData';
import { intimatesData } from './fashion/intimatesData';
import { swimwearData } from './fashion/swimwearData';
import { sleepwearData } from './fashion/sleepwearData';
import { activewearData } from './fashion/activewearData';
import { seasonalData } from './fashion/seasonalData';
import { festivalData } from './fashion/festivalData';
import { fabricsData } from './fashion/fabricsData';
import { specialCategoriesData } from './fashion/specialCategoriesData';

export const fashionData: MainCategory = {
  id: 'fashion',
  name: 'Fashion & Apparel',
  icon: React.createElement(Shirt, { className: "w-6 h-6" }),
  color: 'bg-red-500 text-white',
  count: 485672,
  featured: true,
  subcategories: {
    'womens-fashion': womensFashionDataConverted,
    'mens-fashion': mensFashionData,
    'kids-fashion': kidsFashionData,
    'footwear': footwearData,
    'bags-accessories': bagsAccessoriesData,
    'intimates-undergarments': intimatesData,
    'swimwear': swimwearData,
    'sleepwear-loungewear': sleepwearData,
    'activewear-sportswear': activewearData,
    'seasonal-weather': seasonalData,
    'festival-special': festivalData,
    'fabrics-materials': fabricsData,
    'special-categories': specialCategoriesData
  }
};
