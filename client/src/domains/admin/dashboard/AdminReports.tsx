
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Calendar, Download, TrendingUp, Users, Package, ShoppingCart } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');

  const reportTypes = [
    {
      title: 'Sales Report',
      description: 'Comprehensive sales analytics and trends',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
      lastGenerated: '2 hours ago'
    },
    {
      title: 'Vendor Performance',
      description: 'Vendor sales, ratings, and performance metrics',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      lastGenerated: '1 day ago'
    },
    {
      title: 'Product Analytics',
      description: 'Best-selling products and category insights',
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
      lastGenerated: '3 hours ago'
    },
    {
      title: 'Order Analysis',
      description: 'Order patterns, fulfillment, and customer behavior',
      icon: ShoppingCart,
      color: 'bg-orange-50 text-orange-600',
      lastGenerated: '5 hours ago'
    }
  ];

  const recentReports = [
    {
      name: 'Monthly Sales Report - June 2024',
      type: 'Sales',
      generatedBy: 'System',
      date: '2024-06-30',
      status: 'completed',
      size: '2.4 MB'
    },
    {
      name: 'Vendor Performance Q2 2024',
      type: 'Vendor',
      generatedBy: 'Admin',
      date: '2024-06-28',
      status: 'completed',
      size: '1.8 MB'
    },
    {
      name: 'Product Analytics - Electronics',
      type: 'Product',
      generatedBy: 'Admin',
      date: '2024-06-25',
      status: 'completed',
      size: '3.2 MB'
    },
    {
      name: 'Customer Behavior Analysis',
      type: 'Customer',
      generatedBy: 'System',
      date: '2024-06-20',
      status: 'processing',
      size: '-'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="custom">Custom Range</option>
          </select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">৳38,50,000</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-xs text-green-600 mt-1">+15.2% vs last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">15,247</div>
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="text-xs text-blue-600 mt-1">+8.2% vs last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">1,234</div>
            <div className="text-sm text-gray-600">Active Vendors</div>
            <div className="text-xs text-purple-600 mt-1">+5.1% vs last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">45,678</div>
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="text-xs text-orange-600 mt-1">+12.8% vs last month</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report, index) => {
              const Icon = report.icon;
              return (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon size={24} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{report.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  <p className="text-xs text-gray-500 mb-3">Last: {report.lastGenerated}</p>
                  <Button size="sm" className="w-full">
                    Generate Report
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Report Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Generated By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Size</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{report.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{report.type}</Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {report.generatedBy}
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {report.date}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {report.size}
                    </td>
                    <td className="py-4 px-4">
                      {report.status === 'completed' ? (
                        <Button size="sm" variant="outline">
                          <Download size={14} className="mr-1" />
                          Download
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-500">Processing...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
