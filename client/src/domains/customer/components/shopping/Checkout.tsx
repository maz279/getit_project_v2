/**
 * Checkout Component
 * Multi-step checkout process with address and payment management
 * Implements Amazon.com/Shopee.sg-level checkout experience
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle,
  Edit,
  Plus,
  Clock,
  Shield,
  Gift,
  Star,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface CheckoutItem {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  seller: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  isDefault: boolean;
  type: 'home' | 'office' | 'other';
}

interface PaymentMethod {
  id: string;
  type: 'mobile_banking' | 'card' | 'cod' | 'digital_wallet';
  name: string;
  bengaliName?: string;
  logo: string;
  fee?: number;
  description?: string;
  isPopular?: boolean;
}

interface ShippingOption {
  id: string;
  name: string;
  bengaliName?: string;
  price: number;
  duration: string;
  description: string;
  isExpress?: boolean;
}

interface CheckoutProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const Checkout: React.FC<CheckoutProps> = ({
  className = '',
  language = 'en'
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const checkoutItems: CheckoutItem[] = [
    {
      id: '1',
      title: 'Premium Wireless Headphones',
      bengaliTitle: 'প্রিমিয়াম ওয়্যারলেস হেডফোন',
      price: 2850,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
      variant: 'Black, Standard',
      seller: 'TechGear BD'
    },
    {
      id: '2',
      title: 'Smart Fitness Watch',
      bengaliTitle: 'স্মার্ট ফিটনেস ওয়াচ',
      price: 3200,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
      variant: 'Silver, 42mm',
      seller: 'FitTech Store'
    }
  ];

  const addresses: Address[] = [
    {
      id: '1',
      name: 'রহিম উদ্দিন',
      phone: '+8801712345678',
      address: 'হাউস ১২৩, রোড ৮, ব্লক এ',
      city: 'ঢাকা',
      area: 'বনানী',
      postalCode: '1213',
      isDefault: true,
      type: 'home'
    },
    {
      id: '2',
      name: 'অফিস ঠিকানা',
      phone: '+8801812345678',
      address: 'অফিস ৪৫৬, গুলশান অ্যাভিনিউ',
      city: 'ঢাকা',
      area: 'গুলশান',
      postalCode: '1212',
      isDefault: false,
      type: 'office'
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bkash',
      type: 'mobile_banking',
      name: 'bKash',
      bengaliName: 'বিকাশ',
      logo: '💳',
      description: 'Pay with bKash mobile banking',
      isPopular: true
    },
    {
      id: 'nagad',
      type: 'mobile_banking',
      name: 'Nagad',
      bengaliName: 'নগদ',
      logo: '📱',
      description: 'Pay with Nagad mobile banking'
    },
    {
      id: 'rocket',
      type: 'mobile_banking',
      name: 'Rocket',
      bengaliName: 'রকেট',
      logo: '🚀',
      description: 'Pay with Rocket mobile banking'
    },
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      bengaliName: 'ক্রেডিট/ডেবিট কার্ড',
      logo: '💳',
      fee: 25,
      description: 'Visa, MasterCard, AMEX accepted'
    },
    {
      id: 'cod',
      type: 'cod',
      name: 'Cash on Delivery',
      bengaliName: 'ক্যাশ অন ডেলিভারি',
      logo: '💰',
      fee: 30,
      description: 'Pay when you receive'
    }
  ];

  const shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      bengaliName: 'সাধারণ ডেলিভারি',
      price: 0,
      duration: '3-5 days',
      description: 'Free delivery for orders above ৳2000'
    },
    {
      id: 'express',
      name: 'Express Delivery',
      bengaliName: 'এক্সপ্রেস ডেলিভারি',
      price: 150,
      duration: '1-2 days',
      description: 'Fast delivery within Dhaka',
      isExpress: true
    },
    {
      id: 'same_day',
      name: 'Same Day Delivery',
      bengaliName: 'একই দিনে ডেলিভারি',
      price: 300,
      duration: 'Today',
      description: 'Available in selected areas',
      isExpress: true
    }
  ];

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = selectedShipping ? shippingOptions.find(s => s.id === selectedShipping)?.price || 0 : 0;
  const paymentFee = selectedPayment ? paymentMethods.find(p => p.id === selectedPayment)?.fee || 0 : 0;
  const discount = appliedCoupon === 'SAVE10' ? subtotal * 0.1 : 0;
  const total = subtotal + shippingCost + paymentFee - discount;

  const steps = [
    { id: 1, title: language === 'bn' ? 'ঠিকানা' : 'Address', icon: <MapPin className="w-5 h-5" /> },
    { id: 2, title: language === 'bn' ? 'শিপিং' : 'Shipping', icon: <Truck className="w-5 h-5" /> },
    { id: 3, title: language === 'bn' ? 'পেমেন্ট' : 'Payment', icon: <CreditCard className="w-5 h-5" /> },
    { id: 4, title: language === 'bn' ? 'রিভিউ' : 'Review', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setAppliedCoupon('SAVE10');
      setCouponCode('');
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedAddress !== null;
      case 2: return selectedShipping !== null;
      case 3: return selectedPayment !== null;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className={`checkout ${className}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Checkout Process */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        currentStep >= step.id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > step.id ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="ml-3 hidden sm:block">
                        <div className={`text-sm font-medium ${
                          currentStep >= step.id ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {step.title}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-12 h-1 mx-4 ${
                          currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {steps[currentStep - 1].icon}
                  {steps[currentStep - 1].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Step 1: Address Selection */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">
                        {language === 'bn' ? 'ডেলিভারি ঠিকানা নির্বাচন করুন' : 'Select Delivery Address'}
                      </h3>
                      <Button variant="outline" onClick={() => setShowAddressForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {language === 'bn' ? 'নতুন ঠিকানা' : 'Add New'}
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedAddress === address.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedAddress(address.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{address.name}</span>
                                {address.isDefault && (
                                  <Badge className="bg-green-600 text-white text-xs">
                                    {language === 'bn' ? 'ডিফল্ট' : 'Default'}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {address.type}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm mb-1">{address.phone}</p>
                              <p className="text-gray-700 text-sm">
                                {address.address}, {address.area}, {address.city} - {address.postalCode}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {showAddressForm && (
                      <Card className="border-2 border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {language === 'bn' ? 'নতুন ঠিকানা যোগ করুন' : 'Add New Address'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <Input placeholder={language === 'bn' ? 'নাম' : 'Full Name'} />
                            <Input placeholder={language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'} />
                          </div>
                          <Input placeholder={language === 'bn' ? 'সম্পূর্ণ ঠিকানা' : 'Full Address'} />
                          <div className="grid md:grid-cols-3 gap-4">
                            <Input placeholder={language === 'bn' ? 'শহর' : 'City'} />
                            <Input placeholder={language === 'bn' ? 'এলাকা' : 'Area'} />
                            <Input placeholder={language === 'bn' ? 'পোস্টাল কোড' : 'Postal Code'} />
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1">
                              {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Address'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddressForm(false)}>
                              {language === 'bn' ? 'বাতিল' : 'Cancel'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Step 2: Shipping Options */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">
                      {language === 'bn' ? 'শিপিং অপশন নির্বাচন করুন' : 'Select Shipping Option'}
                    </h3>

                    <div className="space-y-3">
                      {shippingOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedShipping === option.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedShipping(option.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {language === 'bn' && option.bengaliName ? option.bengaliName : option.name}
                                </span>
                                {option.isExpress && (
                                  <Badge className="bg-orange-500 text-white text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Express
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{option.description}</p>
                              <p className="text-sm text-gray-700 mt-1">
                                {language === 'bn' ? 'ডেলিভারি সময়:' : 'Delivery:'} {option.duration}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold">
                                {option.price === 0 
                                  ? (language === 'bn' ? 'ফ্রি' : 'Free')
                                  : `৳${option.price}`
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Methods */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">
                      {language === 'bn' ? 'পেমেন্ট পদ্ধতি নির্বাচন করুন' : 'Select Payment Method'}
                    </h3>

                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedPayment === method.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPayment(method.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{method.logo}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {language === 'bn' && method.bengaliName ? method.bengaliName : method.name}
                                  </span>
                                  {method.isPopular && (
                                    <Badge className="bg-green-600 text-white text-xs">
                                      <Star className="w-3 h-3 mr-1" />
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{method.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {method.fee ? (
                                <span className="text-sm text-red-600">
                                  +৳{method.fee} {language === 'bn' ? 'ফি' : 'fee'}
                                </span>
                              ) : (
                                <span className="text-sm text-green-600">
                                  {language === 'bn' ? 'কোন ফি নেই' : 'No fee'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Review Order */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="font-semibold">
                      {language === 'bn' ? 'অর্ডার রিভিউ করুন' : 'Review Your Order'}
                    </h3>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium mb-3">
                        {language === 'bn' ? 'অর্ডার আইটেম' : 'Order Items'}
                      </h4>
                      <div className="space-y-3">
                        {checkoutItems.map((item) => (
                          <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded">
                            <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                            <div className="flex-1">
                              <h5 className="font-medium">
                                {language === 'bn' && item.bengaliTitle ? item.bengaliTitle : item.title}
                              </h5>
                              <p className="text-sm text-gray-600">{item.variant}</p>
                              <p className="text-sm text-gray-600">
                                {language === 'bn' ? 'পরিমাণ:' : 'Qty:'} {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold">৳{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <h4 className="font-medium mb-3">
                        {language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
                      </h4>
                      {selectedAddress && (() => {
                        const address = addresses.find(a => a.id === selectedAddress);
                        return address ? (
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="font-medium">{address.name}</p>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                            <p className="text-sm">{address.address}, {address.area}, {address.city}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Payment & Shipping */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-3">
                          {language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
                        </h4>
                        {selectedPayment && (() => {
                          const payment = paymentMethods.find(p => p.id === selectedPayment);
                          return payment ? (
                            <div className="p-3 bg-gray-50 rounded">
                              <p className="font-medium">
                                {language === 'bn' && payment.bengaliName ? payment.bengaliName : payment.name}
                              </p>
                            </div>
                          ) : null;
                        })()}
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">
                          {language === 'bn' ? 'শিপিং' : 'Shipping'}
                        </h4>
                        {selectedShipping && (() => {
                          const shipping = shippingOptions.find(s => s.id === selectedShipping);
                          return shipping ? (
                            <div className="p-3 bg-gray-50 rounded">
                              <p className="font-medium">
                                {language === 'bn' && shipping.bengaliName ? shipping.bengaliName : shipping.name}
                              </p>
                              <p className="text-sm text-gray-600">{shipping.duration}</p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                  </Button>

                  {currentStep < 4 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={!canProceed()}
                    >
                      {language === 'bn' ? 'পরবর্তী' : 'Next'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {language === 'bn' ? 'অর্ডার নিশ্চিত করুন' : 'Place Order'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
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
                      {shippingCost === 0 
                        ? (language === 'bn' ? 'ফ্রি' : 'Free')
                        : `৳${shippingCost}`
                      }
                    </span>
                  </div>

                  {paymentFee > 0 && (
                    <div className="flex justify-between">
                      <span>{language === 'bn' ? 'পেমেন্ট ফি:' : 'Payment Fee:'}</span>
                      <span>৳{paymentFee}</span>
                    </div>
                  )}
                  
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

                {/* Security */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {language === 'bn' ? 'নিরাপদ চেকআউট' : 'Secure Checkout'}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    {language === 'bn' 
                      ? 'আপনার তথ্য SSL এনক্রিপশন দ্বারা সুরক্ষিত'
                      : 'Your information is protected by SSL encryption'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;