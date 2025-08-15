
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { CategoryStructureHeader } from './categoryStructure/CategoryStructureHeader';
import { CategoryStatsCards } from './categoryStructure/CategoryStatsCards';
import { CategoryHierarchyTab } from './categoryStructure/CategoryHierarchyTab';
import { CategoryManagementTab } from './categoryStructure/CategoryManagementTab';
import { CategoryAttributesTab } from './categoryStructure/CategoryAttributesTab';
import { CategoryAnalyticsTab } from './categoryStructure/CategoryAnalyticsTab';
import { CategorySEOTab } from './categoryStructure/CategorySEOTab';
import { mockCategoryData } from './categoryStructure/mockData';

interface CategoryStructureContentProps {
  selectedSubmenu: string;
}

export const CategoryStructureContent: React.FC<CategoryStructureContentProps> = ({ selectedSubmenu }) => {
  const [categories, setCategories] = useState(mockCategoryData.categories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryUpdate = (categoryId: string, updates: any) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, ...updates } : cat
    ));
  };

  const handleCategoryCreate = (newCategory: any) => {
    setCategories(prev => [...prev, { ...newCategory, id: Date.now().toString() }]);
  };

  const handleCategoryDelete = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const getDefaultTab = () => {
    switch (selectedSubmenu) {
      case 'category-hierarchy':
        return 'hierarchy';
      case 'category-attributes':
        return 'attributes';
      case 'category-analytics':
        return 'analytics';
      case 'category-seo':
        return 'seo';
      default:
        return 'management';
    }
  };

  return (
    <div className="space-y-6">
      <CategoryStructureHeader />
      
      <CategoryStatsCards stats={mockCategoryData.stats} />

      <Tabs defaultValue={getDefaultTab()} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="management">🗂️ Category Management</TabsTrigger>
          <TabsTrigger value="hierarchy">🌳 Category Hierarchy</TabsTrigger>
          <TabsTrigger value="attributes">🏷️ Attributes & Rules</TabsTrigger>
          <TabsTrigger value="analytics">📊 Category Analytics</TabsTrigger>
          <TabsTrigger value="seo">🔍 SEO Management</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="mt-6">
          <CategoryManagementTab 
            categories={categories}
            onCategoryUpdate={handleCategoryUpdate}
            onCategoryCreate={handleCategoryCreate}
            onCategoryDelete={handleCategoryDelete}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-6">
          <CategoryHierarchyTab 
            categories={categories}
            onCategoryUpdate={handleCategoryUpdate}
          />
        </TabsContent>

        <TabsContent value="attributes" className="mt-6">
          <CategoryAttributesTab 
            categories={categories}
            attributes={mockCategoryData.attributes}
            rules={mockCategoryData.rules}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <CategoryAnalyticsTab 
            analytics={mockCategoryData.analytics}
            categories={categories}
          />
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <CategorySEOTab 
            categories={categories}
            seoData={mockCategoryData.seoData}
            onSEOUpdate={handleCategoryUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
