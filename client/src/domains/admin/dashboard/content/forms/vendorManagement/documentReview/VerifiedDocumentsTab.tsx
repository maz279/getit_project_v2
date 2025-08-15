
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { CheckCircle, Download, Eye, Calendar } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { mockDocumentSubmissions } from './mockData';

export const VerifiedDocumentsTab: React.FC = () => {
  const verifiedDocuments = mockDocumentSubmissions.filter(doc => doc.status === 'approved');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Verified Documents ({verifiedDocuments.length})
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
                  <TableHead>Verified By</TableHead>
                  <TableHead>Verified Date</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifiedDocuments.map((doc) => (
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
                      {doc.expiryDate ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-orange-500" />
                          <span className="text-sm">
                            {new Date(doc.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">No Expiry</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
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
