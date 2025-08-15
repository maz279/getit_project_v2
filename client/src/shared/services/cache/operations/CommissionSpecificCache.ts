
import { CommissionCacheOperations } from './CommissionCacheOperations';

export class CommissionSpecificCache {
  private static readonly CACHE_KEYS = {
    COMMISSION_LIST: 'commissions:list',
    COMMISSION_DETAIL: 'commission:detail',
    COMMISSION_ANALYTICS: 'analytics',
    COMMISSION_RATES: 'rates',
    VENDOR_COMMISSIONS: 'vendor:commissions',
    PAYOUT_SUMMARY: 'payout:summary',
    DISPUTE_LIST: 'disputes:list',
    DASHBOARD_STATS: 'dashboard:stats'
  };

  // Commission list caching
  static async cacheCommissionList(filters: any, commissions: any[], ttl: number = 1800): Promise<boolean> {
    const key = `${this.CACHE_KEYS.COMMISSION_LIST}:${CommissionCacheOperations.hashFilters(filters)}`;
    return CommissionCacheOperations.set(key, {
      commissions,
      filters,
      count: commissions.length,
      cached_at: new Date().toISOString()
    }, ttl);
  }

  static async getCachedCommissionList(filters: any): Promise<any[] | null> {
    const key = `${this.CACHE_KEYS.COMMISSION_LIST}:${CommissionCacheOperations.hashFilters(filters)}`;
    const cached = await CommissionCacheOperations.get(key);
    return cached?.commissions || null;
  }

  // Commission detail caching
  static async cacheCommissionDetail(commissionId: string, commission: any, ttl: number = 3600): Promise<boolean> {
    const key = `${this.CACHE_KEYS.COMMISSION_DETAIL}:${commissionId}`;
    return CommissionCacheOperations.set(key, commission, ttl);
  }

  static async getCachedCommissionDetail(commissionId: string): Promise<any | null> {
    const key = `${this.CACHE_KEYS.COMMISSION_DETAIL}:${commissionId}`;
    return CommissionCacheOperations.get(key);
  }

  // Vendor commissions caching
  static async cacheVendorCommissions(vendorId: string, commissions: any[], ttl: number = 1800): Promise<boolean> {
    const key = `${this.CACHE_KEYS.VENDOR_COMMISSIONS}:${vendorId}`;
    return CommissionCacheOperations.set(key, {
      vendor_id: vendorId,
      commissions,
      total_amount: commissions.reduce((sum, c) => sum + c.commission_amount, 0),
      cached_at: new Date().toISOString()
    }, ttl);
  }

  static async getCachedVendorCommissions(vendorId: string): Promise<any | null> {
    const key = `${this.CACHE_KEYS.VENDOR_COMMISSIONS}:${vendorId}`;
    return CommissionCacheOperations.get(key);
  }

  // Analytics caching
  static async cacheAnalytics(analyticsType: string, params: any, data: any, ttl: number = 3600): Promise<boolean> {
    const key = `${this.CACHE_KEYS.COMMISSION_ANALYTICS}:${analyticsType}:${CommissionCacheOperations.hashFilters(params)}`;
    return CommissionCacheOperations.set(key, {
      analytics_type: analyticsType,
      params,
      data,
      generated_at: new Date().toISOString()
    }, ttl);
  }

  static async getCachedAnalytics(analyticsType: string, params: any): Promise<any | null> {
    const key = `${this.CACHE_KEYS.COMMISSION_ANALYTICS}:${analyticsType}:${CommissionCacheOperations.hashFilters(params)}`;
    const cached = await CommissionCacheOperations.get(key);
    return cached?.data || null;
  }

  // Dashboard stats caching
  static async cacheDashboardStats(stats: any, ttl: number = 900): Promise<boolean> {
    const key = this.CACHE_KEYS.DASHBOARD_STATS;
    return CommissionCacheOperations.set(key, {
      stats,
      last_updated: new Date().toISOString()
    }, ttl);
  }

  static async getCachedDashboardStats(): Promise<any | null> {
    const key = this.CACHE_KEYS.DASHBOARD_STATS;
    const cached = await CommissionCacheOperations.get(key);
    return cached?.stats || null;
  }
}
