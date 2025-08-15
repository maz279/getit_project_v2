// Order Service
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Order API Service
// Complete order management, tracking, and fulfillment operations

import BaseApiService from './BaseApiService.js';

class OrderService extends BaseApiService {
  constructor() {
    super();
    this.servicePath = '/orders';
  }

  // Order Creation & Management
  async createOrder(orderData) {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod,
      couponCode,
      notes,
      giftMessage,
      urgent = false,
      scheduledDelivery = null
    } = orderData;

    const createData = {
      items,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      shippingMethod,
      notes,
      urgent
    };

    if (couponCode) createData.couponCode = couponCode;
    if (giftMessage) createData.giftMessage = giftMessage;
    if (scheduledDelivery) createData.scheduledDelivery = scheduledDelivery;

    return this.post(this.servicePath, createData);
  }

  async getOrders(params = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      paymentStatus,
      shippingStatus,
      vendor,
      sortBy = 'date_desc',
      userId
    } = params;

    const queryParams = { page, limit, sortBy };
    if (status) queryParams.status = status;
    if (dateFrom) queryParams.dateFrom = dateFrom;
    if (dateTo) queryParams.dateTo = dateTo;
    if (paymentStatus) queryParams.paymentStatus = paymentStatus;
    if (shippingStatus) queryParams.shippingStatus = shippingStatus;
    if (vendor) queryParams.vendor = vendor;
    if (userId) queryParams.userId = userId;

    return this.get(this.servicePath, queryParams);
  }

  async getOrderById(orderId) {
    return this.get(`${this.servicePath}/${orderId}`);
  }

  async updateOrder(orderId, updateData) {
    return this.patch(`${this.servicePath}/${orderId}`, updateData);
  }

  async cancelOrder(orderId, cancellationData) {
    const {
      reason,
      reasonCode,
      refundAmount,
      notifyCustomer = true,
      adminNotes
    } = cancellationData;

    return this.post(`${this.servicePath}/${orderId}/cancel`, {
      reason,
      reasonCode,
      refundAmount,
      notifyCustomer,
      adminNotes
    });
  }

  async deleteOrder(orderId) {
    return this.delete(`${this.servicePath}/${orderId}`);
  }

  // Order Status Management
  async updateOrderStatus(orderId, status, notes = '') {
    return this.patch(`${this.servicePath}/${orderId}/status`, {
      status,
      notes
    });
  }

  async getOrderStatuses() {
    return this.get(`${this.servicePath}/statuses`);
  }

  async getOrderStatusHistory(orderId) {
    return this.get(`${this.servicePath}/${orderId}/status-history`);
  }

  // Payment Operations
  async getOrderPayments(orderId) {
    return this.get(`${this.servicePath}/${orderId}/payments`);
  }

  async processPayment(orderId, paymentData) {
    const {
      paymentMethod,
      amount,
      currency = 'BDT',
      gatewayData = {}
    } = paymentData;

    return this.post(`${this.servicePath}/${orderId}/payments`, {
      paymentMethod,
      amount,
      currency,
      gatewayData
    });
  }

  async refundPayment(orderId, refundData) {
    const {
      amount,
      reason,
      refundMethod = 'original',
      partialRefund = false
    } = refundData;

    return this.post(`${this.servicePath}/${orderId}/payments/refund`, {
      amount,
      reason,
      refundMethod,
      partialRefund
    });
  }

  async updatePaymentStatus(orderId, paymentId, status) {
    return this.patch(`${this.servicePath}/${orderId}/payments/${paymentId}/status`, {
      status
    });
  }

  // Shipping & Fulfillment
  async getOrderShipments(orderId) {
    return this.get(`${this.servicePath}/${orderId}/shipments`);
  }

  async createShipment(orderId, shipmentData) {
    const {
      items,
      courier,
      trackingNumber,
      shippingMethod,
      estimatedDelivery,
      packageWeight,
      packageDimensions,
      shippingCost,
      notes
    } = shipmentData;

    return this.post(`${this.servicePath}/${orderId}/shipments`, {
      items,
      courier,
      trackingNumber,
      shippingMethod,
      estimatedDelivery,
      packageWeight,
      packageDimensions,
      shippingCost,
      notes
    });
  }

  async updateShipment(orderId, shipmentId, updateData) {
    return this.patch(`${this.servicePath}/${orderId}/shipments/${shipmentId}`, updateData);
  }

  async trackShipment(orderId, shipmentId) {
    return this.get(`${this.servicePath}/${orderId}/shipments/${shipmentId}/track`);
  }

  async updateShipmentStatus(orderId, shipmentId, status, location = null) {
    const updateData = { status };
    if (location) updateData.location = location;

    return this.patch(`${this.servicePath}/${orderId}/shipments/${shipmentId}/status`, updateData);
  }

  async confirmDelivery(orderId, shipmentId, confirmationData) {
    const {
      deliveredAt = new Date().toISOString(),
      deliveredTo,
      signature,
      photo,
      notes
    } = confirmationData;

    return this.post(`${this.servicePath}/${orderId}/shipments/${shipmentId}/delivered`, {
      deliveredAt,
      deliveredTo,
      signature,
      photo,
      notes
    });
  }

  // Returns & Exchanges
  async getOrderReturns(orderId) {
    return this.get(`${this.servicePath}/${orderId}/returns`);
  }

  async createReturn(orderId, returnData) {
    const {
      items,
      reason,
      reasonCode,
      description,
      photos = [],
      preferredResolution = 'refund', // 'refund', 'exchange', 'store_credit'
      bankDetails = null
    } = returnData;

    const createData = {
      items,
      reason,
      reasonCode,
      description,
      photos,
      preferredResolution
    };

    if (bankDetails) createData.bankDetails = bankDetails;

    return this.post(`${this.servicePath}/${orderId}/returns`, createData);
  }

  async updateReturn(orderId, returnId, updateData) {
    return this.patch(`${this.servicePath}/${orderId}/returns/${returnId}`, updateData);
  }

  async approveReturn(orderId, returnId, approvalData) {
    const {
      approved,
      refundAmount,
      adminNotes,
      returnShippingLabel = null
    } = approvalData;

    return this.post(`${this.servicePath}/${orderId}/returns/${returnId}/approve`, {
      approved,
      refundAmount,
      adminNotes,
      returnShippingLabel
    });
  }

  async processReturnRefund(orderId, returnId, refundData) {
    return this.post(`${this.servicePath}/${orderId}/returns/${returnId}/refund`, refundData);
  }

  // Order Items Management
  async getOrderItems(orderId) {
    return this.get(`${this.servicePath}/${orderId}/items`);
  }

  async updateOrderItem(orderId, itemId, updateData) {
    return this.patch(`${this.servicePath}/${orderId}/items/${itemId}`, updateData);
  }

  async cancelOrderItem(orderId, itemId, reason) {
    return this.post(`${this.servicePath}/${orderId}/items/${itemId}/cancel`, { reason });
  }

  // Order Communications
  async getOrderMessages(orderId) {
    return this.get(`${this.servicePath}/${orderId}/messages`);
  }

  async sendOrderMessage(orderId, messageData) {
    const {
      message,
      messageType = 'general',
      isInternal = false,
      attachments = []
    } = messageData;

    return this.post(`${this.servicePath}/${orderId}/messages`, {
      message,
      messageType,
      isInternal,
      attachments
    });
  }

  async markMessageAsRead(orderId, messageId) {
    return this.post(`${this.servicePath}/${orderId}/messages/${messageId}/read`);
  }

  // Order Analytics & Reports
  async getOrderAnalytics(params = {}) {
    const {
      dateFrom,
      dateTo,
      groupBy = 'day',
      metrics = ['count', 'revenue', 'average_value']
    } = params;

    const queryParams = { groupBy, metrics: metrics.join(',') };
    if (dateFrom) queryParams.dateFrom = dateFrom;
    if (dateTo) queryParams.dateTo = dateTo;

    return this.get(`${this.servicePath}/analytics`, queryParams);
  }

  async getOrderStatistics(params = {}) {
    return this.get(`${this.servicePath}/statistics`, params);
  }

  async generateOrderReport(reportType, params = {}) {
    const {
      format = 'json',
      dateFrom,
      dateTo,
      filters = {}
    } = params;

    return this.post(`${this.servicePath}/reports/${reportType}`, {
      format,
      dateFrom,
      dateTo,
      filters
    });
  }

  // Bulk Operations
  async getBulkOrders(orderIds) {
    return this.post(`${this.servicePath}/bulk`, { orderIds });
  }

  async updateBulkOrders(orderIds, updateData) {
    return this.patch(`${this.servicePath}/bulk`, {
      orderIds,
      updateData
    });
  }

  async bulkUpdateStatus(orderIds, status, notes = '') {
    return this.patch(`${this.servicePath}/bulk/status`, {
      orderIds,
      status,
      notes
    });
  }

  async exportOrders(params = {}) {
    const {
      format = 'csv',
      dateFrom,
      dateTo,
      status,
      fields = []
    } = params;

    return this.get(`${this.servicePath}/export`, {
      format,
      dateFrom,
      dateTo,
      status,
      fields: fields.join(',')
    });
  }

  // Bangladesh-Specific Operations
  async getCODOrders(params = {}) {
    return this.get(`${this.servicePath}/cod`, params);
  }

  async updateCODStatus(orderId, status, collectedAmount = null) {
    const updateData = { status };
    if (collectedAmount) updateData.collectedAmount = collectedAmount;

    return this.patch(`${this.servicePath}/${orderId}/cod/status`, updateData);
  }

  async getMobileBankingOrders(params = {}) {
    return this.get(`${this.servicePath}/mobile-banking`, params);
  }

  async getOrdersByDivision(division, params = {}) {
    return this.get(`${this.servicePath}/division/${division}`, params);
  }

  async getDhakaCityOrders(params = {}) {
    return this.get(`${this.servicePath}/dhaka-city`, params);
  }

  async getInterCityOrders(params = {}) {
    return this.get(`${this.servicePath}/inter-city`, params);
  }

  // Order Scheduling
  async scheduleOrder(orderId, scheduleData) {
    const {
      scheduledDate,
      timeSlot,
      specialInstructions = ''
    } = scheduleData;

    return this.post(`${this.servicePath}/${orderId}/schedule`, {
      scheduledDate,
      timeSlot,
      specialInstructions
    });
  }

  async updateSchedule(orderId, scheduleData) {
    return this.patch(`${this.servicePath}/${orderId}/schedule`, scheduleData);
  }

  async cancelSchedule(orderId, reason) {
    return this.delete(`${this.servicePath}/${orderId}/schedule`, {
      data: { reason }
    });
  }

  // Gift Orders
  async createGiftOrder(orderId, giftData) {
    const {
      recipientName,
      recipientEmail,
      recipientPhone,
      giftMessage,
      senderName,
      deliveryDate,
      isAnonymous = false
    } = giftData;

    return this.post(`${this.servicePath}/${orderId}/gift`, {
      recipientName,
      recipientEmail,
      recipientPhone,
      giftMessage,
      senderName,
      deliveryDate,
      isAnonymous
    });
  }

  async updateGiftOrder(orderId, giftData) {
    return this.patch(`${this.servicePath}/${orderId}/gift`, giftData);
  }

  async sendGiftNotification(orderId) {
    return this.post(`${this.servicePath}/${orderId}/gift/notify`);
  }

  // Order Verification
  async verifyOrder(orderId, verificationData) {
    const {
      customerVerified = false,
      paymentVerified = false,
      inventoryVerified = false,
      verificationNotes = ''
    } = verificationData;

    return this.post(`${this.servicePath}/${orderId}/verify`, {
      customerVerified,
      paymentVerified,
      inventoryVerified,
      verificationNotes
    });
  }

  async flagOrder(orderId, flagData) {
    const {
      flagType,
      reason,
      severity = 'medium',
      autoActions = []
    } = flagData;

    return this.post(`${this.servicePath}/${orderId}/flag`, {
      flagType,
      reason,
      severity,
      autoActions
    });
  }

  async unflagOrder(orderId, reason) {
    return this.delete(`${this.servicePath}/${orderId}/flag`, {
      data: { reason }
    });
  }

  // Customer Service
  async escalateOrder(orderId, escalationData) {
    const {
      reason,
      priority = 'medium',
      assignTo = null,
      notes = ''
    } = escalationData;

    return this.post(`${this.servicePath}/${orderId}/escalate`, {
      reason,
      priority,
      assignTo,
      notes
    });
  }

  async addOrderNote(orderId, noteData) {
    const {
      note,
      isInternal = true,
      category = 'general',
      visibility = 'admin'
    } = noteData;

    return this.post(`${this.servicePath}/${orderId}/notes`, {
      note,
      isInternal,
      category,
      visibility
    });
  }

  async getOrderNotes(orderId, includeInternal = false) {
    return this.get(`${this.servicePath}/${orderId}/notes`, {
      includeInternal
    });
  }

  // Order Templates & Recurring Orders
  async saveOrderAsTemplate(orderId, templateName) {
    return this.post(`${this.servicePath}/${orderId}/save-template`, {
      templateName
    });
  }

  async createOrderFromTemplate(templateId, orderData = {}) {
    return this.post(`${this.servicePath}/from-template/${templateId}`, orderData);
  }

  async createRecurringOrder(orderId, recurringData) {
    const {
      frequency, // 'weekly', 'monthly', 'quarterly'
      interval = 1,
      endDate = null,
      maxOrders = null
    } = recurringData;

    return this.post(`${this.servicePath}/${orderId}/recurring`, {
      frequency,
      interval,
      endDate,
      maxOrders
    });
  }

  async updateRecurringOrder(orderId, recurringData) {
    return this.patch(`${this.servicePath}/${orderId}/recurring`, recurringData);
  }

  async pauseRecurringOrder(orderId, reason) {
    return this.post(`${this.servicePath}/${orderId}/recurring/pause`, { reason });
  }

  async resumeRecurringOrder(orderId) {
    return this.post(`${this.servicePath}/${orderId}/recurring/resume`);
  }

  async cancelRecurringOrder(orderId, reason) {
    return this.delete(`${this.servicePath}/${orderId}/recurring`, {
      data: { reason }
    });
  }

  // Health Check
  async healthCheck() {
    return this.get(`${this.servicePath}/health`);
  }
}

// Create and export singleton instance
const orderService = new OrderService();

export default orderService;