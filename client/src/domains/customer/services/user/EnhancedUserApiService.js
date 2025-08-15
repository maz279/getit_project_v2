/**
 * Enhanced User API Service
 * Comprehensive API service for user management with security, Bangladesh features, and social auth
 */

const BASE_URL = '/api/v1/users';

class EnhancedUserApiService {
  
  /**
   * Authentication & Basic Operations
   */
  async register(userData) {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await response.json();
  }

  async login(credentials) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return await response.json();
  }

  async logout() {
    const response = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async getProfile() {
    const response = await fetch(`${BASE_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async updateProfile(profileData) {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(profileData)
    });
    return await response.json();
  }

  /**
   * Security Features - MFA, Account Security
   */
  async enableMFA() {
    const response = await fetch(`${BASE_URL}/security/enable-mfa`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async verifyMFASetup(token) {
    const response = await fetch(`${BASE_URL}/security/verify-mfa-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ token })
    });
    return await response.json();
  }

  async disableMFA(currentPassword, mfaToken) {
    const response = await fetch(`${BASE_URL}/security/disable-mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ currentPassword, mfaToken })
    });
    return await response.json();
  }

  async getSecurityEvents(limit = 50, offset = 0) {
    const response = await fetch(`${BASE_URL}/security/events?limit=${limit}&offset=${offset}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async getActiveSessions() {
    const response = await fetch(`${BASE_URL}/security/sessions`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async terminateSession(sessionId) {
    const response = await fetch(`${BASE_URL}/security/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async changePasswordSecure(currentPassword, newPassword, mfaToken) {
    const response = await fetch(`${BASE_URL}/security/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ currentPassword, newPassword, mfaToken })
    });
    return await response.json();
  }

  /**
   * Bangladesh-Specific Features
   */
  async setupBangladeshProfile(bangladeshData) {
    const response = await fetch(`${BASE_URL}/bangladesh/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(bangladeshData)
    });
    return await response.json();
  }

  async verifyNID(nidData) {
    const response = await fetch(`${BASE_URL}/bangladesh/verify-nid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(nidData)
    });
    return await response.json();
  }

  async setupMobileBanking(mobileBankingData) {
    const response = await fetch(`${BASE_URL}/bangladesh/mobile-banking/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(mobileBankingData)
    });
    return await response.json();
  }

  async verifyMobileBanking(accountId, verificationCode) {
    const response = await fetch(`${BASE_URL}/bangladesh/mobile-banking/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ accountId, verificationCode })
    });
    return await response.json();
  }

  async getBangladeshProfile() {
    const response = await fetch(`${BASE_URL}/bangladesh/profile`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  /**
   * Social Authentication
   */
  async initiateGoogleAuth(redirectUrl) {
    const response = await fetch(`${BASE_URL}/social/google?redirectUrl=${encodeURIComponent(redirectUrl)}`);
    return await response.json();
  }

  async initiateFacebookAuth(redirectUrl) {
    const response = await fetch(`${BASE_URL}/social/facebook?redirectUrl=${encodeURIComponent(redirectUrl)}`);
    return await response.json();
  }

  async handleOAuthCallback(code, provider, state) {
    const response = await fetch(`${BASE_URL}/social/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, provider, state })
    });
    return await response.json();
  }

  async linkSocialAccount(code, provider) {
    const response = await fetch(`${BASE_URL}/social/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ code, provider })
    });
    return await response.json();
  }

  async unlinkSocialAccount(provider) {
    const response = await fetch(`${BASE_URL}/social/unlink/${provider}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async getLinkedAccounts() {
    const response = await fetch(`${BASE_URL}/social/linked`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  /**
   * Email & Phone Verification
   */
  async verifyEmail(token) {
    const response = await fetch(`${BASE_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return await response.json();
  }

  async verifyPhone(phone, code) {
    const response = await fetch(`${BASE_URL}/verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code })
    });
    return await response.json();
  }

  async resendVerification(type, identifier) {
    const response = await fetch(`${BASE_URL}/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, identifier })
    });
    return await response.json();
  }

  /**
   * Password Management
   */
  async forgotPassword(email) {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await response.json();
  }

  async resetPassword(token, newPassword) {
    const response = await fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    return await response.json();
  }

  /**
   * Address Management
   */
  async getAddresses() {
    const response = await fetch(`${BASE_URL}/addresses`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async addAddress(addressData) {
    const response = await fetch(`${BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(addressData)
    });
    return await response.json();
  }

  async updateAddress(addressId, addressData) {
    const response = await fetch(`${BASE_URL}/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(addressData)
    });
    return await response.json();
  }

  async deleteAddress(addressId) {
    const response = await fetch(`${BASE_URL}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  /**
   * User Preferences
   */
  async getPreferences() {
    const response = await fetch(`${BASE_URL}/preferences`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async updatePreferences(preferences) {
    const response = await fetch(`${BASE_URL}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(preferences)
    });
    return await response.json();
  }

  /**
   * GDPR & Data Management
   */
  async exportUserData() {
    const response = await fetch(`${BASE_URL}/export-data`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async deleteAccount(password, reason) {
    const response = await fetch(`${BASE_URL}/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ password, reason })
    });
    return await response.json();
  }

  /**
   * Admin Operations
   */
  async getAllUsers(limit = 50, offset = 0, filters = {}) {
    const queryParams = new URLSearchParams({
      limit,
      offset,
      ...filters
    });
    
    const response = await fetch(`/api/v1/admin/users?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async getUserDetails(userId) {
    const response = await fetch(`/api/v1/admin/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async updateUserStatus(userId, status, reason) {
    const response = await fetch(`/api/v1/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ status, reason })
    });
    return await response.json();
  }

  async deleteUser(userId, reason) {
    const response = await fetch(`/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ reason })
    });
    return await response.json();
  }

  async getUserRoles() {
    const response = await fetch('/api/v1/admin/roles', {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async createRole(roleData) {
    const response = await fetch('/api/v1/admin/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(roleData)
    });
    return await response.json();
  }

  async assignUserRoles(userId, roleIds) {
    const response = await fetch(`/api/v1/admin/users/${userId}/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ roleIds })
    });
    return await response.json();
  }

  async getUserAnalytics(timeRange = '30d') {
    const response = await fetch(`/api/v1/admin/user-analytics?range=${timeRange}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async getSecurityEvents(userId = null, limit = 100, offset = 0) {
    const queryParams = new URLSearchParams({
      limit,
      offset,
      ...(userId && { userId })
    });
    
    const response = await fetch(`/api/v1/admin/security-events?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  async getUserSessions(userId = null) {
    const endpoint = userId 
      ? `/api/v1/admin/user-sessions?userId=${userId}`
      : '/api/v1/admin/user-sessions';
      
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return await response.json();
  }

  /**
   * Utility Methods
   */
  getToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem('authToken', token);
      sessionStorage.removeItem('authToken');
    } else {
      sessionStorage.setItem('authToken', token);
      localStorage.removeItem('authToken');
    }
  }

  removeToken() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Error Handling
   */
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    return await response.json();
  }
}

export default new EnhancedUserApiService();