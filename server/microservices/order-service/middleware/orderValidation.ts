/**
 * Order Validation Middleware - Enterprise Order Validation
 * Comprehensive validation for all order operations
 */

import { body, param, query } from 'express-validator';

export const validateCreateOrder = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.productId')
    .isUUID()
    .withMessage('Valid product ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('items.*.unitPrice')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Valid unit price is required'),
  
  body('items.*.name')
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name is required'),
  
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  
  body('paymentMethod')
    .isIn(['bkash', 'nagad', 'rocket', 'sslcommerz', 'cod'])
    .withMessage('Valid payment method is required'),
  
  body('couponCode')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Valid coupon code required'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

export const validateOrderId = [
  param('orderId')
    .isUUID()
    .withMessage('Valid order ID is required')
];

export const validateUpdateOrderStatus = [
  param('orderId')
    .isUUID()
    .withMessage('Valid order ID is required'),
  
  body('newStatus')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'returned', 'refunded'])
    .withMessage('Valid order status is required'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

export const validateCancelOrder = [
  param('orderId')
    .isUUID()
    .withMessage('Valid order ID is required'),
  
  body('reason')
    .isLength({ min: 1, max: 500 })
    .withMessage('Cancellation reason is required (max 500 characters)')
];

export const validateUserOrdersQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'returned', 'refunded'])
    .withMessage('Valid order status required'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required')
];

export const validateOrderSearch = [
  query('q')
    .isLength({ min: 1, max: 255 })
    .withMessage('Search query is required (max 255 characters)'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'returned', 'refunded'])
    .withMessage('Valid order status required'),
  
  query('vendorId')
    .optional()
    .isUUID()
    .withMessage('Valid vendor ID required'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required')
];

export const validateOrderAnalytics = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  
  query('vendorId')
    .optional()
    .isUUID()
    .withMessage('Valid vendor ID required'),
  
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'returned', 'refunded'])
    .withMessage('Valid order status required')
];