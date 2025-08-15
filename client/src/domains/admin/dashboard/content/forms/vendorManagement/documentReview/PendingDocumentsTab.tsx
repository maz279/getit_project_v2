
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Eye, Download, CheckCircle, XCircle, Clock, AlertTriangle, FileText, User } from 'lucide-react';
import { mockDocumentSubmissions } from './mockData';

export const PendingDocumentsTab: React.FC = () => {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  
  const pendingDocuments = mockDocumentSubmissions.filter(doc => 
    doc.status === 'pending' || doc.status === 'under_review'
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeIcon = (docType: string) => {
    switch (docType) {
      case 'business_license': return <FileText className="h-4 w-4" />;
      case 'tax_certificate': return <FileText className="h-4 w-4" />;
      case 'identity_proof': return <User className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Document Reviews ({pendingDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button size="sm" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Urgent Items ({pendingDocuments.filter(d => d.priority === 'urgent').length})
            </Button>
            <Button size="sm" variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Bulk Approve
            </Button>
            <Button size="sm" variant="outline">
              <XCircle className="h-4 w-4 mr-2" />
              Bulk Reject
            </Button>
            <Button size="sm" variant="outline">
              Auto-Assign
            </Button>
          </div>

          {/* Documents Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input type="checkbox" className="rounded" />
                  </TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingDocuments.slice(0, 10).map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-gray-50">
                    <TableCell>
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getDocumentTypeIcon(doc.documentType)}
                        <div>
                          <div className="font-medium text-sm">{doc.fileName}</div>
                          <div className="text-xs text-gray-500">
                            {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{doc.vendorName}</div>
                      <div className="text-xs text-gray-500">ID: {doc.vendorId.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {doc.documentType.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(doc.priority)}>
                        {doc.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(doc.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(doc.submittedAt).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
