
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Clock, User, Package, ShoppingCart, AlertTriangle } from 'lucide-react';

export const AdminRecentActivity: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'order',
      title: 'New order received',
      description: 'Order #12345 from John Doe',
      time: '2 minutes ago',
      status: 'success',
      icon: ShoppingCart
    },
    {
      id: 2,
      type: 'vendor',
      title: 'Vendor registration',
      description: 'TechStore BD submitted KYC documents',
      time: '15 minutes ago',
      status: 'pending',
      icon: User
    },
    {
      id: 3,
      type: 'product',
      title: 'Product approval needed',
      description: 'iPhone 15 Pro Max requires review',
      time: '1 hour ago',
      status: 'warning',
      icon: Package
    },
    {
      id: 4,
      type: 'alert',
      title: 'System alert',
      description: 'High server load detected',
      time: '2 hours ago',
      status: 'error',
      icon: AlertTriangle
    },
    {
      id: 5,
      type: 'order',
      title: 'Order completed',
      description: 'Order #12340 delivered successfully',
      time: '3 hours ago',
      status: 'success',
      icon: ShoppingCart
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock size={20} className="mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                  <Icon size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all activities →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
