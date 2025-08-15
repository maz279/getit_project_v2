import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, Grid, List, Filter, SortAsc, Search } from 'lucide-react';
import { categoriesData } from '@/data/categoriesData';

interface CategoryProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendor: string;
  rating: number;
  reviews: number;
  badge?: string;
}

// Mock products data - replace with actual API call
const mockProducts: CategoryProduct[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S24 Ultra',
    price: 124999,
    originalPrice: 134999,
    image: '/placeholder.svg',
    vendor: 'TechWorld BD',
    rating: 4.8,
    reviews: 324,
    badge: 'Best Seller'
  },
  {
    id: '2',
    name: 'iPhone 15 Pro Max',
    price: 149999,
    image: '/placeholder.svg',
    vendor: 'Apple Store BD',
    rating: 4.9,
    reviews: 567,
    badge: 'New Arrival'
  },
  {
    id: '3',
    name: 'MacBook Air M3',
    price: 124999,
    originalPrice: 134999,
    image: '/placeholder.svg',
    vendor: 'Mac Center BD',
    rating: 4.7,
    reviews: 89,
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5',
    price: 35999,
    originalPrice: 39999,
    image: '/placeholder.svg',
    vendor: 'Audio Hub BD',
    rating: 4.6,
    reviews: 123,
    badge: 'Deal'
  }
];

export const CategoriesLayout: React.FC = () => {
  const { category, subcategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [products, setProducts] = useState<CategoryProduct[]>(mockProducts);
  const [loading, setLoading] = useState(true);

  const subSubcategory = searchParams.get('subsubcategory');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  // Find current category data
  const currentCategory = categoriesData?.find(cat => cat.id === category);
  const currentSubcategory = currentCategory?.subcategories?.[subcategory || ''];

  useEffect(() => {
    // Simulate loading products
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [category, subcategory, subSubcategory]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const sorted = [...products].sort((a, b) => {
      switch (value) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });
    setProducts(sorted);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderBreadcrumb = () => (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
      <ChevronRight className="w-4 h-4" />
      <Link to="/categories" className="hover:text-blue-600 dark:hover:text-blue-400">Categories</Link>
      {currentCategory && (
        <>
          <ChevronRight className="w-4 h-4" />
          <Link 
            to={`/categories/${category}`}
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            {currentCategory.name}
          </Link>
        </>
      )}
      {currentSubcategory && (
        <>
          <ChevronRight className="w-4 h-4" />
          <Link 
            to={`/categories/${category}/${subcategory}`}
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            {currentSubcategory.name}
          </Link>
        </>
      )}
      {subSubcategory && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-gray-100">{subSubcategory}</span>
        </>
      )}
    </nav>
  );

  const renderFilters = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-sm">Filters:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
          <select 
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="relevance">Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {products.length} products found
        </div>
      </div>
    </div>
  );

  const renderProductGrid = () => (
    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
      {products.map((product) => (
        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="relative">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            {product.badge && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                {product.badge}
              </span>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex text-yellow-400">
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({product.reviews})
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              by {product.vendor}
            </p>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLoadingState = () => (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {renderBreadcrumb()}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {subSubcategory || currentSubcategory?.name || currentCategory?.name || 'All Categories'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover quality products from verified vendors in Bangladesh
        </p>
      </div>

      {renderFilters()}
      
      {loading ? renderLoadingState() : renderProductGrid()}
      
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or browse other categories
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoriesLayout;