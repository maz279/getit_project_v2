
import React from 'react';
import { 
  BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, 
  Package, Star, Globe, Calendar, Target 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

export const ExecutiveSummarySection: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold flex items-center">
        <BarChart3 className="h-6 w-6 mr-2 text-indigo-600" />
        Executive Summary Dashboard
      </h2>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">This Quarter</Button>
        <Button variant="outline" size="sm">Export Report</Button>
      </div>
    </div>

    {/* Key Performance Indicators */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-green-700">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">৳1,245,890</div>
          <div className="flex items-center mt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-gray-500">+18.5% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-700">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">8,767</div>
          <div className="flex items-center mt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-gray-500">+12.3% growth</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-purple-700">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">45,234</div>
          <div className="flex items-center mt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-gray-500">+8.7% increase</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-orange-700">Vendor Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">156</div>
          <div className="flex items-center mt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-gray-500">+23 new vendors</span>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Business Performance Overview */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Monthly Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Revenue Target</span>
              <span className="text-sm">৳1.5M</span>
            </div>
            <Progress value={83} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>৳1.245M achieved</span>
              <span>83% complete</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Order Volume</span>
              <span className="text-sm">10,000</span>
            </div>
            <Progress value={88} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>8,767 orders</span>
              <span>88% complete</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">New Customers</span>
              <span className="text-sm">5,000</span>
            </div>
            <Progress value={76} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>3,800 acquired</span>
              <span>76% complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Customer Satisfaction Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">4.7</div>
              <div className="text-xs text-gray-600">Average Rating</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">94%</div>
              <div className="text-xs text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">5 Stars</span>
              <div className="flex items-center space-x-2">
                <div className="w-16">
                  <Progress value={68} />
                </div>
                <span className="text-xs">68%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">4 Stars</span>
              <div className="flex items-center space-x-2">
                <div className="w-16">
                  <Progress value={22} />
                </div>
                <span className="text-xs">22%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">3 Stars</span>
              <div className="flex items-center space-x-2">
                <div className="w-16">
                  <Progress value={7} />
                </div>
                <span className="text-xs">7%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Market Position & Growth */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Market Position & Growth Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Market Share</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">E-commerce Market</span>
                <Badge variant="secondary">15.2%</Badge>
              </div>
              <Progress value={15.2} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Multi-vendor Platforms</span>
                <Badge variant="secondary">28.7%</Badge>
              </div>
              <Progress value={28.7} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Bangladesh Market</span>
                <Badge variant="secondary">8.9%</Badge>
              </div>
              <Progress value={8.9} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Growth Metrics</h4>
            <div className="space-y-3">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-green-600">+127%</div>
                <div className="text-xs text-gray-600">YoY Revenue Growth</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-blue-600">+89%</div>
                <div className="text-xs text-gray-600">User Base Growth</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-purple-600">+156%</div>
                <div className="text-xs text-gray-600">Vendor Growth</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Competitive Position</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Product Variety</div>
                  <div className="text-xs text-gray-500">50K+ products</div>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Leading
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Delivery Speed</div>
                  <div className="text-xs text-gray-500">2.3 days avg</div>
                </div>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  Competitive
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Customer Service</div>
                  <div className="text-xs text-gray-500">4.7/5 rating</div>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Excellence
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Financial Summary */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Financial Performance Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-xl font-bold text-green-600">৳1.245M</div>
            <div className="text-sm text-gray-600">Gross Revenue</div>
            <div className="text-xs text-green-600 mt-1">+18.5% ↑</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-xl font-bold text-blue-600">৳987K</div>
            <div className="text-sm text-gray-600">Net Revenue</div>
            <div className="text-xs text-blue-600 mt-1">+15.2% ↑</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-xl font-bold text-purple-600">৳258K</div>
            <div className="text-sm text-gray-600">Commission Earned</div>
            <div className="text-xs text-purple-600 mt-1">+22.1% ↑</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-xl font-bold text-orange-600">79%</div>
            <div className="text-sm text-gray-600">Profit Margin</div>
            <div className="text-xs text-orange-600 mt-1">+2.3% ↑</div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Strategic Initiatives */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Strategic Initiatives & Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { 
              initiative: 'Mobile App Launch', 
              progress: 85, 
              status: 'In Progress', 
              deadline: 'Q2 2025',
              priority: 'High'
            },
            { 
              initiative: 'AI-Powered Recommendations', 
              progress: 60, 
              status: 'Development', 
              deadline: 'Q3 2025',
              priority: 'High'
            },
            { 
              initiative: 'Vendor Analytics Dashboard', 
              progress: 40, 
              status: 'Planning', 
              deadline: 'Q3 2025',
              priority: 'Medium'
            },
            { 
              initiative: 'International Expansion', 
              progress: 25, 
              status: 'Research', 
              deadline: 'Q4 2025',
              priority: 'Medium'
            }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-medium">{item.initiative}</span>
                  <Badge 
                    variant={item.priority === 'High' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {item.priority}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Progress value={item.progress} />
                  </div>
                  <span className="text-sm font-medium">{item.progress}%</span>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-sm font-medium">{item.status}</div>
                <div className="text-xs text-gray-500">{item.deadline}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
