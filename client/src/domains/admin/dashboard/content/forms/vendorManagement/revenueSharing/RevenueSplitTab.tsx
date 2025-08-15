
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { PieChart, Split, Calculator, Save } from 'lucide-react';

export const RevenueSplitTab: React.FC = () => {
  const [splitConfig, setSplitConfig] = useState({
    platform: 15,
    vendor: 80,
    processing: 3,
    insurance: 1,
    tax: 1
  });

  const handleSplitChange = (key: string, value: number) => {
    setSplitConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const totalSplit = Object.values(splitConfig).reduce((acc, val) => acc + val, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Revenue Split Configuration</h3>
          <p className="text-gray-600">Define how revenue is distributed among stakeholders</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Split className="h-5 w-5 mr-2" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Platform Fee</Label>
                  <p className="text-xs text-gray-500">GetIt marketplace commission</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={splitConfig.platform}
                    onChange={(e) => handleSplitChange('platform', Number(e.target.value))}
                    className="w-16 h-8"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Vendor Share</Label>
                  <p className="text-xs text-gray-500">Vendor's revenue portion</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={splitConfig.vendor}
                    onChange={(e) => handleSplitChange('vendor', Number(e.target.value))}
                    className="w-16 h-8"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Processing Fee</Label>
                  <p className="text-xs text-gray-500">Payment processing costs</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={splitConfig.processing}
                    onChange={(e) => handleSplitChange('processing', Number(e.target.value))}
                    className="w-16 h-8"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Insurance</Label>
                  <p className="text-xs text-gray-500">Transaction insurance fund</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={splitConfig.insurance}
                    onChange={(e) => handleSplitChange('insurance', Number(e.target.value))}
                    className="w-16 h-8"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Tax Reserve</Label>
                  <p className="text-xs text-gray-500">Tax withholding</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={splitConfig.tax}
                    onChange={(e) => handleSplitChange('tax', Number(e.target.value))}
                    className="w-16 h-8"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Split:</span>
                <Badge variant={totalSplit === 100 ? 'default' : 'destructive'}>
                  {totalSplit}%
                </Badge>
              </div>
              {totalSplit !== 100 && (
                <p className="text-sm text-red-500 mt-1">
                  Total must equal 100%
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Split Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Transaction Amount (৳)</Label>
              <Input type="number" placeholder="1000" />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Revenue Distribution:</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Platform Fee ({splitConfig.platform}%):</span>
                  <span className="font-medium">৳{(1000 * splitConfig.platform / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Vendor Share ({splitConfig.vendor}%):</span>
                  <span className="font-medium">৳{(1000 * splitConfig.vendor / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing ({splitConfig.processing}%):</span>
                  <span className="font-medium">৳{(1000 * splitConfig.processing / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Insurance ({splitConfig.insurance}%):</span>
                  <span className="font-medium">৳{(1000 * splitConfig.insurance / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax Reserve ({splitConfig.tax}%):</span>
                  <span className="font-medium">৳{(1000 * splitConfig.tax / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
