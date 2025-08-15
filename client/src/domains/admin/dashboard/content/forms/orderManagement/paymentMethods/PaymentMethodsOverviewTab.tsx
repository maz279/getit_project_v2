
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { 
  CheckCircle,
  CreditCard,
  Activity,
  DollarSign,
  Settings,
  TrendingUp,
  PieChart,
  BarChart3
} from 'lucide-react';

interface PaymentMethodsStats {
  totalMethods: number;
  activeMethods: number;
  inactiveMethods: number;
  pendingSetup: number;
  totalTransactions: number;
  totalRevenue: number;
  averageTransactionValue: number;
  successRate: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  type: string;
  status: string;
  setupDate: string;
  transactionCount: number;
  revenue: number;
  successRate: number;
  avgProcessingTime: string;
  fees: string;
  regions: string[];
  currency: string[];
  icon: any;
  color: string;
}

interface PaymentMethodsOverviewTabProps {
  paymentMethodsStats: PaymentMethodsStats;
  paymentMethods: PaymentMethod[];
}

export const PaymentMethodsOverviewTab: React.FC<PaymentMethodsOverviewTabProps> = ({
  paymentMethodsStats,
  paymentMethods
}) => {
  return (
    <div className="space-y-6">
      {/* Payment Methods Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Active Methods</p>
                <p className="text-3xl font-bold text-blue-800">{paymentMethodsStats.activeMethods}</p>
                <p className="text-xs text-blue-600 font-medium flex items-center mt-1">
                  <CheckCircle size={12} className="mr-1" />
                  {((paymentMethodsStats.activeMethods / paymentMethodsStats.totalMethods) * 100).toFixed(0)}% active
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Transactions</p>
                <p className="text-3xl font-bold text-green-800">{paymentMethodsStats.totalTransactions.toLocaleString()}</p>
                <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  {paymentMethodsStats.successRate}% success rate
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-800">৳ {paymentMethodsStats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-purple-600 font-medium flex items-center mt-1">
                  <DollarSign size={12} className="mr-1" />
                  Avg: ৳ {paymentMethodsStats.averageTransactionValue}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Pending Setup</p>
                <p className="text-3xl font-bold text-orange-800">{paymentMethodsStats.pendingSetup}</p>
                <p className="text-xs text-orange-600 font-medium flex items-center mt-1">
                  <Settings size={12} className="mr-1" />
                  Requires attention
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <Settings className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Performance Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-3 h-5 w-5 text-blue-600" />
              Revenue by Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.slice(0, 5).map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full`} style={{ 
                      backgroundColor: `hsl(${index * 60}, 60%, 50%)` 
                    }}></div>
                    <div>
                      <p className="font-medium text-gray-800">{method.name}</p>
                      <p className="text-sm text-gray-500">{method.transactionCount.toLocaleString()} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">৳ {method.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{method.successRate}% success</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-3 h-5 w-5 text-green-600" />
              Transaction Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
              <div className="text-center">
                <PieChart className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Transaction Distribution Chart</p>
                <p className="text-sm text-gray-500">Payment method usage breakdown</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
