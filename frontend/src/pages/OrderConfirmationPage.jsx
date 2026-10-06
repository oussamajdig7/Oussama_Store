import { formatCurrency } from '../utils/formatters';
import SEO from '../components/SEO';

/**
 * OrderConfirmationPage: Displays order receipt and confirmation after successful checkout.
 */
export const OrderConfirmationPage = ({ order, onNavigateToOrders, onNavigateToProducts, onNavigateToOrderDetails }) => {
  if (!order) {
    return (
      <>
        <SEO
          title="Order Confirmation"
          description="Order confirmation details."
          noindex={true}
        />
        <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Order Information</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Unable to find the order confirmation details.
          </p>
          <button
            type="button"
            onClick={onNavigateToProducts}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            Return to Catalog
          </button>
        </div>
      </>
    );
  }

  const items = order.items || [];

  return (
    <>
      <SEO
        title={`Order #${order.id} Confirmed`}
        description={`Your order #${order.id} has been placed successfully at Oussama Store.`}
        noindex={true}
      />
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Success Hero */}
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-xs">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 mb-2">
          Order #{order.id} Confirmed
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Thank You for Your Order!
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Your order has been recorded in the database. Product inventory has been updated and your cart has been cleared.
        </p>
      </div>

      {/* Order Meta Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="block text-slate-400 font-medium">Order Reference</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">#{order.id}</span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium">Order Status</span>
            <span className="inline-flex items-center gap-1.5 font-bold uppercase text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {order.status || 'pending'}
            </span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium">Date Placed</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now'}
            </span>

          </div>
        </div>

        {/* Shipping Address Recap */}
        <div className="text-xs">
          <span className="block text-slate-400 font-medium mb-1">Delivering To</span>
          <p className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            {order.shipping_address}
          </p>
        </div>

        {/* Purchased Items List */}
        <div>
          <span className="block text-xs text-slate-400 font-medium mb-3">Items Purchased</span>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs py-2.5 px-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {item.product_name}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Quantity: {item.quantity} &times; <span className="font-medium text-slate-600 dark:text-slate-300">{formatCurrency(item.price)}</span> (Price snapshot)
                  </div>
                </div>
                <div className="font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(item.quantity * item.price)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grand Total */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
          <span className="text-sm font-bold text-slate-900 dark:text-white">Total Amount Paid / COD</span>
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onNavigateToOrderDetails && (
          <button
            type="button"
            onClick={() => onNavigateToOrderDetails(order.id)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            View Order Details
          </button>
        )}

        <button
          type="button"
          onClick={onNavigateToOrders}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors"
        >
          My Orders History
        </button>

        <button
          type="button"
          onClick={onNavigateToProducts}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium transition-colors"
        >
          Continue Shopping &rarr;
        </button>
      </div>
    </div>
    </>
  );
};

export default OrderConfirmationPage;
