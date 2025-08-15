/**
 * Product Media Controller - Stub Implementation
 */

import { Request, Response } from 'express';

export class ProductMediaController {
  async getHealth(req: Request, res: Response) {
    res.json({
      success: true,
      service: 'product-media-controller',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }
}