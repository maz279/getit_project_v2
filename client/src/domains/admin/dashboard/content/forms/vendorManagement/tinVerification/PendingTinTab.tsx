
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Clock, Eye, CheckCircle, XCircle, AlertTriangle, Receipt, Building } from 'lucide-react';
import { mockTinRecords } from './mockData';

export const PendingTinTab: React.FC = () => {
  const pendingRecords = mockTinRecords.filter(record => record.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Pending TIN Verifications</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Sort by Priority
          </Button>
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Bulk Approve
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {pendingRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Receipt className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{record.businessName}</CardTitle>
                    <p className="text-sm text-gray-600">Vendor: {record.vendorName}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">TIN Number</span>
                  </div>
                  <p className="text-sm text-gray-900 font-mono">{record.tinNumber}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Business Type</span>
                  </div>
                  <p className="text-sm text-gray-900 capitalize">{record.businessType}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Risk Level</span>
                  </div>
                  <Badge 
                    variant={record.riskLevel === 'low' ? 'secondary' : record.riskLevel === 'medium' ? 'default' : 'destructive'}
                  >
                    {record.riskLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Submitted: {new Date(record.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Documents: {record.documents.length}</span>
                    <span>•</span>
                    <span>Compliance Score: {record.complianceScore}%</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="outline" size="sm">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>

              {record.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Notes:</strong> {record.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingRecords.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Reviews</h3>
            <p className="text-gray-600">All TIN verification requests have been processed.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
