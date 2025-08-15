/**
 * Theme Provider
 * React context provider for theme management
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { applyTheme, themeConfig, type ThemeContextType } from '../utils/theme';
import { tokens } from '../tokens';

const ThemeContext = createContext<ThemeContextType | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'cultural' | 'islamic';
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = 'getit-theme'
}) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'cultural' | 'islamic'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      return (stored as any) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    // Apply theme to document
    applyTheme(theme);
    
    // Store in localStorage
    localStorage.setItem(storageKey, theme);
    
    // Add theme class to document
    document.documentElement.className = theme;
  }, [theme, storageKey]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    tokens
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;