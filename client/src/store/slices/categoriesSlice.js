// Categories Redux Slice
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Category State Management
// Hierarchical category management with localization

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/customerService';

// Async thunks for category operations
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await customerService.getCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Category data
  items: [],
  hierarchy: {},
  rootCategories: [],
  
  // Current category
  activeCategory: null,
  breadcrumb: [],
  
  // Loading states
  loading: false,
  error: null,
  
  // Last updated
  lastUpdated: null
};

// Categories slice
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setActiveCategory: (state, action) => {
      const categoryId = action.payload;
      const category = state.items.find(cat => cat.id === categoryId);
      
      if (category) {
        state.activeCategory = category;
        state.breadcrumb = buildBreadcrumb(state.items, category);
      }
    },
    
    clearActiveCategory: (state) => {
      state.activeCategory = null;
      state.breadcrumb = [];
    },
    
    buildHierarchy: (state) => {
      state.hierarchy = buildCategoryHierarchy(state.items);
      state.rootCategories = state.items.filter(cat => !cat.parentId);
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hierarchy = buildCategoryHierarchy(action.payload);
        state.rootCategories = action.payload.filter(cat => !cat.parentId);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Helper functions
function buildCategoryHierarchy(categories) {
  const hierarchy = {};
  
  categories.forEach(category => {
    if (!category.parentId) {
      hierarchy[category.id] = { ...category, children: [] };
    }
  });
  
  categories.forEach(category => {
    if (category.parentId && hierarchy[category.parentId]) {
      hierarchy[category.parentId].children.push(category);
    }
  });
  
  return hierarchy;
}

function buildBreadcrumb(categories, currentCategory) {
  const breadcrumb = [];
  let category = currentCategory;
  
  while (category) {
    breadcrumb.unshift(category);
    if (category.parentId) {
      category = categories.find(cat => cat.id === category.parentId);
    } else {
      break;
    }
  }
  
  return breadcrumb;
}

export const { setActiveCategory, clearActiveCategory, buildHierarchy } = categoriesSlice.actions;

export const selectCategories = (state) => state.categories.items;
export const selectCategoryHierarchy = (state) => state.categories.hierarchy;
export const selectRootCategories = (state) => state.categories.rootCategories;
export const selectActiveCategory = (state) => state.categories.activeCategory;
export const selectCategoryBreadcrumb = (state) => state.categories.breadcrumb;

export default categoriesSlice.reducer;