
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/auth/register');
      return;
    }

    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, canResend, email, navigate]);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      // Simulate resend API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResendSuccess(true);
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      console.error('Failed to resend email');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link 
              to="/auth/register" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </Link>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2">
                We've sent a verification link to your email address
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {resendSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Verification email sent successfully! Please check your inbox.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  We sent a verification link to:
                </p>
                <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg">
                  {email}
                </p>
                <p className="text-sm text-gray-600">
                  Click the link in the email to verify your account and complete registration.
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Didn't receive the email? Check your spam folder or
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={!canResend || resendLoading}
                    className="w-full"
                  >
                    {resendLoading 
                      ? 'Sending...' 
                      : canResend 
                        ? 'Resend Verification Email'
                        : `Resend in ${countdown}s`
                    }
                  </Button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Already verified?{' '}
                    <Link 
                      to="/auth/login" 
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Sign in to your account
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyEmail;
