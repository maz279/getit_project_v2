/**
 * PHASE 2: RECENT ACTIVITY FEED COMPONENT
 * Activity logging and audit trail for moderation actions
 * Investment: $25,000 | Week 1: Component Decomposition
 * Date: July 26, 2025
 */

import React, { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Flag, 
  AlertTriangle, 
  User, 
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../../../../store';
import { fetchRecentActions } from '../../../../../../../../store/slices/moderationSlice';
import type { RecentModerationAction } from '../types/moderationTypes';

interface RecentActivityFeedProps {
  className?: string;
  limit?: number;
  showFilters?: boolean;
  autoRefresh?: boolean;
}

interface ActivityItemProps {
  action: RecentModerationAction;
  onClick?: (action: RecentModerationAction) => void;
}

// Activity Item Component
const ActivityItem = memo<ActivityItemProps>(({ action, onClick }) => {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'approval':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejection':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'flag':
        return <Flag className="h-4 w-4 text-orange-500" />;
      case 'escalation':
        return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'approval':
        return 'bg-green-50 border-green-200';
      case 'rejection':
        return 'bg-red-50 border-red-200';
      case 'flag':
        return 'bg-orange-50 border-orange-200';
      case 'escalation':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all ${getActionColor(action.type)}`}
      onClick={() => onClick?.(action)}
    >
      <div className="flex items-start space-x-3">
        {/* Action Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getActionIcon(action.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{action.action}</span>
              <Badge variant="outline" className="text-xs">
                {action.productId}
              </Badge>
            </div>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(action.time)}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-2">
            <span className="font-medium">{action.product}</span>
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {action.moderator.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600">{action.moderator}</span>
            </div>

            {(action.reason || action.notes) && (
              <MessageSquare className="h-3 w-3 text-gray-400" />
            )}
          </div>

          {/* Additional Details */}
          {action.reason && (
            <div className="mt-2 text-xs text-gray-600">
              <strong>Reason:</strong> {action.reason}
            </div>
          )}

          {action.notes && (
            <div className="mt-1 text-xs text-gray-600">
              <strong>Notes:</strong> {action.notes.length > 100 ? `${action.notes.slice(0, 100)}...` : action.notes}
            </div>
          )}

          {action.previousStatus && action.newStatus && (
            <div className="mt-2 flex items-center space-x-2 text-xs">
              <Badge variant="outline" className="text-xs">
                {action.previousStatus}
              </Badge>
              <span className="text-gray-400">→</span>
              <Badge variant="outline" className="text-xs">
                {action.newStatus}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ActivityItem.displayName = 'ActivityItem';

// Main Component
export const RecentActivityFeed = memo<RecentActivityFeedProps>(({
  className = '',
  limit = 10,
  showFilters = true,
  autoRefresh = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { recentActions, loading, error } = useSelector((state: RootState) => ({
    recentActions: state.moderation.recentActions,
    loading: state.moderation.loading.actions,
    error: state.moderation.errors.actions,
  }));

  // Local state
  const [filterBy, setFilterBy] = useState('all');
  const [selectedAction, setSelectedAction] = useState<RecentModerationAction | null>(null);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        dispatch(fetchRecentActions(limit));
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, limit, dispatch]);

  // Initial load
  useEffect(() => {
    if (recentActions.length === 0 && !loading) {
      dispatch(fetchRecentActions(limit));
    }
  }, [recentActions.length, loading, limit, dispatch]);

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchRecentActions(limit));
  };

  // Filter actions
  const filteredActions = recentActions.filter(action => {
    if (filterBy === 'all') return true;
    return action.type === filterBy;
  });

  // Handle action click
  const handleActionClick = (action: RecentModerationAction) => {
    setSelectedAction(action);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
            {filteredActions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredActions.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {showFilters && (
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="approval">Approvals</SelectItem>
                  <SelectItem value="rejection">Rejections</SelectItem>
                  <SelectItem value="flag">Flags</SelectItem>
                  <SelectItem value="escalation">Escalations</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Loading State */}
        {loading && recentActions.length === 0 && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load recent activity</p>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredActions.length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No recent activity</p>
            <p className="text-sm text-gray-500">
              {filterBy === 'all' 
                ? 'Moderation actions will appear here as they happen'
                : `No ${filterBy} actions found`
              }
            </p>
          </div>
        )}

        {/* Activity List */}
        {!loading && !error && filteredActions.length > 0 && (
          <div className="space-y-3">
            {filteredActions.map((action) => (
              <ActivityItem
                key={action.id}
                action={action}
                onClick={handleActionClick}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredActions.length >= limit && (
          <div className="text-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => dispatch(fetchRecentActions(limit + 10))}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Activity'
              )}
            </Button>
          </div>
        )}

        {/* Activity Summary */}
        {filteredActions.length > 0 && (
          <div className="mt-6 pt-4 border-t bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {recentActions.filter(a => a.type === 'approval').length}
                </div>
                <div className="text-xs text-gray-600">Approvals</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {recentActions.filter(a => a.type === 'rejection').length}
                </div>
                <div className="text-xs text-gray-600">Rejections</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {recentActions.filter(a => a.type === 'flag').length}
                </div>
                <div className="text-xs text-gray-600">Flags</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {recentActions.filter(a => a.type === 'escalation').length}
                </div>
                <div className="text-xs text-gray-600">Escalations</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Action Detail Modal/Sidebar could go here */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Action Details
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAction(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Product:</strong> {selectedAction.product}
              </div>
              <div>
                <strong>Action:</strong> {selectedAction.action}
              </div>
              <div>
                <strong>Moderator:</strong> {selectedAction.moderator}
              </div>
              <div>
                <strong>Time:</strong> {new Date(selectedAction.time).toLocaleString()}
              </div>
              {selectedAction.reason && (
                <div>
                  <strong>Reason:</strong> {selectedAction.reason}
                </div>
              )}
              {selectedAction.notes && (
                <div>
                  <strong>Notes:</strong> {selectedAction.notes}
                </div>
              )}
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Product Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
});

RecentActivityFeed.displayName = 'RecentActivityFeed';