import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * useLogin - Enhanced Login Flow Management Hook
 * Amazon.com/Shopee.sg-Level Login Experience with Advanced Features
 */
export const useLogin = () => {
  const { login: authLogin, trackUserActivity } = useAuth();
  const [loginState, setLoginState] = useState({
    loading: false,
    error: null,
    attempts: 0,
    isLocked: false,
    lockExpiry: null,
    showTwoFactor: false,
    loginMethod: 'email', // email, phone, social
    rememberMe: false
  });

  // Enhanced login with multiple methods and security features
  const login = useCallback(async (credentials, options = {}) => {
    try {
      setLoginState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null 
      }));

      // Validate credentials before sending
      const validationError = validateCredentials(credentials);
      if (validationError) {
        setLoginState(prev => ({ 
          ...prev, 
          loading: false, 
          error: validationError 
        }));
        return { success: false, error: validationError };
      }

      // Check if account is locked
      if (loginState.isLocked && new Date() < loginState.lockExpiry) {
        const remainingTime = Math.ceil((loginState.lockExpiry - new Date()) / 1000 / 60);
        const error = `Account locked. Try again in ${remainingTime} minutes.`;
        setLoginState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }

      // Prepare login data with enhanced information
      const loginData = {
        ...credentials,
        loginMethod: loginState.loginMethod,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        location: await getCurrentLocation(),
        rememberMe: loginState.rememberMe,
        ...options
      };

      // Attempt login
      const result = await authLogin(loginData);

      if (result.success) {
        // Reset login attempts on successful login
        setLoginState(prev => ({
          ...prev,
          loading: false,
          attempts: 0,
          isLocked: false,
          lockExpiry: null,
          error: null
        }));

        // Track successful login
        await trackUserActivity('login_success', result.user.id);
        
        return result;
      } else {
        // Handle failed login
        const newAttempts = loginState.attempts + 1;
        const maxAttempts = 5;
        
        let newState = {
          loading: false,
          error: result.error,
          attempts: newAttempts
        };

        // Lock account after max attempts
        if (newAttempts >= maxAttempts) {
          const lockDuration = 15 * 60 * 1000; // 15 minutes
          newState.isLocked = true;
          newState.lockExpiry = new Date(Date.now() + lockDuration);
          newState.error = 'Too many failed attempts. Account locked for 15 minutes.';
        }

        setLoginState(prev => ({ ...prev, ...newState }));

        // Track failed login attempt
        await trackUserActivity('login_failed', null);
        
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginState(prev => ({
        ...prev,
        loading: false,
        error: 'Network error. Please check your connection and try again.'
      }));
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, [authLogin, loginState, trackUserActivity]);

  // Social login methods
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoginState(prev => ({ ...prev, loading: true, error: null }));
      
      // Initialize Google OAuth flow
      const response = await fetch('/api/v1/auth/google/url');
      const { authUrl } = await response.json();
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      setLoginState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize Google login'
      }));
    }
  }, []);

  const loginWithFacebook = useCallback(async () => {
    try {
      setLoginState(prev => ({ ...prev, loading: true, error: null }));
      
      // Initialize Facebook OAuth flow
      const response = await fetch('/api/v1/auth/facebook/url');
      const { authUrl } = await response.json();
      
      // Redirect to Facebook OAuth
      window.location.href = authUrl;
    } catch (error) {
      setLoginState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize Facebook login'
      }));
    }
  }, []);

  // Bangladesh-specific phone login
  const loginWithPhone = useCallback(async (phoneNumber, otp) => {
    try {
      setLoginState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null, 
        loginMethod: 'phone' 
      }));

      const result = await authLogin({
        phone: formatBangladeshPhone(phoneNumber),
        otp,
        loginMethod: 'phone'
      });

      setLoginState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      setLoginState(prev => ({
        ...prev,
        loading: false,
        error: 'Phone login failed. Please check your number and OTP.'
      }));
      return { success: false, error: 'Phone login failed' };
    }
  }, [authLogin]);

  // Request phone OTP
  const requestPhoneOTP = useCallback(async (phoneNumber) => {
    try {
      const response = await fetch('/api/v1/auth/phone/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formatBangladeshPhone(phoneNumber) 
        })
      });

      if (response.ok) {
        return { success: true, message: 'OTP sent to your phone' };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  }, []);

  // Set login method
  const setLoginMethod = useCallback((method) => {
    setLoginState(prev => ({ ...prev, loginMethod: method }));
  }, []);

  // Toggle remember me
  const toggleRememberMe = useCallback(() => {
    setLoginState(prev => ({ ...prev, rememberMe: !prev.rememberMe }));
  }, []);

  // Reset login state
  const resetLoginState = useCallback(() => {
    setLoginState({
      loading: false,
      error: null,
      attempts: 0,
      isLocked: false,
      lockExpiry: null,
      showTwoFactor: false,
      loginMethod: 'email',
      rememberMe: false
    });
  }, []);

  return {
    // State
    ...loginState,
    
    // Methods
    login,
    loginWithGoogle,
    loginWithFacebook,
    loginWithPhone,
    requestPhoneOTP,
    setLoginMethod,
    toggleRememberMe,
    resetLoginState,

    // Utilities
    canAttemptLogin: !loginState.isLocked || new Date() >= loginState.lockExpiry,
    remainingAttempts: Math.max(0, 5 - loginState.attempts),
    lockTimeRemaining: loginState.lockExpiry ? 
      Math.max(0, Math.ceil((loginState.lockExpiry - new Date()) / 1000 / 60)) : 0
  };
};

// Helper functions
const validateCredentials = (credentials) => {
  if (!credentials.email && !credentials.phone && !credentials.username) {
    return 'Email, phone, or username is required';
  }
  
  if (!credentials.password && !credentials.otp) {
    return 'Password or OTP is required';
  }

  if (credentials.email && !isValidEmail(credentials.email)) {
    return 'Please enter a valid email address';
  }

  if (credentials.phone && !isValidBangladeshPhone(credentials.phone)) {
    return 'Please enter a valid Bangladesh phone number';
  }

  if (credentials.password && credentials.password.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  return null;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidBangladeshPhone = (phone) => {
  const phoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const formatBangladeshPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('880')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+880${cleaned.substring(1)}`;
  } else if (cleaned.length === 11) {
    return `+880${cleaned}`;
  }
  return `+880${cleaned}`;
};

const getCurrentLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    return await response.json();
  } catch (error) {
    return null;
  }
};

export default useLogin;