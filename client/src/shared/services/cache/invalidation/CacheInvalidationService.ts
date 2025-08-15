
import { CommissionCacheOperations } from '../operations/CommissionCacheOperations';

export class CacheInvalidationService {
  private static readonly CACHE_KEYS = {
    COMMISSION_LIST: 'commissions:list',
    COMMISSION_DETAIL: 'commission:detail',
    COMMISSION_ANALYTICS: 'analytics',
    VENDOR_COMMISSIONS: 'vendor:commissions',
    DASHBOARD_STATS: 'dashboard:stats'
  };

  static async invalidateCommissionCache(commissionId: string): Promise<void> {
    const keysToInvalidate = [
      `${this.CACHE_KEYS.COMMISSION_DETAIL}:${commissionId}`,
      `${this.CACHE_KEYS.COMMISSION_LIST}*`,
      this.CACHE_KEYS.DASHBOARD_STATS
    ];

    await Promise.all(keysToInvalidate.map(key => CommissionCacheOperations.delete(key)));
  }

  static async invalidateVendorCache(vendorId: string): Promise<void> {
    const keysToInvalidate = [
      `${this.CACHE_KEYS.VENDOR_COMMISSIONS}:${vendorId}`,
      `${this.CACHE_KEYS.COMMISSION_LIST}*`,
      `${this.CACHE_KEYS.COMMISSION_ANALYTICS}*`,
      this.CACHE_KEYS.DASHBOARD_STATS
    ];

    await Promise.all(keysToInvalidate.map(key => CommissionCacheOperations.delete(key)));
  }

  static async invalidateAnalyticsCache(): Promise<void> {
    await CommissionCacheOperations.flush(`${this.CACHE_KEYS.COMMISSION_ANALYTICS}*`);
    await CommissionCacheOperations.delete(this.CACHE_KEYS.DASHBOARD_STATS);
  }
}
