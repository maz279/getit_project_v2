// Security monitoring component for Phase 5 Security & Testing
import React, { useState, useEffect, useCallback } from 'react';
import { securityHardening } from '../../security/SecurityHardening';

interface SecurityAlert {
  id: string;
  type: 'xss' | 'csrf' | 'rate_limit' | 'suspicious' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  details?: any;
}

interface SecurityMetrics {
  xssAttempts: number;
  csrfAttempts: number;
  rateLimitHits: number;
  suspiciousRequests: number;
  totalRequests: number;
  securityScore: number;
}

export const SecurityMonitor: React.FC<{
  isVisible?: boolean;
  onSecurityAlert?: (alert: SecurityAlert) => void;
  enableRealTimeAlerts?: boolean;
}> = ({ 
  isVisible = false, 
  onSecurityAlert,
  enableRealTimeAlerts = true 
}) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    xssAttempts: 0,
    csrfAttempts: 0,
    rateLimitHits: 0,
    suspiciousRequests: 0,
    totalRequests: 0,
    securityScore: 100
  });
  const [isMonitoring, setIsMonitoring] = useState(enableRealTimeAlerts);

  // Generate security alert
  const generateAlert = useCallback((
    type: SecurityAlert['type'],
    severity: SecurityAlert['severity'],
    message: string,
    details?: any
  ): SecurityAlert => {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      timestamp: Date.now(),
      details
    };

    onSecurityAlert?.(alert);
    return alert;
  }, [onSecurityAlert]);

  // Update security metrics
  const updateMetrics = useCallback(() => {
    const hardening = securityHardening;
    const rawMetrics = hardening.getSecurityMetrics();
    
    const totalThreats = rawMetrics.xssAttempts + rawMetrics.csrfAttempts + 
                        rawMetrics.suspiciousRequests;
    const securityScore = Math.max(0, 100 - (totalThreats * 5));

    const newMetrics: SecurityMetrics = {
      ...rawMetrics,
      totalRequests: rawMetrics.xssAttempts + rawMetrics.csrfAttempts + 
                    rawMetrics.rateLimitHits + rawMetrics.suspiciousRequests,
      securityScore
    };

    setMetrics(prevMetrics => {
      // Check for new threats and generate alerts
      if (newMetrics.xssAttempts > prevMetrics.xssAttempts) {
        const alert = generateAlert(
          'xss',
          'high',
          `XSS attempt detected (${newMetrics.xssAttempts - prevMetrics.xssAttempts} new)`,
          { count: newMetrics.xssAttempts - prevMetrics.xssAttempts }
        );
        setAlerts(prev => [alert, ...prev.slice(0, 49)]);
      }

      if (newMetrics.csrfAttempts > prevMetrics.csrfAttempts) {
        const alert = generateAlert(
          'csrf',
          'high',
          `CSRF attack detected (${newMetrics.csrfAttempts - prevMetrics.csrfAttempts} new)`,
          { count: newMetrics.csrfAttempts - prevMetrics.csrfAttempts }
        );
        setAlerts(prev => [alert, ...prev.slice(0, 49)]);
      }

      if (newMetrics.rateLimitHits > prevMetrics.rateLimitHits) {
        const alert = generateAlert(
          'rate_limit',
          'medium',
          `Rate limit exceeded (${newMetrics.rateLimitHits - prevMetrics.rateLimitHits} new)`,
          { count: newMetrics.rateLimitHits - prevMetrics.rateLimitHits }
        );
        setAlerts(prev => [alert, ...prev.slice(0, 49)]);
      }

      if (newMetrics.suspiciousRequests > prevMetrics.suspiciousRequests) {
        const alert = generateAlert(
          'suspicious',
          'medium',
          `Suspicious activity detected (${newMetrics.suspiciousRequests - prevMetrics.suspiciousRequests} new)`,
          { count: newMetrics.suspiciousRequests - prevMetrics.suspiciousRequests }
        );
        setAlerts(prev => [alert, ...prev.slice(0, 49)]);
      }

      return newMetrics;
    });
  }, [generateAlert]);

  // Monitor security events
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [isMonitoring, updateMetrics]);

  // Listen for security policy violations
  useEffect(() => {
    const handleViolation = (event: SecurityPolicyViolationEvent) => {
      const alert = generateAlert(
        'policy_violation',
        'high',
        `Security policy violation: ${event.violatedDirective}`,
        {
          directive: event.violatedDirective,
          blockedURI: event.blockedURI,
          originalPolicy: event.originalPolicy
        }
      );
      setAlerts(prev => [alert, ...prev.slice(0, 49)]);
    };

    document.addEventListener('securitypolicyviolation', handleViolation);
    return () => document.removeEventListener('securitypolicyviolation', handleViolation);
  }, [generateAlert]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    securityHardening.resetMetrics();
    setMetrics({
      xssAttempts: 0,
      csrfAttempts: 0,
      rateLimitHits: 0,
      suspiciousRequests: 0,
      totalRequests: 0,
      securityScore: 100
    });
  }, []);

  // Toggle monitoring
  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
  }, []);

  // Get severity color
  const getSeverityColor = (severity: SecurityAlert['severity']): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'low': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  // Get security score color
  const getSecurityScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              metrics.securityScore >= 90 ? 'bg-green-500' :
              metrics.securityScore >= 70 ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-xs font-medium">
              Security: {metrics.securityScore}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="security-monitor bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Security Monitor
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMonitoring}
            className={`px-3 py-1 rounded text-xs font-medium ${
              isMonitoring 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
            }`}
          >
            {isMonitoring ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>

      {/* Security Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Security Score
          </span>
          <span className={`text-lg font-bold ${getSecurityScoreColor(metrics.securityScore)}`}>
            {metrics.securityScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              metrics.securityScore >= 90 ? 'bg-green-500' :
              metrics.securityScore >= 70 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${metrics.securityScore}%` }}
          />
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400">XSS Attempts</div>
          <div className="text-lg font-semibold text-red-600">{metrics.xssAttempts}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400">CSRF Attempts</div>
          <div className="text-lg font-semibold text-orange-600">{metrics.csrfAttempts}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400">Rate Limits</div>
          <div className="text-lg font-semibold text-yellow-600">{metrics.rateLimitHits}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400">Suspicious</div>
          <div className="text-lg font-semibold text-blue-600">{metrics.suspiciousRequests}</div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recent Alerts ({alerts.length})
          </h4>
          {alerts.length > 0 && (
            <button
              onClick={clearAlerts}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              No security alerts
            </div>
          ) : (
            alerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start space-x-2 p-2 rounded border border-gray-200 dark:border-gray-600"
              >
                <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 dark:text-white">{alert.message}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={clearMetrics}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Reset Metrics
        </button>
        <button
          onClick={() => window.open('/admin/security', '_blank')}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          Full Report
        </button>
      </div>
    </div>
  );
};

// Hook for security monitoring
export const useSecurityMonitoring = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  const addAlert = useCallback((alert: SecurityAlert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 99)]);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const getMetrics = useCallback(() => {
    return securityHardening.getSecurityMetrics();
  }, []);

  return {
    isEnabled,
    setIsEnabled,
    alerts,
    addAlert,
    clearAlerts,
    getMetrics
  };
};

export default SecurityMonitor;