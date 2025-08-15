import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Package,
  Truck,
  Shield
} from 'lucide-react';
import { VendorScorecard } from './types';

interface VendorScorecardTabProps {
  scorecard: VendorScorecard;
}

export const VendorScorecardTab: React.FC<VendorScorecardTabProps> = ({ scorecard }) => {
  const [selectedVendor, setSelectedVendor] = useState<string>('vendor-1');

  const mockScorecard: VendorScorecard = {
    vendorId: 'vendor-1',
    period: 'Q4 2024',
    categories: {
      orderManagement: {
        score: 92,
        metrics: {
          fulfillmentRate: 98.5,
          processingTime: 2.3,
          accuracyRate: 96.8,
          cancellationRate: 1.2
        }
      },
      customerService: {
        score: 88,
        metrics: {
          responseTime: 4.2,
          resolutionRate: 94.5,
          satisfactionScore: 4.6,
          communicationQuality: 87.3
        }
      },
      productQuality: {
        score: 95,
        metrics: {
          defectRate: 0.8,
          returnRate: 2.1,
          qualityRating: 4.7,
          complianceScore: 98.2
        }
      },
      logistics: {
        score: 89,
        metrics: {
          onTimeDelivery: 96.3,
          shippingAccuracy: 98.1,
          packagingQuality: 92.4,
          trackingUpdates: 95.7
        }
      },
      businessCompliance: {
        score: 97,
        metrics: {
          documentCompliance: 100,
          policyAdherence: 96.8,
          legalCompliance: 98.5,
          ethicalStandards: 94.2
        }
      }
    },
    recommendations: [
      'Improve customer service response time to under 2 hours',
      'Enhance packaging quality standards',
      'Implement better inventory management system'
    ],
    improvementPlan: [
      'Customer service training program - 30 days',
      'Packaging quality audit - 15 days',
      'Inventory system upgrade - 60 days'
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 95) return 'default';
    if (score >= 85) return 'secondary';
    if (score >= 70) return 'outline';
    return 'destructive';
  };

  const overallScore = Math.round(
    (mockScorecard.categories.orderManagement.score +
     mockScorecard.categories.customerService.score +
     mockScorecard.categories.productQuality.score +
     mockScorecard.categories.logistics.score +
     mockScorecard.categories.businessCompliance.score) / 5
  );

  return (
    <div className="space-y-6">
      {/* Vendor Scorecard Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-yellow-600" />
                <span>Vendor Performance Scorecard</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive vendor performance evaluation for {mockScorecard.period}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <Badge variant={getScoreBadgeVariant(overallScore)} className="text-lg px-3 py-1">
                {overallScore >= 95 ? 'Excellent' : 
                 overallScore >= 85 ? 'Good' : 
                 overallScore >= 70 ? 'Average' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="improvement">Improvement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Order Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-600">
                    {mockScorecard.categories.orderManagement.score}
                  </span>
                  <Badge variant="default">Excellent</Badge>
                </div>
                <Progress value={mockScorecard.categories.orderManagement.score} className="mb-3" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Fulfillment Rate:</span>
                    <span className="font-medium">{mockScorecard.categories.orderManagement.metrics.fulfillmentRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Time:</span>
                    <span className="font-medium">{mockScorecard.categories.orderManagement.metrics.processingTime}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Customer Service</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-green-600">
                    {mockScorecard.categories.customerService.score}
                  </span>
                  <Badge variant="secondary">Good</Badge>
                </div>
                <Progress value={mockScorecard.categories.customerService.score} className="mb-3" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span className="font-medium">{mockScorecard.categories.customerService.metrics.responseTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Satisfaction:</span>
                    <span className="font-medium">{mockScorecard.categories.customerService.metrics.satisfactionScore}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span>Product Quality</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-purple-600">
                    {mockScorecard.categories.productQuality.score}
                  </span>
                  <Badge variant="default">Excellent</Badge>
                </div>
                <Progress value={mockScorecard.categories.productQuality.score} className="mb-3" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Quality Rating:</span>
                    <span className="font-medium">{mockScorecard.categories.productQuality.metrics.qualityRating}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return Rate:</span>
                    <span className="font-medium">{mockScorecard.categories.productQuality.metrics.returnRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Truck className="h-5 w-5 text-orange-600" />
                  <span>Logistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-orange-600">
                    {mockScorecard.categories.logistics.score}
                  </span>
                  <Badge variant="secondary">Good</Badge>
                </div>
                <Progress value={mockScorecard.categories.logistics.score} className="mb-3" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>On-Time Delivery:</span>
                    <span className="font-medium">{mockScorecard.categories.logistics.metrics.onTimeDelivery}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Accuracy:</span>
                    <span className="font-medium">{mockScorecard.categories.logistics.metrics.shippingAccuracy}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <span>Business Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-indigo-600">
                    {mockScorecard.categories.businessCompliance.score}
                  </span>
                  <Badge variant="default">Excellent</Badge>
                </div>
                <Progress value={mockScorecard.categories.businessCompliance.score} className="mb-3" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Document Compliance:</span>
                    <span className="font-medium">{mockScorecard.categories.businessCompliance.metrics.documentCompliance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Legal Compliance:</span>
                    <span className="font-medium">{mockScorecard.categories.businessCompliance.metrics.legalCompliance}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Detailed Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Order Fulfillment</p>
                        <p className="text-sm text-gray-600">Improved by 3.2% this quarter</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      +3.2%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Customer Satisfaction</p>
                        <p className="text-sm text-gray-600">Steady improvement</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      +1.8%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingDown className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Response Time</p>
                        <p className="text-sm text-gray-600">Needs attention</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      -0.5%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Order Accuracy</span>
                      <span className="text-sm text-gray-600">96.8%</span>
                    </div>
                    <Progress value={96.8} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Delivery Performance</span>
                      <span className="text-sm text-gray-600">89.3%</span>
                    </div>
                    <Progress value={89.3} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Quality Standards</span>
                      <span className="text-sm text-gray-600">95.1%</span>
                    </div>
                    <Progress value={95.1} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Compliance Score</span>
                      <span className="text-sm text-gray-600">97.0%</span>
                    </div>
                    <Progress value={97.0} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          {/* Quality Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Assessment & Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Product Quality Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Defect Rate</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        0.8%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Return Rate</span>
                      <Badge variant="secondary">2.1%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.7/5</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Quality Control Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Schedule Quality Audit
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Report Quality Issue
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Set Quality Goals
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Regulatory Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800">Document Compliance</p>
                  <p className="text-2xl font-bold text-green-600">100%</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-blue-800">Policy Adherence</p>
                  <p className="text-2xl font-bold text-blue-600">96.8%</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold text-purple-800">Legal Compliance</p>
                  <p className="text-2xl font-bold text-purple-600">98.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvement" className="space-y-6">
          {/* Improvement Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockScorecard.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Improvement Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockScorecard.improvementPlan.map((plan, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-sm">{plan}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
