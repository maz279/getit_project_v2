
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { ArrowLeft, ArrowRight, CreditCard, Smartphone, Building, CheckCircle } from 'lucide-react';

interface PaymentSetupStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PaymentSetupStep: React.FC<PaymentSetupStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}) => {
  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 shadow-xl border border-blue-200">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">💳 Payment Setup Complete!</h2>
        <p className="text-gray-600 text-lg">Your bank account information has been verified</p>
      </div>

      {/* Enhanced Payment Summary */}
      <Card className="bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            Payment Information Verified
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-600 font-medium">Bank Account</p>
              <p className="text-green-800">{data.bankName}</p>
              <p className="text-green-700">Account: {data.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Account Holder</p>
              <p className="text-green-800">{data.accountHolderName}</p>
              <p className="text-green-700">{data.branchName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Payment Methods */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-200">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">📱 Available Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Smartphone className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <h4 className="font-semibold mb-2">Mobile Banking</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>bKash: ✅ Available</p>
                <p>Nagad: ✅ Available</p>
                <p>Rocket: ✅ Available</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Building className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h4 className="font-semibold mb-2">Bank Transfer</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Direct Deposit: ✅ Available</p>
                <p>Processing: 24-48 hours</p>
                <p>Fee: No charges</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-purple-600" />
              <h4 className="font-semibold mb-2">Card Payments</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Visa/Mastercard: ✅ Accepted</p>
                <p>Customer payments</p>
                <p>Instant processing</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Payout Schedule */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-lg">💰</span>
            </div>
            Payout Schedule & Commission
          </CardTitle>
          <CardDescription className="text-yellow-100">
            How and when you'll receive payments from sales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">🗓️ Payout Frequency</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Weekly payouts every Friday</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Instant payout option available</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Minimum payout: ৳500</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">📊 Commission Structure</h4>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-lg font-bold text-blue-800">
                  {data.vendorType === 'individual' ? '3%' : 
                   data.vendorType === 'small-business' ? '2%' : 
                   data.vendorType === 'enterprise' ? '1.5%' : 'Custom'} Commission
                </p>
                <p className="text-sm text-blue-600">
                  Based on your vendor type: {data.vendorType}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h5 className="font-semibold text-yellow-800 mb-2">💡 Payment Tips</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Ensure your bank account details are correct for smooth payouts</li>
              <li>• Mobile banking payouts are faster than bank transfers</li>
              <li>• Keep your TIN certificate updated for tax compliance</li>
              <li>• Track your earnings in real-time through the vendor dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-blue-800 mb-3">🔒 Payment Security Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                SSL encryption for all transactions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                PCI DSS compliant payment processing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Real-time fraud detection
              </li>
            </ul>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Secure API integrations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Transaction monitoring 24/7
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Dispute resolution support
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="min-w-[120px] bg-white/70 backdrop-blur-sm hover:bg-white/90 border-blue-300 text-blue-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext} className="min-w-[120px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
