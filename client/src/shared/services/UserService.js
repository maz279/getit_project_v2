// User Service
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level User API Service
// Complete user management, authentication, and profile operations

import BaseApiService from './BaseApiService.js';

class UserService extends BaseApiService {
  constructor() {
    super();
    this.servicePath = '/users';
  }

  // Authentication Operations
  async login(credentials) {
    const { email, phone, password, rememberMe = false } = credentials;
    
    const loginData = {
      password,
      rememberMe
    };

    // Support both email and phone login
    if (email) {
      loginData.email = email;
    } else if (phone) {
      loginData.phone = phone;
    }

    const response = await this.post('/auth/login', loginData);
    
    if (response.success && response.data.token) {
      // Set authentication token for future requests
      this.setAuthToken(response.data.token);
      
      // Store user data and token
      if (rememberMe) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      } else {
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('userData', JSON.stringify(response.data.user));
      }
    }
    
    return response;
  }

  async register(userData) {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      dateOfBirth,
      gender,
      agreeToTerms,
      subscribeNewsletter = false,
      referralCode = null
    } = userData;

    const registrationData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      dateOfBirth,
      gender,
      agreeToTerms,
      subscribeNewsletter
    };

    if (referralCode) {
      registrationData.referralCode = referralCode;
    }

    return this.post('/auth/register', registrationData);
  }

  async logout() {
    try {
      // Call logout endpoint
      await this.post('/auth/logout');
    } catch (error) {
      console.warn('Logout endpoint error:', error);
    }

    // Clear local authentication data
    this.setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    
    // Clear cache
    this.clearCache();

    return { success: true };
  }

  async forgotPassword(email) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(token, newPassword, confirmPassword) {
    return this.post('/auth/reset-password', {
      token,
      newPassword,
      confirmPassword
    });
  }

  async changePassword(currentPassword, newPassword, confirmPassword) {
    return this.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
  }

  async verifyEmail(token) {
    return this.post('/auth/verify-email', { token });
  }

  async resendEmailVerification(email) {
    return this.post('/auth/resend-verification', { email });
  }

  async verifyPhone(phone, code) {
    return this.post('/auth/verify-phone', { phone, code });
  }

  async sendPhoneVerification(phone) {
    return this.post('/auth/send-phone-verification', { phone });
  }

  // Two-Factor Authentication
  async enable2FA() {
    return this.post('/auth/2fa/enable');
  }

  async disable2FA(password) {
    return this.post('/auth/2fa/disable', { password });
  }

  async verify2FA(code) {
    return this.post('/auth/2fa/verify', { code });
  }

  async get2FABackupCodes() {
    return this.get('/auth/2fa/backup-codes');
  }

  // Social Authentication
  async loginWithGoogle(credential) {
    return this.post('/auth/google', { credential });
  }

  async loginWithFacebook(accessToken) {
    return this.post('/auth/facebook', { accessToken });
  }

  async linkSocialAccount(provider, credential) {
    return this.post('/auth/link-social', { provider, credential });
  }

  async unlinkSocialAccount(provider) {
    return this.delete('/auth/unlink-social', { data: { provider } });
  }

  // Profile Management
  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async updateProfile(profileData) {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      bio,
      website,
      location,
      preferences
    } = profileData;

    const updateData = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      bio,
      website,
      location,
      preferences
    };

    return this.put(`${this.servicePath}/profile`, updateData);
  }

  async uploadProfilePicture(imageFile) {
    return this.upload(`${this.servicePath}/profile/avatar`, imageFile);
  }

  async removeProfilePicture() {
    return this.delete(`${this.servicePath}/profile/avatar`);
  }

  async updatePreferences(preferences) {
    return this.patch(`${this.servicePath}/preferences`, { preferences });
  }

  async getPreferences() {
    return this.get(`${this.servicePath}/preferences`);
  }

  // Address Management
  async getAddresses() {
    return this.get(`${this.servicePath}/addresses`);
  }

  async addAddress(addressData) {
    const {
      type = 'home',
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      district,
      division,
      postalCode,
      phone,
      isDefault = false,
      instructions = ''
    } = addressData;

    return this.post(`${this.servicePath}/addresses`, {
      type,
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      district,
      division,
      postalCode,
      phone,
      isDefault,
      instructions
    });
  }

  async updateAddress(addressId, addressData) {
    return this.put(`${this.servicePath}/addresses/${addressId}`, addressData);
  }

  async deleteAddress(addressId) {
    return this.delete(`${this.servicePath}/addresses/${addressId}`);
  }

  async setDefaultAddress(addressId) {
    return this.post(`${this.servicePath}/addresses/${addressId}/default`);
  }

  // Payment Methods
  async getPaymentMethods() {
    return this.get(`${this.servicePath}/payment-methods`);
  }

  async addPaymentMethod(paymentData) {
    const {
      type, // 'card', 'bkash', 'nagad', 'rocket', 'bank'
      ...methodData
    } = paymentData;

    return this.post(`${this.servicePath}/payment-methods`, {
      type,
      ...methodData
    });
  }

  async updatePaymentMethod(methodId, paymentData) {
    return this.put(`${this.servicePath}/payment-methods/${methodId}`, paymentData);
  }

  async deletePaymentMethod(methodId) {
    return this.delete(`${this.servicePath}/payment-methods/${methodId}`);
  }

  async setDefaultPaymentMethod(methodId) {
    return this.post(`${this.servicePath}/payment-methods/${methodId}/default`);
  }

  // Order History
  async getOrderHistory(params = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      sortBy = 'date_desc'
    } = params;

    const queryParams = { page, limit, sortBy };
    if (status) queryParams.status = status;
    if (dateFrom) queryParams.dateFrom = dateFrom;
    if (dateTo) queryParams.dateTo = dateTo;

    return this.get(`${this.servicePath}/orders`, queryParams);
  }

  async getOrderById(orderId) {
    return this.get(`${this.servicePath}/orders/${orderId}`);
  }

  async cancelOrder(orderId, reason) {
    return this.post(`${this.servicePath}/orders/${orderId}/cancel`, { reason });
  }

  async returnOrder(orderId, returnData) {
    return this.post(`${this.servicePath}/orders/${orderId}/return`, returnData);
  }

  async trackOrder(orderId) {
    return this.get(`${this.servicePath}/orders/${orderId}/tracking`);
  }

  // Wishlist Management
  async getWishlist(params = {}) {
    return this.get(`${this.servicePath}/wishlist`, params);
  }

  async addToWishlist(productId) {
    return this.post(`${this.servicePath}/wishlist`, { productId });
  }

  async removeFromWishlist(productId) {
    return this.delete(`${this.servicePath}/wishlist/${productId}`);
  }

  async clearWishlist() {
    return this.delete(`${this.servicePath}/wishlist`);
  }

  async shareWishlist() {
    return this.post(`${this.servicePath}/wishlist/share`);
  }

  // Reviews & Ratings
  async getMyReviews(params = {}) {
    return this.get(`${this.servicePath}/reviews`, params);
  }

  async getReviewById(reviewId) {
    return this.get(`${this.servicePath}/reviews/${reviewId}`);
  }

  async submitReview(orderItemId, reviewData) {
    const {
      rating,
      title,
      comment,
      pros = [],
      cons = [],
      images = [],
      recommend = true
    } = reviewData;

    return this.post(`${this.servicePath}/reviews`, {
      orderItemId,
      rating,
      title,
      comment,
      pros,
      cons,
      images,
      recommend
    });
  }

  async updateReview(reviewId, reviewData) {
    return this.put(`${this.servicePath}/reviews/${reviewId}`, reviewData);
  }

  async deleteReview(reviewId) {
    return this.delete(`${this.servicePath}/reviews/${reviewId}`);
  }

  // Notifications
  async getNotifications(params = {}) {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type = null
    } = params;

    const queryParams = { page, limit, unreadOnly };
    if (type) queryParams.type = type;

    return this.get(`${this.servicePath}/notifications`, queryParams);
  }

  async markNotificationAsRead(notificationId) {
    return this.post(`${this.servicePath}/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead() {
    return this.post(`${this.servicePath}/notifications/read-all`);
  }

  async deleteNotification(notificationId) {
    return this.delete(`${this.servicePath}/notifications/${notificationId}`);
  }

  async updateNotificationSettings(settings) {
    return this.put(`${this.servicePath}/notification-settings`, settings);
  }

  async getNotificationSettings() {
    return this.get(`${this.servicePath}/notification-settings`);
  }

  // Subscription Management
  async getSubscriptions() {
    return this.get(`${this.servicePath}/subscriptions`);
  }

  async subscribe(subscriptionData) {
    return this.post(`${this.servicePath}/subscriptions`, subscriptionData);
  }

  async unsubscribe(subscriptionId) {
    return this.delete(`${this.servicePath}/subscriptions/${subscriptionId}`);
  }

  async updateSubscription(subscriptionId, subscriptionData) {
    return this.put(`${this.servicePath}/subscriptions/${subscriptionId}`, subscriptionData);
  }

  // Loyalty Program
  async getLoyaltyPoints() {
    return this.get(`${this.servicePath}/loyalty/points`);
  }

  async getLoyaltyHistory(params = {}) {
    return this.get(`${this.servicePath}/loyalty/history`, params);
  }

  async redeemPoints(redeemData) {
    return this.post(`${this.servicePath}/loyalty/redeem`, redeemData);
  }

  async getLoyaltyRewards() {
    return this.get(`${this.servicePath}/loyalty/rewards`);
  }

  // Support & Help
  async getSupportTickets(params = {}) {
    return this.get(`${this.servicePath}/support/tickets`, params);
  }

  async createSupportTicket(ticketData) {
    return this.post(`${this.servicePath}/support/tickets`, ticketData);
  }

  async getSupportTicketById(ticketId) {
    return this.get(`${this.servicePath}/support/tickets/${ticketId}`);
  }

  async replyToSupportTicket(ticketId, reply) {
    return this.post(`${this.servicePath}/support/tickets/${ticketId}/reply`, { reply });
  }

  async closeSupportTicket(ticketId) {
    return this.post(`${this.servicePath}/support/tickets/${ticketId}/close`);
  }

  // Privacy & Security
  async getSecuritySettings() {
    return this.get(`${this.servicePath}/security`);
  }

  async updateSecuritySettings(settings) {
    return this.put(`${this.servicePath}/security`, settings);
  }

  async getLoginHistory(params = {}) {
    return this.get(`${this.servicePath}/security/login-history`, params);
  }

  async getActiveSessions() {
    return this.get(`${this.servicePath}/security/sessions`);
  }

  async terminateSession(sessionId) {
    return this.delete(`${this.servicePath}/security/sessions/${sessionId}`);
  }

  async terminateAllSessions() {
    return this.delete(`${this.servicePath}/security/sessions`);
  }

  async requestDataExport() {
    return this.post(`${this.servicePath}/privacy/export`);
  }

  async requestAccountDeletion(reason) {
    return this.post(`${this.servicePath}/privacy/delete-account`, { reason });
  }

  // Bangladesh-Specific Features
  async verifyNationalId(nidData) {
    return this.post(`${this.servicePath}/verification/nid`, nidData);
  }

  async getBangladeshProfile() {
    return this.get(`${this.servicePath}/bangladesh-profile`);
  }

  async updateBangladeshProfile(profileData) {
    const {
      nidNumber,
      dateOfBirth,
      fatherName,
      motherName,
      permanentAddress,
      emergencyContact
    } = profileData;

    return this.put(`${this.servicePath}/bangladesh-profile`, {
      nidNumber,
      dateOfBirth,
      fatherName,
      motherName,
      permanentAddress,
      emergencyContact
    });
  }

  // User Analytics
  async getUserDashboard() {
    return this.get(`${this.servicePath}/dashboard`);
  }

  async getUserStatistics() {
    return this.get(`${this.servicePath}/statistics`);
  }

  async getShoppingBehavior() {
    return this.get(`${this.servicePath}/behavior`);
  }

  async getRecommendationSettings() {
    return this.get(`${this.servicePath}/recommendations/settings`);
  }

  async updateRecommendationSettings(settings) {
    return this.put(`${this.servicePath}/recommendations/settings`, settings);
  }

  // Referral Program
  async getReferralCode() {
    return this.get(`${this.servicePath}/referral/code`);
  }

  async getReferralStats() {
    return this.get(`${this.servicePath}/referral/stats`);
  }

  async inviteFriend(email) {
    return this.post(`${this.servicePath}/referral/invite`, { email });
  }

  // Communication Preferences
  async getCommunicationPreferences() {
    return this.get(`${this.servicePath}/communication`);
  }

  async updateCommunicationPreferences(preferences) {
    return this.put(`${this.servicePath}/communication`, preferences);
  }

  // Device Management
  async getDevices() {
    return this.get(`${this.servicePath}/devices`);
  }

  async registerDevice(deviceData) {
    return this.post(`${this.servicePath}/devices`, deviceData);
  }

  async removeDevice(deviceId) {
    return this.delete(`${this.servicePath}/devices/${deviceId}`);
  }

  // Health Check
  async healthCheck() {
    return this.get(`${this.servicePath}/health`);
  }
}

// Create and export singleton instance
const userService = new UserService();

export default userService;