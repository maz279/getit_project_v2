import React, { useState } from 'react';
import { Progress } from '@/shared/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  BarChart, Database, Globe, Package, Server, Smartphone, 
  TrendingUp, Zap, DollarSign, Clock, AlertTriangle, CheckCircle 
} from 'lucide-react';

const AuditDashboard = () => {
  const [selectedPhase, setSelectedPhase] = useState(0);

  const maturityScores = [
    { area: 'Microservices Architecture', current: 76, target: 100, gap: 24 },
    { area: 'Database Architecture', current: 0, target: 100, gap: 100 },
    { area: 'Frontend Organization', current: 70, target: 100, gap: 30 },
    { area: 'Performance Optimization', current: 5, target: 100, gap: 95 },
    { area: 'Mobile Optimization', current: 35, target: 100, gap: 65 },
    { area: 'AI/ML Integration', current: 25, target: 100, gap: 75 },
  ];

  const amazonStandards = [
    { feature: 'Database-per-Service', getit: '❌ Single DB', standard: '✅ Isolated DBs', priority: 'CRITICAL' },
    { feature: 'Response Time', getit: '150ms average', standard: '<10ms P95', priority: 'CRITICAL' },
    { feature: 'Cache Architecture', getit: 'Redis fallback', standard: 'L1/L2/L3/L4 hierarchy', priority: 'HIGH' },
    { feature: 'Team Structure', getit: 'Shared teams', standard: 'Two-pizza teams', priority: 'MEDIUM' },
    { feature: 'AI Revenue', getit: '5% from AI', standard: '35% from recommendations', priority: 'HIGH' },
  ];

  const shopeeStandards = [
    { feature: 'Mobile-First Design', getit: 'Responsive only', standard: 'Mobile-first PWA', priority: 'HIGH' },
    { feature: 'Image Optimization', getit: 'JPEG/PNG', standard: 'WebP (25-34% smaller)', priority: 'MEDIUM' },
    { feature: 'Load Time', getit: '4s average', standard: '<1s critical', priority: 'HIGH' },
    { feature: 'Live Commerce', getit: 'Basic streaming', standard: 'Integrated shopping', priority: 'MEDIUM' },
    { feature: 'Social Features', getit: 'Limited', standard: 'AR try-on, gamification', priority: 'MEDIUM' },
  ];

  const implementationPhases = [
    {
      phase: 1,
      name: 'Database Architecture Transformation',
      duration: '4 weeks',
      investment: '$45,000',
      roi: '850%',
      keyDeliverables: [
        'Database-per-service implementation',
        'Multi-tier cache hierarchy',
        'Performance optimization to <50ms',
        'Horizontal sharding setup'
      ]
    },
    {
      phase: 2,
      name: 'Frontend Architecture Revolution',
      duration: '4 weeks',
      investment: '$50,000',
      roi: '720%',
      keyDeliverables: [
        'Service consolidation (200+ → 25)',
        'Amazon 5A journey structure',
        'Mobile-first transformation',
        'Bundle size <250KB'
      ]
    },
    {
      phase: 3,
      name: 'Advanced Features & AI',
      duration: '4 weeks',
      investment: '$55,000',
      roi: '650%',
      keyDeliverables: [
        'AI recommendation engine (89% accuracy)',
        'Live commerce platform',
        'AR try-on features',
        'Social commerce integration'
      ]
    },
    {
      phase: 4,
      name: 'Performance Excellence',
      duration: '4 weeks',
      investment: '$60,000',
      roi: '580%',
      keyDeliverables: [
        'Sub-10ms response achievement',
        '1M+ concurrent users',
        '100K+ RPS capability',
        'Advanced monitoring'
      ]
    },
    {
      phase: 5,
      name: 'Enterprise Integration',
      duration: '4 weeks',
      investment: '$45,000',
      roi: '450%',
      keyDeliverables: [
        'Kubernetes orchestration',
        'Multi-region deployment',
        'Disaster recovery (5min RTO)',
        'Enterprise compliance'
      ]
    },
    {
      phase: 6,
      name: 'Bangladesh Market Leadership',
      duration: '4 weeks',
      investment: '$30,000',
      roi: '380%',
      keyDeliverables: [
        'Hyperlocal delivery',
        'Festival features',
        'Rural optimization',
        'Government integration'
      ]
    }
  ];

  const criticalGaps = [
    { gap: 'Database Isolation', severity: 100, impact: 'Performance, scalability, reliability' },
    { gap: 'Response Time', severity: 95, impact: 'User experience, conversion rates' },
    { gap: 'Service Architecture', severity: 87.5, impact: 'Development velocity, maintenance' },
    { gap: 'Mobile Experience', severity: 65, impact: 'Mobile users (75% of traffic)' },
    { gap: 'AI/ML Capabilities', severity: 75, impact: 'Personalization, revenue growth' }
  ];

  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'bg-red-500';
    if (severity >= 60) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">GetIt Enterprise Audit Dashboard</h1>
        <p className="text-xl">Amazon.com/Shopee.sg Standards Comparison & Gap Analysis</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 p-4 rounded-lg">
            <div className="text-3xl font-bold">76%</div>
            <div className="text-sm">Overall Maturity</div>
          </div>
          <div className="bg-white/20 p-4 rounded-lg">
            <div className="text-3xl font-bold">$285K</div>
            <div className="text-sm">Total Investment</div>
          </div>
          <div className="bg-white/20 p-4 rounded-lg">
            <div className="text-3xl font-bold">3,509%</div>
            <div className="text-sm">Expected ROI</div>
          </div>
          <div className="bg-white/20 p-4 rounded-lg">
            <div className="text-3xl font-bold">24 weeks</div>
            <div className="text-sm">Timeline</div>
          </div>
        </div>
      </div>

      {/* Maturity Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Platform Maturity Analysis
          </CardTitle>
          <CardDescription>Current state vs. Amazon.com/Shopee.sg standards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {maturityScores.map((score, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{score.area}</span>
                <span className="text-muted-foreground">{score.current}% / {score.target}%</span>
              </div>
              <div className="relative">
                <Progress value={score.current} className="h-3" />
                <div className="absolute top-0 right-0 text-xs text-red-600 font-semibold">
                  Gap: {score.gap}%
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Standards Comparison */}
      <Tabs defaultValue="amazon" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="amazon">
            <Globe className="w-4 h-4 mr-2" />
            Amazon.com Standards
          </TabsTrigger>
          <TabsTrigger value="shopee">
            <Smartphone className="w-4 h-4 mr-2" />
            Shopee.sg Standards
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="amazon">
          <Card>
            <CardHeader>
              <CardTitle>Amazon.com Standards Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {amazonStandards.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{item.feature}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="text-red-600">GetIt: {item.getit}</span>
                        <span className="mx-2">→</span>
                        <span className="text-green-600">Amazon: {item.standard}</span>
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shopee">
          <Card>
            <CardHeader>
              <CardTitle>Shopee.sg Standards Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shopeeStandards.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{item.feature}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="text-red-600">GetIt: {item.getit}</span>
                        <span className="mx-2">→</span>
                        <span className="text-green-600">Shopee: {item.standard}</span>
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Critical Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Critical Gaps Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalGaps.map((gap, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{gap.gap}</div>
                    <div className="text-sm text-muted-foreground">{gap.impact}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{gap.severity}%</div>
                    <div className="text-xs text-muted-foreground">Severity</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getSeverityColor(gap.severity)}`}
                    style={{ width: `${gap.severity}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            6-Phase Implementation Roadmap
          </CardTitle>
          <CardDescription>24-week transformation plan to achieve Amazon.com/Shopee.sg standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {implementationPhases.map((phase, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all ${selectedPhase === index ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedPhase(index)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Phase {phase.phase}</CardTitle>
                      <CardDescription>{phase.name}</CardDescription>
                    </div>
                    <Badge variant="outline">{phase.duration}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">{phase.investment}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">{phase.roi} ROI</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {phase.keyDeliverables.map((deliverable, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                          <span className="text-muted-foreground">{deliverable}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROI Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Investment & ROI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Investment Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Investment</span>
                  <span className="font-bold">$285,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeline</span>
                  <span className="font-bold">24 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Team Required</span>
                  <span className="font-bold">10 engineers</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Expected Returns</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Annual Revenue Impact</span>
                  <span className="font-bold text-green-600">$10M</span>
                </div>
                <div className="flex justify-between">
                  <span>ROI</span>
                  <span className="font-bold text-green-600">3,509%</span>
                </div>
                <div className="flex justify-between">
                  <span>Payback Period</span>
                  <span className="font-bold text-green-600">10 days</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button size="lg" className="gap-2">
          <Zap className="w-4 h-4" />
          Start Phase 1 Implementation
        </Button>
        <Button size="lg" variant="outline" className="gap-2">
          <Server className="w-4 h-4" />
          Download Full Audit Report
        </Button>
      </div>
    </div>
  );
};

export default AuditDashboard;