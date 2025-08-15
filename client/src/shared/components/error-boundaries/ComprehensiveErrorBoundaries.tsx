/**
 * Phase 2: Service Layer Standardization
 * Comprehensive Error Boundaries Implementation
 * Investment: $7,000 | Week 3-4
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug, Shield } from 'lucide-react';

// Error boundary state interface
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  retryCount: number;
  lastErrorTime: number;
}

// Props for error boundary components
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  level: 'page' | 'component' | 'service' | 'critical';
}

// Error reporting interface
interface ErrorReport {
  errorId: string;
  timestamp: number;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo: {
    componentStack: string;
  };
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  level: string;
  context?: any;
}

/**
 * Base error boundary with comprehensive error handling
 */
export class ComprehensiveErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    this.setState(prevState => ({
      ...prevState,
      error,
      errorInfo
    }));

    // Report error to monitoring service
    this.reportError(error, errorInfo);
    
    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    // Reset error state if props changed and resetOnPropsChange is true
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: '',
        retryCount: 0
      });
    }
  }

  /**
   * Report error to monitoring service
   */
  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport: ErrorReport = {
        errorId: this.state.errorId,
        timestamp: Date.now(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId(),
        level: this.props.level,
        context: this.gatherContext()
      };

      // Send to error reporting service
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      }).catch(() => {
        // Fallback to console if reporting fails
        console.error('Error reporting failed:', errorReport);
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  /**
   * Get or create session ID
   */
  private getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('error-boundary-session');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error-boundary-session', sessionId);
    }
    return sessionId;
  };

  /**
   * Gather contextual information for error reporting
   */
  private gatherContext = () => {
    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : undefined,
      connectionType: (navigator as any).connection?.effectiveType,
      localStorage: Object.keys(localStorage).length,
      sessionStorage: Object.keys(sessionStorage).length
    };
  };

  /**
   * Handle retry attempt
   */
  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;
    
    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  /**
   * Handle page reload
   */
  private handleReload = () => {
    window.location.reload();
  };

  /**
   * Handle navigation to home
   */
  private handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * Render error fallback UI based on error level
   */
  private renderErrorFallback = () => {
    const { level, maxRetries = 3 } = this.props;
    const { error, errorInfo, errorId, retryCount } = this.state;
    
    const canRetry = retryCount < maxRetries;
    
    switch (level) {
      case 'critical':
        return <CriticalErrorFallback 
          error={error}
          errorId={errorId}
          onReload={this.handleReload}
        />;
        
      case 'page':
        return <PageErrorFallback 
          error={error}
          errorId={errorId}
          canRetry={canRetry}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />;
        
      case 'service':
        return <ServiceErrorFallback 
          error={error}
          errorId={errorId}
          canRetry={canRetry}
          onRetry={this.handleRetry}
        />;
        
      case 'component':
      default:
        return <ComponentErrorFallback 
          error={error}
          errorId={errorId}
          canRetry={canRetry}
          onRetry={this.handleRetry}
        />;
    }
  };

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;
    
    if (hasError) {
      return fallback || this.renderErrorFallback();
    }
    
    return children;
  }
}

/**
 * Critical error fallback component
 */
const CriticalErrorFallback: React.FC<{
  error?: Error;
  errorId: string;
  onReload: () => void;
}> = ({ error, errorId, onReload }) => (
  <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Critical System Error</h1>
      <p className="text-gray-600 mb-4">
        A critical error has occurred that prevents the application from functioning properly.
      </p>
      <div className="bg-gray-100 rounded p-3 mb-4 text-left">
        <p className="text-sm text-gray-500">Error ID: {errorId}</p>
        {error && (
          <p className="text-sm text-gray-700 mt-1">{error.message}</p>
        )}
      </div>
      <button
        onClick={onReload}
        className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 flex items-center justify-center"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Reload Application
      </button>
    </div>
  </div>
);

/**
 * Page-level error fallback component
 */
const PageErrorFallback: React.FC<{
  error?: Error;
  errorId: string;
  canRetry: boolean;
  onRetry: () => void;
  onGoHome: () => void;
}> = ({ error, errorId, canRetry, onRetry, onGoHome }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Page Error</h1>
      <p className="text-gray-600 mb-4">
        Something went wrong while loading this page. We've been notified and are working on a fix.
      </p>
      <div className="bg-gray-100 rounded p-3 mb-4 text-left">
        <p className="text-sm text-gray-500">Error ID: {errorId}</p>
        {error && (
          <p className="text-sm text-gray-700 mt-1">{error.message}</p>
        )}
      </div>
      <div className="space-y-2">
        {canRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </button>
        )}
        <button
          onClick={onGoHome}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 flex items-center justify-center"
        >
          <Home className="mr-2 h-4 w-4" />
          Go to Home
        </button>
      </div>
    </div>
  </div>
);

/**
 * Service-level error fallback component
 */
const ServiceErrorFallback: React.FC<{
  error?: Error;
  errorId: string;
  canRetry: boolean;
  onRetry: () => void;
}> = ({ error, errorId, canRetry, onRetry }) => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <Bug className="h-5 w-5 text-yellow-400" />
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-yellow-800">Service Unavailable</h3>
        <p className="text-sm text-yellow-700 mt-1">
          This service is temporarily unavailable. Please try again.
        </p>
        <div className="mt-2">
          <p className="text-xs text-yellow-600">Error ID: {errorId}</p>
        </div>
        {canRetry && (
          <div className="mt-3">
            <button
              onClick={onRetry}
              className="text-sm bg-yellow-100 text-yellow-800 py-1 px-3 rounded hover:bg-yellow-200 flex items-center"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

/**
 * Component-level error fallback component
 */
const ComponentErrorFallback: React.FC<{
  error?: Error;
  errorId: string;
  canRetry: boolean;
  onRetry: () => void;
}> = ({ error, errorId, canRetry, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-2">
    <div className="flex">
      <div className="flex-shrink-0">
        <AlertCircle className="h-5 w-5 text-red-400" />
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">Component Error</h3>
        <p className="text-sm text-red-700 mt-1">
          This component failed to render properly.
        </p>
        <div className="mt-2">
          <p className="text-xs text-red-600">Error ID: {errorId}</p>
        </div>
        {canRetry && (
          <div className="mt-3">
            <button
              onClick={onRetry}
              className="text-sm bg-red-100 text-red-800 py-1 px-3 rounded hover:bg-red-200 flex items-center"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Specialized error boundaries for different use cases
export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ComprehensiveErrorBoundary level="critical" maxRetries={0}>
    {children}
  </ComprehensiveErrorBoundary>
);

export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ComprehensiveErrorBoundary level="page" maxRetries={2} resetOnPropsChange>
    {children}
  </ComprehensiveErrorBoundary>
);

export const ServiceErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ComprehensiveErrorBoundary level="service" maxRetries={3}>
    {children}
  </ComprehensiveErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ComprehensiveErrorBoundary level="component" maxRetries={1}>
    {children}
  </ComprehensiveErrorBoundary>
);

/**
 * Hook for programmatic error boundary management
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);
  
  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return { captureError, resetError };
};