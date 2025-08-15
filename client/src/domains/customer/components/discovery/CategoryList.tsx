
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { categoriesData } from '@/data/categoriesData';
import { CategoryItem } from './categoryList/CategoryItem';
import { SubcategoryItem } from './categoryList/SubcategoryItem';
import { CategoryListProps } from './categoryList/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

export const CategoryList: React.FC<CategoryListProps> = ({
  onCategorySelect,
  selectedCategory,
  selectedSubcategory,
  selectedSubSubcategory
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([selectedCategory].filter(Boolean)));
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set([selectedSubcategory].filter(Boolean)));

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect(categoryId);
  };

  return (
    <div className="space-y-1">
      <Accordion type="multiple" className="w-full">
        {categoriesData.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-b border-gray-100 last:border-b-0">
            <AccordionTrigger 
              className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors ${
                selectedCategory === category.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${category.color}`}>
                  {category.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm">{category.name}</div>
                  <div className="text-xs text-gray-500">({category.count.toLocaleString()})</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {category.featured && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="ml-6 mt-2 space-y-1">
                {Object.entries(category.subcategories).map(([subcatId, subcategory]) => (
                  <div key={subcatId}>
                    <SubcategoryItem
                      subcategoryId={subcatId}
                      subcategory={subcategory}
                      categoryId={category.id}
                      onCategorySelect={onCategorySelect}
                      selectedSubcategory={selectedSubcategory}
                      selectedSubSubcategory={selectedSubSubcategory}
                      isExpanded={expandedSubcategories.has(subcatId)}
                      onToggleSubcategory={toggleSubcategory}
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
