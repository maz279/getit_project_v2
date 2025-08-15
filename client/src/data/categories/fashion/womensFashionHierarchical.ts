
import { traditionalEthnic } from './hierarchical/traditionalEthnic';
import { westernModern } from './hierarchical/westernModern';
import { activewear } from './hierarchical/activewear';
import { sleepwear } from './hierarchical/sleepwear';
import { swimwear } from './hierarchical/swimwear';
import { intimates } from './hierarchical/intimates';
import { seasonalWeather } from './hierarchical/seasonalWeather';
import { festivalSpecial } from './hierarchical/festivalSpecial';
import { accessories } from './hierarchical/accessories';
import { HierarchicalStructure, SubCategory } from './hierarchical/types';

// Complete hierarchical structure for Women's Fashion as per guidelines
export const womensFashionHierarchical: HierarchicalStructure = {
  name: "Women's Fashion",
  subcategories: {
    ...traditionalEthnic,
    ...westernModern,
    ...activewear,
    ...sleepwear,
    ...swimwear,
    ...intimates,
    ...seasonalWeather,
    ...festivalSpecial,
    ...accessories
  }
};

// Convert to flat structure for compatibility
export const womensFashionDataConverted: SubCategory = {
  name: "Women's Fashion",
  subcategories: Object.values(womensFashionHierarchical.subcategories).reduce((acc, mainCategory) => {
    Object.values(mainCategory.subcategories).forEach(subCategory => {
      Object.values(subCategory.subcategories).forEach(subSubCategory => {
        acc.push(...subSubCategory.items);
      });
    });
    return acc;
  }, [] as Array<{ name: string; count: number }>)
};
