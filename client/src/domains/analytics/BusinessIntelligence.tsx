/**
 * Business Intelligence Dashboard - Phase 4 Implementation
 * Amazon.com/Shopee.sg-Level Executive Analytics & Strategic Insights
 * 
 * @fileoverview Complete business intelligence platform with KPI monitoring
 * @author GetIt Platform Team
 * @version 4.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ExecutiveMetrics {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    target: number;
    forecast: number;
  };
  customers: {
    total: number;
    active: number;
    new: number;
    churn: number;
    ltv: number;
  };
  operations: {
    orders: number;
    fulfillment: number;
    inventory: number;
    returns: number;
    satisfaction: number;
  };
  market: {
    share: number;
    competition: number;
    growth: number;
    opportunities: number;
  };
}

interface KPIMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'financial' | 'customer' | 'operational' | 'strategic';
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface MarketIntelligence {
  competitors: Array<{
    name: string;
    marketShare: number;
    strength: string;
    weakness: string;
  }>;
  trends: Array<{
    category: string;
    trend: string;
    impact: 'high' | 'medium' | 'low';
    opportunity: string;
  }>;
  threats: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    timeline: string;
    mitigation: string;
  }>;
}

export default function BusinessIntelligence() {
  const [timeRange, setTimeRange] = useState('30d');
  const [metrics, setMetrics] = useState<ExecutiveMetrics>({
    revenue: {
      current: 15223000,
      previous: 12845000,
      growth: 18.5,
      target: 18000000,
      forecast: 19500000
    },
    customers: {
      total: 125000,
      active: 89500,
      new: 5420,
      churn: 2.3,
      ltv: 12500
    },
    operations: {
      orders: 28470,
      fulfillment: 96.8,
      inventory: 82.4,
      returns: 3.2,
      satisfaction: 4.6
    },
    market: {
      share: 23.4,
      competition: 67.8,
      growth: 15.2,
      opportunities: 8
    }
  });

  const [kpis, setKpis] = useState<KPIMetric[]>([
    {
      name: 'Monthly Revenue',
      value: 152.2,
      target: 180.0,
      unit: 'Lakh BDT',
      trend: 'up',
      category: 'financial',
      status: 'good'
    },
    {
      name: 'Customer Acquisition Cost',
      value: 285,
      target: 250,
      unit: 'BDT',
      trend: 'up',
      category: 'customer',
      status: 'warning'
    },
    {
      name: 'Order Fulfillment Rate',
      value: 96.8,
      target: 98.0,
      unit: '%',
      trend: 'up',
      category: 'operational',
      status: 'good'
    },
    {
      name: 'Market Share',
      value: 23.4,
      target: 25.0,
      unit: '%',
      trend: 'up',
      category: 'strategic',
      status: 'good'
    },
    {
      name: 'Customer Lifetime Value',
      value: 125,
      target: 150,
      unit: 'K BDT',
      trend: 'up',
      category: 'customer',
      status: 'excellent'
    },
    {
      name: 'Net Promoter Score',
      value: 67,
      target: 70,
      unit: 'points',
      trend: 'stable',
      category: 'customer',
      status: 'good'
    }
  ]);

  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligence>({
    competitors: [
      {
        name: 'Daraz Bangladesh',
        marketShare: 45.2,
        strength: 'Alibaba backing, wide reach',
        weakness: 'User experience issues'
      },
      {
        name: 'Chaldal',
        marketShare: 18.5,
        strength: 'Grocery specialization',
        weakness: 'Limited product range'
      },
      {
        name: 'Pickaboo',
        marketShare: 8.7,
        strength: 'Electronics focus',
        weakness: 'Small market presence'
      },
      {
        name: 'Others',
        marketShare: 4.2,
        strength: 'Niche markets',
        weakness: 'Fragmented presence'
      }
    ],
    trends: [
      {
        category: 'Mobile Commerce',
        trend: 'Rapid growth in mobile-first shopping',
        impact: 'high',
        opportunity: 'Optimize mobile experience for 80%+ mobile users'
      },
      {
        category: 'Social Commerce',
        trend: 'Facebook/Instagram shopping integration',
        impact: 'high',
        opportunity: 'Expand social selling channels'
      },
      {
        category: 'Digital Payments',
        trend: 'bKash, Nagad adoption increasing',
        impact: 'medium',
        opportunity: 'Integrate more payment methods'
      }
    ],
    threats: [
      {
        type: 'New Market Entrant',
        severity: 'medium',
        timeline: '6-12 months',
        mitigation: 'Strengthen customer loyalty programs'
      },
      {
        type: 'Supply Chain Disruption',
        severity: 'high',
        timeline: '3-6 months',
        mitigation: 'Diversify supplier base'
      }
    ]
  });

  const [selectedKpiCategory, setSelectedKpiCategory] = useState<string>('all');

  /**
   * Update business intelligence metrics
   */
  const updateMetrics = useCallback(() => {
    setMetrics(prev => ({
      revenue: {
        ...prev.revenue,
        current: prev.revenue.current + Math.floor(Math.random() * 50000),
        growth: Math.max(0, prev.revenue.growth + (Math.random() - 0.5) * 2)
      },
      customers: {
        ...prev.customers,
        new: prev.customers.new + Math.floor(Math.random() * 50),
        active: prev.customers.active + Math.floor(Math.random() * 100),
        churn: Math.max(0, prev.customers.churn + (Math.random() - 0.5) * 0.2)
      },
      operations: {
        ...prev.operations,
        orders: prev.operations.orders + Math.floor(Math.random() * 100),
        fulfillment: Math.min(100, prev.operations.fulfillment + (Math.random() - 0.3) * 1),
        satisfaction: Math.min(5, prev.operations.satisfaction + (Math.random() - 0.4) * 0.1)
      },
      market: {
        ...prev.market,
        share: Math.min(30, prev.market.share + (Math.random() - 0.4) * 0.5),
        growth: Math.max(0, prev.market.growth + (Math.random() - 0.5) * 2)
      }
    }));

    // Update KPI values
    setKpis(prev => prev.map(kpi => ({
      ...kpi,
      value: kpi.value + (Math.random() - 0.5) * (kpi.value * 0.02),
      trend: Math.random() > 0.7 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down'
    })));
  }, []);

  /**
   * Get KPI status color
   */
  const getKpiStatusColor = (status: string): string => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  /**
   * Get trend icon
   */
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  /**
   * Filter KPIs by category
   */
  const filteredKpis = selectedKpiCategory === 'all' 
    ? kpis 
    : kpis.filter(kpi => kpi.category === selectedKpiCategory);

  /**
   * Format currency
   */
  const formatCurrency = (amount: number): string => {
    return `৳${amount.toLocaleString('en-BD')}`;
  };

  /**
   * Initialize dashboard
   */
  useEffect(() => {
    const interval = setInterval(updateMetrics, 10000);
    return () => clearInterval(interval);
  }, [updateMetrics]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Business Intelligence Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Executive analytics & strategic insights • Amazon.com/Shopee.sg Standards
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={updateMetrics}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Revenue (Monthly)</p>
                <p className="text-2xl font-bold text-green-900">
                  ৳{(metrics.revenue.current / 100000).toFixed(1)}L
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  +{metrics.revenue.growth.toFixed(1)}%
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Customers</p>
                <p className="text-2xl font-bold text-blue-900">
                  {(metrics.customers.active / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Users className="w-3 h-3" />
                  +{metrics.customers.new} new
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Orders (Monthly)</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(metrics.operations.orders / 1000).toFixed(1)}K
                </p>
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <CheckCircle className="w-3 h-3" />
                  {metrics.operations.fulfillment.toFixed(1)}% fulfilled
                </div>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Market Share</p>
                <p className="text-2xl font-bold text-orange-900">
                  {metrics.market.share.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <Target className="w-3 h-3" />
                  Growing +{metrics.market.growth.toFixed(1)}%
                </div>
              </div>
              <Globe className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Intelligence Tabs */}
      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="kpis">KPI Dashboard</TabsTrigger>
          <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
          <TabsTrigger value="market">Market Intelligence</TabsTrigger>
          <TabsTrigger value="strategy">Strategic Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Key Performance Indicators</h3>
            <Select value={selectedKpiCategory} onValueChange={setSelectedKpiCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KPIs</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="strategic">Strategic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKpis.map((kpi, index) => (
              <Card key={index} className={`border-l-4 ${getKpiStatusColor(kpi.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                    {getTrendIcon(kpi.trend)}
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">
                      {kpi.value.toFixed(kpi.unit === '%' ? 1 : 0)}
                    </span>
                    <span className="text-sm text-gray-600">{kpi.unit}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Target: {kpi.target.toFixed(kpi.unit === '%' ? 1 : 0)} {kpi.unit}</span>
                      <span>{((kpi.value / kpi.target) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(kpi.value / kpi.target) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Current Month</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(metrics.revenue.current)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Previous Month</span>
                  <span className="font-semibold">
                    {formatCurrency(metrics.revenue.previous)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Growth Rate</span>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    +{metrics.revenue.growth.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Monthly Target</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(metrics.revenue.target)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Forecast (Next Month)</span>
                  <span className="font-semibold text-purple-600">
                    {formatCurrency(metrics.revenue.forecast)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Economics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Customer Lifetime Value</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(metrics.customers.ltv)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Customer Acquisition Cost</span>
                  <span className="font-semibold">
                    ৳{kpis.find(k => k.name.includes('Acquisition'))?.value.toFixed(0) || '285'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Monthly Churn Rate</span>
                  <Badge variant={metrics.customers.churn <= 3 ? "default" : "destructive"}>
                    {metrics.customers.churn.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>LTV:CAC Ratio</span>
                  <span className="font-semibold text-blue-600">
                    {(metrics.customers.ltv / 285).toFixed(1)}:1
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Landscape</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketIntelligence.competitors.map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{competitor.name}</div>
                        <div className="text-sm text-gray-600">
                          Strength: {competitor.strength}
                        </div>
                        <div className="text-sm text-red-600">
                          Weakness: {competitor.weakness}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{competitor.marketShare}%</div>
                        <div className="text-xs text-gray-500">Market Share</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Trends & Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketIntelligence.trends.map((trend, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-900">{trend.category}</h4>
                        <Badge variant={trend.impact === 'high' ? 'default' : 'outline'}>
                          {trend.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-700 mb-2">{trend.trend}</p>
                      <p className="text-sm text-green-700 font-medium">
                        Opportunity: {trend.opportunity}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Market Threats & Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketIntelligence.threats.map((threat, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-orange-900">{threat.type}</h4>
                      <Badge variant={threat.severity === 'high' ? 'destructive' : 'outline'}>
                        {threat.severity} risk
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-orange-700">Timeline: {threat.timeline}</span>
                      </div>
                      <p className="text-green-700">
                        <strong>Mitigation:</strong> {threat.mitigation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategic Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Immediate Actions (0-3 months)</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Enhance mobile app performance to capture 80% mobile traffic</li>
                      <li>• Implement social commerce features for Facebook/Instagram integration</li>
                      <li>• Optimize customer acquisition cost from ৳285 to ৳250</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Medium-term Goals (3-12 months)</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Increase market share from 23.4% to 25%</li>
                      <li>• Launch B2B marketplace to capture business customers</li>
                      <li>• Expand to tier-2 cities with localized offerings</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Long-term Vision (1-3 years)</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Establish regional presence in South Asia</li>
                      <li>• Build AI-powered personalization platform</li>
                      <li>• Develop private label products for higher margins</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Technology Infrastructure</div>
                      <div className="text-sm text-gray-600">Mobile app, AI, analytics</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">₹50L</div>
                      <div className="text-xs text-gray-500">Priority: High</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Marketing & Acquisition</div>
                      <div className="text-sm text-gray-600">Digital marketing, influencers</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">₹35L</div>
                      <div className="text-xs text-gray-500">Priority: High</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Operations & Fulfillment</div>
                      <div className="text-sm text-gray-600">Warehouses, logistics</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-purple-600">₹25L</div>
                      <div className="text-xs text-gray-500">Priority: Medium</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Human Resources</div>
                      <div className="text-sm text-gray-600">Tech talent, management</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-600">₹20L</div>
                      <div className="text-xs text-gray-500">Priority: Medium</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
        <span>Business Intelligence • Updated every 10 minutes</span>
        <span>Phase 4: Advanced Analytics & Intelligence • Executive Dashboard</span>
      </div>
    </div>
  );
}