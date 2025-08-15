
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { VendorPerformanceService, VendorPerformanceReport } from '@/shared/services/database/VendorPerformanceService';
import { FileText, Eye, Edit, Trash2, TrendingUp, Calendar, Users } from 'lucide-react';

export const ReportsOverviewTab: React.FC = () => {
  const [reports, setReports] = useState<VendorPerformanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      const filterOptions = filter === 'all' ? {} : { status: filter };
      const data = await VendorPerformanceService.getPerformanceReports(filterOptions);
      // Type assertion to ensure proper typing
      setReports((data || []) as VendorPerformanceReport[]);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReportTypeBadge = (type: string) => {
    const colors = {
      daily: 'bg-purple-100 text-purple-800',
      weekly: 'bg-blue-100 text-blue-800',
      monthly: 'bg-green-100 text-green-800',
      quarterly: 'bg-orange-100 text-orange-800',
      yearly: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
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
      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Performance Reports Overview
            </CardTitle>
            <div className="flex items-center space-x-2">
              {['all', 'published', 'approved', 'pending', 'draft'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All Reports' : status}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reports found for the selected filter.</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getReportTypeBadge(report.report_type)}
                      {getStatusBadge(report.status || 'draft')}
                      <Badge variant="outline" className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {report.report_period_start} to {report.report_period_end}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">
                      {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Performance Report
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ৳{(report.total_revenue || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {report.total_orders || 0}
                        </div>
                        <div className="text-sm text-gray-600">Orders</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {report.customer_satisfaction_score || 0}/5
                        </div>
                        <div className="text-sm text-gray-600">Satisfaction</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {report.on_time_delivery_rate || 0}%
                        </div>
                        <div className="text-sm text-gray-600">On-time Delivery</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Vendor: {report.vendor_id}
                      </span>
                      <span>
                        Created: {new Date(report.created_at || '').toLocaleDateString()}
                      </span>
                      {report.notes && (
                        <span className="truncate max-w-xs">
                          Notes: {report.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
