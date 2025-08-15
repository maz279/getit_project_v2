
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  Phone, 
  Timer, 
  MapPin, 
  MessageSquare,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { DeliveryItem } from './types';
import { StatusIcon } from './StatusIcon';
import { getStatusColor, getPriorityColor } from './utils';

interface DeliveryCardProps {
  delivery: DeliveryItem;
  onViewDetails: (delivery: DeliveryItem) => void;
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, onViewDetails }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <StatusIcon status={delivery.status} />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-bold text-lg">{delivery.trackingNumber}</h3>
                <Badge className={getStatusColor(delivery.status)}>
                  {delivery.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={getPriorityColor(delivery.priority)}>
                  {delivery.priority.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Order: {delivery.orderId}</p>
              <p className="text-sm text-gray-600">Value: ৳{delivery.packageValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onViewDetails(delivery)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-semibold">{delivery.customerName}</p>
            <p className="text-sm text-gray-600 flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              {delivery.customerPhone}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Courier</p>
            <p className="font-semibold">{delivery.courierPartner}</p>
            <p className="text-sm text-gray-600">{delivery.courierDriver}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-semibold">{delivery.currentLocation}</p>
            <p className="text-sm text-gray-600 flex items-center">
              <Timer className="h-3 w-3 mr-1" />
              ETA: {delivery.estimatedDelivery}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Delivery Address</p>
          <p className="text-sm bg-gray-50 p-2 rounded flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            {delivery.deliveryAddress}
          </p>
        </div>

        {delivery.deliveryInstructions && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Delivery Instructions</p>
            <p className="text-sm bg-yellow-50 p-2 rounded flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-yellow-600" />
              {delivery.deliveryInstructions}
            </p>
          </div>
        )}

        <div className="border-t pt-4">
          <p className="text-sm text-gray-500 mb-3">Delivery Timeline</p>
          <div className="space-y-2">
            {delivery.timeline.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${index === delivery.timeline.length - 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.status}</p>
                    <p className="text-xs text-gray-500">{item.timestamp}</p>
                  </div>
                  <p className="text-xs text-gray-600">{item.location} • {item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
