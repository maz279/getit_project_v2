/**
 * Vendor Store Service - Amazon.com/Shopee.sg-Level Store Management
 * 
 * Complete store management operations:
 * - Store creation, configuration, and customization
 * - Performance analytics and monitoring
 * - Bangladesh-specific store features
 * - SEO and social media integration
 * - File upload and asset management
 */

import { db } from '../../../db';
import { vendors, vendorStoreCustomizations, vendorAnalytics, vendorPerformanceMetrics } from '../../../../shared/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';

export interface StoreAnalytics {
  views: number;
  visitors: number;
  conversionRate: number;
  averageOrderValue: number;
  totalSales: number;
  topProducts: any[];
  trafficSources: any[];
}

export interface StorePerformance {
  rating: number;
  reviewCount: number;
  responseTime: number;
  fulfillmentRate: number;
  returnRate: number;
  customerSatisfaction: number;
}

export interface StoreCustomization {
  themeId: string;
  customColors: any;
  customFonts: any;
  layoutSettings: any;
  customCSS?: string;
  banners: any[];
  widgets: any[];
}

export class VendorStoreService {
  
  /**
   * Get store by vendor ID
   */
  async getStoreByVendorId(vendorId: string): Promise<any> {
    try {
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      if (!vendor) {
        return null;
      }

      // Get store customizations
      const [customizations] = await db
        .select()
        .from(vendorStoreCustomizations)
        .where(eq(vendorStoreCustomizations.vendorId, vendorId));

      return {
        ...vendor,
        customizations: customizations || null
      };
    } catch (error) {
      console.error('Error getting store by vendor ID:', error);
      throw error;
    }
  }

  /**
   * Create new store
   */
  async createStore(vendorId: string, storeData: any): Promise<any> {
    try {
      // Update vendor with store information
      const [updatedVendor] = await db
        .update(vendors)
        .set({
          storeName: storeData.storeName,
          storeDescription: storeData.storeDescription,
          logoUrl: storeData.logoUrl,
          bannerUrl: storeData.bannerUrl,
          storeUrl: storeData.storeUrl,
          businessHours: storeData.businessHours,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId))
        .returning();

      // Create default store customizations
      const [customizations] = await db
        .insert(vendorStoreCustomizations)
        .values({
          vendorId,
          themeId: 'default',
          customColors: {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#28a745'
          },
          layoutSettings: {
            headerStyle: 'default',
            productLayout: 'grid',
            itemsPerPage: 20
          },
          isPublished: false
        })
        .returning();

      return {
        ...updatedVendor,
        customizations
      };
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  }

  /**
   * Update store settings
   */
  async updateStoreSettings(vendorId: string, updates: any): Promise<any> {
    try {
      const [updatedVendor] = await db
        .update(vendors)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId))
        .returning();

      return updatedVendor;
    } catch (error) {
      console.error('Error updating store settings:', error);
      throw error;
    }
  }

  /**
   * Update store design
   */
  async updateStoreDesign(vendorId: string, designData: StoreCustomization): Promise<any> {
    try {
      const [updatedCustomizations] = await db
        .update(vendorStoreCustomizations)
        .set({
          themeId: designData.themeId,
          customColors: designData.customColors,
          customFonts: designData.customFonts,
          layoutSettings: designData.layoutSettings,
          customCSS: designData.customCSS,
          banners: designData.banners,
          widgets: designData.widgets,
          updatedAt: new Date()
        })
        .where(eq(vendorStoreCustomizations.vendorId, vendorId))
        .returning();

      return updatedCustomizations;
    } catch (error) {
      console.error('Error updating store design:', error);
      throw error;
    }
  }

  /**
   * Upload store logo
   */
  async uploadStoreLogo(vendorId: string, file: any): Promise<string> {
    try {
      // In production, this would upload to cloud storage (AWS S3, etc.)
      const logoUrl = `/uploads/vendor-logos/${vendorId}/${file.filename}`;
      
      // Update vendor with new logo URL
      await db
        .update(vendors)
        .set({
          logoUrl,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId));

      return logoUrl;
    } catch (error) {
      console.error('Error uploading store logo:', error);
      throw error;
    }
  }

  /**
   * Upload store banner
   */
  async uploadStoreBanner(vendorId: string, file: any): Promise<string> {
    try {
      // In production, this would upload to cloud storage
      const bannerUrl = `/uploads/vendor-banners/${vendorId}/${file.filename}`;
      
      // Update vendor with new banner URL
      await db
        .update(vendors)
        .set({
          bannerUrl,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId));

      return bannerUrl;
    } catch (error) {
      console.error('Error uploading store banner:', error);
      throw error;
    }
  }

  /**
   * Get store analytics
   */
  async getStoreAnalytics(vendorId: string): Promise<StoreAnalytics> {
    try {
      const analytics = await db
        .select()
        .from(vendorAnalytics)
        .where(eq(vendorAnalytics.vendorId, vendorId))
        .orderBy(desc(vendorAnalytics.periodStart))
        .limit(1);

      if (analytics.length === 0) {
        return {
          views: 0,
          visitors: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          totalSales: 0,
          topProducts: [],
          trafficSources: []
        };
      }

      const latest = analytics[0];
      return {
        views: latest.storeViews || 0,
        visitors: latest.customerCount || 0,
        conversionRate: parseFloat(latest.conversionRate || '0'),
        averageOrderValue: parseFloat(latest.averageOrderValue || '0'),
        totalSales: parseFloat(latest.salesValue || '0'),
        topProducts: latest.metrics?.topProducts || [],
        trafficSources: latest.metrics?.trafficSources || []
      };
    } catch (error) {
      console.error('Error getting store analytics:', error);
      throw error;
    }
  }

  /**
   * Get detailed analytics
   */
  async getDetailedAnalytics(vendorId: string, options: any): Promise<any> {
    try {
      const { period, startDate, endDate } = options;
      
      let query = db
        .select()
        .from(vendorAnalytics)
        .where(eq(vendorAnalytics.vendorId, vendorId));

      if (startDate && endDate) {
        query = query.where(
          and(
            gte(vendorAnalytics.periodStart, new Date(startDate)),
            lte(vendorAnalytics.periodEnd, new Date(endDate))
          )
        );
      }

      const analytics = await query
        .orderBy(desc(vendorAnalytics.periodStart))
        .limit(100);

      return {
        period,
        data: analytics,
        summary: this.calculateAnalyticsSummary(analytics)
      };
    } catch (error) {
      console.error('Error getting detailed analytics:', error);
      throw error;
    }
  }

  /**
   * Get store performance metrics
   */
  async getStorePerformance(vendorId: string): Promise<StorePerformance> {
    try {
      const performance = await db
        .select()
        .from(vendorPerformanceMetrics)
        .where(eq(vendorPerformanceMetrics.vendorId, vendorId))
        .orderBy(desc(vendorPerformanceMetrics.metricDate))
        .limit(1);

      if (performance.length === 0) {
        return {
          rating: 0,
          reviewCount: 0,
          responseTime: 0,
          fulfillmentRate: 0,
          returnRate: 0,
          customerSatisfaction: 0
        };
      }

      const latest = performance[0];
      return {
        rating: parseFloat(latest.customerRating || '0'),
        reviewCount: 0, // Would come from reviews table
        responseTime: parseFloat(latest.responseTimeHours || '0'),
        fulfillmentRate: parseFloat(latest.fulfilmentRate || '0'),
        returnRate: parseFloat(latest.returnRate || '0'),
        customerSatisfaction: parseFloat(latest.customerRating || '0')
      };
    } catch (error) {
      console.error('Error getting store performance:', error);
      throw error;
    }
  }

  /**
   * Get store performance metrics over time
   */
  async getStorePerformanceMetrics(vendorId: string, period: string): Promise<any> {
    try {
      const metrics = await db
        .select()
        .from(vendorPerformanceMetrics)
        .where(eq(vendorPerformanceMetrics.vendorId, vendorId))
        .orderBy(desc(vendorPerformanceMetrics.metricDate))
        .limit(this.getPeriodLimit(period));

      return {
        period,
        metrics,
        trends: this.calculateTrends(metrics)
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  /**
   * Update store SEO settings
   */
  async updateStoreSEO(vendorId: string, seoData: any): Promise<any> {
    try {
      const [updatedVendor] = await db
        .update(vendors)
        .set({
          seoTitle: seoData.title,
          seoDescription: seoData.description,
          seoKeywords: seoData.keywords,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId))
        .returning();

      return updatedVendor;
    } catch (error) {
      console.error('Error updating store SEO:', error);
      throw error;
    }
  }

  /**
   * Update business hours
   */
  async updateBusinessHours(vendorId: string, businessHours: any): Promise<any> {
    try {
      const [updatedVendor] = await db
        .update(vendors)
        .set({
          businessHours,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId))
        .returning();

      return updatedVendor;
    } catch (error) {
      console.error('Error updating business hours:', error);
      throw error;
    }
  }

  /**
   * Check if vendor can toggle store status
   */
  async canToggleStoreStatus(vendorId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      if (!vendor) {
        return { allowed: false, reason: 'Vendor not found' };
      }

      if (vendor.kycStatus !== 'verified') {
        return { allowed: false, reason: 'KYC verification required' };
      }

      if (vendor.isBlocked) {
        return { allowed: false, reason: 'Account is blocked' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking store status toggle permission:', error);
      throw error;
    }
  }

  /**
   * Toggle store active status
   */
  async toggleStoreStatus(vendorId: string, isActive: boolean): Promise<any> {
    try {
      const [updatedVendor] = await db
        .update(vendors)
        .set({
          isActive,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId))
        .returning();

      return updatedVendor;
    } catch (error) {
      console.error('Error toggling store status:', error);
      throw error;
    }
  }

  /**
   * Get customization options
   */
  async getCustomizationOptions(): Promise<any> {
    return {
      themes: [
        { id: 'default', name: 'Default', preview: '/themes/default.jpg' },
        { id: 'modern', name: 'Modern', preview: '/themes/modern.jpg' },
        { id: 'classic', name: 'Classic', preview: '/themes/classic.jpg' },
        { id: 'minimal', name: 'Minimal', preview: '/themes/minimal.jpg' }
      ],
      layouts: [
        { id: 'grid', name: 'Grid Layout' },
        { id: 'list', name: 'List Layout' },
        { id: 'masonry', name: 'Masonry Layout' }
      ],
      widgets: [
        { id: 'featured_products', name: 'Featured Products' },
        { id: 'bestsellers', name: 'Best Sellers' },
        { id: 'reviews', name: 'Customer Reviews' },
        { id: 'contact_info', name: 'Contact Information' }
      ]
    };
  }

  /**
   * Helper: Calculate analytics summary
   */
  private calculateAnalyticsSummary(analytics: any[]): any {
    if (analytics.length === 0) return {};

    const totalViews = analytics.reduce((sum, a) => sum + (a.storeViews || 0), 0);
    const totalSales = analytics.reduce((sum, a) => sum + parseFloat(a.salesValue || '0'), 0);
    const totalOrders = analytics.reduce((sum, a) => sum + (a.orderCount || 0), 0);

    return {
      totalViews,
      totalSales,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      conversionRate: totalViews > 0 ? (totalOrders / totalViews) * 100 : 0
    };
  }

  /**
   * Helper: Calculate performance trends
   */
  private calculateTrends(metrics: any[]): any {
    if (metrics.length < 2) return {};

    const latest = metrics[0];
    const previous = metrics[1];

    return {
      revenueChange: this.calculatePercentageChange(
        parseFloat(latest.totalRevenue || '0'),
        parseFloat(previous.totalRevenue || '0')
      ),
      ordersChange: this.calculatePercentageChange(
        latest.totalOrders || 0,
        previous.totalOrders || 0
      ),
      ratingChange: this.calculatePercentageChange(
        parseFloat(latest.customerRating || '0'),
        parseFloat(previous.customerRating || '0')
      )
    };
  }

  /**
   * Helper: Calculate percentage change
   */
  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Helper: Get period limit for queries
   */
  private getPeriodLimit(period: string): number {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }
}