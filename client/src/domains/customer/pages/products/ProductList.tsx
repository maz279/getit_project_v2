import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/common/Layout/MainLayout';
import { Button } from '@/components/common/UI/Button/Button';
import { SearchInput } from '@/components/common/UI/Input/Input';
import { LoadingSpinner, SkeletonCard } from '@/components/common/UI/Loading/Loading';
import { EnhancedProductCard } from '@/components/common/Product';
import { cn } from "@/lib/utils";

// ProductList - Amazon.com/Shopee.sg Level Product Browsing
export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 100000],
    rating: 0,
    brand: '',
    availability: 'all',
    sortBy: 'relevance'
  });
  const [viewType, setViewType] = useState('grid'); // grid or list
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate loading products
    setTimeout(() => {
      setProducts(generateSampleProducts());
      setLoading(false);
    }, 1000);
  }, [filters, searchQuery]);

  const generateSampleProducts = () => {
    const productNames = [
      'Samsung Galaxy S24 Ultra 5G (256GB)',
      'iPhone 15 Pro Max (512GB) - Titanium',
      'Sony WH-1000XM5 Wireless Headphones',
      'LG 55" OLED Smart TV 4K',
      'Xiaomi 13 Pro Smartphone',
      'Apple MacBook Air M2 (13-inch)',
      'Samsung 65" Neo QLED 8K TV',
      'Sony Alpha A7 IV Mirrorless Camera',
      'LG Washing Machine 8KG Front Load',
      'Xiaomi Mi Band 8 Smart Watch',
      'Dell XPS 13 Laptop (Intel i7)',
      'Canon EOS R6 Mark II Camera',
      'HP Pavilion Gaming Desktop',
      'Asus ROG Gaming Laptop',
      'Lenovo ThinkPad X1 Carbon',
      'Nikon D850 DSLR Camera',
      'MSI Gaming Monitor 27" 4K',
      'ASUS ZenBook Pro 15',
      'Acer Predator Gaming Chair',
      'Logitech MX Master 3 Mouse',
      'Sony PlayStation 5 Console',
      'Nintendo Switch OLED Model',
      'Microsoft Surface Pro 9',
      'iPad Pro 12.9" M2 (1TB)'
    ];

    const brands = ['Samsung', 'Apple', 'Sony', 'LG', 'Xiaomi', 'Dell', 'Canon', 'HP', 'Asus', 'Lenovo', 'Nikon', 'MSI', 'Acer', 'Logitech', 'Microsoft'];
    const categories = ['Smartphones', 'Laptops', 'Audio', 'Cameras', 'TVs', 'Gaming', 'Accessories', 'Appliances'];
    const vendors = [
      { name: 'TechWorld BD', rating: 4.8, verified: true, location: 'Dhaka' },
      { name: 'ElectroMax', rating: 4.6, verified: true, location: 'Chittagong' },
      { name: 'DigitalHub', rating: 4.9, verified: true, location: 'Sylhet' },
      { name: 'GadgetZone', rating: 4.7, verified: true, location: 'Rajshahi' },
      { name: 'SmartTech', rating: 4.5, verified: false, location: 'Khulna' },
      { name: 'ProElectronics', rating: 4.8, verified: true, location: 'Dhaka' },
      { name: 'MegaTech', rating: 4.4, verified: true, location: 'Barisal' },
      { name: 'TechMart BD', rating: 4.9, verified: true, location: 'Rangpur' }
    ];

    return Array.from({ length: 24 }, (_, index) => {
      const vendor = vendors[index % vendors.length];
      const basePrice = Math.floor(Math.random() * 150000) + 5000;
      const discount = Math.floor(Math.random() * 40) + 5;
      const discountedPrice = Math.floor(basePrice * (100 - discount) / 100);
      
      return {
        id: `prod_${index + 1}`,
        name: productNames[index] || `Premium Product ${index + 1}`,
        brand: brands[index % brands.length],
        category: categories[index % categories.length],
        price: discountedPrice,
        originalPrice: basePrice,
        rating: (Math.random() * 2 + 3.5).toFixed(1),
        reviews: Math.floor(Math.random() * 2000) + 50,
        images: [
          `/product-${(index % 10) + 1}.jpg`,
          `/product-${(index % 10) + 1}-2.jpg`,
          `/product-${(index % 10) + 1}-3.jpg`,
          `/product-${(index % 10) + 1}-4.jpg`
        ],
        discount: discount,
        availability: Math.random() > 0.15 ? 'in-stock' : 'out-of-stock',
        stockLevel: Math.floor(Math.random() * 50) + 1,
        badge: ['New Arrival', 'Hot Deal', 'Flash Sale', 'Best Seller', 'Featured', null][index % 6],
        shipping: {
          free: Math.random() > 0.3,
          express: Math.random() > 0.5,
          cod: Math.random() > 0.2,
          estimatedDays: Math.floor(Math.random() * 5) + 1
        },
        vendor: vendor,
        location: vendor.location,
        features: [
          'Official Warranty',
          'EMI Available',
          'Easy Return',
          '7-Day Replacement'
        ].slice(0, Math.floor(Math.random() * 4) + 1),
        isWishlisted: Math.random() > 0.7,
        specifications: {
          weight: `${(Math.random() * 2 + 0.5).toFixed(1)}kg`,
          warranty: `${Math.floor(Math.random() * 24) + 12} months`,
          origin: ['Bangladesh', 'Singapore', 'UAE', 'India'][Math.floor(Math.random() * 4)]
        },
        paymentMethods: ['bKash', 'Nagad', 'Rocket', 'Card', 'COD'],
        quickActions: {
          addToCart: true,
          wishlist: true,
          compare: true,
          share: true,
          quickView: true
        }
      };
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Search and Filter Header */}
        <SearchAndFilterHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          viewType={viewType}
          setViewType={setViewType}
          loading={loading}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar */}
            <FilterSidebar filters={filters} setFilters={setFilters} />
            
            {/* Product Grid */}
            <div className="lg:col-span-3">
              <ProductGrid 
                products={products}
                loading={loading}
                viewType={viewType}
                filters={filters}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Search and Filter Header
const SearchAndFilterHeader = ({ searchQuery, setSearchQuery, filters, setFilters, viewType, setViewType, loading }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><a href="/" className="text-gray-500 hover:text-gray-700">Home</a></li>
            <li><span className="text-gray-500">/</span></li>
            <li><a href="/categories" className="text-gray-500 hover:text-gray-700">Categories</a></li>
            <li><span className="text-gray-500">/</span></li>
            <li className="text-gray-900 font-medium">Products</li>
          </ol>
        </nav>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <SearchInput
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* View Toggle and Sort */}
          <div className="flex items-center gap-4">
            {/* View Type Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewType('grid')}
                className={cn(
                  "p-2 rounded-l-lg",
                  viewType === 'grid' 
                    ? "bg-blue-600 text-white" 
                    : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewType('list')}
                className={cn(
                  "p-2 rounded-r-lg",
                  viewType === 'list' 
                    ? "bg-blue-600 text-white" 
                    : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        <ActiveFilters filters={filters} setFilters={setFilters} />
      </div>
    </div>
  );
};

// Active Filters Display
const ActiveFilters = ({ filters, setFilters }) => {
  const activeFilters = [];
  
  if (filters.category) activeFilters.push({ key: 'category', label: `Category: ${filters.category}` });
  if (filters.brand) activeFilters.push({ key: 'brand', label: `Brand: ${filters.brand}` });
  if (filters.rating > 0) activeFilters.push({ key: 'rating', label: `${filters.rating}+ Stars` });
  if (filters.availability !== 'all') activeFilters.push({ key: 'availability', label: `${filters.availability}` });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-sm text-gray-600">Filters:</span>
      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
        >
          {filter.label}
          <button
            onClick={() => setFilters(prev => ({ ...prev, [filter.key]: filter.key === 'rating' ? 0 : '' }))}
            className="ml-1 hover:text-blue-600"
          >
            ×
          </button>
        </span>
      ))}
      <button
        onClick={() => setFilters({
          category: '',
          priceRange: [0, 100000],
          rating: 0,
          brand: '',
          availability: 'all',
          sortBy: 'relevance'
        })}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Clear all
      </button>
    </div>
  );
};

// Filter Sidebar
const FilterSidebar = ({ filters, setFilters }) => {
  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Automotive'];
  const brands = ['Samsung', 'Apple', 'Sony', 'LG', 'Xiaomi', 'Nike', 'Adidas'];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
      
      {/* Category Filter */}
      <FilterSection title="Category">
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category}
                checked={filters.category === category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection title="Price Range">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]] 
              }))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                priceRange: [prev.priceRange[0], parseInt(e.target.value) || 100000] 
              }))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Under ৳1K', range: [0, 1000] },
              { label: '৳1K - ৳5K', range: [1000, 5000] },
              { label: '৳5K - ৳10K', range: [5000, 10000] },
              { label: 'Over ৳10K', range: [10000, 100000] }
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setFilters(prev => ({ ...prev, priceRange: preset.range }))}
                className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Brand Filter */}
      <FilterSection title="Brand">
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center">
              <input
                type="radio"
                name="brand"
                value={brand}
                checked={filters.brand === brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{brand}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating Filter */}
      <FilterSection title="Customer Rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.rating === rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                className="mr-2"
              />
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < rating ? "text-yellow-400" : "text-gray-300"
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-gray-600">& up</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Availability Filter */}
      <FilterSection title="Availability">
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="availability"
              value="all"
              checked={filters.availability === 'all'}
              onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">All Products</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="availability"
              value="in-stock"
              checked={filters.availability === 'in-stock'}
              onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">In Stock</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
};

// Filter Section Component
const FilterSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h4 className="font-medium text-gray-900">{title}</h4>
        <svg
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen ? "transform rotate-180" : ""
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
};

// Product Grid
const ProductGrid = ({ products, loading, viewType, filters }) => {
  if (loading) {
    return (
      <div className={cn(
        "grid gap-6",
        viewType === 'grid' 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
          : "grid-cols-1"
      )}>
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={index} className={viewType === 'list' ? "h-32" : "h-80"} />
        ))}
      </div>
    );
  }

  const filteredProducts = products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.brand && product.brand !== filters.brand) return false;
    if (filters.rating > 0 && parseFloat(product.rating) < filters.rating) return false;
    if (filters.availability !== 'all' && product.availability !== filters.availability) return false;
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return parseFloat(b.rating) - parseFloat(a.rating);
      case 'newest': return b.id - a.id;
      case 'popular': return b.reviews - a.reviews;
      default: return 0;
    }
  });

  return (
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Showing {sortedProducts.length} of {products.length} products
        </p>
      </div>

      {/* Product Grid/List */}
      <div className={cn(
        "grid gap-6",
        viewType === 'grid' 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
          : "grid-cols-1"
      )}>
        {sortedProducts.map((product) => (
          <EnhancedProductCard 
            key={product.id} 
            product={product}
            layout={viewType}
            onAddToCart={(product) => console.log('Add to cart:', product)}
            onAddToWishlist={(product) => console.log('Add to wishlist:', product)}
            onQuickView={(product) => console.log('Quick view:', product)}
            onShare={(product) => console.log('Share:', product)}
            onProductClick={(product) => console.log('Product click:', product)}
            showQuickActions={true}
            showShippingInfo={true}
            showVendorInfo={true}
          />
        ))}
      </div>

      {/* Load More */}
      {sortedProducts.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
};

// Old ProductCard component removed - replaced with EnhancedProductCard

// Product List Item (List View)
const ProductListItem = ({ product }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        <div className="relative flex-shrink-0">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-32 h-32 object-cover rounded-lg"
          />
          {product.badge && (
            <div className="absolute top-1 left-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
              {product.badge}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-sm text-gray-500">{product.brand}</div>
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-full">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.floor(parseFloat(product.rating)) ? "text-yellow-400" : "text-gray-300"
                  )}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">{product.rating} ({product.reviews} reviews)</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl font-bold text-gray-900">৳{product.price.toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">৳{product.originalPrice.toLocaleString()}</span>
                )}
                {product.discount > 0 && (
                  <span className="text-sm text-red-600 font-medium">-{product.discount}%</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <span>Sold by: {product.seller}</span>
                <span className="mx-2">•</span>
                <span>{product.location}</span>
                {product.shipping === 'free' && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-green-600 font-medium">Free Shipping</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline">Add to Cart</Button>
              <Button>Buy Now</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;