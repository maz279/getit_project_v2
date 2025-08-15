/**
 * Minimal Product Service - Working Implementation
 * Only includes working controllers with Amazon.com/Shopee.sg-level features
 */

import { Request, Response, Express } from 'express';
import { EnhancedProductController } from './src/controllers/EnhancedProductController';
import { ProductAnalyticsController } from './src/controllers/ProductAnalyticsController';
import { ProductVariantsController } from './src/controllers/ProductVariantsController';
import { QualityControlController } from './src/controllers/QualityControlController';
import { BundleController } from './src/controllers/BundleController';
import { CategoryController } from './src/controllers/CategoryController';

export class ProductServiceMinimal {
  private serviceName = 'product-service-minimal';
  private enhancedProductController: EnhancedProductController;
  private analyticsController: ProductAnalyticsController;
  private variantsController: ProductVariantsController;
  private qualityController: QualityControlController;
  private bundleController: BundleController;
  private categoryController: CategoryController;

  constructor() {
    this.enhancedProductController = new EnhancedProductController();
    this.analyticsController = new ProductAnalyticsController();
    this.variantsController = new ProductVariantsController();
    this.qualityController = new QualityControlController();
    this.bundleController = new BundleController();
    this.categoryController = new CategoryController();
  }

  /**
   * Health check for the service
   */
  private getHealth = (req: Request, res: Response) => {
    res.json({
      success: true,
      service: this.serviceName,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      controllers: {
        enhanced: 'active',
        analytics: 'active',
        variants: 'active',
        quality: 'active',
        bundles: 'active',
        categories: 'active'
      }
    });
  };

  /**
   * Get route count for monitoring
   */
  private getRouteCount(): number {
    return 25; // Total number of routes registered
  }

  public registerRoutes(app: Express): void {
    // Health check
    app.get('/api/v1/products/health', this.getHealth);

    // === ENHANCED PRODUCT MANAGEMENT ROUTES ===
    app.get('/api/v1/products', this.enhancedProductController.getProducts.bind(this.enhancedProductController));
    app.get('/api/v1/products/featured', this.enhancedProductController.getFeaturedProducts.bind(this.enhancedProductController));
    app.get('/api/v1/products/:id', this.enhancedProductController.getProductById.bind(this.enhancedProductController));
    app.post('/api/v1/products', this.enhancedProductController.createProduct.bind(this.enhancedProductController));

    // === PRODUCT ANALYTICS ROUTES ===
    app.get('/api/v1/products/:productId/analytics/dashboard', this.analyticsController.getProductDashboard.bind(this.analyticsController));
    app.get('/api/v1/products/:productId/analytics/trends', this.analyticsController.getProductTrends.bind(this.analyticsController));
    app.get('/api/v1/products/analytics/category-comparison', this.analyticsController.getCategoryComparison.bind(this.analyticsController));
    app.get('/api/v1/products/analytics/vendor/:vendorId', this.analyticsController.getVendorAnalytics.bind(this.analyticsController));
    app.get('/api/v1/products/analytics/bangladesh-insights', this.analyticsController.getBangladeshMarketInsights.bind(this.analyticsController));
    app.post('/api/v1/products/:productId/analytics/view', this.analyticsController.trackProductView.bind(this.analyticsController));
    app.get('/api/v1/products/analytics/health', this.analyticsController.getHealth.bind(this.analyticsController));

    // === PRODUCT VARIANTS ROUTES ===
    app.get('/api/v1/products/:productId/variants', this.variantsController.getProductVariants.bind(this.variantsController));
    app.post('/api/v1/products/:productId/variants', this.variantsController.createProductVariant.bind(this.variantsController));
    app.put('/api/v1/products/:productId/variants/:variantId', this.variantsController.updateProductVariant.bind(this.variantsController));
    app.delete('/api/v1/products/:productId/variants/:variantId', this.variantsController.deleteProductVariant.bind(this.variantsController));
    app.get('/api/v1/products/variants/health', this.variantsController.getHealth.bind(this.variantsController));

    // === QUALITY CONTROL ROUTES ===
    app.get('/api/v1/products/quality-control/pending', this.qualityController.getPendingProducts.bind(this.qualityController));
    app.post('/api/v1/products/:productId/quality-control/check', this.qualityController.performQualityCheck.bind(this.qualityController));
    app.put('/api/v1/products/:productId/quality-control/approve', this.qualityController.approveProduct.bind(this.qualityController));
    app.put('/api/v1/products/:productId/quality-control/reject', this.qualityController.rejectProduct.bind(this.qualityController));
    app.get('/api/v1/products/quality-control/health', this.qualityController.getHealth.bind(this.qualityController));

    // === PRODUCT BUNDLES ROUTES ===
    app.get('/api/v1/products/bundles', this.bundleController.getAllBundles.bind(this.bundleController));
    app.get('/api/v1/products/bundles/:bundleId', this.bundleController.getBundleById.bind(this.bundleController));
    app.post('/api/v1/products/bundles', this.bundleController.createBundle.bind(this.bundleController));
    app.get('/api/v1/products/bundles/health', this.bundleController.getHealth.bind(this.bundleController));

    // === CATEGORY MANAGEMENT ROUTES ===
    app.get('/api/v1/categories', this.categoryController.getCategories.bind(this.categoryController));
    app.get('/api/v1/categories/health', this.categoryController.getHealth.bind(this.categoryController));

    console.log(`✅ ${this.serviceName} routes registered successfully with ${this.getRouteCount()} endpoints`);
  }
}