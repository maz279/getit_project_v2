import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Download, AlertCircle, CheckCircle, 
  Info, X, Zap, Clock, Wifi, WifiOff
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';

/**
 * PWA Updater - Amazon.com/Shopee.sg-Level Progressive Web App Updates
 * Advanced PWA update management with automatic updates and user notifications
 */

interface PWAUpdaterProps {
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
  onUpdateInstalled?: () => void;
  enableAutoUpdate?: boolean;
  updateCheckInterval?: number;
  showUpdatePrompt?: boolean;
}

interface UpdateInfo {
  available: boolean;
  version: string;
  size: string;
  features: string[];
  critical: boolean;
  releaseNotes: string;
}

interface UpdateProgress {
  stage: 'checking' | 'downloading' | 'installing' | 'complete' | 'error';
  progress: number;
  message: string;
}

const PWAUpdater: React.FC<PWAUpdaterProps> = ({
  onUpdateAvailable,
  onUpdateInstalled,
  enableAutoUpdate = false,
  updateCheckInterval = 60000, // 1 minute
  showUpdatePrompt = true
}) => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateProgress, setUpdateProgress] = useState<UpdateProgress>({
    stage: 'checking',
    progress: 0,
    message: 'Checking for updates...'
  });
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<Date | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker and check for updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  // Periodic update checks
  useEffect(() => {
    if (!enableAutoUpdate || !isOnline) return;

    const interval = setInterval(() => {
      checkForUpdates();
    }, updateCheckInterval);

    return () => clearInterval(interval);
  }, [enableAutoUpdate, isOnline, updateCheckInterval]);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      setRegistration(reg);

      // Listen for update events
      reg.addEventListener('updatefound', handleUpdateFound);
      
      // Check for existing updates
      if (reg.waiting) {
        handleServiceWorkerWaiting(reg);
      }

      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  };

  const handleUpdateFound = () => {
    if (!registration) return;

    const newWorker = registration.installing;
    if (!newWorker) return;

    setUpdateProgress({
      stage: 'downloading',
      progress: 0,
      message: 'Downloading update...'
    });

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // Update available
          handleServiceWorkerWaiting(registration);
        } else {
          // First install
          setUpdateProgress({
            stage: 'complete',
            progress: 100,
            message: 'App installed successfully!'
          });
        }
      }
    });

    // Simulate download progress
    simulateDownloadProgress();
  };

  const handleServiceWorkerWaiting = async (reg: ServiceWorkerRegistration) => {
    // Fetch update information
    const updateInfo = await fetchUpdateInfo();
    setUpdateInfo(updateInfo);

    if (enableAutoUpdate && !updateInfo.critical) {
      // Auto-install non-critical updates
      await installUpdate();
    } else if (showUpdatePrompt && !updateDismissed) {
      setShowUpdateBanner(true);
    }

    onUpdateAvailable?.(reg);
  };

  const handleControllerChange = () => {
    setUpdateProgress({
      stage: 'complete',
      progress: 100,
      message: 'Update installed successfully!'
    });
    
    setShowUpdateBanner(false);
    setIsUpdating(false);
    onUpdateInstalled?.();

    // Show success notification
    showUpdateSuccessNotification();
  };

  const checkForUpdates = async () => {
    if (!registration || !isOnline) return;

    try {
      setLastUpdateCheck(new Date());
      await registration.update();
    } catch (error) {
      console.error('Update check failed:', error);
    }
  };

  const fetchUpdateInfo = async (): Promise<UpdateInfo> => {
    try {
      // In a real implementation, this would fetch from your API
      const response = await fetch('/api/app-version');
      const data = await response.json();
      
      return {
        available: true,
        version: data.version || '2.1.0',
        size: data.size || '2.3 MB',
        features: data.features || [
          'Improved performance',
          'New payment methods',
          'Enhanced search',
          'Bug fixes and security updates'
        ],
        critical: data.critical || false,
        releaseNotes: data.releaseNotes || 'Performance improvements and bug fixes.'
      };
    } catch (error) {
      // Fallback update info
      return {
        available: true,
        version: '2.1.0',
        size: '2.3 MB',
        features: [
          'Improved performance',
          'Bug fixes and security updates'
        ],
        critical: false,
        releaseNotes: 'Performance improvements and bug fixes.'
      };
    }
  };

  const installUpdate = async () => {
    if (!registration?.waiting) return;

    setIsUpdating(true);
    setUpdateProgress({
      stage: 'installing',
      progress: 50,
      message: 'Installing update...'
    });

    // Send message to waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  const simulateDownloadProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUpdateProgress({
          stage: 'installing',
          progress: 100,
          message: 'Installing update...'
        });
      } else {
        setUpdateProgress({
          stage: 'downloading',
          progress,
          message: `Downloading update... ${Math.round(progress)}%`
        });
      }
    }, 300);
  };

  const showUpdateSuccessNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('GetIt Bangladesh Updated', {
        body: 'The app has been updated with new features and improvements!',
        icon: '/icons/icon-192x192.png',
        tag: 'pwa-update'
      });
    }
  };

  const dismissUpdate = () => {
    setShowUpdateBanner(false);
    setUpdateDismissed(true);
    
    // Remember dismissal for this session
    sessionStorage.setItem('update-dismissed', 'true');
  };

  const reloadApp = () => {
    window.location.reload();
  };

  return (
    <div className="pwa-updater">
      {/* Update Banner */}
      {showUpdateBanner && updateInfo && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">
                    {updateInfo.critical ? 'Critical Update Available' : 'Update Available'}
                  </div>
                  <div className="text-sm opacity-90">
                    Version {updateInfo.version} • {updateInfo.size}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => installUpdate()}
                  disabled={isUpdating}
                  className="text-white hover:bg-white/20"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Update Now
                    </>
                  )}
                </Button>
                
                {!updateInfo.critical && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={dismissUpdate}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Progress */}
      {isUpdating && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-80">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="font-medium text-sm">Updating App</span>
                </div>
                
                <Progress value={updateProgress.progress} />
                
                <div className="text-xs text-gray-600">
                  {updateProgress.message}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update Details Modal (if needed) */}
      {updateInfo && showUpdateBanner && (
        <div className="mt-16"> {/* Account for banner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>App Update Available</span>
                {updateInfo.critical && (
                  <Badge variant="destructive">Critical</Badge>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Update Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Version</div>
                  <div className="text-lg font-bold">{updateInfo.version}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Size</div>
                  <div className="text-lg font-bold">{updateInfo.size}</div>
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">What's New</div>
                <ul className="space-y-1">
                  {updateInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Release Notes */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Release Notes</div>
                <p className="text-sm text-gray-600">{updateInfo.releaseNotes}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => installUpdate()}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Install Update
                    </>
                  )}
                </Button>
                
                {!updateInfo.critical && (
                  <Button
                    variant="outline"
                    onClick={dismissUpdate}
                  >
                    Later
                  </Button>
                )}
              </div>

              {/* Warning for critical updates */}
              {updateInfo.critical && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is a critical security update that should be installed immediately.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>App Status</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection</span>
            <Badge variant={isOnline ? 'default' : 'secondary'}>
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>

          {/* Update Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Updates</span>
            <Badge variant={updateInfo ? 'destructive' : 'default'}>
              {updateInfo ? 'Available' : 'Up to date'}
            </Badge>
          </div>

          {/* Last Check */}
          {lastUpdateCheck && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Check</span>
              <span className="text-sm text-gray-600">
                {lastUpdateCheck.toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Manual Check */}
          <Button
            onClick={checkForUpdates}
            disabled={!isOnline}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check for Updates
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for PWA update management
export const usePWAUpdater = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          setRegistration(reg);
          
          reg.addEventListener('updatefound', () => {
            setUpdateAvailable(true);
          });
        });
    }
  }, []);

  const installUpdate = async () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return {
    updateAvailable,
    installUpdate,
    registration
  };
};

export default PWAUpdater;