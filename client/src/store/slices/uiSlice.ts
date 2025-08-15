/**
 * PHASE 2: UI STATE SLICE
 * Global UI state management for theme, language, and user preferences
 * Investment: $25,000 | Week 1: Foundation
 * Date: July 26, 2025
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// UI state interfaces
export interface ThemeState {
  readonly mode: 'light' | 'dark' | 'system';
  readonly primaryColor: string;
  readonly accentColor: string;
  readonly borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  readonly animations: boolean;
}

export interface LanguageState {
  readonly current: 'en' | 'bn';
  readonly fallback: 'en';
  readonly rtl: boolean;
  readonly availableLanguages: readonly ('en' | 'bn')[];
}

export interface LayoutState {
  readonly sidebarOpen: boolean;
  readonly sidebarCollapsed: boolean;
  readonly headerHeight: number;
  readonly footerHeight: number;
  readonly contentPadding: 'none' | 'sm' | 'md' | 'lg';
  readonly showBreadcrumbs: boolean;
}

export interface NotificationState {
  readonly enabled: boolean;
  readonly position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  readonly autoClose: boolean;
  readonly duration: number;
  readonly maxVisible: number;
}

export interface AccessibilityState {
  readonly highContrast: boolean;
  readonly reducedMotion: boolean;
  readonly screenReader: boolean;
  readonly fontSize: 'sm' | 'md' | 'lg' | 'xl';
  readonly focusVisible: boolean;
}

export interface UserPreferences {
  readonly compactMode: boolean;
  readonly showTutorials: boolean;
  readonly showPerformanceMetrics: boolean;
  readonly defaultPageSize: number;
  readonly autoSave: boolean;
  readonly quickActions: string[];
  readonly favoriteComponents: string[];
}

interface UIState {
  // Theme configuration
  theme: ThemeState;
  
  // Language and localization
  language: LanguageState;
  
  // Layout configuration
  layout: LayoutState;
  
  // Notification settings
  notifications: NotificationState;
  
  // Accessibility features
  accessibility: AccessibilityState;
  
  // User preferences
  preferences: UserPreferences;
  
  // Modal and dialog state
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
    };
  };
  
  // Loading states for UI components
  loading: {
    [key: string]: boolean;
  };
  
  // Error states for UI components
  errors: {
    [key: string]: string | null;
  };
  
  // Global UI flags
  isInitialized: boolean;
  isOnline: boolean;
  viewport: {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
}

// Initial state
const initialState: UIState = {
  theme: {
    mode: 'system',
    primaryColor: '#3b82f6', // Blue
    accentColor: '#10b981', // Green
    borderRadius: 'md',
    animations: true,
  },
  
  language: {
    current: 'en',
    fallback: 'en',
    rtl: false,
    availableLanguages: ['en', 'bn'],
  },
  
  layout: {
    sidebarOpen: true,
    sidebarCollapsed: false,
    headerHeight: 64,
    footerHeight: 200,
    contentPadding: 'md',
    showBreadcrumbs: true,
  },
  
  notifications: {
    enabled: true,
    position: 'top-right',
    autoClose: true,
    duration: 5000,
    maxVisible: 5,
  },
  
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    fontSize: 'md',
    focusVisible: true,
  },
  
  preferences: {
    compactMode: false,
    showTutorials: true,
    showPerformanceMetrics: process.env.NODE_ENV === 'development',
    defaultPageSize: 25,
    autoSave: true,
    quickActions: ['search', 'notifications', 'profile'],
    favoriteComponents: [],
  },
  
  modals: {},
  loading: {},
  errors: {},
  
  isInitialized: false,
  isOnline: navigator.onLine,
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
  },
};

// Slice definition
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme management
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme.mode = action.payload;
      
      // Apply theme immediately to document
      const root = document.documentElement;
      if (action.payload === 'dark') {
        root.classList.add('dark');
      } else if (action.payload === 'light') {
        root.classList.remove('dark');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    },
    
    updateTheme: (state, action: PayloadAction<Partial<ThemeState>>) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    
    // Language management
    setLanguage: (state, action: PayloadAction<'en' | 'bn'>) => {
      state.language.current = action.payload;
      state.language.rtl = action.payload === 'bn'; // Bengali can be RTL in some contexts
      
      // Update document language attribute
      document.documentElement.lang = action.payload;
      if (state.language.rtl) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    },
    
    updateLanguage: (state, action: PayloadAction<Partial<LanguageState>>) => {
      state.language = { ...state.language, ...action.payload };
    },
    
    // Layout management
    toggleSidebar: (state) => {
      state.layout.sidebarOpen = !state.layout.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.layout.sidebarOpen = action.payload;
    },
    
    toggleSidebarCollapsed: (state) => {
      state.layout.sidebarCollapsed = !state.layout.sidebarCollapsed;
    },
    
    updateLayout: (state, action: PayloadAction<Partial<LayoutState>>) => {
      state.layout = { ...state.layout, ...action.payload };
    },
    
    // Notification management
    updateNotifications: (state, action: PayloadAction<Partial<NotificationState>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    
    // Accessibility management
    setHighContrast: (state, action: PayloadAction<boolean>) => {
      state.accessibility.highContrast = action.payload;
      
      // Apply high contrast to document
      const root = document.documentElement;
      if (action.payload) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
    },
    
    setReducedMotion: (state, action: PayloadAction<boolean>) => {
      state.accessibility.reducedMotion = action.payload;
      
      // Apply reduced motion to document
      const root = document.documentElement;
      if (action.payload) {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }
    },
    
    setFontSize: (state, action: PayloadAction<'sm' | 'md' | 'lg' | 'xl'>) => {
      state.accessibility.fontSize = action.payload;
      
      // Apply font size to document
      const root = document.documentElement;
      root.classList.remove('text-sm', 'text-md', 'text-lg', 'text-xl');
      root.classList.add(`text-${action.payload}`);
    },
    
    updateAccessibility: (state, action: PayloadAction<Partial<AccessibilityState>>) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    
    // User preferences management
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    addFavoriteComponent: (state, action: PayloadAction<string>) => {
      if (!state.preferences.favoriteComponents.includes(action.payload)) {
        state.preferences.favoriteComponents.push(action.payload);
      }
    },
    
    removeFavoriteComponent: (state, action: PayloadAction<string>) => {
      state.preferences.favoriteComponents = state.preferences.favoriteComponents.filter(
        component => component !== action.payload
      );
    },
    
    // Modal management
    openModal: (state, action: PayloadAction<{ id: string; data?: any }>) => {
      state.modals[action.payload.id] = {
        isOpen: true,
        data: action.payload.data,
      };
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false;
      }
    },
    
    updateModal: (state, action: PayloadAction<{ id: string; data: any }>) => {
      if (state.modals[action.payload.id]) {
        state.modals[action.payload.id].data = action.payload.data;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(id => {
        state.modals[id].isOpen = false;
      });
    },
    
    // Loading state management
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },
    
    clearAllLoading: (state) => {
      state.loading = {};
    },
    
    // Error state management
    setError: (state, action: PayloadAction<{ key: string; error: string | null }>) => {
      state.errors[action.payload.key] = action.payload.error;
    },
    
    clearError: (state, action: PayloadAction<string>) => {
      delete state.errors[action.payload];
    },
    
    clearAllErrors: (state) => {
      state.errors = {};
    },
    
    // Viewport management
    updateViewport: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.viewport = {
        width: action.payload.width,
        height: action.payload.height,
        isMobile: action.payload.width < 768,
        isTablet: action.payload.width >= 768 && action.payload.width < 1024,
        isDesktop: action.payload.width >= 1024,
      };
    },
    
    // Connection status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    
    // Initialization
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    
    // Reset all UI state
    resetUI: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// Export actions
export const {
  setThemeMode,
  updateTheme,
  setLanguage,
  updateLanguage,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  updateLayout,
  updateNotifications,
  setHighContrast,
  setReducedMotion,
  setFontSize,
  updateAccessibility,
  updatePreferences,
  addFavoriteComponent,
  removeFavoriteComponent,
  openModal,
  closeModal,
  updateModal,
  closeAllModals,
  setLoading,
  clearLoading,
  clearAllLoading,
  setError,
  clearError,
  clearAllErrors,
  updateViewport,
  setOnlineStatus,
  setInitialized,
  resetUI,
} = uiSlice.actions;

// Export slice reducer
export default uiSlice;