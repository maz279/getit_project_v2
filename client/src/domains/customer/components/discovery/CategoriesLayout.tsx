
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { CategorySidebar } from './CategorySidebar';
import { CategoryMainContent } from './CategoryMainContent';
import { categoriesData } from '@/data/categoriesData';

export const CategoriesLayout: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category'));
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory'));
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(searchParams.get('subsubcategory'));
  const [activeTab, setActiveTab] = useState('all');

  const handleCategorySelect = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId || null);
    setSelectedSubSubcategory(subSubcategoryId || null);
    
    const params = new URLSearchParams();
    params.set('category', categoryId);
    if (subcategoryId) params.set('subcategory', subcategoryId);
    if (subSubcategoryId) params.set('subsubcategory', subSubcategoryId);
    setSearchParams(params);
  };

  const getCurrentCategory = () => {
    return categoriesData.find(cat => cat.id === selectedCategory);
  };

  const getCurrentSubmenu = () => {
    const category = getCurrentCategory();
    if (!category || !selectedSubcategory) return null;
    
    const submenuData = category.subcategories[selectedSubcategory];
    if (!submenuData) return null;
    
    // Transform the data structure to match what the components expect
    return {
      name: submenuData.name,
      subcategories: submenuData.subcategories.map(sub => ({
        name: sub.name,
        count: sub.count
      }))
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <CategorySidebar
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              selectedSubSubcategory={selectedSubSubcategory}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <CategoryMainContent
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              selectedSubSubcategory={selectedSubSubcategory}
              currentCategory={getCurrentCategory()}
              currentSubmenu={getCurrentSubmenu()}
              activeTab={activeTab}
              onActiveTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
