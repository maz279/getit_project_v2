
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Target } from 'lucide-react';

const goalProgressData = [
  { goal: 'Q2 Revenue Target', current: 8500000, target: 9000000, progress: 94.4, status: 'on-track' },
  { goal: 'Customer Acquisition', current: 62000, target: 75000, progress: 82.7, status: 'at-risk' },
  { goal: 'Market Share Growth', current: 12.5, target: 15.0, progress: 83.3, status: 'on-track' },
  { goal: 'Operational Efficiency', current: 78, target: 85, progress: 91.8, status: 'on-track' },
];

interface KPIGoalsTabProps {
  getStatusColor: (status: string) => string;
}

export const KPIGoalsTab = ({ getStatusColor }: KPIGoalsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Goal Progress Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goal Progress Tracking
          </CardTitle>
          <CardDescription>Current progress towards strategic goals and objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {goalProgressData.map((goal, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{goal.goal}</h3>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Current: {goal.current.toLocaleString()}</span>
                    <span>Target: {goal.target.toLocaleString()}</span>
                    <span>{goal.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
