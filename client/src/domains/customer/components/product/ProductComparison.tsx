/**
 * Product Comparison Component
 * Advanced product comparison with feature analysis
 * Implements Amazon.com/Shopee.sg-level comparison experience
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { 
  Plus, 
  X, 
  Star, 
  Check, 
  ShoppingCart,
  Heart,
  Share2,
  Search,
  Filter,
  BarChart3,
  Zap
} from 'lucide-react';

interface ComparisonProduct {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  rating: number;
  reviews: number;
  features: ComparisonFeature[];
  pros: string[];
  cons: string[];
  specifications: { [key: string]: string };
  availability: 'in_stock' | 'out_of_stock' | 'limited';
}

interface ComparisonFeature {
  name: string;
  bengaliName?: string;
  value: string | number | boolean;
  category: string;
  important: boolean;
}

interface ProductComparisonProps {
  initialProducts?: ComparisonProduct[];
  className?: string;
  language?: 'en' | 'bn';
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({
  initialProducts = [],
  className = '',
  language = 'en'
}) => {
  const [products, setProducts] = useState<ComparisonProduct[]>(initialProducts.slice(0, 3));
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  const sampleProducts: ComparisonProduct[] = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max',
      bengaliTitle: 'আইফোন ১৫ প্রো ম্যাক্স',
      price: 145000,
      originalPrice: 155000,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
      brand: 'Apple',
      rating: 4.8,
      reviews: 2847,
      availability: 'in_stock',
      features: [
        { name: 'Display Size', bengaliName: 'ডিসপ্লে সাইজ', value: '6.7"', category: 'Display', important: true },
        { name: 'Storage', bengaliName: 'স্টোরেজ', value: '256GB', category: 'Performance', important: true },
        { name: 'Camera', bengaliName: 'ক্যামেরা', value: '48MP', category: 'Camera', important: true },
        { name: 'Battery', bengaliName: 'ব্যাটারি', value: '4422mAh', category: 'Battery', important: true },
        { name: 'Processor', bengaliName: 'প্রসেসর', value: 'A17 Pro', category: 'Performance', important: true },
        { name: '5G Support', bengaliName: '৫জি সাপোর্ট', value: true, category: 'Connectivity', important: false },
        { name: 'Wireless Charging', bengaliName: 'ওয়্যারলেস চার্জিং', value: true, category: 'Charging', important: false }
      ],
      pros: ['Premium build quality', 'Excellent camera', 'Fast performance', 'Long software support'],
      cons: ['Expensive', 'Heavy weight', 'No USB-C'],
      specifications: {
        'Operating System': 'iOS 17',
        'RAM': '8GB',
        'Weight': '221g',
        'Dimensions': '159.9 x 76.7 x 8.25 mm',
        'Water Resistance': 'IP68'
      }
    },
    {
      id: '2',
      title: 'Samsung Galaxy S24 Ultra',
      bengaliTitle: 'স্যামসাং গ্যালাক্সি S24 আল্ট্রা',
      price: 135000,
      originalPrice: 145000,
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300',
      brand: 'Samsung',
      rating: 4.7,
      reviews: 1923,
      availability: 'in_stock',
      features: [
        { name: 'Display Size', bengaliName: 'ডিসপ্লে সাইজ', value: '6.8"', category: 'Display', important: true },
        { name: 'Storage', bengaliName: 'স্টোরেজ', value: '256GB', category: 'Performance', important: true },
        { name: 'Camera', bengaliName: 'ক্যামেরা', value: '200MP', category: 'Camera', important: true },
        { name: 'Battery', bengaliName: 'ব্যাটারি', value: '5000mAh', category: 'Battery', important: true },
        { name: 'Processor', bengaliName: 'প্রসেসর', value: 'Snapdragon 8 Gen 3', category: 'Performance', important: true },
        { name: '5G Support', bengaliName: '৫জি সাপোর্ট', value: true, category: 'Connectivity', important: false },
        { name: 'Wireless Charging', bengaliName: 'ওয়্যারলেস চার্জিং', value: true, category: 'Charging', important: false }
      ],
      pros: ['Large display', 'S Pen included', 'Versatile camera system', 'Good battery life'],
      cons: ['Expensive', 'Bulky size', 'Complex UI'],
      specifications: {
        'Operating System': 'Android 14',
        'RAM': '12GB',
        'Weight': '232g',
        'Dimensions': '162.3 x 79.0 x 8.6 mm',
        'Water Resistance': 'IP68'
      }
    },
    {
      id: '3',
      title: 'Google Pixel 8 Pro',
      bengaliTitle: 'গুগল পিক্সেল ৮ প্রো',
      price: 95000,
      originalPrice: 105000,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
      brand: 'Google',
      rating: 4.6,
      reviews: 1456,
      availability: 'limited',
      features: [
        { name: 'Display Size', bengaliName: 'ডিসপ্লে সাইজ', value: '6.7"', category: 'Display', important: true },
        { name: 'Storage', bengaliName: 'স্টোরেজ', value: '128GB', category: 'Performance', important: true },
        { name: 'Camera', bengaliName: 'ক্যামেরা', value: '50MP', category: 'Camera', important: true },
        { name: 'Battery', bengaliName: 'ব্যাটারি', value: '5050mAh', category: 'Battery', important: true },
        { name: 'Processor', bengaliName: 'প্রসেসর', value: 'Google Tensor G3', category: 'Performance', important: true },
        { name: '5G Support', bengaliName: '৫জি সাপোর্ট', value: true, category: 'Connectivity', important: false },
        { name: 'Wireless Charging', bengaliName: 'ওয়্যারলেস চার্জিং', value: true, category: 'Charging', important: false }
      ],
      pros: ['Clean Android experience', 'Excellent AI features', 'Great camera software', 'Regular updates'],
      cons: ['Limited availability', 'Average performance', 'Smaller storage'],
      specifications: {
        'Operating System': 'Android 14',
        'RAM': '12GB',
        'Weight': '213g',
        'Dimensions': '162.6 x 76.5 x 8.8 mm',
        'Water Resistance': 'IP68'
      }
    }
  ];

  const availableProducts = sampleProducts.filter(p => 
    !products.some(cp => cp.id === p.id) &&
    (searchQuery === '' || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addProduct = (product: ComparisonProduct) => {
    if (products.length < 4) {
      setProducts([...products, product]);
    }
  };

  const removeProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const getAllFeatures = () => {
    const featureMap = new Map<string, ComparisonFeature>();
    
    products.forEach(product => {
      product.features.forEach(feature => {
        if (!featureMap.has(feature.name)) {
          featureMap.set(feature.name, feature);
        }
      });
    });
    
    return Array.from(featureMap.values()).sort((a, b) => {
      if (a.important && !b.important) return -1;
      if (!a.important && b.important) return 1;
      return a.category.localeCompare(b.category);
    });
  };

  const getFeatureValue = (product: ComparisonProduct, featureName: string) => {
    const feature = product.features.find(f => f.name === featureName);
    return feature ? feature.value : '-';
  };

  const shouldShowFeature = (featureName: string) => {
    if (!showOnlyDifferences) return true;
    
    const values = products.map(p => getFeatureValue(p, featureName));
    return new Set(values).size > 1;
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock': return 'bg-green-600 text-white';
      case 'limited': return 'bg-orange-600 text-white';
      case 'out_of_stock': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getAvailabilityText = (availability: string) => {
    if (language === 'bn') {
      switch (availability) {
        case 'in_stock': return 'স্টকে আছে';
        case 'limited': return 'সীমিত স্টক';
        case 'out_of_stock': return 'স্টকে নেই';
        default: return 'অজানা';
      }
    }
    switch (availability) {
      case 'in_stock': return 'In Stock';
      case 'limited': return 'Limited Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  if (products.length === 0) {
    return (
      <div className={`product-comparison ${className}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">
              {language === 'bn' ? 'পণ্য তুলনা করুন' : 'Compare Products'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'bn' 
                ? 'তুলনা করার জন্য পণ্য যোগ করুন'
                : 'Add products to start comparing'}
            </p>
            <div className="max-w-md mx-auto">
              <Input
                placeholder={language === 'bn' ? 'পণ্য খুঁজুন...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              <div className="grid gap-2">
                {availableProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <h4 className="font-medium">
                          {language === 'bn' && product.bengaliTitle ? product.bengaliTitle : product.title}
                        </h4>
                        <p className="text-sm text-gray-600">৳{product.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addProduct(product)}>
                      <Plus className="w-4 h-4 mr-1" />
                      {language === 'bn' ? 'যোগ করুন' : 'Add'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allFeatures = getAllFeatures();

  return (
    <div className={`product-comparison ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'bn' ? 'পণ্য তুলনা' : 'Product Comparison'}
                </h1>
                <p className="text-gray-600">
                  {products.length} {language === 'bn' ? 'টি পণ্য তুলনা করা হচ্ছে' : 'products being compared'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={showOnlyDifferences ? 'default' : 'outline'}
                onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {language === 'bn' ? 'শুধু পার্থক্য' : 'Differences Only'}
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                {language === 'bn' ? 'শেয়ার করুন' : 'Share'}
              </Button>
            </div>
          </div>

          {/* Add Product Search */}
          {products.length < 4 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-blue-600" />
                <Input
                  placeholder={language === 'bn' ? 'আরো পণ্য যোগ করুন...' : 'Add more products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              {searchQuery && availableProducts.length > 0 && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <img src={product.image} alt={product.title} className="w-8 h-8 object-cover rounded" />
                        <div>
                          <h5 className="text-sm font-medium">
                            {language === 'bn' && product.bengaliTitle ? product.bengaliTitle : product.title}
                          </h5>
                          <p className="text-xs text-gray-600">৳{product.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => addProduct(product)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Product Headers */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
              <div className="font-semibold text-gray-600">
                {language === 'bn' ? 'পণ্য' : 'Products'}
              </div>
              {products.map((product) => (
                <Card key={product.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => removeProduct(product.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  <CardContent className="p-4">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {language === 'bn' && product.bengaliTitle ? product.bengaliTitle : product.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.rating}</span>
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

                    <Badge className={getAvailabilityColor(product.availability)}>
                      {getAvailabilityText(product.availability)}
                    </Badge>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1" disabled={product.availability === 'out_of_stock'}>
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        {language === 'bn' ? 'কার্ট' : 'Cart'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Heart className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'bn' ? 'ফিচার তুলনা' : 'Feature Comparison'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {allFeatures.filter(feature => shouldShowFeature(feature.name)).map((feature) => (
                    <div key={feature.name} className="grid gap-4 py-3 border-b border-gray-100 last:border-0" 
                         style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {language === 'bn' && feature.bengaliName ? feature.bengaliName : feature.name}
                        </span>
                        {feature.important && (
                          <Zap className="w-3 h-3 text-orange-500" />
                        )}
                      </div>
                      {products.map((product) => {
                        const value = getFeatureValue(product, feature.name);
                        return (
                          <div key={product.id} className="flex items-center">
                            {typeof value === 'boolean' ? (
                              value ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <X className="w-4 h-4 text-red-600" />
                              )
                            ) : (
                              <span className="text-sm">{value}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pros and Cons */}
            <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
              <div className="font-semibold text-gray-600">
                {language === 'bn' ? 'সুবিধা ও অসুবিধা' : 'Pros & Cons'}
              </div>
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-green-600 mb-2">
                          {language === 'bn' ? 'সুবিধা' : 'Pros'}
                        </h4>
                        <ul className="text-xs space-y-1">
                          {product.pros.map((pro, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-red-600 mb-2">
                          {language === 'bn' ? 'অসুবিধা' : 'Cons'}
                        </h4>
                        <ul className="text-xs space-y-1">
                          {product.cons.map((con, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <X className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {language === 'bn' ? 'তুলনার সারাংশ' : 'Comparison Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  {language === 'bn' ? 'সেরা মূল্য' : 'Best Value'}
                </h4>
                <p className="text-sm text-green-600">
                  {products.reduce((best, current) => 
                    current.price < best.price ? current : best
                  ).title}
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  {language === 'bn' ? 'সর্বোচ্চ রেটিং' : 'Highest Rated'}
                </h4>
                <p className="text-sm text-blue-600">
                  {products.reduce((best, current) => 
                    current.rating > best.rating ? current : best
                  ).title}
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">
                  {language === 'bn' ? 'প্রিমিয়াম অপশন' : 'Premium Option'}
                </h4>
                <p className="text-sm text-purple-600">
                  {products.reduce((best, current) => 
                    current.price > best.price ? current : best
                  ).title}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductComparison;