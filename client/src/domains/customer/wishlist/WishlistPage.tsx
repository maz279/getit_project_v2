/**
 * WishlistPage - Complete Wishlist Management Component
 * Amazon.com/Shopee.sg-Level Wishlist Management
 * Phase 1 Week 3-4 Implementation
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  Share2, 
  Filter, 
  Grid, 
  List, 
  Star,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Package,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendor: string;
  category: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  stockCount?: number;
  addedDate: Date;
  priceHistory: { date: Date; price: number }[];
  isOnSale: boolean;
  saleEndDate?: Date;
  isLimitedStock: boolean;
}

interface WishlistPageProps {
  items: WishlistItem[];
  onAddToCart: (item: WishlistItem) => void;
  onRemoveFromWishlist: (itemId: string) => void;
  onMoveToList: (itemId: string, listName: string) => void;
  onShareWishlist: () => void;
  className?: string;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  items,
  onAddToCart,
  onRemoveFromWishlist,
  onMoveToList,
  onShareWishlist,
  className = ''
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name' | 'rating'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'available' | 'sale' | 'price_drop'>('all');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 50000 });

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriceChange = (item: WishlistItem) => {
    if (item.priceHistory.length < 2) return 0;
    const currentPrice = item.price;
    const previousPrice = item.priceHistory[item.priceHistory.length - 2].price;
    return ((currentPrice - previousPrice) / previousPrice) * 100;
  };

  const filteredAndSortedItems = items
    .filter(item => {
      if (filterBy === 'available') return item.isAvailable;
      if (filterBy === 'sale') return item.isOnSale;
      if (filterBy === 'price_drop') return getPriceChange(item) < 0;
      return item.price >= priceRange.min && item.price <= priceRange.max;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredAndSortedItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkAddToCart = () => {
    const availableItems = filteredAndSortedItems.filter(item => 
      selectedItems.includes(item.id) && item.isAvailable
    );
    availableItems.forEach(item => onAddToCart(item));
    setSelectedItems([]);
  };

  const handleBulkRemove = () => {
    selectedItems.forEach(itemId => onRemoveFromWishlist(itemId));
    setSelectedItems([]);
  };

  const getTotalValue = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const getStats = () => {
    const available = items.filter(item => item.isAvailable).length;
    const onSale = items.filter(item => item.isOnSale).length;
    const priceDrops = items.filter(item => getPriceChange(item) < 0).length;
    
    return { available, onSale, priceDrops };
  };

  const stats = getStats();

  return (
    <div className={`max-w-7xl mx-auto p-4 ${className}`}>
      {/* Header with gradient matching home page */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-blue-100">
              {items.length} items • Total value: {formatPrice(getTotalValue())}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              onClick={onShareWishlist}
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Wishlist
            </Button>
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New List
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            <p className="text-sm text-gray-600">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats.priceDrops}</p>
            <p className="text-sm text-gray-600">Price Drops</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{stats.onSale}</p>
            <p className="text-sm text-gray-600">On Sale</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-pink-600">{items.length}</p>
            <p className="text-sm text-gray-600">Total Items</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Items</option>
                  <option value="available">Available Only</option>
                  <option value="sale">On Sale</option>
                  <option value="price_drop">Price Drops</option>
                </select>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="date">Sort by Date Added</option>
                <option value="price">Sort by Price</option>
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
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

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedItems.length === filteredAndSortedItems.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    {selectedItems.length} item(s) selected
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleBulkAddToCart}>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart ({selectedItems.filter(id => 
                      filteredAndSortedItems.find(item => item.id === id)?.isAvailable
                    ).length})
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkRemove}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove ({selectedItems.length})
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wishlist Items */}
      {filteredAndSortedItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-4">
              Start adding items you love to keep track of them and get notified about price drops.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
        }>
          {filteredAndSortedItems.map((item) => {
            const priceChange = getPriceChange(item);
            const isSelected = selectedItems.includes(item.id);
            
            return viewMode === 'grid' ? (
              <Card key={item.id} className={`group hover:shadow-lg transition-shadow ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <Checkbox
                      className="absolute top-2 left-2 z-10"
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                    />
                    
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                    
                    {item.isOnSale && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        Sale
                      </Badge>
                    )}
                    
                    {priceChange < 0 && (
                      <Badge className="absolute bottom-2 right-2 bg-green-500 text-white">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {Math.abs(priceChange).toFixed(1)}% off
                      </Badge>
                    )}
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.name}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-2">by {item.vendor}</p>
                  
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {item.rating} ({item.reviewCount})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    Added {formatDate(item.addedDate)}
                  </p>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => onAddToCart(item)}
                      disabled={!item.isAvailable}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={item.id} className={`${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                    />
                    
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">by {item.vendor}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                          {item.rating} ({item.reviewCount})
                        </div>
                        <span>Added {formatDate(item.addedDate)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      {priceChange !== 0 && (
                        <div className={`text-sm ${priceChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <TrendingDown className="h-3 w-3 inline mr-1" />
                          {priceChange < 0 ? '-' : '+'}{Math.abs(priceChange).toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        onClick={() => onAddToCart(item)}
                        disabled={!item.isAvailable}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveFromWishlist(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer with gradient matching home page */}
      <div className="mt-12 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Keep Shopping</h3>
          <p className="text-gray-300 mb-4">
            Discover more products you'll love and add them to your wishlist
          </p>
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            Browse Categories
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;