import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * useShoppingCart - Advanced Shopping Cart Management Hook
 * Amazon.com/Shopee.sg-Level Cart Features with Bangladesh Integration
 */
export const useShoppingCart = () => {
  const { user, trackUserActivity } = useAuth();
  const [cartState, setCartState] = useState({
    loading: false,
    error: null,
    items: [],
    savedItems: [], // Save for later
    unavailableItems: [],
    promoCode: null,
    discountAmount: 0,
    shippingMethod: null,
    shippingCost: 0,
    estimatedDelivery: null,
    cartId: null,
    lastUpdated: null,
    syncStatus: 'synced' // synced, syncing, error
  });

  // Load cart from localStorage and sync with server
  useEffect(() => {
    loadCart();
  }, [user]);

  // Auto-save cart changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cartState.items.length > 0 && cartState.syncStatus !== 'syncing') {
        syncCartToServer();
      }
    }, 2000); // Debounce auto-save

    return () => clearTimeout(timeoutId);
  }, [cartState.items]);

  // Load cart from localStorage initially, then sync with server
  const loadCart = useCallback(async () => {
    try {
      setCartState(prev => ({ ...prev, loading: true, error: null }));

      // Load from localStorage first for immediate UI
      const localCart = localStorage.getItem('shopping_cart');
      if (localCart) {
        const parsedCart = JSON.parse(localCart);
        setCartState(prev => ({
          ...prev,
          items: parsedCart.items || [],
          promoCode: parsedCart.promoCode,
          discountAmount: parsedCart.discountAmount || 0,
          lastUpdated: new Date(parsedCart.lastUpdated || Date.now())
        }));
      }

      // Sync with server if user is logged in
      if (user) {
        const response = await fetch('/api/v1/cart', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const serverCart = await response.json();
          
          // Merge local and server cart
          const mergedCart = mergeCartData(
            cartState.items, 
            serverCart.items || []
          );

          setCartState(prev => ({
            ...prev,
            loading: false,
            items: mergedCart,
            savedItems: serverCart.savedItems || [],
            cartId: serverCart.id,
            promoCode: serverCart.promoCode || prev.promoCode,
            discountAmount: serverCart.discountAmount || prev.discountAmount,
            shippingMethod: serverCart.shippingMethod,
            shippingCost: serverCart.shippingCost || 0,
            syncStatus: 'synced'
          }));

          // Update localStorage with merged data
          saveToLocalStorage({
            items: mergedCart,
            promoCode: serverCart.promoCode,
            discountAmount: serverCart.discountAmount || 0,
            lastUpdated: new Date()
          });
        } else {
          setCartState(prev => ({ ...prev, loading: false }));
        }
      } else {
        setCartState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Cart loading error:', error);
      setCartState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load cart'
      }));
    }
  }, [user, cartState.items]);

  // Add item to cart
  const addItem = useCallback(async (product, quantity = 1, variant = null) => {
    try {
      const newItem = {
        id: `${product.id}_${variant?.id || 'default'}`,
        productId: product.id,
        name: product.name,
        price: variant?.price || product.price,
        comparePrice: variant?.comparePrice || product.comparePrice,
        image: variant?.image || product.images?.[0] || product.image,
        quantity,
        variant,
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        category: product.category,
        weight: product.weight || 0,
        dimensions: product.dimensions,
        availability: product.availability || 'in_stock',
        maxQuantity: product.maxQuantity || 999,
        addedAt: new Date().toISOString()
      };

      setCartState(prev => {
        const existingIndex = prev.items.findIndex(item => item.id === newItem.id);
        let updatedItems;

        if (existingIndex >= 0) {
          // Update quantity if item already exists
          updatedItems = prev.items.map((item, index) => 
            index === existingIndex 
              ? { 
                  ...item, 
                  quantity: Math.min(item.quantity + quantity, item.maxQuantity),
                  addedAt: new Date().toISOString()
                }
              : item
          );
        } else {
          // Add new item
          updatedItems = [...prev.items, newItem];
        }

        const newState = {
          ...prev,
          items: updatedItems,
          lastUpdated: new Date(),
          syncStatus: 'syncing'
        };

        // Save to localStorage
        saveToLocalStorage({
          items: updatedItems,
          promoCode: prev.promoCode,
          discountAmount: prev.discountAmount,
          lastUpdated: new Date()
        });

        return newState;
      });

      // Track add to cart activity
      await trackUserActivity('add_to_cart', user?.id, {
        productId: product.id,
        productName: product.name,
        quantity,
        price: newItem.price
      });

      return { success: true, message: 'Item added to cart' };
    } catch (error) {
      console.error('Add to cart error:', error);
      setCartState(prev => ({ ...prev, error: 'Failed to add item to cart' }));
      return { success: false, error: 'Failed to add item to cart' };
    }
  }, [user, trackUserActivity]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeItem(itemId);
    }

    setCartState(prev => {
      const updatedItems = prev.items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: Math.min(newQuantity, item.maxQuantity),
              updatedAt: new Date().toISOString()
            }
          : item
      );

      const newState = {
        ...prev,
        items: updatedItems,
        lastUpdated: new Date(),
        syncStatus: 'syncing'
      };

      // Save to localStorage
      saveToLocalStorage({
        items: updatedItems,
        promoCode: prev.promoCode,
        discountAmount: prev.discountAmount,
        lastUpdated: new Date()
      });

      return newState;
    });

    return { success: true };
  }, []);

  // Remove item from cart
  const removeItem = useCallback(async (itemId) => {
    setCartState(prev => {
      const updatedItems = prev.items.filter(item => item.id !== itemId);
      
      const newState = {
        ...prev,
        items: updatedItems,
        lastUpdated: new Date(),
        syncStatus: 'syncing'
      };

      // Save to localStorage
      saveToLocalStorage({
        items: updatedItems,
        promoCode: prev.promoCode,
        discountAmount: prev.discountAmount,
        lastUpdated: new Date()
      });

      return newState;
    });

    // Track remove from cart activity
    await trackUserActivity('remove_from_cart', user?.id, { itemId });

    return { success: true };
  }, [user, trackUserActivity]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    setCartState(prev => ({
      ...prev,
      items: [],
      promoCode: null,
      discountAmount: 0,
      shippingMethod: null,
      shippingCost: 0,
      lastUpdated: new Date(),
      syncStatus: 'syncing'
    }));

    localStorage.removeItem('shopping_cart');

    if (user) {
      try {
        await fetch('/api/v1/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Clear cart server error:', error);
      }
    }

    await trackUserActivity('cart_cleared', user?.id);
    return { success: true };
  }, [user, trackUserActivity]);

  // Save item for later
  const saveForLater = useCallback(async (itemId) => {
    const item = cartState.items.find(item => item.id === itemId);
    if (!item) return { success: false, error: 'Item not found' };

    setCartState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
      savedItems: [...prev.savedItems, { ...item, savedAt: new Date().toISOString() }],
      lastUpdated: new Date(),
      syncStatus: 'syncing'
    }));

    await trackUserActivity('save_for_later', user?.id, { itemId });
    return { success: true };
  }, [cartState.items, user, trackUserActivity]);

  // Move saved item back to cart
  const moveToCart = useCallback(async (itemId) => {
    const savedItem = cartState.savedItems.find(item => item.id === itemId);
    if (!savedItem) return { success: false, error: 'Saved item not found' };

    setCartState(prev => ({
      ...prev,
      items: [...prev.items, { ...savedItem, addedAt: new Date().toISOString() }],
      savedItems: prev.savedItems.filter(item => item.id !== itemId),
      lastUpdated: new Date(),
      syncStatus: 'syncing'
    }));

    return { success: true };
  }, [cartState.savedItems]);

  // Apply promo code
  const applyPromoCode = useCallback(async (code) => {
    try {
      setCartState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/v1/cart/promo-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          code, 
          cartItems: cartState.items,
          subtotal: cartSubtotal
        })
      });

      if (response.ok) {
        const { valid, discount, message } = await response.json();
        
        if (valid) {
          setCartState(prev => ({
            ...prev,
            loading: false,
            promoCode: code,
            discountAmount: discount,
            syncStatus: 'syncing'
          }));

          await trackUserActivity('promo_code_applied', user?.id, { code, discount });
          return { success: true, message, discount };
        } else {
          setCartState(prev => ({ ...prev, loading: false, error: message }));
          return { success: false, error: message };
        }
      } else {
        const error = await response.json();
        setCartState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Promo code error:', error);
      setCartState(prev => ({ ...prev, loading: false, error: 'Failed to apply promo code' }));
      return { success: false, error: 'Failed to apply promo code' };
    }
  }, [cartState.items, user, trackUserActivity]);

  // Remove promo code
  const removePromoCode = useCallback(() => {
    setCartState(prev => ({
      ...prev,
      promoCode: null,
      discountAmount: 0,
      syncStatus: 'syncing'
    }));
  }, []);

  // Calculate shipping cost
  const calculateShipping = useCallback(async (address, shippingMethod) => {
    try {
      const response = await fetch('/api/v1/shipping/calculate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cartState.items,
          address,
          method: shippingMethod
        })
      });

      if (response.ok) {
        const { cost, estimatedDelivery } = await response.json();
        
        setCartState(prev => ({
          ...prev,
          shippingMethod,
          shippingCost: cost,
          estimatedDelivery
        }));

        return { success: true, cost, estimatedDelivery };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Shipping calculation error:', error);
      return { success: false, error: 'Failed to calculate shipping' };
    }
  }, [cartState.items]);

  // Sync cart to server
  const syncCartToServer = useCallback(async () => {
    if (!user) return;

    try {
      setCartState(prev => ({ ...prev, syncStatus: 'syncing' }));

      const response = await fetch('/api/v1/cart/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cartState.items,
          promoCode: cartState.promoCode,
          discountAmount: cartState.discountAmount,
          shippingMethod: cartState.shippingMethod,
          lastUpdated: cartState.lastUpdated
        })
      });

      if (response.ok) {
        setCartState(prev => ({ ...prev, syncStatus: 'synced' }));
      } else {
        setCartState(prev => ({ ...prev, syncStatus: 'error' }));
      }
    } catch (error) {
      console.error('Cart sync error:', error);
      setCartState(prev => ({ ...prev, syncStatus: 'error' }));
    }
  }, [user, cartState]);

  // Helper functions
  const saveToLocalStorage = useCallback((data) => {
    try {
      localStorage.setItem('shopping_cart', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, []);

  const mergeCartData = useCallback((localItems, serverItems) => {
    const merged = [...localItems];
    
    serverItems.forEach(serverItem => {
      const localIndex = merged.findIndex(item => item.id === serverItem.id);
      if (localIndex >= 0) {
        // Keep the item with more recent timestamp
        if (new Date(serverItem.updatedAt || serverItem.addedAt) > 
            new Date(merged[localIndex].updatedAt || merged[localIndex].addedAt)) {
          merged[localIndex] = serverItem;
        }
      } else {
        merged.push(serverItem);
      }
    });

    return merged;
  }, []);

  // Computed values
  const cartSubtotal = useMemo(() => {
    return cartState.items.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  }, [cartState.items]);

  const cartDiscountTotal = useMemo(() => {
    return cartState.discountAmount;
  }, [cartState.discountAmount]);

  const cartTaxAmount = useMemo(() => {
    // Bangladesh VAT is 15%
    const taxableAmount = cartSubtotal - cartDiscountTotal;
    return taxableAmount * 0.15;
  }, [cartSubtotal, cartDiscountTotal]);

  const cartTotal = useMemo(() => {
    return cartSubtotal - cartDiscountTotal + cartTaxAmount + cartState.shippingCost;
  }, [cartSubtotal, cartDiscountTotal, cartTaxAmount, cartState.shippingCost]);

  const itemCount = useMemo(() => {
    return cartState.items.reduce((total, item) => total + item.quantity, 0);
  }, [cartState.items]);

  const vendorGroups = useMemo(() => {
    return cartState.items.reduce((groups, item) => {
      const vendorId = item.vendorId || 'unknown';
      if (!groups[vendorId]) {
        groups[vendorId] = {
          vendorId,
          vendorName: item.vendorName || 'Unknown Vendor',
          items: [],
          subtotal: 0
        };
      }
      groups[vendorId].items.push(item);
      groups[vendorId].subtotal += item.price * item.quantity;
      return groups;
    }, {});
  }, [cartState.items]);

  return {
    // State
    ...cartState,
    
    // Methods
    loadCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    saveForLater,
    moveToCart,
    applyPromoCode,
    removePromoCode,
    calculateShipping,
    syncCartToServer,

    // Computed values
    subtotal: cartSubtotal,
    discountTotal: cartDiscountTotal,
    taxAmount: cartTaxAmount,
    total: cartTotal,
    itemCount,
    vendorGroups: Object.values(vendorGroups),
    isEmpty: cartState.items.length === 0,
    hasItems: cartState.items.length > 0,
    hasSavedItems: cartState.savedItems.length > 0,
    hasPromoCode: !!cartState.promoCode,
    needsSync: cartState.syncStatus !== 'synced',
    
    // Quick checks
    canCheckout: cartState.items.length > 0 && cartState.syncStatus !== 'syncing',
    hasUnavailableItems: cartState.unavailableItems.length > 0,
    hasShipping: !!cartState.shippingMethod,
    freeShippingEligible: cartSubtotal >= 1000 // Free shipping over ৳1000
  };
};

export default useShoppingCart;