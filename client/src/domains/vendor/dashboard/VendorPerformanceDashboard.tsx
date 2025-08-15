/**
 * Vendor Performance Dashboard - Amazon.com/Shopee.sg Level
 * Complete performance tracking and management interface
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Separator } from '@/shared/ui/separator';
import { 
  TrendingUp, TrendingDown, Target, Award, AlertCircle, CheckCircle, 
  Star, Clock, Package, Users, DollarSign, Calendar, BarChart3, Settings
} from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';

interface VendorPerformanceDashboardProps {
  vendorId: string;
}

export const VendorPerformanceDashboard: React.FC<VendorPerformanceDashboardProps> = ({ vendorId }) => {
  const [loading, setLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [targets, setTargets] = useState({
    fulfillmentRateTarget: 95,
    customerRatingTarget: 4.0,
    responseTimeTarget: 2,
    returnRateTarget: 8,
    onTimeDeliveryTarget: 92
  });

  // Mock performance data (would come from API)
  const mockPerformanceData = {
    current: {
      metrics: {
        fulfillmentRate: 94.5,
        customerRating: 4.2,
        responseTime: 1.8,
        returnRate: 6.2,
        onTimeDelivery: 93.8,
        totalOrders: 1247,
        totalReviews: 856
      },
      tier: 'gold',
      commissionRate: '8.0',
      status: 'good'
    },
    historical: {
      metrics: [
        { date: '2025-06-01', score: 82.5 },
        { date: '2025-06-15', score: 85.2 },
        { date: '2025-07-01', score: 88.1 },
        { date: '2025-07-07', score: 89.3 }
      ],
      trends: { direction: 'improving', change: 3.2 }
    },
    benchmarks: {
      platform: {
        fulfillmentRate: 92.1,
        customerRating: 3.9,
        responseTime: 3.2,
        returnRate: 8.1,
        onTimeDelivery: 89.5
      },
      industry: {
        fulfillmentRate: 90.8,
        customerRating: 3.7,
        responseTime: 4.1,
        returnRate: 9.3,
        onTimeDelivery: 87.2
      },
      topPerformers: {
        fulfillmentRate: 98.7,
        customerRating: 4.7,
        responseTime: 1.1,
        returnRate: 2.8,
        onTimeDelivery: 97.1
      }
    },
    insights: {
      strengths: ['High customer satisfaction', 'Fast response times', 'Low return rate'],
      improvementAreas: ['Fulfillment rate consistency', 'On-time delivery optimization'],
      recommendations: [
        'Consider automation for inventory management',
        'Partner with reliable shipping providers',
        'Implement quality control processes'
      ]
    },
    alerts: [
      {
        type: 'warning',
        title: 'Fulfillment Rate Alert',
        message: 'Your fulfillment rate has dropped below 95% this week',
        createdAt: '2025-07-05'
      },
      {
        type: 'success',
        title: 'Customer Rating Achievement',
        message: 'Congratulations! You maintained 4.0+ rating for 30 days',
        createdAt: '2025-07-03'
      }
    ],
    nextReview: '2025-07-14'
  };

  useEffect(() => {
    setPerformanceData(mockPerformanceData);
  }, [vendorId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'very_good': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'needs_improvement': return 'bg-orange-100 text-orange-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculatePerformanceScore = (metrics: any) => {
    if (!metrics) return 0;
    
    // Weighted scoring based on Amazon.com/Shopee.sg standards
    const scores = {
      fulfillment: Math.min(metrics.fulfillmentRate / 95 * 100, 100),
      rating: Math.min(metrics.customerRating / 4.5 * 100, 100),
      response: Math.max((6 - metrics.responseTime) / 6 * 100, 0),
      returns: Math.max((15 - metrics.returnRate) / 15 * 100, 0),
      delivery: Math.min(metrics.onTimeDelivery / 95 * 100, 100)
    };

    return (scores.fulfillment + scores.rating + scores.response + scores.returns + scores.delivery) / 5;
  };

  const handleUpdateTargets = async () => {
    setLoading(true);
    try {
      // API call to update performance targets
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast({
        title: "Performance Targets Updated",
        description: "Your performance targets have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update performance targets.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!performanceData) {
    return <div className="flex justify-center items-center h-64">Loading performance data...</div>;
  }

  const overallScore = calculatePerformanceScore(performanceData.current.metrics);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-gray-600">Monitor and improve your vendor performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getTierColor(performanceData.current.tier)}>
            {performanceData.current.tier.toUpperCase()} TIER
          </Badge>
          <Badge className={getStatusColor(performanceData.current.status)}>
            {performanceData.current.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Alerts */}
      {performanceData.alerts.length > 0 && (
        <div className="space-y-2">
          {performanceData.alerts.map((alert, index) => (
            <Alert key={index} className={alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
              {alert.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="targets">Set Targets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallScore.toFixed(1)}%</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {performanceData.historical.trends.direction === 'improving' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span>+{performanceData.historical.trends.change}% this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.current.commissionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {performanceData.current.tier} tier rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.current.metrics.customerRating}</div>
                <p className="text-xs text-muted-foreground">
                  Based on {performanceData.current.metrics.totalReviews} reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.current.metrics.totalOrders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime orders processed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Your current performance across key areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Order Fulfillment</span>
                    <span className="text-sm">{performanceData.current.metrics.fulfillmentRate}%</span>
                  </div>
                  <Progress value={performanceData.current.metrics.fulfillmentRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">On-time Delivery</span>
                    <span className="text-sm">{performanceData.current.metrics.onTimeDelivery}%</span>
                  </div>
                  <Progress value={performanceData.current.metrics.onTimeDelivery} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Customer Rating</span>
                    <span className="text-sm">{performanceData.current.metrics.customerRating}/5.0</span>
                  </div>
                  <Progress value={(performanceData.current.metrics.customerRating / 5) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Return Rate</span>
                    <span className="text-sm">{performanceData.current.metrics.returnRate}%</span>
                  </div>
                  <Progress value={100 - performanceData.current.metrics.returnRate * 5} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Response Time</span>
                    <span className="text-sm">{performanceData.current.metrics.responseTime}h avg</span>
                  </div>
                  <Progress value={Math.max(100 - performanceData.current.metrics.responseTime * 15, 0)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>AI-powered recommendations for improvement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {performanceData.insights.strengths.map((strength, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-orange-600 mb-2">Areas for Improvement</h4>
                  <ul className="space-y-1">
                    {performanceData.insights.improvementAreas.map((area, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <Target className="h-3 w-3 text-orange-500" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-blue-600 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {performanceData.insights.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <Award className="h-3 w-3 text-blue-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(performanceData.current.metrics).map(([key, value]) => {
              if (key === 'totalOrders' || key === 'totalReviews') return null;
              
              const formatValue = () => {
                if (key === 'customerRating') return `${value}/5.0`;
                if (key === 'responseTime') return `${value}h`;
                return `${value}%`;
              };

              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatValue()}</div>
                    <Progress 
                      value={key === 'returnRate' ? 100 - (value as number) * 5 : 
                             key === 'responseTime' ? Math.max(100 - (value as number) * 15, 0) :
                             key === 'customerRating' ? ((value as number) / 5) * 100 : 
                             value as number} 
                      className="h-2 mt-2" 
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Average</CardTitle>
                <CardDescription>Compare with all vendors on GetIt</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(performanceData.benchmarks.platform).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium">
                      {key === 'customerRating' ? `${value}/5.0` : 
                       key === 'responseTime' ? `${value}h` : `${value}%`}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Industry Average</CardTitle>
                <CardDescription>Compare with your business category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(performanceData.benchmarks.industry).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium">
                      {key === 'customerRating' ? `${value}/5.0` : 
                       key === 'responseTime' ? `${value}h` : `${value}%`}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Best-in-class vendor performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(performanceData.benchmarks.topPerformers).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium text-green-600">
                      {key === 'customerRating' ? `${value}/5.0` : 
                       key === 'responseTime' ? `${value}h` : `${value}%`}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Performance Targets
              </CardTitle>
              <CardDescription>
                Set your performance goals to track progress and unlock better commission rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fulfillmentTarget">Fulfillment Rate Target (%)</Label>
                  <Input
                    id="fulfillmentTarget"
                    type="number"
                    min="80"
                    max="100"
                    value={targets.fulfillmentRateTarget}
                    onChange={(e) => setTargets(prev => ({ ...prev, fulfillmentRateTarget: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ratingTarget">Customer Rating Target (1-5)</Label>
                  <Input
                    id="ratingTarget"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={targets.customerRatingTarget}
                    onChange={(e) => setTargets(prev => ({ ...prev, customerRatingTarget: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responseTarget">Response Time Target (hours)</Label>
                  <Input
                    id="responseTarget"
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={targets.responseTimeTarget}
                    onChange={(e) => setTargets(prev => ({ ...prev, responseTimeTarget: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnTarget">Return Rate Target (%)</Label>
                  <Input
                    id="returnTarget"
                    type="number"
                    min="0"
                    max="20"
                    value={targets.returnRateTarget}
                    onChange={(e) => setTargets(prev => ({ ...prev, returnRateTarget: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryTarget">On-time Delivery Target (%)</Label>
                  <Input
                    id="deliveryTarget"
                    type="number"
                    min="80"
                    max="100"
                    value={targets.onTimeDeliveryTarget}
                    onChange={(e) => setTargets(prev => ({ ...prev, onTimeDeliveryTarget: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <Button onClick={handleUpdateTargets} disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Update Performance Targets'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Next Review */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Next Performance Review</span>
          </div>
          <Badge variant="outline">{performanceData.nextReview}</Badge>
        </CardContent>
      </Card>
    </div>
  );
};