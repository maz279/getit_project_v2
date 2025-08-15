// Error resilience and recovery system for Phase 5 Security & Testing
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { securityHardening } from '../../security/SecurityHardening';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  level?: 'component' | 'page' | 'application';
}

// Enhanced Error Boundary with retry and recovery mechanisms
export class ErrorResilience extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimer?: NodeJS.Timeout;
  private errorReportingQueue: Array<{ error: Error; errorInfo: ErrorInfo; timestamp: number }> = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Report error to security monitoring
    this.reportError(error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Queue error for batch reporting
    this.queueErrorReport(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, children } = this.props;
    const { hasError } = this.state;
    
    // Reset error state if props change and resetOnPropsChange is true
    if (hasError && resetOnPropsChange && prevProps.children !== children) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        retryCount: 0
      });
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.flushErrorQueue();
  }

  // Report error to monitoring systems
  private reportError(error: Error, errorInfo: ErrorInfo): void {
    const errorReport = {
      type: 'react_error',
      level: this.props.level || 'component',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      retryCount: this.state.retryCount
    };

    // Report to security hardening system
    securityHardening.getSecurityMetrics(); // This will trigger any security logging

    // Send to error reporting service
    this.sendErrorReport(errorReport);
  }

  // Queue error for batch reporting
  private queueErrorReport(error: Error, errorInfo: ErrorInfo): void {
    this.errorReportingQueue.push({
      error,
      errorInfo,
      timestamp: Date.now()
    });

    // Flush queue if it gets too large
    if (this.errorReportingQueue.length >= 10) {
      this.flushErrorQueue();
    }
  }

  // Flush error reporting queue
  private async flushErrorQueue(): Promise<void> {
    if (this.errorReportingQueue.length === 0) return;

    try {
      await fetch('/api/errors/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        },
        body: JSON.stringify({
          errors: this.errorReportingQueue.map(({ error, errorInfo, timestamp }) => ({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp
          }))
        })
      });
      
      this.errorReportingQueue = [];
    } catch (reportingError) {
      console.error('Failed to report errors:', reportingError);
    }
  }

  // Send individual error report
  private async sendErrorReport(errorReport: any): Promise<void> {
    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        },
        body: JSON.stringify(errorReport)
      });
    } catch (reportingError) {
      console.error('Failed to send error report:', reportingError);
    }
  }

  // Retry mechanism
  private handleRetry = (): void => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  // Auto-retry with exponential backoff
  private scheduleAutoRetry(): void {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      
      this.retryTimer = setTimeout(() => {
        this.handleRetry();
      }, delay);
    }
  }

  // Refresh page as last resort
  private handleRefresh = (): void => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { fallback, maxRetries = 3, children } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI with recovery options
      return (
        <div className="error-resilience-container p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Something went wrong
              </h3>
              
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>We encountered an unexpected error. Our team has been notified.</p>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-4">
                    <summary className="cursor-pointer font-medium">Error Details (Development)</summary>
                    <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/40 rounded border font-mono text-xs overflow-x-auto">
                      <div className="text-red-900 dark:text-red-100">
                        <strong>Error:</strong> {error.message}
                      </div>
                      {error.stack && (
                        <div className="mt-2 text-red-800 dark:text-red-200">
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap">{error.stack}</pre>
                        </div>
                      )}
                      {errorInfo?.componentStack && (
                        <div className="mt-2 text-red-800 dark:text-red-200">
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
              
              <div className="mt-4 flex space-x-3">
                {retryCount < maxRetries && (
                  <button
                    onClick={this.handleRetry}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again ({maxRetries - retryCount} attempts left)
                  </button>
                )}
                
                <button
                  onClick={this.handleRefresh}
                  className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Refresh Page
                </button>
              </div>
              
              {retryCount > 0 && (
                <div className="mt-3 text-xs text-red-600 dark:text-red-400">
                  Retry attempt: {retryCount} of {maxRetries}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

// Hook for error recovery
export const useErrorRecovery = () => {
  const [error, setError] = React.useState<Error | null>(null);
  const [isRecovering, setIsRecovering] = React.useState(false);

  const reportError = React.useCallback((error: Error, context?: string) => {
    setError(error);
    
    // Report to monitoring
    const errorReport = {
      type: 'hook_error',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      url: window.location.href
    };

    fetch('/api/errors/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    }).catch(console.error);
  }, []);

  const recover = React.useCallback(async (recoveryFn?: () => Promise<void>) => {
    setIsRecovering(true);
    
    try {
      if (recoveryFn) {
        await recoveryFn();
      }
      setError(null);
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
    } finally {
      setIsRecovering(false);
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isRecovering,
    reportError,
    recover,
    clearError
  };
};

// Higher-order component for error resilience
export const withErrorResilience = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) => {
  const WithErrorResilienceComponent = (props: P) => (
    <ErrorResilience {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorResilience>
  );

  WithErrorResilienceComponent.displayName = 
    `withErrorResilience(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorResilienceComponent;
};

export default ErrorResilience;