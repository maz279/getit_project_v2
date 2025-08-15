
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Activity, Server, Database, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSystemHealthLogs } from '@/shared/hooks/useDashboardData';

export const SystemHealthSection: React.FC = () => {
  const { data: healthLogs, isLoading, error } = useSystemHealthLogs();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading system health data</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
      case 'down':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Server className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName?.toLowerCase().includes('database')) {
      return <Database className="h-4 w-4" />;
    }
    if (serviceName?.toLowerCase().includes('api') || serviceName?.toLowerCase().includes('network')) {
      return <Wifi className="h-4 w-4" />;
    }
    return <Server className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthLogs?.slice(0, 6).map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getServiceIcon(log.service_name)}
                  {getStatusIcon(log.status || log.health_status)}
                </div>
                <div>
                  <p className="font-medium text-sm">{log.service_name}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {log.response_time_ms && (
                      <span>Response: {log.response_time_ms}ms</span>
                    )}
                    {log.cpu_usage_percent && (
                      <span>CPU: {log.cpu_usage_percent}%</span>
                    )}
                    {log.memory_usage_percent && (
                      <span>Memory: {log.memory_usage_percent}%</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(log.status || log.health_status || 'unknown')}>
                  {(log.status || log.health_status || 'unknown').toUpperCase()}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(log.recorded_at || log.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {(!healthLogs || healthLogs.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500">No system health data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthSection;
