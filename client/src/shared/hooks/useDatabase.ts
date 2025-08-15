
import { useState, useEffect } from 'react';
import { DatabaseService } from '@/shared/services/database/DatabaseService';
import { useAuth } from '@/domains/customer/auth/components/AuthProvider';

export const useDatabase = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await DatabaseService.getCartItems(user.id);
      setCartItems(items || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) return;
    
    try {
      await DatabaseService.addToCart(user.id, productId, quantity);
      await fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;
    
    try {
      await DatabaseService.updateCartQuantity(user.id, productId, quantity);
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;
    
    try {
      await DatabaseService.removeFromCart(user.id, productId);
      await fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    refetch: fetchCartItems
  };
};

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlistItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await DatabaseService.getWishlistItems(user.id);
      setWishlistItems(items || []);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) return;
    
    try {
      await DatabaseService.addToWishlist(user.id, productId);
      await fetchWishlistItems();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    
    try {
      await DatabaseService.removeFromWishlist(user.id, productId);
      await fetchWishlistItems();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, [user]);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    refetch: fetchWishlistItems
  };
};

export const useBehaviorTracking = () => {
  const { user } = useAuth();
  
  const trackEvent = async (
    eventType: string,
    eventData: any,
    productId?: string,
    categoryId?: string
  ) => {
    const sessionId = sessionStorage.getItem('session_id') || 
                     crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);

    return DatabaseService.trackUserBehavior(
      user?.id || null,
      sessionId,
      eventType,
      eventData,
      productId,
      categoryId
    );
  };

  return { trackEvent };
};
