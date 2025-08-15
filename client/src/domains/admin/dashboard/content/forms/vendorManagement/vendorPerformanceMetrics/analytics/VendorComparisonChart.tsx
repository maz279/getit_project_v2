
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

const mockComparisonData = [
  { vendor: 'TechBD', score: 9.2, category: 'Electronics' },
  { vendor: 'Fashionista', score: 8.1, category: 'Fashion' },
  { vendor: 'HomeNeeds', score: 6.2, category: 'Home & Garden' },
  { vendor: 'SportsPro', score: 8.7, category: 'Sports' },
  { vendor: 'BookCorner', score: 8.9, category: 'Books' }
];

export const VendorComparisonChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Vendor Performance Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockComparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vendor" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="score" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
