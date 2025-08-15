import React from 'react';
import { FooterPerformanceOptimizer } from './performance/FooterPerformanceOptimizer';
import { useFooterAnalytics } from './analytics/FooterAnalytics';
import { GradientAnimation } from './animations/FooterAnimations';
import { GridFooter } from './GridFooter';

// Legacy imports removed to prevent build warnings - components now lazy-loaded via FooterPerformanceOptimizer

interface FooterProps {
  className?: string;
  enablePerformanceOptimization?: boolean;
  enableAnalytics?: boolean;
  enableAnimations?: boolean;
  useGridLayout?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ 
  className = '',
  enablePerformanceOptimization = true,
  enableAnalytics = true,
  enableAnimations = true,
  useGridLayout = true
}) => {
  const { trackView } = useFooterAnalytics();

  React.useEffect(() => {
    if (enableAnalytics) {
      trackView('footer-load', { timestamp: Date.now() });
    }
  }, [enableAnalytics, trackView]);

  // New Grid Layout (Default)
  if (useGridLayout) {
    return (
      <>
        <GridFooter />
      </>
    );
  }

  // Phase 4: Performance-optimized footer with lazy loading and analytics
  if (enablePerformanceOptimization) {
    return (
      <>
        <FooterPerformanceOptimizer 
          enableLazyLoading={true}
          enableAnimations={enableAnimations}
          enableProgressiveLoading={true}
        />
      </>
    );
  }

  // Legacy footer removed to prevent build warnings - fallback to GridFooter
  return (
    <div className={`relative ${className}`}>
      <GridFooter />
    </div>
  );
};