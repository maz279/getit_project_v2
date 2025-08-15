// User Redux Slice
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level User State Management
// Comprehensive user profile, preferences, and authentication state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/customerService';

// Async thunks for user operations
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await customerService.getUserProfile();
      return profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const updatedProfile = await customerService.updateUserProfile(profileData);
      return updatedProfile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updateUserPreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await customerService.updateUserPreferences(preferences);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // User profile
  profile: null,
  isAuthenticated: false,
  
  // User preferences
  preferences: {
    language: 'bn',
    currency: 'BDT',
    theme: 'light',
    culturalTheme: 'default',
    notifications: {
      email: true,
      sms: true,
      push: true,
      orderUpdates: true,
      promotions: true,
      newsletter: false
    },
    shopping: {
      defaultDeliveryAddress: null,
      preferredPaymentMethod: 'bkash',
      showPricesInclVAT: true,
      autoAddToWishlist: false
    },
    privacy: {
      showOnlineStatus: false,
      shareReviews: true,
      allowRecommendations: true
    }
  },
  
  // User activity
  activity: {
    lastLogin: null,
    loginCount: 0,
    lastActivity: null,
    sessionDuration: 0
  },
  
  // User addresses
  addresses: [],
  defaultAddressId: null,
  
  // User payment methods
  paymentMethods: [],
  defaultPaymentMethodId: null,
  
  // User loyalty/points
  loyaltyPoints: 0,
  membershipTier: 'bronze', // bronze, silver, gold, platinum
  
  // Bangladesh-specific data
  bangladeshData: {
    nidVerified: false,
    phoneVerified: false,
    preferredCourierServices: ['pathao', 'paperfly'],
    division: null,
    district: null,
    upazila: null
  },
  
  // Loading states
  loading: false,
  updating: false,
  
  // Error states
  error: null,
  updateError: null,
  
  // Last updated
  lastUpdated: null
};

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Authentication actions
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    
    clearProfile: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
      state.addresses = [];
      state.paymentMethods = [];
    },
    
    // Preferences actions
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload
      };
    },
    
    updateNotificationPreferences: (state, action) => {
      state.preferences.notifications = {
        ...state.preferences.notifications,
        ...action.payload
      };
    },
    
    updateShoppingPreferences: (state, action) => {
      state.preferences.shopping = {
        ...state.preferences.shopping,
        ...action.payload
      };
    },
    
    updatePrivacyPreferences: (state, action) => {
      state.preferences.privacy = {
        ...state.preferences.privacy,
        ...action.payload
      };
    },
    
    // Activity tracking
    updateActivity: (state, action) => {
      state.activity = {
        ...state.activity,
        ...action.payload,
        lastActivity: new Date().toISOString()
      };
    },
    
    incrementLoginCount: (state) => {
      state.activity.loginCount += 1;
      state.activity.lastLogin = new Date().toISOString();
    },
    
    // Address management
    setAddresses: (state, action) => {
      state.addresses = action.payload;
    },
    
    addAddress: (state, action) => {
      state.addresses.push(action.payload);
    },
    
    updateAddress: (state, action) => {
      const { id, ...addressData } = action.payload;
      const index = state.addresses.findIndex(addr => addr.id === id);
      if (index !== -1) {
        state.addresses[index] = { ...state.addresses[index], ...addressData };
      }
    },
    
    removeAddress: (state, action) => {
      const addressId = action.payload;
      state.addresses = state.addresses.filter(addr => addr.id !== addressId);
      
      // Clear default if removed address was default
      if (state.defaultAddressId === addressId) {
        state.defaultAddressId = null;
      }
    },
    
    setDefaultAddress: (state, action) => {
      state.defaultAddressId = action.payload;
    },
    
    // Payment methods management
    setPaymentMethods: (state, action) => {
      state.paymentMethods = action.payload;
    },
    
    addPaymentMethod: (state, action) => {
      state.paymentMethods.push(action.payload);
    },
    
    updatePaymentMethod: (state, action) => {
      const { id, ...methodData } = action.payload;
      const index = state.paymentMethods.findIndex(method => method.id === id);
      if (index !== -1) {
        state.paymentMethods[index] = { ...state.paymentMethods[index], ...methodData };
      }
    },
    
    removePaymentMethod: (state, action) => {
      const methodId = action.payload;
      state.paymentMethods = state.paymentMethods.filter(method => method.id !== methodId);
      
      // Clear default if removed method was default
      if (state.defaultPaymentMethodId === methodId) {
        state.defaultPaymentMethodId = null;
      }
    },
    
    setDefaultPaymentMethod: (state, action) => {
      state.defaultPaymentMethodId = action.payload;
    },
    
    // Loyalty/Points management
    updateLoyaltyPoints: (state, action) => {
      state.loyaltyPoints = action.payload;
    },
    
    addLoyaltyPoints: (state, action) => {
      state.loyaltyPoints += action.payload;
    },
    
    deductLoyaltyPoints: (state, action) => {
      state.loyaltyPoints = Math.max(0, state.loyaltyPoints - action.payload);
    },
    
    updateMembershipTier: (state, action) => {
      state.membershipTier = action.payload;
    },
    
    // Bangladesh-specific actions
    updateBangladeshData: (state, action) => {
      state.bangladeshData = {
        ...state.bangladeshData,
        ...action.payload
      };
    },
    
    setNidVerified: (state, action) => {
      state.bangladeshData.nidVerified = action.payload;
    },
    
    setPhoneVerified: (state, action) => {
      state.bangladeshData.phoneVerified = action.payload;
    },
    
    updateLocation: (state, action) => {
      const { division, district, upazila } = action.payload;
      state.bangladeshData.division = division;
      state.bangladeshData.district = district;
      state.bangladeshData.upazila = upazila;
    },
    
    updatePreferredCourierServices: (state, action) => {
      state.bangladeshData.preferredCourierServices = action.payload;
    },
    
    // Error handling
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
    },
    
    // Reset user state
    resetUserState: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    // Fetch user profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.isAuthenticated = true;
        state.lastUpdated = new Date().toISOString();
        
        // Update addresses and payment methods if provided
        if (action.payload.addresses) {
          state.addresses = action.payload.addresses;
        }
        if (action.payload.paymentMethods) {
          state.paymentMethods = action.payload.paymentMethods;
        }
        if (action.payload.preferences) {
          state.preferences = { ...state.preferences, ...action.payload.preferences };
        }
        if (action.payload.loyaltyPoints) {
          state.loyaltyPoints = action.payload.loyaltyPoints;
        }
        if (action.payload.membershipTier) {
          state.membershipTier = action.payload.membershipTier;
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
    
    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = { ...state.profile, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
      });
    
    // Update user preferences
    builder
      .addCase(updateUserPreferences.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.updating = false;
        state.preferences = { ...state.preferences, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
      });
  }
});

// Export actions
export const {
  setAuthenticated,
  setProfile,
  clearProfile,
  updatePreferences,
  updateNotificationPreferences,
  updateShoppingPreferences,
  updatePrivacyPreferences,
  updateActivity,
  incrementLoginCount,
  setAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  setPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  updateLoyaltyPoints,
  addLoyaltyPoints,
  deductLoyaltyPoints,
  updateMembershipTier,
  updateBangladeshData,
  setNidVerified,
  setPhoneVerified,
  updateLocation,
  updatePreferredCourierServices,
  clearErrors,
  resetUserState
} = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.profile;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserPreferences = (state) => state.user.preferences;
export const selectUserAddresses = (state) => state.user.addresses;
export const selectDefaultAddress = (state) => {
  const defaultId = state.user.defaultAddressId;
  return state.user.addresses.find(addr => addr.id === defaultId) || null;
};
export const selectUserPaymentMethods = (state) => state.user.paymentMethods;
export const selectDefaultPaymentMethod = (state) => {
  const defaultId = state.user.defaultPaymentMethodId;
  return state.user.paymentMethods.find(method => method.id === defaultId) || null;
};
export const selectLoyaltyPoints = (state) => state.user.loyaltyPoints;
export const selectMembershipTier = (state) => state.user.membershipTier;
export const selectBangladeshData = (state) => state.user.bangladeshData;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectUserActivity = (state) => state.user.activity;

export default userSlice.reducer;