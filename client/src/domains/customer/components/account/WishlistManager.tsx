import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { 
  Heart, 
  Search, 
  Filter, 
  Share2, 
  ShoppingCart, 
  Trash2, 
  Star,
  TrendingDown,
  TrendingUp,
  Calendar,
  Package,
  Eye,
  Plus,
  Grid3X3,
  List,
  Download
} from 'lucide-react';

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
  addedDate: string;
  category: string;
  vendor: {
    name: string;
    rating: number;
  };
  variants?: Array<{
    name: string;
    value: string;
    inStock: boolean;
  }>;
}

interface WishlistCollection {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  itemCount: number;
  createdDate: string;
}

const WishlistManager: React.FC = () => {
  // State Management
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [collections, setCollections] = useState<WishlistCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateAdded');

  // Collection Management
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('default');

  useEffect(() => {
    loadWishlistData();
  }, []);

  useEffect(() => {
    filterAndSortItems();
  }, [wishlistItems, searchTerm, categoryFilter, priceFilter, availabilityFilter, sortBy]);

  const loadWishlistData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockItems: WishlistItem[] = [
        {
          id: '1',
          productId: 'p1',
          name: 'Samsung Galaxy A54 5G',
          brand: 'Samsung',
          image: '/placeholder-phone.jpg',
          currentPrice: 45000,
          originalPrice: 50000,
          discount: 10,
          rating: 4.5,
          reviewCount: 1250,
          inStock: true,
          priceHistory: [
            { date: '2025-07-01', price: 50000 },
            { date: '2025-07-03', price: 48000 },
            { date: '2025-07-05', price: 45000 }
          ],
          addedDate: '2025-07-01T10:00:00Z',
          category: 'Electronics',
          vendor: {
            name: 'Tech Store BD',
            rating: 4.8
          }
        },
        {
          id: '2',
          productId: 'p2',
          name: 'Nike Air Max 270',
          brand: 'Nike',
          image: '/placeholder-shoes.jpg',
          currentPrice: 12000,
          originalPrice: 12000,
          discount: 0,
          rating: 4.3,
          reviewCount: 856,
          inStock: false,
          priceHistory: [
            { date: '2025-06-20', price: 12000 }
          ],
          addedDate: '2025-06-20T14:30:00Z',
          category: 'Fashion',
          vendor: {
            name: 'Sports Corner',
            rating: 4.6
          }
        }
      ];

      const mockCollections: WishlistCollection[] = [
        {
          id: 'default',
          name: 'My Wishlist',
          description: 'Default wishlist collection',
          isPublic: false,
          itemCount: 2,
          createdDate: '2025-06-01T00:00:00Z'
        }
      ];

      setWishlistItems(mockItems);
      setCollections(mockCollections);
    } catch (error) {
      console.error('Failed to load wishlist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let filtered = [...wishlistItems];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Price filter
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'under-1000':
          filtered = filtered.filter(item => item.currentPrice < 1000);
          break;
        case '1000-5000':
          filtered = filtered.filter(item => item.currentPrice >= 1000 && item.currentPrice < 5000);
          break;
        case '5000-20000':
          filtered = filtered.filter(item => item.currentPrice >= 5000 && item.currentPrice < 20000);
          break;
        case 'over-20000':
          filtered = filtered.filter(item => item.currentPrice >= 20000);
          break;
      }
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      if (availabilityFilter === 'in-stock') {
        filtered = filtered.filter(item => item.inStock);
      } else if (availabilityFilter === 'out-of-stock') {
        filtered = filtered.filter(item => !item.inStock);
      }
    }

    // Sort items
    switch (sortBy) {
      case 'dateAdded':
        filtered.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
        break;
      case 'priceHigh':
        filtered.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'priceLow':
        filtered.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
    }

    setFilteredItems(filtered);
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedItems.size === 0) return;
    
    if (confirm(`Remove ${selectedItems.size} item(s) from wishlist?`)) {
      setWishlistItems(items => items.filter(item => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    // Add to cart logic
    console.log('Adding to cart:', item.name);
  };

  const handleRemoveItem = (itemId: string) => {
    if (confirm('Remove this item from your wishlist?')) {
      setWishlistItems(items => items.filter(item => item.id !== itemId));
    }
  };

  const getPriceChangeIcon = (item: WishlistItem) => {
    if (item.priceHistory.length < 2) return null;
    
    const currentPrice = item.currentPrice;
    const previousPrice = item.priceHistory[item.priceHistory.length - 2].price;
    
    if (currentPrice < previousPrice) {
      return <TrendingDown className="h-4 w-4 text-green-600" />;
    } else if (currentPrice > previousPrice) {
      return <TrendingUp className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const categories = [...new Set(wishlistItems.map(item => item.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                My Wishlist
              </CardTitle>
              <CardDescription>
                {wishlistItems.length} item(s) saved • {filteredItems.filter(item => item.inStock).length} in stock
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search your wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-1000">Under ৳1,000</SelectItem>
                <SelectItem value="1000-5000">৳1,000 - ৳5,000</SelectItem>
                <SelectItem value="5000-20000">৳5,000 - ৳20,000</SelectItem>
                <SelectItem value="over-20000">Over ৳20,000</SelectItem>
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">Date Added</SelectItem>
                <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                <SelectItem value="priceLow">Price: Low to High</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="discount">Discount</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
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
          {selectedItems.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-800">
                  {selectedItems.size} item(s) selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedItems(new Set())}>
                    Clear Selection
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRemoveSelected}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove Selected
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Items */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {wishlistItems.length === 0 
                  ? 'Start adding products you love to keep track of them'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              <Button>Continue Shopping</Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-4'
            }>
              {/* Select All Checkbox (List view only) */}
              {viewMode === 'list' && (
                <div className="flex items-center gap-3 p-4 border-b">
                  <Checkbox
                    checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="font-medium">Select All ({filteredItems.length})</span>
                </div>
              )}

              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                    !item.inStock ? 'opacity-75' : ''
                  } ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-4'}`}
                >
                  <div className={`${viewMode === 'list' ? 'flex items-center gap-3' : ''}`}>
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => handleSelectItem(item.id)}
                      className={viewMode === 'grid' ? 'absolute top-2 left-2 z-10' : ''}
                    />
                    
                    <div className={`relative ${viewMode === 'grid' ? 'mb-4' : 'w-20 h-20'}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`object-cover rounded-lg ${
                          viewMode === 'grid' ? 'w-full h-48' : 'w-20 h-20'
                        }`}
                      />
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <span className="text-white text-sm font-medium">Out of Stock</span>
                        </div>
                      )}
                      {item.discount > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-600 text-white">
                          -{item.discount}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="space-y-2">
                      <h4 className="font-medium line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.brand}</p>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{item.rating}</span>
                          <span className="text-sm text-gray-500">({item.reviewCount})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                          ৳{item.currentPrice.toLocaleString()}
                        </span>
                        {item.originalPrice > item.currentPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ৳{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                        {getPriceChangeIcon(item)}
                      </div>

                      <p className="text-xs text-gray-500">
                        Added {new Date(item.addedDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className={`flex gap-2 ${viewMode === 'grid' ? 'mt-4' : 'mt-2'}`}>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.inStock}
                        className="flex-1"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        {item.inStock ? 'Add to Cart' : 'Notify Me'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { WishlistManager };
export default WishlistManager;