
import React from 'react';
import { CategoryBreadcrumb } from './CategoryBreadcrumb';
import { MainCategory } from '@/data/categoriesData';
import { useHierarchicalData, useSubcategoryValidation } from './categoryMainContent/CategoryMainContentLogic';
import { CategoryContentLayout } from './categoryMainContent/CategoryContentLayout';
import { DefaultContent } from './categoryMainContent/DefaultContent';
import { getActualSubSubcategory } from './categoryMainContent/URLUtils';

interface SubmenuItem {
  name: string;
  subcategories: Array<{
    name: string;
    count: number;
  }>;
}

interface CategoryMainContentProps {
  selectedCategory?: string | null;
  selectedSubcategory?: string | null;
  selectedSubSubcategory?: string | null;
  currentCategory?: MainCategory | null;
  currentSubmenu?: SubmenuItem | null;
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
}

export const CategoryMainContent: React.FC<CategoryMainContentProps> = ({
  selectedCategory,
  selectedSubcategory,
  selectedSubSubcategory,
  currentCategory,
  currentSubmenu,
  activeTab,
  onActiveTabChange
}) => {
  const actualSubSubcategory = getActualSubSubcategory(selectedSubSubcategory);
  
  console.log('CategoryMainContent - selectedCategory:', selectedCategory);
  console.log('CategoryMainContent - selectedSubcategory:', selectedSubcategory);
  console.log('CategoryMainContent - actualSubSubcategory:', actualSubSubcategory);

  const { getHierarchicalData } = useHierarchicalData(selectedCategory, selectedSubcategory);
  const hierarchicalData = getHierarchicalData();
  
  const { shouldShowSubcategoryDetails } = useSubcategoryValidation(hierarchicalData, actualSubSubcategory);
  const showSubcategoryDetails = shouldShowSubcategoryDetails();

  if (!selectedCategory) {
    return <DefaultContent />;
  }

  return (
    <div className="space-y-0">
      {/* Breadcrumb */}
      <CategoryBreadcrumb
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        selectedSubSubcategory={actualSubSubcategory}
        currentCategory={currentCategory}
        currentSubmenu={currentSubmenu}
      />

      {/* Main Content with Sidebar */}
      <CategoryContentLayout
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        actualSubSubcategory={actualSubSubcategory}
        activeTab={activeTab}
        shouldShowSubcategoryDetails={showSubcategoryDetails}
      />
    </div>
  );
};
