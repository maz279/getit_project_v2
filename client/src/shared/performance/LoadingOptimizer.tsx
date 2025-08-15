/**
 * Phase 2: Loading Optimizer Component
 * Amazon.com/Shopee.sg-Level Intelligent Loading System
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Loader2, Zap, Clock, Target } from 'lucide-react';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  stage: 'initialization' | 'resources' | 'rendering' | 'complete';
  estimatedTime: number;
  actualTime: number;
}

interface LoadingOptimizerProps {
  enableProgressiveLoding?: boolean;
  showLoadingInsights?: boolean;
  targetLoadTime?: number; // in milliseconds
  onLoadingComplete?: (loadTime: number) => void;
  children?: React.ReactNode;
}

const LoadingOptimizer: React.FC<LoadingOptimizerProps> = ({
  enableProgressiveLoding = true,
  showLoadingInsights = false,
  targetLoadTime = 2000,
  onLoadingComplete,
  children,
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    progress: 0,
    stage: 'initialization',
    estimatedTime: targetLoadTime,
    actualTime: 0,
  });
  
  const startTime = useRef<number>(Date.now());
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [loadingStages, setLoadingStages] = useState<Array<{
    stage: string;
    duration: number;
    status: 'pending' | 'loading' | 'complete';
  }>>([]);

  // Initialize loading stages
  useEffect(() => {
    const stages = [
      { stage: 'Initialization', duration: 0, status: 'loading' as const },
      { stage: 'Loading Resources', duration: 0, status: 'pending' as const },
      { stage: 'Rendering Components', duration: 0, status: 'pending' as const },
      { stage: 'Complete', duration: 0, status: 'pending' as const },
    ];
    setLoadingStages(stages);
  }, []);

  // Progressive loading simulation
  useEffect(() => {
    if (!enableProgressiveLoding) return;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime.current;
      const progressPercent = Math.min((elapsed / targetLoadTime) * 100, 100);
      
      let currentStage: LoadingState['stage'] = 'initialization';
      if (progressPercent > 25) currentStage = 'resources';
      if (progressPercent > 60) currentStage = 'rendering';
      if (progressPercent >= 100) currentStage = 'complete';

      setLoadingState(prev => ({
        ...prev,
        progress: progressPercent,
        stage: currentStage,
        actualTime: elapsed,
      }));

      // Update stage statuses
      setLoadingStages(prev => prev.map((stage, index) => {
        if (currentStage === 'complete') {
          return { ...stage, status: 'complete', duration: elapsed / 4 };
        }
        if (index === 0 && progressPercent > 0) {
          return { ...stage, status: 'complete', duration: elapsed * 0.25 };
        }
        if (index === 1 && progressPercent > 25) {
          return { ...stage, status: progressPercent > 60 ? 'complete' : 'loading', duration: elapsed * 0.35 };
        }
        if (index === 2 && progressPercent > 60) {
          return { ...stage, status: progressPercent >= 100 ? 'complete' : 'loading', duration: elapsed * 0.4 };
        }
        return stage;
      }));

      if (progressPercent >= 100) {
        setLoadingState(prev => ({ ...prev, isLoading: false }));
        onLoadingComplete?.(elapsed);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      }
    };

    progressInterval.current = setInterval(updateProgress, 50);
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [enableProgressiveLoding, targetLoadTime, onLoadingComplete]);

  // Get stage display info
  const getStageInfo = (stage: LoadingState['stage']) => {
    switch (stage) {
      case 'initialization':
        return { icon: '🚀', label: 'Initializing Application', description: 'Setting up core systems' };
      case 'resources':
        return { icon: '📦', label: 'Loading Resources', description: 'Fetching components and assets' };
      case 'rendering':
        return { icon: '🎨', label: 'Rendering Interface', description: 'Building user interface' };
      case 'complete':
        return { icon: '✅', label: 'Complete', description: 'Ready for interaction' };
      default:
        return { icon: '⏳', label: 'Loading', description: 'Please wait...' };
    }
  };

  // Get performance status
  const getPerformanceStatus = (actualTime: number, targetTime: number) => {
    if (actualTime <= targetTime) return { color: 'green', label: 'Excellent' };
    if (actualTime <= targetTime * 1.5) return { color: 'yellow', label: 'Good' };
    if (actualTime <= targetTime * 2) return { color: 'orange', label: 'Needs Improvement' };
    return { color: 'red', label: 'Poor' };
  };

  if (loadingState.isLoading) {
    const stageInfo = getStageInfo(loadingState.stage);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              GetIt Bangladesh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Progress */}
            <div className="text-center space-y-4">
              <div className="text-4xl mb-2">{stageInfo.icon}</div>
              <div className="space-y-2">
                <h3 className="font-medium">{stageInfo.label}</h3>
                <p className="text-sm text-muted-foreground">{stageInfo.description}</p>
              </div>
              
              <div className="space-y-2">
                <Progress value={loadingState.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(loadingState.progress)}%</span>
                  <span>{Math.round(loadingState.actualTime)}ms</span>
                </div>
              </div>
            </div>

            {/* Loading Stages */}
            {showLoadingInsights && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Loading Stages</h4>
                <div className="space-y-2">
                  {loadingStages.map((stage, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          stage.status === 'complete' ? 'bg-green-500' :
                          stage.status === 'loading' ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-300'
                        }`} />
                        <span className={stage.status === 'complete' ? 'text-green-600' : ''}>
                          {stage.stage}
                        </span>
                      </div>
                      {stage.status === 'complete' && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(stage.duration)}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Target */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Target: {targetLoadTime}ms
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Current: {Math.round(loadingState.actualTime)}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show performance summary briefly after loading
  if (loadingState.actualTime > 0 && showLoadingInsights) {
    const performanceStatus = getPerformanceStatus(loadingState.actualTime, targetLoadTime);
    
    return (
      <div className="relative">
        {children}
        
        {/* Performance Summary Toast */}
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Load Performance
                </span>
                <Badge variant={performanceStatus.color === 'green' ? 'default' : 'secondary'}>
                  {performanceStatus.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Load Time</span>
                <span className="font-medium">{Math.round(loadingState.actualTime)}ms</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Target</span>
                <span className={`font-medium ${
                  loadingState.actualTime <= targetLoadTime ? 'text-green-500' : 'text-red-500'
                }`}>
                  {targetLoadTime}ms {loadingState.actualTime <= targetLoadTime ? '✓' : '✗'}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Phase 2 Target: {'<'}2s for 95% of users
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingOptimizer;