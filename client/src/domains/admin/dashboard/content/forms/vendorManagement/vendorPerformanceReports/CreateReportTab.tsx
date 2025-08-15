
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { VendorPerformanceService, VendorPerformanceReport } from '@/shared/services/database/VendorPerformanceService';
import { toast } from 'sonner';
import { Save, Send, FileText } from 'lucide-react';

export const CreateReportTab: React.FC = () => {
  const [formData, setFormData] = useState<VendorPerformanceReport>({
    vendor_id: '',
    report_period_start: '',
    report_period_end: '',
    report_type: 'monthly',
    created_by: 'admin', // This should be the actual user ID
    status: 'draft'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field: keyof VendorPerformanceReport, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (status: 'draft' | 'pending') => {
    setIsSubmitting(true);
    try {
      const reportData = { ...formData, status };
      await VendorPerformanceService.createPerformanceReport(reportData);
      toast.success(`Report ${status === 'draft' ? 'saved as draft' : 'submitted for review'} successfully`);
      
      // Reset form
      setFormData({
        vendor_id: '',
        report_period_start: '',
        report_period_end: '',
        report_type: 'monthly',
        created_by: 'admin',
        status: 'draft'
      });
      setActiveTab('basic');
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Create New Performance Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor_id">Vendor ID *</Label>
                  <Input
                    id="vendor_id"
                    value={formData.vendor_id}
                    onChange={(e) => handleInputChange('vendor_id', e.target.value)}
                    placeholder="Enter vendor ID"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Report Type *</Label>
                  <Select
                    value={formData.report_type}
                    onValueChange={(value) => handleInputChange('report_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period_start">Report Period Start *</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={formData.report_period_start}
                    onChange={(e) => handleInputChange('report_period_start', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="period_end">Report Period End *</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={formData.report_period_end}
                    onChange={(e) => handleInputChange('report_period_end', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Report Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any additional notes or observations..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Sales Performance */}
            <TabsContent value="sales" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_revenue">Total Revenue</Label>
                  <Input
                    id="total_revenue"
                    type="number"
                    step="0.01"
                    value={formData.total_revenue || ''}
                    onChange={(e) => handleInputChange('total_revenue', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total_orders">Total Orders</Label>
                  <Input
                    id="total_orders"
                    type="number"
                    value={formData.total_orders || ''}
                    onChange={(e) => handleInputChange('total_orders', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="average_order_value">Average Order Value</Label>
                  <Input
                    id="average_order_value"
                    type="number"
                    step="0.01"
                    value={formData.average_order_value || ''}
                    onChange={(e) => handleInputChange('average_order_value', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="conversion_rate">Conversion Rate (%)</Label>
                  <Input
                    id="conversion_rate"
                    type="number"
                    step="0.01"
                    value={formData.conversion_rate || ''}
                    onChange={(e) => handleInputChange('conversion_rate', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Product Performance */}
            <TabsContent value="products" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_products_listed">Total Products Listed</Label>
                  <Input
                    id="total_products_listed"
                    type="number"
                    value={formData.total_products_listed || ''}
                    onChange={(e) => handleInputChange('total_products_listed', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="active_products">Active Products</Label>
                  <Input
                    id="active_products"
                    type="number"
                    value={formData.active_products || ''}
                    onChange={(e) => handleInputChange('active_products', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="out_of_stock_products">Out of Stock Products</Label>
                  <Input
                    id="out_of_stock_products"
                    type="number"
                    value={formData.out_of_stock_products || ''}
                    onChange={(e) => handleInputChange('out_of_stock_products', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inventory_turnover_rate">Inventory Turnover Rate</Label>
                  <Input
                    id="inventory_turnover_rate"
                    type="number"
                    step="0.01"
                    value={formData.inventory_turnover_rate || ''}
                    onChange={(e) => handleInputChange('inventory_turnover_rate', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Customer Service */}
            <TabsContent value="service" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_satisfaction_score">Customer Satisfaction Score</Label>
                  <Input
                    id="customer_satisfaction_score"
                    type="number"
                    step="0.01"
                    max="5"
                    value={formData.customer_satisfaction_score || ''}
                    onChange={(e) => handleInputChange('customer_satisfaction_score', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="response_time_hours">Response Time (Hours)</Label>
                  <Input
                    id="response_time_hours"
                    type="number"
                    step="0.01"
                    value={formData.response_time_hours || ''}
                    onChange={(e) => handleInputChange('response_time_hours', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_complaints">Total Complaints</Label>
                  <Input
                    id="total_complaints"
                    type="number"
                    value={formData.total_complaints || ''}
                    onChange={(e) => handleInputChange('total_complaints', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resolved_complaints">Resolved Complaints</Label>
                  <Input
                    id="resolved_complaints"
                    type="number"
                    value={formData.resolved_complaints || ''}
                    onChange={(e) => handleInputChange('resolved_complaints', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Delivery Performance */}
            <TabsContent value="delivery" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="on_time_delivery_rate">On-Time Delivery Rate (%)</Label>
                  <Input
                    id="on_time_delivery_rate"
                    type="number"
                    step="0.01"
                    max="100"
                    value={formData.on_time_delivery_rate || ''}
                    onChange={(e) => handleInputChange('on_time_delivery_rate', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="average_delivery_time_days">Average Delivery Time (Days)</Label>
                  <Input
                    id="average_delivery_time_days"
                    type="number"
                    step="0.1"
                    value={formData.average_delivery_time_days || ''}
                    onChange={(e) => handleInputChange('average_delivery_time_days', parseFloat(e.target.value) || 0)}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_success_rate">Delivery Success Rate (%)</Label>
                  <Input
                    id="delivery_success_rate"
                    type="number"
                    step="0.01"
                    max="100"
                    value={formData.delivery_success_rate || ''}
                    onChange={(e) => handleInputChange('delivery_success_rate', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="return_rate">Return Rate (%)</Label>
                  <Input
                    id="return_rate"
                    type="number"
                    step="0.01"
                    max="100"
                    value={formData.return_rate || ''}
                    onChange={(e) => handleInputChange('return_rate', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Financial Metrics */}
            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission_paid">Commission Paid</Label>
                  <Input
                    id="commission_paid"
                    type="number"
                    step="0.01"
                    value={formData.commission_paid || ''}
                    onChange={(e) => handleInputChange('commission_paid', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="refunds_issued">Refunds Issued</Label>
                  <Input
                    id="refunds_issued"
                    type="number"
                    step="0.01"
                    value={formData.refunds_issued || ''}
                    onChange={(e) => handleInputChange('refunds_issued', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profit_margin">Profit Margin (%)</Label>
                  <Input
                    id="profit_margin"
                    type="number"
                    step="0.01"
                    value={formData.profit_margin || ''}
                    onChange={(e) => handleInputChange('profit_margin', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Seller Level</Label>
                  <Select
                    value={formData.seller_level || 'bronze'}
                    onValueChange={(value) => handleInputChange('seller_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit('pending')}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
