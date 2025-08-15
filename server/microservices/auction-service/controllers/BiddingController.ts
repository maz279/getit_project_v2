/**
 * BiddingController.ts
 * Basic bidding controller to prevent import errors
 */

import { Router, Request, Response } from 'express';

export default class BiddingController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/health', this.getHealth.bind(this));
  }

  async getHealth(req: Request, res: Response): Promise<void> {
    res.json({ success: true, service: 'bidding-controller', status: 'healthy' });
  }

  getRouter(): Router {
    return this.router;
  }
}