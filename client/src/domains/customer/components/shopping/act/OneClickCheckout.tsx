/**
 * Phase 3: Act Stage - One Click Checkout
 * Amazon.com 5 A's Framework Implementation
 * Amazon-style One-Click Ordering with Bangladesh Integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Zap, 
  CreditCard, 
  MapPin, 
  Truck, 
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Heart,
  Gift,
  Phone,
  Wallet,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OneClickCheckoutProps {
  productId?: string;
  className?: string;
}

interface CheckoutData {
  product: Product;
  user: UserProfile;
  savedAddresses: Address[];
  paymentMethods: PaymentMethod[];
  shippingOptions: ShippingOption[];
  orderSummary: OrderSummary;
  securityCheck: SecurityCheck;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  inStock: boolean;
  quantity: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  loyaltyTier: string;
  oneClickEnabled: boolean;
  defaultAddress: string;
  defaultPayment: string;
}

interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  address: string;
  city: string;
  area: string;
  phone: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'mobile-banking' | 'card' | 'wallet';
  provider: string;
  displayName: string;
  lastFour?: string;
  isDefault: boolean;
  logo: string;
  fees: number;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  price: number;
  recommended: boolean;
  features: string[];
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  savings: number;
}

interface SecurityCheck {
  phoneVerified: boolean;
  emailVerified: boolean;
  addressVerified: boolean;
  paymentVerified: boolean;
  riskScore: number;
  requiresVerification: boolean;
}

const OneClickCheckout: React.FC<OneClickCheckoutProps> = ({
  productId,
  className,
}) => {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load checkout data
    const loadCheckoutData = () => {
      const mockData: CheckoutData = {
        product: {
          id: productId || '1',
          name: 'Premium Wireless Gaming Headset',
          price: 12500,
          originalPrice: 18000,
          image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=300',
          rating: 4.8,
          inStock: true,
          quantity: 1
        },
        user: {
          id: 'user1',
          name: 'Ahmed Rahman',
          email: 'ahmed@example.com',
          phone: '+8801712345678',
          verified: true,
          loyaltyTier: 'Gold',
          oneClickEnabled: true,
          defaultAddress: 'addr1',
          defaultPayment: 'pay1'
        },
        savedAddresses: [
          {
            id: 'addr1',
            type: 'home',
            name: 'Ahmed Rahman',
            address: 'House 123, Road 45, Gulshan-2',
            city: 'Dhaka',
            area: 'Gulshan',
            phone: '+8801712345678',
            isDefault: true
          },
          {
            id: 'addr2',
            type: 'office',
            name: 'Ahmed Rahman',
            address: 'Office 567, Building ABC, Motijheel',
            city: 'Dhaka',
            area: 'Motijheel',
            phone: '+8801712345679',
            isDefault: false
          }
        ],
        paymentMethods: [
          {
            id: 'pay1',
            type: 'mobile-banking',
            provider: 'bKash',
            displayName: 'bKash (****5678)',
            lastFour: '5678',
            isDefault: true,
            logo: '📱',
            fees: 0
          },
          {
            id: 'pay2',
            type: 'mobile-banking',
            provider: 'Nagad',
            displayName: 'Nagad (****9012)',
            lastFour: '9012',
            isDefault: false,
            logo: '💳',
            fees: 15
          },
          {
            id: 'pay3',
            type: 'card',
            provider: 'Visa',
            displayName: 'DBBL Visa (****3456)',
            lastFour: '3456',
            isDefault: false,
            logo: '💳',
            fees: 125
          }
        ],
        shippingOptions: [
          {
            id: 'express',
            name: 'Express Delivery',
            description: 'Same day delivery in Dhaka',
            estimatedDays: 'Today',
            price: 100,
            recommended: true,
            features: ['GPS Tracking', 'SMS Updates', 'Call on Arrival']
          },
          {
            id: 'standard',
            name: 'Standard Delivery',
            description: 'Regular delivery service',
            estimatedDays: '1-2 days',
            price: 60,
            recommended: false,
            features: ['SMS Updates', 'Call Confirmation']
          },
          {
            id: 'free',
            name: 'Free Delivery',
            description: 'Free delivery for orders over ৳1000',
            estimatedDays: '2-3 days',
            price: 0,
            recommended: false,
            features: ['Basic Tracking']
          }
        ],
        orderSummary: {
          subtotal: 12500,
          shipping: 100,
          tax: 0,
          discount: 500,
          total: 12100,
          savings: 6400
        },
        securityCheck: {
          phoneVerified: true,
          emailVerified: true,
          addressVerified: true,
          paymentVerified: true,
          riskScore: 15,
          requiresVerification: false
        }
      };

      setTimeout(() => {
        setCheckoutData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadCheckoutData();
  }, [productId]);

  const handleOneClickOrder = async () => {
    if (!checkoutData) return;

    setIsProcessing(true);

    // Security verification if needed
    if (checkoutData.securityCheck.requiresVerification) {
      setVerificationStep('phone');
      setTimeout(() => {
        setVerificationStep('payment');
        setTimeout(() => {
          setVerificationStep(null);
          completeOrder();
        }, 2000);
      }, 2000);
    } else {
      setTimeout(() => {
        completeOrder();
      }, 3000);
    }
  };

  const completeOrder = () => {
    setIsProcessing(false);
    setOrderPlaced(true);
    
    // Simulate order confirmation
    setTimeout(() => {
      alert('Order confirmed! Order ID: #GT-2025-0001');
    }, 1000);
  };

  if (loading) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Checkout Unavailable</h3>
            <p className="text-muted-foreground">
              Unable to load checkout information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <Card className="text-center py-12 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent>
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your order has been confirmed and is being processed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-primary">GT-2025-0001</div>
                <div className="text-sm text-muted-foreground">Order Number</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">Today</div>
                <div className="text-sm text-muted-foreground">Estimated Delivery</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">৳{checkoutData.orderSummary.total.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Paid</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button>
                Track Order
              </Button>
              <Button variant="outline">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Zap className="h-6 w-6 text-orange-500" />
          One-Click Checkout
        </h1>
        <p className="text-muted-foreground">
          Complete your purchase with Amazon-style one-click ordering
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Summary</span>
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  In Stock
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img
                  src={checkoutData.product.image}
                  alt={checkoutData.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{checkoutData.product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{checkoutData.product.rating}</span>
                    <span className="text-sm text-muted-foreground">• Quantity: {checkoutData.product.quantity}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-primary">
                      ৳{checkoutData.product.price.toLocaleString()}
                    </span>
                    {checkoutData.product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ৳{checkoutData.product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">{checkoutData.savedAddresses[0].name}</p>
                    <p className="text-sm text-muted-foreground">{checkoutData.savedAddresses[0].address}</p>
                    <p className="text-sm text-muted-foreground">{checkoutData.savedAddresses[0].city}, {checkoutData.savedAddresses[0].area}</p>
                    <p className="text-sm text-muted-foreground">{checkoutData.savedAddresses[0].phone}</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Shipping Option</h4>
                  {checkoutData.shippingOptions
                    .filter(option => option.recommended)
                    .map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium">{option.name}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                          <div className="flex gap-1 mt-1">
                            {option.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {option.price === 0 ? 'FREE' : `৳${option.price}`}
                          </p>
                          <p className="text-sm text-muted-foreground">{option.estimatedDays}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{checkoutData.paymentMethods[0].logo}</div>
                  <div>
                    <p className="font-medium">{checkoutData.paymentMethods[0].displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {checkoutData.paymentMethods[0].fees === 0 ? 'No fees' : `৳${checkoutData.paymentMethods[0].fees} fee`}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Action */}
        <div className="space-y-6">
          {/* Security Check */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone Verified</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verified</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Address Verified</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Risk Score</span>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    {checkoutData.securityCheck.riskScore}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Order Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳{checkoutData.orderSummary.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>৳{checkoutData.orderSummary.shipping}</span>
                </div>
                {checkoutData.orderSummary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-৳{checkoutData.orderSummary.discount}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">৳{checkoutData.orderSummary.total.toLocaleString()}</span>
                </div>
                {checkoutData.orderSummary.savings > 0 && (
                  <div className="text-center text-green-600 text-sm">
                    You save ৳{checkoutData.orderSummary.savings.toLocaleString()}!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* One-Click Order Button */}
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              {isProcessing ? (
                <div className="text-center space-y-4">
                  <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
                  {verificationStep ? (
                    <div>
                      <p className="font-semibold">Verifying {verificationStep}...</p>
                      <Progress value={50} className="mt-2 bg-white/20" />
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">Processing Order...</p>
                      <p className="text-sm opacity-90">Securing your payment</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={handleOneClickOrder}
                    className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg py-6"
                    disabled={!checkoutData.user.oneClickEnabled}
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Order with 1-Click
                  </Button>
                  
                  <div className="text-center text-sm opacity-90">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Lock className="h-3 w-3" />
                      <span>Secure & Fast Checkout</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>2-sec checkout</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>256-bit SSL</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alternative Actions */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full">
              <Heart className="h-4 w-4 mr-2" />
              Save for Later
            </Button>
            <Button variant="outline" className="w-full">
              <Gift className="h-4 w-4 mr-2" />
              Send as Gift
            </Button>
          </div>

          {/* Trust Indicators */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>30-Day Return Policy</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-blue-500" />
                  <span>Free Express Shipping</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-purple-500" />
                  <span>24/7 Customer Support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OneClickCheckout;