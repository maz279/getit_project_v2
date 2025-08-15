
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Map, MapPin, Layers, Eye } from 'lucide-react';
import { ShippingZone } from './types';

interface CoverageMapTabProps {
  zones: ShippingZone[];
}

export const CoverageMapTab: React.FC<CoverageMapTabProps> = ({ zones }) => {
  return (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Map className="h-5 w-5 mr-2" />
            Interactive Coverage Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 h-96 flex items-center justify-center">
            <div className="text-center">
              <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Interactive Map Integration</h3>
              <p className="text-gray-500 max-w-md">
                Live coverage map showing all shipping zones, delivery routes, and real-time logistics data. 
                Integration with Google Maps/Mapbox for detailed geographical visualization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Coverage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="h-5 w-5 mr-2" />
              Zone Coverage Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {zones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      zone.status === 'active' ? 'bg-green-500' : 
                      zone.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{zone.name}</p>
                      <p className="text-sm text-gray-600">{zone.cities.length} cities</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{zone.coverageArea.toLocaleString()} km²</p>
                    <Badge className={zone.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {zone.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Coverage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Total Coverage Area</h4>
                <p className="text-2xl font-bold text-blue-800">
                  {zones.reduce((acc, zone) => acc + zone.coverageArea, 0).toLocaleString()} km²
                </p>
                <p className="text-sm text-blue-600">Covering 98.5% of Bangladesh</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Active Zones</h4>
                <p className="text-2xl font-bold text-green-800">
                  {zones.filter(z => z.status === 'active').length}
                </p>
                <p className="text-sm text-green-600">
                  {zones.filter(z => z.status === 'active').reduce((acc, zone) => acc + zone.cities.length, 0)} cities covered
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Average Delivery Time</h4>
                <p className="text-2xl font-bold text-purple-800">2.8 days</p>
                <p className="text-sm text-purple-600">Across all active zones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Zone Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Zone Details & Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-3 text-left">Zone Name</th>
                  <th className="border border-gray-200 p-3 text-left">Type</th>
                  <th className="border border-gray-200 p-3 text-left">Coverage Area</th>
                  <th className="border border-gray-200 p-3 text-left">Cities</th>
                  <th className="border border-gray-200 p-3 text-left">Delivery Time</th>
                  <th className="border border-gray-200 p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td className="border border-gray-200 p-3 font-medium">{zone.name}</td>
                    <td className="border border-gray-200 p-3">
                      <Badge className={
                        zone.type === 'express' ? 'bg-blue-100 text-blue-800' : 
                        zone.type === 'international' ? 'bg-purple-100 text-purple-800' : 
                        'bg-gray-100 text-gray-800'
                      }>
                        {zone.type}
                      </Badge>
                    </td>
                    <td className="border border-gray-200 p-3">{zone.coverageArea.toLocaleString()} km²</td>
                    <td className="border border-gray-200 p-3">
                      {zone.cities.slice(0, 2).join(', ')}
                      {zone.cities.length > 2 && ` +${zone.cities.length - 2}`}
                    </td>
                    <td className="border border-gray-200 p-3">{zone.deliveryTimeMin}-{zone.deliveryTimeMax} days</td>
                    <td className="border border-gray-200 p-3">
                      <Badge className={
                        zone.status === 'active' ? 'bg-green-100 text-green-800' : 
                        zone.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }>
                        {zone.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
