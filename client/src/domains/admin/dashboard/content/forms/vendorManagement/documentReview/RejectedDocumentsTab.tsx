
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { XCircle, Eye, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { mockDocumentSubmissions } from './mockData';

export const RejectedDocumentsTab: React.FC = () => {
  const rejectedDocuments = mockDocumentSubmissions.filter(doc => doc.status === 'rejected');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <XCircle className="h-5 w-5 mr-2 text-red-600" />
            Rejected Documents ({rejectedDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                  <TableHead>Rejected By</TableHead>
                  <TableHead>Rejected Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rejectedDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="font-medium">{doc.fileName}</div>
                      <div className="text-xs text-gray-500">
                        {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{doc.vendorName}</div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {doc.documentType.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-red-600 truncate" title={doc.rejectionReason}>
                          {doc.rejectionReason}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.reviewedBy ? (
                        <span className="text-sm">{doc.reviewedBy}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {doc.reviewedAt ? (
                        <div className="text-sm">
                          {new Date(doc.reviewedAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-3 w-3" />
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
