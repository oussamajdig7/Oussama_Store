import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';

/**
 * Custom hook to access wishlist state and actions.
 * 
 * @returns {{
 *   wishlist: Array,
 *   items: Array,
 *   loading: boolean,
 *   error: string|null,
 *   isInWishlist: Function,
 *   addToWishlist: Function,
 *   add: Function,
 *   removeFromWishlist: Function,
 *   remove: Function,
 *   toggleWishlist: Function,
 *   refreshWishlist: Function,
 *   refresh: Function
 * }}
 */
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default useWishlist;
