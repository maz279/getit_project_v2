
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Plus, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Settings, 
  AlertTriangle,
  Play,
  Pause,
  Clock,
  TrendingUp
} from 'lucide-react';
import { DashboardService } from '@/shared/services/database/DashboardService';
import type { QuickAction, QuickActionLog } from '@/types/dashboard';

export const QuickActionsSection: React.FC = () => {
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [actionLogs, setActionLogs] = useState<QuickActionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [actions, logs] = await Promise.all([
          DashboardService.getQuickActions(),
          DashboardService.getQuickActionLogs(10)
        ]);
        setQuickActions(actions);
        setActionLogs(logs);
      } catch (error) {
        console.error('Error loading quick actions data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleActionClick = async (action: QuickAction) => {
    const logEntry: Omit<QuickActionLog, 'id' | 'created_at'> = {
      action_type: action.action_type,
      action_name: action.action_name,
      execution_status: 'running',
      executed_by: 'current-user', // This should come from auth context
      progress_percentage: 0,
      started_at: new Date().toISOString()
    };

    await DashboardService.logQuickAction(logEntry);
    
    // Simulate action execution
    setTimeout(async () => {
      const completedLog: Omit<QuickActionLog, 'id' | 'created_at'> = {
        ...logEntry,
        execution_status: 'completed',
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
        execution_time_ms: Math.random() * 5000 + 1000,
        result_data: { success: true }
      };
      
      await DashboardService.logQuickAction(completedLog);
      
      // Refresh logs
      const updatedLogs = await DashboardService.getQuickActionLogs(10);
      setActionLogs(updatedLogs);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Plus': return <Plus size={20} />;
      case 'CheckCircle': return <CheckCircle size={20} />;
      case 'DollarSign': return <DollarSign size={20} />;
      case 'FileText': return <FileText size={20} />;
      case 'Settings': return <Settings size={20} />;
      case 'AlertTriangle': return <AlertTriangle size={20} />;
      default: return <Play size={20} />;
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading quick actions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Actions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {actionLogs.filter(log => log.execution_status === 'running').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {actionLogs.filter(log => 
                log.execution_status === 'completed' && 
                new Date(log.created_at).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Success rate: 97%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
            <Pause className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {actionLogs.filter(log => log.execution_status === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                className={`${action.color_class || 'bg-blue-500 hover:bg-blue-600'} text-white h-20 flex-col space-y-2`}
                variant="default"
                onClick={() => handleActionClick(action)}
              >
                {getActionIcon(action.icon_name)}
                <span className="text-xs text-center">{action.action_name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Action History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actionLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {getActionIcon()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{log.action_name}</p>
                    <p className="text-xs text-gray-500">
                      {log.execution_time_ms ? `${Math.round(log.execution_time_ms / 1000)}s` : 'Running...'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(log.execution_status)}>
                    {log.execution_status.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
