// React.memo optimization component for Header with Phase 3 enhancements
import React, { memo } from 'react';
import { Header } from './Header';
import type { HeaderProps } from './Header';
import { useDeviceInfo, useBreakpoint } from '../../../hooks/useMobileResponsive';
import { LazyComponent } from '../../../components/performance/LazyComponent';
import { useRevealAnimation } from '../../../hooks/useAnimation';
import { PerformanceMonitor } from '../../../components/performance/PerformanceMonitor';
import { useAdvancedSearch } from '../../../hooks/useAdvancedSearch';
import { useRealTimeUpdates } from '../../../hooks/useRealTimeUpdates';
import { advancedCache } from '../../../services/AdvancedCacheManager';
import { serviceWorkerManager } from '../../../services/ServiceWorkerManager';
import { useAnalytics } from '../../../components/analytics/AdvancedAnalytics';
import { securityHardening } from '../../../security/SecurityHardening';
import { ErrorResilience } from '../../../components/error/ErrorResilience';
import { SecurityMonitor, useSecurityMonitoring } from '../../../components/security/SecurityMonitor';

// Enhanced memoized Header component with Phase 5 security hardening integration
const MemoizedHeader = memo<HeaderProps & { 
  enablePerformanceMonitoring?: boolean;
  enableAdvancedFeatures?: boolean;
  enableSecurityHardening?: boolean;
}>((props) => {
  const { 
    enablePerformanceMonitoring = false, 
    enableAdvancedFeatures = true,
    enableSecurityHardening = true,
    ...headerProps 
  } = props;
  
  // Phase 3 optimizations
  const { isMobile, isTablet } = useDeviceInfo();
  const breakpoint = useBreakpoint();
  const { elementRef, isVisible } = useRevealAnimation({
    threshold: 0.1,
    triggerOnce: true
  });

  // Phase 4 advanced features
  const advancedSearch = useAdvancedSearch();
  const realTimeUpdates = useRealTimeUpdates();
  const analytics = useAnalytics();

  // Phase 5 security hardening
  const securityMonitoring = useSecurityMonitoring();
  const [securityToken, setSecurityToken] = React.useState<string>('');

  // Initialize advanced features on mount
  React.useEffect(() => {
    if (enableAdvancedFeatures) {
      // Track header load
      analytics.trackPageView('/header');
      analytics.trackInteraction('header', 'component_loaded', {
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        breakpoint: breakpoint.current
      });

      // Initialize service worker for PWA features
      if (serviceWorkerManager.isSupported && !serviceWorkerManager.isRegistered) {
        serviceWorkerManager.register().then(() => {
          analytics.track('pwa', 'service_worker', 'registered');
        });
      }

      // Cache header preferences
      advancedCache.set('header_preferences', {
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        breakpoint: breakpoint.current,
        timestamp: Date.now()
      }, {
        ttl: 3600000, // 1 hour
        tags: ['header', 'preferences'],
        priority: 'medium'
      });
    }
  }, [enableAdvancedFeatures, isMobile, isTablet, breakpoint.current, analytics]);

  // Initialize security hardening
  React.useEffect(() => {
    if (enableSecurityHardening) {
      // Generate secure session token
      const token = securityHardening.generateSecureToken(32);
      setSecurityToken(token);
      sessionStorage.setItem('csrf_token', token);

      // Set up secure cookies for session
      securityHardening.createSecureCookie('session_id', token, {
        maxAge: 3600, // 1 hour
        secure: window.location.protocol === 'https:',
        sameSite: 'strict'
      });

      // Track security initialization
      analytics.track('security', 'hardening', 'initialized', undefined, undefined, {
        securityScore: securityHardening.getSecurityMetrics(),
        csrfTokenGenerated: true
      });
    }
  }, [enableSecurityHardening, analytics]);

  // Handle real-time updates
  React.useEffect(() => {
    if (realTimeUpdates.isConnected && enableAdvancedFeatures) {
      const notifications = realTimeUpdates.getLatestMessage('header_notification');
      if (notifications) {
        analytics.track('realtime', 'notification', 'received', undefined, undefined, notifications);
      }
    }
  }, [realTimeUpdates.lastUpdate, realTimeUpdates.isConnected, enableAdvancedFeatures, analytics]);

  // Responsive loading strategy
  const shouldUseLazyLoading = isMobile || isTablet;

  const HeaderComponent = () => (
    <div 
      ref={elementRef} 
      className={isVisible ? 'animate-fadeIn' : 'opacity-0'}
      onMouseEnter={() => enableAdvancedFeatures && analytics.trackInteraction('header', 'hover')}
      onFocus={() => enableAdvancedFeatures && analytics.trackInteraction('header', 'focus')}
    >
      <Header 
        {...headerProps}
        // Enhanced props with Phase 4 & 5 features
        onSearchClick={(query) => {
          // Security validation for search input
          if (enableSecurityHardening) {
            const sanitizedQuery = securityHardening.sanitizeInput(query, 'text');
            if (sanitizedQuery !== query) {
              analytics.track('security', 'input_sanitized', 'search_query', undefined, undefined, {
                original: query,
                sanitized: sanitizedQuery
              });
            }
            headerProps.onSearchClick?.(sanitizedQuery);
          } else {
            headerProps.onSearchClick?.(query);
          }
          
          if (enableAdvancedFeatures) {
            analytics.trackInteraction('header', 'search_initiated', { query });
            advancedSearch.setQuery(query);
          }
        }}
        onLoginClick={() => {
          headerProps.onLoginClick?.();
          if (enableAdvancedFeatures) {
            analytics.trackInteraction('header', 'login_clicked');
          }
          if (enableSecurityHardening) {
            analytics.track('security', 'authentication', 'login_attempt');
          }
        }}
        onSignupClick={() => {
          headerProps.onSignupClick?.();
          if (enableAdvancedFeatures) {
            analytics.trackInteraction('header', 'signup_clicked');
          }
          if (enableSecurityHardening) {
            analytics.track('security', 'authentication', 'signup_attempt');
          }
        }}
      />
      
      {/* Phase 4 Advanced Features Overlay */}
      {enableAdvancedFeatures && realTimeUpdates.isConnected && (
        <div className="fixed top-2 right-2 z-50">
          <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse" 
               title="Real-time connected" />
        </div>
      )}
      
      {/* Performance monitoring */}
      {enablePerformanceMonitoring && process.env.NODE_ENV === 'development' && (
        <PerformanceMonitor
          isVisible={enablePerformanceMonitoring}
          componentName="Header (Phase 4)"
        />
      )}
      
      {/* Advanced cache status indicator */}
      {enableAdvancedFeatures && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 left-2 text-xs bg-blue-900 text-white p-1 rounded z-50">
          Cache: {Math.round(advancedCache.getStats().hitRate)}% hit rate
        </div>
      )}
      
      {/* Phase 5 Security Monitor */}
      {enableSecurityHardening && process.env.NODE_ENV === 'development' && (
        <SecurityMonitor
          isVisible={false} // Show compact version by default
          onSecurityAlert={(alert) => {
            analytics.track('security', 'alert', alert.type, undefined, undefined, alert);
          }}
          enableRealTimeAlerts={true}
        />
      )}
    </div>
  );

  // Enhanced component rendering with Phase 5 error resilience
  const WrappedHeaderComponent = () => (
    <ErrorResilience
      level="component"
      maxRetries={3}
      resetOnPropsChange={true}
      onError={(error, errorInfo) => {
        analytics.trackError(error, {
          component: 'Header',
          errorInfo: errorInfo.componentStack,
          phase: 'Phase 5 Security Hardening',
          securityMetrics: enableSecurityHardening ? securityHardening.getSecurityMetrics() : null
        });
      }}
    >
      <HeaderComponent />
    </ErrorResilience>
  );

  // Use lazy loading for mobile devices to improve initial load time
  if (shouldUseLazyLoading) {
    return (
      <LazyComponent 
        loadingText="Loading header..."
        className="w-full"
      >
        <WrappedHeaderComponent />
      </LazyComponent>
    );
  }

  return <WrappedHeaderComponent />;
}, (prevProps, nextProps) => {
  // Enhanced comparison function with Phase 5 security hardening
  return (
    prevProps.sticky === nextProps.sticky &&
    prevProps.className === nextProps.className &&
    prevProps.onSearchClick === nextProps.onSearchClick &&
    prevProps.onLoginClick === nextProps.onLoginClick &&
    prevProps.onSignupClick === nextProps.onSignupClick &&
    prevProps.cartCount === nextProps.cartCount &&
    prevProps.enablePerformanceMonitoring === nextProps.enablePerformanceMonitoring &&
    prevProps.enableAdvancedFeatures === nextProps.enableAdvancedFeatures &&
    prevProps.enableSecurityHardening === nextProps.enableSecurityHardening
  );
});

MemoizedHeader.displayName = 'MemoizedHeader';

export { MemoizedHeader as Header };
export default MemoizedHeader;