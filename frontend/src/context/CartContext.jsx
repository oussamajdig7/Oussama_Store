/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
} from '../services/cartService';
import {
  cartReducer,
  CART_ACTIONS,
  initialCartState,
  DEFAULT_CART_DATA,
} from './reducers/cartReducer';

// Re-export reducer constants and function for testing and modularity
export { cartReducer, CART_ACTIONS, initialCartState, DEFAULT_CART_DATA };

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Synchronize cart with server when user authenticates or switches
  // If unauthenticated, reset to empty cart without making redundant API calls
  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      return;
    }

    const loadCartData = async () => {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      try {
        const response = await getCart();
        if (isMounted && response?.data) {
          dispatch({ type: CART_ACTIONS.SET_CART, payload: response.data });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching cart:', err);
          dispatch({
            type: CART_ACTIONS.SET_ERROR,
            payload: err.userMessage || 'Failed to fetch cart',
          });
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
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      return;
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await getCart();
      if (response?.data) {
        dispatch({ type: CART_ACTIONS.SET_CART, payload: response.data });
      }
    } catch (err) {
      console.error('Error refreshing cart:', err);
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: err.userMessage || 'Failed to refresh cart',
      });
    }
  }, [isAuthenticated]);

  /**
   * Add a product to the cart.
   * Leverages the returned cart from the API directly to avoid a duplicate GET request.
   */
  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      const authErr = new Error('Please sign in to add items to your cart.');
      authErr.userMessage = 'Please sign in to add items to your cart.';
      throw authErr;
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await apiAddToCart(productId, quantity);
      if (response.data?.cart) {
        dispatch({ type: CART_ACTIONS.SET_CART, payload: response.data.cart });
      } else {
        await refreshCart();
      }
      return response;
    } catch (err) {
      const msg = err.userMessage || 'Failed to add item to cart.';
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: msg });
      throw err;
    }
  }, [isAuthenticated, refreshCart]);

  /**
   * Update quantity for a specific cart item.
   * Updates state directly with returned cart payload avoiding duplicate network requests.
   */
  const updateQuantity = useCallback(async (cartItemId, newQuantity) => {
    if (!isAuthenticated) return;

    if (newQuantity <= 0) {
      return removeItem(cartItemId);
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await apiUpdateCartItem(cartItemId, newQuantity);
      if (response.data?.cart) {
        dispatch({ type: CART_ACTIONS.SET_CART, payload: response.data.cart });
      } else {
        await refreshCart();
      }
      return response;
    } catch (err) {
      const msg = err.userMessage || 'Failed to update item quantity.';
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: msg });
      throw err;
    }
  }, [isAuthenticated, refreshCart]);

  /**
   * Remove a single item from the cart.
   * Directly uses returned cart data without extra network requests.
   */
  const removeItem = useCallback(async (cartItemId) => {
    if (!isAuthenticated) return;

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await apiRemoveCartItem(cartItemId);
      if (response.data) {
        dispatch({ type: CART_ACTIONS.SET_CART, payload: response.data });
      } else {
        await refreshCart();
      }
      return response;
    } catch (err) {
      const msg = err.userMessage || 'Failed to remove item from cart.';
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: msg });
      throw err;
    }
  }, [isAuthenticated, refreshCart]);

  /**
   * Clear all items in the user's cart.
   */
  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return;

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    try {
      await apiClearCart();
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    } catch (err) {
      const msg = err.userMessage || 'Failed to clear cart.';
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: msg });
      throw err;
    }
  }, [isAuthenticated]);

  // Context value exposing cart state, total, items, and action handlers
  const contextValue = useMemo(
    () => ({
      // Server cart state
      cart: state.cart,
      items: state.cart?.items || [],
      total: state.cart?.total || 0,
      total_quantity: state.cart?.total_quantity || 0,
      // UI state
      loading: state.loading,
      error: state.error,
      // Actions
      addToCart,
      addItem: addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
    }),
    [state.cart, state.loading, state.error, addToCart, updateQuantity, removeItem, clearCart, refreshCart]
  );

  return (
    <CartContext.Provider value={contextValue}>
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
