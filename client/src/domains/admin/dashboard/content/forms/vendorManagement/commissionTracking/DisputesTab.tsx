
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { CommissionTrackingService, CommissionDispute } from '@/shared/services/database/CommissionTrackingService';
import { AlertCircle, Eye, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

export const DisputesTab: React.FC = () => {
  const [disputes, setDisputes] = useState<CommissionDispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      const data = await CommissionTrackingService.getDisputes();
      setDisputes(data);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-red-100 text-red-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-gray-100 text-gray-800',
      escalated: 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Commission Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <Card key={dispute.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {dispute.dispute_type.replace('_', ' ').toUpperCase()}
                        </h4>
                        {getStatusBadge(dispute.status)}
                        {getPriorityBadge(dispute.priority_level)}
                      </div>
                      
                      <p className="text-gray-700 mb-2">{dispute.dispute_reason}</p>
                      
                      {dispute.dispute_description && (
                        <p className="text-sm text-gray-600 mb-3">{dispute.dispute_description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Disputed Amount:</span>
                          <div className="font-medium text-red-600">৳{dispute.disputed_amount.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Claimed Amount:</span>
                          <div className="font-medium text-green-600">
                            ৳{(dispute.claimed_amount || 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Vendor:</span>
                          <div className="font-medium">{dispute.vendor_id}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">
                            {new Date(dispute.created_at || '').toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {dispute.status === 'resolved' && dispute.resolution_notes && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-1">Resolution:</h5>
                          <p className="text-sm text-green-700">{dispute.resolution_notes}</p>
                          <div className="text-sm text-green-600 mt-1">
                            Adjustment: ৳{dispute.adjustment_amount.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      {dispute.status === 'open' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {disputes.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No disputes found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
