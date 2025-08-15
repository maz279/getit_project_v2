/**
 * Phase 4: Advanced Analytics & Intelligence
 * Predictive Analytics Engine - ML-powered Predictions
 * Amazon.com/Shopee.sg-level Predictive Intelligence
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  BarChart3,
  LineChart,
  PieChart,
  Globe,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  RotateCcw,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PredictiveAnalyticsProps {
  className?: string;
}

interface PredictionData {
  overview: PredictionOverview;
  models: MLModel[];
  forecasts: Forecast[];
  recommendations: Recommendation[];
  alerts: PredictionAlert[];
  performance: ModelPerformance;
  insights: PredictiveInsight[];
}

interface PredictionOverview {
  totalModels: number;
  activeModels: number;
  accuracy: number;
  predictionsToday: number;
  confidenceScore: number;
  lastUpdate: string;
  trainingStatus: 'idle' | 'training' | 'evaluating' | 'deploying';
}

interface MLModel {
  id: string;
  name: string;
  type: 'sales_forecast' | 'demand_prediction' | 'churn_prediction' | 'price_optimization' | 'inventory_optimization';
  status: 'active' | 'training' | 'inactive';
  accuracy: number;
  confidence: number;
  lastTrained: string;
  predictions: number;
  features: string[];
  algorithm: string;
  version: string;
}

interface Forecast {
  id: string;
  type: 'revenue' | 'sales' | 'demand' | 'customers' | 'inventory';
  metric: string;
  currentValue: number;
  predictedValue: number;
  change: number;
  confidence: number;
  timeframe: string;
  factors: ForecastFactor[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface Recommendation {
  id: string;
  category: 'pricing' | 'inventory' | 'marketing' | 'operations';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  expectedValue: number;
  effort: 'low' | 'medium' | 'high';
  priority: number;
  actions: string[];
  deadline: string;
}

interface PredictionAlert {
  id: string;
  type: 'warning' | 'opportunity' | 'threat' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  threshold: number;
  confidence: number;
  timestamp: string;
  actions: string[];
}

interface ModelPerformance {
  overall: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  byType: {
    [key: string]: {
      accuracy: number;
      predictions: number;
      errors: number;
    };
  };
  trends: {
    accuracy: number[];
    predictions: number[];
    dates: string[];
  };
}

interface PredictiveInsight {
  id: string;
  category: string;
  title: string;
  description: string;
  confidence: number;
  impact: string;
  evidence: string[];
  recommendations: string[];
  timeframe: string;
}

interface ForecastFactor {
  factor: string;
  impact: number;
  weight: number;
  trend: 'positive' | 'negative' | 'neutral';
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  className,
}) => {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'forecasts' | 'recommendations'>('overview');
  const [isRealTime, setIsRealTime] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPredictionData = () => {
      const mockData: PredictionData = {
        overview: {
          totalModels: 12,
          activeModels: 9,
          accuracy: 89.7,
          predictionsToday: 2847,
          confidenceScore: 94.2,
          lastUpdate: new Date().toISOString(),
          trainingStatus: 'idle'
        },
        models: [
          {
            id: 'sales-forecast-v3',
            name: 'Sales Revenue Forecasting',
            type: 'sales_forecast',
            status: 'active',
            accuracy: 92.4,
            confidence: 95.1,
            lastTrained: '2025-01-12',
            predictions: 1245,
            features: ['Historical Sales', 'Seasonality', 'Marketing Spend', 'Economic Indicators', 'Competitor Data'],
            algorithm: 'ARIMA-LSTM Hybrid',
            version: '3.2.1'
          },
          {
            id: 'demand-prediction-v2',
            name: 'Product Demand Prediction',
            type: 'demand_prediction',
            status: 'active',
            accuracy: 87.8,
            confidence: 91.3,
            lastTrained: '2025-01-11',
            predictions: 892,
            features: ['Product Category', 'Price', 'Reviews', 'Inventory Level', 'Seasonal Trends'],
            algorithm: 'Random Forest',
            version: '2.1.4'
          },
          {
            id: 'churn-prediction-v1',
            name: 'Customer Churn Prediction',
            type: 'churn_prediction',
            status: 'active',
            accuracy: 85.6,
            confidence: 88.9,
            lastTrained: '2025-01-10',
            predictions: 456,
            features: ['Purchase Frequency', 'Engagement Score', 'Support Tickets', 'Session Duration'],
            algorithm: 'XGBoost',
            version: '1.3.2'
          },
          {
            id: 'price-optimization-v2',
            name: 'Dynamic Pricing Optimization',
            type: 'price_optimization',
            status: 'training',
            accuracy: 91.2,
            confidence: 93.5,
            lastTrained: '2025-01-09',
            predictions: 234,
            features: ['Competitor Prices', 'Demand Elasticity', 'Inventory Level', 'Market Conditions'],
            algorithm: 'Deep Q-Network',
            version: '2.0.1'
          },
          {
            id: 'inventory-optimization-v1',
            name: 'Inventory Level Optimization',
            type: 'inventory_optimization',
            status: 'active',
            accuracy: 88.3,
            confidence: 90.7,
            lastTrained: '2025-01-08',
            predictions: 567,
            features: ['Sales Velocity', 'Lead Time', 'Storage Costs', 'Demand Variability'],
            algorithm: 'Neural Network',
            version: '1.2.0'
          }
        ],
        forecasts: [
          {
            id: 'revenue-next-month',
            type: 'revenue',
            metric: 'Monthly Revenue',
            currentValue: 15220000,
            predictedValue: 18200000,
            change: 19.6,
            confidence: 92.4,
            timeframe: 'Next Month',
            trend: 'increasing',
            factors: [
              { factor: 'Festival Season', impact: 25.5, weight: 0.35, trend: 'positive' },
              { factor: 'Marketing Campaigns', impact: 18.2, weight: 0.25, trend: 'positive' },
              { factor: 'New Product Launches', impact: 12.8, weight: 0.20, trend: 'positive' },
              { factor: 'Economic Conditions', impact: -8.3, weight: 0.15, trend: 'negative' },
              { factor: 'Competition', impact: -6.1, weight: 0.05, trend: 'negative' }
            ]
          },
          {
            id: 'demand-electronics',
            type: 'demand',
            metric: 'Electronics Demand',
            currentValue: 45000,
            predictedValue: 67500,
            change: 50.0,
            confidence: 87.8,
            timeframe: 'Next 2 Weeks',
            trend: 'increasing',
            factors: [
              { factor: 'Gaming Season', impact: 35.0, weight: 0.40, trend: 'positive' },
              { factor: 'Student Discounts', impact: 22.5, weight: 0.30, trend: 'positive' },
              { factor: 'New Arrivals', impact: 15.8, weight: 0.25, trend: 'positive' },
              { factor: 'Supply Chain', impact: -8.3, weight: 0.05, trend: 'negative' }
            ]
          },
          {
            id: 'customers-growth',
            type: 'customers',
            metric: 'New Customer Acquisition',
            currentValue: 15500,
            predictedValue: 19200,
            change: 23.9,
            confidence: 85.6,
            timeframe: 'Next Month',
            trend: 'increasing',
            factors: [
              { factor: 'Referral Program', impact: 28.5, weight: 0.30, trend: 'positive' },
              { factor: 'Social Media Marketing', impact: 22.1, weight: 0.25, trend: 'positive' },
              { factor: 'Word of Mouth', impact: 18.7, weight: 0.20, trend: 'positive' },
              { factor: 'App Store Rankings', impact: 15.2, weight: 0.15, trend: 'positive' },
              { factor: 'Market Saturation', impact: -12.6, weight: 0.10, trend: 'negative' }
            ]
          }
        ],
        recommendations: [
          {
            id: 'rec-1',
            category: 'pricing',
            title: 'Optimize Electronics Pricing for Festival Season',
            description: 'Adjust pricing strategy for electronics category to maximize revenue during upcoming festival season',
            impact: 'high',
            confidence: 91.2,
            expectedValue: 2850000,
            effort: 'medium',
            priority: 1,
            actions: [
              'Reduce prices by 8-12% on gaming accessories',
              'Increase prices by 3-5% on premium electronics',
              'Implement dynamic pricing for mobile accessories',
              'Create bundle deals for complementary products'
            ],
            deadline: '2025-01-20'
          },
          {
            id: 'rec-2',
            category: 'inventory',
            title: 'Increase Gaming Product Inventory',
            description: 'Stock up on gaming products based on predicted 50% demand increase',
            impact: 'high',
            confidence: 87.8,
            expectedValue: 1950000,
            effort: 'high',
            priority: 2,
            actions: [
              'Order 150% more gaming headsets',
              'Increase gaming mouse inventory by 200%',
              'Stock popular gaming keyboards',
              'Secure additional warehouse space'
            ],
            deadline: '2025-01-18'
          },
          {
            id: 'rec-3',
            category: 'marketing',
            title: 'Launch Customer Retention Campaign',
            description: 'Target high-risk churn customers with personalized retention offers',
            impact: 'medium',
            confidence: 85.6,
            expectedValue: 875000,
            effort: 'low',
            priority: 3,
            actions: [
              'Send personalized discount codes to at-risk customers',
              'Create loyalty program tier upgrades',
              'Implement win-back email campaigns',
              'Offer free shipping incentives'
            ],
            deadline: '2025-01-25'
          }
        ],
        alerts: [
          {
            id: 'alert-1',
            type: 'opportunity',
            severity: 'high',
            title: 'Gaming Product Demand Surge Detected',
            description: 'ML models predict 50% increase in gaming product demand over next 2 weeks',
            metric: 'Gaming Product Demand',
            currentValue: 45000,
            threshold: 50000,
            confidence: 87.8,
            timestamp: '2025-01-13 06:30:00',
            actions: [
              'Increase inventory orders immediately',
              'Adjust pricing strategy',
              'Prepare marketing campaigns',
              'Alert supply chain team'
            ]
          },
          {
            id: 'alert-2',
            type: 'warning',
            severity: 'medium',
            title: 'Potential Stock-out Risk',
            description: 'Wireless headphones inventory may run out in 5 days based on current demand',
            metric: 'Inventory Level',
            currentValue: 120,
            threshold: 50,
            confidence: 92.1,
            timestamp: '2025-01-13 05:45:00',
            actions: [
              'Place emergency inventory order',
              'Contact backup suppliers',
              'Implement purchase limits',
              'Promote alternative products'
            ]
          },
          {
            id: 'alert-3',
            type: 'anomaly',
            severity: 'low',
            title: 'Unusual Customer Behavior Pattern',
            description: 'Detected abnormal browsing pattern in electronics category',
            metric: 'Customer Behavior Score',
            currentValue: 2.3,
            threshold: 1.8,
            confidence: 78.4,
            timestamp: '2025-01-13 04:20:00',
            actions: [
              'Investigate traffic sources',
              'Check for bot activity',
              'Review recent marketing campaigns',
              'Monitor conversion rates'
            ]
          }
        ],
        performance: {
          overall: {
            accuracy: 89.7,
            precision: 91.2,
            recall: 87.8,
            f1Score: 89.4
          },
          byType: {
            'sales_forecast': { accuracy: 92.4, predictions: 1245, errors: 12 },
            'demand_prediction': { accuracy: 87.8, predictions: 892, errors: 18 },
            'churn_prediction': { accuracy: 85.6, predictions: 456, errors: 8 },
            'price_optimization': { accuracy: 91.2, predictions: 234, errors: 3 },
            'inventory_optimization': { accuracy: 88.3, predictions: 567, errors: 11 }
          },
          trends: {
            accuracy: [87.2, 88.1, 88.9, 89.3, 89.7],
            predictions: [2156, 2234, 2418, 2651, 2847],
            dates: ['Jan 9', 'Jan 10', 'Jan 11', 'Jan 12', 'Jan 13']
          }
        },
        insights: [
          {
            id: 'insight-1',
            category: 'Revenue Optimization',
            title: 'Festival Season Revenue Opportunity',
            description: 'Data indicates 25% higher conversion rates during festival periods with optimized pricing',
            confidence: 94.2,
            impact: '₹28.5 Lakh additional revenue potential',
            evidence: [
              'Historical festival sales data shows consistent 20-30% uplift',
              'Customer sentiment analysis indicates high purchase intent',
              'Competitor pricing analysis reveals market opportunities'
            ],
            recommendations: [
              'Implement dynamic festival pricing strategy',
              'Launch targeted marketing campaigns',
              'Optimize inventory for high-demand products'
            ],
            timeframe: 'Next 30 days'
          },
          {
            id: 'insight-2',
            category: 'Customer Behavior',
            title: 'Mobile Commerce Dominance',
            description: 'Mobile purchases increasing 35% faster than desktop, indicating shift in customer behavior',
            confidence: 91.7,
            impact: 'Strategic pivot opportunity',
            evidence: [
              'Mobile sessions increased 45% in last quarter',
              'Mobile conversion rate improved by 28%',
              'App downloads grew 67% month-over-month'
            ],
            recommendations: [
              'Prioritize mobile app development',
              'Optimize mobile checkout experience',
              'Invest in mobile-specific marketing'
            ],
            timeframe: 'Next 90 days'
          }
        ]
      };

      setTimeout(() => {
        setPredictionData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadPredictionData();

    // Real-time updates for predictions
    if (isRealTime) {
      const interval = setInterval(() => {
        setPredictionData(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            overview: {
              ...prev.overview,
              predictionsToday: prev.overview.predictionsToday + Math.floor(Math.random() * 5),
              accuracy: Math.max(85, Math.min(95, prev.overview.accuracy + (Math.random() * 0.2 - 0.1))),
              lastUpdate: new Date().toISOString()
            }
          };
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isRealTime]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Crore`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'training': return 'bg-blue-100 text-blue-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-200 text-red-700';
      case 'high': return 'bg-orange-100 border-orange-200 text-orange-700';
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-700';
      case 'low': return 'bg-blue-100 border-blue-200 text-blue-700';
      default: return 'bg-gray-100 border-gray-200 text-gray-700';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!predictionData) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Predictive Analytics Unavailable</h3>
            <p className="text-muted-foreground">
              Unable to load predictive analytics data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-7xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Predictive Analytics Engine
          </h1>
          <p className="text-muted-foreground">
            AI-powered predictions and insights for strategic decision making
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={predictionData.overview.trainingStatus === 'training' ? 'bg-blue-500' : 'bg-green-500'}>
            {predictionData.overview.trainingStatus === 'training' ? 'Training in Progress' : 'Models Ready'}
          </Badge>
          <Button
            variant="outline"
            onClick={() => setIsRealTime(!isRealTime)}
            className={isRealTime ? 'border-green-500 text-green-600' : ''}
          >
            {isRealTime ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRealTime ? 'Live' : 'Paused'}
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ML Model Accuracy</p>
                <p className="text-3xl font-bold text-purple-600">
                  {predictionData.overview.accuracy}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {predictionData.overview.activeModels}/{predictionData.overview.totalModels} models active
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Predictions Today</p>
                <p className="text-3xl font-bold text-blue-600">
                  {predictionData.overview.predictionsToday.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {predictionData.overview.confidenceScore}% avg confidence
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Performance</p>
                <p className="text-3xl font-bold text-green-600">
                  {predictionData.performance.overall.f1Score}%
                </p>
                <p className="text-sm text-muted-foreground">F1 Score</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {predictionData.alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Critical Predictions & Alerts
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {predictionData.alerts.slice(0, 4).map((alert) => (
              <Card key={alert.id} className={cn('border-l-4', getAlertColor(alert.severity))}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{alert.title}</h4>
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'high' ? 'destructive' :
                      alert.severity === 'medium' ? 'default' : 'secondary'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Current:</span>
                      <span className="ml-1 font-medium">{alert.currentValue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="ml-1 font-medium">{alert.confidence}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Actions: {alert.actions.slice(0, 2).join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {(['overview', 'models', 'forecasts', 'recommendations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm capitalize',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Insights */}
          <div>
            <h3 className="text-lg font-semibold mb-4">AI-Generated Insights</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {predictionData.insights.map((insight) => (
                <Card key={insight.id} className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-800">{insight.title}</h4>
                      <Badge className="bg-blue-100 text-blue-700">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">{insight.description}</p>
                    <div className="text-sm font-medium text-purple-700 mb-3">
                      Impact: {insight.impact}
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-xs text-blue-800">Evidence:</h5>
                      <ul className="text-xs text-blue-600 space-y-1">
                        {insight.evidence.slice(0, 2).map((evidence, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3" />
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Accuracy</span>
                      <span>{predictionData.performance.overall.accuracy}%</span>
                    </div>
                    <Progress value={predictionData.performance.overall.accuracy} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Precision</span>
                      <span>{predictionData.performance.overall.precision}%</span>
                    </div>
                    <Progress value={predictionData.performance.overall.precision} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Recall</span>
                      <span>{predictionData.performance.overall.recall}%</span>
                    </div>
                    <Progress value={predictionData.performance.overall.recall} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Types Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(predictionData.performance.byType).map(([type, metrics]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{metrics.accuracy}%</div>
                        <div className="text-xs text-muted-foreground">
                          {metrics.predictions} predictions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Forecasts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictionData.forecasts.slice(0, 3).map((forecast) => (
                    <div key={forecast.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{forecast.metric}</h4>
                        {getTrendIcon(forecast.trend)}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {forecast.type === 'revenue' ? formatCurrency(forecast.predictedValue) : forecast.predictedValue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {forecast.change > 0 ? '+' : ''}{forecast.change}% • {forecast.confidence}% confidence
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">ML Models</h2>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Model Settings
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictionData.models.map((model) => (
              <Card key={model.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{model.name}</h3>
                    <Badge className={getStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{model.accuracy}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{model.confidence}%</div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Algorithm:</span>
                      <span className="font-medium">{model.algorithm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span className="font-medium">{model.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Predictions:</span>
                      <span className="font-medium">{model.predictions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Trained:</span>
                      <span className="font-medium">{model.lastTrained}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Features:</h5>
                    <div className="flex flex-wrap gap-1">
                      {model.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Retrain</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'forecasts' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Predictive Forecasts</h2>
            <p className="text-muted-foreground">
              AI-generated forecasts based on historical data and market trends
            </p>
          </div>
          
          <div className="space-y-6">
            {predictionData.forecasts.map((forecast) => (
              <Card key={forecast.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{forecast.metric}</h3>
                      <p className="text-sm text-muted-foreground">{forecast.timeframe}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-2">{forecast.confidence}% confidence</Badge>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(forecast.trend)}
                        <span className="text-sm font-medium capitalize">{forecast.trend}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {forecast.type === 'revenue' ? formatCurrency(forecast.currentValue) : forecast.currentValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Current Value</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {forecast.type === 'revenue' ? formatCurrency(forecast.predictedValue) : forecast.predictedValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Predicted Value</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {forecast.change > 0 ? '+' : ''}{forecast.change}%
                      </div>
                      <div className="text-sm text-muted-foreground">Change</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Key Factors</h4>
                    <div className="space-y-2">
                      {forecast.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{factor.factor}</span>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {factor.impact > 0 ? '+' : ''}{factor.impact}%
                            </div>
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className={cn(
                                  'h-2 rounded-full',
                                  factor.trend === 'positive' ? 'bg-green-500' : 'bg-red-500'
                                )}
                                style={{ width: `${Math.abs(factor.impact) * 2}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">AI Recommendations</h2>
            <p className="text-muted-foreground">
              Data-driven recommendations to optimize business performance
            </p>
          </div>
          
          <div className="space-y-4">
            {predictionData.recommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{rec.title}</h3>
                        <Badge variant={
                          rec.impact === 'high' ? 'destructive' :
                          rec.impact === 'medium' ? 'default' : 'secondary'
                        }>
                          {rec.impact} impact
                        </Badge>
                        <Badge variant="outline">Priority {rec.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(rec.expectedValue)}
                      </div>
                      <div className="text-sm text-muted-foreground">Expected Value</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold">{rec.confidence}%</div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold capitalize">{rec.effort}</div>
                      <div className="text-sm text-muted-foreground">Effort Required</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold">{rec.deadline}</div>
                      <div className="text-sm text-muted-foreground">Deadline</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommended Actions:</h4>
                    <ul className="space-y-1">
                      {rec.actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm">Implement</Button>
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Schedule</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics;