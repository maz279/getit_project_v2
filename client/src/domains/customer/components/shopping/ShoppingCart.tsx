/**
 * Shopping Cart Component
 * Advanced cart management with saved items and recommendations
 * Implements Amazon.com/Shopee.sg-level cart experience
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Heart,
  Gift,
  Truck,
  Shield,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';

interface CartItem {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  variant?: string;
  seller: string;
  inStock: boolean;
  maxQuantity: number;
  shippingFree: boolean;
  deliveryTime: string;
}

interface SavedItem {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  rating: number;
  reviews: number;
}

interface ShoppingCartProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  className = '',
  language = 'en'
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      title: 'Premium Wireless Bluetooth Headphones',
      bengaliTitle: 'প্রিমিয়াম ওয়্যারলেস ব্লুটুথ হেডফোন',
      price: 2850,
      originalPrice: 4000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
      variant: 'Black',
      seller: 'TechGear BD',
      inStock: true,
      maxQuantity: 5,
      shippingFree: true,
      deliveryTime: '1-2 days'
    },
    {
      id: '2',
      title: 'Smart Fitness Watch',
      bengaliTitle: 'স্মার্ট ফিটনেস ওয়াচ',
      price: 3200,
      originalPrice: 4500,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
      variant: 'Silver',
      seller: 'FitTech Store',
      inStock: true,
      maxQuantity: 3,
      shippingFree: false,
      deliveryTime: '2-3 days'
    }
  ]);

  const [savedItems, setSavedItems] = useState<SavedItem[]>([
    {
      id: '3',
      title: 'Wireless Gaming Mouse',
      bengaliTitle: 'ওয়্যারলেস গেমিং মাউস',
      price: 1850,
      originalPrice: 2500,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200',
      inStock: true,
      rating: 4.5,
      reviews: 445
    }
  ]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: Math.max(1, Math.min(newQuantity, item.maxQuantity)) }
        : item
    ));
  };

  const removeItem = (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      // Move to saved items
      setSavedItems(prev => [...prev, {
        id: item.id,
        title: item.title,
        bengaliTitle: item.bengaliTitle,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        inStock: item.inStock,
        rating: 4.5,
        reviews: 100
      }]);
    }
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const moveToCart = (savedItemId: string) => {
    const savedItem = savedItems.find(item => item.id === savedItemId);
    if (savedItem) {
      setCartItems(prev => [...prev, {
        id: savedItem.id,
        title: savedItem.title,
        bengaliTitle: savedItem.bengaliTitle,
        price: savedItem.price,
        originalPrice: savedItem.originalPrice,
        quantity: 1,
        image: savedItem.image,
        seller: 'Default Store',
        inStock: savedItem.inStock,
        maxQuantity: 5,
        shippingFree: true,
        deliveryTime: '1-2 days'
      }]);
      setSavedItems(prev => prev.filter(item => item.id !== savedItemId));
    }
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setAppliedCoupon('SAVE10');
      setCouponCode('');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = cartItems.some(item => !item.shippingFree) ? 60 : 0;
  const discount = appliedCoupon === 'SAVE10' ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  if (cartItems.length === 0 && savedItems.length === 0) {
    return (
      <div className={`shopping-cart ${className}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">
              {language === 'bn' ? 'আপনার কার্ট খালি' : 'Your cart is empty'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'bn' 
                ? 'কেনাকাটা শুরু করতে পণ্য যোগ করুন'
                : 'Add products to start shopping'}
            </p>
            <Button>
              {language === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`shopping-cart ${className}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Header */}
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold">
                {language === 'bn' ? 'শপিং কার্ট' : 'Shopping Cart'}
              </h1>
              <Badge variant="outline">
                {cartItems.length} {language === 'bn' ? 'টি পণ্য' : 'items'}
              </Badge>
            </div>

            {/* Cart Items List */}
            <Card>
              <CardContent className="p-0">
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={item.id} className={`p-4 ${index !== cartItems.length - 1 ? 'border-b' : ''}`}>
                      <div className="flex gap-4">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                        
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2 line-clamp-2">
                            {language === 'bn' && item.bengaliTitle ? item.bengaliTitle : item.title}
                          </h3>
                          
                          {item.variant && (
                            <p className="text-sm text-gray-600 mb-2">
                              {language === 'bn' ? 'ভ্যারিয়েন্ট:' : 'Variant:'} {item.variant}
                            </p>
                          )}
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {language === 'bn' ? 'বিক্রেতা:' : 'Sold by:'} {item.seller}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-blue-600">
                              ৳{item.price.toLocaleString()}
                            </span>
                            {item.originalPrice && (
                              <>
                                <span className="text-sm text-gray-500 line-through">
                                  ৳{item.originalPrice.toLocaleString()}
                                </span>
                                <Badge className="bg-red-500 text-white text-xs">
                                  -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                                </Badge>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            {item.shippingFree && (
                              <div className="flex items-center gap-1 text-green-600">
                                <Truck className="w-4 h-4" />
                                {language === 'bn' ? 'ফ্রি শিপিং' : 'Free shipping'}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              {item.deliveryTime}
                            </div>
                            
                            {item.inStock ? (
                              <Badge className="bg-green-600 text-white text-xs">
                                {language === 'bn' ? 'স্টকে আছে' : 'In Stock'}
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500 text-white text-xs">
                                {language === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center border rounded">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="px-3 py-1 min-w-[3rem] text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Item Total */}
                          <div className="text-lg font-bold">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Saved Items */}
            {savedItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    {language === 'bn' ? 'সংরক্ষিত পণ্য' : 'Saved Items'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {savedItems.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1 line-clamp-2 text-sm">
                            {language === 'bn' && item.bengaliTitle ? item.bengaliTitle : item.title}
                          </h4>
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{item.rating} ({item.reviews})</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-blue-600">
                              ৳{item.price.toLocaleString()}
                            </span>
                            {item.originalPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                ৳{item.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => moveToCart(item.id)}
                          >
                            {language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>
                  {language === 'bn' ? 'অর্ডার সারাংশ' : 'Order Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon */}
                <div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder={language === 'bn' ? 'কুপন কোড' : 'Coupon code'}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={applyCoupon} disabled={!couponCode}>
                      {language === 'bn' ? 'প্রয়োগ' : 'Apply'}
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <Gift className="w-4 h-4" />
                      {language === 'bn' ? 'কুপন প্রয়োগ করা হয়েছে:' : 'Coupon applied:'} {appliedCoupon}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>{language === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>{language === 'bn' ? 'শিপিং:' : 'Shipping:'}</span>
                    <span>
                      {shipping === 0 
                        ? (language === 'bn' ? 'ফ্রি' : 'Free')
                        : `৳${shipping}`
                      }
                    </span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{language === 'bn' ? 'ডিসকাউন্ট:' : 'Discount:'}</span>
                      <span>-৳{discount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>{language === 'bn' ? 'মোট:' : 'Total:'}</span>
                    <span className="text-blue-600">৳{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      {language === 'bn' ? 'ডেলিভারি তথ্য' : 'Delivery Info'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {language === 'bn' 
                      ? 'ঢাকায় ২৪ ঘন্টায়, ঢাকার বাইরে ২-৩ দিনে'
                      : 'Within 24 hours in Dhaka, 2-3 days outside Dhaka'}
                  </p>
                </div>

                {/* Security */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>
                    {language === 'bn' ? 'নিরাপদ চেকআউট' : 'Secure checkout'}
                  </span>
                </div>

                {/* Checkout Button */}
                <Button className="w-full" size="lg">
                  {language === 'bn' ? 'চেকআউট করুন' : 'Proceed to Checkout'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {/* Continue Shopping */}
                <Button variant="outline" className="w-full">
                  {language === 'bn' ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;