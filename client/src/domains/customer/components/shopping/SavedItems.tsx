import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Search, 
  Filter, 
  Trash2, 
  Eye,
  Package,
  Clock,
  TrendingDown,
  TrendingUp,
  Gift,
  AlertTriangle,
  Grid,
  List,
  Share2,
  Tag
} from 'lucide-react';

interface SavedItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
  priceAlert: boolean;
  targetPrice?: number;
  savedDate: string;
  fastDelivery: boolean;
  freeShipping: boolean;
}

export const SavedItems: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock saved items data - in real app, this would come from API
  const [savedItems, setSavedItems] = useState<SavedItem[]>([
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 2200,
      originalPrice: 2800,
      image: '/api/placeholder/200/200',
      category: 'Electronics',
      brand: 'TechSound',
      rating: 4.5,
      reviews: 342,
      inStock: true,
      priceHistory: [
        { date: '2024-07-01', price: 2800 },
        { date: '2024-07-08', price: 2600 },
        { date: '2024-07-15', price: 2200 }
      ],
      priceAlert: true,
      targetPrice: 2000,
      savedDate: '2024-07-10',
      fastDelivery: true,
      freeShipping: true
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      price: 3500,
      originalPrice: 4200,
      image: '/api/placeholder/200/200',
      category: 'Electronics',
      brand: 'FitTech',
      rating: 4.7,
      reviews: 567,
      inStock: true,
      priceHistory: [
        { date: '2024-07-01', price: 4200 },
        { date: '2024-07-10', price: 3800 },
        { date: '2024-07-15', price: 3500 }
      ],
      priceAlert: false,
      savedDate: '2024-07-12',
      fastDelivery: true,
      freeShipping: false
    },
    {
      id: '3',
      name: 'Premium Cotton T-Shirt',
      price: 800,
      originalPrice: 1200,
      image: '/api/placeholder/200/200',
      category: 'Fashion',
      brand: 'ComfortWear',
      rating: 4.3,
      reviews: 234,
      inStock: false,
      priceHistory: [
        { date: '2024-07-01', price: 1200 },
        { date: '2024-07-15', price: 800 }
      ],
      priceAlert: true,
      targetPrice: 700,
      savedDate: '2024-07-05',
      fastDelivery: false,
      freeShipping: true
    },
    {
      id: '4',
      name: 'Organic Green Tea',
      price: 450,
      originalPrice: 600,
      image: '/api/placeholder/200/200',
      category: 'Food & Beverage',
      brand: 'NaturalBlend',
      rating: 4.6,
      reviews: 189,
      inStock: true,
      priceHistory: [
        { date: '2024-07-01', price: 600 },
        { date: '2024-07-15', price: 450 }
      ],
      priceAlert: false,
      savedDate: '2024-07-08',
      fastDelivery: false,
      freeShipping: false
    },
    {
      id: '5',
      name: 'Leather Wallet',
      price: 1200,
      originalPrice: 1500,
      image: '/api/placeholder/200/200',
      category: 'Fashion',
      brand: 'LeatherCraft',
      rating: 4.4,
      reviews: 123,
      inStock: true,
      priceHistory: [
        { date: '2024-07-01', price: 1500 },
        { date: '2024-07-15', price: 1200 }
      ],
      priceAlert: true,
      targetPrice: 1000,
      savedDate: '2024-07-14',
      fastDelivery: true,
      freeShipping: true
    }
  ]);

  const categories = ['Electronics', 'Fashion', 'Food & Beverage', 'Books', 'Sports'];

  const filteredItems = savedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      case 'oldest':
        return new Date(a.savedDate).getTime() - new Date(b.savedDate).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const getDiscountPercentage = (price: number, originalPrice: number) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const getPriceChange = (item: SavedItem) => {
    if (item.priceHistory.length < 2) return null;
    const latest = item.priceHistory[item.priceHistory.length - 1];
    const previous = item.priceHistory[item.priceHistory.length - 2];
    return latest.price - previous.price;
  };

  const handleRemoveItem = (itemId: string) => {
    setSavedItems(savedItems.filter(item => item.id !== itemId));
  };

  const handleAddToCart = (itemId: string) => {
    // In real app, this would add to cart
    console.log('Adding to cart:', itemId);
  };

  const handlePriceAlert = (itemId: string, enabled: boolean) => {
    setSavedItems(savedItems.map(item => 
      item.id === itemId ? { ...item, priceAlert: enabled } : item
    ));
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === sortedItems.length 
        ? [] 
        : sortedItems.map(item => item.id)
    );
  };

  const handleBulkAddToCart = () => {
    console.log('Adding to cart:', selectedItems);
    setSelectedItems([]);
  };

  const handleBulkRemove = () => {
    setSavedItems(savedItems.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const inStockCount = savedItems.filter(item => item.inStock).length;
  const priceAlertCount = savedItems.filter(item => item.priceAlert).length;
  const totalSavings = savedItems.reduce((sum, item) => {
    return sum + (item.originalPrice ? item.originalPrice - item.price : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Items</h1>
          <p className="text-gray-600">{savedItems.length} items saved • {inStockCount} in stock</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode('grid')}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
            <List className="w-4 h-4" />
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share List
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Total Saved</p>
                <p className="text-2xl font-bold">{savedItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">In Stock</p>
                <p className="text-2xl font-bold">{inStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Price Alerts</p>
                <p className="text-2xl font-bold">{priceAlertCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Sort
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search saved items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedItems.length === sortedItems.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{selectedItems.length} items selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={handleBulkAddToCart}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkRemove}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {sortedItems.map((item) => {
          const priceChange = getPriceChange(item);
          const isSelected = selectedItems.includes(item.id);
          
          return (
            <Card key={item.id} className={`${isSelected ? 'ring-2 ring-blue-500' : ''} hover:shadow-lg transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full bg-white shadow-sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{item.brand}</p>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg font-bold text-green-600">{formatCurrency(item.price)}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(item.originalPrice)}
                            </span>
                          )}
                          {item.originalPrice && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {getDiscountPercentage(item.price, item.originalPrice)}% OFF
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{item.rating}</span>
                            <span className="text-xs text-gray-500 ml-1">({item.reviews})</span>
                          </div>
                          {priceChange && (
                            <div className={`flex items-center text-xs ${priceChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {priceChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                              {formatCurrency(Math.abs(priceChange))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant={item.inStock ? 'secondary' : 'destructive'}>
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                          {item.priceAlert && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Price Alert
                            </Badge>
                          )}
                          {item.fastDelivery && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Fast
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Button 
                            size="sm" 
                            className="w-full"
                            disabled={!item.inStock}
                            onClick={() => handleAddToCart(item.id)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handlePriceAlert(item.id, !item.priceAlert)}
                            >
                              <Tag className="w-4 h-4 mr-1" />
                              {item.priceAlert ? 'Remove Alert' : 'Price Alert'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved items found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Start saving items you love by clicking the heart icon on products'
              }
            </p>
            <Button>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};