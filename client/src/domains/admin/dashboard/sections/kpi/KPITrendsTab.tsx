
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Package } from 'lucide-react';

const monthlyTrendData = [
  { month: 'Jan', revenue: 2200000, customers: 15000, orders: 1200, aov: 1833, conversionRate: 3.2 },
  { month: 'Feb', revenue: 2400000, customers: 16500, orders: 1350, aov: 1778, conversionRate: 3.4 },
  { month: 'Mar', revenue: 2650000, customers: 18200, orders: 1450, aov: 1828, conversionRate: 3.6 },
  { month: 'Apr', revenue: 2750000, customers: 19500, orders: 1520, aov: 1809, conversionRate: 3.7 },
  { month: 'May', revenue: 2820000, customers: 20800, orders: 1580, aov: 1785, conversionRate: 3.8 },
  { month: 'Jun', revenue: 2850000, customers: 21500, orders: 1620, aov: 1759, conversionRate: 3.8 },
];

const categoryPerformanceData = [
  { category: 'Electronics', revenue: 1200000, target: 1100000, growth: 9.1 },
  { category: 'Fashion', revenue: 850000, target: 900000, growth: -5.6 },
  { category: 'Home & Garden', revenue: 450000, target: 500000, growth: -10.0 },
  { category: 'Sports', revenue: 350000, target: 400000, growth: -12.5 },
];

export const KPITrendsTab = () => {
  return (
    <div className="space-y-6">
      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            KPI Trends Over Time
          </CardTitle>
          <CardDescription>Historical performance tracking for key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: "Revenue (M)", color: "#8884d8" },
              customers: { label: "Customers (K)", color: "#82ca9d" },
              aov: { label: "AOV (K)", color: "#ffc658" },
              conversionRate: { label: "Conversion %", color: "#ff7c7c" }
            }}
            className="h-96"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#ff7c7c" strokeWidth={2} name="Conversion Rate" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance Analysis</CardTitle>
          <CardDescription>Revenue performance by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryPerformanceData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.category}</h3>
                    <p className="text-sm text-gray-500">Target: BDT {(category.target / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">BDT {(category.revenue / 1000).toFixed(0)}K</p>
                  <div className="flex items-center gap-1">
                    {category.growth > 0 ? 
                      <TrendingUp className="w-4 h-4 text-green-500" /> : 
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    }
                    <span className={`text-sm font-medium ${category.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(category.growth).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
