
import React from 'react';

export interface HierarchicalItem {
  name: string;
  count: number;
}

export interface HierarchicalSubSubCategory {
  name: string;
  items: HierarchicalItem[];
}

export interface HierarchicalSubCategory {
  name: string;
  subcategories: Record<string, HierarchicalSubSubCategory>;
}

export interface HierarchicalMainCategory {
  name: string;
  subcategories: Record<string, HierarchicalSubCategory>;
}

export interface HierarchicalStructure {
  name: string;
  subcategories: Record<string, HierarchicalMainCategory>;
}

export interface SubCategoryItem {
  name: string;
  count: number;
}

export interface SubCategory {
  name: string;
  subcategories: SubCategoryItem[];
}
