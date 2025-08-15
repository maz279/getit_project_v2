
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { CLVTrendData, CLVSegmentData, CLVAnalytics } from './types';

interface CLVOverviewTabProps {
  trendData: CLVTrendData[];
  segmentData: CLVSegmentData[];
  analytics: CLVAnalytics;
}

export const CLVOverviewTab: React.FC<CLVOverviewTabProps> = ({
  trendData,
  segmentData,
  analytics
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CLV Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ averageCLV: {}, totalCLV: {} }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="averageCLV" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="newCustomerCLV" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Segment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ count: {} }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="count"
                    data={segmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                  >
                    {segmentData.map((entry, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CLV by Marketing Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ averageCLV: {} }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.clvByChannel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="averageCLV" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CLV by Product Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ averageCLV: {} }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.clvByCategory} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="averageCLV" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Cohort</th>
                  <th className="text-center p-3">Month 0</th>
                  <th className="text-center p-3">Month 1</th>
                  <th className="text-center p-3">Month 3</th>
                  <th className="text-center p-3">Month 6</th>
                  <th className="text-center p-3">Month 12</th>
                </tr>
              </thead>
              <tbody>
                {analytics.cohortAnalysis.map((cohort, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3 font-medium">{cohort.cohort}</td>
                    <td className="text-center p-3">{cohort.month0}%</td>
                    <td className="text-center p-3">{cohort.month1}%</td>
                    <td className="text-center p-3">{cohort.month3 || '-'}%</td>
                    <td className="text-center p-3">{cohort.month6 || '-'}%</td>
                    <td className="text-center p-3">{cohort.month12 || '-'}%</td>
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
