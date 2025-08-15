import React, { useState } from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { CategoryGrid } from '../components/discovery/CategoryGrid';
import { CategoryFilters } from '../components/discovery/CategoryFilters';
import { CategoryBreadcrumb } from '../components/discovery/CategoryBreadcrumb';
// import { EnhancedCategoryNavigation } from '../../components/product/EnhancedCategoryNavigation';
import { Button } from '@/shared/ui/button';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { useSEO } from '@/shared/hooks/useSEO';

const CategoryBrowse: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useSEO({
    title: 'Browse Categories - GetIt Bangladesh | All Product Categories',
    description: 'Explore all product categories on GetIt Bangladesh. Find electronics, fashion, home & garden, books, and more from verified vendors.',
    keywords: 'product categories, browse products, electronics, fashion, home garden, books, bangladesh shopping',
    canonical: 'https://getit-bangladesh.com/categories',
  });

  return (
    <div className="bg-white flex flex-col overflow-hidden items-stretch min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-gray-50 py-4">
          <div className="max-w-7xl mx-auto px-4">
            <CategoryBreadcrumb />
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Browse All Categories</h1>
            <p className="text-blue-100">Discover thousands of products from verified vendors</p>
          </div>
        </div>

        {/* Enhanced Category Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <EnhancedCategoryNavigation />
        </div>

        {/* Controls and Filters */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Category Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search categories..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-64 flex-shrink-0">
                <CategoryFilters />
              </div>
            )}

            {/* Category Grid */}
            <div className="flex-1">
              <CategoryGrid 
                viewMode={viewMode} 
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryBrowse;