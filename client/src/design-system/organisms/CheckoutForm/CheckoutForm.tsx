/**
 * CheckoutForm Organism - Complete checkout form with validation
 * Amazon.com/Shopee.sg Enterprise Standards
 */

import { useState } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import { Icon } from '../../atoms/Icon/Icon';
import { FormField } from '../../molecules/FormField/FormField';
import { cn } from '@/lib/utils';

export interface CheckoutFormProps {
  className?: string;
  onSubmit?: (data: CheckoutFormData) => void;
  loading?: boolean;
  cartItems?: CartItem[];
  shippingMethods?: ShippingMethod[];
  paymentMethods?: PaymentMethod[];
  culturalOptions?: {
    enableBangladeshiPayments?: boolean;
    enableIslamicCompliance?: boolean;
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendor?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  description?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon?: React.ReactNode;
  type: 'card' | 'mobile' | 'bank' | 'cash';
  description?: string;
}

export interface CheckoutFormData {
  // Contact Information
  email: string;
  phone: string;
  
  // Shipping Address
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Billing Address
  billingSameAsShipping: boolean;
  billingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Shipping & Payment
  shippingMethod: string;
  paymentMethod: string;
  paymentDetails?: any;
  
  // Special Instructions
  specialInstructions?: string;
  
  // Cultural Options
  islamicCompliance?: boolean;
  prayerTimeDelivery?: boolean;
}

export const CheckoutForm = ({
  className,
  onSubmit,
  loading = false,
  cartItems = [],
  shippingMethods = [],
  paymentMethods = [],
  culturalOptions = {},
  ...props
}: CheckoutFormProps) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh',
    billingSameAsShipping: true,
    shippingMethod: '',
    paymentMethod: '',
    islamicCompliance: false,
    prayerTimeDelivery: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, title: 'Contact Information', completed: false },
    { id: 2, title: 'Shipping Address', completed: false },
    { id: 3, title: 'Shipping Method', completed: false },
    { id: 4, title: 'Payment', completed: false },
    { id: 5, title: 'Review', completed: false }
  ];

  const handleInputChange = (field: keyof CheckoutFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        break;
      case 2:
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
        break;
      case 3:
        if (!formData.shippingMethod) newErrors.shippingMethod = 'Shipping method is required';
        break;
      case 4:
        if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(4)) {
      onSubmit?.(formData);
    }
  };

  const calculateTotal = () => {
    const itemsTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = shippingMethods.find(m => m.id === formData.shippingMethod)?.price || 0;
    const tax = itemsTotal * 0.15; // 15% VAT for Bangladesh
    return itemsTotal + shippingCost + tax;
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)} {...props}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center',
                    index < steps.length - 1 && 'flex-1'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                      currentStep >= step.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.id}
                  </div>
                  <Typography
                    variant="caption"
                    className={cn(
                      'ml-2',
                      currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </Typography>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-px bg-border ml-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <Typography variant="h3">Contact Information</Typography>
                <FormField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  required
                />
                <FormField
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                  required
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <Typography variant="h3">Shipping Address</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={errors.firstName}
                    required
                  />
                  <FormField
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={errors.lastName}
                    required
                  />
                </div>
                <FormField
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={errors.address}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    error={errors.city}
                    required
                  />
                  <FormField
                    label="ZIP Code"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    error={errors.zipCode}
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <Typography variant="h3">Shipping Method</Typography>
                <div className="space-y-2">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent"
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={formData.shippingMethod === method.id}
                        onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Typography variant="small" className="font-medium">
                            {method.name}
                          </Typography>
                          <Typography variant="small" className="font-bold">
                            BDT {method.price}
                          </Typography>
                        </div>
                        <Typography variant="caption" className="text-muted-foreground">
                          {method.description} • {method.estimatedDays} days
                        </Typography>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <Typography variant="h3">Payment Method</Typography>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center space-x-3">
                        {method.icon}
                        <div>
                          <Typography variant="small" className="font-medium">
                            {method.name}
                          </Typography>
                          {method.description && (
                            <Typography variant="caption" className="text-muted-foreground">
                              {method.description}
                            </Typography>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Cultural Options */}
                {culturalOptions.enableIslamicCompliance && (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.islamicCompliance}
                        onChange={(e) => handleInputChange('islamicCompliance', e.target.checked)}
                      />
                      <Typography variant="small">
                        Ensure Islamic compliance for all transactions
                      </Typography>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.prayerTimeDelivery}
                        onChange={(e) => handleInputChange('prayerTimeDelivery', e.target.checked)}
                      />
                      <Typography variant="small">
                        Avoid delivery during prayer times
                      </Typography>
                    </label>
                  </div>
                )}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <Typography variant="h3">Review Your Order</Typography>
                <div className="bg-muted p-4 rounded-lg">
                  <Typography variant="small" className="font-medium mb-2">
                    Order Summary
                  </Typography>
                  <div className="text-center text-muted-foreground">
                    Order review details would be displayed here
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              
              {currentStep < 5 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  variant="cultural"
                >
                  Place Order
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-muted p-6 rounded-lg sticky top-4">
            <Typography variant="h4" className="mb-4">
              Order Summary
            </Typography>
            
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <Typography variant="small" className="font-medium">
                      {item.name}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      Qty: {item.quantity}
                    </Typography>
                  </div>
                  <Typography variant="small" className="font-bold">
                    BDT {item.price * item.quantity}
                  </Typography>
                </div>
              ))}
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <Typography variant="small">Subtotal</Typography>
                  <Typography variant="small">
                    BDT {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="small">Shipping</Typography>
                  <Typography variant="small">
                    BDT {shippingMethods.find(m => m.id === formData.shippingMethod)?.price || 0}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="small">Tax (15%)</Typography>
                  <Typography variant="small">
                    BDT {Math.round(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.15)}
                  </Typography>
                </div>
                <div className="flex justify-between font-bold">
                  <Typography variant="small">Total</Typography>
                  <Typography variant="small">
                    BDT {Math.round(calculateTotal())}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;