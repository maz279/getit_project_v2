/**
 * Animated Gauge Widget Component
 * Professional animated performance gauge for Amazon.com/Shopee.sg-level analytics
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Gauge, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GaugeData {
  current: number;
  target: number;
  max: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface AnimatedGaugeWidgetProps {
  title: string;
  data: GaugeData;
  loading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTargetLine?: boolean;
  animationDelay?: number;
  colorScheme?: 'default' | 'performance' | 'health';
}

const sizeMap = {
  sm: { width: 120, height: 120, strokeWidth: 8 },
  md: { width: 160, height: 160, strokeWidth: 10 },
  lg: { width: 200, height: 200, strokeWidth: 12 }
};

const colorSchemes = {
  default: {
    excellent: '#10b981',
    good: '#3b82f6', 
    warning: '#f59e0b',
    critical: '#ef4444'
  },
  performance: {
    excellent: '#8b5cf6',
    good: '#06b6d4',
    warning: '#f59e0b', 
    critical: '#ef4444'
  },
  health: {
    excellent: '#10b981',
    good: '#84cc16',
    warning: '#eab308',
    critical: '#dc2626'
  }
};

const AnimatedGaugeWidget = ({
  title,
  data,
  loading = false,
  className = '',
  size = 'md',
  showTargetLine = true,
  animationDelay = 0,
  colorScheme = 'default'
}: AnimatedGaugeWidgetProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { width, height, strokeWidth } = sizeMap[size];
  const colors = colorSchemes[colorScheme];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate value changes
  useEffect(() => {
    if (loading) return;

    setIsAnimating(true);
    const startValue = animatedValue;
    const endValue = data.current;
    const difference = endValue - startValue;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepValue = difference / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setAnimatedValue(startValue + (stepValue * currentStep));
      } else {
        setAnimatedValue(endValue);
        setIsAnimating(false);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [data.current, loading]);

  const getProgress = () => {
    return Math.min((animatedValue / data.max) * 100, 100);
  };

  const getTargetProgress = () => {
    return Math.min((data.target / data.max) * 100, 100);
  };

  const getStrokeDasharray = () => {
    const progress = getProgress();
    const progressLength = (progress / 100) * circumference * 0.75; // 75% of circle
    return `${progressLength} ${circumference}`;
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    return colors[data.status];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: animationDelay,
        type: "spring",
        stiffness: 100
      }}
      className={cn("relative", className)}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="text-blue-600 dark:text-blue-400"
              >
                <Gauge className="h-5 w-5" />
              </motion.div>
              {title}
            </div>
            {getStatusIcon()}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center pt-0">
          <div className="relative mb-6">
            {/* Background Circle */}
            <svg width={width} height={height} className="transform -rotate-90">
              <circle
                cx={width / 2}
                cy={height / 2}
                r={radius}
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${circumference * 0.75} ${circumference}`}
                strokeLinecap="round"
              />
              
              {/* Progress Circle */}
              <AnimatePresence>
                <motion.circle
                  cx={width / 2}
                  cy={height / 2}
                  r={radius}
                  stroke={getStatusColor()}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={getStrokeDasharray()}
                  strokeLinecap="round"
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: getStrokeDasharray() }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  style={{
                    filter: `drop-shadow(0 0 8px ${getStatusColor()}40)`
                  }}
                />
              </AnimatePresence>

              {/* Target Line */}
              {showTargetLine && !loading && (
                <motion.line
                  x1={width / 2}
                  y1={height / 2}
                  x2={width / 2 + radius * Math.cos((getTargetProgress() / 100) * 1.5 * Math.PI - Math.PI / 2)}
                  y2={height / 2 + radius * Math.sin((getTargetProgress() / 100) * 1.5 * Math.PI - Math.PI / 2)}
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                />
              )}
            </svg>

            {/* Center Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={animatedValue}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  {loading ? (
                    <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 rounded" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(animatedValue).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {data.unit}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Animated Pulse Ring */}
            {isAnimating && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-400"
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>

          {/* Statistics */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full space-y-3"
            >
              {/* Progress vs Target */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getProgress().toFixed(1)}%
                </span>
              </div>

              {/* Current vs Target */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Target</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.target.toLocaleString()} {data.unit}
                </span>
              </div>

              {/* Status Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor() }}
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                  transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                />
              </div>

              {/* Status Text */}
              <div className="text-center">
                <span 
                  className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${getStatusColor()}20`,
                    color: getStatusColor()
                  }}
                >
                  {data.status.charAt(0).toUpperCase() + data.status.slice(1)} Performance
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedGaugeWidget;