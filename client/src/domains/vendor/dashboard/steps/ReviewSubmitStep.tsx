
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { CheckCircle, ArrowLeft, Send, User, Building, FileText, Store, CreditCard, Truck, FileCheck, Clock, Mail, Phone } from 'lucide-react';

interface ReviewSubmitStepProps {
  data: any;
  onSubmit: () => void;
  onPrev: () => void;
}

export const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ data, onSubmit, onPrev }) => {
  const handleSubmit = () => {
    console.log('Submitting vendor application:', data);
    onSubmit();
    // You could show a success message or redirect to a success page
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🎉 Ready to Submit!</h2>
        <p className="text-gray-600">Please review your information before submitting your vendor application</p>
      </div>

      {/* Application Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">Review Time</p>
              <p className="text-sm text-gray-600">24-48 hours</p>
            </div>
            <div>
              <Mail className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">Email Notification</p>
              <p className="text-sm text-gray-600">Upon approval</p>
            </div>
            <div>
              <Store className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">Start Selling</p>
              <p className="text-sm text-gray-600">Immediately after approval</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* Personal & Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal & Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">{data.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{data.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">+880{data.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">NID Number</p>
                <p className="font-medium">{data.nidNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Business Name</p>
                <p className="font-medium">{data.businessName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Business Type</p>
                <p className="font-medium">{data.businessType}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-gray-600">Business Address</p>
              <p className="font-medium">{data.streetAddress}, {data.area}, {data.upazila}</p>
              <p className="text-gray-600">{data.district}, {data.division} - {data.postalCode}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Business Description</p>
              <p className="font-medium text-sm">{data.businessDescription}</p>
            </div>
          </CardContent>
        </Card>

        {/* Store Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Store Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                {data.storeLogo ? (
                  <img 
                    src={URL.createObjectURL(data.storeLogo)} 
                    alt="Store Logo" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Store className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Store Name</p>
                <p className="font-medium text-lg">{data.storeName}</p>
                <p className="text-sm text-gray-600 mt-1">Category: {data.storeCategory}</p>
                {data.storeBanner && (
                  <Badge variant="secondary" className="mt-2">Banner Uploaded</Badge>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Store Description</p>
              <p className="font-medium text-sm">{data.storeDescription}</p>
            </div>
          </CardContent>
        </Card>

        {/* Business Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Business Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Trade License</p>
                <p className="font-medium">
                  {data.hasTradeLicense ? data.tradeLicenseNumber : 'Individual Seller (No License Required)'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">TIN Number</p>
                <p className="font-medium">{data.tinNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bank Account</p>
                <p className="font-medium">{data.bankName}</p>
                <p className="text-sm text-gray-600">{data.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Holder</p>
                <p className="font-medium">{data.accountHolderName}</p>
              </div>
            </div>
            
            {data.businessModel && data.businessModel.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Business Model</p>
                <div className="flex flex-wrap gap-2">
                  {data.businessModel.map((model: string) => (
                    <Badge key={model} variant="secondary">{model}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'nidFront', label: 'NID Front' },
                { key: 'nidBack', label: 'NID Back' },
                { key: 'tradeLicense', label: 'Trade License' },
                { key: 'tinCertificate', label: 'TIN Certificate' },
                { key: 'bankStatement', label: 'Bank Statement' },
                { key: 'addressProof', label: 'Address Proof' }
              ].map((doc) => {
                const hasDoc = data[doc.key];
                const isRequired = doc.key === 'tradeLicense' ? data.hasTradeLicense : true;
                
                if (!isRequired) return null;
                
                return (
                  <div key={doc.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{doc.label}</span>
                    {hasDoc ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Vendor Type & Commission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Vendor Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg capitalize">{data.vendorType} Vendor</h4>
                <Badge className="bg-blue-100 text-blue-800">
                  {data.vendorType === 'individual' ? '3%' : 
                   data.vendorType === 'small-business' ? '2%' : 
                   data.vendorType === 'enterprise' ? '1.5%' : 'Custom'} Commission
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Weekly payouts, mobile banking support, and dedicated seller support
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What Happens Next */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            🚀 What happens next?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="text-sm text-green-700 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Application review within 24-48 hours
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Document verification by our team
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Email notification upon approval
              </li>
            </ul>
            <ul className="text-sm text-green-700 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Access to vendor dashboard
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Start listing products immediately
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Dedicated onboarding support
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-blue-800 mb-3">📞 Need Help?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>WhatsApp: +880-1600-GetIt</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>vendor-support@getit.com.bd</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Live Chat: 8 AM - 10 PM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="min-w-[120px]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={handleSubmit} className="min-w-[160px] bg-green-600 hover:bg-green-700 text-lg py-3">
          <Send className="w-5 h-5 mr-2" />
          Submit Application
        </Button>
      </div>
    </div>
  );
};
