
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { PerformanceTrend, BenchmarkComparison } from './types';

interface PerformanceOverviewTabProps {
  trends: PerformanceTrend[];
  benchmarks: BenchmarkComparison[];
}

export const PerformanceOverviewTab: React.FC<PerformanceOverviewTabProps> = ({ trends, benchmarks }) => {
  const radarData = [
    { metric: 'Processing', value: 97, fullMark: 100 },
    { metric: 'Fulfillment', value: 97, fullMark: 100 },
    { metric: 'Delivery', value: 89, fullMark: 100 },
    { metric: 'Satisfaction', value: 92, fullMark: 100 },
    { metric: 'Quality', value: 98, fullMark: 100 },
    { metric: 'Compliance', value: 99, fullMark: 100 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📈 Performance Trends (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="processing" stroke="#3b82f6" strokeWidth={2} name="Processing" />
                <Line type="monotone" dataKey="fulfillment" stroke="#10b981" strokeWidth={2} name="Fulfillment" />
                <Line type="monotone" dataKey="delivery" stroke="#f59e0b" strokeWidth={2} name="Delivery" />
                <Line type="monotone" dataKey="quality" stroke="#ef4444" strokeWidth={2} name="Quality" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Current Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📊 Benchmark Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={benchmarks} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="metric" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="ourValue" fill="#3b82f6" name="Our Value" />
              <Bar dataKey="industryAverage" fill="#10b981" name="Industry Average" />
              <Bar dataKey="topPerformer" fill="#f59e0b" name="Top Performer" />
              <Bar dataKey="target" fill="#ef4444" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📋 Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {benchmarks.map((benchmark, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{benchmark.metric}</h4>
                    <span className={`text-sm font-medium ${
                      benchmark.gap > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {benchmark.gap > 0 ? '+' : ''}{benchmark.gap.toFixed(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current</p>
                      <p className="font-bold">{benchmark.ourValue}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Target</p>
                      <p className="font-bold">{benchmark.target}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(benchmark.ourValue / benchmark.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800">Strengths</h4>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Order accuracy above industry average</li>
                  <li>• Cost per order below target</li>
                  <li>• Quality metrics exceeding benchmarks</li>
                  <li>• Compliance score at 99%</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Areas for Improvement</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• On-time delivery rate below target</li>
                  <li>• Processing time needs optimization</li>
                  <li>• Warehouse utilization can be improved</li>
                  <li>• Customer satisfaction target not met</li>
                </ul>
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800">Critical Actions Needed</h4>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Implement delivery time optimization</li>
                  <li>• Review and enhance quality processes</li>
                  <li>• Increase staff training frequency</li>
                  <li>• Upgrade warehouse management system</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
