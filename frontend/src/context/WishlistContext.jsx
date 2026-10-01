/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  getWishlist as apiGetWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from '../services/wishlistService';

export const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize wishlist when user authenticates or switches
  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      return;
    }

    const loadWishlist = async () => {
      try {
        const response = await apiGetWishlist();
        if (isMounted && response && Array.isArray(response.data)) {
          setWishlist(response.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching wishlist:', err);
          setError(err.userMessage || 'Failed to fetch wishlist');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
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
      setWishlist([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiGetWishlist();
      if (response && Array.isArray(response.data)) {
        setWishlist(response.data);
      }
    } catch (err) {
      console.error('Error refreshing wishlist:', err);
      setError(err.userMessage || 'Failed to refresh wishlist');
    } finally {
      setLoading(false);
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
      return wishlist.some((item) => Number(item.product_id) === Number(productId));
    },
    [isAuthenticated, wishlist]
  );

  /**
   * Add a product to the wishlist.
   */
  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      const authErr = new Error('Please sign in to add items to your wishlist.');
      authErr.userMessage = 'Please sign in to add items to your wishlist.';
      throw authErr;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiAddToWishlist(productId);
      if (response.data) {
        setWishlist((prev) => [response.data, ...prev]);
      } else {
        await refreshWishlist();
      }
      return response;
    } catch (err) {
      const msg = err.userMessage || 'Failed to add item to wishlist.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove a product from the wishlist.
   */
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiRemoveFromWishlist(productId);
      setWishlist((prev) =>
        prev.filter((item) => Number(item.product_id) !== Number(productId) && Number(item.id) !== Number(productId))
      );
      return response;
    } catch (err) {
      const msg = err.userMessage || 'Failed to remove item from wishlist.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle a product in/out of the wishlist.
   */
  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return removeFromWishlist(productId);
    } else {
      return addToWishlist(productId);
    }
  };

  const currentWishlist = useMemo(() => {
    return isAuthenticated ? wishlist : [];
  }, [isAuthenticated, wishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist: currentWishlist,
        loading,
        error,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
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
