
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { AlertTriangle, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { RevenueSharingService } from '@/shared/services/database/revenue/RevenueSharingService';
import { RevenueDispute } from '@/types/revenue';

export const RevenueDisputesTab: React.FC = () => {
  const [disputes, setDisputes] = useState<RevenueDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const data = await RevenueSharingService.getRevenueDisputes();
      
      // Properly cast the database response to our interface
      const typedDisputes: RevenueDispute[] = data.map(dispute => ({
        ...dispute,
        dispute_type: dispute.dispute_type as 'calculation_error' | 'payment_delay' | 'rate_disagreement' | 'other',
        status: dispute.status as 'open' | 'under_review' | 'resolved' | 'rejected' | 'escalated',
        priority_level: dispute.priority_level as 'low' | 'medium' | 'high' | 'critical',
        evidence_documents: Array.isArray(dispute.evidence_documents) 
          ? dispute.evidence_documents 
          : typeof dispute.evidence_documents === 'string' 
            ? JSON.parse(dispute.evidence_documents) 
            : []
      }));
      
      setDisputes(typedDisputes);
    } catch (error) {
      console.error('Error loading revenue disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'under_review': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading revenue disputes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Revenue Disputes</h3>
          <p className="text-gray-600">Manage and resolve revenue-related disputes</p>
        </div>
        <Button>
          <AlertTriangle className="h-4 w-4 mr-2" />
          New Dispute
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search disputes by number, vendor, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <Card key={dispute.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    {getStatusIcon(dispute.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{dispute.dispute_number}</h4>
                      <Badge className={getStatusColor(dispute.status)}>
                        {dispute.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(dispute.priority_level)}>
                        {dispute.priority_level.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{dispute.dispute_reason}</p>
                    {dispute.dispute_description && (
                      <p className="text-sm text-gray-500 mb-3">{dispute.dispute_description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Dispute Amount:</span>
                        <p>৳{dispute.dispute_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Claimed Amount:</span>
                        <p>৳{dispute.claimed_amount?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <p>{dispute.dispute_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <p>{new Date(dispute.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {dispute.status === 'open' && (
                    <Button size="sm">
                      Take Action
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {disputes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
            <p className="text-gray-600 text-center">
              No revenue disputes found. Great job maintaining clear revenue processes!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
