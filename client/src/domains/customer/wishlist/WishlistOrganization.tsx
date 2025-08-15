/**
 * WishlistOrganization - Wishlist Organization Tools Component
 * Amazon.com/Shopee.sg-Level Wishlist Organization and Management
 * Phase 1 Week 3-4 Implementation
 */

import React, { useState } from 'react';
import { 
  FolderPlus, 
  Folder, 
  Edit3, 
  Trash2, 
  Move, 
  Grid, 
  List,
  Filter,
  Search,
  Tag,
  Calendar,
  DollarSign,
  Star,
  Package,
  Heart
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';

interface WishlistFolder {
  id: string;
  name: string;
  description: string;
  color: string;
  itemCount: number;
  createdDate: Date;
  isDefault: boolean;
  tags: string[];
}

interface WishlistOrganizationProps {
  folders: WishlistFolder[];
  currentFolderId?: string;
  onCreateFolder: (folderData: Omit<WishlistFolder, 'id' | 'itemCount' | 'createdDate'>) => void;
  onEditFolder: (folderId: string, folderData: Partial<WishlistFolder>) => void;
  onDeleteFolder: (folderId: string) => void;
  onSelectFolder: (folderId: string) => void;
  onMoveItems: (itemIds: string[], targetFolderId: string) => void;
  className?: string;
}

export const WishlistOrganization: React.FC<WishlistOrganizationProps> = ({
  folders,
  currentFolderId,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onSelectFolder,
  onMoveItems,
  className = ''
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<WishlistFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'count'>('name');
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    tags: [] as string[],
    isDefault: false
  });

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const predefinedTags = [
    'Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty',
    'Gifts', 'Sale Items', 'High Priority', 'Birthday', 'Anniversary', 'Holiday'
  ];

  const filteredFolders = folders
    .filter(folder => 
      folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      if (sortBy === 'count') return b.itemCount - a.itemCount;
      return 0;
    });

  const handleCreateFolder = () => {
    if (newFolder.name.trim()) {
      onCreateFolder(newFolder);
      setNewFolder({
        name: '',
        description: '',
        color: '#3B82F6',
        tags: [],
        isDefault: false
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditFolder = (folder: WishlistFolder) => {
    setEditingFolder(folder);
    setNewFolder({
      name: folder.name,
      description: folder.description,
      color: folder.color,
      tags: folder.tags,
      isDefault: folder.isDefault
    });
  };

  const handleUpdateFolder = () => {
    if (editingFolder && newFolder.name.trim()) {
      onEditFolder(editingFolder.id, newFolder);
      setEditingFolder(null);
      setNewFolder({
        name: '',
        description: '',
        color: '#3B82F6',
        tags: [],
        isDefault: false
      });
    }
  };

  const handleAddTag = (tag: string) => {
    if (!newFolder.tags.includes(tag)) {
      setNewFolder(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewFolder(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`max-w-6xl mx-auto p-4 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Organize Your Wishlists</h1>
            <p className="text-blue-100">
              Create folders, add tags, and organize your items the way you want
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/30">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={newFolder.name}
                    onChange={(e) => setNewFolder(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter folder name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="folderDescription">Description (Optional)</Label>
                  <Input
                    id="folderDescription"
                    value={newFolder.description}
                    onChange={(e) => setNewFolder(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this folder"
                  />
                </div>
                
                <div>
                  <Label>Color</Label>
                  <div className="flex space-x-2 mt-2">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewFolder(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newFolder.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {predefinedTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={newFolder.tags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => 
                          newFolder.tags.includes(tag) 
                            ? handleRemoveTag(tag) 
                            : handleAddTag(tag)
                        }
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {newFolder.tags.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Selected tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {newFolder.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>
                    Create Folder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
                <option value="count">Sort by Item Count</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Folders Display */}
      {filteredFolders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No folders found' : 'No folders yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create your first folder to organize your wishlist items'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create First Folder
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredFolders.map((folder) => (
            <Card
              key={folder.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                currentFolderId === folder.id ? 'ring-2 ring-blue-500' : ''
              } ${viewMode === 'list' ? 'flex' : ''}`}
              onClick={() => onSelectFolder(folder.id)}
            >
              <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className={viewMode === 'list' ? 'flex items-center space-x-4' : ''}>
                  {/* Folder Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: folder.color + '20' }}
                    >
                      <Folder 
                        className="h-6 w-6" 
                        style={{ color: folder.color }}
                      />
                    </div>
                  </div>

                  {/* Folder Details */}
                  <div className={`${viewMode === 'list' ? 'flex-1' : 'mt-4'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {folder.name}
                      </h3>
                      {folder.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    
                    {folder.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        {folder.itemCount} items
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(folder.createdDate)}
                      </span>
                    </div>
                    
                    {folder.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {folder.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {folder.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{folder.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`${viewMode === 'list' ? '' : 'mt-4'} flex ${viewMode === 'list' ? 'flex-col' : ''} space-${viewMode === 'list' ? 'y' : 'x'}-2`}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFolder(folder);
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    {!folder.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFolder(folder.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Folder Dialog */}
      <Dialog open={!!editingFolder} onOpenChange={() => setEditingFolder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFolderName">Folder Name</Label>
              <Input
                id="editFolderName"
                value={newFolder.name}
                onChange={(e) => setNewFolder(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter folder name"
              />
            </div>
            
            <div>
              <Label htmlFor="editFolderDescription">Description (Optional)</Label>
              <Input
                id="editFolderDescription"
                value={newFolder.description}
                onChange={(e) => setNewFolder(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this folder"
              />
            </div>
            
            <div>
              <Label>Color</Label>
              <div className="flex space-x-2 mt-2">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewFolder(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newFolder.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {predefinedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={newFolder.tags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => 
                      newFolder.tags.includes(tag) 
                        ? handleRemoveTag(tag) 
                        : handleAddTag(tag)
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingFolder(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateFolder}>
                Update Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Star className="h-6 w-6 text-yellow-500" />
              <span className="text-sm font-medium">Create Priority List</span>
              <span className="text-xs text-gray-600">For high-priority items</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <DollarSign className="h-6 w-6 text-green-500" />
              <span className="text-sm font-medium">Budget Tracker</span>
              <span className="text-xs text-gray-600">Track spending goals</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Heart className="h-6 w-6 text-pink-500" />
              <span className="text-sm font-medium">Gift Ideas</span>
              <span className="text-xs text-gray-600">For special occasions</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-12 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Pro Organization Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <p className="font-medium mb-1">Color Coding</p>
              <p>Use colors to categorize by urgency or occasion</p>
            </div>
            <div>
              <p className="font-medium mb-1">Smart Tags</p>
              <p>Tag items by budget, season, or recipient</p>
            </div>
            <div>
              <p className="font-medium mb-1">Regular Cleanup</p>
              <p>Review and organize your lists monthly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistOrganization;