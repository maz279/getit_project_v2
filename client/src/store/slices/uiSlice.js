// UI Redux Slice
// GetIt Bangladesh - Global UI State Management
// Navigation, modals, notifications, and loading states

import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // Layout states
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchBarExpanded: false,
  
  // Modal states
  modals: {
    authModal: { open: false, type: 'login' },
    cartModal: { open: false },
    quickViewModal: { open: false, product: null },
    addressModal: { open: false, address: null },
    paymentModal: { open: false, method: null },
    confirmationModal: { open: false, data: null }
  },
  
  // Notification system
  notifications: [],
  toasts: [],
  
  // Loading states
  globalLoading: false,
  loadingStates: {},
  
  // Theme & appearance
  theme: 'light',
  culturalTheme: 'default',
  compactMode: false,
  
  // Language & localization
  language: 'bn',
  rtlMode: false,
  
  // User preferences
  viewPreferences: {
    productsView: 'grid', // 'grid' | 'list'
    itemsPerPage: 20,
    showPricesInclVAT: true,
    currency: 'BDT'
  },
  
  // Bangladesh-specific UI
  bangladeshFeatures: {
    showPrayerTimes: false,
    showWeather: false,
    showFestivalBanner: true,
    preferredPaymentMethods: ['bkash', 'nagad', 'rocket'],
    showCourierOptions: true
  },
  
  // Navigation & breadcrumbs
  breadcrumbs: [],
  currentPage: '/',
  pageTitle: 'GetIt Bangladesh',
  
  // Search & filters
  searchState: {
    query: '',
    suggestions: [],
    recentSearches: [],
    activeFilters: {},
    sortBy: 'relevance'
  },
  
  // Performance & analytics
  performanceMetrics: {
    pageLoadTime: 0,
    apiResponseTimes: {},
    errorCount: 0
  },
  
  // Accessibility
  accessibility: {
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReaderMode: false
  }
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Layout actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    
    toggleSearchBar: (state) => {
      state.searchBarExpanded = !state.searchBarExpanded;
    },
    
    setSearchBarExpanded: (state, action) => {
      state.searchBarExpanded = action.payload;
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { modalType, data } = action.payload;
      if (state.modals[modalType]) {
        state.modals[modalType].open = true;
        if (data) {
          state.modals[modalType] = { ...state.modals[modalType], ...data };
        }
      }
    },
    
    closeModal: (state, action) => {
      const modalType = action.payload;
      if (state.modals[modalType]) {
        state.modals[modalType].open = false;
        
        // Clear modal data
        if (modalType === 'quickViewModal') {
          state.modals[modalType].product = null;
        } else if (modalType === 'addressModal') {
          state.modals[modalType].address = null;
        } else if (modalType === 'paymentModal') {
          state.modals[modalType].method = null;
        } else if (modalType === 'confirmationModal') {
          state.modals[modalType].data = null;
        }
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modalType => {
        state.modals[modalType].open = false;
      });
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload
      };
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    markNotificationRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    },
    
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      state.notifications = state.notifications.filter(n => n.id !== notificationId);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Toast actions
    addToast: (state, action) => {
      const toast = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        autoHide: true,
        duration: 5000,
        ...action.payload
      };
      state.toasts.push(toast);
    },
    
    removeToast: (state, action) => {
      const toastId = action.payload;
      state.toasts = state.toasts.filter(t => t.id !== toastId);
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    setLoadingState: (state, action) => {
      const { key, loading } = action.payload;
      state.loadingStates[key] = loading;
    },
    
    clearLoadingState: (state, action) => {
      const key = action.payload;
      delete state.loadingStates[key];
    },
    
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    setCulturalTheme: (state, action) => {
      state.culturalTheme = action.payload;
    },
    
    toggleCompactMode: (state) => {
      state.compactMode = !state.compactMode;
    },
    
    // Language actions
    setLanguage: (state, action) => {
      state.language = action.payload;
      state.rtlMode = ['ar', 'ur'].includes(action.payload);
    },
    
    setRtlMode: (state, action) => {
      state.rtlMode = action.payload;
    },
    
    // View preferences
    updateViewPreferences: (state, action) => {
      state.viewPreferences = { ...state.viewPreferences, ...action.payload };
    },
    
    // Bangladesh features
    updateBangladeshFeatures: (state, action) => {
      state.bangladeshFeatures = { ...state.bangladeshFeatures, ...action.payload };
    },
    
    // Navigation actions
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload;
    },
    
    // Search actions
    setSearchQuery: (state, action) => {
      state.searchState.query = action.payload;
    },
    
    setSearchSuggestions: (state, action) => {
      state.searchState.suggestions = action.payload;
    },
    
    addRecentSearch: (state, action) => {
      const query = action.payload;
      
      // Remove if already exists
      state.searchState.recentSearches = state.searchState.recentSearches.filter(s => s !== query);
      
      // Add to beginning
      state.searchState.recentSearches.unshift(query);
      
      // Keep only last 10
      if (state.searchState.recentSearches.length > 10) {
        state.searchState.recentSearches = state.searchState.recentSearches.slice(0, 10);
      }
    },
    
    clearRecentSearches: (state) => {
      state.searchState.recentSearches = [];
    },
    
    setActiveFilters: (state, action) => {
      state.searchState.activeFilters = action.payload;
    },
    
    setSortBy: (state, action) => {
      state.searchState.sortBy = action.payload;
    },
    
    // Performance tracking
    updatePerformanceMetrics: (state, action) => {
      state.performanceMetrics = { ...state.performanceMetrics, ...action.payload };
    },
    
    // Accessibility
    updateAccessibilitySettings: (state, action) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    
    // Reset UI state
    resetUIState: (state) => {
      return initialState;
    }
  }
});

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleSearchBar,
  setSearchBarExpanded,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  markNotificationRead,
  removeNotification,
  clearNotifications,
  addToast,
  removeToast,
  clearToasts,
  setGlobalLoading,
  setLoadingState,
  clearLoadingState,
  setTheme,
  setCulturalTheme,
  toggleCompactMode,
  setLanguage,
  setRtlMode,
  updateViewPreferences,
  updateBangladeshFeatures,
  setBreadcrumbs,
  setCurrentPage,
  setPageTitle,
  setSearchQuery,
  setSearchSuggestions,
  addRecentSearch,
  clearRecentSearches,
  setActiveFilters,
  setSortBy,
  updatePerformanceMetrics,
  updateAccessibilitySettings,
  resetUIState
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectSearchBarExpanded = (state) => state.ui.searchBarExpanded;
export const selectModals = (state) => state.ui.modals;
export const selectModalOpen = (state, modalType) => state.ui.modals[modalType]?.open || false;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) => state.ui.notifications.filter(n => !n.read);
export const selectToasts = (state) => state.ui.toasts;
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectLoadingState = (state, key) => state.ui.loadingStates[key] || false;
export const selectTheme = (state) => state.ui.theme;
export const selectCulturalTheme = (state) => state.ui.culturalTheme;
export const selectLanguage = (state) => state.ui.language;
export const selectRtlMode = (state) => state.ui.rtlMode;
export const selectViewPreferences = (state) => state.ui.viewPreferences;
export const selectBangladeshFeatures = (state) => state.ui.bangladeshFeatures;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectCurrentPage = (state) => state.ui.currentPage;
export const selectPageTitle = (state) => state.ui.pageTitle;
export const selectSearchState = (state) => state.ui.searchState;
export const selectPerformanceMetrics = (state) => state.ui.performanceMetrics;
export const selectAccessibilitySettings = (state) => state.ui.accessibility;

export default uiSlice.reducer;