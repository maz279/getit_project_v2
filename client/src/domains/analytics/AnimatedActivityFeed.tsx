/**
 * Animated Activity Feed Widget
 * Real-time activity tracking for Amazon.com/Shopee.sg-level analytics
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { 
  Activity, 
  ShoppingCart, 
  Users, 
  Star, 
  AlertTriangle, 
  TrendingUp,
  Package,
  CreditCard,
  MapPin,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'order' | 'user' | 'review' | 'alert' | 'vendor' | 'product' | 'payment';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    amount?: number;
    rating?: number;
    location?: string;
    status?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
  user?: {
    name: string;
    avatar?: string;
  };
}

interface AnimatedActivityFeedProps {
  title?: string;
  activities: ActivityItem[];
  loading?: boolean;
  className?: string;
  maxItems?: number;
  showTimestamps?: boolean;
  realTime?: boolean;
  onRefresh?: () => void;
  animationDelay?: number;
}

const activityIcons = {
  order: ShoppingCart,
  user: Users,
  review: Star,
  alert: AlertTriangle,
  vendor: TrendingUp,
  product: Package,
  payment: CreditCard
};

const activityColors = {
  order: 'text-blue-600 bg-blue-100',
  user: 'text-green-600 bg-green-100',
  review: 'text-yellow-600 bg-yellow-100',
  alert: 'text-red-600 bg-red-100',
  vendor: 'text-purple-600 bg-purple-100',
  product: 'text-indigo-600 bg-indigo-100',
  payment: 'text-emerald-600 bg-emerald-100'
};

const priorityColors = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500'
};

const AnimatedActivityFeed = ({
  title = "Real-Time Activity",
  activities,
  loading = false,
  className = '',
  maxItems = 10,
  showTimestamps = true,
  realTime = false,
  onRefresh,
  animationDelay = 0
}: AnimatedActivityFeedProps) => {
  const [visibleActivities, setVisibleActivities] = useState<ActivityItem[]>([]);
  const [newActivityCount, setNewActivityCount] = useState(0);

  // Update visible activities with animation
  useEffect(() => {
    if (loading) return;

    const sortedActivities = [...activities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxItems);

    // Check for new activities
    const newActivities = sortedActivities.filter(
      activity => !visibleActivities.find(visible => visible.id === activity.id)
    );

    if (newActivities.length > 0 && visibleActivities.length > 0) {
      setNewActivityCount(newActivities.length);
      setTimeout(() => setNewActivityCount(0), 3000);
    }

    setVisibleActivities(sortedActivities);
  }, [activities, loading, maxItems]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD')}`;
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    const IconComponent = activityIcons[type];
    return IconComponent;
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    return activityColors[type];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: animationDelay }}
      className={cn("relative", className)}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 h-full">
        <CardHeader className="pb-4 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="text-blue-600 dark:text-blue-400"
              >
                <Activity className="h-5 w-5" />
              </motion.div>
              {title}
              {realTime && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </CardTitle>

            {/* New Activity Counter */}
            <AnimatePresence>
              {newActivityCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center"
                >
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    +{newActivityCount} new
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>

        <CardContent className="pt-0 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {visibleActivities.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.type);
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      layout
                      className={cn(
                        "flex items-start space-x-3 p-3 rounded-lg border-l-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer",
                        activity.metadata?.priority ? priorityColors[activity.metadata.priority] : 'border-l-gray-300'
                      )}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      {/* Activity Icon */}
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full",
                        getActivityColor(activity.type)
                      )}>
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                              {activity.description}
                            </p>

                            {/* Activity Metadata */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {activity.metadata?.amount && (
                                <span className="font-medium text-green-600">
                                  {formatAmount(activity.metadata.amount)}
                                </span>
                              )}
                              
                              {activity.metadata?.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{activity.metadata.rating}</span>
                                </div>
                              )}
                              
                              {activity.metadata?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{activity.metadata.location}</span>
                                </div>
                              )}
                              
                              {activity.metadata?.status && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.metadata.status}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* User Avatar */}
                          {activity.user && (
                            <Avatar className="h-8 w-8 ml-3">
                              <AvatarImage src={activity.user.avatar} />
                              <AvatarFallback className="text-xs">
                                {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>

                        {/* Timestamp */}
                        {showTimestamps && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(activity.timestamp)}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Empty State */}
              {!loading && visibleActivities.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedActivityFeed;