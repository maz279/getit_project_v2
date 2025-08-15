
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeAnalysis } from './types';

interface TimeAnalysisTabProps {
  data: TimeAnalysis[];
}

export const TimeAnalysisTab: React.FC<TimeAnalysisTabProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>⏰ Delivery Performance by Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="deliveries" fill="#3b82f6" />
              <Bar dataKey="onTimeRate" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
