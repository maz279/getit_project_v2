import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * useSession - Advanced Session Management Hook
 * Amazon.com/Shopee.sg-Level Session Features with Security Monitoring
 */
export const useSession = () => {
  const { user, trackUserActivity } = useAuth();
  const [sessionState, setSessionState] = useState({
    loading: false,
    error: null,
    sessionInfo: null,
    activeSessions: [],
    deviceSessions: [],
    securityAlerts: [],
    refreshing: false,
    autoRefreshEnabled: true,
    expiresAt: null,
    lastActivity: null,
    idleWarning: false,
    idleTimeout: null
  });

  // Initialize session monitoring
  useEffect(() => {
    if (user) {
      loadSessionInfo();
      setupIdleDetection();
      setupAutoRefresh();
    }

    return () => {
      clearIdleTimeout();
      clearAutoRefresh();
    };
  }, [user]);

  // Load current session information
  const loadSessionInfo = useCallback(async () => {
    try {
      setSessionState(prev => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setSessionState(prev => ({ ...prev, loading: false }));
        return;
      }

      const response = await fetch('/api/v1/users/session-info', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const sessionInfo = await response.json();
        setSessionState(prev => ({
          ...prev,
          loading: false,
          sessionInfo,
          expiresAt: new Date(sessionInfo.expiresAt),
          lastActivity: new Date()
        }));
      } else {
        setSessionState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load session information'
        }));
      }
    } catch (error) {
      console.error('Session info load error:', error);
      setSessionState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load session information'
      }));
    }
  }, []);

  // Load all active sessions for user
  const loadActiveSessions = useCallback(async () => {
    try {
      setSessionState(prev => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/v1/users/active-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { sessions, deviceSessions } = await response.json();
        setSessionState(prev => ({
          ...prev,
          loading: false,
          activeSessions: sessions,
          deviceSessions
        }));
      } else {
        const error = await response.json();
        setSessionState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load active sessions'
        }));
      }
    } catch (error) {
      console.error('Active sessions load error:', error);
      setSessionState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load active sessions'
      }));
    }
  }, []);

  // Refresh current session token
  const refreshSession = useCallback(async () => {
    try {
      setSessionState(prev => ({ ...prev, refreshing: true, error: null }));

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/v1/users/refresh-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { token: newToken, expiresAt } = await response.json();
        
        localStorage.setItem('auth_token', newToken);
        setSessionState(prev => ({
          ...prev,
          refreshing: false,
          expiresAt: new Date(expiresAt),
          lastActivity: new Date()
        }));

        // Track session refresh
        await trackUserActivity('session_refreshed', user.id);
        
        return { success: true };
      } else {
        const error = await response.json();
        setSessionState(prev => ({
          ...prev,
          refreshing: false,
          error: error.message || 'Failed to refresh session'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setSessionState(prev => ({
        ...prev,
        refreshing: false,
        error: 'Failed to refresh session'
      }));
      return { success: false, error: 'Failed to refresh session' };
    }
  }, [user, trackUserActivity]);

  // Terminate specific session
  const terminateSession = useCallback(async (sessionId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/users/sessions/${sessionId}/terminate`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSessionState(prev => ({
          ...prev,
          activeSessions: prev.activeSessions.filter(s => s.id !== sessionId),
          deviceSessions: prev.deviceSessions.filter(s => s.id !== sessionId)
        }));

        // Track session termination
        await trackUserActivity('session_terminated', user.id);
        
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Session termination error:', error);
      return { success: false, error: 'Failed to terminate session' };
    }
  }, [user, trackUserActivity]);

  // Terminate all other sessions
  const terminateAllOtherSessions = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/v1/users/sessions/terminate-others', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSessionState(prev => ({
          ...prev,
          activeSessions: prev.activeSessions.filter(s => s.isCurrent),
          deviceSessions: prev.deviceSessions.filter(s => s.isCurrent)
        }));

        // Track bulk session termination
        await trackUserActivity('all_sessions_terminated', user.id);
        
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Bulk session termination error:', error);
      return { success: false, error: 'Failed to terminate other sessions' };
    }
  }, [user, trackUserActivity]);

  // Setup idle detection
  const setupIdleDetection = useCallback(() => {
    const idleTime = 15 * 60 * 1000; // 15 minutes
    const warningTime = 13 * 60 * 1000; // 13 minutes (2 minute warning)

    let idleTimer;
    let warningTimer;

    const resetTimers = () => {
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      
      setSessionState(prev => ({ 
        ...prev, 
        idleWarning: false, 
        lastActivity: new Date() 
      }));

      warningTimer = setTimeout(() => {
        setSessionState(prev => ({ ...prev, idleWarning: true }));
      }, warningTime);

      idleTimer = setTimeout(() => {
        // Auto-logout on idle
        window.location.href = '/login?reason=idle';
      }, idleTime);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimers, true);
    });

    resetTimers();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimers, true);
      });
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
    };
  }, []);

  // Setup automatic session refresh
  const setupAutoRefresh = useCallback(() => {
    if (!sessionState.autoRefreshEnabled) return;

    const refreshInterval = setInterval(() => {
      const now = new Date();
      const expiresAt = sessionState.expiresAt;
      
      if (expiresAt) {
        const timeLeft = expiresAt.getTime() - now.getTime();
        const refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry
        
        if (timeLeft <= refreshThreshold && timeLeft > 0) {
          refreshSession();
        }
      }
    }, 60000); // Check every minute

    setSessionState(prev => ({ ...prev, autoRefreshTimer: refreshInterval }));

    return () => clearInterval(refreshInterval);
  }, [sessionState.autoRefreshEnabled, sessionState.expiresAt, refreshSession]);

  // Clear idle timeout
  const clearIdleTimeout = useCallback(() => {
    if (sessionState.idleTimeout) {
      clearTimeout(sessionState.idleTimeout);
      setSessionState(prev => ({ ...prev, idleTimeout: null }));
    }
  }, [sessionState.idleTimeout]);

  // Clear auto refresh
  const clearAutoRefresh = useCallback(() => {
    if (sessionState.autoRefreshTimer) {
      clearInterval(sessionState.autoRefreshTimer);
      setSessionState(prev => ({ ...prev, autoRefreshTimer: null }));
    }
  }, [sessionState.autoRefreshTimer]);

  // Toggle auto refresh
  const toggleAutoRefresh = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      autoRefreshEnabled: !prev.autoRefreshEnabled
    }));
  }, []);

  // Extend session (for idle warning)
  const extendSession = useCallback(async () => {
    const result = await refreshSession();
    if (result.success) {
      setSessionState(prev => ({ ...prev, idleWarning: false }));
    }
    return result;
  }, [refreshSession]);

  // Get security alerts
  const loadSecurityAlerts = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/v1/users/security-alerts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const alerts = await response.json();
        setSessionState(prev => ({ ...prev, securityAlerts: alerts }));
        return { success: true, alerts };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Security alerts load error:', error);
      return { success: false };
    }
  }, []);

  return {
    // State
    ...sessionState,
    
    // Methods
    loadSessionInfo,
    loadActiveSessions,
    refreshSession,
    terminateSession,
    terminateAllOtherSessions,
    toggleAutoRefresh,
    extendSession,
    loadSecurityAlerts,

    // Computed values
    isExpired: sessionState.expiresAt ? new Date() >= sessionState.expiresAt : false,
    timeUntilExpiry: sessionState.expiresAt ? 
      Math.max(0, sessionState.expiresAt.getTime() - new Date().getTime()) : 0,
    minutesUntilExpiry: sessionState.expiresAt ? 
      Math.max(0, Math.floor((sessionState.expiresAt.getTime() - new Date().getTime()) / 60000)) : 0,
    totalActiveSessions: sessionState.activeSessions.length,
    hasMultipleSessions: sessionState.activeSessions.length > 1,
    idleTimeRemaining: sessionState.idleWarning ? 120 : null // 2 minutes after warning
  };
};

export default useSession;