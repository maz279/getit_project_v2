
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Edit, Eye, FileText, LogIn, Activity } from 'lucide-react';

// Activity analytics data
const activityAnalytics = [
  { hour: '00:00', logins: 12, failures: 2, actions: 45 },
  { hour: '04:00', logins: 8, failures: 1, actions: 23 },
  { hour: '08:00', logins: 156, failures: 8, actions: 234 },
  { hour: '12:00', logins: 234, failures: 15, actions: 456 },
  { hour: '16:00', logins: 189, failures: 12, actions: 378 },
  { hour: '20:00', logins: 98, failures: 5, actions: 189 }
];

const riskDistribution = [
  { name: 'Low Risk', value: 65, color: '#10b981' },
  { name: 'Medium Risk', value: 25, color: '#f59e0b' },
  { name: 'High Risk', value: 10, color: '#ef4444' }
];

const topActions = [
  { action: 'User Login', count: 1234, percentage: 35 },
  { action: 'Product View', count: 987, percentage: 28 },
  { action: 'Order Placed', count: 456, percentage: 13 },
  { action: 'Product Updated', count: 234, percentage: 7 },
  { action: 'User Registration', count: 189, percentage: 5 }
];

const getActionIcon = (action: string) => {
  if (action.includes('Login')) return <LogIn className="w-4 h-4" />;
  if (action.includes('Updated') || action.includes('Edit')) return <Edit className="w-4 h-4" />;
  if (action.includes('View')) return <Eye className="w-4 h-4" />;
  if (action.includes('Order')) return <FileText className="w-4 h-4" />;
  return <Activity className="w-4 h-4" />;
};

export const ActivityLogsAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Trends (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                logins: { label: "Logins", color: "#3b82f6" },
                failures: { label: "Failures", color: "#ef4444" },
                actions: { label: "Actions", color: "#10b981" }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="failures" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="actions" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Activities", color: "#8884d8" }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topActions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getActionIcon(item.action)}
                  <span className="font-medium">{item.action}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
