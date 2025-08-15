
import React from 'react';

export interface SubCategoryItem {
  name: string;
  count: number;
}

export interface SubCategory {
  name: string;
  subcategories: SubCategoryItem[];
}

export interface MainCategory {
  id: string;
  name: string;
  icon: React.ReactElement;
  color: string;
  count: number;
  featured?: boolean;
  subcategories: Record<string, SubCategory>;
}
