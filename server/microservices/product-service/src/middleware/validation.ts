/**
 * Product Service Validation Middleware
 * Enterprise-level request validation for product operations
 */

import { Request, Response, NextFunction } from 'express';
import { ProductCreateSchema, ProductUpdateSchema, ValidationError } from '../types';
import { z } from 'zod';

/**
 * Validate product creation data
 */
export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  try {
    ProductCreateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = new ValidationError('Product validation failed', error.errors);
      next(validationError);
    } else {
      next(error);
    }
  }
};

/**
 * Validate product update data
 */
export const validateProductUpdate = (req: Request, res: Response, next: NextFunction) => {
  try {
    ProductUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = new ValidationError('Product update validation failed', error.errors);
      next(validationError);
    } else {
      next(error);
    }
  }
};

/**
 * Validate product ID parameter
 */
export const validateProductId = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new ValidationError('Product ID is required');
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValidationError('Invalid product ID format');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate search query parameters
 */
export const validateSearchQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, minPrice, maxPrice, page, limit } = req.query;

    // Validate search query
    if (query && typeof query !== 'string') {
      throw new ValidationError('Search query must be a string');
    }

    // Validate price range
    if (minPrice && isNaN(Number(minPrice))) {
      throw new ValidationError('Minimum price must be a number');
    }

    if (maxPrice && isNaN(Number(maxPrice))) {
      throw new ValidationError('Maximum price must be a number');
    }

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      throw new ValidationError('Minimum price cannot be greater than maximum price');
    }

    // Validate pagination
    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
      throw new ValidationError('Page must be a positive number');
    }

    if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
      throw new ValidationError('Limit must be a number between 1 and 100');
    }

    next();
  } catch (error) {
    next(error);
  }
};