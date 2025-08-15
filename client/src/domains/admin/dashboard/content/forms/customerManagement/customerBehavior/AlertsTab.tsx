
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { AlertTriangle, TrendingUp, Users, Clock, CheckCircle, X } from 'lucide-react';
import { BehaviorAlert } from './types';

interface AlertsTabProps {
  alerts: BehaviorAlert[];
  onDismissAlert: (alertId: string) => void;
  onTakeAction: (alertId: string, action: string) => void;
}

export const AlertsTab: React.FC<AlertsTabProps> = ({
  alerts,
  onDismissAlert,
  onTakeAction
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'churn_risk': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high_value_opportunity': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'engagement_drop': return <Users className="h-5 w-5 text-orange-500" />;
      case 'unusual_activity': return <Clock className="h-5 w-5 text-purple-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const highAlerts = alerts.filter(alert => alert.severity === 'high');
  const mediumAlerts = alerts.filter(alert => alert.severity === 'medium');
  const lowAlerts = alerts.filter(alert => alert.severity === 'low');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{criticalAlerts.length}</div>
            <div className="text-sm text-gray-500 text-center">Critical Alerts</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <AlertTriangle className="h-6 w-6 text-orange-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{highAlerts.length}</div>
            <div className="text-sm text-gray-500 text-center">High Priority</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{mediumAlerts.length}</div>
            <div className="text-sm text-gray-500 text-center">Medium Priority</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <AlertTriangle className="h-6 w-6 text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{lowAlerts.length}</div>
            <div className="text-sm text-gray-500 text-center">Low Priority</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Behavior Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="font-medium text-gray-900 mb-1">
                          {alert.customerName}
                        </div>
                        
                        <div className="text-gray-700 mb-3">
                          {alert.message}
                        </div>

                        {alert.suggestedActions.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-600">Suggested Actions:</div>
                            <div className="flex flex-wrap gap-2">
                              {alert.suggestedActions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onTakeAction(alert.id, action)}
                                  className="text-xs"
                                >
                                  {action}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDismissAlert(alert.id)}
                        className="flex items-center space-x-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Dismiss</span>
                      </Button>
                      
                      {alert.actionRequired && (
                        <Button
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Resolve</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No active behavior alerts</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
