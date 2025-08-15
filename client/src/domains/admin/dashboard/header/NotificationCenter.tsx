
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Badge } from '@/shared/ui/badge';

export const NotificationCenter: React.FC = () => {
  const notifications = [
    { type: 'vendor', count: 5, text: 'New vendor applications' },
    { type: 'product', count: 8, text: 'Pending product approvals' },
    { type: 'system', count: 3, text: 'System alerts' },
    { type: 'complaint', count: 4, text: 'Customer complaints' },
    { type: 'payment', count: 3, text: 'Payment failures' }
  ];

  const totalNotifications = notifications.reduce((sum, n) => sum + n.count, 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative p-2">
          <Bell size={14} className="text-gray-600" />
          {totalNotifications > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
              {totalNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-white border shadow-lg z-50" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Badge variant="secondary">{totalNotifications} unread</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.map((notification, index) => (
          <DropdownMenuItem key={index} className="flex items-center justify-between p-3">
            <span className="text-sm">{notification.text}</span>
            <Badge variant="outline" className="ml-2">
              {notification.count}
            </Badge>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center text-blue-600 font-medium">
          View All Notifications
        </DropdownMenuItem>
        <DropdownMenuItem className="text-center text-gray-600">
          Notification Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
