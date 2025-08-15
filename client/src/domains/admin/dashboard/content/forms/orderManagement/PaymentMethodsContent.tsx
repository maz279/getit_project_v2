
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  BarChart3,
  CreditCard,
  Settings,
  PieChart,
  Smartphone,
  Building,
  Globe,
  Shield
} from 'lucide-react';
import { PaymentMethodsHeader } from './paymentMethods/PaymentMethodsHeader';
import { PaymentMethodsOverviewTab } from './paymentMethods/PaymentMethodsOverviewTab';
import { PaymentMethodsTab } from './paymentMethods/PaymentMethodsTab';
import { PaymentMethodsConfigurationTab } from './paymentMethods/PaymentMethodsConfigurationTab';
import { PaymentMethodsAnalyticsTab } from './paymentMethods/PaymentMethodsAnalyticsTab';

export const PaymentMethodsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock payment methods data
  const paymentMethodsStats = {
    totalMethods: 12,
    activeMethods: 10,
    inactiveMethods: 2,
    pendingSetup: 1,
    totalTransactions: 45620,
    totalRevenue: 8945230,
    averageTransactionValue: 196.5,
    successRate: 97.2
  };

  const paymentMethods = [
    {
      id: 'pm001',
      name: 'Credit Card (Visa/Mastercard)',
      provider: 'Stripe',
      type: 'Credit Card',
      status: 'Active',
      setupDate: '2024-01-15',
      transactionCount: 15420,
      revenue: 3245000,
      successRate: 98.5,
      avgProcessingTime: '2.3s',
      fees: '2.9% + ৳3',
      regions: ['Bangladesh', 'Global'],
      currency: ['BDT', 'USD'],
      icon: CreditCard,
      color: 'blue'
    },
    {
      id: 'pm002',
      name: 'bKash',
      provider: 'bKash API',
      type: 'Mobile Banking',
      status: 'Active',
      setupDate: '2024-01-20',
      transactionCount: 12850,
      revenue: 2145000,
      successRate: 96.8,
      avgProcessingTime: '3.1s',
      fees: '1.85%',
      regions: ['Bangladesh'],
      currency: ['BDT'],
      icon: Smartphone,
      color: 'pink'
    },
    {
      id: 'pm003',
      name: 'Nagad',
      provider: 'Nagad API',
      type: 'Mobile Banking',
      status: 'Active',
      setupDate: '2024-02-01',
      transactionCount: 8745,
      revenue: 1564000,
      successRate: 95.2,
      avgProcessingTime: '2.8s',
      fees: '1.99%',
      regions: ['Bangladesh'],
      currency: ['BDT'],
      icon: Smartphone,
      color: 'orange'
    },
    {
      id: 'pm004',
      name: 'Rocket',
      provider: 'DBBL Rocket',
      type: 'Mobile Banking',
      status: 'Active',
      setupDate: '2024-02-10',
      transactionCount: 4520,
      revenue: 785000,
      successRate: 94.5,
      avgProcessingTime: '3.5s',
      fees: '2.25%',
      regions: ['Bangladesh'],
      currency: ['BDT'],
      icon: Smartphone,
      color: 'purple'
    },
    {
      id: 'pm005',
      name: 'Bank Transfer',
      provider: 'Local Banks',
      type: 'Bank Transfer',
      status: 'Active',
      setupDate: '2024-01-10',
      transactionCount: 2845,
      revenue: 942000,
      successRate: 99.1,
      avgProcessingTime: '1-2 business days',
      fees: '0.5%',
      regions: ['Bangladesh'],
      currency: ['BDT'],
      icon: Building,
      color: 'green'
    },
    {
      id: 'pm006',
      name: 'PayPal',
      provider: 'PayPal',
      type: 'Digital Wallet',
      status: 'Inactive',
      setupDate: '2024-03-01',
      transactionCount: 0,
      revenue: 0,
      successRate: 0,
      avgProcessingTime: 'N/A',
      fees: '3.4% + ৳5',
      regions: ['Global'],
      currency: ['USD', 'EUR'],
      icon: Globe,
      color: 'blue'
    },
    {
      id: 'pm007',
      name: 'SSLCOMMERZ',
      provider: 'SSLCOMMERZ',
      type: 'Payment Gateway',
      status: 'Active',
      setupDate: '2024-01-25',
      transactionCount: 1236,
      revenue: 263000,
      successRate: 97.8,
      avgProcessingTime: '2.1s',
      fees: '2.75%',
      regions: ['Bangladesh'],
      currency: ['BDT'],
      icon: Shield,
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PaymentMethodsHeader />

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview" className="py-3 px-4 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="methods" className="py-3 px-4 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Methods
            </TabsTrigger>
            <TabsTrigger value="configuration" className="py-3 px-4 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="analytics" className="py-3 px-4 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <PaymentMethodsOverviewTab 
            paymentMethodsStats={paymentMethodsStats}
            paymentMethods={paymentMethods}
          />
        </TabsContent>

        <TabsContent value="methods" className="mt-6">
          <PaymentMethodsTab paymentMethods={paymentMethods} />
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <PaymentMethodsConfigurationTab />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <PaymentMethodsAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
