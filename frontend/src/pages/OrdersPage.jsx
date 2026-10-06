import { useState, useEffect } from 'react';
import { getOrders } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import SEO from '../components/SEO';

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/60',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500',
      };
    case 'shipped':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/60',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        dot: 'bg-purple-500',
      };
    case 'delivered':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'cancelled':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/60',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
    case 'pending':
    default:
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
  }
};

/**
 * OrdersPage: Displays customer order history.
 */
export const OrdersPage = ({ onSelectOrder, onNavigateToProducts }) => {
  const { isAuthenticated, login } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState(null);
  const [loginEmail, setLoginEmail] = useState('oussama@example.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      return;
    }

    const fetchOrders = async () => {
      try {

        const response = await getOrders();
        if (isMounted && response && Array.isArray(response.data)) {
          setOrders(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.userMessage || 'Failed to fetch your orders.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoggingIn(true);
    setError(null);
    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch (err) {
      setError(err.userMessage || 'Login failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <SEO
          title="My Orders"
          description="Sign in to view your order history and track shipments at Oussama Store."
          noindex={true}
        />
        <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Order History</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Sign in to view your past purchases and track order deliveries.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
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
              {loggingIn ? 'Signing in...' : 'Sign In to View Orders'}
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="My Orders"
        description="View and track your previous orders placed at Oussama Store."
        noindex={true}
      />
      <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-2">
            <span>Phase 11</span>
            <span>&bull;</span>
            <span>Order History</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View and track your previous orders placed in the store.
          </p>
        </div>

        {!loading && (
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs self-start sm:self-auto">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Orders Placed Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            When you complete checkout, your order history will appear here.
          </p>
          <button
            type="button"
            onClick={onNavigateToProducts}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      Order #{order.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {order.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Placed on:{' '}
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>&bull;</span>
                    <span>{order.items_count || order.items?.length || 0} items</span>
                    <span>&bull;</span>
                    <span className="truncate max-w-xs">{order.shipping_address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className="block text-[11px] text-slate-400 font-medium">Total</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectOrder(order.id)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    View Details &rarr;
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

export default OrdersPage;
