/**
 * Category Browser Component - Customer Discovery
 * Phase 1 Week 3-4: Customer Journey Implementation
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  description: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export const CategoryBrowser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      return response.json() as Promise<Category[]>;
    },
  });

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCategoryCard = (category: Category) => (
    <Card 
      key={category.id} 
      className={`cursor-pointer hover:shadow-lg transition-shadow ${
        selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedCategory(category.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <img 
            src={category.image} 
            alt={category.name}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div>
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {category.productCount} products
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {category.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {category.subcategories.slice(0, 3).map((sub) => (
            <Badge key={sub.id} variant="outline" className="text-xs">
              {sub.name}
            </Badge>
          ))}
          {category.subcategories.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{category.subcategories.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderCategoryList = (category: Category) => (
    <Card 
      key={category.id} 
      className={`cursor-pointer hover:shadow-lg transition-shadow ${
        selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedCategory(category.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={category.image} 
              alt={category.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">
                  {category.productCount} products
                </Badge>
                <span className="text-sm text-gray-500">
                  {category.subcategories.length} subcategories
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Browse
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSelectedCategoryDetails = () => {
    if (!selectedCategory) return null;

    const category = categories?.find(c => c.id === selectedCategory);
    if (!category) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <img 
              src={category.image} 
              alt={category.name}
              className="w-8 h-8 object-cover rounded"
            />
            <span>{category.name} Subcategories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.subcategories.map((sub) => (
              <div 
                key={sub.id}
                className="p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{sub.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {sub.productCount}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="category-browser p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-browser p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Browse Categories</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Discover products across {categories?.length || 0} categories
        </p>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories?.map(renderCategoryCard)}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories?.map(renderCategoryList)}
        </div>
      )}

      {renderSelectedCategoryDetails()}

      {filteredCategories?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No categories found matching "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryBrowser;