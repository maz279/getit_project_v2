import React, { useEffect, useState, useCallback } from 'react';

interface FooterAnalyticsEvent {
  type: 'click' | 'hover' | 'view' | 'scroll';
  element: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface FooterAnalyticsState {
  events: FooterAnalyticsEvent[];
  linkClicks: Record<string, number>;
  sectionViews: Record<string, number>;
  totalEngagement: number;
}

// Analytics service for footer interactions
class FooterAnalyticsService {
  private static instance: FooterAnalyticsService;
  private events: FooterAnalyticsEvent[] = [];
  private listeners: ((state: FooterAnalyticsState) => void)[] = [];

  static getInstance(): FooterAnalyticsService {
    if (!FooterAnalyticsService.instance) {
      FooterAnalyticsService.instance = new FooterAnalyticsService();
    }
    return FooterAnalyticsService.instance;
  }

  trackEvent(event: Omit<FooterAnalyticsEvent, 'timestamp'>): void {
    const fullEvent: FooterAnalyticsEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(fullEvent);

    // Keep only last 1000 events for performance
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    this.notifyListeners();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Footer Analytics Event:', fullEvent);
    }
  }

  subscribe(listener: (state: FooterAnalyticsState) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getAnalyticsState(): FooterAnalyticsState {
    const linkClicks: Record<string, number> = {};
    const sectionViews: Record<string, number> = {};

    this.events.forEach(event => {
      if (event.type === 'click') {
        linkClicks[event.element] = (linkClicks[event.element] || 0) + 1;
      }
      if (event.type === 'view') {
        sectionViews[event.element] = (sectionViews[event.element] || 0) + 1;
      }
    });

    return {
      events: [...this.events],
      linkClicks,
      sectionViews,
      totalEngagement: this.events.length
    };
  }

  private notifyListeners(): void {
    const state = this.getAnalyticsState();
    this.listeners.forEach(listener => listener(state));
  }

  // Export analytics for external systems
  exportAnalytics(): string {
    return JSON.stringify(this.getAnalyticsState(), null, 2);
  }

  // Clear analytics (useful for testing)
  clear(): void {
    this.events = [];
    this.notifyListeners();
  }
}

// React hook for footer analytics
export const useFooterAnalytics = () => {
  const [analyticsState, setAnalyticsState] = useState<FooterAnalyticsState>({
    events: [],
    linkClicks: {},
    sectionViews: {},
    totalEngagement: 0
  });

  useEffect(() => {
    const service = FooterAnalyticsService.getInstance();
    const unsubscribe = service.subscribe(setAnalyticsState);
    
    // Initialize state
    setAnalyticsState(service.getAnalyticsState());

    return unsubscribe;
  }, []);

  const trackClick = useCallback((element: string, metadata?: Record<string, any>) => {
    FooterAnalyticsService.getInstance().trackEvent({
      type: 'click',
      element,
      metadata
    });
  }, []);

  const trackHover = useCallback((element: string, metadata?: Record<string, any>) => {
    FooterAnalyticsService.getInstance().trackEvent({
      type: 'hover',
      element,
      metadata
    });
  }, []);

  const trackView = useCallback((element: string, metadata?: Record<string, any>) => {
    FooterAnalyticsService.getInstance().trackEvent({
      type: 'view',
      element,
      metadata
    });
  }, []);

  const trackScroll = useCallback((element: string, metadata?: Record<string, any>) => {
    FooterAnalyticsService.getInstance().trackEvent({
      type: 'scroll',
      element,
      metadata
    });
  }, []);

  return {
    analyticsState,
    trackClick,
    trackHover,
    trackView,
    trackScroll,
    exportAnalytics: () => FooterAnalyticsService.getInstance().exportAnalytics(),
    clearAnalytics: () => FooterAnalyticsService.getInstance().clear()
  };
};

// Analytics dashboard component (DISABLED - no longer shows popup)
export const FooterAnalyticsDashboard: React.FC = () => {
  // Component completely disabled to prevent popup during search operations
  return null;
};

// Enhanced link component with analytics
interface AnalyticsLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  label?: string;
}

export const AnalyticsLink: React.FC<AnalyticsLinkProps> = ({
  to,
  children,
  className = '',
  onClick,
  label
}) => {
  const { trackClick, trackHover } = useFooterAnalytics();

  const handleClick = () => {
    trackClick(label || to, { url: to });
    onClick?.();
  };

  const handleMouseEnter = () => {
    trackHover(label || to, { url: to });
  };

  return (
    <a
      href={to}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </a>
  );
};

export default FooterAnalyticsService;