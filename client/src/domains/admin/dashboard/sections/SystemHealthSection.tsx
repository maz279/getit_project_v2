
import React from 'react';
import { Heart, CheckCircle, AlertTriangle, XCircle, Activity, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

export const SystemHealthSection: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold flex items-center">
        <Heart className="h-6 w-6 mr-2 text-red-600" />
        System Health Dashboard
      </h2>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">All Systems Operational</span>
        </div>
        <Button variant="outline" size="sm">Refresh Status</Button>
      </div>
    </div>

    {/* Overall Health Score */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-green-700">System Uptime</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">99.9%</div>
          <div className="flex items-center mt-1">
            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-gray-500">30 days</span>
          </div>
          <Progress value={99.9} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-700">Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">95/100</div>
          <span className="text-xs text-gray-500">Excellent</span>
          <Progress value={95} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-yellow-700">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <span className="text-xs text-gray-500">Minor issues</span>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-purple-700">Last Incident</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">7d</div>
          <span className="text-xs text-gray-500">ago</span>
        </CardContent>
      </Card>
    </div>

    {/* Service Status */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Service Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { service: 'Web Application', status: 'operational', uptime: '99.9%', responseTime: '245ms' },
            { service: 'API Gateway', status: 'operational', uptime: '99.8%', responseTime: '156ms' },
            { service: 'Database Cluster', status: 'operational', uptime: '100%', responseTime: '12ms' },
            { service: 'Payment Gateway', status: 'warning', uptime: '98.5%', responseTime: '890ms' },
            { service: 'Search Service', status: 'operational', uptime: '99.7%', responseTime: '89ms' },
            { service: 'CDN Network', status: 'operational', uptime: '99.9%', responseTime: '67ms' },
            { service: 'Email Service', status: 'maintenance', uptime: '95.2%', responseTime: 'N/A' },
            { service: 'SMS Gateway', status: 'operational', uptime: '99.1%', responseTime: '234ms' }
          ].map((service, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                {service.status === 'operational' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {service.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                {service.status === 'maintenance' && <XCircle className="h-5 w-5 text-blue-500" />}
                <div>
                  <div className="font-semibold">{service.service}</div>
                  <div className="text-sm text-gray-500">Response: {service.responseTime}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={
                    service.status === 'operational' ? 'outline' :
                    service.status === 'warning' ? 'secondary' : 'default'
                  }
                  className={
                    service.status === 'operational' ? 'text-green-700 border-green-300' :
                    service.status === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                  }
                >
                  {service.status}
                </Badge>
                <div className="text-sm font-medium mt-1">{service.uptime}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Resource Monitoring */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Resource Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Server Resources</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">CPU Usage</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <Progress value={45} />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm font-medium">67%</span>
              </div>
              <Progress value={67} />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Disk Usage</span>
                <span className="text-sm font-medium">34%</span>
              </div>
              <Progress value={34} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Network Health</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Bandwidth Usage</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <Progress value={78} />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Connection Pool</span>
                <span className="text-sm font-medium">23%</span>
              </div>
              <Progress value={23} />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Latency</span>
                <span className="text-sm font-medium">Low</span>
              </div>
              <Progress value={15} className="text-green-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Security Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Threat Level</span>
                <Badge variant="outline" className="text-green-700 border-green-300">Low</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Failed Logins</span>
                <span className="text-sm font-medium">5</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">SSL Certificate</span>
                <Badge variant="outline" className="text-green-700 border-green-300">Valid</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Recent Health Events */}
    <Card>
      <CardHeader>
        <CardTitle>Recent Health Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { type: 'info', event: 'System health check completed successfully', time: '5 minutes ago', status: 'resolved' },
            { type: 'warning', event: 'Email service temporary maintenance started', time: '1 hour ago', status: 'ongoing' },
            { type: 'success', event: 'Database performance optimization completed', time: '3 hours ago', status: 'resolved' },
            { type: 'info', event: 'CDN cache cleared and refreshed', time: '6 hours ago', status: 'resolved' },
            { type: 'warning', event: 'High memory usage detected on API server', time: '8 hours ago', status: 'resolved' }
          ].map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'success' ? 'bg-green-500' :
                  event.type === 'warning' ? 'bg-yellow-500' :
                  event.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <span className="text-sm">{event.event}</span>
                  <div className="text-xs text-gray-500">{event.time}</div>
                </div>
              </div>
              <Badge 
                variant={event.status === 'resolved' ? 'outline' : 'secondary'}
                className={event.status === 'resolved' ? 'text-green-700 border-green-300' : 'text-yellow-700'}
              >
                {event.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
