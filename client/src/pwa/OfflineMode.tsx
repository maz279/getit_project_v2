import React, { useState, useEffect, ReactNode } from 'react';
import { WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

/**
 * Offline Mode - Amazon.com/Shopee.sg-Level Offline Functionality
 * Comprehensive offline support with data sync and user feedback
 */

interface OfflineModeProps {
  children: ReactNode;
  enableOfflineIndicator?: boolean;
  enableDataSync?: boolean;
  enableOfflineStorage?: boolean;
}

interface OfflineData {
  cart: any[];
  wishlist: any[];
  recentlyViewed: any[];
  userPreferences: any;
  cachedPages: string[];
}

interface SyncQueueItem {
  id: string;
  type: 'cart' | 'wishlist' | 'order' | 'user_action';
  action: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

const OfflineMode: React.FC<OfflineModeProps> = ({
  children,
  enableOfflineIndicator = true,
  enableDataSync = true,
  enableOfflineStorage = true
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    cart: [],
    wishlist: [],
    recentlyViewed: [],
    userPreferences: {},
    cachedPages: []
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [showOfflineActions, setShowOfflineActions] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (enableDataSync) {
        syncOfflineData();
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
  }, [enableDataSync]);

  // Load offline data from localStorage
  useEffect(() => {
    if (enableOfflineStorage) {
      loadOfflineData();
    }
  }, [enableOfflineStorage]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      syncOfflineData();
    }
  }, [isOnline, syncQueue.length]);

  const loadOfflineData = () => {
    try {
      const saved = localStorage.getItem('getit-offline-data');
      if (saved) {
        setOfflineData(JSON.parse(saved));
      }

      const savedQueue = localStorage.getItem('getit-sync-queue');
      if (savedQueue) {
        setSyncQueue(JSON.parse(savedQueue));
      }

      const savedSyncTime = localStorage.getItem('getit-last-sync');
      if (savedSyncTime) {
        setLastSyncTime(new Date(savedSyncTime));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const saveOfflineData = (data: OfflineData) => {
    try {
      localStorage.setItem('getit-offline-data', JSON.stringify(data));
      setOfflineData(data);
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const addToSyncQueue = (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) => {
    const queueItem: SyncQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    const updatedQueue = [...syncQueue, queueItem];
    setSyncQueue(updatedQueue);
    localStorage.setItem('getit-sync-queue', JSON.stringify(updatedQueue));
  };

  const syncOfflineData = async () => {
    if (!isOnline || syncInProgress || syncQueue.length === 0) return;

    setSyncInProgress(true);
    const failedItems: SyncQueueItem[] = [];

    for (const item of syncQueue) {
      try {
        await syncSingleItem(item);
      } catch (error) {
        console.error(`Sync failed for item ${item.id}:`, error);
        
        // Retry logic
        if (item.retryCount < 3) {
          failedItems.push({
            ...item,
            retryCount: item.retryCount + 1
          });
        }
      }
    }

    // Update sync queue with failed items only
    setSyncQueue(failedItems);
    localStorage.setItem('getit-sync-queue', JSON.stringify(failedItems));
    
    // Update last sync time
    const now = new Date();
    setLastSyncTime(now);
    localStorage.setItem('getit-last-sync', now.toISOString());
    
    setSyncInProgress(false);
  };

  const syncSingleItem = async (item: SyncQueueItem): Promise<void> => {
    const endpoint = getSyncEndpoint(item.type, item.action);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data)
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
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
      case 'user_action':
        return `${baseUrl}/analytics/sync`;
      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  };

  // Offline action handlers
  const addToCartOffline = (product: any) => {
    const updatedCart = [...offlineData.cart, { ...product, addedAt: Date.now() }];
    saveOfflineData({ ...offlineData, cart: updatedCart });
    
    addToSyncQueue({
      type: 'cart',
      action: 'add',
      data: product
    });
  };

  const addToWishlistOffline = (product: any) => {
    const updatedWishlist = [...offlineData.wishlist, { ...product, addedAt: Date.now() }];
    saveOfflineData({ ...offlineData, wishlist: updatedWishlist });
    
    addToSyncQueue({
      type: 'wishlist',
      action: 'add',
      data: product
    });
  };

  const trackUserActionOffline = (action: string, data: any) => {
    addToSyncQueue({
      type: 'user_action',
      action,
      data: { ...data, timestamp: Date.now() }
    });
  };

  // Provide offline context to children
  const offlineContext = {
    isOnline,
    offlineData,
    addToCartOffline,
    addToWishlistOffline,
    trackUserActionOffline,
    syncInProgress,
    syncQueue: syncQueue.length,
    lastSyncTime
  };

  return (
    <div className="offline-mode-container">
      {/* Offline Indicator */}
      {enableOfflineIndicator && !isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white py-2 px-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">You're offline</span>
              {syncQueue.length > 0 && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {syncQueue.length} pending
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {lastSyncTime && (
                <span className="text-xs opacity-75">
                  Last sync: {lastSyncTime.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOfflineActions(!showOfflineActions)}
                className="text-white hover:bg-white/20 h-6 px-2"
              >
                Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Indicator */}
      {syncInProgress && (
        <div className="fixed top-12 left-4 z-50">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-800">Syncing data...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offline Actions Panel */}
      {showOfflineActions && !isOnline && (
        <div className="fixed top-12 left-0 right-0 z-40 bg-white border-b shadow-lg">
          <div className="max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cart Items */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Cart Items</h3>
                    <Badge variant="outline">{offlineData.cart.length}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Items will sync when you're back online
                  </p>
                </CardContent>
              </Card>

              {/* Wishlist Items */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Wishlist</h3>
                    <Badge variant="outline">{offlineData.wishlist.length}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Saved items available offline
                  </p>
                </CardContent>
              </Card>

              {/* Pending Sync */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Pending Sync</h3>
                    <Badge variant="outline">{syncQueue.length}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Actions waiting to sync
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Available Offline Features */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Available Offline:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex items-center space-x-1 text-sm text-blue-800">
                  <CheckCircle className="h-3 w-3" />
                  <span>Browse Cart</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-blue-800">
                  <CheckCircle className="h-3 w-3" />
                  <span>View Wishlist</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-blue-800">
                  <CheckCircle className="h-3 w-3" />
                  <span>Recent Orders</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-blue-800">
                  <CheckCircle className="h-3 w-3" />
                  <span>Cached Pages</span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOfflineActions(false)}
              className="mt-2 float-right"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Success Message when back online */}
      {isOnline && syncQueue.length === 0 && lastSyncTime && (
        <div className="fixed top-12 right-4 z-50">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">All data synced</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content with Offline Context */}
      <div style={{ paddingTop: !isOnline && enableOfflineIndicator ? '44px' : '0' }}>
        {React.cloneElement(children as React.ReactElement, { offlineContext })}
      </div>
    </div>
  );
};

// Hook for offline functionality
export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineStorage, setOfflineStorage] = useState<any>({});

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

  const storeOfflineData = (key: string, data: any) => {
    try {
      localStorage.setItem(`offline-${key}`, JSON.stringify(data));
      setOfflineStorage(prev => ({ ...prev, [key]: data }));
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  };

  const getOfflineData = (key: string) => {
    try {
      const data = localStorage.getItem(`offline-${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return null;
    }
  };

  const clearOfflineData = (key?: string) => {
    if (key) {
      localStorage.removeItem(`offline-${key}`);
      setOfflineStorage(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    } else {
      // Clear all offline data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('offline-')) {
          localStorage.removeItem(key);
        }
      });
      setOfflineStorage({});
    }
  };

  return {
    isOnline,
    offlineStorage,
    storeOfflineData,
    getOfflineData,
    clearOfflineData
  };
};

export default OfflineMode;