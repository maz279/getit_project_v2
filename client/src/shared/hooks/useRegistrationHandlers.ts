
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/domains/customer/auth/components/AuthProvider';

export const useRegistrationHandlers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);

  const { signUp, signInWithGoogle, signInWithFacebook, signInWithWhatsApp } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent, formData: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone,
        role: formData.role,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate('/auth/verify-email', { 
          state: { email: formData.email } 
        });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider: string) => {
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
        console.log(`${provider} registration initiated successfully`);
      }
    } catch (err) {
      setError(`Failed to register with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneRegister = async (phone: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('Sending OTP to:', phone);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowOTPVerification(true);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('Verifying OTP:', otp);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otp.length === 6) {
        console.log('OTP verified successfully');
        navigate('/');
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    showOTPVerification,
    handleEmailSubmit,
    handleSocialRegister,
    handlePhoneRegister,
    handleVerifyOTP,
  };
};
