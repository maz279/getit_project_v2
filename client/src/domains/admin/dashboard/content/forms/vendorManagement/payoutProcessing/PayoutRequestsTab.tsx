
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Plus } from 'lucide-react';
import { PayoutRequestForm } from './forms/PayoutRequestForm';
import { PayoutRequestsTable } from './components/PayoutRequestsTable';
import { PayoutRequestsFilters } from './components/PayoutRequestsFilters';
import { PayoutProcessingService } from '@/shared/services/database/PayoutProcessingService';
import { useToast } from '@/shared/hooks/use-toast';

export const PayoutRequestsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const filters = {
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search_query: searchQuery })
      };
      
      const response = await PayoutProcessingService.getPayoutRequests(filters);
      setRequests(response.data.map(item => ({
        id: item.id,
        vendor: item.vendor_name || 'Unknown Vendor',
        vendorId: item.vendor_id,
        amount: item.request_amount,
        currency: item.currency,
        status: item.status,
        requestDate: new Date(item.request_date).toLocaleDateString(),
        paymentMethod: item.payment_method,
        period: `${item.payout_period_start} - ${item.payout_period_end}`,
        priorityLevel: item.priority_level
      })));
    } catch (error) {
      console.error('Failed to load payout requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payout requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter, searchQuery]);

  const handleView = (id: string) => {
    console.log('View request:', id);
    // Implement view functionality
  };

  const handleApprove = async (id: string) => {
    try {
      await PayoutProcessingService.updatePayoutRequest(id, { status: 'approved' });
      toast({
        title: 'Success',
        description: 'Payout request approved',
      });
      loadRequests();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve request',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await PayoutProcessingService.updatePayoutRequest(id, { status: 'rejected' });
      toast({
        title: 'Success',
        description: 'Payout request rejected',
      });
      loadRequests();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    console.log('Export requests');
    // Implement export functionality
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payout Requests</CardTitle>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Payout Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create Payout Request</DialogTitle>
                </DialogHeader>
                <PayoutRequestForm onClose={() => {
                  setShowForm(false);
                  loadRequests();
                }} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <PayoutRequestsFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onExport={handleExport}
            onRefresh={loadRequests}
          />

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading requests...</div>
            </div>
          ) : (
            <PayoutRequestsTable
              requests={requests}
              onView={handleView}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
