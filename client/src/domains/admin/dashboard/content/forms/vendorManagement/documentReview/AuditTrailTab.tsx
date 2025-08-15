
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { History, User, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export const AuditTrailTab: React.FC = () => {
  const auditEntries = [
    {
      id: '1',
      action: 'Document Approved',
      documentId: 'DOC-001',
      documentName: 'business_license.pdf',
      vendorName: 'TechCorp Solutions',
      performedBy: 'John Reviewer',
      timestamp: '2024-01-20T14:30:00Z',
      details: 'Business license approved after verification',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      action: 'Document Rejected',
      documentId: 'DOC-002',
      documentName: 'bank_statement.pdf',
      vendorName: 'Electronics World',
      performedBy: 'Sarah Reviewer',
      timestamp: '2024-01-20T13:15:00Z',
      details: 'Bank statement rejected - document expired',
      ipAddress: '192.168.1.101'
    },
    {
      id: '3',
      action: 'Document Submitted',
      documentId: 'DOC-003',
      documentName: 'tax_certificate.pdf',
      vendorName: 'Fashion Hub BD',
      performedBy: 'vendor-002',
      timestamp: '2024-01-20T12:00:00Z',
      details: 'Tax certificate submitted for review',
      ipAddress: '203.112.45.67'
    }
  ];

  const getActionIcon = (action: string) => {
    if (action.includes('Approved')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (action.includes('Rejected')) return <XCircle className="h-4 w-4 text-red-600" />;
    if (action.includes('Submitted')) return <FileText className="h-4 w-4 text-blue-600" />;
    return <Clock className="h-4 w-4 text-gray-600" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('Approved')) return 'bg-green-100 text-green-800';
    if (action.includes('Rejected')) return 'bg-red-100 text-red-800';
    if (action.includes('Submitted')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Document Review Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(entry.action)}
                        <Badge className={getActionColor(entry.action)}>
                          {entry.action}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.documentName}</div>
                        <div className="text-xs text-gray-500">ID: {entry.documentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.vendorName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{entry.performedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs text-sm text-gray-600">
                        {entry.details}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {entry.ipAddress}
                      </code>
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
