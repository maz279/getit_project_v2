
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Search, Plus, Edit, Trash2, Eye, FolderTree, Package } from 'lucide-react';
import { Category } from './types';

interface CategoryManagementTabProps {
  categories: Category[];
  onCategoryUpdate: (categoryId: string, updates: any) => void;
  onCategoryCreate: (newCategory: any) => void;
  onCategoryDelete: (categoryId: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
}

export const CategoryManagementTab: React.FC<CategoryManagementTabProps> = ({
  categories,
  onCategoryUpdate,
  onCategoryCreate,
  onCategoryDelete,
  selectedCategory,
  setSelectedCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || category.level.toString() === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowCreateForm(true);
  };

  const handleSave = (formData: any) => {
    if (editingCategory) {
      onCategoryUpdate(editingCategory.id, formData);
    } else {
      onCategoryCreate(formData);
    }
    setShowCreateForm(false);
    setEditingCategory(null);
  };

  const renderCategoryForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              placeholder="Enter category name"
              defaultValue={editingCategory?.name || ''}
            />
          </div>
          <div>
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              placeholder="category-url-slug"
              defaultValue={editingCategory?.slug || ''}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Category description"
            defaultValue={editingCategory?.description || ''}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="parent">Parent Category</Label>
            <Select defaultValue={editingCategory?.parentId || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Parent (Top Level)</SelectItem>
                {categories
                  .filter(cat => cat.level < 2 && cat.id !== editingCategory?.id)
                  .map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              placeholder="0"
              defaultValue={editingCategory?.sortOrder || 0}
            />
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <Switch
              id="isActive"
              defaultChecked={editingCategory?.isActive ?? true}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowCreateForm(false);
              setEditingCategory(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={() => handleSave({})}>
            {editingCategory ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="0">Top Level</SelectItem>
              <SelectItem value="1">Sub Categories</SelectItem>
              <SelectItem value="2">Sub-Sub Categories</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && renderCategoryForm()}

      {/* Categories List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FolderTree className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-600">
                        {category.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      Level {category.level}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>{category.productsCount} products</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(category.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCategoryDelete(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No categories found matching your criteria</p>
        </div>
      )}
    </div>
  );
};
