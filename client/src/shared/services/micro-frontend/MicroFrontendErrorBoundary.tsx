/**
 * Micro Frontend Error Boundary - Amazon.com/Shopee.sg Standards
 * Error handling for micro-frontend components
 * Phase 1: Micro-Frontend Architecture
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  retryCount: number;
  lastErrorTime: Date;
}

interface MicroFrontendErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
  microFrontendName?: string;
}

class MicroFrontendErrorBoundary extends Component<MicroFrontendErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimer?: NodeJS.Timeout;
  private maxRetries: number;
  private retryDelay: number;

  constructor(props: MicroFrontendErrorBoundaryProps) {
    super(props);
    
    this.maxRetries = props.maxRetries || 3;
    this.retryDelay = props.retryDelay || 1000;
    
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0,
      lastErrorTime: new Date()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastErrorTime: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for monitoring
    this.logError(error, errorInfo);

    // Auto-retry if within retry limit
    if (this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    console.error('MicroFrontend Error:', {
      microFrontendName: this.props.microFrontendName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString()
    });
  }

  private scheduleRetry() {
    this.retryTimer = setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined
      });
    }, this.retryDelay * (this.state.retryCount + 1)); // Exponential backoff
  }

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: this.state.retryCount + 1
    });
  };

  private handleReportError = () => {
    // Send error report to monitoring service
    const errorReport = {
      errorId: this.state.errorId,
      microFrontendName: this.props.microFrontendName,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: this.state.lastErrorTime.toISOString(),
      retryCount: this.state.retryCount
    };

    // In a real implementation, this would send to an error tracking service
    console.log('Error report sent:', errorReport);
  };

  render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center max-w-md">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Micro-Frontend Error
            </h2>
            <p className="text-red-700 mb-4">
              {this.props.microFrontendName 
                ? `The ${this.props.microFrontendName} micro-frontend failed to load.`
                : 'A micro-frontend component failed to load.'
              }
            </p>
            
            {this.state.error && (
              <div className="text-sm text-red-600 mb-4 p-3 bg-red-100 rounded border">
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col space-y-2">
              {this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleManualRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Retry Loading ({this.state.retryCount}/{this.maxRetries})
                </button>
              )}
              
              <button
                onClick={this.handleReportError}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Report Error
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Error ID: {this.state.errorId}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MicroFrontendErrorBoundary;