/**
 * Phase 3: Act Stage - Express Payment
 * Amazon.com 5 A's Framework Implementation
 * Bangladesh Mobile Banking Integration with Security
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Progress } from '@/shared/ui/progress';
import { 
  CreditCard, 
  Smartphone, 
  Shield, 
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Star,
  Eye,
  EyeOff,
  Fingerprint,
  Phone,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpressPaymentProps {
  amount: number;
  orderId?: string;
  className?: string;
}

interface PaymentMethod {
  id: string;
  type: 'mobile-banking' | 'card' | 'wallet' | 'cod';
  provider: string;
  name: string;
  logo: string;
  fees: number;
  processingTime: string;
  features: string[];
  available: boolean;
  popular: boolean;
  secure: boolean;
}

interface PaymentFlow {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  description: string;
  estimatedTime: number;
}

interface SecurityFeature {
  id: string;
  name: string;
  description: string;
  icon: any;
  active: boolean;
}

const ExpressPayment: React.FC<ExpressPaymentProps> = ({
  amount,
  orderId,
  className,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow | null>(null);
  const [securityFeatures, setSecurityFeatures] = useState<SecurityFeature[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load payment methods and security features
    const loadPaymentData = () => {
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: 'bkash',
          type: 'mobile-banking',
          provider: 'bKash',
          name: 'bKash Mobile Banking',
          logo: '📱',
          fees: 0,
          processingTime: 'Instant',
          features: ['No fees', 'Instant transfer', '24/7 available', 'OTP security'],
          available: true,
          popular: true,
          secure: true
        },
        {
          id: 'nagad',
          type: 'mobile-banking',
          provider: 'Nagad',
          name: 'Nagad Digital Wallet',
          logo: '💳',
          fees: 15,
          processingTime: 'Instant',
          features: ['Low fees', 'Quick process', 'Bank grade security', 'Fingerprint'],
          available: true,
          popular: true,
          secure: true
        },
        {
          id: 'rocket',
          type: 'mobile-banking',
          provider: 'Rocket',
          name: 'Dutch Bangla Rocket',
          logo: '🚀',
          fees: 18,
          processingTime: 'Instant',
          features: ['DBBL backed', 'Secure payment', 'Wide network', 'SMS confirmation'],
          available: true,
          popular: false,
          secure: true
        },
        {
          id: 'upay',
          type: 'mobile-banking',
          provider: 'Upay',
          name: 'UCB Upay',
          logo: '📲',
          fees: 20,
          processingTime: '1-2 minutes',
          features: ['UCB backed', 'QR payment', 'Cashback offers', 'PIN security'],
          available: true,
          popular: false,
          secure: true
        },
        {
          id: 'card',
          type: 'card',
          provider: 'Card',
          name: 'Credit/Debit Card',
          logo: '💳',
          fees: 150,
          processingTime: '2-3 minutes',
          features: ['All major cards', '3D secure', 'International support', 'EMI options'],
          available: true,
          popular: false,
          secure: true
        },
        {
          id: 'cod',
          type: 'cod',
          provider: 'COD',
          name: 'Cash on Delivery',
          logo: '💵',
          fees: 50,
          processingTime: 'On delivery',
          features: ['Pay on delivery', 'No advance payment', 'Cash/card accepted', 'Flexible'],
          available: true,
          popular: false,
          secure: false
        }
      ];

      const mockSecurityFeatures: SecurityFeature[] = [
        {
          id: 'encryption',
          name: '256-bit SSL Encryption',
          description: 'Bank-grade encryption for all transactions',
          icon: Lock,
          active: true
        },
        {
          id: 'otp',
          name: 'OTP Verification',
          description: 'One-time password for secure authentication',
          icon: Phone,
          active: true
        },
        {
          id: 'biometric',
          name: 'Biometric Security',
          description: 'Fingerprint and face recognition support',
          icon: Fingerprint,
          active: true
        },
        {
          id: 'fraud',
          name: 'Fraud Detection',
          description: 'AI-powered fraud prevention system',
          icon: Shield,
          active: true
        }
      ];

      setTimeout(() => {
        setPaymentMethods(mockPaymentMethods);
        setSecurityFeatures(mockSecurityFeatures);
        setLoading(false);
      }, 1000);
    };

    loadPaymentData();
  }, []);

  const handlePaymentStart = async (methodId: string) => {
    setSelectedMethod(methodId);
    const method = paymentMethods.find(m => m.id === methodId);
    
    if (!method) return;

    setPaymentFlow({
      currentStep: 1,
      totalSteps: method.type === 'mobile-banking' ? 4 : 3,
      stepName: 'Authentication',
      description: 'Verifying your payment details',
      estimatedTime: 30
    });

    setIsProcessing(true);

    // Simulate payment flow
    setTimeout(() => {
      setPaymentFlow({
        currentStep: 2,
        totalSteps: 4,
        stepName: 'OTP Verification',
        description: 'Enter the OTP sent to your phone',
        estimatedTime: 20
      });
    }, 2000);
  };

  const handleOtpSubmit = () => {
    setPaymentFlow({
      currentStep: 3,
      totalSteps: 4,
      stepName: 'Processing Payment',
      description: 'Securely processing your payment',
      estimatedTime: 10
    });

    setTimeout(() => {
      setPaymentFlow({
        currentStep: 4,
        totalSteps: 4,
        stepName: 'Payment Complete',
        description: 'Payment successful! Order confirmed',
        estimatedTime: 0
      });
      
      setTimeout(() => {
        setPaymentComplete(true);
        setIsProcessing(false);
      }, 1000);
    }, 3000);
  };

  const PaymentMethodCard = ({ method }: { method: PaymentMethod }) => (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        selectedMethod === method.id && 'ring-2 ring-primary',
        !method.available && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => method.available && handlePaymentStart(method.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{method.logo}</div>
            <div>
              <h3 className="font-semibold">{method.name}</h3>
              <p className="text-sm text-muted-foreground">{method.provider}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {method.popular && (
              <Badge className="bg-orange-500 text-white text-xs">Popular</Badge>
            )}
            {method.secure && (
              <Badge className="bg-green-100 text-green-700 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          <div>
            <span className="text-muted-foreground">Fee:</span>
            <span className="font-medium ml-1">
              {method.fees === 0 ? 'FREE' : `৳${method.fees}`}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium ml-1">{method.processingTime}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {method.features.slice(0, 3).map((feature) => (
            <Badge key={feature} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>

        <div className="text-right">
          <span className="text-lg font-bold text-primary">
            Total: ৳{(amount + method.fees).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <Card className="text-center py-12 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent>
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your payment has been processed successfully.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-primary">৳{amount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Amount Paid</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {paymentMethods.find(m => m.id === selectedMethod)?.provider}
                </div>
                <div className="text-sm text-muted-foreground">Payment Method</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">Instant</div>
                <div className="text-sm text-muted-foreground">Processing Time</div>
              </div>
            </div>
            <Button className="mr-4">
              Download Receipt
            </Button>
            <Button variant="outline">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Zap className="h-6 w-6 text-blue-500" />
          Express Payment
        </h1>
        <p className="text-muted-foreground">
          Fast and secure payment with Bangladesh mobile banking
        </p>
      </div>

      {!isProcessing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Choose Payment Method</h2>
            
            {/* Mobile Banking */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Banking (Recommended)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods
                  .filter(method => method.type === 'mobile-banking')
                  .map((method) => (
                    <PaymentMethodCard key={method.id} method={method} />
                  ))}
              </div>
            </div>

            {/* Other Methods */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Other Payment Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods
                  .filter(method => method.type !== 'mobile-banking')
                  .map((method) => (
                    <PaymentMethodCard key={method.id} method={method} />
                  ))}
              </div>
            </div>
          </div>

          {/* Payment Summary & Security */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Order Amount</span>
                    <span>৳{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Fee</span>
                    <span>
                      {selectedMethod ? 
                        paymentMethods.find(m => m.id === selectedMethod)?.fees === 0 ? 
                          'FREE' : 
                          `৳${paymentMethods.find(m => m.id === selectedMethod)?.fees}` 
                        : 'Select method'
                      }
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      ৳{selectedMethod ? 
                        (amount + (paymentMethods.find(m => m.id === selectedMethod)?.fees || 0)).toLocaleString() :
                        amount.toLocaleString()
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.id} className="flex items-start gap-3">
                        <Icon className="h-4 w-4 text-green-500 mt-1" />
                        <div>
                          <p className="font-medium text-sm">{feature.name}</p>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">4.9/5 Payment Success Rate</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Average Processing: 15 seconds</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Bangladesh Bank Certified</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Payment Processing Flow */
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              Processing Payment with {paymentMethods.find(m => m.id === selectedMethod)?.provider}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Step {paymentFlow?.currentStep} of {paymentFlow?.totalSteps}</span>
                <span>{paymentFlow?.stepName}</span>
              </div>
              <Progress value={(paymentFlow?.currentStep || 0) / (paymentFlow?.totalSteps || 1) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">{paymentFlow?.description}</p>
            </div>

            {/* Step-specific content */}
            {paymentFlow?.currentStep === 1 && (
              <div className="text-center space-y-4">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p>Connecting to {paymentMethods.find(m => m.id === selectedMethod)?.provider}...</p>
              </div>
            )}

            {paymentFlow?.currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-medium">Enter OTP sent to your phone</p>
                  <p className="text-sm text-muted-foreground">Check your SMS for verification code</p>
                </div>
                <div className="max-w-xs mx-auto space-y-3">
                  <Input
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg"
                  />
                  <Button 
                    onClick={handleOtpSubmit}
                    disabled={otpCode.length !== 6}
                    className="w-full"
                  >
                    Verify & Pay
                  </Button>
                  <Button variant="outline" className="w-full text-sm">
                    Resend OTP
                  </Button>
                </div>
              </div>
            )}

            {paymentFlow?.currentStep === 3 && (
              <div className="text-center space-y-4">
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                <p>Processing your payment securely...</p>
                <p className="text-sm text-muted-foreground">This may take a few seconds</p>
              </div>
            )}

            {paymentFlow?.currentStep === 4 && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="font-semibold text-green-600">Payment Successful!</p>
              </div>
            )}

            {/* Security reminder */}
            <div className="text-center text-xs text-muted-foreground border-t pt-4">
              <Lock className="h-3 w-3 inline mr-1" />
              Your payment is secured with 256-bit SSL encryption
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpressPayment;