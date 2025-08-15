
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { TrendingUp, DollarSign, Users, Settings } from 'lucide-react';

export const RevenueSharingHeader: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Revenue Sharing Management</CardTitle>
              <p className="text-gray-600 mt-1">
                Comprehensive revenue sharing and commission management system
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <DollarSign className="h-3 w-3 mr-1" />
              Active Models: 12
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Users className="h-3 w-3 mr-1" />
              Enrolled Vendors: 1,247
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Global Settings
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
