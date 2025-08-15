import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  ShoppingCart, 
  Star, 
  TrendingUp, 
  Users, 
  Heart, 
  Plus,
  Eye,
  Package,
  Gift,
  Zap,
  Target,
  Clock
} from 'lucide-react';

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  reason: string;
  confidence: number;
  inStock: boolean;
  fastDelivery: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface CartRecommendationsProps {
  cartItems?: CartItem[];
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
}

export const CartRecommendations: React.FC<CartRecommendationsProps> = ({
  cartItems = [],
  onAddToCart,
  onAddToWishlist
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock recommendations based on cart items - in real app, this would come from ML API
  const recommendations: RecommendedProduct[] = [
    {
      id: '1',
      name: 'Wireless Phone Charger',
      price: 1200,
      originalPrice: 1500,
      image: '/api/placeholder/200/200',
      rating: 4.6,
      reviews: 342,
      category: 'Electronics',
      reason: 'Frequently bought together with smartphones',
      confidence: 89,
      inStock: true,
      fastDelivery: true
    },
    {
      id: '2',
      name: 'Phone Protection Case',
      price: 450,
      originalPrice: 650,
      image: '/api/placeholder/200/200',
      rating: 4.4,
      reviews: 567,
      category: 'Electronics',
      reason: 'Essential protection for your device',
      confidence: 94,
      inStock: true,
      fastDelivery: true
    },
    {
      id: '3',
      name: 'Bluetooth Earbuds',
      price: 1800,
      originalPrice: 2200,
      image: '/api/placeholder/200/200',
      rating: 4.7,
      reviews: 234,
      category: 'Electronics',
      reason: 'Perfect companion for your smartphone',
      confidence: 87,
      inStock: true,
      fastDelivery: false
    },
    {
      id: '4',
      name: 'Portable Power Bank',
      price: 980,
      originalPrice: 1200,
      image: '/api/placeholder/200/200',
      rating: 4.5,
      reviews: 456,
      category: 'Electronics',
      reason: 'Never run out of battery',
      confidence: 82,
      inStock: true,
      fastDelivery: true
    },
    {
      id: '5',
      name: 'Screen Protector',
      price: 280,
      originalPrice: 400,
      image: '/api/placeholder/200/200',
      rating: 4.3,
      reviews: 789,
      category: 'Electronics',
      reason: 'Essential screen protection',
      confidence: 91,
      inStock: true,
      fastDelivery: true
    },
    {
      id: '6',
      name: 'Car Phone Mount',
      price: 650,
      originalPrice: 850,
      image: '/api/placeholder/200/200',
      rating: 4.2,
      reviews: 123,
      category: 'Electronics',
      reason: 'Safe driving with hands-free access',
      confidence: 76,
      inStock: false,
      fastDelivery: false
    }
  ];

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const getDiscountPercentage = (price: number, originalPrice: number) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const getReasonIcon = (reason: string) => {
    if (reason.includes('together')) return <Users className="w-4 h-4" />;
    if (reason.includes('Essential')) return <Target className="w-4 h-4" />;
    if (reason.includes('Perfect')) return <Star className="w-4 h-4" />;
    if (reason.includes('Never')) return <Zap className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const handleAddToCart = (productId: string) => {
    if (onAddToCart) {
      onAddToCart(productId);
    }
  };

  const handleAddToWishlist = (productId: string) => {
    if (onAddToWishlist) {
      onAddToWishlist(productId);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSavings = recommendations.reduce((sum, item) => {
    return sum + (item.originalPrice ? item.originalPrice - item.price : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
            Recommended for You
          </CardTitle>
          <CardDescription>
            Smart recommendations based on your cart items and shopping history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800">Smart Suggestions</p>
                <p className="text-sm text-blue-600">AI-powered recommendations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Gift className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Save {formatCurrency(totalSavings)}</p>
                <p className="text-sm text-green-600">With these recommendations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-800">Popular Combo</p>
                <p className="text-sm text-purple-600">Frequently bought together</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="relative">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute top-2 right-2 space-y-1">
                  {product.fastDelivery && (
                    <Badge className="bg-orange-100 text-orange-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Fast
                    </Badge>
                  )}
                  {product.originalPrice && (
                    <Badge className="bg-red-100 text-red-800">
                      {getDiscountPercentage(product.price, product.originalPrice)}% OFF
                    </Badge>
                  )}
                </div>
              </div>
              
              <h3 className="font-semibold text-sm mb-2">{product.name}</h3>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg font-bold text-green-600">{formatCurrency(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm">{product.rating}</span>
                  <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                {getReasonIcon(product.reason)}
                <span className="text-xs text-gray-600">{product.reason}</span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-600">Confidence:</span>
                  <span className={`text-xs font-medium ${getConfidenceColor(product.confidence)}`}>
                    {product.confidence}%
                  </span>
                </div>
                <Badge variant={product.inStock ? 'secondary' : 'destructive'}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  size="sm"
                  disabled={!product.inStock}
                  onClick={() => handleAddToCart(product.id)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAddToWishlist(product.id)}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bundle Offers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="w-5 h-5 mr-2 text-purple-600" />
            Bundle Deals
          </CardTitle>
          <CardDescription>
            Save more when you buy these items together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Phone Essentials Bundle</h4>
                  <p className="text-sm text-gray-600">Phone Case + Screen Protector + Charger</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg font-bold text-green-600">{formatCurrency(1800)}</span>
                    <span className="text-sm text-gray-500 line-through">{formatCurrency(2350)}</span>
                    <Badge className="bg-green-100 text-green-800">Save {formatCurrency(550)}</Badge>
                  </div>
                </div>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Bundle
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Power & Audio Bundle</h4>
                  <p className="text-sm text-gray-600">Power Bank + Bluetooth Earbuds</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg font-bold text-green-600">{formatCurrency(2500)}</span>
                    <span className="text-sm text-gray-500 line-through">{formatCurrency(3400)}</span>
                    <Badge className="bg-green-100 text-green-800">Save {formatCurrency(900)}</Badge>
                  </div>
                </div>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Bundle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shopping Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            Shopping Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h4 className="font-semibold text-indigo-800">Popular This Week</h4>
              </div>
              <p className="text-sm text-indigo-600">
                85% of customers who bought similar items also purchased phone accessories
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Gift className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Potential Savings</h4>
              </div>
              <p className="text-sm text-green-600">
                Add 2 more items to get free shipping and save {formatCurrency(120)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};