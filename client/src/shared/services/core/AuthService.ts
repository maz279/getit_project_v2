/**
 * AuthService - Unified Authentication Service
 * Consolidates all authentication functionality
 * 
 * Consolidates:
 * - User authentication and authorization
 * - Session management
 * - Token handling
 * - MFA support
 * - Role-based access control
 */

import ApiService from './ApiService';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  avatar?: string;
  verified: boolean;
  mfaEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaToken?: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  requiresMFA?: boolean;
}

interface PasswordResetData {
  email: string;
  newPassword: string;
  resetToken: string;
}

interface MFASetupData {
  method: 'sms' | 'email' | 'authenticator';
  phoneNumber?: string;
  email?: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpirationTime: number = 0;
  private refreshTokenTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeFromStorage();
    this.setupTokenRefresh();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private initializeFromStorage(): void {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedExpiration = localStorage.getItem('tokenExpiration');

      if (storedUser && storedAccessToken && storedRefreshToken) {
        this.currentUser = JSON.parse(storedUser);
        this.accessToken = storedAccessToken;
        this.refreshToken = storedRefreshToken;
        this.tokenExpirationTime = parseInt(storedExpiration || '0');

        // Set token in API service
        ApiService.setAuthToken(this.accessToken);
      }
    } catch (error) {
      console.error('Error initializing auth from storage:', error);
      this.clearAuthData();
    }
  }

  private setupTokenRefresh(): void {
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }

    if (this.accessToken && this.tokenExpirationTime > Date.now()) {
      const timeUntilRefresh = this.tokenExpirationTime - Date.now() - 60000; // Refresh 1 minute before expiration
      
      if (timeUntilRefresh > 0) {
        this.refreshTokenTimer = setTimeout(() => {
          this.refreshAccessToken();
        }, timeUntilRefresh);
      }
    }
  }

  // Authentication methods
  public async login(credentials: LoginCredentials): Promise<{ success: boolean; data?: AuthResponse; error?: string; requiresMFA?: boolean }> {
    try {
      const response = await ApiService.post<AuthResponse>('/auth/login', credentials);
      
      if (response.status === 200 && response.data) {
        if (response.data.requiresMFA) {
          return { success: false, requiresMFA: true };
        }

        this.setAuthData(response.data);
        return { success: true, data: response.data };
      }

      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error during login' };
    }
  }

  public async register(registerData: RegisterData): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
    try {
      const response = await ApiService.post<AuthResponse>('/auth/register', registerData);
      
      if (response.status === 201 && response.data) {
        this.setAuthData(response.data);
        return { success: true, data: response.data };
      }

      return { success: false, error: response.error || 'Registration failed' };
    } catch (error) {
      return { success: false, error: 'Network error during registration' };
    }
  }

  public async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      await ApiService.post('/auth/logout', { refreshToken: this.refreshToken });
      this.clearAuthData();
      return { success: true };
    } catch (error) {
      this.clearAuthData(); // Clear local data even if server request fails
      return { success: false, error: 'Logout completed locally' };
    }
  }

  public async refreshAccessToken(): Promise<{ success: boolean; error?: string }> {
    if (!this.refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    try {
      const response = await ApiService.post<AuthResponse>('/auth/refresh', {
        refreshToken: this.refreshToken
      });

      if (response.status === 200 && response.data) {
        this.setAuthData(response.data);
        return { success: true };
      }

      this.clearAuthData();
      return { success: false, error: response.error || 'Token refresh failed' };
    } catch (error) {
      this.clearAuthData();
      return { success: false, error: 'Network error during token refresh' };
    }
  }

  // Password management
  public async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.post('/auth/password-reset-request', { email });
      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: 'Error requesting password reset' };
    }
  }

  public async resetPassword(data: PasswordResetData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.post('/auth/password-reset', data);
      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: 'Error resetting password' };
    }
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: 'Error changing password' };
    }
  }

  // MFA methods
  public async setupMFA(data: MFASetupData): Promise<{ success: boolean; qrCode?: string; backupCodes?: string[]; error?: string }> {
    try {
      const response = await ApiService.post('/auth/mfa/setup', data);
      
      if (response.status === 200 && response.data) {
        return { 
          success: true, 
          qrCode: response.data.qrCode,
          backupCodes: response.data.backupCodes
        };
      }

      return { success: false, error: response.error || 'MFA setup failed' };
    } catch (error) {
      return { success: false, error: 'Error setting up MFA' };
    }
  }

  public async verifyMFA(token: string): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
    try {
      const response = await ApiService.post<AuthResponse>('/auth/mfa/verify', { token });
      
      if (response.status === 200 && response.data) {
        this.setAuthData(response.data);
        return { success: true, data: response.data };
      }

      return { success: false, error: response.error || 'MFA verification failed' };
    } catch (error) {
      return { success: false, error: 'Error verifying MFA' };
    }
  }

  public async disableMFA(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.post('/auth/mfa/disable', { password });
      
      if (response.status === 200) {
        // Update current user
        if (this.currentUser) {
          this.currentUser.mfaEnabled = false;
          this.updateStoredUser();
        }
        return { success: true };
      }

      return { success: false, error: response.error || 'Failed to disable MFA' };
    } catch (error) {
      return { success: false, error: 'Error disabling MFA' };
    }
  }

  // Email verification
  public async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.post('/auth/verify-email', { token });
      
      if (response.status === 200) {
        // Update current user
        if (this.currentUser) {
          this.currentUser.verified = true;
          this.updateStoredUser();
        }
        return { success: true };
      }

      return { success: false, error: response.error || 'Email verification failed' };
    } catch (error) {
      return { success: false, error: 'Error verifying email' };
    }
  }

  public async resendVerificationEmail(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.post('/auth/resend-verification');
      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: 'Error resending verification email' };
    }
  }

  // User profile management
  public async updateProfile(data: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await ApiService.put<User>('/auth/profile', data);
      
      if (response.status === 200 && response.data) {
        this.currentUser = response.data;
        this.updateStoredUser();
        return { success: true, user: response.data };
      }

      return { success: false, error: response.error || 'Profile update failed' };
    } catch (error) {
      return { success: false, error: 'Error updating profile' };
    }
  }

  // Authorization methods
  public hasPermission(permission: string): boolean {
    return this.currentUser?.permissions.includes(permission) || false;
  }

  public hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  public hasAnyRole(roles: string[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
  }

  public canAccess(requiredPermissions: string[]): boolean {
    if (!this.currentUser) return false;
    return requiredPermissions.every(permission => this.hasPermission(permission));
  }

  // Getters
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public isAuthenticated(): boolean {
    return !!(this.currentUser && this.accessToken && this.tokenExpirationTime > Date.now());
  }

  public isTokenExpired(): boolean {
    return this.tokenExpirationTime <= Date.now();
  }

  public getTokenExpirationTime(): number {
    return this.tokenExpirationTime;
  }

  // Private helper methods
  private setAuthData(authResponse: AuthResponse): void {
    this.currentUser = authResponse.user;
    this.accessToken = authResponse.accessToken;
    this.refreshToken = authResponse.refreshToken;
    this.tokenExpirationTime = Date.now() + (authResponse.expiresIn * 1000);

    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    localStorage.setItem('accessToken', this.accessToken);
    localStorage.setItem('refreshToken', this.refreshToken);
    localStorage.setItem('tokenExpiration', this.tokenExpirationTime.toString());

    // Set token in API service
    ApiService.setAuthToken(this.accessToken);

    // Setup token refresh
    this.setupTokenRefresh();
  }

  private clearAuthData(): void {
    this.currentUser = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpirationTime = 0;

    // Clear from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');

    // Clear from API service
    ApiService.removeAuthToken();

    // Clear refresh timer
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
      this.refreshTokenTimer = null;
    }
  }

  private updateStoredUser(): void {
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }
}

export default AuthService.getInstance();
export { AuthService, User, LoginCredentials, RegisterData, AuthResponse, PasswordResetData, MFASetupData };