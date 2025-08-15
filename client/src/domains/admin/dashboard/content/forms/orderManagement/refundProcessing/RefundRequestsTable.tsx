
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { RefreshCw, Eye, Edit, MessageSquare, History, Mail, Phone, FileText } from 'lucide-react';

interface RefundRequest {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  requestDate: string;
  processedDate: string | null;
  method: string;
  gateway: string;
  product: string;
  customerNote: string;
  images: string[];
  priority: string;
  assignedTo: string;
  estimatedCompletion: string;
}

interface RefundRequestsTableProps {
  refunds: RefundRequest[];
}

export const RefundRequestsTable: React.FC<RefundRequestsTableProps> = ({ refunds }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <RefreshCw className="mr-3 h-5 w-5 text-blue-600" />
            Refund Requests
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-600">
            {refunds.length} refund requests
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Refund Details</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Product & Amount</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Reason & Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Timeline</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((refund, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-semibold text-blue-600">{refund.id}</div>
                      <div className="text-sm text-gray-500">{refund.orderId}</div>
                      <div className="text-xs text-gray-400">{refund.requestDate}</div>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge className={`${getPriorityColor(refund.priority)} text-xs`}>
                          {refund.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">by {refund.assignedTo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium">{refund.customer}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {refund.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {refund.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-800">{refund.product}</div>
                      <div className="font-semibold text-blue-600 text-lg">
                        {refund.currency} {refund.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">{refund.method} via {refund.gateway}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-2">
                      <Badge className={`${getStatusColor(refund.status)}`}>
                        {refund.status}
                      </Badge>
                      <div className="text-sm font-medium text-gray-700">{refund.reason}</div>
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        {refund.customerNote}
                      </div>
                      {refund.images.length > 0 && (
                        <div className="text-xs text-blue-600 flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {refund.images.length} attachment(s)
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-500">Requested:</span>
                        <div className="text-xs text-gray-400">{refund.requestDate}</div>
                      </div>
                      {refund.processedDate && (
                        <div className="text-sm">
                          <span className="text-gray-500">Processed:</span>
                          <div className="text-xs text-gray-400">{refund.processedDate}</div>
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="text-gray-500">Est. Complete:</span>
                        <div className="text-xs text-gray-400">{refund.estimatedCompletion}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Edit className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <History className="h-4 w-4 mr-1" />
                          History
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <p className="text-sm text-gray-600">Showing 1-10 of 2,340 refund requests</p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">← Previous</Button>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">...</Button>
            <Button variant="outline" size="sm">234</Button>
            <Button variant="outline" size="sm">Next →</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
