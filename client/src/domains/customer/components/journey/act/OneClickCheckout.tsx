/**
 * One-Click Checkout System - Amazon.com ACT Stage
 * Patented one-click ordering with Bangladesh payment integration
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Separator } from '../../../shared/ui/separator';
import { Input } from '../../../shared/ui/input';
import { cn } from '../../../../lib/utils';

interface PaymentMethod {
  id: string;
  type: 'bkash' | 'nagad' | 'rocket' | 'card' | 'bank';
  name: string;
  namebn: string;
  icon: string;
  isDefault: boolean;
  lastFour?: string;
  expiryDate?: string;
  verified: boolean;
}

interface DeliveryOption {
  id: string;
  name: string;
  namebn: string;
  duration: string;
  price: number;
  icon: string;
  available: boolean;
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
}

interface CheckoutProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}

interface OneClickCheckoutProps {
  products: CheckoutProduct[];
  className?: string;
  language?: 'en' | 'bn';
  onOrderComplete?: (orderId: string) => void;
  enableExpressDelivery?: boolean;
  showSecurityBadges?: boolean;
}

export default function OneClickCheckout({
  products,
  className,
  language = 'en',
  onOrderComplete,
  enableExpressDelivery = true,
  showSecurityBadges = true
}: OneClickCheckoutProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStep, setOrderStep] = useState<'review' | 'payment' | 'confirmation'>('review');
  const [securityCode, setSecurityCode] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Payment methods for Bangladesh market
  const availablePaymentMethods: PaymentMethod[] = [
    {
      id: 'bkash',
      type: 'bkash',
      name: 'bKash',
      namebn: 'বিকাশ',
      icon: '💳',
      isDefault: true,
      lastFour: '8901',
      verified: true
    },
    {
      id: 'nagad',
      type: 'nagad',
      name: 'Nagad',
      namebn: 'নগদ',
      icon: '📱',
      isDefault: false,
      lastFour: '2345',
      verified: true
    },
    {
      id: 'rocket',
      type: 'rocket',
      name: 'Rocket',
      namebn: 'রকেট',
      icon: '🚀',
      isDefault: false,
      lastFour: '6789',
      verified: true
    },
    {
      id: 'card',
      type: 'card',
      name: 'Visa Card',
      namebn: 'ভিসা কার্ড',
      icon: '💳',
      isDefault: false,
      lastFour: '1234',
      expiryDate: '12/26',
      verified: true
    }
  ];

  // Delivery options
  const deliveryOptions: DeliveryOption[] = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      namebn: 'স্ট্যান্ডার্ড ডেলিভারি',
      duration: '3-5 business days',
      price: 60,
      icon: '📦',
      available: true
    },
    {
      id: 'express',
      name: 'Express Delivery',
      namebn: 'এক্সপ্রেস ডেলিভারি',
      duration: '1-2 business days',
      price: 150,
      icon: '⚡',
      available: enableExpressDelivery
    },
    {
      id: 'same-day',
      name: 'Same Day Delivery',
      namebn: 'একই দিন ডেলিভারি',
      duration: 'Within 6 hours',
      price: 300,
      icon: '🏃',
      available: enableExpressDelivery
    }
  ];

  // Initialize data
  useEffect(() => {
    setPaymentMethods(availablePaymentMethods);
    setSelectedPayment(availablePaymentMethods.find(p => p.isDefault)?.id || '');
    setSelectedDelivery('standard');

    // Calculate order summary
    const subtotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const shipping = deliveryOptions.find(d => d.id === 'standard')?.price || 60;
    const tax = Math.round(subtotal * 0.05); // 5% VAT
    const discount = 0; // Apply any discounts
    const total = subtotal + shipping + tax - discount;

    setOrderSummary({
      subtotal,
      shipping,
      tax,
      discount,
      total,
      currency: 'BDT'
    });

    // Set estimated delivery
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    setEstimatedDelivery(deliveryDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-BD'));
  }, [products, language, enableExpressDelivery]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'bkash': return '💗';
      case 'nagad': return '🧡';
      case 'rocket': return '💚';
      case 'card': return '💳';
      default: return '💰';
    }
  };

  const handlePaymentMethodChange = (methodId: string) => {
    setSelectedPayment(methodId);
  };

  const handleDeliveryChange = (deliveryId: string) => {
    setSelectedDelivery(deliveryId);
    
    if (orderSummary) {
      const deliveryOption = deliveryOptions.find(d => d.id === deliveryId);
      const newShipping = deliveryOption?.price || 60;
      const newTotal = orderSummary.subtotal + newShipping + orderSummary.tax - orderSummary.discount;
      
      setOrderSummary({
        ...orderSummary,
        shipping: newShipping,
        total: newTotal
      });

      // Update estimated delivery
      const deliveryDays = deliveryId === 'same-day' ? 0 : deliveryId === 'express' ? 1 : 4;
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
      setEstimatedDelivery(deliveryDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-BD'));
    }
  };

  const handleOneClickOrder = async () => {
    setIsProcessing(true);
    setOrderStep('payment');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate order ID
      const orderId = `GT${Date.now()}`;
      
      setOrderStep('confirmation');
      setIsProcessing(false);
      
      // Call completion handler
      setTimeout(() => {
        onOrderComplete?.(orderId);
      }, 1000);
      
    } catch (error) {
      setIsProcessing(false);
      setOrderStep('review');
      console.error('Payment failed:', error);
    }
  };

  const handleSecurityVerification = () => {
    if (securityCode.length >= 4) {
      handleOneClickOrder();
    }
  };

  if (!orderSummary) {
    return (
      <Card className={cn("p-6 animate-pulse", className)}>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Order Review Step */}
      {orderStep === 'review' && (
        <>
          {/* Products Summary */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {language === 'bn' ? 'অর্ডার সারসংক্ষেপ' : 'Order Summary'}
            </h3>
            
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {product.name}
                    </h4>
                    {product.variant && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.variant}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'bn' ? 'পরিমাণ:' : 'Qty:'} {product.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(product.price * product.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Method Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all",
                    selectedPayment === method.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                  onClick={() => handlePaymentMethodChange(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPaymentMethodIcon(method.type)}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {language === 'bn' ? method.namebn : method.name}
                        </p>
                        {method.lastFour && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ****{method.lastFour}
                          </p>
                        )}
                      </div>
                    </div>
                    {method.verified && (
                      <Badge variant="secondary" className="text-xs">
                        {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Options */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {language === 'bn' ? 'ডেলিভারি অপশন' : 'Delivery Options'}
            </h3>
            
            <div className="space-y-3">
              {deliveryOptions.filter(option => option.available).map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all",
                    selectedDelivery === option.id
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                  onClick={() => handleDeliveryChange(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{option.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {language === 'bn' ? option.namebn : option.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {option.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-gray-100">
                        {option.price === 0 ? (language === 'bn' ? 'ফ্রি' : 'Free') : formatPrice(option.price)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {language === 'bn' ? 'পৌঁছানোর তারিখ:' : 'Est. delivery:'} {estimatedDelivery}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Order Total */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {language === 'bn' ? 'মোট খরচ' : 'Order Total'}
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span>{formatPrice(orderSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{language === 'bn' ? 'ডেলিভারি' : 'Delivery'}</span>
                <span>{formatPrice(orderSummary.shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{language === 'bn' ? 'ভ্যাট' : 'VAT'}</span>
                <span>{formatPrice(orderSummary.tax)}</span>
              </div>
              {orderSummary.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{language === 'bn' ? 'ছাড়' : 'Discount'}</span>
                  <span>-{formatPrice(orderSummary.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                <span>{language === 'bn' ? 'মোট' : 'Total'}</span>
                <span>{formatPrice(orderSummary.total)}</span>
              </div>
            </div>
          </Card>

          {/* One-Click Order Button */}
          <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {language === 'bn' ? 'এক-ক্লিক অর্ডার' : 'One-Click Order'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'bn' 
                    ? 'আপনার সংরক্ষিত তথ্য দিয়ে তাৎক্ষণিক অর্ডার করুন'
                    : 'Order instantly with your saved information'
                  }
                </p>
              </div>
              
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold h-14"
                onClick={() => setOrderStep('payment')}
                disabled={!selectedPayment || !selectedDelivery}
              >
                <span className="mr-2">⚡</span>
                {language === 'bn' ? 'এক-ক্লিক অর্ডার' : 'Order with 1-Click'} - {formatPrice(orderSummary.total)}
              </Button>

              {showSecurityBadges && (
                <div className="flex justify-center items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>🔒</span>
                    <span>{language === 'bn' ? 'সুরক্ষিত' : 'Secure'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>✅</span>
                    <span>{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>🚀</span>
                    <span>{language === 'bn' ? 'দ্রুত' : 'Fast'}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Payment Processing Step */}
      {orderStep === 'payment' && (
        <Card className="p-8 text-center">
          <div className="space-y-6">
            <div className="text-6xl">🔐</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {language === 'bn' ? 'নিরাপত্তা যাচাইকরণ' : 'Security Verification'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'bn' 
                  ? 'আপনার মোবাইলে পাঠানো কোড প্রবেশ করান'
                  : 'Enter the code sent to your mobile'
                }
              </p>
            </div>
            
            <div className="max-w-xs mx-auto">
              <Input
                type="text"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                placeholder={language === 'bn' ? 'কোড প্রবেশ করান' : 'Enter code'}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSecurityVerification}
                disabled={securityCode.length < 4 || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{language === 'bn' ? 'প্রক্রিয়াকরণ...' : 'Processing...'}</span>
                  </div>
                ) : (
                  language === 'bn' ? 'অর্ডার নিশ্চিত করুন' : 'Confirm Order'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setOrderStep('review')}
                disabled={isProcessing}
              >
                {language === 'bn' ? 'ফিরে যান' : 'Go Back'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Order Confirmation Step */}
      {orderStep === 'confirmation' && (
        <Card className="p-8 text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <div className="space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                {language === 'bn' ? 'অর্ডার সফল!' : 'Order Successful!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'bn' 
                  ? 'আপনার অর্ডার নিশ্চিত হয়েছে এবং প্রক্রিয়াকরণ করা হচ্ছে'
                  : 'Your order has been confirmed and is being processed'
                }
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'bn' ? 'অর্ডার নম্বর' : 'Order Number'}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                GT{Date.now()}
              </p>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>{language === 'bn' ? 'আনুমানিক ডেলিভারি:' : 'Estimated delivery:'} {estimatedDelivery}</p>
              <p>{language === 'bn' ? 'ট্র্যাকিং তথ্য SMS এ পাঠানো হবে' : 'Tracking details will be sent via SMS'}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}