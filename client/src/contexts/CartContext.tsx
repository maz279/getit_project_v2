import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { customerService } from '../domains/customer/services/customerService';

// CartContext - Global Shopping Cart Context for GetIt Bangladesh
// Amazon.com/Shopee.sg-Level Cart State Management

const CartContext = createContext(null);

// Cart Action Types
const CART_ACTIONS = {
  LOAD_CART: 'LOAD_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  APPLY_COUPON: 'APPLY_COUPON',
  REMOVE_COUPON: 'REMOVE_COUPON',
  UPDATE_SHIPPING: 'UPDATE_SHIPPING'
};

// Initial Cart State
const initialState = {
  items: [],
  subtotal: 0,
  shipping: 0,
  tax: 0,
  discount: 0,
  total: 0,
  itemCount: 0,
  coupon: null,
  shippingMethod: null,
  isLoading: false,
  error: null
};

// Cart Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload.items || [],
        subtotal: action.payload.subtotal || 0,
        shipping: action.payload.shipping || 0,
        tax: action.payload.tax || 0,
        discount: action.payload.discount || 0,
        total: action.payload.total || 0,
        itemCount: action.payload.itemCount || 0,
        coupon: action.payload.coupon || null,
        isLoading: false
      };

    case CART_ACTIONS.ADD_ITEM: {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        updatedItems = [...state.items, action.payload];
      }

      const newState = {
        ...state,
        items: updatedItems,
        isLoading: false,
        error: null
      };

      return calculateTotals(newState);
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const newState = {
        ...state,
        items: updatedItems
      };

      return calculateTotals(newState);
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const updatedItems = state.items.filter(
        item => item.id !== action.payload.id
      );

      const newState = {
        ...state,
        items: updatedItems
      };

      return calculateTotals(newState);
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...initialState,
        isLoading: false
      };

    case CART_ACTIONS.APPLY_COUPON: {
      const newState = {
        ...state,
        coupon: action.payload.coupon,
        discount: action.payload.discount
      };

      return calculateTotals(newState);
    }

    case CART_ACTIONS.REMOVE_COUPON: {
      const newState = {
        ...state,
        coupon: null,
        discount: 0
      };

      return calculateTotals(newState);
    }

    case CART_ACTIONS.UPDATE_SHIPPING: {
      const newState = {
        ...state,
        shippingMethod: action.payload.method,
        shipping: action.payload.cost
      };

      return calculateTotals(newState);
    }

    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Calculate cart totals
function calculateTotals(state) {
  const subtotal = state.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const itemCount = state.items.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  // Bangladesh VAT rate (15%)
  const taxRate = 0.15;
  const tax = subtotal * taxRate;

  // Calculate total
  const total = subtotal + state.shipping + tax - state.discount;

  return {
    ...state,
    subtotal: subtotal,
    tax: tax,
    total: Math.max(0, total), // Ensure total is never negative
    itemCount: itemCount
  };
}

// CartProvider Component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('shopping_cart');
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: cartData
          });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    try {
      const cartData = {
        items: state.items,
        subtotal: state.subtotal,
        shipping: state.shipping,
        tax: state.tax,
        discount: state.discount,
        total: state.total,
        itemCount: state.itemCount,
        coupon: state.coupon,
        shippingMethod: state.shippingMethod
      };
      localStorage.setItem('shopping_cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state]);

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '/placeholder-product.jpg',
        vendorId: product.vendorId,
        vendorName: product.vendor?.name || 'Unknown Vendor',
        quantity: quantity,
        sku: product.sku,
        inStock: product.inventory > 0
      };

      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: cartItem
      });

      // Sync with backend if user is authenticated
      try {
        await customerService.addToCart(cartItem);
      } catch (error) {
        console.warn('Failed to sync cart with backend:', error);
      }

      return { success: true };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    try {
      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY,
        payload: { id: itemId, quantity }
      });

      // Sync with backend
      try {
        await customerService.updateCartItem(itemId, quantity);
      } catch (error) {
        console.warn('Failed to sync cart update with backend:', error);
      }

      return { success: true };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM,
        payload: { id: itemId }
      });

      // Sync with backend
      try {
        await customerService.removeFromCart(itemId);
      } catch (error) {
        console.warn('Failed to sync cart removal with backend:', error);
      }

      return { success: true };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });

      // Sync with backend
      try {
        await customerService.clearCart();
      } catch (error) {
        console.warn('Failed to sync cart clear with backend:', error);
      }

      return { success: true };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Apply coupon
  const applyCoupon = async (couponCode) => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await customerService.applyCoupon(couponCode, state.subtotal);

      if (response.success) {
        dispatch({
          type: CART_ACTIONS.APPLY_COUPON,
          payload: {
            coupon: response.coupon,
            discount: response.discount
          }
        });
        return { success: true, discount: response.discount };
      } else {
        dispatch({
          type: CART_ACTIONS.SET_ERROR,
          payload: response.message
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    dispatch({ type: CART_ACTIONS.REMOVE_COUPON });
  };

  // Update shipping method
  const updateShipping = (method, cost) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_SHIPPING,
      payload: { method, cost }
    });
  };

  // Get item count for a specific product
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    items: state.items,
    subtotal: state.subtotal,
    shipping: state.shipping,
    tax: state.tax,
    discount: state.discount,
    total: state.total,
    itemCount: state.itemCount,
    coupon: state.coupon,
    shippingMethod: state.shippingMethod,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    updateShipping,
    getItemQuantity,
    isInCart,
    clearError
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCartContext() {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  
  return context;
}

// Alternative hook name for compatibility
export function useCart() {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
}

export default CartContext;