/**
 * SeamlessCheckout - Amazon.com/Shopee.sg-Level Checkout Experience
 * Multi-step checkout with address management, payment options, and order review
 */

import React, { useState, useEffect } from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { MapPin, CreditCard, Truck, Shield, Check, ChevronRight, Clock, Star, Gift, AlertCircle, Plus, Edit } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Checkbox } from '@/shared/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Progress } from '@/shared/ui/progress';
import { useSEO } from '@/shared/hooks/useSEO';

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  phone: string;
  address: string;
  city: string;
  division: string;
  postalCode: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile' | 'cod' | 'bank';
  name: string;
  details: string;
  logo: string;
  fee: number;
  processingTime: string;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  carrier: string;
  features: string[];
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendor: string;
  category: string;
}

export const SeamlessCheckout: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [agreePolicyies, setAgreePolicies] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [processing, setProcessing] = useState(false);

  // SEO optimization
  useSEO({
    title: 'Checkout - Complete Your Order | GetIt Bangladesh',
    description: 'Complete your secure checkout with multiple payment options, fast shipping, and buyer protection. Shop safely in Bangladesh.',
    keywords: 'checkout, secure payment, online shopping, bangladesh, fast delivery, buyer protection'
  });

  const steps: CheckoutStep[] = [
    {
      id: 1,
      title: 'Shipping Address',
      description: 'Where should we deliver your order?',
      completed: currentStep > 1,
      active: currentStep === 1
    },
    {
      id: 2,
      title: 'Shipping Method',
      description: 'How fast do you need it?',
      completed: currentStep > 2,
      active: currentStep === 2
    },
    {
      id: 3,
      title: 'Payment',
      description: 'How would you like to pay?',
      completed: currentStep > 3,
      active: currentStep === 3
    },
    {
      id: 4,
      title: 'Review Order',
      description: 'Review and confirm your order',
      completed: currentStep > 4,
      active: currentStep === 4
    }
  ];

  // Mock data
  const addresses: Address[] = [
    {
      id: '1',
      type: 'home',
      name: 'Rahman Ahmed',
      phone: '01712345678',
      address: 'House 123, Road 15, Block A, Bashundhara R/A',
      city: 'Dhaka',
      division: 'Dhaka',
      postalCode: '1229',
      isDefault: true
    },
    {
      id: '2',
      type: 'office',
      name: 'Rahman Ahmed',
      phone: '01712345678',
      address: 'Level 10, Confidence Center, Tejgaon I/A',
      city: 'Dhaka',
      division: 'Dhaka',
      postalCode: '1208',
      isDefault: false
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bkash',
      type: 'mobile',
      name: 'bKash',
      details: 'Pay with bKash mobile banking',
      logo: '/api/placeholder/40/40',
      fee: 0,
      processingTime: 'Instant'
    },
    {
      id: 'nagad',
      type: 'mobile',
      name: 'Nagad',
      details: 'Pay with Nagad mobile banking',
      logo: '/api/placeholder/40/40',
      fee: 0,
      processingTime: 'Instant'
    },
    {
      id: 'rocket',
      type: 'mobile',
      name: 'Rocket',
      details: 'Pay with Rocket mobile banking',
      logo: '/api/placeholder/40/40',
      fee: 0,
      processingTime: 'Instant'
    },
    {
      id: 'visa',
      type: 'card',
      name: 'Credit/Debit Card',
      details: 'Visa, MasterCard, American Express',
      logo: '/api/placeholder/40/40',
      fee: 0,
      processingTime: 'Instant'
    },
    {
      id: 'cod',
      type: 'cod',
      name: 'Cash on Delivery',
      details: 'Pay when you receive your order',
      logo: '/api/placeholder/40/40',
      fee: 50,
      processingTime: 'Upon delivery'
    }
  ];

  const shippingOptions: ShippingOption[] = [
    {
      id: 'express',
      name: 'Express Delivery',
      description: 'Get it by tomorrow',
      price: 150,
      estimatedDays: 1,
      carrier: 'Pathao',
      features: ['Real-time tracking', 'SMS updates', 'Priority handling']
    },
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Get it within 2-3 days',
      price: 60,
      estimatedDays: 3,
      carrier: 'Paperfly',
      features: ['Real-time tracking', 'SMS updates']
    },
    {
      id: 'free',
      name: 'Free Delivery',
      description: 'Get it within 5-7 days',
      price: 0,
      estimatedDays: 7,
      carrier: 'Standard',
      features: ['Basic tracking']
    }
  ];

  const orderItems: OrderItem[] = [
    {
      id: '1',
      name: 'Samsung Galaxy S24 Ultra 256GB',
      price: 135000,
      quantity: 1,
      image: '/api/placeholder/80/80',
      vendor: 'Tech Store BD',
      category: 'Electronics'
    },
    {
      id: '2',
      name: 'Wireless Bluetooth Headphones',
      price: 2500,
      quantity: 2,
      image: '/api/placeholder/80/80',
      vendor: 'Audio World',
      category: 'Electronics'
    }
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
  const shippingCost = selectedShippingOption ? selectedShippingOption.price : 0;
  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedPayment);
  const paymentFee = selectedPaymentMethod ? selectedPaymentMethod.fee : 0;
  const total = subtotal + shippingCost + paymentFee;

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

  const placeOrder = async () => {
    setProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    // Redirect to order confirmation
  };

  const StepIndicator: React.FC = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step.completed ? 'bg-green-500 border-green-500 text-white' :
              step.active ? 'border-blue-500 text-blue-500' :
              'border-gray-300 text-gray-300'
            }`}>
              {step.completed ? <Check className="h-5 w-5" /> : step.id}
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                step.completed ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <h2 className="text-xl font-semibold">{steps[currentStep - 1].title}</h2>
        <p className="text-gray-600">{steps[currentStep - 1].description}</p>
      </div>
    </div>
  );

  const AddressStep: React.FC = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Delivery Address</h3>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>
      
      <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
        {addresses.map((address) => (
          <div key={address.id} className="flex items-start space-x-3">
            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{address.type}</Badge>
                    {address.isDefault && <Badge className="bg-green-500">Default</Badge>}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">{address.name}</p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                  <p className="text-sm">{address.address}</p>
                  <p className="text-sm">{address.city}, {address.division} {address.postalCode}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const ShippingStep: React.FC = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Shipping Method</h3>
      
      <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
        {shippingOptions.map((option) => (
          <div key={option.id} className="flex items-start space-x-3">
            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{option.name}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{option.price === 0 ? 'Free' : `৳${option.price}`}</p>
                    <p className="text-sm text-gray-600">{option.estimatedDays} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4" />
                  <span className="text-sm">{option.carrier}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {option.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const PaymentStep: React.FC = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Payment Method</h3>
      
      <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-start space-x-3">
            <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img src={method.logo} alt={method.name} className="w-10 h-10" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{method.name}</h4>
                    <p className="text-sm text-gray-600">{method.details}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {method.processingTime}
                      </div>
                      {method.fee > 0 && (
                        <Badge variant="outline">Fee: ৳{method.fee}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </RadioGroup>

      {/* Payment form for card */}
      {selectedPayment === 'visa' && (
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" placeholder="MM/YY" />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" />
              </div>
            </div>
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input id="cardName" placeholder="John Doe" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile banking form */}
      {(selectedPayment === 'bkash' || selectedPayment === 'nagad' || selectedPayment === 'rocket') && (
        <Card>
          <CardHeader>
            <CardTitle>{paymentMethods.find(m => m.id === selectedPayment)?.name} Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input id="mobileNumber" placeholder="017XXXXXXXX" />
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You will receive a payment request on your mobile. Please approve it to complete the transaction.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const ReviewStep: React.FC = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Your Order</h3>
      
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          {orderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-sm text-gray-600">by {item.vendor}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">৳{(item.price * item.quantity).toLocaleString()}</p>
                <p className="text-sm text-gray-600">৳{item.price.toLocaleString()} each</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery Info */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold">Shipping Address</h4>
              {selectedAddress && (
                <div className="text-sm text-gray-600 mt-1">
                  {(() => {
                    const address = addresses.find(a => a.id === selectedAddress);
                    return address ? `${address.name}, ${address.address}, ${address.city}` : '';
                  })()}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold">Shipping Method</h4>
              {selectedShippingOption && (
                <div className="text-sm text-gray-600 mt-1">
                  {selectedShippingOption.name} - {selectedShippingOption.description}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold">Payment Method</h4>
              {selectedPaymentMethod && (
                <div className="text-sm text-gray-600 mt-1">
                  {selectedPaymentMethod.name}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Order Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Special delivery instructions or notes for the seller..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Agreements */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="policies"
                checked={agreePolicyies}
                onCheckedChange={setAgreePolicies}
              />
              <label htmlFor="policies" className="text-sm">
                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newsletter"
                checked={subscribeNewsletter}
                onCheckedChange={setSubscribeNewsletter}
              />
              <label htmlFor="newsletter" className="text-sm">
                Subscribe to our newsletter for deals and updates
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const OrderSummary: React.FC = () => (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>৳{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shippingCost === 0 ? 'Free' : `৳${shippingCost.toLocaleString()}`}</span>
          </div>
          {paymentFee > 0 && (
            <div className="flex justify-between">
              <span>Payment Fee</span>
              <span>৳{paymentFee.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Secure checkout with SSL encryption</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Gift className="h-4 w-4" />
            <span>Free returns within 30 days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <Progress value={(currentStep / 4) * 100} className="w-full" />
        </div>

        <StepIndicator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 1 && <AddressStep />}
            {currentStep === 2 && <ShippingStep />}
            {currentStep === 3 && <PaymentStep />}
            {currentStep === 4 && <ReviewStep />}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !selectedAddress) ||
                    (currentStep === 2 && !selectedShipping) ||
                    (currentStep === 3 && !selectedPayment)
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={placeOrder}
                  disabled={!agreePolicyies || processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? 'Processing...' : 'Place Order'}
                </Button>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SeamlessCheckout;