/**
 * Micro-Frontend Error Boundary
 * Phase 1 Week 1-2: Micro-Frontend Architecture Implementation
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  microFrontendName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class MicroFrontendErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Micro-frontend error:', error, errorInfo);
    
    // Log error to analytics service
    this.logErrorToAnalytics(error, errorInfo);
    
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  private logErrorToAnalytics(error: Error, errorInfo: ErrorInfo) {
    // Send error to analytics service
    fetch('/api/analytics/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'micro_frontend_error',
        microFrontendName: this.props.microFrontendName,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(console.error);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="micro-frontend-error-boundary">
          <div className="error-container">
            <h2>Micro-Frontend Error</h2>
            <p>
              {this.props.microFrontendName 
                ? `The ${this.props.microFrontendName} micro-frontend encountered an error.`
                : 'A micro-frontend encountered an error.'
              }
            </p>
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error?.stack}</pre>
              <pre>{JSON.stringify(this.state.errorInfo, null, 2)}</pre>
            </details>
            <button 
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MicroFrontendErrorBoundary;