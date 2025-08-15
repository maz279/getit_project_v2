
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { AlertTriangle, Clock, CheckCircle, MessageSquare, Plus } from 'lucide-react';
import { RatingService } from '@/shared/services/database/RatingService';
import { AddDisputeForm } from './forms/AddDisputeForm';
import { toast } from 'sonner';

export const RatingDisputesTab: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const data = await RatingService.getDisputes();
      setDisputes(data || []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    try {
      await RatingService.updateDisputeStatus(disputeId, 'resolved', 'Resolved by admin', 'admin');
      toast.success('Dispute resolved successfully');
      fetchDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'under-review': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate stats
  const activeDisputes = disputes.filter(d => d.dispute_status !== 'resolved').length;
  const resolvedDisputes = disputes.filter(d => d.dispute_status === 'resolved').length;
  const resolutionRate = disputes.length > 0 ? Math.round((resolvedDisputes / disputes.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Dispute Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Disputes</p>
                <p className="text-2xl font-bold">{activeDisputes}</p>
                <p className="text-xs text-red-600">Needs attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                <p className="text-2xl font-bold">{disputes.length}</p>
                <p className="text-xs text-gray-600">All time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold">{resolutionRate}%</p>
                <p className="text-xs text-green-600">{resolvedDisputes} resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Disputes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              All Disputes
            </CardTitle>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Dispute
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Dispute</DialogTitle>
                </DialogHeader>
                <AddDisputeForm
                  onSuccess={() => {
                    setShowAddForm(false);
                    fetchDisputes();
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading disputes...</div>
          ) : (
            <div className="space-y-4">
              {disputes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No disputes found. Click 'Create Dispute' to add a new dispute.
                </div>
              ) : (
                disputes.map((dispute) => (
                  <div key={dispute.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">Dispute #{dispute.id.slice(0, 8)}</span>
                          <Badge className={getPriorityColor(dispute.priority_level)}>
                            {dispute.priority_level} priority
                          </Badge>
                          <Badge className={getStatusColor(dispute.dispute_status)}>
                            {dispute.dispute_status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Review ID:</strong> {dispute.review_id}</p>
                          <p><strong>Vendor ID:</strong> {dispute.vendor_id}</p>
                          {dispute.customer_id && <p><strong>Customer ID:</strong> {dispute.customer_id}</p>}
                          <p><strong>Reason:</strong> {dispute.dispute_reason}</p>
                          <p><strong>Submitted:</strong> {new Date(dispute.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {dispute.dispute_description && (
                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <h4 className="font-medium mb-2">Dispute Details</h4>
                        <p className="text-sm text-gray-700">{dispute.dispute_description}</p>
                      </div>
                    )}

                    {dispute.resolution_notes && (
                      <div className="bg-green-50 p-3 rounded mb-3">
                        <h4 className="font-medium mb-2 text-green-800">Resolution Notes</h4>
                        <p className="text-sm text-green-700">{dispute.resolution_notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          {dispute.dispute_status === 'resolved' && dispute.resolved_at
                            ? `Resolved on ${new Date(dispute.resolved_at).toLocaleDateString()}`
                            : `Open for ${Math.ceil((new Date().getTime() - new Date(dispute.created_at).getTime()) / (1000 * 60 * 60 * 24))} days`
                          }
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {dispute.dispute_status !== 'resolved' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600"
                            onClick={() => handleResolveDispute(dispute.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispute Resolution Process */}
      <Card>
        <CardHeader>
          <CardTitle>Dispute Resolution Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Report Received</h4>
              <p className="text-sm text-gray-600">Dispute submitted by vendor or customer</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Investigation</h4>
              <p className="text-sm text-gray-600">Review evidence and gather information</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Decision</h4>
              <p className="text-sm text-gray-600">Make ruling based on evidence</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Resolution</h4>
              <p className="text-sm text-gray-600">Implement decision and notify parties</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
