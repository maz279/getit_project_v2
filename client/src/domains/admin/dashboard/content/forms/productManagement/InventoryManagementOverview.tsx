
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';

export const InventoryManagementOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Levels Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>High Stock</span>
                  <span className="text-green-600">8,234 items</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Medium Stock</span>
                  <span className="text-yellow-600">2,156 items</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Low Stock</span>
                  <span className="text-red-600">89 items</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warehouse Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Main Warehouse</span>
                <Badge>65%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Secondary Warehouse</span>
                <Badge variant="secondary">25%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Vendor Storage</span>
                <Badge variant="outline">10%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reorder Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">23</div>
              <p className="text-sm text-gray-600">Products need reordering</p>
              <Button size="sm" className="mt-3">View Details</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
