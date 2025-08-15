/**
 * KYCVerification - Bangladesh Vendor KYC Verification System
 * Amazon.com/Shopee.sg Level KYC Management with Bangladesh Compliance
 */

import React, { useState } from 'react';
import { 
  FileText, Shield, CheckCircle, XCircle, Clock, Eye, Download, 
  Upload, AlertTriangle, User, Building2, CreditCard, MapPin, Phone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';

interface KYCDocument {
  id: string;
  type: 'nid' | 'trade_license' | 'tin' | 'bank_account' | 'business_address';
  documentNumber: string;
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  submittedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  expiryDate?: Date;
  notes?: string;
}

interface Vendor {
  id: string;
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  kycStatus: 'incomplete' | 'under_review' | 'verified' | 'rejected';
  submittedAt: Date;
  documents: KYCDocument[];
  personalInfo: {
    ownerName: string;
    ownerNID: string;
    ownerPhone: string;
    ownerEmail: string;
  };
  businessInfo: {
    tradeLicenseNumber: string;
    tinNumber: string;
    businessType: string;
    establishedYear: number;
  };
  address: {
    division: string;
    district: string;
    upazila: string;
    area: string;
    addressLine: string;
    postalCode: string;
  };
}

export function KYCVerification() {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [verificationNotes, setVerificationNotes] = useState('');

  // Mock data for demonstration
  const vendors: Vendor[] = [
    {
      id: '1',
      businessName: 'Dhaka Electronics Hub',
      contactEmail: 'info@dhakaelectronics.com',
      contactPhone: '+8801712345678',
      status: 'pending',
      kycStatus: 'under_review',
      submittedAt: new Date('2025-07-01'),
      personalInfo: {
        ownerName: 'Abdul Rahman',
        ownerNID: '1234567890123',
        ownerPhone: '+8801712345678',
        ownerEmail: 'rahman@example.com'
      },
      businessInfo: {
        tradeLicenseNumber: 'TRAD/DH/2024/001234',
        tinNumber: '123456789012',
        businessType: 'Electronics Retail',
        establishedYear: 2018
      },
      address: {
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Dhanmondi',
        area: 'Dhanmondi',
        addressLine: 'House 15, Road 7, Dhanmondi',
        postalCode: '1205'
      },
      documents: [
        {
          id: '1',
          type: 'nid',
          documentNumber: '1234567890123',
          documentUrl: '/documents/nid_1234567890123.pdf',
          status: 'verified',
          submittedAt: new Date('2025-07-01'),
          verifiedAt: new Date('2025-07-02'),
          verifiedBy: 'Admin User'
        },
        {
          id: '2',
          type: 'trade_license',
          documentNumber: 'TRAD/DH/2024/001234',
          documentUrl: '/documents/trade_license_001234.pdf',
          status: 'pending',
          submittedAt: new Date('2025-07-01'),
          expiryDate: new Date('2026-12-31')
        },
        {
          id: '3',
          type: 'tin',
          documentNumber: '123456789012',
          documentUrl: '/documents/tin_123456789012.pdf',
          status: 'pending',
          submittedAt: new Date('2025-07-01')
        },
        {
          id: '4',
          type: 'bank_account',
          documentNumber: 'ACC-001-234567890',
          documentUrl: '/documents/bank_statement.pdf',
          status: 'pending',
          submittedAt: new Date('2025-07-01')
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'nid':
        return <User className="h-4 w-4" />;
      case 'trade_license':
        return <Building2 className="h-4 w-4" />;
      case 'tin':
        return <FileText className="h-4 w-4" />;
      case 'bank_account':
        return <CreditCard className="h-4 w-4" />;
      case 'business_address':
        return <MapPin className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentTypeName = (type: string) => {
    const names = {
      nid: 'National ID (NID)',
      trade_license: 'Trade License',
      tin: 'Tax Identification Number (TIN)',
      bank_account: 'Bank Account Details',
      business_address: 'Business Address Proof'
    };
    return names[type as keyof typeof names] || type;
  };

  const handleVerifyDocument = (documentId: string, status: 'verified' | 'rejected') => {
    console.log(`Verifying document ${documentId} with status: ${status}`);
    // Implementation would call backend API
  };

  const handleApproveVendor = () => {
    console.log('Approving vendor:', selectedVendor?.id);
    // Implementation would call backend API
  };

  const handleRejectVendor = () => {
    console.log('Rejecting vendor:', selectedVendor?.id);
    // Implementation would call backend API
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">KYC Verification</h1>
          <p className="text-gray-600 dark:text-gray-400">Bangladesh vendor verification and compliance management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-yellow-100 text-yellow-800">12 Pending Review</Badge>
          <Badge className="bg-green-100 text-green-800">247 Verified</Badge>
        </div>
      </div>

      {/* Bangladesh Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>🇧🇩 Bangladesh Compliance Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-green-700">NBR Compliance</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-blue-700">RJSC Verification</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">95%</div>
              <div className="text-sm text-purple-700">Bank Verification</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">24h</div>
              <div className="text-sm text-orange-700">Avg. Review Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Vendor KYC Queue</CardTitle>
            <CardDescription>Vendors awaiting verification</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-4">
                <div className="space-y-3">
                  {vendors.filter(v => v.kycStatus === 'under_review').map((vendor) => (
                    <div
                      key={vendor.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedVendor?.id === vendor.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{vendor.businessName}</h4>
                          <p className="text-xs text-gray-500">{vendor.contactEmail}</p>
                        </div>
                        <Badge className={getStatusBadge(vendor.kycStatus)}>
                          {vendor.kycStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Submitted: {vendor.submittedAt.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Vendor Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedVendor ? `${selectedVendor.businessName} - KYC Details` : 'Select a vendor to review'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedVendor ? (
              <Tabs defaultValue="documents" className="w-full">
                <TabsList>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="business">Business Info</TabsTrigger>
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                </TabsList>

                <TabsContent value="documents" className="mt-4">
                  <div className="space-y-4">
                    {selectedVendor.documents.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getDocumentTypeIcon(doc.type)}
                            <div>
                              <h4 className="font-medium">{getDocumentTypeName(doc.type)}</h4>
                              <p className="text-sm text-gray-500">Document #: {doc.documentNumber}</p>
                              <p className="text-xs text-gray-400">
                                Submitted: {doc.submittedAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusBadge(doc.status)}>
                              {getStatusIcon(doc.status)}
                              <span className="ml-1">{doc.status}</span>
                            </Badge>
                            
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>

                        {doc.status === 'pending' && (
                          <div className="mt-4 flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleVerifyDocument(doc.id, 'verified')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleVerifyDocument(doc.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {doc.verifiedAt && (
                          <div className="mt-2 text-xs text-green-600">
                            Verified on {doc.verifiedAt.toLocaleDateString()} by {doc.verifiedBy}
                          </div>
                        )}

                        {doc.expiryDate && (
                          <div className="mt-1 text-xs text-orange-600">
                            Expires: {doc.expiryDate.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="business" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Business Name</Label>
                      <Input value={selectedVendor.businessName} readOnly />
                    </div>
                    <div>
                      <Label>Business Type</Label>
                      <Input value={selectedVendor.businessInfo.businessType} readOnly />
                    </div>
                    <div>
                      <Label>Trade License Number</Label>
                      <Input value={selectedVendor.businessInfo.tradeLicenseNumber} readOnly />
                    </div>
                    <div>
                      <Label>TIN Number</Label>
                      <Input value={selectedVendor.businessInfo.tinNumber} readOnly />
                    </div>
                    <div>
                      <Label>Established Year</Label>
                      <Input value={selectedVendor.businessInfo.establishedYear} readOnly />
                    </div>
                    <div>
                      <Label>Contact Email</Label>
                      <Input value={selectedVendor.contactEmail} readOnly />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="personal" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Owner Name</Label>
                      <Input value={selectedVendor.personalInfo.ownerName} readOnly />
                    </div>
                    <div>
                      <Label>NID Number</Label>
                      <Input value={selectedVendor.personalInfo.ownerNID} readOnly />
                    </div>
                    <div>
                      <Label>Owner Phone</Label>
                      <Input value={selectedVendor.personalInfo.ownerPhone} readOnly />
                    </div>
                    <div>
                      <Label>Owner Email</Label>
                      <Input value={selectedVendor.personalInfo.ownerEmail} readOnly />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="address" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Division</Label>
                      <Input value={selectedVendor.address.division} readOnly />
                    </div>
                    <div>
                      <Label>District</Label>
                      <Input value={selectedVendor.address.district} readOnly />
                    </div>
                    <div>
                      <Label>Upazila</Label>
                      <Input value={selectedVendor.address.upazila} readOnly />
                    </div>
                    <div>
                      <Label>Area</Label>
                      <Input value={selectedVendor.address.area} readOnly />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Address Line</Label>
                      <Input value={selectedVendor.address.addressLine} readOnly />
                    </div>
                    <div>
                      <Label>Postal Code</Label>
                      <Input value={selectedVendor.address.postalCode} readOnly />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Verification Actions */}
              <div className="mt-6 border-t pt-4">
                <div className="space-y-4">
                  <div>
                    <Label>Verification Notes</Label>
                    <Textarea
                      placeholder="Add notes about the verification process..."
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleApproveVendor}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Vendor
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleRejectVendor}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Vendor
                    </Button>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Vendor
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a vendor from the list to view their KYC details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default KYCVerification;