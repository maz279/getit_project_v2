/**
 * KYC Verification - Bangladesh-Specific Vendor Verification System
 * Amazon.com/Shopee.sg Level KYC Management with NID, Trade License, TIN, Bank Account Verification
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { 
  Shield, FileText, Building2, CreditCard, Eye, Check, X, Clock, 
  AlertTriangle, Download, Upload, Search, Filter, RefreshCw,
  User, MapPin, Phone, Mail, Calendar, Flag, Star, Award,
  CheckCircle, XCircle, Loader2, ExternalLink, Copy
} from 'lucide-react';

interface KYCApplication {
  id: string;
  vendorName: string;
  vendorNameBn: string;
  businessName: string;
  ownerName: string;
  nidNumber: string;
  tradeLicense: string;
  tinNumber: string;
  bankAccount: string;
  submissionDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_documents';
  verificationStage: 'documents' | 'nid' | 'trade_license' | 'tin' | 'bank' | 'completed';
  priority: 'high' | 'medium' | 'low';
  documentsUploaded: number;
  totalDocuments: number;
}

interface VerificationDocument {
  id: string;
  type: 'nid_front' | 'nid_back' | 'trade_license' | 'tin_certificate' | 'bank_statement' | 'owner_photo';
  name: string;
  status: 'uploaded' | 'verified' | 'rejected';
  uploadDate: string;
  fileSize: string;
  remarks?: string;
}

export default function KYCVerification() {
  const [selectedApplication, setSelectedApplication] = useState<KYCApplication | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'review'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample KYC applications
  const kycApplications: KYCApplication[] = [
    {
      id: 'KYC-2025-001',
      vendorName: 'Tech Store BD',
      vendorNameBn: 'টেক স্টোর বিডি',
      businessName: 'Bangladesh Technology Solutions Ltd.',
      ownerName: 'Mohammad Rahman',
      nidNumber: '1234567890123',
      tradeLicense: 'DSCC-001234',
      tinNumber: '123456789012',
      bankAccount: 'DBBL-1234567890',
      submissionDate: '2025-01-03',
      status: 'pending',
      verificationStage: 'documents',
      priority: 'high',
      documentsUploaded: 4,
      totalDocuments: 6
    },
    {
      id: 'KYC-2025-002',
      vendorName: 'Fashion House Dhaka',
      vendorNameBn: 'ফ্যাশন হাউস ঢাকা',
      businessName: 'Dhaka Fashion Enterprise',
      ownerName: 'Fatima Begum',
      nidNumber: '9876543210987',
      tradeLicense: 'DSCC-005678',
      tinNumber: '987654321098',
      bankAccount: 'BRAC-9876543210',
      submissionDate: '2025-01-02',
      status: 'under_review',
      verificationStage: 'nid',
      priority: 'medium',
      documentsUploaded: 6,
      totalDocuments: 6
    },
    {
      id: 'KYC-2025-003',
      vendorName: 'Agro Products BD',
      vendorNameBn: 'এগ্রো প্রোডাক্টস বিডি',
      businessName: 'Bangladesh Agricultural Products Ltd.',
      ownerName: 'Abdul Karim',
      nidNumber: '5555444433332',
      tradeLicense: 'CSCC-009876',
      tinNumber: '555544443333',
      bankAccount: 'EBL-5555444433',
      submissionDate: '2025-01-01',
      status: 'requires_documents',
      verificationStage: 'trade_license',
      priority: 'low',
      documentsUploaded: 3,
      totalDocuments: 6
    }
  ];

  // Sample documents for selected application
  const verificationDocuments: VerificationDocument[] = [
    {
      id: 'DOC-001',
      type: 'nid_front',
      name: 'National_ID_Front.jpg',
      status: 'verified',
      uploadDate: '2025-01-03',
      fileSize: '2.4 MB'
    },
    {
      id: 'DOC-002',
      type: 'nid_back',
      name: 'National_ID_Back.jpg',
      status: 'verified',
      uploadDate: '2025-01-03',
      fileSize: '2.1 MB'
    },
    {
      id: 'DOC-003',
      type: 'trade_license',
      name: 'Trade_License_Certificate.pdf',
      status: 'uploaded',
      uploadDate: '2025-01-03',
      fileSize: '1.8 MB'
    },
    {
      id: 'DOC-004',
      type: 'tin_certificate',
      name: 'TIN_Certificate.pdf',
      status: 'rejected',
      uploadDate: '2025-01-03',
      fileSize: '1.2 MB',
      remarks: 'Document quality is poor, please resubmit with clear image'
    },
    {
      id: 'DOC-005',
      type: 'bank_statement',
      name: 'Bank_Statement_Dec2024.pdf',
      status: 'uploaded',
      uploadDate: '2025-01-03',
      fileSize: '3.2 MB'
    },
    {
      id: 'DOC-006',
      type: 'owner_photo',
      name: 'Owner_Photo.jpg',
      status: 'uploaded',
      uploadDate: '2025-01-03',
      fileSize: '1.5 MB'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'requires_documents': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'uploaded': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredApplications = kycApplications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = app.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout
      currentPage="KYC Verification"
      breadcrumbItems={[
        { label: 'Vendor Management', href: '/admin/vendors' },
        { label: 'KYC Verification' }
      ]}
    >
      <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            KYC Verification
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Bangladesh vendor verification and compliance management
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {filteredApplications.length} Applications
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Applications</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by vendor name, business name, or KYC ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="requires_documents">Requires Documents</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">156</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">98</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Under Review</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">34</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">24</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="verification">Document Verification</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                KYC Applications
              </CardTitle>
              <CardDescription>
                Vendor verification applications with Bangladesh regulatory compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>KYC ID</TableHead>
                    <TableHead>Vendor Details</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.vendorName}</p>
                          <p className="text-sm text-gray-500">{application.vendorNameBn}</p>
                          <p className="text-xs text-gray-400">{application.ownerName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{application.documentsUploaded}/{application.totalDocuments}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(application.documentsUploaded / application.totalDocuments) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={application.priority === 'high' ? 'destructive' : application.priority === 'medium' ? 'default' : 'secondary'}>
                          {application.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{application.submissionDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>KYC Application Review - {application.id}</DialogTitle>
                                <DialogDescription>
                                  Complete vendor verification and document review
                                </DialogDescription>
                              </DialogHeader>
                              
                              {/* Vendor Information */}
                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Vendor Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <Label>Business Name</Label>
                                      <p className="font-medium">{application.businessName}</p>
                                    </div>
                                    <div>
                                      <Label>Owner Name</Label>
                                      <p className="font-medium">{application.ownerName}</p>
                                    </div>
                                    <div>
                                      <Label>NID Number</Label>
                                      <p className="font-medium flex items-center gap-2">
                                        {application.nidNumber}
                                        <Button size="sm" variant="ghost">
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Business Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <Label>Trade License</Label>
                                      <p className="font-medium">{application.tradeLicense}</p>
                                    </div>
                                    <div>
                                      <Label>TIN Number</Label>
                                      <p className="font-medium">{application.tinNumber}</p>
                                    </div>
                                    <div>
                                      <Label>Bank Account</Label>
                                      <p className="font-medium">{application.bankAccount}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Document Verification */}
                              <Card className="mt-4">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Document Verification
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {verificationDocuments.map((doc) => (
                                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                          {getStatusIcon(doc.status)}
                                          <div>
                                            <p className="font-medium">{doc.name}</p>
                                            <p className="text-sm text-gray-500">
                                              {doc.type.replace('_', ' ').toUpperCase()} • {doc.fileSize} • {doc.uploadDate}
                                            </p>
                                            {doc.remarks && (
                                              <p className="text-xs text-red-600 mt-1">{doc.remarks}</p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button size="sm" variant="outline">
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                          </Button>
                                          {doc.status === 'uploaded' && (
                                            <>
                                              <Button size="sm" variant="outline" className="text-green-600">
                                                <Check className="h-4 w-4 mr-1" />
                                                Approve
                                              </Button>
                                              <Button size="sm" variant="outline" className="text-red-600">
                                                <X className="h-4 w-4 mr-1" />
                                                Reject
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Verification Form */}
                              <Card className="mt-4">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    Verification Decision
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="verification-status">Verification Status</Label>
                                      <Select>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="approved">Approved</SelectItem>
                                          <SelectItem value="rejected">Rejected</SelectItem>
                                          <SelectItem value="requires_documents">Requires Additional Documents</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="verification-priority">Priority Level</Label>
                                      <Select>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="high">High</SelectItem>
                                          <SelectItem value="medium">Medium</SelectItem>
                                          <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="verification-notes">Verification Notes</Label>
                                    <Textarea 
                                      id="verification-notes"
                                      placeholder="Add notes about the verification decision..."
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-3">
                                    <Button variant="outline">Save Draft</Button>
                                    <Button className="bg-green-600 hover:bg-green-700">
                                      Submit Verification
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Document Verification Queue
              </CardTitle>
              <CardDescription>
                Bangladesh government database integration for document verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-l-4 border-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">NID Verification</p>
                          <p className="text-lg font-bold">12 Pending</p>
                        </div>
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Trade License</p>
                          <p className="text-lg font-bold">8 Pending</p>
                        </div>
                        <Building2 className="h-6 w-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">TIN Verification</p>
                          <p className="text-lg font-bold">5 Pending</p>
                        </div>
                        <FileText className="h-6 w-6 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Bangladesh Government Integration Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Bangladesh Election Commission (NID Database)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>RJSC (Trade License Database)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>NBR (TIN Database)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Bangladesh Bank (Account Verification)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Compliance Reports
              </CardTitle>
              <CardDescription>
                Bangladesh regulatory compliance and audit reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Monthly KYC Report</h4>
                      <p className="text-sm text-gray-600 mb-3">January 2025 compliance summary</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Ready for Download</Badge>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">NBR Tax Compliance</h4>
                      <p className="text-sm text-gray-600 mb-3">Vendor TIN verification status</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">In Progress</Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}