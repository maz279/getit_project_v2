
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Eye, Check, X, Clock } from 'lucide-react';

interface PayoutRequest {
  id: string;
  vendor: string;
  vendorId: string;
  amount: number;
  currency: string;
  status: string;
  requestDate: string;
  paymentMethod: string;
  period: string;
  priorityLevel?: string;
}

interface PayoutRequestsTableProps {
  requests: PayoutRequest[];
  onView: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const PayoutRequestsTable: React.FC<PayoutRequestsTableProps> = ({
  requests,
  onView,
  onApprove,
  onReject
}) => {
  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-emerald-100 text-emerald-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'approved': return <Check className="h-4 w-4 text-green-600" />;
      case 'rejected': return <X className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <Badge 
        variant="outline" 
        className={priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}
      >
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{request.vendor}</div>
                  <div className="text-sm text-gray-500">{request.vendorId}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  ৳{request.amount.toLocaleString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{request.period}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm capitalize">
                  {request.paymentMethod.replace('_', ' ')}
                </div>
              </TableCell>
              <TableCell>
                {request.priorityLevel && getPriorityBadge(request.priorityLevel)}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(request.status)}
                  {getStatusBadge(request.status)}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{request.requestDate}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onView(request.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {request.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600"
                        onClick={() => onApprove(request.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => onReject(request.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
