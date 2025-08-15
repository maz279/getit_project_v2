
import { ComponentType } from 'react';

export interface CategoryData {
  id: string;
  name: string;
  nameBn: string;
  icon: ComponentType<any>;
  count: number;
  color: string;
  bgColor: string;
  description: string;
  isDefault: boolean;
}

export interface CategoryCardProps {
  category: CategoryData;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}
