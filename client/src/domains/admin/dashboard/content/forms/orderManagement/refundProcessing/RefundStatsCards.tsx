
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { RefreshCw, CheckCircle2, DollarSign, Clock, TrendingUp, Calendar } from 'lucide-react';

interface RefundStatsCardsProps {
  stats: {
    totalRefundsToday: number;
    totalRefundsThisWeek: number;
    totalRefundsThisMonth: number;
    refundRate: number;
    totalAmountRefunded: number;
    averageRefundAmount: number;
    pendingRefunds: number;
    processingTime: number;
    customerSatisfaction: number;
  };
}

export const RefundStatsCards: React.FC<RefundStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Today's Refunds</p>
              <p className="text-3xl font-bold text-blue-800">{stats.totalRefundsToday}</p>
              <p className="text-xs text-blue-600 font-medium flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                {stats.refundRate}% refund rate
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-full">
              <RefreshCw className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-green-800">{stats.totalRefundsThisMonth}</p>
              <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                <Calendar size={12} className="mr-1" />
                Last 30 days
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Amount Refunded</p>
              <p className="text-3xl font-bold text-purple-800">৳ {stats.totalAmountRefunded.toLocaleString()}</p>
              <p className="text-xs text-purple-600 font-medium flex items-center mt-1">
                <DollarSign size={12} className="mr-1" />
                Avg: ৳ {stats.averageRefundAmount}
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
              <p className="text-orange-600 text-sm font-medium">Avg Process Time</p>
              <p className="text-3xl font-bold text-orange-800">{stats.processingTime} days</p>
              <p className="text-xs text-orange-600 font-medium flex items-center mt-1">
                <Clock size={12} className="mr-1" />
                {stats.pendingRefunds} pending
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-full">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
