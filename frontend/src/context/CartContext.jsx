/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
} from '../services/cartService';

export const CartContext = createContext(null);

const DEFAULT_CART_STATE = {
  items: [],
  total_quantity: 0,
  total: 0,
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(DEFAULT_CART_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize cart when authentication status changes
  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      return;
    }

    const loadCartData = async () => {
      try {
        const response = await getCart();
        if (isMounted && response && response.data) {
          setCart(response.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching cart:', err);
          setError(err.userMessage || 'Failed to fetch cart');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCartData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  /**
   * Refetch the cart on demand.
   */
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(DEFAULT_CART_STATE);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getCart();
      if (response && response.data) {
        setCart(response.data);
      }
    } catch (err) {
      console.error('Error refreshing cart:', err);
      setError(err.userMessage || 'Failed to refresh cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Add a product to the cart.
   * If item already exists, quantity is incremented on the server.
   */
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      const authErr = new Error('Please sign in to add items to your cart.');
      authErr.userMessage = 'Please sign in to add items to your cart.';
      throw authErr;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiAddToCart(productId, quantity);
      if (response.data?.cart) {
        setCart(response.data.cart);
      } else {
        await refreshCart();
      }
      return response;
    } catch (err) {
      const msg = err.userMessage || 'Failed to add item to cart.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update quantity for a specific cart item.
   */
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (!isAuthenticated) return;

    if (newQuantity <= 0) {
      return removeItem(cartItemId);
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiUpdateCartItem(cartItemId, newQuantity);
      if (response.data?.cart) {
        setCart(response.data.cart);
      } else {
        await refreshCart();
      }
      return response;
    } catch (err) {
      const msg = err.userMessage || 'Failed to update item quantity.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove a single item from the cart.
   */
  const removeItem = async (cartItemId) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiRemoveCartItem(cartItemId);
      if (response.data) {
        setCart(response.data);
      } else {
        await refreshCart();
      }
      return response;
    } catch (err) {
      const msg = err.userMessage || 'Failed to remove item from cart.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear all items in the user's cart.
   */
  const clearCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      await apiClearCart();
      setCart(DEFAULT_CART_STATE);
    } catch (err) {
      const msg = err.userMessage || 'Failed to clear cart.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Ensure unauthenticated users always receive an empty cart
  const currentCart = useMemo(() => {
    return isAuthenticated ? cart : DEFAULT_CART_STATE;
  }, [isAuthenticated, cart]);

  return (
    <CartContext.Provider
      value={{
        cart: currentCart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
