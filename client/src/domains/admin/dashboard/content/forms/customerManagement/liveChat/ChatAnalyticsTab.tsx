
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ChatAnalytics } from './types';

interface ChatAnalyticsTabProps {
  analytics: ChatAnalytics;
}

export const ChatAnalyticsTab: React.FC<ChatAnalyticsTabProps> = ({ analytics }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Daily Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalChats" stroke="#3B82F6" name="Total Chats" />
              <Line type="monotone" dataKey="resolvedChats" stroke="#10B981" name="Resolved Chats" />
              <Line type="monotone" dataKey="customerSatisfaction" stroke="#F59E0B" name="Satisfaction" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Chat Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="chatCount" fill="#3B82F6" name="Chat Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Chat Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Total Chats</th>
                  <th className="text-left p-2">Percentage</th>
                  <th className="text-left p-2">Avg Resolution Time</th>
                </tr>
              </thead>
              <tbody>
                {analytics.categoryBreakdown.map((category, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{category.category}</td>
                    <td className="p-2">{category.count}</td>
                    <td className="p-2">{category.percentage}%</td>
                    <td className="p-2">{category.averageResolutionTime} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.agentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agentName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalChats" fill="#3B82F6" name="Total Chats" />
              <Bar dataKey="averageRating" fill="#10B981" name="Avg Rating" />
              <Bar dataKey="resolutionRate" fill="#F59E0B" name="Resolution Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Satisfaction Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Satisfaction Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.customerSatisfactionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="satisfaction" stroke="#10B981" name="Satisfaction Score" />
              <Line type="monotone" dataKey="responseTime" stroke="#3B82F6" name="Response Time (s)" />
              <Line type="monotone" dataKey="resolutionRate" stroke="#F59E0B" name="Resolution Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
