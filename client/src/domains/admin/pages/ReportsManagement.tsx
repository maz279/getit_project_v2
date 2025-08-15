/**
 * Reports Management Dashboard
 * Comprehensive report generation and management with Amazon.com/Shopee.sg-level features
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { 
  FileText, 
  Download, 
  Calendar, 
  Settings, 
  Play, 
  Pause, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  BarChart3,
  Users,
  ShoppingCart,
  Package
} from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

interface Report {
  id: string;
  name: string;
  type: string;
  format: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
  description?: string;
  sections: string[];
  period: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  defaultFormat: string;
  category: string;
}

const ReportsManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('generate');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newReportData, setNewReportData] = useState({
    name: '',
    description: '',
    type: 'comprehensive',
    format: 'excel',
    period: 'last30Days',
    sections: ['sales', 'customers', 'vendors', 'products'],
    includeCharts: true,
    includeBangladeshMetrics: true,
    scheduledGeneration: false,
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 'monday',
      time: '09:00'
    }
  });

  // Fetch reports list
  const { data: reportsData, isLoading: isReportsLoading, refetch: refetchReports } = useQuery({
    queryKey: ['/api/v1/analytics/reports/list'],
    enabled: true,
    refetchInterval: 30000
  });

  // Fetch report templates
  const { data: templatesData, isLoading: isTemplatesLoading } = useQuery({
    queryKey: ['/api/v1/analytics/reports/templates'],
    enabled: true
  });

  // Fetch scheduled reports
  const { data: scheduledData, isLoading: isScheduledLoading } = useQuery({
    queryKey: ['/api/v1/analytics/reports/scheduled'],
    enabled: true
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await fetch('/api/v1/analytics/reports/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Generation Started",
        description: "Your report is being generated and will be ready shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/analytics/reports/list'] });
      setNewReportData({
        name: '',
        description: '',
        type: 'comprehensive',
        format: 'excel',
        period: 'last30Days',
        sections: ['sales', 'customers', 'vendors', 'products'],
        includeCharts: true,
        includeBangladeshMetrics: true,
        scheduledGeneration: false,
        schedule: {
          frequency: 'weekly',
          dayOfWeek: 'monday',
          time: '09:00'
        }
      });
    },
    onError: () => {
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/v1/analytics/reports/${reportId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Deleted",
        description: "Report has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/analytics/reports/list'] });
    }
  });

  const typedReports = (reportsData as any)?.reports || [];
  const typedTemplates = (templatesData as any)?.templates || [];
  const typedScheduled = (scheduledData as any)?.scheduled || [];

  const handleGenerateReport = () => {
    generateReportMutation.mutate(newReportData);
  };

  const handleDeleteReport = (reportId: string) => {
    deleteReportMutation.mutate(reportId);
  };

  const handleDownloadReport = (report: Report) => {
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
    } else {
      toast({
        title: "Download Not Available",
        description: "Report download is not available yet.",
        variant: "destructive"
      });
    }
  };

  const handleSectionToggle = (section: string) => {
    setNewReportData(prev => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section]
    }));
  };

  const filteredReports = typedReports.filter((report: Report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'generating':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Reports Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Generate and manage comprehensive analytics reports
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setActiveTab('generate')}
              variant={activeTab === 'generate' ? 'default' : 'outline'}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="reports">My Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>

          {/* Generate Report Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Configuration */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Report Configuration</CardTitle>
                    <CardDescription>Configure your analytics report settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reportName">Report Name</Label>
                        <Input
                          id="reportName"
                          placeholder="Enter report name"
                          value={newReportData.name}
                          onChange={(e) => setNewReportData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reportType">Report Type</Label>
                        <Select 
                          value={newReportData.type} 
                          onValueChange={(value) => setNewReportData(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comprehensive">Comprehensive</SelectItem>
                            <SelectItem value="sales">Sales Only</SelectItem>
                            <SelectItem value="customers">Customers Only</SelectItem>
                            <SelectItem value="vendors">Vendors Only</SelectItem>
                            <SelectItem value="products">Products Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reportFormat">Format</Label>
                        <Select 
                          value={newReportData.format} 
                          onValueChange={(value) => setNewReportData(prev => ({ ...prev, format: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reportPeriod">Time Period</Label>
                        <Select 
                          value={newReportData.period} 
                          onValueChange={(value) => setNewReportData(prev => ({ ...prev, period: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="last7Days">Last 7 Days</SelectItem>
                            <SelectItem value="last30Days">Last 30 Days</SelectItem>
                            <SelectItem value="last90Days">Last 90 Days</SelectItem>
                            <SelectItem value="thisYear">This Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reportDescription">Description (Optional)</Label>
                      <Textarea
                        id="reportDescription"
                        placeholder="Enter report description"
                        value={newReportData.description}
                        onChange={(e) => setNewReportData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    {/* Sections Selection */}
                    <div className="space-y-3">
                      <Label>Report Sections</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'sales', label: 'Sales Analytics', icon: BarChart3 },
                          { id: 'customers', label: 'Customer Insights', icon: Users },
                          { id: 'vendors', label: 'Vendor Performance', icon: ShoppingCart },
                          { id: 'products', label: 'Product Analytics', icon: Package }
                        ].map((section) => (
                          <div key={section.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={section.id}
                              checked={newReportData.sections.includes(section.id)}
                              onCheckedChange={() => handleSectionToggle(section.id)}
                            />
                            <Label 
                              htmlFor={section.id} 
                              className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                            >
                              <section.icon className="h-4 w-4" />
                              {section.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-3">
                      <Label>Additional Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeCharts"
                            checked={newReportData.includeCharts}
                            onCheckedChange={(checked) => 
                              setNewReportData(prev => ({ ...prev, includeCharts: checked as boolean }))
                            }
                          />
                          <Label htmlFor="includeCharts" className="text-sm">Include Charts & Visualizations</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeBangladeshMetrics"
                            checked={newReportData.includeBangladeshMetrics}
                            onCheckedChange={(checked) => 
                              setNewReportData(prev => ({ ...prev, includeBangladeshMetrics: checked as boolean }))
                            }
                          />
                          <Label htmlFor="includeBangladeshMetrics" className="text-sm">Include Bangladesh-Specific Metrics</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Report Preview & Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Report Preview</CardTitle>
                    <CardDescription>Your report will include:</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Format</span>
                        <Badge variant="outline">{newReportData.format.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Period</span>
                        <Badge variant="outline">{newReportData.period}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sections</span>
                        <Badge variant="outline">{newReportData.sections.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Charts</span>
                        <Badge variant={newReportData.includeCharts ? "default" : "secondary"}>
                          {newReportData.includeCharts ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-4" 
                      onClick={handleGenerateReport}
                      disabled={!newReportData.name || newReportData.sections.length === 0 || generateReportMutation.isPending}
                    >
                      {generateReportMutation.isPending ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* My Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="generating">Generating</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reports List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredReports.map((report: Report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {report.description || `${report.type} report`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format:</span>
                          <span className="font-medium">{report.format.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Period:</span>
                          <span className="font-medium">{report.period}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {report.fileSize && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Size:</span>
                            <span className="font-medium">{report.fileSize}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        {report.status === 'completed' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleDownloadReport(report)}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={deleteReportMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Reports Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'No reports match your current filters.' 
                      : 'You haven\'t generated any reports yet.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {typedTemplates.map((template: ReportTemplate) => (
                <Card key={template.id} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Category:</span>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sections:</span>
                        <span className="font-medium">{template.sections.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium">{template.defaultFormat.toUpperCase()}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        setNewReportData(prev => ({
                          ...prev,
                          type: template.category,
                          format: template.defaultFormat,
                          sections: template.sections
                        }));
                        setActiveTab('generate');
                      }}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Scheduled Reports Tab */}
          <TabsContent value="scheduled" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>
                  Automatically generated reports based on your schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {typedScheduled.map((scheduled: any) => (
                    <div key={scheduled.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{scheduled.name}</h4>
                        <p className="text-sm text-gray-600">
                          {scheduled.frequency} • Next: {scheduled.nextRun}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={scheduled.active ? "default" : "secondary"}>
                          {scheduled.active ? "Active" : "Inactive"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportsManagement;