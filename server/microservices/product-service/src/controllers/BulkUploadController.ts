/**
 * Bulk Upload Controller - Stub Implementation
 */

import { Request, Response } from 'express';

export class BulkUploadController {
  async getHealth(req: Request, res: Response) {
    res.json({
      success: true,
      service: 'bulk-upload-controller',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }
}