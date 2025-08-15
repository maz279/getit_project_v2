/**
 * Vendor Service API Integration
 * Amazon.com/Shopee.sg-Level Vendor Management Frontend Service
 * Complete integration with Vendor microservice backend
 */

const API_BASE_URL = '/api/v1/vendors';

class VendorApiService {
  // **Vendor Registration & Profile APIs**
  
  async registerVendor(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error registering vendor:', error);
      throw error;
    }
  }

  async getVendorProfile(vendorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/profile`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting vendor profile:', error);
      throw error;
    }
  }

  async updateVendorProfile(vendorId, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error updating vendor profile:', error);
      throw error;
    }
  }

  async getVendorSettings(vendorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/settings`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting vendor settings:', error);
      throw error;
    }
  }

  async updateVendorSettings(vendorId, settings) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error updating vendor settings:', error);
      throw error;
    }
  }

  // **Bangladesh KYC & Verification APIs**
  
  async submitKYCDocuments(vendorId, documents) {
    try {
      const formData = new FormData();
      
      if (documents.nidFront) formData.append('nidFront', documents.nidFront);
      if (documents.nidBack) formData.append('nidBack', documents.nidBack);
      if (documents.tradeLicense) formData.append('tradeLicense', documents.tradeLicense);
      if (documents.tinCertificate) formData.append('tinCertificate', documents.tinCertificate);
      if (documents.bankStatements) formData.append('bankStatements', documents.bankStatements);
      
      const response = await fetch(`${API_BASE_URL}/${vendorId}/kyc/documents`, {
        method: 'POST',
        body: formData
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error submitting KYC documents:', error);
      throw error;
    }
  }

  async getKYCStatus(vendorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/kyc/status`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting KYC status:', error);
      throw error;
    }
  }

  async getBangladeshVerificationRequirements() {
    try {
      const response = await fetch(`${API_BASE_URL}/kyc/bangladesh-requirements`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting verification requirements:', error);
      throw error;
    }
  }

  async verifyTradeLicense(vendorId, licenseNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/kyc/verify-trade-license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licenseNumber })
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error verifying trade license:', error);
      throw error;
    }
  }

  async verifyTIN(vendorId, tinNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/kyc/verify-tin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tinNumber })
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error verifying TIN:', error);
      throw error;
    }
  }

  // **Store Management APIs**
  
  async createStore(vendorId, storeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error creating store:', error);
      throw error;
    }
  }

  async getVendorStores(vendorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/stores`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting vendor stores:', error);
      throw error;
    }
  }

  async updateStore(vendorId, storeId, storeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error updating store:', error);
      throw error;
    }
  }

  async getStoreAnalytics(vendorId, storeId, period = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/stores/${storeId}/analytics?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting store analytics:', error);
      throw error;
    }
  }

  async getStoreCustomization(vendorId, storeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/stores/${storeId}/customization`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting store customization:', error);
      throw error;
    }
  }

  async updateStoreCustomization(vendorId, storeId, customization) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/stores/${storeId}/customization`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customization)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error updating store customization:', error);
      throw error;
    }
  }

  // **Product Management APIs**
  
  async getVendorProducts(vendorId, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/${vendorId}/products?${queryParams}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting vendor products:', error);
      throw error;
    }
  }

  async addProduct(vendorId, productData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(vendorId, productId, productData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(vendorId, productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/products/${productId}`, {
        method: 'DELETE'
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      throw error;
    }
  }

  async bulkUpdateProducts(vendorId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/products/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates })
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error bulk updating products:', error);
      throw error;
    }
  }

  // **Order Management APIs**
  
  async getVendorOrders(vendorId, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/${vendorId}/orders?${queryParams}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting vendor orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(vendorId, orderId, status, notes = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes })
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  }

  async processShipment(vendorId, orderId, shipmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/orders/${orderId}/shipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error processing shipment:', error);
      throw error;
    }
  }

  async getOrderDetails(vendorId, orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/orders/${orderId}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting order details:', error);
      throw error;
    }
  }

  async printOrderInvoice(vendorId, orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/orders/${orderId}/invoice/pdf`);
      return await response.blob();
    } catch (error) {
      console.error('❌ Error printing order invoice:', error);
      throw error;
    }
  }

  // **Inventory Management APIs**
  
  async getInventory(vendorId, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/${vendorId}/inventory?${queryParams}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting inventory:', error);
      throw error;
    }
  }

  async updateInventory(vendorId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/inventory/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error updating inventory:', error);
      throw error;
    }
  }

  async getLowStockAlerts(vendorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/inventory/low-stock-alerts`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting low stock alerts:', error);
      throw error;
    }
  }

  async generateInventoryReport(vendorId, period) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/inventory/report?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error generating inventory report:', error);
      throw error;
    }
  }

  // **Analytics & Performance APIs**
  
  async getVendorDashboard(vendorId, period = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/dashboard?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting vendor dashboard:', error);
      throw error;
    }
  }

  async getSalesAnalytics(vendorId, period = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/analytics/sales?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting sales analytics:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(vendorId, period = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/analytics/performance?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting performance metrics:', error);
      throw error;
    }
  }

  async getCustomerInsights(vendorId, period = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/analytics/customers?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting customer insights:', error);
      throw error;
    }
  }

  async getProductPerformance(vendorId, period = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/analytics/products?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting product performance:', error);
      throw error;
    }
  }

  async getBangladeshMarketInsights(vendorId, period = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/analytics/bangladesh-insights?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting Bangladesh market insights:', error);
      throw error;
    }
  }

  // **Financial Management APIs**
  
  async getEarnings(vendorId, period = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/earnings?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting earnings:', error);
      throw error;
    }
  }

  async getPayoutHistory(vendorId, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/${vendorId}/payouts?${queryParams}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting payout history:', error);
      throw error;
    }
  }

  async requestPayout(vendorId, amount, method, details) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/payouts/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, method, details })
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error requesting payout:', error);
      throw error;
    }
  }

  async getCommissionStructure(vendorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/commission-structure`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting commission structure:', error);
      throw error;
    }
  }

  async getTaxDocuments(vendorId, year) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/tax-documents?year=${year}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting tax documents:', error);
      throw error;
    }
  }

  // **Marketing & Promotions APIs**
  
  async createPromotion(vendorId, promotionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error creating promotion:', error);
      throw error;
    }
  }

  async getPromotions(vendorId, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/${vendorId}/promotions?${queryParams}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting promotions:', error);
      throw error;
    }
  }

  async updatePromotion(vendorId, promotionId, promotionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/promotions/${promotionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error updating promotion:', error);
      throw error;
    }
  }

  async getPromotionPerformance(vendorId, promotionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}/promotions/${promotionId}/performance`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting promotion performance:', error);
      throw error;
    }
  }

  // **Service Health & Management APIs**
  
  async getServiceHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting service health:', error);
      throw error;
    }
  }

  async getServiceMetrics() {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting service metrics:', error);
      throw error;
    }
  }
}

export default new VendorApiService();