
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Navigation, MapPin } from 'lucide-react';

export const MapTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Navigation className="h-5 w-5 mr-2" />
          Live Delivery Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Interactive Delivery Map</p>
            <p className="text-sm text-gray-500 mb-4">Real-time tracking of all active deliveries</p>
            <div className="flex justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Delivered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Out for Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">In Transit</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Delayed</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
