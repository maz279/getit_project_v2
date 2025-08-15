
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { AlertTriangle, TrendingDown, TrendingUp, Clock } from 'lucide-react';

const mockAlerts = [
  {
    id: 1,
    type: 'critical',
    title: 'Performance Drop Alert',
    message: '3 vendors showed significant performance decline this week',
    time: '2 hours ago'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Delivery Delays',
    message: 'Electronics category showing 15% increase in delivery times',
    time: '4 hours ago'
  },
  {
    id: 3,
    type: 'info',
    title: 'New Top Performer',
    message: 'BookCorner achieved excellent rating for 3 consecutive months',
    time: '1 day ago'
  }
];

const mockInsights = [
  {
    id: 1,
    type: 'positive',
    title: 'Overall Improvement',
    description: 'Average vendor score increased by 0.3 points this month',
    icon: TrendingUp
  },
  {
    id: 2,
    type: 'negative',
    title: 'Category Concern',
    description: 'Home & Garden category needs attention - 12% below target',
    icon: TrendingDown
  },
  {
    id: 3,
    type: 'neutral',
    title: 'Processing Time',
    description: 'Average order processing time stable at 1.2 days',
    icon: Clock
  }
];

export const AlertsInsightsPanel: React.FC = () => {
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Badge className={getAlertColor(alert.type)}>
                  {alert.type}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-medium">{alert.title}</h4>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInsights.map((insight) => (
              <div key={insight.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <insight.icon className={`h-5 w-5 ${getInsightColor(insight.type)}`} />
                <div className="flex-1">
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
