/**
 * Vendor Registration - New vendor onboarding interface
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  Store, User, Mail, Phone, MapPin, Building, FileText, Upload,
  CreditCard, Shield, Globe, Package, Camera, CheckCircle, AlertCircle
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

const VendorRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    storeName: '',
    storeNameBengali: '',
    ownerName: '',
    ownerNameBengali: '',
    email: '',
    phone: '',
    alternatePhone: '',
    
    // Business Details
    businessType: '',
    businessCategory: '',
    yearsInBusiness: '',
    monthlyRevenue: '',
    numberOfEmployees: '',
    
    // Address Information
    division: '',
    district: '',
    upazila: '',
    streetAddress: '',
    postalCode: '',
    landmark: '',
    
    // Documents
    nidNumber: '',
    tradeLicense: '',
    tinNumber: '',
    bankName: '',
    bankBranch: '',
    accountNumber: '',
    accountName: '',
    
    // Store Preferences
    primaryCategory: '',
    secondaryCategories: [],
    shippingMethods: [],
    paymentMethods: [],
    returnPolicy: '',
    
    // Agreement
    termsAccepted: false,
    commissionAgreed: false,
    dataProtection: false
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    nidFront: null,
    nidBack: null,
    tradeLicense: null,
    tinCertificate: null,
    bankStatement: null,
    storePhoto: null
  });

  const steps = [
    { number: 1, title: 'Basic Information', icon: User },
    { number: 2, title: 'Business Details', icon: Building },
    { number: 3, title: 'Address', icon: MapPin },
    { number: 4, title: 'Documents', icon: FileText },
    { number: 5, title: 'Store Setup', icon: Store },
    { number: 6, title: 'Agreement', icon: Shield }
  ];

  const divisions = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 
    'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'
  ];

  const businessCategories = [
    'Electronics', 'Fashion & Clothing', 'Home & Living', 'Health & Beauty',
    'Food & Grocery', 'Baby & Kids', 'Sports & Outdoors', 'Books & Media',
    'Automotive', 'Others'
  ];

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <AdminLayout
      currentPage="Vendor Registration"
      breadcrumbItems={[
        { label: 'Vendors', href: '/admin/vendors' },
        { label: 'Vendor Registration' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            New Vendor Registration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Complete vendor onboarding process with KYC verification
          </p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="py-6">
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${currentStep >= step.number 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'}
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm mt-2">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        w-24 h-0.5 mx-2 mt-6
                        ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={(currentStep / 6) * 100} className="mt-6" />
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              Step {currentStep} of 6 - Please fill in all required information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="storeName">Store Name (English) *</Label>
                    <Input 
                      id="storeName"
                      placeholder="Enter store name"
                      value={formData.storeName}
                      onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeNameBengali">Store Name (Bengali)</Label>
                    <Input 
                      id="storeNameBengali"
                      placeholder="দোকানের নাম"
                      value={formData.storeNameBengali}
                      onChange={(e) => setFormData({...formData, storeNameBengali: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerName">Owner Name (English) *</Label>
                    <Input 
                      id="ownerName"
                      placeholder="Enter owner name"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerNameBengali">Owner Name (Bengali)</Label>
                    <Input 
                      id="ownerNameBengali"
                      placeholder="মালিকের নাম"
                      value={formData.ownerNameBengali}
                      onChange={(e) => setFormData({...formData, ownerNameBengali: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="vendor@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone"
                      placeholder="+880 1XXX-XXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    All fields marked with * are required. Bengali names help with local customer trust.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select 
                      value={formData.businessType} 
                      onValueChange={(value) => setFormData({...formData, businessType: value})}
                    >
                      <SelectTrigger id="businessType" className="mt-1">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual/Sole Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="private">Private Limited Company</SelectItem>
                        <SelectItem value="public">Public Limited Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="businessCategory">Primary Business Category *</Label>
                    <Select 
                      value={formData.businessCategory} 
                      onValueChange={(value) => setFormData({...formData, businessCategory: value})}
                    >
                      <SelectTrigger id="businessCategory" className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map(category => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="yearsInBusiness">Years in Business *</Label>
                    <Select 
                      value={formData.yearsInBusiness} 
                      onValueChange={(value) => setFormData({...formData, yearsInBusiness: value})}
                    >
                      <SelectTrigger id="yearsInBusiness" className="mt-1">
                        <SelectValue placeholder="Select years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New Business</SelectItem>
                        <SelectItem value="1-2">1-2 Years</SelectItem>
                        <SelectItem value="3-5">3-5 Years</SelectItem>
                        <SelectItem value="5-10">5-10 Years</SelectItem>
                        <SelectItem value="10+">10+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="monthlyRevenue">Expected Monthly Revenue *</Label>
                    <Select 
                      value={formData.monthlyRevenue} 
                      onValueChange={(value) => setFormData({...formData, monthlyRevenue: value})}
                    >
                      <SelectTrigger id="monthlyRevenue" className="mt-1">
                        <SelectValue placeholder="Select revenue range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-50k">BDT 0 - 50,000</SelectItem>
                        <SelectItem value="50k-2l">BDT 50,000 - 2,00,000</SelectItem>
                        <SelectItem value="2l-5l">BDT 2,00,000 - 5,00,000</SelectItem>
                        <SelectItem value="5l-10l">BDT 5,00,000 - 10,00,000</SelectItem>
                        <SelectItem value="10l+">BDT 10,00,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea 
                    id="businessDescription"
                    placeholder="Describe your business, products, and services..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Address Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="division">Division *</Label>
                    <Select 
                      value={formData.division} 
                      onValueChange={(value) => setFormData({...formData, division: value})}
                    >
                      <SelectTrigger id="division" className="mt-1">
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map(div => (
                          <SelectItem key={div} value={div.toLowerCase()}>
                            {div}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Input 
                      id="district"
                      placeholder="Enter district"
                      value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="upazila">Upazila/Thana *</Label>
                    <Input 
                      id="upazila"
                      placeholder="Enter upazila/thana"
                      value={formData.upazila}
                      onChange={(e) => setFormData({...formData, upazila: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input 
                      id="postalCode"
                      placeholder="Enter postal code"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Textarea 
                    id="streetAddress"
                    placeholder="Enter complete street address..."
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="landmark">Nearest Landmark</Label>
                  <Input 
                    id="landmark"
                    placeholder="e.g., Near City Mall, Opposite Central Mosque"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    All documents are required for KYC verification. Files should be clear and readable.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* NID Upload */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nidNumber">National ID Number *</Label>
                      <Input 
                        id="nidNumber"
                        placeholder="Enter NID number"
                        value={formData.nidNumber}
                        onChange={(e) => setFormData({...formData, nidNumber: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>NID Front Side *</Label>
                      <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        <Input type="file" className="hidden" accept="image/*" />
                      </div>
                    </div>
                    <div>
                      <Label>NID Back Side *</Label>
                      <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        <Input type="file" className="hidden" accept="image/*" />
                      </div>
                    </div>
                  </div>

                  {/* Trade License */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tradeLicense">Trade License Number *</Label>
                      <Input 
                        id="tradeLicense"
                        placeholder="Enter trade license number"
                        value={formData.tradeLicense}
                        onChange={(e) => setFormData({...formData, tradeLicense: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Trade License Document *</Label>
                      <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                        <Input type="file" className="hidden" accept="image/*,.pdf" />
                      </div>
                    </div>
                  </div>

                  {/* TIN Certificate */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tinNumber">TIN Number *</Label>
                      <Input 
                        id="tinNumber"
                        placeholder="Enter TIN number"
                        value={formData.tinNumber}
                        onChange={(e) => setFormData({...formData, tinNumber: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>TIN Certificate *</Label>
                      <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                        <Input type="file" className="hidden" accept="image/*,.pdf" />
                      </div>
                    </div>
                  </div>

                  {/* Bank Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Select 
                        value={formData.bankName} 
                        onValueChange={(value) => setFormData({...formData, bankName: value})}
                      >
                        <SelectTrigger id="bankName" className="mt-1">
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dbbl">Dutch Bangla Bank</SelectItem>
                          <SelectItem value="brac">BRAC Bank</SelectItem>
                          <SelectItem value="ebl">Eastern Bank</SelectItem>
                          <SelectItem value="scb">Standard Chartered</SelectItem>
                          <SelectItem value="citybank">City Bank</SelectItem>
                          <SelectItem value="ibbl">Islami Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input 
                        id="accountNumber"
                        placeholder="Enter account number"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Store Setup */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <Label>Store Logo/Photo</Label>
                  <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Upload your store logo or storefront photo
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB (Recommended: 500x500px)</p>
                    <Button variant="outline" className="mt-4">
                      Select Image
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Shipping Methods *</Label>
                    <div className="space-y-2 mt-2">
                      {['Own Delivery', 'Pathao', 'Paperfly', 'Sundarban Courier', 'RedX'].map(method => (
                        <div key={method} className="flex items-center space-x-2">
                          <Checkbox id={method} />
                          <Label htmlFor={method} className="font-normal cursor-pointer">
                            {method}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Accepted Payment Methods *</Label>
                    <div className="space-y-2 mt-2">
                      {['Cash on Delivery', 'bKash', 'Nagad', 'Rocket', 'Credit/Debit Card'].map(method => (
                        <div key={method} className="flex items-center space-x-2">
                          <Checkbox id={method} />
                          <Label htmlFor={method} className="font-normal cursor-pointer">
                            {method}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="returnPolicy">Return Policy *</Label>
                    <RadioGroup defaultValue="7days" className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no-return" id="no-return" />
                        <Label htmlFor="no-return">No Returns</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3days" id="3days" />
                        <Label htmlFor="3days">3 Days Return</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="7days" id="7days" />
                        <Label htmlFor="7days">7 Days Return</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="15days" id="15days" />
                        <Label htmlFor="15days">15 Days Return</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Agreement */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    Please read and accept all terms and conditions before submitting your application.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Platform Terms & Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 overflow-y-auto text-sm text-gray-600 space-y-2">
                        <p>1. Vendor agrees to comply with all platform policies and guidelines.</p>
                        <p>2. All products must be authentic and as described in listings.</p>
                        <p>3. Vendor is responsible for timely order fulfillment and customer service.</p>
                        <p>4. Platform reserves the right to suspend or terminate accounts for violations.</p>
                        <p>5. Vendor agrees to maintain accurate inventory and pricing information.</p>
                        <p>6. All disputes will be resolved according to Bangladesh laws.</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <Checkbox 
                          id="terms"
                          checked={formData.termsAccepted}
                          onCheckedChange={(checked) => setFormData({...formData, termsAccepted: checked as boolean})}
                        />
                        <Label htmlFor="terms" className="text-sm">
                          I agree to the platform terms and conditions
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Commission Structure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Electronics & Gadgets:</span>
                          <span className="font-medium">8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fashion & Clothing:</span>
                          <span className="font-medium">12%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Home & Living:</span>
                          <span className="font-medium">10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Food & Grocery:</span>
                          <span className="font-medium">15%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <Checkbox 
                          id="commission"
                          checked={formData.commissionAgreed}
                          onCheckedChange={(checked) => setFormData({...formData, commissionAgreed: checked as boolean})}
                        />
                        <Label htmlFor="commission" className="text-sm">
                          I agree to the commission structure
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Data Protection & Privacy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Your personal and business information will be protected according to our privacy policy 
                        and Bangladesh data protection laws. We will not share your information with third parties 
                        without your consent.
                      </p>
                      <div className="flex items-center space-x-2 mt-4">
                        <Checkbox 
                          id="dataProtection"
                          checked={formData.dataProtection}
                          onCheckedChange={(checked) => setFormData({...formData, dataProtection: checked as boolean})}
                        />
                        <Label htmlFor="dataProtection" className="text-sm">
                          I agree to the data protection policy
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 6 ? (
                <Button onClick={handleNext}>
                  Next Step
                </Button>
              ) : (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!formData.termsAccepted || !formData.commissionAgreed || !formData.dataProtection}
                >
                  Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default VendorRegistration;