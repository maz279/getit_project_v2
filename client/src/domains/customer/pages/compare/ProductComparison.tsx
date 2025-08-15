// ProductComparison.tsx - Amazon.com/Shopee.sg-Level Product Comparison
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { X, Star, Check, Minus, Plus, ShoppingCart, Heart, Share2, Eye, Award, Shield, Truck, RotateCcw } from 'lucide-react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface ProductFeature {
  id: string;
  name: string;
  category: string;
  type: 'text' | 'boolean' | 'rating' | 'spec';
  importance: 'high' | 'medium' | 'low';
}

interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  discount?: number;
  inStock: boolean;
  features: Record<string, any>;
  specifications: Record<string, string>;
  badges: string[];
  availability: {
    shipping: string;
    returnPolicy: string;
    warranty: string;
  };
}

const ProductComparison: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allFeatures, setAllFeatures] = useState<ProductFeature[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useSEO({
    title: 'Product Comparison - Compare Features & Prices | GetIt Bangladesh',
    description: 'Compare products side by side. Find the best deals, features, and specifications. Make informed decisions with detailed comparisons.',
    keywords: 'product comparison, compare products, product features, price comparison, product specs, best deals'
  });

  useEffect(() => {
    // Get products from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const productIds = urlParams.get('products')?.split(',') || [];

    // MOCK DATA REMOVED - Use authentic database only
    const authenticProducts: Product[] = [];

    // TODO: Replace with actual API call to get products for comparison
    const mockFeatures: ProductFeature[] = [
          camera: '200MP',
          battery: '5000mAh',
          processor: 'Snapdragon 8 Gen 3',
          waterResistant: true,
          wirelessCharging: true,
          fiveG: true,
          expandableStorage: false,
          fingerprint: true,
          faceUnlock: true
        },
        specifications: {
          'Display': '6.8" Dynamic AMOLED 2X',
          'Resolution': '3120 x 1440 pixels',
          'Operating System': 'Android 14',
          'Chipset': 'Snapdragon 8 Gen 3',
          'GPU': 'Adreno 750',
          'Dimensions': '162.3 x 79 x 8.6 mm',
          'Weight': '232g',
          'Colors': 'Titanium Black, Titanium Gray'
        },
        badges: ['Editor\'s Choice', 'Best Camera'],
        availability: {
          shipping: 'Free shipping within 24 hours',
          returnPolicy: '7 days return policy',
          warranty: '1 year manufacturer warranty'
        }
      },
      {
        id: '2',
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        image: '/products/iphone-15-pro-max.jpg',
        price: 155000,
        originalPrice: 165000,
        rating: 4.9,
        reviews: 890,
        discount: 6,
        inStock: true,
        features: {
          screenSize: '6.7"',
          storage: '256GB',
          ram: '8GB',
          camera: '48MP',
          battery: '4441mAh',
          processor: 'A17 Pro',
          waterResistant: true,
          wirelessCharging: true,
          fiveG: true,
          expandableStorage: false,
          fingerprint: false,
          faceUnlock: true
        },
        specifications: {
          'Display': '6.7" Super Retina XDR OLED',
          'Resolution': '2796 x 1290 pixels',
          'Operating System': 'iOS 17',
          'Chipset': 'A17 Pro',
          'GPU': '6-core GPU',
          'Dimensions': '159.9 x 76.7 x 8.25 mm',
          'Weight': '221g',
          'Colors': 'Natural Titanium, Blue Titanium'
        },
        badges: ['Premium Quality', 'Most Popular'],
        availability: {
          shipping: 'Express delivery in 12 hours',
          returnPolicy: '14 days return policy',
          warranty: '1 year Apple warranty'
        }
      },
      {
        id: '3',
        name: 'OnePlus 12',
        brand: 'OnePlus',
        image: '/products/oneplus-12.jpg',
        price: 85000,
        originalPrice: 95000,
        rating: 4.6,
        reviews: 650,
        discount: 11,
        inStock: true,
        features: {
          screenSize: '6.82"',
          storage: '256GB',
          ram: '12GB',
          camera: '50MP',
          battery: '5400mAh',
          processor: 'Snapdragon 8 Gen 3',
          waterResistant: false,
          wirelessCharging: true,
          fiveG: true,
          expandableStorage: false,
          fingerprint: true,
          faceUnlock: true
        },
        specifications: {
          'Display': '6.82" LTPO OLED',
          'Resolution': '3168 x 1440 pixels',
          'Operating System': 'OxygenOS 14',
          'Chipset': 'Snapdragon 8 Gen 3',
          'GPU': 'Adreno 750',
          'Dimensions': '164.3 x 75.8 x 9.15 mm',
          'Weight': '220g',
          'Colors': 'Silky Black, Flowy Emerald'
        },
        badges: ['Best Value', 'Fast Charging'],
        availability: {
          shipping: 'Standard delivery 2-3 days',
          returnPolicy: '7 days return policy',
          warranty: '1 year OnePlus warranty'
        }
      }
    ];

    const mockFeatures: ProductFeature[] = [
      { id: 'screenSize', name: 'Screen Size', category: 'Display', type: 'text', importance: 'high' },
      { id: 'storage', name: 'Storage', category: 'Performance', type: 'text', importance: 'high' },
      { id: 'ram', name: 'RAM', category: 'Performance', type: 'text', importance: 'high' },
      { id: 'camera', name: 'Main Camera', category: 'Camera', type: 'text', importance: 'high' },
      { id: 'battery', name: 'Battery', category: 'Battery', type: 'text', importance: 'high' },
      { id: 'processor', name: 'Processor', category: 'Performance', type: 'text', importance: 'high' },
      { id: 'waterResistant', name: 'Water Resistant', category: 'Features', type: 'boolean', importance: 'medium' },
      { id: 'wirelessCharging', name: 'Wireless Charging', category: 'Features', type: 'boolean', importance: 'medium' },
      { id: 'fiveG', name: '5G Support', category: 'Connectivity', type: 'boolean', importance: 'medium' },
      { id: 'expandableStorage', name: 'Expandable Storage', category: 'Features', type: 'boolean', importance: 'low' },
      { id: 'fingerprint', name: 'Fingerprint Scanner', category: 'Security', type: 'boolean', importance: 'medium' },
      { id: 'faceUnlock', name: 'Face Unlock', category: 'Security', type: 'boolean', importance: 'medium' }
    ];

    setProducts(mockProducts);
    setAllFeatures(mockFeatures);
    setLoading(false);
  }, []);

  const handleRemoveProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const categories = ['all', 'Display', 'Performance', 'Camera', 'Battery', 'Features', 'Connectivity', 'Security'];

  const filteredFeatures = selectedCategory === 'all' 
    ? allFeatures 
    : allFeatures.filter(feature => feature.category === selectedCategory);

  const renderFeatureValue = (product: Product, feature: ProductFeature) => {
    const value = product.features[feature.id];
    
    if (feature.type === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-600 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-red-500 mx-auto" />
      );
    }
    
    return <span className="text-sm font-medium">{value || '—'}</span>;
  };

  const getBestValue = (feature: ProductFeature) => {
    if (feature.type === 'boolean') {
      return products.filter(p => p.features[feature.id]).length > 0;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading comparison...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Products to Compare</h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Add products to your comparison list to see them side by side. You can compare features, specifications, and prices.
            </p>
            <Link href="/products">
              <button className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all">
                Browse Products
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header */}
      <section className="bg-white shadow-sm py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Comparison</h1>
              <p className="text-gray-600">Compare {products.length} products to find the perfect match</p>
            </div>
            <button
              onClick={() => setLocation('/products')}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add More Products
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Cards */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-64 p-6 text-left border-r border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Products</span>
                  </th>
                  {products.map(product => (
                    <th key={product.id} className="p-6 border-r border-gray-200 last:border-r-0 min-w-72">
                      <div className="text-center">
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        
                        <div className="relative mb-4">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-32 h-32 object-cover rounded-lg mx-auto"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `/api/placeholder/128/128?text=${product.name}`;
                            }}
                          />
                          {product.badges.length > 0 && (
                            <div className="absolute -top-2 -right-2">
                              <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                {product.badges[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{product.brand}</p>
                        
                        <div className="flex items-center justify-center gap-1 mb-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{product.rating}</span>
                          <span className="text-sm text-gray-500">({product.reviews})</span>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            ৳{product.price.toLocaleString()}
                          </div>
                          {product.originalPrice && (
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm text-gray-500 line-through">
                                ৳{product.originalPrice.toLocaleString()}
                              </span>
                              {product.discount && (
                                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                                  -{product.discount}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <button 
                            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                              product.inStock
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!product.inStock}
                          >
                            <ShoppingCart className="h-4 w-4 inline mr-2" />
                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                          
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                              <Heart className="h-4 w-4 inline mr-1" />
                              Wishlist
                            </button>
                            <button className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                              <Share2 className="h-4 w-4 inline mr-1" />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Feature Comparison</h2>
              <div className="flex gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              {filteredFeatures.map(feature => (
                <tr key={feature.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="w-64 p-4 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{feature.name}</span>
                      {feature.importance === 'high' && (
                        <span className="w-2 h-2 bg-red-500 rounded-full" title="High importance"></span>
                      )}
                      {feature.importance === 'medium' && (
                        <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Medium importance"></span>
                      )}
                      {feature.importance === 'low' && (
                        <span className="w-2 h-2 bg-green-500 rounded-full" title="Low importance"></span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{feature.category}</div>
                  </td>
                  {products.map(product => (
                    <td key={product.id} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                      {renderFeatureValue(product, feature)}
                    </td>
                  ))}
                </tr>
              ))}
            </table>
          </div>
        </div>

        {/* Detailed Specifications */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Detailed Specifications</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              {Object.keys(products[0]?.specifications || {}).map(specKey => (
                <tr key={specKey} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="w-64 p-4 border-r border-gray-200">
                    <span className="font-medium text-gray-900">{specKey}</span>
                  </td>
                  {products.map(product => (
                    <td key={product.id} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                      <span className="text-sm">{product.specifications[specKey] || '—'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </table>
          </div>
        </div>

        {/* Availability & Policies */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Availability & Policies</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <tr className="border-b border-gray-100">
                <td className="w-64 p-4 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-900">Shipping</span>
                  </div>
                </td>
                {products.map(product => (
                  <td key={product.id} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                    <span className="text-sm">{product.availability.shipping}</span>
                  </td>
                ))}
              </tr>
              
              <tr className="border-b border-gray-100">
                <td className="w-64 p-4 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-900">Return Policy</span>
                  </div>
                </td>
                {products.map(product => (
                  <td key={product.id} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                    <span className="text-sm">{product.availability.returnPolicy}</span>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="w-64 p-4 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-gray-900">Warranty</span>
                  </div>
                </td>
                {products.map(product => (
                  <td key={product.id} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                    <span className="text-sm">{product.availability.warranty}</span>
                  </td>
                ))}
              </tr>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductComparison;