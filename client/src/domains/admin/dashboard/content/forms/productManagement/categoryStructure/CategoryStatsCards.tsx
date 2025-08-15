
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { FolderTree, Package, Eye, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { CategoryStats } from './types';

interface CategoryStatsCardsProps {
  stats: CategoryStats;
}

export const CategoryStatsCards: React.FC<CategoryStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          <FolderTree className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.totalCategories}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.topLevelCategories} top-level categories
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.activeCategories}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((stats.activeCategories / stats.totalCategories) * 100)}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Products/Category</CardTitle>
          <Package className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.avgProductsPerCategory}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.categoriesWithProducts} categories with products
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empty Categories</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.emptyCategoriesCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Need attention or cleanup
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Popular Category</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-green-600">{stats.mostPopularCategory}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Highest product count and engagement
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Category Health Score</CardTitle>
          <Eye className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-blue-600">
            {Math.round((stats.categoriesWithProducts / stats.totalCategories) * 100)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Categories actively used with products
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
