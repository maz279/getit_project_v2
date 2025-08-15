/**
 * KYC Verification Dashboard - Amazon.com/Shopee.sg-Level KYC Interface
 * 
 * Complete vendor KYC verification with:
 * - Bangladesh government integration
 * - Document upload and verification
 * - Real-time progress tracking
 * - Multi-step workflow management
 * - Compliance monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Upload, 
  FileText, 
  User, 
  Building, 
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  Star
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Types
interface KYCData {
  id: string;
  vendorId: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  progressPercentage: number;
  personalInfo?: any;
  businessInfo?: any;
  bankDetails?: any;
  documents: Document[];
  workflow: WorkflowStep[];
  compliance: ComplianceInfo;
  nextActions: string[];
}

interface Document {
  id: string;
  type: string;
  fileName: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verificationNotes?: string;
  expiryDate?: string;
}

interface WorkflowStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  actionRequired?: string;
}

interface ComplianceInfo {
  status: string;
  score: number;
  certificationLevel: string;
  nextRenewalDate?: string;
}

// Validation schemas
const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  fatherName: z.string().min(1, 'Father name is required'),
  motherName: z.string().min(1, 'Mother name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  nidNumber: z.string().length(10, 'NID must be 10 digits').regex(/^\d{10}$/, 'NID must contain only numbers'),
  phoneNumber: z.string().regex(/^\+8801[3-9]\d{8}$/, 'Invalid Bangladesh phone number'),
  emergencyContact: z.string().regex(/^\+8801[3-9]\d{8}$/, 'Invalid Bangladesh phone number'),
  address: z.object({
    division: z.string().min(1, 'Division is required'),
    district: z.string().min(1, 'District is required'),
    upazila: z.string().min(1, 'Upazila is required'),
    postCode: z.string().length(4, 'Post code must be 4 digits').regex(/^\d{4}$/, 'Post code must contain only numbers'),
    detailedAddress: z.string().min(10, 'Detailed address is required (minimum 10 characters)'),
  }),
});

const businessInfoSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  businessCategory: z.string().min(1, 'Business category is required'),
  tradeLicenseNumber: z.string().min(5, 'Trade license number is required'),
  tinCertificateNumber: z.string().min(10, 'TIN certificate number is required'),
  vatRegistrationNumber: z.string().optional(),
  businessAddress: z.object({
    division: z.string().min(1, 'Division is required'),
    district: z.string().min(1, 'District is required'),
    upazila: z.string().min(1, 'Upazila is required'),
    postCode: z.string().length(4, 'Post code must be 4 digits'),
    detailedAddress: z.string().min(10, 'Detailed address is required'),
  }),
  establishmentYear: z.number().min(1971).max(new Date().getFullYear()),
  employeeCount: z.number().min(1).max(10000),
  businessDescription: z.string().min(20, 'Business description is required (minimum 20 characters)'),
});

const bankDetailsSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  branchName: z.string().min(1, 'Branch name is required'),
  accountNumber: z.string().min(10, 'Account number is required'),
  accountHolderName: z.string().min(1, 'Account holder name is required'),
  accountType: z.string().min(1, 'Account type is required'),
  routingNumber: z.string().length(9, 'Routing number must be 9 digits').regex(/^\d{9}$/, 'Routing number must contain only numbers'),
});

export const KYCVerificationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const [businessCategories, setBusinessCategories] = useState<any[]>([]);

  // Bangladesh divisions and districts
  const bangladeshDivisions = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'
  ];

  const businessTypes = [
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'limited_company', label: 'Limited Company' },
    { value: 'public_limited', label: 'Public Limited Company' },
  ];

  const accountTypes = [
    { value: 'savings', label: 'Savings Account' },
    { value: 'current', label: 'Current Account' },
    { value: 'business', label: 'Business Account' },
  ];

  const documentTypes = [
    { type: 'nid', label: 'National ID (NID)', icon: User, required: true },
    { type: 'trade_license', label: 'Trade License', icon: Building, required: true },
    { type: 'tin_certificate', label: 'TIN Certificate', icon: FileText, required: true },
    { type: 'bank_statement', label: 'Bank Statement (Last 3 months)', icon: CreditCard, required: true },
    { type: 'address_proof', label: 'Address Proof', icon: MapPin, required: true },
    { type: 'business_photo', label: 'Business Photograph', icon: Building, required: false },
  ];

  // Form setup
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: '',
      fatherName: '',
      motherName: '',
      dateOfBirth: '',
      nidNumber: '',
      phoneNumber: '+880',
      emergencyContact: '+880',
      address: {
        division: '',
        district: '',
        upazila: '',
        postCode: '',
        detailedAddress: '',
      },
    },
  });

  const businessForm = useForm({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: '',
      businessType: '',
      businessCategory: '',
      tradeLicenseNumber: '',
      tinCertificateNumber: '',
      vatRegistrationNumber: '',
      businessAddress: {
        division: '',
        district: '',
        upazila: '',
        postCode: '',
        detailedAddress: '',
      },
      establishmentYear: new Date().getFullYear(),
      employeeCount: 1,
      businessDescription: '',
    },
  });

  const bankForm = useForm({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      bankName: '',
      branchName: '',
      accountNumber: '',
      accountHolderName: '',
      accountType: '',
      routingNumber: '',
    },
  });

  useEffect(() => {
    loadKYCData();
    loadBusinessCategories();
  }, []);

  const loadKYCData = async () => {
    try {
      setLoading(true);
      const vendorId = localStorage.getItem('vendorId'); // Get from auth context in real app
      const response = await fetch(`/api/v1/vendors/${vendorId}/kyc/status`);
      const result = await response.json();
      
      if (result.success) {
        setKycData(result.data);
        // Populate forms if data exists
        if (result.data.personalInfo) {
          personalForm.reset(result.data.personalInfo);
        }
        if (result.data.businessInfo) {
          businessForm.reset(result.data.businessInfo);
        }
        if (result.data.bankDetails) {
          bankForm.reset(result.data.bankDetails);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load KYC data');
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessCategories = async () => {
    try {
      const response = await fetch('/api/v1/vendors/business-categories');
      const result = await response.json();
      if (result.success) {
        setBusinessCategories(result.data.categories);
      }
    } catch (error) {
      console.error('Failed to load business categories:', error);
    }
  };

  const initiateKYC = async (data: any) => {
    try {
      setLoading(true);
      const vendorId = localStorage.getItem('vendorId');
      
      const response = await fetch('/api/v1/vendors/kyc/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          vendorId,
          personalInfo: personalForm.getValues(),
          businessInfo: businessForm.getValues(),
          bankDetails: bankForm.getValues(),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setKycData(result.data);
        setActiveTab('documents');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to initiate KYC process');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (documentType: string, file: File) => {
    try {
      setUploadingDocument(documentType);
      const vendorId = localStorage.getItem('vendorId');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendorId', vendorId!);
      formData.append('documentType', documentType);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);
      formData.append('fileSize', file.size.toString());

      // In real implementation, upload to file storage first, then submit metadata
      const response = await fetch('/api/v1/vendors/kyc/upload-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        await loadKYCData(); // Refresh data
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to upload document');
    } finally {
      setUploadingDocument(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
      case 'submitted':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !kycData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">KYC Verification</h1>
            <p className="text-muted-foreground">
              Complete your business verification to start selling on GetIt
            </p>
          </div>
          {kycData && (
            <Badge className={getStatusColor(kycData.status)}>
              {kycData.status.toUpperCase()}
            </Badge>
          )}
        </div>

        {kycData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Verification Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{kycData.progressPercentage}% Complete</span>
                </div>
                <Progress value={kycData.progressPercentage} className="w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Compliance Score</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {kycData.compliance.score}/100
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Certification Level</span>
                    <span className="text-lg font-semibold capitalize">
                      {kycData.compliance.certificationLevel}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Documents</span>
                    <span className="text-lg font-semibold">
                      {kycData.documents.filter(d => d.status === 'verified').length}/
                      {kycData.documents.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="bank">Bank Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Workflow</CardTitle>
                <CardDescription>
                  Track your KYC verification progress through each step
                </CardDescription>
              </CardHeader>
              <CardContent>
                {kycData?.workflow ? (
                  <div className="space-y-4">
                    {kycData.workflow.map((step, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        {getStatusIcon(step.status)}
                        <div className="flex-1">
                          <p className="font-medium capitalize">
                            {step.step.replace(/_/g, ' ')}
                          </p>
                          {step.notes && (
                            <p className="text-sm text-muted-foreground">{step.notes}</p>
                          )}
                          {step.actionRequired && (
                            <p className="text-sm text-red-600">{step.actionRequired}</p>
                          )}
                        </div>
                        <Badge variant="outline" className={getStatusColor(step.status)}>
                          {step.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No verification workflow found. Please initiate KYC process.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Actions</CardTitle>
                <CardDescription>
                  What you need to do next to complete verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {kycData?.nextActions ? (
                  <div className="space-y-2">
                    {kycData.nextActions.map((action, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Start your KYC verification by providing your personal information.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('personal')}
                      className="w-full"
                    >
                      Start KYC Verification
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Provide your personal details as per your National ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      {...personalForm.register('fullName')}
                      placeholder="As per National ID"
                    />
                    {personalForm.formState.errors.fullName && (
                      <p className="text-sm text-red-600">
                        {personalForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name *</Label>
                    <Input
                      id="fatherName"
                      {...personalForm.register('fatherName')}
                      placeholder="As per National ID"
                    />
                    {personalForm.formState.errors.fatherName && (
                      <p className="text-sm text-red-600">
                        {personalForm.formState.errors.fatherName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother's Name *</Label>
                    <Input
                      id="motherName"
                      {...personalForm.register('motherName')}
                      placeholder="As per National ID"
                    />
                    {personalForm.formState.errors.motherName && (
                      <p className="text-sm text-red-600">
                        {personalForm.formState.errors.motherName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...personalForm.register('dateOfBirth')}
                    />
                    {personalForm.formState.errors.dateOfBirth && (
                      <p className="text-sm text-red-600">
                        {personalForm.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nidNumber">National ID Number *</Label>
                    <Input
                      id="nidNumber"
                      {...personalForm.register('nidNumber')}
                      placeholder="10-digit NID number"
                      maxLength={10}
                    />
                    {personalForm.formState.errors.nidNumber && (
                      <p className="text-sm text-red-600">
                        {personalForm.formState.errors.nidNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      {...personalForm.register('phoneNumber')}
                      placeholder="+8801XXXXXXXXX"
                    />
                    {personalForm.formState.errors.phoneNumber && (
                      <p className="text-sm text-red-600">
                        {personalForm.formState.errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="division">Division *</Label>
                      <Select onValueChange={(value) => personalForm.setValue('address.division', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          {bangladeshDivisions.map((division) => (
                            <SelectItem key={division} value={division}>
                              {division}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        {...personalForm.register('address.district')}
                        placeholder="Enter district"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="upazila">Upazila *</Label>
                      <Input
                        id="upazila"
                        {...personalForm.register('address.upazila')}
                        placeholder="Enter upazila"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postCode">Post Code *</Label>
                      <Input
                        id="postCode"
                        {...personalForm.register('address.postCode')}
                        placeholder="4-digit post code"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="detailedAddress">Detailed Address *</Label>
                    <Textarea
                      id="detailedAddress"
                      {...personalForm.register('address.detailedAddress')}
                      placeholder="House/Flat number, Road, Area, Landmark"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab('business')}
                  >
                    Next: Business Info
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Business Information</span>
              </CardTitle>
              <CardDescription>
                Provide your business details and registration information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      {...businessForm.register('businessName')}
                      placeholder="Your business name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select onValueChange={(value) => businessForm.setValue('businessType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessCategory">Business Category *</Label>
                    <Select onValueChange={(value) => businessForm.setValue('businessCategory', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map((category) => (
                          <SelectItem key={category.id} value={category.categoryCode}>
                            {category.categoryName}
                            {category.categoryNameBn && ` (${category.categoryNameBn})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tradeLicenseNumber">Trade License Number *</Label>
                    <Input
                      id="tradeLicenseNumber"
                      {...businessForm.register('tradeLicenseNumber')}
                      placeholder="Trade license number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tinCertificateNumber">TIN Certificate Number *</Label>
                    <Input
                      id="tinCertificateNumber"
                      {...businessForm.register('tinCertificateNumber')}
                      placeholder="TIN certificate number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="establishmentYear">Establishment Year *</Label>
                    <Input
                      id="establishmentYear"
                      type="number"
                      {...businessForm.register('establishmentYear', { valueAsNumber: true })}
                      min={1971}
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description *</Label>
                  <Textarea
                    id="businessDescription"
                    {...businessForm.register('businessDescription')}
                    placeholder="Describe your business activities"
                    rows={4}
                  />
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab('personal')}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab('bank')}
                  >
                    Next: Bank Details
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Bank Account Details</span>
              </CardTitle>
              <CardDescription>
                Provide your business bank account information for payout purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      {...bankForm.register('bankName')}
                      placeholder="e.g., Dutch-Bangla Bank"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branchName">Branch Name *</Label>
                    <Input
                      id="branchName"
                      {...bankForm.register('branchName')}
                      placeholder="Branch name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      {...bankForm.register('accountNumber')}
                      placeholder="Bank account number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      {...bankForm.register('accountHolderName')}
                      placeholder="Name as per bank account"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountType">Account Type *</Label>
                    <Select onValueChange={(value) => bankForm.setValue('accountType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number *</Label>
                    <Input
                      id="routingNumber"
                      {...bankForm.register('routingNumber')}
                      placeholder="9-digit routing number"
                      maxLength={9}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab('business')}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => {
                      const isValid = personalForm.formState.isValid && 
                                    businessForm.formState.isValid && 
                                    bankForm.formState.isValid;
                      if (isValid) {
                        initiateKYC({});
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Initiating KYC...' : 'Submit KYC Information'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Document Upload</span>
              </CardTitle>
              <CardDescription>
                Upload the required documents for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documentTypes.map((docType) => {
                  const uploaded = kycData?.documents.find(d => d.type === docType.type);
                  const Icon = docType.icon;
                  
                  return (
                    <div key={docType.type} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{docType.label}</p>
                            {docType.required && (
                              <p className="text-xs text-red-600">Required</p>
                            )}
                          </div>
                        </div>
                        {uploaded && getStatusIcon(uploaded.status)}
                      </div>

                      {uploaded ? (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Uploaded: {uploaded.fileName}
                          </p>
                          <Badge className={getStatusColor(uploaded.status)}>
                            {uploaded.status}
                          </Badge>
                          {uploaded.verificationNotes && (
                            <p className="text-xs text-muted-foreground">
                              {uploaded.verificationNotes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                uploadDocument(docType.type, file);
                              }
                            }}
                            disabled={uploadingDocument === docType.type}
                          />
                          {uploadingDocument === docType.type && (
                            <p className="text-sm text-blue-600">Uploading...</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {kycData && kycData.documents.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    All documents uploaded successfully! Our team will review your submission within 24-48 hours.
                    You will receive an SMS notification once the verification is complete.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};