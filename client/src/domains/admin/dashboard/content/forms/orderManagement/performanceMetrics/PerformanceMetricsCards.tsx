
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { TrendingUp, TrendingDown, Clock, CheckCircle, Target, AlertCircle } from 'lucide-react';
import { OrderProcessingMetrics, OperationalKPIs, QualityMetrics } from './types';

interface PerformanceMetricsCardsProps {
  processingMetrics: OrderProcessingMetrics;
  operationalKPIs: OperationalKPIs;
  qualityMetrics: QualityMetrics;
}

export const PerformanceMetricsCards: React.FC<PerformanceMetricsCardsProps> = ({
  processingMetrics,
  operationalKPIs,
  qualityMetrics
}) => {
  const getStatusColor = (value: number, target: number) => {
    if (value >= target) return 'text-green-600';
    if (value >= target * 0.9) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, target: number) => {
    if (value >= target) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value >= target * 0.9) return <Target className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Processing Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{processingMetrics.avgProcessingTime}hrs</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
            <span className="text-green-600">-12% from last month</span>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">Target: 3.5hrs</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Order Fulfillment Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{processingMetrics.orderFulfillmentRate}%</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            <span className="text-green-600">+2.1% from last month</span>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">Target: 97.5%</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{processingMetrics.onTimeDeliveryRate}%</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
            <span className="text-red-600">-1.2% from last month</span>
          </div>
          <div className="mt-2">
            <Badge variant="destructive" className="text-xs">Below Target: 92%</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{processingMetrics.customerSatisfactionScore}/5</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            <span className="text-green-600">+0.1 from last month</span>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">Target: 4.7/5</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Operational KPIs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Order Velocity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{operationalKPIs.orderVelocity}/day</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            <span className="text-green-600">+8.5% from last month</span>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">Target: 900/day</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cost Per Order</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">৳{operationalKPIs.costPerOrder}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
            <span className="text-green-600">-৳3.20 from last month</span>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">Target: ৳42.00</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Staff Productivity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{operationalKPIs.staffProductivity}%</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            <span className="text-green-600">+3.2% from last month</span>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">Target: 95%</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Order Accuracy</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{qualityMetrics.orderAccuracy}%</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            <span className="text-green-600">+0.5% from last month</span>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">Target: 98.5%</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
