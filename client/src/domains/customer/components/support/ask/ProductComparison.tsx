/**
 * Phase 3: Ask Stage - Product Comparison
 * Amazon.com 5 A's Framework Implementation
 * Side-by-Side Product Comparison Tool
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Plus, 
  X, 
  Star, 
  CheckCircle, 
  XCircle, 
  ArrowUpDown,
  Search,
  Heart,
  ShoppingCart,
  Award,
  Zap,
  Shield,
  Truck,
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductComparisonProps {
  className?: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  specifications: Record<string, string>;
  features: string[];
  pros: string[];
  cons: string[];
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
  warranty: string;
  shipping: string;
  badges: string[];
}

interface ComparisonData {
  products: Product[];
  recommendations: string[];
  bestValues: Record<string, string>;
  comparisonInsights: ComparisonInsight[];
}

interface ComparisonInsight {
  id: string;
  type: 'price' | 'features' | 'rating' | 'value';
  title: string;
  description: string;
  winner: string;
  confidence: number;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({ className }) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'pros-cons'>('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load available products for comparison
    const loadProducts = () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Premium Wireless Gaming Headset',
          brand: 'TechPro',
          price: 12500,
          originalPrice: 18000,
          discount: 31,
          rating: 4.8,
          reviewCount: 3247,
          image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=300',
          category: 'Gaming Headsets',
          specifications: {
            'Driver Size': '50mm',
            'Frequency Response': '20Hz - 40kHz',
            'Battery Life': '50+ hours',
            'Connectivity': 'Bluetooth 5.2, USB-C',
            'Weight': '320g',
            'Noise Cancellation': 'Active (35dB)',
            'Microphone': 'Detachable boom mic',
            'RGB Lighting': 'Yes, 16.7M colors'
          },
          features: [
            '7.1 Surround Sound',
            'Active Noise Cancellation',
            'RGB Lighting',
            '50+ Hour Battery',
            'Fast Charging',
            'Cross-Platform Compatible'
          ],
          pros: [
            'Excellent sound quality',
            'Long battery life',
            'Comfortable for extended use',
            'Great microphone quality',
            'Stylish RGB lighting'
          ],
          cons: [
            'Slightly heavy',
            'Expensive',
            'RGB may drain battery faster'
          ],
          availability: 'in-stock',
          warranty: '2 years',
          shipping: 'Free Express Shipping',
          badges: ['Best Seller', 'Premium Quality']
        },
        {
          id: '2',
          name: 'Budget Gaming Headphones',
          brand: 'ValueGamer',
          price: 4500,
          originalPrice: 6000,
          discount: 25,
          rating: 4.3,
          reviewCount: 1856,
          image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300',
          category: 'Gaming Headsets',
          specifications: {
            'Driver Size': '40mm',
            'Frequency Response': '20Hz - 20kHz',
            'Battery Life': '20 hours',
            'Connectivity': 'Bluetooth 5.0, 3.5mm',
            'Weight': '250g',
            'Noise Cancellation': 'Passive',
            'Microphone': 'Built-in',
            'RGB Lighting': 'No'
          },
          features: [
            'Stereo Sound',
            'Lightweight Design',
            'Foldable',
            '20-Hour Battery',
            'Multi-Platform Support'
          ],
          pros: [
            'Affordable price',
            'Lightweight and comfortable',
            'Good value for money',
            'Decent sound quality',
            'Portable design'
          ],
          cons: [
            'No active noise cancellation',
            'Average microphone quality',
            'No RGB lighting',
            'Limited bass response'
          ],
          availability: 'in-stock',
          warranty: '1 year',
          shipping: 'Standard Shipping',
          badges: ['Best Value', 'Popular Choice']
        },
        {
          id: '3',
          name: 'Professional Studio Headphones',
          brand: 'AudioMaster',
          price: 22000,
          originalPrice: 28000,
          discount: 21,
          rating: 4.9,
          reviewCount: 892,
          image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300',
          category: 'Professional Audio',
          specifications: {
            'Driver Size': '53mm',
            'Frequency Response': '5Hz - 50kHz',
            'Battery Life': 'N/A (Wired only)',
            'Connectivity': '3.5mm, 6.35mm, XLR',
            'Weight': '380g',
            'Noise Cancellation': 'Excellent passive isolation',
            'Microphone': 'Optional attachment',
            'RGB Lighting': 'No'
          },
          features: [
            'Studio-Grade Sound',
            'Planar Magnetic Drivers',
            'Premium Materials',
            'Detachable Cables',
            'Professional Monitoring'
          ],
          pros: [
            'Exceptional sound accuracy',
            'Premium build quality',
            'Professional grade',
            'Excellent for music production',
            'Durable construction'
          ],
          cons: [
            'Very expensive',
            'Requires amplifier for best performance',
            'Wired only',
            'Heavy weight',
            'Not for casual gaming'
          ],
          availability: 'low-stock',
          warranty: '3 years',
          shipping: 'Premium Shipping',
          badges: ['Professional Grade', 'Limited Edition']
        }
      ];

      setAvailableProducts(mockProducts);
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProducts.length >= 2) {
      generateComparison();
    }
  }, [selectedProducts]);

  const generateComparison = () => {
    setLoading(true);
    
    // Generate comparison insights
    const insights: ComparisonInsight[] = [
      {
        id: 'price',
        type: 'price',
        title: 'Best Price Value',
        description: 'Offers the best balance of features and price',
        winner: selectedProducts.reduce((min, product) => 
          product.price < min.price ? product : min
        ).id,
        confidence: 95
      },
      {
        id: 'features',
        type: 'features',
        title: 'Most Features',
        description: 'Has the most comprehensive feature set',
        winner: selectedProducts.reduce((max, product) => 
          product.features.length > max.features.length ? product : max
        ).id,
        confidence: 88
      },
      {
        id: 'rating',
        type: 'rating',
        title: 'Highest Rated',
        description: 'Best customer satisfaction and reviews',
        winner: selectedProducts.reduce((max, product) => 
          product.rating > max.rating ? product : max
        ).id,
        confidence: 92
      }
    ];

    const mockData: ComparisonData = {
      products: selectedProducts,
      recommendations: [
        'For gaming: Choose the Premium Wireless Gaming Headset',
        'For budget-conscious buyers: ValueGamer headphones offer great value',
        'For professionals: AudioMaster provides studio-grade quality'
      ],
      bestValues: {
        'Best Overall': selectedProducts[0]?.id || '',
        'Best Budget': selectedProducts.reduce((min, product) => 
          product.price < min.price ? product : min
        ).id,
        'Best Premium': selectedProducts.reduce((max, product) => 
          product.price > max.price ? product : max
        ).id
      },
      comparisonInsights: insights
    };

    setTimeout(() => {
      setComparisonData(mockData);
      setLoading(false);
    }, 1000);
  };

  const addProduct = (product: Product) => {
    if (selectedProducts.length < 4 && !selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedProducts.find(p => p.id === product.id)
  );

  const ComparisonRow = ({ label, getValue }: { 
    label: string; 
    getValue: (product: Product) => React.ReactNode 
  }) => (
    <tr className="border-b">
      <td className="p-3 font-medium bg-muted/50">{label}</td>
      {selectedProducts.map((product) => (
        <td key={product.id} className="p-3 text-center">
          {getValue(product)}
        </td>
      ))}
    </tr>
  );

  const getSpecValue = (product: Product, spec: string) => {
    return product.specifications[spec] || 'N/A';
  };

  return (
    <div className={cn('max-w-7xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-green-500" />
          Smart Product Comparison
        </h1>
        <p className="text-muted-foreground">
          Compare products side-by-side to make informed decisions
        </p>
      </div>

      {/* Product Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Select Products to Compare ({selectedProducts.length}/4)</span>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedProducts.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Selected Products:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedProducts.map((product) => (
                  <Card key={product.id} className="relative">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                      onClick={() => removeProduct(product.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <CardContent className="p-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <h4 className="font-semibold text-sm line-clamp-2">{product.name}</h4>
                      <p className="text-sm text-primary font-bold">
                        ৳{product.price.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Available Products:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.slice(0, 6).map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-primary">
                          ৳{product.price.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs">{product.rating}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => addProduct(product)}
                        disabled={selectedProducts.length >= 4}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Add to Compare
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedProducts.length >= 2 && comparisonData && (
        <div className="space-y-6">
          {/* Comparison Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI Comparison Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {comparisonData.comparisonInsights.map((insight) => {
                  const winner = selectedProducts.find(p => p.id === insight.winner);
                  return (
                    <div key={insight.id} className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">{insight.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600">
                          {winner?.brand} {winner?.name.split(' ').slice(0, 2).join(' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Specifications</TabsTrigger>
                  <TabsTrigger value="pros-cons">Pros & Cons</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left w-48">Feature</th>
                      {selectedProducts.map((product) => (
                        <th key={product.id} className="p-3 text-center min-w-48">
                          <div>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded mx-auto mb-2"
                            />
                            <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <Tabs value={activeView}>
                      <TabsContent value="overview">
                        <ComparisonRow 
                          label="Price" 
                          getValue={(product) => (
                            <div>
                              <div className="font-bold text-primary">
                                ৳{product.price.toLocaleString()}
                              </div>
                              {product.originalPrice && (
                                <div className="text-xs text-muted-foreground line-through">
                                  ৳{product.originalPrice.toLocaleString()}
                                </div>
                              )}
                            </div>
                          )}
                        />
                        <ComparisonRow 
                          label="Rating" 
                          getValue={(product) => (
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span>{product.rating}</span>
                              <span className="text-xs text-muted-foreground">
                                ({product.reviewCount})
                              </span>
                            </div>
                          )}
                        />
                        <ComparisonRow 
                          label="Availability" 
                          getValue={(product) => (
                            <Badge variant={
                              product.availability === 'in-stock' ? 'default' :
                              product.availability === 'low-stock' ? 'secondary' : 'destructive'
                            }>
                              {product.availability.replace('-', ' ')}
                            </Badge>
                          )}
                        />
                        <ComparisonRow 
                          label="Warranty" 
                          getValue={(product) => product.warranty}
                        />
                        <ComparisonRow 
                          label="Shipping" 
                          getValue={(product) => product.shipping}
                        />
                      </TabsContent>

                      <TabsContent value="detailed">
                        <ComparisonRow 
                          label="Driver Size" 
                          getValue={(product) => getSpecValue(product, 'Driver Size')}
                        />
                        <ComparisonRow 
                          label="Frequency Response" 
                          getValue={(product) => getSpecValue(product, 'Frequency Response')}
                        />
                        <ComparisonRow 
                          label="Battery Life" 
                          getValue={(product) => getSpecValue(product, 'Battery Life')}
                        />
                        <ComparisonRow 
                          label="Connectivity" 
                          getValue={(product) => getSpecValue(product, 'Connectivity')}
                        />
                        <ComparisonRow 
                          label="Weight" 
                          getValue={(product) => getSpecValue(product, 'Weight')}
                        />
                        <ComparisonRow 
                          label="Noise Cancellation" 
                          getValue={(product) => getSpecValue(product, 'Noise Cancellation')}
                        />
                        <ComparisonRow 
                          label="RGB Lighting" 
                          getValue={(product) => getSpecValue(product, 'RGB Lighting')}
                        />
                      </TabsContent>

                      <TabsContent value="pros-cons">
                        <ComparisonRow 
                          label="Pros" 
                          getValue={(product) => (
                            <ul className="space-y-1 text-left">
                              {product.pros.slice(0, 3).map((pro, index) => (
                                <li key={index} className="flex items-start gap-1 text-sm">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          )}
                        />
                        <ComparisonRow 
                          label="Cons" 
                          getValue={(product) => (
                            <ul className="space-y-1 text-left">
                              {product.cons.slice(0, 3).map((con, index) => (
                                <li key={index} className="flex items-start gap-1 text-sm">
                                  <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {selectedProducts.map((product) => (
              <Button key={product.id} className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Buy {product.brand}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedProducts.length < 2 && (
        <Card className="text-center py-12">
          <CardContent>
            <ArrowUpDown className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Start Comparing Products</h3>
            <p className="text-muted-foreground">
              Select at least 2 products from the list above to see a detailed comparison
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductComparison;