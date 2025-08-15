// AdvancedCheckout.tsx - Amazon.com/Shopee.sg-Level Checkout Experience
import React, { useState, useEffect } from 'react';
import { CreditCard, MapPin, Truck, Gift, Shield, ArrowLeft, ChevronRight, Clock, CheckCircle, AlertCircle, Tag, Percent } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  seller: string;
  shippingTime: string;
  inStock: boolean;
}

interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile' | 'cod' | 'bank';
  name: string;
  details: string;
  icon: string;
  fee?: number;
  processingTime: string;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  features: string[];
}

interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

const AdvancedCheckout: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useSEO({
    title: 'Secure Checkout - Complete Your Order | GetIt Bangladesh',
    description: 'Secure and fast checkout with multiple payment options, shipping choices, and order protection. Shop with confidence.',
    keywords: 'secure checkout, online payment, Bangladesh shipping, order protection, secure shopping'
  });

  useEffect(() => {
    // Mock data initialization
    const mockCartItems: CartItem[] = [
      {
        id: '1',
        name: 'Samsung Galaxy A54 5G (128GB)',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        price: 42000,
        quantity: 1,
        seller: 'Samsung Official Store',
        shippingTime: '1-2 days',
        inStock: true
      },
      {
        id: '2',
        name: 'Wireless Phone Case',
        image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
        price: 850,
        quantity: 2,
        seller: 'Tech Accessories BD',
        shippingTime: '2-3 days',
        inStock: true
      }
    ];

    const mockAddresses: Address[] = [
      {
        id: '1',
        type: 'home',
        name: 'Ahmed Rahman',
        phone: '+880 1712-345678',
        address: 'House 45, Road 12, Dhanmondi',
        area: 'Dhanmondi',
        city: 'Dhaka',
        isDefault: true
      },
      {
        id: '2',
        type: 'office',
        name: 'Ahmed Rahman',
        phone: '+880 1712-345678',
        address: 'Suite 302, Bashundhara City, Panthapath',
        area: 'Panthapath',
        city: 'Dhaka',
        isDefault: false
      }
    ];

    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: '1',
        type: 'mobile',
        name: 'bKash',
        details: 'Pay with bKash mobile banking',
        icon: '💳',
        fee: 0,
        processingTime: 'Instant'
      },
      {
        id: '2',
        type: 'mobile',
        name: 'Nagad',
        details: 'Pay with Nagad mobile banking',
        icon: '📱',
        fee: 0,
        processingTime: 'Instant'
      },
      {
        id: '3',
        type: 'mobile',
        name: 'Rocket',
        details: 'Pay with Rocket mobile banking',
        icon: '🚀',
        fee: 0,
        processingTime: 'Instant'
      },
      {
        id: '4',
        type: 'card',
        name: 'Credit/Debit Card',
        details: 'Visa, MasterCard, American Express',
        icon: '💳',
        fee: 25,
        processingTime: 'Instant'
      },
      {
        id: '5',
        type: 'cod',
        name: 'Cash on Delivery',
        details: 'Pay when you receive your order',
        icon: '💰',
        fee: 50,
        processingTime: 'On Delivery'
      }
    ];

    const mockShippingOptions: ShippingOption[] = [
      {
        id: '1',
        name: 'Standard Delivery',
        description: 'Regular delivery to your doorstep',
        price: 60,
        estimatedDays: 3,
        features: ['Free returns', 'Order tracking']
      },
      {
        id: '2',
        name: 'Express Delivery',
        description: 'Faster delivery with priority handling',
        price: 120,
        estimatedDays: 1,
        features: ['Priority handling', 'SMS notifications', 'Free returns', 'Order tracking']
      },
      {
        id: '3',
        name: 'Same Day Delivery',
        description: 'Get your order within 24 hours',
        price: 200,
        estimatedDays: 0,
        features: ['Within 24 hours', 'Real-time tracking', 'Priority support', 'Free returns']
      }
    ];

    setCartItems(mockCartItems);
    setAddresses(mockAddresses);
    setPaymentMethods(mockPaymentMethods);
    setShippingOptions(mockShippingOptions);
    setSelectedAddress(mockAddresses.find(a => a.isDefault)?.id || '');
    setSelectedShipping('1');
  }, []);

  const steps = [
    { id: 1, title: 'Shipping Address', icon: MapPin },
    { id: 2, title: 'Delivery Options', icon: Truck },
    { id: 3, title: 'Payment Method', icon: CreditCard },
    { id: 4, title: 'Review Order', icon: CheckCircle }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedShippingOption = shippingOptions.find(s => s.id === selectedShipping);
  const shippingCost = selectedShippingOption?.price || 0;
  const selectedPaymentMethod = paymentMethods.find(p => p.id === selectedPayment);
  const paymentFee = selectedPaymentMethod?.fee || 0;
  const promoDiscount = appliedPromo ? 
    (appliedPromo.type === 'percentage' ? (subtotal * appliedPromo.discount / 100) : appliedPromo.discount) : 0;
  const total = subtotal + shippingCost + paymentFee - promoDiscount;

  const applyPromoCode = () => {
    const validCodes: { [key: string]: PromoCode } = {
      'SAVE10': { code: 'SAVE10', discount: 10, type: 'percentage', description: '10% off your order' },
      'WELCOME500': { code: 'WELCOME500', discount: 500, type: 'fixed', description: '৳500 off first order' },
      'SHIP50': { code: 'SHIP50', discount: 50, type: 'fixed', description: '৳50 off shipping' }
    };

    if (validCodes[promoCode.toUpperCase()]) {
      setAppliedPromo(validCodes[promoCode.toUpperCase()]);
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
      case 1: return selectedAddress !== '';
      case 2: return selectedShipping !== '';
      case 3: return selectedPayment !== '';
      case 4: return true;
      default: return false;
    }
  };

  const placeOrder = async () => {
    setLoading(true);
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    alert('Order placed successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Checkout Header */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </button>
            
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Secure Checkout</span>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  currentStep >= step.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <step.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Flow */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>
                
                <div className="space-y-4">
                  {addresses.map(address => (
                    <div
                      key={address.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddress === address.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">{address.name}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              address.type === 'home' ? 'bg-blue-100 text-blue-800' :
                              address.type === 'office' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {address.type.toUpperCase()}
                            </span>
                            {address.isDefault && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-1">{address.address}</p>
                          <p className="text-gray-600 text-sm">{address.area}, {address.city}</p>
                          <p className="text-gray-600 text-sm">{address.phone}</p>
                        </div>
                        
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedAddress === address.id ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                        }`}>
                          {selectedAddress === address.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors">
                    + Add New Address
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Delivery Options */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Options</h2>
                
                <div className="space-y-4">
                  {shippingOptions.map(option => (
                    <div
                      key={option.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedShipping === option.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedShipping(option.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{option.name}</h3>
                            <span className="text-lg font-bold text-purple-600">
                              {option.price === 0 ? 'FREE' : `৳${option.price}`}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {option.estimatedDays === 0 ? 'Same day' : `${option.estimatedDays} day${option.estimatedDays > 1 ? 's' : ''}`}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {option.features.map(feature => (
                              <span key={feature} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedShipping === option.id ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                        }`}>
                          {selectedShipping === option.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                
                <div className="space-y-4">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPayment === method.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">{method.name}</h3>
                            <p className="text-gray-600 text-sm">{method.details}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500">{method.processingTime}</span>
                              {method.fee > 0 && (
                                <span className="text-xs text-orange-600">+৳{method.fee} fee</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === method.id ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                        }`}>
                          {selectedPayment === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
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
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Order</h2>
                  
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-gray-600 text-sm mb-1">Sold by: {item.seller}</p>
                          <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                          <p className="text-gray-600 text-sm">{item.shippingTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any special instructions for your order..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Place Order
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Apply
                  </button>
                </div>
                
                {appliedPromo && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                    <Tag className="h-4 w-4" />
                    <span>{appliedPromo.description}</span>
                  </div>
                )}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">৳{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'FREE' : `৳${shippingCost}`}
                  </span>
                </div>
                
                {paymentFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment fee</span>
                    <span className="font-medium">৳{paymentFee}</span>
                  </div>
                )}
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo discount</span>
                    <span className="font-medium">-৳{promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-purple-600">৳{total.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Secure Payment</p>
                  <p className="text-xs text-green-700">Your payment information is protected</p>
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

export default AdvancedCheckout;