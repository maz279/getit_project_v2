
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'on-track' | 'at-risk' | 'behind';
}

interface KPIOverviewTabProps {
  filteredKPIs: KPIMetric[];
  getStatusColor: (status: string) => string;
  getTrendIcon: (trend: number) => JSX.Element;
}

export const KPIOverviewTab = ({
  filteredKPIs,
  getStatusColor,
  getTrendIcon
}: KPIOverviewTabProps) => {
  // Define chart data arrays once to avoid object-to-primitive conversion errors
  const priorityData = [
    { name: 'High Priority', value: 7, color: '#ff4d4f' },
    { name: 'Medium Priority', value: 4, color: '#faad14' },
    { name: 'Low Priority', value: 1, color: '#52c41a' }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredKPIs.slice(0, 8).map((kpi) => (
          <Card key={kpi.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">{kpi.name}</CardTitle>
                <Badge className={`text-xs ${getStatusColor(kpi.status)}`}>
                  {kpi.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {kpi.unit === 'BDT' ? `${(kpi.value / 1000).toFixed(0)}K` : kpi.value.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">{kpi.unit !== 'BDT' ? kpi.unit : ''}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Target: {kpi.unit === 'BDT' ? `${(kpi.target / 1000).toFixed(0)}K` : kpi.target.toLocaleString()}</span>
                    <span>{((kpi.value / kpi.target) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(kpi.value / kpi.target) * 100} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(kpi.trend)}
                    <span className={`text-xs font-medium ${kpi.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(kpi.trend).toFixed(1)}%
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {kpi.category}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            KPI Performance Matrix
          </CardTitle>
          <CardDescription>Performance vs Target achievement across all KPIs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Achievement Rate by Category</h3>
              <ChartContainer
                config={{
                  achievement: { label: "Achievement %", color: "#8884d8" }
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { category: 'Revenue', achievement: 85.2, target: 100 },
                    { category: 'Customer', achievement: 72.8, target: 100 },
                    { category: 'Operations', achievement: 68.5, target: 100 },
                    { category: 'Marketing', achievement: 78.9, target: 100 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="achievement" fill="#8884d8" />
                    <Bar dataKey="target" fill="#e0e0e0" opacity={0.3} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Priority Distribution</h3>
              <ChartContainer
                config={{
                  high: { label: "High Priority", color: "#ff4d4f" },
                  medium: { label: "Medium Priority", color: "#faad14" },
                  low: { label: "Low Priority", color: "#52c41a" }
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
