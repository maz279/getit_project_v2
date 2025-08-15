
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Star, Users, Calendar } from 'lucide-react';

export const RatingAnalyticsTab: React.FC = () => {
  const ratingDistribution = [
    { rating: '5 Stars', count: 18234, percentage: 40 },
    { rating: '4 Stars', count: 12456, percentage: 27 },
    { rating: '3 Stars', count: 8967, percentage: 20 },
    { rating: '2 Stars', count: 3456, percentage: 8 },
    { rating: '1 Star', count: 2565, percentage: 5 }
  ];

  const monthlyTrends = [
    { month: 'Jan', reviews: 3456, avgRating: 4.2, satisfaction: 85 },
    { month: 'Feb', reviews: 3789, avgRating: 4.1, satisfaction: 83 },
    { month: 'Mar', reviews: 4123, avgRating: 4.3, satisfaction: 87 },
    { month: 'Apr', reviews: 3967, avgRating: 4.4, satisfaction: 89 },
    { month: 'May', reviews: 4234, avgRating: 4.3, satisfaction: 86 },
    { month: 'Jun', reviews: 4567, avgRating: 4.5, satisfaction: 91 }
  ];

  const categoryRatings = [
    { category: 'Electronics', avgRating: 4.3, totalReviews: 12456 },
    { category: 'Fashion', avgRating: 4.1, totalReviews: 9876 },
    { category: 'Home & Garden', avgRating: 4.2, totalReviews: 8765 },
    { category: 'Sports', avgRating: 4.4, totalReviews: 6543 },
    { category: 'Books', avgRating: 4.6, totalReviews: 5432 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">4.3</p>
                <p className="text-xs text-green-600">+0.2 vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Reviewers</p>
                <p className="text-2xl font-bold">12.4k</p>
                <p className="text-xs text-green-600">+8% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-xs text-green-600">+3% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Review Rate</p>
                <p className="text-2xl font-bold">23%</p>
                <p className="text-xs text-red-600">-1% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution (Pie)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Review Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="reviews" fill="#8884d8" name="Total Reviews" />
              <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="#82ca9d" name="Average Rating" />
              <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#ffc658" name="Satisfaction %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Rating Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryRatings.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600">{category.category.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{category.category}</h4>
                    <p className="text-sm text-gray-500">{category.totalReviews.toLocaleString()} reviews</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-bold">{category.avgRating.toFixed(1)}</span>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(category.avgRating / 5) * 100}%` }}
                    ></div>
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
