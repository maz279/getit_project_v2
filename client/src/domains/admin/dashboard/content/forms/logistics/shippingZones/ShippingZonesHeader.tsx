
import React from 'react';
import { Button } from '@/shared/ui/button';
import { MapPin, Clock, RefreshCw, Download, Plus } from 'lucide-react';

export const ShippingZonesHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <MapPin className="mr-3 h-8 w-8 text-blue-600" />
            Shipping Zones Management
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            📍 Order Management → Shipping & Logistics → Delivery Zones
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last Updated: {new Date().toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Zone
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Zones
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
};
