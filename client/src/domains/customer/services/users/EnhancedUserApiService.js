/**
 * Enhanced User API Service
 * Complete frontend API integration for Amazon.com/Shopee.sg-level user management
 * Includes Bangladesh-specific features, security, and social authentication
 */

const BASE_URL = '/api/v1/users';

class EnhancedUserApiService {
  // ============= BANGLADESH-SPECIFIC API METHODS =============
  
  // Validate Bangladesh National ID
  async validateNID(userId, nidNumber) {
    try {
      const response = await fetch(`${BASE_URL}/bangladesh/validate-nid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          nid_number: nidNumber
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('NID validation failed:', error);
      throw error;
    }
  }

  // Validate Bangladesh phone number
  async validateBangladeshPhone(userId, phone) {
    try {
      const response = await fetch(`${BASE_URL}/bangladesh/validate-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          phone: phone
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Phone validation failed:', error);
      throw error;
    }
  }

  // Link mobile banking account (bKash, Nagad, Rocket)
  async linkMobileBankingAccount(userId, provider, accountNumber, accountName) {
    try {
      const response = await fetch(`${BASE_URL}/bangladesh/link-mobile-banking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          provider: provider,
          account_number: accountNumber,
          account_name: accountName
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Mobile banking linking failed:', error);
      throw error;
    }
  }

  // Create Bangladesh address
  async createBangladeshAddress(userId, addressData) {
    try {
      const response = await fetch(`${BASE_URL}/bangladesh/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          ...addressData
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Address creation failed:', error);
      throw error;
    }
  }

  // ============= SECURITY API METHODS =============

  // Setup Multi-Factor Authentication
  async setupMFA(userId) {
    try {
      const response = await fetch(`${BASE_URL}/security/setup-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          user_id: userId
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('MFA setup failed:', error);
      throw error;
    }
  }

  // Verify and enable MFA
  async verifyAndEnableMFA(userId, totpCode) {
    try {
      const response = await fetch(`${BASE_URL}/security/verify-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          totp_code: totpCode
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('MFA verification failed:', error);
      throw error;
    }
  }

  // Check account lockout status
  async checkAccountLockout(username, email) {
    try {
      const response = await fetch(`${BASE_URL}/security/check-lockout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          email: email
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Lockout check failed:', error);
      throw error;
    }
  }

  // Get security events for user
  async getSecurityEvents(userId, page = 1, limit = 20, severity = null) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (severity) {
        params.append('severity', severity);
      }

      const response = await fetch(`${BASE_URL}/security/events/${userId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Security events retrieval failed:', error);
      throw error;
    }
  }

  // Detect suspicious activity
  async detectSuspiciousActivity(userId, location = null) {
    try {
      const response = await fetch(`${BASE_URL}/security/suspicious-activity/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: location ? JSON.stringify({ location }) : undefined
      });
      
      return await response.json();
    } catch (error) {
      console.error('Suspicious activity detection failed:', error);
      throw error;
    }
  }

  // ============= SOCIAL AUTHENTICATION API METHODS =============

  // Handle Google OAuth callback
  async handleGoogleCallback(code, state) {
    try {
      const response = await fetch(`${BASE_URL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          state: state
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Google OAuth callback failed:', error);
      throw error;
    }
  }

  // Handle Facebook OAuth callback
  async handleFacebookCallback(code, state) {
    try {
      const response = await fetch(`${BASE_URL}/auth/facebook/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          state: state
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Facebook OAuth callback failed:', error);
      throw error;
    }
  }

  // Link social account to existing user
  async linkSocialAccount(userId, provider, accessToken) {
    try {
      const response = await fetch(`${BASE_URL}/social/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          provider: provider,
          access_token: accessToken
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Social account linking failed:', error);
      throw error;
    }
  }

  // Unlink social account
  async unlinkSocialAccount(userId, provider) {
    try {
      const response = await fetch(`${BASE_URL}/social/unlink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          provider: provider
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Social account unlinking failed:', error);
      throw error;
    }
  }

  // Get linked social accounts
  async getLinkedSocialAccounts(userId) {
    try {
      const response = await fetch(`${BASE_URL}/social/accounts/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Linked accounts retrieval failed:', error);
      throw error;
    }
  }

  // ============= ENHANCED USER MANAGEMENT API METHODS =============

  // Get comprehensive user profile
  async getComprehensiveProfile(userId) {
    try {
      const response = await fetch(`${BASE_URL}/enhanced/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Comprehensive profile retrieval failed:', error);
      throw error;
    }
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const response = await fetch(`${BASE_URL}/enhanced/preferences/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(preferences)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Preferences update failed:', error);
      throw error;
    }
  }

  // Get verification status
  async getVerificationStatus(userId) {
    try {
      const response = await fetch(`${BASE_URL}/enhanced/verification-status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Verification status retrieval failed:', error);
      throw error;
    }
  }

  // ============= GDPR COMPLIANCE API METHODS =============

  // Export user data for GDPR compliance
  async exportUserData(userId) {
    try {
      const response = await fetch(`${BASE_URL}/gdpr/export/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('GDPR export failed:', error);
      throw error;
    }
  }

  // Delete user account (GDPR compliance)
  async deleteUserAccount(userId) {
    try {
      const response = await fetch(`${BASE_URL}/gdpr/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('GDPR deletion failed:', error);
      throw error;
    }
  }

  // ============= UTILITY METHODS =============

  // Get authentication token from localStorage
  getToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
  }

  // Remove authentication token
  removeToken() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Get Bangladesh districts for address validation
  getBangladeshDistricts() {
    return [
      'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 
      'Rangpur', 'Mymensingh', 'Comilla', 'Feni', 'Brahmanbaria', 
      'Rangamati', 'Noakhali', 'Chandpur', 'Lakshmipur', 'Cox\'s Bazar',
      'Bandarban', 'Khagrachhari', 'Cumilla'
    ];
  }

  // Get mobile banking providers
  getMobileBankingProviders() {
    return [
      { id: 'bkash', name: 'bKash', color: '#E2136E' },
      { id: 'nagad', name: 'Nagad', color: '#FF6600' },
      { id: 'rocket', name: 'Rocket', color: '#8A2387' },
      { id: 'upay', name: 'Upay', color: '#00A651' },
      { id: 'mcash', name: 'mCash', color: '#1E88E5' }
    ];
  }

  // Health check for all enhanced services
  async healthCheck() {
    try {
      const services = ['bangladesh', 'security', 'social'];
      const healthChecks = await Promise.all(
        services.map(service => 
          fetch(`${BASE_URL}/${service}/health`).then(res => res.json())
        )
      );

      return {
        success: true,
        services: healthChecks,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export default new EnhancedUserApiService();