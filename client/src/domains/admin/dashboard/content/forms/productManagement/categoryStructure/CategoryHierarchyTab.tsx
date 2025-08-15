
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ChevronRight, ChevronDown, FolderTree, Package, Plus } from 'lucide-react';
import { Category } from './types';

interface CategoryHierarchyTabProps {
  categories: Category[];
  onCategoryUpdate: (categoryId: string, updates: any) => void;
}

export const CategoryHierarchyTab: React.FC<CategoryHierarchyTabProps> = ({
  categories,
  onCategoryUpdate
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const buildHierarchy = (parentId?: string): Category[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const children = buildHierarchy(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="space-y-2">
        <div 
          className={`flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 ${
            level > 0 ? 'ml-' + (level * 6) : ''
          }`}
          style={{ marginLeft: level * 24 }}
        >
          <div className="flex items-center space-x-3">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(category.id)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6 h-6" />
            )}
            
            <FolderTree className="h-5 w-5 text-gray-500" />
            
            <div>
              <h4 className="font-medium">{category.name}</h4>
              <p className="text-sm text-gray-600">{category.slug}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={category.isActive ? 'default' : 'secondary'}>
                {category.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Package className="h-3 w-3" />
                <span>{category.productsCount}</span>
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Child
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const topLevelCategories = buildHierarchy();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderTree className="h-5 w-5" />
            <span>Category Hierarchy Tree</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topLevelCategories.map(category => renderCategory(category))}
          </div>
          
          {topLevelCategories.length === 0 && (
            <div className="text-center py-12">
              <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No categories found</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Top Level Categories:</span>
              <Badge>{topLevelCategories.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Total Categories:</span>
              <Badge>{categories.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Active Categories:</span>
              <Badge variant="default">
                {categories.filter(cat => cat.isActive).length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Max Depth:</span>
              <Badge variant="outline">
                {Math.max(...categories.map(cat => cat.level)) + 1} levels
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hierarchy Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Categories with Products:</span>
                <span>{categories.filter(cat => cat.productsCount > 0).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Empty Categories:</span>
                <span className="text-orange-600">
                  {categories.filter(cat => cat.productsCount === 0).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Orphaned Categories:</span>
                <span className="text-red-600">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              Expand All Categories
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Collapse All Categories
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Reorder Categories
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Bulk Move Categories
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
