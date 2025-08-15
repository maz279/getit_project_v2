
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CreditCard } from 'lucide-react';

const paymentMethods = [
  { method: 'Mobile Banking', revenue: 3500000, percentage: 45, transactions: 15680 },
  { method: 'Cash on Delivery', revenue: 2800000, percentage: 36, transactions: 12340 },
  { method: 'Credit/Debit Card', revenue: 980000, percentage: 12, transactions: 4250 },
  { method: 'Bank Transfer', revenue: 520000, percentage: 7, transactions: 1890 }
];

export const PaymentMethodsTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {method.method}
                  </span>
                  <span className="text-sm">৳{(method.revenue / 1000000).toFixed(1)}M ({method.percentage}%)</span>
                </div>
                <Progress value={method.percentage} className="h-2" />
                <div className="text-xs text-gray-600">
                  {method.transactions.toLocaleString()} transactions
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: "Revenue", color: "#3b82f6" }
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentMethods}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
