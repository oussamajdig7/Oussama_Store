import { useState } from 'react';
import { useWishlist } from '../hooks/useWishlist';

/**
 * WishlistButton: Interactive heart button to toggle product in/out of the user's wishlist.
 */
export const WishlistButton = ({ productId, className = '' }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [busy, setBusy] = useState(false);

  const active = isInWishlist(productId);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (busy) return;
    setBusy(true);
    try {
      await toggleWishlist(productId);
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={busy}
      data-testid={`wishlist-button-${productId}`}
      title={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50 ${
        active
          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 shadow-xs'
          : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700'
      } ${className}`}
    >
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${active ? 'scale-110' : 'hover:scale-110'}`}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

export default WishlistButton;
