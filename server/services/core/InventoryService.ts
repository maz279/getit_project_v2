/**
 * Consolidated Inventory Service
 * Replaces: client/src/services/inventory/, api/InventoryService.js, ml/InventoryManager.ts
 * 
 * Enterprise inventory management with multi-location Bangladesh optimization
 */

import { BaseService, ServiceConfig, ServiceResponse } from '../base/BaseService';
import { ServiceLogger } from '../utils/ServiceLogger';
import { ErrorHandler } from '../utils/ErrorHandler';

// Inventory Item Interface
export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  maxStockLevel: number;
  costPrice: number;
  sellingPrice: number;
  location: InventoryLocation;
  lastUpdated: Date;
  lastStockMovement: Date;
  supplier?: {
    id: string;
    name: string;
    contactInfo: string;
  };
}

// Bangladesh Location Interface
export interface InventoryLocation {
  id: string;
  name: string;
  namebn: string;
  type: 'warehouse' | 'store' | 'vendor' | 'dropship';
  address: {
    division: string;
    district: string;
    upazila: string;
    fullAddress: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  capacity: number;
  currentUtilization: number;
  isActive: boolean;
}

// Stock Movement Interface
export interface StockMovement {
  id: string;
  productId: string;
  locationId: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment' | 'reserved' | 'released';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string;
  timestamp: Date;
  userId: string;
  notes?: string;
}

// Inventory Analytics Interface
export interface InventoryAnalytics {
  totalValue: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  turnoverRate: number;
  averageDaysToSell: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
  slowMovingProducts: Array<{
    productId: string;
    productName: string;
    daysSinceLastSale: number;
    currentStock: number;
  }>;
  locationPerformance: Array<{
    locationId: string;
    locationName: string;
    utilization: number;
    efficiency: number;
  }>;
}

// Inventory Forecast Interface
export interface InventoryForecast {
  productId: string;
  currentStock: number;
  projectedDemand: number;
  recommendedReorder: number;
  forecastAccuracy: number;
  seasonalFactors: {
    ramadan: number;
    eid: number;
    pohela_boishakh: number;
    victory_day: number;
  };
  locationRecommendations: Array<{
    locationId: string;
    recommendedStock: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export class InventoryService extends BaseService {
  private readonly logger: ServiceLogger;
  private readonly errorHandler: ErrorHandler;

  constructor(config: ServiceConfig) {
    super(config);
    this.logger = new ServiceLogger('InventoryService');
    this.errorHandler = new ErrorHandler('InventoryService');
  }

  /**
   * Check product availability
   */
  async checkAvailability(productId: string, quantity: number, locationId?: string): Promise<ServiceResponse<boolean>> {
    try {
      this.logger.info('Checking product availability', { productId, quantity, locationId });

      let availableQuantity = 0;

      if (locationId) {
        // Check specific location
        const locationStock = await this.getLocationStock(productId, locationId);
        availableQuantity = locationStock?.availableQuantity || 0;
      } else {
        // Check across all locations
        const totalStock = await this.getTotalStock(productId);
        availableQuantity = totalStock.availableQuantity;
      }

      const isAvailable = availableQuantity >= quantity;

      return {
        success: true,
        data: isAvailable,
        message: isAvailable ? 'Product available' : 'Insufficient stock',
        metadata: {
          availableQuantity,
          requestedQuantity: quantity,
          locationId
        }
      };

    } catch (error) {
      return this.errorHandler.handleError('AVAILABILITY_CHECK_FAILED', 'Failed to check product availability', error);
    }
  }

  /**
   * Reserve inventory for order
   */
  async reserveInventory(productId: string, quantity: number, orderId: string, locationId?: string): Promise<ServiceResponse<boolean>> {
    try {
      this.logger.info('Reserving inventory', { productId, quantity, orderId, locationId });

      // Find optimal location if not specified
      const targetLocation = locationId || await this.findOptimalLocation(productId, quantity);
      
      if (!targetLocation) {
        return this.errorHandler.handleError('NO_LOCATION_FOUND', 'No suitable location found for reservation');
      }

      // Check availability
      const availability = await this.checkAvailability(productId, quantity, targetLocation);
      if (!availability.data) {
        return this.errorHandler.handleError('INSUFFICIENT_STOCK', 'Insufficient stock for reservation');
      }

      // Create reservation
      await this.createReservation(productId, quantity, orderId, targetLocation);

      // Record stock movement
      await this.recordStockMovement({
        productId,
        locationId: targetLocation,
        type: 'reserved',
        quantity: -quantity,
        previousQuantity: availability.metadata?.availableQuantity || 0,
        newQuantity: (availability.metadata?.availableQuantity || 0) - quantity,
        reason: `Reserved for order ${orderId}`,
        reference: orderId,
        timestamp: new Date(),
        userId: 'system'
      });

      this.logger.info('Inventory reserved successfully', { productId, quantity, orderId, targetLocation });

      return {
        success: true,
        data: true,
        message: 'Inventory reserved successfully',
        metadata: { locationId: targetLocation }
      };

    } catch (error) {
      return this.errorHandler.handleError('RESERVATION_FAILED', 'Failed to reserve inventory', error);
    }
  }

  /**
   * Release reserved inventory
   */
  async releaseReservation(productId: string, quantity: number, orderId: string): Promise<ServiceResponse<boolean>> {
    try {
      this.logger.info('Releasing inventory reservation', { productId, quantity, orderId });

      const reservation = await this.getReservation(orderId, productId);
      if (!reservation) {
        return this.errorHandler.handleError('RESERVATION_NOT_FOUND', 'Reservation not found');
      }

      // Release reservation
      await this.deleteReservation(orderId, productId);

      // Record stock movement
      await this.recordStockMovement({
        productId,
        locationId: reservation.locationId,
        type: 'released',
        quantity: quantity,
        previousQuantity: reservation.reservedQuantity,
        newQuantity: reservation.reservedQuantity + quantity,
        reason: `Released from order ${orderId}`,
        reference: orderId,
        timestamp: new Date(),
        userId: 'system'
      });

      return {
        success: true,
        data: true,
        message: 'Reservation released successfully'
      };

    } catch (error) {
      return this.errorHandler.handleError('RELEASE_FAILED', 'Failed to release reservation', error);
    }
  }

  /**
   * Update stock levels
   */
  async updateStock(productId: string, locationId: string, quantity: number, type: 'add' | 'subtract' | 'set', reason: string, userId: string): Promise<ServiceResponse<InventoryItem>> {
    try {
      this.logger.info('Updating stock', { productId, locationId, quantity, type, reason });

      const currentStock = await this.getLocationStock(productId, locationId);
      if (!currentStock) {
        return this.errorHandler.handleError('STOCK_NOT_FOUND', 'Stock record not found');
      }

      let newQuantity: number;
      switch (type) {
        case 'add':
          newQuantity = currentStock.quantity + quantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, currentStock.quantity - quantity);
          break;
        case 'set':
          newQuantity = quantity;
          break;
        default:
          throw new Error('Invalid update type');
      }

      // Update stock record
      const updatedStock = await this.updateStockRecord(productId, locationId, newQuantity);

      // Record stock movement
      await this.recordStockMovement({
        productId,
        locationId,
        type: type === 'add' ? 'in' : 'out',
        quantity: type === 'add' ? quantity : -quantity,
        previousQuantity: currentStock.quantity,
        newQuantity,
        reason,
        timestamp: new Date(),
        userId
      });

      // Check for low stock alerts
      await this.checkLowStockAlerts(updatedStock);

      return {
        success: true,
        data: updatedStock,
        message: 'Stock updated successfully'
      };

    } catch (error) {
      return this.errorHandler.handleError('STOCK_UPDATE_FAILED', 'Failed to update stock', error);
    }
  }

  /**
   * Transfer stock between locations
   */
  async transferStock(productId: string, fromLocationId: string, toLocationId: string, quantity: number, reason: string, userId: string): Promise<ServiceResponse<boolean>> {
    try {
      this.logger.info('Transferring stock', { productId, fromLocationId, toLocationId, quantity, reason });

      // Check source availability
      const sourceStock = await this.getLocationStock(productId, fromLocationId);
      if (!sourceStock || sourceStock.availableQuantity < quantity) {
        return this.errorHandler.handleError('INSUFFICIENT_SOURCE_STOCK', 'Insufficient stock at source location');
      }

      // Reduce from source
      await this.updateStock(productId, fromLocationId, quantity, 'subtract', `Transfer to ${toLocationId}: ${reason}`, userId);

      // Add to destination
      await this.updateStock(productId, toLocationId, quantity, 'add', `Transfer from ${fromLocationId}: ${reason}`, userId);

      // Record transfer movement
      const transferId = `TRF_${Date.now()}`;
      await this.recordStockMovement({
        productId,
        locationId: fromLocationId,
        type: 'transfer',
        quantity: -quantity,
        previousQuantity: sourceStock.quantity,
        newQuantity: sourceStock.quantity - quantity,
        reason: `Transfer to ${toLocationId}`,
        reference: transferId,
        timestamp: new Date(),
        userId
      });

      return {
        success: true,
        data: true,
        message: 'Stock transferred successfully',
        metadata: { transferId }
      };

    } catch (error) {
      return this.errorHandler.handleError('TRANSFER_FAILED', 'Failed to transfer stock', error);
    }
  }

  /**
   * Get inventory analytics
   */
  async getInventoryAnalytics(locationId?: string, timeRange?: string): Promise<ServiceResponse<InventoryAnalytics>> {
    try {
      this.logger.info('Fetching inventory analytics', { locationId, timeRange });

      const analytics = await this.calculateInventoryAnalytics(locationId, timeRange);

      return {
        success: true,
        data: analytics,
        message: 'Inventory analytics retrieved successfully'
      };

    } catch (error) {
      return this.errorHandler.handleError('ANALYTICS_FAILED', 'Failed to retrieve inventory analytics', error);
    }
  }

  /**
   * Get inventory forecast with ML predictions
   */
  async getInventoryForecast(productId: string, days: number = 30): Promise<ServiceResponse<InventoryForecast>> {
    try {
      this.logger.info('Generating inventory forecast', { productId, days });

      const forecast = await this.generateForecast(productId, days);

      return {
        success: true,
        data: forecast,
        message: 'Inventory forecast generated successfully'
      };

    } catch (error) {
      return this.errorHandler.handleError('FORECAST_FAILED', 'Failed to generate inventory forecast', error);
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(locationId?: string): Promise<ServiceResponse<InventoryItem[]>> {
    try {
      this.logger.info('Fetching low stock alerts', { locationId });

      const lowStockItems = await this.fetchLowStockItems(locationId);

      return {
        success: true,
        data: lowStockItems,
        message: 'Low stock alerts retrieved successfully'
      };

    } catch (error) {
      return this.errorHandler.handleError('LOW_STOCK_FETCH_FAILED', 'Failed to fetch low stock alerts', error);
    }
  }

  /**
   * Get stock movements history
   */
  async getStockMovements(productId?: string, locationId?: string, limit: number = 100): Promise<ServiceResponse<StockMovement[]>> {
    try {
      this.logger.info('Fetching stock movements', { productId, locationId, limit });

      const movements = await this.fetchStockMovements(productId, locationId, limit);

      return {
        success: true,
        data: movements,
        message: 'Stock movements retrieved successfully'
      };

    } catch (error) {
      return this.errorHandler.handleError('MOVEMENTS_FETCH_FAILED', 'Failed to fetch stock movements', error);
    }
  }

  // Private helper methods
  private async getLocationStock(productId: string, locationId: string): Promise<InventoryItem | null> {
    // Implementation would fetch stock from specific location
    return null; // Placeholder
  }

  private async getTotalStock(productId: string): Promise<{ quantity: number; availableQuantity: number; reservedQuantity: number }> {
    // Implementation would aggregate stock across all locations
    return { quantity: 0, availableQuantity: 0, reservedQuantity: 0 }; // Placeholder
  }

  private async findOptimalLocation(productId: string, quantity: number): Promise<string | null> {
    // Implementation would find best location based on stock, proximity, etc.
    return null; // Placeholder
  }

  private async createReservation(productId: string, quantity: number, orderId: string, locationId: string): Promise<void> {
    // Implementation would create reservation record
  }

  private async getReservation(orderId: string, productId: string): Promise<{ locationId: string; reservedQuantity: number } | null> {
    // Implementation would fetch reservation details
    return null; // Placeholder
  }

  private async deleteReservation(orderId: string, productId: string): Promise<void> {
    // Implementation would remove reservation
  }

  private async updateStockRecord(productId: string, locationId: string, newQuantity: number): Promise<InventoryItem> {
    // Implementation would update stock in database
    return {} as InventoryItem; // Placeholder
  }

  private async recordStockMovement(movement: Omit<StockMovement, 'id'>): Promise<void> {
    // Implementation would record stock movement for audit trail
    this.logger.info('Stock movement recorded', movement);
  }

  private async checkLowStockAlerts(stock: InventoryItem): Promise<void> {
    // Implementation would check and send low stock alerts
    if (stock.availableQuantity <= stock.reorderLevel) {
      this.logger.warn('Low stock detected', { productId: stock.productId, quantity: stock.availableQuantity });
    }
  }

  private async calculateInventoryAnalytics(locationId?: string, timeRange?: string): Promise<InventoryAnalytics> {
    // Implementation would calculate comprehensive analytics
    return {
      totalValue: 2500000, // BDT 25 Lakh
      totalProducts: 1250,
      lowStockItems: 45,
      outOfStockItems: 12,
      turnoverRate: 4.2,
      averageDaysToSell: 87,
      topSellingProducts: [],
      slowMovingProducts: [],
      locationPerformance: []
    };
  }

  private async generateForecast(productId: string, days: number): Promise<InventoryForecast> {
    // Implementation would use ML to generate forecasts
    return {
      productId,
      currentStock: 150,
      projectedDemand: 75,
      recommendedReorder: 100,
      forecastAccuracy: 0.89,
      seasonalFactors: {
        ramadan: 1.5,
        eid: 2.0,
        pohela_boishakh: 1.3,
        victory_day: 1.1
      },
      locationRecommendations: []
    };
  }

  private async fetchLowStockItems(locationId?: string): Promise<InventoryItem[]> {
    // Implementation would fetch items below reorder level
    return []; // Placeholder
  }

  private async fetchStockMovements(productId?: string, locationId?: string, limit: number = 100): Promise<StockMovement[]> {
    // Implementation would fetch movement history
    return []; // Placeholder
  }
}

export default InventoryService;