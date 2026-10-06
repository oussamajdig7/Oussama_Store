import { useState, useEffect } from 'react';
import { getOrderById } from '../services/orderService';
import { formatCurrency } from '../utils/formatters';
import SEO from '../components/SEO';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

/**
 * OrderDetailsPage: Displays deep-dive breakdown of a specific customer order.
 */
export const OrderDetailsPage = ({ orderId, onNavigateBack }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOrderById(orderId);
        if (isMounted && response && response.data) {
          setOrder(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.userMessage || 'Failed to load order details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (orderId) {
      fetchOrder();
    }

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse py-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
        <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Order Not Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {error || 'Unable to retrieve this order.'}
        </p>
        <button
          type="button"
          onClick={onNavigateBack}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
        >
          &larr; Back to My Orders
        </button>
      </div>
    );
  }

  const items = order.items || [];
  const currentStatusIndex = STATUS_STEPS.indexOf(order.status?.toLowerCase());

  return (
    <>
      <SEO
        title={`Order #${orderId} Details`}
        description={`Track shipping, items, and delivery status for order #${orderId} at Oussama Store.`}
        noindex={true}
      />
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateBack}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Back to Orders"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Order #{order.id}
            </h1>
            <p className="text-xs text-slate-400">
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="text-right self-start sm:self-auto">
          <span className="block text-[11px] text-slate-400 font-medium">Grand Total</span>
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      {/* Status Progress Stepper */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Order Status
        </h3>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = currentStatusIndex >= idx;
            const isCurrent = currentStatusIndex === idx;

            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                    isCompleted
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`font-semibold capitalize text-[11px] ${
                    isCurrent
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : isCompleted
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Delivery Info + Items Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Purchased Items ({order.items_count || items.length})
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {item.product_name}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Price snapshot: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(item.price)}</span> &times; {item.quantity} units
                  </div>
                </div>

                <div className="text-right font-extrabold text-sm text-slate-900 dark:text-white">
                  {formatCurrency(item.quantity * item.price)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Free</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline text-sm">
              <span className="font-bold text-slate-900 dark:text-white">Total</span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Shipping & Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Delivery Address
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {order.shipping_address}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Payment Information
            </h3>
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <div className="font-semibold text-slate-900 dark:text-white">Cash on Delivery (Simple Flow)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Pay upon parcel arrival</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default OrderDetailsPage;
