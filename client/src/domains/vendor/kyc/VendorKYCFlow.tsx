import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Checkbox } from '@/shared/ui/checkbox';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { 
  FileText, 
  Upload, 
  Check, 
  AlertCircle, 
  Building, 
  User, 
  CreditCard,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Camera,
  FileImage
} from 'lucide-react';

interface KYCFormData {
  businessType: string;
  businessName: string;
  businessCategory: string;
  yearEstablished: string;
  registrationNumber: string;
  taxId: string;
  ownerName: string;
  ownerNid: string;
  ownerPhone: string;
  ownerEmail: string;
  businessAddress: string;
  businessCity: string;
  businessDistrict: string;
  businessPostalCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branchName: string;
  documents: {
    businessLicense?: File;
    taxCertificate?: File;
    ownerNid?: File;
    bankStatement?: File;
    tradeLicense?: File;
  };
}

interface KYCStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export const VendorKYCFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<KYCFormData>({
    businessType: '',
    businessName: '',
    businessCategory: '',
    yearEstablished: '',
    registrationNumber: '',
    taxId: '',
    ownerName: '',
    ownerNid: '',
    ownerPhone: '',
    ownerEmail: '',
    businessAddress: '',
    businessCity: '',
    businessDistrict: '',
    businessPostalCode: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    branchName: '',
    documents: {}
  });

  const [kycStatus, setKycStatus] = useState<'pending' | 'under_review' | 'approved' | 'rejected'>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: KYCStep[] = [
    { id: 1, title: 'Business Information', description: 'Basic business details', completed: false },
    { id: 2, title: 'Owner Information', description: 'Business owner details', completed: false },
    { id: 3, title: 'Address & Contact', description: 'Business location', completed: false },
    { id: 4, title: 'Banking Details', description: 'Payment information', completed: false },
    { id: 5, title: 'Document Upload', description: 'Required documents', completed: false },
    { id: 6, title: 'Review & Submit', description: 'Final verification', completed: false }
  ];

  const businessTypes = [
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'private_limited', label: 'Private Limited Company' },
    { value: 'public_limited', label: 'Public Limited Company' }
  ];

  const businessCategories = [
    { value: 'electronics', label: 'Electronics & Gadgets' },
    { value: 'fashion', label: 'Fashion & Apparel' },
    { value: 'home_garden', label: 'Home & Garden' },
    { value: 'health_beauty', label: 'Health & Beauty' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'books_media', label: 'Books & Media' },
    { value: 'food_beverage', label: 'Food & Beverage' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'other', label: 'Other' }
  ];

  const bangladeshDistricts = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
    'Comilla', 'Narayanganj', 'Gazipur', 'Bogra', 'Jessore', 'Pabna', 'Dinajpur', 'Kushtia'
  ];

  const bangladeshBanks = [
    'Dutch-Bangla Bank', 'BRAC Bank', 'City Bank', 'Eastern Bank', 'Prime Bank',
    'Standard Chartered Bank', 'HSBC', 'Islami Bank Bangladesh', 'Janata Bank', 'Sonali Bank'
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (documentType: string, file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        if (!formData.businessName) newErrors.businessName = 'Business name is required';
        if (!formData.businessCategory) newErrors.businessCategory = 'Business category is required';
        if (!formData.yearEstablished) newErrors.yearEstablished = 'Year established is required';
        break;
      case 2:
        if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
        if (!formData.ownerNid) newErrors.ownerNid = 'NID number is required';
        if (!formData.ownerPhone) newErrors.ownerPhone = 'Phone number is required';
        if (!formData.ownerEmail) newErrors.ownerEmail = 'Email is required';
        break;
      case 3:
        if (!formData.businessAddress) newErrors.businessAddress = 'Business address is required';
        if (!formData.businessCity) newErrors.businessCity = 'City is required';
        if (!formData.businessDistrict) newErrors.businessDistrict = 'District is required';
        break;
      case 4:
        if (!formData.bankName) newErrors.bankName = 'Bank name is required';
        if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
        if (!formData.accountHolderName) newErrors.accountHolderName = 'Account holder name is required';
        break;
      case 5:
        if (!formData.documents.businessLicense) newErrors.businessLicense = 'Business license is required';
        if (!formData.documents.ownerNid) newErrors.ownerNid = 'Owner NID copy is required';
        if (!formData.documents.bankStatement) newErrors.bankStatement = 'Bank statement is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitKYC = async () => {
    if (!validateStep(5)) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      setKycStatus('under_review');
      setCurrentStep(7); // Success page
    } catch (error) {
      console.error('KYC submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileUpload = (documentType: string, label: string, required: boolean = true) => {
    const file = formData.documents[documentType as keyof typeof formData.documents];
    
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          {file ? (
            <div className="flex items-center space-x-2">
              <FileImage className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFileUpload(documentType, null as any)}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id={documentType}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(documentType, file);
                }}
              />
              <label htmlFor={documentType} className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
              </label>
            </div>
          )}
        </div>
        {errors[documentType] && (
          <p className="text-sm text-red-600">{errors[documentType]}</p>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Business Type <span className="text-red-500">*</span></Label>
              <Select onValueChange={(value) => updateFormData('businessType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessType && <p className="text-sm text-red-600">{errors.businessType}</p>}
            </div>

            <div>
              <Label>Business Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.businessName}
                onChange={(e) => updateFormData('businessName', e.target.value)}
                placeholder="Enter your business name"
              />
              {errors.businessName && <p className="text-sm text-red-600">{errors.businessName}</p>}
            </div>

            <div>
              <Label>Business Category <span className="text-red-500">*</span></Label>
              <Select onValueChange={(value) => updateFormData('businessCategory', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business category" />
                </SelectTrigger>
                <SelectContent>
                  {businessCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessCategory && <p className="text-sm text-red-600">{errors.businessCategory}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Year Established <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={formData.yearEstablished}
                  onChange={(e) => updateFormData('yearEstablished', e.target.value)}
                  placeholder="2020"
                  min="1900"
                  max="2025"
                />
                {errors.yearEstablished && <p className="text-sm text-red-600">{errors.yearEstablished}</p>}
              </div>
              <div>
                <Label>Trade License Number</Label>
                <Input
                  value={formData.registrationNumber}
                  onChange={(e) => updateFormData('registrationNumber', e.target.value)}
                  placeholder="Enter registration number"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Business Owner Full Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.ownerName}
                onChange={(e) => updateFormData('ownerName', e.target.value)}
                placeholder="Enter full name as per NID"
              />
              {errors.ownerName && <p className="text-sm text-red-600">{errors.ownerName}</p>}
            </div>

            <div>
              <Label>National ID Number <span className="text-red-500">*</span></Label>
              <Input
                value={formData.ownerNid}
                onChange={(e) => updateFormData('ownerNid', e.target.value)}
                placeholder="Enter 10 or 17 digit NID number"
              />
              {errors.ownerNid && <p className="text-sm text-red-600">{errors.ownerNid}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.ownerPhone}
                  onChange={(e) => updateFormData('ownerPhone', e.target.value)}
                  placeholder="+880 1X XXX XXXX"
                />
                {errors.ownerPhone && <p className="text-sm text-red-600">{errors.ownerPhone}</p>}
              </div>
              <div>
                <Label>Email Address <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => updateFormData('ownerEmail', e.target.value)}
                  placeholder="owner@business.com"
                />
                {errors.ownerEmail && <p className="text-sm text-red-600">{errors.ownerEmail}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Business Address <span className="text-red-500">*</span></Label>
              <Textarea
                value={formData.businessAddress}
                onChange={(e) => updateFormData('businessAddress', e.target.value)}
                placeholder="Enter complete business address"
              />
              {errors.businessAddress && <p className="text-sm text-red-600">{errors.businessAddress}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.businessCity}
                  onChange={(e) => updateFormData('businessCity', e.target.value)}
                  placeholder="Enter city name"
                />
                {errors.businessCity && <p className="text-sm text-red-600">{errors.businessCity}</p>}
              </div>
              <div>
                <Label>District <span className="text-red-500">*</span></Label>
                <Select onValueChange={(value) => updateFormData('businessDistrict', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {bangladeshDistricts.map(district => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.businessDistrict && <p className="text-sm text-red-600">{errors.businessDistrict}</p>}
              </div>
            </div>

            <div>
              <Label>Postal Code</Label>
              <Input
                value={formData.businessPostalCode}
                onChange={(e) => updateFormData('businessPostalCode', e.target.value)}
                placeholder="Enter postal code"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Bank Name <span className="text-red-500">*</span></Label>
              <Select onValueChange={(value) => updateFormData('bankName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {bangladeshBanks.map(bank => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankName && <p className="text-sm text-red-600">{errors.bankName}</p>}
            </div>

            <div>
              <Label>Account Number <span className="text-red-500">*</span></Label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => updateFormData('accountNumber', e.target.value)}
                placeholder="Enter account number"
              />
              {errors.accountNumber && <p className="text-sm text-red-600">{errors.accountNumber}</p>}
            </div>

            <div>
              <Label>Account Holder Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.accountHolderName}
                onChange={(e) => updateFormData('accountHolderName', e.target.value)}
                placeholder="Name as per bank records"
              />
              {errors.accountHolderName && <p className="text-sm text-red-600">{errors.accountHolderName}</p>}
            </div>

            <div>
              <Label>Branch Name</Label>
              <Input
                value={formData.branchName}
                onChange={(e) => updateFormData('branchName', e.target.value)}
                placeholder="Enter branch name"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Please upload clear, readable documents. All documents should be in PDF or image format (JPG, PNG).
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderFileUpload('businessLicense', 'Business/Trade License', true)}
              {renderFileUpload('ownerNid', 'Owner NID Copy', true)}
              {renderFileUpload('bankStatement', 'Bank Statement (Last 3 months)', true)}
              {renderFileUpload('taxCertificate', 'Tax Certificate', false)}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Please review all information before submitting. You can go back to edit any section.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Business Name:</strong> {formData.businessName}</div>
                    <div><strong>Type:</strong> {formData.businessType}</div>
                    <div><strong>Category:</strong> {formData.businessCategory}</div>
                    <div><strong>Established:</strong> {formData.yearEstablished}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Owner:</strong> {formData.ownerName}</div>
                    <div><strong>Phone:</strong> {formData.ownerPhone}</div>
                    <div><strong>Email:</strong> {formData.ownerEmail}</div>
                    <div><strong>District:</strong> {formData.businessDistrict}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Banking Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Bank:</strong> {formData.bankName}</div>
                    <div><strong>Account Holder:</strong> {formData.accountHolderName}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm">
                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and confirm that all information provided is accurate.
              </Label>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">KYC Application Submitted!</h2>
              <p className="text-gray-600 mt-2">Your application has been submitted for review</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Application ID:</span>
                    <span className="font-mono">KYC-{Date.now()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Processing:</span>
                    <span>2-3 business days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                We'll notify you via email once your KYC verification is complete. You can check the status in your vendor dashboard.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Vendor KYC Verification</h1>
        <p className="text-gray-600 mt-1">Complete your verification to start selling on GetIt</p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-sm">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center space-y-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span className={`text-xs text-center ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {currentStep === 1 && <Building className="h-5 w-5" />}
            {currentStep === 2 && <User className="h-5 w-5" />}
            {currentStep === 3 && <MapPin className="h-5 w-5" />}
            {currentStep === 4 && <CreditCard className="h-5 w-5" />}
            {currentStep === 5 && <FileText className="h-5 w-5" />}
            {currentStep === 6 && <CheckCircle className="h-5 w-5" />}
            <span>{steps[currentStep - 1]?.title}</span>
          </CardTitle>
          <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep < 7 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep === 6 ? (
            <Button
              onClick={submitKYC}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorKYCFlow;