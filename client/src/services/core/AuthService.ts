/**
 * AuthService - Complete authentication and authorization management
 * Handles login, logout, registration, MFA, password management, and role-based access
 */

import ApiService from './ApiService';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'vendor' | 'admin';
  avatar?: string;
  phoneNumber?: string;
  verified: boolean;
  mfaEnabled: boolean;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: 'customer' | 'vendor';
}

export interface PasswordResetData {
  email: string;
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface MFASetupData {
  method: 'totp' | 'sms' | 'email';
  phoneNumber?: string;
}

class AuthService {
  private static instance: AuthService;
  private apiService: typeof ApiService;
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };
  private listeners: Array<(state: AuthState) => void> = [];

  private constructor() {
    this.apiService = ApiService;
    this.initializeAuth();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize authentication state from storage
   */
  private initializeAuth(): void {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    
    if (token && user) {
      try {
        this.state = {
          ...this.state,
          user: JSON.parse(user),
          token,
          isAuthenticated: true
        };
        this.apiService.setAuthToken(token);
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  /**
   * Login with email and password
   */
  public async login(credentials: LoginCredentials): Promise<AuthState> {
    this.setState({ isLoading: true, error: null });

    try {
      const response = await this.apiService.post('/auth/login', credentials);
      
      if (response.data.requireMFA) {
        this.setState({ 
          isLoading: false, 
          error: 'MFA_REQUIRED' 
        });
        return this.state;
      }

      const { user, token, refreshToken } = response.data;
      
      // Store authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      this.apiService.setAuthToken(token);
      
      this.setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return this.state;
    } catch (error: any) {
      this.setState({
        isLoading: false,
        error: error.message || 'Login failed'
      });
      throw error;
    }
  }

  /**
   * Register new user
   */
  public async register(data: RegisterData): Promise<AuthState> {
    this.setState({ isLoading: true, error: null });

    try {
      const response = await this.apiService.post('/auth/register', data);
      
      if (response.data.requireVerification) {
        this.setState({
          isLoading: false,
          error: 'VERIFICATION_REQUIRED'
        });
        return this.state;
      }

      const { user, token } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      this.apiService.setAuthToken(token);
      
      this.setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return this.state;
    } catch (error: any) {
      this.setState({
        isLoading: false,
        error: error.message || 'Registration failed'
      });
      throw error;
    }
  }

  /**
   * Logout user
   */
  public async logout(): Promise<void> {
    try {
      await this.apiService.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Request password reset
   */
  public async requestPasswordReset(email: string): Promise<void> {
    await this.apiService.post('/auth/password-reset/request', { email });
  }

  /**
   * Reset password with token
   */
  public async resetPassword(data: PasswordResetData): Promise<void> {
    await this.apiService.post('/auth/password-reset/confirm', data);
  }

  /**
   * Change password (authenticated user)
   */
  public async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.apiService.post('/auth/password-change', {
      oldPassword,
      newPassword
    });
  }

  /**
   * Verify email address
   */
  public async verifyEmail(token: string): Promise<void> {
    const response = await this.apiService.post('/auth/verify-email', { token });
    
    if (response.data.user) {
      this.setState({
        user: response.data.user,
        isAuthenticated: true
      });
      localStorage.setItem('authUser', JSON.stringify(response.data.user));
    }
  }

  /**
   * Setup MFA
   */
  public async setupMFA(data: MFASetupData): Promise<{ qrCode?: string; secret?: string }> {
    const response = await this.apiService.post('/auth/mfa/setup', data);
    return response.data;
  }

  /**
   * Verify MFA code
   */
  public async verifyMFA(code: string): Promise<AuthState> {
    this.setState({ isLoading: true, error: null });

    try {
      const response = await this.apiService.post('/auth/mfa/verify', { code });
      const { user, token } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      this.apiService.setAuthToken(token);
      
      this.setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return this.state;
    } catch (error: any) {
      this.setState({
        isLoading: false,
        error: error.message || 'MFA verification failed'
      });
      throw error;
    }
  }

  /**
   * Disable MFA
   */
  public async disableMFA(password: string): Promise<void> {
    await this.apiService.post('/auth/mfa/disable', { password });
    
    if (this.state.user) {
      const updatedUser = { ...this.state.user, mfaEnabled: false };
      this.setState({ user: updatedUser });
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
    }
  }

  /**
   * Refresh authentication token
   */
  public async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const response = await this.apiService.post('/auth/refresh', { refreshToken });
      const { token } = response.data;
      
      localStorage.setItem('authToken', token);
      this.apiService.setAuthToken(token);
      
      this.setState({ token });
      return token;
    } catch (error) {
      this.clearAuth();
      return null;
    }
  }

  /**
   * Get current user profile
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.apiService.get('/auth/me');
      const user = response.data;
      
      this.setState({ user });
      localStorage.setItem('authUser', JSON.stringify(user));
      
      return user;
    } catch (error) {
      this.clearAuth();
      return null;
    }
  }

  /**
   * Update user profile
   */
  public async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.apiService.put('/auth/profile', data);
    const updatedUser = response.data;
    
    this.setState({ user: updatedUser });
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
    
    return updatedUser;
  }

  /**
   * Check if user has specific permission
   */
  public hasPermission(permission: string): boolean {
    return this.state.user?.permissions.includes(permission) || false;
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    return this.state.user?.role === role;
  }

  /**
   * Get current authentication state
   */
  public getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Subscribe to auth state changes
   */
  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('refreshToken');
    this.apiService.removeAuthToken();
    
    this.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }
}

export default AuthService.getInstance();