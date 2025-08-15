/**
 * OneClickCheckout - Amazon.com Patented One-Click Ordering System
 * Phase 1 Week 3-4: Component Modernization
 * Features: Single-click ordering, smart defaults, express checkout, payment validation
 */

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Zap, Shield, Truck, CreditCard, MapPin, Clock, CheckCircle, Gift, Lock, Fingerprint, Smartphone, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

// Security validation interface
interface SecurityValidation {
  biometricAuth: boolean;
  deviceTrust: boolean;
  fraudCheck: boolean;
  smsVerification: boolean;
  riskScore: number;
}

const OneClickCheckout: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkoutStartTime, setCheckoutStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [securityValidation, setSecurityValidation] = useState<SecurityValidation>({
    biometricAuth: false,
    deviceTrust: false,
    fraudCheck: false,
    smsVerification: false,
    riskScore: 0
  });
  const [isSecurityVerified, setIsSecurityVerified] = useState(false);

  // Demo data for one-click checkout
  const demoProduct = {
    id: "1",
    name: "iPhone 16 Pro Max",
    price: 145000,
    originalPrice: 165000,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop",
    quantity: 1
  };

  const defaultAddress = {
    name: "আহমেদ হাসান",
    addressLine1: "হাউস নং ৪২, রোড নং ৭",
    city: "ঢাকা",
    district: "ঢাকা",
    phone: "০১৭১২৩৪৫৬৭৮"
  };

  const defaultPayment = {
    type: "bkash",
    name: "bKash",
    lastFour: "৫৬৭৮",
    icon: "🟠"
  };

  // Security validation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (checkoutStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - checkoutStartTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [checkoutStartTime]);

  // Automatic security validation (demo)
  const performSecurityValidation = async () => {
    setCheckoutStartTime(Date.now());
    
    // Simulate biometric authentication
    setTimeout(() => {
      setSecurityValidation(prev => ({ ...prev, biometricAuth: true }));
    }, 500);
    
    // Simulate device trust verification
    setTimeout(() => {
      setSecurityValidation(prev => ({ ...prev, deviceTrust: true }));
    }, 800);
    
    // Simulate fraud check
    setTimeout(() => {
      setSecurityValidation(prev => ({ ...prev, fraudCheck: true, riskScore: 15 }));
    }, 1200);
    
    // Simulate SMS verification
    setTimeout(() => {
      setSecurityValidation(prev => ({ ...prev, smsVerification: true }));
      setIsSecurityVerified(true);
    }, 1500);
  };

  const handleOneClickOrder = async () => {
    setIsProcessing(true);
    
    // Start security validation
    await performSecurityValidation();
    
    // Simulate order processing after security validation
    setTimeout(() => {
      setIsProcessing(false);
      setOrderPlaced(true);
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`;
  };

  if (orderPlaced) {
    return (
      <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-800 mb-2">অর্ডার সফল হয়েছে!</h3>
          <p className="text-green-700 mb-4">আপনার অর্ডার #GIT{Date.now().toString().slice(-6)} সফলভাবে প্রক্রিয়া করা হয়েছে</p>
          <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
            <Truck className="w-5 h-5" />
            <span>আগামীকাল বিকেলের মধ্যে ডেলিভারি</span>
          </div>
          {/* Sub-60s Checkout Success Display */}
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">
                চেকআউট সময়: {(elapsedTime / 1000).toFixed(1)}s
              </span>
              {elapsedTime < 60000 && (
                <Badge className="bg-green-600 text-white">
                  ✓ Sub-60s Success
                </Badge>
              )}
            </div>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              setOrderPlaced(false);
              setCheckoutStartTime(null);
              setElapsedTime(0);
              setSecurityValidation({
                biometricAuth: false,
                deviceTrust: false,
                fraudCheck: false,
                smsVerification: false,
                riskScore: 0
              });
              setIsSecurityVerified(false);
            }}
          >
            আরেকটি অর্ডার করুন
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          One-Click Checkout
        </h2>
        <p className="text-gray-600">Amazon.com-style instant ordering system</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <img
                src={demoProduct.image}
                alt={demoProduct.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{demoProduct.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-red-600">
                    {formatPrice(demoProduct.price)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(demoProduct.originalPrice)}
                  </span>
                  <Badge className="bg-orange-500">12% OFF</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Qty: {demoProduct.quantity}</span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Warranty Included</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Shipping Address */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Address
              </h4>
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="font-medium">{defaultAddress.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {defaultAddress.addressLine1}<br />
                  {defaultAddress.city}, {defaultAddress.district}<br />
                  মোবাইল: {defaultAddress.phone}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                  <Badge variant="outline" className="text-xs text-green-600">Verified</Badge>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Payment Method */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Method
              </h4>
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{defaultPayment.icon}</span>
                  <div>
                    <div className="font-medium">{defaultPayment.name}</div>
                    <div className="text-sm text-gray-600">
                      **** **** **** {defaultPayment.lastFour}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-auto text-xs">Default</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Total & One-Click */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              One-Click Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pricing Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(demoProduct.price)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(20000)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-green-600">FREE</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-red-600">{formatPrice(demoProduct.price)}</span>
              </div>
            </div>

            {/* Express Features */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">Tomorrow delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-800">Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Gift className="w-4 h-4 text-purple-600" />
                <span className="text-purple-800">Gift wrapping available</span>
              </div>
            </div>

            {/* Security Validation Section */}
            {isProcessing && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-800">Security Validation</span>
                </div>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 text-sm ${securityValidation.biometricAuth ? 'text-green-600' : 'text-gray-500'}`}>
                    <Fingerprint className="w-4 h-4" />
                    <span>Biometric Authentication</span>
                    {securityValidation.biometricAuth && <CheckCircle className="w-4 h-4 ml-auto" />}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${securityValidation.deviceTrust ? 'text-green-600' : 'text-gray-500'}`}>
                    <Smartphone className="w-4 h-4" />
                    <span>Device Trust Verification</span>
                    {securityValidation.deviceTrust && <CheckCircle className="w-4 h-4 ml-auto" />}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${securityValidation.fraudCheck ? 'text-green-600' : 'text-gray-500'}`}>
                    <Shield className="w-4 h-4" />
                    <span>Fraud Check (Risk: {securityValidation.riskScore}%)</span>
                    {securityValidation.fraudCheck && <CheckCircle className="w-4 h-4 ml-auto" />}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${securityValidation.smsVerification ? 'text-green-600' : 'text-gray-500'}`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>SMS Verification</span>
                    {securityValidation.smsVerification && <CheckCircle className="w-4 h-4 ml-auto" />}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-60s Checkout Timer */}
            {checkoutStartTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Checkout Timer</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-mono text-sm text-blue-800">
                      {(elapsedTime / 1000).toFixed(1)}s
                    </span>
                    {elapsedTime < 60000 && (
                      <Badge className="bg-blue-600 text-white text-xs">
                        On Track
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* One-Click Button */}
            <Button
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg"
              onClick={handleOneClickOrder}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Buy Now with 1-Click
                </div>
              )}
            </Button>

            {/* Trust Badges */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-green-600">
                <Clock className="w-3 h-3" />
                <span>Order within 2 hours for same-day processing</span>
              </div>
              <div className="text-xs text-gray-500">
                Protected by GetIt Buyer Protection
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OneClickCheckout;