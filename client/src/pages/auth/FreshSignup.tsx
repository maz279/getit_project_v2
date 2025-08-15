import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Loader2, Shield, Star, Truck, Clock, CheckCircle, Gift, Smartphone } from 'lucide-react';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import { useToast } from '@/shared/ui/use-toast';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';

// Import international phone utilities
import { CountryPhoneInput } from '@/shared/components/ui/CountryPhoneInput';
import { 
  validateInternationalPhone, 
  isValidForOTP, 
  CountryCode 
} from '@/shared/utils/internationalPhoneUtils';

const FreshSignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    city: '',
    dateOfBirth: '',
    gender: '',
    agreeToTerms: false,
    subscribeNewsletter: true,
    preferredLanguage: 'en'
  });

  // Selected country for phone number
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | undefined>();
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false,
    errorMessage: undefined as string | undefined
  });

  // OTP verification states
  const [otpStates, setOtpStates] = useState({
    email: {
      loading: false,
      verified: false,
      sent: false,
      otp: '',
      code: '',
      verifying: false,
      timer: 0
    },
    phone: {
      loading: false,
      verified: false,
      sent: false,
      otp: '',
      code: '',
      verifying: false,
      timer: 0
    }
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  // OTP API functions
  const sendEmailOtp = async (email: string) => {
    try {
      setOtpStates(prev => ({ ...prev, email: { ...prev.email, loading: true } }));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/v1/notifications/email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'registration' }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOtpStates(prev => ({ ...prev, email: { ...prev.email, loading: false, sent: true, timer: 120 } }));
        toast({ title: "OTP Sent", description: "Check your email for the verification code" });
        startEmailTimer();
      } else {
        setOtpStates(prev => ({ ...prev, email: { ...prev.email, loading: false } }));
        toast({ title: "Error", description: data.error || "Failed to send OTP", variant: "destructive" });
      }
    } catch (error: any) {
      setOtpStates(prev => ({ ...prev, email: { ...prev.email, loading: false } }));
      
      if (error.name === 'AbortError') {
        toast({ title: "Timeout", description: "Request timed out. Please try again.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message || "Failed to send OTP", variant: "destructive" });
      }
    }
  };

  const sendPhoneOtp = async (phone: string) => {
    try {
      console.log(`🔧 DEBUG: sendPhoneOtp called with phone: "${phone}"`);
      setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: true } }));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const requestBody = { phone, type: 'registration' };
      console.log(`🔧 DEBUG: Request body:`, requestBody);
      
      const response = await fetch('/api/v1/notifications/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`🔧 DEBUG: Response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`🔧 DEBUG: Error response:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`🔧 DEBUG: Response data:`, data);
      
      if (data.success) {
        console.log(`🔧 DEBUG: SMS OTP sent successfully, updating state`);
        setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: false, sent: true, timer: 120 } }));
        toast({ title: "OTP Sent", description: "Check your phone for the verification code" });
        startPhoneTimer();
      } else {
        console.log(`🔧 DEBUG: SMS OTP failed:`, data.error);
        setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: false } }));
        toast({ title: "Error", description: data.error || "Failed to send OTP", variant: "destructive" });
      }
    } catch (error: any) {
      console.log(`🔧 DEBUG: SMS OTP exception:`, error);
      setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: false } }));
      
      if (error.name === 'AbortError') {
        toast({ title: "Timeout", description: "Request timed out. Please try again.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message || "Failed to send OTP", variant: "destructive" });
      }
    }
  };

  // WhatsApp OTP Function
  const sendWhatsAppOtp = async (phone: string) => {
    try {
      console.log(`🔧 DEBUG: sendWhatsAppOtp called with phone: "${phone}"`);
      setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: true } }));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const requestBody = { 
        phone, 
        type: 'registration',
        language: formData.preferredLanguage || 'en'
      };
      console.log(`🔧 DEBUG: WhatsApp request body:`, requestBody);
      
      const response = await fetch('/api/v1/notifications/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`🔧 DEBUG: WhatsApp response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`🔧 DEBUG: WhatsApp error response:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`🔧 DEBUG: WhatsApp response data:`, data);
      
      if (data.success) {
        console.log(`🔧 DEBUG: WhatsApp OTP sent successfully, updating state`);
        setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: false, sent: true, timer: 120, method: 'whatsapp' } }));
        toast({ title: "OTP Sent via WhatsApp", description: "Check WhatsApp for the verification code", duration: 5000 });
        startPhoneTimer();
      } else {
        console.log(`🔧 DEBUG: WhatsApp OTP failed:`, data.error);
        setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: false } }));
        toast({ title: "Error", description: data.error || "Failed to send WhatsApp OTP", variant: "destructive" });
      }
    } catch (error: any) {
      console.log(`🔧 DEBUG: WhatsApp OTP error:`, error);
      setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: false } }));
      
      if (error.name === 'AbortError') {
        toast({ title: "Timeout", description: "Request timed out. Please try again.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message || "Failed to send WhatsApp OTP", variant: "destructive" });
      }
    }
  };

  const verifyEmailOtp = async (email: string, otp: string) => {
    try {
      setOtpStates(prev => ({ ...prev, email: { ...prev.email, loading: true } }));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('/api/v1/notifications/email/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOtpStates(prev => ({ ...prev, email: { ...prev.email, loading: false, verified: true } }));
        toast({ title: "Success", description: "Email verified successfully" });
        return true;
      } else {
        setOtpStates(prev => ({ ...prev, email: { ...prev.email, loading: false } }));
        toast({ title: "Error", description: data.error || "Invalid OTP", variant: "destructive" });
      }
    } catch (error: any) {
      setOtpStates(prev => ({ ...prev, email: { ...prev.email, loading: false } }));
      
      if (error.name === 'AbortError') {
        toast({ title: "Timeout", description: "Request timed out. Please try again.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message || "OTP verification failed", variant: "destructive" });
      }
    }
    return false;
  };

  const verifyPhoneOtp = async (phone: string, otp: string) => {
    try {
      setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: true } }));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('/api/v1/notifications/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: false, verified: true } }));
        toast({ title: "Success", description: "Phone verified successfully" });
        return true;
      } else {
        setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: false } }));
        toast({ title: "Error", description: data.error || "Invalid OTP", variant: "destructive" });
      }
    } catch (error: any) {
      setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, loading: false } }));
      
      if (error.name === 'AbortError') {
        toast({ title: "Timeout", description: "Request timed out. Please try again.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message || "OTP verification failed", variant: "destructive" });
      }
    }
    return false;
  };

  // Timer refs to prevent memory leaks
  const emailTimerRef = useRef<NodeJS.Timeout | null>(null);
  const phoneTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer functions with proper cleanup
  const startEmailTimer = () => {
    if (emailTimerRef.current) {
      clearInterval(emailTimerRef.current);
    }
    
    emailTimerRef.current = setInterval(() => {
      setOtpStates(prev => {
        if (prev.email.timer <= 1) {
          if (emailTimerRef.current) {
            clearInterval(emailTimerRef.current);
            emailTimerRef.current = null;
          }
          return { ...prev, email: { ...prev.email, timer: 0 } };
        }
        return { ...prev, email: { ...prev.email, timer: prev.email.timer - 1 } };
      });
    }, 1000);
  };

  const startPhoneTimer = () => {
    if (phoneTimerRef.current) {
      clearInterval(phoneTimerRef.current);
    }
    
    phoneTimerRef.current = setInterval(() => {
      setOtpStates(prev => {
        if (prev.phone.timer <= 1) {
          if (phoneTimerRef.current) {
            clearInterval(phoneTimerRef.current);
            phoneTimerRef.current = null;
          }
          return { ...prev, phone: { ...prev.phone, timer: 0 } };
        }
        return { ...prev, phone: { ...prev.phone, timer: prev.phone.timer - 1 } };
      });
    }, 1000);
  };

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      if (emailTimerRef.current) {
        clearInterval(emailTimerRef.current);
      }
      if (phoneTimerRef.current) {
        clearInterval(phoneTimerRef.current);
      }
    };
  }, []);

  // Wrapper functions for OTP handling
  const handleSendOTP = async (type: 'email' | 'phone') => {
    console.log(`🔧 DEBUG: handleSendOTP called with type: "${type}"`);
    if (type === 'email') {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast({ 
          title: "Invalid Email", 
          description: "Please enter a valid email address", 
          variant: "destructive" 
        });
        return;
      }
      await sendEmailOtp(formData.email);
    } else if (type === 'phone') {
      console.log(`🔧 DEBUG: Phone OTP requested for: "${formData.phoneNumber}", country:`, selectedCountry);
      console.log(`🔧 DEBUG: Current form data:`, formData);
      console.log(`🔧 DEBUG: Current phone validation state:`, phoneValidation);
      
      const isValid = isValidForOTP(formData.phoneNumber, selectedCountry);
      console.log(`🔧 DEBUG: isValidForOTP result: ${isValid}`);
      
      if (!isValid) {
        console.log(`🔧 DEBUG: Phone validation failed - showing error toast`);
        toast({ 
          title: "Invalid Phone", 
          description: "Please enter a valid mobile number for OTP delivery", 
          variant: "destructive" 
        });
        return;
      }
      
      const validation = validateInternationalPhone(formData.phoneNumber, selectedCountry);
      console.log(`🔧 DEBUG: validateInternationalPhone result:`, validation);
      
      if (!validation.formatted) {
        console.log(`🔧 DEBUG: Phone formatting failed`);
        toast({ 
          title: "Invalid Phone", 
          description: "Unable to format phone number correctly", 
          variant: "destructive" 
        });
        return;
      }
      
      console.log(`🔧 DEBUG: Calling sendPhoneOtp with formatted phone: "${validation.formatted}"`);
      await sendPhoneOtp(validation.formatted);
    }
  };

  const handleVerifyOTP = async (type: 'email' | 'phone') => {
    if (type === 'email') {
      const code = otpStates.email.otp || otpStates.email.code;
      if (!code || code.length !== 6) {
        toast({ 
          title: "Invalid OTP", 
          description: "Please enter a valid 6-digit OTP", 
          variant: "destructive" 
        });
        return;
      }
      
      setOtpStates(prev => ({ ...prev, email: { ...prev.email, verifying: true } }));
      const success = await verifyEmailOtp(formData.email, code);
      setOtpStates(prev => ({ ...prev, email: { ...prev.email, verifying: false } }));
      
      if (success) {
        setOtpStates(prev => ({ ...prev, email: { ...prev.email, verified: true } }));
      }
    } else if (type === 'phone') {
      const code = otpStates.phone.otp || otpStates.phone.code;
      if (!code || code.length !== 6) {
        toast({ 
          title: "Invalid OTP", 
          description: "Please enter a valid 6-digit OTP", 
          variant: "destructive" 
        });
        return;
      }
      
      setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, verifying: true } }));
      const validation = validateInternationalPhone(formData.phoneNumber, selectedCountry);
      const success = await verifyPhoneOtp(validation.formatted, code);
      setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, verifying: false } }));
      
      if (success) {
        setOtpStates(prev => ({ ...prev, phone: { ...prev.phone, verified: true } }));
      }
    }
  };

  const internationalCities = [
    // Major international cities
    'New York', 'London', 'Singapore', 'Dubai', 'Hong Kong', 'Tokyo', 'Sydney', 'Mumbai',
    'Dhaka', 'Chittagong', 'Karachi', 'Delhi', 'Bangkok', 'Kuala Lumpur', 'Jakarta', 'Manila',
    'Seoul', 'Shanghai', 'Beijing', 'Taipei', 'Ho Chi Minh City', 'Yangon', 'Colombo', 'Male',
    'Kathmandu', 'Thimphu', 'Riyadh', 'Cairo', 'Istanbul', 'Lagos', 'Nairobi', 'Cape Town',
    'Paris', 'Berlin', 'Rome', 'Madrid', 'Amsterdam', 'Stockholm', 'Oslo', 'Copenhagen',
    'Toronto', 'Vancouver', 'Mexico City', 'São Paulo', 'Buenos Aires', 'Santiago', 'Lima'
  ];

  const benefits = [
    {
      icon: <Truck className="h-5 w-5 text-green-600" />,
      title: "Global Delivery",
      description: "Fast worldwide shipping and local delivery"
    },
    {
      icon: <Shield className="h-5 w-5 text-blue-600" />,
      title: "Secure Shopping",
      description: "100% secure payment & data protection"
    },
    {
      icon: <Gift className="h-5 w-5 text-purple-600" />,
      title: "Welcome Bonus",
      description: "Get shopping credit on signup"
    },
    {
      icon: <Clock className="h-5 w-5 text-orange-600" />,
      title: "24/7 Support",
      description: "Round-the-clock customer service"
    }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (phoneNumber: string, country?: CountryCode) => {
    setFormData(prev => ({ ...prev, phoneNumber }));
    setSelectedCountry(country);
  };

  const handlePhoneValidationChange = (isValid: boolean, errorMessage?: string) => {
    setPhoneValidation({ isValid, errorMessage });
  };



  const validateForm = () => {
    const errors = [];
    
    if (!formData.fullName.trim()) errors.push("Full name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push("Valid email is required");
    
    if (!formData.phoneNumber.trim()) {
      errors.push("Phone number is required");
    } else if (!phoneValidation.isValid) {
      errors.push(phoneValidation.errorMessage || "Valid mobile number required for OTP delivery");
    }
    
    if (formData.password.length < 8) errors.push("Password must be at least 8 characters");
    if (formData.password !== formData.confirmPassword) errors.push("Passwords do not match");
    if (!formData.city) errors.push("City selection is required");
    if (!formData.agreeToTerms) errors.push("Please agree to terms and conditions");
    
    return errors;
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    console.log(`${provider} login clicked`);
    
    try {
      // Here we'll implement actual social login later
      // For now, showing the intent to integrate
      toast({
        title: "Social Login",
        description: `Redirecting to ${provider} for secure authentication...`,
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Implement actual social login integration
      toast({
        title: "Integration Pending",
        description: `${provider} login integration will be completed in next phase`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Signup Failed",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        ...formData,
        language: formData.preferredLanguage,
        source: 'web_signup',
        referrer: document.referrer
      };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Welcome to GetIt! 🎉",
          description: `Account created successfully. Welcome bonus of ৳200 added!`,
        });

        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        toast({
          title: "Signup Failed",
          description: result.error?.message || 'Something went wrong. Please try again.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Fresh Signup Error:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with matching gradient */}
      <Header />
      
      {/* Hero Section with matching gradient theme */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join the World's Leading Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 mb-8 max-w-3xl mx-auto">
              Create your account and discover millions of products worldwide with secure shopping, fast delivery, and exclusive deals
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Side - Benefits & Trust Indicators */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Why Choose GetIt Worldwide?
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                      <div className="flex-shrink-0">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                        <p className="text-sm text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trusted by Millions</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">2M+</div>
                    <div className="text-sm text-gray-600">Happy Customers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">50K+</div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">1K+</div>
                    <div className="text-sm text-gray-600">Verified Vendors</div>
                  </div>
                </div>
              </div>

              {/* Customer Reviews */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What Our Customers Say</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">Verified Purchase</span>
                    </div>
                    <p className="text-gray-700 text-sm">"Great experience! Fast delivery and authentic products. Highly recommended!"</p>
                    <p className="text-xs text-gray-500 mt-1">- Rahul Ahmed, Dhaka</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="lg:sticky lg:top-8">
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4 pb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <div className="text-white font-bold text-2xl">G</div>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">Create Your Account</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      Join millions of happy customers worldwide
                    </CardDescription>
                  </div>
                  
                  {/* Enhanced Social Login Options with Color Icons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors duration-200"
                      onClick={() => handleSocialLogin('Google')}
                      disabled={isLoading}
                    >
                      <FaGoogle className="h-4 w-4 mr-3 text-red-500" />
                      <span className="text-gray-700">Continue with Google</span>
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                        onClick={() => handleSocialLogin('Facebook')}
                        disabled={isLoading}
                      >
                        <FaFacebook className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">Facebook</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => handleSocialLogin('Apple')}
                        disabled={isLoading}
                      >
                        <FaApple className="h-4 w-4 mr-2 text-gray-800" />
                        <span className="text-gray-700">Apple</span>
                      </Button>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">or continue with email/phone</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Enhanced Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
                {formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-xs text-blue-600">📧 Email verification will be sent for account security</p>
              
              {/* Email OTP Verification Section */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => handleSendOTP('email')}
                    disabled={!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || otpStates.email.loading}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {otpStates.email.loading ? 'Sending...' : 'Send Email OTP'}
                  </Button>
                  {otpStates.email.verified && (
                    <div className="flex items-center text-green-600 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
                
                {otpStates.email.sent && !otpStates.email.verified && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otpStates.email.code}
                        onChange={(e) => setOtpStates(prev => ({ 
                          ...prev, 
                          email: { ...prev.email, code: e.target.value.slice(0, 6) }
                        }))}
                        className="flex-1 text-center"
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        onClick={() => handleVerifyOTP('email')}
                        disabled={otpStates.email.code.length !== 6 || otpStates.email.verifying}
                        size="sm"
                        className="text-xs"
                      >
                        {otpStates.email.verifying ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      OTP sent to your email address. Check your inbox.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* International Mobile Number with Country Selection */}
            <div className="space-y-2">
              <CountryPhoneInput
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                onValidationChange={handlePhoneValidationChange}
                label="Mobile Number"
                placeholder="Enter mobile number"
                required={true}
                defaultCountry="BD"
              />
              
              {/* Phone OTP Verification Section */}
              <div className="space-y-3">
                <p className="text-xs text-blue-600">📱 Choose verification method for your mobile number:</p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    onClick={() => handleSendOTP('phone')}
                    disabled={!formData.phoneNumber || !phoneValidation.isValid || otpStates.phone.loading}
                    variant="outline"
                    size="sm"
                    className="text-xs flex items-center gap-1"
                  >
                    <Smartphone className="h-3 w-3" />
                    {otpStates.phone.loading ? 'Sending SMS...' : 'Send SMS OTP'}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={async () => {
                      console.log(`🔧 DEBUG: WhatsApp button clicked for: "${formData.phoneNumber}"`);
                      
                      if (!formData.phoneNumber || !phoneValidation.isValid) {
                        toast({ 
                          title: "Invalid Phone", 
                          description: "Please enter a valid mobile number for WhatsApp verification", 
                          variant: "destructive" 
                        });
                        return;
                      }
                      
                      const validation = validateInternationalPhone(formData.phoneNumber, selectedCountry);
                      if (!validation.formatted) {
                        toast({ 
                          title: "Invalid Phone", 
                          description: "Unable to format phone number correctly", 
                          variant: "destructive" 
                        });
                        return;
                      }
                      
                      console.log(`🔧 DEBUG: Calling sendWhatsAppOtp with formatted phone: "${validation.formatted}"`);
                      await sendWhatsAppOtp(validation.formatted);
                    }}
                    disabled={!formData.phoneNumber || !phoneValidation.isValid || otpStates.phone.loading}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-green-50 hover:bg-green-100 border-green-300 text-green-700 flex items-center gap-1"
                  >
                    <span className="text-green-600">💬</span>
                    {otpStates.phone.loading ? 'Sending WhatsApp...' : 'Send via WhatsApp'}
                  </Button>
                  
                  {otpStates.phone.verified && (
                    <div className="flex items-center text-green-600 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
                
                {otpStates.phone.sent && !otpStates.phone.verified && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder={otpStates.phone.method === 'whatsapp' ? "Enter 6-digit WhatsApp OTP" : "Enter 6-digit SMS OTP"}
                        value={otpStates.phone.code}
                        onChange={(e) => setOtpStates(prev => ({ 
                          ...prev, 
                          phone: { ...prev.phone, code: e.target.value.slice(0, 6) }
                        }))}
                        className="flex-1 text-center"
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        onClick={() => handleVerifyOTP('phone')}
                        disabled={otpStates.phone.code.length !== 6 || otpStates.phone.verifying}
                        size="sm"
                        className="text-xs"
                      >
                        {otpStates.phone.verifying ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {otpStates.phone.method === 'whatsapp' 
                        ? `💬 WhatsApp OTP sent to ${formData.phoneNumber}. Check WhatsApp for the code.`
                        : `📱 SMS OTP sent to ${formData.phoneNumber}. Enter the 6-digit code.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 overflow-auto">
                    {internationalCities.map((city) => (
                      <SelectItem key={city} value={city.toLowerCase()}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="subscribeNewsletter"
                checked={formData.subscribeNewsletter}
                onCheckedChange={(checked) => handleInputChange('subscribeNewsletter', checked as boolean)}
              />
              <Label htmlFor="subscribeNewsletter" className="text-sm text-gray-600">
                Subscribe to newsletter for exclusive deals and offers
              </Label>
            </div>

            {/* Terms Agreement */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to GetIt's{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                  <span className="text-red-500">*</span>
                </Label>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <strong>Your data is secure:</strong> We use bank-level encryption to protect your personal information and never share it with third parties without your consent.
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Your Account...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Create My Account
                </>
              )}
            </Button>

            {/* Welcome Bonus Notice */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
                <Gift className="h-5 w-5" />
                <span className="font-semibold">Welcome Bonus!</span>
              </div>
              <p className="text-sm text-green-600">
                Get ৳200 shopping credit instantly when you create your account
              </p>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Sign In Here
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
</div>

{/* Footer with matching gradient */}
<Footer />
</div>
);
};

export default FreshSignup;