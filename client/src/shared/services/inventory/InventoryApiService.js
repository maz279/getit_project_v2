import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Inventory Service API Integration
 * Amazon.com/Shopee.sg-level inventory functionality with complete backend synchronization
 */
export class InventoryApiService {
  constructor() {
    this.baseUrl = '/api/v1/inventory';
    this.productBaseUrl = '/api/v1/products/inventory';
  }

  // ================================
  // CORE INVENTORY MANAGEMENT
  // ================================

  /**
   * Get comprehensive inventory overview
   */
  async getInventoryOverview(filters = {}) {
    const params = new URLSearchParams({
      page: filters.page || '1',
      limit: filters.limit || '50',
      sortBy: filters.sortBy || 'name',
      sortOrder: filters.sortOrder || 'asc',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/overview?${params}`);
  }

  /**
   * Get product inventory across all locations
   */
  async getProductInventory(productId, options = {}) {
    const params = new URLSearchParams({
      includeReserved: options.includeReserved || 'true',
      location: options.location || '',
      vendorId: options.vendorId || ''
    });

    return await apiRequest(`${this.baseUrl}/product/${productId}?${params}`);
  }

  /**
   * Update product inventory
   */
  async updateInventory(productId, updateData) {
    return await apiRequest(`${this.baseUrl}/product/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Bulk update inventory
   */
  async bulkUpdateInventory(updates) {
    return await apiRequest(`${this.baseUrl}/bulk-update`, {
      method: 'POST',
      body: JSON.stringify({ updates })
    });
  }

  /**
   * Reserve inventory for order
   */
  async reserveInventory(reservationData) {
    return await apiRequest(`${this.baseUrl}/reserve`, {
      method: 'POST',
      body: JSON.stringify(reservationData)
    });
  }

  /**
   * Release reserved inventory
   */
  async releaseInventory(reservationId, reason = '') {
    return await apiRequest(`${this.baseUrl}/release`, {
      method: 'POST',
      body: JSON.stringify({ reservationId, reason })
    });
  }

  // ================================
  // MULTI-LOCATION MANAGEMENT
  // ================================

  /**
   * Get inventory by location
   */
  async getInventoryByLocation(locationCode, filters = {}) {
    const params = new URLSearchParams({
      page: filters.page || '1',
      limit: filters.limit || '50',
      status: filters.status || '',
      category: filters.category || '',
      ...filters
    });

    return await apiRequest(`${this.productBaseUrl}/location/${locationCode}?${params}`);
  }

  /**
   * Transfer inventory between locations
   */
  async transferInventory(transferData) {
    return await apiRequest(`${this.productBaseUrl}/transfer`, {
      method: 'POST',
      body: JSON.stringify(transferData)
    });
  }

  /**
   * Get inventory movements history
   */
  async getInventoryMovements(productId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || '1',
      limit: options.limit || '20',
      startDate: options.startDate || '',
      endDate: options.endDate || '',
      type: options.type || '',
      location: options.location || ''
    });

    return await apiRequest(`${this.productBaseUrl}/${productId}/movements?${params}`);
  }

  /**
   * Get inventory audit trail
   */
  async getInventoryAudit(productId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || '1',
      limit: options.limit || '20',
      startDate: options.startDate || '',
      endDate: options.endDate || ''
    });

    return await apiRequest(`${this.productBaseUrl}/${productId}/audit?${params}`);
  }

  // ================================
  // ALERTS & NOTIFICATIONS
  // ================================

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(filters = {}) {
    const params = new URLSearchParams({
      vendorId: filters.vendorId || '',
      threshold: filters.threshold || '',
      page: filters.page || '1',
      limit: filters.limit || '20',
      location: filters.location || '',
      category: filters.category || ''
    });

    return await apiRequest(`${this.baseUrl}/alerts/low-stock?${params}`);
  }

  /**
   * Get out of stock alerts
   */
  async getOutOfStockAlerts(filters = {}) {
    const params = new URLSearchParams({
      vendorId: filters.vendorId || '',
      page: filters.page || '1',
      limit: filters.limit || '20',
      location: filters.location || ''
    });

    return await apiRequest(`${this.baseUrl}/alerts/out-of-stock?${params}`);
  }

  /**
   * Set up inventory alerts
   */
  async setupInventoryAlert(alertData) {
    return await apiRequest(`${this.baseUrl}/alerts/setup`, {
      method: 'POST',
      body: JSON.stringify(alertData)
    });
  }

  /**
   * Resolve inventory alert
   */
  async resolveAlert(alertId, resolution) {
    return await apiRequest(`${this.baseUrl}/alerts/${alertId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolution })
    });
  }

  // ================================
  // ANALYTICS & REPORTING
  // ================================

  /**
   * Get comprehensive inventory analytics
   */
  async getInventoryAnalytics(filters = {}) {
    const params = new URLSearchParams({
      vendorId: filters.vendorId || '',
      timeframe: filters.timeframe || '30d',
      metrics: filters.metrics || 'turnover,value,alerts',
      location: filters.location || '',
      category: filters.category || ''
    });

    return await apiRequest(`${this.baseUrl}/analytics?${params}`);
  }

  /**
   * Get inventory turnover analysis
   */
  async getInventoryTurnover(productId, period = '30d') {
    return await apiRequest(`${this.baseUrl}/analytics/turnover/${productId}?period=${period}`);
  }

  /**
   * Get inventory valuation report
   */
  async getInventoryValuation(filters = {}) {
    const params = new URLSearchParams({
      date: filters.date || new Date().toISOString().split('T')[0],
      location: filters.location || '',
      category: filters.category || '',
      vendorId: filters.vendorId || ''
    });

    return await apiRequest(`${this.baseUrl}/analytics/valuation?${params}`);
  }

  /**
   * Get ABC analysis (fast/medium/slow moving products)
   */
  async getABCAnalysis(filters = {}) {
    const params = new URLSearchParams({
      period: filters.period || '90d',
      location: filters.location || '',
      vendorId: filters.vendorId || ''
    });

    return await apiRequest(`${this.baseUrl}/analytics/abc-analysis?${params}`);
  }

  /**
   * Get dead stock analysis
   */
  async getDeadStockAnalysis(filters = {}) {
    const params = new URLSearchParams({
      daysWithoutSale: filters.daysWithoutSale || '90',
      location: filters.location || '',
      vendorId: filters.vendorId || ''
    });

    return await apiRequest(`${this.baseUrl}/analytics/dead-stock?${params}`);
  }

  // ================================
  // STOCK OPERATIONS
  // ================================

  /**
   * Perform stock adjustment
   */
  async adjustStock(adjustmentData) {
    return await apiRequest(`${this.baseUrl}/stock/adjust`, {
      method: 'POST',
      body: JSON.stringify(adjustmentData)
    });
  }

  /**
   * Create purchase order
   */
  async createPurchaseOrder(orderData) {
    return await apiRequest(`${this.baseUrl}/purchase-order`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  /**
   * Receive stock shipment
   */
  async receiveShipment(shipmentData) {
    return await apiRequest(`${this.baseUrl}/shipment/receive`, {
      method: 'POST',
      body: JSON.stringify(shipmentData)
    });
  }

  /**
   * Perform stock count/cycle count
   */
  async performStockCount(countData) {
    return await apiRequest(`${this.baseUrl}/stock-count`, {
      method: 'POST',
      body: JSON.stringify(countData)
    });
  }

  // ================================
  // BANGLADESH-SPECIFIC FEATURES
  // ================================

  /**
   * Get inventory by Bangladesh divisions
   */
  async getInventoryByDivision(division, filters = {}) {
    const divisionMap = {
      'dhaka': 'DHK',
      'chittagong': 'CTG', 
      'sylhet': 'SYL',
      'rajshahi': 'RAJ',
      'khulna': 'KHU',
      'barisal': 'BAR',
      'rangpur': 'RAN',
      'mymensingh': 'MYM'
    };

    const locationCode = divisionMap[division.toLowerCase()] || division;
    return await this.getInventoryByLocation(locationCode, filters);
  }

  /**
   * Get festival impact analysis
   */
  async getFestivalImpactAnalysis(festival, year = new Date().getFullYear()) {
    return await apiRequest(`${this.baseUrl}/analytics/festival-impact?festival=${festival}&year=${year}`);
  }

  /**
   * Get monsoon season inventory planning
   */
  async getMonsoonInventoryPlanning() {
    return await apiRequest(`${this.baseUrl}/analytics/monsoon-planning`);
  }

  // ================================
  // WAREHOUSE MANAGEMENT
  // ================================

  /**
   * Get warehouse utilization
   */
  async getWarehouseUtilization(warehouseId = '') {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : '';
    return await apiRequest(`${this.baseUrl}/warehouse/utilization${params}`);
  }

  /**
   * Optimize warehouse layout
   */
  async optimizeWarehouseLayout(warehouseId, optimizationCriteria = {}) {
    return await apiRequest(`${this.baseUrl}/warehouse/${warehouseId}/optimize`, {
      method: 'POST',
      body: JSON.stringify(optimizationCriteria)
    });
  }

  /**
   * Get pick list optimization
   */
  async getPickListOptimization(orderIds) {
    return await apiRequest(`${this.baseUrl}/warehouse/pick-list-optimize`, {
      method: 'POST',
      body: JSON.stringify({ orderIds })
    });
  }

  // ================================
  // EXPORT & INTEGRATION
  // ================================

  /**
   * Export inventory data
   */
  async exportInventoryData(format = 'csv', filters = {}) {
    const params = new URLSearchParams({
      format,
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Import inventory data
   */
  async importInventoryData(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    return await apiRequest(`${this.baseUrl}/import`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove content-type to let browser set it with boundary
    });
  }

  /**
   * Get import/export job status
   */
  async getJobStatus(jobId) {
    return await apiRequest(`${this.baseUrl}/job/${jobId}/status`);
  }

  // ================================
  // REAL-TIME MONITORING
  // ================================

  /**
   * Get real-time inventory status
   */
  async getRealTimeInventoryStatus() {
    return await apiRequest(`${this.baseUrl}/real-time/status`);
  }

  /**
   * Subscribe to inventory updates (WebSocket)
   */
  subscribeToInventoryUpdates(onUpdate, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/inventory/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', filters }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };
    
    return ws;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Handle API errors with proper logging and user feedback
   */
  handleError(error, operation) {
    console.error(`Inventory API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested inventory item was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Inventory conflict. Please refresh and try again.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Server error. Please try again later.';
    }

    return errorResponse;
  }

  /**
   * Format inventory data for display
   */
  formatInventoryData(data) {
    return {
      ...data,
      formattedValue: new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT'
      }).format(data.value || 0),
      formattedQuantity: new Intl.NumberFormat('en-BD').format(data.quantity || 0),
      statusColor: this.getStatusColor(data.status),
      locationName: this.getLocationName(data.locationCode)
    };
  }

  /**
   * Get status color coding
   */
  getStatusColor(status) {
    const colors = {
      'in_stock': 'green',
      'low_stock': 'yellow', 
      'out_of_stock': 'red',
      'overstock': 'blue',
      'discontinued': 'gray'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get location name from code
   */
  getLocationName(locationCode) {
    const locations = {
      'DHK': 'Dhaka',
      'CTG': 'Chittagong',
      'SYL': 'Sylhet', 
      'RAJ': 'Rajshahi',
      'KHU': 'Khulna',
      'BAR': 'Barisal',
      'RAN': 'Rangpur',
      'MYM': 'Mymensingh'
    };
    return locations[locationCode] || locationCode;
  }
}

// Export singleton instance
export const inventoryApiService = new InventoryApiService();