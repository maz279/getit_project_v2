
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { Download, FileText, Calendar as CalendarIcon, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const ExportReportsTab: React.FC = () => {
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedReports, setSelectedReports] = useState<string[]>(['sales', 'orders']);
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  const reportTypes = [
    { id: 'sales', label: 'Sales Reports', description: 'Revenue, trends, and performance metrics' },
    { id: 'orders', label: 'Order Analytics', description: 'Order status, fulfillment, and processing data' },
    { id: 'customers', label: 'Customer Insights', description: 'Customer behavior and segmentation' },
    { id: 'products', label: 'Product Performance', description: 'Product sales and inventory data' },
    { id: 'geographic', label: 'Geographic Analysis', description: 'Regional sales and shipping data' },
    { id: 'trends', label: 'Trend Analysis', description: 'Historical trends and forecasts' }
  ];

  const handleReportToggle = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Export Reports & Data</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Export Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Export Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF Report (.pdf)</SelectItem>
                  <SelectItem value="json">JSON Data (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, "PPP") : <span>Pick start date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, "PPP") : <span>Pick end date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button variant="outline" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Options
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Select Reports to Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportTypes.map((report) => (
                <div key={report.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={report.id}
                    checked={selectedReports.includes(report.id)}
                    onCheckedChange={() => handleReportToggle(report.id)}
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={report.id} 
                      className="text-sm font-medium cursor-pointer"
                    >
                      {report.label}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>💾 Export Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="w-full" size="lg">
              <Download className="h-5 w-5 mr-2" />
              Export Selected Reports
            </Button>
            <Button variant="outline" className="w-full" size="lg">
              <FileText className="h-5 w-5 mr-2" />
              Generate Summary Report
            </Button>
            <Button variant="outline" className="w-full" size="lg">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Schedule Export
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Export Summary</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Format: {exportFormat.toUpperCase()}</p>
              <p>• Date Range: {dateRange === 'custom' ? 'Custom range' : dateRange}</p>
              {dateRange === 'custom' && customStartDate && customEndDate && (
                <p>• Custom Range: {format(customStartDate, "PPP")} to {format(customEndDate, "PPP")}</p>
              )}
              <p>• Selected Reports: {selectedReports.length} of {reportTypes.length}</p>
              <p>• Estimated file size: ~2.5 MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
