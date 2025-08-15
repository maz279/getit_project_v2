
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart, TrendingUp, Clock, Users, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const DocumentAnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-gray-500">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Avg Review Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-gray-500">-18min from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-gray-500">+3.2% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Active Reviewers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">Same as last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Document Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Document Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Business License</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '35%'}}></div>
                </div>
                <span className="text-sm font-medium">35%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tax Certificate</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '28%'}}></div>
                </div>
                <span className="text-sm font-medium">28%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Identity Proof</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '22%'}}></div>
                </div>
                <span className="text-sm font-medium">22%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bank Statement</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '15%'}}></div>
                </div>
                <span className="text-sm font-medium">15%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Reviewer Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">John Reviewer</div>
                  <div className="text-sm text-gray-500">156 documents reviewed</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">96.8% accuracy</div>
                <div className="text-xs text-gray-500">2.1h avg time</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Sarah Reviewer</div>
                  <div className="text-sm text-gray-500">203 documents reviewed</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">98.2% accuracy</div>
                <div className="text-xs text-gray-500">1.8h avg time</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Compliance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            Document compliance and rejection trends over the past 6 months
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>January 2024</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>92.5%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>December 2023</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>91.2%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>November 2023</span>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>89.8%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
