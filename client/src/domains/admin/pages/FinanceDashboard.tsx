/**
 * Finance Dashboard - Main Finance Service Frontend
 * Complete Amazon.com/Shopee.sg-level financial operations interface
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  FileText, 
  CreditCard, 
  Users, 
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Wallet
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Finance Service Sub-Components
import AccountingOverview from '@/components/finance/AccountingOverview';
import TaxManagement from '@/components/finance/TaxManagement';
import CommissionTracker from '@/components/finance/CommissionTracker';
import InvoiceManagement from '@/components/finance/InvoiceManagement';
import ReconciliationCenter from '@/components/finance/ReconciliationCenter';
import PayoutDashboard from '@/components/finance/PayoutDashboard';
import BudgetPlanning from '@/components/finance/BudgetPlanning';
import FinancialReports from '@/components/finance/FinancialReports';

interface FinanceMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  outstandingInvoices: number;
  pendingPayouts: number;
  taxLiability: number;
  budgetUtilization: number;
  reconciliationAccuracy: number;
  commissionsPaid: number;
}

interface FinanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

const FinanceDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  // Fetch finance metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/v1/finance/dashboard/metrics', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/v1/finance/dashboard/metrics?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch finance metrics');
      return response.json() as FinanceMetrics;
    }
  });

  // Fetch finance alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/v1/finance/alerts'],
    queryFn: async () => {
      const response = await fetch('/api/v1/finance/alerts');
      if (!response.ok) throw new Error('Failed to fetch finance alerts');
      return response.json() as FinanceAlert[];
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-600 mt-1">Enterprise-level financial operations and analytics</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Generate Report</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Financial Analytics</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metricsLoading ? 'Loading...' : formatCurrency(metrics?.totalRevenue || 0)}
                </p>
                <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metricsLoading ? 'Loading...' : formatCurrency(metrics?.netProfit || 0)}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {metrics?.profitMargin || 0}% margin
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Invoices</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metricsLoading ? 'Loading...' : (metrics?.outstandingInvoices || 0)}
                </p>
                <p className="text-sm text-yellow-600 mt-1">Requires attention</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metricsLoading ? 'Loading...' : formatCurrency(metrics?.pendingPayouts || 0)}
                </p>
                <p className="text-sm text-purple-600 mt-1">To vendors</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Financial Alerts</span>
              <Badge variant="secondary">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {alerts.length > 3 && (
                <Button variant="outline" size="sm" className="w-full">
                  View All Alerts ({alerts.length - 3} more)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="accounting" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Accounting</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Tax</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Invoices</span>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Payouts</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Budget</span>
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Reconciliation</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Overview Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Tax Liability (15% VAT)</span>
                    <span className="font-semibold">{formatCurrency(metrics?.taxLiability || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Budget Utilization</span>
                    <span className="font-semibold">{metrics?.budgetUtilization || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Reconciliation Accuracy</span>
                    <span className="font-semibold">{metrics?.reconciliationAccuracy || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Commissions Paid</span>
                    <span className="font-semibold">{formatCurrency(metrics?.commissionsPaid || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                    <Calculator className="h-6 w-6" />
                    <span className="text-sm">New Budget</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Generate Invoice</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Process Payouts</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-sm">Reconcile Payments</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounting">
          <AccountingOverview />
        </TabsContent>

        <TabsContent value="tax">
          <TaxManagement />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceManagement />
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutDashboard />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetPlanning />
        </TabsContent>

        <TabsContent value="reconciliation">
          <ReconciliationCenter />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;