import { useState } from 'react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getStockBadge } from '../utils/formatters';
import SEO from '../components/SEO';

/**
 * WishlistPage: Displays the user's saved wishlist items with options to remove or move to cart.
 */
export const WishlistPage = ({ onNavigateToProducts, onNavigateToCart }) => {
  const { wishlist, error, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated, login } = useAuth();

  const [actionBusyId, setActionBusyId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loginEmail, setLoginEmail] = useState('oussama@example.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');
  const [loggingIn, setLoggingIn] = useState(false);

  // Quick Demo Login
  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoggingIn(true);
    setFeedback(null);
    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch (err) {
      setFeedback({ type: 'error', message: err.userMessage || 'Login failed.' });
    } finally {
      setLoggingIn(false);
    }
  };

  // Move product to cart (adds to cart and removes from wishlist)
  const handleMoveToCart = async (productId, productName) => {
    setActionBusyId(productId);
    setFeedback(null);
    try {
      await addToCart(productId, 1);
      await removeFromWishlist(productId);
      setFeedback({
        type: 'success',
        message: `Moved "${productName}" to your shopping cart!`,
        action: 'view-cart',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.userMessage || 'Failed to move product to cart.',
      });
    } finally {
      setActionBusyId(null);
    }
  };

  // Remove from wishlist
  const handleRemove = async (productId, productName) => {
    setActionBusyId(productId);
    setFeedback(null);
    try {
      await removeFromWishlist(productId);
      setFeedback({
        type: 'success',
        message: `Removed "${productName}" from your wishlist.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.userMessage || 'Failed to remove product from wishlist.',
      });
    } finally {
      setActionBusyId(null);
    }
  };

  // 1. Unauthenticated State
  if (!isAuthenticated) {
    return (
      <>
        <SEO
          title="My Wishlist"
          description="Sign in to view and manage your saved wishlist items at Oussama Store."
          noindex={true}
        />
        <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Your Wishlist
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Sign in to save your favorite products and access your wishlist from any device.
        </p>

        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400">
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3 text-left">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            {loggingIn ? 'Signing in...' : 'Sign In to View Wishlist'}
          </button>
        </form>
      </div>
      </>
    );
  }

  const isEmpty = wishlist.length === 0;

  return (
    <>
      <SEO
        title={wishlist.length > 0 ? `My Wishlist (${wishlist.length} items)` : 'My Wishlist'}
        description="View and manage your saved tech favorites and wishlist products at Oussama Store."
        noindex={true}
      />
      <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 mb-2">
            <span>Phase 10</span>
            <span>&bull;</span>
            <span>Saved Favorites</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Keep track of items you love and move them directly to your cart when ready.
          </p>
        </div>

        {!isEmpty && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>
              {wishlist.length} {wishlist.length === 1 ? 'Favorite' : 'Favorites'} Saved
            </span>
          </div>
        )}
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          {feedback.action === 'view-cart' && onNavigateToCart && (
            <button
              onClick={onNavigateToCart}
              className="ml-3 underline font-bold hover:no-underline text-emerald-700 dark:text-emerald-300"
            >
              View Cart &rarr;
            </button>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Main Content: Empty vs Items Grid */}
      {isEmpty ? (
        <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Your Wishlist is Empty
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Click the heart icon on any product in our catalog to save it for later.
          </p>

          <button
            type="button"
            onClick={onNavigateToProducts}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const product = item.product || {};
            const stockBadge = getStockBadge(product.stock);
            const isBusy = actionBusyId === product.id;

            return (
              <div
                key={item.id}
                data-testid={`wishlist-card-${product.id}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                      {product.category_name || 'General'}
                    </span>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleRemove(product.id, product.name)}
                      title="Remove from wishlist"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Icon Placeholder */}
                  <div className="h-36 w-full bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-4 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Footer: Price + Move to Cart */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(product.price)}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${stockBadge.bg} ${stockBadge.color} ${stockBadge.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${stockBadge.dot}`} />
                      {stockBadge.label}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isBusy || product.stock <= 0}
                    onClick={() => handleMoveToCart(product.id, product.name)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>{product.stock <= 0 ? 'Out of Stock' : 'Move to Cart'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
};

export default WishlistPage;
