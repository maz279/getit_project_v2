/**
 * Category Browser Component
 * Advanced category navigation with hierarchical browsing
 * Implements Amazon.com/Shopee.sg-level category experience
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { 
  ChevronRight, 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  Star,
  Heart,
  ShoppingCart
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  bengaliName: string;
  icon: string;
  productCount: number;
  subcategories?: Category[];
  featured?: boolean;
}

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
  seller: string;
}

interface CategoryBrowserProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  className = '',
  language = 'en'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Category[] = [
    {
      id: 'electronics',
      name: 'Electronics',
      bengaliName: 'ইলেকট্রনিক্স',
      icon: '📱',
      productCount: 25847,
      featured: true,
      subcategories: [
        { id: 'smartphones', name: 'Smartphones', bengaliName: 'স্মার্টফোন', icon: '📱', productCount: 5420 },
        { id: 'laptops', name: 'Laptops', bengaliName: 'ল্যাপটপ', icon: '💻', productCount: 2180 },
        { id: 'headphones', name: 'Headphones', bengaliName: 'হেডফোন', icon: '🎧', productCount: 3250 },
        { id: 'cameras', name: 'Cameras', bengaliName: 'ক্যামেরা', icon: '📷', productCount: 1890 }
      ]
    },
    {
      id: 'fashion',
      name: 'Fashion',
      bengaliName: 'ফ্যাশন',
      icon: '👗',
      productCount: 18956,
      featured: true,
      subcategories: [
        { id: 'mens-clothing', name: "Men's Clothing", bengaliName: 'পুরুষদের পোশাক', icon: '👔', productCount: 7890 },
        { id: 'womens-clothing', name: "Women's Clothing", bengaliName: 'মহিলাদের পোশাক', icon: '👗', productCount: 8450 },
        { id: 'footwear', name: 'Footwear', bengaliName: 'জুতা', icon: '👟', productCount: 2616 }
      ]
    },
    {
      id: 'home-kitchen',
      name: 'Home & Kitchen',
      bengaliName: 'ঘর ও রান্নাঘর',
      icon: '🏠',
      productCount: 12458,
      subcategories: [
        { id: 'furniture', name: 'Furniture', bengaliName: 'আসবাবপত্র', icon: '🪑', productCount: 3240 },
        { id: 'kitchen-appliances', name: 'Kitchen Appliances', bengaliName: 'রান্নাঘরের যন্ত্রপাতি', icon: '🍳', productCount: 2890 },
        { id: 'home-decor', name: 'Home Decor', bengaliName: 'ঘরের সাজসজ্জা', icon: '🏺', productCount: 4120 }
      ]
    },
    {
      id: 'books',
      name: 'Books',
      bengaliName: 'বই',
      icon: '📚',
      productCount: 8765,
      subcategories: [
        { id: 'bengali-books', name: 'Bengali Books', bengaliName: 'বাংলা বই', icon: '📖', productCount: 4520 },
        { id: 'english-books', name: 'English Books', bengaliName: 'ইংরেজি বই', icon: '📘', productCount: 2890 },
        { id: 'textbooks', name: 'Textbooks', bengaliName: 'পাঠ্যবই', icon: '📓', productCount: 1355 }
      ]
    }
  ];

  const sampleProducts: Product[] = [
    {
      id: '1',
      title: 'Premium Wireless Headphones',
      bengaliTitle: 'প্রিমিয়াম ওয়্যারলেস হেডফোন',
      price: 2850,
      originalPrice: 4000,
      rating: 4.6,
      reviews: 1284,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      category: 'electronics',
      seller: 'TechGear BD'
    },
    {
      id: '2',
      title: 'Cotton Punjabi - Eid Collection',
      bengaliTitle: 'কটন পাঞ্জাবি - ঈদ কালেকশন',
      price: 1950,
      rating: 4.4,
      reviews: 856,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300',
      category: 'fashion',
      seller: 'Dhaka Fashion'
    }
  ];

  const filteredProducts = sampleProducts.filter(product => 
    selectedCategory ? product.category === selectedCategory : true
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className={`category-browser ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">
            {language === 'bn' ? 'ক্যাটেগরি ব্রাউজার' : 'Category Browser'}
          </h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={language === 'bn' ? 'ক্যাটেগরি বা পণ্য খুঁজুন' : 'Search categories or products'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                {language === 'bn' ? 'ফিল্টার' : 'Filters'}
              </Button>
              
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
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'bn' ? 'ক্যাটেগরি' : 'Categories'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id}>
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <div className="font-medium">
                            {language === 'bn' ? category.bengaliName : category.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {category.productCount.toLocaleString()} {language === 'bn' ? 'পণ্য' : 'products'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    {/* Subcategories */}
                    {selectedCategory === category.id && category.subcategories && (
                      <div className="ml-4 mt-2 space-y-1">
                        {category.subcategories.map((sub) => (
                          <div key={sub.id} className="flex items-center gap-2 p-2 text-sm hover:bg-gray-50 rounded cursor-pointer">
                            <span>{sub.icon}</span>
                            <span>{language === 'bn' ? sub.bengaliName : sub.name}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {sub.productCount.toLocaleString()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Featured Categories */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">
                  {language === 'bn' ? 'ফিচার্ড ক্যাটেগরি' : 'Featured Categories'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.filter(c => c.featured).map((category) => (
                    <div key={category.id} className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <span className="text-lg">{category.icon}</span>
                      <div className="text-sm">
                        <div className="font-medium">
                          {language === 'bn' ? category.bengaliName : category.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {language === 'bn' ? 'বিশেষ অফার' : 'Special offers'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {selectedCategory && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{language === 'bn' ? 'ক্যাটেগরি:' : 'Category:'}</span>
                  <Badge variant="outline">
                    {language === 'bn' 
                      ? categories.find(c => c.id === selectedCategory)?.bengaliName
                      : categories.find(c => c.id === selectedCategory)?.name}
                  </Badge>
                  <span>•</span>
                  <span>{filteredProducts.length} {language === 'bn' ? 'পণ্য' : 'products'}</span>
                </div>
              </div>
            )}

            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all">
                  {viewMode === 'grid' ? (
                    <div>
                      <div className="relative">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          {product.originalPrice && (
                            <Badge className="bg-red-500 text-white">
                              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                            </Badge>
                          )}
                        </div>
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating}</span>
                          <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {language === 'bn' && product.bengaliTitle ? product.bengaliTitle : product.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-blue-600">
                            ৳{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          by {product.seller}
                        </div>
                      </CardContent>
                    </div>
                  ) : (
                    <div className="flex gap-4 p-4">
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {language === 'bn' && product.bengaliTitle ? product.bengaliTitle : product.title}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating}</span>
                          <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-blue-600">
                            ৳{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mb-3">
                          by {product.seller}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            {language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Heart className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">
                  {language === 'bn' ? 'কোন পণ্য পাওয়া যায়নি' : 'No products found'}
                </h3>
                <p className="text-gray-600">
                  {language === 'bn' 
                    ? 'অন্য ক্যাটেগরি বা সার্চ টার্ম চেষ্টা করুন'
                    : 'Try a different category or search term'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBrowser;