/**
 * OTP Verification Modal - Amazon.com/Shopee.sg Level OTP System
 * Comprehensive OTP verification for vendor registration
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Smartphone, Mail, Shield, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  type: 'phone' | 'email';
  contact: string;
  onResend: () => void;
  loading?: boolean;
  error?: string;
  success?: boolean;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  type,
  contact,
  onResend,
  loading = false,
  error,
  success = false
}) => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(300);
      setCanResend(false);
      setResendCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (timeLeft > 0 && isOpen) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerify(otp);
    }
  };

  const handleResend = () => {
    if (canResend && resendCount < 3) {
      onResend();
      setResendCount(resendCount + 1);
      setTimeLeft(300);
      setCanResend(false);
      setOtp('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskContact = (contact: string) => {
    if (type === 'phone') {
      return contact.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    } else {
      const [user, domain] = contact.split('@');
      return `${user.slice(0, 2)}****@${domain}`;
    }
  };

  const icon = type === 'phone' ? <Smartphone className="w-6 h-6" /> : <Mail className="w-6 h-6" />;
  const title = type === 'phone' ? 'Mobile Number Verification' : 'Email Address Verification';
  const description = type === 'phone' 
    ? 'Enter the 6-digit OTP sent to your mobile number'
    : 'Enter the 6-digit OTP sent to your email address';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contact Information */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Secure
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {type === 'phone' ? 'SMS sent to' : 'Email sent to'}
                  </span>
                </div>
                <span className="font-medium">{maskContact(contact)}</span>
              </div>
            </CardContent>
          </Card>

          {/* OTP Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">6-Digit OTP Code</Label>
              <Input
                id="otp"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
                disabled={loading || success}
              />
            </div>

            {/* Timer and Resend */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {timeLeft > 0 ? (
                  <span>Expires in {formatTime(timeLeft)}</span>
                ) : (
                  <span className="text-red-600">OTP Expired</span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={!canResend || resendCount >= 3 || loading}
                className="text-blue-600 hover:text-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Resend {resendCount > 0 ? `(${3 - resendCount} left)` : ''}
              </Button>
            </div>

            {/* Status Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {type === 'phone' ? 'Mobile number' : 'Email address'} verified successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={otp.length !== 6 || loading || success || timeLeft === 0}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </div>
          </form>

          {/* Security Information */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Security Notice</p>
                <p className="text-blue-700">
                  For your security, OTP codes expire in 5 minutes. 
                  Don't share this code with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationModal;