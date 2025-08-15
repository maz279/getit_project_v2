
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';

const monthlyTargets = [
  { month: 'Jan', target: 8000000, achieved: 7800000, percentage: 97.5 },
  { month: 'Feb', target: 8200000, achieved: 8450000, percentage: 103.0 },
  { month: 'Mar', target: 8500000, achieved: 8200000, percentage: 96.5 },
  { month: 'Apr', target: 8800000, achieved: 9100000, percentage: 103.4 },
  { month: 'May', target: 9000000, achieved: 8750000, percentage: 97.2 },
  { month: 'Jun', target: 9200000, achieved: 9580000, percentage: 104.1 }
];

export const TargetsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue Targets vs Achievement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {monthlyTargets.map((month, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{month.month} 2024</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">৳{(month.achieved / 1000000).toFixed(1)}M / ৳{(month.target / 1000000).toFixed(1)}M</span>
                  <Badge className={month.percentage >= 100 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                    {month.percentage}%
                  </Badge>
                </div>
              </div>
              <Progress value={month.percentage > 100 ? 100 : month.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
