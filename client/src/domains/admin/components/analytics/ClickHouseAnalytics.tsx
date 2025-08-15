/**
 * Phase 4: Advanced Analytics & Intelligence
 * ClickHouse Analytics Engine - Real-time Data Processing
 * Shopee.sg-style 160TB+ Analytics Capability
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  BarChart, 
  TrendingUp, 
  Database,
  Zap,
  Clock,
  Activity,
  Server,
  Analytics,
  LineChart,
  PieChart,
  Target,
  Globe,
  Users,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClickHouseAnalyticsProps {
  className?: string;
}

interface AnalyticsMetrics {
  realTime: RealTimeMetrics;
  performance: PerformanceMetrics;
  dataFlow: DataFlowMetrics;
  queries: QueryMetrics;
  storage: StorageMetrics;
  predictions: PredictionMetrics;
}

interface RealTimeMetrics {
  eventsPerSecond: number;
  activeQueries: number;
  dataIngestionRate: number;
  processingLatency: number;
  systemLoad: number;
  uptime: string;
  lastUpdate: string;
}

interface PerformanceMetrics {
  queryResponseTime: number;
  compressionRatio: number;
  cacheHitRate: number;
  throughput: number;
  errorRate: number;
  availability: number;
}

interface DataFlowMetrics {
  totalEvents: number;
  dailyEvents: number;
  dataVolume: number;
  sources: DataSource[];
  pipelines: DataPipeline[];
}

interface QueryMetrics {
  totalQueries: number;
  slowQueries: number;
  popularQueries: PopularQuery[];
  queryTypes: QueryType[];
}

interface StorageMetrics {
  totalStorage: number;
  usedStorage: number;
  tableCount: number;
  indexSize: number;
  compressionSavings: number;
}

interface PredictionMetrics {
  accuracyScore: number;
  modelsActive: number;
  predictionsToday: number;
  confidence: number;
  trending: TrendingPrediction[];
}

interface DataSource {
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  eventsPerMin: number;
  lastSync: string;
}

interface DataPipeline {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'error';
  throughput: number;
  latency: number;
  errorCount: number;
}

interface PopularQuery {
  query: string;
  executions: number;
  avgTime: number;
  category: string;
}

interface QueryType {
  type: string;
  count: number;
  percentage: number;
}

interface TrendingPrediction {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
}

const ClickHouseAnalytics: React.FC<ClickHouseAnalyticsProps> = ({
  className,
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'queries' | 'predictions'>('overview');
  const [isRealTime, setIsRealTime] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = () => {
      const mockData: AnalyticsMetrics = {
        realTime: {
          eventsPerSecond: 15420,
          activeQueries: 47,
          dataIngestionRate: 2.3,
          processingLatency: 2.5,
          systemLoad: 73,
          uptime: '99.97%',
          lastUpdate: new Date().toISOString()
        },
        performance: {
          queryResponseTime: 1.8,
          compressionRatio: 8.4,
          cacheHitRate: 94.2,
          throughput: 1250000,
          errorRate: 0.01,
          availability: 99.97
        },
        dataFlow: {
          totalEvents: 2847692341,
          dailyEvents: 125643987,
          dataVolume: 164.7,
          sources: [
            {
              name: 'E-commerce Events',
              type: 'Kafka Stream',
              status: 'active',
              eventsPerMin: 45632,
              lastSync: '2025-01-13 06:47:30'
            },
            {
              name: 'User Behavior',
              type: 'Real-time API',
              status: 'active',
              eventsPerMin: 23891,
              lastSync: '2025-01-13 06:47:25'
            },
            {
              name: 'Payment Data',
              type: 'Database CDC',
              status: 'active',
              eventsPerMin: 8743,
              lastSync: '2025-01-13 06:47:28'
            },
            {
              name: 'Inventory Updates',
              type: 'Message Queue',
              status: 'active',
              eventsPerMin: 12456,
              lastSync: '2025-01-13 06:47:32'
            }
          ],
          pipelines: [
            {
              id: 'user-analytics',
              name: 'User Analytics Pipeline',
              status: 'running',
              throughput: 45000,
              latency: 1.2,
              errorCount: 2
            },
            {
              id: 'sales-pipeline',
              name: 'Sales Data Pipeline',
              status: 'running',
              throughput: 32000,
              latency: 0.8,
              errorCount: 0
            },
            {
              id: 'inventory-sync',
              name: 'Inventory Sync Pipeline',
              status: 'running',
              throughput: 18000,
              latency: 2.1,
              errorCount: 1
            }
          ]
        },
        queries: {
          totalQueries: 1847291,
          slowQueries: 23,
          popularQueries: [
            {
              query: 'SELECT * FROM sales_events WHERE date >= today()',
              executions: 15642,
              avgTime: 0.45,
              category: 'Sales Analytics'
            },
            {
              query: 'SELECT user_id, count() FROM user_events GROUP BY user_id',
              executions: 12834,
              avgTime: 1.2,
              category: 'User Analytics'
            },
            {
              query: 'SELECT product_id, sum(revenue) FROM order_items',
              executions: 9876,
              avgTime: 0.78,
              category: 'Product Analytics'
            }
          ],
          queryTypes: [
            { type: 'SELECT', count: 1654832, percentage: 89.6 },
            { type: 'INSERT', count: 156847, percentage: 8.5 },
            { type: 'CREATE', count: 23456, percentage: 1.3 },
            { type: 'ALTER', count: 12156, percentage: 0.6 }
          ]
        },
        storage: {
          totalStorage: 164.7,
          usedStorage: 127.3,
          tableCount: 847,
          indexSize: 12.4,
          compressionSavings: 72.3
        },
        predictions: {
          accuracyScore: 89.7,
          modelsActive: 12,
          predictionsToday: 2847,
          confidence: 94.2,
          trending: [
            {
              metric: 'Sales Revenue',
              direction: 'up',
              confidence: 92.4,
              impact: 'high'
            },
            {
              metric: 'User Engagement',
              direction: 'up',
              confidence: 87.1,
              impact: 'medium'
            },
            {
              metric: 'Cart Abandonment',
              direction: 'down',
              confidence: 91.8,
              impact: 'high'
            }
          ]
        }
      };

      setTimeout(() => {
        setAnalyticsData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadAnalyticsData();

    // Real-time updates
    if (isRealTime) {
      const interval = setInterval(() => {
        setAnalyticsData(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            realTime: {
              ...prev.realTime,
              eventsPerSecond: prev.realTime.eventsPerSecond + Math.floor(Math.random() * 1000 - 500),
              activeQueries: Math.max(1, prev.realTime.activeQueries + Math.floor(Math.random() * 10 - 5)),
              processingLatency: Math.max(0.1, prev.realTime.processingLatency + (Math.random() * 0.5 - 0.25)),
              lastUpdate: new Date().toISOString()
            }
          };
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isRealTime]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes * Math.pow(k, 3)) / Math.log(k));
    return parseFloat((bytes * Math.pow(k, 3) / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'inactive':
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Analytics Engine Unavailable</h3>
            <p className="text-muted-foreground">
              Unable to load ClickHouse analytics data.
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
            <Database className="h-6 w-6 text-blue-500" />
            ClickHouse Analytics Engine
          </h1>
          <p className="text-muted-foreground">
            Real-time data processing and analytics with 160TB+ capability
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={analyticsData.realTime.systemLoad > 80 ? 'bg-red-500' : 'bg-green-500'}>
            System Load: {analyticsData.realTime.systemLoad}%
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

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Events/Second</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analyticsData.realTime.eventsPerSecond.toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Target: 1M+ events/sec capability
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing Latency</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData.realTime.processingLatency.toFixed(1)}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Target: &lt;5ms latency
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Queries</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analyticsData.realTime.activeQueries}
                </p>
              </div>
              <BarChart className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Concurrent query processing
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Volume</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatBytes(analyticsData.dataFlow.dataVolume)}
                </p>
              </div>
              <Server className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Shopee.sg-style 160TB+ capacity
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Query Response Time</span>
                  <span>{analyticsData.performance.queryResponseTime}ms</span>
                </div>
                <Progress value={Math.max(0, 100 - analyticsData.performance.queryResponseTime * 10)} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cache Hit Rate</span>
                  <span>{analyticsData.performance.cacheHitRate}%</span>
                </div>
                <Progress value={analyticsData.performance.cacheHitRate} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Compression Ratio</span>
                  <span>{analyticsData.performance.compressionRatio}:1</span>
                </div>
                <Progress value={Math.min(100, analyticsData.performance.compressionRatio * 10)} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Availability</span>
                  <span>{analyticsData.performance.availability}%</span>
                </div>
                <Progress value={analyticsData.performance.availability} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Analytics className="h-5 w-5" />
              Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.dataFlow.sources.map((source) => (
                <div key={source.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{source.name}</h4>
                    <p className="text-xs text-muted-foreground">{source.type}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(source.status)}>
                      {source.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {source.eventsPerMin.toLocaleString()}/min
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-primary">
                {analyticsData.predictions.accuracyScore}%
              </div>
              <div className="text-sm text-muted-foreground">ML Model Accuracy</div>
            </div>
            <div className="space-y-3">
              {analyticsData.predictions.trending.map((trend) => (
                <div key={trend.metric} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      trend.direction === 'up' ? 'bg-green-500' :
                      trend.direction === 'down' ? 'bg-red-500' : 'bg-gray-500'
                    )}></div>
                    <span className="text-sm">{trend.metric}</span>
                  </div>
                  <Badge variant={
                    trend.impact === 'high' ? 'destructive' :
                    trend.impact === 'medium' ? 'default' : 'secondary'
                  } className="text-xs">
                    {trend.confidence}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {(['overview', 'performance', 'queries', 'predictions'] as const).map((tab) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Pipelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.dataFlow.pipelines.map((pipeline) => (
                  <div key={pipeline.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{pipeline.name}</h4>
                      <Badge className={getStatusColor(pipeline.status)}>
                        {pipeline.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Throughput:</span>
                        <div className="font-medium">{pipeline.throughput.toLocaleString()}/s</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Latency:</span>
                        <div className="font-medium">{pipeline.latency}ms</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Errors:</span>
                        <div className="font-medium">{pipeline.errorCount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Storage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Storage Usage</span>
                    <span>{formatBytes(analyticsData.storage.usedStorage)} / {formatBytes(analyticsData.storage.totalStorage)}</span>
                  </div>
                  <Progress value={(analyticsData.storage.usedStorage / analyticsData.storage.totalStorage) * 100} />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {analyticsData.storage.tableCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Tables</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.storage.compressionSavings}%
                    </div>
                    <div className="text-sm text-muted-foreground">Compression</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {analyticsData.performance.throughput.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Queries/Hour</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {analyticsData.performance.errorRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Error Rate</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">System Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Uptime</span>
                      <Badge className="bg-green-100 text-green-700">
                        {analyticsData.realTime.uptime}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Ingestion</span>
                      <span className="text-sm font-medium">
                        {analyticsData.realTime.dataIngestionRate} GB/s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Query Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {analyticsData.queries.totalQueries.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Queries Today</div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Query Distribution</h4>
                  <div className="space-y-2">
                    {analyticsData.queries.queryTypes.map((type) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <span className="text-sm">{type.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${type.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{type.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'queries' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {analyticsData.queries.totalQueries.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Queries</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {analyticsData.queries.slowQueries}
                </div>
                <div className="text-sm text-muted-foreground">Slow Queries</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.performance.queryResponseTime}ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Popular Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.queries.popularQueries.map((query, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{query.category}</Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium">{query.executions.toLocaleString()} executions</div>
                        <div className="text-xs text-muted-foreground">{query.avgTime}ms avg</div>
                      </div>
                    </div>
                    <code className="text-sm bg-muted p-2 rounded block font-mono">
                      {query.query}
                    </code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData.predictions.accuracyScore}%
                </div>
                <div className="text-sm text-muted-foreground">ML Accuracy</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData.predictions.modelsActive}
                </div>
                <div className="text-sm text-muted-foreground">Active Models</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.predictions.predictionsToday.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Predictions Today</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-50 to-red-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analyticsData.predictions.confidence}%
                </div>
                <div className="text-sm text-muted-foreground">Confidence Score</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Trending Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.predictions.trending.map((trend) => (
                  <div key={trend.metric} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        trend.direction === 'up' ? 'bg-green-500' :
                        trend.direction === 'down' ? 'bg-red-500' : 'bg-gray-500'
                      )}></div>
                      <div>
                        <h4 className="font-medium">{trend.metric}</h4>
                        <p className="text-sm text-muted-foreground">
                          Trending {trend.direction} with {trend.confidence}% confidence
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      trend.impact === 'high' ? 'destructive' :
                      trend.impact === 'medium' ? 'default' : 'secondary'
                    }>
                      {trend.impact} impact
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClickHouseAnalytics;