/**
 * Amazon.com/Shopee.sg-Level One-Click Checkout System
 * Stage 4: Act - Amazon patented one-click ordering with Bangladesh optimization
 * Implements enterprise-grade instant checkout with cultural payment methods
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Progress } from '@/shared/ui/progress';
import { 
  Zap, 
  Shield, 
  Truck, 
  CreditCard, 
  MapPin, 
  Clock,
  Check,
  Star,
  Gift,
  Lock,
  Smartphone,
  Building,
  Wallet
} from 'lucide-react';

interface CheckoutProduct {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
}

interface PaymentMethod {
  id: string;
  type: 'bkash' | 'nagad' | 'rocket' | 'card' | 'bank';
  name: string;
  bengaliName: string;
  icon: string;
  isDefault: boolean;
  isAvailable: boolean;
  processingTime: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  bengaliName: string;
  time: string;
  price: number;
  isExpress: boolean;
}

interface OneClickCheckoutSystemProps {
  products?: CheckoutProduct[];
  className?: string;
  language?: 'en' | 'bn';
}

export const OneClickCheckoutSystem: React.FC<OneClickCheckoutSystemProps> = ({
  products = [],
  className = '',
  language = 'en'
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'processing' | 'success'>('review');
  const [selectedPayment, setSelectedPayment] = useState('bkash');
  const [selectedDelivery, setSelectedDelivery] = useState('express');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);

  const defaultProducts: CheckoutProduct[] = [
    {
      id: '1',
      title: 'Premium Wireless Bluetooth Headphones',
      bengaliTitle: 'প্রিমিয়াম ওয়্যারলেস ব্লুটুথ হেডফোন',
      price: 2850,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
      seller: 'TechGear BD'
    },
    {
      id: '2',
      title: 'Cotton Punjabi - Eid Collection',
      bengaliTitle: 'কটন পাঞ্জাবি - ঈদ কালেকশন',
      price: 1950,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200',
      seller: 'Dhaka Fashion'
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bkash',
      type: 'bkash',
      name: 'bKash',
      bengaliName: 'বিকাশ',
      icon: '📱',
      isDefault: true,
      isAvailable: true,
      processingTime: 'Instant'
    },
    {
      id: 'nagad',
      type: 'nagad',
      name: 'Nagad',
      bengaliName: 'নগদ',
      icon: '💳',
      isDefault: false,
      isAvailable: true,
      processingTime: 'Instant'
    },
    {
      id: 'rocket',
      type: 'rocket',
      name: 'Rocket',
      bengaliName: 'রকেট',
      icon: '🚀',
      isDefault: false,
      isAvailable: true,
      processingTime: '2-3 min'
    },
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      bengaliName: 'ক্রেডিট/ডেবিট কার্ড',
      icon: '💳',
      isDefault: false,
      isAvailable: true,
      processingTime: 'Instant'
    }
  ];

  const deliveryOptions: DeliveryOption[] = [
    {
      id: 'express',
      name: 'Express Delivery',
      bengaliName: 'এক্সপ্রেস ডেলিভারি',
      time: '2-4 hours',
      price: 100,
      isExpress: true
    },
    {
      id: 'same_day',
      name: 'Same Day Delivery',
      bengaliName: 'একই দিন ডেলিভারি',
      time: '6-12 hours',
      price: 60,
      isExpress: false
    },
    {
      id: 'next_day',
      name: 'Next Day Delivery',
      bengaliName: 'পরের দিন ডেলিভারি',
      time: '24 hours',
      price: 40,
      isExpress: false
    }
  ];

  const cartProducts = products.length > 0 ? products : defaultProducts;

  useEffect(() => {
    const subtotal = cartProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const deliveryCharge = deliveryOptions.find(d => d.id === selectedDelivery)?.price || 0;
    setOrderTotal(subtotal + deliveryCharge);
  }, [cartProducts, selectedDelivery]);

  const handleOneClickCheckout = async () => {
    setIsProcessing(true);
    setCheckoutStep('processing');
    setProcessingProgress(0);

    // Simulate processing steps
    const steps = [
      { text: 'Validating payment method...', progress: 20 },
      { text: 'Processing payment...', progress: 50 },
      { text: 'Confirming order...', progress: 75 },
      { text: 'Sending confirmation...', progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingProgress(step.progress);
    }

    setCheckoutStep('success');
    setIsProcessing(false);
  };

  if (checkoutStep === 'success') {
    return (
      <div className={`one-click-checkout-system ${className}`}>
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-600 mb-2">
              {language === 'bn' ? 'অর্ডার সফল!' : 'Order Successful!'}
            </h2>
            <p className="text-gray-600 mb-4">
              {language === 'bn' 
                ? 'আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে'
                : 'Your order has been placed successfully'}
            </p>
            <Badge className="bg-blue-600 text-white mb-4">
              Order #BD{Date.now().toString().slice(-6)}
            </Badge>
            <div className="space-y-2">
              <Button className="w-full">
                {language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}
              </Button>
              <Button variant="outline" className="w-full">
                {language === 'bn' ? 'আরো কিনুন' : 'Continue Shopping'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkoutStep === 'processing') {
    return (
      <div className={`one-click-checkout-system ${className}`}>
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {language === 'bn' ? 'অর্ডার প্রক্রিয়াকরণ...' : 'Processing Order...'}
            </h2>
            <p className="text-gray-600 mb-4">
              {language === 'bn' 
                ? 'অনুগ্রহ করে অপেক্ষা করুন'
                : 'Please wait while we process your order'}
            </p>
            <Progress value={processingProgress} className="mb-4" />
            <div className="text-sm text-gray-600">
              {processingProgress}% {language === 'bn' ? 'সম্পন্ন' : 'Complete'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`one-click-checkout-system ${className}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'bn' ? 'ওয়ান-ক্লিক চেকআউট' : 'One-Click Checkout'}
              </h1>
              <p className="text-gray-600 text-sm">
                {language === 'bn' 
                  ? 'একটি ক্লিকেই সম্পূর্ণ অর্ডার - Amazon.com স্টাইল'
                  : 'Complete your order in one click - Amazon.com style'}
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Shield className="w-4 h-4" />
            <span>
              {language === 'bn' ? 'SSL এনক্রিপ্টেড নিরাপদ চেকআউট' : 'SSL Encrypted Secure Checkout'}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {language === 'bn' ? 'অর্ডার পণ্য' : 'Order Items'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {language === 'bn' && product.bengaliTitle ? product.bengaliTitle : product.title}
                        </h4>
                        <div className="text-sm text-gray-600">by {product.seller}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold">৳{product.price.toLocaleString()}</span>
                          <span className="text-sm text-gray-600">× {product.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">৳{(product.price * product.quantity).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedPayment === method.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.bengaliName}</div>
                          <div className="text-xs text-green-600">{method.processingTime}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {language === 'bn' ? 'ডেলিভারি অপশন' : 'Delivery Options'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deliveryOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedDelivery === option.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDelivery(option.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{option.name}</span>
                            {option.isExpress && (
                              <Badge className="bg-red-500 text-white text-xs">Express</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{option.bengaliName}</div>
                          <div className="text-sm text-blue-600">{option.time}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">৳{option.price}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>
                  {language === 'bn' ? 'অর্ডার সারাংশ' : 'Order Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{language === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                    <span>৳{(orderTotal - (deliveryOptions.find(d => d.id === selectedDelivery)?.price || 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'bn' ? 'ডেলিভারি:' : 'Delivery:'}</span>
                    <span>৳{deliveryOptions.find(d => d.id === selectedDelivery)?.price || 0}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>{language === 'bn' ? 'মোট:' : 'Total:'}</span>
                    <span className="text-blue-600">৳{orderTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">
                      {language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    House #123, Road #5, Block A<br />
                    Bashundhara R/A, Dhaka-1229<br />
                    Bangladesh
                  </div>
                </div>

                {/* One-Click Checkout Button */}
                <Button 
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-lg py-6"
                  onClick={handleOneClickCheckout}
                  disabled={isProcessing}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {language === 'bn' ? 'ওয়ান-ক্লিক অর্ডার' : 'One-Click Order'}
                </Button>

                {/* Security Features */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4" />
                    <span>
                      {language === 'bn' ? 'নিরাপদ পেমেন্ট' : 'Secure Payment'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>
                      {language === 'bn' ? '১০০% ক্রেতা সুরক্ষা' : '100% Buyer Protection'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Gift className="w-4 h-4" />
                    <span>
                      {language === 'bn' ? 'সহজ রিটার্ন নীতি' : 'Easy Return Policy'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneClickCheckoutSystem;