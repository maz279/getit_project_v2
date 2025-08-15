// CheckoutFlow.tsx - Amazon.com/Shopee.sg-Level Checkout Experience
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, Check, CreditCard, Truck, Shield, Gift, AlertCircle, MapPin, Phone, Clock, Star, Zap } from 'lucide-react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  vendor: string;
  inStock: boolean;
  shippingTime: string;
}

interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'mobile' | 'card' | 'bank' | 'cod';
  name: string;
  icon: string;
  description: string;
  processingTime: string;
  fee?: number;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: React.ElementType;
}

const CheckoutFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Checkout - Complete Your Order | GetIt Bangladesh',
    description: 'Secure checkout with multiple payment options including mobile banking. Fast delivery across Bangladesh with order tracking.',
    keywords: 'checkout, secure payment, mobile banking, order, delivery, fast shipping, payment methods'
  });

  useEffect(() => {
    // Mock cart data
    const mockCartItems: CartItem[] = [
      {
        id: '1',
        name: 'Samsung Galaxy S24 Ultra',
        image: '/products/galaxy-s24.jpg',
        price: 125000,
        originalPrice: 140000,
        quantity: 1,
        vendor: 'TechWorld BD',
        inStock: true,
        shippingTime: '1-2 days'
      },
      {
        id: '2',
        name: 'Wireless Earbuds Pro',
        image: '/products/earbuds.jpg',
        price: 8500,
        quantity: 2,
        vendor: 'AudioHub',
        inStock: true,
        shippingTime: '2-3 days'
      }
    ];

    setCartItems(mockCartItems);

    // Set default shipping
    const defaultShipping: ShippingOption = {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Delivered within 2-3 business days',
      price: 60,
      estimatedDays: '2-3 days',
      icon: Truck
    };
    setSelectedShipping(defaultShipping);

    setLoading(false);
  }, []);

  const addresses: Address[] = [
    {
      id: '1',
      type: 'home',
      name: 'Home Address',
      phone: '+880 1711-123456',
      address: 'House 123, Road 15, Block A',
      area: 'Dhanmondi',
      city: 'Dhaka',
      postalCode: '1209',
      isDefault: true
    },
    {
      id: '2',
      type: 'office',
      name: 'Office Address',
      phone: '+880 1911-987654',
      address: 'Level 10, Office Tower',
      area: 'Gulshan',
      city: 'Dhaka',
      postalCode: '1212',
      isDefault: false
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bkash',
      type: 'mobile',
      name: 'bKash',
      icon: '/payments/bkash.png',
      description: 'Pay securely with bKash mobile banking',
      processingTime: 'Instant'
    },
    {
      id: 'nagad',
      type: 'mobile',
      name: 'Nagad',
      icon: '/payments/nagad.png',
      description: 'Fast and secure Nagad payment',
      processingTime: 'Instant'
    },
    {
      id: 'rocket',
      type: 'mobile',
      name: 'Rocket',
      icon: '/payments/rocket.png',
      description: 'Pay with Rocket mobile banking',
      processingTime: 'Instant'
    },
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: '/payments/card.png',
      description: 'Visa, MasterCard, American Express',
      processingTime: '1-2 minutes'
    },
    {
      id: 'cod',
      type: 'cod',
      name: 'Cash on Delivery',
      icon: '/payments/cod.png',
      description: 'Pay when you receive your order',
      processingTime: 'On delivery',
      fee: 50
    }
  ];

  const shippingOptions: ShippingOption[] = [
    {
      id: 'express',
      name: 'Express Delivery',
      description: 'Same day delivery (within Dhaka)',
      price: 150,
      estimatedDays: 'Same day',
      icon: Zap
    },
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Delivered within 2-3 business days',
      price: 60,
      estimatedDays: '2-3 days',
      icon: Truck
    },
    {
      id: 'economy',
      name: 'Economy Delivery',
      description: 'Delivered within 5-7 business days',
      price: 30,
      estimatedDays: '5-7 days',
      icon: Clock
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = selectedShipping?.price || 0;
  const paymentFee = selectedPayment?.fee || 0;
  const tax = Math.round(subtotal * 0.05); // 5% VAT
  const total = subtotal + shippingCost + paymentFee + tax;

  const handleStepChange = (step: number) => {
    if (step <= currentStep + 1) {
      setCurrentStep(step);
    }
  };

  const handlePlaceOrder = () => {
    // Simulate order placement
    alert('Order placed successfully! Redirecting to order confirmation...');
  };

  const steps = [
    { number: 1, title: 'Cart Review', icon: '🛒' },
    { number: 2, title: 'Shipping Address', icon: '📍' },
    { number: 3, title: 'Delivery Options', icon: '🚚' },
    { number: 4, title: 'Payment', icon: '💳' },
    { number: 5, title: 'Review & Place Order', icon: '✅' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Progress Steps */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => handleStepChange(step.number)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                    currentStep >= step.number
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                </button>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-purple-600' : 'text-gray-600'}`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 mx-4 h-0.5 ${currentStep > step.number ? 'bg-purple-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Cart Review */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Cart</h2>
                
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/api/placeholder/64/64?text=${item.name}`;
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">Sold by {item.vendor}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-purple-600">৳{item.price.toLocaleString()}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">৳{item.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                        <div className="text-sm text-green-600">Ships in {item.shippingTime}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <Link href="/cart">
                    <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Cart
                    </button>
                  </Link>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    Continue to Shipping
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>
                
                <div className="space-y-4">
                  {addresses.map(address => (
                    <div 
                      key={address.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">{address.name}</span>
                            {address.isDefault && (
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-1">{address.address}</p>
                          <p className="text-gray-600 mb-1">{address.area}, {address.city} - {address.postalCode}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{address.phone}</span>
                          </div>
                        </div>
                        {selectedAddress?.id === address.id && (
                          <Check className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-4 text-purple-600 hover:text-purple-700 font-medium">
                  + Add New Address
                </button>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Cart
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={!selectedAddress}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Delivery
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Delivery Options */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Options</h2>
                
                <div className="space-y-4">
                  {shippingOptions.map(option => (
                    <div 
                      key={option.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedShipping?.id === option.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedShipping(option)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <option.icon className="h-5 w-5 text-gray-600" />
                          <div>
                            <h3 className="font-medium text-gray-900">{option.name}</h3>
                            <p className="text-sm text-gray-600">{option.description}</p>
                            <p className="text-sm text-green-600">Estimated: {option.estimatedDays}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {option.price === 0 ? 'Free' : `৳${option.price}`}
                          </div>
                          {selectedShipping?.id === option.id && (
                            <Check className="h-5 w-5 text-purple-600 ml-auto mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Address
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    Continue to Payment
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map(method => (
                    <div 
                      key={method.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedPayment?.id === method.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPayment(method)}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={method.icon} 
                          alt={method.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/api/placeholder/32/32?text=${method.name}`;
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                          <p className="text-xs text-green-600">Processing: {method.processingTime}</p>
                          {method.fee && (
                            <p className="text-xs text-orange-600">Fee: ৳{method.fee}</p>
                          )}
                        </div>
                        {selectedPayment?.id === method.id && (
                          <Check className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Delivery
                  </button>
                  <button
                    onClick={() => setCurrentStep(5)}
                    disabled={!selectedPayment}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review Order
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Review & Place Order */}
            {currentStep === 5 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Order</h2>
                
                {/* Order Summary */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Items ({cartItems.length})</h3>
                    <div className="space-y-3">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `/api/placeholder/48/48?text=${item.name}`;
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                    <p className="text-sm text-gray-600">{selectedAddress?.address}</p>
                    <p className="text-sm text-gray-600">{selectedAddress?.area}, {selectedAddress?.city}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Delivery Option</h3>
                    <p className="text-sm text-gray-600">{selectedShipping?.name} - ৳{selectedShipping?.price}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                    <p className="text-sm text-gray-600">{selectedPayment?.name}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Special instructions for delivery..."
                  />
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Payment
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Shield className="h-5 w-5" />
                    Place Order - ৳{total.toLocaleString()}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">৳{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'Free' : `৳${shippingCost}`}
                  </span>
                </div>
                
                {paymentFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Fee</span>
                    <span className="font-medium">৳{paymentFee}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (5%)</span>
                  <span className="font-medium">৳{tax.toLocaleString()}</span>
                </div>
                
                <hr className="my-3" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-purple-600">৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mt-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    Apply
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>Free returns within 7 days</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span>4.8/5 customer satisfaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutFlow;