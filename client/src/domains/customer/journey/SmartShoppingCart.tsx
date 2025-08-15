/**
 * SmartShoppingCart - Amazon.com/Shopee.sg-Level Shopping Cart
 * Advanced cart with recommendations, save for later, bulk actions, and price tracking
 */

import React, { useState, useEffect } from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { ShoppingCart, Plus, Minus, X, Heart, Clock, Truck, Star, Gift, Shield, AlertCircle, CheckCircle, TrendingDown, TrendingUp, Package } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Progress } from '@/shared/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useSEO } from '@/shared/hooks/useSEO';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  maxQuantity: number;
  vendor: string;
  category: string;
  shipping: {
    free: boolean;
    cost: number;
    estimatedDays: number;
  };
  warranty: string;
  selected: boolean;
  priceHistory: {
    date: string;
    price: number;
  }[];
  discount?: number;
  badges: string[];
  inStock: boolean;
  lastPriceChange?: {
    type: 'increase' | 'decrease';
    amount: number;
    date: string;
  };
}

interface SavedItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendor: string;
  savedDate: string;
  priceAlert: boolean;
  targetPrice?: number;
}

interface RecommendedItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  vendor: string;
  reason: string;
  discount?: number;
}

export const SmartShoppingCart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<RecommendedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discount: number} | null>(null);
  const [showPriceAlerts, setShowPriceAlerts] = useState(false);
  const [activeTab, setActiveTab] = useState<'cart' | 'saved'>('cart');

  // SEO optimization
  useSEO({
    title: 'Shopping Cart - Review Your Items | GetIt Bangladesh',
    description: 'Review and manage your shopping cart items. Get recommendations, track prices, and enjoy free shipping on orders over ৳1000.',
    keywords: 'shopping cart, online shopping, bangladesh, cart management, price tracking, recommendations'
  });

  // Mock cart data
  const mockCartItems: CartItem[] = [
    {
      id: '1',
      name: 'Samsung Galaxy S24 Ultra 256GB',
      price: 135000,
      originalPrice: 150000,
      image: '/api/placeholder/100/100',
      quantity: 1,
      maxQuantity: 5,
      vendor: 'Tech Store BD',
      category: 'Electronics',
      shipping: { free: true, cost: 0, estimatedDays: 2 },
      warranty: '1 Year Official',
      selected: true,
      priceHistory: [
        { date: '2024-01-01', price: 150000 },
        { date: '2024-01-15', price: 135000 }
      ],
      discount: 10,
      badges: ['Best Seller', 'Fast Delivery'],
      inStock: true,
      lastPriceChange: { type: 'decrease', amount: 15000, date: '2024-01-15' }
    },
    {
      id: '2',
      name: 'Apple iPhone 15 Pro',
      price: 165000,
      image: '/api/placeholder/100/100',
      quantity: 1,
      maxQuantity: 3,
      vendor: 'Premium Electronics',
      category: 'Electronics',
      shipping: { free: true, cost: 0, estimatedDays: 1 },
      warranty: '1 Year Apple',
      selected: true,
      priceHistory: [
        { date: '2024-01-01', price: 165000 }
      ],
      badges: ['Premium', 'Limited Stock'],
      inStock: true
    },
    {
      id: '3',
      name: 'Wireless Bluetooth Headphones',
      price: 2500,
      originalPrice: 3500,
      image: '/api/placeholder/100/100',
      quantity: 2,
      maxQuantity: 10,
      vendor: 'Audio World',
      category: 'Electronics',
      shipping: { free: false, cost: 60, estimatedDays: 3 },
      warranty: '6 Months',
      selected: true,
      priceHistory: [
        { date: '2024-01-01', price: 3500 },
        { date: '2024-01-10', price: 2500 }
      ],
      discount: 28,
      badges: ['Hot Deal'],
      inStock: true,
      lastPriceChange: { type: 'decrease', amount: 1000, date: '2024-01-10' }
    }
  ];

  // Mock saved items
  const mockSavedItems: SavedItem[] = [
    {
      id: '4',
      name: 'MacBook Pro 16" M3',
      price: 285000,
      originalPrice: 320000,
      image: '/api/placeholder/100/100',
      vendor: 'Apple Store BD',
      savedDate: '2024-01-12',
      priceAlert: true,
      targetPrice: 275000
    },
    {
      id: '5',
      name: 'Sony WH-1000XM5',
      price: 32000,
      image: '/api/placeholder/100/100',
      vendor: 'Audio Zone',
      savedDate: '2024-01-10',
      priceAlert: false
    }
  ];

  // Mock recommendations
  const mockRecommendations: RecommendedItem[] = [
    {
      id: '6',
      name: 'Phone Case for Galaxy S24',
      price: 1200,
      originalPrice: 1800,
      image: '/api/placeholder/100/100',
      rating: 4.7,
      reviews: 234,
      vendor: 'Mobile Accessories',
      reason: 'Frequently bought together',
      discount: 33
    },
    {
      id: '7',
      name: 'Wireless Charger Stand',
      price: 2800,
      image: '/api/placeholder/100/100',
      rating: 4.5,
      reviews: 156,
      vendor: 'Tech Accessories',
      reason: 'Customers also viewed'
    }
  ];

  const [currentCartItems, setCurrentCartItems] = useState(mockCartItems);
  const [currentSavedItems, setCurrentSavedItems] = useState(mockSavedItems);
  const [currentRecommendations, setCurrentRecommendations] = useState(mockRecommendations);

  // Calculate totals
  const selectedCartItems = currentCartItems.filter(item => item.selected);
  const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = selectedCartItems.reduce((sum, item) => sum + (item.shipping.free ? 0 : item.shipping.cost), 0);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = subtotal + shippingCost - discount;
  const freeShippingThreshold = 1000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const updateQuantity = (id: string, newQuantity: number) => {
    setCurrentCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(newQuantity, item.maxQuantity)) }
          : item
      )
    );
  };

  const toggleItemSelection = (id: string) => {
    setCurrentCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCurrentCartItems(items => items.filter(item => item.id !== id));
  };

  const saveForLater = (id: string) => {
    const item = currentCartItems.find(item => item.id === id);
    if (item) {
      const savedItem: SavedItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        vendor: item.vendor,
        savedDate: new Date().toISOString().split('T')[0],
        priceAlert: false
      };
      setCurrentSavedItems(prev => [...prev, savedItem]);
      removeItem(id);
    }
  };

  const moveToCart = (id: string) => {
    const savedItem = currentSavedItems.find(item => item.id === id);
    if (savedItem) {
      // In real app, you'd fetch updated product data
      setSavedItems(items => items.filter(item => item.id !== id));
    }
  };

  const applyCoupon = () => {
    // Mock coupon validation
    if (couponCode === 'SAVE10') {
      setAppliedCoupon({ code: couponCode, discount: subtotal * 0.1 });
    } else if (couponCode === 'FREE50') {
      setAppliedCoupon({ code: couponCode, discount: 50 });
    }
  };

  const CartItemCard: React.FC<{ item: CartItem }> = ({ item }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={item.selected}
            onCheckedChange={() => toggleItemSelection(item.id)}
          />
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-1">by {item.vendor}</p>
            
            {/* Price and badges */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-blue-600">৳{item.price.toLocaleString()}</span>
              {item.originalPrice && (
                <span className="text-sm text-gray-500 line-through">৳{item.originalPrice.toLocaleString()}</span>
              )}
              {item.discount && (
                <Badge className="bg-red-500 text-white">-{item.discount}%</Badge>
              )}
            </div>

            {/* Price change alert */}
            {item.lastPriceChange && (
              <Alert className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center gap-2">
                  {item.lastPriceChange.type === 'decrease' ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  )}
                  Price {item.lastPriceChange.type === 'decrease' ? 'dropped' : 'increased'} by ৳{item.lastPriceChange.amount.toLocaleString()}
                </AlertDescription>
              </Alert>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1 mb-2">
              {item.badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>

            {/* Shipping info */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Truck className="h-4 w-4" />
                <span>{item.shipping.free ? 'Free Shipping' : `৳${item.shipping.cost} shipping`}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{item.shipping.estimatedDays} days</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>{item.warranty}</span>
              </div>
            </div>

            {/* Stock status */}
            {!item.inStock && (
              <Alert className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Out of stock</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Quantity and actions */}
          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.maxQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-right">
              <div className="font-semibold">৳{(item.price * item.quantity).toLocaleString()}</div>
              <div className="text-sm text-gray-600">৳{item.price.toLocaleString()} each</div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveForLater(item.id)}
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SavedItemCard: React.FC<{ item: SavedItem }> = ({ item }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-1">by {item.vendor}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-blue-600">৳{item.price.toLocaleString()}</span>
              {item.originalPrice && (
                <span className="text-sm text-gray-500 line-through">৳{item.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="text-sm text-gray-600">Saved on {item.savedDate}</p>
            {item.priceAlert && (
              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                <CheckCircle className="h-4 w-4" />
                Price alert set for ৳{item.targetPrice?.toLocaleString()}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => moveToCart(item.id)}>
              Add to Cart
            </Button>
            <Button variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RecommendationCard: React.FC<{ item: RecommendedItem }> = ({ item }) => (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm ml-1">{item.rating}</span>
            </div>
            <span className="text-sm text-gray-600">({item.reviews})</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-blue-600">৳{item.price.toLocaleString()}</span>
            {item.originalPrice && (
              <span className="text-sm text-gray-500 line-through">৳{item.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <p className="text-xs text-gray-600">{item.reason}</p>
        </div>
        <Button size="sm">Add</Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <span className="text-gray-600">({currentCartItems.length} items)</span>
        </div>

        {/* Free shipping progress */}
        {remainingForFreeShipping > 0 && (
          <Alert className="mb-6">
            <Gift className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Add ৳{remainingForFreeShipping.toLocaleString()} more for free shipping!</span>
                <Progress value={(subtotal / freeShippingThreshold) * 100} className="w-32" />
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6">
              <Button
                variant={activeTab === 'cart' ? 'default' : 'outline'}
                onClick={() => setActiveTab('cart')}
              >
                Cart ({currentCartItems.length})
              </Button>
              <Button
                variant={activeTab === 'saved' ? 'default' : 'outline'}
                onClick={() => setActiveTab('saved')}
              >
                Saved for Later ({currentSavedItems.length})
              </Button>
            </div>

            {/* Cart Items */}
            {activeTab === 'cart' && (
              <div>
                {currentCartItems.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                      <p className="text-gray-600 mb-4">Add items to your cart to get started</p>
                      <Button>Continue Shopping</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div>
                    {/* Bulk actions */}
                    <div className="flex items-center gap-4 mb-4">
                      <Checkbox
                        checked={selectedCartItems.length === currentCartItems.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCurrentCartItems(items => items.map(item => ({ ...item, selected: true })));
                          } else {
                            setCurrentCartItems(items => items.map(item => ({ ...item, selected: false })));
                          }
                        }}
                      />
                      <span className="text-sm">Select All</span>
                      <Button variant="outline" size="sm">
                        Delete Selected
                      </Button>
                      <Button variant="outline" size="sm">
                        Save Selected for Later
                      </Button>
                    </div>

                    {currentCartItems.map(item => (
                      <CartItemCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved Items */}
            {activeTab === 'saved' && (
              <div>
                {currentSavedItems.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No saved items</h3>
                      <p className="text-gray-600">Items you save for later will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div>
                    {currentSavedItems.map(item => (
                      <SavedItemCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentRecommendations.map(item => (
                    <RecommendationCard key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({selectedCartItems.length} items)</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `৳${shippingCost.toLocaleString()}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-৳{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>৳{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button onClick={applyCoupon}>Apply</Button>
                    </div>
                    {appliedCoupon && (
                      <div className="text-green-600 text-sm">
                        Coupon "{appliedCoupon.code}" applied!
                      </div>
                    )}
                  </div>

                  <Button className="w-full" size="lg" disabled={selectedCartItems.length === 0}>
                    Proceed to Checkout
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Free returns within 30 days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SmartShoppingCart;