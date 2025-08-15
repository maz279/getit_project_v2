/**
 * Wishlist Component
 * Advanced wishlist management with sharing and organization
 * Implements Amazon.com/Shopee.sg-level wishlist experience
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Heart, 
  Share2, 
  ShoppingCart, 
  Star,
  Filter,
  Search,
  Grid3X3,
  List,
  Plus,
  Trash2,
  Eye,
  Gift,
  TrendingDown,
  AlertCircle
} from 'lucide-react';

interface WishlistItem {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  brand: string;
  inStock: boolean;
  dateAdded: string;
  priceDropped: boolean;
  priceDropAmount?: number;
  lowStock?: boolean;
}

interface WishlistCollection {
  id: string;
  name: string;
  bengaliName?: string;
  description: string;
  items: WishlistItem[];
  isPublic: boolean;
  createdDate: string;
}

interface WishlistProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const Wishlist: React.FC<WishlistProps> = ({
  className = '',
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  const [collections, setCollections] = useState<WishlistCollection[]>([
    {
      id: 'default',
      name: 'My Wishlist',
      bengaliName: 'আমার উইশলিস্ট',
      description: 'Default wishlist collection',
      isPublic: false,
      createdDate: '2025-01-01',
      items: [
        {
          id: '1',
          title: 'Premium Wireless Bluetooth Headphones',
          bengaliTitle: 'প্রিমিয়াম ওয়্যারলেস ব্লুটুথ হেডফোন',
          price: 2850,
          originalPrice: 4000,
          rating: 4.6,
          reviews: 1284,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
          category: 'Electronics',
          brand: 'TechGear',
          inStock: true,
          dateAdded: '2025-01-10',
          priceDropped: true,
          priceDropAmount: 500
        },
        {
          id: '2',
          title: 'Smart Fitness Watch',
          bengaliTitle: 'স্মার্ট ফিটনেস ওয়াচ',
          price: 3200,
          originalPrice: 4500,
          rating: 4.4,
          reviews: 892,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
          category: 'Electronics',
          brand: 'FitTech',
          inStock: true,
          dateAdded: '2025-01-08',
          priceDropped: false,
          lowStock: true
        },
        {
          id: '3',
          title: 'Cotton Punjabi - Eid Collection',
          bengaliTitle: 'কটন পাঞ্জাবি - ঈদ কালেকশন',
          price: 1950,
          rating: 4.5,
          reviews: 567,
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300',
          category: 'Fashion',
          brand: 'Dhaka Fashion',
          inStock: false,
          dateAdded: '2025-01-05',
          priceDropped: false
        }
      ]
    },
    {
      id: 'electronics',
      name: 'Tech Gadgets',
      bengaliName: 'টেক গ্যাজেট',
      description: 'Latest technology and gadgets',
      isPublic: true,
      createdDate: '2025-01-05',
      items: []
    }
  ]);

  const allItems = collections.flatMap(collection => 
    collection.items.map(item => ({ ...item, collectionId: collection.id }))
  );

  const filteredItems = allItems.filter(item => {
    if (activeTab === 'price-drops' && !item.priceDropped) return false;
    if (activeTab === 'out-of-stock' && item.inStock) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const removeFromWishlist = (itemId: string) => {
    setCollections(prev => prev.map(collection => ({
      ...collection,
      items: collection.items.filter(item => item.id !== itemId)
    })));
  };

  const addToCart = (item: WishlistItem) => {
    console.log('Adding to cart:', item);
    // Add to cart logic here
  };

  const shareWishlist = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (collection && navigator.share) {
      navigator.share({
        title: collection.name,
        text: `Check out my wishlist: ${collection.name}`,
        url: `${window.location.origin}/wishlist/${collectionId}`
      });
    }
  };

  const createNewCollection = (name: string, description: string) => {
    const newCollection: WishlistCollection = {
      id: Date.now().toString(),
      name,
      bengaliName: name,
      description,
      items: [],
      isPublic: false,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setCollections(prev => [...prev, newCollection]);
    setShowCreateCollection(false);
  };

  if (allItems.length === 0) {
    return (
      <div className={`wishlist ${className}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">
              {language === 'bn' ? 'আপনার উইশলিস্ট খালি' : 'Your wishlist is empty'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'bn' 
                ? 'পছন্দের পণ্যগুলি সংরক্ষণ করতে হার্ট আইকনে ক্লিক করুন'
                : 'Click the heart icon to save your favorite products'}
            </p>
            <Button>
              {language === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`wishlist ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold">
                {language === 'bn' ? 'আমার উইশলিস্ট' : 'My Wishlist'}
              </h1>
              <p className="text-gray-600">
                {allItems.length} {language === 'bn' ? 'টি পণ্য সংরক্ষিত' : 'items saved'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateCollection(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'কালেকশন তৈরি করুন' : 'Create Collection'}
            </Button>
            <Button variant="outline" onClick={() => shareWishlist('default')}>
              <Share2 className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'শেয়ার করুন' : 'Share'}
            </Button>
          </div>
        </div>

        {/* Collections */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            {language === 'bn' ? 'কালেকশন' : 'Collections'}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <Card key={collection.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {language === 'bn' && collection.bengaliName ? collection.bengaliName : collection.name}
                    </h4>
                    {collection.isPublic && (
                      <Badge variant="outline" className="text-xs">
                        {language === 'bn' ? 'পাবলিক' : 'Public'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{collection.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {collection.items.length} {language === 'bn' ? 'টি পণ্য' : 'items'}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={language === 'bn' ? 'উইশলিস্ট খুঁজুন...' : 'Search wishlist...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="newest">{language === 'bn' ? 'নতুন' : 'Newest'}</option>
                <option value="oldest">{language === 'bn' ? 'পুরাতন' : 'Oldest'}</option>
                <option value="price-low">{language === 'bn' ? 'কম দাম' : 'Price: Low to High'}</option>
                <option value="price-high">{language === 'bn' ? 'বেশি দাম' : 'Price: High to Low'}</option>
              </select>

              {/* View Mode */}
              <div className="flex border rounded">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">
              {language === 'bn' ? 'সব' : 'All'} ({allItems.length})
            </TabsTrigger>
            <TabsTrigger value="price-drops">
              <TrendingDown className="w-4 h-4 mr-1" />
              {language === 'bn' ? 'মূল্য কমেছে' : 'Price Drops'}
            </TabsTrigger>
            <TabsTrigger value="out-of-stock">
              <AlertCircle className="w-4 h-4 mr-1" />
              {language === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}
            </TabsTrigger>
            <TabsTrigger value="collections">
              {language === 'bn' ? 'কালেকশন' : 'Collections'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {/* Items Grid/List */}
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-all">
                  {viewMode === 'grid' ? (
                    <div>
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        
                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {item.priceDropped && (
                            <Badge className="bg-green-500 text-white text-xs">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              ৳{item.priceDropAmount} {language === 'bn' ? 'কম' : 'off'}
                            </Badge>
                          )}
                          {item.lowStock && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              {language === 'bn' ? 'কম স্টক' : 'Low Stock'}
                            </Badge>
                          )}
                          {!item.inStock && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {language === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}
                            </Badge>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="w-8 h-8 p-0"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Discount Badge */}
                        {item.originalPrice && (
                          <div className="absolute bottom-2 left-2">
                            <Badge className="bg-red-500 text-white">
                              -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{item.rating}</span>
                          <span className="text-xs text-gray-500">({item.reviews})</span>
                        </div>
                        
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {language === 'bn' && item.bengaliTitle ? item.bengaliTitle : item.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-blue-600">
                            ৳{item.price.toLocaleString()}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ৳{item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-3">
                          {item.brand} • {language === 'bn' ? 'যোগ করা হয়েছে' : 'Added'} {item.dateAdded}
                        </div>
                        
                        <Button 
                          className="w-full" 
                          disabled={!item.inStock}
                          onClick={() => addToCart(item)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                        </Button>
                      </CardContent>
                    </div>
                  ) : (
                    <div className="flex gap-4 p-4">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">
                            {language === 'bn' && item.bengaliTitle ? item.bengaliTitle : item.title}
                          </h3>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{item.rating}</span>
                          <span className="text-xs text-gray-500">({item.reviews})</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-blue-600">
                            ৳{item.price.toLocaleString()}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ৳{item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600">
                            {item.brand} • {language === 'bn' ? 'যোগ করা হয়েছে' : 'Added'} {item.dateAdded}
                          </div>
                          <Button 
                            size="sm" 
                            disabled={!item.inStock}
                            onClick={() => addToCart(item)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === 'bn' ? 'কোন পণ্য পাওয়া যায়নি' : 'No items found'}
                </h3>
                <p className="text-gray-600">
                  {language === 'bn' 
                    ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন'
                    : 'Try changing your filters or search terms'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Collection Modal */}
        {showCreateCollection && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>
                  {language === 'bn' ? 'নতুন কালেকশন তৈরি করুন' : 'Create New Collection'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'bn' ? 'কালেকশনের নাম' : 'Collection Name'}
                  </label>
                  <Input placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter name'} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'bn' ? 'বিবরণ' : 'Description'}
                  </label>
                  <Input placeholder={language === 'bn' ? 'বিবরণ লিখুন' : 'Enter description'} />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    {language === 'bn' ? 'তৈরি করুন' : 'Create'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateCollection(false)}
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;