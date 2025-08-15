
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Download, Eye } from 'lucide-react';

interface ExportPreviewProps {
  exportFormat: string;
  dateRange: string;
  selectedFields: string[];
  scheduleExport: boolean;
  setScheduleExport: (value: boolean) => void;
  frequency: string;
  setFrequency: (value: string) => void;
  emailNotification: boolean;
  setEmailNotification: (value: boolean) => void;
  handleExport: () => void;
}

export const ExportPreview: React.FC<ExportPreviewProps> = ({
  exportFormat,
  dateRange,
  selectedFields,
  scheduleExport,
  setScheduleExport,
  frequency,
  setFrequency,
  emailNotification,
  setEmailNotification,
  handleExport
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm space-y-1">
              <div><strong>Format:</strong> {exportFormat.toUpperCase()}</div>
              <div><strong>Date Range:</strong> {dateRange.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
              <div><strong>Fields:</strong> {selectedFields.length} selected</div>
              <div><strong>Est. Records:</strong> ~15,420</div>
              <div><strong>Est. Size:</strong> ~2.1 MB</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="schedule"
                checked={scheduleExport}
                onCheckedChange={(checked) => setScheduleExport(checked === true)}
              />
              <Label htmlFor="schedule" className="text-sm">Schedule this export</Label>
            </div>
            
            {scheduleExport && (
              <div className="space-y-2 ml-6">
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email"
                checked={emailNotification}
                onCheckedChange={(checked) => setEmailNotification(checked === true)}
              />
              <Label htmlFor="email" className="text-sm">Email when ready</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleExport} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export Now
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
