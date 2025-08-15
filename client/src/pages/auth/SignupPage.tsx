import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Mail, Lock, Eye, EyeOff, Smartphone, User, Loader2 } from 'lucide-react';
import { toast } from '@/shared/ui/use-toast';
import { useSimpleLanguage } from '@/contexts/SimpleLanguageContext';

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    city: '',
    agreeToTerms: false,
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { language } = useSimpleLanguage();

  const bangladeshCities = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: language === 'bn' ? 'নিবন্ধন ব্যর্থ' : 'Registration Failed',
        description: language === 'bn' ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: language === 'bn' ? 'নিবন্ধন ব্যর্থ' : 'Registration Failed',
        description: language === 'bn' ? 'দয়া করে শর্তাবলীতে সম্মতি দিন' : 'Please agree to the terms and conditions',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const signupData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        city: formData.city,
        agreeToTerms: formData.agreeToTerms,
        language: language
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
          title: language === 'bn' ? 'নিবন্ধন সফল' : 'Registration Successful',
          description: language === 'bn' ? 'GetIt এ স্বাগতম! আপনার অ্যাকাউন্ট তৈরি হয়েছে।' : 'Welcome to GetIt! Your account has been created.',
        });
        
        // Store token if provided
        if (result.data?.token) {
          localStorage.setItem('authToken', result.data.token);
        }
        
        navigate('/'); // Redirect to homepage
      } else {
        toast({
          title: language === 'bn' ? 'নিবন্ধন ব্যর্থ' : 'Registration Failed',
          description: result.error?.message || (language === 'bn' ? 'তথ্য পরীক্ষা করে আবার চেষ্টা করুন' : 'Please check your information and try again'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: language === 'bn' ? 'নিবন্ধন ত্রুটি' : 'Registration Error',
        description: language === 'bn' ? 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। আবার চেষ্টা করুন।' : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 via-emerald-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <span className="text-white text-2xl font-bold">G</span>
            </div>
          </div>
          <CardTitle className="text-2xl">
            {language === 'bn' ? 'GetIt এ যোগ দিন' : 'Join GetIt'}
          </CardTitle>
          <CardDescription>
            {language === 'bn' ? 'আপনার অ্যাকাউন্ট তৈরি করুন এবং কেনাকাটা শুরু করুন' : 'Create your account and start shopping'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
              </label>
              <Input 
                placeholder={language === 'bn' ? 'আপনার পূর্ণ নাম' : 'Your full name'} 
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <Input
                type="email"
                placeholder={language === 'bn' ? 'আপনার ইমেইল' : 'Enter your email'}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
              </label>
              <Input
                type="tel"
                placeholder="+880 1XXX-XXXXXX"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'bn' ? 'শহর' : 'City'}
              </label>
              <select 
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">{language === 'bn' ? 'শহর নির্বাচন করুন' : 'Select City'}</option>
                {bangladeshCities.map(city => (
                  <option key={city} value={city.toLowerCase()}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={language === 'bn' ? 'একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন' : 'Create a strong password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
              </label>
              <div className="relative mt-1">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm your password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="mr-2"
                required
              />
              <label className="text-sm text-gray-600">
                {language === 'bn' ? 'আমি ' : 'I agree to the '}
                <Link to="/terms" className="text-orange-600 hover:text-orange-700">
                  {language === 'bn' ? 'শর্তাবলী' : 'Terms and Conditions'}
                </Link>
                {language === 'bn' ? ' এবং ' : ' and '}
                <Link to="/privacy" className="text-orange-600 hover:text-orange-700">
                  {language === 'bn' ? 'গোপনীয়তার নীতি' : 'Privacy Policy'}
                </Link>
                {language === 'bn' ? ' তে সম্মত।' : ''}
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করা হচ্ছে...' : 'Creating Account...'}
                </>
              ) : (
                language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              {language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}
              <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                {language === 'bn' ? 'সাইন ইন করুন' : 'Sign in'}
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;