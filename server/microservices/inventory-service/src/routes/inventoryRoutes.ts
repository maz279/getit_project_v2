/**
 * Inventory Routes - Amazon.com/Shopee.sg Level Routing
 * Enterprise-grade inventory management API endpoints
 */

import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController.js';
import { authMiddleware } from '../../../user-service/middleware/authMiddleware.js';
import { rateLimiter } from '../../../user-service/middleware/rateLimiter.js';

const router = Router();
const inventoryController = new InventoryController();

/**
 * @route GET /api/v1/inventory/health
 * @desc Health check for inventory service
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    service: 'inventory-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/v1/inventory/product/:productId
 * @desc Get product inventory status
 * @access Private
 */
router.get('/product/:productId', 
  authMiddleware, 
  rateLimiter,
  inventoryController.getProductInventory.bind(inventoryController)
);

/**
 * @route PUT /api/v1/inventory/product/:productId
 * @desc Update product inventory
 * @access Private (Admin/Vendor)
 */
router.put('/product/:productId', 
  authMiddleware, 
  rateLimiter,
  inventoryController.updateProductInventory.bind(inventoryController)
);

/**
 * @route POST /api/v1/inventory/reserve
 * @desc Reserve inventory for order
 * @access Private
 */
router.post('/reserve', 
  authMiddleware, 
  rateLimiter,
  inventoryController.reserveInventory.bind(inventoryController)
);

/**
 * @route GET /api/v1/inventory/alerts/low-stock
 * @desc Get low stock alerts
 * @access Private (Admin/Vendor)
 */
router.get('/alerts/low-stock', 
  authMiddleware, 
  rateLimiter,
  inventoryController.getLowStockAlerts.bind(inventoryController)
);



/**
 * @route GET /api/v1/inventory/analytics
 * @desc Get inventory analytics
 * @access Private (Admin/Vendor)
 */
router.get('/analytics', 
  authMiddleware, 
  rateLimiter,
  inventoryController.getInventoryAnalytics.bind(inventoryController)
);

export default router;