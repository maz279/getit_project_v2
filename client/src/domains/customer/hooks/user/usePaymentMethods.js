import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * usePaymentMethods - Bangladesh Payment Methods Management Hook
 * Comprehensive integration with bKash, Nagad, Rocket, SSL Commerz and international payment methods
 */
export const usePaymentMethods = () => {
  const { user, trackUserActivity } = useAuth();
  const [paymentState, setPaymentState] = useState({
    loading: false,
    error: null,
    availableMethods: [],
    savedMethods: [],
    defaultMethod: null,
    processingPayment: false,
    transactionHistory: [],
    
    // Bangladesh Mobile Banking
    mobileWallets: {
      bkash: { available: true, balance: null, verified: false },
      nagad: { available: true, balance: null, verified: false },
      rocket: { available: true, balance: null, verified: false },
      upay: { available: true, balance: null, verified: false },
      mycash: { available: true, balance: null, verified: false }
    },
    
    // Bangladesh Banks
    supportedBanks: [],
    internetBanking: [],
    
    // International Methods
    internationalMethods: {
      visa: { available: true, enabled: true },
      mastercard: { available: true, enabled: true },
      amex: { available: true, enabled: true },
      paypal: { available: false, enabled: false }, // Not available in Bangladesh
      stripe: { available: true, enabled: true }
    },
    
    // Alternative Methods
    alternativeMethods: {
      cod: { available: true, enabled: true, regions: ['dhaka', 'chittagong', 'sylhet'] },
      emi: { available: true, enabled: true, minAmount: 5000 },
      bankTransfer: { available: true, enabled: true },
      crypto: { available: false, enabled: false } // Not legal in Bangladesh
    },
    
    // Payment Configuration
    configuration: {
      maxAmount: 500000, // ৳5,00,000 per transaction
      minAmount: 10, // ৳10 minimum
      dailyLimit: 1000000, // ৳10,00,000 per day
      currency: 'BDT',
      taxRate: 0.15, // 15% VAT in Bangladesh
      processingFee: {
        mobileBanking: 0.02, // 2% for mobile banking
        cards: 0.025, // 2.5% for cards
        cod: 20, // ৳20 fixed for COD
        bankTransfer: 0 // Free
      }
    },
    
    // Real-time Status
    serviceStatus: {
      bkash: 'active',
      nagad: 'active',
      rocket: 'active',
      sslcommerz: 'active',
      portwallet: 'active'
    }
  });

  // Load payment methods on mount
  useEffect(() => {
    loadPaymentMethods();
    loadSavedMethods();
    checkServiceStatus();
  }, [user]);

  // Load available payment methods
  const loadPaymentMethods = useCallback(async () => {
    try {
      setPaymentState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/v1/payments/methods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          availableMethods: data.methods,
          supportedBanks: data.banks || [],
          internetBanking: data.internetBanking || [],
          configuration: { ...prev.configuration, ...data.configuration }
        }));

        return { success: true, data };
      } else {
        const error = await response.json();
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load payment methods'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Payment methods loading error:', error);
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load payment methods'
      }));
      return { success: false, error: 'Failed to load payment methods' };
    }
  }, []);

  // Load user's saved payment methods
  const loadSavedMethods = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/v1/payments/saved-methods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const savedMethods = await response.json();
        
        setPaymentState(prev => ({
          ...prev,
          savedMethods,
          defaultMethod: savedMethods.find(method => method.isDefault) || savedMethods[0]
        }));

        return { success: true, savedMethods };
      }
      return { success: false };
    } catch (error) {
      console.error('Saved methods loading error:', error);
      return { success: false };
    }
  }, [user]);

  // Check real-time service status
  const checkServiceStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/payments/service-status');
      
      if (response.ok) {
        const status = await response.json();
        setPaymentState(prev => ({
          ...prev,
          serviceStatus: status
        }));
      }
    } catch (error) {
      console.error('Service status check error:', error);
    }
  }, []);

  // Verify mobile wallet
  const verifyMobileWallet = useCallback(async (provider, phoneNumber, pin) => {
    try {
      setPaymentState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/v1/payments/${provider}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber, pin })
      });

      if (response.ok) {
        const result = await response.json();
        
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          mobileWallets: {
            ...prev.mobileWallets,
            [provider]: {
              ...prev.mobileWallets[provider],
              verified: true,
              balance: result.balance,
              phoneNumber
            }
          }
        }));

        await trackUserActivity('wallet_verified', user?.id, { provider });
        return { success: true, result };
      } else {
        const error = await response.json();
        setPaymentState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Wallet verification error:', error);
      setPaymentState(prev => ({ ...prev, loading: false, error: 'Verification failed' }));
      return { success: false, error: 'Verification failed' };
    }
  }, [user, trackUserActivity]);

  // Add payment method
  const addPaymentMethod = useCallback(async (methodData) => {
    try {
      setPaymentState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/v1/payments/methods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(methodData)
      });

      if (response.ok) {
        const savedMethod = await response.json();
        
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          savedMethods: [...prev.savedMethods, savedMethod],
          defaultMethod: savedMethod.isDefault ? savedMethod : prev.defaultMethod
        }));

        await trackUserActivity('payment_method_added', user?.id, {
          type: methodData.type,
          provider: methodData.provider
        });

        return { success: true, method: savedMethod };
      } else {
        const error = await response.json();
        setPaymentState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Add payment method error:', error);
      setPaymentState(prev => ({ ...prev, loading: false, error: 'Failed to add payment method' }));
      return { success: false, error: 'Failed to add payment method' };
    }
  }, [user, trackUserActivity]);

  // Remove payment method
  const removePaymentMethod = useCallback(async (methodId) => {
    try {
      setPaymentState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/v1/payments/methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          savedMethods: prev.savedMethods.filter(method => method.id !== methodId),
          defaultMethod: prev.defaultMethod?.id === methodId ? 
            prev.savedMethods.find(method => method.id !== methodId) : prev.defaultMethod
        }));

        return { success: true };
      } else {
        const error = await response.json();
        setPaymentState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Remove payment method error:', error);
      setPaymentState(prev => ({ ...prev, loading: false, error: 'Failed to remove payment method' }));
      return { success: false, error: 'Failed to remove payment method' };
    }
  }, []);

  // Set default payment method
  const setDefaultMethod = useCallback(async (methodId) => {
    try {
      const response = await fetch(`/api/v1/payments/methods/${methodId}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setPaymentState(prev => ({
          ...prev,
          savedMethods: prev.savedMethods.map(method => ({
            ...method,
            isDefault: method.id === methodId
          })),
          defaultMethod: prev.savedMethods.find(method => method.id === methodId)
        }));

        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Set default method error:', error);
      return { success: false, error: 'Failed to set default method' };
    }
  }, []);

  // Process payment
  const processPayment = useCallback(async (paymentData) => {
    try {
      setPaymentState(prev => ({ ...prev, processingPayment: true, error: null }));

      const response = await fetch('/api/v1/payments/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        const result = await response.json();
        
        setPaymentState(prev => ({
          ...prev,
          processingPayment: false,
          transactionHistory: [result, ...prev.transactionHistory]
        }));

        await trackUserActivity('payment_processed', user?.id, {
          amount: paymentData.amount,
          method: paymentData.method,
          transactionId: result.transactionId
        });

        return { success: true, result };
      } else {
        const error = await response.json();
        setPaymentState(prev => ({ 
          ...prev, 
          processingPayment: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentState(prev => ({ 
        ...prev, 
        processingPayment: false, 
        error: 'Payment processing failed' 
      }));
      return { success: false, error: 'Payment processing failed' };
    }
  }, [user, trackUserActivity]);

  // Check wallet balance
  const checkWalletBalance = useCallback(async (provider, phoneNumber) => {
    try {
      const response = await fetch(`/api/v1/payments/${provider}/balance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber })
      });

      if (response.ok) {
        const balanceData = await response.json();
        
        setPaymentState(prev => ({
          ...prev,
          mobileWallets: {
            ...prev.mobileWallets,
            [provider]: {
              ...prev.mobileWallets[provider],
              balance: balanceData.balance
            }
          }
        }));

        return { success: true, balance: balanceData.balance };
      } else {
        return { success: false, balance: null };
      }
    } catch (error) {
      console.error('Balance check error:', error);
      return { success: false, balance: null };
    }
  }, []);

  // Calculate processing fee
  const calculateProcessingFee = useCallback((amount, method) => {
    const { processingFee } = paymentState.configuration;
    
    switch (method.type) {
      case 'mobile_banking':
        return amount * processingFee.mobileBanking;
      case 'card':
        return amount * processingFee.cards;
      case 'cod':
        return processingFee.cod;
      case 'bank_transfer':
        return processingFee.bankTransfer;
      default:
        return 0;
    }
  }, [paymentState.configuration]);

  // Validate payment amount
  const validatePaymentAmount = useCallback((amount, method) => {
    const { minAmount, maxAmount, dailyLimit } = paymentState.configuration;
    const errors = [];

    if (amount < minAmount) {
      errors.push(`Minimum amount is ৳${minAmount}`);
    }

    if (amount > maxAmount) {
      errors.push(`Maximum amount is ৳${maxAmount}`);
    }

    // Check daily limit (would need transaction history)
    // Additional method-specific validations can be added

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [paymentState.configuration]);

  // Get COD availability for location
  const getCODAvailability = useCallback((address) => {
    const { cod } = paymentState.alternativeMethods;
    const userDivision = address?.division?.toLowerCase();
    
    return {
      available: cod.available && cod.regions.includes(userDivision),
      estimatedDelivery: userDivision === 'dhaka' ? '1-2 days' : '3-5 days',
      fee: paymentState.configuration.processingFee.cod
    };
  }, [paymentState.alternativeMethods, paymentState.configuration]);

  // Get EMI options
  const getEMIOptions = useCallback((amount) => {
    const { emi } = paymentState.alternativeMethods;
    
    if (!emi.available || amount < emi.minAmount) {
      return { available: false, options: [] };
    }

    return {
      available: true,
      options: [
        { months: 3, monthlyAmount: amount / 3, interestRate: 0 },
        { months: 6, monthlyAmount: amount / 6 * 1.05, interestRate: 5 },
        { months: 12, monthlyAmount: amount / 12 * 1.1, interestRate: 10 },
        { months: 24, monthlyAmount: amount / 24 * 1.15, interestRate: 15 }
      ]
    };
  }, [paymentState.alternativeMethods]);

  // Load transaction history
  const loadTransactionHistory = useCallback(async (limit = 10) => {
    try {
      const response = await fetch(`/api/v1/payments/transactions?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const transactions = await response.json();
        setPaymentState(prev => ({
          ...prev,
          transactionHistory: transactions
        }));
        return { success: true, transactions };
      }
      return { success: false };
    } catch (error) {
      console.error('Transaction history error:', error);
      return { success: false };
    }
  }, []);

  // Computed values
  const availableWallets = useMemo(() => {
    return Object.entries(paymentState.mobileWallets)
      .filter(([_, wallet]) => wallet.available)
      .map(([provider, wallet]) => ({ provider, ...wallet }));
  }, [paymentState.mobileWallets]);

  const verifiedWallets = useMemo(() => {
    return availableWallets.filter(wallet => wallet.verified);
  }, [availableWallets]);

  const activeServices = useMemo(() => {
    return Object.entries(paymentState.serviceStatus)
      .filter(([_, status]) => status === 'active')
      .map(([service]) => service);
  }, [paymentState.serviceStatus]);

  const preferredMethods = useMemo(() => {
    return paymentState.savedMethods
      .sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return new Date(b.lastUsed) - new Date(a.lastUsed);
      });
  }, [paymentState.savedMethods]);

  return {
    // State
    ...paymentState,
    
    // Methods
    loadPaymentMethods,
    loadSavedMethods,
    checkServiceStatus,
    verifyMobileWallet,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultMethod,
    processPayment,
    checkWalletBalance,
    calculateProcessingFee,
    validatePaymentAmount,
    getCODAvailability,
    getEMIOptions,
    loadTransactionHistory,

    // Computed values
    availableWallets,
    verifiedWallets,
    activeServices,
    preferredMethods,
    hasVerifiedWallet: verifiedWallets.length > 0,
    hasSavedMethods: paymentState.savedMethods.length > 0,
    allServicesActive: activeServices.length === Object.keys(paymentState.serviceStatus).length,
    
    // Quick access
    bkashAvailable: paymentState.serviceStatus.bkash === 'active',
    nagadAvailable: paymentState.serviceStatus.nagad === 'active',
    rocketAvailable: paymentState.serviceStatus.rocket === 'active',
    cardsAvailable: paymentState.serviceStatus.sslcommerz === 'active',
    
    // Bangladesh-specific features
    mobileBankingEnabled: availableWallets.length > 0,
    supportsBDT: paymentState.configuration.currency === 'BDT',
    hasVATCalculation: paymentState.configuration.taxRate > 0,
    supportsCOD: paymentState.alternativeMethods.cod.available,
    supportsEMI: paymentState.alternativeMethods.emi.available,
    
    // Payment limits
    dailyLimitRemaining: paymentState.configuration.dailyLimit, // Would calculate from transaction history
    canMakePayment: !paymentState.processingPayment && !paymentState.loading
  };
};

export default usePaymentMethods;