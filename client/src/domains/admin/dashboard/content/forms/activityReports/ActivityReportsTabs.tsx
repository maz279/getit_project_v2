
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ActivityReportsCharts } from './ActivityReportsCharts';
import { peakHoursData, topPages, categoryBreakdown, deviceAnalytics } from './ActivityReportsData';

export const ActivityReportsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trends">Activity Trends</TabsTrigger>
        <TabsTrigger value="categories">Category Analysis</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="insights">AI Insights</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <ActivityReportsCharts />
        
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{page.page}</p>
                    <p className="text-sm text-gray-600">Avg. Time: {page.avgTime}</p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{page.views.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Total Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{page.uniqueViews.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Unique Views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trends" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Peak Activity Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                activities: { label: "Activities", color: "#3b82f6" }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="activities" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="categories" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryBreakdown.map((category, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{category.category}</p>
                    <p className="text-2xl font-bold text-gray-900">{category.count.toLocaleString()}</p>
                    <Badge variant="secondary" className="mt-2">
                      {category.percentage}% of total
                    </Badge>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceAnalytics.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium">{device.device.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{device.device}</p>
                      <p className="text-sm text-gray-600">{device.users.toLocaleString()} users</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{device.sessions.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{device.bounceRate}%</p>
                      <p className="text-xs text-gray-600">Bounce Rate</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="insights" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-blue-900">Peak Performance Insight</p>
                    <p className="text-sm text-blue-700 mt-1">User activity peaks between 6 PM - 8 PM, suggesting optimal time for promotions and new product launches.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-green-900">Engagement Trend</p>
                    <p className="text-sm text-green-700 mt-1">Mobile users show 23% higher engagement rates. Consider prioritizing mobile experience improvements.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-yellow-900">Opportunity Alert</p>
                    <p className="text-sm text-yellow-700 mt-1">Search activities increased by 45% but conversion decreased by 8%. Review search result relevancy.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
