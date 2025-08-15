/**
 * Phase 4: Advanced Analytics & Intelligence
 * Business Intelligence Platform - Executive Dashboards
 * Amazon.com/Shopee.sg-level Business Intelligence
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Users,
  ShoppingCart,
  Target,
  BarChart3,
  PieChart,
  Globe,
  Star,
  Award,
  Zap,
  Activity,
  Calendar,
  Filter,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessIntelligenceProps {
  className?: string;
}

interface BIData {
  kpis: KPIMetrics;
  revenue: RevenueAnalytics;
  customers: CustomerAnalytics;
  products: ProductAnalytics;
  market: MarketIntelligence;
  predictions: PredictiveAnalytics;
  comparative: ComparativeAnalysis;
}

interface KPIMetrics {
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  activeCustomers: number;
  customerGrowth: number;
  averageOrderValue: number;
  aovChange: number;
  conversionRate: number;
  conversionChange: number;
  marketShare: number;
  marketShareChange: number;
  customerSatisfaction: number;
  satisfactionChange: number;
}

interface RevenueAnalytics {
  totalRevenue: number;
  projectedRevenue: number;
  revenueByCategory: RevenueCategory[];
  revenueByRegion: RevenueRegion[];
  monthlyTrend: MonthlyRevenue[];
  paymentMethods: PaymentMethod[];
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerLifetimeValue: number;
  churnRate: number;
  segments: CustomerSegment[];
  demographics: Demographics;
  behavior: BehaviorMetrics;
}

interface ProductAnalytics {
  totalProducts: number;
  topSellingProducts: TopProduct[];
  categoryPerformance: CategoryPerformance[];
  inventoryTurnover: number;
  profitMargin: number;
  returnRate: number;
}

interface MarketIntelligence {
  competitorAnalysis: CompetitorData[];
  marketTrends: MarketTrend[];
  opportunity: OpportunityArea[];
  threats: ThreatAnalysis[];
  positioning: PositioningData;
}

interface PredictiveAnalytics {
  salesForecast: SalesForecast[];
  demandPrediction: DemandPrediction[];
  churnPrediction: ChurnPrediction;
  inventoryOptimization: InventoryOptimization[];
  pricingRecommendations: PricingRecommendation[];
}

interface ComparativeAnalysis {
  industryBenchmarks: IndustryBenchmark[];
  competitorComparison: CompetitorComparison[];
  performanceGaps: PerformanceGap[];
}

interface RevenueCategory {
  category: string;
  revenue: number;
  percentage: number;
  growth: number;
}

interface RevenueRegion {
  region: string;
  revenue: number;
  percentage: number;
  growth: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  target: number;
  growth: number;
}

interface PaymentMethod {
  method: string;
  volume: number;
  percentage: number;
  growth: number;
}

interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  value: number;
  growth: number;
}

interface Demographics {
  ageGroups: AgeGroup[];
  locations: LocationData[];
  genderSplit: GenderData[];
}

interface BehaviorMetrics {
  averageSessionDuration: number;
  pagesPerSession: number;
  bounceRate: number;
  repeatPurchaseRate: number;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  revenue: number;
  units: number;
  growth: number;
  margin: number;
}

interface CategoryPerformance {
  category: string;
  revenue: number;
  units: number;
  growth: number;
  margin: number;
  marketShare: number;
}

interface CompetitorData {
  name: string;
  marketShare: number;
  revenue: number;
  growth: number;
  strengths: string[];
  weaknesses: string[];
}

interface MarketTrend {
  trend: string;
  impact: 'high' | 'medium' | 'low';
  direction: 'positive' | 'negative' | 'neutral';
  confidence: number;
  description: string;
}

interface OpportunityArea {
  area: string;
  potential: number;
  investment: number;
  timeframe: string;
  priority: 'high' | 'medium' | 'low';
}

interface ThreatAnalysis {
  threat: string;
  probability: number;
  impact: number;
  mitigation: string;
  status: 'monitoring' | 'mitigating' | 'resolved';
}

interface PositioningData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SalesForecast {
  period: string;
  predicted: number;
  confidence: number;
  factors: string[];
}

interface DemandPrediction {
  product: string;
  category: string;
  predictedDemand: number;
  confidence: number;
  seasonality: number;
}

interface ChurnPrediction {
  riskLevel: 'low' | 'medium' | 'high';
  probability: number;
  affectedCustomers: number;
  preventionActions: string[];
}

interface InventoryOptimization {
  product: string;
  currentStock: number;
  recommendedStock: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface PricingRecommendation {
  product: string;
  currentPrice: number;
  recommendedPrice: number;
  expectedImpact: number;
  confidence: number;
}

interface IndustryBenchmark {
  metric: string;
  ourValue: number;
  industryAverage: number;
  topQuartile: number;
  performance: 'above' | 'average' | 'below';
}

interface CompetitorComparison {
  metric: string;
  ourValue: number;
  competitorAverage: number;
  leadingCompetitor: number;
  position: number;
}

interface PerformanceGap {
  area: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

interface AgeGroup {
  range: string;
  percentage: number;
  count: number;
}

interface LocationData {
  location: string;
  percentage: number;
  count: number;
}

interface GenderData {
  gender: string;
  percentage: number;
  count: number;
}

const BusinessIntelligence: React.FC<BusinessIntelligenceProps> = ({
  className,
}) => {
  const [biData, setBiData] = useState<BIData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'revenue' | 'customers' | 'market' | 'predictions'>('dashboard');
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBIData = () => {
      const mockData: BIData = {
        kpis: {
          monthlyRevenue: 15220000, // BDT 152.2 Lakh
          monthlyRevenueChange: 19.0,
          activeCustomers: 125000,
          customerGrowth: 15.5,
          averageOrderValue: 1850,
          aovChange: 8.2,
          conversionRate: 12.8,
          conversionChange: 2.1,
          marketShare: 23.0,
          marketShareChange: 3.5,
          customerSatisfaction: 4.2,
          satisfactionChange: 0.4
        },
        revenue: {
          totalRevenue: 15220000,
          projectedRevenue: 18000000,
          revenueByCategory: [
            { category: 'Electronics', revenue: 4566000, percentage: 30.0, growth: 22.5 },
            { category: 'Fashion', revenue: 3044000, percentage: 20.0, growth: 18.2 },
            { category: 'Home & Kitchen', revenue: 2283000, percentage: 15.0, growth: 15.8 },
            { category: 'Books & Media', revenue: 1522000, percentage: 10.0, growth: 12.1 },
            { category: 'Sports & Outdoors', revenue: 1522000, percentage: 10.0, growth: 25.3 },
            { category: 'Beauty & Health', revenue: 1216600, percentage: 8.0, growth: 28.7 },
            { category: 'Others', revenue: 1066400, percentage: 7.0, growth: 10.5 }
          ],
          revenueByRegion: [
            { region: 'Dhaka', revenue: 6088000, percentage: 40.0, growth: 20.2 },
            { region: 'Chittagong', revenue: 3044000, percentage: 20.0, growth: 18.5 },
            { region: 'Sylhet', revenue: 1522000, percentage: 10.0, growth: 22.8 },
            { region: 'Rajshahi', revenue: 1522000, percentage: 10.0, growth: 16.3 },
            { region: 'Khulna', revenue: 1216600, percentage: 8.0, growth: 15.1 },
            { region: 'Barisal', revenue: 913300, percentage: 6.0, growth: 19.7 },
            { region: 'Others', revenue: 913300, percentage: 6.0, growth: 14.2 }
          ],
          monthlyTrend: [
            { month: 'Jan 2024', revenue: 12500000, target: 12000000, growth: 15.2 },
            { month: 'Feb 2024', revenue: 13200000, target: 12500000, growth: 16.8 },
            { month: 'Mar 2024', revenue: 13800000, target: 13000000, growth: 18.1 },
            { month: 'Apr 2024', revenue: 14100000, target: 13500000, growth: 17.9 },
            { month: 'May 2024', revenue: 14600000, target: 14000000, growth: 19.2 },
            { month: 'Jun 2024', revenue: 15220000, target: 14500000, growth: 19.0 }
          ],
          paymentMethods: [
            { method: 'Mobile Banking', volume: 7610000, percentage: 50.0, growth: 25.8 },
            { method: 'Credit/Debit Card', volume: 4566000, percentage: 30.0, growth: 12.3 },
            { method: 'Cash on Delivery', volume: 2283000, percentage: 15.0, growth: -5.2 },
            { method: 'Digital Wallet', volume: 761000, percentage: 5.0, growth: 45.6 }
          ]
        },
        customers: {
          totalCustomers: 125000,
          newCustomers: 15500,
          returningCustomers: 47500,
          customerLifetimeValue: 8500,
          churnRate: 5.2,
          segments: [
            { segment: 'VIP Customers', count: 6250, percentage: 5.0, value: 25000, growth: 18.5 },
            { segment: 'Regular Customers', count: 50000, percentage: 40.0, value: 12000, growth: 15.2 },
            { segment: 'Occasional Buyers', count: 43750, percentage: 35.0, value: 6500, growth: 12.8 },
            { segment: 'New Customers', count: 25000, percentage: 20.0, value: 2800, growth: 22.1 }
          ],
          demographics: {
            ageGroups: [
              { range: '18-25', percentage: 35.0, count: 43750 },
              { range: '26-35', percentage: 30.0, count: 37500 },
              { range: '36-45', percentage: 20.0, count: 25000 },
              { range: '46-55', percentage: 10.0, count: 12500 },
              { range: '55+', percentage: 5.0, count: 6250 }
            ],
            locations: [
              { location: 'Dhaka', percentage: 40.0, count: 50000 },
              { location: 'Chittagong', percentage: 20.0, count: 25000 },
              { location: 'Sylhet', percentage: 12.0, count: 15000 },
              { location: 'Rajshahi', percentage: 10.0, count: 12500 },
              { location: 'Others', percentage: 18.0, count: 22500 }
            ],
            genderSplit: [
              { gender: 'Male', percentage: 52.0, count: 65000 },
              { gender: 'Female', percentage: 48.0, count: 60000 }
            ]
          },
          behavior: {
            averageSessionDuration: 8.5,
            pagesPerSession: 12.3,
            bounceRate: 32.1,
            repeatPurchaseRate: 38.5
          }
        },
        products: {
          totalProducts: 85000,
          topSellingProducts: [
            {
              id: 'p1',
              name: 'Wireless Gaming Headset',
              category: 'Electronics',
              revenue: 2500000,
              units: 8500,
              growth: 45.2,
              margin: 25.8
            },
            {
              id: 'p2',
              name: 'Smartphone Case Set',
              category: 'Electronics',
              revenue: 1800000,
              units: 15000,
              growth: 38.1,
              margin: 35.2
            },
            {
              id: 'p3',
              name: 'Traditional Kurta Set',
              category: 'Fashion',
              revenue: 1500000,
              units: 6000,
              growth: 28.7,
              margin: 42.1
            }
          ],
          categoryPerformance: [
            {
              category: 'Electronics',
              revenue: 4566000,
              units: 45000,
              growth: 22.5,
              margin: 28.5,
              marketShare: 35.2
            },
            {
              category: 'Fashion',
              revenue: 3044000,
              units: 38000,
              growth: 18.2,
              margin: 38.7,
              marketShare: 28.1
            },
            {
              category: 'Home & Kitchen',
              revenue: 2283000,
              units: 28000,
              growth: 15.8,
              margin: 32.4,
              marketShare: 22.8
            }
          ],
          inventoryTurnover: 8.5,
          profitMargin: 32.4,
          returnRate: 2.8
        },
        market: {
          competitorAnalysis: [
            {
              name: 'Competitor A',
              marketShare: 28.5,
              revenue: 18500000,
              growth: 15.2,
              strengths: ['Strong brand recognition', 'Wide product range'],
              weaknesses: ['Higher prices', 'Slow delivery']
            },
            {
              name: 'Competitor B',
              marketShare: 22.1,
              revenue: 14300000,
              growth: 12.8,
              strengths: ['Fast delivery', 'Good customer service'],
              weaknesses: ['Limited payment options', 'Smaller catalog']
            },
            {
              name: 'GetIt (Us)',
              marketShare: 23.0,
              revenue: 15220000,
              growth: 19.0,
              strengths: ['Mobile banking', 'Cultural adaptation', 'Competitive pricing'],
              weaknesses: ['Newer brand', 'Building trust']
            }
          ],
          marketTrends: [
            {
              trend: 'Mobile Commerce Growth',
              impact: 'high',
              direction: 'positive',
              confidence: 92.5,
              description: 'Mobile shopping increasing 35% year-over-year'
            },
            {
              trend: 'Social Commerce Integration',
              impact: 'medium',
              direction: 'positive',
              confidence: 87.3,
              description: 'Social media influencing 60% of purchase decisions'
            },
            {
              trend: 'Sustainable Products Demand',
              impact: 'medium',
              direction: 'positive',
              confidence: 78.9,
              description: 'Eco-friendly products seeing 28% growth'
            }
          ],
          opportunity: [
            {
              area: 'Rural Market Expansion',
              potential: 5000000,
              investment: 1200000,
              timeframe: '6-12 months',
              priority: 'high'
            },
            {
              area: 'B2B Marketplace',
              potential: 3500000,
              investment: 800000,
              timeframe: '4-8 months',
              priority: 'medium'
            }
          ],
          threats: [
            {
              threat: 'New International Competitor',
              probability: 65.0,
              impact: 85.0,
              mitigation: 'Strengthen customer loyalty programs',
              status: 'monitoring'
            }
          ],
          positioning: {
            strengths: ['Mobile payment integration', 'Local market understanding', 'Competitive pricing'],
            weaknesses: ['Brand awareness', 'Logistics infrastructure'],
            opportunities: ['Rural expansion', 'B2B market', 'Social commerce'],
            threats: ['International competition', 'Economic instability', 'Regulatory changes']
          }
        },
        predictions: {
          salesForecast: [
            {
              period: 'Next Month',
              predicted: 18000000,
              confidence: 89.7,
              factors: ['Festival season', 'Marketing campaigns', 'Product launches']
            },
            {
              period: 'Next Quarter',
              predicted: 52000000,
              confidence: 82.3,
              factors: ['Market expansion', 'New partnerships', 'Seasonal trends']
            }
          ],
          demandPrediction: [
            {
              product: 'Gaming Accessories',
              category: 'Electronics',
              predictedDemand: 15000,
              confidence: 91.2,
              seasonality: 1.25
            },
            {
              product: 'Festival Clothing',
              category: 'Fashion',
              predictedDemand: 12000,
              confidence: 87.8,
              seasonality: 1.45
            }
          ],
          churnPrediction: {
            riskLevel: 'low',
            probability: 5.2,
            affectedCustomers: 6500,
            preventionActions: ['Loyalty program expansion', 'Personalized offers', 'Customer service improvement']
          },
          inventoryOptimization: [
            {
              product: 'Wireless Headphones',
              currentStock: 1200,
              recommendedStock: 2500,
              reason: 'High demand predicted for festival season',
              priority: 'high'
            }
          ],
          pricingRecommendations: [
            {
              product: 'Smartphone Accessories',
              currentPrice: 150,
              recommendedPrice: 135,
              expectedImpact: 15.8,
              confidence: 88.5
            }
          ]
        },
        comparative: {
          industryBenchmarks: [
            {
              metric: 'Conversion Rate',
              ourValue: 12.8,
              industryAverage: 8.5,
              topQuartile: 15.2,
              performance: 'above'
            },
            {
              metric: 'Customer Satisfaction',
              ourValue: 4.2,
              industryAverage: 3.8,
              topQuartile: 4.5,
              performance: 'above'
            }
          ],
          competitorComparison: [
            {
              metric: 'Market Share',
              ourValue: 23.0,
              competitorAverage: 25.3,
              leadingCompetitor: 28.5,
              position: 3
            }
          ],
          performanceGaps: [
            {
              area: 'Brand Awareness',
              currentScore: 65,
              targetScore: 85,
              gap: 20,
              priority: 'high'
            }
          ]
        }
      };

      setTimeout(() => {
        setBiData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadBIData();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `৳${(amount / 10000000).toFixed(1)} Crore`;
    } else if (amount >= 100000) {
      return `৳${(amount / 100000).toFixed(1)} Lakh`;
    } else {
      return `৳${amount.toLocaleString()}`;
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
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

  if (!biData) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Business Intelligence Unavailable</h3>
            <p className="text-muted-foreground">
              Unable to load business intelligence data.
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
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Business Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground">
            Executive insights and predictive analytics for data-driven decisions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(biData.kpis.monthlyRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(biData.kpis.monthlyRevenueChange)}
                  <span className={cn('text-sm', getTrendColor(biData.kpis.monthlyRevenueChange))}>
                    {Math.abs(biData.kpis.monthlyRevenueChange)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold text-green-600">
                  {biData.kpis.activeCustomers.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(biData.kpis.customerGrowth)}
                  <span className={cn('text-sm', getTrendColor(biData.kpis.customerGrowth))}>
                    {Math.abs(biData.kpis.customerGrowth)}%
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Share</p>
                <p className="text-2xl font-bold text-purple-600">
                  {biData.kpis.marketShare}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(biData.kpis.marketShareChange)}
                  <span className={cn('text-sm', getTrendColor(biData.kpis.marketShareChange))}>
                    {Math.abs(biData.kpis.marketShareChange)}%
                  </span>
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {biData.kpis.conversionRate}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(biData.kpis.conversionChange)}
                  <span className={cn('text-sm', getTrendColor(biData.kpis.conversionChange))}>
                    {Math.abs(biData.kpis.conversionChange)}%
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ৳{biData.kpis.averageOrderValue.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(biData.kpis.aovChange)}
                  <span className={cn('text-sm', getTrendColor(biData.kpis.aovChange))}>
                    {Math.abs(biData.kpis.aovChange)}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-pink-600">
                  {biData.kpis.customerSatisfaction}/5
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(biData.kpis.satisfactionChange)}
                  <span className={cn('text-sm', getTrendColor(biData.kpis.satisfactionChange))}>
                    {Math.abs(biData.kpis.satisfactionChange)}
                  </span>
                </div>
              </div>
              <Star className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {(['dashboard', 'revenue', 'customers', 'market', 'predictions'] as const).map((tab) => (
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
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {biData.revenue.revenueByCategory.slice(0, 5).map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm">{formatCurrency(category.revenue)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(category.growth)}
                        <span className={cn('text-xs', getTrendColor(category.growth))}>
                          {Math.abs(category.growth)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {biData.products.topSellingProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(product.revenue)}</div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(product.growth)}
                        <span className={cn('text-xs', getTrendColor(product.growth))}>
                          {Math.abs(product.growth)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {biData.customers.segments.map((segment) => (
                  <div key={segment.segment} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{segment.segment}</h4>
                      <Badge variant="outline">{segment.percentage}%</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Count:</span>
                        <span className="ml-1 font-medium">{segment.count.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Value:</span>
                        <span className="ml-1 font-medium">৳{segment.value.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Competitive Position</h4>
                  <p className="text-sm text-blue-700">
                    Ranked #3 in market share with strong growth potential in mobile commerce
                  </p>
                </div>
                <div className="space-y-3">
                  {biData.market.marketTrends.slice(0, 3).map((trend) => (
                    <div key={trend.trend} className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-sm">{trend.trend}</h5>
                        <p className="text-xs text-muted-foreground">{trend.description}</p>
                      </div>
                      <Badge variant={
                        trend.impact === 'high' ? 'destructive' :
                        trend.impact === 'medium' ? 'default' : 'secondary'
                      }>
                        {trend.confidence}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(biData.revenue.totalRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">Current Revenue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(biData.revenue.projectedRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">Projected Revenue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {biData.kpis.monthlyRevenueChange}%
                </div>
                <div className="text-sm text-muted-foreground">Growth Rate</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biData.revenue.revenueByRegion.map((region) => (
                    <div key={region.region} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{region.region}</span>
                        <span className="text-sm">{formatCurrency(region.revenue)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${region.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{region.percentage}% of total</span>
                        <span className={getTrendColor(region.growth)}>
                          {region.growth > 0 ? '+' : ''}{region.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biData.revenue.paymentMethods.map((method) => (
                    <div key={method.method} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{method.method}</h4>
                        <p className="text-sm text-muted-foreground">{method.percentage}% of transactions</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(method.volume)}</div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(method.growth)}
                          <span className={cn('text-xs', getTrendColor(method.growth))}>
                            {Math.abs(method.growth)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">
                  {biData.customers.totalCustomers.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Customers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  ৳{biData.customers.customerLifetimeValue.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Customer LTV</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {biData.customers.churnRate}%
                </div>
                <div className="text-sm text-muted-foreground">Churn Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {biData.customers.behavior.repeatPurchaseRate}%
                </div>
                <div className="text-sm text-muted-foreground">Repeat Purchase</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {biData.customers.demographics.ageGroups.map((group) => (
                    <div key={group.range} className="flex items-center justify-between">
                      <span className="text-sm">{group.range}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{group.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {biData.customers.demographics.locations.map((location) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <span className="text-sm">{location.location}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${location.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{location.count.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Behavior Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Session Duration</span>
                    <span className="font-medium">{biData.customers.behavior.averageSessionDuration} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pages per Session</span>
                    <span className="font-medium">{biData.customers.behavior.pagesPerSession}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="font-medium">{biData.customers.behavior.bounceRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Repeat Purchase Rate</span>
                    <span className="font-medium text-green-600">{biData.customers.behavior.repeatPurchaseRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {biData.market.competitorAnalysis.map((competitor) => (
                  <div key={competitor.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{competitor.name}</h4>
                      <div className="flex items-center gap-4">
                        <Badge>{competitor.marketShare}% market share</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(competitor.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-sm text-green-700 mb-2">Strengths</h5>
                        <ul className="text-sm space-y-1">
                          {competitor.strengths.map((strength, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm text-red-700 mb-2">Weaknesses</h5>
                        <ul className="text-sm space-y-1">
                          {competitor.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biData.market.marketTrends.map((trend) => (
                    <div key={trend.trend} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{trend.trend}</h4>
                        <Badge variant={
                          trend.impact === 'high' ? 'destructive' :
                          trend.impact === 'medium' ? 'default' : 'secondary'
                        }>
                          {trend.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{trend.description}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className={cn(
                          'font-medium',
                          trend.direction === 'positive' ? 'text-green-600' :
                          trend.direction === 'negative' ? 'text-red-600' : 'text-gray-600'
                        )}>
                          {trend.direction} trend
                        </span>
                        <span className="text-muted-foreground">{trend.confidence}% confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biData.market.opportunity.map((opp) => (
                    <div key={opp.area} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{opp.area}</h4>
                        <Badge variant={
                          opp.priority === 'high' ? 'destructive' :
                          opp.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {opp.priority} priority
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Potential:</span>
                          <span className="ml-1 font-medium">{formatCurrency(opp.potential)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Investment:</span>
                          <span className="ml-1 font-medium">{formatCurrency(opp.investment)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Timeframe:</span>
                          <span className="ml-1 font-medium">{opp.timeframe}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ROI:</span>
                          <span className="ml-1 font-medium text-green-600">
                            {Math.round((opp.potential / opp.investment) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biData.predictions.salesForecast.map((forecast) => (
                    <div key={forecast.period} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{forecast.period}</h4>
                        <Badge className="bg-blue-100 text-blue-700">
                          {forecast.confidence}% confidence
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-primary mb-2">
                        {formatCurrency(forecast.predicted)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Key factors: {forecast.factors.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demand Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biData.predictions.demandPrediction.map((demand) => (
                    <div key={demand.product} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{demand.product}</h4>
                        <Badge variant="outline">{demand.category}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Predicted Demand:</span>
                          <span className="ml-1 font-medium">{demand.predictedDemand.toLocaleString()} units</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="ml-1 font-medium">{demand.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={cn(
                    'text-3xl font-bold',
                    biData.predictions.churnPrediction.riskLevel === 'low' ? 'text-green-600' :
                    biData.predictions.churnPrediction.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  )}>
                    {biData.predictions.churnPrediction.riskLevel.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">Risk Level</div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Probability:</span>
                    <span className="font-medium">{biData.predictions.churnPrediction.probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Affected Customers:</span>
                    <span className="font-medium">{biData.predictions.churnPrediction.affectedCustomers.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Prevention Actions:</h5>
                  <ul className="text-sm space-y-1">
                    {biData.predictions.churnPrediction.preventionActions.map((action, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biData.predictions.inventoryOptimization.map((item) => (
                    <div key={item.product} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{item.product}</h4>
                        <Badge variant={
                          item.priority === 'high' ? 'destructive' :
                          item.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Current:</span>
                          <span>{item.currentStock} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recommended:</span>
                          <span className="font-medium">{item.recommendedStock} units</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biData.predictions.pricingRecommendations.map((pricing) => (
                    <div key={pricing.product} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-2">{pricing.product}</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Current:</span>
                          <span className="ml-1">৳{pricing.currentPrice}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recommended:</span>
                          <span className="ml-1 font-medium text-green-600">৳{pricing.recommendedPrice}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Impact:</span>
                          <span className="ml-1">+{pricing.expectedImpact}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="ml-1">{pricing.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessIntelligence;