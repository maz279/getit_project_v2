import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// ThemeContext - Global Theme Context for GetIt Bangladesh
// Amazon.com/Shopee.sg-Level Theme & Cultural State Management

// TypeScript Interfaces
interface ThemeState {
  mode: string;
  culturalTheme: string;
  festivalMode: boolean;
  accentColor: string;
  systemPreference: string;
  effectiveTheme: string;
}

interface ThemeAction {
  type: string;
  payload?: any;
}

interface ThemeContextType {
  mode: string;
  culturalTheme: string;
  festivalMode: boolean;
  accentColor: string;
  systemPreference: string;
  effectiveTheme: string;
  isDark: boolean;
  isLight: boolean;
  culturalConfig: any;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  setCulturalTheme: (theme: string) => void;
  setFestivalMode: (enabled: boolean) => void;
  setAccentColor: (color: string) => void;
  resetToDefault: () => void;
  culturalThemeConfig: any;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Theme Action Types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_CULTURAL_THEME: 'SET_CULTURAL_THEME',
  SET_FESTIVAL_MODE: 'SET_FESTIVAL_MODE',
  SET_ACCENT_COLOR: 'SET_ACCENT_COLOR',
  RESET_TO_DEFAULT: 'RESET_TO_DEFAULT'
};

// Available themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Bangladesh cultural themes
export const CULTURAL_THEMES = {
  DEFAULT: 'default',
  EID: 'eid',
  POHELA_BOISHAKH: 'pohela-boishakh',
  VICTORY_DAY: 'victory-day',
  INDEPENDENCE_DAY: 'independence-day',
  DURGA_PUJA: 'durga-puja',
  WINTER: 'winter',
  MONSOON: 'monsoon'
};

// Cultural theme configurations
const CULTURAL_THEME_CONFIG = {
  [CULTURAL_THEMES.DEFAULT]: {
    name: 'Default',
    colors: {
      primary: '#059669', // Emerald 600
      secondary: '#dc2626', // Red 600
      accent: '#f59e0b' // Amber 500
    },
    description: 'Standard GetIt Bangladesh theme'
  },
  [CULTURAL_THEMES.EID]: {
    name: 'Eid Celebration',
    colors: {
      primary: '#16a34a', // Green 600
      secondary: '#eab308', // Yellow 500
      accent: '#dc2626' // Red 600
    },
    description: 'Special theme for Eid celebrations'
  },
  [CULTURAL_THEMES.POHELA_BOISHAKH]: {
    name: 'Pohela Boishakh',
    colors: {
      primary: '#dc2626', // Red 600
      secondary: '#eab308', // Yellow 500
      accent: '#16a34a' // Green 600
    },
    description: 'Bengali New Year celebration theme'
  },
  [CULTURAL_THEMES.VICTORY_DAY]: {
    name: 'Victory Day',
    colors: {
      primary: '#16a34a', // Green 600
      secondary: '#dc2626', // Red 600
      accent: '#1d4ed8' // Blue 700
    },
    description: 'December 16th Victory Day theme'
  },
  [CULTURAL_THEMES.INDEPENDENCE_DAY]: {
    name: 'Independence Day',
    colors: {
      primary: '#16a34a', // Green 600
      secondary: '#dc2626', // Red 600
      accent: '#f59e0b' // Amber 500
    },
    description: 'March 26th Independence Day theme'
  },
  [CULTURAL_THEMES.DURGA_PUJA]: {
    name: 'Durga Puja',
    colors: {
      primary: '#dc2626', // Red 600
      secondary: '#f59e0b', // Amber 500
      accent: '#7c3aed' // Violet 600
    },
    description: 'Hindu festival celebration theme'
  },
  [CULTURAL_THEMES.WINTER]: {
    name: 'Winter Season',
    colors: {
      primary: '#1e40af', // Blue 700
      secondary: '#64748b', // Slate 500
      accent: '#0891b2' // Cyan 600
    },
    description: 'Cool winter season theme'
  },
  [CULTURAL_THEMES.MONSOON]: {
    name: 'Monsoon Season',
    colors: {
      primary: '#059669', // Emerald 600
      secondary: '#0891b2', // Cyan 600
      accent: '#16a34a' // Green 600
    },
    description: 'Refreshing monsoon season theme'
  }
};

// Initial Theme State
const initialState = {
  mode: THEMES.LIGHT, // light, dark, auto
  culturalTheme: CULTURAL_THEMES.DEFAULT,
  festivalMode: false,
  accentColor: '#059669',
  systemPreference: 'light'
};

// Theme Reducer
function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        mode: action.payload
      };

    case THEME_ACTIONS.TOGGLE_THEME:
      const newMode = state.mode === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
      return {
        ...state,
        mode: newMode
      };

    case THEME_ACTIONS.SET_CULTURAL_THEME: {
      const themeConfig = CULTURAL_THEME_CONFIG[action.payload];
      return {
        ...state,
        culturalTheme: action.payload,
        accentColor: themeConfig?.colors.primary || state.accentColor
      };
    }

    case THEME_ACTIONS.SET_FESTIVAL_MODE:
      return {
        ...state,
        festivalMode: action.payload
      };

    case THEME_ACTIONS.SET_ACCENT_COLOR:
      return {
        ...state,
        accentColor: action.payload
      };

    case THEME_ACTIONS.RESET_TO_DEFAULT:
      return {
        ...initialState,
        systemPreference: state.systemPreference
      };

    default:
      return state;
  }
}

// Detect system theme preference
function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Get effective theme (considering auto mode)
function getEffectiveTheme(mode: string, systemPreference: string): string {
  if (mode === THEMES.AUTO) {
    return systemPreference;
  }
  return mode;
}

// Apply theme to document
function applyThemeToDocument(effectiveTheme: string, culturalTheme: string, accentColor: string): void {
  const root = document.documentElement;
  
  // Apply dark/light mode
  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Apply cultural theme class
  // Remove all cultural theme classes first
  Object.values(CULTURAL_THEMES).forEach(theme => {
    root.classList.remove(`theme-${theme}`);
  });
  // Add current cultural theme
  root.classList.add(`theme-${culturalTheme}`);

  // Apply custom CSS properties
  const themeConfig = CULTURAL_THEME_CONFIG[culturalTheme];
  if (themeConfig) {
    root.style.setProperty('--color-primary', themeConfig.colors.primary);
    root.style.setProperty('--color-secondary', themeConfig.colors.secondary);
    root.style.setProperty('--color-accent', themeConfig.colors.accent);
  }
  
  // Apply custom accent color
  root.style.setProperty('--color-accent', accentColor);
}

// ThemeProvider Component
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Initialize theme from localStorage and system preferences
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme_preferences');
      if (savedTheme) {
        const themeData = JSON.parse(savedTheme);
        if (themeData.mode) {
          dispatch({ type: THEME_ACTIONS.SET_THEME, payload: themeData.mode });
        }
        if (themeData.culturalTheme) {
          dispatch({ type: THEME_ACTIONS.SET_CULTURAL_THEME, payload: themeData.culturalTheme });
        }
        if (themeData.accentColor) {
          dispatch({ type: THEME_ACTIONS.SET_ACCENT_COLOR, payload: themeData.accentColor });
        }
        if (typeof themeData.festivalMode === 'boolean') {
          dispatch({ type: THEME_ACTIONS.SET_FESTIVAL_MODE, payload: themeData.festivalMode });
        }
      }

      // Get system preference
      const systemTheme = getSystemTheme();
      dispatch({ type: THEME_ACTIONS.SET_THEME, payload: systemTheme });

    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      if (state.mode === THEMES.AUTO) {
        applyThemeToDocument(systemTheme, state.culturalTheme, state.accentColor);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [state.mode, state.culturalTheme, state.accentColor]);

  // Apply theme changes to document
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(state.mode, state.systemPreference);
    applyThemeToDocument(effectiveTheme, state.culturalTheme, state.accentColor);
  }, [state.mode, state.culturalTheme, state.accentColor, state.systemPreference]);

  // Save theme preferences to localStorage
  useEffect(() => {
    try {
      const themeData = {
        mode: state.mode,
        culturalTheme: state.culturalTheme,
        accentColor: state.accentColor,
        festivalMode: state.festivalMode
      };
      localStorage.setItem('theme_preferences', JSON.stringify(themeData));
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  }, [state.mode, state.culturalTheme, state.accentColor, state.festivalMode]);

  // Auto-detect festivals and apply themes
  useEffect(() => {
    if (!state.festivalMode) return;

    const checkForFestivals = () => {
      const now = new Date();
      const month = now.getMonth() + 1; // 1-indexed
      const day = now.getDate();

      // Auto-apply festival themes based on dates
      if (month === 3 && day === 26) {
        // Independence Day - March 26
        dispatch({ type: THEME_ACTIONS.SET_CULTURAL_THEME, payload: CULTURAL_THEMES.INDEPENDENCE_DAY });
      } else if (month === 12 && day === 16) {
        // Victory Day - December 16
        dispatch({ type: THEME_ACTIONS.SET_CULTURAL_THEME, payload: CULTURAL_THEMES.VICTORY_DAY });
      } else if (month === 4 && day >= 14 && day <= 15) {
        // Pohela Boishakh - April 14/15
        dispatch({ type: THEME_ACTIONS.SET_CULTURAL_THEME, payload: CULTURAL_THEMES.POHELA_BOISHAKH });
      }
      // Add more festival detection logic here
    };

    checkForFestivals();
    
    // Check daily for festival dates
    const interval = setInterval(checkForFestivals, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.festivalMode]);

  // Theme actions
  const setTheme = (theme: string) => {
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: theme });
  };

  const toggleTheme = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_THEME });
  };

  const setCulturalTheme = (theme: string) => {
    dispatch({ type: THEME_ACTIONS.SET_CULTURAL_THEME, payload: theme });
  };

  const setFestivalMode = (enabled: boolean) => {
    dispatch({ type: THEME_ACTIONS.SET_FESTIVAL_MODE, payload: enabled });
  };

  const setAccentColor = (color: string) => {
    dispatch({ type: THEME_ACTIONS.SET_ACCENT_COLOR, payload: color });
  };

  const resetToDefault = () => {
    dispatch({ type: THEME_ACTIONS.RESET_TO_DEFAULT });
  };

  // Get current theme info
  const getCurrentThemeInfo = () => {
    const effectiveTheme = getEffectiveTheme(state.mode, state.systemPreference);
    const culturalConfig = CULTURAL_THEME_CONFIG[state.culturalTheme];
    
    return {
      mode: state.mode,
      effectiveTheme,
      culturalTheme: state.culturalTheme,
      culturalConfig,
      isDark: effectiveTheme === 'dark',
      isLight: effectiveTheme === 'light'
    };
  };

  // Context value
  const value = {
    // State
    mode: state.mode,
    culturalTheme: state.culturalTheme,
    festivalMode: state.festivalMode,
    accentColor: state.accentColor,
    systemPreference: state.systemPreference,

    // Computed
    effectiveTheme: getEffectiveTheme(state.mode, state.systemPreference),
    isDark: getEffectiveTheme(state.mode, state.systemPreference) === 'dark',
    isLight: getEffectiveTheme(state.mode, state.systemPreference) === 'light',
    culturalConfig: CULTURAL_THEME_CONFIG[state.culturalTheme],

    // Actions
    setTheme,
    toggleTheme,
    setCulturalTheme,
    setFestivalMode,
    setAccentColor,
    resetToDefault,
    getCurrentThemeInfo,

    // Constants
    themes: THEMES,
    culturalThemes: CULTURAL_THEMES,
    culturalThemeConfig: CULTURAL_THEME_CONFIG
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useThemeContext() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  
  return context;
}

export default ThemeContext;