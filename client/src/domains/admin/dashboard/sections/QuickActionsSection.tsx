
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { 
  Plus, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Settings, 
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';

export const QuickActionsSection: React.FC = () => {
  const quickActions = [
    { icon: Plus, label: 'Add Product', color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: CheckCircle, label: 'Approve Vendor', color: 'bg-green-500 hover:bg-green-600' },
    { icon: DollarSign, label: 'Process Payout', color: 'bg-purple-500 hover:bg-purple-600' },
    { icon: FileText, label: 'Generate Report', color: 'bg-orange-500 hover:bg-orange-600' },
    { icon: Settings, label: 'System Maintenance', color: 'bg-gray-500 hover:bg-gray-600' },
    { icon: AlertTriangle, label: 'Emergency Alert', color: 'bg-red-500 hover:bg-red-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Actions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Success rate: 97%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
            <Pause className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  className={`${action.color} text-white h-20 flex-col space-y-2`}
                  variant="default"
                >
                  <IconComponent size={20} />
                  <span className="text-xs text-center">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Recent quick action execution history and logs would be displayed here...</p>
        </CardContent>
      </Card>
    </div>
  );
};
