/**
 * Order Service - Enterprise Microservice Entry Point
 * Complete Amazon.com/Shopee.sg-level order management microservice
 */

import express from 'express';
import orderRoutes from './routes/orderRoutes';
import { OrderService } from './services/OrderService';
import { OrderController } from './controllers/OrderController';

// Create order service app
const orderApp = express();
orderApp.use('/', orderRoutes);

// Export service app interface (similar to user service)
export const orderServiceApp = {
  getApp: () => orderApp
};

// Export enterprise components
export { OrderService, OrderController };
export { default as orderRoutes } from './routes/orderRoutes';

// Service health check
export const orderServiceHealth = {
  name: 'order-service',
  version: '1.0.0',
  status: 'active',
  description: 'Enterprise Order Management Microservice',
  endpoints: [
    'POST /api/v1/orders',
    'GET /api/v1/orders/my-orders',
    'GET /api/v1/orders/search',
    'GET /api/v1/orders/analytics',
    'GET /api/v1/orders/:orderId',
    'PATCH /api/v1/orders/:orderId/status',
    'PATCH /api/v1/orders/:orderId/cancel'
  ],
  features: [
    'Complete order lifecycle management',
    'Real-time status tracking',
    'Bangladesh payment integration',
    'Advanced analytics and reporting',
    'Enterprise-level validation',
    'Redis caching for performance',
    'Comprehensive logging',
    'Multi-vendor support'
  ]
};

export default orderRoutes;