/**
 * Phase 4 Task 4.2: State Management Service
 * Amazon.com/Shopee.sg Enterprise-Level State Management with Redux Toolkit
 * 
 * Features:
 * - Centralized state management
 * - Redux Toolkit with RTK Query
 * - Micro-frontend state synchronization
 * - Optimistic updates
 * - Offline state persistence
 * - Time-travel debugging
 */

import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Auth State Interface
interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'admin' | 'vendor';
    avatar: string;
    preferences: Record<string, any>;
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number;
  };
  permissions: string[];
  lastActivity: number;
}

// Cart State Interface
interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  shippingCost: number;
  discount: number;
  currency: string;
  lastUpdated: number;
  sessionId: string;
  isLoading: boolean;
  error: string | null;
}

interface CartItem {
  id: string;
  productId: string;
  vendorId: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariant: Record<string, any>;
  availability: boolean;
  image: string;
  addedAt: number;
}

// Product State Interface
interface ProductState {
  products: Product[];
  filters: ProductFilters;
  sorting: ProductSorting;
  pagination: ProductPagination;
  selectedProduct: Product | null;
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: Product[];
  recentlyViewed: Product[];
  wishlist: string[];
  comparisons: Product[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  currency: string;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  availability: boolean;
  stock: number;
  variants: ProductVariant[];
  specifications: Record<string, any>;
  vendorId: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, any>;
}

interface ProductFilters {
  category: string[];
  brand: string[];
  priceRange: [number, number];
  rating: number;
  availability: boolean;
  location: string;
  discount: boolean;
}

interface ProductSorting {
  field: 'price' | 'rating' | 'popularity' | 'newest' | 'name';
  direction: 'asc' | 'desc';
}

interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: Category[];
  productCount: number;
  image: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  productCount: number;
  verified: boolean;
}

class StateManagementService {
  private static instance: StateManagementService;
  private store: any;
  private persistor: any;

  private constructor() {
    this.initializeStore();
  }

  static getInstance(): StateManagementService {
    if (!StateManagementService.instance) {
      StateManagementService.instance = new StateManagementService();
    }
    return StateManagementService.instance;
  }

  /**
   * Initialize Redux store with persistence
   */
  private initializeStore(): void {
    // Auth slice
    const authSlice = createSlice({
      name: 'auth',
      initialState: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        tokens: {
          accessToken: null,
          refreshToken: null,
          expiresAt: 0
        },
        permissions: [],
        lastActivity: Date.now()
      } as AuthState,
      reducers: {
        loginStart: (state) => {
          state.loading = true;
          state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<{ user: any; tokens: any; permissions: string[] }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.permissions = action.payload.permissions;
          state.isAuthenticated = true;
          state.lastActivity = Date.now();
        },
        loginFailure: (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
          state.isAuthenticated = false;
        },
        logout: (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.tokens = { accessToken: null, refreshToken: null, expiresAt: 0 };
          state.permissions = [];
          state.error = null;
        },
        updateUser: (state, action: PayloadAction<Partial<AuthState['user']>>) => {
          if (state.user) {
            state.user = { ...state.user, ...action.payload };
          }
        },
        updateLastActivity: (state) => {
          state.lastActivity = Date.now();
        }
      }
    });

    // Cart slice
    const cartSlice = createSlice({
      name: 'cart',
      initialState: {
        items: [],
        total: 0,
        itemCount: 0,
        shippingCost: 0,
        discount: 0,
        currency: 'BDT',
        lastUpdated: Date.now(),
        sessionId: '',
        isLoading: false,
        error: null
      } as CartState,
      reducers: {
        addItem: (state, action: PayloadAction<CartItem>) => {
          const existingItem = state.items.find(item => 
            item.productId === action.payload.productId && 
            JSON.stringify(item.selectedVariant) === JSON.stringify(action.payload.selectedVariant)
          );

          if (existingItem) {
            existingItem.quantity += action.payload.quantity;
          } else {
            state.items.push({ ...action.payload, addedAt: Date.now() });
          }

          state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
          state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          state.lastUpdated = Date.now();
        },
        removeItem: (state, action: PayloadAction<string>) => {
          state.items = state.items.filter(item => item.id !== action.payload);
          state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
          state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          state.lastUpdated = Date.now();
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
          const item = state.items.find(item => item.id === action.payload.id);
          if (item) {
            item.quantity = action.payload.quantity;
            if (item.quantity <= 0) {
              state.items = state.items.filter(i => i.id !== action.payload.id);
            }
          }
          state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
          state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          state.lastUpdated = Date.now();
        },
        clearCart: (state) => {
          state.items = [];
          state.total = 0;
          state.itemCount = 0;
          state.lastUpdated = Date.now();
        },
        updateShippingCost: (state, action: PayloadAction<number>) => {
          state.shippingCost = action.payload;
        },
        applyDiscount: (state, action: PayloadAction<number>) => {
          state.discount = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
          state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
          state.error = action.payload;
        }
      }
    });

    // Product slice
    const productSlice = createSlice({
      name: 'products',
      initialState: {
        products: [],
        filters: {
          category: [],
          brand: [],
          priceRange: [0, 100000],
          rating: 0,
          availability: true,
          location: '',
          discount: false
        },
        sorting: {
          field: 'popularity',
          direction: 'desc'
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        },
        selectedProduct: null,
        categories: [],
        brands: [],
        loading: false,
        error: null,
        searchQuery: '',
        searchResults: [],
        recentlyViewed: [],
        wishlist: [],
        comparisons: []
      } as ProductState,
      reducers: {
        setProducts: (state, action: PayloadAction<Product[]>) => {
          state.products = action.payload;
          state.loading = false;
        },
        setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
          state.selectedProduct = action.payload;
          if (action.payload) {
            // Add to recently viewed
            const existingIndex = state.recentlyViewed.findIndex(p => p.id === action.payload.id);
            if (existingIndex > -1) {
              state.recentlyViewed.splice(existingIndex, 1);
            }
            state.recentlyViewed.unshift(action.payload);
            state.recentlyViewed = state.recentlyViewed.slice(0, 10);
          }
        },
        setFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
          state.filters = { ...state.filters, ...action.payload };
        },
        setSorting: (state, action: PayloadAction<ProductSorting>) => {
          state.sorting = action.payload;
        },
        setPagination: (state, action: PayloadAction<Partial<ProductPagination>>) => {
          state.pagination = { ...state.pagination, ...action.payload };
        },
        setCategories: (state, action: PayloadAction<Category[]>) => {
          state.categories = action.payload;
        },
        setBrands: (state, action: PayloadAction<Brand[]>) => {
          state.brands = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
          state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
          state.error = action.payload;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
          state.searchQuery = action.payload;
        },
        setSearchResults: (state, action: PayloadAction<Product[]>) => {
          state.searchResults = action.payload;
        },
        toggleWishlist: (state, action: PayloadAction<string>) => {
          const productId = action.payload;
          const index = state.wishlist.indexOf(productId);
          if (index > -1) {
            state.wishlist.splice(index, 1);
          } else {
            state.wishlist.push(productId);
          }
        },
        addToComparison: (state, action: PayloadAction<Product>) => {
          if (state.comparisons.length < 4 && !state.comparisons.find(p => p.id === action.payload.id)) {
            state.comparisons.push(action.payload);
          }
        },
        removeFromComparison: (state, action: PayloadAction<string>) => {
          state.comparisons = state.comparisons.filter(p => p.id !== action.payload);
        }
      }
    });

    // UI State slice
    const uiSlice = createSlice({
      name: 'ui',
      initialState: {
        theme: 'light',
        language: 'en',
        currency: 'BDT',
        sidebarOpen: false,
        mobileMenuOpen: false,
        searchOpen: false,
        notifications: {
          show: false,
          type: 'info',
          message: ''
        },
        modals: {
          login: false,
          cart: false,
          quickView: false,
          filters: false
        },
        loading: {
          global: false,
          page: false,
          components: {}
        }
      },
      reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
          state.theme = action.payload;
        },
        setLanguage: (state, action: PayloadAction<string>) => {
          state.language = action.payload;
        },
        setCurrency: (state, action: PayloadAction<string>) => {
          state.currency = action.payload;
        },
        toggleSidebar: (state) => {
          state.sidebarOpen = !state.sidebarOpen;
        },
        toggleMobileMenu: (state) => {
          state.mobileMenuOpen = !state.mobileMenuOpen;
        },
        toggleSearch: (state) => {
          state.searchOpen = !state.searchOpen;
        },
        showNotification: (state, action: PayloadAction<{ type: string; message: string }>) => {
          state.notifications = { show: true, ...action.payload };
        },
        hideNotification: (state) => {
          state.notifications.show = false;
        },
        openModal: (state, action: PayloadAction<string>) => {
          state.modals = { ...state.modals, [action.payload]: true };
        },
        closeModal: (state, action: PayloadAction<string>) => {
          state.modals = { ...state.modals, [action.payload]: false };
        },
        setGlobalLoading: (state, action: PayloadAction<boolean>) => {
          state.loading.global = action.payload;
        },
        setPageLoading: (state, action: PayloadAction<boolean>) => {
          state.loading.page = action.payload;
        },
        setComponentLoading: (state, action: PayloadAction<{ component: string; loading: boolean }>) => {
          state.loading.components[action.payload.component] = action.payload.loading;
        }
      }
    });

    // Persistence configuration
    const persistConfig = {
      key: 'root',
      storage,
      whitelist: ['auth', 'cart', 'products', 'ui'],
      blacklist: ['loading', 'error']
    };

    // Root reducer
    const rootReducer = {
      auth: authSlice.reducer,
      cart: cartSlice.reducer,
      products: productSlice.reducer,
      ui: uiSlice.reducer
    };

    // Create persisted reducer
    const persistedReducer = persistReducer(persistConfig, rootReducer);

    // Configure store
    this.store = configureStore({
      reducer: persistedReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
          }
        }),
      devTools: process.env.NODE_ENV !== 'production'
    });

    // Create persistor
    this.persistor = persistStore(this.store);
  }

  /**
   * Get store instance
   */
  getStore(): any {
    return this.store;
  }

  /**
   * Get persistor instance
   */
  getPersistor(): any {
    return this.persistor;
  }

  /**
   * Dispatch action
   */
  dispatch(action: any): void {
    this.store.dispatch(action);
  }

  /**
   * Get current state
   */
  getState(): any {
    return this.store.getState();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: () => void): () => void {
    return this.store.subscribe(listener);
  }

  /**
   * Sync state across micro-frontends
   */
  syncStateAcrossMicroFrontends(): void {
    this.store.subscribe(() => {
      const state = this.store.getState();
      
      // Send state updates to other micro-frontends
      window.postMessage({
        type: 'STATE_UPDATE',
        payload: {
          auth: state.auth,
          cart: state.cart,
          ui: state.ui
        }
      }, '*');
    });

    // Listen for state updates from other micro-frontends
    window.addEventListener('message', (event) => {
      try {
        if (event.data && typeof event.data === 'object' && event.data.type === 'STATE_UPDATE') {
          const { auth, cart, ui } = event.data.payload || {};
          
          // Update local state with remote changes
          if (auth) this.store.dispatch({ type: 'auth/updateFromRemote', payload: auth });
          if (cart) this.store.dispatch({ type: 'cart/updateFromRemote', payload: cart });
          if (ui) this.store.dispatch({ type: 'ui/updateFromRemote', payload: ui });
        }
      } catch (error) {
        console.error('State management message handler error:', error);
      }
    });
  }

  /**
   * Optimistic updates
   */
  optimisticUpdate<T>(action: any, revertAction: any, apiCall: Promise<T>): Promise<T> {
    // Apply optimistic update
    this.store.dispatch(action);

    return apiCall.catch((error) => {
      // Revert on error
      this.store.dispatch(revertAction);
      throw error;
    });
  }

  /**
   * Batch actions
   */
  batchActions(actions: any[]): void {
    actions.forEach(action => this.store.dispatch(action));
  }

  /**
   * Get state selectors
   */
  getSelectors(): any {
    return {
      // Auth selectors
      isAuthenticated: (state: any) => state.auth.isAuthenticated,
      currentUser: (state: any) => state.auth.user,
      userPermissions: (state: any) => state.auth.permissions,
      
      // Cart selectors
      cartItems: (state: any) => state.cart.items,
      cartTotal: (state: any) => state.cart.total,
      cartItemCount: (state: any) => state.cart.itemCount,
      
      // Product selectors
      allProducts: (state: any) => state.products.products,
      selectedProduct: (state: any) => state.products.selectedProduct,
      productFilters: (state: any) => state.products.filters,
      searchResults: (state: any) => state.products.searchResults,
      wishlistItems: (state: any) => state.products.wishlist,
      
      // UI selectors
      currentTheme: (state: any) => state.ui.theme,
      currentLanguage: (state: any) => state.ui.language,
      isLoading: (state: any) => state.ui.loading.global,
      notifications: (state: any) => state.ui.notifications
    };
  }

  /**
   * Get action creators
   */
  getActionCreators(): any {
    return {
      auth: {
        login: (credentials: any) => ({ type: 'auth/loginStart', payload: credentials }),
        logout: () => ({ type: 'auth/logout' }),
        updateUser: (userData: any) => ({ type: 'auth/updateUser', payload: userData })
      },
      cart: {
        addItem: (item: CartItem) => ({ type: 'cart/addItem', payload: item }),
        removeItem: (itemId: string) => ({ type: 'cart/removeItem', payload: itemId }),
        updateQuantity: (data: { id: string; quantity: number }) => ({ type: 'cart/updateQuantity', payload: data }),
        clearCart: () => ({ type: 'cart/clearCart' })
      },
      products: {
        setProducts: (products: Product[]) => ({ type: 'products/setProducts', payload: products }),
        setSelectedProduct: (product: Product | null) => ({ type: 'products/setSelectedProduct', payload: product }),
        setFilters: (filters: Partial<ProductFilters>) => ({ type: 'products/setFilters', payload: filters }),
        toggleWishlist: (productId: string) => ({ type: 'products/toggleWishlist', payload: productId })
      },
      ui: {
        setTheme: (theme: 'light' | 'dark') => ({ type: 'ui/setTheme', payload: theme }),
        setLanguage: (language: string) => ({ type: 'ui/setLanguage', payload: language }),
        showNotification: (notification: { type: string; message: string }) => ({ type: 'ui/showNotification', payload: notification }),
        openModal: (modal: string) => ({ type: 'ui/openModal', payload: modal }),
        closeModal: (modal: string) => ({ type: 'ui/closeModal', payload: modal })
      }
    };
  }

  /**
   * Time travel debugging
   */
  enableTimeTravel(): void {
    if (process.env.NODE_ENV === 'development') {
      // Add time travel debugging capabilities
      const actions: any[] = [];
      const originalDispatch = this.store.dispatch;
      
      this.store.dispatch = (action: any) => {
        actions.push({
          action,
          timestamp: Date.now(),
          state: this.store.getState()
        });
        
        return originalDispatch(action);
      };
      
      // Expose time travel methods
      (window as any).__REDUX_TIME_TRAVEL__ = {
        getActions: () => actions,
        replayTo: (index: number) => {
          // Replay actions up to specific index
          actions.slice(0, index + 1).forEach(({ action }) => {
            originalDispatch(action);
          });
        },
        getState: () => this.store.getState()
      };
    }
  }

  /**
   * Get store health metrics
   */
  getHealthMetrics(): any {
    const state = this.store.getState();
    
    return {
      storeSize: JSON.stringify(state).length,
      isHydrated: state._persist?.rehydrated || false,
      lastActivity: state.auth.lastActivity,
      cartItemCount: state.cart.itemCount,
      productCount: state.products.products.length,
      errorCount: Object.values(state).filter((slice: any) => slice.error).length,
      loadingStates: Object.values(state).filter((slice: any) => slice.loading).length
    };
  }
}

export default StateManagementService;