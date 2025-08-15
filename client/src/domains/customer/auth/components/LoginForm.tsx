import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Phone, Mail, Lock, AlertCircle, CheckCircle, Facebook, Chrome, Apple } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Separator } from '@/shared/ui/separator';
import { Badge } from '@/shared/ui/badge';
import { useToast } from '@/shared/hooks/use-toast';
import { useSimpleLanguage } from '@/contexts/SimpleLanguageContext';

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  onSwitchToSignup?: () => void;
  onForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignup,
  onForgotPassword
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const { toast } = useToast();
  const { language } = useSimpleLanguage();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone: data.emailOrPhone,
          password: data.password,
          rememberMe: data.rememberMe,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: language === 'bn' ? 'সফল লগইন' : 'Login Successful',
          description: language === 'bn' ? 'আপনি সফলভাবে লগইন হয়েছেন' : 'Welcome back!',
          variant: 'default',
        });
        
        onSuccess?.(result.data.user);
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      toast({
        title: language === 'bn' ? 'লগইন ব্যর্থ' : 'Login Failed',
        description: language === 'bn' ? 'আপনার তথ্য পরীক্ষা করুন' : 'Please check your credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true);
    
    try {
      // Redirect to OAuth provider
      window.location.href = `/api/auth/${provider}`;
    } catch (error) {
      toast({
        title: language === 'bn' ? 'সোশ্যাল লগইন ব্যর্থ' : 'Social Login Failed',
        description: language === 'bn' ? 'আবার চেষ্টা করুন' : 'Please try again',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const detectLoginType = (value: string) => {
    const phoneRegex = /^(\+880|880|0)?[1-9]\d{8,10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (phoneRegex.test(value)) {
      setLoginType('phone');
    } else if (emailRegex.test(value)) {
      setLoginType('email');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {language === 'bn' ? 'লগইন করুন' : 'Welcome Back'}
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          {language === 'bn' ? 'আপনার একাউন্টে প্রবেশ করুন' : 'Sign in to your account'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Social Login Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full relative hover:bg-red-50 hover:border-red-200"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            <Chrome className="w-4 h-4 absolute left-4 text-red-500" />
            {language === 'bn' ? 'Google দিয়ে লগইন' : 'Continue with Google'}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="hover:bg-blue-50 hover:border-blue-200"
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading}
            >
              <Facebook className="w-4 h-4 mr-2 text-blue-600" />
              Facebook
            </Button>
            
            <Button
              variant="outline"
              className="hover:bg-gray-50 hover:border-gray-200"
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
            >
              <Apple className="w-4 h-4 mr-2 text-gray-800" />
              Apple
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              {language === 'bn' ? 'অথবা' : 'Or'}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="emailOrPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {language === 'bn' ? 'ইমেইল অথবা ফোন নম্বর' : 'Email or Phone Number'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      {loginType === 'email' ? (
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      ) : (
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      )}
                      <Input
                        {...field}
                        placeholder={language === 'bn' ? 'example@email.com বা +880 1234567890' : 'example@email.com or +880 1234567890'}
                        className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        onChange={(e) => {
                          field.onChange(e);
                          detectLoginType(e.target.value);
                        }}
                      />
                      {loginType === 'phone' && (
                        <Badge variant="secondary" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs">
                          🇧🇩 BD
                        </Badge>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={language === 'bn' ? 'আপনার পাসওয়ার্ড লিখুন' : 'Enter your password'}
                        className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-gray-600 cursor-pointer">
                      {language === 'bn' ? 'আমাকে মনে রাখুন' : 'Remember me'}
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              <Button
                type="button"
                variant="link"
                className="text-sm text-blue-600 hover:text-blue-800 p-0"
                onClick={onForgotPassword}
              >
                {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{language === 'bn' ? 'লগইন করা হচ্ছে...' : 'Signing in...'}</span>
                </div>
              ) : (
                language === 'bn' ? 'লগইন করুন' : 'Sign In'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {language === 'bn' ? 'নতুন একাউন্ট তৈরি করতে চান?' : "Don't have an account?"}{' '}
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
              onClick={onSwitchToSignup}
            >
              {language === 'bn' ? 'সাইন আপ করুন' : 'Sign up'}
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};