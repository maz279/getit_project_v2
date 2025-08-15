import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * useCheckout - Advanced Checkout Flow Management Hook
 * Amazon.com/Shopee.sg-Level Checkout Experience with Bangladesh Integration
 */
export const useCheckout = (cartItems = []) => {
  const { user, trackUserActivity } = useAuth();
  const [checkoutState, setCheckoutState] = useState({
    loading: false,
    error: null,
    currentStep: 'shipping', // shipping, payment, review, processing, complete
    shippingAddress: null,
    billingAddress: null,
    sameAsBilling: true,
    shippingMethod: null,
    shippingOptions: [],
    shippingCost: 0,
    estimatedDelivery: null,
    paymentMethod: null,
    paymentMethods: [],
    orderSummary: null,
    promoCode: null,
    discountAmount: 0,
    giftWrapOptions: [],
    selectedGiftWrap: null,
    giftMessage: '',
    orderNotes: '',
    termsAccepted: false,
    newsletterOptIn: false,
    orderId: null,
    orderNumber: null,
    transactionId: null,
    estimatedTax: 0,
    totalAmount: 0,
    validationErrors: {},
    availableAddresses: [],
    savedPaymentMethods: []
  });

  // Load initial checkout data
  useEffect(() => {
    if (cartItems.length > 0) {
      initializeCheckout();
    }
  }, [cartItems]);

  // Initialize checkout with cart data
  const initializeCheckout = useCallback(async () => {
    try {
      setCheckoutState(prev => ({ ...prev, loading: true, error: null }));

      // Load user's saved addresses and payment methods
      const [addressesResponse, paymentMethodsResponse, shippingResponse] = await Promise.all([
        fetch('/api/v1/users/addresses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/v1/users/payment-methods', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/v1/shipping/options', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ items: cartItems })
        })
      ]);

      const addresses = addressesResponse.ok ? await addressesResponse.json() : [];
      const paymentMethods = paymentMethodsResponse.ok ? await paymentMethodsResponse.json() : [];
      const shippingOptions = shippingResponse.ok ? await shippingResponse.json() : [];

      // Set default address (primary or first address)
      const defaultAddress = addresses.find(addr => addr.isPrimary) || addresses[0];

      setCheckoutState(prev => ({
        ...prev,
        loading: false,
        availableAddresses: addresses,
        savedPaymentMethods: paymentMethods,
        shippingOptions,
        shippingAddress: defaultAddress,
        billingAddress: prev.sameAsBilling ? defaultAddress : null
      }));

      // Calculate initial totals
      if (defaultAddress) {
        await calculateShipping(defaultAddress);
      }

      // Track checkout start
      await trackUserActivity('checkout_started', user?.id, {
        itemCount: cartItems.length,
        cartValue: calculateSubtotal()
      });

    } catch (error) {
      console.error('Checkout initialization error:', error);
      setCheckoutState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize checkout'
      }));
    }
  }, [cartItems, user, trackUserActivity]);

  // Set shipping address
  const setShippingAddress = useCallback(async (address) => {
    setCheckoutState(prev => ({
      ...prev,
      shippingAddress: address,
      billingAddress: prev.sameAsBilling ? address : prev.billingAddress,
      validationErrors: { ...prev.validationErrors, shippingAddress: null }
    }));

    // Recalculate shipping when address changes
    await calculateShipping(address);
  }, []);

  // Set billing address
  const setBillingAddress = useCallback((address) => {
    setCheckoutState(prev => ({
      ...prev,
      billingAddress: address,
      validationErrors: { ...prev.validationErrors, billingAddress: null }
    }));
  }, []);

  // Toggle same as billing address
  const toggleSameAsBilling = useCallback(() => {
    setCheckoutState(prev => ({
      ...prev,
      sameAsBilling: !prev.sameAsBilling,
      billingAddress: !prev.sameAsBilling ? prev.shippingAddress : prev.billingAddress
    }));
  }, []);

  // Calculate shipping cost and options
  const calculateShipping = useCallback(async (address) => {
    try {
      setCheckoutState(prev => ({ ...prev, loading: true }));

      const response = await fetch('/api/v1/shipping/calculate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cartItems,
          shippingAddress: address
        })
      });

      if (response.ok) {
        const { options, estimatedTax } = await response.json();
        
        setCheckoutState(prev => ({
          ...prev,
          loading: false,
          shippingOptions: options,
          estimatedTax: estimatedTax || calculateTax(),
          shippingMethod: options[0] || null, // Select first option by default
          shippingCost: options[0]?.cost || 0,
          estimatedDelivery: options[0]?.estimatedDelivery || null
        }));
      } else {
        setCheckoutState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to calculate shipping'
        }));
      }
    } catch (error) {
      console.error('Shipping calculation error:', error);
      setCheckoutState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to calculate shipping'
      }));
    }
  }, [cartItems]);

  // Select shipping method
  const selectShippingMethod = useCallback((method) => {
    setCheckoutState(prev => ({
      ...prev,
      shippingMethod: method,
      shippingCost: method.cost,
      estimatedDelivery: method.estimatedDelivery,
      validationErrors: { ...prev.validationErrors, shippingMethod: null }
    }));
  }, []);

  // Set payment method
  const setPaymentMethod = useCallback((method) => {
    setCheckoutState(prev => ({
      ...prev,
      paymentMethod: method,
      validationErrors: { ...prev.validationErrors, paymentMethod: null }
    }));
  }, []);

  // Apply promo code
  const applyPromoCode = useCallback(async (code) => {
    try {
      setCheckoutState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/v1/checkout/promo-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          items: cartItems,
          subtotal: calculateSubtotal()
        })
      });

      if (response.ok) {
        const { valid, discount, message } = await response.json();
        
        if (valid) {
          setCheckoutState(prev => ({
            ...prev,
            loading: false,
            promoCode: code,
            discountAmount: discount
          }));

          await trackUserActivity('promo_applied_checkout', user?.id, { code, discount });
          return { success: true, message, discount };
        } else {
          setCheckoutState(prev => ({ ...prev, loading: false, error: message }));
          return { success: false, error: message };
        }
      } else {
        const error = await response.json();
        setCheckoutState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Promo code error:', error);
      setCheckoutState(prev => ({ ...prev, loading: false, error: 'Failed to apply promo code' }));
      return { success: false, error: 'Failed to apply promo code' };
    }
  }, [cartItems, user, trackUserActivity]);

  // Remove promo code
  const removePromoCode = useCallback(() => {
    setCheckoutState(prev => ({
      ...prev,
      promoCode: null,
      discountAmount: 0
    }));
  }, []);

  // Validate current step
  const validateStep = useCallback((step) => {
    const errors = {};

    switch (step) {
      case 'shipping':
        if (!checkoutState.shippingAddress) {
          errors.shippingAddress = 'Please select a shipping address';
        }
        if (!checkoutState.sameAsBilling && !checkoutState.billingAddress) {
          errors.billingAddress = 'Please select a billing address';
        }
        if (!checkoutState.shippingMethod) {
          errors.shippingMethod = 'Please select a shipping method';
        }
        break;

      case 'payment':
        if (!checkoutState.paymentMethod) {
          errors.paymentMethod = 'Please select a payment method';
        }
        break;

      case 'review':
        if (!checkoutState.termsAccepted) {
          errors.termsAccepted = 'Please accept the terms and conditions';
        }
        break;
    }

    setCheckoutState(prev => ({ ...prev, validationErrors: errors }));
    return Object.keys(errors).length === 0;
  }, [checkoutState]);

  // Go to next step
  const nextStep = useCallback(() => {
    const steps = ['shipping', 'payment', 'review', 'processing', 'complete'];
    const currentIndex = steps.indexOf(checkoutState.currentStep);
    
    if (validateStep(checkoutState.currentStep) && currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCheckoutState(prev => ({ ...prev, currentStep: nextStep }));
      
      // Track step progression
      trackUserActivity('checkout_step_completed', user?.id, {
        step: checkoutState.currentStep,
        nextStep
      });
      
      return true;
    }
    
    return false;
  }, [checkoutState.currentStep, validateStep, user, trackUserActivity]);

  // Go to previous step
  const previousStep = useCallback(() => {
    const steps = ['shipping', 'payment', 'review', 'processing', 'complete'];
    const currentIndex = steps.indexOf(checkoutState.currentStep);
    
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      setCheckoutState(prev => ({ ...prev, currentStep: prevStep }));
      return true;
    }
    
    return false;
  }, [checkoutState.currentStep]);

  // Go to specific step
  const goToStep = useCallback((step) => {
    setCheckoutState(prev => ({ ...prev, currentStep: step }));
  }, []);

  // Complete order
  const completeOrder = useCallback(async () => {
    try {
      setCheckoutState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null, 
        currentStep: 'processing' 
      }));

      if (!validateStep('review')) {
        setCheckoutState(prev => ({ ...prev, loading: false, currentStep: 'review' }));
        return { success: false, error: 'Please complete all required fields' };
      }

      const orderData = {
        items: cartItems,
        shippingAddress: checkoutState.shippingAddress,
        billingAddress: checkoutState.billingAddress,
        shippingMethod: checkoutState.shippingMethod,
        paymentMethod: checkoutState.paymentMethod,
        promoCode: checkoutState.promoCode,
        discountAmount: checkoutState.discountAmount,
        giftWrap: checkoutState.selectedGiftWrap,
        giftMessage: checkoutState.giftMessage,
        orderNotes: checkoutState.orderNotes,
        newsletterOptIn: checkoutState.newsletterOptIn,
        subtotal: calculateSubtotal(),
        shippingCost: checkoutState.shippingCost,
        taxAmount: checkoutState.estimatedTax,
        totalAmount: calculateTotal()
      };

      const response = await fetch('/api/v1/orders/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        
        setCheckoutState(prev => ({
          ...prev,
          loading: false,
          currentStep: 'complete',
          orderId: order.id,
          orderNumber: order.orderNumber,
          transactionId: order.transactionId
        }));

        // Track successful order
        await trackUserActivity('order_completed', user?.id, {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          paymentMethod: checkoutState.paymentMethod?.type
        });

        return { success: true, order };
      } else {
        const error = await response.json();
        setCheckoutState(prev => ({
          ...prev,
          loading: false,
          currentStep: 'review',
          error: error.message || 'Failed to create order'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Order completion error:', error);
      setCheckoutState(prev => ({
        ...prev,
        loading: false,
        currentStep: 'review',
        error: 'Failed to complete order. Please try again.'
      }));
      return { success: false, error: 'Failed to complete order. Please try again.' };
    }
  }, [checkoutState, cartItems, user, validateStep, trackUserActivity]);

  // Update checkout field
  const updateField = useCallback((field, value) => {
    setCheckoutState(prev => ({
      ...prev,
      [field]: value,
      validationErrors: { ...prev.validationErrors, [field]: null }
    }));
  }, []);

  // Calculate subtotal
  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Calculate tax (Bangladesh VAT 15%)
  const calculateTax = useCallback(() => {
    const taxableAmount = calculateSubtotal() - checkoutState.discountAmount;
    return taxableAmount * 0.15;
  }, [calculateSubtotal, checkoutState.discountAmount]);

  // Calculate total
  const calculateTotal = useCallback(() => {
    return calculateSubtotal() - checkoutState.discountAmount + 
           checkoutState.estimatedTax + checkoutState.shippingCost;
  }, [calculateSubtotal, checkoutState]);

  // Computed values
  const isValidStep = useMemo(() => {
    return validateStep(checkoutState.currentStep);
  }, [checkoutState.currentStep, validateStep]);

  const canProceed = useMemo(() => {
    return isValidStep && !checkoutState.loading;
  }, [isValidStep, checkoutState.loading]);

  const orderSummary = useMemo(() => ({
    subtotal: calculateSubtotal(),
    discount: checkoutState.discountAmount,
    tax: checkoutState.estimatedTax,
    shipping: checkoutState.shippingCost,
    total: calculateTotal(),
    itemCount: cartItems.reduce((total, item) => total + item.quantity, 0)
  }), [calculateSubtotal, calculateTotal, checkoutState, cartItems]);

  const stepProgress = useMemo(() => {
    const steps = ['shipping', 'payment', 'review', 'processing', 'complete'];
    const currentIndex = steps.indexOf(checkoutState.currentStep);
    return {
      current: currentIndex + 1,
      total: steps.length,
      percentage: ((currentIndex + 1) / steps.length) * 100
    };
  }, [checkoutState.currentStep]);

  return {
    // State
    ...checkoutState,
    
    // Methods
    initializeCheckout,
    setShippingAddress,
    setBillingAddress,
    toggleSameAsBilling,
    calculateShipping,
    selectShippingMethod,
    setPaymentMethod,
    applyPromoCode,
    removePromoCode,
    validateStep,
    nextStep,
    previousStep,
    goToStep,
    completeOrder,
    updateField,

    // Computed values
    subtotal: calculateSubtotal(),
    tax: checkoutState.estimatedTax || calculateTax(),
    total: calculateTotal(),
    orderSummary,
    stepProgress,
    isValidStep,
    canProceed,
    hasErrors: Object.keys(checkoutState.validationErrors).length > 0,
    isComplete: checkoutState.currentStep === 'complete',
    isProcessing: checkoutState.currentStep === 'processing',
    
    // Bangladesh-specific features
    supportsCOD: checkoutState.shippingAddress?.division && 
                  ['dhaka', 'chittagong', 'sylhet'].includes(checkoutState.shippingAddress.division.toLowerCase()),
    supportsExpress: checkoutState.shippingAddress?.district && 
                     ['dhaka', 'chittagong', 'sylhet', 'rajshahi'].includes(checkoutState.shippingAddress.district.toLowerCase()),
    freeShippingEligible: calculateSubtotal() >= 1000 // Free shipping over ৳1000
  };
};

export default useCheckout;