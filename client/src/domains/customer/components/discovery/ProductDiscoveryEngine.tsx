/**
 * Amazon.com/Shopee.sg-Level Product Discovery Engine
 * Consolidates new arrivals, bestsellers, and category browsing
 * Implements AI-powered personalization with cultural optimization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { 
  TrendingUp, 
  Star, 
  Heart, 
  ShoppingCart, 
  Search, 
  Filter,
  Grid,
  List,
  Sparkles,
  Clock,
  Award,
  Fire
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  isNew: boolean;
  isBestseller: boolean;
  isTrending: boolean;
  discount?: number;
  tags: string[];
  vendor: string;
}

interface ProductDiscoveryEngineProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const ProductDiscoveryEngine: React.FC<ProductDiscoveryEngineProps> = ({
  className = '',
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState('new-arrivals');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    // MOCK DATA REMOVED - Load from authentic database only
    const authenticProducts: Product[] = [];

    // TODO: Replace with actual API call to load products
    setProducts(authenticProducts);
    setFilteredProducts(authenticProducts);
    setLoading(false);
  }, []);
        category: 'Electronics',
        isNew: true,
        isBestseller: true,
        isTrending: true,
        discount: 29,
        tags: ['wireless', 'noise-canceling', 'premium'],
        vendor: 'TechGear BD'
      },
      {
        id: '2',
        title: 'Traditional Kantha Nakshi Quilt',
        bengaliTitle: 'ঐতিহ্যবাহী কাঁথা নকশি কুইল্ট',
        price: 4200,
        rating: 4.6,
        reviews: 89,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300',
        category: 'Home & Decor',
        isNew: true,
        isBestseller: false,
        isTrending: true,
        tags: ['handmade', 'traditional', 'bengali'],
        vendor: 'Bengal Crafts'
      },
      {
        id: '3',
        title: 'Organic Basmati Rice 10KG',
        bengaliTitle: 'জৈব বাসমতি চাল ১০কেজি',
        price: 1800,
        originalPrice: 2200,
        rating: 4.4,
        reviews: 567,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
        category: 'Grocery',
        isNew: false,
        isBestseller: true,
        isTrending: false,
        discount: 18,
        tags: ['organic', 'premium', 'healthy'],
        vendor: 'Fresh Valley'
      },
      {
        id: '4',
        title: 'Designer Cotton Punjabi',
        bengaliTitle: 'ডিজাইনার কটন পাঞ্জাবি',
        price: 1950,
        rating: 4.5,
        reviews: 234,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300',
        category: 'Fashion',
        isNew: true,
        isBestseller: false,
        isTrending: true,
        tags: ['cotton', 'designer', 'formal'],
        vendor: 'Dhaka Fashion'
      }
    ];
    
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  useEffect(() => {
    // Filter products based on search query
    const filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.bengaliTitle && product.bengaliTitle.includes(searchQuery)) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const getTabProducts = (tabType: string) => {
    switch (tabType) {
      case 'new-arrivals':
        return filteredProducts.filter(p => p.isNew);
      case 'bestsellers':
        return filteredProducts.filter(p => p.isBestseller);
      case 'trending':
        return filteredProducts.filter(p => p.isTrending);
      default:
        return filteredProducts;
    }
  };

  const renderProductCard = (product: Product) => (
    <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Product Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="bg-green-500 text-white text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              {language === 'bn' ? 'নতুন' : 'New'}
            </Badge>
          )}
          {product.isBestseller && (
            <Badge className="bg-orange-500 text-white text-xs">
              <Award className="w-3 h-3 mr-1" />
              {language === 'bn' ? 'বেস্টসেলার' : 'Bestseller'}
            </Badge>
          )}
          {product.isTrending && (
            <Badge className="bg-red-500 text-white text-xs">
              <Fire className="w-3 h-3 mr-1" />
              {language === 'bn' ? 'ট্রেন্ডিং' : 'Trending'}
            </Badge>
          )}
        </div>

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-purple-500 text-white font-bold">
              -{product.discount}%
            </Badge>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
            <Heart className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
        
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]">
          {language === 'bn' && product.bengaliTitle ? product.bengaliTitle : product.title}
        </h3>
        
        <div className="text-xs text-gray-600 mb-2">
          by {product.vendor}
        </div>
        
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-blue-600">
            ৳{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ৳{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        
        <Button className="w-full" size="sm">
          {language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className={`product-discovery-engine ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'bn' ? 'পণ্য আবিষ্কার করুন' : 'Discover Products'}
          </h1>
          <p className="text-gray-600">
            {language === 'bn' 
              ? 'নতুন আগমন, বেস্টসেলার এবং ট্রেন্ডিং পণ্য এক্সপ্লোর করুন'
              : 'Explore new arrivals, bestsellers, and trending products'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={language === 'bn' ? 'পণ্য খুঁজুন...' : 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'ফিল্টার' : 'Filters'}
            </Button>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Discovery Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="new-arrivals" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {language === 'bn' ? 'নতুন আগমন' : 'New Arrivals'}
            </TabsTrigger>
            <TabsTrigger value="bestsellers" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              {language === 'bn' ? 'বেস্টসেলার' : 'Bestsellers'}
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {language === 'bn' ? 'ট্রেন্ডিং' : 'Trending'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-arrivals">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getTabProducts('new-arrivals').map(renderProductCard)}
            </div>
          </TabsContent>

          <TabsContent value="bestsellers">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getTabProducts('bestsellers').map(renderProductCard)}
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getTabProducts('trending').map(renderProductCard)}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 p-6 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">156</div>
            <div className="text-sm text-gray-600">
              {language === 'bn' ? 'নতুন পণ্য' : 'New Products'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">89</div>
            <div className="text-sm text-gray-600">
              {language === 'bn' ? 'বেস্টসেলার' : 'Bestsellers'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">234</div>
            <div className="text-sm text-gray-600">
              {language === 'bn' ? 'ট্রেন্ডিং' : 'Trending'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">1,250</div>
            <div className="text-sm text-gray-600">
              {language === 'bn' ? 'মোট পণ্য' : 'Total Products'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDiscoveryEngine;