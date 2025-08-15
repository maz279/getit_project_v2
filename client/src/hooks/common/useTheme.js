import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * useTheme - Advanced Theme Management Hook
 * Amazon.com/Shopee.sg-Level Theme System with Bangladesh Integration
 */
export const useTheme = (initialConfig = {}) => {
  const { trackUserActivity } = useAuth();
  const [themeState, setThemeState] = useState({
    currentTheme: 'light',
    culturalTheme: 'default',
    accentColor: 'blue',
    fontSize: 'medium',
    fontFamily: 'inter',
    layout: 'default',
    isHighContrast: false,
    isReducedMotion: false,
    isSystemTheme: false,
    
    // Configuration
    config: {
      enableSystemTheme: true,
      enableCulturalThemes: true,
      enableCustomization: true,
      persistTheme: true,
      storageKey: 'theme_preferences',
      autoSwitchCultural: false,
      enableSeasonalThemes: true,
      ...initialConfig
    },

    // Available themes
    availableThemes: {
      light: {
        name: 'Light',
        primary: '#ffffff',
        secondary: '#f8f9fa',
        accent: '#007bff',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#dee2e6',
        shadow: 'rgba(0,0,0,0.1)'
      },
      dark: {
        name: 'Dark',
        primary: '#1a1a1a',
        secondary: '#2d2d2d',
        accent: '#4dabf7',
        text: '#ffffff',
        textSecondary: '#adb5bd',
        border: '#495057',
        shadow: 'rgba(255,255,255,0.1)'
      },
      auto: {
        name: 'Auto (System)',
        followsSystem: true
      }
    },

    // Bangladesh cultural themes
    culturalThemes: {
      default: {
        name: 'Default',
        colors: {},
        enabledPeriods: 'always'
      },
      eid: {
        name: 'Eid Celebration',
        colors: {
          primary: '#2e7d32',
          accent: '#66bb6a',
          festivalGold: '#ffc107'
        },
        pattern: 'crescent',
        enabledPeriods: ['eid-ul-fitr', 'eid-ul-adha'],
        animations: ['sparkle', 'gentle-glow']
      },
      pohela_boishakh: {
        name: 'Pohela Boishakh',
        colors: {
          primary: '#d32f2f',
          accent: '#ff5722',
          festivalYellow: '#ffeb3b'
        },
        pattern: 'traditional',
        enabledPeriods: ['april'],
        animations: ['festive-confetti']
      },
      independence_day: {
        name: 'Independence Day',
        colors: {
          primary: '#388e3c',
          accent: '#d32f2f',
          patriotic: '#1976d2'
        },
        pattern: 'flag-inspired',
        enabledPeriods: ['march-26'],
        animations: ['flag-wave']
      },
      victory_day: {
        name: 'Victory Day',
        colors: {
          primary: '#1976d2',
          accent: '#388e3c',
          victoryGold: '#f57c00'
        },
        pattern: 'victory-inspired',
        enabledPeriods: ['december-16'],
        animations: ['victory-celebration']
      },
      durga_puja: {
        name: 'Durga Puja',
        colors: {
          primary: '#e91e63',
          accent: '#ff9800',
          sacred: '#9c27b0'
        },
        pattern: 'goddess-inspired',
        enabledPeriods: ['october'],
        animations: ['divine-glow']
      },
      winter: {
        name: 'Winter Season',
        colors: {
          primary: '#37474f',
          accent: '#81c784',
          cozy: '#8d6e63'
        },
        pattern: 'winter-elements',
        enabledPeriods: ['december', 'january', 'february'],
        animations: ['gentle-snow']
      },
      monsoon: {
        name: 'Monsoon Season',
        colors: {
          primary: '#1565c0',
          accent: '#26a69a',
          rain: '#42a5f5'
        },
        pattern: 'rain-drops',
        enabledPeriods: ['june', 'july', 'august', 'september'],
        animations: ['rain-effect']
      },
      summer: {
        name: 'Summer Season',
        colors: {
          primary: '#ff8f00',
          accent: '#ffc107',
          bright: '#ffeb3b'
        },
        pattern: 'sun-inspired',
        enabledPeriods: ['march', 'april', 'may'],
        animations: ['sun-rays']
      }
    },

    // Customization options
    customization: {
      fontSize: {
        small: '14px',
        medium: '16px',
        large: '18px',
        xlarge: '20px'
      },
      fontFamily: {
        inter: 'Inter, sans-serif',
        roboto: 'Roboto, sans-serif',
        poppins: 'Poppins, sans-serif',
        bengali: 'SolaimanLipi, Kalpurush, sans-serif'
      },
      layout: {
        default: 'standard',
        compact: 'dense',
        comfortable: 'spacious',
        mobile: 'mobile-optimized'
      },
      accentColors: {
        blue: '#007bff',
        green: '#28a745',
        red: '#dc3545',
        orange: '#fd7e14',
        purple: '#6f42c1',
        teal: '#20c997',
        pink: '#e91e63',
        indigo: '#6610f2'
      }
    },

    // Accessibility features
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true
    },

    // Performance settings
    performance: {
      enableAnimations: true,
      enableTransitions: true,
      enableShadows: true,
      enableGradients: true,
      optimizeForMobile: false
    },

    // Theme metrics
    themeMetrics: {
      switchCount: 0,
      mostUsedTheme: 'light',
      culturalThemeUsage: {},
      customizationChanges: 0,
      lastThemeChange: null
    }
  });

  // Load theme from storage on mount
  useEffect(() => {
    if (themeState.config.persistTheme) {
      const savedTheme = localStorage.getItem(themeState.config.storageKey);
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme);
          setThemeState(prev => ({
            ...prev,
            ...parsedTheme,
            config: { ...prev.config, ...parsedTheme.config }
          }));
        } catch (error) {
          console.error('Failed to load theme:', error);
        }
      }
    }

    // Initialize system theme detection
    if (themeState.config.enableSystemTheme) {
      detectSystemTheme();
      setupSystemThemeListener();
    }

    // Auto-detect cultural themes based on date
    if (themeState.config.autoSwitchCultural) {
      detectCulturalTheme();
    }
  }, []);

  // Save theme to storage
  const saveTheme = useCallback(() => {
    if (themeState.config.persistTheme) {
      const themeToSave = {
        currentTheme: themeState.currentTheme,
        culturalTheme: themeState.culturalTheme,
        accentColor: themeState.accentColor,
        fontSize: themeState.fontSize,
        fontFamily: themeState.fontFamily,
        layout: themeState.layout,
        isHighContrast: themeState.isHighContrast,
        isReducedMotion: themeState.isReducedMotion,
        accessibility: themeState.accessibility,
        performance: themeState.performance,
        themeMetrics: themeState.themeMetrics,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(themeState.config.storageKey, JSON.stringify(themeToSave));
    }
  }, [themeState, themeState.config.persistTheme, themeState.config.storageKey]);

  // Track theme interaction
  const trackThemeInteraction = useCallback((action, data = {}) => {
    trackUserActivity(`theme_${action}`, null, {
      currentTheme: themeState.currentTheme,
      culturalTheme: themeState.culturalTheme,
      timestamp: new Date().toISOString(),
      ...data
    });
  }, [trackUserActivity, themeState.currentTheme, themeState.culturalTheme]);

  // Detect system theme preference
  const detectSystemTheme = useCallback(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }, []);

  // Setup system theme change listener
  const setupSystemThemeListener = useCallback(() => {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (themeState.isSystemTheme) {
          const newTheme = e.matches ? 'dark' : 'light';
          setTheme(newTheme);
        }
      };
      
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [themeState.isSystemTheme]);

  // Detect appropriate cultural theme based on current date
  const detectCulturalTheme = useCallback(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();
    
    // Check for specific dates first
    if (month === 3 && day === 26) {
      return 'independence_day';
    }
    if (month === 12 && day === 16) {
      return 'victory_day';
    }
    
    // Check for seasonal themes
    if ([12, 1, 2].includes(month)) {
      return 'winter';
    }
    if ([6, 7, 8, 9].includes(month)) {
      return 'monsoon';
    }
    if ([3, 4, 5].includes(month)) {
      return 'summer';
    }
    
    // Check for monthly themes
    if (month === 4) {
      return 'pohela_boishakh';
    }
    if (month === 10) {
      return 'durga_puja';
    }
    
    return 'default';
  }, []);

  // Set main theme
  const setTheme = useCallback((theme) => {
    const isSystemTheme = theme === 'auto';
    const actualTheme = isSystemTheme ? detectSystemTheme() : theme;
    
    setThemeState(prev => ({
      ...prev,
      currentTheme: actualTheme,
      isSystemTheme,
      themeMetrics: {
        ...prev.themeMetrics,
        switchCount: prev.themeMetrics.switchCount + 1,
        mostUsedTheme: actualTheme,
        lastThemeChange: new Date()
      }
    }));

    // Apply theme to document
    applyThemeToDocument(actualTheme);
    
    trackThemeInteraction('changed', { from: themeState.currentTheme, to: actualTheme });
    saveTheme();
  }, [detectSystemTheme, themeState.currentTheme, trackThemeInteraction, saveTheme]);

  // Set cultural theme
  const setCulturalTheme = useCallback((culturalTheme) => {
    setThemeState(prev => ({
      ...prev,
      culturalTheme,
      themeMetrics: {
        ...prev.themeMetrics,
        culturalThemeUsage: {
          ...prev.themeMetrics.culturalThemeUsage,
          [culturalTheme]: (prev.themeMetrics.culturalThemeUsage[culturalTheme] || 0) + 1
        }
      }
    }));

    // Apply cultural theme styles
    applyCulturalTheme(culturalTheme);
    
    trackThemeInteraction('cultural_changed', { culturalTheme });
    saveTheme();
  }, [trackThemeInteraction, saveTheme]);

  // Apply theme to document
  const applyThemeToDocument = useCallback((theme) => {
    const root = document.documentElement;
    const themeConfig = themeState.availableThemes[theme] || themeState.availableThemes.light;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'auto');
    root.classList.add(theme);
    
    // Apply CSS custom properties
    if (themeConfig.primary) {
      root.style.setProperty('--color-primary', themeConfig.primary);
      root.style.setProperty('--color-secondary', themeConfig.secondary);
      root.style.setProperty('--color-accent', themeConfig.accent);
      root.style.setProperty('--color-text', themeConfig.text);
      root.style.setProperty('--color-text-secondary', themeConfig.textSecondary);
      root.style.setProperty('--color-border', themeConfig.border);
      root.style.setProperty('--shadow-base', themeConfig.shadow);
    }
  }, [themeState.availableThemes]);

  // Apply cultural theme
  const applyCulturalTheme = useCallback((culturalTheme) => {
    const root = document.documentElement;
    const cultural = themeState.culturalThemes[culturalTheme] || themeState.culturalThemes.default;
    
    // Remove existing cultural theme classes
    Object.keys(themeState.culturalThemes).forEach(key => {
      root.classList.remove(`cultural-${key}`);
    });
    
    // Add new cultural theme class
    root.classList.add(`cultural-${culturalTheme}`);
    
    // Apply cultural colors
    if (cultural.colors) {
      Object.entries(cultural.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-cultural-${key}`, value);
      });
    }
    
    // Apply cultural patterns
    if (cultural.pattern) {
      root.setAttribute('data-cultural-pattern', cultural.pattern);
    }
    
    // Apply animations
    if (cultural.animations && themeState.performance.enableAnimations) {
      root.setAttribute('data-cultural-animations', cultural.animations.join(' '));
    }
  }, [themeState.culturalThemes, themeState.performance.enableAnimations]);

  // Customization methods
  const setAccentColor = useCallback((color) => {
    setThemeState(prev => ({
      ...prev,
      accentColor: color,
      themeMetrics: {
        ...prev.themeMetrics,
        customizationChanges: prev.themeMetrics.customizationChanges + 1
      }
    }));
    
    document.documentElement.style.setProperty('--color-accent-custom', themeState.customization.accentColors[color]);
    trackThemeInteraction('accent_changed', { color });
    saveTheme();
  }, [themeState.customization.accentColors, trackThemeInteraction, saveTheme]);

  const setFontSize = useCallback((size) => {
    setThemeState(prev => ({
      ...prev,
      fontSize: size
    }));
    
    document.documentElement.style.setProperty('--font-size-base', themeState.customization.fontSize[size]);
    trackThemeInteraction('font_size_changed', { size });
    saveTheme();
  }, [themeState.customization.fontSize, trackThemeInteraction, saveTheme]);

  const setFontFamily = useCallback((family) => {
    setThemeState(prev => ({
      ...prev,
      fontFamily: family
    }));
    
    document.documentElement.style.setProperty('--font-family-base', themeState.customization.fontFamily[family]);
    trackThemeInteraction('font_family_changed', { family });
    saveTheme();
  }, [themeState.customization.fontFamily, trackThemeInteraction, saveTheme]);

  const setLayout = useCallback((layout) => {
    setThemeState(prev => ({
      ...prev,
      layout
    }));
    
    document.documentElement.setAttribute('data-layout', layout);
    trackThemeInteraction('layout_changed', { layout });
    saveTheme();
  }, [trackThemeInteraction, saveTheme]);

  // Accessibility methods
  const toggleHighContrast = useCallback(() => {
    setThemeState(prev => ({
      ...prev,
      isHighContrast: !prev.isHighContrast,
      accessibility: {
        ...prev.accessibility,
        highContrast: !prev.isHighContrast
      }
    }));
    
    document.documentElement.classList.toggle('high-contrast', !themeState.isHighContrast);
    trackThemeInteraction('high_contrast_toggled', { enabled: !themeState.isHighContrast });
    saveTheme();
  }, [themeState.isHighContrast, trackThemeInteraction, saveTheme]);

  const toggleReducedMotion = useCallback(() => {
    setThemeState(prev => ({
      ...prev,
      isReducedMotion: !prev.isReducedMotion,
      accessibility: {
        ...prev.accessibility,
        reducedMotion: !prev.isReducedMotion
      }
    }));
    
    document.documentElement.classList.toggle('reduced-motion', !themeState.isReducedMotion);
    trackThemeInteraction('reduced_motion_toggled', { enabled: !themeState.isReducedMotion });
    saveTheme();
  }, [themeState.isReducedMotion, trackThemeInteraction, saveTheme]);

  // Reset to defaults
  const resetTheme = useCallback(() => {
    setThemeState(prev => ({
      ...prev,
      currentTheme: 'light',
      culturalTheme: 'default',
      accentColor: 'blue',
      fontSize: 'medium',
      fontFamily: 'inter',
      layout: 'default',
      isHighContrast: false,
      isReducedMotion: false,
      isSystemTheme: false
    }));
    
    // Clear custom properties
    const root = document.documentElement;
    root.className = '';
    root.classList.add('light');
    
    trackThemeInteraction('reset');
    saveTheme();
  }, [trackThemeInteraction, saveTheme]);

  // Get current theme configuration
  const getCurrentThemeConfig = useCallback(() => {
    const baseTheme = themeState.availableThemes[themeState.currentTheme] || themeState.availableThemes.light;
    const cultural = themeState.culturalThemes[themeState.culturalTheme] || themeState.culturalThemes.default;
    
    return {
      ...baseTheme,
      cultural: cultural.colors || {},
      accent: themeState.customization.accentColors[themeState.accentColor],
      fontSize: themeState.customization.fontSize[themeState.fontSize],
      fontFamily: themeState.customization.fontFamily[themeState.fontFamily]
    };
  }, [themeState]);

  // Auto cultural theme detection
  useEffect(() => {
    if (themeState.config.autoSwitchCultural) {
      const detectedTheme = detectCulturalTheme();
      if (detectedTheme !== themeState.culturalTheme) {
        setCulturalTheme(detectedTheme);
      }
    }
  }, [themeState.config.autoSwitchCultural, detectCulturalTheme, themeState.culturalTheme, setCulturalTheme]);

  // Computed values
  const isDarkTheme = useMemo(() => {
    return themeState.currentTheme === 'dark';
  }, [themeState.currentTheme]);

  const isLightTheme = useMemo(() => {
    return themeState.currentTheme === 'light';
  }, [themeState.currentTheme]);

  const isCulturalThemeActive = useMemo(() => {
    return themeState.culturalTheme !== 'default';
  }, [themeState.culturalTheme]);

  const availableCulturalThemes = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    
    return Object.entries(themeState.culturalThemes).filter(([key, theme]) => {
      if (key === 'default') return true;
      if (theme.enabledPeriods === 'always') return true;
      if (Array.isArray(theme.enabledPeriods)) {
        return theme.enabledPeriods.some(period => {
          if (typeof period === 'string' && period.includes('month')) {
            const targetMonth = parseInt(period.split('-')[0]);
            return month === targetMonth;
          }
          return true;
        });
      }
      return false;
    });
  }, [themeState.culturalThemes]);

  return {
    // Current state
    currentTheme: themeState.currentTheme,
    culturalTheme: themeState.culturalTheme,
    accentColor: themeState.accentColor,
    fontSize: themeState.fontSize,
    fontFamily: themeState.fontFamily,
    layout: themeState.layout,
    isHighContrast: themeState.isHighContrast,
    isReducedMotion: themeState.isReducedMotion,
    isSystemTheme: themeState.isSystemTheme,
    
    // Theme methods
    setTheme,
    setCulturalTheme,
    setAccentColor,
    setFontSize,
    setFontFamily,
    setLayout,
    
    // Accessibility methods
    toggleHighContrast,
    toggleReducedMotion,
    
    // Utility methods
    resetTheme,
    detectCulturalTheme,
    getCurrentThemeConfig,
    
    // Available options
    availableThemes: themeState.availableThemes,
    culturalThemes: themeState.culturalThemes,
    availableCulturalThemes,
    customization: themeState.customization,
    
    // State information
    isDarkTheme,
    isLightTheme,
    isCulturalThemeActive,
    
    // Configuration
    config: themeState.config,
    
    // Metrics
    themeMetrics: themeState.themeMetrics,
    
    // Quick toggle methods
    toggleTheme: () => setTheme(isDarkTheme ? 'light' : 'dark'),
    enableSystemTheme: () => setTheme('auto'),
    
    // Bangladesh-specific helpers
    enableEidTheme: () => setCulturalTheme('eid'),
    enablePohelaBoishakhTheme: () => setCulturalTheme('pohela_boishakh'),
    enableIndependenceTheme: () => setCulturalTheme('independence_day'),
    enableVictoryTheme: () => setCulturalTheme('victory_day'),
    enableSeasonalTheme: () => setCulturalTheme(detectCulturalTheme()),
    
    // Performance controls
    performance: themeState.performance,
    setPerformance: (settings) => {
      setThemeState(prev => ({
        ...prev,
        performance: { ...prev.performance, ...settings }
      }));
      saveTheme();
    },
    
    // Accessibility state
    accessibility: themeState.accessibility
  };
};

export default useTheme;