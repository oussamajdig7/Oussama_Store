/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  getWishlist as apiGetWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from '../services/wishlistService';
import {
  wishlistReducer,
  WISHLIST_ACTIONS,
  initialWishlistState,
} from './reducers/wishlistReducer';

// Re-export reducer constants and function for testing and modularity
export { wishlistReducer, WISHLIST_ACTIONS, initialWishlistState };

export const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(wishlistReducer, initialWishlistState);

  // Synchronize wishlist when user authenticates or switches
  // Clear immediately when unauthenticated without triggering redundant network calls
  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
      return;
    }

    const loadWishlist = async () => {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
      try {
        const response = await apiGetWishlist();
        if (isMounted && response && Array.isArray(response.data)) {
          dispatch({ type: WISHLIST_ACTIONS.SET_WISHLIST, payload: response.data });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching wishlist:', err);
          dispatch({
            type: WISHLIST_ACTIONS.SET_ERROR,
            payload: err.userMessage || 'Failed to fetch wishlist',
          });
        }
      }
    };

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  /**
   * Refetch the wishlist from the server.
   */
  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
      return;
    }

    dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await apiGetWishlist();
      if (response && Array.isArray(response.data)) {
        dispatch({ type: WISHLIST_ACTIONS.SET_WISHLIST, payload: response.data });
      }
    } catch (err) {
      console.error('Error refreshing wishlist:', err);
      dispatch({
        type: WISHLIST_ACTIONS.SET_ERROR,
        payload: err.userMessage || 'Failed to refresh wishlist',
      });
    }
  }, [isAuthenticated]);

  /**
   * Check whether a specific product is currently in the wishlist.
   * 
   * @param {number|string} productId 
   * @returns {boolean}
   */
  const isInWishlist = useCallback(
    (productId) => {
      if (!isAuthenticated || !productId) return false;
      return state.items.some((item) => Number(item.product_id) === Number(productId));
    },
    [isAuthenticated, state.items]
  );

  /**
   * Add a product to the wishlist.
   * Directly incorporates the returned item into state without duplicate GET requests.
   */
  const addToWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) {
      const authErr = new Error('Please sign in to add items to your wishlist.');
      authErr.userMessage = 'Please sign in to add items to your wishlist.';
      throw authErr;
    }

    // Avoid duplicate request if product is already in the wishlist
    if (isInWishlist(productId)) {
      return null;
    }

    dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await apiAddToWishlist(productId);
      if (response.data) {
        dispatch({ type: WISHLIST_ACTIONS.ADD_ITEM, payload: response.data });
      } else {
        await refreshWishlist();
      }
      return response;
    } catch (err) {
      const msg = err.userMessage || 'Failed to add item to wishlist.';
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: msg });
      throw err;
    }
  }, [isAuthenticated, isInWishlist, refreshWishlist]);

  /**
   * Remove a product from the wishlist.
   * Optimistically updates reducer state avoiding duplicate GET requests.
   */
  const removeFromWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) return;

    dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await apiRemoveFromWishlist(productId);
      dispatch({ type: WISHLIST_ACTIONS.REMOVE_ITEM, payload: productId });
      return response;
    } catch (err) {
      const msg = err.userMessage || 'Failed to remove item from wishlist.';
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: msg });
      throw err;
    }
  }, [isAuthenticated]);

  /**
   * Toggle a product in/out of the wishlist.
   */
  const toggleWishlist = useCallback(async (productId) => {
    if (isInWishlist(productId)) {
      return removeFromWishlist(productId);
    } else {
      return addToWishlist(productId);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  // Context value exposing wishlist items, loading/error states, and action dispatchers
  const contextValue = useMemo(
    () => ({
      // Server wishlist items
      wishlist: state.items,
      items: state.items,
      // UI state
      loading: state.loading,
      error: state.error,
      // Actions
      add: addToWishlist,
      addToWishlist,
      remove: removeFromWishlist,
      removeFromWishlist,
      refresh: refreshWishlist,
      refreshWishlist,
      isInWishlist,
      toggleWishlist,
    }),
    [state.items, state.loading, state.error, addToWishlist, removeFromWishlist, refreshWishlist, isInWishlist, toggleWishlist]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
