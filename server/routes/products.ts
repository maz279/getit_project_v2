/**
 * 📦 PRODUCTS DOMAIN ROUTES
 * 
 * Product management and catalog operations
 */

import { Router } from "express";
import type { IStorage } from "../storage";

export async function productRoutes(storage: IStorage) {
  const router = Router();

  // Get all products
  router.get('/', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const products = await storage.getProducts(parseInt(limit as string));
      
      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        details: (error as Error).message
      });
    }
  });

  console.log('✅ Product routes initialized: /');
  return router;
}