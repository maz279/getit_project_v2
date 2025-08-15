/**
 * Theme Slice
 * Phase 1 Week 3-4: State Management Upgrade
 * Redux Toolkit slice for theme state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  culturalTheme: 'default' | 'bangladesh' | 'international';
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

const initialState: ThemeState = {
  mode: 'system',
  primaryColor: '#3b82f6',
  culturalTheme: 'default',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeState['mode']>) => {
      state.mode = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
    setCulturalTheme: (state, action: PayloadAction<ThemeState['culturalTheme']>) => {
      state.culturalTheme = action.payload;
    },
    setFontSize: (state, action: PayloadAction<ThemeState['fontSize']>) => {
      state.fontSize = action.payload;
    },
    toggleReducedMotion: (state) => {
      state.reducedMotion = !state.reducedMotion;
    },
    toggleHighContrast: (state) => {
      state.highContrast = !state.highContrast;
    },
    resetTheme: (state) => {
      return initialState;
    },
  },
});

export const {
  setThemeMode,
  setPrimaryColor,
  setCulturalTheme,
  setFontSize,
  toggleReducedMotion,
  toggleHighContrast,
  resetTheme,
} = themeSlice.actions;

export default themeSlice.reducer;