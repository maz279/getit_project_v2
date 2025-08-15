
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { BarChart3, FileText, PieChart } from 'lucide-react';
import { RefundProcessingHeader } from './refundProcessing/RefundProcessingHeader';
import { RefundOverviewTab } from './refundProcessing/RefundOverviewTab';
import { RefundRequestsTab } from './refundProcessing/RefundRequestsTab';
import { RefundAnalyticsTab } from './refundProcessing/RefundAnalyticsTab';

export const RefundProcessingContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedReason, setSelectedReason] = useState('all');

  // Mock refund data
  const refundStats = {
    totalRefundsToday: 89,
    totalRefundsThisWeek: 567,
    totalRefundsThisMonth: 2340,
    refundRate: 2.3,
    totalAmountRefunded: 145750,
    averageRefundAmount: 245.8,
    pendingRefunds: 127,
    processingTime: 1.2,
    customerSatisfaction: 4.6
  };

  const refundReasons = [
    { reason: 'Product Not as Described', count: 456, percentage: 42.3, color: 'red' },
    { reason: 'Damaged/Defective Product', count: 298, percentage: 27.6, color: 'orange' },
    { reason: 'Changed Mind', count: 187, percentage: 17.3, color: 'yellow' },
    { reason: 'Late Delivery', count: 89, percentage: 8.2, color: 'blue' },
    { reason: 'Wrong Item Received', count: 48, percentage: 4.6, color: 'purple' }
  ];

  const recentRefunds = [
    {
      id: 'REF-2024-001234',
      orderId: 'ORD-2024-5678',
      customer: 'Ahmed Rahman',
      email: 'ahmed.rahman@email.com',
      phone: '+8801712345678',
      amount: 2340,
      currency: 'BDT',
      reason: 'Product Not as Described',
      status: 'Processing',
      requestDate: '2024-06-26 10:30:25',
      processedDate: null,
      method: 'Credit Card',
      gateway: 'Stripe',
      product: 'Samsung Galaxy S24',
      customerNote: 'Screen has dead pixels, not working properly',
      images: ['defect1.jpg', 'defect2.jpg'],
      priority: 'High',
      assignedTo: 'Sarah Khan',
      estimatedCompletion: '2024-06-28 15:00:00'
    },
    {
      id: 'REF-2024-001235',
      orderId: 'ORD-2024-5679',
      customer: 'Fatima Ali',
      email: 'fatima.ali@email.com',
      phone: '+8801798765432',
      amount: 1890,
      currency: 'BDT',
      reason: 'Damaged/Defective Product',
      status: 'Approved',
      requestDate: '2024-06-25 14:28:15',
      processedDate: '2024-06-26 09:15:00',
      method: 'bKash',
      gateway: 'bKash',
      product: 'iPhone 15 Pro',
      customerNote: 'Package arrived damaged, phone screen cracked',
      images: ['damage1.jpg'],
      priority: 'Medium',
      assignedTo: 'Mohammad Hassan',
      estimatedCompletion: '2024-06-27 12:00:00'
    },
    {
      id: 'REF-2024-001236',
      orderId: 'ORD-2024-5680',
      customer: 'Rashid Khan',
      email: 'rashid.khan@email.com',
      phone: '+8801856789012',
      amount: 3450,
      currency: 'BDT',
      reason: 'Changed Mind',
      status: 'Completed',
      requestDate: '2024-06-24 16:25:40',
      processedDate: '2024-06-25 11:30:00',
      method: 'Bank Transfer',
      gateway: 'Dutch Bangla Bank',
      product: 'MacBook Pro 14"',
      customerNote: 'Found better deal elsewhere',
      images: [],
      priority: 'Low',
      assignedTo: 'Ayesha Begum',
      estimatedCompletion: '2024-06-26 10:00:00'
    }
  ];

  const refundWorkflow = [
    {
      step: 'Request Received',
      description: 'Customer submits refund request',
      automation: 'Auto-acknowledgment email',
      sla: '< 1 hour'
    },
    {
      step: 'Initial Review',
      description: 'Verify order details and eligibility',
      automation: 'Auto-validation checks',
      sla: '< 4 hours'
    },
    {
      step: 'Documentation Review',
      description: 'Check provided evidence and images',
      automation: 'AI image analysis',
      sla: '< 8 hours'
    },
    {
      step: 'Decision Making',
      description: 'Approve, reject, or request more info',
      automation: 'Smart recommendation engine',
      sla: '< 24 hours'
    },
    {
      step: 'Processing',
      description: 'Initiate refund to original payment method',
      automation: 'Auto-processing for approved refunds',
      sla: '< 48 hours'
    },
    {
      step: 'Completion',
      description: 'Confirm refund completion and notify customer',
      automation: 'Auto-completion notifications',
      sla: '< 72 hours'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <RefundProcessingHeader />

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="overview" className="py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="refunds" className="py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <FileText className="h-4 w-4 mr-2" />
              Refund Requests
            </TabsTrigger>
            <TabsTrigger value="analytics" className="py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <RefundOverviewTab 
            stats={refundStats}
            reasons={refundReasons}
            workflow={refundWorkflow}
          />
        </TabsContent>

        <TabsContent value="refunds" className="mt-6">
          <RefundRequestsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedReason={selectedReason}
            setSelectedReason={setSelectedReason}
            selectedTimeRange={selectedTimeRange}
            setSelectedTimeRange={setSelectedTimeRange}
            refunds={recentRefunds}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <RefundAnalyticsTab stats={refundStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
