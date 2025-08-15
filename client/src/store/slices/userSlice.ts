/**
 * User Slice
 * Phase 1 Week 3-4: State Management Upgrade
 * Redux Toolkit slice for user profile state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserPreferences {
  language: 'en' | 'bn';
  currency: 'USD' | 'BDT';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

interface UserAddress {
  id: string;
  type: 'home' | 'work' | 'other';
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

interface UserState {
  profile: {
    id: string;
    email: string;
    name: string;
    phone: string;
    avatar: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
  } | null;
  preferences: UserPreferences;
  addresses: UserAddress[];
  wishlist: string[];
  recentlyViewed: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  preferences: {
    language: 'en',
    currency: 'USD',
    notifications: {
      email: true,
      sms: true,
      push: true,
    },
    theme: 'system',
  },
  addresses: [],
  wishlist: [],
  recentlyViewed: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserState['profile']>) => {
      state.profile = action.payload;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addAddress: (state, action: PayloadAction<UserAddress>) => {
      state.addresses.push(action.payload);
    },
    updateAddress: (state, action: PayloadAction<UserAddress>) => {
      const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
      if (index !== -1) {
        state.addresses[index] = action.payload;
      }
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
    },
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      state.addresses.forEach(addr => {
        addr.isDefault = addr.id === action.payload;
      });
    },
    addToWishlist: (state, action: PayloadAction<string>) => {
      if (!state.wishlist.includes(action.payload)) {
        state.wishlist.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter(id => id !== action.payload);
    },
    addToRecentlyViewed: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.recentlyViewed = [
        productId,
        ...state.recentlyViewed.filter(id => id !== productId)
      ].slice(0, 20); // Keep only last 20 items
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProfile,
  updatePreferences,
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  addToWishlist,
  removeFromWishlist,
  addToRecentlyViewed,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;