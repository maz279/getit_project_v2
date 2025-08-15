/**
 * Theme Utilities
 * CSS variables and theme management for design system
 */

import { tokens } from '../tokens';

// Generate CSS variables from design tokens
export const generateCSSVariables = () => {
  const cssVariables: Record<string, string> = {};
  
  // Color variables
  Object.entries(tokens.colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'object') {
      Object.entries(colorValue).forEach(([shade, value]) => {
        cssVariables[`--color-${colorName}-${shade}`] = value;
      });
    } else {
      cssVariables[`--color-${colorName}`] = colorValue;
    }
  });
  
  // Spacing variables
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    cssVariables[`--spacing-${key}`] = value;
  });
  
  // Typography variables
  Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
    cssVariables[`--font-size-${key}`] = Array.isArray(value) ? value[0] : value;
  });
  
  // Border radius variables
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    cssVariables[`--border-radius-${key}`] = value;
  });
  
  // Shadow variables
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    cssVariables[`--shadow-${key}`] = value;
  });
  
  // Animation variables
  Object.entries(tokens.animations.duration).forEach(([key, value]) => {
    cssVariables[`--duration-${key}`] = value;
  });
  
  return cssVariables;
};

// Theme context for React
export interface ThemeContextType {
  theme: 'light' | 'dark' | 'cultural' | 'islamic';
  setTheme: (theme: 'light' | 'dark' | 'cultural' | 'islamic') => void;
  tokens: typeof tokens;
}

// Theme configuration
export const themeConfig = {
  light: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    primary: 'hsl(221.2 83.2% 53.3%)',
    'primary-foreground': 'hsl(210 40% 98%)',
    secondary: 'hsl(210 40% 96%)',
    'secondary-foreground': 'hsl(222.2 84% 4.9%)',
    accent: 'hsl(210 40% 96%)',
    'accent-foreground': 'hsl(222.2 84% 4.9%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    'destructive-foreground': 'hsl(210 40% 98%)',
    muted: 'hsl(210 40% 96%)',
    'muted-foreground': 'hsl(215.4 16.3% 46.9%)',
    card: 'hsl(0 0% 100%)',
    'card-foreground': 'hsl(222.2 84% 4.9%)',
    border: 'hsl(214.3 31.8% 91.4%)',
    input: 'hsl(214.3 31.8% 91.4%)',
    ring: 'hsl(221.2 83.2% 53.3%)'
  },
  dark: {
    background: 'hsl(222.2 84% 4.9%)',
    foreground: 'hsl(210 40% 98%)',
    primary: 'hsl(217.2 91.2% 59.8%)',
    'primary-foreground': 'hsl(222.2 84% 4.9%)',
    secondary: 'hsl(217.2 32.6% 17.5%)',
    'secondary-foreground': 'hsl(210 40% 98%)',
    accent: 'hsl(217.2 32.6% 17.5%)',
    'accent-foreground': 'hsl(210 40% 98%)',
    destructive: 'hsl(0 62.8% 30.6%)',
    'destructive-foreground': 'hsl(210 40% 98%)',
    muted: 'hsl(217.2 32.6% 17.5%)',
    'muted-foreground': 'hsl(215 20.2% 65.1%)',
    card: 'hsl(222.2 84% 4.9%)',
    'card-foreground': 'hsl(210 40% 98%)',
    border: 'hsl(217.2 32.6% 17.5%)',
    input: 'hsl(217.2 32.6% 17.5%)',
    ring: 'hsl(217.2 91.2% 59.8%)'
  },
  cultural: {
    background: 'hsl(158 64% 52%)',
    foreground: 'hsl(0 0% 100%)',
    primary: 'hsl(158 64% 52%)',
    'primary-foreground': 'hsl(0 0% 100%)',
    secondary: 'hsl(158 44% 32%)',
    'secondary-foreground': 'hsl(0 0% 100%)',
    accent: 'hsl(45 93% 47%)',
    'accent-foreground': 'hsl(222.2 84% 4.9%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    'destructive-foreground': 'hsl(210 40% 98%)',
    muted: 'hsl(158 44% 32%)',
    'muted-foreground': 'hsl(158 24% 72%)',
    card: 'hsl(158 64% 52%)',
    'card-foreground': 'hsl(0 0% 100%)',
    border: 'hsl(158 44% 32%)',
    input: 'hsl(158 44% 32%)',
    ring: 'hsl(45 93% 47%)'
  },
  islamic: {
    background: 'hsl(140 50% 60%)',
    foreground: 'hsl(0 0% 100%)',
    primary: 'hsl(140 50% 60%)',
    'primary-foreground': 'hsl(0 0% 100%)',
    secondary: 'hsl(140 30% 40%)',
    'secondary-foreground': 'hsl(0 0% 100%)',
    accent: 'hsl(51 100% 50%)',
    'accent-foreground': 'hsl(222.2 84% 4.9%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    'destructive-foreground': 'hsl(210 40% 98%)',
    muted: 'hsl(140 30% 40%)',
    'muted-foreground': 'hsl(140 10% 80%)',
    card: 'hsl(140 50% 60%)',
    'card-foreground': 'hsl(0 0% 100%)',
    border: 'hsl(140 30% 40%)',
    input: 'hsl(140 30% 40%)',
    ring: 'hsl(51 100% 50%)'
  }
};

// Apply theme function
export const applyTheme = (theme: keyof typeof themeConfig) => {
  const root = document.documentElement;
  const config = themeConfig[theme];
  
  Object.entries(config).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  
  // Apply CSS variables from tokens
  const cssVariables = generateCSSVariables();
  Object.entries(cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

// Theme utilities
export const themeUtils = {
  generateCSSVariables,
  applyTheme,
  themeConfig
};

export default themeUtils;