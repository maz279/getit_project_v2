import React, { useState } from 'react';
import { Header } from '../homepage/Header';
import { Footer } from '../homepage/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Heart, 
  ShoppingCart, 
  Share2, 
  Eye,
  Star,
  MapPin,
  TrendingUp,
  Filter,
  Grid,
  List,
  Trash2,
  CheckCircle,
  AlertCircle,
  Gift,
  Percent,
  Bell
} from 'lucide-react';
import { useSEO } from '@/shared/hooks/useSEO';

export const WishlistPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [priceAlerts, setPriceAlerts] = useState<Set<number>>(new Set());

  useSEO({
    title: 'My Wishlist - GetIt Bangladesh | Saved Items & Favorites',
    description: 'Manage your wishlist and favorite items on GetIt Bangladesh. Get price alerts, compare items, and add to cart when ready.',
    keywords: 'wishlist, favorites, saved items, price alerts, compare products, bangladesh shopping',
    canonical: 'https://getit-bangladesh.com/wishlist',
  });

  const categories = [
    { id: 'all', label: 'All Items', count: 24 },
    { id: 'electronics', label: 'Electronics', count: 8 },
    { id: 'fashion', label: 'Fashion', count: 6 },
    { id: 'home', label: 'Home & Garden', count: 4 },
    { id: 'sports', label: 'Sports', count: 3 },
    { id: 'books', label: 'Books', count: 2 },
    { id: 'beauty', label: 'Beauty', count: 1 }
  ];

  const wishlistItems = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB Space Black',
      image: '/api/placeholder/200/200',
      currentPrice: 135000,
      originalPrice: 155000,
      lowestPrice: 128000,
      seller: 'Apple Store BD',
      sellerRating: 4.9,
      rating: 4.8,
      reviews: 245,
      category: 'electronics',
      inStock: true,
      stockStatus: 'In Stock',
      addedDate: '2024-01-15',
      priceDropped: true,
      discount: 13,
      fastDelivery: true,
      wishlistCount: 1250
    },
    {
      id: 2,
      name: 'Sony WH-1000XM5 Wireless Headphones',
      image: '/api/placeholder/200/200',
      currentPrice: 28999,
      originalPrice: 38999,
      lowestPrice: 26500,
      seller: 'Audio Paradise',
      sellerRating: 4.7,
      rating: 4.8,
      reviews: 412,
      category: 'electronics',
      inStock: true,
      stockStatus: 'Low Stock (3 left)',
      addedDate: '2024-01-10',
      priceDropped: false,
      discount: 26,
      fastDelivery: true,
      wishlistCount: 890
    },
    {
      id: 3,
      name: 'Nike Air Max 270 React Sneakers',
      image: '/api/placeholder/200/200',
      currentPrice: 9999,
      originalPrice: 15999,
      lowestPrice: 8500,
      seller: 'Nike Store BD',
      sellerRating: 4.6,
      rating: 4.5,
      reviews: 324,
      category: 'fashion',
      inStock: true,
      stockStatus: 'In Stock',
      addedDate: '2024-01-08',
      priceDropped: true,
      discount: 38,
      fastDelivery: true,
      wishlistCount: 2340
    },
    {
      id: 4,
      name: 'Samsung Galaxy Watch 6 Classic',
      image: '/api/placeholder/200/200',
      currentPrice: 32999,
      originalPrice: 36999,
      lowestPrice: 30000,
      seller: 'Samsung Official',
      sellerRating: 4.8,
      rating: 4.6,
      reviews: 189,
      category: 'electronics',
      inStock: false,
      stockStatus: 'Out of Stock',
      addedDate: '2024-01-05',
      priceDropped: false,
      discount: 11,
      fastDelivery: false,
      wishlistCount: 567
    },
    {
      id: 5,
      name: 'IKEA HEMNES Bookcase White',
      image: '/api/placeholder/200/200',
      currentPrice: 8500,
      originalPrice: 12000,
      lowestPrice: 7800,
      seller: 'IKEA Bangladesh',
      sellerRating: 4.4,
      rating: 4.3,
      reviews: 89,
      category: 'home',
      inStock: true,
      stockStatus: 'In Stock',
      addedDate: '2024-01-03',
      priceDropped: false,
      discount: 29,
      fastDelivery: false,
      wishlistCount: 234
    },
    {
      id: 6,
      name: 'Adidas Ultraboost 23 Running Shoes',
      image: '/api/placeholder/200/200',
      currentPrice: 18999,
      originalPrice: 22999,
      lowestPrice: 17500,
      seller: 'Adidas Official',
      sellerRating: 4.7,
      rating: 4.7,
      reviews: 156,
      category: 'sports',
      inStock: true,
      stockStatus: 'In Stock',
      addedDate: '2024-01-01',
      priceDropped: true,
      discount: 17,
      fastDelivery: true,
      wishlistCount: 456
    }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? wishlistItems 
    : wishlistItems.filter(item => item.category === selectedCategory);

  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const togglePriceAlert = (id: number) => {
    setPriceAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    const availableItems = filteredItems.filter(item => item.inStock).map(item => item.id);
    setSelectedItems(new Set(availableItems));
  };

  const WishlistCard = ({ item }: { item: any }) => (
    <Card className={`group hover:shadow-xl transition-all duration-300 ${viewMode === 'list' ? 'flex' : ''} ${!item.inStock ? 'opacity-75' : ''}`}>
      <CardContent className={`p-4 ${viewMode === 'list' ? 'flex gap-4 w-full' : ''}`}>
        {/* Selection Checkbox */}
        <div className={`${viewMode === 'list' ? 'flex items-start pt-2' : 'flex justify-start mb-3'}`}>
          <input
            type="checkbox"
            checked={selectedItems.has(item.id)}
            onChange={() => toggleItemSelection(item.id)}
            disabled={!item.inStock}
            className="w-4 h-4 text-blue-600 rounded"
          />
        </div>

        {/* Product Image */}
        <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'w-full h-48'} mb-3`}>
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.discount > 0 && (
              <Badge className="bg-red-500 text-white text-xs">
                {item.discount}% OFF
              </Badge>
            )}
            {item.priceDropped && (
              <Badge className="bg-green-500 text-white text-xs">
                Price Dropped!
              </Badge>
            )}
            {!item.inStock && (
              <Badge variant="secondary" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Count */}
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
            <Heart className="w-3 h-3 mr-1 fill-current" />
            {item.wishlistCount}
          </Badge>
        </div>

        {/* Product Info */}
        <div className={`${viewMode === 'list' ? 'flex-1' : ''} space-y-2`}>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{item.category}</Badge>
            {item.fastDelivery && (
              <Badge className="bg-green-100 text-green-700 text-xs">Fast</Badge>
            )}
          </div>
          
          <h3 className={`font-semibold text-gray-900 line-clamp-2 ${viewMode === 'list' ? 'text-lg' : 'text-sm'}`}>
            {item.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-gray-600">{item.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({item.reviews} reviews)</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{item.seller}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span>{item.sellerRating}</span>
            </div>
          </div>
          
          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-gray-900 ${viewMode === 'list' ? 'text-xl' : 'text-lg'}`}>
                ৳{item.currentPrice.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ৳{item.originalPrice.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Lowest: ৳{item.lowestPrice.toLocaleString()} • Added: {item.addedDate}
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {item.inStock ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              item.inStock ? 'text-green-600' : 'text-red-600'
            }`}>
              {item.stockStatus}
            </span>
          </div>

          {/* Price Alert */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => togglePriceAlert(item.id)}
              className={`text-xs ${priceAlerts.has(item.id) ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              <Bell className="w-3 h-3 mr-1" />
              {priceAlerts.has(item.id) ? 'Alert Set' : 'Price Alert'}
            </Button>
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3" />
              <span>{item.wishlistCount} saved</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-2 mt-4 ${viewMode === 'list' ? 'flex-col w-32' : ''}`}>
          <Button 
            size="sm" 
            className="flex-1"
            disabled={!item.inStock}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {item.inStock ? 'Add to Cart' : 'Notify Me'}
          </Button>
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-white flex flex-col overflow-hidden items-stretch min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 fill-current" />
              My Wishlist ({filteredItems.length} items)
            </h1>
            <p className="text-blue-100">
              Your saved items with price tracking and smart alerts
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  {category.label}
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllItems}
              >
                Select All Available
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
          </div>

          {/* Quick Actions */}
          {selectedItems.size > 0 && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-800">
                    {selectedItems.size} items selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add All to Cart
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share List
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredItems.filter(item => item.priceDropped).length}
                </div>
                <div className="text-sm text-gray-600">Price Drops</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredItems.filter(item => item.inStock).length}
                </div>
                <div className="text-sm text-gray-600">In Stock</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ৳{Math.round(filteredItems.reduce((sum, item) => 
                    sum + (item.originalPrice - item.currentPrice), 0
                  )).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Savings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {priceAlerts.size}
                </div>
                <div className="text-sm text-gray-600">Price Alerts</div>
              </CardContent>
            </Card>
          </div>

          {/* Wishlist Items */}
          {filteredItems.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {filteredItems.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No items in your wishlist
                </h3>
                <p className="text-gray-600 mb-6">
                  Start browsing and save items you love for later
                </p>
                <Button>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Gift className="w-5 h-5" />
                You Might Also Like
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Related Product {i}</h4>
                      <p className="text-sm text-gray-600">৳{(Math.random() * 50000 + 10000).toFixed(0)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs">4.{Math.floor(Math.random() * 9)}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};