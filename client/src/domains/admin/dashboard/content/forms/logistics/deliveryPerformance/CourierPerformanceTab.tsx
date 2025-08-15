
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { CourierPerformance } from './types';
import { Star, TrendingUp, MapPin, DollarSign } from 'lucide-react';

interface CourierPerformanceTabProps {
  data: CourierPerformance[];
  selectedCourier: string;
  onCourierChange: (courier: string) => void;
}

export const CourierPerformanceTab: React.FC<CourierPerformanceTabProps> = ({
  data,
  selectedCourier,
  onCourierChange
}) => {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <Select value={selectedCourier} onValueChange={onCourierChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Courier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Couriers</SelectItem>
            {data.map((courier) => (
              <SelectItem key={courier.id} value={courier.id}>
                {courier.logo} {courier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          Compare Couriers
        </Button>
      </div>

      {/* Courier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((courier) => (
          <Card key={courier.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <span className="text-2xl mr-2">{courier.logo}</span>
                  {courier.name}
                </CardTitle>
                <Badge 
                  variant={courier.status === 'active' ? 'default' : 'secondary'}
                  className={courier.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {courier.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center text-green-600 mb-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">On-Time Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {courier.onTimeRate}%
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center text-blue-600 mb-1">
                    <span className="text-sm font-medium">Avg Time</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {courier.averageTime}d
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center text-yellow-600 mb-1">
                    <Star className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {courier.customerRating}/5
                  </div>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center text-purple-600 mb-1">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700">
                    ৳{courier.costPerDelivery}
                  </div>
                </div>
              </div>

              {/* Coverage */}
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Coverage Areas</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {courier.coverage.map((area) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Deliveries */}
              <div className="text-center py-2 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">
                  {courier.totalDeliveries.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Deliveries</div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <h5 className="text-sm font-medium text-green-700 mb-2">✅ Strengths</h5>
                  <ul className="text-xs text-green-600 space-y-1">
                    {courier.strengths.map((strength, idx) => (
                      <li key={idx}>• {strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-red-700 mb-2">⚠️ Areas to Improve</h5>
                  <ul className="text-xs text-red-600 space-y-1">
                    {courier.weaknesses.map((weakness, idx) => (
                      <li key={idx}>• {weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Set KPIs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
