import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/common/Layout/MainLayout';
import { Button } from '@/components/common/UI/Button/Button';
import { SearchInput } from '@/components/common/UI/Input/Input';
import { LoadingSpinner, SkeletonCard } from '@/components/common/UI/Loading/Loading';
import { cn } from "@/lib/utils";

// CategoryPage - Amazon.com/Shopee.sg Level Category Browsing
export const CategoryPage = () => {
  const [categoryData, setCategoryData] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Get category from URL params or default to electronics
  const categoryId = 'electronics'; // This would come from URL params in real app

  useEffect(() => {
    // Simulate loading category data
    setTimeout(() => {
      setCategoryData(getCategoryData(categoryId));
      setSubCategories(getSubCategories(categoryId));
      setFeaturedProducts(generateFeaturedProducts());
      setTrendingProducts(generateTrendingProducts());
      setLoading(false);
    }, 1000);
  }, [categoryId]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {loading ? (
          <CategoryLoadingSkeleton />
        ) : (
          <>
            {/* Category Header */}
            <CategoryHeader categoryData={categoryData} />
            
            {/* Category Navigation */}
            <CategoryNavigation 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              subCategories={subCategories}
            />
            
            {/* Category Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activeTab === 'overview' && (
                <CategoryOverview 
                  categoryData={categoryData}
                  subCategories={subCategories}
                  featuredProducts={featuredProducts}
                  trendingProducts={trendingProducts}
                />
              )}
              {activeTab === 'subcategories' && (
                <SubCategoriesView subCategories={subCategories} />
              )}
              {activeTab === 'brands' && (
                <BrandsView categoryData={categoryData} />
              )}
              {activeTab === 'deals' && (
                <DealsView categoryData={categoryData} />
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

// Get Category Data
const getCategoryData = (categoryId) => {
  const categories = {
    electronics: {
      id: 'electronics',
      name: 'Electronics',
      description: 'Discover the latest in technology with our comprehensive electronics collection',
      icon: '📱',
      banner: '/category-electronics-banner.jpg',
      totalProducts: 15420,
      totalBrands: 245,
      popularBrands: ['Samsung', 'Apple', 'Sony', 'LG', 'Xiaomi', 'HP', 'Dell', 'Canon'],
      priceRange: { min: 500, max: 250000 },
      trending: ['smartphones', 'laptops', 'smart-watches', 'wireless-earbuds', 'tablets'],
      features: [
        'Latest Technology',
        'Authentic Products',
        'Warranty Included',
        'Free Installation'
      ]
    }
  };
  return categories[categoryId] || categories.electronics;
};

// Get Sub Categories
const getSubCategories = (categoryId) => {
  return [
    {
      id: 'smartphones',
      name: 'Smartphones',
      image: '/sub-smartphones.jpg',
      productCount: 2840,
      topBrands: ['Samsung', 'Apple', 'Xiaomi'],
      priceRange: '৳8,000 - ৳180,000',
      trending: true
    },
    {
      id: 'laptops',
      name: 'Laptops & Computers',
      image: '/sub-laptops.jpg',
      productCount: 1680,
      topBrands: ['HP', 'Dell', 'Apple'],
      priceRange: '৳35,000 - ৳350,000',
      trending: true
    },
    {
      id: 'audio',
      name: 'Audio & Headphones',
      image: '/sub-audio.jpg',
      productCount: 920,
      topBrands: ['Sony', 'Bose', 'JBL'],
      priceRange: '৳1,500 - ৳45,000',
      trending: false
    },
    {
      id: 'gaming',
      name: 'Gaming',
      image: '/sub-gaming.jpg',
      productCount: 560,
      topBrands: ['Sony', 'Microsoft', 'Nintendo'],
      priceRange: '৳5,000 - ৳120,000',
      trending: true
    },
    {
      id: 'cameras',
      name: 'Cameras & Photography',
      image: '/sub-cameras.jpg',
      productCount: 480,
      topBrands: ['Canon', 'Nikon', 'Sony'],
      priceRange: '৳15,000 - ৳450,000',
      trending: false
    },
    {
      id: 'home-appliances',
      name: 'Home Appliances',
      image: '/sub-appliances.jpg',
      productCount: 1240,
      topBrands: ['LG', 'Samsung', 'Whirlpool'],
      priceRange: '৳8,000 - ৳180,000',
      trending: false
    }
  ];
};

// Generate Featured Products
const generateFeaturedProducts = () => {
  return Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    name: `Featured Product ${index + 1}`,
    image: `/featured-${index + 1}.jpg`,
    price: Math.floor(Math.random() * 50000) + 5000,
    originalPrice: Math.floor(Math.random() * 60000) + 5000,
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: Math.floor(Math.random() * 500) + 50,
    discount: Math.floor(Math.random() * 40) + 10,
    brand: ['Samsung', 'Apple', 'Sony', 'LG'][index % 4],
    badge: 'Featured'
  }));
};

// Generate Trending Products
const generateTrendingProducts = () => {
  return Array.from({ length: 6 }, (_, index) => ({
    id: index + 100,
    name: `Trending Product ${index + 1}`,
    image: `/trending-${index + 1}.jpg`,
    price: Math.floor(Math.random() * 30000) + 2000,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    reviews: Math.floor(Math.random() * 300) + 100,
    brand: ['Xiaomi', 'OnePlus', 'Realme'][index % 3],
    badge: 'Trending'
  }));
};

// Category Loading Skeleton
const CategoryLoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-300"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} className="h-64" />
          ))}
        </div>
      </div>
    </div>
  );
};

// Category Header
const CategoryHeader = ({ categoryData }) => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={categoryData.banner} 
          alt={categoryData.name}
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-white/80">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><span>/</span></li>
            <li><a href="/categories" className="hover:text-white">Categories</a></li>
            <li><span>/</span></li>
            <li className="text-white font-medium">{categoryData.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Category Info */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-6xl mr-4">{categoryData.icon}</span>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">{categoryData.name}</h1>
                <p className="text-xl text-white/90 mt-2">{categoryData.description}</p>
              </div>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {categoryData.features.map((feature, index) => (
                <div key={index} className="flex items-center text-white/90">
                  <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>

            <Button className="mt-6 bg-white text-blue-600 hover:bg-gray-100" size="lg">
              Explore Products
            </Button>
          </div>

          {/* Category Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-3xl font-bold">{categoryData.totalProducts.toLocaleString()}</div>
              <div className="text-white/80">Products Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-3xl font-bold">{categoryData.totalBrands}</div>
              <div className="text-white/80">Trusted Brands</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-3xl font-bold">৳{categoryData.priceRange.min.toLocaleString()}</div>
              <div className="text-white/80">Starting Price</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-white/80">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Category Navigation
const CategoryNavigation = ({ activeTab, setActiveTab, subCategories }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'subcategories', label: 'Categories', count: subCategories.length },
    { id: 'brands', label: 'Brands', count: 245 },
    { id: 'deals', label: 'Deals', count: 89 }
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
              {tab.count && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Category Overview
const CategoryOverview = ({ categoryData, subCategories, featuredProducts, trendingProducts }) => {
  return (
    <div className="space-y-12">
      {/* Sub Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Popular Categories</h2>
          <Button variant="outline">View All Categories</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subCategories.slice(0, 6).map((subCategory) => (
            <SubCategoryCard key={subCategory.id} subCategory={subCategory} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Button variant="outline">View All Featured</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Popular Brands */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categoryData.popularBrands.map((brand) => (
            <div key={brand} className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <img 
                src={`/brands/${brand.toLowerCase()}.png`} 
                alt={brand}
                className="h-12 w-auto mx-auto mb-2"
              />
              <div className="text-sm font-medium text-gray-900">{brand}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">🔥 Trending Now</h2>
          <Button variant="outline">View All Trending</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

// Sub Categories View
const SubCategoriesView = ({ subCategories }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">All Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subCategories.map((subCategory) => (
          <SubCategoryCard key={subCategory.id} subCategory={subCategory} expanded />
        ))}
      </div>
    </div>
  );
};

// Brands View
const BrandsView = ({ categoryData }) => {
  const allBrands = [
    ...categoryData.popularBrands,
    'Asus', 'Acer', 'Lenovo', 'MSI', 'OnePlus', 'Realme', 'Oppo', 'Vivo',
    'Huawei', 'Google', 'Microsoft', 'Nintendo', 'Panasonic', 'Philips'
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">All Brands</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {allBrands.map((brand) => (
          <div key={brand} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <img 
              src={`/brands/${brand.toLowerCase()}.png`} 
              alt={brand}
              className="h-16 w-auto mx-auto mb-4 group-hover:scale-110 transition-transform"
            />
            <div className="font-medium text-gray-900">{brand}</div>
            <div className="text-sm text-gray-500 mt-1">
              {Math.floor(Math.random() * 500) + 50} products
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Deals View
const DealsView = ({ categoryData }) => {
  const deals = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: `Deal ${index + 1}`,
    description: 'Special discount on selected items',
    discount: Math.floor(Math.random() * 50) + 10,
    validUntil: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
    image: `/deal-${index + 1}.jpg`,
    minPurchase: Math.floor(Math.random() * 10000) + 5000,
    type: ['flash', 'bundle', 'clearance'][index % 3]
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Special Deals & Offers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              src={deal.image} 
              alt={deal.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  deal.type === 'flash' ? "bg-red-100 text-red-800" :
                  deal.type === 'bundle' ? "bg-blue-100 text-blue-800" :
                  "bg-green-100 text-green-800"
                )}>
                  {deal.type.charAt(0).toUpperCase() + deal.type.slice(1)}
                </span>
                <span className="text-2xl font-bold text-red-600">-{deal.discount}%</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{deal.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{deal.description}</p>
              <div className="text-xs text-gray-500 mb-4">
                <div>Min. purchase: ৳{deal.minPurchase.toLocaleString()}</div>
                <div>Valid until: {deal.validUntil.toLocaleDateString()}</div>
              </div>
              <Button className="w-full">Claim Deal</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sub Category Card
const SubCategoryCard = ({ subCategory, expanded = false }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative">
        <img 
          src={subCategory.image} 
          alt={subCategory.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
        />
        {subCategory.trending && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            🔥 Trending
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{subCategory.name}</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>{subCategory.productCount.toLocaleString()} products</div>
          <div>Price: {subCategory.priceRange}</div>
          {expanded && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-2">Top Brands:</div>
              <div className="flex flex-wrap gap-1">
                {subCategory.topBrands.map((brand) => (
                  <span key={brand} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <Button className="w-full mt-4" variant="outline">
          Explore {subCategory.name}
        </Button>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.badge && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
            {product.badge}
          </div>
        )}
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            -{product.discount}%
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="text-sm text-gray-500 mb-1">{product.brand}</div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < Math.floor(parseFloat(product.rating)) ? "text-yellow-400" : "text-gray-300"
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-1 text-xs text-gray-600">({product.reviews})</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">৳{product.price.toLocaleString()}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">৳{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        
        <Button className="w-full" size="sm">
          View Details
        </Button>
      </div>
    </div>
  );
};

export default CategoryPage;