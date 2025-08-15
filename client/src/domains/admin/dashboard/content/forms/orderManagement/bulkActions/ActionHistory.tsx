
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Settings, Eye } from 'lucide-react';

export const ActionHistory: React.FC = () => {
  const actions = [
    {
      id: 1,
      action: 'Status Update',
      ordersCount: 15,
      performedBy: 'Admin User',
      timestamp: '2024-01-15T14:30:00Z',
      status: 'completed',
      details: 'Updated 15 orders from pending to processing'
    },
    {
      id: 2,
      action: 'Courier Assignment',
      ordersCount: 8,
      performedBy: 'Admin User',
      timestamp: '2024-01-15T12:15:00Z',
      status: 'completed',
      details: 'Assigned RedX courier to 8 orders'
    },
    {
      id: 3,
      action: 'Notification Sent',
      ordersCount: 22,
      performedBy: 'System',
      timestamp: '2024-01-15T10:00:00Z',
      status: 'completed',
      details: 'Sent delivery confirmation emails to 22 customers'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Action History</CardTitle>
        <p className="text-sm text-gray-600">Recent bulk actions performed on orders</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action) => (
            <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">{action.action}</h4>
                  <p className="text-sm text-gray-600">{action.details}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>{action.ordersCount} orders</span>
                    <span>by {action.performedBy}</span>
                    <span>{new Date(action.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  {action.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
