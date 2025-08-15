
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export const RoleAnalytics: React.FC = () => {
  // Role analytics data
  const roleAnalytics = [
    { role: 'Super Admin', users: 3, activity: 95, risk: 100 },
    { role: 'Platform Admin', users: 8, activity: 88, risk: 85 },
    { role: 'Category Manager', users: 15, activity: 72, risk: 45 },
    { role: 'Customer Support', users: 45, activity: 85, risk: 20 },
    { role: 'Marketing Manager', users: 12, activity: 78, risk: 40 }
  ];

  const riskDistribution = [
    { name: 'High Risk', value: 11, color: '#ef4444' },
    { name: 'Medium Risk', value: 27, color: '#f59e0b' },
    { name: 'Low Risk', value: 45, color: '#10b981' }
  ];

  const permissionUsage = [
    { month: 'Jan', created: 12, modified: 8, deleted: 2 },
    { month: 'Feb', created: 15, modified: 12, deleted: 1 },
    { month: 'Mar', created: 18, modified: 15, deleted: 3 },
    { month: 'Apr', created: 22, modified: 18, deleted: 2 },
    { month: 'May', created: 25, modified: 20, deleted: 4 },
    { month: 'Jun', created: 28, modified: 22, deleted: 1 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                users: { label: "Users", color: "#8884d8" },
                activity: { label: "Activity %", color: "#82ca9d" },
                risk: { label: "Risk Level", color: "#ffc658" }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="users" fill="#8884d8" />
                </BarChart>
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
                value: { label: "Users", color: "#8884d8" }
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
          <CardTitle>Permission Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              created: { label: "Created", color: "#10b981" },
              modified: { label: "Modified", color: "#3b82f6" },
              deleted: { label: "Deleted", color: "#ef4444" }
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={permissionUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="created" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="modified" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="deleted" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
