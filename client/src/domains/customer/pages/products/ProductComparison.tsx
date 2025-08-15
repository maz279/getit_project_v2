// ProductComparison.tsx - Amazon.com/Shopee.sg-Level Product Comparison Engine
import React, { useState, useEffect } from 'react';
import { X, Plus, Star, Check, ChevronRight, Heart, ShoppingCart, TrendingUp, Award, Shield, Truck } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  features: { [key: string]: string | number | boolean };
  specifications: { [category: string]: { [key: string]: string } };
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  shipping: {
    free: boolean;
    days: number;
  };
  warranty: string;
  seller: string;
  badges: string[];
}

const ProductComparison: React.FC = () => {
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useSEO({
    title: 'Product Comparison - Compare Features & Prices | GetIt Bangladesh',
    description: 'Compare products side-by-side with detailed specifications, prices, and reviews. Find the best deals on electronics, fashion, and more.',
    keywords: 'product comparison, compare prices, product specifications, Bangladesh shopping comparison'
  });

  useEffect(() => {
    // Load sample products for comparison
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Samsung Galaxy A54 5G',
        brand: 'Samsung',
        price: 42000,
        originalPrice: 45000,
        rating: 4.5,
        reviews: 1250,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        features: {
          display: '6.4" Super AMOLED',
          camera: '50MP Triple Camera',
          battery: '5000mAh',
          storage: '128GB',
          ram: '8GB',
          processor: 'Exynos 1380',
          os: 'Android 13',
          waterproof: true,
          wireless_charging: false,
          fingerprint: true
        },
        specifications: {
          'Display': {
            'Size': '6.4 inches',
            'Type': 'Super AMOLED',
            'Resolution': '2340 x 1080',
            'Refresh Rate': '120Hz'
          },
          'Camera': {
            'Main': '50MP f/1.8',
            'Ultra Wide': '12MP f/2.2',
            'Macro': '5MP f/2.4',
            'Front': '32MP f/2.2'
          },
          'Performance': {
            'Processor': 'Exynos 1380',
            'RAM': '8GB',
            'Storage': '128GB',
            'OS': 'Android 13'
          }
        },
        availability: 'in_stock',
        shipping: { free: true, days: 2 },
        warranty: '1 Year Official Warranty',
        seller: 'Samsung Official Store',
        badges: ['Best Seller', 'Free Shipping']
      },
      {
        id: '2',
        name: 'iPhone 14',
        brand: 'Apple',
        price: 95000,
        originalPrice: 98000,
        rating: 4.8,
        reviews: 892,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
        features: {
          display: '6.1" Super Retina XDR',
          camera: '12MP Dual Camera',
          battery: '3279mAh',
          storage: '128GB',
          ram: '6GB',
          processor: 'A15 Bionic',
          os: 'iOS 16',
          waterproof: true,
          wireless_charging: true,
          fingerprint: false
        },
        specifications: {
          'Display': {
            'Size': '6.1 inches',
            'Type': 'Super Retina XDR OLED',
            'Resolution': '2556 x 1179',
            'Refresh Rate': '60Hz'
          },
          'Camera': {
            'Main': '12MP f/1.5',
            'Ultra Wide': '12MP f/2.4',
            'Front': '12MP f/1.9'
          },
          'Performance': {
            'Processor': 'A15 Bionic',
            'RAM': '6GB',
            'Storage': '128GB',
            'OS': 'iOS 16'
          }
        },
        availability: 'in_stock',
        shipping: { free: true, days: 1 },
        warranty: '1 Year Apple Warranty',
        seller: 'Apple Authorized Reseller',
        badges: ['Premium', 'Express Delivery']
      },
      {
        id: '3',
        name: 'Xiaomi 13T Pro',
        brand: 'Xiaomi',
        price: 38000,
        originalPrice: 42000,
        rating: 4.3,
        reviews: 634,
        image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400',
        features: {
          display: '6.67" AMOLED',
          camera: '50MP Triple Camera',
          battery: '5000mAh',
          storage: '256GB',
          ram: '12GB',
          processor: 'Dimensity 9200+',
          os: 'MIUI 14',
          waterproof: true,
          wireless_charging: true,
          fingerprint: true
        },
        specifications: {
          'Display': {
            'Size': '6.67 inches',
            'Type': 'AMOLED',
            'Resolution': '2712 x 1220',
            'Refresh Rate': '144Hz'
          },
          'Camera': {
            'Main': '50MP f/1.9',
            'Ultra Wide': '12MP f/2.2',
            'Telephoto': '50MP f/1.9',
            'Front': '20MP f/2.2'
          },
          'Performance': {
            'Processor': 'Dimensity 9200+',
            'RAM': '12GB',
            'Storage': '256GB',
            'OS': 'MIUI 14'
          }
        },
        availability: 'low_stock',
        shipping: { free: true, days: 3 },
        warranty: '1 Year Xiaomi Warranty',
        seller: 'Xiaomi Official Store',
        badges: ['Limited Stock', '120W Fast Charging']
      }
    ];

    // Auto-add first two products for demonstration
    setCompareProducts(sampleProducts.slice(0, 2));
    setSearchResults(sampleProducts);
  }, []);

  const addToCompare = (product: Product) => {
    if (compareProducts.length < 4 && !compareProducts.find(p => p.id === product.id)) {
      setCompareProducts([...compareProducts, product]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareProducts(compareProducts.filter(p => p.id !== productId));
  };

  const searchProducts = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setLoading(true);
      // Simulate search
      setTimeout(() => {
        const filtered = searchResults.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
        setLoading(false);
      }, 500);
    }
  };

  const getFeatureComparison = (feature: string) => {
    const values = compareProducts.map(p => p.features[feature]);
    const unique = [...new Set(values)];
    return unique.length === 1;
  };

  const getBestValue = (feature: string) => {
    if (!compareProducts.length) return null;
    
    const values = compareProducts.map((p, index) => ({
      index,
      value: p.features[feature]
    }));

    // Determine best based on feature type
    if (typeof values[0].value === 'number') {
      return values.reduce((best, current) => 
        current.value > best.value ? current : best
      ).index;
    }
    
    return null;
  };

  const formatFeatureValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />;
    }
    return String(value);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Product Comparison</h1>
          <p className="text-xl opacity-90 mb-8">
            Compare products side-by-side to make informed purchasing decisions
          </p>
          
          {/* Add Product Search */}
          <div className="max-w-2xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => searchProducts(e.target.value)}
                placeholder="Search products to add to comparison..."
                className="w-full px-4 py-3 text-gray-900 bg-white rounded-lg border-none focus:ring-4 focus:ring-white/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchQuery && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Results</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map(product => (
                  <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(product.rating)}
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mb-4">৳{product.price.toLocaleString()}</p>
                    
                    <button
                      onClick={() => addToCompare(product)}
                      disabled={compareProducts.length >= 4 || compareProducts.find(p => p.id === product.id)}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {compareProducts.find(p => p.id === product.id) ? 'Already Added' : 'Add to Compare'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Comparison Table */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Product Comparison</h2>
            <p className="text-gray-600">{compareProducts.length}/4 products selected</p>
          </div>
          
          {compareProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Products to Compare</h3>
                <p className="text-gray-600 mb-4">
                  Search and add products above to start comparing their features and specifications.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Product Headers */}
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="p-4 text-left w-48">Product</th>
                      {compareProducts.map(product => (
                        <th key={product.id} className="p-4 text-center min-w-72">
                          <div className="relative">
                            <button
                              onClick={() => removeFromCompare(product.id)}
                              className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-24 h-24 object-cover rounded-lg mx-auto mb-3"
                            />
                            <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
                            
                            <div className="flex flex-wrap gap-1 justify-center mb-3">
                              {product.badges.map(badge => (
                                <span key={badge} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                  {badge}
                                </span>
                              ))}
                            </div>
                            
                            <div className="flex justify-center mb-3">
                              {renderStars(product.rating)}
                            </div>
                            
                            <div className="text-center mb-4">
                              <p className="text-2xl font-bold text-purple-600">৳{product.price.toLocaleString()}</p>
                              {product.originalPrice && (
                                <p className="text-sm text-gray-500 line-through">৳{product.originalPrice.toLocaleString()}</p>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <button className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-1">
                                <ShoppingCart className="h-3 w-3" />
                                Buy Now
                              </button>
                              <button className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                                <Heart className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  
                  {/* Basic Info */}
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-900 bg-gray-50">Price</td>
                      {compareProducts.map(product => (
                        <td key={product.id} className="p-4 text-center">
                          <span className="text-lg font-bold text-purple-600">৳{product.price.toLocaleString()}</span>
                        </td>
                      ))}
                    </tr>
                    
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-900 bg-gray-50">Availability</td>
                      {compareProducts.map(product => (
                        <td key={product.id} className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.availability === 'in_stock' ? 'bg-green-100 text-green-800' :
                            product.availability === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.availability.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                      ))}
                    </tr>
                    
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-900 bg-gray-50">Shipping</td>
                      {compareProducts.map(product => (
                        <td key={product.id} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-sm">
                            <Truck className="h-4 w-4" />
                            {product.shipping.free ? 'Free' : 'Paid'} • {product.shipping.days} days
                          </div>
                        </td>
                      ))}
                    </tr>
                    
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-900 bg-gray-50">Warranty</td>
                      {compareProducts.map(product => (
                        <td key={product.id} className="p-4 text-center text-sm">
                          <div className="flex items-center justify-center gap-1">
                            <Shield className="h-4 w-4" />
                            {product.warranty}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                  
                  {/* Specifications */}
                  {compareProducts.length > 0 && Object.keys(compareProducts[0].specifications).map(category => (
                    <tbody key={category}>
                      <tr className="bg-purple-50">
                        <td colSpan={compareProducts.length + 1} className="p-4 font-bold text-purple-900 text-lg">
                          {category}
                        </td>
                      </tr>
                      {Object.keys(compareProducts[0].specifications[category]).map(spec => (
                        <tr key={spec} className="border-b border-gray-100">
                          <td className="p-4 font-medium text-gray-900 bg-gray-50">{spec}</td>
                          {compareProducts.map(product => (
                            <td key={product.id} className="p-4 text-center text-sm">
                              {product.specifications[category]?.[spec] || 'N/A'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  ))}
                  
                  {/* Key Features */}
                  <tbody>
                    <tr className="bg-blue-50">
                      <td colSpan={compareProducts.length + 1} className="p-4 font-bold text-blue-900 text-lg">
                        Key Features
                      </td>
                    </tr>
                    {compareProducts.length > 0 && Object.keys(compareProducts[0].features).map(feature => (
                      <tr key={feature} className={`border-b border-gray-100 ${!getFeatureComparison(feature) ? 'bg-yellow-50' : ''}`}>
                        <td className="p-4 font-medium text-gray-900 bg-gray-50 capitalize">
                          {feature.replace('_', ' ')}
                        </td>
                        {compareProducts.map((product, index) => {
                          const isBest = getBestValue(feature) === index;
                          return (
                            <td key={product.id} className={`p-4 text-center ${isBest ? 'bg-green-50' : ''}`}>
                              <div className="flex items-center justify-center gap-2">
                                {formatFeatureValue(product.features[feature])}
                                {isBest && typeof product.features[feature] === 'number' && (
                                  <Award className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Comparison Tips */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Comparison Tips</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Best Value Indicators</h3>
                <p className="text-gray-600 text-sm">Green highlights show the best values for numerical features like battery, storage, etc.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Different Features</h3>
                <p className="text-gray-600 text-sm">Yellow background highlights features where products differ significantly.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Warranty & Support</h3>
                <p className="text-gray-600 text-sm">Check warranty terms and seller reputation for peace of mind.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Shipping & Availability</h3>
                <p className="text-gray-600 text-sm">Consider delivery time and stock availability for your purchase timing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductComparison;