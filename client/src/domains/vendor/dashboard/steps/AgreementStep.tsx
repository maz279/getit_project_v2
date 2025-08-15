
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { ArrowLeft, ArrowRight, FileText, Shield, DollarSign, Truck, Users, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';

interface AgreementStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const AgreementStep: React.FC<AgreementStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}) => {
  const [agreements, setAgreements] = useState({
    termsOfService: false,
    vendorAgreement: false,
    privacyPolicy: false,
    commissionStructure: false,
    returnPolicy: false,
    qualityStandards: false,
  });

  const handleAgreementChange = (key: string, value: boolean) => {
    setAgreements(prev => ({ ...prev, [key]: value }));
  };

  const allAgreed = Object.values(agreements).every(Boolean);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 Step 1 of 9: Terms & Agreements</h2>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-red-500 h-2 rounded-full" style={{ width: '11%' }}></div>
        </div>
        <p className="text-gray-600">Please review and accept our terms to proceed</p>
      </div>

      {/* Key Terms Summary */}
      <Card className="border-2 border-red-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            🔑 Key Terms Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-white to-red-50 p-6 rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
              <h5 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                💰 Commission & Payments
              </h5>
              <ul className="text-sm text-red-600 space-y-1">
                <li>• Commission: {data.vendorType === 'individual' ? '3%' : 
                     data.vendorType === 'small-business' ? '2%' : '1.5%'}</li>
                <li>• Weekly payouts every Friday</li>
                <li>• Minimum payout: ৳500</li>
                <li>• Payment through bank/mobile banking</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <h5 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                📦 Order Management
              </h5>
              <ul className="text-sm text-orange-600 space-y-1">
                <li>• Order confirmation within 24 hours</li>
                <li>• Shipment within 2 business days</li>
                <li>• 7-day return policy support</li>
                <li>• Customer service responsibility</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agreement Checkboxes */}
      <Card className="border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            📝 Required Agreements
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-b-lg">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow duration-300">
              <Checkbox
                id="termsOfService"
                checked={agreements.termsOfService}
                onCheckedChange={(checked) => handleAgreementChange('termsOfService', checked as boolean)}
                className="border-red-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
              />
              <label
                htmlFor="termsOfService"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-red-600" />
                I agree to the Terms of Service
              </label>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow duration-300">
              <Checkbox
                id="vendorAgreement"
                checked={agreements.vendorAgreement}
                onCheckedChange={(checked) => handleAgreementChange('vendorAgreement', checked as boolean)}
                className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label
                htmlFor="vendorAgreement"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-orange-600" />
                I agree to the Vendor Partnership Agreement
              </label>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow duration-300">
              <Checkbox
                id="privacyPolicy"
                checked={agreements.privacyPolicy}
                onCheckedChange={(checked) => handleAgreementChange('privacyPolicy', checked as boolean)}
                className="border-red-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
              />
              <label
                htmlFor="privacyPolicy"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-red-600" />
                I agree to the Privacy Policy
              </label>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow duration-300">
              <Checkbox
                id="commissionStructure"
                checked={agreements.commissionStructure}
                onCheckedChange={(checked) => handleAgreementChange('commissionStructure', checked as boolean)}
                className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label
                htmlFor="commissionStructure"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4 text-orange-600" />
                I agree to the Commission Structure
              </label>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow duration-300">
              <Checkbox
                id="returnPolicy"
                checked={agreements.returnPolicy}
                onCheckedChange={(checked) => handleAgreementChange('returnPolicy', checked as boolean)}
                className="border-red-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
              />
              <label
                htmlFor="returnPolicy"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-red-600" />
                I agree to the Return Policy
              </label>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow duration-300">
              <Checkbox
                id="qualityStandards"
                checked={agreements.qualityStandards}
                onCheckedChange={(checked) => handleAgreementChange('qualityStandards', checked as boolean)}
                className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label
                htmlFor="qualityStandards"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-orange-600" />
                I agree to the Quality Standards
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          <strong>Important:</strong> By proceeding, you confirm that you have read, understood, and agree to all the terms above. 
          These agreements govern your relationship with GetIt and our customers. You can review these documents anytime 
          in your vendor dashboard after approval.
        </AlertDescription>
      </Alert>

      {/* Contact Information */}
      <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            📞 Questions About Terms?
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-white to-green-50 p-6 rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">Legal & Compliance</p>
              <p className="text-sm text-green-600">📧 legal@getit.com.bd</p>
              <p className="text-sm text-green-600">📱 +880-1600-Legal</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-700 font-medium">Vendor Support</p>
              <p className="text-sm text-emerald-600">📧 vendor-support@getit.com.bd</p>
              <p className="text-sm text-emerald-600">💬 Live Chat: 8 AM - 10 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          onClick={onPrev} 
          variant="outline" 
          className="min-w-[120px] border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!allAgreed} 
          className="min-w-[120px] bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Accept & Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
