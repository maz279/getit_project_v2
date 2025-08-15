// WishlistManager.tsx - Amazon.com/Shopee.sg-Level Wishlist Management
import React, { useState, useEffect } from 'react';
import { Heart, Share2, ShoppingCart, X, Star, TrendingDown, TrendingUp, Filter, Grid, List, Bell, Gift } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  image: string;
  currentPrice: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  priceDropPercent?: number;
  addedDate: Date;
  category: string;
  seller: string;
  isOnSale: boolean;
  estimatedDelivery: string;
}

interface WishlistCollection {
  id: string;
  name: string;
  items: string[];
  privacy: 'private' | 'public' | 'friends';
  createdDate: Date;
}

const WishlistManager: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [collections, setCollections] = useState<WishlistCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest');
  const [filter, setFilter] = useState<'all' | 'in_stock' | 'on_sale' | 'price_drop'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useSEO({
    title: 'My Wishlist - Save & Track Your Favorite Products | GetIt Bangladesh',
    description: 'Manage your wishlist, track price drops, get notifications, and organize your favorite products. Never miss a deal again.',
    keywords: 'wishlist, favorite products, price alerts, save for later, Bangladesh shopping wishlist'
  });

  useEffect(() => {
    // Mock wishlist data
    const mockWishlistItems: WishlistItem[] = [
      {
        id: '1',
        productId: 'prod-1',
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        currentPrice: 135000,
        originalPrice: 145000,
        rating: 4.8,
        reviews: 2340,
        availability: 'in_stock',
        priceDropPercent: 7,
        addedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        category: 'Electronics',
        seller: 'Samsung Official Store',
        isOnSale: true,
        estimatedDelivery: '1-2 days'
      },
      {
        id: '2',
        productId: 'prod-2',
        name: 'Apple MacBook Air M2',
        brand: 'Apple',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        currentPrice: 145000,
        originalPrice: 145000,
        rating: 4.9,
        reviews: 1876,
        availability: 'in_stock',
        addedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        category: 'Electronics',
        seller: 'Apple Authorized Store',
        isOnSale: false,
        estimatedDelivery: '2-3 days'
      },
      {
        id: '3',
        productId: 'prod-3',
        name: 'Nike Air Max 270',
        brand: 'Nike',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        currentPrice: 8500,
        originalPrice: 12000,
        rating: 4.5,
        reviews: 892,
        availability: 'low_stock',
        priceDropPercent: 29,
        addedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        category: 'Fashion',
        seller: 'Nike Official Store',
        isOnSale: true,
        estimatedDelivery: '3-5 days'
      },
      {
        id: '4',
        productId: 'prod-4',
        name: 'Sony WH-1000XM5 Headphones',
        brand: 'Sony',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
        currentPrice: 32000,
        originalPrice: 35000,
        rating: 4.7,
        reviews: 1456,
        availability: 'out_of_stock',
        priceDropPercent: 9,
        addedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        category: 'Electronics',
        seller: 'Sony Official Store',
        isOnSale: false,
        estimatedDelivery: 'Out of stock'
      }
    ];

    const mockCollections: WishlistCollection[] = [
      {
        id: 'tech',
        name: 'Tech Gadgets',
        items: ['1', '2', '4'],
        privacy: 'private',
        createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'fashion',
        name: 'Fashion Items',
        items: ['3'],
        privacy: 'public',
        createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      }
    ];

    setWishlistItems(mockWishlistItems);
    setCollections(mockCollections);
  }, []);

  const getFilteredItems = () => {
    let filtered = wishlistItems;

    // Filter by collection
    if (selectedCollection !== 'all') {
      const collection = collections.find(c => c.id === selectedCollection);
      if (collection) {
        filtered = filtered.filter(item => collection.items.includes(item.id));
      }
    }

    // Filter by availability/status
    switch (filter) {
      case 'in_stock':
        filtered = filtered.filter(item => item.availability === 'in_stock');
        break;
      case 'on_sale':
        filtered = filtered.filter(item => item.isOnSale);
        break;
      case 'price_drop':
        filtered = filtered.filter(item => item.priceDropPercent && item.priceDropPercent > 0);
        break;
    }

    // Sort items
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
        break;
      case 'price_low':
        filtered.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItems(prev => prev.filter(id => id !== itemId));
  };

  const addToCart = (item: WishlistItem) => {
    if (item.availability === 'out_of_stock') return;
    // Add to cart logic
    alert(`Added ${item.name} to cart!`);
  };

  const shareWishlist = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Wishlist link copied to clipboard!');
  };

  const createCollection = () => {
    if (newCollectionName.trim()) {
      const newCollection: WishlistCollection = {
        id: `collection-${Date.now()}`,
        name: newCollectionName,
        items: selectedItems,
        privacy: 'private',
        createdDate: new Date()
      };
      setCollections([...collections, newCollection]);
      setNewCollectionName('');
      setShowCreateCollection(false);
      setSelectedItems([]);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const bulkRemove = () => {
    setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}</span>
      </div>
    );
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock': return 'text-green-600';
      case 'low_stock': return 'text-yellow-600';
      case 'out_of_stock': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">My Wishlist</h1>
              <p className="text-xl opacity-90">
                {wishlistItems.length} items saved • Track prices and get notified of deals
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={shareWishlist}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              
              <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Price Alerts
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Controls */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Collections */}
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Items ({wishlistItems.length})</option>
                {collections.map(collection => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name} ({collection.items.length})
                  </option>
                ))}
              </select>
              
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="in_stock">In Stock</option>
                <option value="on_sale">On Sale</option>
                <option value="price_drop">Price Drops</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                  <button
                    onClick={bulkRemove}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => setShowCreateCollection(true)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Create Collection
                  </button>
                </div>
              )}
              
              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wishlist Items */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items in your wishlist</h3>
              <p className="text-gray-600 mb-4">
                Start adding products to your wishlist to track prices and save for later.
              </p>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredItems.map(item => (
                <div key={item.id} className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow ${
                  viewMode === 'list' ? 'flex gap-4 p-4' : 'p-4'
                }`}>
                  {/* Selection Checkbox */}
                  <div className={`${viewMode === 'list' ? 'flex items-start' : 'absolute top-3 left-3'}`}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className={`text-gray-400 hover:text-red-500 transition-colors ${
                      viewMode === 'list' ? 'ml-auto' : 'absolute top-3 right-3'
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  {/* Product Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`object-cover rounded-lg ${
                      viewMode === 'list' ? 'w-24 h-24' : 'w-full h-48 mb-4'
                    }`}
                  />
                  
                  <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    {/* Price Drop Alert */}
                    {item.priceDropPercent && item.priceDropPercent > 0 && (
                      <div className="flex items-center gap-1 mb-2 bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
                        <TrendingDown className="h-3 w-3" />
                        {item.priceDropPercent}% price drop!
                      </div>
                    )}
                    
                    {/* Product Info */}
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.brand}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(item.rating)}
                      <span className="text-sm text-gray-500">({item.reviews})</span>
                    </div>
                    
                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          ৳{item.currentPrice.toLocaleString()}
                        </span>
                        {item.originalPrice && item.originalPrice > item.currentPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ৳{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Availability */}
                      <p className={`text-sm font-medium ${getAvailabilityColor(item.availability)}`}>
                        {item.availability === 'in_stock' ? '✓ In Stock' :
                         item.availability === 'low_stock' ? '⚠ Low Stock' :
                         '✗ Out of Stock'}
                      </p>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.isOnSale && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          On Sale
                        </span>
                      )}
                      {item.priceDropPercent && item.priceDropPercent > 0 && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          Price Drop
                        </span>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className={`flex gap-2 ${viewMode === 'list' ? 'mt-4' : ''}`}>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={item.availability === 'out_of_stock'}
                        className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        {item.availability === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      
                      <button className="w-10 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <Share2 className="h-3 w-3" />
                      </button>
                    </div>
                    
                    {/* Added Date */}
                    <p className="text-xs text-gray-500 mt-2">
                      Added {item.addedDate.toLocaleDateString('en-BD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create Collection Modal */}
      {showCreateCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Collection</h3>
            
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
            />
            
            <p className="text-sm text-gray-600 mb-6">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} will be added to this collection.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateCollection(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCollection}
                disabled={!newCollectionName.trim()}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default WishlistManager;