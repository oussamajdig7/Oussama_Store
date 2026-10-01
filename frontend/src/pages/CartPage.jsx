import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import { formatCurrency } from '../utils/formatters';

/**
 * CartPage Component: Displays the shopping cart with full item management and total summary.
 */
export const CartPage = ({ onNavigateToProducts, onNavigateToCheckout }) => {
  const { cart, loading, error, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated, login } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [loginEmail, setLoginEmail] = useState('oussama@example.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');
  const [loggingIn, setLoggingIn] = useState(false);

  // Handle Quick Demo Login for testing
  const handleQuickLogin = async (e) => {
    e?.preventDefault();
    setLoggingIn(true);
    setLocalError(null);
    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch (err) {
      setLocalError(err.userMessage || 'Login failed. Please check credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  // Safe quantity update with error feedback
  const handleUpdateQuantity = async (cartItemId, newQty) => {
    setActionLoading(true);
    setLocalError(null);
    try {
      await updateQuantity(cartItemId, newQty);
    } catch (err) {
      setLocalError(err.userMessage || 'Failed to update item quantity.');
    } finally {
      setActionLoading(false);
    }
  };

  // Safe item removal
  const handleRemoveItem = async (cartItemId) => {
    setActionLoading(true);
    setLocalError(null);
    try {
      await removeItem(cartItemId);
    } catch (err) {
      setLocalError(err.userMessage || 'Failed to remove item.');
    } finally {
      setActionLoading(false);
    }
  };

  // Safe clear cart
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to empty your shopping cart?')) return;
    setActionLoading(true);
    setLocalError(null);
    try {
      await clearCart();
    } catch (err) {
      setLocalError(err.userMessage || 'Failed to clear cart.');
    } finally {
      setActionLoading(false);
    }
  };

  // 1. Unauthenticated State
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Your Cart is Waiting
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Sign in to view your shopping cart, manage quantities, and proceed to checkout.
        </p>

        {localError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400">
            {localError}
          </div>
        )}

        <form onSubmit={handleQuickLogin} className="space-y-3 text-left">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
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
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            {loggingIn ? 'Signing in...' : 'Sign In to View Cart'}
          </button>
        </form>
      </div>
    );
  }

  const items = cart.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-2">
            <span>Phase 9</span>
            <span>&bull;</span>
            <span>Shopping Cart</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review your selected products, adjust quantities, and check your order total.
          </p>
        </div>

        {!isEmpty && (
          <button
            type="button"
            disabled={actionLoading || loading}
            onClick={handleClearCart}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear Cart
          </button>
        )}
      </div>

      {/* Error Notifications */}
      {(error || localError) && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-sm text-rose-700 dark:text-rose-400 flex items-center justify-between gap-3">
          <span>{localError || error}</span>
          <button
            onClick={() => setLocalError(null)}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Cart Content: Empty State vs Items & Summary Grid */}
      {isEmpty ? (
        <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Your Cart is Empty
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            You have not added any products to your shopping cart yet.
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cart Items ({cart.total_quantity || items.length})
            </div>

            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                disabled={actionLoading}
              />
            ))}

            <div className="pt-4 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={onNavigateToProducts}
                className="inline-flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                &larr; Continue Shopping
              </button>
              <span>Prices computed securely from database</span>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {cart.total_quantity || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(cart.total)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Free
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  Total
                </span>
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                  {formatCurrency(cart.total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToCheckout}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <div className="text-[11px] text-center text-slate-400">
              Free delivery &amp; secure server-side checkout
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
