
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Zap, Users, Package, Store, FileText } from 'lucide-react';
import { EnhancedDashboardVisuals } from '../../EnhancedDashboardVisuals';

export const AnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Enhanced Visual Dashboard */}
      <EnhancedDashboardVisuals />
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
          <CardDescription>Frequently used administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Add User</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Package className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Product</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Store className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Vendor</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
