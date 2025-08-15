/**
 * Animated Chart Widget Component
 * Professional animated chart widget for Amazon.com/Shopee.sg-level analytics
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';

interface ChartData {
  name: string;
  value: number;
  revenue?: number;
  orders?: number;
  customers?: number;
  [key: string]: any;
}

interface AnimatedChartWidgetProps {
  title: string;
  data: ChartData[];
  type: 'line' | 'area' | 'bar' | 'pie';
  loading?: boolean;
  className?: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  onRefresh?: () => void;
  animationDelay?: number;
  realTime?: boolean;
}

const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const AnimatedChartWidget = ({
  title,
  data,
  type,
  loading = false,
  className = '',
  height = 300,
  colors = defaultColors,
  showLegend = true,
  onRefresh,
  animationDelay = 0,
  realTime = false
}: AnimatedChartWidgetProps) => {
  const [animatedData, setAnimatedData] = useState<ChartData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Animate data changes
  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [data, loading, animationDelay]);

  // Real-time updates
  useEffect(() => {
    if (realTime && onRefresh) {
      refreshInterval.current = setInterval(() => {
        onRefresh();
      }, 30000); // Refresh every 30 seconds

      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [realTime, onRefresh]);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const getChartIcon = () => {
    switch (type) {
      case 'line':
        return <TrendingUp className="h-5 w-5" />;
      case 'area':
        return <Activity className="h-5 w-5" />;
      case 'bar':
        return <BarChart3 className="h-5 w-5" />;
      case 'pie':
        return <PieChartIcon className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading || animatedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full"
          />
        </div>
      );
    }

    const chartProps = {
      data: animatedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={customTooltip} />
            {showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]}
              strokeWidth={3}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
              animationDuration={1500}
            />
            {animatedData[0]?.revenue && (
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke={colors[1]}
                strokeWidth={2}
                strokeDasharray="5 5"
                animationDuration={1500}
              />
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={customTooltip} />
            {showLegend && <Legend />}
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]}
              fill={`${colors[0]}40`}
              strokeWidth={2}
              animationDuration={1500}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={customTooltip} />
            {showLegend && <Legend />}
            <Bar 
              dataKey="value" 
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={animatedData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1500}
              animationBegin={200}
            >
              {animatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: animationDelay }}
      className={cn("relative", className)}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-4 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="text-blue-600 dark:text-blue-400"
              >
                {getChartIcon()}
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
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ height }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AnimatePresence mode="wait">
                <motion.div
                  key={JSON.stringify(animatedData)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                >
                  {renderChart()}
                </motion.div>
              </AnimatePresence>
            </ResponsiveContainer>
          </motion.div>

          {/* Chart Statistics */}
          {!loading && animatedData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-4 flex justify-around text-sm text-gray-600 dark:text-gray-400 border-t pt-3"
            >
              <div className="text-center">
                <p className="font-medium">Total</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {animatedData.reduce((sum, item) => sum + (item.value || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="font-medium">Average</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(animatedData.reduce((sum, item) => sum + (item.value || 0), 0) / animatedData.length).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="font-medium">Highest</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {Math.max(...animatedData.map(item => item.value || 0)).toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedChartWidget;