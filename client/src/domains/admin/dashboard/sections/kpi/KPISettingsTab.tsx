
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Settings } from 'lucide-react';

export const KPISettingsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          KPI Configuration
        </CardTitle>
        <CardDescription>Customize KPI tracking and alert settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Alert Thresholds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Revenue Alert (% below target)</Label>
                <Input type="number" placeholder="10" className="mt-1" />
              </div>
              <div>
                <Label>Customer Metrics Alert</Label>
                <Input type="number" placeholder="15" className="mt-1" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Notification Settings</h3>
            <div className="space-y-3">
              {[
                'Daily KPI summary email',
                'Weekly performance report',
                'Goal achievement alerts',
                'Benchmark comparison updates',
                'Trend anomaly detection'
              ].map((setting, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">{setting}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Export Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Report Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Automated Reports</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button>Save Configuration</Button>
        </div>
      </CardContent>
    </Card>
  );
};
