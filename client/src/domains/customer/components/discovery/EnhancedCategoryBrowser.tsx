import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  TrendingUp, 
  Star,
  ChevronRight,
  Smartphone,
  Shirt,
  Home,
  Book,
  Heart,
  Car,
  GamepadIcon,
  Baby
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameEn: string;
  nameBn: string;
  icon: React.ReactNode;
  image: string;
  productCount: number;
  trending: boolean;
  growth: number;
  subcategories: Subcategory[];
  featuredProducts: FeaturedProduct[];
  avgPrice: number;
  topBrands: string[];
}

interface Subcategory {
  id: string;
  name: string;
  productCount: number;
  trending?: boolean;
}

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  discount?: number;
}

interface EnhancedCategoryBrowserProps {
  className?: string;
  showSubcategories?: boolean;
  layout?: 'grid' | 'list';
}

export const EnhancedCategoryBrowser: React.FC<EnhancedCategoryBrowserProps> = ({ 
  className = "",
  showSubcategories = true,
  layout: initialLayout = 'grid' 
}) => {
  const [layout, setLayout] = useState<'grid' | 'list'>(initialLayout);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'trending' | 'products'>('trending');

  // Fetch categories with analytics
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['/api/v1/categories/enhanced', searchTerm, sortBy],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mock category data for demonstration
  const mockCategories: Category[] = [
    {
      id: 'electronics',
      name: 'Electronics',
      nameEn: 'Electronics',
      nameBn: 'ইলেকট্রনিক্স',
      icon: <Smartphone className="h-6 w-6" />,
      image: '/api/placeholder/400/300',
      productCount: 15420,
      trending: true,
      growth: 23,
      avgPrice: 25000,
      topBrands: ['Samsung', 'Apple', 'Xiaomi', 'OnePlus'],
      subcategories: [
        { id: 'smartphones', name: 'Smartphones', productCount: 3500, trending: true },
        { id: 'laptops', name: 'Laptops', productCount: 1200, trending: true },
        { id: 'headphones', name: 'Headphones', productCount: 800 },
        { id: 'smartwatches', name: 'Smart Watches', productCount: 450, trending: true },
      ],
      featuredProducts: [
        {
          id: '1',
          name: 'iPhone 15 Pro',
          price: 155000,
          image: '/api/placeholder/200/200',
          rating: 4.8,
          discount: 5
        },
        {
          id: '2',
          name: 'Samsung Galaxy S24',
          price: 125000,
          image: '/api/placeholder/200/200',
          rating: 4.7,
          discount: 12
        }
      ]
    },
    {
      id: 'fashion',
      name: 'Fashion',
      nameEn: 'Fashion',
      nameBn: 'ফ্যাশন',
      icon: <Shirt className="h-6 w-6" />,
      image: '/api/placeholder/400/300',
      productCount: 28500,
      trending: true,
      growth: 18,
      avgPrice: 2500,
      topBrands: ['Aarong', 'Yellow', 'Cats Eye', 'Ecstasy'],
      subcategories: [
        { id: 'mens', name: 'Men\'s Clothing', productCount: 12000, trending: true },
        { id: 'womens', name: 'Women\'s Clothing', productCount: 14500, trending: true },
        { id: 'shoes', name: 'Shoes', productCount: 2000 },
        { id: 'accessories', name: 'Accessories', productCount: 800 },
      ],
      featuredProducts: [
        {
          id: '3',
          name: 'Cotton Punjabi',
          price: 2800,
          image: '/api/placeholder/200/200',
          rating: 4.5,
          discount: 20
        },
        {
          id: '4',
          name: 'Silk Saree',
          price: 8500,
          image: '/api/placeholder/200/200',
          rating: 4.6,
          discount: 15
        }
      ]
    },
    {
      id: 'home',
      name: 'Home & Garden',
      nameEn: 'Home & Garden',
      nameBn: 'ঘর ও বাগান',
      icon: <Home className="h-6 w-6" />,
      image: '/api/placeholder/400/300',
      productCount: 9800,
      trending: false,
      growth: 8,
      avgPrice: 3500,
      topBrands: ['IKEA', 'Hatil', 'Brothers', 'Otobi'],
      subcategories: [
        { id: 'furniture', name: 'Furniture', productCount: 3500 },
        { id: 'decor', name: 'Home Decor', productCount: 2800 },
        { id: 'kitchen', name: 'Kitchen', productCount: 2000, trending: true },
        { id: 'garden', name: 'Garden', productCount: 1500 },
      ],
      featuredProducts: [
        {
          id: '5',
          name: 'Study Table',
          price: 15000,
          image: '/api/placeholder/200/200',
          rating: 4.3,
          discount: 10
        }
      ]
    },
    {
      id: 'books',
      name: 'Books',
      nameEn: 'Books',
      nameBn: 'বই',
      icon: <Book className="h-6 w-6" />,
      image: '/api/placeholder/400/300',
      productCount: 5600,
      trending: true,
      growth: 35,
      avgPrice: 450,
      topBrands: ['Prothoma', 'Ananda', 'Sheba', 'Mawla'],
      subcategories: [
        { id: 'academic', name: 'Academic Books', productCount: 2500, trending: true },
        { id: 'fiction', name: 'Fiction', productCount: 1800 },
        { id: 'children', name: 'Children\'s Books', productCount: 900, trending: true },
        { id: 'religious', name: 'Religious Books', productCount: 400 },
      ],
      featuredProducts: [
        {
          id: '6',
          name: 'HSC Physics Book',
          price: 550,
          image: '/api/placeholder/200/200',
          rating: 4.7,
        }
      ]
    },
    // Add more categories...
  ];

  const filteredCategories = (categories || mockCategories).filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.nameBn.includes(searchTerm)
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'trending':
        return (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || b.growth - a.growth;
      case 'products':
        return b.productCount - a.productCount;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            সব ক্যাটাগরি
          </h2>
          <p className="text-gray-600">
            Explore all product categories with smart recommendations
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="trending">Trending</option>
            <option value="name">Name</option>
            <option value="products">Product Count</option>
          </select>

          {/* Layout Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded ${layout === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded ${layout === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid/List */}
      <div className={
        layout === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' 
          : 'space-y-4'
      }>
        {sortedCategories.map((category) => (
          <Card 
            key={category.id} 
            className={`group cursor-pointer hover:shadow-lg transition-all ${
              layout === 'list' ? 'flex' : ''
            }`}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
          >
            <CardContent className={`${layout === 'list' ? 'flex items-center gap-6 p-6' : 'p-4'}`}>
              {/* Category Image/Icon */}
              <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${
                layout === 'list' ? 'w-32 h-24 flex-shrink-0' : 'aspect-square mb-4'
              }`}>
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="text-white p-3 bg-black bg-opacity-50 rounded-full">
                    {category.icon}
                  </div>
                </div>
                
                {/* Trending Badge */}
                {category.trending && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-500 text-white text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Hot
                    </Badge>
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className={`${layout === 'list' ? 'flex-1' : 'space-y-3'}`}>
                <div className={layout === 'list' ? 'flex justify-between items-start' : 'space-y-2'}>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {category.nameBn}
                    </h3>
                    <p className="text-sm text-gray-600">{category.nameEn}</p>
                  </div>
                  
                  {layout === 'list' && (
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Products:</span>
                    <span className="font-medium">{category.productCount.toLocaleString()}</span>
                  </div>
                  
                  {category.trending && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Growth:</span>
                      <span className="font-medium text-green-600">+{category.growth}%</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg Price:</span>
                    <span className="font-medium">৳{category.avgPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Top Brands */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">Popular Brands:</div>
                  <div className="flex flex-wrap gap-1">
                    {category.topBrands.slice(0, 3).map((brand) => (
                      <Badge key={brand} variant="outline" className="text-xs">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Subcategories (when expanded) */}
                {selectedCategory === category.id && showSubcategories && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="text-sm font-medium text-gray-900">Subcategories:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          className="text-left p-2 rounded hover:bg-gray-50 text-sm group/sub"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/category/${category.id}/${sub.id}`;
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="group-hover/sub:text-blue-600">{sub.name}</span>
                            {sub.trending && (
                              <Badge variant="secondary" className="text-xs">
                                🔥
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {sub.productCount} products
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Products Preview */}
                {selectedCategory === category.id && category.featuredProducts.length > 0 && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="text-sm font-medium text-gray-900">Featured Products:</div>
                    <div className="grid grid-cols-2 gap-3">
                      {category.featuredProducts.slice(0, 2).map((product) => (
                        <div key={product.id} className="group/product cursor-pointer">
                          <div className="relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full aspect-square object-cover rounded"
                            />
                            {product.discount && (
                              <Badge variant="destructive" className="absolute top-1 right-1 text-xs">
                                -{product.discount}%
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1">
                            <div className="text-xs font-medium group-hover/product:text-blue-600 line-clamp-2">
                              {product.name}
                            </div>
                            <div className="text-xs font-bold text-blue-600">
                              ৳{product.price.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs">{product.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access Popular Categories */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Access - Popular Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {sortedCategories.filter(cat => cat.trending).slice(0, 8).map((category) => (
            <button
              key={category.id}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white transition-colors group"
              onClick={() => window.location.href = `/category/${category.id}`}
            >
              <div className="p-2 bg-white rounded-full shadow group-hover:shadow-md transition-shadow">
                {category.icon}
              </div>
              <span className="text-xs font-medium text-center">{category.nameBn}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCategoryBrowser;