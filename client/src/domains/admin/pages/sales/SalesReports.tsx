import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  FileText, Download, Calendar, Filter, Printer, Mail, Clock,
  TrendingUp, TrendingDown, BarChart3, PieChart, Users, Package
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  generatedBy: string;
  size: string;
  status: 'ready' | 'processing' | 'scheduled';
  format: 'pdf' | 'excel' | 'csv';
}

export default function SalesReports() {
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Mock data - replace with API call
  const reports: Report[] = [
    {
      id: '1',
      name: 'Monthly Sales Summary - June 2025',
      type: 'Monthly Report',
      generatedAt: '2 hours ago',
      generatedBy: 'System',
      size: '2.4 MB',
      status: 'ready',
      format: 'pdf'
    },
    {
      id: '2',
      name: 'Product Performance Report',
      type: 'Product Analysis',
      generatedAt: '5 hours ago',
      generatedBy: 'Rafiqul Islam',
      size: '1.8 MB',
      status: 'ready',
      format: 'excel'
    },
    {
      id: '3',
      name: 'Regional Sales Breakdown Q2 2025',
      type: 'Regional Report',
      generatedAt: '1 day ago',
      generatedBy: 'System',
      size: '3.2 MB',
      status: 'ready',
      format: 'pdf'
    },
    {
      id: '4',
      name: 'Vendor Commission Report',
      type: 'Financial Report',
      generatedAt: 'Processing...',
      generatedBy: 'Fatema Begum',
      size: '-',
      status: 'processing',
      format: 'excel'
    },
    {
      id: '5',
      name: 'Customer Purchase Patterns',
      type: 'Customer Analysis',
      generatedAt: '3 days ago',
      generatedBy: 'System',
      size: '1.5 MB',
      status: 'ready',
      format: 'csv'
    },
    {
      id: '6',
      name: 'Tax Report - June 2025',
      type: 'Financial Report',
      generatedAt: 'Scheduled',
      generatedBy: 'System',
      size: '-',
      status: 'scheduled',
      format: 'pdf'
    }
  ];

  const reportTemplates = [
    {
      name: 'Daily Sales Report',
      description: 'Complete daily sales summary with hourly breakdown',
      icon: Calendar,
      fields: ['Date Range', 'Include Returns', 'Group by Category']
    },
    {
      name: 'Product Performance',
      description: 'Detailed analysis of product sales and profitability',
      icon: Package,
      fields: ['Product Category', 'Date Range', 'Minimum Sales']
    },
    {
      name: 'Customer Analytics',
      description: 'Customer purchase behavior and segmentation',
      icon: Users,
      fields: ['Customer Segment', 'Date Range', 'Include Demographics']
    },
    {
      name: 'Revenue Analysis',
      description: 'Comprehensive revenue breakdown by multiple dimensions',
      icon: BarChart3,
      fields: ['Dimension', 'Date Range', 'Comparison Period']
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      default:
        return null;
    }
  };

  const getFormatBadge = (format: string) => {
    const colors: Record<string, string> = {
      pdf: 'bg-red-100 text-red-800',
      excel: 'bg-green-100 text-green-800',
      csv: 'bg-blue-100 text-blue-800'
    };
    return <Badge className={colors[format] || 'bg-gray-100 text-gray-800'}>{format.toUpperCase()}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-indigo-600" />
              Sales Reports
            </h1>
            <p className="text-gray-600 mt-2">Generate and manage comprehensive sales reports</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <FileText className="h-4 w-4 mr-2" />
            Generate New Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Reports Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <p className="text-sm text-gray-500 mt-1">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <p className="text-sm text-gray-500 mt-1">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.8 GB</div>
              <p className="text-sm text-gray-500 mt-1">Storage used</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent">Recent Reports</TabsTrigger>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          </TabsList>

          {/* Recent Reports */}
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Generated Reports</CardTitle>
                    <CardDescription>Recently generated sales reports</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Report Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reports</SelectItem>
                        <SelectItem value="monthly">Monthly Reports</SelectItem>
                        <SelectItem value="product">Product Analysis</SelectItem>
                        <SelectItem value="regional">Regional Reports</SelectItem>
                        <SelectItem value="financial">Financial Reports</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Date Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="last7days">Last 7 days</SelectItem>
                        <SelectItem value="last30days">Last 30 days</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{report.name}</div>
                            <div className="text-sm text-gray-500">By {report.generatedBy} • {report.size}</div>
                          </div>
                        </TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {report.generatedAt}
                          </div>
                        </TableCell>
                        <TableCell>{getFormatBadge(report.format)}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {report.status === 'ready' && (
                              <>
                                <Button variant="ghost" size="icon">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Templates */}
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportTemplates.map((template) => (
                <Card key={template.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <template.icon className="h-8 w-8 text-indigo-600" />
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">Required Fields:</div>
                      <div className="flex flex-wrap gap-2">
                        {template.fields.map((field) => (
                          <Badge key={field} variant="outline">{field}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Scheduled Reports */}
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Automatically generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Weekly Sales Summary</h4>
                        <p className="text-sm text-gray-500 mt-1">Every Monday at 9:00 AM</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">PDF</Badge>
                          <Badge variant="outline">Email to managers</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit Schedule</Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Monthly Revenue Report</h4>
                        <p className="text-sm text-gray-500 mt-1">1st of every month at 12:00 AM</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">Excel</Badge>
                          <Badge variant="outline">Archive to cloud</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit Schedule</Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Quarterly Tax Report</h4>
                        <p className="text-sm text-gray-500 mt-1">Last day of quarter at 11:59 PM</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">PDF</Badge>
                          <Badge variant="outline">Finance team only</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit Schedule</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}