import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Shipping Service API Integration
 * Amazon.com/Shopee.sg-level shipping and logistics functionality with complete backend synchronization
 */
export class ShippingApiService {
  constructor() {
    this.baseUrl = '/api/v1/shipping';
  }

  // ================================
  // SHIPPING METHODS & ZONES
  // ================================

  /**
   * Get available shipping methods
   */
  async getShippingMethods(filters = {}) {
    const params = new URLSearchParams({
      destination: filters.destination || '',
      weight: filters.weight || '',
      serviceType: filters.serviceType || '',
      isActive: filters.isActive || 'true'
    });

    return await apiRequest(`${this.baseUrl}/methods?${params}`);
  }

  /**
   * Get shipping zones
   */
  async getShippingZones() {
    return await apiRequest(`${this.baseUrl}/zones`);
  }

  /**
   * Get zone details
   */
  async getZoneDetails(zoneId) {
    return await apiRequest(`${this.baseUrl}/zones/${zoneId}`);
  }

  /**
   * Create shipping method
   */
  async createShippingMethod(methodData) {
    return await apiRequest(`${this.baseUrl}/methods`, {
      method: 'POST',
      body: JSON.stringify(methodData)
    });
  }

  /**
   * Update shipping method
   */
  async updateShippingMethod(methodId, updateData) {
    return await apiRequest(`${this.baseUrl}/methods/${methodId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  // ================================
  // RATE CALCULATION
  // ================================

  /**
   * Calculate shipping rates
   */
  async calculateRates(rateRequest) {
    return await apiRequest(`${this.baseUrl}/rates/calculate`, {
      method: 'POST',
      body: JSON.stringify(rateRequest)
    });
  }

  /**
   * Get bulk shipping rates
   */
  async getBulkRates(bulkRequest) {
    return await apiRequest(`${this.baseUrl}/rates/bulk`, {
      method: 'POST',
      body: JSON.stringify(bulkRequest)
    });
  }

  /**
   * Compare shipping options
   */
  async compareShippingOptions(comparisonRequest) {
    return await apiRequest(`${this.baseUrl}/rates/compare`, {
      method: 'POST',
      body: JSON.stringify(comparisonRequest)
    });
  }

  /**
   * Get estimated delivery times
   */
  async getDeliveryEstimates(estimateRequest) {
    return await apiRequest(`${this.baseUrl}/rates/delivery-estimates`, {
      method: 'POST',
      body: JSON.stringify(estimateRequest)
    });
  }

  // ================================
  // SHIPMENT MANAGEMENT
  // ================================

  /**
   * Create shipment
   */
  async createShipment(shipmentData) {
    return await apiRequest(`${this.baseUrl}/shipments`, {
      method: 'POST',
      body: JSON.stringify(shipmentData)
    });
  }

  /**
   * Get shipment details
   */
  async getShipment(shipmentId) {
    return await apiRequest(`${this.baseUrl}/shipments/${shipmentId}`);
  }

  /**
   * Update shipment
   */
  async updateShipment(shipmentId, updateData) {
    return await apiRequest(`${this.baseUrl}/shipments/${shipmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(shipmentId, reason = '') {
    return await apiRequest(`${this.baseUrl}/shipments/${shipmentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Get shipments by order
   */
  async getShipmentsByOrder(orderId) {
    return await apiRequest(`${this.baseUrl}/shipments/order/${orderId}`);
  }

  /**
   * Get shipments by vendor
   */
  async getShipmentsByVendor(vendorId, filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '',
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/shipments/vendor/${vendorId}?${params}`);
  }

  // ================================
  // TRACKING & DELIVERY
  // ================================

  /**
   * Track shipment
   */
  async trackShipment(trackingNumber, carrier = '') {
    const params = new URLSearchParams({
      carrier
    });

    return await apiRequest(`${this.baseUrl}/track/${trackingNumber}?${params}`);
  }

  /**
   * Get tracking history
   */
  async getTrackingHistory(shipmentId) {
    return await apiRequest(`${this.baseUrl}/shipments/${shipmentId}/tracking-history`);
  }

  /**
   * Update tracking information
   */
  async updateTracking(shipmentId, trackingData) {
    return await apiRequest(`${this.baseUrl}/shipments/${shipmentId}/tracking`, {
      method: 'POST',
      body: JSON.stringify(trackingData)
    });
  }

  /**
   * Confirm delivery
   */
  async confirmDelivery(shipmentId, deliveryData) {
    return await apiRequest(`${this.baseUrl}/shipments/${shipmentId}/confirm-delivery`, {
      method: 'POST',
      body: JSON.stringify(deliveryData)
    });
  }

  /**
   * Report delivery issue
   */
  async reportDeliveryIssue(shipmentId, issueData) {
    return await apiRequest(`${this.baseUrl}/shipments/${shipmentId}/delivery-issue`, {
      method: 'POST',
      body: JSON.stringify(issueData)
    });
  }

  // ================================
  // BANGLADESH COURIER INTEGRATION
  // ================================

  /**
   * Get Bangladesh courier partners
   */
  async getBangladeshCouriers() {
    return await apiRequest(`${this.baseUrl}/bangladesh/couriers`);
  }

  /**
   * Create Pathao shipment
   */
  async createPathaoShipment(shipmentData) {
    return await apiRequest(`${this.baseUrl}/bangladesh/pathao/create-shipment`, {
      method: 'POST',
      body: JSON.stringify(shipmentData)
    });
  }

  /**
   * Create Paperfly shipment
   */
  async createPaperflyShipment(shipmentData) {
    return await apiRequest(`${this.baseUrl}/bangladesh/paperfly/create-shipment`, {
      method: 'POST',
      body: JSON.stringify(shipmentData)
    });
  }

  /**
   * Get Pathao zones
   */
  async getPathaoZones() {
    return await apiRequest(`${this.baseUrl}/bangladesh/pathao/zones`);
  }

  /**
   * Get Paperfly coverage areas
   */
  async getPaperflyCoverageAreas() {
    return await apiRequest(`${this.baseUrl}/bangladesh/paperfly/coverage-areas`);
  }

  /**
   * Calculate Bangladesh domestic shipping
   */
  async calculateBangladeshShipping(shippingRequest) {
    return await apiRequest(`${this.baseUrl}/bangladesh/calculate-rates`, {
      method: 'POST',
      body: JSON.stringify({ ...shippingRequest, country: 'BD' })
    });
  }

  /**
   * Get Bangladesh division shipping info
   */
  async getBangladeshDivisionShipping(division) {
    return await apiRequest(`${this.baseUrl}/bangladesh/divisions/${division}/shipping-info`);
  }

  // ================================
  // ADDRESS MANAGEMENT
  // ================================

  /**
   * Validate address
   */
  async validateAddress(addressData) {
    return await apiRequest(`${this.baseUrl}/address/validate`, {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  }

  /**
   * Get address suggestions
   */
  async getAddressSuggestions(query, country = 'BD') {
    const params = new URLSearchParams({
      q: query,
      country
    });

    return await apiRequest(`${this.baseUrl}/address/suggestions?${params}`);
  }

  /**
   * Standardize address
   */
  async standardizeAddress(addressData) {
    return await apiRequest(`${this.baseUrl}/address/standardize`, {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  }

  /**
   * Get postal code information
   */
  async getPostalCodeInfo(postalCode, country = 'BD') {
    const params = new URLSearchParams({
      country
    });

    return await apiRequest(`${this.baseUrl}/address/postal-code/${postalCode}?${params}`);
  }

  // ================================
  // PICKUP MANAGEMENT
  // ================================

  /**
   * Schedule pickup
   */
  async schedulePickup(pickupData) {
    return await apiRequest(`${this.baseUrl}/pickup/schedule`, {
      method: 'POST',
      body: JSON.stringify(pickupData)
    });
  }

  /**
   * Get pickup availability
   */
  async getPickupAvailability(locationData, date) {
    return await apiRequest(`${this.baseUrl}/pickup/availability`, {
      method: 'POST',
      body: JSON.stringify({ ...locationData, date })
    });
  }

  /**
   * Cancel pickup
   */
  async cancelPickup(pickupId, reason = '') {
    return await apiRequest(`${this.baseUrl}/pickup/${pickupId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Get pickup history
   */
  async getPickupHistory(vendorId, filters = {}) {
    const params = new URLSearchParams({
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      status: filters.status || '',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/pickup/vendor/${vendorId}/history?${params}`);
  }

  // ================================
  // RETURNS & REVERSE LOGISTICS
  // ================================

  /**
   * Create return shipment
   */
  async createReturnShipment(returnData) {
    return await apiRequest(`${this.baseUrl}/returns/create-shipment`, {
      method: 'POST',
      body: JSON.stringify(returnData)
    });
  }

  /**
   * Get return shipping label
   */
  async getReturnShippingLabel(returnId) {
    return await apiRequest(`${this.baseUrl}/returns/${returnId}/shipping-label`, {
      responseType: 'blob'
    });
  }

  /**
   * Track return shipment
   */
  async trackReturnShipment(returnId) {
    return await apiRequest(`${this.baseUrl}/returns/${returnId}/track`);
  }

  /**
   * Process return delivery
   */
  async processReturnDelivery(returnId, deliveryData) {
    return await apiRequest(`${this.baseUrl}/returns/${returnId}/process-delivery`, {
      method: 'POST',
      body: JSON.stringify(deliveryData)
    });
  }

  // ================================
  // SHIPPING ANALYTICS
  // ================================

  /**
   * Get shipping analytics
   */
  async getShippingAnalytics(period = '30d', filters = {}) {
    const params = new URLSearchParams({
      period,
      vendorId: filters.vendorId || '',
      carrier: filters.carrier || '',
      region: filters.region || ''
    });

    return await apiRequest(`${this.baseUrl}/analytics?${params}`);
  }

  /**
   * Get delivery performance metrics
   */
  async getDeliveryPerformance(period = '30d', carrier = '') {
    const params = new URLSearchParams({
      period,
      carrier
    });

    return await apiRequest(`${this.baseUrl}/analytics/delivery-performance?${params}`);
  }

  /**
   * Get shipping cost analysis
   */
  async getShippingCostAnalysis(period = '30d', breakdown = 'carrier') {
    const params = new URLSearchParams({
      period,
      breakdown // 'carrier', 'zone', 'service_type'
    });

    return await apiRequest(`${this.baseUrl}/analytics/cost-analysis?${params}`);
  }

  /**
   * Get carrier comparison
   */
  async getCarrierComparison(period = '30d', metrics = ['cost', 'speed', 'reliability']) {
    return await apiRequest(`${this.baseUrl}/analytics/carrier-comparison`, {
      method: 'POST',
      body: JSON.stringify({ period, metrics })
    });
  }

  // ================================
  // BULK OPERATIONS
  // ================================

  /**
   * Bulk create shipments
   */
  async bulkCreateShipments(shipmentsData) {
    return await apiRequest(`${this.baseUrl}/shipments/bulk-create`, {
      method: 'POST',
      body: JSON.stringify({ shipments: shipmentsData })
    });
  }

  /**
   * Bulk update tracking
   */
  async bulkUpdateTracking(trackingUpdates) {
    return await apiRequest(`${this.baseUrl}/tracking/bulk-update`, {
      method: 'POST',
      body: JSON.stringify({ updates: trackingUpdates })
    });
  }

  /**
   * Export shipping data
   */
  async exportShippingData(exportType, filters = {}) {
    const params = new URLSearchParams({
      type: exportType, // 'shipments', 'tracking', 'analytics', 'costs'
      format: filters.format || 'csv',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  // ================================
  // REAL-TIME FEATURES
  // ================================

  /**
   * Subscribe to tracking updates
   */
  subscribeToTrackingUpdates(onUpdate, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/shipping/tracking/subscribe`;
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
   * Get shipping status color
   */
  getShippingStatusColor(status) {
    const colors = {
      'pending': '#F59E0B',
      'picked_up': '#3B82F6',
      'in_transit': '#8B5CF6',
      'out_for_delivery': '#F97316',
      'delivered': '#10B981',
      'exception': '#EF4444',
      'returned': '#6B7280'
    };
    return colors[status.toLowerCase()] || '#6B7280';
  }

  /**
   * Format shipping weight
   */
  formatWeight(weight, unit = 'kg') {
    return `${weight} ${unit}`;
  }

  /**
   * Calculate shipping dimensions volume
   */
  calculateVolume(dimensions) {
    const { length, width, height } = dimensions;
    return length * width * height;
  }

  /**
   * Format tracking number for display
   */
  formatTrackingNumber(trackingNumber, carrier = '') {
    // Add carrier-specific formatting if needed
    return trackingNumber.toUpperCase();
  }

  /**
   * Handle API errors with proper shipping context
   */
  handleError(error, operation) {
    console.error(`Shipping API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected shipping error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Shipping authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this shipping operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested shipping resource was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Shipping conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid shipping data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many shipping requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Shipping server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const shippingApiService = new ShippingApiService();