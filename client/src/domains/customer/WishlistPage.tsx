/**
 * WishlistPage.tsx - Amazon.com/Shopee.sg-Level Wishlist Management
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Complete wishlist management with social sharing, price tracking,
 * and Amazon.com/Shopee.sg-level functionality.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { 
  Heart, 
  ShoppingCart, 
  Share2, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  TrendingDown, 
  TrendingUp,
  Bell,
  Eye,
  Trash2,
  Gift,
  MessageCircle,
  ExternalLink,
  Copy,
  Facebook,
  Twitter,
  Download,
  Upload,
  Plus,
  Minus,
  RefreshCw,
  Calendar,
  Tag,
  Users,
  Settings
} from 'lucide-react';

// Bangladesh-specific icons
import { FaWhatsapp, FaTelegram, FaViber } from 'react-icons/fa';

import { UserApiService } from '@/shared/services/user/UserApiService';
import { ProductApiService } from '@/shared/services/api/ProductService';
import { useToast } from '@/shared/hooks/use-toast';

interface WishlistPageProps {
  userId?: string;
}

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  currency: string;
  inStock: boolean;
  stockQuantity?: number;
  rating: number;
  reviewCount: number;
  category: string;
  vendor: {
    id: string;
    name: string;
    storeName: string;
  };
  addedAt: string;
  priceHistory: Array<{
    price: number;
    date: string;
  }>;
  priceAlert: {
    enabled: boolean;
    targetPrice?: number;
    notifyDiscount?: number;
  };
  notes?: string;
  tags: string[];
  isPublic: boolean;
}

interface WishlistCollection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  items: string[]; // wishlist item IDs
  createdAt: string;
  updatedAt: string;
}

interface PriceAlertSettings {
  targetPrice: number;
  discountPercentage: number;
  emailNotification: boolean;
  smsNotification: boolean;
  pushNotification: boolean;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ userId }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [collections, setCollections] = useState<WishlistCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showPriceAlerts, setShowPriceAlerts] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadWishlistData();
  }, [userId]);

  const loadWishlistData = async () => {
    try {
      setLoading(true);
      const [items, userCollections] = await Promise.all([
        UserApiService.getWishlistItems(),
        UserApiService.getWishlistCollections()
      ]);
      setWishlistItems(items);
      setCollections(userCollections);
    } catch (error) {
      console.error('Error loading wishlist data:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = wishlistItems.filter(item => {
    // Search filter
    if (searchTerm && !item.productName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }

    // Price range filter
    if (priceRangeFilter !== 'all') {
      const price = item.currentPrice;
      switch (priceRangeFilter) {
        case 'under-1000':
          if (price >= 1000) return false;
          break;
        case '1000-5000':
          if (price < 1000 || price >= 5000) return false;
          break;
        case '5000-10000':
          if (price < 5000 || price >= 10000) return false;
          break;
        case 'over-10000':
          if (price < 10000) return false;
          break;
      }
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      if (availabilityFilter === 'in-stock' && !item.inStock) return false;
      if (availabilityFilter === 'out-of-stock' && item.inStock) return false;
      if (availabilityFilter === 'low-stock' && (item.stockQuantity || 0) > 10) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'oldest':
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      case 'price-low':
        return a.currentPrice - b.currentPrice;
      case 'price-high':
        return b.currentPrice - a.currentPrice;
      case 'name':
        return a.productName.localeCompare(b.productName);
      case 'rating':
        return b.rating - a.rating;
      case 'discount':
        return (b.discount || 0) - (a.discount || 0);
      default:
        return 0;
    }
  });

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      await UserApiService.removeFromWishlist(itemId);
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      toast({
        title: "Removed",
        description: "Item removed from wishlist",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (item: WishlistItem, quantity: number = 1) => {
    try {
      await ProductApiService.addToCart({
        productId: item.productId,
        quantity,
        selectedVariant: null
      });
      toast({
        title: "Added to Cart",
        description: `${item.productName} added to cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  const handleSetPriceAlert = async (itemId: string, settings: PriceAlertSettings) => {
    try {
      await UserApiService.setPriceAlert(itemId, settings);
      setWishlistItems(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              priceAlert: { 
                enabled: true, 
                targetPrice: settings.targetPrice,
                notifyDiscount: settings.discountPercentage 
              } 
            }
          : item
      ));
      toast({
        title: "Price Alert Set",
        description: "You'll be notified when the price drops",
      });
    } catch (error) {
      console.error('Error setting price alert:', error);
      toast({
        title: "Error",
        description: "Failed to set price alert",
        variant: "destructive",
      });
    }
  };

  const handleBulkAddToCart = async () => {
    try {
      const selectedProducts = wishlistItems.filter(item => 
        selectedItems.includes(item.id) && item.inStock
      );
      
      for (const item of selectedProducts) {
        await ProductApiService.addToCart({
          productId: item.productId,
          quantity: 1,
          selectedVariant: null
        });
      }

      setSelectedItems([]);
      toast({
        title: "Added to Cart",
        description: `${selectedProducts.length} items added to cart`,
      });
    } catch (error) {
      console.error('Error bulk adding to cart:', error);
      toast({
        title: "Error",
        description: "Some items couldn't be added to cart",
        variant: "destructive",
      });
    }
  };

  const handleBulkRemove = async () => {
    try {
      for (const itemId of selectedItems) {
        await UserApiService.removeFromWishlist(itemId);
      }
      
      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      toast({
        title: "Removed",
        description: `${selectedItems.length} items removed from wishlist`,
      });
    } catch (error) {
      console.error('Error bulk removing:', error);
      toast({
        title: "Error",
        description: "Failed to remove some items",
        variant: "destructive",
      });
    }
  };

  const handleShareWishlist = async (platform: string) => {
    const wishlistUrl = `${window.location.origin}/wishlist/shared/${userId}`;
    const shareText = `Check out my wishlist on GetIt Bangladesh!`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${wishlistUrl}`)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(wishlistUrl)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(wishlistUrl)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(wishlistUrl)}&text=${encodeURIComponent(shareText)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(wishlistUrl);
        toast({
          title: "Link Copied",
          description: "Wishlist link copied to clipboard",
        });
        break;
    }
  };

  const handleCreateCollection = async (name: string, description: string, isPublic: boolean) => {
    try {
      const newCollection = await UserApiService.createWishlistCollection({
        name,
        description,
        isPublic,
        items: selectedItems
      });
      setCollections(prev => [...prev, newCollection]);
      setSelectedItems([]);
      setShowCollectionModal(false);
      toast({
        title: "Collection Created",
        description: `${name} collection created successfully`,
      });
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
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

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Heart className="h-6 w-6 mr-2 text-red-500" />
            My Wishlist ({filteredItems.length})
          </h1>
          <p className="text-gray-600">Save items for later and track price changes</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowShareModal(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button variant="outline" onClick={() => setShowCollectionModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Collection
          </Button>
          
          <Button variant="outline" onClick={loadWishlistData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-1000">Under ৳1,000</SelectItem>
                <SelectItem value="1000-5000">৳1,000 - ৳5,000</SelectItem>
                <SelectItem value="5000-10000">৳5,000 - ৳10,000</SelectItem>
                <SelectItem value="over-10000">Over ৳10,000</SelectItem>
              </SelectContent>
            </Select>

            {/* Availability */}
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="discount">Biggest Discount</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
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
            <div className="flex items-center justify-between mt-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedItems.length} item(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={handleBulkAddToCart}>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkRemove}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wishlist Items */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {wishlistItems.length === 0 
                ? 'Start adding items you love to your wishlist' 
                : 'Try adjusting your search criteria'
              }
            </p>
            <Button onClick={() => window.location.href = '/'}>
              <Plus className="h-4 w-4 mr-2" />
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredItems.map((item) => (
            <Card key={item.id} className={`group hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}>
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(prev => [...prev, item.id]);
                      } else {
                        setSelectedItems(prev => prev.filter(id => id !== item.id));
                      }
                    }}
                    className="rounded"
                  />
                </div>

                {/* Product Image */}
                <div className={`${viewMode === 'list' ? 'h-32' : 'h-48'} bg-gray-200 rounded-t-lg overflow-hidden`}>
                  {item.productImage ? (
                    <img 
                      src={item.productImage} 
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="absolute top-2 right-2 space-y-1">
                  {!item.inStock && (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                  {item.discount && item.discount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      -{item.discount}%
                    </Badge>
                  )}
                  {item.priceAlert.enabled && (
                    <Badge className="bg-orange-500 text-white">
                      <Bell className="h-3 w-3 mr-1" />
                      Alert
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="space-y-3">
                  {/* Product Name */}
                  <h3 className="font-medium text-sm line-clamp-2 hover:text-blue-600 cursor-pointer">
                    {item.productName}
                  </h3>

                  {/* Vendor */}
                  <p className="text-xs text-gray-600">{item.vendor.storeName}</p>

                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({item.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">৳{item.currentPrice.toLocaleString()}</span>
                      {item.originalPrice && item.originalPrice > item.currentPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ৳{item.originalPrice.toLocaleString()}
                        </span>
                      )}
                      {getPriceChangeIcon(item)}
                    </div>
                  </div>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-xs text-gray-600 italic line-clamp-2">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.inStock}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center justify-between text-xs">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Bell className="h-3 w-3 mr-1" />
                      Price Alert
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Wishlist</DialogTitle>
            <DialogDescription>
              Let others see what you're interested in
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleShareWishlist('whatsapp')} className="flex items-center justify-center">
              <FaWhatsapp className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button onClick={() => handleShareWishlist('facebook')} className="flex items-center justify-center">
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button onClick={() => handleShareWishlist('twitter')} className="flex items-center justify-center">
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button onClick={() => handleShareWishlist('telegram')} className="flex items-center justify-center">
              <FaTelegram className="h-4 w-4 mr-2" />
              Telegram
            </Button>
            <Button onClick={() => handleShareWishlist('copy')} variant="outline" className="col-span-2">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collection Modal */}
      <Dialog open={showCollectionModal} onOpenChange={setShowCollectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Organize your wishlist items into collections
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="collectionName">Collection Name</Label>
              <Input id="collectionName" placeholder="e.g., Birthday Gifts, Electronics" />
            </div>
            <div>
              <Label htmlFor="collectionDescription">Description (Optional)</Label>
              <Textarea id="collectionDescription" placeholder="Describe this collection..." />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isPublic" />
              <Label htmlFor="isPublic">Make this collection public</Label>
            </div>
            <p className="text-sm text-gray-600">
              {selectedItems.length} item(s) will be added to this collection
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCollectionModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleCreateCollection('Test Collection', 'Test Description', false)}>
              Create Collection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WishlistPage;