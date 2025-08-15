
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { VendorPerformanceService, VendorPerformanceAlert } from '@/shared/services/database/VendorPerformanceService';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AlertsTab: React.FC = () => {
  const [alerts, setAlerts] = useState<VendorPerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await VendorPerformanceService.getPerformanceAlerts();
      // Type assertion to ensure proper typing
      setAlerts((data || []) as VendorPerformanceAlert[]);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await VendorPerformanceService.resolveAlert(alertId, 'admin');
      toast.success('Alert resolved successfully');
      loadAlerts(); // Refresh the list
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertTypeDescription = (type: string) => {
    const descriptions = {
      'performance_drop': 'Performance has dropped below expected levels',
      'target_missed': 'Performance target was not met',
      'quality_issue': 'Quality metrics are below standards',
      'delivery_delay': 'Delivery performance is declining',
      'stock_out': 'Products are frequently out of stock',
      'customer_complaint': 'Increase in customer complaints'
    };
    return descriptions[type as keyof typeof descriptions] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeAlerts = alerts.filter(alert => !alert.is_resolved);
  const resolvedAlerts = alerts.filter(alert => alert.is_resolved);

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Active Alerts ({activeAlerts.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-gray-500">No active alerts. All vendors are performing well!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map(alert => (
                <div key={alert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getSeverityIcon(alert.severity_level)}
                        <Badge className={getSeverityColor(alert.severity_level)}>
                          {alert.severity_level.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{alert.alert_type.replace('_', ' ')}</Badge>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">
                        Vendor: {alert.vendor_id}
                      </h4>
                      <p className="text-gray-600 mb-2">{alert.alert_message}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        {getAlertTypeDescription(alert.alert_type)}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Metric: {alert.metric_name}</span>
                        {alert.current_value && (
                          <span>Current: {alert.current_value}</span>
                        )}
                        {alert.threshold_value && (
                          <span>Threshold: {alert.threshold_value}</span>
                        )}
                        <span>
                          Created: {new Date(alert.created_at || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id!)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Recently Resolved Alerts ({resolvedAlerts.slice(0, 10).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedAlerts.slice(0, 10).map(alert => (
                <div key={alert.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          RESOLVED
                        </Badge>
                        <Badge variant="outline">{alert.alert_type.replace('_', ' ')}</Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Vendor:</strong> {alert.vendor_id}
                      </p>
                      <p className="text-sm text-gray-600">{alert.alert_message}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        <span>
                          Resolved: {new Date(alert.resolved_at || '').toLocaleDateString()}
                        </span>
                        {alert.resolved_by && (
                          <span>By: {alert.resolved_by}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
