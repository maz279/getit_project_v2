/**
 * Vendor Controller - Amazon.com/Shopee.sg Level Implementation
 * Handles all HTTP requests for vendor operations with enterprise features
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
      const { vendorId } = req.params;
      const vendor = await this.vendorService.getVendorById(vendorId);

      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      res.json({
        success: true,
        data: vendor
      });
    } catch (error: any) {
      this.loggingService.error('Failed to fetch vendor profile', { error: error.message, vendorId: req.params.vendorId });
      res.status(500).json({ error: 'Failed to fetch vendor profile' });
    }
  }

  /**
   * Update vendor profile
   */
  async updateVendorProfile(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const updateData: UpdateVendorRequest = req.body;

      const vendor = await this.vendorService.updateVendor(vendorId, updateData);

      this.loggingService.info('Vendor profile updated', {
        vendorId,
        updatedBy: req.user?.id
      });

      res.json({
        success: true,
        message: 'Vendor profile updated successfully',
        data: vendor
      });
    } catch (error: any) {
      this.loggingService.error('Failed to update vendor profile', { error: error.message, vendorId: req.params.vendorId });
      res.status(500).json({ error: 'Failed to update vendor profile' });
    }
  }

  /**
   * Get vendor analytics
   */
  async getVendorAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { period = 'monthly', startDate, endDate } = req.query;

      const analytics = await this.analyticsService.getVendorAnalytics(vendorId, {
        period: period as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      this.loggingService.error('Failed to fetch vendor analytics', { error: error.message, vendorId: req.params.vendorId });
      res.status(500).json({ error: 'Failed to fetch vendor analytics' });
    }
  }

  /**
   * Submit KYC documents
   */
  async submitKYC(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const kycData: KYCSubmissionRequest = req.body;

      const kycSubmission = await this.kycService.submitKYC(vendorId, kycData);

      this.loggingService.info('KYC submitted for vendor', {
        vendorId,
        kycId: kycSubmission.id,
        submittedBy: req.user?.id
      });

      res.json({
        success: true,
        message: 'KYC documents submitted successfully',
        data: kycSubmission
      });
    } catch (error: any) {
      this.loggingService.error('Failed to submit KYC', { error: error.message, vendorId: req.params.vendorId });
      res.status(500).json({ error: 'Failed to submit KYC documents' });
    }
  }

  /**
   * Get vendor dashboard data
   */
  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;

      const [vendor, analytics, recentOrders, pendingPayouts] = await Promise.all([
        this.vendorService.getVendorById(vendorId),
        this.analyticsService.getVendorDashboardAnalytics(vendorId),
        this.vendorService.getRecentOrders(vendorId, 5),
        this.vendorService.getPendingPayouts(vendorId)
      ]);

      res.json({
        success: true,
        data: {
          vendor,
          analytics,
          recentOrders,
          pendingPayouts
        }
      });
    } catch (error: any) {
      this.loggingService.error('Failed to fetch vendor dashboard data', { error: error.message, vendorId: req.params.vendorId });
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  }

  /**
   * Get all vendors (Admin only)
   */
  async getAllVendors(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status, search } = req.query;

      const vendors = await this.vendorService.getAllVendors({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        search: search as string
      });

      res.json({
        success: true,
        data: vendors
      });
    } catch (error: any) {
      this.loggingService.error('Failed to fetch all vendors', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      service: 'vendor-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
}