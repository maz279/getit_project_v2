/**
 * Search Controller - Stub Implementation
 */

import { Request, Response } from 'express';

export class SearchController {
  async getHealth(req: Request, res: Response) {
    res.json({
      success: true,
      service: 'search-controller',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }
}