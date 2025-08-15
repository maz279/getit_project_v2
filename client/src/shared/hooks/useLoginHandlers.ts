
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/domains/customer/auth/components/AuthProvider';

export const useLoginHandlers = () => {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [suspiciousActivityDetected, setSuspiciousActivityDetected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);

  const { signIn, signInWithGoogle, signInWithFacebook, signInWithWhatsApp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (e: React.FormEvent, loginMethod: string, email: string, phone: string, password: string) => {
    e.preventDefault();
    
    if (isAccountLocked) {
      setError('Account is temporarily locked. Please try again later.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loginCredential = loginMethod === 'email' ? email : phone;
      const { error } = await signIn(loginCredential, password);
      
      if (error) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        // Account lockout after 5 attempts
        if (newAttempts >= 5) {
          setIsAccountLocked(true);
          setError('Account locked due to multiple failed attempts. Please contact support or try again in 15 minutes.');
        } else {
          setError(error.message);
        }
        
        // Suspicious activity detection simulation
        if (newAttempts >= 3) {
          setSuspiciousActivityDetected(true);
        }
      } else {
        // Reset attempts on successful login
        setLoginAttempts(0);
        setIsAccountLocked(false);
        setSuspiciousActivityDetected(false);
        navigate(redirectTo);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoginAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (phone: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('Sending OTP to:', phone);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowOTPVerification(true);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string, phone: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('Verifying OTP:', otp, 'for phone:', phone);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otp.length === 6) {
        console.log('OTP verified successfully');
        navigate(redirectTo);
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (phone: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('Resending OTP to:', phone);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    setError('');
    
    try {
      let result;
      
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        case 'whatsapp':
          result = await signInWithWhatsApp();
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      if (result.error) {
        setError(result.error.message);
      } else if (provider !== 'whatsapp') {
        // For OAuth providers, navigation happens automatically via redirect
        console.log(`${provider} login initiated successfully`);
      }
    } catch (err) {
      setError(`Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    loginAttempts,
    isAccountLocked,
    suspiciousActivityDetected,
    loading,
    error,
    showOTPVerification,
    handleSubmit,
    handleSendOTP,
    handleVerifyOTP,
    handleResendOTP,
    handleSocialLogin,
  };
};
