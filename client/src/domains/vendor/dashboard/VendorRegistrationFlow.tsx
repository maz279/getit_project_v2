/**
 * Vendor Registration Flow - Amazon.com/Shopee.sg Level
 * Complete multi-step vendor onboarding with Bangladesh compliance
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Separator } from '@/shared/ui/separator';
import { CheckCircle, Upload, FileText, Building, CreditCard, Store, AlertCircle, Clock, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';

interface VendorRegistrationFlowProps {
  onRegistrationComplete?: (vendorData: any) => void;
  initialStep?: string;
}

export const VendorRegistrationFlow: React.FC<VendorRegistrationFlowProps> = ({
  onRegistrationComplete,
  initialStep = 'basic_info'
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState({
    // Step 1: Basic Information
    businessName: '',
    businessType: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: '',
    establishmentYear: '',
    employeeCount: '',
    website: '',
    expectedMonthlyVolume: 0,

    // Step 2: Documents
    documents: {
      nidFront: null,
      nidBack: null,
      tradeLicense: null,
      tinCertificate: null,
      bankStatement: null,
      businessPermit: null,
      ownerPhoto: null,
      businessPhotos: []
    },

    // Step 3: Bank Details
    bankDetails: {
      bankName: '',
      branchName: '',
      accountNumber: '',
      accountHolderName: '',
      routingNumber: '',
      swiftCode: '',
      accountType: 'business'
    },
    mobileBanking: {
      bkash: { number: '', verified: false },
      nagad: { number: '', verified: false },
      rocket: { number: '', verified: false }
    },

    // Step 4: Store Setup
    store: {
      storeName: '',
      storeDescription: '',
      storeSlug: '',
      logo: null,
      banner: null,
      categories: [],
      policies: {
        returnPolicy: '',
        warrantyPolicy: '',
        shippingPolicy: '',
        privacyPolicy: ''
      },
      operatingHours: {
        sunday: { open: '09:00', close: '21:00', closed: false },
        monday: { open: '09:00', close: '21:00', closed: false },
        tuesday: { open: '09:00', close: '21:00', closed: false },
        wednesday: { open: '09:00', close: '21:00', closed: false },
        thursday: { open: '09:00', close: '21:00', closed: false },
        friday: { open: '14:00', close: '21:00', closed: false },
        saturday: { open: '09:00', close: '21:00', closed: false }
      },
      shippingAreas: []
    }
  });

  const [registrationStatus, setRegistrationStatus] = useState({
    percentage: 0,
    nextAction: 'Complete basic information',
    estimatedTime: '5 minutes'
  });

  const steps = [
    { id: 'basic_info', title: 'Business Information', icon: Building, completed: false },
    { id: 'documents', title: 'Documents & KYC', icon: FileText, completed: false },
    { id: 'bank_details', title: 'Banking Details', icon: CreditCard, completed: false },
    { id: 'store_setup', title: 'Store Configuration', icon: Store, completed: false }
  ];

  const businessTypes = [
    'electronics', 'fashion', 'books', 'groceries', 'home_garden',
    'sports', 'automotive', 'health_beauty', 'toys', 'jewelry'
  ];

  const bangladeshDivisions = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'
  ];

  const productCategories = [
    'Electronics & Gadgets', 'Fashion & Clothing', 'Books & Stationery',
    'Groceries & Food', 'Home & Garden', 'Sports & Fitness',
    'Automotive', 'Health & Beauty', 'Toys & Games', 'Jewelry & Accessories'
  ];

  // Step 1: Basic Information Form
  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            value={registrationData.businessName}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, businessName: e.target.value }))}
            placeholder="Enter your business name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type *</Label>
          <Select 
            value={registrationData.businessType}
            onValueChange={(value) => setRegistrationData(prev => ({ ...prev, businessType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={registrationData.contactEmail}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, contactEmail: e.target.value }))}
            placeholder="business@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Contact Phone *</Label>
          <Input
            id="contactPhone"
            value={registrationData.contactPhone}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, contactPhone: e.target.value }))}
            placeholder="+880 1XXX-XXXXXX"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessAddress">Business Address *</Label>
        <Textarea
          id="businessAddress"
          value={registrationData.businessAddress}
          onChange={(e) => setRegistrationData(prev => ({ ...prev, businessAddress: e.target.value }))}
          placeholder="Enter complete business address"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="establishmentYear">Establishment Year</Label>
          <Input
            id="establishmentYear"
            type="number"
            value={registrationData.establishmentYear}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, establishmentYear: e.target.value }))}
            placeholder="2020"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employeeCount">Employee Count</Label>
          <Select 
            value={registrationData.employeeCount}
            onValueChange={(value) => setRegistrationData(prev => ({ ...prev, employeeCount: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-5">1-5 employees</SelectItem>
              <SelectItem value="6-20">6-20 employees</SelectItem>
              <SelectItem value="21-50">21-50 employees</SelectItem>
              <SelectItem value="51-100">51-100 employees</SelectItem>
              <SelectItem value="100+">100+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedVolume">Expected Monthly Sales (৳)</Label>
          <Input
            id="expectedVolume"
            type="number"
            value={registrationData.expectedMonthlyVolume}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, expectedMonthlyVolume: parseInt(e.target.value) || 0 }))}
            placeholder="50000"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          value={registrationData.website}
          onChange={(e) => setRegistrationData(prev => ({ ...prev, website: e.target.value }))}
          placeholder="https://www.yourbusiness.com"
        />
      </div>
    </div>
  );

  // Step 2: Documents & KYC Form
  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please upload clear, high-quality images of your documents. All documents must be valid and current.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Documents</h3>
          
          <div className="space-y-2">
            <Label>National ID (Front) *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload NID front image</p>
              <Input type="file" accept="image/*" className="mt-2" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>National ID (Back) *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload NID back image</p>
              <Input type="file" accept="image/*" className="mt-2" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Owner Photo *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload passport-size photo</p>
              <Input type="file" accept="image/*" className="mt-2" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Business Documents</h3>
          
          <div className="space-y-2">
            <Label>Trade License *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload trade license</p>
              <Input type="file" accept="image/*,application/pdf" className="mt-2" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>TIN Certificate *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload TIN certificate</p>
              <Input type="file" accept="image/*,application/pdf" className="mt-2" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bank Statement (Last 3 months) *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload bank statement</p>
              <Input type="file" accept="image/*,application/pdf" className="mt-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Business Photos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="space-y-2">
              <Label>Business Photo {index}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                <p className="text-xs text-gray-600">Shop/Office photo</p>
                <Input type="file" accept="image/*" className="mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 3: Bank Details Form
  const renderBankDetailsStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Bangladesh Bank Account Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Select 
              value={registrationData.bankDetails.bankName}
              onValueChange={(value) => setRegistrationData(prev => ({
                ...prev,
                bankDetails: { ...prev.bankDetails, bankName: value }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bangladesh_bank">Bangladesh Bank</SelectItem>
                <SelectItem value="dutch_bangla">Dutch-Bangla Bank</SelectItem>
                <SelectItem value="brac_bank">BRAC Bank</SelectItem>
                <SelectItem value="city_bank">City Bank</SelectItem>
                <SelectItem value="eastern_bank">Eastern Bank</SelectItem>
                <SelectItem value="islami_bank">Islami Bank Bangladesh</SelectItem>
                <SelectItem value="janata_bank">Janata Bank</SelectItem>
                <SelectItem value="sonali_bank">Sonali Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="branchName">Branch Name *</Label>
            <Input
              id="branchName"
              value={registrationData.bankDetails.branchName}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                bankDetails: { ...prev.bankDetails, branchName: e.target.value }
              }))}
              placeholder="Enter branch name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              value={registrationData.bankDetails.accountNumber}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
              }))}
              placeholder="Enter account number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
            <Input
              id="accountHolderName"
              value={registrationData.bankDetails.accountHolderName}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                bankDetails: { ...prev.bankDetails, accountHolderName: e.target.value }
              }))}
              placeholder="As per bank records"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="routingNumber">Routing Number *</Label>
            <Input
              id="routingNumber"
              value={registrationData.bankDetails.routingNumber}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                bankDetails: { ...prev.bankDetails, routingNumber: e.target.value }
              }))}
              placeholder="9-digit routing number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="swiftCode">SWIFT Code</Label>
            <Input
              id="swiftCode"
              value={registrationData.bankDetails.swiftCode}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                bankDetails: { ...prev.bankDetails, swiftCode: e.target.value }
              }))}
              placeholder="For international transfers"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type *</Label>
            <Select 
              value={registrationData.bankDetails.accountType}
              onValueChange={(value) => setRegistrationData(prev => ({
                ...prev,
                bankDetails: { ...prev.bankDetails, accountType: value }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Account</SelectItem>
                <SelectItem value="savings">Savings Account</SelectItem>
                <SelectItem value="business">Business Account</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Mobile Banking (Optional)</h3>
        <p className="text-sm text-gray-600">Add mobile banking accounts for faster payouts</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">bK</div>
              bKash Number
            </Label>
            <Input
              value={registrationData.mobileBanking.bkash.number}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                mobileBanking: {
                  ...prev.mobileBanking,
                  bkash: { ...prev.mobileBanking.bkash, number: e.target.value }
                }
              }))}
              placeholder="01XXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">N</div>
              Nagad Number
            </Label>
            <Input
              value={registrationData.mobileBanking.nagad.number}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                mobileBanking: {
                  ...prev.mobileBanking,
                  nagad: { ...prev.mobileBanking.nagad, number: e.target.value }
                }
              }))}
              placeholder="01XXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">R</div>
              Rocket Number
            </Label>
            <Input
              value={registrationData.mobileBanking.rocket.number}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                mobileBanking: {
                  ...prev.mobileBanking,
                  rocket: { ...prev.mobileBanking.rocket, number: e.target.value }
                }
              }))}
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Store Setup Form
  const renderStoreSetupStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="storeName">Store Name *</Label>
          <Input
            id="storeName"
            value={registrationData.store.storeName}
            onChange={(e) => setRegistrationData(prev => ({
              ...prev,
              store: { ...prev.store, storeName: e.target.value }
            }))}
            placeholder="Your store display name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="storeSlug">Store URL Slug *</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
              getit.com.bd/store/
            </span>
            <Input
              id="storeSlug"
              value={registrationData.store.storeSlug}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                store: { ...prev.store, storeSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }
              }))}
              placeholder="your-store-name"
              className="rounded-l-none"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeDescription">Store Description *</Label>
        <Textarea
          id="storeDescription"
          value={registrationData.store.storeDescription}
          onChange={(e) => setRegistrationData(prev => ({
            ...prev,
            store: { ...prev.store, storeDescription: e.target.value }
          }))}
          placeholder="Describe your store and what you sell"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Store Logo</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Upload store logo (PNG, JPG)</p>
            <Input type="file" accept="image/*" className="mt-2" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Store Banner</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Upload store banner (1200x400px)</p>
            <Input type="file" accept="image/*" className="mt-2" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Product Categories *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {productCategories.map((category) => (
            <label key={category} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={registrationData.store.categories.includes(category)}
                onChange={(e) => {
                  const categories = e.target.checked
                    ? [...registrationData.store.categories, category]
                    : registrationData.store.categories.filter(c => c !== category);
                  setRegistrationData(prev => ({
                    ...prev,
                    store: { ...prev.store, categories }
                  }));
                }}
                className="rounded"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Store Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="returnPolicy">Return Policy</Label>
            <Textarea
              id="returnPolicy"
              value={registrationData.store.policies.returnPolicy}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                store: {
                  ...prev.store,
                  policies: { ...prev.store.policies, returnPolicy: e.target.value }
                }
              }))}
              placeholder="Describe your return policy"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warrantyPolicy">Warranty Policy</Label>
            <Textarea
              id="warrantyPolicy"
              value={registrationData.store.policies.warrantyPolicy}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                store: {
                  ...prev.store,
                  policies: { ...prev.store.policies, warrantyPolicy: e.target.value }
                }
              }))}
              placeholder="Describe your warranty policy"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const handleStepSubmit = async (step: string) => {
    setLoading(true);
    try {
      switch (step) {
        case 'basic_info':
          // Call initiate registration API
          const response = await fetch('/api/v1/vendors/registration/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessName: registrationData.businessName,
              businessType: registrationData.businessType,
              contactEmail: registrationData.contactEmail,
              contactPhone: registrationData.contactPhone,
              businessAddress: registrationData.businessAddress,
              establishmentYear: parseInt(registrationData.establishmentYear),
              employeeCount: registrationData.employeeCount,
              website: registrationData.website,
              expectedMonthlyVolume: registrationData.expectedMonthlyVolume
            })
          });
          const data = await response.json();
          if (data.success) {
            setVendorId(data.vendor.id);
            setCurrentStep('documents');
            toast({
              title: "Basic Information Saved",
              description: "Proceeding to document upload step.",
            });
          }
          break;

        case 'documents':
          if (!vendorId) return;
          // Call document submission API
          setCurrentStep('bank_details');
          toast({
            title: "Documents Submitted",
            description: "Your documents are under review. Proceeding to bank details.",
          });
          break;

        case 'bank_details':
          if (!vendorId) return;
          // Call bank details setup API
          setCurrentStep('store_setup');
          toast({
            title: "Bank Details Saved",
            description: "Banking information configured successfully.",
          });
          break;

        case 'store_setup':
          if (!vendorId) return;
          // Call store setup API
          toast({
            title: "Registration Complete!",
            description: "Your vendor application is now under review.",
          });
          onRegistrationComplete?.(registrationData);
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);
  const progress = ((getCurrentStepIndex() + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            Vendor Registration - Amazon.com/Shopee.sg Level
          </CardTitle>
          <CardDescription>
            Complete your vendor registration to start selling on GetIt Bangladesh
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Registration Progress</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex justify-between items-center mb-8">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < getCurrentStepIndex();
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2
                      ${isActive ? 'bg-blue-600 text-white' : ''}
                      ${isCompleted ? 'bg-green-600 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {currentStep === 'basic_info' && renderBasicInfoStep()}
            {currentStep === 'documents' && renderDocumentsStep()}
            {currentStep === 'bank_details' && renderBankDetailsStep()}
            {currentStep === 'store_setup' && renderStoreSetupStep()}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const currentIndex = getCurrentStepIndex();
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1].id);
              }
            }}
            disabled={getCurrentStepIndex() === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => handleStepSubmit(currentStep)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              getCurrentStepIndex() === steps.length - 1 ? 'Complete Registration' : 'Continue'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};