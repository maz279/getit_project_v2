/**
 * Animated KPI Card Component
 * Professional animated performance widget for Amazon.com/Shopee.sg-level analytics
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { TrendingUp, TrendingDown, Minus, BarChart3, DollarSign, Users, ShoppingCart, Target, Activity, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIData {
  value: number | string;
  change: number;
  target?: number;
  format: 'currency' | 'number' | 'percentage';
  trend: 'up' | 'down' | 'stable';
}

interface AnimatedKPICardProps {
  title: string;
  data: KPIData;
  icon?: 'revenue' | 'orders' | 'customers' | 'conversion' | 'chart' | 'performance' | 'reports';
  loading?: boolean;
  className?: string;
  animationDelay?: number;
}

const iconMap = {
  revenue: DollarSign,
  orders: ShoppingCart,
  customers: Users,
  conversion: Target,
  chart: BarChart3,
  performance: Activity,
  reports: FileText
};

const AnimatedKPICard = ({ 
  title, 
  data, 
  icon = 'chart', 
  loading = false, 
  className = '',
  animationDelay = 0
}: AnimatedKPICardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const IconComponent = iconMap[icon] || BarChart3;

  // Animate number changes
  useEffect(() => {
    if (loading) return;
    
    setIsAnimating(true);
    const targetValue = typeof data.value === 'number' ? data.value : parseFloat(data.value.toString().replace(/[^0-9.-]/g, ''));
    
    if (isNaN(targetValue)) {
      setDisplayValue(0);
      setIsAnimating(false);
      return;
    }

    let startValue = displayValue;
    const difference = targetValue - startValue;
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const stepValue = difference / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setDisplayValue(startValue + (stepValue * currentStep));
      } else {
        setDisplayValue(targetValue);
        setIsAnimating(false);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [data.value, loading]);

  const formatValue = (value: number) => {
    if (data.format === 'currency') {
      return `৳${value.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else if (data.format === 'percentage') {
      return `${value.toFixed(1)}%`;
    } else {
      return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
  };

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getProgressPercentage = () => {
    if (!data.target || typeof data.value !== 'number') return 0;
    return Math.min((data.value / data.target) * 100, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: animationDelay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={cn("relative overflow-hidden", className)}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
          animate={isAnimating ? {
            background: [
              "linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))",
              "linear-gradient(to right, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))",
              "linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))"
            ]
          } : {}}
          transition={{ duration: 2, repeat: isAnimating ? Infinity : 0 }}
        />

        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
            <span>{title}</span>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </motion.div>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0 relative z-10">
          <div className="space-y-3">
            {/* Main Value */}
            <div className="flex items-baseline space-x-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayValue}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {loading ? (
                    <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-24 rounded" />
                  ) : (
                    formatValue(displayValue)
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Change Indicator */}
              {!loading && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className={cn("flex items-center text-sm font-medium", getTrendColor())}
                >
                  {getTrendIcon()}
                  <span className="ml-1">
                    {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}%
                  </span>
                </motion.div>
              )}
            </div>

            {/* Progress Bar (if target exists) */}
            {data.target && !loading && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="space-y-1"
              >
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{getProgressPercentage().toFixed(0)}%</span>
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                  />
                  
                  {/* Progress glow effect */}
                  <motion.div
                    className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                    animate={{
                      x: [-32, getProgressPercentage() * 3]
                    }}
                    transition={{
                      delay: 1.5,
                      duration: 1.5,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Target Information */}
            {data.target && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-xs text-gray-500 flex justify-between"
              >
                <span>Target: {formatValue(data.target)}</span>
                <span className={cn(
                  "font-medium",
                  typeof data.value === 'number' && data.value >= data.target ? "text-green-600" : "text-orange-500"
                )}>
                  {typeof data.value === 'number' && data.value >= data.target ? "Achieved" : "In Progress"}
                </span>
              </motion.div>
            )}
          </div>
        </CardContent>

        {/* Loading Animation */}
        {loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: [-100, 300]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default AnimatedKPICard;