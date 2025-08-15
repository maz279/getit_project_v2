
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { 
  FileText, 
  Eye, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Upload,
  MessageSquare
} from 'lucide-react';

export const DocumentVerificationTab: React.FC = () => {
  const [verificationNotes, setVerificationNotes] = useState<{ [key: string]: string }>({});

  const documents = [
    {
      id: 'trade-license',
      name: 'Trade License',
      fileName: 'Trade_License_TechnoMart.pdf',
      uploadDate: '2024-01-15',
      size: '2.5 MB',
      status: 'verified',
      verifiedBy: 'Sarah Ahmed',
      verifiedDate: '2024-01-18',
      notes: 'Valid trade license, all information matches application details.'
    },
    {
      id: 'tax-certificate',
      name: 'Tax Certificate',
      fileName: 'Tax_Certificate_2023.pdf',
      uploadDate: '2024-01-15',
      size: '1.8 MB',
      status: 'pending',
      notes: ''
    },
    {
      id: 'bank-statement',
      name: 'Bank Statement',
      fileName: 'Bank_Statement_Dec2023.pdf',
      uploadDate: '2024-01-16',
      size: '3.2 MB',
      status: 'verified',
      verifiedBy: 'Michael Chen',
      verifiedDate: '2024-01-19',
      notes: 'Recent bank statement showing healthy business transactions.'
    },
    {
      id: 'identity-proof',
      name: 'Identity Proof (NID)',
      fileName: 'NID_Ahmed_Rahman.pdf',
      uploadDate: '2024-01-15',
      size: '1.1 MB',
      status: 'verified',
      verifiedBy: 'Sarah Ahmed',
      verifiedDate: '2024-01-17',
      notes: 'Valid NID, matches contact person information.'
    },
    {
      id: 'address-proof',
      name: 'Address Proof',
      fileName: 'Utility_Bill_Jan2024.pdf',
      uploadDate: '2024-01-20',
      size: '0.9 MB',
      status: 'requires_review',
      notes: ''
    },
    {
      id: 'business-registration',
      name: 'Business Registration',
      fileName: 'Business_Registration_Certificate.pdf',
      uploadDate: '2024-01-15',
      size: '2.1 MB',
      status: 'rejected',
      verifiedBy: 'David Wilson',
      verifiedDate: '2024-01-19',
      notes: 'Document quality is poor, text is not clearly readable. Please resubmit a clearer copy.'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'requires_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'requires_review': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Verification Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-600" />
            Document Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-green-800">Verified</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <div className="text-sm text-yellow-800">Pending</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">1</div>
              <div className="text-sm text-orange-800">Needs Review</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-sm text-red-800">Rejected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-gray-500">{doc.fileName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.status)}
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Upload Date:</span>
                      <p>{new Date(doc.uploadDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">File Size:</span>
                      <p>{doc.size}</p>
                    </div>
                    {doc.verifiedBy && (
                      <div>
                        <span className="font-medium">Verified By:</span>
                        <p>{doc.verifiedBy}</p>
                      </div>
                    )}
                    {doc.verifiedDate && (
                      <div>
                        <span className="font-medium">Verified Date:</span>
                        <p>{new Date(doc.verifiedDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {doc.notes && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium text-gray-600">Verification Notes:</Label>
                      <p className="text-sm text-gray-700 mt-1 p-2 bg-gray-50 rounded">{doc.notes}</p>
                    </div>
                  )}

                  {(doc.status === 'pending' || doc.status === 'requires_review') && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`notes-${doc.id}`}>Add Verification Notes</Label>
                        <Textarea
                          id={`notes-${doc.id}`}
                          placeholder="Enter verification notes..."
                          value={verificationNotes[doc.id] || ''}
                          onChange={(e) => setVerificationNotes({ ...verificationNotes, [doc.id]: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verify
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Request Clarification
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  {doc.status === 'rejected' && (
                    <Button size="sm" variant="outline">
                      <Upload className="h-3 w-3 mr-1" />
                      Request Resubmit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve All Verified
            </Button>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All Documents
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
