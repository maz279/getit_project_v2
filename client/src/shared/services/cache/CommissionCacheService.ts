
import { CommissionCacheOperations } from './operations/CommissionCacheOperations';
import { CommissionSpecificCache } from './operations/CommissionSpecificCache';
import { CacheInvalidationService } from './invalidation/CacheInvalidationService';
import type { CacheConfig, CachedCommissionData, CacheStats } from './base/CacheConfigTypes';

export type { CacheConfig, CachedCommissionData };

export class CommissionCacheService {
  // Re-export core operations
  static set = CommissionCacheOperations.set;
  static get = CommissionCacheOperations.get;
  static delete = CommissionCacheOperations.delete;
  static flush = CommissionCacheOperations.flush;
  static setBulk = CommissionCacheOperations.setBulk;
  static getBulk = CommissionCacheOperations.getBulk;

  // Re-export commission-specific operations
  static cacheCommissionList = CommissionSpecificCache.cacheCommissionList;
  static getCachedCommissionList = CommissionSpecificCache.getCachedCommissionList;
  static cacheCommissionDetail = CommissionSpecificCache.cacheCommissionDetail;
  static getCachedCommissionDetail = CommissionSpecificCache.getCachedCommissionDetail;
  static cacheVendorCommissions = CommissionSpecificCache.cacheVendorCommissions;
  static getCachedVendorCommissions = CommissionSpecificCache.getCachedVendorCommissions;
  static cacheAnalytics = CommissionSpecificCache.cacheAnalytics;
  static getCachedAnalytics = CommissionSpecificCache.getCachedAnalytics;
  static cacheDashboardStats = CommissionSpecificCache.cacheDashboardStats;
  static getCachedDashboardStats = CommissionSpecificCache.getCachedDashboardStats;

  // Re-export invalidation operations
  static invalidateCommissionCache = CacheInvalidationService.invalidateCommissionCache;
  static invalidateVendorCache = CacheInvalidationService.invalidateVendorCache;
  static invalidateAnalyticsCache = CacheInvalidationService.invalidateAnalyticsCache;

  // Cache health monitoring
  static async getCacheStats(): Promise<CacheStats | null> {
    try {
      const response = await fetch('/functions/v1/redis-commission-cache/stats', {
        method: 'GET'
      });

      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }
}
