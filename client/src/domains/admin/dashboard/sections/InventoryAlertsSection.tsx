
import React from 'react';
import { 
  Package,
  Shield,
  FileText,
  AlertTriangle,
  XCircle,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

export const InventoryAlertsSection: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold flex items-center">
      <Package className="h-6 w-6 mr-2" />
      Inventory Alerts
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            Out of Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">23</div>
          <p className="text-sm text-red-600">Products</p>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-700 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Low Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">67</div>
          <p className="text-sm text-yellow-600">Products</p>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-700 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Needs Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">12</div>
          <p className="text-sm text-blue-600">Products</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Inventory Alert Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
            <Input id="low-stock-threshold" type="number" defaultValue="10" />
          </div>
          <div>
            <Label htmlFor="alert-frequency">Alert Frequency</Label>
            <Select defaultValue="daily">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button>Update Alert Settings</Button>
      </CardContent>
    </Card>
  </div>
);
