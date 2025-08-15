
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { PieChart } from 'lucide-react';

interface RefundReason {
  reason: string;
  count: number;
  percentage: number;
  color: string;
}

interface RefundReasonsChartProps {
  reasons: RefundReason[];
}

export const RefundReasonsChart: React.FC<RefundReasonsChartProps> = ({ reasons }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChart className="mr-3 h-5 w-5 text-blue-600" />
          Top Refund Reasons
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reasons.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-blue-500" style={{ 
                  backgroundColor: `hsl(${index * 40 + 10}, 60%, 50%)` 
                }}></div>
                <div>
                  <p className="font-medium text-gray-800">{item.reason}</p>
                  <p className="text-sm text-gray-500">{item.count} requests</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{item.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
