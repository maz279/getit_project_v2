
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Clock } from 'lucide-react';
import { DeliveryItem } from './types';
import { StatusIcon } from './StatusIcon';
import { getStatusColor } from './utils';

interface OverviewTabProps {
  deliveries: DeliveryItem[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ deliveries }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Delivery Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deliveries.slice(0, 5).map((delivery) => (
            <div key={delivery.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <StatusIcon status={delivery.status} />
                </div>
                <div>
                  <p className="font-semibold">{delivery.trackingNumber}</p>
                  <p className="text-sm text-gray-600">{delivery.customerName} • {delivery.currentLocation}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(delivery.status)}>
                  {delivery.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <p className="text-sm text-gray-500 mt-1">{delivery.lastUpdated}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
