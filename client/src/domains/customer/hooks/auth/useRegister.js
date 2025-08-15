import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * useRegister - Enhanced Registration Hook with OTP Verification
 * Amazon.com/Shopee.sg-Level Registration Experience with Bangladesh Integration
 */
export const useRegister = () => {
  const { register: authRegister, trackUserActivity } = useAuth();
  const [registrationState, setRegistrationState] = useState({
    loading: false,
    error: null,
    currentStep: 'personal', // personal, verification, complete
    verificationMethod: 'email', // email, phone, both
    otpSent: false,
    otpVerified: false,
    emailVerified: false,
    phoneVerified: false,
    agreedToTerms: false,
    newsletterOptIn: false,
    formData: {
      personalInfo: {},
      contactInfo: {},
      preferences: {}
    }
  });

  // Multi-step registration process
  const startRegistration = useCallback(async (personalData) => {
    try {
      setRegistrationState(prev => ({
        ...prev,
        loading: true,
        error: null,
        formData: { ...prev.formData, personalInfo: personalData }
      }));

      // Validate personal information
      const validationError = validatePersonalInfo(personalData);
      if (validationError) {
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          error: validationError
        }));
        return { success: false, error: validationError };
      }

      // Check if user already exists
      const checkResponse = await fetch('/api/v1/users/check-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: personalData.email,
          phone: personalData.phone
        })
      });

      const checkResult = await checkResponse.json();
      
      if (checkResult.exists) {
        const error = `Account already exists with this ${checkResult.field}`;
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          error
        }));
        return { success: false, error };
      }

      // Move to verification step
      setRegistrationState(prev => ({
        ...prev,
        loading: false,
        currentStep: 'verification'
      }));

      return { success: true, message: 'Ready for verification' };
    } catch (error) {
      console.error('Registration start error:', error);
      setRegistrationState(prev => ({
        ...prev,
        loading: false,
        error: 'Network error. Please try again.'
      }));
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  // Send email verification
  const sendEmailVerification = useCallback(async (email) => {
    try {
      setRegistrationState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/v1/auth/send-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          otpSent: true,
          verificationMethod: 'email'
        }));
        return { success: true, message: 'Verification email sent' };
      } else {
        const error = await response.json();
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      setRegistrationState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to send verification email'
      }));
      return { success: false, error: 'Failed to send verification email' };
    }
  }, []);

  // Send phone OTP for Bangladesh numbers
  const sendPhoneVerification = useCallback(async (phone) => {
    try {
      setRegistrationState(prev => ({ ...prev, loading: true, error: null }));

      const formattedPhone = formatBangladeshPhone(phone);
      const response = await fetch('/api/v1/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone })
      });

      if (response.ok) {
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          otpSent: true,
          verificationMethod: 'phone'
        }));
        return { success: true, message: 'OTP sent to your phone' };
      } else {
        const error = await response.json();
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      setRegistrationState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to send OTP'
      }));
      return { success: false, error: 'Failed to send OTP' };
    }
  }, []);

  // Verify email with code
  const verifyEmail = useCallback(async (verificationCode) => {
    try {
      setRegistrationState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/v1/auth/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registrationState.formData.personalInfo.email,
          code: verificationCode
        })
      });

      if (response.ok) {
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          emailVerified: true,
          otpVerified: true
        }));
        return { success: true, message: 'Email verified successfully' };
      } else {
        const error = await response.json();
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      setRegistrationState(prev => ({
        ...prev,
        loading: false,
        error: 'Email verification failed'
      }));
      return { success: false, error: 'Email verification failed' };
    }
  }, [registrationState.formData.personalInfo.email]);

  // Verify phone with OTP
  const verifyPhone = useCallback(async (otp) => {
    try {
      setRegistrationState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/v1/auth/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formatBangladeshPhone(registrationState.formData.personalInfo.phone),
          otp
        })
      });

      if (response.ok) {
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          phoneVerified: true,
          otpVerified: true
        }));
        return { success: true, message: 'Phone verified successfully' };
      } else {
        const error = await response.json();
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      setRegistrationState(prev => ({
        ...prev,
        loading: false,
        error: 'Phone verification failed'
      }));
      return { success: false, error: 'Phone verification failed' };
    }
  }, [registrationState.formData.personalInfo.phone]);

  // Complete registration
  const completeRegistration = useCallback(async (additionalData = {}) => {
    try {
      setRegistrationState(prev => ({ ...prev, loading: true, error: null }));

      // Ensure verification is complete
      if (!registrationState.otpVerified) {
        const error = 'Please complete verification first';
        setRegistrationState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }

      // Ensure terms agreement
      if (!registrationState.agreedToTerms) {
        const error = 'Please agree to terms and conditions';
        setRegistrationState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }

      // Prepare complete registration data
      const registrationData = {
        ...registrationState.formData.personalInfo,
        ...additionalData,
        emailVerified: registrationState.emailVerified,
        phoneVerified: registrationState.phoneVerified,
        newsletterOptIn: registrationState.newsletterOptIn,
        registrationSource: 'web',
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        location: await getCurrentLocation(),
        preferences: {
          currency: 'BDT',
          language: 'en',
          notifications: {
            email: true,
            sms: registrationState.phoneVerified,
            push: true
          }
        }
      };

      // Register user
      const result = await authRegister(registrationData);

      if (result.success) {
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          currentStep: 'complete'
        }));

        // Track successful registration
        await trackUserActivity('registration_complete', result.user.id);
        
        return result;
      } else {
        setRegistrationState(prev => ({
          ...prev,
          loading: false,
          error: result.error
        }));
        return result;
      }
    } catch (error) {
      console.error('Registration completion error:', error);
      setRegistrationState(prev => ({
        ...prev,
        loading: false,
        error: 'Registration failed. Please try again.'
      }));
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }, [authRegister, registrationState, trackUserActivity]);

  // Social registration
  const registerWithGoogle = useCallback(async () => {
    try {
      setRegistrationState(prev => ({ ...prev, loading: true, error: null }));
      
      // Get Google OAuth URL for registration
      const response = await fetch('/api/v1/auth/google/register-url');
      const { authUrl } = await response.json();
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      setRegistrationState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize Google registration'
      }));
    }
  }, []);

  const registerWithFacebook = useCallback(async () => {
    try {
      setRegistrationState(prev => ({ ...prev, loading: true, error: null }));
      
      // Get Facebook OAuth URL for registration
      const response = await fetch('/api/v1/auth/facebook/register-url');
      const { authUrl } = await response.json();
      
      // Redirect to Facebook OAuth
      window.location.href = authUrl;
    } catch (error) {
      setRegistrationState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize Facebook registration'
      }));
    }
  }, []);

  // Resend verification
  const resendVerification = useCallback(async () => {
    if (registrationState.verificationMethod === 'email') {
      return await sendEmailVerification(registrationState.formData.personalInfo.email);
    } else {
      return await sendPhoneVerification(registrationState.formData.personalInfo.phone);
    }
  }, [registrationState, sendEmailVerification, sendPhoneVerification]);

  // Update form data
  const updateFormData = useCallback((step, data) => {
    setRegistrationState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [step]: { ...prev.formData[step], ...data }
      }
    }));
  }, []);

  // Set step
  const setStep = useCallback((step) => {
    setRegistrationState(prev => ({ ...prev, currentStep: step }));
  }, []);

  // Toggle terms agreement
  const toggleTermsAgreement = useCallback(() => {
    setRegistrationState(prev => ({ ...prev, agreedToTerms: !prev.agreedToTerms }));
  }, []);

  // Toggle newsletter opt-in
  const toggleNewsletterOptIn = useCallback(() => {
    setRegistrationState(prev => ({ ...prev, newsletterOptIn: !prev.newsletterOptIn }));
  }, []);

  // Reset registration state
  const resetRegistration = useCallback(() => {
    setRegistrationState({
      loading: false,
      error: null,
      currentStep: 'personal',
      verificationMethod: 'email',
      otpSent: false,
      otpVerified: false,
      emailVerified: false,
      phoneVerified: false,
      agreedToTerms: false,
      newsletterOptIn: false,
      formData: {
        personalInfo: {},
        contactInfo: {},
        preferences: {}
      }
    });
  }, []);

  return {
    // State
    ...registrationState,
    
    // Methods
    startRegistration,
    sendEmailVerification,
    sendPhoneVerification,
    verifyEmail,
    verifyPhone,
    completeRegistration,
    registerWithGoogle,
    registerWithFacebook,
    resendVerification,
    updateFormData,
    setStep,
    toggleTermsAgreement,
    toggleNewsletterOptIn,
    resetRegistration,

    // Computed values
    canProceed: registrationState.otpVerified && registrationState.agreedToTerms,
    isComplete: registrationState.currentStep === 'complete',
    progress: getRegistrationProgress(registrationState)
  };
};

// Helper functions
const validatePersonalInfo = (data) => {
  const { firstName, lastName, email, phone, password, confirmPassword } = data;

  if (!firstName || firstName.length < 2) {
    return 'First name must be at least 2 characters long';
  }

  if (!lastName || lastName.length < 2) {
    return 'Last name must be at least 2 characters long';
  }

  if (!email || !isValidEmail(email)) {
    return 'Please enter a valid email address';
  }

  if (!phone || !isValidBangladeshPhone(phone)) {
    return 'Please enter a valid Bangladesh phone number';
  }

  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  if (!isPasswordStrong(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
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

const isPasswordStrong = (password) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(password);
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

const getRegistrationProgress = (state) => {
  let progress = 0;
  
  // Personal info step (40%)
  if (Object.keys(state.formData.personalInfo).length > 0) {
    progress += 40;
  }
  
  // Verification step (30%)
  if (state.otpVerified) {
    progress += 30;
  }
  
  // Terms agreement (15%)
  if (state.agreedToTerms) {
    progress += 15;
  }
  
  // Completion (15%)
  if (state.currentStep === 'complete') {
    progress += 15;
  }
  
  return Math.min(progress, 100);
};

export default useRegister;