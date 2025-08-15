/**
 * 🏥 HEALTH & MONITORING DOMAIN ROUTES
 * 
 * System health checks and monitoring endpoints
 * No rate limiting applied for health endpoints
 */

import { Router } from "express";

export async function healthRoutes() {
  const router = Router();

  // Basic health check
  router.get('/', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Detailed system status
  router.get('/detailed', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  });

  console.log('✅ Health routes initialized: /, /detailed');
  return router;
}