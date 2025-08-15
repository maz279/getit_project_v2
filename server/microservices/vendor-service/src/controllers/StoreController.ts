/**
 * Store Controller - Amazon.com/Shopee.sg-Level Store Management System
 * 
 * Complete vendor store management with:
 * - Store creation and customization
 * - Theme and layout management
 * - SEO optimization
 * - Performance analytics
 * - Bangladesh-specific store features
 * - Social media integration
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  vendorStores, 
  vendorStoreCustomizations,
  vendorPerformanceMetrics,
  vendorAnalytics,
  vendors
} from '../../../../shared/schema';
import { eq, and, desc, asc, gte, lte, sql } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const storeCreationSchema = z.object({
  vendorId: z.string().uuid(),
  storeName: z.string().min(1).max(100),
  storeSlug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  storeDescription: z.string().min(10).max(500),
  businessHours: z.object({
    monday: z.object({ open: z.string(), close: z.string(), isOpen: z.boolean() }),
    tuesday: z.object({ open: z.string(), close: z.string(), isOpen: z.boolean() }),
    wednesday: z.object({ open: z.string(), close: z.string(), isOpen: z.boolean() }),
    thursday: z.object({ open: z.string(), close: z.string(), isOpen: z.boolean() }),
    friday: z.object({ open: z.string(), close: z.string(), isOpen: z.boolean() }),
    saturday: z.object({ open: z.string(), close: z.string(), isOpen: z.boolean() }),
    sunday: z.object({ open: z.string(), close: z.string(), isOpen: z.boolean() }),
  }),
  socialMedia: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
});

const storeCustomizationSchema = z.object({
  vendorId: z.string().uuid(),
  themeId: z.string().min(1).max(50),
  customColors: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i),
    secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
    accent: z.string().regex(/^#[0-9A-F]{6}$/i),
    background: z.string().regex(/^#[0-9A-F]{6}$/i),
    text: z.string().regex(/^#[0-9A-F]{6}$/i),
  }).optional(),
  customFonts: z.object({
    headingFont: z.string().min(1).max(50),
    bodyFont: z.string().min(1).max(50),
    fontSize: z.enum(['small', 'medium', 'large']),
  }).optional(),
  layoutSettings: z.object({
    headerStyle: z.enum(['minimal', 'standard', 'extended']),
    sidebarPosition: z.enum(['left', 'right', 'none']),
    productGridLayout: z.enum(['grid-2', 'grid-3', 'grid-4', 'list']),
    showBreadcrumbs: z.boolean(),
    showWishlist: z.boolean(),
    showCompare: z.boolean(),
  }).optional(),
  bannerImages: z.array(z.object({
    url: z.string().url(),
    title: z.string().max(100),
    subtitle: z.string().max(200).optional(),
    buttonText: z.string().max(50).optional(),
    buttonLink: z.string().url().optional(),
    order: z.number(),
  })).optional(),
  customCSS: z.string().max(10000).optional(),
});

const seoSettingsSchema = z.object({
  vendorId: z.string().uuid(),
  metaTitle: z.string().min(10).max(60),
  metaDescription: z.string().min(50).max(160),
  metaKeywords: z.string().max(200),
  ogTitle: z.string().min(10).max(60),
  ogDescription: z.string().min(50).max(160),
  ogImage: z.string().url(),
  structuredData: z.object({
    businessType: z.string(),
    businessName: z.string(),
    description: z.string(),
    address: z.object({
      streetAddress: z.string(),
      addressLocality: z.string(),
      addressRegion: z.string(),
      postalCode: z.string(),
      addressCountry: z.string().default('BD'),
    }),
    telephone: z.string(),
    openingHours: z.array(z.string()),
  }).optional(),
});

export class StoreController {
  
  /**
   * Create vendor store
   */
  async createStore(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = storeCreationSchema.parse(req.body);
      
      // Check if store already exists for vendor
      const [existingStore] = await db
        .select()
        .from(vendorStores)
        .where(eq(vendorStores.vendorId, validatedData.vendorId));
      
      if (existingStore) {
        res.status(400).json({
          success: false,
          error: 'Store already exists for this vendor',
          code: 'STORE_ALREADY_EXISTS'
        });
        return;
      }
      
      // Check if store slug is available
      const [existingSlug] = await db
        .select()
        .from(vendorStores)
        .where(eq(vendorStores.storeSlug, validatedData.storeSlug));
      
      if (existingSlug) {
        res.status(400).json({
          success: false,
          error: 'Store URL is already taken. Please choose a different one.',
          code: 'STORE_SLUG_TAKEN'
        });
        return;
      }
      
      // Create store
      const [newStore] = await db
        .insert(vendorStores)
        .values({
          vendorId: validatedData.vendorId,
          storeName: validatedData.storeName,
          storeSlug: validatedData.storeSlug,
          storeDescription: validatedData.storeDescription,
          businessHours: validatedData.businessHours,
          socialMedia: validatedData.socialMedia || {},
          storeSettings: {
            isPublic: true,
            allowReviews: true,
            showContactInfo: true,
            showBusinessHours: true,
            enableChat: true,
          },
          seoSettings: {
            metaTitle: `${validatedData.storeName} - Premium Products on GetIt`,
            metaDescription: validatedData.storeDescription.substring(0, 160),
          },
        })
        .returning();
      
      // Create default store customization
      await db
        .insert(vendorStoreCustomizations)
        .values({
          vendorId: validatedData.vendorId,
          themeId: 'default',
          customColors: {
            primary: '#E91E63',
            secondary: '#2196F3',
            accent: '#FF9800',
            background: '#FFFFFF',
            text: '#333333',
          },
          layoutSettings: {
            headerStyle: 'standard',
            sidebarPosition: 'left',
            productGridLayout: 'grid-3',
            showBreadcrumbs: true,
            showWishlist: true,
            showCompare: true,
          },
          contactInfo: {
            showPhone: true,
            showEmail: true,
            showAddress: true,
            showSocialMedia: true,
          },
        });
      
      res.json({
        success: true,
        data: {
          store: newStore,
          storeUrl: `https://getit.com.bd/store/${newStore.storeSlug}`,
          message: 'Store created successfully!',
          nextSteps: [
            'Customize your store appearance',
            'Add your first products',
            'Set up payment methods',
            'Configure shipping options'
          ]
        }
      });
      
    } catch (error: any) {
      console.error('Store creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create store',
        details: error.message
      });
    }
  }
  
  /**
   * Update store information
   */
  async updateStore(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const updateData = req.body;
      
      // Validate vendor exists and has store
      const [store] = await db
        .select()
        .from(vendorStores)
        .where(eq(vendorStores.vendorId, vendorId));
      
      if (!store) {
        res.status(404).json({
          success: false,
          error: 'Store not found',
          code: 'STORE_NOT_FOUND'
        });
        return;
      }
      
      // Update store
      const [updatedStore] = await db
        .update(vendorStores)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(vendorStores.id, store.id))
        .returning();
      
      res.json({
        success: true,
        data: {
          store: updatedStore,
          message: 'Store updated successfully'
        }
      });
      
    } catch (error: any) {
      console.error('Store update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update store',
        details: error.message
      });
    }
  }
  
  /**
   * Customize store appearance
   */
  async customizeStore(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = storeCustomizationSchema.parse(req.body);
      
      // Check if customization exists
      const [existingCustomization] = await db
        .select()
        .from(vendorStoreCustomizations)
        .where(eq(vendorStoreCustomizations.vendorId, validatedData.vendorId));
      
      if (existingCustomization) {
        // Update existing customization
        const [updatedCustomization] = await db
          .update(vendorStoreCustomizations)
          .set({
            themeId: validatedData.themeId,
            customColors: validatedData.customColors,
            customFonts: validatedData.customFonts,
            layoutSettings: validatedData.layoutSettings,
            bannerImages: validatedData.bannerImages,
            customCSS: validatedData.customCSS,
            lastModified: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(vendorStoreCustomizations.id, existingCustomization.id))
          .returning();
        
        res.json({
          success: true,
          data: {
            customization: updatedCustomization,
            message: 'Store customization updated successfully',
            previewUrl: await this.generatePreviewUrl(validatedData.vendorId)
          }
        });
      } else {
        // Create new customization
        const [newCustomization] = await db
          .insert(vendorStoreCustomizations)
          .values(validatedData)
          .returning();
        
        res.json({
          success: true,
          data: {
            customization: newCustomization,
            message: 'Store customization created successfully',
            previewUrl: await this.generatePreviewUrl(validatedData.vendorId)
          }
        });
      }
      
    } catch (error: any) {
      console.error('Store customization error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to customize store',
        details: error.message
      });
    }
  }
  
  /**
   * Update SEO settings
   */
  async updateSEOSettings(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = seoSettingsSchema.parse(req.body);
      
      // Update store SEO settings
      const [updatedStore] = await db
        .update(vendorStores)
        .set({
          seoSettings: {
            metaTitle: validatedData.metaTitle,
            metaDescription: validatedData.metaDescription,
            metaKeywords: validatedData.metaKeywords,
            ogTitle: validatedData.ogTitle,
            ogDescription: validatedData.ogDescription,
            ogImage: validatedData.ogImage,
            structuredData: validatedData.structuredData,
          },
          updatedAt: new Date(),
        })
        .where(eq(vendorStores.vendorId, validatedData.vendorId))
        .returning();
      
      res.json({
        success: true,
        data: {
          seoSettings: updatedStore.seoSettings,
          message: 'SEO settings updated successfully',
          seoScore: await this.calculateSEOScore(validatedData)
        }
      });
      
    } catch (error: any) {
      console.error('SEO update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update SEO settings',
        details: error.message
      });
    }
  }
  
  /**
   * Get store information
   */
  async getStore(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      
      // Get store with customization
      const [store] = await db
        .select({
          store: vendorStores,
          customization: vendorStoreCustomizations,
        })
        .from(vendorStores)
        .leftJoin(
          vendorStoreCustomizations,
          eq(vendorStores.vendorId, vendorStoreCustomizations.vendorId)
        )
        .where(eq(vendorStores.vendorId, vendorId));
      
      if (!store) {
        res.status(404).json({
          success: false,
          error: 'Store not found',
          code: 'STORE_NOT_FOUND'
        });
        return;
      }
      
      // Get store analytics
      const analytics = await this.getStoreAnalytics(vendorId);
      
      // Get performance metrics
      const performance = await this.getStorePerformance(vendorId);
      
      res.json({
        success: true,
        data: {
          store: store.store,
          customization: store.customization,
          analytics,
          performance,
          storeUrl: `https://getit.com.bd/store/${store.store.storeSlug}`,
          isPublished: store.store.isActive,
        }
      });
      
    } catch (error: any) {
      console.error('Get store error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get store information',
        details: error.message
      });
    }
  }
  
  /**
   * Get store analytics
   */
  async getStoreAnalytics(vendorId: string): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30); // Last 30 days
      
      const analytics = await db
        .select()
        .from(vendorAnalytics)
        .where(
          and(
            eq(vendorAnalytics.vendorId, vendorId),
            gte(vendorAnalytics.periodStart, startDate),
            lte(vendorAnalytics.periodEnd, endDate)
          )
        )
        .orderBy(desc(vendorAnalytics.periodStart));
      
      // Calculate totals
      const totals = analytics.reduce(
        (acc, record) => ({
          views: acc.views + (record.storeViews || 0),
          visitors: acc.visitors + (record.customerCount || 0),
          sales: acc.sales + parseFloat(record.salesValue || '0'),
          orders: acc.orders + (record.orderCount || 0),
          products: acc.products + (record.productViews || 0),
        }),
        { views: 0, visitors: 0, sales: 0, orders: 0, products: 0 }
      );
      
      return {
        summary: totals,
        daily: analytics,
        conversionRate: totals.visitors > 0 ? (totals.orders / totals.visitors * 100).toFixed(2) : 0,
        averageOrderValue: totals.orders > 0 ? (totals.sales / totals.orders).toFixed(2) : 0,
      };
      
    } catch (error) {
      console.error('Store analytics error:', error);
      return {
        summary: { views: 0, visitors: 0, sales: 0, orders: 0, products: 0 },
        daily: [],
        conversionRate: 0,
        averageOrderValue: 0,
      };
    }
  }
  
  /**
   * Get store performance metrics
   */
  async getStorePerformance(vendorId: string): Promise<any> {
    try {
      const [latestMetrics] = await db
        .select()
        .from(vendorPerformanceMetrics)
        .where(eq(vendorPerformanceMetrics.vendorId, vendorId))
        .orderBy(desc(vendorPerformanceMetrics.periodDate))
        .limit(1);
      
      if (!latestMetrics) {
        return {
          rating: 0,
          fulfillmentRate: 0,
          responseTime: 0,
          onTimeDelivery: 0,
          customerSatisfaction: 0,
          qualityScore: 0,
          performanceGrade: 'N/A',
        };
      }
      
      return {
        rating: parseFloat(latestMetrics.customerSatisfactionRating || '0'),
        fulfillmentRate: parseFloat(latestMetrics.orderFulfillmentRate || '0'),
        responseTime: latestMetrics.averageResponseTime || 0,
        onTimeDelivery: parseFloat(latestMetrics.onTimeDeliveryRate || '0'),
        customerSatisfaction: parseFloat(latestMetrics.customerSatisfactionRating || '0'),
        qualityScore: parseFloat(latestMetrics.qualityScore || '0'),
        performanceGrade: latestMetrics.performanceGrade || 'N/A',
        rank: latestMetrics.performanceRank || null,
      };
      
    } catch (error) {
      console.error('Store performance error:', error);
      return {
        rating: 0,
        fulfillmentRate: 0,
        responseTime: 0,
        onTimeDelivery: 0,
        customerSatisfaction: 0,
        qualityScore: 0,
        performanceGrade: 'N/A',
      };
    }
  }
  
  /**
   * Toggle store status (publish/unpublish)
   */
  async toggleStoreStatus(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { isActive } = req.body;
      
      const [updatedStore] = await db
        .update(vendorStores)
        .set({
          isActive: isActive,
          updatedAt: new Date(),
        })
        .where(eq(vendorStores.vendorId, vendorId))
        .returning();
      
      res.json({
        success: true,
        data: {
          store: updatedStore,
          message: `Store ${isActive ? 'published' : 'unpublished'} successfully`,
          status: isActive ? 'published' : 'unpublished'
        }
      });
      
    } catch (error: any) {
      console.error('Toggle store status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update store status',
        details: error.message
      });
    }
  }
  
  /**
   * Get available themes
   */
  async getThemes(req: Request, res: Response): Promise<void> {
    try {
      const themes = [
        {
          id: 'default',
          name: 'Default',
          description: 'Clean and professional default theme',
          previewImage: '/assets/themes/default-preview.jpg',
          category: 'Professional',
          features: ['Responsive', 'SEO Optimized', 'Fast Loading'],
          price: 0,
        },
        {
          id: 'minimal',
          name: 'Minimal',
          description: 'Clean minimal design for modern stores',
          previewImage: '/assets/themes/minimal-preview.jpg',
          category: 'Modern',
          features: ['Ultra Clean', 'Mobile First', 'Fast'],
          price: 99,
        },
        {
          id: 'fashion',
          name: 'Fashion Pro',
          description: 'Perfect for fashion and lifestyle brands',
          previewImage: '/assets/themes/fashion-preview.jpg',
          category: 'Fashion',
          features: ['Stylish', 'Product Showcase', 'Social Integration'],
          price: 199,
        },
        {
          id: 'electronics',
          name: 'Tech Store',
          description: 'Ideal for electronics and gadget stores',
          previewImage: '/assets/themes/tech-preview.jpg',
          category: 'Electronics',
          features: ['Product Comparison', 'Specification Tables', 'Reviews'],
          price: 149,
        },
        {
          id: 'bangladesh',
          name: 'Bangladesh Heritage',
          description: 'Celebrates Bangladesh culture and traditions',
          previewImage: '/assets/themes/bangladesh-preview.jpg',
          category: 'Cultural',
          features: ['Bengali Typography', 'Cultural Colors', 'Festival Themes'],
          price: 79,
        },
      ];
      
      res.json({
        success: true,
        data: { themes }
      });
      
    } catch (error: any) {
      console.error('Get themes error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get themes',
        details: error.message
      });
    }
  }
  
  /**
   * Private helper methods
   */
  private async generatePreviewUrl(vendorId: string): Promise<string> {
    try {
      const [store] = await db
        .select({ storeSlug: vendorStores.storeSlug })
        .from(vendorStores)
        .where(eq(vendorStores.vendorId, vendorId));
      
      return store ? `https://getit.com.bd/store/${store.storeSlug}/preview` : '';
    } catch (error) {
      return '';
    }
  }
  
  private async calculateSEOScore(seoData: any): Promise<number> {
    let score = 0;
    
    // Meta title (20 points)
    if (seoData.metaTitle && seoData.metaTitle.length >= 30 && seoData.metaTitle.length <= 60) {
      score += 20;
    }
    
    // Meta description (20 points)
    if (seoData.metaDescription && seoData.metaDescription.length >= 120 && seoData.metaDescription.length <= 160) {
      score += 20;
    }
    
    // Keywords (15 points)
    if (seoData.metaKeywords && seoData.metaKeywords.split(',').length >= 3) {
      score += 15;
    }
    
    // Open Graph (20 points)
    if (seoData.ogTitle && seoData.ogDescription && seoData.ogImage) {
      score += 20;
    }
    
    // Structured data (25 points)
    if (seoData.structuredData) {
      score += 25;
    }
    
    return score;
  }
  
  /**
   * Health check for store service
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        service: 'store-controller',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        features: [
          'Store creation and management',
          'Theme customization',
          'SEO optimization',
          'Performance analytics',
          'Bangladesh cultural integration'
        ]
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        service: 'store-controller',
        status: 'unhealthy',
        error: error.message
      });
    }
  }
}