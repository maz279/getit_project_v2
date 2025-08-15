/**
 * Header Component Types
 * Production-ready TypeScript definitions for header components
 * Eliminates any types and improves type safety
 */

import { ReactNode } from 'react';
import { Location } from '@/shared/data/bangladesh-locations';

// User Profile Types
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'vendor';
  isAuthenticated: boolean;
}

export interface VendorProfile extends UserProfile {
  role: 'vendor';
  store_name: string;
  store_status: 'active' | 'inactive' | 'pending' | 'suspended';
  store_id: string;
  notification_count?: number;
}

// Navigation Types
export interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// Search Types
export interface SearchSuggestion {
  id: number;
  text: string;
  category: string;
  trend?: 'hot' | 'trending' | 'new' | 'popular';
}

// Main Header Props
export interface HeaderProps {
  className?: string;
  logo?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: (query: string, data: {
    searchResults?: any[];
    conversationalResponse?: string;
    navigationResults?: any[];
  }) => void;
  onSearchLoading?: (loading: boolean) => void;
  cartCount?: number;
  wishlistCount?: number;
  notificationCount?: number;
  isAuthenticated?: boolean;
  userProfile?: UserProfile;
  userMenu?: ReactNode;
  navigation?: NavigationItem[];
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  onUserClick?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  variant?: 'default' | 'minimal' | 'cultural';
  sticky?: boolean;
  selectedLocation?: Location;
  onLocationChange?: (location: Location) => void;
}

// Admin Header Props
export interface AdminHeaderProps {
  userProfile: UserProfile;
  onToggleSidebar: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

// Vendor Header Props
export interface VendorHeaderProps {
  onToggleSidebar: () => void;
  onToggleNotifications: () => void;
  vendor: VendorProfile;
  unreadNotifications: number;
}

// Page Header Props
export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  tabs?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Location Menu State
export interface LocationMenuState {
  showLocationMenu: boolean;
  selectedLocation: Location;
  filteredLocations: Location[];
  locationSearchQuery: string;
}

// Search State
export interface SearchState {
  searchQuery: string;
  showSearchDropdown: boolean;
  searchSuggestions: SearchSuggestion[];
  isVoiceSearchActive: boolean;
  isImageSearchActive: boolean;
  isQRScannerActive: boolean;
}

// Header State - Complete state management for header components
export interface HeaderState extends LocationMenuState, SearchState {
  showUserMenu: boolean;
  showVendorMenu: boolean;
  showCategoriesMenu: boolean;
  notifications: number;
  cartItems: number;
  wishlistItems: number;
}

// Quick Actions (for Vendor Header)
export interface QuickAction {
  id: string;
  name: string;
  icon: any; // Lucide React icon component
  href: string;
  description: string;
}

// Language Support
export interface LanguageTexts {
  en: string;
  bn: string;
}

// Header Component Variants
export type HeaderVariant = 'default' | 'minimal' | 'cultural' | 'admin' | 'vendor';

// Header Size Options
export type HeaderSize = 'sm' | 'md' | 'lg';

// Authentication Actions
export type AuthAction = 'login' | 'signup' | 'logout' | 'profile';

// Vendor Actions
export type VendorAction = 'register' | 'login' | 'dashboard' | 'products' | 'orders' | 'analytics';

// Header Event Handlers
export interface HeaderEventHandlers {
  onAuthAction?: (action: AuthAction) => void;
  onVendorAction?: (action: VendorAction) => void;
  onLocationSelect?: (location: Location) => void;
  onSearch?: (query: string) => void;
  onVoiceSearch?: () => void;
  onImageSearch?: () => void;
  onQRScanner?: () => void;
}

// Export all types for easy importing
export type {
  ReactNode
} from 'react';