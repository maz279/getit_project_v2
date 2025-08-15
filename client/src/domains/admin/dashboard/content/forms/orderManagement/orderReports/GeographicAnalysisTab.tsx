
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { MapPin, Globe, TrendingUp } from 'lucide-react';
import { GeographicAnalysis } from './types';

interface GeographicAnalysisTabProps {
  data: GeographicAnalysis;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

export const GeographicAnalysisTab: React.FC<GeographicAnalysisTabProps> = ({ 
  data, 
  selectedRegion, 
  onRegionChange 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Geographic Sales Analysis</h2>
        <Select value={selectedRegion} onValueChange={onRegionChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="dhaka">Dhaka Division</SelectItem>
            <SelectItem value="chittagong">Chittagong Division</SelectItem>
            <SelectItem value="sylhet">Sylhet Division</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🗺️ Regional Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.regionalSales.map((region, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold">{region.region}</h3>
                    </div>
                    <Badge variant={region.growth > 0 ? "default" : "destructive"}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {region.growth}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Orders</p>
                      <p className="font-bold">{region.orders.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-bold">৳{region.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Customers</p>
                      <p className="font-bold">{region.customers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Avg Order Value</p>
                      <p className="font-bold">৳{region.averageOrderValue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🚚 Shipping Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Domestic Orders</p>
                <p className="text-2xl font-bold text-blue-600">{data.shippingAnalysis.domesticOrders.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">International Orders</p>
                <p className="text-2xl font-bold text-green-600">{data.shippingAnalysis.internationalOrders.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Average Shipping Cost</p>
              <p className="text-2xl font-bold">৳{data.shippingAnalysis.averageShippingCost}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Popular Destinations</h4>
              <div className="space-y-2">
                {data.shippingAnalysis.popularDestinations.map((destination, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>{destination}</span>
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
