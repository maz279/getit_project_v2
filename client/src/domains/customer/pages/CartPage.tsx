import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Trash2, Plus, Minus, ShoppingBag, Truck, CreditCard, Gift, ArrowRight, Heart, Store } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { Input } from '@/shared/ui/input';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
  inStock: boolean;
  variants?: Record<string, string>;
}

interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  items: CartItem[];
}

export default function CartPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');

  const navigate = (path: string) => setLocation(path);

  // Fetch cart data
  const { data: cartData, isLoading, error } = useQuery({
    queryKey: ['/api/v1/cart'],
    queryFn: async () => {
      const response = await fetch('/api/v1/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json();
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error('Failed to update quantity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/cart'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        variant: 'destructive',
      });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/cart'] });
      toast({
        title: 'Item Removed',
        description: 'Item has been removed from your cart',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    },
  });

  // Apply coupon mutation
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/v1/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error('Invalid coupon code');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/cart'] });
      toast({
        title: 'Coupon Applied',
        description: `Discount of ৳${data.discount} applied successfully`,
      });
      setCouponCode('');
    },
    onError: () => {
      toast({
        title: 'Invalid Coupon',
        description: 'The coupon code you entered is not valid',
        variant: 'destructive',
      });
    },
  });

  const cartSummary: CartSummary = cartData || { subtotal: 0, shipping: 0, tax: 0, discount: 0, total: 0, items: [] };
  const cartItems = cartSummary.items || [];

  // Group items by vendor
  const itemsByVendor = cartItems.reduce((groups, item) => {
    if (!groups[item.vendorId]) {
      groups[item.vendorId] = {
        vendorName: item.vendorName,
        items: [],
      };
    }
    groups[item.vendorId].items.push(item);
    return groups;
  }, {} as Record<string, { vendorName: string; items: CartItem[] }>);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? cartItems.map(item => item.id) : []);
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      applyCouponMutation.mutate(couponCode.trim());
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select items to proceed to checkout',
        variant: 'destructive',
      });
      return;
    }
    navigate('/checkout');
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Cart</h2>
        <p className="text-gray-600 mb-4">There was an error loading your cart. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex space-x-4 animate-pulse">
                    <div className="w-24 h-24 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some products to your cart to get started</p>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart ({cartItems.length} items)</h1>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedItems.length === cartItems.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">Select All</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(itemsByVendor).map(([vendorId, vendorGroup]) => (
            <Card key={vendorId}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Store className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">{vendorGroup.vendorName}</CardTitle>
                  <Badge variant="secondary">
                    {vendorGroup.items.length} item{vendorGroup.items.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {vendorGroup.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                    />
                    
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 truncate">{item.productName}</h3>
                      {item.variants && Object.entries(item.variants).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {Object.entries(item.variants).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600">৳{item.price.toLocaleString()}</span>
                        {!item.inStock && (
                          <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                        min="1"
                        disabled={updateQuantityMutation.isPending}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updateQuantityMutation.isPending}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Coupon Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-green-600" />
                  Coupon Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={applyCouponMutation.isPending}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || applyCouponMutation.isPending}
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({selectedItems.length} items)</span>
                  <span>৳{cartSummary.subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <Truck className="w-4 h-4 mr-1" />
                    Shipping
                  </span>
                  <span>৳{cartSummary.shipping.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>VAT (15%)</span>
                  <span>৳{cartSummary.tax.toLocaleString()}</span>
                </div>
                
                {cartSummary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-৳{cartSummary.discount.toLocaleString()}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">৳{cartSummary.total.toLocaleString()}</span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <p className="text-xs text-center text-gray-600">
                  Secure checkout powered by SSL encryption
                </p>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accepted Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <div className="w-4 h-4 bg-pink-500 rounded"></div>
                    <span className="text-sm">bKash</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-sm">Nagad</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-sm">Rocket</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">COD</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}