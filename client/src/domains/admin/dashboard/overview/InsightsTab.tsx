
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { TrendingUp, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

export const InsightsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Business Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Growth Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Revenue Growth</span>
                  <span className="text-lg font-bold text-green-600">+24%</span>
                </div>
                <p className="text-xs text-green-600 mt-1">Compared to last quarter</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">User Acquisition</span>
                  <span className="text-lg font-bold text-blue-600">+18%</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">New users this month</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-800">Conversion Rate</span>
                  <span className="text-lg font-bold text-purple-600">3.4%</span>
                </div>
                <p className="text-xs text-purple-600 mt-1">Above industry average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Key Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Peak Traffic Hours</p>
                  <p className="text-xs text-gray-600">High load between 2-4 PM daily</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Mobile Usage</p>
                  <p className="text-xs text-gray-600">65% of traffic from mobile devices</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Top Category</p>
                  <p className="text-xs text-gray-600">Electronics leading in sales</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="analysis-period">Analysis Period</Label>
              <Select defaultValue="weekly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="insight-type">Focus Area</Label>
              <Select defaultValue="revenue">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="users">User Behavior</SelectItem>
                  <SelectItem value="products">Product Performance</SelectItem>
                  <SelectItem value="vendors">Vendor Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button>Generate Custom Insights</Button>
        </CardContent>
      </Card>
    </div>
  );
};
