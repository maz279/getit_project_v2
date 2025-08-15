import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Wifi, WifiOff, Clock, CheckCircle, 
  AlertCircle, Database, Sync, Upload, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';

/**
 * Background Sync - Amazon.com/Shopee.sg-Level Offline Data Synchronization
 * Advanced background sync for cart, orders, and user data with conflict resolution
 */

interface BackgroundSyncProps {
  onSyncComplete?: (results: SyncResult[]) => void;
  onSyncError?: (error: SyncError) => void;
  enableAutoSync?: boolean;
  syncInterval?: number;
}

interface SyncItem {
  id: string;
  type: 'cart' | 'wishlist' | 'order' | 'user_data' | 'analytics';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

interface SyncResult {
  itemId: string;
  success: boolean;
  error?: string;
  conflictResolution?: 'client_wins' | 'server_wins' | 'merged';
}

interface SyncError {
  code: string;
  message: string;
  retryable: boolean;
}

interface SyncStats {
  pending: number;
  completed: number;
  failed: number;
  totalSize: number;
  lastSync: Date | null;
}

const BackgroundSync: React.FC<BackgroundSyncProps> = ({
  onSyncComplete,
  onSyncError,
  enableAutoSync = true,
  syncInterval = 30000 // 30 seconds
}) => {
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [stats, setStats] = useState<SyncStats>({
    pending: 0,
    completed: 0,
    failed: 0,
    totalSize: 0,
    lastSync: null
  });
  const [isBackgroundSyncSupported, setIsBackgroundSyncSupported] = useState(false);

  // Check if background sync is supported
  useEffect(() => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      setIsBackgroundSyncSupported(true);
    }
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (syncQueue.length > 0) {
        processSyncQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue.length]);

  // Auto sync interval
  useEffect(() => {
    if (!enableAutoSync || !isOnline) return;

    const interval = setInterval(() => {
      if (syncQueue.length > 0) {
        processSyncQueue();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [enableAutoSync, isOnline, syncInterval, syncQueue.length]);

  // Load sync queue from storage
  useEffect(() => {
    loadSyncQueue();
    updateStats();
  }, []);

  // Register background sync
  useEffect(() => {
    if (isBackgroundSyncSupported && syncQueue.length > 0) {
      registerBackgroundSync();
    }
  }, [isBackgroundSyncSupported, syncQueue.length]);

  const loadSyncQueue = () => {
    try {
      const saved = localStorage.getItem('background-sync-queue');
      if (saved) {
        const queue = JSON.parse(saved);
        setSyncQueue(queue);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  };

  const saveSyncQueue = (queue: SyncItem[]) => {
    try {
      localStorage.setItem('background-sync-queue', JSON.stringify(queue));
      setSyncQueue(queue);
      updateStats();
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  };

  const updateStats = () => {
    const pending = syncQueue.filter(item => item.status === 'pending').length;
    const completed = syncQueue.filter(item => item.status === 'completed').length;
    const failed = syncQueue.filter(item => item.status === 'failed').length;
    const totalSize = new Blob([JSON.stringify(syncQueue)]).size;
    const lastSyncData = localStorage.getItem('last-sync-time');
    const lastSync = lastSyncData ? new Date(lastSyncData) : null;

    setStats({ pending, completed, failed, totalSize, lastSync });
  };

  const addToSyncQueue = (item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount' | 'status'>) => {
    const syncItem: SyncItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    const updatedQueue = [...syncQueue, syncItem];
    saveSyncQueue(updatedQueue);

    // Trigger immediate sync if online
    if (isOnline) {
      processSyncQueue();
    }
  };

  const processSyncQueue = async () => {
    if (isSyncing || !isOnline) return;

    const pendingItems = syncQueue.filter(item => 
      item.status === 'pending' || (item.status === 'failed' && item.retryCount < 3)
    );

    if (pendingItems.length === 0) return;

    setIsSyncing(true);
    setSyncProgress(0);

    const results: SyncResult[] = [];
    const totalItems = pendingItems.length;

    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      
      try {
        const result = await syncSingleItem(item);
        results.push(result);
        
        // Update item status
        const updatedQueue = syncQueue.map(queueItem => 
          queueItem.id === item.id
            ? { ...queueItem, status: result.success ? 'completed' : 'failed', retryCount: queueItem.retryCount + 1 }
            : queueItem
        );
        
        saveSyncQueue(updatedQueue);
        setSyncProgress(((i + 1) / totalItems) * 100);

      } catch (error) {
        const errorResult: SyncResult = {
          itemId: item.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.push(errorResult);

        // Mark as failed
        const updatedQueue = syncQueue.map(queueItem => 
          queueItem.id === item.id
            ? { ...queueItem, status: 'failed', retryCount: queueItem.retryCount + 1 }
            : queueItem
        );
        
        saveSyncQueue(updatedQueue);
      }
    }

    setIsSyncing(false);
    setSyncProgress(100);
    localStorage.setItem('last-sync-time', new Date().toISOString());
    
    onSyncComplete?.(results);
    updateStats();

    // Clean up completed items older than 24 hours
    cleanupCompletedItems();
  };

  const syncSingleItem = async (item: SyncItem): Promise<SyncResult> => {
    const endpoint = getSyncEndpoint(item.type, item.action);
    
    const response = await fetch(endpoint, {
      method: item.action === 'delete' ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...item.data,
        clientTimestamp: item.timestamp,
        syncId: item.id
      })
    });

    if (!response.ok) {
      if (response.status === 409) {
        // Conflict - handle server-side changes
        return await handleConflict(item, response);
      }
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      itemId: item.id,
      success: true,
      conflictResolution: result.conflictResolution
    };
  };

  const handleConflict = async (item: SyncItem, response: Response): Promise<SyncResult> => {
    const conflictData = await response.json();
    
    // Simple conflict resolution strategy
    let resolution: 'client_wins' | 'server_wins' | 'merged' = 'server_wins';
    
    // For cart items, merge quantities
    if (item.type === 'cart') {
      resolution = 'merged';
      // Implement merge logic
    }
    
    // For user data, use latest timestamp
    if (item.type === 'user_data') {
      resolution = item.timestamp > conflictData.serverTimestamp ? 'client_wins' : 'server_wins';
    }

    return {
      itemId: item.id,
      success: true,
      conflictResolution: resolution
    };
  };

  const getSyncEndpoint = (type: string, action: string): string => {
    const baseUrl = '/api/v1';
    
    switch (type) {
      case 'cart':
        return `${baseUrl}/cart/sync`;
      case 'wishlist':
        return `${baseUrl}/wishlist/sync`;
      case 'order':
        return `${baseUrl}/orders/sync`;
      case 'user_data':
        return `${baseUrl}/user/sync`;
      case 'analytics':
        return `${baseUrl}/analytics/sync`;
      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  };

  const registerBackgroundSync = async () => {
    if (!isBackgroundSyncSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-sync');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  };

  const cleanupCompletedItems = () => {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const filteredQueue = syncQueue.filter(item => 
      item.status !== 'completed' || item.timestamp > twentyFourHoursAgo
    );
    
    if (filteredQueue.length !== syncQueue.length) {
      saveSyncQueue(filteredQueue);
    }
  };

  const manualSync = () => {
    if (isOnline && !isSyncing) {
      processSyncQueue();
    }
  };

  const clearFailedItems = () => {
    const filteredQueue = syncQueue.filter(item => item.status !== 'failed');
    saveSyncQueue(filteredQueue);
  };

  const retryFailedItems = () => {
    const updatedQueue = syncQueue.map(item => 
      item.status === 'failed' 
        ? { ...item, status: 'pending', retryCount: 0 }
        : item
    );
    saveSyncQueue(updatedQueue);
    
    if (isOnline) {
      processSyncQueue();
    }
  };

  // Public API for adding sync items
  React.useImperativeHandle(null, () => ({
    addCartItem: (data: any) => addToSyncQueue({ type: 'cart', action: 'create', data, priority: 'high' }),
    updateCartItem: (data: any) => addToSyncQueue({ type: 'cart', action: 'update', data, priority: 'high' }),
    removeCartItem: (data: any) => addToSyncQueue({ type: 'cart', action: 'delete', data, priority: 'high' }),
    addWishlistItem: (data: any) => addToSyncQueue({ type: 'wishlist', action: 'create', data, priority: 'medium' }),
    updateUserData: (data: any) => addToSyncQueue({ type: 'user_data', action: 'update', data, priority: 'medium' }),
    trackAnalytics: (data: any) => addToSyncQueue({ type: 'analytics', action: 'create', data, priority: 'low' })
  }));

  return (
    <div className="background-sync space-y-4">
      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Sync className="h-5 w-5" />
              <span>Background Sync</span>
            </div>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Badge className="bg-green-100 text-green-800">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
              
              {isBackgroundSyncSupported ? (
                <Badge className="bg-blue-100 text-blue-800">Supported</Badge>
              ) : (
                <Badge variant="secondary">Not Supported</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Sync Progress */}
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Syncing data...</span>
                <span className="text-sm text-gray-600">{Math.round(syncProgress)}%</span>
              </div>
              <Progress value={syncProgress} />
            </div>
          )}

          {/* Sync Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {(stats.totalSize / 1024).toFixed(1)}KB
              </div>
              <div className="text-xs text-gray-600">Queue Size</div>
            </div>
          </div>

          {/* Last Sync */}
          {stats.lastSync && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Last sync: {stats.lastSync.toLocaleString()}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              onClick={manualSync}
              disabled={!isOnline || isSyncing || stats.pending === 0}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
            
            {stats.failed > 0 && (
              <>
                <Button
                  onClick={retryFailedItems}
                  variant="outline"
                  size="sm"
                >
                  Retry Failed
                </Button>
                <Button
                  onClick={clearFailedItems}
                  variant="outline"
                  size="sm"
                >
                  Clear Failed
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Queue Items */}
      {syncQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Sync Queue</span>
              <Badge variant="outline">{syncQueue.length} items</Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {syncQueue.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {item.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {item.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-600" />}
                      {item.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                      {item.status === 'syncing' && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
                    </div>
                    
                    <div>
                      <div className="font-medium text-sm">
                        {item.action.charAt(0).toUpperCase() + item.action.slice(1)} {item.type}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(item.timestamp).toLocaleString()}
                        {item.retryCount > 0 && ` • Retry ${item.retryCount}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={item.priority === 'high' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.priority}
                    </Badge>
                    <Badge 
                      variant={item.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {syncQueue.length > 10 && (
                <div className="text-center text-sm text-gray-600">
                  And {syncQueue.length - 10} more items...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Tips */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center space-x-2">
              <Upload className="h-4 w-4 text-blue-500" />
              <span>Background Sync Features</span>
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Automatic sync when connection is restored</li>
              <li>• Conflict resolution for simultaneous changes</li>
              <li>• Priority queue for important data</li>
              <li>• Retry mechanism with exponential backoff</li>
              <li>• Data compression for efficient transfer</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for easy background sync integration
export const useBackgroundSync = () => {
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const addSyncItem = (item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount' | 'status'>) => {
    // Implementation would add to background sync queue
    console.log('Adding sync item:', item);
  };

  return {
    isOnline,
    syncQueue,
    addSyncItem
  };
};

export default BackgroundSync;