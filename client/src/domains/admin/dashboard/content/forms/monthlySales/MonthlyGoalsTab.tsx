
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface MonthlyGoalsTabProps {
  monthlyGoalsData: any[];
  predictiveData: any[];
}

export const MonthlyGoalsTab: React.FC<MonthlyGoalsTabProps> = ({
  monthlyGoalsData,
  predictiveData
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Goals & Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {monthlyGoalsData.map((goal, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{goal.metric}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {goal.actual.toLocaleString()} / {goal.target.toLocaleString()}
                    </span>
                    <Badge className={
                      goal.status === 'excellent' ? 'bg-green-100 text-green-800' :
                      goal.status === 'good' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {goal.achievement}%
                    </Badge>
                  </div>
                </div>
                <Progress value={goal.achievement} className="h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              actual: { label: "Actual", color: "#3b82f6" },
              predicted: { label: "Predicted", color: "#f59e0b" }
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictiveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
                <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
