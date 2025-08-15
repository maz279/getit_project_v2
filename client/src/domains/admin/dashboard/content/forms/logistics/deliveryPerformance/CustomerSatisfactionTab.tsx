
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomerSatisfaction } from './types';
import { Star } from 'lucide-react';

interface CustomerSatisfactionTabProps {
  data: CustomerSatisfaction;
}

export const CustomerSatisfactionTab: React.FC<CustomerSatisfactionTabProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-8 w-8 text-yellow-500 fill-current" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{data.rating}/5.0</div>
            <div className="text-sm text-gray-600">Overall Rating</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{data.totalReviews.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {Math.round((data.positiveReviews / data.totalReviews) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Positive Reviews</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📈 Rating Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[4, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">⚠️ Common Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.commonComplaints.map((complaint, idx) => (
                <li key={idx} className="text-sm text-red-600">• {complaint}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">💡 Improvement Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.improvements.map((improvement, idx) => (
                <li key={idx} className="text-sm text-green-600">• {improvement}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
