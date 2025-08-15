
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Button } from '@/shared/ui/button';
import { Eye, MessageSquare, TrendingUp, AlertTriangle, Star, Clock, Package, Users } from 'lucide-react';
import { VendorPerformanceMetric } from './types';

interface PerformanceOverviewTabProps {
  metrics: VendorPerformanceMetric[];
}

export const PerformanceOverviewTab: React.FC<PerformanceOverviewTabProps> = ({ metrics }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'average': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 8) return 'text-blue-600';
    if (score >= 7) return 'text-yellow-600';
    if (score >= 6) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {metrics.map((vendor) => (
        <Card key={vendor.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {vendor.vendorName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">{vendor.businessName}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {vendor.vendorName} • {vendor.category} • Joined {new Date(vendor.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(vendor.status)}>
                  {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                </Badge>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(vendor.overallScore)}`}>
                    {vendor.overallScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Overall Score</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* KPI Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Order Fulfillment</span>
                  <span className="text-xs font-medium">{vendor.kpiScores.orderFulfillment.toFixed(1)}</span>
                </div>
                <Progress value={vendor.kpiScores.orderFulfillment * 10} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Customer Satisfaction</span>
                  <span className="text-xs font-medium">{vendor.kpiScores.customerSatisfaction.toFixed(1)}</span>
                </div>
                <Progress value={vendor.kpiScores.customerSatisfaction * 10} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Quality Score</span>
                  <span className="text-xs font-medium">{vendor.kpiScores.qualityScore.toFixed(1)}</span>
                </div>
                <Progress value={vendor.kpiScores.qualityScore * 10} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Delivery Performance</span>
                  <span className="text-xs font-medium">{vendor.kpiScores.deliveryPerformance.toFixed(1)}</span>
                </div>
                <Progress value={vendor.kpiScores.deliveryPerformance * 10} className="h-2" />
              </div>
            </div>

            {/* Monthly Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium">{vendor.monthlyMetrics.totalOrders.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Total Orders</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium">৳{(vendor.monthlyMetrics.totalRevenue / 1000000).toFixed(1)}M</div>
                  <div className="text-xs text-gray-600">Revenue</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="text-sm font-medium">{vendor.monthlyMetrics.customerRating.toFixed(1)}</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-sm font-medium">{vendor.monthlyMetrics.onTimeDelivery.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">On-Time</div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {vendor.alerts.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Active Alerts ({vendor.alerts.length})
                </h4>
                <div className="space-y-2">
                  {vendor.alerts.slice(0, 2).map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'critical' ? 'bg-red-50 border-red-400' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{alert.title}</div>
                          <div className="text-xs text-gray-600">{alert.message}</div>
                        </div>
                        {alert.actionRequired && (
                          <Badge variant="outline" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-xs text-gray-500">
                Last updated: {new Date(vendor.lastUpdated).toLocaleString()}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
