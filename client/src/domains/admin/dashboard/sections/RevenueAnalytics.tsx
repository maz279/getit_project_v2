
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { DollarSign, ArrowUp, ArrowDown } from 'lucide-react';

interface RevenueAnalyticsProps {
  selectedTimeRange: string;
  setSelectedTimeRange: (value: string) => void;
}

export const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({
  selectedTimeRange,
  setSelectedTimeRange
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <DollarSign className="h-6 w-6 mr-2" />
          Revenue Analytics
        </h2>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">1 Day</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Revenue</CardTitle>
            <CardDescription>Current period earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">৳1,245,890</div>
            <div className="flex items-center mt-2">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500 text-sm">+12.5% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commission Earned</CardTitle>
            <CardDescription>Platform commission</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">৳186,884</div>
            <div className="flex items-center mt-2">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500 text-sm">+8.2% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avg. Order Value</CardTitle>
            <CardDescription>Per order revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">৳2,450</div>
            <div className="flex items-center mt-2">
              <ArrowDown className="h-4 w-4 text-red-500" />
              <span className="text-red-500 text-sm">-2.1% vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Configuration</CardTitle>
          <CardDescription>Adjust commission rates and fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commission-rate">Default Commission Rate (%)</Label>
              <Input id="commission-rate" type="number" defaultValue="15" />
            </div>
            <div>
              <Label htmlFor="platform-fee">Platform Fee (৳)</Label>
              <Input id="platform-fee" type="number" defaultValue="50" />
            </div>
          </div>
          <Button>Update Revenue Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};
