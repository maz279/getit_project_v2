
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Check, ArrowLeft, ArrowRight, Store, User, FileText, CreditCard, Truck, CheckCircle, Clock } from 'lucide-react';
import { WelcomeBenefitsStep } from './steps/WelcomeBenefitsStep';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { BusinessVerificationStep } from './steps/BusinessVerificationStep';
import { KYCDocumentsStep } from './steps/KYCDocumentsStep';
import { StoreSetupStep } from './steps/StoreSetupStep';
import { PaymentSetupStep } from './steps/PaymentSetupStep';
import { ShippingConfigStep } from './steps/ShippingConfigStep';
import { AgreementStep } from './steps/AgreementStep';
import { ReviewSubmitStep } from './steps/ReviewSubmitStep';

interface VendorData {
  // Basic Info
  fullName: string;
  email: string;
  phone: string;
  nidNumber: string;
  businessName: string;
  businessType: string;
  businessCategory: string;
  yearsInBusiness: string;
  businessDescription: string;
  
  // Verification Status
  phoneVerified: boolean;
  emailVerified: boolean;
  
  // Business Registration Information
  businessLicense: string;
  taxId: string;
  vatNumber: string;
  annualRevenue: string;
  taxStatus: string;
  
  // Financial Information
  mobileBanking: string[];
  preferredPayment: string;
  
  // Shop Setup Preferences
  shopName: string;
  shopSlogan: string;
  primaryChannel: string;
  targetCustomer: string;
  onlinePresence: string[];
  businessGoals: string;
  
  // Address
  division: string;
  district: string;
  upazila: string;
  area: string;
  streetAddress: string;
  postalCode: string;
  sameAsPickup: boolean;
  multipleLocations: boolean;
  
  // Business Verification
  hasTradeLicense: boolean;
  tradeLicenseNumber: string;
  issuingAuthority: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  businessActivities: string[];
  tinNumber: string;
  tinType: string;
  issuingCircle: string;
  
  // Bank Details
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branchName: string;
  accountType: string;
  
  // Business Operations
  monthlySalesVolume: string;
  expectedProductCount: string;
  businessModel: string[];
  targetCustomers: string[];
  facebookPage: string;
  website: string;
  otherPlatforms: string;
  
  // Documents
  nidFront: File | null;
  nidBack: File | null;
  tradeLicense: File | null;
  tinCertificate: File | null;
  bankStatement: File | null;
  addressProof: File | null;
  
  // Store Setup
  storeName: string;
  storeDescription: string;
  storeCategory: string;
  storeLogo: File | null;
  storeBanner: File | null;
  
  // Vendor Type
  vendorType: 'individual' | 'small-business' | 'enterprise' | 'digital';
  languagePreference: string;
}

const steps = [
  { id: 1, title: 'Welcome & Benefits', description: 'Platform overview', icon: Store },
  { id: 2, title: 'Basic Information', description: 'Personal & business details', icon: User },
  { id: 3, title: 'Business Verification', description: 'Trade license & registration', icon: FileText },
  { id: 4, title: 'KYC Documents', description: 'Document upload', icon: FileText },
  { id: 5, title: 'Store Setup', description: 'Configure your store', icon: Store },
  { id: 6, title: 'Payment Setup', description: 'Banking & payments', icon: CreditCard },
  { id: 7, title: 'Shipping Config', description: 'Delivery settings', icon: Truck },
  { id: 8, title: 'Agreement', description: 'Terms & conditions', icon: CheckCircle },
  { id: 9, title: 'Review & Submit', description: 'Final review', icon: Check },
];

export const VendorOnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorData, setVendorData] = useState<VendorData>({
    fullName: '',
    email: '',
    phone: '',
    nidNumber: '',
    businessName: '',
    businessType: '',
    businessCategory: '',
    yearsInBusiness: '',
    businessDescription: '',
    
    // Verification Status
    phoneVerified: false,
    emailVerified: false,
    
    // Business Registration Information
    businessLicense: '',
    taxId: '',
    vatNumber: '',
    annualRevenue: '',
    taxStatus: '',
    
    // Financial Information
    mobileBanking: [],
    preferredPayment: '',
    
    // Shop Setup Preferences
    shopName: '',
    shopSlogan: '',
    primaryChannel: '',
    targetCustomer: '',
    onlinePresence: [],
    businessGoals: '',
    
    division: '',
    district: '',
    upazila: '',
    area: '',
    streetAddress: '',
    postalCode: '',
    sameAsPickup: false,
    multipleLocations: false,
    hasTradeLicense: false,
    tradeLicenseNumber: '',
    issuingAuthority: '',
    licenseIssueDate: '',
    licenseExpiryDate: '',
    businessActivities: [],
    tinNumber: '',
    tinType: 'individual',
    issuingCircle: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    branchName: '',
    accountType: 'current',
    monthlySalesVolume: '',
    expectedProductCount: '',
    businessModel: [],
    targetCustomers: [],
    facebookPage: '',
    website: '',
    otherPlatforms: '',
    nidFront: null,
    nidBack: null,
    tradeLicense: null,
    tinCertificate: null,
    bankStatement: null,
    addressProof: null,
    storeName: '',
    storeDescription: '',
    storeCategory: '',
    storeLogo: null,
    storeBanner: null,
    vendorType: 'individual',
    languagePreference: 'english',
  });

  const updateVendorData = (data: Partial<VendorData>) => {
    setVendorData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const handleSubmit = () => {
    console.log('Submitting vendor application:', vendorData);
    // Handle final submission
  };

  const progress = (currentStep / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeBenefitsStep data={vendorData} updateData={updateVendorData} onNext={nextStep} />;
      case 2:
        return <BasicInfoStep data={vendorData} updateData={updateVendorData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <BusinessVerificationStep data={vendorData} updateData={updateVendorData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <KYCDocumentsStep data={vendorData} updateData={updateVendorData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <StoreSetupStep data={vendorData} updateData={updateVendorData} onNext={nextStep} onPrev={prevStep} />;
      case 6:
        return <PaymentSetupStep data={vendorData} updateData={updateVendorData} onNext={nextStep} onPrev={prevStep} />;
      case 7:
        return <ShippingConfigStep data={vendorData} updateData={updateVendorData} onNext={nextStep} onPrev={prevStep} />;
      case 8:
        return <AgreementStep data={vendorData} updateData={updateVendorData} onNext={nextStep} onPrev={prevStep} />;
      case 9:
        return <ReviewSubmitStep data={vendorData} onSubmit={handleSubmit} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  const StepIcon = steps[currentStep - 1].icon;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          GetIt Vendor Onboarding
        </h1>
        <p className="text-xl text-gray-600 mb-6">Join Bangladesh's fastest growing marketplace</p>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Estimated Time: 15-20 minutes</span>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Enhanced Side Navigation */}
        <div className="w-80 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6 h-fit sticky top-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">Step {currentStep} of {steps.length}</span>
            </div>
            <Progress value={progress} className="h-3 bg-gray-200" />
            <div className="text-xs text-gray-500 mt-2 text-center">{Math.round(progress)}% Complete</div>
          </div>

          <nav className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isClickable = step.id <= currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && goToStep(step.id)}
                  disabled={!isClickable}
                  className={`w-full text-left p-4 rounded-xl flex items-start gap-3 transition-all duration-300 transform hover:scale-105 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg border-2 border-blue-300'
                      : isCompleted
                      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md hover:shadow-lg border border-green-300'
                      : isClickable
                      ? 'hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-200 shadow-sm'
                      : 'text-gray-400 cursor-not-allowed border border-gray-100'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                    isCompleted
                      ? 'bg-white text-green-600'
                      : isCurrent
                      ? 'bg-white text-blue-600'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{step.title}</p>
                    <p className="text-xs opacity-90 mt-1">{step.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Enhanced Help Section */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-md">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Need Help?
            </h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-green-600">📱</span> WhatsApp: +880-1600-GetIt
              </p>
              <p className="flex items-center gap-2">
                <span className="text-red-600">📧</span> vendor-support@getit.com.bd
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600">💬</span> Live Chat: 8 AM - 10 PM
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="flex-1">
          <Card className="shadow-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <StepIcon className="w-6 h-6 text-blue-600" />
                </div>
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-blue-100">{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {renderStep()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
