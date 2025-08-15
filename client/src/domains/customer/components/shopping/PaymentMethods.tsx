/**
 * Payment Methods Component
 * Bangladesh payment integration with mobile banking and security validation
 * Implements Amazon.com/Shopee.sg-level payment experience
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  CreditCard, 
  Smartphone, 
  Wallet,
  Banknote,
  Shield,
  Star,
  Check,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  HelpCircle
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'mobile_banking' | 'card' | 'digital_wallet' | 'bank_transfer' | 'cod';
  name: string;
  bengaliName?: string;
  logo: string;
  description: string;
  bengaliDescription?: string;
  processingTime: string;
  fee: number;
  minAmount?: number;
  maxAmount?: number;
  isPopular?: boolean;
  isRecommended?: boolean;
  securityFeatures: string[];
  instructions?: string[];
}

interface SavedPaymentMethod {
  id: string;
  type: string;
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

interface PaymentMethodsProps {
  amount: number;
  className?: string;
  language?: 'en' | 'bn';
  onPaymentSelect?: (method: PaymentMethod) => void;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  amount = 6050,
  className = '',
  language = 'en',
  onPaymentSelect
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>({});
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bkash',
      type: 'mobile_banking',
      name: 'bKash',
      bengaliName: 'বিকাশ',
      logo: '📱',
      description: 'Pay securely with bKash mobile banking',
      bengaliDescription: 'বিকাশ মোবাইল ব্যাংকিং দিয়ে নিরাপদে পেমেন্ট করুন',
      processingTime: 'Instant',
      fee: 0,
      maxAmount: 150000,
      isPopular: true,
      isRecommended: true,
      securityFeatures: ['PIN Protection', 'SMS Verification', 'Fraud Detection'],
      instructions: [
        'Enter your bKash mobile number',
        'You will receive an OTP on your phone',
        'Enter OTP and bKash PIN to complete payment'
      ]
    },
    {
      id: 'nagad',
      type: 'mobile_banking',
      name: 'Nagad',
      bengaliName: 'নগদ',
      logo: '💰',
      description: 'Pay with Nagad mobile financial service',
      bengaliDescription: 'নগদ মোবাইল ফিন্যান্সিয়াল সার্ভিস দিয়ে পেমেন্ট করুন',
      processingTime: 'Instant',
      fee: 0,
      maxAmount: 200000,
      isPopular: true,
      securityFeatures: ['Biometric Security', 'PIN Protection', 'Real-time Monitoring'],
      instructions: [
        'Enter your Nagad mobile number',
        'Verify with fingerprint or PIN',
        'Confirm payment amount'
      ]
    },
    {
      id: 'rocket',
      type: 'mobile_banking',
      name: 'Rocket',
      bengaliName: 'রকেট',
      logo: '🚀',
      description: 'Dutch-Bangla Bank Rocket payment',
      bengaliDescription: 'ডাচ-বাংলা ব্যাংক রকেট পেমেন্ট',
      processingTime: 'Instant',
      fee: 0,
      maxAmount: 100000,
      securityFeatures: ['PIN Protection', 'Transaction Limit', 'SMS Alert'],
      instructions: [
        'Dial *322# from your Rocket number',
        'Select payment option',
        'Enter merchant code and amount'
      ]
    },
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      bengaliName: 'ক্রেডিট/ডেবিট কার্ড',
      logo: '💳',
      description: 'Visa, MasterCard, AMEX accepted',
      bengaliDescription: 'ভিসা, মাস্টারকার্ড, AMEX গ্রহণযোগ্য',
      processingTime: '1-2 minutes',
      fee: 25,
      securityFeatures: ['3D Secure', 'CVV Verification', 'Fraud Protection'],
      instructions: [
        'Enter your card details',
        'Verify with CVV and expiry date',
        'Complete 3D Secure authentication'
      ]
    },
    {
      id: 'upay',
      type: 'digital_wallet',
      name: 'Upay',
      bengaliName: 'উপায়',
      logo: '📲',
      description: 'UCB Upay digital wallet',
      bengaliDescription: 'UCB উপায় ডিজিটাল ওয়ালেট',
      processingTime: 'Instant',
      fee: 0,
      maxAmount: 75000,
      securityFeatures: ['PIN Protection', 'Biometric Login', 'Transaction Monitoring']
    },
    {
      id: 'bank_transfer',
      type: 'bank_transfer',
      name: 'Bank Transfer',
      bengaliName: 'ব্যাংক ট্রান্সফার',
      logo: '🏦',
      description: 'Direct bank account transfer',
      bengaliDescription: 'সরাসরি ব্যাংক অ্যাকাউন্ট ট্রান্সফার',
      processingTime: '2-4 hours',
      fee: 15,
      securityFeatures: ['Bank Grade Security', 'Account Verification', 'Encrypted Transfer']
    },
    {
      id: 'cod',
      type: 'cod',
      name: 'Cash on Delivery',
      bengaliName: 'ক্যাশ অন ডেলিভারি',
      logo: '💵',
      description: 'Pay when you receive your order',
      bengaliDescription: 'অর্ডার পাওয়ার সময় পেমেন্ট করুন',
      processingTime: 'On delivery',
      fee: 30,
      maxAmount: 50000,
      securityFeatures: ['Delivery Verification', 'Amount Verification', 'Receipt Generation']
    }
  ];

  const savedMethods: SavedPaymentMethod[] = [
    {
      id: 'saved_bkash',
      type: 'bKash',
      name: '+8801712345678',
      isDefault: true
    },
    {
      id: 'saved_card',
      type: 'Visa',
      name: 'Visa ending in 4532',
      lastFour: '4532',
      expiryDate: '12/26',
      isDefault: false
    }
  ];

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method.id);
    onPaymentSelect?.(method);
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const method = paymentMethods.find(m => m.id === selectedMethod);
    console.log('Processing payment with:', method?.name, 'Amount:', amount);
    
    setIsProcessing(false);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'mobile_banking': return <Smartphone className="w-5 h-5" />;
      case 'card': return <CreditCard className="w-5 h-5" />;
      case 'digital_wallet': return <Wallet className="w-5 h-5" />;
      case 'bank_transfer': return <Banknote className="w-5 h-5" />;
      case 'cod': return <Banknote className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const getTypeName = (type: string) => {
    if (language === 'bn') {
      switch (type) {
        case 'mobile_banking': return 'মোবাইল ব্যাংকিং';
        case 'card': return 'কার্ড পেমেন্ট';
        case 'digital_wallet': return 'ডিজিটাল ওয়ালেট';
        case 'bank_transfer': return 'ব্যাংক ট্রান্সফার';
        case 'cod': return 'ক্যাশ অন ডেলিভারি';
        default: return 'অন্যান্য';
      }
    }
    
    switch (type) {
      case 'mobile_banking': return 'Mobile Banking';
      case 'card': return 'Card Payment';
      case 'digital_wallet': return 'Digital Wallet';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cod': return 'Cash on Delivery';
      default: return 'Other';
    }
  };

  const availableMethods = paymentMethods.filter(method => 
    !method.maxAmount || amount <= method.maxAmount
  );

  const groupedMethods = availableMethods.reduce((groups, method) => {
    const type = method.type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(method);
    return groups;
  }, {} as Record<string, PaymentMethod[]>);

  return (
    <div className={`payment-methods ${className}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {language === 'bn' ? 'পেমেন্ট পদ্ধতি নির্বাচন করুন' : 'Select Payment Method'}
              </h1>
              <p className="text-gray-600">
                {language === 'bn' 
                  ? `৳${amount.toLocaleString()} টাকার জন্য নিরাপদ পেমেন্ট পদ্ধতি বেছে নিন`
                  : `Choose a secure payment method for ৳${amount.toLocaleString()}`}
              </p>
            </div>

            {/* Saved Payment Methods */}
            {savedMethods.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    {language === 'bn' ? 'সংরক্ষিত পেমেন্ট পদ্ধতি' : 'Saved Payment Methods'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {savedMethods.map((saved) => (
                      <div
                        key={saved.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedMethod === saved.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedMethod(saved.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-gray-300 rounded flex items-center justify-center text-xs font-bold">
                              {saved.type}
                            </div>
                            <div>
                              <div className="font-medium">{saved.name}</div>
                              {saved.expiryDate && (
                                <div className="text-sm text-gray-600">
                                  {language === 'bn' ? 'মেয়াদ:' : 'Expires:'} {saved.expiryDate}
                                </div>
                              )}
                            </div>
                          </div>
                          {saved.isDefault && (
                            <Badge className="bg-green-600 text-white">
                              {language === 'bn' ? 'ডিফল্ট' : 'Default'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Method Tabs */}
            <Tabs defaultValue="mobile_banking" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mobile_banking" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {language === 'bn' ? 'মোবাইল ব্যাংকিং' : 'Mobile Banking'}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {language === 'bn' ? 'কার্ড' : 'Cards'}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="other" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {language === 'bn' ? 'অন্যান্য' : 'Other'}
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Mobile Banking */}
              <TabsContent value="mobile_banking">
                <div className="space-y-4">
                  {groupedMethods.mobile_banking?.map((method) => (
                    <Card key={method.id} className={`cursor-pointer transition-all ${
                      selectedMethod === method.id ? 'ring-2 ring-blue-500' : ''
                    }`} onClick={() => handleMethodSelect(method)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{method.logo}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {language === 'bn' && method.bengaliName ? method.bengaliName : method.name}
                                </span>
                                {method.isRecommended && (
                                  <Badge className="bg-green-600 text-white text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    {language === 'bn' ? 'সুপারিশ' : 'Recommended'}
                                  </Badge>
                                )}
                                {method.isPopular && (
                                  <Badge className="bg-orange-500 text-white text-xs">
                                    {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {language === 'bn' && method.bengaliDescription ? method.bengaliDescription : method.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {method.fee === 0 
                                ? (language === 'bn' ? 'ফ্রি' : 'Free')
                                : `৳${method.fee} ${language === 'bn' ? 'ফি' : 'fee'}`
                              }
                            </div>
                            <div className="text-xs text-gray-600">{method.processingTime}</div>
                          </div>
                        </div>

                        {selectedMethod === method.id && (
                          <div className="border-t pt-4 space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                              </label>
                              <Input
                                placeholder={language === 'bn' ? '০১৭xxxxxxxx' : '017xxxxxxxx'}
                                value={paymentData.mobile || ''}
                                onChange={(e) => setPaymentData({...paymentData, mobile: e.target.value})}
                              />
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 p-3 rounded">
                              <h4 className="font-medium text-blue-800 mb-2">
                                {language === 'bn' ? 'পেমেন্ট প্রক্রিয়া:' : 'Payment Process:'}
                              </h4>
                              <ol className="text-sm text-blue-700 space-y-1">
                                {method.instructions?.map((instruction, index) => (
                                  <li key={index}>{index + 1}. {instruction}</li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Card Payment */}
              <TabsContent value="card">
                <div className="space-y-4">
                  {groupedMethods.card?.map((method) => (
                    <Card key={method.id} className={`cursor-pointer transition-all ${
                      selectedMethod === method.id ? 'ring-2 ring-blue-500' : ''
                    }`} onClick={() => handleMethodSelect(method)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{method.logo}</span>
                            <div>
                              <span className="font-semibold">
                                {language === 'bn' && method.bengaliName ? method.bengaliName : method.name}
                              </span>
                              <p className="text-sm text-gray-600">
                                {language === 'bn' && method.bengaliDescription ? method.bengaliDescription : method.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-red-600">
                              +৳{method.fee} {language === 'bn' ? 'ফি' : 'fee'}
                            </div>
                            <div className="text-xs text-gray-600">{method.processingTime}</div>
                          </div>
                        </div>

                        {selectedMethod === method.id && (
                          <div className="border-t pt-4 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  {language === 'bn' ? 'কার্ড নম্বর' : 'Card Number'}
                                </label>
                                <Input
                                  placeholder="1234 5678 9012 3456"
                                  value={paymentData.cardNumber || ''}
                                  onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  {language === 'bn' ? 'কার্ডহোল্ডারের নাম' : 'Cardholder Name'}
                                </label>
                                <Input
                                  placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter name'}
                                  value={paymentData.cardName || ''}
                                  onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  {language === 'bn' ? 'মেয়াদ' : 'Expiry Date'}
                                </label>
                                <Input
                                  placeholder="MM/YY"
                                  value={paymentData.expiry || ''}
                                  onChange={(e) => setPaymentData({...paymentData, expiry: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  CVV
                                  <HelpCircle className="w-3 h-3 inline ml-1 text-gray-400" />
                                </label>
                                <div className="relative">
                                  <Input
                                    type={showCardDetails ? 'text' : 'password'}
                                    placeholder="123"
                                    value={paymentData.cvv || ''}
                                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowCardDetails(!showCardDetails)}
                                  >
                                    {showCardDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="bg-yellow-50 p-3 rounded">
                              <div className="flex items-center gap-2 text-yellow-800">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {language === 'bn' ? '3D সিকিউর যাচাইকরণ' : '3D Secure Verification'}
                                </span>
                              </div>
                              <p className="text-xs text-yellow-700 mt-1">
                                {language === 'bn' 
                                  ? 'আপনার কার্ড অতিরিক্ত নিরাপত্তার জন্য 3D সিকিউর ব্যবহার করে'
                                  : 'Your card uses 3D Secure for additional security'}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Other Methods */}
              <TabsContent value="other">
                <div className="space-y-4">
                  {[...groupedMethods.digital_wallet || [], ...groupedMethods.bank_transfer || [], ...groupedMethods.cod || []].map((method) => (
                    <Card key={method.id} className={`cursor-pointer transition-all ${
                      selectedMethod === method.id ? 'ring-2 ring-blue-500' : ''
                    }`} onClick={() => handleMethodSelect(method)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{method.logo}</span>
                            <div>
                              <span className="font-semibold">
                                {language === 'bn' && method.bengaliName ? method.bengaliName : method.name}
                              </span>
                              <p className="text-sm text-gray-600">
                                {language === 'bn' && method.bengaliDescription ? method.bengaliDescription : method.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {method.fee === 0 
                                ? (language === 'bn' ? 'ফ্রি' : 'Free')
                                : `৳${method.fee} ${language === 'bn' ? 'ফি' : 'fee'}`
                              }
                            </div>
                            <div className="text-xs text-gray-600">{method.processingTime}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>
                  {language === 'bn' ? 'পেমেন্ট সারাংশ' : 'Payment Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{language === 'bn' ? 'অর্ডার পরিমাণ:' : 'Order Amount:'}</span>
                    <span>৳{amount.toLocaleString()}</span>
                  </div>
                  
                  {selectedMethod && (() => {
                    const method = paymentMethods.find(m => m.id === selectedMethod);
                    return method?.fee ? (
                      <div className="flex justify-between">
                        <span>{language === 'bn' ? 'পেমেন্ট ফি:' : 'Payment Fee:'}</span>
                        <span>৳{method.fee}</span>
                      </div>
                    ) : null;
                  })()}
                  
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>{language === 'bn' ? 'মোট:' : 'Total:'}</span>
                    <span className="text-blue-600">
                      ৳{(amount + (selectedMethod ? paymentMethods.find(m => m.id === selectedMethod)?.fee || 0 : 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Security Features */}
                {selectedMethod && (() => {
                  const method = paymentMethods.find(m => m.id === selectedMethod);
                  return method ? (
                    <div className="bg-green-50 p-3 rounded">
                      <div className="flex items-center gap-2 text-green-800 mb-2">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {language === 'bn' ? 'নিরাপত্তা বৈশিষ্ট্য' : 'Security Features'}
                        </span>
                      </div>
                      <ul className="text-xs text-green-700 space-y-1">
                        {method.securityFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                })()}

                {/* SSL Security */}
                <div className="bg-blue-50 p-3 rounded">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {language === 'bn' ? 'SSL এনক্রিপশন' : 'SSL Encryption'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    {language === 'bn' 
                      ? 'আপনার তথ্য 256-বিট SSL এনক্রিপশন দ্বারা সুরক্ষিত'
                      : 'Your information is protected by 256-bit SSL encryption'}
                  </p>
                </div>

                {/* Pay Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!selectedMethod || isProcessing}
                  onClick={handlePayment}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {language === 'bn' ? 'প্রক্রিয়াকরণ...' : 'Processing...'}
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      {language === 'bn' ? 'নিরাপদে পেমেন্ট করুন' : 'Pay Securely'}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-600 text-center">
                  {language === 'bn' 
                    ? 'পেমেন্ট করার মাধ্যমে আপনি আমাদের শর্তাবলী স্বীকার করছেন'
                    : 'By proceeding, you agree to our terms and conditions'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;