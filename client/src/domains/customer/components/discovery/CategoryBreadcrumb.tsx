
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainCategory } from '@/data/categoriesData';

interface SubmenuItem {
  name: string;
  subcategories: Array<{
    name: string;
    count: number;
  }>;
}

interface CategoryBreadcrumbProps {
  selectedCategory?: string | null;
  selectedSubcategory?: string | null;
  selectedSubSubcategory?: string | null;
  currentCategory?: MainCategory | null;
  currentSubmenu?: SubmenuItem | null;
}

export const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({
  selectedCategory,
  selectedSubcategory,
  selectedSubSubcategory,
  currentCategory,
  currentSubmenu
}) => {
  return (
    <div className="bg-white border-b px-6 py-4">
      <nav className="flex items-center space-x-2 text-sm">
        <Link 
          to="/" 
          className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Home className="w-4 h-4 mr-1" />
          Home
        </Link>
        
        <ChevronRight className="w-4 h-4 text-gray-400" />
        
        <Link 
          to="/categories" 
          className="text-gray-500 hover:text-blue-600 transition-colors"
        >
          Categories
        </Link>
        
        {currentCategory && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link 
              to={`/categories?category=${selectedCategory}`}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              {currentCategory.name}
            </Link>
          </>
        )}
        
        {currentSubmenu && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link 
              to={`/categories?category=${selectedCategory}&subcategory=${selectedSubcategory}`}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              {currentSubmenu.name}
            </Link>
          </>
        )}
        
        {selectedSubSubcategory && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-blue-600 font-medium">
              {selectedSubSubcategory}
            </span>
          </>
        )}
      </nav>
    </div>
  );
};
