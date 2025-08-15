
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CategoriesLayout } from '@/components/categories/CategoriesLayout';
import { useCategorySEO } from '@/shared/hooks/useSEO';
import { categoriesData } from '@/data/categoriesData';

const Categories: React.FC = () => {
  const { category, subcategory } = useParams();
  const [searchParams] = useSearchParams();
  const subSubcategory = searchParams.get('subsubcategory');

  // Find current category data for SEO
  const currentCategory = categoriesData.find(cat => cat.id === category);
  let categoryName = 'All Categories';
  let categoryDescription = 'Browse all product categories from verified vendors in Bangladesh. Find electronics, fashion, home & garden, books and more.';

  if (currentCategory) {
    categoryName = currentCategory.name;
    categoryDescription = `Shop ${currentCategory.name} products from verified vendors in Bangladesh. Best prices, quality guaranteed, fast delivery across the country.`;
    
    if (subcategory && currentCategory.subcategories[subcategory]) {
      const subCat = currentCategory.subcategories[subcategory];
      categoryName = `${subCat.name} - ${currentCategory.name}`;
      categoryDescription = `Browse ${subCat.name} in ${currentCategory.name} category. Premium quality products from trusted vendors in Bangladesh.`;
      
      if (subSubcategory) {
        categoryName = `${subSubcategory} - ${subCat.name} - ${currentCategory.name}`;
        categoryDescription = `Shop ${subSubcategory} products in ${subCat.name}. Best selection and prices in Bangladesh.`;
      }
    }
  }

  // Apply SEO for this category page
  useCategorySEO(categoryName, categoryDescription);

  return <CategoriesLayout />;
};

export default Categories;
