/**
 * Complete Vendor Controller - Amazon.com/Shopee.sg Level Implementation
 * Comprehensive vendor operations with enterprise features
 */

import { Request, Response, NextFunction } from 'express';
import { VendorService } from '../services/VendorService';
import { KYCService } from '../services/KYCService';
import { AnalyticsService } from '../services/AnalyticsService';
import { 
  VendorSearchParams,
  VendorCreateSchema,
  VendorUpdateSchema,
  KYCSubmissionSchema,
  PayoutRequestSchema,
  ApiResponse,
  ValidationError,
  NotFoundError
} from '../types/vendor.types';

export class VendorController {
  private vendorService: VendorService;
  private kycService: KYCService;
  private analyticsService: AnalyticsService;

  constructor() {
    this.vendorService = new VendorService();
    this.kycService = new KYCService();
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Register new vendor
   * POST /api/v1/vendors
   */
  async registerVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = VendorCreateSchema.parse(req.body);
      const vendor = await this.vendorService.createVendor(validatedData);

      const response: ApiResponse = {
        success: true,
        data: vendor,
        message: 'Vendor registration initiated successfully',
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all vendors with filtering and pagination
   * GET /api/v1/vendors
   */
  async getAllVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchParams: VendorSearchParams = {
        query: req.query.query as string,
        status: req.query.status as any,
        kycStatus: req.query.kycStatus as any,
        businessType: req.query.businessType as string,
        location: req.query.location as string,
        rating: req.query.rating ? parseFloat(req.query.rating as string) : undefined,
        isActive: req.query.isActive !== 'false',
        sortBy: (req.query.sortBy as any) || 'createdAt',
        sortOrder: (req.query.sortOrder as any) || 'desc',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      };

      const result = await this.vendorService.getAllVendors(searchParams);

      const response: ApiResponse = {
        success: true,
        data: result.vendors,
        pagination: result.pagination,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor by ID
   * GET /api/v1/vendors/:id
   */
  async getVendorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const includeAnalytics = req.query.includeAnalytics === 'true';
      const includeProducts = req.query.includeProducts === 'true';

      const vendor = await this.vendorService.getVendorById(id, {
        includeAnalytics,
        includeProducts
      });

      if (!vendor) {
        throw new NotFoundError('Vendor not found');
      }

      const response: ApiResponse = {
        success: true,
        data: vendor,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update vendor profile
   * PUT /api/v1/vendors/:id
   */
  async updateVendorProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = VendorUpdateSchema.parse(req.body);
      
      const vendor = await this.vendorService.updateVendor(id, validatedData);

      if (!vendor) {
        throw new NotFoundError('Vendor not found');
      }

      const response: ApiResponse = {
        success: true,
        data: vendor,
        message: 'Vendor profile updated successfully',
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit KYC documents
   * POST /api/v1/vendors/:id/kyc
   */
  async submitKYC(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const validatedData = KYCSubmissionSchema.parse(req.body);

      const kycSubmission = await this.kycService.submitKYC(vendorId, validatedData);

      const response: ApiResponse = {
        success: true,
        data: kycSubmission,
        message: 'KYC documents submitted successfully',
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get KYC status
   * GET /api/v1/vendors/:id/kyc
   */
  async getKYCStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const kycStatus = await this.kycService.getKYCStatus(vendorId);

      const response: ApiResponse = {
        success: true,
        data: kycStatus,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve KYC submission
   * POST /api/v1/vendors/:id/kyc/approve
   */
  async approveKYC(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const { notes } = req.body;

      const result = await this.kycService.approveKYC(vendorId, notes);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'KYC approved successfully',
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject KYC submission
   * POST /api/v1/vendors/:id/kyc/reject
   */
  async rejectKYC(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const { reason, notes } = req.body;

      const result = await this.kycService.rejectKYC(vendorId, reason, notes);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'KYC rejected',
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor analytics
   * GET /api/v1/vendors/:id/analytics
   */
  async getVendorAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const timeRange = req.query.timeRange as string || '30d';

      const analytics = await this.analyticsService.getVendorAnalytics(vendorId, timeRange);

      const response: ApiResponse = {
        success: true,
        data: analytics,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0',
          timeRange
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor performance metrics
   * GET /api/v1/vendors/:id/performance
   */
  async getVendorPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const timeRange = req.query.timeRange as string || '30d';

      const performance = await this.analyticsService.getVendorPerformance(vendorId, timeRange);

      const response: ApiResponse = {
        success: true,
        data: performance,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0',
          timeRange
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor products
   * GET /api/v1/vendors/:id/products
   */
  async getVendorProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const searchParams = {
        vendorId,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: (req.query.sortBy as any) || 'createdAt',
        sortOrder: (req.query.sortOrder as any) || 'desc',
        isActive: req.query.isActive !== 'false'
      };

      const result = await this.vendorService.getVendorProducts(searchParams);

      const response: ApiResponse = {
        success: true,
        data: result.products,
        pagination: result.pagination,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor orders
   * GET /api/v1/vendors/:id/orders
   */
  async getVendorOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const searchParams = {
        vendorId,
        status: req.query.status as any,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };

      const result = await this.vendorService.getVendorOrders(searchParams);

      const response: ApiResponse = {
        success: true,
        data: result.orders,
        pagination: result.pagination,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request payout
   * POST /api/v1/vendors/:id/payouts
   */
  async requestPayout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const validatedData = PayoutRequestSchema.parse(req.body);

      const payout = await this.vendorService.requestPayout(vendorId, validatedData);

      const response: ApiResponse = {
        success: true,
        data: payout,
        message: 'Payout request submitted successfully',
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor payouts
   * GET /api/v1/vendors/:id/payouts
   */
  async getVendorPayouts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const searchParams = {
        vendorId,
        status: req.query.status as any,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      };

      const result = await this.vendorService.getVendorPayouts(searchParams);

      const response: ApiResponse = {
        success: true,
        data: result.payouts,
        pagination: result.pagination,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor earnings summary
   * GET /api/v1/vendors/:id/earnings
   */
  async getVendorEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const timeRange = req.query.timeRange as string || '30d';

      const earnings = await this.vendorService.getVendorEarnings(vendorId, timeRange);

      const response: ApiResponse = {
        success: true,
        data: earnings,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0',
          timeRange
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update vendor status
   * PUT /api/v1/vendors/:id/status
   */
  async updateVendorStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const { status, reason } = req.body;

      const result = await this.vendorService.updateVendorStatus(vendorId, status, reason);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: `Vendor status updated to ${status}`,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor store settings
   * GET /api/v1/vendors/:id/store
   */
  async getVendorStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const store = await this.vendorService.getVendorStore(vendorId);

      const response: ApiResponse = {
        success: true,
        data: store,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update vendor store settings
   * PUT /api/v1/vendors/:id/store
   */
  async updateVendorStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const storeData = req.body;

      const store = await this.vendorService.updateVendorStore(vendorId, storeData);

      const response: ApiResponse = {
        success: true,
        data: store,
        message: 'Store settings updated successfully',
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor commission structure
   * GET /api/v1/vendors/:id/commission
   */
  async getVendorCommission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const commission = await this.vendorService.getVendorCommission(vendorId);

      const response: ApiResponse = {
        success: true,
        data: commission,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top performing vendors
   * GET /api/v1/vendors/top-performers
   */
  async getTopPerformers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const timeRange = req.query.timeRange as string || '30d';
      const metric = req.query.metric as string || 'revenue';

      const topPerformers = await this.analyticsService.getTopPerformers(limit, timeRange, metric);

      const response: ApiResponse = {
        success: true,
        data: topPerformers,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0',
          timeRange,
          metric
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor reviews and ratings
   * GET /api/v1/vendors/:id/reviews
   */
  async getVendorReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const searchParams = {
        vendorId,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        rating: req.query.rating ? parseInt(req.query.rating as string) : undefined,
        sortBy: (req.query.sortBy as any) || 'createdAt',
        sortOrder: (req.query.sortOrder as any) || 'desc'
      };

      const result = await this.vendorService.getVendorReviews(searchParams);

      const response: ApiResponse = {
        success: true,
        data: result.reviews,
        pagination: result.pagination,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export vendor data
   * GET /api/v1/vendors/:id/export
   */
  async exportVendorData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: vendorId } = req.params;
      const format = req.query.format as string || 'csv';
      const type = req.query.type as string || 'profile';

      const exportData = await this.vendorService.exportVendorData(vendorId, format, type);

      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=vendor-${vendorId}-${type}.${format}`);
      res.send(exportData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor analytics overview
   * GET /api/v1/vendors/analytics/overview
   */
  async getVendorsAnalyticsOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const timeRange = req.query.timeRange as string || '30d';
      const overview = await this.analyticsService.getVendorsOverview(timeRange);

      const response: ApiResponse = {
        success: true,
        data: overview,
        meta: {
          service: 'vendor-controller',
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: '2.0.0',
          timeRange
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}